// ---------- defs ----------
const DEFS=`<defs>
<linearGradient id="skin" gradientUnits="userSpaceOnUse" x1="200" y1="400" x2="900" y2="1500"><stop offset="0" stop-color="#34343c"/><stop offset=".55" stop-color="#16161a"/><stop offset="1" stop-color="#0a0a0c"/></linearGradient>
<linearGradient id="skin2" gradientUnits="userSpaceOnUse" x1="200" y1="400" x2="900" y2="1500"><stop offset="0" stop-color="#1c1c21"/><stop offset="1" stop-color="#060607"/></linearGradient>
<radialGradient id="gloss"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<radialGradient id="bg" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="#e3f6ea"/><stop offset="1" stop-color="#bfe6cf"/></radialGradient>
<filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18"/></filter>
<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
</defs>`;

// ---------- extra: organs ----------
function organs(o,t){
  const bpm=o.bpm||70;const beat=Math.pow(Math.max(0,Math.sin(t*Math.PI*bpm/60)),8);
  const br=0.5+0.5*Math.sin(t*(o.fast?7:3));
  let s=`<g opacity="${f1(o.k)}">`;
  s+=ell(V(540,830),190,150,0,'#ff6b8a',`opacity=".25" filter="url(#blur)"`);
  const lung=(x,flip)=>`<path transform="translate(${x} 830) scale(${flip*(1+br*.06)} ${1+br*.06})" d="M-10,-95 C-70,-95 -95,-20 -95,40 C-95,95 -50,110 -10,85 Z" fill="#ff8fa3" stroke="#fff" stroke-width="5" opacity=".92"/>`;
  s+=lung(522,1)+lung(558,-1);
  const hs=1+beat*.22;
  s+=`<g transform="translate(560 850) scale(${f1(hs*1.15)})"><path d="M0,30 C-60,-10 -45,-60 -15,-55 C-5,-53 0,-45 0,-38 C0,-45 5,-53 15,-55 C45,-60 60,-10 0,30Z" fill="#ff2a3d" stroke="#fff" stroke-width="5"/><ellipse cx="-18" cy="-38" rx="10" ry="6" fill="#fff" opacity=".6"/></g>`;
  return s+'</g>';
}