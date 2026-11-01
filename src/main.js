import './style.css';
import * as THREE from 'three';
import seoImgUrl from './Images/Seo.jpg';
import strategyImgUrl from './Images/strategy.jpg';
import reporterLogoUrl from './Images/Reporter_TV_2023.jpg';
import elanceLogoUrl from './Images/elance.123.jpg';
import byjuLogoUrl from './Images/byju lp.jpg';

const TOTAL_FRAMES = 240;
const canvas = document.getElementById('animation-canvas');
const ctx = canvas.getContext('2d', { alpha: false });
const heroEditorial = document.getElementById('hero-editorial');
const summarySection = document.getElementById('professional-summary');
const summaryHeader = summarySection?.querySelector('.summary-header-group');
const summaryParagraph = summarySection?.querySelector('.summary-paragraph');
const summaryAccentLine = summarySection?.querySelector('.summary-accent-line');

const skillsSection = document.getElementById('skills-expertise');
const skillsHeader = document.getElementById('skills-header');
const skillRows = document.querySelectorAll('.skill-row');
const visualSeo = document.getElementById('visual-seo-wrapper');
const visualStrategy = document.getElementById('visual-strategy-wrapper');
const seoImgEl = document.getElementById('seo-visual-img');
const strategyImgEl = document.getElementById('strategy-visual-img');

if (seoImgEl && seoImgUrl) seoImgEl.src = seoImgUrl;
if (strategyImgEl && strategyImgUrl) strategyImgEl.src = strategyImgUrl;

const reporterLogoEl = document.getElementById('reporter-logo-img');
const elanceLogoEl = document.getElementById('elance-logo-img');
const byjuLogoEl = document.getElementById('byju-logo-img');

if (reporterLogoEl && reporterLogoUrl) reporterLogoEl.src = reporterLogoUrl;
if (elanceLogoEl && elanceLogoUrl) elanceLogoEl.src = elanceLogoUrl;
if (byjuLogoEl && byjuLogoUrl) byjuLogoEl.src = byjuLogoUrl;

// Work Experience Elements
const experienceSection = document.getElementById('work-experience');
const experienceHeader = document.getElementById('experience-header');
const experienceStage = document.getElementById('experience-stage');
const timelineProgress = document.getElementById('timeline-spine-progress');
const timelineGlowHead = document.getElementById('timeline-spine-glow-head');
const milestonesTrack = document.getElementById('experience-milestones-track');
const milestonePanels = document.querySelectorAll('.experience-milestone-panel');

// Premium Scroll-Triggered Reveal via IntersectionObserver
let experienceObserver = null;
if (typeof IntersectionObserver !== 'undefined' && milestonePanels.length > 0) {
  experienceObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        }
      });
    },
    {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.15,
    }
  );
  milestonePanels.forEach((panel) => experienceObserver.observe(panel));
} else {
  // Resilient fallback for environments without IntersectionObserver
  milestonePanels.forEach((panel) => panel.classList.add('is-revealed'));
}

window.addEventListener('beforeunload', () => {
  if (experienceObserver) {
    experienceObserver.disconnect();
    experienceObserver = null;
  }
});

// 04 / Education & Beyond Elements
const educationSection = document.getElementById('education-section');
const waterCanvas = document.getElementById('three-water-canvas');
const foundationHeader = document.getElementById('foundation-header');
const foundationHeaderLine = foundationHeader?.querySelector('.foundation-header-line');
const eduDegreeCard = document.getElementById('edu-degree-card');
const certCard1 = document.getElementById('cert-card-1');
const certCard2 = document.getElementById('cert-card-2');
const foundationLanguages = document.getElementById('foundation-languages');
const languagePills = document.querySelectorAll('.language-pill');

// 05 / Contact Elements
const contactSection = document.getElementById('contact-section');
const contactHeader = document.getElementById('contact-header');
const contactHeaderLine = contactHeader?.querySelector('.contact-header-line');
const contactHeadingLines = contactHeader?.querySelectorAll('.heading-line-reveal');
const contactSubtitle = contactHeader?.querySelector('.contact-subtitle');
const contactCardEmail = document.getElementById('contact-card-email');
const contactCardPhone = document.getElementById('contact-card-phone');
const contactCardLocation = document.getElementById('contact-card-location');
const contactCtaBlock = document.getElementById('contact-cta-block');
const portfolioFooter = document.getElementById('portfolio-footer');

const navLinks = document.querySelectorAll('.nav-link');

const images = new Array(TOTAL_FRAMES);
const loaded = new Array(TOTAL_FRAMES).fill(false);
let loadedCount = 0;
let currentFrameIndex = 0;
let targetFrameIndex = 0;
let lastRenderedFrameIndex = -1;
let currentProgress = 0;
let targetProgress = 0;

function pad(num) {
  return String(num).padStart(3, '0');
}

