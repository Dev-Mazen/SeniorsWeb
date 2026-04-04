const fs = require('fs');
const html = fs.readFileSync('stitch/stitch_remix_of_seniors_2026_archive/home_seniors_2026/code.html', 'utf8');
const urls = Array.from(html.matchAll(/src=[\"\']([^\"\']+)[\"\']/gi)).map(m => m[1]);
console.log(urls.join('\n'));
