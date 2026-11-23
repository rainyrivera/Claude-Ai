// ================= ENGINE v2 (athletic Rous) =================
const FL=1700;
const DEG=Math.PI/180;
const Dv=deg=>V(Math.sin(deg*DEG),Math.cos(deg*DEG));
const angOf=v=>Math.atan2(v.x,v.y)/DEG;
const wrap=a=>{while(a>180)a-=360;while(a<=-180)a+=360;return a;};
const lerpA=(a,b,k)=>a+wrap(b-a)*k;
function ik2(P,A,L1,L2,sign){let d=sub(A,P);const dl=Math.max(1,Math.min(len(d),L1+L2-0.5));const u=unit(d);const a=(L1*L1-L2*L2+dl*dl)/(2*dl),h=Math.sqrt(Math.max(0,L1*L1-a*a));const n=mul(V(u.y,-u.x),sign);return add(add(P,mul(u,a)),mul(n,h));}
const rotP=(lean,p)=>{const a=lean*DEG;return V(p.x*Math.cos(a)-p.y*Math.sin(a),p.x*Math.sin(a)+p.y*Math.cos(a));};
const L1B=292,L2B=284,AL1=198,AL2=176;
const SHO=V(2,-372);
function shoulderOf(p,far){return add(p.hip,rotP(p.lean||0,V(SHO.x+(far?-10:0),SHO.y)));}
function legAng(p,w){const leg=p[w+'Leg'];if(leg)return {th:leg.th,sh:leg.sh};const Ls=p.Ls||1;const A=p[w+'A'];const K=ik2(p.hip,A,L1B*Ls,L2B*Ls,p[w+'Ks']||1);return {th:angOf(sub(K,p.hip)),sh:angOf(sub(A,K))};}
function armAngP(p,w){const arm=p[w+'Arm'];if(arm)return {a:arm.a,f:arm.f};const sh=shoulderOf(p,w==='f');const H=p[w+'Hand'];const E=ik2(sh,H,AL1,AL2,p[w+'Es']||-1);return {a:angOf(sub(E,sh)),f:angOf(sub(H,E))};}
function norm(p){return {hip:p.hip,lean:p.lean||0,bow:p.bow||0,neck:p.neck||0,Ls:p.Ls||1,nLeg:legAng(p,'n'),fLeg:legAng(p,'f'),nArm:armAngP(p,'n'),fArm:armAngP(p,'f')};}
function pLerp(a,b,k){a=a.nLeg&&a.nArm&&!a.nA?a:norm(a);b=b.nLeg&&b.nArm&&!b.nA?b:norm(b);
  const L=(x,y)=>({th:lerpA(x.th,y.th,k),sh:lerpA(x.sh,y.sh,k)}),A=(x,y)=>({a:lerpA(x.a,y.a,k),f:lerpA(x.f,y.f,k)});
  return {hip:lerpV(a.hip,b.hip,k),lean:lerpA(a.lean,b.lean,k),bow:lerp(a.bow,b.bow,k),Ls:lerp(a.Ls,b.Ls,k),nLeg:L(a.nLeg,b.nLeg),fLeg:L(a.fLeg,b.fLeg),nArm:A(a.nArm,b.nArm),fArm:A(a.fArm,b.fArm),neck:lerp(a.neck,b.neck,k)};}
// sequence of [t, poseObj, dur]
function seqPose(keys,t){let cur=norm(keys[0][1]);for(const [tk,P,d] of keys){if(t<tk)break;cur=pLerp(cur,norm(P),ease((t-tk)/(d||0.6)));}return cur;}
// oscillate between A and B: phase 0 at A
function osc(A,B,t,t0,period,hold=0){const ph=((t-t0)/period)%1;let k=0.5-0.5*Math.cos(2*Math.PI*ph);if(hold){k=clamp((k-0.0)/(1-hold),0,1);} return pLerp(norm(A),norm(B),k);}
const repCount=(t,t0,period,max)=>Math.min(max,Math.max(0,Math.floor((t-t0)/period+0.5)));

