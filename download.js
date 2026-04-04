const fs = require('fs');
const https = require('https');
const glob = require('glob');

const files = glob.sync('stitch/stitch_remix_of_seniors_2026_archive/**/*.html');
const regex = /src=[\"'](https:\/\/lh3\.googleusercontent\.com[^\"']+)[\"']/gi;
const urls = new Set();

files.forEach(f => {
  const html = fs.readFileSync(f, 'utf8');
  let match;
  while ((match = regex.exec(html)) !== null) {
    urls.add(match[1]);
  }
});

if (!fs.existsSync('public/stitch-assets')) {
  fs.mkdirSync('public/stitch-assets', {recursive: true});
}

let mapping = {};
let arr = Array.from(urls);
arr.forEach((url, i) => {
  const name = 'asset_' + i + '.jpg';
  mapping[url] = '/stitch-assets/' + name;
  https.get(url, res => {
     res.pipe(fs.createWriteStream('public/stitch-assets/' + name));
  });
});

setTimeout(() => {
    fs.writeFileSync('img_map_all.json', JSON.stringify(mapping, null, 2));
    console.log("Downloaded " + arr.length + " assets.");
}, 3000);
