const PZ={
 STAND:{hip:V(470,1098),lean:2,nA:V(560,1674),fA:V(520,1674),nArm:{a:6,f:12},fArm:{a:-4,f:4}},
 READY:{hip:V(470,1098),lean:4,nA:V(560,1674),fA:V(520,1674),nArm:{a:80,f:88},fArm:{a:76,f:84}},
 DEEP:{hip:V(430,1520),lean:42,nA:V(560,1674),fA:V(520,1674),nArm:{a:86,f:94},fArm:{a:82,f:90}},
 BOX:{hip:V(390,1290),lean:32,nA:V(580,1674),fA:V(545,1674),nArm:{a:84,f:90},fArm:{a:80,f:86}},
 BDOWN:{hip:V(600,1640),lean:-90,nA:V(860,1674),fA:V(840,1674),nArm:{a:88,f:90},fArm:{a:88,f:90}},
 BUP:{hip:V(640,1400),lean:-120,neck:30,nA:V(860,1674),fA:V(840,1674),nArm:{a:84,f:88},fArm:{a:84,f:88}},
 SU0:{hip:V(470,1140),lean:10,nA:V(660,1534),fA:V(450,1674),nArm:{a:10,f:20},fArm:{a:-10,f:0}},
 SU1:{hip:V(640,960),lean:3,nA:V(660,1534),fA:V(620,1534),nArm:{a:-8,f:0},fArm:{a:10,f:18}},
};
const T={hurt:S(2),dont:S(5),change:S(9),one:S(12),sit:S(15),tap:S(20),stand:S(23),chair:S(26),knees:S(34),twelve:S(42),two:S(44),push:S(47),squeeze:S(52),many:S(56),because:S(65),fifteen:S(73),follow:S(75),rous:S(76),three:S(85),use:S(87),pushF:S(91),keep:S(97),not:S(104),ten:S(107),go:S(110),stay:S(112),add:S(114),ifP:S(121),see:S(130),comment:S(133)};
const SHOTS=[[0,'hook'],[T.one,'ex1'],[T.two,'ex2'],[T.follow,'follow'],[T.three,'ex3'],[T.go,'outro'],[T.comment,'cta']];
function kneeDiagram(t,a,b,x,y){const o=vis(t,a,b);if(!o)return;const k=popk(t,a);
  const legs=(ox,bad)=>{const hip=[ox,40],knee=bad?[ox+38,150]:[ox,150],foot=[ox,260];const col=bad?'#ff3b4a':'#22c55e';
    return `<polyline points="${hip.join(',')} ${knee.join(',')} ${foot.join(',')}" fill="none" stroke="#17171c" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${knee[0]}" cy="${knee[1]}" r="22" fill="${col}"/><line x1="${ox}" y1="20" x2="${ox}" y2="280" stroke="${col}" stroke-width="5" stroke-dasharray="12 10"/>`;};
  UI.ovs+=`<g opacity="${f1(o)}" transform="translate(${x} ${y}) scale(${f1(k*0.7)})"><rect x="-300" y="0" width="600" height="360" rx="36" fill="#fff"/>
   <g transform="translate(-150 20)">${legs(0,false)}</g><g transform="translate(150 20)">${legs(-20,true)}</g>
   ${check(V(-80,60),1,30)}${xMark(V(220,60),1,30)}
   <text x="-150" y="340" text-anchor="middle" font-family="Inter" font-weight="900" font-size="28" fill="#16a34a">OVER TOES</text><text x="150" y="340" text-anchor="middle" font-family="Inter" font-weight="900" font-size="28" fill="#ff3b4a">CAVING IN</text></g>`;}
