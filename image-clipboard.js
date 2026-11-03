'use strict';
function chineseImageText(value){return value.replace(/\r\n?/g,'\n').split('\n').map(line=>{if(!line.trim())return '';if(!/\p{Script=Han}/u.test(line))return null;return line.replace(/[^\p{Script=Han}\p{N}\p{P}\s]/gu,'').replace(/[ \t\u3000]+/g,' ').replace(/(?<=\p{Script=Han}) +(?=\p{Script=Han})/gu,'').replace(/ *([，。！？；：、）】》]) */g,'$1').replace(/([（【《]) */g,'$1').trim();}).filter(line=>line!==null).join('\n').replace(/\n{3,}/g,'\n\n').trim();}
function flowingImageText(value){return value.split(/\n\s*\n/).map(paragraph=>paragraph.split('\n').reduce((result,line)=>{if(!result)return line;return result+(/^(?:[•·\-]|[0-9一二三四五六七八九十]+[、.．）)]|[（(][0-9一二三四五六七八九十]+[）)])/u.test(line)?'\n':'')+line;},'')).join('\n\n');}
if(typeof module!=='undefined')module.exports={chineseImageText,flowingImageText};
if(typeof document!=='undefined'){
const dialog=document.getElementById('image-dialog'),status=document.getElementById('image-status'),input=document.getElementById('image-file');
let source=null,blocks=[];
const translationCache=new Map();
async function translatedText(text){
 if(translationCache.has(text))return translationCache.get(text);
 const pending=(async()=>{const translated=[];for(const chunk of splitTranslation(text)){
 const response=await fetch('https://api.mymemory.translated.net/get?'+new URLSearchParams({q:chunk,langpair:'zh-CN|en'}),{signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error('Translation service unavailable.');const data=await response.json();if(Number(data.responseStatus)!==200||data.quotaFinished)throw Error('Translation quota reached.');
 const decoder=document.createElement('textarea');decoder.innerHTML=data.responseData.translatedText;translated.push(decoder.value);
 }return translated;})();
 translationCache.set(text,pending);if(translationCache.size>200)translationCache.delete(translationCache.keys().next().value);
 try{return await pending;}catch(error){if(translationCache.get(text)===pending)translationCache.delete(text);throw error;}
}
let busy=false,generation=0,editTimer;
const review=document.getElementById('image-review'),preview=document.getElementById('image-preview');
async function readImage(file){
 if(busy)return;
 if(!file||!/^image\/(png|jpeg|webp|gif|bmp)$/i.test(file.type)){status.textContent='Choose a PNG, JPG, WebP, GIF or BMP image.';return;}
 if(file.size>20*1024*1024){status.textContent='This image is too large. Use an image smaller than 20 MB.';return;}
 review.hidden=true;source=null;blocks=[];document.getElementById('image-result').hidden=true;busy=true;preview.disabled=true;const job=++generation;dialog.setAttribute('aria-busy','true');status.textContent='Reading image with online OCR…';input.disabled=true;
 const timeout=setTimeout(()=>{if(job===generation){cancel();status.textContent='Image reading took too long. Check your connection or try a smaller image.';}},120000);
 try{
  const bitmap=await createImageBitmap(file),upload=document.createElement('canvas');upload.width=bitmap.width;upload.height=bitmap.height;upload.getContext('2d').drawImage(bitmap,0,0);bitmap.close();
  let blob;for(const quality of [.9,.75,.6,.45]){blob=await new Promise(resolve=>upload.toBlob(resolve,'image/jpeg',quality));if(blob&&blob.size<950000)break;}
  if(!blob||blob.size>=950000)throw Error('This image cannot fit the free OCR upload limit. Crop or resize it first.');
  if(job!==generation)return;
  const response=await fetch(['localhost','127.0.0.1'].includes(location.hostname)?'/api/ocr':'https://banana-ocr-sebastian.sbstko.chatgpt.site/api/ocr',{method:'POST',headers:{'Content-Type':'image/jpeg'},body:blob,signal:AbortSignal.timeout(70000)});
  const result=await response.json();if(!response.ok)throw Error(result.error||'Online OCR unavailable.');if(job!==generation)return;
  const extracted=chineseImageText(result.data.text);
  if(!extracted){status.textContent='No Chinese text found. Try a clearer image with larger text.';return;}
  source=file;blocks=(result.data.blocks||[]).flatMap(b=>b.paragraphs||[]).flatMap(p=>p.lines||[]).map(line=>({...line,text:chineseImageText(line.text)})).filter(line=>line.text);
  preview.value=blocks.map(block=>block.text).join('\n');review.hidden=false;
  await translateImage(job);

 }catch(error){if(job===generation)status.textContent=error.message||'Could not read this image. Try again.';}
 finally{clearTimeout(timeout);if(job===generation){busy=false;preview.disabled=false;input.disabled=false;dialog.removeAttribute('aria-busy');}}
}
function cancel(){dialog.removeAttribute('data-translating');clearTimeout(editTimer);generation++;busy=false;preview.disabled=false;input.disabled=false;dialog.removeAttribute('aria-busy');}
document.getElementById('image').onclick=()=>{review.hidden=true;document.getElementById('image-result').hidden=true;source=null;blocks=[];status.textContent='Paste an image with Ctrl+V (⌘V on Mac), or drag it into this window.';input.value='';dialog.showModal();};
async function translateImage(job=generation){
 if(!source)return;dialog.setAttribute('data-translating','true');document.getElementById('image-result').hidden=true;
 let bitmap;
 try{
 bitmap=await createImageBitmap(source);const canvas=document.getElementById('image-canvas'),ctx=canvas.getContext('2d');canvas.width=bitmap.width;canvas.height=bitmap.height;ctx.drawImage(bitmap,0,0);
 if(!blocks.length)throw Error('No positioned Chinese text found.');
 const selected=blocks.filter(block=>block.text.trim());if(!selected.length)throw Error('No text to translate.');
 let next=0,done=0;const translatedBlocks=new Map();
 status.textContent='Translating image text…';
 await Promise.all(Array.from({length:Math.min(3,selected.length)},async()=>{
 while(next<selected.length&&job===generation){const block=selected[next++],value=await translatedText(block.text.trim());translatedBlocks.set(block,value);done++;if(job===generation)status.textContent='Translating image text… '+done+'/'+selected.length;}
 }));
 if(job!==generation)return;
 for(const block of selected){
 const translated=translatedBlocks.get(block);
 const {x0,y0,x1,y1}=block.bbox,w=x1-x0,h=y1-y0;let lines,size;
 for(size=Math.max(6,Math.min(96,Math.floor(h*.8)));size>=6;size--){ctx.font=size+'px Arial';lines=[''];for(const word of translated.join(' ').split(/\s+/)){let n=lines.length-1,v=lines[n]?lines[n]+' '+word:word;if(ctx.measureText(v).width>w-8&&lines[n])lines.push(word);else lines[n]=v;}if(lines.length*size*1.2<h-8)break;}
 size=Math.max(6,size);
 // Sample the original image so overlapping patches never blur translated text.
 const padding=Math.max(3,Math.round(h*.08)),left=Math.max(0,x0-padding),top=Math.max(0,y0-padding);
 const right=Math.min(canvas.width,x1+padding),bottom=Math.min(canvas.height,y1+padding);
 ctx.save();ctx.beginPath();ctx.roundRect(left,top,right-left,bottom-top,Math.min(10,h*.12));ctx.clip();
 ctx.filter='blur('+Math.max(12,Math.min(48,h*.4))+'px)';ctx.drawImage(bitmap,0,0);ctx.restore();
 ctx.save();ctx.beginPath();ctx.rect(x0,y0,w,h);ctx.clip();ctx.font=size+'px Arial';ctx.textBaseline='top';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.strokeStyle='rgba(0,0,0,.75)';ctx.lineWidth=Math.max(1.5,size*.07);ctx.lineJoin='round';
 lines.forEach((line,i)=>{const y=y0+Math.max(4,(h-lines.length*size*1.2)/2)+i*size*1.2;ctx.strokeText(line,x0+w/2,y,Math.max(1,w-8));ctx.fillText(line,x0+w/2,y,Math.max(1,w-8));});ctx.restore();
 }
 document.getElementById('image-result').hidden=false;status.textContent='Translated image ready.';
 }catch(error){if(job===generation)status.textContent=error.message;}finally{bitmap?.close();if(job===generation)dialog.removeAttribute('data-translating');}
};
document.getElementById('image-download').onclick=()=>document.getElementById('image-canvas').toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='banana-translated.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);});
document.getElementById('image-close').onclick=()=>dialog.close();dialog.addEventListener('close',cancel);
preview.addEventListener('input',()=>{
 clearTimeout(editTimer);const job=++generation;
 editTimer=setTimeout(()=>{const lines=preview.value.split('\n');if(lines.length!==blocks.length){status.textContent='Keep one line per detected text area to update the image.';return;}blocks.forEach((block,i)=>block.text=lines[i]);void translateImage(job);},900);
});
input.addEventListener('change',()=>readImage(input.files[0]));
dialog.addEventListener('paste',event=>{if(event.target===preview)return;event.preventDefault();const file=Array.from(event.clipboardData.items).find(item=>item.type.startsWith('image/'))?.getAsFile();if(file)readImage(file);else status.textContent='No image found on the clipboard. Copy an image, then paste here.';});
dialog.addEventListener('dragover',event=>{event.preventDefault();dialog.classList.add('drag-over');});dialog.addEventListener('dragleave',()=>dialog.classList.remove('drag-over'));dialog.addEventListener('drop',event=>{event.preventDefault();dialog.classList.remove('drag-over');readImage(event.dataTransfer.files[0]);});
}
