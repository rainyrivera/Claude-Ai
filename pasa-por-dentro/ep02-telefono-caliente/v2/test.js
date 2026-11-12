import * as THREE from 'three';
import { loadGLB, Person } from './people.js';
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const r=new THREE.WebGLRenderer({canvas:document.getElementById('gl'),antialias:true,preserveDrawingBuffer:true}); r.setSize(720,1280,false);
r.outputColorSpace=THREE.SRGBColorSpace; r.toneMapping=THREE.ACESFilmicToneMapping;
const s=new THREE.Scene(); s.background=new THREE.Color(0x334466);
s.add(new THREE.HemisphereLight(0xffffff,0x444444,2)); const d=new THREE.DirectionalLight(0xffffff,2); d.position.set(2,4,3); s.add(d);
const cam=new THREE.PerspectiveCamera(35,1080/1920,.1,100); cam.position.set(1.2,1.5,4.2); cam.lookAt(0,1.2,0);
const [mi,rp]=await Promise.all([loadGLB('models/Michelle.glb'),loadGLB('models/readyplayer.me.glb')]);
const A=new Person(mi,'mixamorig'), B=new Person(rp,''); console.log('missing',A.missing,B.missing);
A.root.position.x=-.55; B.root.position.x=.55; s.add(A.root,B.root);
const phone=new THREE.Mesh(new THREE.BoxGeometry(.075,.155,.01),new THREE.MeshStandardMaterial({color:0x222222})); s.add(phone);
for(const P of [A,B]){
  P.reset();
  P.arm('R', V(-.04,1.12,.32), V(-.6,.8,-.3));
  P.arm('L', V(.04,1.12,.32), V(.6,.8,-.3));
  P.look(V(0,1.1,.35),.8);
}
B.mouth(.6,.3);
phone.position.copy(A.w(V(0,1.17,.33))); phone.rotation.x=-.9;
window.READY=true; r.render(s,cam);
