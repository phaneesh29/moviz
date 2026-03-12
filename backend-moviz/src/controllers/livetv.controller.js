import fs from "fs";
import { createHmac, timingSafeEqual } from "crypto";
import path from "path";
import { Readable } from "stream";
import { fileURLToPath } from "url";
import { LIVETV_PROXY_SECRET } from "../constant.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HLS_MANIFEST_CONTENT_TYPES = [
    "application/vnd.apple.mpegurl",
    "application/x-mpegurl",
    "audio/mpegurl",
    "audio/x-mpegurl",
];
const PROXY_URL_TTL_SECONDS = 60 * 30;

const getRequestOrigin = (req) => {
    const forwardedProto = req.headers["x-forwarded-proto"]?.split(",")[0]?.trim();
    const forwardedHost = req.headers["x-forwarded-host"]?.split(",")[0]?.trim();
    const protocol = forwardedProto || req.protocol || "https";
    const host = forwardedHost || req.get("host");

    return `${protocol}://${host}`;
};

const getChannelPublicFields = (channel) => {
    const { url, ...publicChannel } = channel;
    return publicChannel;
};

const getSignedProxyParams = (targetUrl, expiresAt) => {
    const signature = createHmac("sha256", LIVETV_PROXY_SECRET)
        .update(`${expiresAt}:${targetUrl}`)
        .digest("hex");

    return new URLSearchParams({
        url: targetUrl,
        expires: String(expiresAt),
        sig: signature,
    });
};

const buildProxyUrl = (req, targetUrl) => {
    const expiresAt = Math.floor(Date.now() / 1000) + PROXY_URL_TTL_SECONDS;
    const params = getSignedProxyParams(targetUrl, expiresAt);
    return `${getRequestOrigin(req)}/api/livetv/proxy?${params.toString()}`;
};

const getManifestPathname = (targetUrl) => {
    try {
        return new URL(targetUrl).pathname.toLowerCase();
    } catch {
        return String(targetUrl).toLowerCase();
    }
};

const isValidProxySignature = (targetUrl, expiresAt, signature) => {
    if (!LIVETV_PROXY_SECRET || !signature) {
        return false;
    }

    const expectedSignature = createHmac("sha256", LIVETV_PROXY_SECRET)
        .update(`${expiresAt}:${targetUrl}`)
        .digest("hex");

    if (expectedSignature.length !== signature.length) {
        return false;
    }

    try {
        return timingSafeEqual(
            Buffer.from(expectedSignature, "hex"),
            Buffer.from(signature, "hex"),
        );
    } catch {
        return false;
    }
};

const isManifestResponse = (targetUrl, contentType = "") => {
    const normalizedContentType = contentType.toLowerCase();
    const manifestPathname = getManifestPathname(targetUrl);

    return manifestPathname.endsWith(".m3u8")
        || manifestPathname.endsWith(".m3u")
        || HLS_MANIFEST_CONTENT_TYPES.some((type) => normalizedContentType.includes(type));
};

const rewriteTagUris = (line, baseUrl, req) => {
    return line.replace(/URI=("[^"]+"|'[^']+')/g, (match, quotedUrl) => {
        const rawUrl = quotedUrl.slice(1, -1);
        const resolvedUrl = new URL(rawUrl, baseUrl).toString();
        const proxiedUrl = buildProxyUrl(req, resolvedUrl);

        return `URI="${proxiedUrl}"`;
    });
};

const rewriteManifest = (manifestText, baseUrl, req) => {
    return manifestText
        .split(/\r?\n/)
        .map((line) => {
            const trimmedLine = line.trim();

            if (!trimmedLine) {
                return line;
            }

            if (trimmedLine.startsWith("#")) {
                return rewriteTagUris(line, baseUrl, req);
            }

            const resolvedUrl = new URL(trimmedLine, baseUrl).toString();
            return buildProxyUrl(req, resolvedUrl);
        })
        .join("\n");
};

const getUpstreamHeaders = (req) => {
    const headers = {
        Accept: "*/*",
        "User-Agent": "Mozilla/5.0 (compatible; MovizLiveTvProxy/1.0)",
    };

    if (req.headers.range) {
        headers.Range = req.headers.range;
    }

    return headers;
};

