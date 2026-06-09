/**
 * COCOEX - Main Animation Script
 * Handles intro animation, scroll interactions, and constellation effects
 * Using GSAP ScrollTrigger for optimized scroll-driven animations
 */

(function() {
  'use strict';

  // ==========================================================================
  // GSAP SETUP
  // ==========================================================================
  gsap.registerPlugin(ScrollTrigger);

  // SPIKE: Lenis smooth scrolling, with GSAP/ScrollTrigger integration.
  // Lenis virtualizes scroll position, which sidesteps the body-as-scroller
  // iOS Safari quirks documented in MOBILE-PLAN.md.
  // Body is the scroll container in this codebase (body has overflow-y: auto;
  // height: 100%), so Lenis must be told to wrap body explicitly.
  const lenis = new Lenis({
    wrapper: document.body,
    content: document.querySelector('.scroll-container'),
    autoRaf: false,
    // Lower lerp = stiffer/sharper response. Higher = mushier/floatier.
    lerp: 0.1,
    // Input multipliers: 1.0 = native speed.
    wheelMultiplier: 1.0,
    touchMultiplier: 1.0,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  ScrollTrigger.scrollerProxy(document.body, {
    scrollTop(value) {
      if (arguments.length) {
        lenis.scrollTo(value, { immediate: true });
      }
      return lenis.scroll;
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
  });

  ScrollTrigger.defaults({ scroller: document.body });

  // Expose for debugging during the spike
  window.lenis = lenis;

  // Note: ScrollTrigger.normalizeScroll is intentionally NOT enabled — Lenis
  // handles virtualized scroll, and the two together deadlock on iOS Safari.

  // ==========================================================================
  // GLSL SHADER UTILITIES (SHARED)
  // ==========================================================================
  const GLSL_UTILS = {
    // Simplex noise implementation (used by all gradient shaders)
    SIMPLEX_NOISE: `
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m*m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }
    `,

    // Star field rendering (used by intro and starfield backgrounds)
    STAR_FIELD: `
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      float stars(vec2 uv, float time) {
        float starField = 0.0;

        // Multiple star layers for depth
        for (float i = 0.0; i < 4.0; i++) {
          vec2 gridUv = uv * (30.0 + i * 25.0);
          vec2 gridId = floor(gridUv);
          vec2 gridFract = fract(gridUv);

          float starHash = hash(gridId + i * 100.0);

          // Show more stars (lower threshold = more stars)
          if (starHash > 0.85) {
            vec2 starPos = vec2(hash(gridId + 0.1), hash(gridId + 0.2));
            float dist = length(gridFract - starPos);

            // Twinkle effect - each star has its own rhythm
            float twinkle = sin(time * (0.75 + starHash * 1.25) + starHash * 6.28) * 0.5 + 0.5;
            twinkle = 0.3 + twinkle * 0.7; // Never fully off

            // Star brightness based on distance and twinkle
            float starSize = 0.03 + starHash * 0.04;
            float starBright = smoothstep(starSize, 0.0, dist) * twinkle * (0.5 + starHash * 0.5);
            starField += starBright;
          }
        }

        return starField;
      }
    `
  };

  // ==========================================================================
  // SCROLL TIMING CONSTANTS (OPTIMIZED FOR SMOOTH 60FPS)
  // ==========================================================================
  const SCROLL_TIMING = {
    // Intro section (480vh total) — lengthened so the mission statement gets a
    // long fully-bright hold (not a continuous fade) over the settled dots.
    INTRO_TOTAL: 480,
    INTRO_PHASE1_END: 0.40,    // 40% = 160vh - orbit animation END
    INTRO_PHASE2_TEXT: 0.50,   // 50% = 200vh - transition text "art as infrastructure for change"
    INTRO_PHASE3_START: 0.50,  // 50% = 200vh - constellation explosion starts

    // (No separate text section — the mission statement now overlays the
    // settled constellation dots inside the intro overlay.)

    // RHYTHM: 1 scroll = 100vh. Each phase is an explicit window with a REAL
    // HOLD between every fade-in and the next transition, so content never just
    // "flashes" past. Transitions use power2.out (motion fills the budget).
    // User-specified pacing: muse intro 1 scroll in + 2 hold; orbit 2 hold;
    // comet intro 2 (1 in + 1 hold); comet tab 2 (1 in + 1 hold); then closure.

    // MUSE — fade-in 0-100, HOLD 100-300 (2 scrolls), switch 300-400. No orbit
    // dwell: you scroll straight from the orbit into the comet intro. The orbit is
    // also visible THROUGH the switch, so its on-screen time already feels generous.
    MUSE_FADEIN: 100,          // vh - intro logo + copy fade in (1 scroll)
    MUSE_HOLD: 200,            // vh - intro HOLDS fully readable (2 scrolls) — the read
    MUSE_INTRO_HOLD: 300,      // vh - switch START = MUSE_FADEIN + MUSE_HOLD (no flash: 200vh real hold first)
    MUSE_CROSSFADE: 100,       // vh - black→white switch + logo crossfade (1 scroll)
    MUSE_CONTENT_HOLD: 0,      // vh - no orbit dwell; scroll straight into comet
    MUSE_TOTAL: 400,           // vh - wrapper (100 fade + 200 hold + 100 switch)

    // COMET — intro panel (200vh): fade 0-100, HOLD 100-200. tabs panel (200vh):
    //         methods fade 0-100, tab HOLD + closure 100-200. Then site closure.
    COMET_CONST_HIDE: 40,           // vh - constellation canvas hides (overlaps intro fade-in)
    COMET_INTRO_FADEIN: 100,        // vh - comet intro fades in (1 scroll)
    COMET_INTRO_HOLD: 100,          // vh - comet intro HOLDS (1 scroll) — total 2 scrolls into comet orbiting
    COMET_INTRO_PAUSE: 200,         // vh - intro panel total = fade-in + hold (no flash)
    COMET_METHODS_FADE: 100,        // vh - methods panel fades in (1 scroll)
    COMET_METHODS_DWELL: 100,       // vh - methods/tab HOLDS through closure (1 scroll)
    COMET_TOTAL: 400                // vh - wrapper (intro panel 200 + tabs panel 200)
  };

  // ==========================================================================
  // CONFIGURATION
  // ==========================================================================
  const CONFIG = {
    // Layout
    borderMargin: 0.20,
    logoMargin: 0.20,

    // Logo sizes
    logoMinSize: 80,
    logoMaxSize: 250,
    logoMaxSizeMobile: 180,

    // Animation
    totalRotations: 2,

    // Dot sizes
    dotMaxSize: 24,
    dotMinSize: 8,
    dotMaxSizeMobile: 18,
    dotMinSizeMobile: 6,
    finalDotSize: 150,
    finalDotSizeMobile: 100,

    // Phase timing (as percentage of intro scroll - from SCROLL_TIMING.INTRO_TOTAL)
    phase1End: SCROLL_TIMING.INTRO_PHASE1_END,
    phase3Start: SCROLL_TIMING.INTRO_PHASE3_START,
    phase3End: 1.0,

    // Reference screen for constellation positioning
    refWidth: 1400,
    refHeight: 800,

    // Breakpoints
    mobileBreakpoint: 768,
    tabletBreakpoint: 1024,
  };

  // Constellation dot colors
  const DOT_COLORS = [
    { hex: '#FF9F5A', r: 255, g: 159, b: 90 },   // Orange
    { hex: '#FFEC8A', r: 255, g: 236, b: 138 },  // Yellow
    { hex: '#8A6FD1', r: 138, g: 111, b: 209 },  // Purple
    { hex: '#7AAFD6', r: 122, g: 175, b: 214 },  // Blue
    { hex: '#B0D89F', r: 176, g: 216, b: 159 },  // Green
    { hex: '#FF6B4A', r: 255, g: 107, b: 74 },   // Red
    { hex: '#A96FD2', r: 169, g: 111, b: 210 },  // Violet
  ];

  // Constellation reference coordinates (shifted 10% left)
  // z: depth value (-1 to 1, negative = further back, positive = closer)
  const CONSTELLATION_REF = [
    { x: 406 - 140, y: 335, z: -0.3 },   // 0 - slightly back
    { x: 455 - 140, y: 668, z: 0.4 },    // 1 - forward
    { x: 754 - 140, y: 343, z: -0.5 },   // 2 - further back
    { x: 779 - 140, y: 504, z: 0.2 },    // 3 - slightly forward
    { x: 1057 - 140, y: 128, z: 0.6 },   // 4 - most forward
    { x: 1209 - 140, y: 378, z: -0.2 },  // 5 - slightly back
    { x: 1032 - 140, y: 629, z: 0.1 },   // 6 - near center
  ];

  // Line connections between dots
  const CONNECTIONS = [
    { points: [0, 1] },
    { points: [0, 2] },
    { points: [1, 3] },
    { points: [2, 3] },
    { points: [2, 4] },
    { points: [4, 5] },
    { points: [5, 6] },
    { points: [6, 3] },
  ];

  // ==========================================================================
  // DOM ELEMENTS
  // ==========================================================================
  const elements = {
    bgCanvas: document.getElementById('bg-canvas'),
    logoContainer: document.getElementById('logo-container'),
    introLogo: document.getElementById('intro-logo'),
    dotWhite: document.getElementById('dot-white'),
    dotBlack: document.getElementById('dot-black'),
    finalDot: document.getElementById('final-dot'),
    transitionText: document.getElementById('transition-text'),
    constCanvas: document.getElementById('constellation-canvas'),
    revealText: document.getElementById('reveal-text'),
    missionOverlay: document.getElementById('mission-overlay'),
    introSection: document.querySelector('.intro'),
    introContent: document.querySelector('.intro-content'),
  };

  // Canvas contexts
  const constCtx = elements.constCanvas.getContext('2d');
  const gl = elements.bgCanvas.getContext('webgl') || elements.bgCanvas.getContext('experimental-webgl');

  // ==========================================================================
  // STATE
  // ==========================================================================
  let fireworkDots = [];
  let phase2Started = false;
  let startTime = Date.now();
  let program, posAttr, resUniform, timeUniform, pulseUniform, buffer;
  let pulseValue = 0; // Big bang pulse effect (0 = no pulse, 0-1 = animating)
  let pulseTriggered = false; // Track if pulse has been triggered
  let masterRenderLoop = null; // Consolidated render loop reference
  let isPageVisible = true; // Track page visibility for RAF optimization
  let webglContextsLost = false; // Track if any WebGL context was lost
  let contextListenersAdded = false; // Prevent duplicate event listeners
  // Tracks which section is currently visible. Drives off-screen WebGL gating in masterRender().
  // Defaults to 'intro' so the intro renders before any ScrollTrigger fires.
  let currentSection = 'intro';

  // ==========================================================================
  // DEBUG SYSTEM - Set to true to enable logging
  // ==========================================================================
  const DEBUG_ENABLED = false; // Change to false to disable all logging

  function log(message) {
    if (!DEBUG_ENABLED) return;

    // Try multiple sources for scroll position
    const scrollY = window.scrollY ||
                    window.pageYOffset ||
                    document.documentElement.scrollTop ||
                    document.body.scrollTop || 0;

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const scrollHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    );

    const vh = (scrollY / viewportHeight).toFixed(2);
    const maxScroll = scrollHeight - viewportHeight;
    const pagePercent = maxScroll > 0 ? ((scrollY / maxScroll) * 100).toFixed(1) : '0.0';

    // Determine section based on vh
    const vhNum = parseFloat(vh);
    const section = vhNum < 4 ? 'INTRO' : vhNum < 7.5 ? 'TEXT' : vhNum < 10 ? 'MUSE' : 'COMET';

    console.log(`[${vh}vh | ${pagePercent}% | ${scrollY}px | ${section}] ${message}`);
  }

  // Track scroll position every 0.5vh for reference
  if (DEBUG_ENABLED) {
    let lastLoggedVh = -1;
    let scrollEventCount = 0;

    window.addEventListener('scroll', () => {
      scrollEventCount++;

      // Try all scroll position sources
      const scrollY = window.scrollY ||
                      window.pageYOffset ||
                      document.documentElement.scrollTop ||
                      document.body.scrollTop || 0;

      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const scrollHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      );
      const vh = (scrollY / viewportHeight).toFixed(2);
      const vhNum = parseFloat(vh);
      const maxScroll = scrollHeight - viewportHeight;
      const pagePercent = maxScroll > 0 ? ((scrollY / maxScroll) * 100).toFixed(1) : '0.0';

      // Debug: Log first 3 scroll events to diagnose
      if (scrollEventCount <= 3) {
        console.log(`DEBUG: Scroll event #${scrollEventCount} - scrollY=${scrollY}, window.scrollY=${window.scrollY}, docElement.scrollTop=${document.documentElement.scrollTop}`);
      }

      if (Math.abs(vhNum - lastLoggedVh) >= 0.5) {
        const section = vhNum < 4 ? 'INTRO' : vhNum < 7.5 ? 'TEXT' : vhNum < 10 ? 'MUSE' : 'COMET';
        console.log(`>> Scroll: ${vh}vh | ${pagePercent}% | Section: ${section}`);
        lastLoggedVh = vhNum;
      }
    }, { passive: true });
  }

  // ==========================================================================
  // UTILITY FUNCTIONS
  // ==========================================================================
  function isMobile() {
    return window.innerWidth <= CONFIG.mobileBreakpoint;
  }

  function isTablet() {
    return window.innerWidth <= CONFIG.tabletBreakpoint && window.innerWidth > CONFIG.mobileBreakpoint;
  }

  function getResponsiveValue(desktop, mobile, tablet = null) {
    if (isMobile()) return mobile;
    if (tablet !== null && isTablet()) return tablet;
    return desktop;
  }

  // ==========================================================================
  // EASING FUNCTIONS
  // ==========================================================================
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  // Debounce function for performance optimization
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ==========================================================================
  // WEBGL BACKGROUND SHADER
  // ==========================================================================
  const vertexShaderSource = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fragmentShaderSource = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_pulse;

    ${GLSL_UTILS.SIMPLEX_NOISE}
    ${GLSL_UTILS.STAR_FIELD}

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      float aspect = u_resolution.x / u_resolution.y;
      vec2 uvAspect = vec2(uv.x * aspect, uv.y);

      // Base cosmic noise
      // Optimized: reduced from 5 to 3 noise layers for better performance
      float noise1 = snoise(uvAspect * 3.0 + u_time * 0.05);
      float noise2 = snoise(uvAspect * 5.0 - u_time * 0.03 + 50.0);
      float noise3 = snoise(uvAspect * 2.0 + u_time * 0.02 + 100.0);
      float combined = (noise1 + noise2 * 0.6 + noise3 * 0.8) / 2.4;
      combined = combined * 0.5 + 0.5;

      float base = 0.003;
      float highlight = combined * 0.025;
      float clouds = pow(combined, 2.0) * 0.02;
      float detail = pow(snoise(uvAspect * 7.0 + u_time * 0.08) * 0.5 + 0.5, 2.5) * 0.01;
      float brightness = base + highlight + clouds + detail;

      // Add twinkling stars
      float starLight = stars(uv, u_time);
      brightness += starLight * 0.25;

      // Big bang pulse effect - subtle dispersive wave from center
      if (u_pulse > 0.0) {
        vec2 center = vec2(0.5, 0.5);
        vec2 toCenter = uv - center;
        toCenter.x *= aspect;

        // Add noise to make it less circular and more organic
        float noiseOffset = snoise(uv * 4.0 + u_time * 0.1) * 0.15;
        float dist = length(toCenter) + noiseOffset;

        // Soft expanding glow instead of hard ring
        float expandRadius = u_pulse * 2.0;
        float fadeOut = 1.0 - u_pulse;

        // Multiple soft waves for dispersive effect
        float wave1 = exp(-pow((dist - expandRadius * 0.5) * 4.0, 2.0)) * 0.12;
        float wave2 = exp(-pow((dist - expandRadius * 0.8) * 3.0, 2.0)) * 0.08;
        float wave3 = exp(-pow((dist - expandRadius) * 2.5, 2.0)) * 0.05;

        // Combine waves with fade
        float pulseIntensity = (wave1 + wave2 + wave3) * fadeOut * fadeOut;

        // Very subtle central glow at the beginning
        float flash = fadeOut * fadeOut * fadeOut * exp(-dist * 4.0) * 0.1;

        brightness += pulseIntensity + flash;
      }

      gl_FragColor = vec4(vec3(brightness), 1.0);
    }
  `;

  function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader error:', gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  }

  function initWebGL() {
    if (!gl) {
      console.warn('WebGL not supported, background animation disabled');
      return;
    }

    // Add context loss/restore handlers (only once)
    if (!contextListenersAdded) {
      elements.bgCanvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        console.warn('WebGL context lost - will attempt restore');
        webglContextsLost = true;
        if (masterRenderLoop) {
          cancelAnimationFrame(masterRenderLoop);
          masterRenderLoop = null;
        }
      }, false);

      elements.bgCanvas.addEventListener('webglcontextrestored', () => {
        console.log('WebGL context restored - reinitializing');
        webglContextsLost = false;
        initWebGL();
        resize();
        if (!masterRenderLoop) {
          masterRender();
        }
      }, false);

      contextListenersAdded = true;
    }

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) {
      console.error('Failed to create WebGL shaders');
      return;
    }

    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('WebGL program link error:', gl.getProgramInfoLog(program));
      return;
    }

    posAttr = gl.getAttribLocation(program, 'a_position');
    resUniform = gl.getUniformLocation(program, 'u_resolution');
    timeUniform = gl.getUniformLocation(program, 'u_time');
    pulseUniform = gl.getUniformLocation(program, 'u_pulse');

    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
  }

  // ==========================================================================
  // RESIZE HANDLER (OPTIMIZED DPR FOR PERFORMANCE)
  // ==========================================================================
  function resize() {
    // Cap DPR on mobile for better performance (prevents 3x scaling on high-end phones)
    const baseDPR = window.devicePixelRatio || 1;
    const dpr = isMobile() ? Math.min(baseDPR, 2) : baseDPR;
    const w = window.innerWidth;
    const h = window.innerHeight;

    elements.bgCanvas.width = w * dpr;
    elements.bgCanvas.height = h * dpr;
    if (gl) gl.viewport(0, 0, elements.bgCanvas.width, elements.bgCanvas.height);

    elements.constCanvas.width = w * dpr;
    elements.constCanvas.height = h * dpr;
    elements.constCanvas.style.width = w + 'px';
    elements.constCanvas.style.height = h + 'px';

    // Only init firework dots if phase3 has already started (don't init on page load)
    if (phase2Started) {
      initFireworkDots();
    }
    updatePositions();
  }

  // ==========================================================================
  // FIREWORK DOTS INITIALIZATION
  // ==========================================================================
  function initFireworkDots() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const centerX = w / 2;
    const centerY = h / 2;

    const scale = Math.min(w / CONFIG.refWidth, h / CONFIG.refHeight) * 0.85;
    const offsetX = (w - CONFIG.refWidth * scale) / 2;
    const offsetY = (h - CONFIG.refHeight * scale) / 2;

    fireworkDots = CONSTELLATION_REF.map((point, i) => {
      const targetX = point.x * scale + offsetX;
      const targetY = point.y * scale + offsetY;
      const z = point.z || 0; // Depth value

      const angle = (i / 7) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 0.8 + Math.random() * 0.4;

      return {
        startX: centerX,
        startY: centerY,
        targetX,
        targetY,
        z, // Store z-depth
        x: centerX,
        y: centerY,
        angle,
        speed,
        trail: [],
        maxTrail: 15 + Math.floor(Math.random() * 10),
      };
    });
  }

  // ==========================================================================
  // UPDATE CONSTELLATION EXPLOSION (Phase 3)
  // ==========================================================================
  function updateConstellationExplosion(progress) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const centerX = w / 2;
    const centerY = h / 2;
    const finalDotSize = getResponsiveValue(CONFIG.finalDotSize, CONFIG.finalDotSizeMobile);

    // Hide orbit elements
    elements.logoContainer.style.display = 'none';
    elements.dotWhite.style.display = 'none';
    elements.dotBlack.style.display = 'none';
    elements.introLogo.style.opacity = 0;
    elements.constCanvas.style.opacity = 1;

    // Setup final dot size
    elements.finalDot.style.width = finalDotSize + 'px';
    elements.finalDot.style.height = finalDotSize + 'px';

    // Final dot fades out quickly at start
    const explosionFadeEnd = 0.15;
    if (progress < explosionFadeEnd) {
      elements.finalDot.classList.add('visible');
      elements.finalDot.style.opacity = 1 - (progress / explosionFadeEnd);
    } else {
      elements.finalDot.style.opacity = 0;
      elements.finalDot.classList.remove('visible');
    }

    // Initialize firework dots on first call
    if (!phase2Started) {
      initFireworkDots();
      phase2Started = true;

      // Trigger the big bang pulse effect
      if (!pulseTriggered) {
        pulseValue = 0.01; // Start the pulse
        pulseTriggered = true;
      }
    }

    // Update constellation animation
    updateFireworkDots(progress, centerX, centerY);
  }

  // ==========================================================================
  // UPDATE POSITIONS BASED ON SCROLL (Legacy - kept for compatibility)
  // ==========================================================================
  function updatePositions(scrollTrigger) {
    // This function is now mostly handled by GSAP animations
    // Phase 1: updateOrbitPositions() called by GSAP
    // Phase 3: updateConstellationExplosion() called by GSAP

    // Reset pulse trigger when scrolling back
    const currentScroll = window.scrollY;
    const introScrollHeight = window.innerHeight * (SCROLL_TIMING.INTRO_TOTAL / 100);
    const overallProgress = Math.min(1, currentScroll / introScrollHeight);

    if (overallProgress < CONFIG.phase3Start && pulseTriggered) {
      pulseTriggered = false;
    }

    if (overallProgress < CONFIG.phase1End && phase2Started) {
      phase2Started = false;
    }
  }

  // ==========================================================================
  // UPDATE FIREWORK DOTS
  // ==========================================================================
  function updateFireworkDots(progress, centerX, centerY) {
    // Cap DPR on mobile for performance (consistent with resize handler)
    const baseDPR = window.devicePixelRatio || 1;
    const dpr = isMobile() ? Math.min(baseDPR, 2) : baseDPR;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Save context state and apply transform
    constCtx.save();
    constCtx.clearRect(0, 0, elements.constCanvas.width, elements.constCanvas.height);

    const explosionEnd = 0.4;
    const settleStart = 0.35;

    // Update dot positions (without manual rotation - let CSS handle it)
    fireworkDots.forEach((dot, i) => {
      let x, y;

      if (progress < explosionEnd) {
        const expProgress = easeOutCubic(progress / explosionEnd);
        const overshoot = 1.08;
        const midX = centerX + (dot.targetX - centerX) * overshoot;
        const midY = centerY + (dot.targetY - centerY) * overshoot;

        x = centerX + (midX - centerX) * expProgress;
        y = centerY + (midY - centerY) * expProgress;
      } else {
        const settleProgress = easeOutBack(Math.min(1, (progress - settleStart) / (1 - settleStart)));
        const overshoot = 1.08;
        const midX = centerX + (dot.targetX - centerX) * overshoot;
        const midY = centerY + (dot.targetY - centerY) * overshoot;

        x = midX + (dot.targetX - midX) * settleProgress;
        y = midY + (dot.targetY - midY) * settleProgress;
      }

      // Store positions without manual rotation (CSS transform handles rotation)
      dot.x = x;
      dot.y = y;

      dot.trail.unshift({ x, y });
      if (dot.trail.length > dot.maxTrail) {
        dot.trail.pop();
      }
    });

    // Draw trails
    fireworkDots.forEach((dot, i) => {
      if (dot.trail.length > 1 && progress < 0.7) {
        const trailOpacity = Math.max(0, 1 - progress / 0.7);

        for (let j = 1; j < dot.trail.length; j++) {
          const alpha = (1 - j / dot.trail.length) * 0.6 * trailOpacity;
          const size = (1 - j / dot.trail.length) * 4 + 2;

          constCtx.beginPath();
          constCtx.arc(dot.trail[j].x * dpr, dot.trail[j].y * dpr, size * dpr, 0, Math.PI * 2);
          constCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          constCtx.fill();
        }
      }
    });

    // Draw connecting lines
    const lineOpacity = progress > 0.5 ? Math.min(1, (progress - 0.5) / 0.3) : 0;
    if (lineOpacity > 0) {
      constCtx.lineCap = 'round';
      constCtx.lineJoin = 'round';

      CONNECTIONS.forEach((connection) => {
        const [a, b] = connection.points;
        const dotA = fireworkDots[a];
        const dotB = fireworkDots[b];

        const startColor = DOT_COLORS[a];
        const endColor = DOT_COLORS[b];

        const dx = dotB.x - dotA.x;
        const dy = dotB.y - dotA.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const gap = isMobile() ? 10 : 15;

        if (len > gap * 2) {
          const nx = dx / len;
          const ny = dy / len;

          const startX = (dotA.x + nx * gap) * dpr;
          const startY = (dotA.y + ny * gap) * dpr;
          const endX = (dotB.x - nx * gap) * dpr;
          const endY = (dotB.y - ny * gap) * dpr;

          const gradient = constCtx.createLinearGradient(startX, startY, endX, endY);

          gradient.addColorStop(0, `rgba(${startColor.r}, ${startColor.g}, ${startColor.b}, ${lineOpacity})`);
          gradient.addColorStop(0.2, `rgba(${startColor.r}, ${startColor.g}, ${startColor.b}, ${lineOpacity * 0.8})`);
          gradient.addColorStop(0.4, `rgba(255, 255, 255, ${lineOpacity * 0.5})`);
          gradient.addColorStop(0.5, `rgba(255, 255, 255, ${lineOpacity * 0.6})`);
          gradient.addColorStop(0.6, `rgba(255, 255, 255, ${lineOpacity * 0.5})`);
          gradient.addColorStop(0.8, `rgba(${endColor.r}, ${endColor.g}, ${endColor.b}, ${lineOpacity * 0.8})`);
          gradient.addColorStop(1, `rgba(${endColor.r}, ${endColor.g}, ${endColor.b}, ${lineOpacity})`);

          constCtx.strokeStyle = gradient;
          constCtx.lineWidth = (isMobile() ? 1 : 1.5) * dpr;

          constCtx.beginPath();
          constCtx.moveTo(startX, startY);
          constCtx.lineTo(endX, endY);
          constCtx.stroke();
        }
      });
    }

    // Sort dots by z-depth for proper layering (back to front)
    const sortedDots = fireworkDots
      .map((dot, i) => ({ dot, i, z: dot.z }))
      .sort((a, b) => a.z - b.z);

    // Draw dots with z-depth affecting size
    const time = Date.now() / 1000;
    const dotSizeBase = isMobile() ? 6 : 8;

    sortedDots.forEach(({ dot, i }) => {
      const color = DOT_COLORS[i];

      const pulse = 0.8 + 0.2 * Math.sin(time * (2.5 + i * 0.2) + i * 0.5);
      const baseSize = dotSizeBase + (progress > 0.5 ? 2 : 4 * (1 - progress / 0.5));

      // Z-depth affects size: closer (positive z) = bigger, further (negative z) = smaller
      const zScale = 1 + dot.z * 0.4; // Range: 0.6 to 1.4
      const size = baseSize * pulse * zScale;

      // Z-depth also affects opacity slightly (further = slightly dimmer)
      const zOpacity = 0.7 + (dot.z + 1) * 0.15; // Range: 0.55 to 1.0

      constCtx.beginPath();
      constCtx.arc(dot.x * dpr, dot.y * dpr, size * dpr, 0, Math.PI * 2);
      constCtx.fillStyle = color.hex;
      constCtx.globalAlpha = zOpacity;
      constCtx.fill();
    });

    // Restore context state (ensures clean slate for next frame)
    constCtx.restore();
  }

  // ==========================================================================
  // MASTER RENDER LOOP (CONSOLIDATED & OPTIMIZED)
  // ==========================================================================
  let lastActiveProgram = null; // Cache active WebGL program to avoid redundant switches

  function masterRender() {
    // Skip rendering if page is hidden (battery optimization)
    if (!isPageVisible || webglContextsLost) {
      masterRenderLoop = requestAnimationFrame(masterRender);
      return;
    }

    const time = (Date.now() - startTime) / 1000;

    // Animate pulse if active
    if (pulseValue > 0 && pulseValue < 1) {
      pulseValue += 0.015; // Speed of pulse expansion
      if (pulseValue >= 1) {
        pulseValue = 0;
      }
    }

    // Render intro WebGL background (optimized with state caching)
    // Off-screen gate: only intro section needs this canvas.
    if (gl && program && currentSection === 'intro') {
      if (lastActiveProgram !== program) {
        gl.useProgram(program);
        gl.enableVertexAttribArray(posAttr);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);
        lastActiveProgram = program;
      }
      gl.uniform2f(resUniform, elements.bgCanvas.width, elements.bgCanvas.height);
      gl.uniform1f(timeUniform, time);
      gl.uniform1f(pulseUniform, pulseValue);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    // Render Muse background (inverted starfield: black stars on offwhite)
    // Off-screen gate: muse section only.
    if (MuseBackground.gl && MuseBackground.program && currentSection === 'muse') {
      const museGL = MuseBackground.gl;
      if (lastActiveProgram !== MuseBackground.program) {
        museGL.useProgram(MuseBackground.program);
        lastActiveProgram = MuseBackground.program;
      }
      museGL.uniform2f(MuseBackground.resUniform, MuseBackground.canvas.width, MuseBackground.canvas.height);
      museGL.uniform1f(MuseBackground.timeUniform, time);
      museGL.uniform3f(MuseBackground.bgColorUniform, MuseBackground.bgColor[0], MuseBackground.bgColor[1], MuseBackground.bgColor[2]);
      museGL.uniform3f(MuseBackground.starColorUniform, MuseBackground.starColor[0], MuseBackground.starColor[1], MuseBackground.starColor[2]);
      museGL.uniform1f(MuseBackground.invertUniform, MuseBackground.invert);
      museGL.uniform1f(MuseBackground.intensityUniform, MuseBackground.intensity);
      museGL.drawArrays(museGL.TRIANGLES, 0, 6);
    }

    // Render Unified Starfield (batch uniforms, minimize state changes)
    // Off-screen gate: shared backdrop spans the muse and comet sections.
    if (UnifiedStarfield.gl && UnifiedStarfield.program &&
        (currentSection === 'muse' || currentSection === 'comet')) {
      const starGL = UnifiedStarfield.gl;
      if (lastActiveProgram !== UnifiedStarfield.program) {
        starGL.useProgram(UnifiedStarfield.program);
        lastActiveProgram = UnifiedStarfield.program;
      }
      starGL.uniform2f(UnifiedStarfield.resUniform, UnifiedStarfield.canvas.width, UnifiedStarfield.canvas.height);
      starGL.uniform1f(UnifiedStarfield.timeUniform, time);
      starGL.uniform3f(UnifiedStarfield.bgColorUniform, UnifiedStarfield.bgColor[0], UnifiedStarfield.bgColor[1], UnifiedStarfield.bgColor[2]);
      starGL.uniform3f(UnifiedStarfield.starColorUniform, UnifiedStarfield.starColor[0], UnifiedStarfield.starColor[1], UnifiedStarfield.starColor[2]);
      starGL.uniform1f(UnifiedStarfield.invertUniform, UnifiedStarfield.invert);
      starGL.uniform1f(UnifiedStarfield.intensityUniform, UnifiedStarfield.intensity);
      starGL.drawArrays(starGL.TRIANGLES, 0, 6);
    }

    // Render Comet background canvas 1 (methods section, inverted starfield)
    // Off-screen gate: comet section only.
    const cometSF1 = CometBgPrimary;
    if (cometSF1.gl && cometSF1.program && currentSection === 'comet') {
      const cometGL = cometSF1.gl;
      if (lastActiveProgram !== cometSF1.program) {
        cometGL.useProgram(cometSF1.program);
        lastActiveProgram = cometSF1.program;
      }
      cometGL.uniform2f(cometSF1.resUniform, cometSF1.canvas.width, cometSF1.canvas.height);
      cometGL.uniform1f(cometSF1.timeUniform, time);
      cometGL.uniform3f(cometSF1.bgColorUniform, cometSF1.bgColor[0], cometSF1.bgColor[1], cometSF1.bgColor[2]);
      cometGL.uniform3f(cometSF1.starColorUniform, cometSF1.starColor[0], cometSF1.starColor[1], cometSF1.starColor[2]);
      cometGL.uniform1f(cometSF1.invertUniform, cometSF1.invert);
      cometGL.uniform1f(cometSF1.intensityUniform, cometSF1.intensity);
      cometGL.drawArrays(cometGL.TRIANGLES, 0, 6);
    }

    // Update Muse orbit positions — only when muse section is visible.
    // Saves 7 element style writes per frame outside the muse section.
    if (MuseScroll.isInitialized && currentSection === 'muse') {
      MuseScroll.updateOrbitPositions();
    }

    // Redraw the process starline — only in the comet section (intro panel).
    if (currentSection === 'comet') {
      ProcessLinks.draw();
    }

    masterRenderLoop = requestAnimationFrame(masterRender);
  }

  // ==========================================================================
  // EVENT LISTENERS
  // ==========================================================================
  function initEventListeners() {
    // GSAP ScrollTrigger replaces manual scroll listener
    ScrollTrigger.create({
      trigger: '.scroll-container',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        updatePositions(self);
        // Off-screen WebGL gating — derive currentSection from scroll position.
        // Section vh boundaries (cumulative): intro 0-480, muse 480-1080, comet 1080-1480, events 1480+.
        // Sources: SCROLL_TIMING.INTRO_TOTAL (480, mission overlays its back half),
        // .muse-section-wrapper (400vh CSS = MUSE_TOTAL), .comet-collab-wrapper (400vh CSS = COMET_TOTAL).
        // BUFFER: shift each upcoming threshold ~75vh earlier so the next section's
        // starfield is already drawing before it scrolls into view (no pop-in).
        const vhPx = window.innerHeight / 100;
        const BUFFER_VH = 75;
        const bufferPx = BUFFER_VH * vhPx;
        // Lead-buffered thresholds: shift earlier so the next section's
        // starfield is already drawing before it scrolls into view (no pop-in
        // for the white-on-black/inverted shaders waking up).
        // The mission statement now lives inside the intro overlay (no separate
        // text section), so muse follows the intro directly.
        const introEndPx = SCROLL_TIMING.INTRO_TOTAL * vhPx - bufferPx;
        const museEndPx  = (SCROLL_TIMING.INTRO_TOTAL + SCROLL_TIMING.MUSE_TOTAL) * vhPx - bufferPx;
        const cometEndPx = (SCROLL_TIMING.INTRO_TOTAL + SCROLL_TIMING.MUSE_TOTAL + SCROLL_TIMING.COMET_TOTAL) * vhPx - bufferPx;
        // Unbuffered intro end: we don't want to hide .intro until phase 3 is
        // visually done. The lead buffer is for waking other shaders, not for
        // tearing down the current one.
        const introHideAtPx = SCROLL_TIMING.INTRO_TOTAL * vhPx;
        const y = self.scroll();
        let next;
        if      (y < introEndPx) next = 'intro';
        else if (y < museEndPx)  next = 'muse';
        else if (y < cometEndPx) next = 'comet';
        else                     next = 'events';
        if (next !== currentSection) currentSection = next;

        // .intro is a fixed full-screen overlay (z=10) holding both
        // #bg-canvas (cosmic-noise WebGL) and #constellation-canvas (2D).
        // .white-section (z=30) sits above but is transparent; the muse stage's
        // white bg starts at opacity 0. The last drawn frames of both intro canvases
        // bleed through during/after the muse crossfade. Hide the whole .intro
        // overlay past the unbuffered intro end; restore on scroll-back so
        // re-entering phase 3 redraws cleanly.
        if (elements.introSection) {
          const shouldHideIntro = y >= introHideAtPx;
          const isHidden = elements.introSection.style.visibility === 'hidden';
          if (shouldHideIntro && !isHidden) {
            if (constCtx && elements.constCanvas) {
              constCtx.clearRect(0, 0, elements.constCanvas.width, elements.constCanvas.height);
            }
            elements.introSection.style.visibility = 'hidden';
          } else if (!shouldHideIntro && isHidden) {
            elements.introSection.style.visibility = '';
          }
        }
      },
      invalidateOnRefresh: true,
    });

    // Consolidated resize handler with debouncing (optimized to 150ms for stability)
    const handleResize = debounce(() => {
      resize();
      MuseScroll.handleResize();
      MuseBackground.resize();
      UnifiedStarfield.resize();
      CometBgPrimary.resize();
      ScrollTrigger.refresh();
    }, 150);

    window.addEventListener('resize', handleResize, { passive: true });

    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        ScrollTrigger.refresh();
        if (phase2Started) { initFireworkDots(); }
      }, 300);
    }, { passive: true });

    // Page Visibility API - pause rendering when tab hidden (battery optimization)
    document.addEventListener('visibilitychange', () => {
      isPageVisible = !document.hidden;
      if (isPageVisible && !masterRenderLoop && !webglContextsLost) {
        // Resume rendering when page becomes visible
        masterRender();
      }
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      if (masterRenderLoop) {
        cancelAnimationFrame(masterRenderLoop);
        masterRenderLoop = null;
      }
    });

    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    });
  }

  // ==========================================================================
  // GSAP SCROLL ANIMATIONS
  // ==========================================================================
  function initGSAPAnimations() {
    const h = window.innerHeight;
    const introScrollHeight = h * (SCROLL_TIMING.INTRO_TOTAL / 100);
    const textSectionTop = introScrollHeight;

    // Phase 1: Orbit animations using GSAP
    const orbitState = {
      progress: 0,
      logoSize: CONFIG.logoMinSize,
      rotation: CONFIG.totalRotations * 360
    };

    let lastOrbitLog = -1;
    gsap.to(orbitState, {
      progress: 1,
      logoSize: () => getResponsiveValue(CONFIG.logoMaxSize, CONFIG.logoMaxSizeMobile),
      rotation: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '.scroll-container',
        start: 'top top',
        end: () => `top+=${introScrollHeight * CONFIG.phase1End}px top`,
        scrub: true,
        invalidateOnRefresh: true,
        onEnter: () => log('🎯 INTRO-PHASE1 START: Orbiting dots + logo rotation'),
        onUpdate: () => {
          updateOrbitPositions(orbitState);
          if (Math.abs(orbitState.progress - lastOrbitLog) > 0.25) {
            log(`ORBIT progress ${(orbitState.progress * 100).toFixed(0)}%`);
            lastOrbitLog = orbitState.progress;
          }
        },
        onLeave: () => log('ORBIT complete')
      }
    });

    // Transition text: appears at 76% orbit progress, fades out when explosion starts
    const transitionTextStart = CONFIG.phase1End * 0.76; // 76% of orbit animation (30.4% of intro)
    gsap.timeline({
      scrollTrigger: {
        trigger: '.scroll-container',
        start: () => `top+=${introScrollHeight * transitionTextStart}px top`,
        end: () => `top+=${introScrollHeight * SCROLL_TIMING.INTRO_PHASE2_TEXT}px top`,
        scrub: true,
        invalidateOnRefresh: true,
        onEnter: () => log('📝 TRANSITION-TEXT: "art as infrastructure for change" (orbit 76%)'),
      }
    })
    .fromTo(elements.transitionText,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: 'none' }
    )
    .to(elements.transitionText,
      { opacity: 1, duration: 0.3, ease: 'none' }, // Hold visible
      '+=0'
    )
    .to(elements.transitionText,
      { opacity: 0, duration: 0.3, ease: 'none' }
    );

    // Phase 3: Constellation explosion animation.
    // The explosion runs across the full phase-3 scroll range (phase3Start→1.0),
    // but its visual motion is FRONT-LOADED: progress reaches 1.0 by
    // EXPLOSION_SETTLE (0.58 of the 480vh intro = ~278vh) and holds there, leaving
    // the back ~200vh of the intro for the mission statement. We drive
    // updateConstellationExplosion with a remapped progress so the dots freeze in
    // place while the raw scroll keeps advancing.
    const EXPLOSION_SETTLE = 0.68; // intro fraction where dots finish settling (0.50→0.68 ≈ 1.8 scrolls of visible explosion)
    const phase3State = { progress: 0 };
    let lastExplosionLog = -1;
    gsap.to(phase3State, {
      progress: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '.scroll-container',
        start: () => `top+=${introScrollHeight * CONFIG.phase3Start}px top`,
        end: () => `top+=${introScrollHeight * CONFIG.phase3End}px top`,
        scrub: true,
        invalidateOnRefresh: true,
        onEnter: () => log('🎯 INTRO-PHASE3 START: Constellation explosion + big bang pulse'),
        onUpdate: () => {
          // Map raw phase-3 progress (0→1 over phase3Start→1.0) onto the
          // settle window: 0→1 over phase3Start→EXPLOSION_SETTLE, then clamp.
          const settleSpan = EXPLOSION_SETTLE - CONFIG.phase3Start;
          const rawIntro = CONFIG.phase3Start + phase3State.progress * (CONFIG.phase3End - CONFIG.phase3Start);
          const explosionProgress = Math.min(1, Math.max(0, (rawIntro - CONFIG.phase3Start) / settleSpan));
          updateConstellationExplosion(explosionProgress);
          if (Math.abs(explosionProgress - lastExplosionLog) > 0.25) {
            log(`EXPLOSION progress ${(explosionProgress * 100).toFixed(0)}%`);
            lastExplosionLog = explosionProgress;
          }
        },
        onLeave: () => log('EXPLOSION complete')
      }
    });

    // Smoke/dots clear: after the explosion settles, the constellation dots +
    // smoke fade OUT first, leaving a clean backdrop. Only THEN does the mission
    // appear (sequence requested by design): explosion → smoke clears → mission.
    const smokeFadeStart = 0.70; // ~336vh — just after EXPLOSION_SETTLE (0.68)
    const smokeFadeEnd   = 0.76; // ~365vh — smoke gone; mission comes in right after (no dead gap)
    // "Smoke" = BOTH the 2D constellation dots (#constellation-canvas) AND the
    // cosmic-noise WebGL backdrop (#bg-canvas, a sibling of .intro-content). Both
    // must fade so the mission lands on a clean black field, not a glowing nebula.
    const smokeLayers = [elements.constCanvas, elements.bgCanvas].filter(Boolean);
    if (smokeLayers.length) {
      gsap.fromTo(smokeLayers,
        { opacity: 1 },
        {
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: '.scroll-container',
            start: () => `top+=${introScrollHeight * smokeFadeStart}px top`,
            end: () => `top+=${introScrollHeight * smokeFadeEnd}px top`,
            scrub: true,
            invalidateOnRefresh: true,
            onEnter: () => log('💨 SMOKE: dots + cosmic noise clearing before mission'),
            onLeave: () => log('SMOKE cleared')
          }
        }
      );
    }

    // Mission statement: fades in right as the smoke finishes clearing (0.76) —
    // slightly after the explosion, no dead gap. Quick fade-in to full brightness,
    // then holds at opacity 1 through the bright hold until the joint fade-out
    // (0.92→1.0) carries it away as the muse intro comes in underneath.
    const missionFadeStart = 0.76; // ~365vh — comes in as smoke ends (slightly after explosion)
    const missionFadeEnd = 0.80;   // ~384vh
    if (elements.missionOverlay) {
      gsap.fromTo(elements.missionOverlay,
        { opacity: 0 },
        {
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.scroll-container',
            start: () => `top+=${introScrollHeight * missionFadeStart}px top`,
            end: () => `top+=${introScrollHeight * missionFadeEnd}px top`,
            scrub: true,
            invalidateOnRefresh: true,
            onEnter: () => log('🎯 MISSION: Fading in over settled dots'),
            onLeave: () => log('MISSION fully visible')
          }
        }
      );
    }

    // Intro fade-out: dots + mission fade out together as one unit over the last
    // stretch of the intro (~432→480vh), handing off to the Muse intro fading in
    // underneath. The gating logic still sets visibility:hidden at exactly 480vh
    // to finalize the (already invisible) state and stop canvas bleed-through.
    const introFadeStart = 0.92; // ~442vh — mission holds 0.80→0.92, then fades out as muse intro comes in
    if (elements.introContent) {
      gsap.fromTo(elements.introContent,
        { opacity: 1 },
        {
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: '.scroll-container',
            start: () => `top+=${introScrollHeight * introFadeStart}px top`,
            end: () => `top+=${introScrollHeight * CONFIG.phase3End}px top`,
            scrub: true,
            invalidateOnRefresh: true,
            onEnter: () => log('🌌 INTRO FADE-OUT: dots + mission → muse intro')
          }
        }
      );
    }

    // Muse: ONE overlapping panel. Intro and orbit share .muse-stage so the
    // shared center logo stays put while the background flips black→white at the
    // switch. The intro layers are transparent (black starfield behind shows
    // through), and only the white .muse-section is opaque — so crossfading the
    // white bg IN over the transparent intro is race-free (unlike the comet case).
    const musePanel = document.querySelector('.muse-panel');
    const museSharedLogo = document.querySelector('.muse-shared-logo');
    const museLogoWhite = document.getElementById('muse-logo-white');
    const museLogoBlack = document.getElementById('muse-logo-black');
    const museIntroCopy = document.querySelector('.muse-intro-copy');
    const museSection = document.querySelector('.muse-section');

    if (musePanel && museSharedLogo && museSection) {
      const FADE = SCROLL_TIMING.MUSE_FADEIN;        // 100vh — intro fade-in
      const SWITCH_AT = SCROLL_TIMING.MUSE_INTRO_HOLD; // 300vh — switch starts (fade + hold)
      const SWITCH = SCROLL_TIMING.MUSE_CROSSFADE;   // 100vh — the black→white switch window

      // Center the shared logo via GSAP so the filter flip composes without drift.
      gsap.set(museSharedLogo, { xPercent: -50, yPercent: -50, opacity: 0 });

      // --- Intro in (0 → FADE): logo + intro copy fade up over the black bg. ---
      gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: '.muse-panel',
          start: 'top top',
          end: `top+=${FADE}vh top`,
          scrub: true, invalidateOnRefresh: true,
          onEnter: () => log('🎯 MUSE-INTRO: fading in')
        }
      })
      .fromTo(museSharedLogo, { opacity: 0 }, { opacity: 1 }, 0)
      .fromTo(museIntroCopy, { opacity: 0 }, { opacity: 1 }, 0);

      // --- Switch (SWITCH_AT → SWITCH_AT+SWITCH): bg crossfades black→white,
      //     logo opacity-crossfades white→black, intro copy fades out, orbit appears. ---
      gsap.timeline({
        scrollTrigger: {
          trigger: '.muse-panel',
          start: `top+=${SWITCH_AT}vh top`,
          end: `top+=${SWITCH_AT + SWITCH}vh top`,
          scrub: true, invalidateOnRefresh: true,
          onEnter: () => log('🌗 MUSE-SWITCH: black→white, logo crossfades'),
          onLeaveBack: () => log('🌗 MUSE-SWITCH: reversed to intro')
        }
      })
      // white background fades in (quick crossfade)
      .fromTo(museSection, { opacity: 0 }, { opacity: 1, ease: 'power1.inOut' }, 0)
      // logo crossfades: white image out, black image in (no filter() tween)
      .fromTo(museLogoWhite, { opacity: 1 }, { opacity: 0, ease: 'power1.inOut' }, 0)
      .fromTo(museLogoBlack, { opacity: 0 }, { opacity: 1, ease: 'power1.inOut' }, 0)
      // intro copy fades out as orbit takes over
      .fromTo(museIntroCopy, { opacity: 1 }, { opacity: 0, ease: 'power2.in' }, 0);
    }

    // Comet Collab intro page + methods tabs (sequential sticky panels)
    const cometIntroPage = document.getElementById('comet-collab-intro');

    if (cometIntroPage) {
      const cometMethods = document.querySelector('.comet-collab-methods');
      const CFADE = SCROLL_TIMING.COMET_INTRO_FADEIN; // 100vh fade duration

      // Hide constellation canvas as we enter the comet wrapper (overlaps panel 1).
      gsap.fromTo(elements.constCanvas,
        { opacity: 1 },
        {
          opacity: 0, ease: 'none',
          scrollTrigger: {
            trigger: '.comet-panel-intro',
            start: 'top top',
            end: `top+=${SCROLL_TIMING.COMET_CONST_HIDE}vh top`,
            scrub: true, invalidateOnRefresh: true,
          }
        }
      );

      // SEQUENTIAL PANELS: intro / tabs each own a 200vh wrapper and never
      // co-exist on screen. Each fades IN over its first CFADE and OUT over its
      // last CFADE (anchored to its OWN panel) — so the opaque methods panel
      // can no longer paint over the intro (the old z-index race is gone).

      // --- Panel 1: comet intro --- fade in, hold, fade out as panel leaves.
      gsap.fromTo(cometIntroPage,
        { opacity: 0 },
        {
          opacity: 1, ease: 'power2.out',
          scrollTrigger: {
            trigger: '.comet-panel-intro', start: 'top top',
            end: `top+=${CFADE}vh top`,
            scrub: true, invalidateOnRefresh: true,
            onEnter: () => log('🎯 COMET-INTRO: Fading in')
          }
        }
      );
      gsap.fromTo(cometIntroPage,
        { opacity: 1 },
        {
          opacity: 0, ease: 'power2.in',
          scrollTrigger: {
            trigger: '.comet-panel-intro',
            start: `bottom-=${CFADE}vh top`, end: 'bottom top',
            scrub: true, invalidateOnRefresh: true,
            onLeave: () => log('COMET-INTRO: out')
          }
        }
      );

      // --- Panel 2: tabs/methods --- fade in, hold, fade out as panel leaves.
      if (cometMethods) {
        gsap.fromTo(cometMethods,
          { opacity: 0 },
          {
            opacity: 1, ease: 'power2.out',
            scrollTrigger: {
              trigger: '.comet-panel-tabs', start: 'top top',
              end: `top+=${CFADE}vh top`,
              scrub: true, invalidateOnRefresh: true,
              onEnter: () => log('🎯 COMET-METHODS: Fading in')
            }
          }
        );
        gsap.fromTo(cometMethods,
          { opacity: 1 },
          {
            opacity: 0, ease: 'power2.in',
            scrollTrigger: {
              trigger: '.comet-panel-tabs',
              start: `bottom-=${CFADE}vh top`, end: 'bottom top',
              scrub: true, invalidateOnRefresh: true,
              onLeave: () => log('COMET-METHODS: out')
            }
          }
        );
      }
    }
  }

  // ==========================================================================
  // ORBIT POSITION UPDATES (GSAP-driven)
  // ==========================================================================
  function updateOrbitPositions(orbitState) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const centerX = w / 2;
    const centerY = h / 2;
    const mobileFactor = isMobile() ? 0.7 : 1;
    
    const dotMaxSize = getResponsiveValue(CONFIG.dotMaxSize, CONFIG.dotMaxSizeMobile);
    const dotMinSize = getResponsiveValue(CONFIG.dotMinSize, CONFIG.dotMinSizeMobile);

    // Show elements
    elements.logoContainer.style.display = 'flex';
    elements.dotWhite.style.display = 'block';
    elements.dotBlack.style.display = 'block';
    elements.finalDot.classList.remove('visible');
    elements.finalDot.style.opacity = 0;
    elements.constCanvas.style.opacity = 1;

    // Animate logo
    elements.logoContainer.style.width = orbitState.logoSize + 'px';
    elements.logoContainer.style.height = orbitState.logoSize + 'px';
    elements.logoContainer.style.transform = `translate(-50%, -50%) rotate(${orbitState.rotation}deg)`;
    elements.introLogo.style.opacity = 1;

    // Calculate orbit
    const startRadius = Math.min(w, h) * (0.5 - CONFIG.borderMargin);
    const endRadius = (orbitState.logoSize / 2) * (1 + CONFIG.logoMargin);
    const orbitRadius = startRadius + (endRadius - startRadius) * orbitState.progress;

    const orbitAngle = orbitState.progress * CONFIG.totalRotations * Math.PI * 2;
    const whiteAngle = -Math.PI / 2 + orbitAngle;
    const blackAngle = whiteAngle + Math.PI;

    const whiteX = centerX + Math.cos(whiteAngle) * orbitRadius;
    const whiteY = centerY + Math.sin(whiteAngle) * orbitRadius;
    const blackX = centerX + Math.cos(blackAngle) * orbitRadius;
    const blackY = centerY + Math.sin(blackAngle) * orbitRadius;

    const dotSize = (dotMaxSize - (dotMaxSize - dotMinSize) * orbitState.progress) * mobileFactor;
    const borderWidth = Math.max(1.5, dotSize * 0.15);

    // Update white dot
    elements.dotWhite.style.left = whiteX + 'px';
    elements.dotWhite.style.top = whiteY + 'px';
    elements.dotWhite.style.width = dotSize + 'px';
    elements.dotWhite.style.height = dotSize + 'px';
    elements.dotWhite.style.opacity = 1;

    // Update black dot
    elements.dotBlack.style.left = blackX + 'px';
    elements.dotBlack.style.top = blackY + 'px';
    elements.dotBlack.style.width = dotSize + 'px';
    elements.dotBlack.style.height = dotSize + 'px';
    elements.dotBlack.style.borderWidth = borderWidth + 'px';
    elements.dotBlack.style.borderStyle = 'solid';
    elements.dotBlack.style.borderColor = '#fff';
    elements.dotBlack.style.opacity = 1;

    constCtx.clearRect(0, 0, elements.constCanvas.width, elements.constCanvas.height);
  }


  // ==========================================================================
  // UNIFIED STARFIELD BACKGROUND (MUSE + COMET SECTIONS)
  // Factory: parameterized by canvas id + bg/star color so the same shader
  // can render an inverted (black-on-offwhite) variant for the muse intro.
  // ==========================================================================
  function createStarfield(canvasId, options) {
    options = options || {};
    return {
      canvas: null,
      gl: null,
      program: null,
      canvasId: canvasId,
      bgColor: options.bgColor || [0.0, 0.0, 0.0],
      starColor: options.starColor || [1.0, 1.0, 1.0],
      // When true, fragment output is inverted (1.0 - color) so the canonical
      // white-on-black starfield renders as black-on-white at full contrast.
      invert: options.invert ? 1.0 : 0.0,
      // Multiplies star brightness pre-mix. Default 0.25 matches the original
      // intensity; inverted variants need a higher value to make dark stars
      // read against an off-white surface.
      intensity: options.intensity != null ? options.intensity : 0.25,
      startTime: Date.now(),

      init() {
        this.canvas = document.getElementById(this.canvasId);
        if (!this.canvas) return;

        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        if (!this.gl) return;

        this.resize();
        this.initShaders();
      },

      resize() {
        // DPR cap at 2x (non-negotiable per CLAUDE.md mobile perf rule)
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = window.innerWidth;
        const h = window.innerHeight;

        this.canvas.width = w * dpr;
        this.canvas.height = h * dpr;
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';

        if (this.gl) {
          this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
      },

      initShaders() {
        const vertexShaderSource = `
          attribute vec2 a_position;
          void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
          }
        `;

        const fragmentShaderSource = `
          precision highp float;
          uniform vec2 u_resolution;
          uniform float u_time;
          uniform vec3 u_bgColor;
          uniform vec3 u_starColor;
          uniform float u_invert;
          uniform float u_intensity;

          ${GLSL_UTILS.STAR_FIELD}

          void main() {
            vec2 uv = gl_FragCoord.xy / u_resolution.xy;
            float starLight = stars(uv, u_time);
            float brightness = clamp(starLight * u_intensity, 0.0, 1.0);
            vec3 color = mix(u_bgColor, u_starColor, brightness);
            color = mix(color, vec3(1.0) - color, u_invert);
            gl_FragColor = vec4(color, 1.0);
          }
        `;

        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);

        const posAttr = this.gl.getAttribLocation(this.program, 'a_position');
        this.resUniform = this.gl.getUniformLocation(this.program, 'u_resolution');
        this.timeUniform = this.gl.getUniformLocation(this.program, 'u_time');
        this.bgColorUniform = this.gl.getUniformLocation(this.program, 'u_bgColor');
        this.starColorUniform = this.gl.getUniformLocation(this.program, 'u_starColor');
        this.invertUniform = this.gl.getUniformLocation(this.program, 'u_invert');
        this.intensityUniform = this.gl.getUniformLocation(this.program, 'u_intensity');

        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), this.gl.STATIC_DRAW);

        this.gl.enableVertexAttribArray(posAttr);
        this.gl.vertexAttribPointer(posAttr, 2, this.gl.FLOAT, false, 0, 0);
      },

      createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
          console.error('Starfield shader error:', this.gl.getShaderInfoLog(shader));
          return null;
        }
        return shader;
      }
    };
  }

  const UnifiedStarfield = createStarfield('unified-starfield-canvas');

  // Muse section uses an inverted starfield: black stars on off-white surface.
  const MuseBackground = createStarfield('muse-background-canvas', { invert: true, intensity: 0.9 });

  // ==========================================================================
  // COMET COLLAB PHASES BACKGROUND - INVERTED STARFIELD (BLACK ON OFFWHITE)
  // Rendered in masterRender().
  // ==========================================================================
  const CometBgPrimary   = createStarfield('comet-collab-background-canvas',   { invert: true, intensity: 0.9 });

  // ==========================================================================
  // FOCUS TRAP (shared by MusePopup)
  // ==========================================================================
  const FOCUSABLE_SELECTOR = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled])',
    'select:not([disabled])', 'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  function getFocusable(container) {
    if (!container) return [];
    return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR))
      .filter(el => el.offsetParent !== null || el === document.activeElement);
  }

  function createFocusTrap(container) {
    const handler = (e) => {
      if (e.key !== 'Tab') return;
      const focusable = getFocusable(container);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    return {
      activate() { document.addEventListener('keydown', handler); },
      deactivate() { document.removeEventListener('keydown', handler); }
    };
  }

  // Wire the three standard modal dismiss triggers (overlay click, close button,
  // Escape key) to a single close callback. `isOpenFn` guards the Escape handler
  // so it only fires while the modal is actually open. Shared by both popups.
  function wireModalDismiss({ overlay, closeBtn, onClose, isOpenFn }) {
    if (overlay) overlay.addEventListener('click', onClose);
    if (closeBtn) closeBtn.addEventListener('click', onClose);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpenFn()) onClose();
    });
  }

  // Save the currently-focused element and move focus into the modal.
  function captureFocus(focusTrap, focusTarget) {
    const previouslyFocused = document.activeElement;
    if (focusTrap) focusTrap.activate();
    if (focusTarget && typeof focusTarget.focus === 'function') focusTarget.focus();
    return previouslyFocused;
  }

  // Release the focus trap and restore focus to where it was before opening.
  function releaseFocus(focusTrap, previouslyFocused) {
    if (focusTrap) focusTrap.deactivate();
    if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
      try { previouslyFocused.focus(); } catch (_) { /* element may be gone */ }
    }
  }

  // ==========================================================================
  // MUSE POPUP MODAL - ORBITAL FOCUS
  // ==========================================================================
  const MusePopup = {
    popup: null,
    overlay: null,
    closeBtn: null,
    content: null,
    image: null,
    imageContainer: null,
    title: null,
    cause: null,
    text: null,
    particles: null,
    openTimeline: null,
    closeTimeline: null,
    isOpen: false,
    currentColor: '#ffffff',
    focusTrap: null,
    previouslyFocused: null,

    init() {
      this.popup = document.getElementById('muse-popup');
      this.overlay = document.getElementById('muse-popup-overlay');
      this.closeBtn = document.getElementById('muse-popup-close');
      this.content = document.querySelector('.muse-popup-content');
      this.imageContainer = document.getElementById('muse-popup-image');
      this.image = document.getElementById('muse-popup-img');
      this.title = document.getElementById('muse-popup-title');
      this.cause = document.getElementById('muse-popup-cause');
      this.text = document.getElementById('muse-popup-text');
      this.particles = document.getElementById('muse-popup-particles');

      if (!this.popup) return;

      // Set initial state (hide title above, show cause below)
      gsap.set(this.popup, { display: 'none', opacity: 0 });
      gsap.set(this.content, { scale: 0.7, opacity: 0 });
      gsap.set(this.imageContainer, { scale: 0.8, opacity: 0 });
      gsap.set(this.title, { display: 'none' }); // Hide title above card
      gsap.set([this.cause, this.text], { opacity: 0, y: 30 });

      wireModalDismiss({
        overlay: this.overlay,
        closeBtn: this.closeBtn,
        onClose: () => this.close(),
        isOpenFn: () => this.isOpen,
      });

      // Focus trap is created lazily on open (content not yet measured here).
      this.focusTrap = createFocusTrap(this.content);
    },

    open(causeTitle, description, color, imageSrc) {
      if (!this.popup || this.isOpen) return;
      this.isOpen = true;
      this.currentColor = color;

      // Update content - cause and description below image
      this.cause.textContent = causeTitle; // e.g., "Lunes · Water"
      this.text.textContent = description;
      this.image.src = imageSrc;
      this.image.alt = causeTitle;

      // Set CSS custom property for color-based styling
      this.content.style.setProperty('--muse-color', color);
      this.imageContainer.style.setProperty('--muse-color', color);

      // Kill any running animations
      if (this.closeTimeline) this.closeTimeline.kill();

      // Show popup container
      gsap.set(this.popup, { display: 'flex' });

      // Create particles
      this.createParticles(color);

      // Create open animation timeline
      this.openTimeline = gsap.timeline({
        defaults: { ease: 'power3.out' }
      });

      this.openTimeline
        // Fade in backdrop with heavy blur
        .to(this.popup, {
          opacity: 1,
          duration: 0.4,
        })
        // Scale and fade in image with aura
        .to(this.imageContainer, {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: 'back.out(1.5)',
        }, '-=0.2')
        // Fade in content container
        .to(this.content, {
          scale: 1,
          opacity: 1,
          duration: 0.4,
        }, '-=0.4')
        // Stagger in cause and text (below image)
        .to(this.cause, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
        }, '-=0.2')
        .to(this.text, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
        }, '-=0.3');

      // A11y: trap focus inside popup; move focus to close button.
      this.previouslyFocused = captureFocus(this.focusTrap, this.closeBtn);
    },

    close() {
      if (!this.popup || !this.isOpen) return;
      this.isOpen = false;

      // A11y: release focus trap and restore focus to the originally-focused element.
      releaseFocus(this.focusTrap, this.previouslyFocused);
      this.previouslyFocused = null;

      // Kill any running animations
      if (this.openTimeline) this.openTimeline.kill();

      // Create close animation timeline
      this.closeTimeline = gsap.timeline({
        defaults: { ease: 'power3.in' },
        onComplete: () => {
          gsap.set(this.popup, { display: 'none' });
          this.clearParticles();
        }
      });

      this.closeTimeline
        // Fade out text elements (cause and description)
        .to([this.text, this.cause], {
          opacity: 0,
          y: -20,
          duration: 0.2,
          stagger: 0.05,
        })
        // Scale out image
        .to(this.imageContainer, {
          scale: 0.8,
          opacity: 0,
          duration: 0.3,
        }, '-=0.15')
        // Scale out content
        .to(this.content, {
          scale: 0.7,
          opacity: 0,
          duration: 0.3,
        }, '-=0.25')
        // Fade out backdrop
        .to(this.popup, {
          opacity: 0,
          duration: 0.3,
        }, '-=0.2');
    },

    createParticles(color) {
      if (!this.particles) return;

      // Clear existing particles
      this.clearParticles();

      // Check for reduced motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      // Create 12 floating particles
      const particleCount = 12;

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'muse-popup-particle';
        particle.style.setProperty('--muse-color', color);

        // Random starting position around the popup
        const angle = (i / particleCount) * Math.PI * 2;
        const radius = 200 + Math.random() * 100;
        const startX = Math.cos(angle) * radius;
        const startY = Math.sin(angle) * radius;

        // Random float distance
        const floatX = (Math.random() - 0.5) * 100;
        const floatY = (Math.random() - 0.5) * 100;

        particle.style.left = `calc(50% + ${startX}px)`;
        particle.style.top = `calc(50% + ${startY}px)`;
        particle.style.setProperty('--particle-x', `${floatX}px`);
        particle.style.setProperty('--particle-y', `${floatY}px`);

        // Stagger animation start
        particle.style.animationDelay = `${i * 0.15}s`;

        this.particles.appendChild(particle);
      }
    },

    clearParticles() {
      if (!this.particles) return;
      this.particles.innerHTML = '';
    }
  };

  // ==========================================================================
  // MUSE SECTION - ORBITING LAYOUT
  // ==========================================================================
  const MuseScroll = {
    container: null,
    items: [],
    isInitialized: false,
    orbitRadiusX: 0,
    orbitRadiusY: 0,
    animationTime: 0,
    orbitSpeed: 0.00015, // 240 seconds per rotation
    isMobile: false,
    orbitPauseUntil: 0, // performance.now() timestamp; auto-rotation paused while < now

    init() {
      this.container = document.getElementById('muse-section');
      this.items = Array.from(document.querySelectorAll('.muse-orbit-item'));

      if (!this.container || this.items.length === 0) {
        return;
      }

      this.isInitialized = true;
      this.updateLayout();
      this.applyColors();
      this.attachClickHandlers();
      this.startAnimation();
    },

    updateLayout() {
      this.calculateOrbitRadius();
    },

    calculateOrbitRadius() {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const aspect = viewportWidth / viewportHeight;

      // Smoothly interpolate ellipse shape based on viewport aspect ratio.
      // Wide viewports (aspect ≥ 1.4) → horizontal ellipse 1.8× wider than tall.
      // Square-ish (aspect ≈ 1.0)     → near-circle.
      // Tall viewports (aspect ≤ 0.6) → vertical ellipse 1.8× taller than wide.
      const t = Math.max(0, Math.min(1, (aspect - 0.6) / 0.8)); // 0 (tall) → 1 (wide)
      const horizontalBias = -1 + t * 2; // -1 (tall) → 0 (square) → 1 (wide)
      const ellipseStretch = 1 + Math.abs(horizontalBias) * 0.8; // 1 (square) → 1.8 (extreme)

      const minDim = Math.min(viewportHeight, viewportWidth);
      const baseRadius = minDim * 0.32;

      if (horizontalBias >= 0) {
        this.orbitRadiusX = baseRadius * ellipseStretch;
        this.orbitRadiusY = baseRadius;
      } else {
        this.orbitRadiusX = baseRadius;
        this.orbitRadiusY = baseRadius * ellipseStretch;
      }
    },

    startAnimation() {
      // Initialize lastTime for delta calculation
      this.lastTime = Date.now();
      // Animation now handled by master render loop
    },

    updateOrbitPositions() {
      if (!this.isInitialized) return;

      const currentTime = Date.now();
      const deltaTime = currentTime - this.lastTime;
      this.lastTime = currentTime;

      // Pause-on-touch: skip the angle increment for 2s after touchstart
      // to give mobile users a stable tap target on the slow 240s rotation.
      // Note: lastTime is advanced regardless so resume isn't a jump.
      if (!this.orbitPauseUntil || performance.now() >= this.orbitPauseUntil) {
        this.animationTime += deltaTime * this.orbitSpeed;
      }

      // Update each muse position (mobile only)
      this.items.forEach((item, index) => {
        const baseAngle = parseFloat(item.getAttribute('data-angle')) * (Math.PI / 180);
        const currentAngle = baseAngle + this.animationTime;

        // Calculate elliptical position
        const x = Math.cos(currentAngle) * this.orbitRadiusX;
        const y = Math.sin(currentAngle) * this.orbitRadiusY;

        // Depth illusion: muses on the far side (sin < 0) recede slightly.
        // sin(angle) = -1 (top of ellipse, farthest) → scale 0.65
        // sin(angle) =  1 (bottom, nearest)         → scale 1.05
        const depth = (Math.sin(currentAngle) + 1) * 0.5; // 0..1
        const scale = 0.65 + depth * 0.40;

        item.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`;
        item.style.zIndex = Math.round(depth * 100);
      });
    },

    applyColors() {
      // Headings now render in solid black for WCAG AA contrast on the off-white
      // backdrop (per-muse hex tones — esp. Thunor #F8D86A — failed AA).
      // Per-muse colour is still surfaced via popup aura, glow, and orbit dot.
      // No inline colour write here.
    },

    attachClickHandlers() {
      this.items.forEach((item) => {
        const color = item.getAttribute('data-color');
        const popupTitle = item.getAttribute('data-popup-title'); // e.g., "Lunes · Water"
        const heading = item.querySelector('.muse-text h3');
        const paragraph = item.querySelector('.muse-text p');
        const imageElement = item.querySelector('.muse-image img');

        // A11y: each orbit item is the focusable activator. The whole item
        // is the hit surface (mobile padding lives in CSS), keyboard reaches
        // it via Tab, and Enter/Space activates.
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        if (popupTitle) item.setAttribute('aria-label', popupTitle);
        item.style.cursor = 'pointer';

        const clickHandler = () => {
          const cause = popupTitle || (heading ? heading.textContent : '');
          const description = paragraph ? paragraph.textContent : '';
          const imageSrc = imageElement ? imageElement.src : '';
          MusePopup.open(cause, description, color, imageSrc);
        };

        item.addEventListener('click', clickHandler);
        item.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            clickHandler();
          }
        });
      });

      // Pause-on-touch (2s): on touchstart anywhere in the muse section,
      // freeze the auto-rotation so the user has a stable target. Touch only —
      // desktop mouse keeps perpetual motion.
      if (this.container) {
        this.container.addEventListener('touchstart', () => {
          this.orbitPauseUntil = performance.now() + 2000;
        }, { passive: true });
      }
    },

    handleResize() {
      if (this.isInitialized) {
        this.updateLayout();
      }
    }
  };

  // ==========================================================================
  // FLOATING DRAGGABLE PROCESS IMAGES
  // ==========================================================================
  const FloatingProcesses = {
    processes: [],
    draggedElement: null,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,

    init() {
      this.processes = Array.from(document.querySelectorAll('.floating-process'));

      if (this.processes.length === 0) return;

      // Set initial random positions for each process image
      this.setInitialPositions();

      // Add event listeners for each process
      this.processes.forEach(process => {
        // Mouse events
        process.addEventListener('mousedown', (e) => this.startDrag(e, process));

        // Touch events
        process.addEventListener('touchstart', (e) => this.startDrag(e, process), { passive: true });
      });

      // Global mouse/touch move and end events
      document.addEventListener('mousemove', (e) => this.drag(e));
      document.addEventListener('mouseup', () => this.endDrag());
      document.addEventListener('touchmove', (e) => {
        if (this.isDragging) this.drag(e);
      }, { passive: true });
      document.addEventListener('touchend', () => this.endDrag());
    },

    setInitialPositions() {
      // Define initial positions (percentage-based for responsiveness)
      const positions = [
        { top: '15%', left: '10%' },
        { top: '25%', left: '75%' },
        { top: '80%', left: '8%' },
        { top: '60%', left: '80%' },
        { top: '75%', left: '45%' }
      ];

      this.processes.forEach((process, index) => {
        const pos = positions[index];
        process.style.top = pos.top;
        process.style.left = pos.left;
      });
    },

    startDrag(e, element) {
      this.isDragging = true;
      this.draggedElement = element;
      element.style.touchAction = 'none';

      // Disable floating animation while dragging
      element.style.animation = 'none';

      // Get cursor/touch position
      const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

      // Calculate offset between cursor and element position
      const rect = element.getBoundingClientRect();
      this.offsetX = clientX - rect.left;
      this.offsetY = clientY - rect.top;
    },

    drag(e) {
      if (!this.isDragging || !this.draggedElement) return;

      // Get cursor/touch position
      const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

      // Get parent container dimensions
      const parent = this.draggedElement.parentElement;
      const parentRect = parent.getBoundingClientRect();
      const elementRect = this.draggedElement.getBoundingClientRect();

      // Calculate new position relative to parent
      let newLeft = clientX - parentRect.left - this.offsetX;
      let newTop = clientY - parentRect.top - this.offsetY;

      // Constrain within parent bounds
      newLeft = Math.max(0, Math.min(newLeft, parentRect.width - elementRect.width));
      newTop = Math.max(0, Math.min(newTop, parentRect.height - elementRect.height));

      // Apply position
      this.draggedElement.style.left = `${newLeft}px`;
      this.draggedElement.style.top = `${newTop}px`;
    },

    endDrag() {
      if (!this.isDragging) return;

      this.isDragging = false;

      if (this.draggedElement) {
        // Re-enable floating animation
        const processIndex = this.draggedElement.getAttribute('data-process');
        const delay = (parseInt(processIndex) - 1) * 1.2;
        this.draggedElement.style.animation = `float 6s ease-in-out ${delay}s infinite`;
        this.draggedElement.style.touchAction = '';

        this.draggedElement = null;
      }
    }
  };

  // ==========================================================================
  // PROCESS LINKS — faint starline connecting the 5 draggable processes 1→…→5.
  // Reads live screen positions (getBoundingClientRect includes the CSS float
  // transform + any drag), so the line follows bobbing and dragging alike.
  // Drawn from masterRender() (gated to 'comet') — no separate RAF loop.
  // ==========================================================================
  const ProcessLinks = {
    canvas: null,
    ctx: null,
    nodes: [],

    init() {
      this.canvas = document.getElementById('process-link-canvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      // Order by data-process so the path is always 1→2→3→4→5 regardless of DOM.
      this.nodes = Array.from(document.querySelectorAll('.floating-process'))
        .sort((a, b) => (+a.dataset.process) - (+b.dataset.process));
      this.resize();
      window.addEventListener('resize', debounce(() => this.resize(), 150), { passive: true });
    },

    resize() {
      if (!this.canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },

    draw() {
      if (!this.ctx || this.nodes.length < 2) return;
      const base = this.canvas.getBoundingClientRect();
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      const pts = this.nodes.map(el => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2 - base.left, y: r.top + r.height / 2 - base.top };
      });

      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';

      // Soft outer glow pass — gives the "star vibe" without hurting readability.
      this.ctx.shadowBlur = 12;
      this.ctx.shadowColor = 'rgba(255, 255, 255, 0.35)';
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) this.ctx.lineTo(pts[i].x, pts[i].y);
      this.ctx.stroke();

      // Crisp thin core pass.
      this.ctx.shadowBlur = 0;
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) this.ctx.lineTo(pts[i].x, pts[i].y);
      this.ctx.stroke();
    }
  };

  // ==========================================================================
  // METHOD TOGGLE (STARDUST/HORIZON)
  // ==========================================================================
  const MethodToggle = {
    currentMethod: 'stardust',

    getCurrentMethod() {
      return this.currentMethod;
    }
  };

  // ==========================================================================
  // PARTNERSHIP SLIDER MODULE - Horizontal Infinite Scroll
  // ==========================================================================
  const PartnershipSlider = {
    container: null,

    // Placeholder partnership logos (replace with actual paths when available)
    logos: [
      { src: 'assets/images/partnerships/partner-1.png', alt: 'Partner 1', href: '#' },
      { src: 'assets/images/partnerships/partner-2.png', alt: 'Partner 2', href: '#' },
      { src: 'assets/images/partnerships/partner-3.png', alt: 'Partner 3', href: '#' },
      { src: 'assets/images/partnerships/partner-4.png', alt: 'Partner 4', href: '#' },
      { src: 'assets/images/partnerships/partner-5.png', alt: 'Partner 5', href: '#' },
    ],

    init() {
      this.container = document.getElementById('partnership-slideshow');
      if (!this.container) return;

      // Create track wrapper
      const track = document.createElement('div');
      track.className = 'partnership-track';

      // Add logos twice for seamless infinite scroll
      const createLogoHTML = (logo) => `
        <a href="${logo.href}" target="_blank" rel="noopener noreferrer" aria-label="${logo.alt}">
          <img src="${logo.src}" alt="${logo.alt}" class="partnership-logo" loading="lazy" decoding="async">
        </a>
      `;

      // Build both sets in one string, assign once (single reflow)
      const setHTML = this.logos.map(createLogoHTML).join('');
      track.innerHTML = setHTML + setHTML;

      this.container.appendChild(track);
    }
  };

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================
  function setInitialState() {
    // Set initial logo state (small, at start of orbit)
    const w = window.innerWidth;
    const h = window.innerHeight;
    const centerX = w / 2;
    const centerY = h / 2;
    const mobileFactor = isMobile() ? 0.7 : 1;
    
    const dotMaxSize = getResponsiveValue(CONFIG.dotMaxSize, CONFIG.dotMaxSizeMobile);
    const startRadius = Math.min(w, h) * (0.5 - CONFIG.borderMargin);

    // Initial logo state
    elements.logoContainer.style.width = CONFIG.logoMinSize + 'px';
    elements.logoContainer.style.height = CONFIG.logoMinSize + 'px';
    elements.logoContainer.style.transform = `translate(-50%, -50%) rotate(${CONFIG.totalRotations * 360}deg)`;
    elements.logoContainer.style.display = 'flex';
    elements.introLogo.style.opacity = 1;

    // Initial dot positions (at top and bottom of large orbit)
    const whiteX = centerX;
    const whiteY = centerY - startRadius;
    const blackX = centerX;
    const blackY = centerY + startRadius;
    
    const dotSize = dotMaxSize * mobileFactor;
    const borderWidth = Math.max(1.5, dotSize * 0.15);

    // White dot
    elements.dotWhite.style.left = whiteX + 'px';
    elements.dotWhite.style.top = whiteY + 'px';
    elements.dotWhite.style.width = dotSize + 'px';
    elements.dotWhite.style.height = dotSize + 'px';
    elements.dotWhite.style.opacity = 1;
    elements.dotWhite.style.display = 'block';

    // Black dot
    elements.dotBlack.style.left = blackX + 'px';
    elements.dotBlack.style.top = blackY + 'px';
    elements.dotBlack.style.width = dotSize + 'px';
    elements.dotBlack.style.height = dotSize + 'px';
    elements.dotBlack.style.borderWidth = borderWidth + 'px';
    elements.dotBlack.style.borderStyle = 'solid';
    elements.dotBlack.style.borderColor = '#fff';
    elements.dotBlack.style.opacity = 1;
    elements.dotBlack.style.display = 'block';

    // Hide final dot initially
    elements.finalDot.style.opacity = 0;
    elements.finalDot.classList.remove('visible');
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================
  function init() {
    setInitialState();
    initWebGL();
    initEventListeners();
    initGSAPAnimations();
    resize();

    // Initialize unified starfield background
    UnifiedStarfield.init();

    // Initialize muse background
    MuseBackground.init();

    // Initialize muse popup modal
    MusePopup.init();

    // Initialize muse orbiting layout
    setTimeout(() => {
      MuseScroll.init();
    }, 100);

    // Initialize comet collab phases background
    CometBgPrimary.init();

    // Initialize floating draggable process images
    FloatingProcesses.init();

    // Initialize the starline connecting the process images
    ProcessLinks.init();

    // Initialize partnership slider
    PartnershipSlider.init();

    // Start master render loop (consolidates all animations)
    masterRender();
  }

  // Start the application
  init();

  // ==========================================================================
  // EXPOSE GLOBAL FUNCTIONS FOR INLINE HANDLERS
  // ==========================================================================
  // Make switchTab available globally for inline onclick handlers
  window.switchTab = function(method) {
    const stardust = document.getElementById('panel-stardust');
    const horizon = document.getElementById('panel-horizon');
    const tabStardust = document.getElementById('tab-stardust');
    const tabHorizon = document.getElementById('tab-horizon');
    const slider = document.getElementById('pillSlider');

    if (!stardust || !horizon || !tabStardust || !tabHorizon || !slider) return;

    MethodToggle.currentMethod = method;

    if (method === 'stardust') {
      // Show Stardust panel
      stardust.classList.add('active');
      horizon.classList.remove('active');

      // Update button states
      tabStardust.classList.add('active');
      tabHorizon.classList.remove('active');

      // Move slider to left
      slider.classList.remove('right');
    } else if (method === 'horizon') {
      // Show Horizon panel
      horizon.classList.add('active');
      stardust.classList.remove('active');

      // Update button states
      tabHorizon.classList.add('active');
      tabStardust.classList.remove('active');

      // Move slider to right
      slider.classList.add('right');
    }
  };

})();
