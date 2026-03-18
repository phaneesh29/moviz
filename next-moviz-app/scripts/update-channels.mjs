import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';
import parser from 'iptv-playlist-parser';

const { parse } = parser;

const IPTV_URL = 'https://iptv-org.github.io/iptv/index.m3u';
const OUTPUT_FILE = path.join(process.cwd(), 'data', 'channels.json');

async function updateChannels() {
  try {
    console.log(`Downloading latest M3U playlist from ${IPTV_URL}...`);
    const response = await axios.get(IPTV_URL, { responseType: 'text' });

    console.log('Download complete. Parsing M3U data...');
    const parsedData = parse(response.data);

    const channels = parsedData.items
      .filter((item) => item?.url)
      .map((item, index) => ({
        id: index + 1,
        name: item.name || 'Unknown Channel',
        logo: item.tvg?.logo || null,
        url: item.url,
        group: item.group?.title || 'Uncategorized',
        tvgId: item.tvg?.id || null,
      }));

    const dataDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(channels, null, 2), 'utf8');
    console.log(`Channels successfully saved to ${OUTPUT_FILE}`);
    console.log(`Total channels: ${channels.length}`);
  } catch (error) {
    console.error('Failed to update channels:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

updateChannels();
