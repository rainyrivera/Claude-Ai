const BY=1520; // bed surface
const SUPB={hip:V(600,BY-60),lean:-90};
const PZ={
 FLAT:{...SUPB,nLeg:{th:90,sh:90},fLeg:{th:90,sh:90},nArm:{a:92,f:92},fArm:{a:92,f:92}},
 BELLY:{...SUPB,nLeg:{th:90,sh:90},fLeg:{th:90,sh:90},nHand:V(470,1395),fHand:V(450,1395),nEs:1,fEs:1},
 KTC:{...SUPB,neck:15,nLeg:{th:200,sh:105},fLeg:{th:200,sh:105},nHand:V(620,1185),fHand:V(610,1190)},
 WALL:{hip:V(800,BY-60),lean:-90,nLeg:{th:180,sh:180},fLeg:{th:180,sh:180},nArm:{a:95,f:95},fArm:{a:95,f:95}},
};
const T={put:S(3),tryT:S(8),one:S(15),hug:S(19),rock:S(23),thisR:S(29),thirty:S(38),two:S(40),arms:S(43),drop:S(45),keep:S(54),thirty2:S(60),follow:S(64),rous:S(65),three:S(74),lie:S(79),just:S(90),oneMin:S(98),four:S(100),breathe:S(103),long:S(112),ten:S(122),gentle:S(124),comment:S(139)};
const SHOTS=[[0,'hook'],[T.one,'ex1'],[T.two,'ex2'],[T.follow,'follow'],[T.three,'ex3'],[T.four,'ex4'],[T.gentle,'outro'],[T.comment,'cta']];
const NIGHT=`<rect x="-3000" y="-3000" width="7000" height="7000" fill="#e6e0ff"/><rect x="-3000" y="${FL}" width="7000" height="2000" fill="#cfc6f5"/>`;
function moon(t){UI.ovs+=`<g transform="translate(120 620)"><circle r="54" fill="#ffe680"/><circle cx="22" cy="-14" r="46" fill="#e6e0ff"/></g>`;for(let i=0;i<5;i++){const x=[230,330,180,980,880][i],y=[560,640,720,1250,1350][i];UI.ovs+=`<text x="${x}" y="${y}" font-size="34" fill="#b3a6f2" opacity="${f1(0.5+0.5*Math.sin(t*2+i))}">✦</text>`;}}
function zzz(t,x,y){for(let i=0;i<3;i++){const ph=((t*0.6)+i/3)%1;UI.ovs+=`<text x="${f1(x+ph*110)}" y="${f1(y-ph*240)}" font-family="Inter" font-weight="900" font-size="${f1(60*(0.6+ph*0.8))}" fill="#7c5cff" opacity="${f1(1-ph)}">Z</text>`;}}
function frame(t){
  uiReset();hlId=0;const sh=shotAtF(SHOTS,t);let w='',cam={z:1.05,cx:540,cy:1080};
  switch(sh.name){
    case 'hook':{
      w=NIGHT+PROP.bed(80,1000,BY)+body(PZ.FLAT,{eyes:'surprised'},t).svg;cam={z:lerp(1.3,1.05,ramp(t,0,1.4)),cx:440,cy:lerp(1420,1330,ramp(t,0,1.4))};
      moon(t);
      pill(t,"CAN'T FALL ASLEEP? 😩",'dark',540,520,0.05,T.put-0.1);
      card(t,'📱',800,600,T.put,sh.t1,'x');pill(t,'PHONE AWAY 📵','red',540,520,T.put,T.tryT-0.1);
      pill(t,'5-MIN BEDTIME ROUTINE 🌙','violet',540,520,T.tryT,sh.t1);
      break;}
    case 'ex1':{
      let p=seqPose([[sh.t0,PZ.FLAT,0.01],[sh.t0+0.05,PZ.KTC,0.9]],t);
      if(t>=T.rock){const r=Math.sin((t-T.rock)*2.2)*7;p=Object.assign({},p,{lean:p.lean+r});}
      w=NIGHT+PROP.bed(80,1000,BY)+body(p,{eyes:t>=T.rock?'sleep':'normal',hl:{back:t>=T.thisR?1:0},hlColor:{back:'green'}},t).svg;cam={z:1.1,cx:520,cy:1330};
      moon(t);
      exTitle(t,1,'KNEES TO CHEST',sh.t0+0.05,sh.t1);
      pill(t,'HUG YOUR KNEES 🤗','blue',540,1840,T.hug,T.rock-0.1);
      pill(t,'ROCK SIDE TO SIDE','violet',540,1840,T.rock,T.thisR-0.1);
      pill(t,'RELAXES YOUR LOWER BACK','green',540,1840,T.thisR,sh.t1);
      if(t>=T.thirty-0.1){const v=lerp(30,0,clamp((t-T.thirty)/(sh.t1-0.3-T.thirty),0,1));counter(t,fmtS(v),30-v,30,T.thirty-0.1,sh.t1,880,760);}
      break;}
    case 'ex2':{
      let rot=0;if(t>=T.drop){const ph=(t-T.drop)/4.2;rot=38*Math.sin(2*Math.PI*ph);}
      const F=fig({view:'front',arms0:t>=T.arms?'T':'down',noFloor:true,legRot:rot,eyes:'sleep',hl:{shoulder:t>=T.keep?1:0},hlColor:{shoulder:'green'}},t).svg;
      w=NIGHT+`<rect x="-60" y="${600}" width="1200" height="980" rx="40" fill="#c9c2f2"/><rect x="-30" y="630" width="1140" height="920" rx="30" fill="#e4dfff"/>`+`<g transform="translate(560 1090) rotate(-90) translate(-540 -1110)">${F}</g>`;
      cam={z:0.78,cx:560,cy:1090};
      exTitle(t,2,'LYING TWIST',sh.t0+0.05,sh.t1);
      pill(t,'ARMS OUT','blue',540,1840,T.arms,T.drop-0.1);
      pill(t,'KNEES TO ONE SIDE, THEN THE OTHER','violet',540,1840,T.drop,T.keep-0.1);
      pill(t,'BOTH SHOULDERS ON THE BED ✓','green',540,1840,T.keep,T.thirty2-0.1);
      if(t>=T.thirty2-0.1){const v=lerp(30,0,clamp((t-T.thirty2)/(sh.t1-0.3-T.thirty2),0,1));counter(t,fmtS(v),30-v,30,T.thirty2-0.1,sh.t1,880,760);pill(t,'EACH SIDE','violet',540,1840,T.thirty2,sh.t1);}
      break;}
    case 'follow':{
      w=NIGHT+fig({view:'front',arms0:'hips',arms1:'wave',armK:ramp(t,sh.t0,.4),wave:true,eyes:'happy',noFloor:true},t).svg;cam={z:0.98,cx:540,cy:1060};
      moon(t);followCard(t,sh.t0+0.05,sh.t1,T.rous+0.1);
      pill(t,'ROUTINES FOR REAL LIFE 💜','violet',540,520,S(68),sh.t1);
      break;}
    case 'ex3':{
      const p=seqPose([[sh.t0,PZ.FLAT,0.01],[sh.t0+0.05,{...PZ.FLAT,hip:V(800,BY-60)},0.01],[sh.t0+0.1,PZ.WALL,1.0]],t);
      w=NIGHT+PROP.bed(-200,1000,BY)+`<rect x="905" y="-400" width="400" height="${BY+400}" fill="#bdb2ef"/><rect x="905" y="-400" width="14" height="${BY+400}" fill="#a99ce8"/>`+body(p,{eyes:t>=T.just?'sleep':'normal'},t).svg;
      cam={z:0.92,cx:640,cy:1180};
      exTitle(t,3,'LEGS UP THE WALL',sh.t0+0.05,sh.t1);
      pill(t,'LIE ON YOUR BACK','blue',540,1840,T.lie,S(84)-0.1);
      pill(t,'REST YOUR LEGS ON THE WALL','violet',540,1840,S(84),T.just-0.1);
      pill(t,'STAY STILL & RELAX 😌','green',540,1840,T.just,sh.t1);
      if(t>=T.just) zzz(t,560,1000);
      if(t>=T.oneMin-0.1){const v=lerp(60,0,clamp((t-T.oneMin)/(sh.t1-0.3-T.oneMin),0,1));counter(t,fmtS(v),60-v,60,T.oneMin-0.1,sh.t1,250,760);}
      break;}
    case 'ex4':{
      const cyc=10;const ph=t>=T.breathe?((t-T.breathe)%cyc):0;const inn=ph<4;const k=t<T.breathe?0:(inn?ease(ph/4):1-ease((ph-4)/6));
      const p=Object.assign({},norm(PZ.BELLY),{bow:k*14});
      w=NIGHT+PROP.bed(80,1000,BY)+body(p,{eyes:'sleep'},t).svg;cam={z:1.0,cx:470,cy:1300};
      moon(t);
      exTitle(t,4,'SLOW BREATHING',sh.t0+0.05,sh.t1);
      if(t>=T.breathe){const r=110+90*k;const sec=inn?Math.min(4,Math.floor(ph)+1):Math.min(6,Math.floor(ph-4)+1);
        UI.ovs+=`<g transform="translate(540 820)"><circle r="${f1(r+30)}" fill="#7c5cff" opacity=".12"/><circle r="${f1(r)}" fill="#7c5cff" opacity=".85"/><text y="-6" text-anchor="middle" font-family="Inter" font-weight="900" font-size="54" fill="#fff">${inn?'IN':'OUT'}</text><text y="56" text-anchor="middle" font-family="Inter" font-weight="900" font-size="60" fill="#fff">${sec}</text></g>`;}
      pill(t,'IN 4 SECONDS · OUT 6','blue',540,1840,T.breathe,T.long-0.1);
      pill(t,'LONG EXHALES → REST MODE','green',540,1840,T.long,T.ten-0.1);
      pill(t,'10 BREATHS','violet',540,1840,T.ten,sh.t1);
      break;}
    case 'outro':{
      w=NIGHT+PROP.bed(80,1000,BY)+body(PZ.FLAT,{eyes:'sleep'},t).svg;cam={z:1.05,cx:440,cy:1330};
      moon(t);zzz(t,300,1180);
      pill(t,'STRETCH + SLOW BREATHING','violet',540,520,sh.t0+0.05,S(131)-0.1);
      pill(t,'CAN HELP YOU FALL ASLEEP EASIER 😴','green',540,520,S(131),sh.t1);
      break;}
    case 'cta':{
      w=NIGHT+fig({view:'front',arms0:'hips',arms1:'wave',armK:ramp(t,sh.t0,.4),wave:true,eyes:'happy',noFloor:true},t).svg;cam={z:0.98,cx:540,cy:1060};
      moon(t);commentBox(t,'I fall asleep at __:__ 🌙',sh.t0+0.1,DUR,1440);
      pill(t,'COMMENT 👇','red',540,1660,S(141),DUR);
      break;}
  }
  render(t,sh,cam,w);
}
