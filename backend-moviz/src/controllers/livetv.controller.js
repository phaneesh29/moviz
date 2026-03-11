import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getChannelsController = async (req, res) => {
    try {
        const filePath = path.join(__dirname, "..", "data", "channels.json");
        const channelsData = await fs.promises.readFile(filePath, "utf-8");
        const channels = JSON.parse(channelsData);

        res.status(200).json({ success: true, results: channels });
    } catch (error) {
        console.error("Error reading channels:", error);
        res.status(500).json({ success: false, message: "Failed to load channels" });
    }
};

export const getChannelController = async (req, res) => {
    try {
        const { id } = req.params;
        const filePath = path.join(__dirname, "..", "data", "channels.json");
        const channelsData = await fs.promises.readFile(filePath, "utf-8");
        const channels = JSON.parse(channelsData);

        const channel = channels.find(c => c.id === parseInt(id));
        if (!channel) {
            return res.status(404).json({ success: false, message: "Channel not found" });
        }

        res.status(200).json({ success: true, results: channel });
    } catch (error) {
        console.error("Error reading channel:", error);
        res.status(500).json({ success: false, message: "Failed to load channel details" });
    }
};