// ---------- side body (athletic) ----------
function body(p,st,t){
  p=p.nLeg&&p.nArm&&!p.nA?p:norm(p);
  const Ls=p.Ls,L1=L1B*Ls,L2=L2B*Ls;const hip=p.hip;const lean=p.lean;
  const R=q=>add(hip,rotP(lean,q));const fwd=rotP(lean,V(1,0));
  const leg=(lg,dx)=>{const H=add(hip,V(dx,dx*0.4));const K=add(H,mul(Dv(lg.th),L1));const A=add(K,mul(Dv(lg.sh),L2));const toe=add(A,mul(Dv(lg.sh+90),82));return {H,K,A,toe,th:lg.th,sh:lg.sh};};
  const nl=leg(p.nLeg,0),fl=leg(p.fLeg,-10);
  const arm=(ar,far)=>{const sh=shoulderOf(p,far);const E=add(sh,mul(Dv(ar.a),AL1));const Hd=add(E,mul(Dv(ar.f),AL2));return {sh,E,Hd};};
  const na=arm(p.nArm,false),fa=arm(p.fArm,true);
  let g='';
  const hl=st.hl||{},hc=st.hlColor||{};
  // far limbs
  g+=limb(fa.sh,fa.E,64,50,SKIN2,'#25252c')+limb(fa.E,fa.Hd,50,40,SKIN2,'#25252c')+`<circle cx="${f1(fa.Hd.x)}" cy="${f1(fa.Hd.y)}" r="28" fill="${SKIN2}"/>`;
  g+=limb(fl.H,fl.K,132,86,SKIN2,'#25252c')+limb(fl.K,fl.A,86,50,SKIN2,'#25252c')+limb(fl.A,fl.toe,48,30,SKIN2,'#25252c');
  // ponytail
  const nb=R(V(12,-400));const hl2=lean+(p.neck||0);const head=add(nb,rotP(hl2,V(22,-108)));
  const pt=q=>add(head,rotP(hl2,q));const sway=Math.sin(t*3)*6;
  const P1=pt(V(-60,-50)),P2=pt(V(-175,-5+sway)),P3=pt(V(-150+sway,150)),P4=pt(V(-120,60)),P5=pt(V(-70,10));
  g+=`<path d="M${f1(P1.x)},${f1(P1.y)} Q${f1(P2.x)},${f1(P2.y)} ${f1(P3.x)},${f1(P3.y)} Q${f1(P4.x)},${f1(P4.y)} ${f1(P5.x)},${f1(P5.y)}Z" fill="#141418" stroke="#2c2c34" stroke-width="3"/>`;
  g+=limb(nb,add(nb,rotP(hl2,V(16,-70))),68,66,SKIN);
  // torso (athletic, with bow)
  const bw=p.bow||0;
  const TP=[[30,-418],[50,-376],[96,-310],[62,-250],[40,-160],[50,-70],[62,10],[40,54],[-34,70],[-92,44],[-104,-14],[-56,-120],[-66,-240],[-70,-345],[-28,-418]];
  const tor=TP.map(([x,y])=>R(V(x+bw*Math.sin(Math.PI*clamp(-y/418,0,1)),y)));
  const tp=smoothPath(tor);
  g+=`<defs><clipPath id="tclip${hlId}"><path d="${tp}"/></clipPath></defs><path d="${tp}" fill="${SKIN}" stroke="${RIM}" stroke-width="3"/>`;
  const band=(y0,y1,col)=>{const q=[V(-220,y0),V(220,y0),V(220,y1),V(-220,y1)].map(R);return `<polygon clip-path="url(#tclip${hlId})" points="${q.map(v=>f1(v.x)+','+f1(v.y)).join(' ')}" fill="${col}"/>`;};
  g+=band(-345,-240,OUT)+band(-28,130,OUT);
  // abs lines (front)
  for(let i=0;i<3;i++){const a=R(V(36+bw*0.7,-210+i*48)),b=R(V(52+bw*0.7,-206+i*48));g+=`<line x1="${f1(a.x)}" y1="${f1(a.y)}" x2="${f1(b.x)}" y2="${f1(b.y)}" stroke="#3a3a44" stroke-width="4" stroke-linecap="round"/>`;}
  const st1=[R(V(-22,-414)),R(V(10,-346))];g+=`<line x1="${f1(st1[0].x)}" y1="${f1(st1[0].y)}" x2="${f1(st1[1].x)}" y2="${f1(st1[1].y)}" stroke="${OUT}" stroke-width="14" stroke-linecap="round"/>`;
  g+=gloss(R(V(-30,-290)),16,60,lean,.18)+gloss(R(V(-70,-10)),26,14,lean,.22);
  // near leg (athletic)
  g+=limb(nl.H,nl.K,138,88,SKIN)+limb(nl.H,lerpV(nl.H,nl.K,.28),142,132,OUT,OUT2)+limb(nl.K,nl.A,88,52,SKIN)+limb(nl.A,nl.toe,50,32,SKIN);
  const vt=unit(sub(nl.K,nl.H)),vs=unit(sub(nl.A,nl.K));
  g+=ell(add(lerpV(nl.K,nl.A,.33),mul(V(-vs.y,vs.x),-0)),50,34,ang(vs)+0,SKIN,`opacity="0"`);
  const calf=add(lerpV(nl.K,nl.A,.32),mul(V(vs.y,-vs.x),-22));g+=ell(calf,72,40,ang(vs),SKIN,`stroke="${RIM}" stroke-width="3"`);
  g+=gloss(add(lerpV(nl.H,nl.K,.62),mul(V(vt.y,-vt.x),28)),12,64,ang(vt)-90,.24)+gloss(calf,10,40,ang(vs)-90,.2);
  // head
  g+=`<circle cx="${f1(head.x)}" cy="${f1(head.y)}" r="92" fill="${SKIN}" stroke="${RIM}" stroke-width="3"/>`;
  const H1=pt(V(-92,10)),H2=pt(V(40,-83)),H3=pt(V(-10,-50)),H4=pt(V(-30,40));
  g+=`<path d="M${f1(H1.x)},${f1(H1.y)} A92,92 0 0 1 ${f1(H2.x)},${f1(H2.y)} Q${f1(H3.x)},${f1(H3.y)} ${f1(H4.x)},${f1(H4.y)}Z" fill="#141418"/>`;
  g+=gloss(pt(V(-10,-62)),30,10,hl2-15,.3);
  const em=st.eyes||'normal';g+=eye(pt(V(48,-12)),em,hl2,1.15,t);
  const M=pt(V(68,40));
  if(em==='strain'||em==='surprised') g+=`<ellipse cx="${f1(M.x)}" cy="${f1(M.y)}" rx="9" ry="${f1(9+3*Math.abs(Math.sin(t*8)))}" fill="#fff" opacity=".9"/>`;
  else {const m1=pt(V(56,38)),m2=pt(V(70,46)),m3=pt(V(82,34));g+=`<path d="M${f1(m1.x)},${f1(m1.y)} Q${f1(m2.x)},${f1(m2.y)} ${f1(m3.x)},${f1(m3.y)}" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".9"/>`;}
  // near arm (athletic)
  g+=limb(na.sh,na.E,72,54,SKIN)+limb(na.E,na.Hd,54,42,SKIN)+`<circle cx="${f1(na.Hd.x)}" cy="${f1(na.Hd.y)}" r="30" fill="${SKIN}" stroke="${RIM}" stroke-width="3"/>`;
  g+=ell(na.sh,50,44,ang(sub(na.E,na.sh)),SKIN,`stroke="${RIM}" stroke-width="3"`)+gloss(add(na.sh,V(-8,-14)),22,10,lean,.28);
  const bi=lerpV(na.sh,na.E,.55);g+=gloss(bi,9,30,ang(sub(na.E,na.sh))-90,.2);
  // highlights
  const P={
    glute:{c:R(V(-62,8)),rx:66,ry:62,r:lean},
    hipflex:{c:add(lerpV(nl.H,nl.K,.18),mul(V(vt.y,-vt.x),-30)),rx:62,ry:28,r:ang(vt)-90+90},
    quad:{c:add(lerpV(nl.H,nl.K,.55),mul(V(vt.y,-vt.x),-26)),rx:100,ry:32,r:ang(vt)},
    ham:{c:add(lerpV(nl.H,nl.K,.55),mul(V(vt.y,-vt.x),28)),rx:100,ry:30,r:ang(vt)},
    core:{c:R(V(44+bw*0.7,-150)),rx:30,ry:95,r:lean},
    back:{c:R(V(-60+bw*0.4,-130)),rx:28,ry:90,r:lean},
    spine:{c:R(V(-62+bw*0.5,-220)),rx:24,ry:190,r:lean},
    chest:{c:R(V(70,-300)),rx:34,ry:50,r:lean},
    calf:{c:calf,rx:70,ry:36,r:ang(vs)},
    tri:{c:add(lerpV(na.sh,na.E,.5),mul(V(-unit(sub(na.E,na.sh)).y,unit(sub(na.E,na.sh)).x),-14)),rx:80,ry:24,r:ang(sub(na.E,na.sh))},
    shoulder:{c:na.sh,rx:50,ry:46,r:0},
    oblique:{c:R(V(0,-150)),rx:40,ry:80,r:lean},
  };
  for(const k in hl){if(P[k]&&hl[k]>0){const q=P[k];g+=muscle(q.c,q.rx,q.ry,q.r,hl[k],t,hc[k]||'red');}}
  if(st.spark&&P[st.spark.at]) g+=sparks(P[st.spark.at].c,90,t,st.spark.k);
  return {svg:g,pts:{head,hip,nK:nl.K,nA:nl.A,fK:fl.K,fA:fl.A,nH:na.Hd,fH:fa.Hd,nE:na.E,sh:na.sh,toe:nl.toe,P,R}};
}
// ---------- props ----------
const PROP={
  floor:(y=FL)=>`<rect x="-1500" y="${y}" width="4000" height="900" fill="#b9e2cb"/><rect x="-1500" y="${y}" width="4000" height="10" fill="#a2d4b6"/>`,
  mat:(x0=120,x1=980,y=FL)=>`<rect x="${x0}" y="${y-10}" width="${x1-x0}" height="26" rx="13" fill="#9b87ff" opacity=".6"/>`,
  shadow:(x,w=300,y=FL)=>ell(V(x,y+6),w,22,0,'#000','opacity=".12" filter="url(#blur)"'),
  wall:(x)=>`<rect x="${x-60}" y="-400" width="60" height="${FL+400}" fill="#a5d6bb"/><rect x="${x-60}" y="-400" width="10" height="${FL+400}" fill="#93cbad"/><rect x="-1500" y="-400" width="${1500+x-60}" height="${FL+400}" fill="#cde9d9" opacity=".7"/>`,
  wallFront:()=>`<rect x="-200" y="200" width="1480" height="1545" fill="#d6efe1"/><rect x="-200" y="1715" width="1480" height="30" fill="#a5d6bb"/>`,
  chair:(x,seat=1310)=>`<g><rect x="${x-130}" y="${seat}" width="260" height="34" rx="12" fill="#8a6f5a"/><rect x="${x-120}" y="${seat+34}" width="22" height="${FL-seat-34}" fill="#6e5746"/><rect x="${x+98}" y="${seat+34}" width="22" height="${FL-seat-34}" fill="#6e5746"/><rect x="${x-150}" y="${seat-330}" width="24" height="364" rx="10" fill="#6e5746"/></g>`,
  couch:(x0,x1,top=1330)=>`<g><rect x="${x0}" y="${top}" width="${x1-x0}" height="${FL-top}" rx="30" fill="#7d6bd6"/><rect x="${x0}" y="${top}" width="${x1-x0}" height="40" rx="20" fill="#9483e6"/></g>`,
  step:(x0,x1,top=1560)=>`<g><rect x="${x0}" y="${top}" width="${x1-x0}" height="${FL-top}" rx="10" fill="#8fbfa6"/><rect x="${x0}" y="${top}" width="${x1-x0}" height="14" rx="7" fill="#a9d4bd"/></g>`,
  bed:(x0,x1,top=1520)=>`<g><rect x="${x0}" y="${top}" width="${x1-x0}" height="${FL-top}" rx="24" fill="#c9c2f2"/><rect x="${x0}" y="${top}" width="${x1-x0}" height="40" rx="20" fill="#e4dfff"/><rect x="${x0+20}" y="${top-50}" width="230" height="70" rx="35" fill="#fff"/></g>`,
};
// ---------- athletic front figure ----------
const ARMS2={
  down:{e:[V(366,950),V(714,950)],h:[V(356,1150),V(724,1150)]},
  hips:{e:[V(286,900),V(794,900)],h:[V(414,1045),V(666,1045)]},
  up:{e:[V(264,640),V(816,640)],h:[V(326,450),V(754,450)]},
  wave:{e:[V(286,900),V(822,640)],h:[V(414,1045),V(800,440)]},
  W:{e:[V(250,780),V(830,780)],h:[V(262,590),V(818,590)]},
  Y:{e:[V(330,520),V(750,520)],h:[V(372,340),V(708,340)]},
  splank:{e:[V(286,900),V(866,800)],h:[V(414,1045),V(900,830)]},
  sidelie:{e:[V(286,900),V(800,560)],h:[V(414,1045),V(640,470)]},
};
function fig(st,t){
  const back=st.view==='back';const br=Math.sin(t*2.4)*4;
  const a0=ARMS2[st.arms0||'hips'],a1=ARMS2[st.arms1||st.arms0||'hips'],ak=st.armK||0;
  const Eh=[lerpV(a0.e[0],a1.e[0],ak),lerpV(a0.e[1],a1.e[1],ak)],Hh=[lerpV(a0.h[0],a1.h[0],ak),lerpV(a0.h[1],a1.h[1],ak)];
  if(st.wave){const wk=st.armK==null?1:st.armK;Hh[1]=add(Hh[1],V(Math.sin(t*9)*40*wk,0));}
  const shL=V(398,735+br*.3),shR=V(682,735+br*.3);
  let g='';
  if(!st.noFloor){g+=`<rect x="-400" y="1745" width="1900" height="400" fill="#bfe5cf"/>`+ell(V(540,1752),250,30,0,'#000','opacity=".13" filter="url(#blur)"');}
  if(!back) g+=`<path d="M606,520 Q712,580 672,790 Q650,830 628,800 Q660,670 590,590Z" fill="#141418" stroke="#2c2c34" stroke-width="3"/>`;
  const hipL=V(476,1105),hipR=V(604,1105);
  const legG=(hip,kx,ax,sgn)=>{const K=V(kx,1405),A=V(ax,1690);let s=limb(hip,K,148,88,SKIN)+limb(K,A,88,52,SKIN)+ell(V(kx-sgn*4,1505),46,100,sgn*3,SKIN,`stroke="${RIM}" stroke-width="3"`)+ell(V(ax+(back?0:-sgn*12),1718),52,26,0,SKIN,`stroke="${RIM}" stroke-width="3"`);
    s+=gloss(V(hip.x-sgn*14,1250),14,76,0,.22)+`<path d="M${kx+sgn*30},${1330} Q${kx+sgn*48},${1375} ${kx+sgn*20},${1395}" fill="none" stroke="#3a3a44" stroke-width="4" opacity=".9"/>`+gloss(V(kx-sgn*14,1490),10,40,0,.2);return s;};
  const abd=st.legAbd||0;
  g+=`<g transform="rotate(${f1(-abd)} 476 1105)">${legG(hipL,484,488,1)}</g>`+legG(hipR,596,592,-1);
  const tor=[V(410,722),V(540,712),V(670,722),V(698,764),V(670,860),V(624,960),V(680,1060),V(694,1140),V(540,1172),V(386,1140),V(400,1060),V(456,960),V(410,860),V(382,764)];
  g+=`<path d="${smoothPath(tor)}" fill="${SKIN}" stroke="${RIM}" stroke-width="3"/>`;
  g+=limb(V(540,650),V(540,735),72,88,SKIN);
  if(back) g+=`<path d="M412,800 Q540,830 668,800 L658,868 Q540,890 422,868Z" fill="${OUT}" stroke="${OUT2}" stroke-width="3"/><path d="M452,742L468,805M628,742L612,805" stroke="${OUT}" stroke-width="16" stroke-linecap="round"/>`;
  else g+=`<path d="M414,790 Q470,758 540,800 Q610,758 666,790 L656,880 Q540,900 424,880Z" fill="${OUT}" stroke="${OUT2}" stroke-width="3"/><path d="M452,742L476,790M628,742L604,790" stroke="${OUT}" stroke-width="16" stroke-linecap="round"/>`;
  if(!back){ // six-pack + obliques
    g+=`<path d="M540,905 L540,1030" stroke="#3a3a44" stroke-width="4"/>`;
    for(let i=0;i<3;i++){const y=930+i*36;g+=`<path d="M498,${y} Q520,${y+6} 536,${y}" fill="none" stroke="#3a3a44" stroke-width="4" stroke-linecap="round"/><path d="M544,${y} Q560,${y+6} 582,${y}" fill="none" stroke="#3a3a44" stroke-width="4" stroke-linecap="round"/>`;}
    g+=`<path d="M470,930 Q482,990 470,1040M610,930 Q598,990 610,1040" fill="none" stroke="#3a3a44" stroke-width="4" opacity=".8"/>`;
    g+=gloss(V(515,948),12,8,0,.25)+gloss(V(565,948),12,8,0,.25);
  } else {g+=`<path d="M540,890 L540,1030" stroke="#3a3a44" stroke-width="4"/><path d="M450,880 Q500,930 470,990M630,880 Q580,930 610,990" fill="none" stroke="#3a3a44" stroke-width="4"/>`;}
  g+=`<path d="M392,1040 Q540,1060 688,1040 L706,1210 Q622,1228 548,1205 L540,1180 L532,1205 Q458,1228 374,1210Z" fill="${OUT}" stroke="${OUT2}" stroke-width="3"/>`;
  if(back){g+=ell(V(484,1122),80,84,0,OUT,`stroke="${OUT2}" stroke-width="3"`)+ell(V(596,1122),80,84,0,OUT,`stroke="${OUT2}" stroke-width="3"`)+gloss(V(466,1090),32,14,-20,.3)+gloss(V(580,1090),32,14,-20,.3);}
  g+=`<text x="540" y="${back?1180:1150}" text-anchor="middle" font-family="Inter" font-weight="900" font-size="34" fill="#fff" letter-spacing="3" opacity=".95">ROUS FIT</text>`;
  g+=gloss(V(466,860),40,12,-15,.18);
  if(st.organs) g+=organs(st.organs,t);
  for(let i=0;i<2;i++){const sh=i?shR:shL;const sgn=i?1:-1;
    g+=limb(sh,Eh[i],78,58,SKIN)+limb(Eh[i],Hh[i],58,44,SKIN)+`<circle cx="${f1(Hh[i].x)}" cy="${f1(Hh[i].y)}" r="31" fill="${SKIN}" stroke="${RIM}" stroke-width="3"/>`;
    const ua=unit(sub(Eh[i],sh));g+=ell(lerpV(sh,Eh[i],.5),58,30,ang(ua),SKIN,`stroke="${RIM}" stroke-width="3"`)+gloss(lerpV(sh,Eh[i],.5),40,8,ang(ua),.22);
    g+=ell(add(sh,V(sgn*8,0)),56,50,0,SKIN,`stroke="${RIM}" stroke-width="3"`)+gloss(add(sh,V(sgn*-6,-18)),26,10,0,.3);}
  g+=`<circle cx="540" cy="570" r="94" fill="${SKIN}" stroke="${RIM}" stroke-width="3"/>`;
  if(back){g+=`<circle cx="540" cy="566" r="92" fill="#141418"/><path d="M518,600 Q540,740 530,800 Q545,820 560,800 Q552,720 562,600Z" fill="#141418" stroke="#2c2c34" stroke-width="3"/>`+gloss(V(512,522),34,12,-25,.3);}
  else{g+=`<path d="M448,560 Q462,474 540,470 Q620,474 632,560 Q594,512 540,510 Q486,512 448,560Z" fill="#141418"/>`+gloss(V(505,495),26,9,-20,.3);
    const em=st.eyes||'normal';g+=eye(V(506,580),em,0,1.15,t)+eye(V(574,580),em,0,1.15,t);
    if(em==='happy'||em==='normal')g+=`<path d="M520,624 Q540,640 560,624" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".9"/>`;
    if(em==='surprised'||em==='strain')g+=`<ellipse cx="540" cy="630" rx="10" ry="13" fill="#fff" opacity=".9"/>`;}
  const hl=st.hl||{},col=st.hlColor||{};
  if(hl.glute){g+=muscle(V(484,1122),72,78,0,hl.glute,t,col.glute||'red')+muscle(V(596,1122),72,78,0,hl.glute,t,col.glute||'red');}
  if(hl.gmed){g+=muscle(V(400,1080),40,60,0,hl.gmed,t,col.gmed||'red');}
  if(hl.back) g+=muscle(V(540,975),95,42,0,hl.back,t,col.back||'red');
  if(hl.core) g+=muscle(V(540,968),72,92,0,hl.core,t,col.core||'red');
  if(hl.oblique) g+=muscle(V(452,980),36,80,0,hl.oblique,t,col.oblique||'red')+muscle(V(628,980),36,80,0,hl.oblique,t,col.oblique||'red');
  if(hl.chest) g+=muscle(V(490,820),60,40,0,hl.chest,t,col.chest||'red')+muscle(V(590,820),60,40,0,hl.chest,t,col.chest||'red');
  if(hl.upback) g+=muscle(V(540,820),120,50,0,hl.upback,t,col.upback||'red');
  if(hl.shoulder) g+=muscle(shL,52,48,0,hl.shoulder,t,col.shoulder||'red')+muscle(shR,52,48,0,hl.shoulder,t,col.shoulder||'red');
  if(st.spark) g+=sparks(st.spark.at==='back'?V(540,975):V(540,1120),130,t,st.spark.k);
  return {svg:g};
}
// ---------- UI helpers (filled per frame) ----------
let UI;
function uiReset(){UI={pills:[],cards:[],ov:[],ovs:'',world:''};}
const vis=(t,a,b=1e9,fade=.18)=>{if(t<a||t>b+fade)return 0;return Math.min(clamp((t-a)/fade,0,1),clamp((b+fade-t)/fade,0,1));};
const popk=(t,a)=>backOut((t-a)/.3);
function pill(t,txt,cls,x,y,a,b){const v=vis(t,a,b);if(v>0)UI.pills.push({txt,cls,x,y,k:popk(t,a),o:v});}
function card(t,emo,x,y,a,b,ck=false){const v=vis(t,a,b);if(v>0)UI.cards.push({emo,x,y,k:popk(t,a),o:v,ck});}
// exercise title banner
function exTitle(t,num,name,a,b,col='#7c5cff'){const v=vis(t,a,b);if(!v)return;const k=popk(t,a);
  UI.ov.push(`<div style="position:absolute;left:50%;top:455px;transform:translateX(-50%) scale(${f1(k)});opacity:${f1(v)};display:flex;align-items:center;gap:18px;background:#fff;border-radius:999px;padding:12px 36px 12px 12px;box-shadow:0 8px 0 rgba(0,0,0,.15);white-space:nowrap"><div style="width:76px;height:76px;border-radius:50%;background:${col};color:#fff;font:900 46px Inter;display:flex;align-items:center;justify-content:center">${num}</div><div style="font:900 46px Inter;color:#17171c;letter-spacing:.5px">${name}</div></div>`);}
