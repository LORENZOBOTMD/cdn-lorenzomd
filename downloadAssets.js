const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function downloadImage(url, folder = './image') {
  const token = url.split('/resource/')[1];
  if (!token) return;

  const filename = `${token}`;
  const filepath = path.join(folder, filename);

  try {
    const { data } = await axios.get(url, { responseType: 'arraybuffer' });
    fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(filepath, data);
    console.log(`✅ Downloaded: ${filename}`);
  } catch (e) {
    console.error(`❌ Failed: ${filename}`, e.message);
  }
}

function deepFindImageURLs(obj) {
  const urls = [];
  if (Array.isArray(obj)) {
    obj.forEach(el => urls.push(...deepFindImageURLs(el)));
  } else if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      if (typeof obj[key] === 'string' && obj[key].includes('/resource/')) {
        urls.push(obj[key]);
      } else if (typeof obj[key] === 'object') {
        urls.push(...deepFindImageURLs(obj[key]));
      }
    }
  }
  return urls;
}

module.exports = async function runDownloader(apiResponse) {
  const urls = [...new Set(deepFindImageURLs(apiResponse))];
  for (const url of urls) await downloadImage(url);
};
