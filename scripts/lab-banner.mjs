// Generates src/assets/lab-banner.svg: a flat, animated robotics-lab scene.
// Usage: node scripts/lab-banner.mjs   (rewrites src/assets/lab-banner.svg)
// The arm keyframes come from inverse kinematics, so change poses, timing and
// layout here rather than in the SVG.
import { writeFileSync } from 'node:fs';

const out = process.argv[2] ?? new URL('../src/assets/lab-banner.svg', import.meta.url);
const r2 = (n) => Math.round(n * 100) / 100;

// ---------- Robot arm kinematics ----------
const S = { x: 840, y: 240 }; // shoulder pivot
const L1 = 115;
const L2 = 105;
const L3 = 44; // wrist pivot -> tool center (cube center)

// Joint angles (deg, clockwise from "up") that put the tool center at (tx, ty)
// with the gripper pointing straight down and the elbow on the high side.
function ik(tx, ty) {
  const wx = tx;
  const wy = ty - L3;
  const dx = wx - S.x;
  const dy = wy - S.y;
  const d = Math.hypot(dx, dy);
  if (d > L1 + L2) throw new Error(`unreachable ${tx},${ty}`);
  const thW = Math.atan2(dx, -dy);
  const alpha = Math.acos((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d));
  const beta = Math.acos((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2));
  const sols = [1, -1].map((s) => {
    const t1 = thW + s * alpha;
    const t2 = t1 - s * (Math.PI - beta);
    return { t1, t2, ey: S.y - L1 * Math.cos(t1) };
  });
  const { t1, t2 } = sols.sort((a, b) => a.ey - b.ey)[0];
  const deg = (r) => (r * 180) / Math.PI;
  return [r2(deg(t1)), r2(deg(t2 - t1)), r2(180 - deg(t2))];
}

const A = { x: 690, y: 256 }; // cube center on the conveyor
const B = { x: 1010, y: 212 }; // release point above the bin
const P = {
  rest: ik(872, 150),
  hoverA: ik(A.x, A.y - 62),
  graspA: ik(A.x, A.y),
  hoverB: ik(B.x, B.y - 40),
  releaseB: ik(B.x, B.y),
};


// [percent, pose, gripperClosed]
const timeline = [
  [0, 'rest', 0],
  [18, 'hoverA', 0],
  [26, 'graspA', 0],
  [30, 'graspA', 1],
  [38, 'hoverA', 1],
  [58, 'hoverB', 1],
  [65, 'releaseB', 1],
  [68, 'releaseB', 0],
  [76, 'hoverB', 0],
  [92, 'rest', 0],
  [100, 'rest', 0],
];

const jointKeyframes = (j) =>
  timeline.map(([t, pose]) => `${t}%{transform:rotate(${P[pose][j]}deg)}`).join('');
const fingerKeyframes = (dir) =>
  timeline.map(([t, , c]) => `${t}%{transform:translate(${c ? dir * 7 : 0}px,0)}`).join('');

// ---------- Helpers ----------
const periodicPath = (x0, y0, width, periods, fn, step = 3) => {
  let d = '';
  for (let x = 0; x <= width * periods + 0.01; x += step) {
    d += `${d ? 'L' : 'M'}${r2(x0 + x)} ${r2(y0 + fn(x / width))}`;
  }
  return d;
};
const tau = Math.PI * 2;

const tele = [
  { y: 222, c: '#4fd1c5', f: (u) => 6 * Math.sin(tau * u) + 3 * Math.sin(tau * 3 * u + 1) },
  { y: 240, c: '#f6a04d', f: (u) => 5 * Math.sin(tau * 2 * u + 2) + 2 * Math.sin(tau * 5 * u) },
  { y: 257, c: '#f4c542', f: (u) => 4 * Math.sin(tau * u + 4) + 3 * Math.sin(tau * 4 * u + 0.5) },
].map((l) => ({ ...l, d: periodicPath(1132, l.y, 146, 2, l.f, 4) }));

// Sample rack the arm moves around: a 28x28 box with its top-left corner at (x, y).
const cargo = (x, y) =>
  [
    [4, '#ef6f8c'],
    [11, '#f4c542'],
    [18, '#8e7cc3'],
  ]
    .map(
      ([dx, c]) =>
        `<rect class="k-glass" x="${x + dx}" y="${y + 2}" width="6" height="13" rx="2" fill="#e3eff5"/><rect x="${x + dx}" y="${y + 8}" width="6" height="6" rx="2" fill="${c}"/><rect x="${x + dx - 0.5}" y="${y}" width="7" height="4" rx="1.5" fill="${c}"/>`,
    )
    .join('') +
  `<rect x="${x}" y="${y + 12}" width="28" height="16" rx="3" fill="#2bb3a3"/><rect x="${x}" y="${y + 12}" width="28" height="5" rx="2" fill="#5fd0c2"/>`;

// DNA poster: each base pair flips horizontally with a phase lag, which reads as
// a rotating helix. The static transform shows the same twist without animation.
const dna = Array.from({ length: 11 }, (_, i) => {
  const delay = -i * 0.3;
  const phase = (Math.PI * -delay) / 2.6;
  return `<g transform="translate(1441 ${42 + i * 8})"><g class="rung" style="animation-delay:${r2(delay)}s" transform="scale(${r2(Math.cos(phase))} 1)"><path d="M-20 0h40" stroke="#c3ccd4" stroke-width="2"/><circle cx="-20" r="3.5" fill="#4c8fd1"/><circle cx="20" r="3.5" fill="#ef6f8c"/></g></g>`;
}).join('');

