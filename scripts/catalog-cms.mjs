import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
const texts = new Map();
function key(s) {let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return `text.${(h>>>0).toString(16)}`;}
function walk(dir) {for(const e of fs.readdirSync(dir,{withFileTypes:true})) {const file=path.join(dir,e.name);if(e.isDirectory()){if(!['content','__tests__'].includes(e.name))walk(file);continue;}if(!file.endsWith('.tsx') || file.includes('opengraph-image'))continue;
const ast=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
function visit(n) {
if(ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n)) {
 const s=n.text.trim(), p=n.parent;
 const attr=ts.isJsxAttribute(p)?p.name.text:null;
 const isDisplay = ts.isJsxExpression(p) && ts.isJsxElement(p.parent) && p.parent.openingElement.tagName.getText(ast) === 'CmsText';
 const isCss=/(?:^|\s)(?:text|bg|border|flex|grid|gap|items|justify|font|rounded|hover|focus|sm|md|lg|px|py|w|h|mt|mb|space|animate|transition|opacity|overflow|shadow|tracking|leading|max|min|col|row|inline|absolute|relative|sticky|z)[-:[]/.test(s);
 if(s && (isDisplay || /[A-ZÀ-ÿ][a-zà-ÿ]|\s[a-zA-ZÀ-ÿ]/.test(s)) && !isCss && !['use client','use server','use cache'].includes(s) && !/^(\/|@|https?:|[.#(])/.test(s) && (!attr || ['title','subtitle','label','placeholder','aria-label','alt','badgeText'].includes(attr)) && !ts.isImportDeclaration(p)) texts.set(key(s),{text_key:key(s),value:s,source:file});
}ts.forEachChild(n,visit); } visit(ast);
}}
walk('src/app');walk('src/components');
texts.set('system.feature-unavailable',{text_key:'system.feature-unavailable',value:'Esta funcionalidade está temporariamente indisponível.',source:'src/components/content/Cms.tsx'});
fs.writeFileSync('cms/ui-texts.json',JSON.stringify([...texts.values()],null,2)+'\n');
console.log(`${texts.size} textos catalogados`);
