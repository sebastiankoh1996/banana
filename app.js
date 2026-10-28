'use strict';
const $ = id => document.getElementById(id);
const editor = $('editor');
let text = '';
try { text = localStorage.getItem('banana.text') ?? ''; } catch {}
let dictionary = {}, undo = [], meaningsOn = false, composing = false, timer, selected = '', audioState = 'idle', translationVersion = 0;
const segmenter = new Intl.Segmenter('zh', {granularity:'word'});
const han = /\p{Script=Han}/u;
function notify(message) { $('message').textContent = message; }
function persist() { try {localStorage.setItem('banana.text',text);} catch {notify('Your browser could not save this document.');} }
function plain(node) { return node.innerText.replace(/\r/g,'').replace(/\n{3,}/g,'\n\n'); }
function cursorOffset() {
  const selection = window.getSelection();
  if (!selection.rangeCount || !editor.contains(selection.anchorNode)) return null;
  const range = selection.getRangeAt(0).cloneRange(); range.selectNodeContents(editor); range.setEnd(selection.anchorNode,selection.anchorOffset);
  return range.toString().length;
}
function restoreCursor(offset) {
  if(offset===null) return;
  const walker=document.createTreeWalker(editor,NodeFilter.SHOW_TEXT); let node, remaining=offset;
  while((node=walker.nextNode())) { if(remaining<=node.length) {const range=document.createRange(); range.setStart(node,remaining); range.collapse(true); const s=window.getSelection();s.removeAllRanges();s.addRange(range); return;} remaining-=node.length; }
  const range=document.createRange(); range.selectNodeContents(editor); range.collapse(false); const s=window.getSelection();s.removeAllRanges();s.addRange(range);
}
function render(offset=null) {
  const fragment=document.createDocumentFragment();
  for(const entry of segmenter.segment(text)) {
    if(!han.test(entry.segment)) {fragment.append(document.createTextNode(entry.segment)); continue;}
    const word=document.createElement('span'); word.className='word'; word.textContent=entry.segment; word.dataset.word=entry.segment;
    word.dataset.pinyin=pinyinPro.pinyin(entry.segment); word.tabIndex=0; word.setAttribute('aria-label',`${entry.segment}, ${word.dataset.pinyin}`);
    fragment.append(word);
  }
  editor.replaceChildren(fragment); restoreCursor(offset);
  $('text-count').textContent=`${Array.from(text.replace(/\s/g,'')).length} characters`;
  $('undo').disabled=!undo.length;
  editor.dataset.empty=String(!text.trim());
  $('empty-state').hidden=!!text.trim();
  $('translate').setAttribute('aria-expanded',String(!$('translation-output').hidden));
  $('translate').disabled=!text.trim();
  $('translation-placeholder').hidden=!$('translation-output').hidden;
  if(audioState==='idle') $('play').disabled=!text.trim();
  $('translate').textContent=$('translation-output').hidden?'Translate: OFF':'Translate: ON';
  $('translate').setAttribute('aria-pressed',String(!$('translation-output').hidden));
  $('translation-panel').hidden=$('translation-output').hidden;
}
function changed(value, offset=null) {
  if(value===text) return;
  if(value!==text) {undo.push(text);if(undo.length>100)undo.shift();text=value;persist();translationVersion++;$('translation-output').hidden=true;$('translate').setAttribute('aria-expanded','false');}
  render(offset); hideTip();
}
editor.addEventListener('input',()=>{
  if(composing)return; clearTimeout(timer);
  timer=setTimeout(()=>changed(plain(editor),cursorOffset()),180);
});
editor.addEventListener('compositionstart',()=>{composing=true;clearTimeout(timer);});
editor.addEventListener('compositionend',()=>{composing=false;changed(plain(editor),cursorOffset());});
function flush(){if(!composing){clearTimeout(timer);changed(plain(editor),cursorOffset());}}
editor.addEventListener('blur',flush);
editor.addEventListener('paste',event=>{event.preventDefault();insertPlain(event.clipboardData.getData('text/plain'));});
function insertPlain(value){editor.focus();const s=window.getSelection();if(s.rangeCount&&editor.contains(s.anchorNode)){const r=s.getRangeAt(0);r.deleteContents();const n=document.createTextNode(value);r.insertNode(n);r.setStartAfter(n);r.collapse(true);s.removeAllRanges();s.addRange(r);}else{editor.append(document.createTextNode(value));}changed(plain(editor),cursorOffset());}
$('paste').onclick=async()=>{try{const value=await navigator.clipboard.readText();insertPlain(value);notify('Text pasted.');}catch{notify('Clipboard access is unavailable. Click in the editor and press Ctrl+V (or ⌘V).');editor.focus();}};
$('copy').onclick=async()=>{flush();try{await navigator.clipboard.writeText(text);notify('Chinese text copied without pinyin.');}catch{notify('Clipboard access is unavailable. Select the text and copy it manually.');}};
function undoEdit(){clearTimeout(timer);if(!undo.length)return;text=undo.pop();persist();translationVersion++;$('translation-output').hidden=true;render();notify('Last edit undone.');}
$('undo').onclick=undoEdit;
editor.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'&&!event.shiftKey){event.preventDefault();undoEdit();}if(event.key==='Escape')hideTip();});
$('hover').onclick=()=>{meaningsOn=!meaningsOn;$('hover').setAttribute('aria-pressed',meaningsOn);$('hover').textContent=`Hover: ${meaningsOn?'ON':'OFF'}`;hideTip();};
document.querySelectorAll('[data-size]').forEach(button=>{if(button.tagName!=='BUTTON')return;button.onclick=()=>{editor.dataset.size=button.dataset.size;document.querySelectorAll('button[data-size]').forEach(b=>b.setAttribute('aria-pressed',b===button));};});
function hideTip(){$('word-tip').hidden=true;}
function lookup(word){if(dictionary[word])return dictionary[word].join('; ');return Array.from(word).map(c=>dictionary[c]?`${c}: ${dictionary[c].slice(0,2).join('; ')}`:'').filter(Boolean).join(' · ')||'No local dictionary entry for this word.';}
function showTip(word){if(!meaningsOn||!word)return;const rect=word.getBoundingClientRect();$('tip-word').textContent=word.dataset.word;$('tip-pinyin').textContent=word.dataset.pinyin;$('tip-meaning').textContent=lookup(word.dataset.word);const tip=$('word-tip');tip.hidden=false;const width=tip.offsetWidth,height=tip.offsetHeight;tip.style.left=Math.max(10,Math.min(rect.left,window.innerWidth-width-10))+'px';tip.style.top=(rect.bottom+height+12<window.innerHeight?rect.bottom+8:Math.max(8,rect.top-height-8))+'px';}
editor.addEventListener('pointerover',e=>showTip(e.target.closest('.word')));
let tipHideTimer;
editor.addEventListener('pointerout',()=>{tipHideTimer=setTimeout(hideTip,180);});
editor.addEventListener('pointerover',()=>clearTimeout(tipHideTimer));
$('word-tip').addEventListener('pointerenter',()=>clearTimeout(tipHideTimer));
$('word-tip').addEventListener('pointerleave',hideTip);
editor.addEventListener('focusin',e=>showTip(e.target.closest('.word')));
editor.addEventListener('click',e=>showTip(e.target.closest('.word')));
window.addEventListener('scroll',hideTip);window.addEventListener('resize',hideTip);
document.addEventListener('selectionchange',()=>{const s=window.getSelection();if(s.rangeCount&&editor.contains(s.anchorNode)&&editor.contains(s.focusNode)){selected=s.toString().trim();$('reading').replaceChildren(document.createTextNode('Reading: '),Object.assign(document.createElement('strong'),{textContent:selected?`Selection · ${Array.from(selected).length} characters`:'Entire Document'}));}});
function setAudio(state){audioState=state;$('play').disabled=state==='playing';$('play-label').textContent=state==='paused'?'Resume Audio':'Play Audio';$('pause').disabled=state!=='playing';$('stop').disabled=state==='idle';}
$('play').onclick=()=>{flush();if(!('speechSynthesis'in window)){notify('This browser does not support speech playback.');return;}if(audioState==='paused'){speechSynthesis.resume();setAudio('playing');return;}const value=selected||text;if(!value.trim()){notify('Add some text to listen to.');return;}speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(value);utterance.lang='zh-CN';utterance.rate=Number($('speed').value);const voices=speechSynthesis.getVoices();const voice=voices.find(v=>/^zh[-_]CN/i.test(v.lang))||voices.find(v=>/^zh/i.test(v.lang));if(voice)utterance.voice=voice;else notify('Using the browser’s default Mandarin voice. Availability depends on your device.');utterance.onboundary=e=>{$('audio-progress').value=Math.min(1,e.charIndex/Math.max(1,value.length));const s=Math.floor(Number.isFinite(e.elapsedTime)?e.elapsedTime:0);$('audio-elapsed').textContent=`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;};utterance.onend=()=>{$('audio-progress').value=1;setAudio('idle');};utterance.onerror=e=>{setAudio('idle');if(e.error!=='canceled'&&e.error!=='interrupted')notify('Audio is unavailable. Check that your device has a Mandarin voice installed.');};$('audio-progress').value=0;$('audio-elapsed').textContent='0:00';setAudio('playing');speechSynthesis.speak(utterance);};
$('pause').onclick=()=>{speechSynthesis.pause();setAudio('paused');};
$('stop').onclick=()=>{speechSynthesis.cancel();setAudio('idle');$('audio-progress').value=0;$('audio-elapsed').textContent='0:00';};
window.addEventListener('pagehide',()=>{if('speechSynthesis'in window)speechSynthesis.cancel();});
function splitTranslation(value){const chunks=[];let part='';for(const char of value){if(new TextEncoder().encode(part+char).length>450){chunks.push(part);part='';}part+=char;}if(part)chunks.push(part);return chunks;}
$('translate').onclick=async()=>{
  flush();const output=$('translation-output');if(!output.hidden){translationVersion++;output.hidden=true;$('translation-panel').hidden=true;$('translate').textContent='Translate: OFF';$('translate').setAttribute('aria-expanded','false');$('translate').setAttribute('aria-pressed','false');return;}if(!text.trim()){notify('Add some text to translate.');return;}if(text.length>3000){notify('Online translation is limited to 3,000 characters per request. Shorten the document first.');return;}
  const version=translationVersion,value=text;output.hidden=false;$('translation-panel').hidden=false;$('translate').textContent='Translate: ON';$('translate').setAttribute('aria-pressed','true');$('translation-placeholder').hidden=true;output.textContent='Translating…';$('translate').disabled=true;$('translate').setAttribute('aria-expanded','true');
  try{const translations=[];for(const chunk of splitTranslation(value)){const response=await fetch('https://api.mymemory.translated.net/get?'+new URLSearchParams({q:chunk,langpair:'zh-CN|en'}),{signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('Translation service is unavailable.');const data=await response.json();if(Number(data.responseStatus)!==200||data.quotaFinished)throw Error(data.responseDetails||'Translation quota reached. Please try again later.');translations.push(data.responseData.translatedText);}if(version===translationVersion)output.textContent=translations.join('');}
  catch(error){if(version===translationVersion)output.textContent=`Translation could not finish. ${error.name==='TimeoutError'?'The service timed out. Please try again.':error.message} Your Chinese text is saved.`;}
  finally{$('translate').disabled=!text.trim();}
};
let previousTimerPhase='';
const accurateClock=BananaClock.createClock();
let clockRequest=null,clockGeneration=0;
function syncClock(){
  if(!navigator.onLine){accurateClock.reset();tick();return Promise.resolve();}
  if(clockRequest)return clockRequest;
  const generation=clockGeneration,started=performance.now();
  clockRequest=(async()=>{try{
    const response=await fetch('https://timeapi.io/api/Time/current/zone?timeZone=UTC',{cache:'no-store',signal:AbortSignal.timeout(7000)});
    if(!response.ok)throw Error('Time sync unavailable');
    const sample=BananaClock.fromTimeApi(await response.json());
    if(generation===clockGeneration&&navigator.onLine)accurateClock.accept(sample,started,performance.now());
  }catch{if(generation===clockGeneration)accurateClock.reset();}finally{clockRequest=null;tick();}})();
  return clockRequest;
}
// Retire old test links so bookmarks cannot restart a synthetic alarm.
const timerUrl=new URL(location.href);
if(timerUrl.searchParams.has('timer-preview')||timerUrl.searchParams.has('timer-alarm-preview')){
  timerUrl.searchParams.delete('timer-preview');
  timerUrl.searchParams.delete('timer-alarm-preview');
  history.replaceState(null,'',timerUrl.pathname+timerUrl.search+timerUrl.hash);
}
function tick(){
  const clock=accurateClock.read();
  const state=BananaTimer.scheduleAt(clock.now),badge=$('countdown');
  badge.dataset.phase=state.phase;
  badge.title=clock.source==='internet'?`Internet UTC time, estimated network uncertainty ±${Math.ceil(clock.uncertaintyMs)} ms`:'Using the PC clock';
  badge.style.setProperty('--timer-scale',state.scale.toFixed(5));
  $('clock').textContent=state.text;
  $('clock-label').textContent=state.phase==='alarm'?"Time’s up":`to ${state.label}`;
  badge.setAttribute('aria-label',state.phase==='alarm'?`${state.label} alarm. Time’s up.`:`${state.text} remaining until ${state.label}, Singapore time`);
  if(state.phase!==previousTimerPhase){$('timer-status').textContent=state.phase==='alarm'?`${state.label} alarm. Countdown resumes automatically after ten minutes.`:state.phase==='warning'?'Ten-minute countdown warning.':'';previousTimerPhase=state.phase;}
}
window.addEventListener('offline',()=>{clockGeneration++;accurateClock.reset();tick();});
window.addEventListener('online',()=>{clockGeneration++;if(clockRequest)clockRequest.finally(syncClock);else syncClock();});
document.addEventListener('visibilitychange',()=>{document.documentElement.classList.toggle('timer-paused',document.hidden);if(!document.hidden){clockGeneration++;accurateClock.reset();tick();if(clockRequest)clockRequest.finally(syncClock);else syncClock();}});
tick();setInterval(tick,1000);render();
syncClock();setInterval(syncClock,60000);
fetch('dictionary.json', {signal: AbortSignal.timeout(10000)}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{dictionary=data;}).catch(()=>{notify('Pinyin still works. Reload the page to retry loading word meanings.');}).finally(()=>window.dispatchEvent(new Event('banana-ready')));

$('tip-speak').onclick=()=>{if(!('speechSynthesis' in window))return;const utterance=new SpeechSynthesisUtterance($('tip-word').textContent);utterance.lang='zh-CN';utterance.rate=Number($('speed').value);speechSynthesis.cancel();setAudio('idle');speechSynthesis.speak(utterance);};