// counter (reps or seconds)
function counter(t,label,val,max,a,b,x=850,y=720,done=false){const v=vis(t,a,b);if(!v)return;const k=popk(t,a);const fr=clamp(val/max,0,1);const col=done||fr>=1?'#22c55e':'#7c5cff';
  const R=96,C=2*Math.PI*R;
  UI.ovs+=`<g opacity="${f1(v)}" transform="translate(${x} ${y}) scale(${f1(k)})"><circle r="118" fill="#fff"/><circle r="${R}" fill="none" stroke="#e6ece9" stroke-width="20"/><circle r="${R}" fill="none" stroke="${col}" stroke-width="20" stroke-linecap="round" stroke-dasharray="${f1(C*fr)} ${f1(C)}" transform="rotate(-90)"/>
   <text y="18" text-anchor="middle" font-family="Inter" font-weight="900" font-size="${String(label).length>4?54:70}" fill="#17171c">${label}</text><text y="64" text-anchor="middle" font-family="Inter" font-weight="800" font-size="24" fill="#6b7772">${'×'+max===label?'':''}</text></g>`;}
function fmtS(s){s=Math.max(0,Math.ceil(s-1e-6));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
function followCard(t,a,b,tap){const k=popk(t,a),o=vis(t,a,b);if(!o)return;const followed=t>=tap+0.15;const press=t>=tap&&t<tap+0.15?0.9:1;
  UI.ov.push(`<div style="position:absolute;left:190px;top:1420px;width:700px;height:170px;border-radius:40px;background:#fff;box-shadow:0 10px 0 rgba(0,0,0,.15);opacity:${o};transform:scale(${f1(k)});display:flex;align-items:center;gap:26px;padding:0 30px;box-sizing:border-box">
    <div style="width:110px;height:110px;border-radius:50%;background:#cfeedd;border:5px solid #7c5cff;display:flex;align-items:center;justify-content:center;font:900 40px Inter;color:#17171c">RF</div>
    <div style="flex:1"><div style="font:900 40px Inter;color:#17171c">Rous Fit</div><div style="font:700 30px Inter;color:#6b7772">${HANDLE}</div></div>
    <div style="padding:20px 30px;border-radius:24px;background:${followed?'#22c55e':'#7c5cff'};color:#fff;font:900 34px Inter;transform:scale(${press})">${followed?'✓ FOLLOWING':'+ FOLLOW'}</div></div>`);
  if(t>=tap-0.5&&t<tap+0.8){const hk=clamp((t-(tap-0.5))/0.5,0,1);UI.ov.push(`<div style="position:absolute;left:${f1(lerp(900,770,ease(hk)))}px;top:${f1(lerp(1640,1530,ease(hk)))}px;font-size:90px;font-family:'Noto Color Emoji';opacity:${f1(vis(t,tap-0.5,tap+0.6))}">👆</div>`);}}
function commentBox(t,txt,a,b,y=1600){const o=vis(t,a,b);if(!o)return;const k=popk(t,a);const n=Math.floor(clamp((t-a-0.1)/1.0,0,1)*txt.length);const cur=(t*2%1)<.5?'|':'';
  UI.ov.push(`<div style="position:absolute;left:90px;top:${y}px;width:900px;padding:28px 34px;box-sizing:border-box;border-radius:36px;background:#fff;box-shadow:0 10px 0 rgba(0,0,0,.15);opacity:${o};transform:scale(${f1(k)});display:flex;align-items:center;gap:22px;font:800 42px Inter;color:#17171c"><span style="font-family:'Noto Color Emoji';font-size:56px">💬</span><span>${txt.slice(0,n)}${cur}</span><span style="margin-left:auto;padding:12px 24px;border-radius:20px;background:#7c5cff;color:#fff;font:900 30px Inter">POST</span></div>`);}
function confetti(t,a){let c='';for(let i=0;i<34;i++){const ph=(t-a)*0.9+((i*0.618)%1);const x=(i*137)%1080;const y=-50+((ph*900)%1900);const cols=['#7c5cff','#ff3b4a','#22c55e','#ffd23f','#3d6bff'];c+=`<rect x="${x}" y="${f1(y)}" width="18" height="28" rx="4" fill="${cols[i%5]}" transform="rotate(${f1(ph*360+i*20)} ${x} ${f1(y)})"/>`;}UI.ovs+=c;}
// render frame common
function render(t,sh,cam,worldSvg){
  const pk=clamp((t-sh.t0)/0.22,0,1);const punch=sh.i>0?1+0.07*(1-ease(pk)):1;const z=cam.z*punch;
  const tr=`translate(540 1100) scale(${f1(z*1000)/1000}) translate(${f1(-cam.cx)} ${f1(-cam.cy)})`;
  document.getElementById('scene').innerHTML=DEFS+`<rect width="1080" height="1920" fill="url(#bg)"/>`+`<g transform="${tr}">${worldSvg}${UI.world}</g>`;
  let tsvg=`<text x="1040" y="1870" text-anchor="end" font-family="Inter" font-weight="800" font-size="36" fill="#fff" stroke="#3a6b52" stroke-width="5" paint-order="stroke fill" opacity=".75">${HANDLE}</text>`;
  tsvg+=`<rect x="0" y="1908" width="1080" height="12" fill="#000" opacity=".08"/><rect x="0" y="1908" width="${f1(1080*t/DUR)}" height="12" fill="#7c5cff"/>`;
  document.getElementById('ovs').innerHTML=DEFS+UI.ovs+tsvg;
  let h='<div class="band"></div>';
  for(const p of UI.pills) h+=`<div class="pill ${p.cls}" style="left:${p.x}px;top:${p.y}px;opacity:${f1(p.o)};transform:translate(-50%,-50%) scale(${f1(p.k)})">${p.txt}</div>`;
  for(const c of UI.cards) h+=`<div class="card" style="left:${c.x}px;top:${c.y}px;opacity:${f1(c.o)};transform:scale(${f1(c.k)})">${c.emo}${c.ck==='x'?'<div class="ck" style="background:#ff3b4a">✗</div>':c.ck?'<div class="ck">✓</div>':''}</div>`;
  h+=UI.ov.join('');h+=captions(t);
  document.getElementById('ov').innerHTML=h;
}
function shotAtF(SHOTS,t){let i=0;for(let k=0;k<SHOTS.length;k++)if(t>=SHOTS[k][0])i=k;return {i,name:SHOTS[i][1],t0:SHOTS[i][0],t1:i+1<SHOTS.length?SHOTS[i+1][0]:DUR};}
const HANDLE='@rousfit';
