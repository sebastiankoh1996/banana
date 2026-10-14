const fs = require('node:fs');
const zlib = require('node:zlib');
const text = zlib.gunzipSync(fs.readFileSync(__dirname + '/cedict.txt.gz')).toString('utf8');
const dict = Object.create(null);
for (const line of text.split('\n')) {
  const m = line.trimEnd().match(/^(\S+) (\S+) \[([^\]]+)\] \/(.+)\/$/);
  if (!m) continue;
  const meanings = m[4].split('/').filter(s => !/^(CL:|variant of |old variant |surname )/.test(s));
  if (!meanings.length) continue;
  for (const word of new Set([m[1],m[2]])) {
    if (word.length > 16) continue;
    const prior = dict[word] || [];
    dict[word] = [...new Set([...prior, ...meanings])].slice(0, 5);
  }
}
fs.writeFileSync(__dirname + '/dictionary.json', JSON.stringify(dict));
fs.writeFileSync(__dirname + '/DICTIONARY-LICENSE.txt', text.split('\n').filter(l=>l.startsWith('#')).join('\n'));
console.log(`${Object.keys(dict).length} dictionary entries written.`);