function frame(t){
  uiReset();hlId=0;const sh=shotAtF(SHOTS,t);let w='',cam={z:1.05,cx:540,cy:1080};
  switch(sh.name){
    case 'hook':{
      const up=t>=T.change-0.2;let p=up?seqPose([[0,PZ.DEEP],[T.change-0.2,PZ.READY,0.7]],t):osc(PZ.READY,PZ.DEEP,t,-0.4,1.6);
      const pain=!up&&t>=T.hurt-0.1;
      const b=body(p,{eyes:pain?'strain':(up?'happy':'normal'),hl:{knee:pain?1:0},spark:pain?{at:'knee',k:1}:null},t);
      w=PROP.floor()+PROP.shadow(520)+b.svg;cam={z:lerp(1.2,1.02,ramp(t,0,1.2)),cx:520,cy:lerp(1250,1100,ramp(t,0,1.2))};
      pill(t,'SQUATS HURT YOUR KNEES? 😣','red',540,520,0.05,T.dont-0.1);
      pill(t,"DON'T QUIT LEG DAY",'dark',540,520,T.dont,T.change-0.1);
      pill(t,'CHANGE THE EXERCISE ✓','green',540,520,T.change,sh.t1);
      break;}
    case 'ex1':{
      let p=seqPose([[sh.t0,PZ.READY,0.01]],t);if(t>=T.sit)p=osc(PZ.READY,PZ.BOX,t,T.sit,2.3);
      const b=body(p,{eyes:'normal',hl:{quad:t>=T.sit?1:0,glute:t>=T.sit?1:0,knee:t>=T.knees?1:0},hlColor:{knee:'green'}},t);
      w=PROP.floor()+PROP.chair(330,1310)+PROP.shadow(500)+b.svg;cam={z:1.02,cx:500,cy:1110};
      if(t>=T.chair&&t<T.twelve){const k=ramp(t,T.chair,.5);UI.world+=`<line x1="180" y1="1300" x2="${f1(lerp(180,760,k))}" y2="1300" stroke="#22c55e" stroke-width="8" stroke-dasharray="24 16"/>`;}
      exTitle(t,1,'BOX SQUAT',sh.t0+0.05,sh.t1);
      pill(t,'SIT BACK TO A CHAIR','blue',540,1840,T.sit,T.tap-0.1);
      pill(t,'TAP IT LIGHTLY','violet',540,1840,T.tap,T.stand-0.1);
      pill(t,'THEN STAND UP ↑','violet',540,1840,T.stand,T.chair-0.1);
      pill(t,'THE CHAIR CONTROLS DEPTH','green',540,1840,T.chair,T.knees-0.1);
      pill(t,'ONLY AS DEEP AS FEELS GOOD ✓','green',540,1840,T.knees,sh.t1);
      if(t>=T.sit){const n=Math.round(12*clamp((t-T.sit)/(sh.t1-0.4-T.sit),0,1));counter(t,'×'+n,n,12,T.twelve-0.1,sh.t1,880,720);}
      break;}
    case 'ex2':{
      if(t<T.because){
        let p=seqPose([[sh.t0,PZ.BDOWN,0.01]],t);if(t>=T.push)p=osc(PZ.BDOWN,PZ.BUP,t,T.push,1.8);
        const b=body(p,{eyes:t>=T.push?'strain':'normal',hl:{glute:t>=T.push?1:0}},t);
        w=PROP.floor()+PROP.mat()+PROP.shadow(540)+b.svg;cam={z:1.08,cx:540,cy:1400};
        if(t>=T.push&&t<T.squeeze){UI.world+=arrow(add(b.pts.nA,V(-10,-260)),add(b.pts.nA,V(-10,-70)),'#22c55e',ramp(t,T.push,.4),16);}
      } else {
        w=PROP.floor()+fig({view:'front',arms0:'hips',eyes:'happy',hl:{gmed:1,glute:0},hlColor:{gmed:'green'}},t).svg;cam={z:1.0,cx:540,cy:1080};
        const k=ramp(t,T.because+0.2,.6);for(const x of [484,596]){UI.world+=`<line x1="${x}" y1="1105" x2="${x}" y2="${f1(lerp(1105,1700,k))}" stroke="#22c55e" stroke-width="8" stroke-dasharray="22 14"/>`;}
      }
      exTitle(t,2,'GLUTE BRIDGE',sh.t0+0.05,sh.t1);
      pill(t,'PUSH THROUGH YOUR HEELS','green',540,1840,T.push,T.squeeze-0.1);
      pill(t,'SQUEEZE AT THE TOP','violet',540,1840,T.squeeze,T.many-0.1);
      pill(t,'STRONGER HIPS HELP MANY KNEES','green',540,1840,T.many,T.because-0.1);
      pill(t,'HIPS KEEP KNEES IN LINE','green',540,1600,T.because,sh.t1);
      if(t>=T.push){const n=Math.round(15*clamp((t-T.push)/(sh.t1-0.4-T.push),0,1));counter(t,'×'+n,n,15,T.fifteen-0.1,sh.t1,880,720);}
      break;}
    case 'follow':{
      w=PROP.floor()+fig({view:'front',arms0:'hips',arms1:'wave',armK:ramp(t,sh.t0,.4),wave:true,eyes:'happy'},t).svg;cam={z:0.98,cx:540,cy:1060};
      followCard(t,sh.t0+0.05,sh.t1,T.rous+0.1);
      pill(t,'ROUTINES THAT RESPECT YOUR JOINTS','violet',540,520,S(79),sh.t1);
      break;}
    case 'ex3':{
      let p=seqPose([[sh.t0,PZ.SU0,0.01]],t);if(t>=T.pushF)p=osc(PZ.SU0,PZ.SU1,t,T.pushF,2.4);
      const b=body(p,{eyes:'normal',hl:{quad:t>=T.pushF?1:0,glute:t>=T.pushF?1:0}},t);
      w=PROP.floor()+PROP.step(560,900,1560)+PROP.shadow(560)+b.svg;cam={z:0.75,cx:700,cy:1050};
      exTitle(t,3,'STEP-UPS',sh.t0+0.05,sh.t1);
      pill(t,'USE A LOW STEP','blue',540,1840,T.use,T.pushF-0.1);
      pill(t,'PUSH THROUGH YOUR WHOLE FOOT','green',540,1840,T.pushF,T.keep-0.1);
      kneeDiagram(t,T.keep,T.ten-0.1,840,620);
      pill(t,'KNEE OVER TOES ✓','green',540,1840,T.keep,T.not-0.1);
      pill(t,'NOT CAVING IN ✗','red',540,1840,T.not,T.ten-0.1);
      if(t>=T.pushF){const n=Math.round(10*clamp((t-T.pushF)/(sh.t1-0.4-T.pushF),0,1));counter(t,'×'+n,n,10,T.ten-0.1,sh.t1,880,720);pill(t,'EACH LEG','violet',540,1840,T.ten,sh.t1);}
      break;}
    case 'outro':{
      w=PROP.floor()+fig({view:'front',arms0:'hips',eyes:'happy'},t).svg;cam={z:0.98,cx:540,cy:1060};
      pill(t,'GO SLOW 🐢','blue',540,1600,T.go,T.stay-0.1);
      pill(t,'STAY PAIN-FREE','green',540,1600,T.stay,T.add-0.1);
      pill(t,'+ A LITTLE MORE EACH WEEK 📈','violet',540,1600,T.add,T.ifP-0.1);
      card(t,'📈',800,520,T.add,sh.t1);
      card(t,'🩺',90,520,T.ifP,sh.t1);
      pill(t,'SHARP PAIN? SEE A PRO','red',540,1600,T.ifP,sh.t1);
      break;}
    case 'cta':{
      w=PROP.floor()+fig({view:'front',arms0:'hips',arms1:'wave',armK:ramp(t,sh.t0,.4),wave:true,eyes:'happy'},t).svg;cam={z:0.98,cx:540,cy:1060};
      commentBox(t,'KNEES 🙋‍♀️ part two please!',sh.t0+0.1,DUR,1440);
      pill(t,'COMMENT FOR PART 2 👇','red',540,1660,T.comment+0.3,DUR);
      break;}
  }
  render(t,sh,cam,w);
}