function getFrameUrl(index) {
  const frameNum = index + 1;
  const baseUrl = import.meta.env.BASE_URL || '/';
  const prefix = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${prefix}frames/ezgif-frame-${pad(frameNum)}.jpg`;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const displayWidth = window.innerWidth;
  const displayHeight = window.innerHeight;

  canvas.width = Math.round(displayWidth * dpr);
  canvas.height = Math.round(displayHeight * dpr);

  canvas.style.width = '100%';
  canvas.style.height = '100%';

  lastRenderedFrameIndex = -1;
  renderFrame(currentFrameIndex);

  resizeWater();
}

function getScrollProgress() {
  const scrollElement = document.documentElement;
  const maxScroll = scrollElement.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) return 0;
  const progress = (window.pageYOffset || window.scrollY || scrollElement.scrollTop || 0) / maxScroll;
  return Math.max(0, Math.min(1, progress));
}

function getBestFrame(idealIndex) {
  if (loaded[idealIndex] && images[idealIndex]) {
    return { img: images[idealIndex], index: idealIndex };
  }

  for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
    const prev = idealIndex - offset;
    if (prev >= 0 && loaded[prev] && images[prev]) {
      return { img: images[prev], index: prev };
    }
    const next = idealIndex + offset;
    if (next < TOTAL_FRAMES && loaded[next] && images[next]) {
      return { img: images[next], index: next };
    }
  }

  return null;
}

function renderFrame(frameIndex) {
  const result = getBestFrame(frameIndex);
  if (!result) return;

  const { img, index: actualIndex } = result;
  if (!img.complete || img.naturalWidth === 0) return;

  if (actualIndex === lastRenderedFrameIndex && canvas.dataset.rendered === 'true') {
    return;
  }

  const cw = canvas.width;
  const ch = canvas.height;
  const nw = img.naturalWidth || 1280;
  const nh = img.naturalHeight || 720;

  // Cover math: fills entire viewport edge-to-edge
  const scale = Math.max(cw / nw, ch / nh);
  const dw = Math.round(nw * scale);
  const dh = Math.round(nh * scale);

  // Position portrait centered on mobile portrait and right-biased on desktop
  const isPortrait = ch > cw;
  const horizontalFactor = isPortrait ? 0.50 : 0.70;
  let dx = Math.round((cw - dw) * horizontalFactor);
  dx = Math.min(0, Math.max(cw - dw, dx));

  let dy = Math.round((ch - dh) / 2);
  dy = Math.min(0, Math.max(ch - dh, dy));

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(img, dx, dy, dw, dh);

  lastRenderedFrameIndex = actualIndex;
  canvas.dataset.rendered = 'true';
  window.__lastRenderedIndex = actualIndex;
}

// Manual scroll restoration so refreshes always start smoothly at the top without flicker
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;

window.addEventListener('mousemove', (e) => {
  targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

// Desktop 3D perspective tilt on hover
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const tiltCards = document.querySelectorAll('.milestone-card-glass, .edu-card-glass, .cert-card-glass, .contact-card-glass');
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${(x * 8).toFixed(2)}deg) rotateX(${(-y * 8).toFixed(2)}deg) translateZ(6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ==========================================================================
// Three.js Animated Liquid Water Environment & Mist Particles
// ==========================================================================
let waterScene, waterCamera, waterRenderer, waterMesh, waterUniforms, particleSystem, particleGeo;
let isWaterInitialized = false;

function initWaterScene() {
  if (!waterCanvas || isWaterInitialized) return;

  waterScene = new THREE.Scene();
  waterCamera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 100);
  waterCamera.position.set(0, 3.2, 7.2);
  waterCamera.lookAt(0, 0.35, 0);

  waterRenderer = new THREE.WebGLRenderer({
    canvas: waterCanvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  waterRenderer.setSize(window.innerWidth, window.innerHeight);
  waterRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  // High-density liquid water surface plane
  const planeGeo = new THREE.PlaneGeometry(36, 26, 128, 128);
  planeGeo.rotateX(-Math.PI * 0.48);

  waterUniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uWaveIntensity: { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uMouse: { value: new THREE.Vector2(0, 0) },
  };

  const vertexShader = `
    uniform float uTime;
    uniform float uScroll;
    uniform float uWaveIntensity;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;

    vec3 calcWave(vec3 pos, vec2 dir, float steepness, float wavelength, float speed, float time) {
      float k = 6.2831853 / wavelength;
      float c = sqrt(9.8 / k);
      vec2 d = normalize(dir);
      float f = k * (dot(d, pos.xz) - c * speed * time);
      float a = steepness / k;
      return vec3(d.x * (a * cos(f)), a * sin(f), d.y * (a * cos(f)));
    }

    void main() {
      vUv = uv;
      vec3 pos = position;
      float t = uTime * 0.85 + uScroll * 3.5;
      float amp = 1.0 + uWaveIntensity * 1.6;

      vec3 w1 = calcWave(pos, vec2(0.7, 0.35), 0.18 * amp, 8.0, 0.8, t);
      vec3 w2 = calcWave(pos, vec2(-0.45, 0.85), 0.12 * amp, 4.5, 1.1, t);
      vec3 w3 = calcWave(pos, vec2(0.3, -0.9), 0.05 * amp, 2.2, 1.5, t);

      pos.y += (w1.y + w2.y + w3.y);
      pos.x += (w1.x + w2.x) * 0.35;
      pos.z += (w1.z + w2.z) * 0.35;

      float eps = 0.07;
      vec3 posX = position + vec3(eps, 0.0, 0.0);
      vec3 posZ = position + vec3(0.0, 0.0, eps);
      float yX = calcWave(posX, vec2(0.7, 0.35), 0.18 * amp, 8.0, 0.8, t).y +
                 calcWave(posX, vec2(-0.45, 0.85), 0.12 * amp, 4.5, 1.1, t).y;
      float yZ = calcWave(posZ, vec2(0.7, 0.35), 0.18 * amp, 8.0, 0.8, t).y +
                 calcWave(posZ, vec2(-0.45, 0.85), 0.12 * amp, 4.5, 1.1, t).y;

      vec3 tangentX = vec3(eps, yX - (w1.y + w2.y), 0.0);
      vec3 tangentZ = vec3(0.0, yZ - (w1.y + w2.y), eps);
      vec3 calcNormal = normalize(cross(tangentZ, tangentX));

      vNormal = normalize(normalMatrix * calcNormal);
      vec4 worldPos = modelMatrix * vec4(pos, 1.0);
      vWorldPosition = worldPos.xyz;
      vec4 mvPosition = viewMatrix * worldPos;
      vViewPosition = -mvPosition.xyz;

      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform float uScroll;
    uniform vec2 uResolution;
    uniform vec2 uMouse;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;

    void main() {
      vec3 viewDir = normalize(vViewPosition);
      vec3 normal = normalize(vNormal);

      // Deep obsidian & dark wine burgundy body colors
      vec3 deepWater = vec3(0.02, 0.007, 0.015);
      vec3 midWater  = vec3(0.08, 0.014, 0.042);
      vec3 shallowWine = vec3(0.32, 0.025, 0.12);

      float fresnel = pow(1.0 - max(0.0, dot(viewDir, normal)), 3.2);

      vec3 waterBase = mix(deepWater, midWater, vUv.y * 0.9);
      waterBase = mix(waterBase, shallowWine, fresnel * 0.35);

      // Sweeping light beam at an angle across the liquid water
      float beamCoord = vWorldPosition.x * 0.45 + vWorldPosition.z * 0.35;
      float beamCenter = sin(uTime * 0.45) * 4.5;
      float beamDist = abs(beamCoord - beamCenter);
      float beam = exp(-beamDist * beamDist * 0.32) * 0.95;

      // Crimson and magenta directional reflections
      vec3 lightDir1 = normalize(vec3(0.5 + uMouse.x * 0.3, 0.8, 0.5 - uMouse.y * 0.2));
      vec3 halfDir1 = normalize(lightDir1 + viewDir);
      float spec1 = pow(max(0.0, dot(normal, halfDir1)), 42.0);

      vec3 lightDir2 = normalize(vec3(-0.6, 0.5, 0.7));
      vec3 halfDir2 = normalize(lightDir2 + viewDir);
      float spec2 = pow(max(0.0, dot(normal, halfDir2)), 56.0);

      vec3 crimson = vec3(1.0, 0.12, 0.38);
      vec3 magenta = vec3(0.85, 0.08, 0.55);
      vec3 rubySparkle = vec3(1.0, 0.6, 0.78);

      // Procedural ripple shimmer
      float ripple = sin(vWorldPosition.x * 5.5 + uTime * 2.2) * 
                     cos(vWorldPosition.z * 4.8 - uTime * 1.8);
      float shimmer = pow(max(0.0, ripple), 4.0) * 0.35;

      vec3 reflections = (crimson * spec1 * 1.9) +
                         (magenta * spec2 * 1.3) +
                         (crimson * beam * (0.5 + spec1 * 0.5)) +
                         (rubySparkle * shimmer * fresnel);

      float horizonFade = smoothstep(0.0, 0.22, vUv.y) * smoothstep(1.0, 0.72, vUv.y);
      float edgeFade = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);
      float vignette = horizonFade * edgeFade;

      vec3 finalCol = waterBase + reflections * (0.8 + 0.45 * fresnel);
      gl_FragColor = vec4(finalCol, 0.94 * vignette + 0.06);
    }
  `;

  const waterMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: waterUniforms,
    transparent: true,
    depthWrite: false,
  });

  waterMesh = new THREE.Mesh(planeGeo, waterMaterial);
  waterScene.add(waterMesh);

  // Atmospheric Mist Particles
  const particleCount = 200;
  particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 28;
    positions[i * 3 + 1] = Math.random() * 3.8 + 0.2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const pCanvas = document.createElement('canvas');
  pCanvas.width = 64;
  pCanvas.height = 64;
  const pCtx = pCanvas.getContext('2d');
  const pGrad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
  pGrad.addColorStop(0, 'rgba(255, 110, 160, 1)');
  pGrad.addColorStop(0.3, 'rgba(255, 40, 90, 0.65)');
  pGrad.addColorStop(0.7, 'rgba(200, 20, 80, 0.18)');
  pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  pCtx.fillStyle = pGrad;
  pCtx.fillRect(0, 0, 64, 64);
  const pTexture = new THREE.CanvasTexture(pCanvas);

  const particleMat = new THREE.PointsMaterial({
    size: 0.36,
    map: pTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    opacity: 0.78,
  });

  particleSystem = new THREE.Points(particleGeo, particleMat);
  waterScene.add(particleSystem);

  isWaterInitialized = true;
}

function resizeWater() {
  if (!waterRenderer || !waterCamera) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  waterCamera.aspect = w / h;
  waterCamera.updateProjectionMatrix();
  waterRenderer.setSize(w, h);
  waterRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  if (waterUniforms?.uResolution) {
    waterUniforms.uResolution.value.set(w, h);
  }
}

function updateScrollAnimations(progress) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 0. Canvas background dimming & Three.js Water Surface layer visibility
  if (canvas) {
    if (progress < 0.35) {
      canvas.style.opacity = '1';
      canvas.style.transform = 'scale(1)';
    } else if (progress <= 0.53) {
      const tDim = (progress - 0.35) / 0.18;
      canvas.style.opacity = (1 - tDim * 0.50).toFixed(3);
      canvas.style.transform = prefersReducedMotion ? 'none' : `scale(${(1 + tDim * 0.02).toFixed(3)})`;
    } else if (progress <= 0.68) {
      const tDim = (progress - 0.53) / 0.15;
      canvas.style.opacity = (0.50 - tDim * 0.18).toFixed(3);
      canvas.style.transform = prefersReducedMotion ? 'none' : 'scale(1.025)';
    } else if (progress <= 0.72) {
      // Atmospheric transition: video fades completely as Three.js water surface shines
      const tOut = (progress - 0.68) / 0.04;
      canvas.style.opacity = (0.32 * Math.max(0, 1 - tOut)).toFixed(3);
      canvas.style.transform = prefersReducedMotion ? 'none' : 'scale(1.025)';
    } else {
      canvas.style.opacity = '0';
    }
  }

  // Persistent Three.js Water Canvas layer
  if (waterCanvas) {
    if (progress < 0.67) {
      waterCanvas.style.opacity = '0';
      const mistEl = document.querySelector('.water-crimson-mist');
      const vigEl = document.querySelector('.water-vignette-overlay');
      if (mistEl) mistEl.style.opacity = '0';
      if (vigEl) vigEl.style.opacity = '0';
    } else if (progress <= 0.72) {
      const tFade = (progress - 0.67) / 0.05;
      waterCanvas.style.opacity = tFade.toFixed(3);
      const mistEl = document.querySelector('.water-crimson-mist');
      const vigEl = document.querySelector('.water-vignette-overlay');
      if (mistEl) mistEl.style.opacity = tFade.toFixed(3);
      if (vigEl) vigEl.style.opacity = tFade.toFixed(3);
    } else {
      waterCanvas.style.opacity = '1';
      const mistEl = document.querySelector('.water-crimson-mist');
      const vigEl = document.querySelector('.water-vignette-overlay');
      if (mistEl) mistEl.style.opacity = '1';
      if (vigEl) vigEl.style.opacity = '1';
    }
  }

  // 1. Hero Editorial Section (Active from 0.0 to ~0.16)
  if (heroEditorial) {
    if (progress < 0.10) {
      heroEditorial.style.opacity = '1';
      heroEditorial.style.transform = 'translate3d(0, 0, 0)';
      heroEditorial.style.pointerEvents = 'auto';
    } else if (progress <= 0.16) {
      const t = (progress - 0.10) / 0.06;
      const opacity = Math.max(0, 1 - t);
      const translateY = t * 60;
      heroEditorial.style.opacity = opacity.toFixed(3);
      heroEditorial.style.transform = prefersReducedMotion ? 'none' : `translate3d(0, -${translateY.toFixed(1)}px, 0)`;
      heroEditorial.style.pointerEvents = opacity > 0.05 ? 'auto' : 'none';
    } else {
      heroEditorial.style.opacity = '0';
      heroEditorial.style.transform = 'translate3d(0, -60px, 0)';
      heroEditorial.style.pointerEvents = 'none';
    }
  }

  // 2. Professional Summary Section (Active from 0.15 to ~0.35)
  if (summarySection && summaryHeader && summaryParagraph && summaryAccentLine) {
    if (progress < 0.15) {
      summarySection.style.opacity = '0';
      summarySection.style.pointerEvents = 'none';
      summaryHeader.style.opacity = '0';
      summaryHeader.style.transform = 'translate3d(0, 30px, 0)';
      summaryAccentLine.style.transform = 'scaleX(0)';
      summaryParagraph.style.opacity = '0';
      summaryParagraph.style.transform = 'translate3d(0, 30px, 0)';
    } else if (progress <= 0.22) {
      // Entrance: Heading reveals first, followed by paragraph
      summarySection.style.opacity = '1';
      summarySection.style.transform = 'translate3d(0, 0, 0)';
      summarySection.style.pointerEvents = 'auto';

      const tHead = clamp((progress - 0.15) / 0.04, 0, 1);
      summaryHeader.style.opacity = tHead.toFixed(3);
      summaryHeader.style.transform = prefersReducedMotion ? 'none' : `translate3d(0, ${((1 - tHead) * 30).toFixed(1)}px, 0)`;
      summaryAccentLine.style.transform = `scaleX(${tHead.toFixed(3)})`;

      const tPara = clamp((progress - 0.17) / 0.05, 0, 1);
      summaryParagraph.style.opacity = tPara.toFixed(3);
      summaryParagraph.style.transform = prefersReducedMotion ? 'none' : `translate3d(0, ${((1 - tPara) * 30).toFixed(1)}px, 0)`;
    } else if (progress <= 0.30) {
      // Stable reading window with portrait holding the phone
      summarySection.style.opacity = '1';
      summarySection.style.transform = 'translate3d(0, 0, 0)';
      summarySection.style.pointerEvents = 'auto';

      summaryHeader.style.opacity = '1';
      summaryHeader.style.transform = 'translate3d(0, 0, 0)';
      summaryAccentLine.style.transform = 'scaleX(1)';

      summaryParagraph.style.opacity = '1';
      summaryParagraph.style.transform = 'translate3d(0, 0, 0)';
    } else if (progress <= 0.35) {
      // Smooth exit fade out as user moves to Skills & Expertise
      const tExit = clamp((progress - 0.30) / 0.05, 0, 1);
      const exitOpacity = Math.max(0, 1 - tExit);
      const exitY = tExit * 35;
      summarySection.style.opacity = exitOpacity.toFixed(3);
      summarySection.style.transform = prefersReducedMotion ? 'none' : `translate3d(0, -${exitY.toFixed(1)}px, 0)`;
      summarySection.style.pointerEvents = exitOpacity > 0.05 ? 'auto' : 'none';
    } else {
      summarySection.style.opacity = '0';
      summarySection.style.pointerEvents = 'none';
    }
  }

  // 3. Skills & Expertise Section (Active from 0.33 to ~0.53)
  if (skillsSection && skillsHeader) {
    if (progress < 0.33) {
      skillsSection.style.opacity = '0';
      skillsSection.style.pointerEvents = 'none';
      skillsHeader.style.opacity = '0';
      skillsHeader.style.filter = 'blur(8px)';
      skillsHeader.style.transform = 'translate3d(0, 30px, 0)';

      const headerLine = skillsHeader.querySelector('.skills-header-line');
      if (headerLine) headerLine.style.transform = 'scaleX(0)';

      if (visualSeo) {
        visualSeo.style.opacity = '0';
        visualSeo.style.transform = 'translate3d(40px, 0, 0) scale(1.08)';
        const seoImgContainer = visualSeo.querySelector('.visual-img-container');
        if (seoImgContainer) seoImgContainer.style.clipPath = 'inset(0 100% 0 0)';
      }
      if (visualStrategy) {
        visualStrategy.style.opacity = '0';
        visualStrategy.style.transform = 'translate3d(0, 45px, 0) scale(0.94)';
        const stratImgContainer = visualStrategy.querySelector('.visual-img-container');
        if (stratImgContainer) stratImgContainer.style.clipPath = 'inset(100% 0 0 0)';
      }

      skillRows.forEach((row) => {
        row.style.opacity = '0';
        row.classList.remove('is-active-row');
        const line = row.querySelector('.skill-row-line');
        if (line) line.style.transform = 'scaleX(0)';
        const headCol = row.querySelector('.skill-heading-col');
        if (headCol) {
          headCol.style.opacity = '0';
          headCol.style.transform = 'translate3d(-10px, 0, 0)';
        }
        const descCol = row.querySelector('.skill-desc-col');
        if (descCol) {
          descCol.style.opacity = '0';
          descCol.style.transform = 'translate3d(0, 10px, 0)';
        }
      });
    } else if (progress <= 0.51) {
      let sectionOpacity = 1;
      let sectionTranslateY = 0;
      if (progress > 0.47) {
        const tExit = (progress - 0.47) / 0.04;
        sectionOpacity = Math.max(0, 1 - tExit);
        sectionTranslateY = tExit * 35;
      }

      skillsSection.style.opacity = sectionOpacity.toFixed(3);
      skillsSection.style.transform = prefersReducedMotion ? 'none' : `translate3d(0, -${sectionTranslateY.toFixed(1)}px, 0)`;
      skillsSection.style.pointerEvents = sectionOpacity > 0.05 ? 'auto' : 'none';
      skillsSection.style.visibility = sectionOpacity > 0.001 ? 'visible' : 'hidden';

      // Heading reveal (0.33 -> 0.38)
      const tHead = clamp((progress - 0.33) / 0.04, 0, 1);
      skillsHeader.style.opacity = tHead.toFixed(3);
      skillsHeader.style.filter = prefersReducedMotion ? 'none' : `blur(${((1 - tHead) * 8).toFixed(1)}px)`;
      skillsHeader.style.transform = prefersReducedMotion ? 'none' : `translate3d(0, ${((1 - tHead) * 30).toFixed(1)}px, 0)`;

      const headerLine = skillsHeader.querySelector('.skills-header-line');
      if (headerLine) {
        headerLine.style.transformOrigin = 'left center';
        headerLine.style.transform = `scaleX(${tHead.toFixed(3)})`;
      }

      const mOffsetX = prefersReducedMotion ? 0 : mouseX * 12;
      const mOffsetY = prefersReducedMotion ? 0 : mouseY * 9;

      // Seo.jpg reveal (0.35 -> 0.44)
      if (visualSeo) {
        const tSeo = clamp((progress - 0.35) / 0.08, 0, 1);
        const seoScale = (1.08 - tSeo * 0.08).toFixed(3);
        const seoX = (((1 - tSeo) * 45) + mOffsetX).toFixed(1);
        const seoY = mOffsetY.toFixed(1);
        visualSeo.style.opacity = tSeo.toFixed(3);
        visualSeo.style.transform = prefersReducedMotion ? 'none' : `translate3d(${seoX}px, ${seoY}px, 0) scale(${seoScale})`;

        const seoImgContainer = visualSeo.querySelector('.visual-img-container');
        if (seoImgContainer) {
          const maskX = ((1 - tSeo) * 100).toFixed(1);
          seoImgContainer.style.clipPath = `inset(0 ${maskX}% 0 0)`;
        }
      }

      // strategy.jpg reveal (0.38 -> 0.46)
      if (visualStrategy) {
        const tStrat = clamp((progress - 0.38) / 0.08, 0, 1);
        const stratScale = (0.94 + tStrat * 0.06).toFixed(3);
        const scrollParallax = (progress - 0.42) * 30;
        const stratY = ((((1 - tStrat) * 45) - scrollParallax) - mOffsetY).toFixed(1);
        const stratX = (-mOffsetX).toFixed(1);
        visualStrategy.style.opacity = tStrat.toFixed(3);
        visualStrategy.style.transform = prefersReducedMotion ? 'none' : `translate3d(${stratX}px, ${stratY}px, 0) scale(${stratScale})`;

        const stratImgContainer = visualStrategy.querySelector('.visual-img-container');
        if (stratImgContainer) {
          const maskY = ((1 - tStrat) * 100).toFixed(1);
          stratImgContainer.style.clipPath = `inset(${maskY}% 0 0 0)`;
        }
      }

      // Progressive staggered reveal of 7 skill rows (0.36 -> 0.49)
      let activeRowIndex = -1;
      if (progress >= 0.37 && progress <= 0.49) {
        activeRowIndex = Math.floor((progress - 0.37) / ((0.49 - 0.37) / skillRows.length));
        activeRowIndex = clamp(activeRowIndex, 0, skillRows.length - 1);
      }

      skillRows.forEach((row, idx) => {
        const rowStart = 0.36 + idx * 0.016;
        const tRow = clamp((progress - rowStart) / 0.020, 0, 1);
        row.style.opacity = '1';

        const line = row.querySelector('.skill-row-line');
        if (line) {
          const tLine = clamp((progress - rowStart) / 0.015, 0, 1);
          line.style.transform = `scaleX(${tLine.toFixed(3)})`;
        }

        const headCol = row.querySelector('.skill-heading-col');
        if (headCol) {
          const tHeadCol = clamp((progress - (rowStart + 0.002)) / 0.015, 0, 1);
          headCol.style.opacity = tHeadCol.toFixed(3);
          headCol.style.transform = prefersReducedMotion ? 'none' : `translate3d(${((1 - tHeadCol) * -12).toFixed(1)}px, 0, 0)`;
        }

        const descCol = row.querySelector('.skill-desc-col');
        if (descCol) {
          const tDescCol = clamp((progress - (rowStart + 0.004)) / 0.015, 0, 1);
          descCol.style.opacity = tDescCol.toFixed(3);
          descCol.style.transform = prefersReducedMotion ? 'none' : `translate3d(0, ${((1 - tDescCol) * 10).toFixed(1)}px, 0)`;
        }

        if (idx === activeRowIndex && tRow > 0.4) {
          row.classList.add('is-active-row');
        } else {
          row.classList.remove('is-active-row');
        }
      });
    } else {
      skillsSection.style.opacity = '0';
      skillsSection.style.visibility = 'hidden';
      skillsSection.style.pointerEvents = 'none';
    }
  }

  // 4. Work Experience Section (Active from 0.51 to ~0.71)
  if (experienceSection && experienceHeader) {
    if (progress < 0.51) {
      experienceSection.style.visibility = 'hidden';
      experienceSection.style.opacity = '0';
      experienceSection.style.pointerEvents = 'none';
      experienceHeader.style.opacity = '0';
      experienceHeader.style.filter = 'blur(8px)';
      experienceHeader.style.transform = 'translate3d(0, 30px, 0)';

      const expHeaderLine = experienceHeader.querySelector('.experience-header-line');
      if (expHeaderLine) expHeaderLine.style.transform = 'scaleX(0)';

      if (timelineProgress) timelineProgress.style.height = '0%';
      if (timelineGlowHead) timelineGlowHead.style.top = '0%';
      if (milestonesTrack) milestonesTrack.style.transform = 'translate3d(0, 0, 0)';

      milestonePanels.forEach((panel) => {
        panel.classList.remove('is-active-exp');
      });
    } else if (progress <= 0.71) {
      experienceSection.style.visibility = 'visible';
      const tEnter = clamp((progress - 0.51) / 0.015, 0, 1);
      let expOpacity = tEnter;
      let expTranslateY = 0;
      if (progress > 0.68) {
        const tExit = (progress - 0.68) / 0.03;
        expOpacity = Math.max(0, 1 - tExit);
        expTranslateY = tExit * 35;
      }

      experienceSection.style.opacity = expOpacity.toFixed(3);
      experienceSection.style.transform = prefersReducedMotion ? 'none' : `translate3d(0, -${expTranslateY.toFixed(1)}px, 0)`;
      experienceSection.style.pointerEvents = expOpacity > 0.05 ? 'auto' : 'none';

      // Header reveal (0.51 -> 0.535)
      const tHead = clamp((progress - 0.51) / 0.025, 0, 1);
      experienceHeader.style.opacity = tHead.toFixed(3);
      experienceHeader.style.filter = prefersReducedMotion ? 'none' : `blur(${((1 - tHead) * 8).toFixed(1)}px)`;
      experienceHeader.style.transform = prefersReducedMotion ? 'none' : `translate3d(0, ${((1 - tHead) * 20).toFixed(1)}px, 0)`;

      const expHeaderLine = experienceHeader.querySelector('.experience-header-line');
      if (expHeaderLine) {
        expHeaderLine.style.transformOrigin = 'left center';
        expHeaderLine.style.transform = `scaleX(${tHead.toFixed(3)})`;
      }

      // Timeline spine progress & track scrolling (0.535 -> 0.68)
      const tTimeline = clamp((progress - 0.535) / 0.145, 0, 1);

      if (timelineProgress) {
        timelineProgress.style.height = `${(tTimeline * 100).toFixed(1)}%`;
      }
      if (timelineGlowHead) {
        timelineGlowHead.style.top = `${(tTimeline * 100).toFixed(1)}%`;
      }

      let activeIndex = 0;
      if (milestonesTrack && experienceStage && milestonePanels.length > 0) {
        const stageHeight = experienceStage.clientHeight || 600;
        const trackHeight = milestonesTrack.scrollHeight || 2400;
        const maxTravel = Math.max(0, trackHeight - stageHeight);
        const isMobileScreen = window.innerWidth <= 768;

        const panelTargets = Array.from(milestonePanels).map((panel, i) => {
          if (i === 0) return 0;
          if (isMobileScreen) {
            // On mobile/tablet, align top of panel neatly with the top of stage
            const ideal = panel.offsetTop - 6;
            return Math.max(0, Math.min(maxTravel, ideal));
          }
          const panelCenter = panel.offsetTop + (panel.offsetHeight / 2);
          const ideal = panelCenter - (stageHeight / 2);
          return Math.max(0, Math.min(maxTravel, ideal));
        });

        const step = tTimeline * (milestonePanels.length - 1);
        const baseIdx = Math.floor(step);
        const sub = step - baseIdx;

        let transition = 0;
        if (sub > 0.55) {
          const t = (sub - 0.55) / 0.45;
          transition = t * t * (3 - 2 * t);
        }

        const nextIdx = Math.min(milestonePanels.length - 1, baseIdx + 1);
        const targetA = panelTargets[baseIdx];
        const targetB = panelTargets[nextIdx];
        const currentTravel = targetA + transition * (targetB - targetA);

        milestonesTrack.style.transform = prefersReducedMotion ? 'none' : `translate3d(0, -${currentTravel.toFixed(1)}px, 0)`;
        activeIndex = Math.min(milestonePanels.length - 1, Math.max(0, Math.round(step)));
      }

      milestonePanels.forEach((panel, idx) => {
        // Natural scroll-reveal as timeline approaches or passes the panel
        if (idx <= activeIndex + 1 || tTimeline > 0.05) {
          panel.classList.add('is-revealed');
        }

        if (idx === activeIndex) {
          panel.classList.add('is-active-exp');
        } else {
          panel.classList.remove('is-active-exp');
        }

        const bullets = panel.querySelectorAll('.milestone-bullet');
        bullets.forEach((bullet) => {
          bullet.style.opacity = '1';
        });
      });
    } else {
      experienceSection.style.visibility = 'hidden';
      experienceSection.style.opacity = '0';
      experienceSection.style.pointerEvents = 'none';
    }
  }

  // 5. 04 / THE FOUNDATION — EDUCATION & BEYOND Section (Active from 0.69 to ~0.85)
  if (educationSection && foundationHeader) {
    if (progress < 0.69) {
      educationSection.style.visibility = 'hidden';
      educationSection.style.opacity = '0';
      educationSection.style.pointerEvents = 'none';

      foundationHeader.style.opacity = '0';
      foundationHeader.style.filter = 'blur(8px)';
      foundationHeader.style.transform = 'translate3d(0, 30px, 0)';

      if (foundationHeaderLine) foundationHeaderLine.style.transform = 'scaleX(0)';

      if (eduDegreeCard) {
        eduDegreeCard.style.opacity = '0';
        eduDegreeCard.style.transform = 'translate3d(0, 35px, 0)';
      }

      if (certCard1) {
        certCard1.style.opacity = '0';
        certCard1.style.transform = 'translate3d(20px, 20px, 0)';
      }
      if (certCard2) {
        certCard2.style.opacity = '0';
        certCard2.style.transform = 'translate3d(20px, 20px, 0)';
      }

      if (foundationLanguages) {
        foundationLanguages.style.opacity = '0';
      }

      languagePills.forEach((pill) => {
        pill.style.opacity = '0';
        pill.style.transform = 'translate3d(0, 15px, 0)';
      });
    } else if (progress <= 0.85) {
      educationSection.style.visibility = progress < 0.84 ? 'visible' : 'hidden';
      let eduOpacity = 1;
      let eduTranslateY = 0;
      if (progress > 0.82) {
        const tExit = (progress - 0.82) / 0.03;
        eduOpacity = Math.max(0, 1 - tExit);
        eduTranslateY = tExit * 35;
      }

      educationSection.style.opacity = eduOpacity.toFixed(3);
      educationSection.style.transform = prefersReducedMotion ? 'none' : `translate3d(0, -${eduTranslateY.toFixed(1)}px, 0)`;
      educationSection.style.pointerEvents = (eduOpacity > 0.15 && progress < 0.84) ? 'auto' : 'none';

      const mOffsetX = prefersReducedMotion ? 0 : mouseX * 10;
      const mOffsetY = prefersReducedMotion ? 0 : mouseY * 8;

      // Header reveal (0.70 -> 0.74)
      const tHead = clamp((progress - 0.70) / 0.035, 0, 1);
      foundationHeader.style.opacity = tHead.toFixed(3);
      foundationHeader.style.filter = prefersReducedMotion ? 'none' : `blur(${((1 - tHead) * 8).toFixed(1)}px)`;
      foundationHeader.style.transform = prefersReducedMotion ? 'none' : `translate3d(0, ${((1 - tHead) * 28).toFixed(1)}px, 0)`;

      if (foundationHeaderLine) {
        foundationHeaderLine.style.transform = `scaleX(${tHead.toFixed(3)})`;
      }

      // Academic Degree (B.Com) Card reveal (0.71 -> 0.75)
      if (eduDegreeCard) {
        const tDegree = clamp((progress - 0.71) / 0.035, 0, 1);
        const degY = (((1 - tDegree) * 32) + mOffsetY * 0.5).toFixed(1);
        const degX = (mOffsetX * 0.5).toFixed(1);
        eduDegreeCard.style.opacity = tDegree.toFixed(3);
        eduDegreeCard.style.transform = prefersReducedMotion ? 'none' : `translate3d(${degX}px, ${degY}px, 0)`;
      }

      // Certifications sequential reveal (0.73 -> 0.77)
      if (certCard1) {
        const tCert1 = clamp((progress - 0.73) / 0.030, 0, 1);
        const c1Y = (((1 - tCert1) * 25) - mOffsetY * 0.4).toFixed(1);
        const c1X = (-mOffsetX * 0.4).toFixed(1);
        certCard1.style.opacity = tCert1.toFixed(3);
        certCard1.style.transform = prefersReducedMotion ? 'none' : `translate3d(${c1X}px, ${c1Y}px, 0)`;
      }

      if (certCard2) {
        const tCert2 = clamp((progress - 0.74) / 0.030, 0, 1);
        const c2Y = (((1 - tCert2) * 25) - mOffsetY * 0.4).toFixed(1);
        const c2X = (-mOffsetX * 0.4).toFixed(1);
        certCard2.style.opacity = tCert2.toFixed(3);
        certCard2.style.transform = prefersReducedMotion ? 'none' : `translate3d(${c2X}px, ${c2Y}px, 0)`;
      }

      // Languages: Staggered horizontal reveal (0.75 -> 0.79)
      if (foundationLanguages) {
        const tLangSec = clamp((progress - 0.75) / 0.020, 0, 1);
        foundationLanguages.style.opacity = tLangSec.toFixed(3);
      }

      languagePills.forEach((pill, idx) => {
        const pStart = 0.755 + idx * 0.005;
        const tPill = clamp((progress - pStart) / 0.012, 0, 1);
        pill.style.opacity = tPill.toFixed(3);
        pill.style.transform = prefersReducedMotion ? 'none' : `translate3d(0, ${((1 - tPill) * 16).toFixed(1)}px, 0)`;
      });
    } else {
      educationSection.style.visibility = 'hidden';
      educationSection.style.opacity = '0';
      educationSection.style.pointerEvents = 'none';
    }
  }

  // 6. 05 / LET'S CONNECT — CONTACT SECTION (Active from 0.84 to 1.00)
  if (contactSection && contactHeader) {
    if (progress < 0.84) {
      contactSection.style.visibility = 'hidden';
      contactSection.style.opacity = '0';
      contactSection.style.pointerEvents = 'none';

      contactHeader.style.opacity = '0';
      contactHeader.style.filter = 'blur(8px)';
      contactHeader.style.transform = 'translate3d(0, 30px, 0)';

      if (contactHeaderLine) contactHeaderLine.style.transform = 'scaleX(0)';

      if (contactCardEmail) {
        contactCardEmail.style.opacity = '0';
        contactCardEmail.style.transform = 'translate3d(0, 35px, 0)';
      }
      if (contactCardPhone) {
        contactCardPhone.style.opacity = '0';
        contactCardPhone.style.transform = 'translate3d(0, 35px, 0)';
      }
      if (contactCardLocation) {
        contactCardLocation.style.opacity = '0';
        contactCardLocation.style.transform = 'translate3d(0, 35px, 0)';
      }

      if (contactCtaBlock) {
        contactCtaBlock.style.opacity = '0';
        contactCtaBlock.style.transform = 'translate3d(0, 25px, 0)';
      }

      if (portfolioFooter) {
        portfolioFooter.style.opacity = '0';
      }
    } else {
      contactSection.style.visibility = 'visible';
      contactSection.style.pointerEvents = 'auto';

      // Overall section opacity fade-in (0.84 -> 0.87)
      const tSection = clamp((progress - 0.84) / 0.03, 0, 1);
      contactSection.style.opacity = tSection.toFixed(3);

      const mOffsetX = prefersReducedMotion ? 0 : mouseX * 10;
      const mOffsetY = prefersReducedMotion ? 0 : mouseY * 8;

      // Header reveal with blur-to-sharp upward motion (0.85 -> 0.885)
      const tHead = clamp((progress - 0.85) / 0.035, 0, 1);
      contactHeader.style.opacity = tHead.toFixed(3);
      contactHeader.style.filter = prefersReducedMotion ? 'none' : `blur(${((1 - tHead) * 8).toFixed(1)}px)`;
      contactHeader.style.transform = prefersReducedMotion ? 'none' : `translate3d(0, ${((1 - tHead) * 26).toFixed(1)}px, 0)`;

      if (contactHeaderLine) {
        contactHeaderLine.style.transform = `scaleX(${tHead.toFixed(3)})`;
      }

      // Three Contact Cards: Staggered sequential reveal (0.87 -> 0.93)
      // Card 01: Email (0.87 -> 0.90)
      if (contactCardEmail) {
        const tEmail = clamp((progress - 0.87) / 0.030, 0, 1);
        const cY = (((1 - tEmail) * 28) + mOffsetY * 0.4).toFixed(1);
        const cX = (mOffsetX * 0.4).toFixed(1);
        contactCardEmail.style.opacity = tEmail.toFixed(3);
        contactCardEmail.style.transform = prefersReducedMotion ? 'none' : `translate3d(${cX}px, ${cY}px, 0)`;
      }

      // Card 02: Phone & WhatsApp (0.885 -> 0.915)
      if (contactCardPhone) {
        const tPhone = clamp((progress - 0.885) / 0.030, 0, 1);
        const cY = (((1 - tPhone) * 28) - mOffsetY * 0.3).toFixed(1);
        contactCardPhone.style.opacity = tPhone.toFixed(3);
        contactCardPhone.style.transform = prefersReducedMotion ? 'none' : `translate3d(0, ${cY}px, 0)`;
      }

      // Card 03: Location (0.90 -> 0.93)
      if (contactCardLocation) {
        const tLoc = clamp((progress - 0.90) / 0.030, 0, 1);
        const cY = (((1 - tLoc) * 28) - mOffsetY * 0.4).toFixed(1);
        const cX = (-mOffsetX * 0.4).toFixed(1);
        contactCardLocation.style.opacity = tLoc.toFixed(3);
        contactCardLocation.style.transform = prefersReducedMotion ? 'none' : `translate3d(${cX}px, ${cY}px, 0)`;
      }

      // Prominent CTA & Disciplines Strip (0.92 -> 0.955)
      if (contactCtaBlock) {
        const tCta = clamp((progress - 0.92) / 0.035, 0, 1);
        contactCtaBlock.style.opacity = tCta.toFixed(3);
        contactCtaBlock.style.transform = prefersReducedMotion ? 'none' : `translate3d(0, ${((1 - tCta) * 20).toFixed(1)}px, 0)`;
      }

      // Minimal Footer (0.94 -> 0.97)
      if (portfolioFooter) {
        const tFoot = clamp((progress - 0.94) / 0.030, 0, 1);
        portfolioFooter.style.opacity = tFoot.toFixed(3);
      }
    }
  }

  // 7. Navigation Link Highlighting
  let currentActive = 'home';
  if (progress >= 0.85) {
    currentActive = 'contact';
  } else if (progress >= 0.69) {
    currentActive = 'education';
  } else if (progress >= 0.51) {
    currentActive = 'experience';
  } else if (progress >= 0.34) {
    currentActive = 'expertise';
  } else if (progress >= 0.15) {
    currentActive = 'about';
  }

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href === `#${currentActive}`) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function onScroll() {
  targetProgress = getScrollProgress();

  // Video sequence plays across hero + about (0.0 to 0.24), then holds steadily at frame 239
  const videoProgress = Math.min(1, targetProgress / 0.24);
  targetFrameIndex = Math.min(
    TOTAL_FRAMES - 1,
    Math.max(0, Math.floor(videoProgress * (TOTAL_FRAMES - 1)))
  );
}

