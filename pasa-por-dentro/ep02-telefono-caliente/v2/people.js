import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _q3 = new THREE.Quaternion();
const loader = new GLTFLoader();
export const loadGLB = u => new Promise((res, rej) => loader.load(u, res, undefined, rej));

// rotate `bone` (world-space) so that direction bone->child points toward `target` (world point)
export function aim(bone, child, target, amount = 1) {
  bone.updateWorldMatrix(true, false); child.updateWorldMatrix(false, false);
  bone.getWorldPosition(_a); child.getWorldPosition(_b);
  const cur = _b.sub(_a).normalize(), want = _c.copy(target).sub(_a).normalize();
  _q.setFromUnitVectors(cur, want);
  if (amount < 1) _q.slerp(_q3.identity(), 1 - amount);
  bone.getWorldQuaternion(_q2); _q.multiply(_q2);
  bone.parent.getWorldQuaternion(_q2); bone.quaternion.copy(_q2.invert().multiply(_q));
  bone.updateWorldMatrix(false, true);
}
// two-bone IK: place `hand` at target, elbow bent toward pole (world point)
export function ik(up, fore, hand, target, pole) {
  up.updateWorldMatrix(true, true);
  const S = up.getWorldPosition(new THREE.Vector3()), E0 = fore.getWorldPosition(new THREE.Vector3()), H0 = hand.getWorldPosition(new THREE.Vector3());
  const a = S.distanceTo(E0), b = E0.distanceTo(H0);
  const dv = target.clone().sub(S); let d = Math.min(dv.length(), (a + b) * .999); d = Math.max(d, Math.abs(a - b) + 1e-3);
  const dir = dv.normalize();
  const cosA = (a * a + d * d - b * b) / (2 * a * d), sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
  const pv = pole.clone().sub(S); const perp = pv.sub(dir.clone().multiplyScalar(pv.dot(dir))).normalize();
  const E = S.clone().add(dir.clone().multiplyScalar(a * cosA)).add(perp.multiplyScalar(a * sinA));
  aim(up, fore, E); aim(fore, hand, S.clone().add(dir.multiplyScalar(d)));
}
export class Person {
  constructor(gltf, prefix = '') {
    this.root = new THREE.Group(); this.model = gltf.scene; this.root.add(this.model);
    this.model.traverse(o => { if (o.isMesh) { o.frustumCulled = false; o.castShadow = true; if (o.material) o.material.envMapIntensity = .6; } });
    const B = n => this.model.getObjectByName(prefix + n);
    this.b = {}; for (const n of ['Hips', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head', 'HeadTop_End', 'LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftHand', 'RightShoulder', 'RightArm', 'RightForeArm', 'RightHand', 'LeftHandMiddle1', 'RightHandMiddle1', 'LeftUpLeg', 'RightUpLeg', 'LeftLeg', 'RightLeg']) this.b[n] = B(n);
    this.fingers = { L: [], R: [] };
    for (const s of ['Left', 'Right']) for (const f of ['Index', 'Middle', 'Ring', 'Pinky', 'Thumb']) for (const k of [1, 2, 3]) { const bn = B(`${s}Hand${f}${k}`); if (bn) this.fingers[s[0]].push({ bn, f, k, q0: bn.quaternion.clone() }); }
    this.missing = Object.keys(this.b).filter(k => !this.b[k]);
    this.rest = new Map(); this.model.traverse(o => { if (o.isBone) this.rest.set(o, o.quaternion.clone()); });
    this.morphs = []; this.model.traverse(o => { if (o.isMesh && o.morphTargetDictionary) this.morphs.push(o); });
    this.root.updateWorldMatrix(true, true);
  }
  reset() { for (const [b, q] of this.rest) b.quaternion.copy(q); this.root.updateWorldMatrix(true, true); }
  w(local) { return this.root.localToWorld(local.clone()); } // character-local -> world
  arm(side, handLocal, poleLocal) { const S = side === 'L' ? 'Left' : 'Right'; ik(this.b[S + 'Arm'], this.b[S + 'ForeArm'], this.b[S + 'Hand'], this.w(handLocal), this.w(poleLocal)); }
  handAim(side, local) { const S = side === 'L' ? 'Left' : 'Right'; aim(this.b[S + 'Hand'], this.b[S + 'HandMiddle1'], this.w(local)); }
  look(local, amount = 1) { const h = this.b.Head, top = this.b.HeadTop_End; // rotate head so that "forward" points to target: use neck->head chain approx
    // forward = character +z; we aim the head's up-vector toward target-elevation blend
    const hp = h.getWorldPosition(new THREE.Vector3()); const fw = this.w(new THREE.Vector3(0, 0, 1)).sub(this.root.getWorldPosition(new THREE.Vector3())).normalize();
    const want = this.w(local).sub(hp).normalize();
    _q.setFromUnitVectors(fw, want); _q.slerp(_q3.identity(), 1 - amount);
    h.getWorldQuaternion(_q2); _q.multiply(_q2); h.parent.getWorldQuaternion(_q2); h.quaternion.copy(_q2.invert().multiply(_q)); h.updateWorldMatrix(false, true);
  }
  spineBend(x, y = 0, z = 0) { for (const n of ['Spine', 'Spine1', 'Spine2']) { const b = this.b[n]; if (!b) continue; _q.setFromEuler(new THREE.Euler(x / 3, y / 3, z / 3)); b.quaternion.multiply(_q); } this.root.updateWorldMatrix(true, true); }
  curl(side, amt, axis = 'z') { for (const f of this.fingers[side]) { const a = amt * (f.f === 'Thumb' ? .4 : 1) * (f.k === 1 ? .9 : 1.1); _q.setFromAxisAngle(new THREE.Vector3(axis === 'x' ? 1 : 0, 0, axis === 'z' ? 1 : 0), a * (side === 'L' ? 1 : -1)); f.bn.quaternion.copy(f.q0).multiply(_q); } }
  mouth(open, smile = 0) { for (const m of this.morphs) { const d = m.morphTargetDictionary; if (d.mouthOpen != null) m.morphTargetInfluences[d.mouthOpen] = open; if (d.mouthSmile != null) m.morphTargetInfluences[d.mouthSmile] = smile; } }
}
