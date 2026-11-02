'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),cp=require('node:child_process');
const pending=[]; let focused=null;
class Element {
 constructor(id='',classes=[]){this.id=id;this.parent=null;this.children=[];this.attributes={};this.dataset={};this.listeners={};this.open=false;this.classes=new Set(classes);this.classList={contains:v=>this.classes.has(v),toggle:(v,on)=>on?this.classes.add(v):this.classes.delete(v)};}
 append(e){if(e.parent)e.parent.children.splice(e.parent.children.indexOf(e),1);this.children.push(e);e.parent=this;}
 before(e){const p=this.parent;p.children.splice(p.children.indexOf(this),0,e);e.parent=p;}
 after(e){if(e.parent)e.parent.children.splice(e.parent.children.indexOf(e),1);const p=this.parent;p.children.splice(p.children.indexOf(this)+1,0,e);e.parent=p;}
 contains(e){return this===e||this.children.some(child=>child.contains(e));}
 setAttribute(k,v){this.attributes[k]=v;} getAttribute(k){return this.attributes[k]??null;}
 addEventListener(type,fn,options){(this.listeners[type]??=[]).push({fn,capture:options?.capture});}
 fire(type){for(const x of this.listeners[type]??[])x.fn();}
 click(){for(const x of this.listeners.click??[])if(x.capture)x.fn();this.onclick?.();for(const x of this.listeners.click??[])if(!x.capture)x.fn();}
 focus(){focused=this;} showModal(){this.open=true;elements['tools-close'].focus();}
 close(){this.open=false;pending.push(()=>this.fire('close'));}
}
const flush=()=>{while(pending.length)pending.shift()();};
const elements={};for(const id of ['night-mode','pinyin-toggle','editor','tools-dialog','tools-open','tools-close','tools-actions','tools-switches','tools-preferences','image','image-dialog','translate','copy','undo','sizes','appearance','paste'])elements[id]=new Element(id);
elements.appearance.classes.add('appearance');elements.appearance.append(elements['night-mode']);
const header=new Element(),actions=new Element(),switches=new Element();header.append(elements.appearance);
for(const id of ['image','copy','undo']){elements[id].dataset.toolsItem='actions';actions.append(elements[id]);}
for(const id of ['pinyin-toggle','translate']){elements[id].dataset.toolsItem='switches';switches.append(elements[id]);}
elements.sizes.dataset.toolsItem='preferences';elements.appearance.dataset.toolsItem='preferences';switches.append(elements.sizes);
for(const id of ['tools-actions','tools-switches','tools-preferences'])elements['tools-dialog'].append(elements[id]);
const items=[elements.appearance,...['image','copy','undo','pinyin-toggle','translate','sizes'].map(id=>elements[id])];
const storage=new Map([['banana.text','原来的文字'],['banana-night-mode','true']]);let writes=0;const media={matches:false,addEventListener(t,fn){this.listener=fn;}};
const document={documentElement:{dataset:{}},getElementById:id=>elements[id],querySelectorAll:()=>items,createComment:()=>new Element(),get activeElement(){return focused;}};
vm.runInNewContext(fs.readFileSync('theme.js','utf8'),{document,window:{matchMedia:()=>media},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>{writes++;storage.set(k,v);}}});
const setMobile=on=>{media.matches=on;media.listener();flush();};
assert.equal(document.documentElement.dataset.theme,'night');assert.equal(writes,0);assert.equal(elements.image.parent,actions);
setMobile(true);assert.equal(elements.image.parent,elements['tools-actions']);assert.deepEqual(elements['tools-preferences'].children.map(x=>x.id),['sizes','appearance']);
elements['tools-open'].click();assert.equal(elements['tools-dialog'].open,true);assert.equal(elements['tools-open'].getAttribute('aria-expanded'),'true');
elements['pinyin-toggle'].setAttribute('aria-pressed','true');elements['pinyin-toggle'].click();assert.equal(elements.editor.classes.has('hide-pinyin'),true);
elements['night-mode'].click();assert.equal(storage.get('banana-night-mode'),'false');assert.equal(storage.get('banana.text'),'原来的文字');
elements.image.onclick=()=>{elements['image-dialog'].open=true;elements['image-dialog'].focus();};elements.image.click();flush();assert.equal(elements['tools-dialog'].open,false);assert.equal(focused,elements['image-dialog']);
elements['image-dialog'].close();flush();assert.equal(focused,elements['tools-open']);
elements['image-dialog'].open=true;elements['image-dialog'].close();elements.editor.focus();flush();assert.equal(focused,elements.editor,'keep editor focus after OCR insertion');
elements['tools-open'].click();elements['tools-close'].click();elements['tools-open'].click();flush();assert.equal(elements['tools-dialog'].open,true);assert.equal(elements['tools-open'].getAttribute('aria-expanded'),'true');
let translations=0;elements.translate.onclick=()=>translations++;elements.translate.click();flush();assert.equal(translations,1);assert.equal(elements['tools-dialog'].open,false);
elements['tools-open'].click();elements['night-mode'].focus();setMobile(false);assert.equal(elements['tools-dialog'].open,false);assert.equal(elements.image.parent,actions);assert.equal(elements.appearance.parent,header);assert.equal(focused,elements.paste);assert.equal(elements.editor.parent,null);
for(let i=0;i<4;i++){setMobile(true);setMobile(false);}assert.equal(actions.children.filter(x=>x===elements.image).length,1);assert.equal(storage.get('banana.text'),'原来的文字');
const baseline=cp.execFileSync('git',['show','HEAD:index.html'],{encoding:'utf8'});const current=fs.readFileSync('index.html','utf8');
for(const [,id] of baseline.matchAll(/\bid="([^"]+)"/g)){assert.equal([...current.matchAll(new RegExp('\\bid="'+id+'"','g'))].length,1,'preserve unique behavior hook '+id);}
assert.equal((current.match(/id="editor"/g)||[]).length,1);
console.log('Tools: stable nodes, responsive state, modal focus, OCR handoff, translation once, close/reopen race and saved-text preservation passed. Existing HTML IDs retained uniquely.');
