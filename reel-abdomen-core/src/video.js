const SUP={hip:V(600,1640),lean:-90};
const PZ={
 STAND:{hip:V(520,1098),lean:2,nA:V(548,1674),fA:V(500,1674),nArm:{a:6,f:12},fArm:{a:-4,f:4}},
 CRD:{...SUP,nA:V(860,1674),fA:V(840,1674),nArm:{a:150,f:120},fArm:{a:150,f:120}},
 CRU:{hip:V(600,1640),lean:-52,neck:22,nA:V(860,1674),fA:V(840,1674),nArm:{a:110,f:100},fArm:{a:110,f:100}},
 DB0:{...SUP,nLeg:{th:180,sh:90},fLeg:{th:180,sh:90},nArm:{a:180,f:180},fArm:{a:180,f:180}},
 DBA:{...SUP,nLeg:{th:180,sh:90},fLeg:{th:95,sh:92},nArm:{a:-95,f:-93},fArm:{a:180,f:180}},
 DBB:{...SUP,nLeg:{th:95,sh:92},fLeg:{th:180,sh:90},nArm:{a:180,f:180},fArm:{a:-95,f:-93}},
 PLANK:{hip:V(330,1495),lean:93.8,nLeg:{th:-73,sh:-73},fLeg:{th:-73,sh:-73},nArm:{a:0,f:90},fArm:{a:0,f:90}},
 SAG:{hip:V(330,1585),lean:78,bow:30,neck:-10,nLeg:{th:-82,sh:-82},fLeg:{th:-82,sh:-82},nArm:{a:0,f:90},fArm:{a:0,f:90}},
};
const T={wont:S(3),here:S(7),first:S(11),cant:S(15),but:S(21),strong:S(23),protects:S(29),tryT:S(32),one:S(34),lie:S(37),arms:S(41),lower:S(45),key:S(52),lowerB:S(55),ten:S(61),two:S(64),elbows:S(66),squeeze:S(70),pull:S(74),dont:S(79),thirty:S(84),follow:S(86),rous:S(87),three:S(95),stack:S(98),lift:S(102),thisT:S(106),twenty:S(113),rounds:S(117),times:S(119),add:S(123),walks:S(125),food:S(127),thats:S(130),comment:S(136)};
const SHOTS=[[0,'hook'],[T.first,'truth'],[T.one,'ex1'],[T.two,'ex2'],[T.follow,'follow'],[T.three,'ex3'],[T.rounds,'outro'],[T.comment,'cta']];
function frame(t){
  uiReset();hlId=0;const sh=shotAtF(SHOTS,t);let w='',cam={z:1.05,cx:540,cy:1080};
  switch(sh.name){
    case 'hook':{
      const stop=t>=T.here-0.2;let p=stop?seqPose([[0,PZ.CRD],[T.here-0.2,PZ.DB0,0.7]],t):osc(PZ.CRD,PZ.CRU,t,0,0.55);
      const b=body(p,{eyes:stop?'happy':'strain',hl:{core:stop?0:1}},t);
      w=PROP.floor()+PROP.mat()+PROP.shadow(540)+b.svg;cam={z:lerp(1.3,1.08,ramp(t,0,1.2)),cx:520,cy:lerp(1520,1420,ramp(t,0,1.2))};
      const n=Math.min(1000,Math.round(Math.pow(clamp(t/2.6,0,1),2.2)*1000));
      if(t<T.here) counter(t,'×'+n,n,1000,0.05,T.here-0.1,860,720);
      pill(t,'1,000 CRUNCHES? 😩','dark',540,520,0.05,T.wont-0.1);
      pill(t,"WON'T FLATTEN YOUR STOMACH",'red',540,520,T.wont,T.here-0.1);
      if(t>=S(4)&&t<T.here) UI.ovs+=xMark(V(860,720),popk(t,S(4)),70);
      pill(t,'HERE\'S WHAT WORKS ✓','green',540,520,T.here,sh.t1);
      break;}
    case 'truth':{
      const good=t>=T.but;
      w=PROP.floor()+fig({view:'front',arms0:'hips',eyes:good?'happy':'normal',hl:{core:1},hlColor:{core:good?'green':'gray'}},t).svg;cam={z:1.0,cx:540,cy:1060};
      pill(t,'THE TRUTH 👇','dark',540,520,sh.t0+0.05,T.cant-0.1);
      if(t>=T.cant&&!good){const k=popk(t,T.cant);UI.world+=`<g transform="translate(540 968) scale(${f1(k)})"><circle r="120" fill="none" stroke="#ff3b4a" stroke-width="10" stroke-dasharray="20 14"/><line x1="-150" y1="0" x2="150" y2="0" stroke="#ff3b4a" stroke-width="6"/><line x1="0" y1="-150" x2="0" y2="150" stroke="#ff3b4a" stroke-width="6"/></g>`+xMark(V(700,860),popk(t,S(19)),50);}
      pill(t,'NO "SPOT" FAT BURNING','red',540,1600,T.cant,T.but-0.1);
      pill(t,'STRONG CORE = STANDS TALL','green',540,1600,T.strong,T.protects-0.1);
      pill(t,'+ PROTECTS YOUR BACK 🛡️','green',540,1600,T.protects,sh.t1);
      if(good) UI.ovs+=arrow(V(900,1150),V(900,800),'#22c55e',ramp(t,T.strong,.5),20);
      break;}
    case 'ex1':{
      let p=seqPose([[sh.t0,PZ.CRD,0.01],[T.arms,PZ.DB0,0.6]],t);
      if(t>=T.lower){const per=3.4;const ph=((t-T.lower)/per)%1;const tgt=ph<0.5?PZ.DBA:PZ.DBB;const k=Math.sin(Math.PI*((ph*2)%1));p=pLerp(norm(PZ.DB0),norm(tgt),k);}
      const keyOn=t>=T.key;
      const b=body(p,{eyes:t>=T.lower?'strain':'normal',hl:{core:t>=T.lower?1:0,back:keyOn?1:0},hlColor:{back:'green'}},t);
      w=PROP.floor()+PROP.mat()+PROP.shadow(540)+b.svg;cam={z:1.08,cx:520,cy:1400};
      if(keyOn&&t<T.ten) UI.world+=check(V(420,1780),popk(t,T.lowerB),44);
      exTitle(t,1,'DEAD BUG',sh.t0+0.05,sh.t1);
      pill(t,'LIE ON YOUR BACK','blue',540,1840,T.lie,T.arms-0.1);
      pill(t,'ARMS UP · KNEES BENT','blue',540,1840,T.arms,T.lower-0.1);
      pill(t,'OPPOSITE ARM + LEG ↓','violet',540,1840,T.lower,T.key-0.1);
      pill(t,'KEY: LOWER BACK ON THE FLOOR','green',540,1840,T.key,sh.t1);
      if(t>=T.lower){const n=Math.round(10*clamp((t-T.lower)/(sh.t1-0.4-T.lower),0,1));counter(t,'×'+n,n,10,T.ten-0.1,sh.t1,880,720);if(t>=T.ten)pill(t,'EACH SIDE','violet',880,880,T.ten,sh.t1);}
      break;}
    case 'ex2':{
      let p=seqPose([[sh.t0,PZ.DB0,0.01],[sh.t0+0.05,PZ.PLANK,0.8]],t);
      const sag=t>=T.dont&&t<T.thirty;
      if(sag){const k=Math.sin(Math.PI*clamp((t-T.dont)/(T.thirty-T.dont),0,1));p=pLerp(norm(PZ.PLANK),norm(PZ.SAG),clamp(k*1.6,0,1));}
      const b=body(p,{eyes:'strain',hl:{core:t>=T.elbows?1:0,glute:t>=T.squeeze?1:0,back:sag?1:0}},t);
      w=PROP.floor()+PROP.mat(-260,980)+PROP.shadow(360,480)+b.svg;cam={z:0.86,cx:350,cy:1330};
      if(sag) UI.world+=xMark(add(b.pts.hip,V(0,-170)),popk(t,T.dont+0.2),54);
      if(t>=T.pull&&t<T.dont){UI.world+=arrow(add(b.pts.R(V(44,-150)),V(0,140)),b.pts.R(V(70,-150)),'#22c55e',ramp(t,T.pull,.4),16);}
      exTitle(t,2,'PLANK',sh.t0+0.05,sh.t1);
      pill(t,'ELBOWS UNDER SHOULDERS','blue',540,1840,T.elbows,T.squeeze-0.1);
      pill(t,'SQUEEZE YOUR GLUTES','violet',540,1840,T.squeeze,T.pull-0.1);
      pill(t,'BELLY BUTTON IN ↑','green',540,1840,T.pull,T.dont-0.1);
      pill(t,"DON'T LET HIPS SAG",'red',540,1840,T.dont,T.thirty-0.1);
      if(t>=T.thirty-0.1){const v=lerp(30,0,clamp((t-T.thirty)/(sh.t1-0.3-T.thirty),0,1));counter(t,fmtS(v),30-v,30,T.thirty-0.1,sh.t1,880,720);}
      break;}
    case 'follow':{
      w=PROP.floor()+fig({view:'front',arms0:'hips',arms1:'wave',armK:ramp(t,sh.t0,.4),wave:true,eyes:'happy'},t).svg;cam={z:0.98,cx:540,cy:1060};
      followCard(t,sh.t0+0.05,sh.t1,T.rous+0.1);
      pill(t,"DON'T LOSE THIS ROUTINE 💾",'violet',540,520,S(91),sh.t1);
      break;}
    case 'ex3':{
      const lift=t>=T.lift?ramp(t,T.lift,.6):0;const pulse=t>=T.thisT?Math.sin((t-T.thisT)*3)*2:0;
      const ang=lerp(62,74,lift)+pulse;
      const F=fig({view:'front',arms0:'splank',noFloor:true,eyes:t>=T.lift?'strain':'normal',hl:{oblique:t>=T.thisT?1:0}},t).svg;
      w=PROP.floor()+PROP.mat(60,1000)+`<g transform="translate(230 1712) rotate(${f1(ang)}) translate(-540 -1718)">${F}</g>`;
      cam={z:0.76,cx:700,cy:1320};
      exTitle(t,3,'SIDE PLANK',sh.t0+0.05,sh.t1);
      pill(t,'STACK YOUR FEET','blue',540,1840,T.stack,T.lift-0.1);
      pill(t,'HIPS HIGH ↑','green',540,1840,T.lift,T.thisT-0.1);
      if(t>=T.lift&&t<T.thisT) UI.ovs+=arrow(V(560,1300),V(560,1120),'#22c55e',ramp(t,T.lift,.4),20);
      pill(t,'TRAINS THE SIDES OF YOUR WAIST','red',540,1840,T.thisT,T.twenty-0.1);
      if(t>=T.twenty-0.1){const v=lerp(20,0,clamp((t-T.twenty)/(sh.t1-0.3-T.twenty),0,1));counter(t,fmtS(v),20-v,20,T.twenty-0.1,sh.t1,880,720);pill(t,'EACH SIDE','violet',540,1840,T.twenty,sh.t1);}
      break;}
    case 'outro':{
      const ch=t>=T.thats;
      w=PROP.floor()+fig({view:'front',arms0:'hips',arms1:'up',armK:ramp(t,T.thats,.5),eyes:'happy',hl:{core:ch?1:0},hlColor:{core:'green'}},t).svg;cam={z:0.98,cx:540,cy:1060};
      pill(t,'3 ROUNDS','violet',540,1600,sh.t0,T.times-0.1);
      pill(t,'3× A WEEK','violet',540,1600,T.times,T.add-0.1);
      card(t,'🚶‍♀️',90,520,T.walks,sh.t1);card(t,'🥗',800,520,T.food,sh.t1);
      pill(t,'+ DAILY WALKS + GOOD FOOD','green',540,1600,T.add,T.thats-0.1);
      pill(t,'THAT\'S WHEN IT CHANGES ✓','green',540,1600,T.thats,sh.t1);
      if(ch)confetti(t,T.thats);
      break;}
    case 'cta':{
      w=PROP.floor()+fig({view:'front',arms0:'hips',arms1:'wave',armK:ramp(t,sh.t0,.4),wave:true,eyes:'happy'},t).svg;cam={z:0.98,cx:540,cy:1060};
      commentBox(t,'CORE 🔥 ____ made me shake',sh.t0+0.1,DUR,1440);
      pill(t,'COMMENT 👇','red',540,1660,S(138),DUR);
      break;}
  }
  render(t,sh,cam,w);
}
