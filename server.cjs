const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const {performance}=require('node:perf_hooks');
const {getInternetTime}=require('./internet-time.cjs');
const root = __dirname;
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.md':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.gif':'image/gif','.mp4':'video/mp4'};
http.createServer((req,res)=>{
  let target;
  try { target = decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch { res.writeHead(400); return res.end(); }
  if(target==='/api/time'){
    const started=performance.now();
    getInternetTime().then(sample=>{res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({...sample,serverProcessingMs:performance.now()-started}));}).catch(()=>{res.writeHead(503,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({error:'Internet time unavailable'}));});
    return;
  }
  const file = path.resolve(root, '.' + (target==='/' ? '/index.html' : target));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
  fs.readFile(file,(err,data)=>{
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'}); res.end(data);
  });
}).listen(4173,'127.0.0.1',()=>console.log('Banana: http://127.0.0.1:4173'));
