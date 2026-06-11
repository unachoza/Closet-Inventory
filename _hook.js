const sharp=require('sharp');
const body=`<path d="M256 244 L142 340 H370 Z" fill="#ffffff" fill-opacity="0.10"/>`;
const hooks={
 A:`<path d="M256 244 V150 C256 130 270 118 288 120 C305 122 314 138 306 153 C300 164 288 166 280 158"/>`,
 B:`<path d="M256 244 V146 C256 126 269 116 284 118 C300 120 308 134 302 148 C297 159 285 161 278 153"/>`,
 C:`<path d="M256 244 V150 A26 26 0 1 1 248 169"/>`,
};
const wrap=h=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="#222c51"/><g fill="none" stroke="#ffffff" stroke-width="24" stroke-linecap="round" stroke-linejoin="round">${hooks[h]}${body}</g></svg>`;
Promise.all(Object.keys(hooks).map(k=>sharp(Buffer.from(wrap(k))).resize(220,220).png().toFile('/tmp/hook_'+k+'.png'))).then(()=>console.log('done'));
