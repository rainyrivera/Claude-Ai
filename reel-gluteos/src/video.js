const PZ={
 READY:{hip:V(470,1098),lean:4,nA:V(560,1674),fA:V(520,1674),nArm:{a:80,f:88},fArm:{a:76,f:84}},
 DEEP:{hip:V(400,1440),lean:38,nA:V(560,1674),fA:V(520,1674),nArm:{a:86,f:94},fArm:{a:82,f:90}},
 HTD:{hip:V(560,1580),lean:-46,neck:30,nA:V(860,1674),fA:V(840,1674),nArm:{a:150,f:60},fArm:{a:150,f:60}},
 HTU:{hip:V(672,1330),lean:-90,neck:20,nA:V(860,1674),fA:V(840,1674),nArm:{a:160,f:70},fArm:{a:160,f:70}},
 STAND:{hip:V(480,1098),lean:3,nA:V(500,1674),fA:V(520,1674),nArm:{a:-25,f:20},fArm:{a:-25,f:20}},
 LUNGE:{hip:V(480,1380),lean:8,nA:V(200,1674),fA:V(640,1674),nArm:{a:-30,f:20},fArm:{a:-30,f:20}},
 LUNGEF:{hip:V(470,1380),lean:24,nA:V(200,1674),fA:V(640,1674),nArm:{a:-10,f:30},fArm:{a:-10,f:30}},
};
const T={wont:S(2),three:S(9),squats:S(12),one:S(17),upper:S(23),drive:S(30),squeeze:S(35),thisB:S(42),fifteen:S(54),two:S(56),step:S(59),drop:S(62),lean:S(69),ten:S(81),follow:S(84),rous:S(85),three3:S(94),lie:S(98),toes:S(102),lift:S(106),trains:S(108),keeps:S(118),fif2:S(125),rounds:S(128),comment:S(134)};
const SHOTS=[[0,'hook'],[T.three-0.6,'anat'],[T.one,'ex1'],[T.two,'ex2'],[T.follow,'follow'],[T.three3,'ex3'],[T.rounds,'outro'],[T.comment,'cta']];
function frame(t){
  uiReset();hlId=0;const sh=shotAtF(SHOTS,t);let w='',cam={z:1.05,cx:540,cy:1080};
  switch(sh.name){
    case 'hook':{
      const p=osc(PZ.READY,PZ.DEEP,t,-0.2,1.3);
      w=PROP.floor()+PROP.shadow(520)+body(p,{eyes:'strain',hl:{glute:1,quad:1}},t).svg;cam={z:lerp(1.2,1.02,ramp(t,0,1.2)),cx:500,cy:lerp(1220,1100,ramp(t,0,1.2))};
      pill(t,'ONLY SQUATS? 🍑','dark',540,520,0.05,T.wont-0.1);
      pill(t,"WON'T BUILD YOUR GLUTES",'red',540,520,T.wont,sh.t1);
      if(t>=S(3)) UI.ovs+=xMark(V(860,760),popk(t,S(3)),64);
      break;}
    case 'anat':{
      const one=t>=T.squats;
      w=PROP.floor()+fig({view:'back',arms0:'hips',hl:{glute:1,gmed:1,gmedR:1},hlColor:{glute:'red',gmed:one?'gray':'red',gmedR:one?'gray':'red'}},t).svg;
      cam={z:lerp(1.2,1.45,ramp(t,sh.t0,2)),cx:540,cy:1060};
      pill(t,'3 GLUTE MUSCLES','dark',540,520,sh.t0+0.05,T.squats-0.1);
      pill(t,'MAXIMUS','red',540,1500,S(9)+0.1,sh.t1);
      pill(t,'MEDIUS','violet',230,1240,S(10),sh.t1);
      pill(t,'+ MINIMUS','violet',850,1240,S(10)+0.3,sh.t1);
      pill(t,'SQUATS → MOSTLY 1','red',540,520,T.squats,sh.t1);
      break;}
    case 'ex1':{
      let p=seqPose([[sh.t0,PZ.HTD,0.01]],t);if(t>=T.drive)p=osc(PZ.HTD,PZ.HTU,t,T.drive,2.2);
      const b=body(p,{eyes:t>=T.drive?'strain':'normal',hl:{glute:t>=T.drive?1:0}},t);
      w=PROP.floor()+PROP.couch(-80,330,1330)+PROP.shadow(600)+b.svg;cam={z:1.0,cx:500,cy:1300};
      exTitle(t,1,'HIP THRUST',sh.t0+0.05,sh.t1);
      card(t,'🛋️',800,600,S(20),T.drive-0.1);
      pill(t,'UPPER BACK ON THE EDGE','blue',540,1840,T.upper,S(28)-0.1);
      pill(t,'FEET FLAT','blue',540,1840,S(28),T.drive-0.1);
      pill(t,'DRIVE YOUR HIPS UP ↑','green',540,1840,T.drive,T.squeeze-0.1);
      pill(t,'SQUEEZE 1 SECOND AT THE TOP','violet',540,1840,T.squeeze,T.thisB-0.1);
      pill(t,'TOP MOVE FOR YOUR BIGGEST GLUTE','red',540,1840,T.thisB,sh.t1);
      if(t>=T.drive&&t<T.squeeze) UI.world+=arrow(V(700,1640),V(700,1380),'#22c55e',ramp(t,T.drive,.4),18);
      if(t>=T.drive){const n=Math.round(15*clamp((t-T.drive)/(sh.t1-0.4-T.drive),0,1));counter(t,'×'+n,n,15,T.fifteen-0.1,sh.t1,880,720);}
      break;}
    case 'ex2':{
      const L=t>=T.lean?PZ.LUNGEF:PZ.LUNGE;
      let p=seqPose([[sh.t0,PZ.STAND,0.01]],t);if(t>=T.step)p=osc(PZ.STAND,L,t,T.step,2.4);
      const b=body(p,{eyes:t>=T.step?'strain':'normal',hl:{glute:t>=T.step?1:0,quad:t>=T.step&&t<T.lean?1:0}},t);
      w=PROP.floor()+PROP.mat(80,900)+PROP.shadow(460)+b.svg;cam={z:1.0,cx:480,cy:1080};
      exTitle(t,2,'REVERSE LUNGE',sh.t0+0.05,sh.t1);
      pill(t,'STEP BACK','blue',540,1840,T.step,T.drop-0.1);
      pill(t,'BACK KNEE TOWARD THE FLOOR ↓','violet',540,1840,T.drop,T.lean-0.1);
      if(t>=T.drop&&t<T.lean) UI.world+=arrow(V(230,1300),V(230,1560),'#7c5cff',ramp(t,T.drop,.4),16);
      pill(t,'LEAN SLIGHTLY FORWARD = MORE GLUTES','green',540,1840,T.lean,T.ten-0.1);
      if(t>=T.step){const n=Math.round(10*clamp((t-T.step)/(sh.t1-0.4-T.step),0,1));counter(t,'×'+n,n,10,T.ten-0.1,sh.t1,880,720);pill(t,'EACH LEG','violet',540,1840,T.ten,sh.t1);}
      break;}
    case 'follow':{
      w=PROP.floor()+fig({view:'front',arms0:'hips',arms1:'wave',armK:ramp(t,sh.t0,.4),wave:true,eyes:'happy'},t).svg;cam={z:0.98,cx:540,cy:1060};
      followCard(t,sh.t0+0.05,sh.t1,T.rous+0.1);
      pill(t,'NEXT WEEK: EVEN HARDER 🔥','red',540,520,S(88),sh.t1);
      break;}
    case 'ex3':{
      let abd=0;if(t>=T.lift){const ph=((t-T.lift)/2.1)%1;abd=38*(0.5-0.5*Math.cos(2*Math.PI*ph));}
      const F=fig({view:'front',arms0:'sidelie',legAbd:abd,noFloor:true,eyes:t>=T.lift?'strain':'normal',hl:{gmed:t>=T.trains?1:0}},t).svg;
      w=PROP.floor()+PROP.mat(-60,1100)+`<g transform="translate(560 ${FL-150}) rotate(90) translate(-540 -1110)">${F}</g>`;cam={z:0.82,cx:560,cy:1330};
      exTitle(t,3,'SIDE-LYING LEG RAISE',sh.t0+0.05,sh.t1);
      pill(t,'LIE ON YOUR SIDE','blue',540,1840,T.lie,T.toes-0.1);
      pill(t,'TOES FORWARD, NOT UP','violet',540,1840,T.toes,T.lift-0.1);
      pill(t,'LIFT SLOWLY ↑','green',540,1840,T.lift,T.trains-0.1);
      pill(t,'SIDE GLUTE = STABLE HIPS','red',540,1840,T.trains,T.fif2-0.1);
      card(t,'🚶‍♀️',800,600,T.keeps,sh.t1);
      if(t>=T.lift){const n=Math.round(15*clamp((t-T.lift)/(sh.t1-0.4-T.lift),0,1));counter(t,'×'+n,n,15,T.fif2-0.1,sh.t1,880,1000);pill(t,'EACH SIDE','violet',540,1840,T.fif2,sh.t1);}
      break;}
    case 'outro':{
      w=PROP.floor()+fig({view:'back',arms0:'hips',arms1:'up',armK:ramp(t,sh.t0,.5),hl:{glute:1},hlColor:{glute:'green'}},t).svg;cam={z:0.98,cx:540,cy:1060};
      pill(t,'3 ROUNDS','violet',540,1600,sh.t0,S(130)-0.1);pill(t,'3× A WEEK 📅','violet',540,1600,S(130),sh.t1);confetti(t,sh.t0);
      break;}
    case 'cta':{
      w=PROP.floor()+fig({view:'front',arms0:'hips',arms1:'wave',armK:ramp(t,sh.t0,.4),wave:true,eyes:'happy'},t).svg;cam={z:0.98,cx:540,cy:1060};
      commentBox(t,'GLUTES 🍑 starting on ______',sh.t0+0.1,DUR,1440);
      pill(t,'COMMENT 👇','red',540,1660,S(136),DUR);
      break;}
  }
  render(t,sh,cam,w);
}
