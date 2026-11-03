'use strict';
const {createHash}=require('node:crypto');
const cache=new Map();
function normalizeOCR(data){
 if(data.IsErroredOnProcessing||Number(data.OCRExitCode)!==1)throw Error('Online OCR could not finish. Try again or check the service quota.');
 const lines=(data.ParsedResults||[]).flatMap(page=>page.TextOverlay?.Lines||[]).map(line=>{
 const words=(line.Words||[]).filter(w=>[w.Left,w.Top,w.Width,w.Height].every(Number.isFinite)&&w.Width>0&&w.Height>0);if(!words.length)return null;
 return {text:line.LineText||words.map(w=>w.WordText).join(' '),bbox:{x0:Math.min(...words.map(w=>w.Left)),y0:Math.min(...words.map(w=>w.Top)),x1:Math.max(...words.map(w=>w.Left+w.Width)),y1:Math.max(...words.map(w=>w.Top+w.Height))},confidence:null};
 }).filter(Boolean);
 return {data:{text:(data.ParsedResults||[]).map(p=>p.ParsedText||'').join('\n'),blocks:[{paragraphs:[{lines}]}]}};
}
async function cloudOCR(req,res){
 const reply=(code,data)=>{res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 if(req.method!=='POST')return reply(405,{error:'Use POST.'});
 if(req.headers.origin&&req.headers.origin!=='http://'+req.headers.host)return reply(403,{error:'Open this tool from the local Banana page.'});
 if(!process.env.OCR_SPACE_API_KEY)return reply(503,{error:'Online OCR needs a free OCR.space API key. Add OCR_SPACE_API_KEY to the local .env file and restart Banana.'});
 if(req.headers['content-type']!=='image/jpeg')return reply(415,{error:'Expected a JPEG image.'});
 try{
 let size=0,chunks=[];for await(const chunk of req){size+=chunk.length;if(size>950000)return reply(413,{error:'Image exceeds the free upload limit.'});chunks.push(chunk);}
 const digest=createHash('sha256').update(Buffer.concat(chunks)).digest('hex');
 if(cache.has(digest))return reply(200,cache.get(digest));
 const form=new FormData();form.set('file',new Blob(chunks,{type:'image/jpeg'}),'image.jpg');form.set('OCREngine','2');form.set('language','auto');form.set('isOverlayRequired','true');form.set('scale','true');
 const response=await fetch('https://api.ocr.space/parse/image',{method:'POST',headers:{apikey:process.env.OCR_SPACE_API_KEY},body:form,signal:AbortSignal.timeout(60000)});
 if(!response.ok)return reply(502,{error:'Online OCR unavailable or quota reached. Try again later.'});
 const result=normalizeOCR(await response.json());cache.set(digest,result);if(cache.size>40)cache.delete(cache.keys().next().value);reply(200,result);
 }catch{reply(502,{error:'Online OCR failed or timed out. Try again later.'});}
}
module.exports={cloudOCR,normalizeOCR};