function animationLoop() {
  const delta = targetProgress - currentProgress;
  if (Math.abs(delta) > 0.0001) {
    currentProgress += delta * 0.2;
  } else {
    currentProgress = targetProgress;
  }

  // Smooth lerp for desktop mouse parallax
  mouseX += (targetMouseX - mouseX) * 0.06;
  mouseY += (targetMouseY - mouseY) * 0.06;

  if (currentFrameIndex !== targetFrameIndex) {
    const diff = targetFrameIndex - currentFrameIndex;
    const step = Math.sign(diff) * Math.max(1, Math.min(Math.abs(diff), Math.ceil(Math.abs(diff) * 0.25)));
    currentFrameIndex += step;
  }

  renderFrame(currentFrameIndex);
  updateScrollAnimations(currentProgress);

  // Render Three.js Liquid Water Simulation when approaching Education or Contact sections
  if (isWaterInitialized && currentProgress >= 0.67) {
    waterUniforms.uTime.value += 0.016;
    waterUniforms.uScroll.value = currentProgress;
    waterUniforms.uWaveIntensity.value = Math.min(1.0, Math.abs(delta) * 14);
    waterUniforms.uMouse.value.set(mouseX, mouseY);

    if (particleGeo) {
      const posArr = particleGeo.attributes.position.array;
      const t = waterUniforms.uTime.value;
      for (let i = 0; i < 200; i++) {
        posArr[i * 3 + 1] += Math.sin(t * 0.5 + i) * 0.002;
        posArr[i * 3 + 0] += Math.cos(t * 0.3 + i) * 0.001;
      }
      particleGeo.attributes.position.needsUpdate = true;
    }

    waterCamera.position.x = mouseX * 0.6;
    waterCamera.position.y = 3.2 - mouseY * 0.35;
    waterCamera.lookAt(0, 0.35, 0);

    waterRenderer.render(waterScene, waterCamera);
  }

  requestAnimationFrame(animationLoop);
}

