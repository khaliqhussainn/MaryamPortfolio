import type * as THREE_NS from "three";

/* Maryam's 3D model: geometry and materials only. Animation lives in Persona.tsx. */
/* Colours sampled from the reference */
const C = {
  skin: 0xf9dccb,
  skinShade: 0xeab6a2,
  blush: 0xf59ca0,
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
  const mHair = std(C.hair, 0.55, 0.0);
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

  /* ── Hijab: cape over the shoulders, back drape, front tail ── */
  put(torso, new THREE.Mesh(lathe([
    [0.19, 1.33], [0.33, 1.21], [0.395, 1.12], [0.415, 1.04], [0.39, 0.985], [0.32, 0.968], [0.25, 0.965],
  ], 0.7, 48), mHijab));
  const back = put(torso, new THREE.Mesh(lathe([[0.001, 0.52], [0.16, 0.56], [0.25, 0.72], [0.3, 0.95], [0.001, 1.0]], 0.22, 32), mHijab), 0, 0, -0.245);
  back.scale.x = 1;
  const tail = group(torso, -0.11, 1.04, 0.232);
  const tailA = put(tail, new THREE.Mesh(ell(0.095, 0.37, 0.034), mHijab), 0, -0.33, 0);
  tailA.rotation.z = -0.06;
  const tailB = put(tail, new THREE.Mesh(ell(0.062, 0.24, 0.03), mHijab), 0.07, -0.22, 0.02);
  tailB.rotation.z = 0.14;

  /* ── Head ── */
  const head = group(torso, 0, 1.69, 0);
  head.scale.setScalar(1.16);

  /* Face */
  const F = { y: -0.02, z: 0.1, rx: 0.26, ry: 0.28, rz: 0.25 };
  put(head, new THREE.Mesh(ell(F.rx, F.ry, F.rz, 48, 36), mSkin), 0, F.y, F.z);

  /* Center-parted hair peeking out under the hijab */
  const hairGeo = carve(ell(F.rx * 1.025, F.ry * 1.025, F.rz * 1.025, 72, 54), (x, y, z) =>
    z > 0 && y > 0.15 - 2.8 * x * x && Math.abs(x) > 0.006);
  put(head, new THREE.Mesh(hairGeo, mHair), 0, F.y, F.z);

  /* Hood with an oval opening for the face */
  const H = { y: 0.05, z: -0.03, rx: 0.37, ry: 0.42, rz: 0.37 };
  const O = { y: -0.03, rx: 0.238, ry: 0.293 };
  const hoodGeo = carve(ell(H.rx, H.ry, H.rz, 72, 54).translate(0, H.y, H.z), (x, y, z) =>
    !(z > 0 && (x / O.rx) ** 2 + ((y - O.y) / O.ry) ** 2 < 1));
  put(head, new THREE.Mesh(hoodGeo, mHijab));
  /* fabric falling beside the cheeks down to the shoulders */
  const flow = carve(lathe([[0.355, 0.0], [0.375, -0.16], [0.37, -0.3], [0.34, -0.42], [0.28, -0.47]], 0.92, 56).translate(0, 0, H.z),
    (x, _y, z) => !(z > 0.02 && Math.abs(x) < 0.3));
  put(head, new THREE.Mesh(flow, mHijab));
  /* soft fabric edge around the face */
  const rim: THREE_NS.Vector3[] = [];
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    const x = O.rx * Math.cos(a), y = O.y + O.ry * Math.sin(a);
    const k = Math.max(0, 1 - (x / H.rx) ** 2 - ((y - H.y) / H.ry) ** 2);
    rim.push(new THREE.Vector3(x, y, H.z + H.rz * Math.sqrt(k)));
  }
  put(head, new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rim, true), 96, 0.032, 10, true), mHijab));

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

  /* Big glossy eyes with a winged upper lash */
  const eye = (side: number) => {
    const g = onFace(new THREE.Group(), 0.1 * side, -0.055);
    const ball = put(g, new THREE.Group());
    ball.scale.set(1, 1.12, 1);
    put(ball, new THREE.Mesh(ell(0.049, 0.056, 0.012, 24, 16), flat(C.iris)));
    put(ball, new THREE.Mesh(ell(0.034, 0.026, 0.008, 20, 12), flat(C.irisLow)), 0, -0.024, 0.006);
    put(ball, new THREE.Mesh(ell(0.026, 0.03, 0.008, 16, 12), flat(0x120a08)), 0, 0.004, 0.009);
    put(ball, new THREE.Mesh(new THREE.CircleGeometry(0.016, 18), flat(0xffffff)), 0.016 * side, 0.024, 0.014);
    put(ball, new THREE.Mesh(new THREE.CircleGeometry(0.0075, 12), flat(0xffffff)), -0.018 * side, -0.024, 0.014);
    const lash = put(g, new THREE.Mesh(new THREE.TorusGeometry(0.056, 0.0105, 8, 28, Math.PI * 0.94), flat(0x15100e)), 0, 0.002, 0.012);
    lash.rotation.z = Math.PI * 0.03;
    lash.scale.y = 1.16;
    const wing = put(g, new THREE.Mesh(ell(0.022, 0.0075, 0.005, 12, 8), flat(0x15100e)), 0.06 * side, 0.03, 0.012);
    wing.rotation.z = 0.5 * side;
    return { g, ball };
  };
  const eyeL = eye(-1), eyeR = eye(1);

  for (const side of [-1, 1]) {
    const brow = onFace(new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.0065, 6, 18, Math.PI * 0.42), flat(C.brow)), 0.105 * side, 0.03);
    brow.rotateZ(Math.PI / 2 - Math.PI * 0.21 + side * -0.12);
    brow.translateY(-0.07);
    const blush = onFace(new THREE.Mesh(new THREE.CircleGeometry(0.05, 24), flat(C.blush, 0.55)), 0.165 * side, -0.125, 0.004);
    blush.scale.set(1, 0.68, 1);
  }
  onFace(new THREE.Mesh(ell(0.013, 0.009, 0.006, 12, 8), flat(C.skinShade)), 0, -0.13);
  const smile = onFace(new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.0075, 8, 20, Math.PI * 0.72), flat(C.lips)), 0, -0.172);
  smile.rotateZ(Math.PI + Math.PI * 0.14);
  onFace(new THREE.Mesh(ell(0.02, 0.009, 0.004, 14, 8), flat(0xe0868c)), 0, -0.214);

  return { root, body, hips, torso, head, legL, legR, armL, armR, eyeL, eyeR, tail };
}

