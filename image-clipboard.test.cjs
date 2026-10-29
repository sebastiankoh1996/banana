const assert=require('node:assert/strict');const {chineseImageText}=require('./image-clipboard.js');
assert.equal(chineseImageText('English heading\n你 好，世界！\n123\n繁 體 中 文。'),'你好，世界！\n繁體中文。');assert.equal(chineseImageText('Hello world 123'),'');assert.equal(chineseImageText('第 2 课：学习中文。'),'第 2 课：学习中文。');console.log('Chinese OCR cleanup preserves Chinese, punctuation and mixed numbers, and skips non-Chinese lines.');
const {flowingImageText}=require('./image-clipboard.js');
assert.equal(chineseImageText('你 好 ， 世 界 ！\n\n第 二 段。'),'你好，世界！\n\n第二段。');
assert.equal(flowingImageText('这是第一行\n接着阅读。\n\n这是第二段\n继续。'),'这是第一行接着阅读。\n\n这是第二段继续。');
assert.equal(flowingImageText('购物清单\n1.苹果\n2.香蕉'),'购物清单\n1.苹果\n2.香蕉');
assert.equal(flowingImageText('繁體中文\n也可以閱讀。'),'繁體中文也可以閱讀。');
console.log('Flowing text joins wrapped lines, preserves blank-line paragraphs and numbered lists.');
