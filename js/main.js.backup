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
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

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
            float twinkle = sin(time * (1.5 + starHash * 2.5) + starHash * 6.28) * 0.5 + 0.5;
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
    // Intro section (400vh total)
    INTRO_TOTAL: 400,
    INTRO_PHASE1_END: 0.40,    // 40% = 160vh - orbit animation END
    INTRO_PHASE2_TEXT: 0.50,   // 50% = 200vh - transition text "art as infrastructure for change"
    INTRO_PHASE3_START: 0.50,  // 50% = 200vh - constellation explosion starts

    // Text section (simplified - no word highlighting)
    TEXT_SECTION_HEIGHT: 150,  // vh - total height for text section

    // Muse section (extended intro hold)
    MUSE_INTRO_HOLD: 150,      // vh - hold intro before transition (extended for better pacing)
    MUSE_CROSSFADE: 120,       // vh - smoother crossfade (increased from 100vh)
    MUSE_CONTENT_HOLD: 0,      // vh - no additional hold (content visible during crossfade)
    MUSE_TOTAL: 270,           // vh - total wrapper height (150 intro + 120 crossfade)

    // Comet section (smooth scrolling experience)
    COMET_INTRO_PAUSE: 180,         // vh - hold intro static (increased for better pacing)
    COMET_LOGO_MOVEMENT: 280,       // vh - logo descent + text up (increased from 250vh for smoothness)
    COMET_MOVEMENT_START: 180,      // vh - when movement begins (after intro pause)
    COMET_CROSSFADE_START: 460,     // vh - when slider fades in (180 + 280)
    COMET_CROSSFADE_DURATION: 120,  // vh - crossfade duration (increased from 100vh)
    COMET_PHASE_DURATION: 100,      // vh - scroll distance per phase (increased from 80vh for smoother transitions)
    COMET_PHASES_START: 580,        // vh - when phase scrolling begins (after crossfade: 460 + 120)
    COMET_PHASE_COUNT: 5,           // number of phases
    COMET_CONTENT_HOLD: 0,          // vh - no fixed hold (natural page end)
    COMET_TOTAL: 1080               // vh - total wrapper height (180 intro + 280 movement + 120 fade + 500 phases)
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
    introSection: document.querySelector('.intro'),
    textSectionWrapper: document.querySelector('.text-section-wrapper'),
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
  let constellationRotation = 0; // Z-axis rotation angle in radians
  let masterRenderLoop = null; // Consolidated render loop reference

  // ==========================================================================
  // DEBUG SYSTEM - Set to true to enable logging
  // ==========================================================================
  const DEBUG_ENABLED = true; // Change to false to disable all logging

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

  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
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

      // Base cosmic noise
      // Optimized: reduced from 5 to 3 noise layers for better performance
      float noise1 = snoise(uv * 3.0 + u_time * 0.05);
      float noise2 = snoise(uv * 5.0 - u_time * 0.03 + 50.0);
      float noise3 = snoise(uv * 2.0 + u_time * 0.02 + 100.0);
      float combined = (noise1 + noise2 * 0.6 + noise3 * 0.8) / 2.4;
      combined = combined * 0.5 + 0.5;

      float base = 0.003;
      float highlight = combined * 0.025;
      float clouds = pow(combined, 2.0) * 0.02;
      float detail = pow(snoise(uv * 7.0 + u_time * 0.08) * 0.5 + 0.5, 2.5) * 0.01;
      float brightness = base + highlight + clouds + detail;

      // Add twinkling stars
      float starLight = stars(uv, u_time);
      brightness += starLight * 0.25;

      // Big bang pulse effect - subtle dispersive wave from center
      if (u_pulse > 0.0) {
        vec2 center = vec2(0.5, 0.5);
        vec2 toCenter = uv - center;

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

    const scaleX = w / CONFIG.refWidth;
    const scaleY = h / CONFIG.refHeight;

    fireworkDots = CONSTELLATION_REF.map((point, i) => {
      const targetX = point.x * scaleX;
      const targetY = point.y * scaleY;
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
    const introScrollHeight = window.innerHeight * 4;
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
    const time = (Date.now() - startTime) / 1000;

    // Animate pulse if active
    if (pulseValue > 0 && pulseValue < 1) {
      pulseValue += 0.015; // Speed of pulse expansion
      if (pulseValue >= 1) {
        pulseValue = 0;
      }
    }

    // Render intro WebGL background (optimized with state caching)
    if (gl && program) {
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

    // Render Muse background (batch uniforms, minimize state changes)
    if (MuseBackground.gl && MuseBackground.program) {
      const museGL = MuseBackground.gl;
      if (lastActiveProgram !== MuseBackground.program) {
        museGL.useProgram(MuseBackground.program);
        lastActiveProgram = MuseBackground.program;
      }
      museGL.uniform2f(MuseBackground.resUniform, MuseBackground.canvas.width, MuseBackground.canvas.height);
      museGL.uniform1f(MuseBackground.timeUniform, time);
      museGL.drawArrays(museGL.TRIANGLES, 0, 6);
    }

    // Render Unified Starfield (batch uniforms, minimize state changes)
    if (UnifiedStarfield.gl && UnifiedStarfield.program) {
      const starGL = UnifiedStarfield.gl;
      if (lastActiveProgram !== UnifiedStarfield.program) {
        starGL.useProgram(UnifiedStarfield.program);
        lastActiveProgram = UnifiedStarfield.program;
      }
      starGL.uniform2f(UnifiedStarfield.resUniform, UnifiedStarfield.canvas.width, UnifiedStarfield.canvas.height);
      starGL.uniform1f(UnifiedStarfield.timeUniform, time);
      starGL.drawArrays(starGL.TRIANGLES, 0, 6);
    }

    // Render Comet background (batch uniforms, minimize state changes)
    if (CometCollabBackground.gl && CometCollabBackground.program) {
      const cometGL = CometCollabBackground.gl;
      if (lastActiveProgram !== CometCollabBackground.program) {
        cometGL.useProgram(CometCollabBackground.program);
        lastActiveProgram = CometCollabBackground.program;
      }
      cometGL.uniform2f(CometCollabBackground.resUniform, CometCollabBackground.canvas.width, CometCollabBackground.canvas.height);
      cometGL.uniform1f(CometCollabBackground.timeUniform, time);
      cometGL.drawArrays(cometGL.TRIANGLES, 0, 6);
    }

    // Update Muse orbit positions
    if (MuseScroll.isInitialized) {
      MuseScroll.updateOrbitPositions();
    }

    // Update bouncing logo if active
    if (CometCollabSlider.isBouncingActive && !CometCollabSlider.isDragging) {
      CometCollabSlider.updateLogoPosition();
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
      onUpdate: (self) => updatePositions(self),
      invalidateOnRefresh: true,
    });

    // Consolidated resize handler with debouncing (optimized to 150ms for stability)
    const handleResize = debounce(() => {
      resize();
      MuseScroll.handleResize();
      MuseBackground.resize();
      UnifiedStarfield.resize();
      CometCollabBackground.resize();
      ScrollTrigger.refresh();
    }, 150);

    window.addEventListener('resize', handleResize, { passive: true });

    window.addEventListener('load', () => {
      setTimeout(() => {
        elements.introLogo.classList.add('visible');
        elements.dotWhite.classList.add('visible');
        elements.dotBlack.classList.add('visible');
      }, 300);
    });
  }

  // ==========================================================================
  // GSAP SCROLL ANIMATIONS
  // ==========================================================================
  function initGSAPAnimations() {
    const h = window.innerHeight;
    const introScrollHeight = h * 4;
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
      { opacity: 1, duration: 0.4, ease: 'power2.out' }
    )
    .to(elements.transitionText,
      { opacity: 1, duration: 0.3 }, // Hold visible
      '+=0'
    )
    .to(elements.transitionText,
      { opacity: 0, duration: 0.3, ease: 'power2.in' }
    );

    // Phase 3: Constellation explosion animation
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
          updateConstellationExplosion(phase3State.progress);
          if (Math.abs(phase3State.progress - lastExplosionLog) > 0.25) {
            log(`EXPLOSION progress ${(phase3State.progress * 100).toFixed(0)}%`);
            lastExplosionLog = phase3State.progress;
          }
        },
        onLeave: () => log('EXPLOSION complete')
      }
    });

    // Text reveal (simplified - just fade in, no highlighting)
    gsap.timeline({
      scrollTrigger: {
        trigger: '.text-section-wrapper',
        start: 'top 80%',
        end: 'bottom 60%',
        scrub: true,
        invalidateOnRefresh: true,
        onEnter: () => log('🎯 TEXT-REVEAL START: Mission text fading in'),
        onLeave: () => log('TEXT fully visible')
      }
    })
    .fromTo(elements.revealText,
      { opacity: 0 },
      { opacity: 1, ease: 'power2.out' }
    );

    // Footer reveal when connected images become visible
    const socialLinks = document.querySelector('.social-links');
    const footerLogo = document.querySelector('.footer-logo');
    const cometConnectedContent = document.querySelector('.comet-collab-connected-content');

    if (cometConnectedContent) {
      ScrollTrigger.create({
        trigger: '.comet-collab-wrapper',
        start: 'top+=300vh top', // When connected images start to appear
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onEnter: () => {
          socialLinks?.classList.add('visible');
          footerLogo?.classList.add('visible');
          log('👣 FOOTER: Visible with connected images');
        },
        onLeaveBack: () => {
          socialLinks?.classList.remove('visible');
          footerLogo?.classList.remove('visible');
        }
      });
    }

    // Muse intro page overlay transition
    const museIntroPage = document.getElementById('muse-intro-page');
    const museIntroLogo = document.querySelector('.muse-intro-logo');
    const museIntroText = document.querySelector('.muse-intro-text');
    const whiteContent = document.querySelector('.white-section-content');
    const museCenterLogo = document.querySelector('.muse-center-logo');

    if (museIntroPage && whiteContent) {
      // Single timeline for entire muse intro sequence
      const museFadeInEnd = 40; // vh from top of viewport to fade in
      const museCrossfadeStart = SCROLL_TIMING.MUSE_INTRO_HOLD;
      const museCrossfadeEnd = SCROLL_TIMING.MUSE_INTRO_HOLD + SCROLL_TIMING.MUSE_CROSSFADE;

      // Fade in intro page as section enters viewport
      gsap.fromTo(museIntroPage,
        { opacity: 0 },
        {
          opacity: 1,
          scrollTrigger: {
            trigger: '.muse-section-wrapper',
            start: 'top 80%',
            end: 'top 40%',
            scrub: true,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onEnter: () => log('🎯 MUSE-INTRO: Fading in')
          }
        }
      );

      // Crossfade: fade out intro, fade in orbiting content
      gsap.timeline({
        scrollTrigger: {
          trigger: '.muse-section-wrapper',
          start: `top+=${museCrossfadeStart}vh top`,
          end: `top+=${museCrossfadeEnd}vh top`,
          scrub: true,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onEnter: () => log('🌀 MUSE-CROSSFADE: intro → orbiting'),
          onLeave: () => log('🎯 MUSE-ORBITING: Active (240s rotation)')
        }
      })
      // Fade out intro logo and text
      .fromTo([museIntroLogo, museIntroText],
        { opacity: 1 },
        { opacity: 0, ease: 'none' },
        0
      )
      // Also fade out the intro page itself
      .fromTo(museIntroPage,
        { opacity: 1 },
        { opacity: 0, ease: 'none' },
        0
      )
      // Fade in white content (orbiting section)
      .fromTo(whiteContent,
        { opacity: 0 },
        { opacity: 1, ease: 'none' },
        0
      )
      // Fade in black center logo
      .fromTo(museCenterLogo,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, ease: 'none' },
        0
      );
    }

    // Comet Collab intro page and connected images overlay
    const cometIntroPage = document.getElementById('comet-collab-intro');
    // cometConnectedContent already declared above at line 956

    if (cometIntroPage && cometConnectedContent) {
      // Hide constellation canvas when entering comet section
      gsap.fromTo(elements.constCanvas,
        { opacity: 1 },
        {
          opacity: 0,
          scrollTrigger: {
            trigger: '.comet-collab-wrapper',
            start: 'top 90%',
            end: 'top 60%',
            scrub: true,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          }
        }
      );

      // Fade in comet intro page when entering comet section
      gsap.fromTo(cometIntroPage,
        { opacity: 0 },
        {
          opacity: 1,
          scrollTrigger: {
            trigger: '.comet-collab-wrapper',
            start: 'top 80%',
            end: 'top 40%',
            scrub: true,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onEnter: () => log('🎯 COMET-INTRO: Fading in')
          }
        }
      );

      // Crossfade: intro fades out while connected images fade in
      gsap.timeline({
        scrollTrigger: {
          trigger: '.comet-collab-wrapper',
          start: 'top+=300vh top', // After intro holds for 300vh
          end: 'top+=650vh top', // 350vh crossfade duration (much slower)
          scrub: true,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onEnter: () => log('🌀 COMET-OVERLAY: Intro → Connected Images'),
        }
      })
      // Fade out intro page
      .fromTo(cometIntroPage,
        { opacity: 1 },
        { opacity: 0, ease: 'none' },
        0
      )
      // Fade in connected images
      .fromTo(cometConnectedContent,
        { opacity: 0 },
        { opacity: 1, ease: 'none' },
        0
      );
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
  // MUSE SECTION BACKGROUND - ANIMATED GRADIENT
  // ==========================================================================
  const MuseBackground = {
    canvas: null,
    gl: null,
    program: null,
    startTime: Date.now(),

    colors: [
      [0.34, 0.51, 0.65], // Lunes - #5783A6
      [0.84, 0.30, 0.18], // Ares - #D54D2E
      [0.55, 0.69, 0.50], // Rabu - #8CB07F
      [0.97, 0.85, 0.42], // Thunor - #F8D86A
      [0.37, 0.28, 0.63], // Shukra - #5E47A1
      [0.50, 0.29, 0.64], // Dosei - #7F49A2
      [0.83, 0.51, 0.28], // Solis - #D48348
    ],

    init() {
      this.canvas = document.getElementById('muse-background-canvas');
      if (!this.canvas) return;

      this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
      if (!this.gl) return;

      this.resize();
      this.initShaders();
      // Render handled by master loop
    },

    resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = this.canvas.parentElement.getBoundingClientRect();

      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';

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

        // Muse colors
        const vec3 color1 = vec3(0.34, 0.51, 0.65); // Lunes
        const vec3 color2 = vec3(0.84, 0.30, 0.18); // Ares
        const vec3 color3 = vec3(0.55, 0.69, 0.50); // Rabu
        const vec3 color4 = vec3(0.97, 0.85, 0.42); // Thunor
        const vec3 color5 = vec3(0.37, 0.28, 0.63); // Shukra
        const vec3 color6 = vec3(0.50, 0.29, 0.64); // Dosei
        const vec3 color7 = vec3(0.83, 0.51, 0.28); // Solis

        ${GLSL_UTILS.SIMPLEX_NOISE}

        void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;

          // Create flowing noise patterns
          float time = u_time * 0.15;
          float noise1 = snoise(uv * 2.0 + vec2(time * 0.3, time * 0.2));
          float noise2 = snoise(uv * 3.0 - vec2(time * 0.2, time * 0.3));
          float noise3 = snoise(uv * 1.5 + vec2(time * 0.1, -time * 0.15));

          // Combine noise for complex movement
          float pattern = (noise1 + noise2 * 0.5 + noise3 * 0.3) / 1.8;
          pattern = pattern * 0.5 + 0.5; // Normalize to 0-1

          // Create color zones
          float zone = pattern * 7.0;
          vec3 baseColor;

          // Interpolate between muse colors
          if (zone < 1.0) {
            baseColor = mix(color1, color2, fract(zone));
          } else if (zone < 2.0) {
            baseColor = mix(color2, color3, fract(zone));
          } else if (zone < 3.0) {
            baseColor = mix(color3, color4, fract(zone));
          } else if (zone < 4.0) {
            baseColor = mix(color4, color5, fract(zone));
          } else if (zone < 5.0) {
            baseColor = mix(color5, color6, fract(zone));
          } else if (zone < 6.0) {
            baseColor = mix(color6, color7, fract(zone));
          } else {
            baseColor = mix(color7, color1, fract(zone));
          }

          // Mix with white and black for subtle effect
          float whiteAmount = 0.75; // Strong white base
          float colorStrength = 0.15; // Subtle color touches

          vec3 finalColor = mix(vec3(1.0), baseColor, colorStrength);
          finalColor = mix(finalColor, vec3(0.0), 0.02); // Tiny bit of black depth

          gl_FragColor = vec4(finalColor, 1.0);
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
        console.error('Muse shader error:', this.gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    }
  };

  // ==========================================================================
  // UNIFIED STARFIELD BACKGROUND (MUSE + COMET SECTIONS)
  // ==========================================================================
  const UnifiedStarfield = {
    canvas: null,
    gl: null,
    program: null,
    startTime: Date.now(),

    init() {
      this.canvas = document.getElementById('unified-starfield-canvas');
      if (!this.canvas) return;

      this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
      if (!this.gl) return;

      this.resize();
      this.initShaders();
      // Render handled by master loop
    },

    resize() {
      const dpr = window.devicePixelRatio || 1;
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
      // Use starfield shader same as landing intro
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

        ${GLSL_UTILS.STAR_FIELD}

        void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;

          // Add twinkling stars
          float starLight = stars(uv, u_time);
          float brightness = starLight * 0.25;

          gl_FragColor = vec4(vec3(brightness), 1.0);
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

  // ==========================================================================
  // COMET COLLAB PHASES BACKGROUND - EXTENDED GRADIENT
  // ==========================================================================
  const CometCollabBackground = {
    canvas: null,
    gl: null,
    program: null,
    startTime: Date.now(),

    init() {
      this.canvas = document.getElementById('comet-collab-background-canvas');
      if (!this.canvas) return;

      this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
      if (!this.gl) return;

      this.resize();
      this.initShaders();
      // Render handled by master loop
    },

    resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = this.canvas.parentElement.getBoundingClientRect();

      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';

      if (this.gl) {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      }
    },

    initShaders() {
      // Reuse the same shader code as MuseBackground
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

        // Same muse colors for continuity
        const vec3 color1 = vec3(0.34, 0.51, 0.65); // Lunes
        const vec3 color2 = vec3(0.84, 0.30, 0.18); // Ares
        const vec3 color3 = vec3(0.55, 0.69, 0.50); // Rabu
        const vec3 color4 = vec3(0.97, 0.85, 0.42); // Thunor
        const vec3 color5 = vec3(0.37, 0.28, 0.63); // Shukra
        const vec3 color6 = vec3(0.50, 0.29, 0.64); // Dosei
        const vec3 color7 = vec3(0.83, 0.51, 0.28); // Solis

        ${GLSL_UTILS.SIMPLEX_NOISE}

        void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;

          float time = u_time * 0.15;
          float noise1 = snoise(uv * 2.0 + vec2(time * 0.3, time * 0.2));
          float noise2 = snoise(uv * 3.0 - vec2(time * 0.2, time * 0.3));
          float noise3 = snoise(uv * 1.5 + vec2(time * 0.1, -time * 0.15));

          float pattern = (noise1 + noise2 * 0.5 + noise3 * 0.3) / 1.8;
          pattern = pattern * 0.5 + 0.5;

          float zone = pattern * 7.0;
          vec3 baseColor;

          if (zone < 1.0) {
            baseColor = mix(color1, color2, fract(zone));
          } else if (zone < 2.0) {
            baseColor = mix(color2, color3, fract(zone));
          } else if (zone < 3.0) {
            baseColor = mix(color3, color4, fract(zone));
          } else if (zone < 4.0) {
            baseColor = mix(color4, color5, fract(zone));
          } else if (zone < 5.0) {
            baseColor = mix(color5, color6, fract(zone));
          } else if (zone < 6.0) {
            baseColor = mix(color6, color7, fract(zone));
          } else {
            baseColor = mix(color7, color1, fract(zone));
          }

          float whiteAmount = 0.75;
          float colorStrength = 0.15;

          vec3 finalColor = mix(vec3(1.0), baseColor, colorStrength);
          finalColor = mix(finalColor, vec3(0.0), 0.02);

          gl_FragColor = vec4(finalColor, 1.0);
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
        console.error('Comet shader error:', this.gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    }
  };

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
    text: null,
    particles: null,
    openTimeline: null,
    closeTimeline: null,
    isOpen: false,
    currentColor: '#ffffff',

    init() {
      this.popup = document.getElementById('muse-popup');
      this.overlay = document.getElementById('muse-popup-overlay');
      this.closeBtn = document.getElementById('muse-popup-close');
      this.content = document.querySelector('.muse-popup-content');
      this.imageContainer = document.getElementById('muse-popup-image');
      this.image = document.getElementById('muse-popup-img');
      this.title = document.getElementById('muse-popup-title');
      this.text = document.getElementById('muse-popup-text');
      this.particles = document.getElementById('muse-popup-particles');

      if (!this.popup) return;

      // Set initial state
      gsap.set(this.popup, { display: 'none', opacity: 0 });
      gsap.set(this.content, { scale: 0.7, opacity: 0 });
      gsap.set(this.imageContainer, { scale: 0.8, opacity: 0 });
      gsap.set([this.title, this.text], { opacity: 0, y: 30 });

      // Close on overlay click
      this.overlay.addEventListener('click', () => this.close());

      // Close on button click (accessibility)
      this.closeBtn.addEventListener('click', () => this.close());

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    },

    open(name, description, color, imageSrc) {
      if (!this.popup || this.isOpen) return;
      this.isOpen = true;
      this.currentColor = color;

      // Update content
      this.title.textContent = name;
      this.text.textContent = description;
      this.image.src = imageSrc;
      this.image.alt = name;

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
        // Stagger in title and text
        .to(this.title, {
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
    },

    close() {
      if (!this.popup || !this.isOpen) return;
      this.isOpen = false;

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
        // Fade out text elements
        .to([this.text, this.title], {
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

    init() {
      this.container = document.getElementById('muse-section');
      this.items = Array.from(document.querySelectorAll('.muse-orbit-item'));

      if (!this.container || this.items.length === 0) {
        return;
      }

      this.isInitialized = true;
      this.calculateOrbitRadius();
      this.applyColors();
      this.attachClickHandlers();
      this.startAnimation();
    },

    calculateOrbitRadius() {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Mobile: Vertical ellipse (taller than wide) for better centering
      if (viewportWidth <= 768) {
        this.orbitRadiusX = Math.min(viewportHeight, viewportWidth) * 0.28;
        this.orbitRadiusY = this.orbitRadiusX * 1.6; // Vertical ellipse - taller
      }
      // Tablet: Slightly more vertical ellipse
      else if (viewportWidth <= 1024) {
        this.orbitRadiusX = Math.min(viewportHeight, viewportWidth) * 0.30;
        this.orbitRadiusY = this.orbitRadiusX * 1.4; // Slightly vertical
      }
      // Desktop: Horizontal ellipse (original behavior)
      else {
        this.orbitRadiusY = Math.min(viewportHeight, viewportWidth) * 0.30;
        this.orbitRadiusX = this.orbitRadiusY * 1.8; // Horizontal ellipse - wider
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

      // Update animation time
      this.animationTime += deltaTime * this.orbitSpeed;

      // Update each muse position
      this.items.forEach((item, index) => {
        const baseAngle = parseFloat(item.getAttribute('data-angle')) * (Math.PI / 180);
        const currentAngle = baseAngle + this.animationTime;

        // Calculate elliptical position
        const x = Math.cos(currentAngle) * this.orbitRadiusX;
        const y = Math.sin(currentAngle) * this.orbitRadiusY;

        // Apply position
        item.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
      });
    },

    applyColors() {
      this.items.forEach((item) => {
        const color = item.getAttribute('data-color');
        const heading = item.querySelector('.muse-text h3');

        if (color && heading) {
          heading.style.color = color;
        }
      });
    },

    attachClickHandlers() {
      this.items.forEach((item) => {
        const color = item.getAttribute('data-color');
        const heading = item.querySelector('.muse-text h3');
        const paragraph = item.querySelector('.muse-text p');
        const imageElement = item.querySelector('.muse-image img');
        const imageContainer = item.querySelector('.muse-image');

        // Make both image and heading clickable
        const clickHandler = () => {
          const name = heading ? heading.textContent : '';
          const description = paragraph ? paragraph.textContent : '';
          const imageSrc = imageElement ? imageElement.src : '';
          MusePopup.open(name, description, color, imageSrc);
        };

        if (imageContainer) {
          imageContainer.style.cursor = 'pointer';
          imageContainer.addEventListener('click', clickHandler);
        }

        if (heading) {
          heading.style.cursor = 'pointer';
          heading.addEventListener('click', clickHandler);
        }
      });
    },

    handleResize() {
      if (this.isInitialized) {
        this.calculateOrbitRadius();
      }
    }
  };

  // ==========================================================================
  // COMET COLLAB SLIDER WITH BOUNCING LOGO
  // ==========================================================================
  const CometCollabSlider = {
    section: null,
    bouncingLogo: null,
    prevBtn: null,
    nextBtn: null,
    dots: [],
    imageReel: null,
    textReel: null,
    imageItems: [],
    textItems: [],
    currentIndex: 0,
    totalItems: 5,
    isAnimating: false,
    isBouncingActive: false,

    // Logo animation properties
    logoX: 0,
    logoY: 0,
    logoVelocityX: 2, // Speed for horizontal movement (reduced from 5)
    logoVelocityY: 1.5, // Speed for vertical movement (reduced from 4)
    logoWidth: 0,
    logoHeight: 0,
    containerWidth: 0,
    containerHeight: 0,
    currentColorIndex: 0,
    animationFrame: null,
    isDragging: false,
    dragOffsetX: 0,
    dragOffsetY: 0,

    // Muse colors (from DOT_COLORS)
    museColors: [
      '#5783A6', // Lunes - Blue
      '#D54D2E', // Ares - Red
      '#8CB07F', // Rabu - Green
      '#F8D86A', // Thunor - Yellow
      '#5E47A1', // Shukra - Purple
      '#7F49A2', // Dosei - Violet
      '#D48348', // Solis - Orange
    ],

    init() {
      this.section = document.getElementById('comet-collab-section');
      this.bouncingLogo = document.getElementById('comet-collab-bouncing-logo');
      this.prevBtn = document.getElementById('slider-nav-prev');
      this.nextBtn = document.getElementById('slider-nav-next');
      this.dots = Array.from(document.querySelectorAll('.slider-dot'));
      this.imageReel = document.getElementById('image-phase-reel');
      this.textReel = document.getElementById('text-phase-reel');
      this.particleContainer = document.getElementById('phase-transition-particles');

      if (!this.section || !this.imageReel || !this.textReel) {
        console.warn('Comet collab slider elements not found');
        return;
      }

      this.imageItems = Array.from(this.imageReel.querySelectorAll('.phase-item'));
      this.textItems = Array.from(this.textReel.querySelectorAll('.phase-item'));

      // Initialize all items to hidden state first
      this.imageItems.forEach(item => {
        item.classList.remove('active');
        gsap.set(item, { opacity: 0, y: 100, visibility: 'hidden' });
      });
      this.textItems.forEach(item => {
        item.classList.remove('active');
        gsap.set(item, { opacity: 0, y: 100, visibility: 'hidden' });
      });

      // Show first items with proper initial state
      if (this.imageItems.length > 0) {
        this.imageItems[0].classList.add('active');
        gsap.set(this.imageItems[0], { opacity: 1, y: 0, visibility: 'visible' });
      }
      if (this.textItems.length > 0) {
        this.textItems[0].classList.add('active');
        gsap.set(this.textItems[0], { opacity: 1, y: 0, visibility: 'visible' });
      }

      this.initSlider();
      this.initBouncingLogo();
      this.initScrollDrivenPhases();
      this.initScrollTriggers();
    },

    initSlider() {
      // Prev/Next buttons
      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', () => this.prevSlide());
      }
      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', () => this.nextSlide());
      }

      // Dot navigation
      this.dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          if (!this.isAnimating) {
            this.transitionToSlide(index);
          }
        });
      });

      // Keyboard navigation (arrows + number keys 1-5)
      document.addEventListener('keydown', (e) => {
        if (!this.isBouncingActive) return;

        // Arrow keys
        if (e.key === 'ArrowLeft') this.prevSlide();
        if (e.key === 'ArrowRight') this.nextSlide();

        // Number keys 1-5 for direct phase access
        const numberKey = parseInt(e.key);
        if (numberKey >= 1 && numberKey <= 5 && !this.isAnimating) {
          this.transitionToSlide(numberKey - 1);
        }
      });

      // Update dot states
      this.updateDots();
    },

    initScrollDrivenPhases() {
      // Create scroll-triggered phase transitions
      const h = window.innerHeight;
      const phaseDuration = SCROLL_TIMING.COMET_PHASE_DURATION;
      const phaseStart = SCROLL_TIMING.COMET_PHASES_START;

      // Create ScrollTrigger for each phase transition
      for (let i = 0; i < SCROLL_TIMING.COMET_PHASE_COUNT; i++) {
        const scrollStart = phaseStart + (i * phaseDuration);
        const scrollEnd = scrollStart + phaseDuration;

        ScrollTrigger.create({
          trigger: '.comet-collab-wrapper',
          start: () => `top+=${scrollStart}vh top`,
          end: () => `top+=${scrollEnd}vh top`,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onEnter: () => {
            // Transitioning TO phase i
            if (!this.isAnimating && this.currentIndex !== i) {
              this.transitionToSlide(i, true); // true = scroll-driven (with particles)
            }
          },
          onEnterBack: () => {
            // Scrolling back, show previous phase
            if (!this.isAnimating && this.currentIndex !== i) {
              this.transitionToSlide(i, true);
            }
          }
        });
      }
    },

    initScrollTriggers() {
      // Start bouncing smoothly as slider content becomes visible
      const bounceStartPoint = SCROLL_TIMING.COMET_INTRO_PAUSE + SCROLL_TIMING.COMET_LOGO_MOVEMENT + 100;
      ScrollTrigger.create({
        trigger: '.comet-collab-wrapper',
        start: `top+=${bounceStartPoint}vh top`,
        invalidateOnRefresh: true,
        onEnter: () => {
          if (!this.isBouncingActive) {
            // Position logo at bottom center (where overlay happens)
            const spacing = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--spacing-xl')) || 64;
            this.logoX = window.innerWidth / 2 - this.logoWidth / 2;
            this.logoY = window.innerHeight - this.logoHeight - spacing;
            this.bouncingLogo.style.transform = `translate(${this.logoX}px, ${this.logoY}px)`;
            this.startBouncing();
          }
        },
        onLeaveBack: () => {
          // Stop bouncing when scrolling back up
          this.stopBouncing();
        }
      });
    },

    stopBouncing() {
      if (!this.isBouncingActive) return;

      this.isBouncingActive = false;
      this.isDragging = false;

      // Cancel animation frame
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }

      // Reset cursor
      if (this.bouncingLogo) {
        this.bouncingLogo.style.cursor = 'grab';
      }

      // Fade out bouncing logo
      gsap.to(this.bouncingLogo, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in'
      });
    },

    startBouncing() {
      if (this.isBouncingActive || !this.bouncingLogo) return;
      this.isBouncingActive = true;
      this.justStartedBouncing = true; // Flag to prevent initial spark

      // Enable cursor for dragging
      this.bouncingLogo.style.cursor = 'grab';

      // Fade in bouncing logo smoothly
      gsap.to(this.bouncingLogo, {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out'
      });

      // Clear the flag after a short delay (enough time for first frame)
      setTimeout(() => {
        this.justStartedBouncing = false;
      }, 100);

      // Animation now handled by master render loop
    },

    initBouncingLogo() {
      if (!this.bouncingLogo) return;

      // Get initial dimensions
      this.updateLogoDimensions();

      // Set random starting position (accounting for padding)
      const padding = 20;
      this.logoX = padding + Math.random() * Math.max(0, this.containerWidth - this.logoWidth);
      this.logoY = padding + Math.random() * Math.max(0, this.containerHeight - this.logoHeight);

      // Don't start animation yet - will be triggered by scroll
      // this.animateLogo(); // Removed - now triggered by startBouncing()

      // Add drag functionality
      this.initDragHandlers();

      // Update on resize
      window.addEventListener('resize', () => this.updateLogoDimensions(), { passive: true });
    },

    initDragHandlers() {
      if (!this.bouncingLogo) return;

      // Mouse events
      this.bouncingLogo.addEventListener('mousedown', (e) => this.startDrag(e));
      window.addEventListener('mousemove', (e) => this.drag(e));
      window.addEventListener('mouseup', () => this.stopDrag());

      // Touch events
      this.bouncingLogo.addEventListener('touchstart', (e) => this.startDrag(e), { passive: false });
      window.addEventListener('touchmove', (e) => this.drag(e), { passive: false });
      window.addEventListener('touchend', () => this.stopDrag());

      // Prevent default drag behavior
      this.bouncingLogo.addEventListener('dragstart', (e) => e.preventDefault());
    },

    startDrag(e) {
      if (!this.isBouncingActive) return;

      this.isDragging = true;
      this.bouncingLogo.style.cursor = 'grabbing';

      // Pause bouncing animation
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }

      // Calculate offset from logo position to cursor/touch
      const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
      const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

      this.dragOffsetX = clientX - this.logoX;
      this.dragOffsetY = clientY - this.logoY;

      if (e.type.includes('touch')) {
        e.preventDefault();
      }
    },

    drag(e) {
      if (!this.isDragging) return;

      const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
      const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

      // Update position based on cursor/touch, accounting for offset
      const padding = 20;
      this.logoX = Math.max(padding, Math.min(clientX - this.dragOffsetX, this.containerWidth + padding - this.logoWidth));
      this.logoY = Math.max(padding, Math.min(clientY - this.dragOffsetY, this.containerHeight + padding - this.logoHeight));

      // Update visual position
      this.bouncingLogo.style.transform = `translate(${this.logoX}px, ${this.logoY}px)`;

      if (e.type.includes('touch')) {
        e.preventDefault();
      }
    },

    stopDrag() {
      if (!this.isDragging) return;

      this.isDragging = false;
      this.bouncingLogo.style.cursor = 'grab';

      // Bouncing will automatically resume via master render loop
    },

    updateLogoDimensions() {
      if (!this.bouncingLogo || !this.section) return;

      // Use window dimensions for bouncing area
      this.containerWidth = window.innerWidth;
      this.containerHeight = window.innerHeight;

      // Get actual logo dimensions
      const logoImg = this.bouncingLogo.querySelector('img');
      if (logoImg) {
        this.logoWidth = logoImg.offsetWidth || 300;
        this.logoHeight = logoImg.offsetHeight || 150;
      } else {
        this.logoWidth = 300;
        this.logoHeight = 150;
      }

      // Add padding boundaries
      const padding = 20;
      this.containerWidth = Math.max(0, this.containerWidth - padding * 2);
      this.containerHeight = Math.max(0, this.containerHeight - padding * 2);

      // Clamp position if needed
      this.logoX = Math.max(0, Math.min(this.logoX, this.containerWidth - this.logoWidth));
      this.logoY = Math.max(0, Math.min(this.logoY, this.containerHeight - this.logoHeight));
    },

    updateLogoPosition() {
      // Called by master render loop
      if (!this.bouncingLogo || this.isDragging || !this.isBouncingActive) return;

      const padding = 20;

      // Update position
      this.logoX += this.logoVelocityX;
      this.logoY += this.logoVelocityY;

      // Check boundaries and bounce
      let bounced = false;
      let bounceX = 0;
      let bounceY = 0;

      // Left/Right boundaries
      if (this.logoX <= padding) {
        this.logoX = padding;
        this.logoVelocityX = Math.abs(this.logoVelocityX);
        bounced = true;
        bounceX = this.logoX + this.logoWidth / 2;
        bounceY = this.logoY + this.logoHeight / 2;
      } else if (this.logoX >= this.containerWidth + padding - this.logoWidth) {
        this.logoX = this.containerWidth + padding - this.logoWidth;
        this.logoVelocityX = -Math.abs(this.logoVelocityX);
        bounced = true;
        bounceX = this.logoX + this.logoWidth / 2;
        bounceY = this.logoY + this.logoHeight / 2;
      }

      // Top/Bottom boundaries
      if (this.logoY <= padding) {
        this.logoY = padding;
        this.logoVelocityY = Math.abs(this.logoVelocityY);
        bounced = true;
        bounceX = this.logoX + this.logoWidth / 2;
        bounceY = this.logoY + this.logoHeight / 2;
      } else if (this.logoY >= this.containerHeight + padding - this.logoHeight) {
        this.logoY = this.containerHeight + padding - this.logoHeight;
        this.logoVelocityY = -Math.abs(this.logoVelocityY);
        bounced = true;
        bounceX = this.logoX + this.logoWidth / 2;
        bounceY = this.logoY + this.logoHeight / 2;
      }

      // Create sparks on bounce (but not on initial start)
      if (bounced && !this.justStartedBouncing) {
        this.createSparks(bounceX, bounceY);
      }

      // Apply position (depth pulse handled by CSS animation on inner image)
      this.bouncingLogo.style.transform = `translate(${this.logoX}px, ${this.logoY}px)`;
    },

    createSparks(x, y) {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      // Create exactly 12 spark particles with varying sizes
      const sparkCount = 12;
      const color = this.museColors[this.currentColorIndex];

      for (let i = 0; i < sparkCount; i++) {
        const spark = document.createElement('div');
        spark.className = 'spark';
        spark.style.left = x + 'px';
        spark.style.top = y + 'px';
        spark.style.backgroundColor = color;

        // Varying sizes: small (4px), medium (6px), large (8px), extra large (10px)
        const sizeVariants = [4, 4, 6, 6, 6, 8, 8, 8, 10, 10, 12, 12];
        const size = sizeVariants[i];
        spark.style.width = size + 'px';
        spark.style.height = size + 'px';

        // Random direction for each spark
        const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.3;
        const distance = 40 + Math.random() * 50;
        const sparkX = Math.cos(angle) * distance;
        const sparkY = Math.sin(angle) * distance;

        spark.style.setProperty('--spark-x', sparkX + 'px');
        spark.style.setProperty('--spark-y', sparkY + 'px');

        document.body.appendChild(spark);

        // Remove spark after animation
        setTimeout(() => {
          spark.remove();
        }, 600);
      }

      // Cycle to next color for next bounce
      this.currentColorIndex = (this.currentColorIndex + 1) % this.museColors.length;
    },

    nextSlide() {
      if (this.isAnimating) return;
      const nextIndex = (this.currentIndex + 1) % this.totalItems;
      this.transitionToSlide(nextIndex);
    },

    prevSlide() {
      if (this.isAnimating) return;
      const prevIndex = (this.currentIndex - 1 + this.totalItems) % this.totalItems;
      this.transitionToSlide(prevIndex);
    },

    transitionToSlide(targetIndex, scrollDriven = false) {
      if (this.isAnimating || targetIndex === this.currentIndex) return;

      this.isAnimating = true;
      const previousIndex = this.currentIndex;
      this.currentIndex = targetIndex;

      // Create particle burst if scroll-driven
      if (scrollDriven) {
        this.createTransitionParticles();
      }

      // Animate image with parallax (slower movement)
      this.animateSlideTransition(this.imageItems, previousIndex, targetIndex, 0.8);

      // Animate text with slight delay and faster movement (parallax effect)
      setTimeout(() => {
        this.animateSlideTransition(this.textItems, previousIndex, targetIndex, 1.2);
        this.isAnimating = false;
        this.updateDots();
      }, 100);
    },

    animateSlideTransition(items, fromIndex, toIndex, speedFactor = 1) {
      // GSAP timeline for smooth transitions
      const timeline = gsap.timeline({
        defaults: { ease: 'power3.inOut' }
      });

      // Fade out and slide up previous item
      if (items[fromIndex]) {
        timeline.to(items[fromIndex], {
          opacity: 0,
          y: -50 * speedFactor,
          duration: 0.4,
          onComplete: () => {
            items[fromIndex].classList.remove('active');
            gsap.set(items[fromIndex], { y: 0, visibility: 'hidden' });
          }
        });
      }

      // Fade in and slide up new item
      if (items[toIndex]) {
        gsap.set(items[toIndex], { y: 50 * speedFactor, opacity: 0, visibility: 'visible' });
        items[toIndex].classList.add('active');

        timeline.to(items[toIndex], {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'back.out(1.2)',
        }, '-=0.2'); // Overlap slightly
      }
    },

    createTransitionParticles() {
      if (!this.particleContainer) return;

      // Check for reduced motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      // Create 16 burst particles in current muse color
      const particleCount = 16;
      const color = this.museColors[this.currentIndex % this.museColors.length];
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'phase-particle';
        particle.style.setProperty('--particle-color', color);

        // Burst outward in all directions
        const angle = (i / particleCount) * Math.PI * 2;
        const distance = 150 + Math.random() * 100;
        const burstX = Math.cos(angle) * distance;
        const burstY = Math.sin(angle) * distance;

        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        particle.style.setProperty('--burst-x', `${burstX}px`);
        particle.style.setProperty('--burst-y', `${burstY}px`);

        // Animate with GSAP for better control
        gsap.fromTo(particle,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.2,
            ease: 'power2.out',
            onComplete: () => {
              // Burst outward
              gsap.to(particle, {
                x: burstX,
                y: burstY,
                scale: 0.3,
                opacity: 0,
                duration: 0.8,
                ease: 'power2.out',
                onComplete: () => particle.remove()
              });
            }
          }
        );

        this.particleContainer.appendChild(particle);
      }
    },

    updateDots() {
      // Update active state on dots
      this.dots.forEach((dot, index) => {
        if (index === this.currentIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }
  };

  // ==========================================================================
  // COMET CONNECTION LINES
  // ==========================================================================
  const CometConnections = {
    canvas: null,
    ctx: null,
    imageItems: [],

    init() {
      this.canvas = document.getElementById('comet-connection-canvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.imageItems = Array.from(document.querySelectorAll('.comet-image-item'));

      if (this.imageItems.length === 0) return;

      this.resize();
      this.draw();

      // Redraw on window resize
      window.addEventListener('resize', debounce(() => {
        this.resize();
        this.draw();
      }, 150), { passive: true });
    },

    resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.scale(dpr, dpr);
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';
    },

    draw() {
      if (!this.ctx || this.imageItems.length === 0) return;

      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Set line style (white, thin line like constellation)
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      this.ctx.lineWidth = 1;
      this.ctx.lineCap = 'round';

      // Draw lines connecting images in sequence (0 → 1 → 2 → 3 → 4)
      for (let i = 0; i < this.imageItems.length - 1; i++) {
        const current = this.imageItems[i];
        const next = this.imageItems[i + 1];

        // Get center positions of each image
        const currentRect = current.getBoundingClientRect();
        const nextRect = next.getBoundingClientRect();
        const containerRect = this.canvas.getBoundingClientRect();

        const x1 = currentRect.left + currentRect.width / 2 - containerRect.left;
        const y1 = currentRect.top + currentRect.height / 2 - containerRect.top;
        const x2 = nextRect.left + nextRect.width / 2 - containerRect.left;
        const y2 = nextRect.top + nextRect.height / 2 - containerRect.top;

        // Draw line
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
      }
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
    CometCollabBackground.init();

    // Initialize comet connection lines
    CometConnections.init();

    // Initialize comet collab slider with bouncing logo (commented out - replaced with connected images)
    // CometCollabSlider.init();

    // Start master render loop (consolidates all animations)
    masterRender();
  }

  // Start the application
  init();

})();