function preloadSequence() {
  const first = new Image();
  first.src = getFrameUrl(0);
  images[0] = first;

  const onFirstReady = () => {
    loaded[0] = true;
    loadedCount++;
    if (currentFrameIndex === 0) {
      renderFrame(0);
    }
  };

  if (first.decode) {
    first.decode().then(onFirstReady).catch(onFirstReady);
  } else {
    first.onload = onFirstReady;
  }

  for (let i = 1; i < TOTAL_FRAMES; i++) {
    const img = new Image();
    img.src = getFrameUrl(i);
    images[i] = img;

    const onReady = () => {
      loaded[i] = true;
      loadedCount++;
      if (currentFrameIndex === i) {
        renderFrame(i);
      }
    };

    if (img.decode) {
      img.decode().then(onReady).catch(onReady);
    } else {
      img.onload = onReady;
    }
  }
}

// ==========================================================================
// 00 / Cinematic Landing Intro (3-Second Initial Experience)
// ==========================================================================
function initCinematicLandingIntro() {
  const introEl = document.getElementById('cinematic-intro');
  const particlesCanvas = document.getElementById('intro-particles-canvas');
  const skipBtn = document.getElementById('intro-skip-btn');
  const heroMain = document.getElementById('hero-editorial');
  const bgCanvas = document.getElementById('animation-canvas');

  if (!introEl) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const alreadySeen = sessionStorage.getItem('ritwik_intro_seen') === 'true';

  if (prefersReduced || alreadySeen) {
    introEl.classList.add('intro-hidden');
    return;
  }

  // Active crimson particle drift on intro canvas
  let pAnimId = null;
  let pCtx = null;
  const particles = [];
  const P_COUNT = 45;

  if (particlesCanvas) {
    pCtx = particlesCanvas.getContext('2d');
    const resizeIntroCanvas = () => {
      particlesCanvas.width = window.innerWidth;
      particlesCanvas.height = window.innerHeight;
    };
    resizeIntroCanvas();
    window.addEventListener('resize', resizeIntroCanvas, { passive: true });

    for (let i = 0; i < P_COUNT; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 2.2 + 0.8,
        alpha: Math.random() * 0.65 + 0.25,
        speedY: Math.random() * 0.7 + 0.3,
        speedX: (Math.random() - 0.5) * 0.4,
        pulseSpeed: Math.random() * 0.03 + 0.015,
        pulsePhase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.4 ? 'rgba(255, 51, 102,' : 'rgba(217, 26, 122,',
      });
    }

    const drawParticles = () => {
      if (!pCtx) return;
      pCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y -= p.speedY;
        p.x += Math.sin(p.pulsePhase) * p.speedX;
        p.pulsePhase += p.pulseSpeed;

        if (p.y < -10) {
          p.y = particlesCanvas.height + 10;
          p.x = Math.random() * particlesCanvas.width;
        }

        const currentAlpha = p.alpha * (0.7 + 0.3 * Math.sin(p.pulsePhase));
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        pCtx.fillStyle = `${p.color} ${currentAlpha.toFixed(2)})`;
        pCtx.shadowBlur = p.radius * 4;
        pCtx.shadowColor = '#ff3366';
        pCtx.fill();
      }

      pAnimId = requestAnimationFrame(drawParticles);
    };
    pAnimId = requestAnimationFrame(drawParticles);
  }

  let isDismissed = false;
  const dismissIntro = (fast = false) => {
    if (isDismissed) return;
    isDismissed = true;
    sessionStorage.setItem('ritwik_intro_seen', 'true');

    if (heroMain) heroMain.classList.add('hero-entering-intro');
    if (bgCanvas) bgCanvas.classList.add('hero-entering-intro');

    introEl.classList.add('intro-exiting');

    setTimeout(() => {
      introEl.classList.add('intro-hidden');
      if (pAnimId) cancelAnimationFrame(pAnimId);
      setTimeout(() => {
        if (heroMain) heroMain.classList.remove('hero-entering-intro');
        if (bgCanvas) bgCanvas.classList.remove('hero-entering-intro');
      }, 1200);
    }, fast ? 200 : 850);
  };

  // Automatic exit after ~2.2s (total 3s sequence with transition)
  const autoTimer = setTimeout(() => {
    dismissIntro(false);
  }, 2200);

  if (skipBtn) {
    skipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      clearTimeout(autoTimer);
      dismissIntro(true);
    });
  }

  // Dismiss on click or Escape/Space
  introEl.addEventListener('click', () => {
    clearTimeout(autoTimer);
    dismissIntro(true);
  });

  window.addEventListener('keydown', (e) => {
    if (!isDismissed && (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter')) {
      clearTimeout(autoTimer);
      dismissIntro(true);
    }
  }, { once: true });
}

