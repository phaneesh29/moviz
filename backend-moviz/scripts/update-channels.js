import fs from "fs";
import path from "path";
import axios from "axios";
import parser from "iptv-playlist-parser";
const { parse } = parser;

const IPTV_URL = "https://iptv-org.github.io/iptv/index.m3u";
const OUTPUT_FILE = path.join(process.cwd(), "src", "data", "channels.json");

async function downloadAndParseChannels() {
    try {
        console.log(`Downloading latest M3U playlist from ${IPTV_URL}...`);
        const response = await axios.get(IPTV_URL, {
            responseType: "text",
        });

        console.log("Download complete. Parsing M3U data...");
        const parsedData = parse(response.data);

        // Filter out invalid items or things not representing actual channels if needed
        // For now we just extract the items array and prune useless properties to save space.
        const channels = parsedData.items.map((item, index) => {
            return {
                id: index + 1,
                name: item.name || "Unknown Channel",
                logo: item.tvg?.logo || null,
                url: item.url,
                group: item.group?.title || "Uncategorized",
                tvgId: item.tvg?.id || null, // Might be useful for EPG if you add it later
            };
        });

        console.log(`Successfully parsed ${channels.length} channels.`);

        // Save to the pre-defined path
        const dataDir = path.dirname(OUTPUT_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(channels, null, 2), "utf8");

        console.log(`✅ Channels successfully saved to ${OUTPUT_FILE}`);
    } catch (error) {
        console.error("❌ Failed to download or parse channels:");
        console.error(error.message);
        process.exit(1);
    }
}

downloadAndParseChannels();