// ---------- Scene ----------
const svg = /* svg */ `<svg xmlns="http://www.w3.org/2000/svg" class="lab" viewBox="0 0 1600 400" width="1600" height="400" preserveAspectRatio="xMidYMax meet">
<!-- Flat robotics + biology lab. Animations are plain CSS below; colors with a k-* class
     switch to a night palette when the page is in dark mode. Content outside
     the viewBox only shows on very wide screens (the site lets it overflow). -->
<style>
.lab .k-wall{fill:#e6edf0}.lab .k-wallhi{fill:#f0f5f6}.lab .k-walllo{fill:#d8e3e8}
.lab .k-peg{fill:#d3dfe5}.lab .k-hole{fill:#bfcdd4}
.lab .k-top{fill:#dcb894}.lab .k-edge{fill:#c79f78}.lab .k-body{fill:#43484f}
.lab .k-drawer{fill:#4f555d}.lab .k-handle{fill:#a9b6c2}
.lab .k-dev{fill:#cdd5dc}.lab .k-dev2{fill:#b5c0ca}
.lab .k-board{fill:#fbfdfd}.lab .k-frame{fill:#c3ccd4}
.lab .k-cone{fill:#fffaf0;opacity:.6}.lab .k-sky{fill:#bfe3f5}.lab .k-cloud{fill:#fff}
.lab .k-face{fill:#fff}.lab .k-glass{fill:#d3e6f0;stroke:#a9c3d3;stroke-width:1}
:root[data-theme='dark'] .lab .k-wall{fill:#18212b}
:root[data-theme='dark'] .lab .k-wallhi{fill:#1e2935}
:root[data-theme='dark'] .lab .k-walllo{fill:#141b24}
:root[data-theme='dark'] .lab .k-peg{fill:#212d39}
:root[data-theme='dark'] .lab .k-hole{fill:#17202a}
:root[data-theme='dark'] .lab .k-top{fill:#6a5340}
:root[data-theme='dark'] .lab .k-edge{fill:#56432f}
:root[data-theme='dark'] .lab .k-body{fill:#1c1f23}
:root[data-theme='dark'] .lab .k-drawer{fill:#25292e}
:root[data-theme='dark'] .lab .k-handle{fill:#56626f}
:root[data-theme='dark'] .lab .k-dev{fill:#7b8794}
:root[data-theme='dark'] .lab .k-dev2{fill:#66717d}
:root[data-theme='dark'] .lab .k-board{fill:#b9c3ca}
:root[data-theme='dark'] .lab .k-frame{fill:#56616c}
:root[data-theme='dark'] .lab .k-cone{fill:#ffd47a;opacity:.1}
:root[data-theme='dark'] .lab .k-sky{fill:#1a2a44}
:root[data-theme='dark'] .lab .k-cloud{fill:#2a3b57}
:root[data-theme='dark'] .lab .k-face{fill:#c3ccd4}
:root[data-theme='dark'] .lab .k-bulb{fill:#ffe39a}
:root[data-theme='dark'] .lab .k-star{opacity:.9}
:root[data-theme='dark'] .lab .k-glass{fill:#5f7484;stroke:#8197a6}

/* Pick-and-place cycle */
.lab .j1,.lab .j2,.lab .j3,.lab .fl,.lab .fr{animation:8s cubic-bezier(.55,0,.3,1) infinite}
.lab .j1{animation-name:lab-j1}.lab .j2{animation-name:lab-j2}.lab .j3{animation-name:lab-j3}
.lab .fl{animation-name:lab-fl}.lab .fr{animation-name:lab-fr}
@keyframes lab-j1{${jointKeyframes(0)}}
@keyframes lab-j2{${jointKeyframes(1)}}
@keyframes lab-j3{${jointKeyframes(2)}}
@keyframes lab-fl{${fingerKeyframes(1)}}
@keyframes lab-fr{${fingerKeyframes(-1)}}
.lab .cube-belt{animation:lab-belt-cube 8s infinite}
@keyframes lab-belt-cube{0%,4%{transform:translate(0,0);opacity:1;animation-timing-function:cubic-bezier(.45,0,.35,1)}16%{transform:translate(198px,0)}30%{opacity:1}30.1%,100%{transform:translate(198px,0);opacity:0}}
.lab .belt{animation:lab-belt 8s infinite}
@keyframes lab-belt{0%,4%{stroke-dashoffset:0;animation-timing-function:cubic-bezier(.45,0,.35,1)}16%,100%{stroke-dashoffset:-198px}}
.lab .roller{animation:lab-roller 8s infinite}
@keyframes lab-roller{0%,4%{transform:rotate(0);animation-timing-function:cubic-bezier(.45,0,.35,1)}16%,100%{transform:rotate(1890deg)}}
.lab .cube-held{animation:lab-held 8s infinite}
@keyframes lab-held{0%,29.9%{opacity:0}30%,66.4%{opacity:1}66.5%,100%{opacity:0}}
.lab .cube-drop{animation:lab-drop 8s infinite}
@keyframes lab-drop{0%,66.4%{opacity:0;transform:translate(0,0)}66.5%{opacity:1;transform:translate(0,0);animation-timing-function:cubic-bezier(.5,0,1,1)}70.5%{transform:translate(0,64px);animation-timing-function:ease-out}72%{transform:translate(0,58px)}73.5%{transform:translate(0,64px);opacity:1}73.6%,100%{opacity:0;transform:translate(0,64px)}}
.lab .bin-led{animation:lab-led 8s infinite}
@keyframes lab-led{0%,70%{fill:#6b7785}71%,80%{fill:#5ee08f}81%,100%{fill:#6b7785}}
.lab .cam{animation:lab-cam 8s cubic-bezier(.55,0,.3,1) infinite}
@keyframes lab-cam{0%,92%,100%{transform:rotate(0)}18%,38%{transform:rotate(-7deg)}58%,76%{transform:rotate(9deg)}}

/* Ambient motion */
.lab .tele{animation:lab-scroll146 7s linear infinite}
@keyframes lab-scroll146{to{transform:translate(-146px,0)}}
.lab .print{animation:lab-print 16s linear infinite}
@keyframes lab-print{0%{transform:scale(1,.02);opacity:1}85%,94%{transform:scale(1,1);opacity:1}100%{transform:scale(1,1);opacity:0}}
.lab .gantry{animation:lab-gantry 16s linear infinite}
@keyframes lab-gantry{0%{transform:translate(0,0)}85%,100%{transform:translate(0,-60px)}}
.lab .nozzle{animation:lab-nozzle 1.3s ease-in-out infinite alternate}
@keyframes lab-nozzle{from{transform:translate(-16px,0)}to{transform:translate(16px,0)}}
.lab .hand{animation:lab-spin 60s linear infinite}
@keyframes lab-spin{to{transform:rotate(360deg)}}
.lab .blink{animation:lab-blink 1.6s steps(1) infinite}
.lab .blink.b2{animation-duration:2.3s}.lab .blink.b3{animation-duration:.9s}.lab .blink.b4{animation-duration:3.1s}
@keyframes lab-blink{50%{opacity:.25}}
.lab .sway{animation:lab-sway 5s ease-in-out infinite alternate}
@keyframes lab-sway{from{transform:rotate(-3deg)}to{transform:rotate(3deg)}}
.lab .float{animation:lab-float 6s ease-in-out infinite alternate}
.lab .float.f2{animation-duration:7.5s;animation-delay:-2s}.lab .float.f3{animation-duration:5.2s;animation-delay:-4s}
@keyframes lab-float{to{transform:translate(0,-8px)}}
.lab .draw{stroke-dasharray:1;animation:lab-draw 8s ease-in-out infinite}
@keyframes lab-draw{0%{stroke-dashoffset:1}45%,85%{stroke-dashoffset:0}100%{stroke-dashoffset:-1}}
.lab .drift{animation:lab-drift 40s linear infinite alternate}
@keyframes lab-drift{to{transform:translate(60px,0)}}
.lab .rung{animation:lab-flip 2.6s ease-in-out infinite alternate}
@keyframes lab-flip{from{transform:scale(1,1)}to{transform:scale(-1,1)}}
.lab .stir{animation:lab-flip .3s linear infinite alternate}
.lab .rotor{animation:lab-spin .6s linear infinite}
.lab .bubble{animation:lab-bubble 1.8s ease-in infinite}
.lab .bubble.u2{animation-delay:-.6s}.lab .bubble.u3{animation-delay:-1.2s}
@keyframes lab-bubble{0%{transform:translate(0,0);opacity:0}15%{opacity:.9}100%{transform:translate(0,-18px);opacity:0}}
.lab .glow{animation:lab-glow 2.4s ease-in-out infinite alternate}
@keyframes lab-glow{to{opacity:.4}}
@media (prefers-reduced-motion:reduce){.lab *{animation:none!important}}
</style>
<defs>
<pattern id="lab-holes" width="16" height="16" patternUnits="userSpaceOnUse"><circle class="k-hole" cx="8" cy="8" r="2" fill="#bfcdd4"/></pattern>
<pattern id="lab-drawers" x="0" y="312" width="160" height="88" patternUnits="userSpaceOnUse"><rect class="k-drawer" x="8" y="8" width="144" height="34" rx="4" fill="#4f555d"/><rect class="k-handle" x="64" y="22" width="32" height="5" rx="2.5" fill="#a9b6c2"/><rect class="k-drawer" x="8" y="48" width="144" height="34" rx="4" fill="#4f555d"/><rect class="k-handle" x="64" y="62" width="32" height="5" rx="2.5" fill="#a9b6c2"/></pattern>
<pattern id="lab-hazard" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="18" height="18" fill="#f4c542"/><rect width="9" height="18" fill="#2e3843"/></pattern>
<clipPath id="lab-mon-clip"><rect x="1132" y="202" width="146" height="72" rx="3"/></clipPath>
<clipPath id="lab-win-clip"><rect x="1660" y="52" width="200" height="150"/></clipPath>
</defs>

<!-- Wall -->
<rect class="k-wall" x="-1600" y="-100" width="4800" height="420" fill="#e6edf0"/>
<circle class="k-wallhi" cx="840" cy="190" r="185" fill="#f0f5f6"/>
<circle class="k-wallhi" cx="250" cy="90" r="120" fill="#f0f5f6"/>
<circle class="k-walllo" cx="1250" cy="330" r="160" fill="#d8e3e8"/>
<circle class="k-wallhi" cx="1560" cy="40" r="90" fill="#f0f5f6"/>

<!-- Floating accents -->
<g class="float"><path d="M560 34h14M567 27v14" stroke="#f28c38" stroke-width="4" stroke-linecap="round"/></g>
<g class="float f2"><circle cx="1020" cy="128" r="7" fill="none" stroke="#2bb3a3" stroke-width="3"/></g>
<g class="float f3"><path d="M1512 100l9 15h-18z" fill="#f4c542"/></g>
<g class="float f2"><circle cx="372" cy="36" r="4" fill="#4c8fd1"/><circle cx="386" cy="44" r="2.5" fill="#4c8fd1"/></g>
<g class="float"><path d="M-150 40h12M-144 34v12" stroke="#2bb3a3" stroke-width="4" stroke-linecap="round"/></g>
<g class="float f3"><circle cx="1960" cy="60" r="6" fill="none" stroke="#f28c38" stroke-width="3"/></g>

<!-- Left extension: bookshelf -->
<rect class="k-edge" x="-420" y="118" width="300" height="8" rx="2" fill="#c79f78"/>
<rect class="k-edge" x="-420" y="196" width="300" height="8" rx="2" fill="#c79f78"/>
<rect x="-404" y="78" width="14" height="40" rx="2" fill="#4c8fd1"/><rect x="-388" y="84" width="12" height="34" rx="2" fill="#f28c38"/><rect x="-374" y="74" width="16" height="44" rx="2" fill="#2bb3a3"/><rect x="-354" y="88" width="12" height="30" rx="2" fill="#ef6f8c"/>
<rect x="-330" y="92" width="44" height="26" rx="3" fill="#f4c542"/><rect x="-280" y="80" width="13" height="38" rx="2" fill="#3f4b5b"/><rect x="-262" y="86" width="13" height="32" rx="2" fill="#4c8fd1"/>
<circle cx="-180" cy="102" r="16" fill="#2bb3a3"/><circle cx="-180" cy="102" r="6" fill="#1f8f82"/>
<rect x="-400" y="160" width="60" height="36" rx="3" fill="#cdd5dc" class="k-dev"/><rect x="-332" y="168" width="50" height="28" rx="3" fill="#b5c0ca" class="k-dev2"/><rect x="-270" y="152" width="14" height="44" rx="2" fill="#f28c38"/><rect x="-252" y="158" width="14" height="38" rx="2" fill="#3f4b5b"/><rect x="-234" y="150" width="12" height="46" rx="2" fill="#ef6f8c"/>

<!-- Right extension: window -->
<rect class="k-frame" x="1652" y="44" width="216" height="166" rx="6" fill="#c3ccd4"/>
<rect class="k-sky" x="1660" y="52" width="200" height="150" fill="#bfe3f5"/>
<g clip-path="url(#lab-win-clip)">
  <g class="drift"><path class="k-cloud" d="M1680 120a14 14 0 0 1 26-8a12 12 0 0 1 22 6a10 10 0 0 1 0 20h-46a10 10 0 0 1-2-18z" fill="#fff"/><path class="k-cloud" d="M1770 82a10 10 0 0 1 19-5a9 9 0 0 1 16 5a7 7 0 0 1 0 14h-33a7 7 0 0 1-2-14z" fill="#fff"/></g>
  <g class="k-star" opacity="0"><circle cx="1700" cy="70" r="1.5" fill="#fff"/><circle cx="1760" cy="64" r="1.2" fill="#fff"/><circle cx="1830" cy="90" r="1.6" fill="#fff"/><circle cx="1812" cy="70" r="9" fill="#f6e7b8"/></g>
</g>
<rect class="k-frame" x="1756" y="52" width="8" height="150" fill="#c3ccd4"/>
<rect class="k-frame" x="1660" y="124" width="200" height="6" fill="#c3ccd4"/>
<rect class="k-edge" x="1644" y="206" width="232" height="8" rx="2" fill="#c79f78"/>

<!-- Pegboard with tools -->
<rect class="k-peg" x="40" y="50" width="262" height="112" rx="6" fill="#d3dfe5"/>
<rect x="40" y="50" width="262" height="112" rx="6" fill="url(#lab-holes)"/>
<g stroke-linecap="round">
  <path d="M74 70v58" stroke="#5b6b7c" stroke-width="5"/><circle cx="74" cy="66" r="9" fill="none" stroke="#5b6b7c" stroke-width="5"/>
  <rect x="98" y="62" width="12" height="34" rx="5" fill="#ef6f8c"/><path d="M104 96v40" stroke="#8796a5" stroke-width="3"/>
  <rect x="122" y="62" width="12" height="34" rx="5" fill="#f4c542"/><path d="M128 96v32" stroke="#8796a5" stroke-width="3"/>
  <path d="M158 66l8 60M178 66l-8 60" stroke="#4c8fd1" stroke-width="6"/>
  <circle cx="218" cy="88" r="20" fill="#2bb3a3"/><circle cx="218" cy="88" r="9" class="k-peg" fill="#d3dfe5"/>
  <path d="M262 64v74" stroke="#3f4b5b" stroke-width="4"/><path d="M252 64h20" stroke="#f28c38" stroke-width="8"/>
  <path d="M286 70v40" stroke="#8796a5" stroke-width="3"/>
</g>

<!-- Shelf -->
<rect class="k-edge" x="340" y="150" width="210" height="7" rx="2" fill="#c79f78"/>
<path d="M356 157v12M534 157v12" class="k-frame" stroke="#c3ccd4" stroke-width="4"/>
<rect class="k-glass" x="357" y="114" width="12" height="10" fill="#e3eff5"/><rect x="355" y="106" width="16" height="9" rx="2" fill="#3b76b3"/>
<rect class="k-glass" x="350" y="121" width="26" height="29" rx="6" fill="#e3eff5"/><rect x="350" y="134" width="26" height="16" rx="5" fill="#7fb6e6"/><rect x="354" y="127" width="18" height="8" rx="1" fill="#fff" opacity=".85"/>
<rect x="390" y="118" width="10" height="9" fill="#b56a2a"/><rect x="388" y="111" width="14" height="8" rx="2" fill="#3b76b3"/>
<rect x="384" y="125" width="22" height="25" rx="5" fill="#c77a35"/><rect x="387" y="132" width="16" height="8" rx="1" fill="#fff" opacity=".8"/>
<path d="M437 129c-1-9 2-14 5-12c0-6 5-7 6-1c2-5 7-4 7 1c3-3 7-1 5 5l-3 7z" fill="#9b87e0"/>
<rect class="k-board" x="418" y="128" width="56" height="22" rx="3" fill="#fbfdfd"/><rect x="418" y="138" width="56" height="6" fill="#4c8fd1"/><rect class="k-frame" x="432" y="128" width="28" height="3" rx="1.5" fill="#c3ccd4"/>
<g><rect x="494" y="124" width="26" height="22" rx="5" fill="#cdd5dc" class="k-dev"/><circle cx="502" cy="134" r="3" fill="#2e3843"/><circle cx="512" cy="134" r="3" fill="#2e3843"/><path d="M507 124v-8" stroke="#3f4b5b" stroke-width="2"/><circle cx="507" cy="114" r="3" fill="#f28c38" class="blink b4"/><rect x="497" y="146" width="20" height="4" fill="#3f4b5b"/></g>
<rect x="528" y="112" width="12" height="38" rx="2" fill="#2bb3a3"/>

<!-- Clock -->
<circle cx="626" cy="86" r="27" fill="#3f4b5b"/>
<circle class="k-face" cx="626" cy="86" r="22" fill="#fff"/>
<path d="M626 86l9-9" stroke="#3f4b5b" stroke-width="3" stroke-linecap="round"/>
<g transform="translate(626 86)"><g class="hand"><path d="M0 4v-19" stroke="#e5534b" stroke-width="1.6" stroke-linecap="round"/></g></g>
<circle cx="626" cy="86" r="2.5" fill="#3f4b5b"/>

<!-- Whiteboard -->
<rect class="k-frame" x="1104" y="36" width="270" height="146" rx="6" fill="#c3ccd4"/>
<rect class="k-board" x="1110" y="42" width="258" height="134" rx="3" fill="#fbfdfd"/>
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
  <ellipse cx="1150" cy="70" rx="23" ry="15" stroke="#2bb3a3" stroke-width="3"/>
  <circle cx="1145" cy="70" r="6" fill="#2bb3a3" fill-opacity=".3" stroke="#2bb3a3" stroke-width="2"/>
  <ellipse cx="1161" cy="76" rx="4.5" ry="2.2" stroke="#2bb3a3" stroke-width="1.5"/><circle cx="1158" cy="63" r="1.6" fill="#2bb3a3" stroke="none"/><circle cx="1136" cy="78" r="1.6" fill="#2bb3a3" stroke="none"/>
  <path d="M1184 64h30M1184 76h20" stroke="#3b76b3" stroke-width="3"/>
  <path d="M1140 160l12-22h-24z" fill="#3b76b3" stroke="none"/>
  <path d="M1140 138l26-36l40 6" stroke="#3b76b3" stroke-width="3"/>
  <circle cx="1166" cy="102" r="5" fill="#fbfdfd" stroke="#3b76b3" stroke-width="2.5" class="k-board"/>
  <circle cx="1140" cy="138" r="5" fill="#fbfdfd" stroke="#3b76b3" stroke-width="2.5" class="k-board"/>
  <path d="M1206 108l8-6m-8 6l8 6" stroke="#3b76b3" stroke-width="2.5"/>
  <path d="M1150 124a16 16 0 0 1 8-14" stroke="#e5534b" stroke-width="2" stroke-dasharray="3 3"/>
  <path d="M1250 70v86h104" stroke="#3f4b5b" stroke-width="2"/>
  <path class="draw" pathLength="1" d="M1254 146c18-2 22-56 40-56s20 40 34 40s14-34 22-50" stroke="#e5534b" stroke-width="3"/>
  <path d="M1262 156v-4M1286 156v-4M1310 156v-4M1334 156v-4" stroke="#3f4b5b" stroke-width="2"/>
</g>
<rect x="1180" y="176" width="34" height="5" rx="2" fill="#4c8fd1"/><rect x="1220" y="176" width="34" height="5" rx="2" fill="#e5534b"/>

<!-- DNA poster -->
<rect class="k-frame" x="1398" y="26" width="86" height="116" rx="4" fill="#c3ccd4"/>
<rect class="k-board" x="1403" y="31" width="76" height="106" rx="2" fill="#fbfdfd"/>
${dna}
<rect x="1421" y="128" width="40" height="3" rx="1.5" fill="#c3ccd4"/>

<!-- Lamps -->
<g>
  <path class="k-cone" d="M676 60h28l90 236h-208z" fill="#fffaf0" opacity=".6"/>
  <path class="k-cone" d="M996 60h28l90 236h-208z" fill="#fffaf0" opacity=".6"/>
  <path d="M690 -10v40M1010 -10v40" stroke="#3f4b5b" stroke-width="2"/>
  <path d="M668 60a22 26 0 0 1 44 0z" fill="#2e3843"/><path d="M988 60a22 26 0 0 1 44 0z" fill="#2e3843"/>
  <rect x="686" y="28" width="8" height="8" rx="2" fill="#2e3843"/><rect x="1006" y="28" width="8" height="8" rx="2" fill="#2e3843"/>
  <ellipse class="k-bulb" cx="690" cy="61" rx="9" ry="4" fill="#fff3c4"/><ellipse class="k-bulb" cx="1010" cy="61" rx="9" ry="4" fill="#fff3c4"/>
</g>

<!-- Bench -->
<rect class="k-top" x="-1600" y="294" width="4800" height="12" fill="#dcb894"/>
<rect class="k-edge" x="-1600" y="306" width="4800" height="5" fill="#c79f78"/>
<rect class="k-body" x="-1600" y="311" width="4800" height="100" fill="#43484f"/>
<rect x="-1600" y="311" width="4800" height="100" fill="url(#lab-drawers)"/>
<rect x="770" y="311" width="140" height="10" fill="url(#lab-hazard)"/>

<!-- Left extension: toolbox on the bench -->
<rect x="-330" y="262" width="96" height="32" rx="4" fill="#e5534b"/><rect x="-330" y="270" width="96" height="5" fill="#c43f38"/><path d="M-300 262v-10h36v10" fill="none" stroke="#3f4b5b" stroke-width="4"/>
<rect x="-180" y="250" width="40" height="44" rx="4" fill="#4c8fd1"/><rect x="-176" y="256" width="32" height="14" rx="2" fill="#1e2833"/><circle cx="-160" cy="282" r="5" fill="#f4c542"/>

<!-- 3D printer -->
<g>
  <rect x="120" y="168" width="10" height="126" fill="#3f4b5b"/>
  <rect x="260" y="168" width="10" height="126" fill="#3f4b5b"/>
  <rect x="120" y="164" width="150" height="12" rx="3" fill="#3f4b5b"/>
  <rect x="116" y="282" width="158" height="12" rx="3" fill="#2e3843"/>
  <rect class="k-dev" x="140" y="270" width="110" height="7" rx="2" fill="#cdd5dc"/>
  <g transform="translate(195 270)"><rect class="print" x="-18" y="-60" width="36" height="60" rx="3" fill="#ef6f8c"/></g>
  <g class="gantry" transform="translate(0 -60)">
    <rect x="130" y="244" width="130" height="6" rx="2" fill="#8796a5"/>
    <g class="nozzle"><rect x="185" y="240" width="20" height="18" rx="3" fill="#f4c542"/><path d="M190 258h10l-5 8z" fill="#2e3843"/></g>
  </g>
  <rect x="236" y="186" width="18" height="10" rx="2" fill="#1e2833"/><circle cx="245" cy="191" r="2" fill="#5ee08f" class="blink"/>
  <circle cx="278" cy="196" r="14" fill="#2bb3a3"/><circle cx="278" cy="196" r="5" fill="#1f8f82"/>
</g>

<!-- Microscope -->
<path class="k-dev" d="M336 286V240a14 14 0 0 0-14-14h-4v-12h4a26 26 0 0 1 26 26v46z" fill="#cdd5dc"/>
<g transform="translate(316 220) rotate(-30)"><rect x="-6" y="-26" width="12" height="30" rx="3" fill="#3f4b5b"/><rect x="-7.5" y="-34" width="15" height="9" rx="2" fill="#2e3843"/></g>
<rect x="312" y="224" width="12" height="15" rx="3" fill="#8796a5"/><rect x="315" y="238" width="6" height="5" rx="1" fill="#2e3843"/>
<rect x="302" y="246" width="42" height="5" rx="2" fill="#2e3843"/><rect x="306" y="243" width="24" height="3" fill="#cfe9f5"/><ellipse cx="318" cy="243.5" rx="4" ry="1.5" fill="#ef6f8c"/>
<rect x="309" y="255" width="18" height="14" rx="3" fill="#3f4b5b"/><circle class="glow" cx="318" cy="262" r="4" fill="#fff3c4"/>
<circle cx="342" cy="262" r="7" fill="#8796a5"/><circle cx="342" cy="262" r="2.5" fill="#3f4b5b"/>
<rect x="298" y="284" width="56" height="10" rx="3" fill="#3f4b5b"/>

<!-- Petri dishes -->
<rect class="k-glass" x="358" y="285" width="40" height="9" rx="3" fill="#e3eff5"/><rect x="360" y="288" width="36" height="5" rx="2" fill="#f6d77a"/>
<circle cx="367" cy="289" r="2" fill="#ef6f8c"/><circle cx="378" cy="290" r="1.6" fill="#ef6f8c"/><circle cx="389" cy="289" r="2.2" fill="#ef6f8c"/>
<rect class="k-glass" x="360" y="276" width="36" height="9" rx="3" fill="#e3eff5"/><rect x="362" y="279" width="32" height="5" rx="2" fill="#f4b6c4"/>
<circle cx="369" cy="280" r="1.8" fill="#8e7cc3"/><circle cx="381" cy="281" r="2.2" fill="#8e7cc3"/><circle cx="389" cy="280" r="1.5" fill="#8e7cc3"/>

<!-- Test tube rack -->
<rect class="k-glass" x="409" y="247" width="7" height="42" rx="3.5" fill="#e3eff5"/><rect x="409" y="268" width="7" height="21" rx="3.5" fill="#ef6f8c"/><rect x="408.5" y="243" width="8" height="5" rx="1.5" fill="#d9506f"/><rect class="k-glass" x="418" y="247" width="7" height="42" rx="3.5" fill="#e3eff5"/><rect x="418" y="272" width="7" height="17" rx="3.5" fill="#2bb3a3"/><rect x="417.5" y="243" width="8" height="5" rx="1.5" fill="#1f8f82"/><rect class="k-glass" x="427" y="247" width="7" height="42" rx="3.5" fill="#e3eff5"/><rect x="427" y="268" width="7" height="21" rx="3.5" fill="#f4c542"/><rect x="426.5" y="243" width="8" height="5" rx="1.5" fill="#dba92c"/><rect class="k-glass" x="436" y="247" width="7" height="42" rx="3.5" fill="#e3eff5"/><rect x="436" y="272" width="7" height="17" rx="3.5" fill="#8e7cc3"/><rect x="435.5" y="243" width="8" height="5" rx="1.5" fill="#7563ad"/><rect class="k-glass" x="445" y="247" width="7" height="42" rx="3.5" fill="#e3eff5"/><rect x="445" y="268" width="7" height="21" rx="3.5" fill="#f6a04d"/><rect x="444.5" y="243" width="8" height="5" rx="1.5" fill="#e0812f"/>
<rect x="404" y="262" width="50" height="6" rx="2" fill="#4c8fd1"/><rect x="404" y="262" width="4" height="30" fill="#3b76b3"/><rect x="450" y="262" width="4" height="30" fill="#3b76b3"/><rect x="402" y="288" width="54" height="6" rx="2" fill="#3b76b3"/>

<!-- Conveyor -->
<rect x="516" y="282" width="6" height="12" fill="#2e3843"/><rect x="696" y="282" width="6" height="12" fill="#2e3843"/>
<rect x="500" y="270" width="218" height="14" rx="7" fill="#2e3843"/>
<path class="belt" d="M506 271.5h206" stroke="#5b6b7c" stroke-width="3" stroke-dasharray="10 8"/>
<g transform="translate(507 277)"><g class="roller"><circle r="5" fill="#8796a5"/><path d="M-4 0h8" stroke="#2e3843" stroke-width="2"/></g></g>
<g transform="translate(711 277)"><g class="roller"><circle r="5" fill="#8796a5"/><path d="M-4 0h8" stroke="#2e3843" stroke-width="2"/></g></g>
<g class="cube-belt" transform="translate(198 0)">${cargo(478, 242)}</g>
<path d="M460 214h76l-6 26v54h-64v-54z" fill="#4c8fd1"/>
<path d="M466 240h64v8h-64z" fill="#3b76b3"/><rect x="478" y="258" width="40" height="22" rx="3" fill="#3b76b3"/><circle cx="488" cy="269" r="3" fill="#f4c542" class="blink b3"/>

<!-- Bin -->
<rect x="975" y="232" width="70" height="10" rx="2" fill="#c99a22"/>
<g class="cube-drop" opacity="0">${cargo(996, 198)}</g>
<path d="M970 238h80l-6 56h-68z" fill="#f4c542"/>
<path d="M972 252h76l-1 8h-74z" fill="#dba92c"/>
<circle class="bin-led" cx="1034" cy="276" r="4" fill="#6b7785"/>

<!-- Camera on tripod -->
<path d="M1085 252l-16 42M1085 252l16 42M1085 252v42" stroke="#3f4b5b" stroke-width="3" stroke-linecap="round"/>
<g transform="translate(1085 248)"><g class="cam">
  <rect x="-16" y="-18" width="36" height="22" rx="4" fill="#2e3843"/>
  <rect x="-28" y="-14" width="13" height="14" rx="2" fill="#3f4b5b"/><circle cx="-28" cy="-7" r="5" fill="#4c8fd1"/>
  <circle cx="13" cy="-12" r="2.5" fill="#e5534b" class="blink"/>
</g></g>

<!-- Monitor with joint telemetry -->
<rect x="1196" y="278" width="18" height="12" fill="#3f4b5b"/><rect x="1176" y="289" width="58" height="5" rx="2" fill="#3f4b5b"/>
<rect x="1126" y="196" width="158" height="84" rx="6" fill="#2e3843"/>
<rect x="1132" y="202" width="146" height="72" rx="3" fill="#1e2833"/>
<g clip-path="url(#lab-mon-clip)">
  <path d="M1132 231h146M1132 249h146" stroke="#2a3a48" stroke-width="1"/>
  <g class="tele">${tele.map((l) => `<path d="${l.d}" fill="none" stroke="${l.c}" stroke-width="2" stroke-linejoin="round"/>`).join('')}</g>
  <rect x="1138" y="207" width="26" height="4" rx="2" fill="#4a5c6c"/><rect x="1168" y="207" width="14" height="4" rx="2" fill="#4a5c6c"/>
  <rect x="1236" y="264" width="36" height="5" rx="2" fill="#2bb3a3"/>
</g>

<!-- Pipette stand -->
<rect x="1311" y="234" width="4" height="56" fill="#8796a5"/><rect x="1294" y="236" width="38" height="4" rx="2" fill="#8796a5"/>
<rect x="1299" y="233" width="6" height="5" rx="1.5" fill="#f4c542"/><rect x="1301" y="237" width="2" height="4" fill="#8796a5"/><rect class="k-dev" x="1298" y="240" width="8" height="30" rx="3.5" fill="#cdd5dc"/><rect x="1305" y="244" width="4" height="7" rx="2" fill="#b5c0ca" class="k-dev2"/><rect x="1298" y="252" width="8" height="4" fill="#f4c542"/><path d="M1299 270h6l-1.5 8h-3z" fill="#8796a5"/><path d="M1300.5 278h3l-1.2 9h-.6z" fill="#f6d77a"/>
<rect x="1321" y="233" width="6" height="5" rx="1.5" fill="#4c8fd1"/><rect x="1323" y="237" width="2" height="4" fill="#8796a5"/><rect class="k-dev" x="1320" y="240" width="8" height="30" rx="3.5" fill="#cdd5dc"/><rect x="1327" y="244" width="4" height="7" rx="2" fill="#b5c0ca" class="k-dev2"/><rect x="1320" y="252" width="8" height="4" fill="#4c8fd1"/><path d="M1321 270h6l-1.5 8h-3z" fill="#8796a5"/><path d="M1322.5 278h3l-1.2 9h-.6z" fill="#9cc8ef"/>
<rect x="1292" y="288" width="42" height="6" rx="2" fill="#3f4b5b"/>

<!-- Flask on a magnetic stirrer -->
<rect class="k-dev" x="1338" y="280" width="46" height="14" rx="4" fill="#cdd5dc"/><rect x="1343" y="284" width="14" height="6" rx="1.5" fill="#1e2833"/><rect x="1345" y="286" width="8" height="2" fill="#5ee08f"/><circle cx="1375" cy="287" r="4" fill="#3f4b5b"/>
<path class="k-glass" d="M1354 230h14v16l14 30a3 3 0 0 1-3 4h-36a3 3 0 0 1-3-4l14-30z" fill="#e3eff5"/>
<path d="M1348.4 258h25.2l8.4 18a3 3 0 0 1-3 4h-36a3 3 0 0 1-3-4z" fill="#8e7cc3"/>
<g fill="#fff"><circle class="bubble" cx="1357" cy="274" r="1.8"/><circle class="bubble u2" cx="1363" cy="276" r="1.4"/><circle class="bubble u3" cx="1367" cy="273" r="1.6"/></g>
<g transform="translate(1361 277)"><g class="stir"><rect x="-6" y="-1.5" width="12" height="3" rx="1.5" fill="#fff"/></g></g>
<path d="M1354 230h14v16l14 30a3 3 0 0 1-3 4h-36a3 3 0 0 1-3-4l14-30z" fill="none" stroke="#a9c3d3" stroke-width="1.5"/>
<rect x="1352" y="227" width="18" height="4" rx="2" fill="#a9c3d3"/>

<!-- Control cabinet -->
<rect class="k-dev" x="1392" y="152" width="112" height="142" rx="6" fill="#cdd5dc"/>
<rect class="k-dev2" x="1392" y="152" width="112" height="10" rx="5" fill="#b5c0ca"/>
<rect x="1404" y="172" width="58" height="26" rx="3" fill="#1e2833"/>
<rect x="1410" y="179" width="30" height="4" rx="2" fill="#5ee08f"/><rect x="1410" y="187" width="20" height="4" rx="2" fill="#4fd1c5"/>
<circle cx="1478" cy="178" r="4" fill="#5ee08f" class="blink"/><circle cx="1490" cy="178" r="4" fill="#f4c542" class="blink b2"/><circle cx="1478" cy="192" r="4" fill="#4c8fd1" class="blink b3"/><circle cx="1490" cy="192" r="4" fill="#e5534b" class="blink b4"/>
<path class="k-dev2" d="M1406 214h84M1406 222h84M1406 230h84" stroke="#b5c0ca" stroke-width="3" stroke-linecap="round"/>
<circle cx="1448" cy="264" r="17" fill="#f4c542"/><circle cx="1448" cy="264" r="11" fill="#e5534b"/><circle cx="1445" cy="261" r="4" fill="#f07a72"/>

<!-- Centrifuge -->
<rect class="k-dev" x="1514" y="262" width="58" height="32" rx="8" fill="#cdd5dc"/>
<g transform="translate(1543 259) scale(1 .35)"><g class="rotor"><circle r="17" fill="#3f4b5b"/><circle cx="11" r="3.5" fill="#ef6f8c"/><circle cx="-11" r="3.5" fill="#2bb3a3"/><circle cy="11" r="3.5" fill="#f4c542"/><circle cy="-11" r="3.5" fill="#8e7cc3"/></g></g>
<path d="M1518 264a25 14 0 0 1 50 0z" fill="#bfe3f5" opacity=".55"/><path d="M1518 264a25 14 0 0 1 50 0" fill="none" stroke="#a9b6c2" stroke-width="2"/>
<rect x="1522" y="272" width="22" height="9" rx="2" fill="#1e2833"/><rect x="1525" y="275" width="12" height="3" rx="1" fill="#5ee08f"/><circle cx="1556" cy="277" r="3.5" fill="#5ee08f" class="blink b2"/><circle cx="1565" cy="277" r="3.5" fill="#3f4b5b"/>

<!-- Plant -->
<g transform="translate(1600 268)"><g class="sway">
  <path d="M0 0c-4-22-22-30-30-28c4 12 14 24 30 28z" fill="#3fae7a"/>
  <path d="M0 0c2-26 18-38 30-38c-2 16-14 32-30 38z" fill="#2f8f63"/>
  <path d="M0 0c-2-18 2-36 6-46c8 14 4 34-6 46z" fill="#3fae7a"/>
</g></g>
<path d="M1584 266h32l-5 28h-22z" fill="#e0805a"/><rect x="1582" y="264" width="36" height="6" rx="2" fill="#c96a46"/>

<!-- Right extension: boxes -->
<rect x="1700" y="250" width="56" height="44" rx="3" fill="#dcb894" class="k-top"/><rect x="1700" y="264" width="56" height="6" fill="#c79f78" class="k-edge"/>
<rect x="1714" y="214" width="40" height="36" rx="3" fill="#cdd5dc" class="k-dev"/>
<rect x="1800" y="236" width="20" height="58" rx="4" fill="#2bb3a3"/><rect x="1824" y="252" width="20" height="42" rx="4" fill="#f28c38"/>

<!-- Robot arm -->
<path d="M796 294l8-26h72l8 26z" fill="#3f4b5b"/>
<rect x="812" y="244" width="56" height="30" rx="8" fill="#f28c38"/>
<rect x="852" y="244" width="16" height="30" rx="6" fill="#d9732a"/>
<rect x="822" y="282" width="36" height="4" rx="2" fill="#f4c542"/>
<g transform="translate(${S.x} ${S.y})">
  <g class="j1" transform="rotate(${P.hoverA[0]})">
    <rect x="-16" y="-${L1 + 14}" width="32" height="${L1 + 30}" rx="16" fill="#f28c38"/>
    <rect x="6" y="-${L1 - 4}" width="10" height="${L1 - 8}" rx="5" fill="#d9732a"/>
    <rect x="-8" y="-72" width="8" height="30" rx="4" fill="#fff" opacity=".85"/>
    <circle r="15" fill="#2e3843"/><circle r="6" fill="#8796a5"/>
    <g transform="translate(0 -${L1})">
      <g class="j2" transform="rotate(${P.hoverA[1]})">
        <rect x="-12" y="-${L2 + 10}" width="24" height="${L2 + 22}" rx="12" fill="#f6a04d"/>
        <rect x="4" y="-${L2 - 4}" width="8" height="${L2 - 10}" rx="4" fill="#e0812f"/>
        <circle r="12" fill="#2e3843"/><circle r="5" fill="#8796a5"/>
        <g transform="translate(0 -${L2})">
          <g class="j3" transform="rotate(${P.hoverA[2]})">
            <g class="cube-held" opacity="0"><g transform="translate(0 -${L3}) rotate(180)">${cargo(-14, -14)}</g></g>
            <rect x="-7" y="-16" width="14" height="14" fill="#3f4b5b"/>
            <rect x="-15" y="-20" width="30" height="6" rx="2" fill="#8796a5"/>
            <rect x="-24" y="-29" width="48" height="10" rx="3" fill="#cdd5dc"/>
            <g class="fl"><rect x="-27" y="-56" width="6" height="28" rx="2" fill="#46525f"/></g>
            <g class="fr"><rect x="21" y="-56" width="6" height="28" rx="2" fill="#46525f"/></g>
            <circle r="9" fill="#2e3843"/><circle r="3.5" fill="#8796a5"/>
          </g>
        </g>
      </g>
    </g>
  </g>
</g>
</svg>
`;

writeFileSync(out, svg);
console.log(`wrote ${out} (${(svg.length / 1024).toFixed(1)} KB)`);