// ==========================================================================
// Smooth Anchor Navigation & Direct Functional Actions
// ==========================================================================
const scrollMap = {
  home: 0,
  about: 0.22,      // Professional Summary
  expertise: 0.40,  // Skills & Expertise
  experience: 0.535, // Work Experience (starts directly on 01 - Reporter Broadcasting Company)
  education: 0.78,  // Education & Beyond
  contact: 0.96,    // Contact & Let's Connect
};

function scrollToAnchor(targetId) {
  if (scrollMap[targetId] === undefined) return false;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const targetScrollY = Math.round(scrollMap[targetId] * maxScroll);
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.scrollTo({
    top: targetScrollY,
    behavior: isReduced ? 'auto' : 'smooth',
  });
  return true;
}

// Mobile Navigation Drawer Toggle
const navToggleBtn = document.getElementById('nav-toggle-btn');
const mainNav = document.getElementById('main-nav');

function closeMobileNav() {
  if (mainNav && mainNav.classList.contains('nav-open')) {
    mainNav.classList.remove('nav-open');
    if (navToggleBtn) navToggleBtn.setAttribute('aria-expanded', 'false');
  }
}

function openMobileNav() {
  if (mainNav) {
    mainNav.classList.add('nav-open');
    if (navToggleBtn) navToggleBtn.setAttribute('aria-expanded', 'true');
  }
}