const applyUpstreamHeaders = (res, upstreamResponse) => {
    const passThroughHeaders = [
        "accept-ranges",
        "cache-control",
        "content-length",
        "content-range",
        "content-type",
        "etag",
        "expires",
        "last-modified",
    ];

    passThroughHeaders.forEach((headerName) => {
        const value = upstreamResponse.headers.get(headerName);
        if (value) {
            res.setHeader(headerName, value);
        }
    });
};

const loadChannels = async () => {
    const filePath = path.join(__dirname, "..", "data", "channels.json");
    const channelsData = await fs.promises.readFile(filePath, "utf-8");
    return JSON.parse(channelsData);
};

export const getChannelsController = async (req, res) => {
    try {
        const channels = await loadChannels();

        res.status(200).json({
            success: true,
            results: channels.map(getChannelPublicFields),
        });
    } catch (error) {
        console.error("Error reading channels:", error);
        res.status(500).json({ success: false, message: "Failed to load channels" });
    }
};

export const getChannelController = async (req, res) => {
    try {
        const { id } = req.params;
        const channels = await loadChannels();

        const channel = channels.find((item) => item.id === Number.parseInt(id, 10));
        if (!channel) {
            return res.status(404).json({ success: false, message: "Channel not found" });
        }

        res.status(200).json({
            success: true,
            results: {
                ...getChannelPublicFields(channel),
                streamUrl: buildProxyUrl(req, channel.url),
            },
        });
    } catch (error) {
        console.error("Error reading channel:", error);
        res.status(500).json({ success: false, message: "Failed to load channel details" });
    }
};

export const proxyChannelStreamController = async (req, res) => {
    try {
        const { url, expires, sig } = req.query;

        if (!url || typeof url !== "string") {
            return res.status(400).json({ success: false, message: "Missing stream URL" });
        }

        const expiresAt = Number.parseInt(expires, 10);
        const nowInSeconds = Math.floor(Date.now() / 1000);

        if (!Number.isFinite(expiresAt) || expiresAt < nowInSeconds) {
            return res.status(403).json({ success: false, message: "Expired stream URL" });
        }

        if (!isValidProxySignature(url, expiresAt, sig)) {
            return res.status(403).json({ success: false, message: "Invalid stream signature" });
        }

        let targetUrl;
        try {
            targetUrl = new URL(url);
        } catch {
            return res.status(400).json({ success: false, message: "Invalid stream URL" });
        }

        if (!["http:", "https:"].includes(targetUrl.protocol)) {
            return res.status(400).json({ success: false, message: "Unsupported stream protocol" });
        }

        const upstreamResponse = await fetch(targetUrl, {
            headers: getUpstreamHeaders(req),
            redirect: "follow",
        });

        if (!upstreamResponse.ok) {
            const errorBody = await upstreamResponse.text().catch(() => "");
            return res.status(upstreamResponse.status).send(errorBody || "Failed to load upstream stream");
        }

        const responseUrl = upstreamResponse.url || targetUrl.toString();
        const contentType = upstreamResponse.headers.get("content-type") || "application/octet-stream";

        if (isManifestResponse(responseUrl, contentType)) {
            const manifestText = await upstreamResponse.text();
            const rewrittenManifest = rewriteManifest(manifestText, responseUrl, req);

            res.setHeader("content-type", "application/vnd.apple.mpegurl; charset=utf-8");
            res.setHeader("cache-control", upstreamResponse.headers.get("cache-control") || "public, max-age=60");
            return res.status(200).send(rewrittenManifest);
        }

        applyUpstreamHeaders(res, upstreamResponse);
        res.status(upstreamResponse.status);

        if (!upstreamResponse.body) {
            return res.end();
        }

        return Readable.fromWeb(upstreamResponse.body).pipe(res);
    } catch (error) {
        console.error("Error proxying live TV stream:", error);
        return res.status(502).json({ success: false, message: "Failed to proxy live TV stream" });
    }
};
