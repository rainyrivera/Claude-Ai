const PZ={
 STAND:{hip:V(520,1098),lean:2,nA:V(548,1674),fA:V(500,1674),nArm:{a:6,f:12},fArm:{a:-4,f:4}},
 SLUMP:{hip:V(450,1265),lean:-14,bow:-28,neck:18,nA:V(720,1674),fA:V(690,1674),nArm:{a:40,f:85},fArm:{a:35,f:80}},
 KNEEL:{hip:V(520,1360),lean:2,nA:V(250,1674),fA:V(770,1674),nHand:V(540,1290),fHand:V(520,1290)},
 KPUSH:{hip:V(588,1388),lean:-7,nA:V(250,1674),fA:V(770,1674),nHand:V(604,1300),fHand:V(584,1300)},
 BDOWN:{hip:V(600,1640),lean:-90,nA:V(860,1674),fA:V(840,1674),nArm:{a:88,f:90},fArm:{a:88,f:90}},
 BUP:{hip:V(640,1400),lean:-120,neck:30,nA:V(860,1674),fA:V(840,1674),nArm:{a:84,f:88},fArm:{a:84,f:88}},
 FOUR:{hip:V(430,1360),lean:90,bow:0,neck:0,nLeg:{th:0,sh:-90},fLeg:{th:0,sh:-90},nHand:V(820,1690),fHand:V(800,1690)},
 CAT:{hip:V(430,1360),lean:90,bow:-85,neck:35,nLeg:{th:0,sh:-90},fLeg:{th:0,sh:-90},nHand:V(820,1690),fHand:V(800,1690)},
 COW:{hip:V(430,1360),lean:90,bow:65,neck:-30,nLeg:{th:0,sh:-90},fLeg:{th:0,sh:-90},nHand:V(820,1690),fHand:V(800,1690)},
};
const T={paying:S(8),fix:S(13),one:S(15),kneel:S(19),squeeze:S(23),push:S(29),sitting:S(33),thirty:S(38),two:S(42),feet:S(45),pushH:S(47),until:S(53),yourG:S(60),thisP:S(67),fifteen:S(73),follow:S(75),rous:S(76),three:S(86),onall:S(88),round:S(91),arch:S(95),thisM:S(98),ten:S(105),four:S(107),back:S(110),slide:S(116),without:S(122),ten2:S(124),open:S(127),five:S(130),noeq:S(132),work:S(137),lunch:S(141),now:S(143),how:S(149)};
const SHOTS=[[0,'hook'],[T.one,'ex1'],[T.two,'ex2'],[T.follow,'follow'],[T.three,'ex3'],[T.four,'ex4'],[T.five,'outro'],[T.now,'cta']];
function frame(t){
  uiReset();hlId=0;const sh=shotAtF(SHOTS,t);let w='',cam={z:1.05,cx:540,cy:1080};
  switch(sh.name){
    case 'hook':{
      const up=t>=T.fix-0.2;
      const p=seqPose([[0,PZ.SLUMP],[T.fix-0.2,PZ.STAND,0.7]],t);
      const pain=t>=T.paying-0.1&&!up;
      w=PROP.floor()+PROP.chair(470)+PROP.shadow(540)+body(p,{eyes:up?'happy':'bored',hl:{spine:pain?1:0,hipflex:pain?1:0},spark:pain?{at:'spine',k:1}:null},t).svg;
      cam={z:lerp(1.25,1.05,ramp(t,0,1.4)),cx:520,cy:lerp(1180,1100,ramp(t,0,1.4))};
      pill(t,'SITTING ALL DAY? 🪑','dark',540,520,0.05,T.paying-0.1);
      pill(t,'YOUR BODY PAYS FOR IT','red',540,520,T.paying,T.fix-0.1);
      pill(t,'5-MINUTE FIX ✓','green',540,520,T.fix,sh.t1);
      card(t,'⏱️',820,620,T.fix,sh.t1);
      break;}
    case 'ex1':{
      const keys=[[sh.t0,PZ.STAND,0.01],[sh.t0+0.1,PZ.KNEEL,0.8]];
      let p=seqPose(keys,t);
      if(t>=T.push) p=osc(PZ.KNEEL,PZ.KPUSH,t,T.push,2.4);
      const sq=t>=T.squeeze,stretch=t>=T.push;
      const b=body(p,{eyes:stretch?'happy':'normal',hl:{glute:sq?1:0,hipflex:stretch?ramp(t,T.push,.4):0},hlColor:{glute:'green'}},t);
      w=PROP.floor()+PROP.mat()+PROP.shadow(520)+b.svg;
      if(stretch&&t<T.sitting){const c=b.pts.hip;UI.world+=arrow(add(c,V(90,-170)),add(c,V(230,-170)),'#22c55e',ramp(t,T.push,.4),16);}
      cam={z:1.12,cx:540,cy:1260};
      exTitle(t,1,'HIP FLEXOR STRETCH',sh.t0+0.05,sh.t1);
      pill(t,'KNEEL ON ONE KNEE','blue',540,1840,T.kneel,T.squeeze-0.1);
      pill(t,'SQUEEZE YOUR GLUTE','green',540,1840,T.squeeze,T.push-0.1);
      pill(t,'HIPS FORWARD →','green',540,1840,T.push,T.sitting-0.1);
      pill(t,'SITTING KEEPS THEM SHORT','red',540,1840,T.sitting,T.thirty-0.1);
      card(t,'🪑',820,620,T.sitting,T.thirty-0.1,'x');
      if(t>=T.thirty-0.1){const v=lerp(30,0,clamp((t-T.thirty)/(sh.t1-0.3-T.thirty),0,1));counter(t,fmtS(v),30-v,30,T.thirty-0.1,sh.t1,880,720);pill(t,'EACH SIDE','violet',880,880,T.thirty,sh.t1);}
      break;}
    case 'ex2':{
      let p=seqPose([[sh.t0,PZ.KNEEL,0.01],[sh.t0+0.05,PZ.BDOWN,0.8]],t);
      if(t>=T.pushH) p=osc(PZ.BDOWN,PZ.BUP,t,T.pushH,1.7);
      const sleepy=t>=T.yourG&&t<T.thisP, on=t>=T.thisP;
      const b=body(p,{eyes:t>=T.pushH?'strain':'normal',hl:{glute:t>=T.pushH?1:0},hlColor:{glute:sleepy?'gray':(on?'green':'red')}},t);
      w=PROP.floor()+PROP.mat()+PROP.shadow(540)+b.svg;
      if(t>=T.pushH&&t<T.until){const k=ramp(t,T.pushH,.4);UI.world+=arrow(add(b.pts.nA,V(-10,-260)),add(b.pts.nA,V(-10,-70)),'#22c55e',k,16);}
      if(t>=T.until&&t<T.yourG){const k=ramp(t,T.until,.5);const a=b.pts.sh,c=b.pts.nK;const e=lerpV(a,c,k);UI.world+=`<line x1="${f1(a.x)}" y1="${f1(a.y-70)}" x2="${f1(e.x)}" y2="${f1(e.y-70)}" stroke="#22c55e" stroke-width="12" stroke-dasharray="28 18" stroke-linecap="round"/>`;}
      cam={z:1.08,cx:540,cy:1400};
      exTitle(t,2,'GLUTE BRIDGE',sh.t0+0.05,sh.t1);
      pill(t,'FEET FLAT','blue',540,1840,T.feet,T.pushH-0.1);
      pill(t,'PUSH THROUGH YOUR HEELS','green',540,1840,T.pushH,T.until-0.1);
      pill(t,'STRAIGHT LINE ✓','green',540,1840,T.until,T.yourG-0.1);
      pill(t,'GLUTES "ASLEEP" WHEN YOU SIT 😴','gray',540,1840,T.yourG,T.thisP-0.1);
      card(t,'🪑',820,620,T.yourG,T.thisP-0.1,'x');
      pill(t,'BACK TO WORK ✓','green',540,1840,T.thisP,sh.t1);
      if(t>=T.pushH){const n=Math.round(15*clamp((t-T.pushH)/(sh.t1-0.4-T.pushH),0,1));counter(t,'×'+n,n,15,T.pushH,sh.t1,880,720);}
      break;}
    case 'follow':{
      w=PROP.floor()+fig({view:'front',arms0:'hips',arms1:'wave',armK:ramp(t,sh.t0,.4),wave:true,eyes:'happy'},t).svg;cam={z:0.98,cx:540,cy:1060};
      followCard(t,sh.t0+0.05,sh.t1,T.rous+0.1);
      pill(t,'NEW ROUTINE EVERY WEEK 💜','violet',540,520,S(82),sh.t1);
      break;}
    case 'ex3':{
      let p=seqPose([[sh.t0,PZ.STAND,0.01],[sh.t0+0.05,PZ.FOUR,0.9]],t);
      let phase=0;
      if(t>=T.round){const per=2.6;const ph=((t-T.round)/per)%1;const k=0.5-0.5*Math.cos(2*Math.PI*ph);phase=k<0.5?0:1;p=pLerp(norm(PZ.CAT),norm(PZ.COW),k);}
      const b=body(p,{eyes:'normal',hl:{spine:t>=T.round?1:0},hlColor:{spine:'green'}},t);
      w=PROP.floor()+PROP.mat()+PROP.shadow(600)+b.svg;
      cam={z:1.1,cx:560,cy:1350};
      exTitle(t,3,'CAT-COW',sh.t0+0.05,sh.t1);
      pill(t,'ON ALL FOURS','blue',540,1840,T.onall,T.round-0.1);
      if(t>=T.round&&t<T.thisM){pill(t,phase?'ARCH ↓':'ROUND ↑',phase?'violet':'blue',540,1840,T.round,T.thisM-0.1);}
      pill(t,'MOVES YOUR WHOLE SPINE','green',540,1840,T.thisM,sh.t1);
      if(t>=T.round){const n=Math.round(10*clamp((t-T.round)/(sh.t1-0.4-T.round),0,1));counter(t,'×'+n,n,10,T.ten-0.1,sh.t1,880,720);}
      break;}
    case 'ex4':{
      let k=0;if(t>=T.slide){const ph=((t-T.slide)/1.8)%1;k=0.5-0.5*Math.cos(2*Math.PI*ph);}
      const err=t>=T.without&&t<T.ten2;
      w=PROP.wallFront()+fig({view:'front',arms0:'W',arms1:'Y',armK:k,eyes:'happy',hl:{chest:t>=T.open?1:0,upback:0},hlColor:{chest:'green'}},t).svg;
      cam={z:0.98,cx:540,cy:1080};
      exTitle(t,4,'WALL ANGELS',sh.t0+0.05,sh.t1);
      pill(t,'BACK & HEAD ON THE WALL','blue',540,1600,T.back,T.slide-0.1);
      pill(t,'ARMS UP & DOWN ↕','violet',540,1600,T.slide,T.without-0.1);
      pill(t,"DON'T ARCH YOUR BACK",'red',540,1600,T.without,T.ten2-0.1);
      if(err)UI.ovs+=xMark(V(860,1000),popk(t,T.without),56);
      pill(t,'OPENS YOUR CHEST ✓','green',540,1600,T.open,sh.t1);
      if(t>=T.slide){const n=Math.round(10*clamp((t-T.slide)/(sh.t1-0.4-T.slide),0,1));counter(t,'×'+n,n,10,T.ten2-0.1,sh.t1,880,1200);}
      break;}
    case 'outro':{
      w=PROP.floor()+fig({view:'front',arms0:'hips',arms1:'up',armK:ramp(t,sh.t0,.5),eyes:'happy'},t).svg;cam={z:0.98,cx:540,cy:1060};
      card(t,'⏱️',90,520,sh.t0,sh.t1);pill(t,'5 MINUTES','violet',540,1600,sh.t0,T.noeq-0.1);
      pill(t,'NO EQUIPMENT','dark',540,1600,T.noeq,S(134)-0.1);
      card(t,'💼',800,520,T.work,sh.t1);card(t,'🥪',445,1330,T.lunch,sh.t1);
      pill(t,'BEFORE WORK OR AT LUNCH','green',540,1600,S(134),sh.t1);
      confetti(t,sh.t0);
      break;}
    case 'cta':{
      w=PROP.floor()+fig({view:'front',arms0:'hips',arms1:'wave',armK:ramp(t,sh.t0,.4),wave:true,eyes:'happy'},t).svg;cam={z:0.98,cx:540,cy:1060};
      commentBox(t,'I sit __ hours a day 🪑',sh.t0+0.1,DUR,1440);
      pill(t,'COMMENT 👇','red',540,1660,S(148),DUR);
      break;}
  }
  render(t,sh,cam,w);
}