if (navToggleBtn && mainNav) {
  navToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = mainNav.classList.contains('nav-open');
    if (isOpen) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  });

  // Close when clicking outside header
  document.addEventListener('click', (e) => {
    if (mainNav.classList.contains('nav-open') && !mainNav.contains(e.target)) {
      closeMobileNav();
    }
  });

  // Close when pressing Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav.classList.contains('nav-open')) {
      closeMobileNav();
    }
  });
}

// Hook all anchor links (navigation links, brand logo, hero contact link)
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    closeMobileNav();
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    const targetId = href.substring(1);
    if (scrollToAnchor(targetId)) {
      e.preventDefault();
      try {
        history.pushState(null, '', `#${targetId}`);
      } catch (err) {}
    }
  });
});

// WhatsApp & Action Link Handlers
const whatsappLink = document.getElementById('whatsapp-contact-link') || document.querySelector('.whatsapp-action');
if (whatsappLink) {
  whatsappLink.addEventListener('click', (e) => {
    e.stopPropagation();
    try {
      window.open('https://wa.me/917561081369', '_blank', 'noopener,noreferrer');
      e.preventDefault();
    } catch (err) {}
  });
}

const contactProminentBtn = document.getElementById('contact-prominent-btn');
if (contactProminentBtn) {
  contactProminentBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    try {
      window.open('https://wa.me/917561081369', '_blank', 'noopener,noreferrer');
      e.preventDefault();
    } catch (err) {}
  });
}

window.__images = images;
window.__loaded = loaded;
window.__getScrollProgress = getScrollProgress;

window.addEventListener('resize', resizeCanvas);
window.addEventListener('scroll', onScroll, { passive: true });

initWaterScene();
resizeCanvas();
preloadSequence();
onScroll();
currentProgress = targetProgress;
currentFrameIndex = targetFrameIndex;
updateScrollAnimations(currentProgress);
requestAnimationFrame(animationLoop);

// Initialize 3-second landing intro
initCinematicLandingIntro();
