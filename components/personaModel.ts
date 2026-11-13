import type * as THREE_NS from "three";

/* Maryam's 3D model: geometry and materials only. Animation lives in Persona.tsx. */
/* Colours sampled from the reference */
const C = {
  skin: 0xf9dccb,
  skinShade: 0xeab6a2,
  blush: 0xf4949a,
  lips: 0xc35a66,
  iris: 0x2a1812,
  irisLow: 0x6a3d2c,
  brow: 0x3b2621,
  hair: 0x2a1c19,
  hijab: 0x1d1d22,
  shirt: 0xe9cbac,
  button: 0xc9a17d,
  jeans: 0x40598a,
  stitch: 0x6c86b5,
  shoe: 0xf7f5f1,
  sole: 0xd6d1cb,
  line: 0x3a2b28,
};

export type Rig = ReturnType<typeof buildCharacter>;

export function buildCharacter(THREE: typeof THREE_NS) {
  const V2 = (r: number, y: number) => new THREE.Vector2(r, y);

  /* ── Materials: soft, matte, lit ── */
  const std = (color: number, roughness = 0.82, emissive = 0.06) =>
    new THREE.MeshStandardMaterial({
      color, roughness, metalness: 0,
      emissive: new THREE.Color(color).multiplyScalar(emissive),
    });
  const flat = (color: number, opacity = 1) =>
    new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, depthWrite: opacity >= 1 });
  const mSkin = std(C.skin, 0.62, 0.12);
  const mShirt = std(C.shirt, 0.9, 0.08);
  const mJeans = std(C.jeans, 0.95, 0.05);
  const mShoe = std(C.shoe, 0.7, 0.1);
  const mSole = std(C.sole, 0.8, 0.05);
  const mHijab = new THREE.MeshPhysicalMaterial({
    color: C.hijab, roughness: 0.85, metalness: 0,
    sheen: 1, sheenColor: new THREE.Color(0x6a6a78), sheenRoughness: 0.45,
    side: THREE.DoubleSide,
  });

  /* Thin soft outline: back faces pushed out along the normal */
  const lineMat = new THREE.ShaderMaterial({
    uniforms: { t: { value: 0.011 }, c: { value: new THREE.Color(C.line) } },
    vertexShader: "uniform float t; void main(){ vec3 p = position + normalize(normal) * t; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }",
    fragmentShader: "uniform vec3 c; void main(){ gl_FragColor = vec4(c, 1.0); }",
    side: THREE.BackSide,
  });

  /* Geometry helpers (scales are baked so outlines stay even) */
  const ell = (rx: number, ry: number, rz: number, w = 32, h = 24) =>
    new THREE.SphereGeometry(1, w, h).scale(rx, ry, rz);
  const lathe = (pts: [number, number][], sz = 1, seg = 40) =>
    new THREE.LatheGeometry([...pts].sort((a, b) => a[1] - b[1]).map(([r, y]) => V2(r, y)), seg).scale(1, 1, sz);
  const mesh = (geo: THREE_NS.BufferGeometry, mat: THREE_NS.Material, outline = true) => {
    const m = new THREE.Mesh(geo, mat);
    if (outline) m.add(new THREE.Mesh(geo, lineMat));
    return m;
  };
  const group = (parent: THREE_NS.Object3D, x = 0, y = 0, z = 0) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    return g;
  };
  const put = <T extends THREE_NS.Object3D>(parent: THREE_NS.Object3D, o: T, x = 0, y = 0, z = 0) => {
    o.position.set(x, y, z);
    parent.add(o);
    return o;
  };
  /* Keep only the triangles whose centre passes the test */
  const carve = (geo: THREE_NS.BufferGeometry, keep: (x: number, y: number, z: number) => boolean) => {
    const pos = geo.attributes.position, idx = geo.index!, out: number[] = [];
    for (let i = 0; i < idx.count; i += 3) {
      const a = idx.getX(i), b = idx.getX(i + 1), c = idx.getX(i + 2);
      const x = (pos.getX(a) + pos.getX(b) + pos.getX(c)) / 3;
      const y = (pos.getY(a) + pos.getY(b) + pos.getY(c)) / 3;
      const z = (pos.getZ(a) + pos.getZ(b) + pos.getZ(c)) / 3;
      if (keep(x, y, z)) out.push(a, b, c);
    }
    geo.setIndex(out);
    return geo;
  };

  const root = new THREE.Group();

  /* Soft ground shadow */
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.62, 40),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.12, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.scale.set(1, 0.42, 1);
  shadow.position.y = 0.005;
  root.add(shadow);

  const body = group(root); // turns left / right
  const hips = group(body, 0, 1.64, 0); // bobs

  put(hips, mesh(ell(0.35, 0.22, 0.25), mJeans), 0, -0.06, 0);

  /* ── Wide-leg jeans + white sneakers ── */
  const leg = (side: number) => {
    const hip = group(hips, 0.195 * side, -0.06, 0);
    put(hip, mesh(lathe([[0.001, 0.15], [0.11, 0.13], [0.172, 0.05], [0.178, -0.2], [0.17, -0.6], [0.166, -0.84]]), mJeans));
    const knee = group(hip, 0, -0.78, 0);
    put(knee, mesh(lathe([[0.166, 0.08], [0.168, -0.1], [0.18, -0.38], [0.196, -0.6], [0.2, -0.665]]), mJeans));
    const hem = put(knee, new THREE.Mesh(new THREE.TorusGeometry(0.197, 0.006, 6, 40), flat(C.stitch)), 0, -0.615, 0);
    hem.rotation.x = Math.PI / 2;
    put(knee, mesh(ell(0.098, 0.085, 0.165), mShoe), 0, -0.715, 0.055);
    put(knee, mesh(ell(0.104, 0.038, 0.176), mSole), 0, -0.768, 0.055);
    const toe = put(knee, new THREE.Mesh(ell(0.06, 0.03, 0.05), mSole), 0, -0.705, 0.185);
    toe.rotation.x = -0.5;
    return { hip, knee };
  };
  const legL = leg(-1), legR = leg(1);

  /* ── Loose button-down shirt ── */
  const torso = group(hips);
  const SZ = 0.66;
  const shirtProfile: [number, number][] = [
    [0.405, -0.27], [0.418, -0.24], [0.388, -0.05], [0.352, 0.3], [0.348, 0.6], [0.362, 0.9],
    [0.352, 1.05], [0.29, 1.16], [0.2, 1.24], [0.12, 1.29], [0.1, 1.33],
  ];
  put(torso, mesh(lathe(shirtProfile, SZ, 48), mShirt));
  const shirtR = (y: number) => {
    for (let i = 1; i < shirtProfile.length; i++) {
      const [r0, y0] = shirtProfile[i - 1], [r1, y1] = shirtProfile[i];
      if (y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
    }
    return 0.1;
  };
  for (let i = 0; i < 5; i++) {
    const y = 0.86 - i * 0.24;
    put(torso, new THREE.Mesh(ell(0.019, 0.019, 0.008, 12, 8), std(C.button, 0.5)), 0.012, y, shirtR(y) * SZ + 0.004);
  }
  /* front placket seam */
  const seam = put(torso, new THREE.Mesh(new THREE.PlaneGeometry(0.006, 1.12), flat(0xd2b394)), -0.03, 0.33, 0.258);
  seam.rotation.x = 0.02;

  /* ── Puffy sleeves with cuffs ── */
  const arm = (side: number) => {
    const shoulder = group(torso, 0.385 * side, 1.12, 0);
    const splay = group(shoulder);
    splay.rotation.z = 0.06 * side;
    put(splay, mesh(ell(0.12, 0.12, 0.12), mShirt), 0, -0.02, 0);
    put(splay, mesh(lathe([[0.001, 0.05], [0.1, 0.03], [0.118, -0.12], [0.124, -0.4], [0.116, -0.6]], 1, 24), mShirt));
    const elbow = group(splay, 0, -0.56, 0);
    put(elbow, mesh(lathe([[0.114, 0.05], [0.128, -0.14], [0.138, -0.32], [0.126, -0.42], [0.086, -0.46], [0.001, -0.47]], 1, 24), mShirt));
    put(elbow, mesh(lathe([[0.08, -0.44], [0.092, -0.46], [0.092, -0.535], [0.08, -0.555], [0.001, -0.56]], 1, 24), mShirt));
    put(elbow, mesh(ell(0.064, 0.086, 0.055), mSkin), 0, -0.625, 0);
    put(elbow, mesh(ell(0.024, 0.042, 0.024, 12, 10), mSkin, false), -0.04 * side, -0.6, 0.035);
    return { shoulder, elbow };
  };
  const armL = arm(-1), armR = arm(1);

  /* ── Hijab below the head: shoulder drape, chunky neck wrap, back drape, front tail ── */
  /* Ripple a surface along its normals so fabric reads as soft folds */
  const folds = (geo: THREE_NS.BufferGeometry, amp: number, freq: number) => {
    const p = geo.attributes.position, n = geo.attributes.normal;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const d = amp * (Math.sin(Math.atan2(x, z) * freq + y * 9) * 0.7 + Math.sin(Math.atan2(x, z) * freq * 0.5 - y * 5) * 0.3);
      p.setXYZ(i, x + n.getX(i) * d, y + n.getY(i) * d, z + n.getZ(i) * d);
    }
    geo.computeVertexNormals();
    return geo;
  };
  put(torso, new THREE.Mesh(folds(lathe([
    [0.2, 1.3], [0.33, 1.2], [0.395, 1.12], [0.415, 1.04], [0.39, 0.985], [0.32, 0.968], [0.25, 0.965],
  ], 0.72, 64), 0.008, 9), mHijab));
  const wrapLow = put(torso, new THREE.Mesh(folds(new THREE.TorusGeometry(0.29, 0.095, 18, 64).rotateX(Math.PI / 2).scale(1, 1, 0.8), 0.006, 7), mHijab), 0, 1.08, 0.005);
  wrapLow.rotation.set(-0.1, 0, 0.05);
  const wrapHigh = put(torso, new THREE.Mesh(folds(new THREE.TorusGeometry(0.235, 0.098, 18, 64).rotateX(Math.PI / 2).scale(1, 1, 0.82), 0.007, 6), mHijab), 0, 1.19, 0.0);
  wrapHigh.rotation.set(0.16, 0, -0.06);
  put(torso, new THREE.Mesh(folds(lathe([[0.001, 0.5], [0.17, 0.55], [0.26, 0.72], [0.31, 0.95], [0.001, 1.0]], 0.22, 40), 0.006, 10), mHijab), 0, 0, -0.245);
  const tail = group(torso, -0.12, 1.06, 0.25);
  const tailA = put(tail, new THREE.Mesh(folds(ell(0.1, 0.39, 0.038, 32, 24), 0.006, 6), mHijab), 0, -0.34, 0);
  tailA.rotation.z = -0.06;
  const tailB = put(tail, new THREE.Mesh(ell(0.066, 0.26, 0.032), mHijab), 0.075, -0.24, 0.022);
  tailB.rotation.z = 0.14;

  /* ── Head ── */
  const head = group(torso, 0, 1.69, 0);
  head.scale.setScalar(1.16);

  /* Round, soft face with full cheeks and a small chin */
  const F = { y: -0.02, z: 0.12, rx: 0.28, ry: 0.305, rz: 0.25 };
  const faceGeo = ell(F.rx, F.ry, F.rz, 64, 48);
  {
    const p = faceGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const v = p.getY(i) / F.ry;
      if (v < 0.25) p.setX(i, p.getX(i) * (1 + Math.sin(Math.min(1, (0.25 - v) / 1.0) * Math.PI) * 0.075));
    }
    faceGeo.computeVertexNormals();
  }
  put(head, new THREE.Mesh(faceGeo, mSkin), 0, F.y, F.z);
  put(head, new THREE.Mesh(new THREE.CapsuleGeometry(0.095, 0.2, 8, 16), mSkin), 0, -0.42, -0.02);

  /* Hair parting, a little triangle under the peak of the hijab */
  const hairGeo = carve(ell(F.rx * 1.015, F.ry * 1.015, F.rz * 1.015, 160, 120), (x, y, z) => z > 0 && y > 0.2 && Math.abs(x) < 0.1);
  put(head, new THREE.Mesh(hairGeo, std(0x5b3a2e, 0.6, 0.05)), 0, F.y, F.z);

  /* Hood: tall soft dome with an opening for the face that dips into a peak at the parting
     and opens into a V under the chin */
  const H = { y: 0.06, z: -0.04, rx: 0.36, ry: 0.42, rz: 0.38 };
  const O = { y: -0.03, rx: 0.256, ry: 0.305 };
  const drop = (x: number) => 0.07 * Math.min(1, Math.abs(x) / 0.075) ** 0.8;
  const inOpening = (x: number, y: number) => {
    const yy = y + drop(x) * Math.max(0, (y - O.y) / O.ry);
    return (x / O.rx) ** 2 + ((yy - O.y) / O.ry) ** 2 < 1 || (Math.abs(x) < 0.175 && y < O.y);
  };
  const hoodGeo = carve(folds(ell(H.rx, H.ry, H.rz, 80, 60), 0.006, 10).translate(0, H.y, H.z), (x, y, z) => !(z > 0 && inOpening(x, y)));
  put(head, new THREE.Mesh(hoodGeo, mHijab));
  /* fabric falling beside the cheeks down into the neck wrap */
  const flowProfile: [number, number][] = [[0.33, 0.12], [0.348, 0.02], [0.37, -0.16], [0.366, -0.3], [0.336, -0.42], [0.28, -0.5]];
  const flow = carve(folds(lathe(flowProfile, 0.92, 64), 0.007, 8).translate(0, 0, H.z), (x, _y, z) => !(z > 0.02 && Math.abs(x) < 0.18));
  put(head, new THREE.Mesh(flow, mHijab));

  /* Rolled front edge of the hijab, plus two softer folds behind it */
  const flowR = (y: number) => {
    for (let i = 1; i < flowProfile.length; i++) {
      const [r0, y0] = flowProfile[i - 1], [r1, y1] = flowProfile[i];
      if (y >= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
    }
    return 0.29;
  };
  const surfZ = (x: number, y: number) => {
    const k = 1 - (x / H.rx) ** 2 - ((y - H.y) / H.ry) ** 2;
    let z = k > 0 ? H.z + H.rz * Math.sqrt(k) : -1;
    if (y < 0.02 && Math.abs(x) >= 0.178) z = Math.max(z, H.z + 0.92 * Math.sqrt(Math.max(0, flowR(y) ** 2 - x * x)));
    return z;
  };
  const edge = (sx: number, sy: number, a0: number, lift: number, tail: boolean) => {
    const pts: THREE_NS.Vector3[] = [];
    const add = (x: number, y: number) => pts.push(new THREE.Vector3(x, y, surfZ(x, y) + lift));
    if (tail) { add(-0.182, -0.46); add(-0.186, -0.33); }
    for (let i = 0; i <= 60; i++) {
      const a = a0 + (i / 60) * (Math.PI - 2 * a0);
      const x = -O.rx * sx * Math.cos(a), y = O.y + O.ry * sy * Math.sin(a) - drop(x) * Math.max(0, Math.sin(a));
      add(x, y);
    }
    if (tail) { add(0.186, -0.33); add(0.182, -0.46); }
    return new THREE.CatmullRomCurve3(pts);
  };
  put(head, new THREE.Mesh(new THREE.TubeGeometry(edge(1, 1, -0.6, 0.006, true), 160, 0.04, 12), mHijab));
  put(head, new THREE.Mesh(new THREE.TubeGeometry(edge(1.2, 1.12, -0.15, -0.004, false), 90, 0.017, 10), mHijab));

  /* Place a feature flat on the face surface */
  const Z = new THREE.Vector3(0, 0, 1);
  const onFace = <T extends THREE_NS.Object3D>(o: T, x: number, y: number, lift = 0.003) => {
    const nx = x / F.rx, ny = (y - F.y) / F.ry, nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
    const n = new THREE.Vector3(nx / F.rx, ny / F.ry, nz / F.rz).normalize();
    o.position.set(x, y, F.z + F.rz * nz).addScaledVector(n, lift);
    o.quaternion.setFromUnitVectors(Z, n);
    head.add(o);
    return o;
  };

  /* Big round glossy eyes with a winged lash line */
  const LASH = 0x120c0a;
  const eye = (side: number) => {
    const g = onFace(new THREE.Group(), 0.104 * side, -0.075);
    const ball = put(g, new THREE.Group());
    ball.scale.set(1, 1.12, 1);
    put(ball, new THREE.Mesh(ell(0.053, 0.052, 0.012, 28, 18), flat(0x24130d)));
    put(ball, new THREE.Mesh(ell(0.04, 0.026, 0.008, 22, 12), flat(0x6b3f2a)), 0, -0.022, 0.006);
    put(ball, new THREE.Mesh(ell(0.029, 0.029, 0.008, 18, 12), flat(0x0b0605)), 0, 0.002, 0.009);
    put(ball, new THREE.Mesh(new THREE.CircleGeometry(0.02, 20), flat(0xffffff)), 0.017, 0.021, 0.014);
    put(ball, new THREE.Mesh(new THREE.CircleGeometry(0.009, 14), flat(0xffffff)), -0.02, -0.02, 0.014);
    const lash = put(g, new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.0115, 8, 30, Math.PI * 0.96), flat(LASH)), 0, 0.0, 0.012);
    lash.rotation.z = Math.PI * 0.02;
    lash.scale.y = 1.12;
    for (const [x, y, r, l] of [[0.06, 0.022, 0.45, 0.02], [0.064, 0.038, 0.8, 0.018], [0.054, 0.052, 1.15, 0.015]]) {
      const w = put(g, new THREE.Mesh(ell(l, 0.006, 0.004, 10, 6), flat(LASH)), x * side, y, 0.012);
      w.rotation.z = r * side;
    }
    const lower = put(g, new THREE.Mesh(new THREE.TorusGeometry(0.056, 0.0035, 6, 20, Math.PI * 0.5), flat(0xd8a493)), 0, -0.002, 0.01);
    lower.rotation.z = Math.PI * 1.25;
    lower.scale.y = 1.15;
    return { g, ball };
  };
  const eyeL = eye(-1), eyeR = eye(1);

  /* soft, diffuse blush */
  const blushCanvas = document.createElement("canvas");
  blushCanvas.width = blushCanvas.height = 64;
  const bctx = blushCanvas.getContext("2d")!;
  const grad = bctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  bctx.fillStyle = grad;
  bctx.fillRect(0, 0, 64, 64);
  const blushMat = new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(blushCanvas), color: C.blush, transparent: true, opacity: 0.6, depthWrite: false,
  });

  for (const side of [-1, 1]) {
    const browGeo = new THREE.CapsuleGeometry(0.0135, 0.115, 6, 16).rotateZ(Math.PI / 2).scale(1, 1, 0.4);
    {
      const p = browGeo.attributes.position;
      for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) - 6.5 * p.getX(i) ** 2);
    }
    const brow = onFace(new THREE.Mesh(browGeo, flat(0x1c1311)), 0.112 * side, 0.058);
    brow.rotateZ(0.04 * side);
    const blush = onFace(new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.18), blushMat), 0.17 * side, -0.155, 0.008);
    blush.scale.set(1, 0.72, 1);
  }
  /* small button nose that catches the light */
  onFace(new THREE.Mesh(ell(0.021, 0.017, 0.012, 20, 14), std(0xf6cdb9, 0.55, 0.1)), 0, -0.15, 0.0);
  /* soft closed smile */
  const smile = onFace(new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.0055, 8, 22, Math.PI * 0.46), flat(0xc4706a)), 0, -0.18);
  smile.rotateZ(Math.PI + Math.PI * 0.27);
  onFace(new THREE.Mesh(ell(0.026, 0.01, 0.004, 16, 8), flat(0xf0a093)), 0, -0.238);

  return { root, body, hips, torso, head, legL, legR, armL, armR, eyeL, eyeR, tail };
}

