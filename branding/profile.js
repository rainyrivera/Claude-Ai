const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1080}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/page.html');
for(const [name,arms,cx,cy,z] of [['A','up',540,770,1.12],['B','hips',540,700,1.55]]){
await p.evaluate(([arms,cx,cy,z])=>{
  hlId=0;
  const fig=stand({view:'front',arms0:arms,eyes:'happy'},0.9).svg;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">${DEFS}
   <defs><radialGradient id="pbg" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#e9fbf0"/><stop offset="1" stop-color="#a9dcc0"/></radialGradient>
   <clipPath id="circ"><circle cx="540" cy="540" r="540"/></clipPath></defs>
   <rect width="1080" height="1080" fill="url(#pbg)"/>
   <circle cx="540" cy="560" r="330" fill="#7c5cff" opacity=".16"/>
   <circle cx="540" cy="560" r="250" fill="#7c5cff" opacity=".14"/>
   <g clip-path="url(#circ)"><g transform="translate(540 540) scale(${z}) translate(${-cx} ${-cy})">${fig.replace(/<rect x="0" y="1745"[^>]*>/,'')}</g></g>
  </svg>`;
  document.body.innerHTML=svg;document.body.style.background='#fff';
},[arms,cx,cy,z]);
await p.screenshot({path:'profile_'+name+'.png'});
// circular preview of how Facebook shows it
await p.evaluate(()=>{const s=document.querySelector('svg');s.style.clipPath='circle(50%)';});
await p.screenshot({path:'circ_'+name+'.png',omitBackground:true});
}
console.log(errs.join('\n')||'ok');await b.close();})();
