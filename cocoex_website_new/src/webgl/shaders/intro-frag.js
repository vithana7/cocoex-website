import { SIMPLEX_NOISE, STAR_FIELD } from './glsl-utils.js';

// Intro cosmic-noise starfield + dispersive "big bang" pulse. Verbatim port.
export const INTRO_FRAG = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_pulse;

  ${SIMPLEX_NOISE}
  ${STAR_FIELD}

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uvAspect = vec2(uv.x * aspect, uv.y);

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

    float starLight = stars(uv, u_time);
    brightness += starLight * 0.25;

    if (u_pulse > 0.0) {
      vec2 center = vec2(0.5, 0.5);
      vec2 toCenter = uv - center;
      toCenter.x *= aspect;

      float noiseOffset = snoise(uv * 4.0 + u_time * 0.1) * 0.15;
      float dist = length(toCenter) + noiseOffset;

      float expandRadius = u_pulse * 2.0;
      float fadeOut = 1.0 - u_pulse;

      float wave1 = exp(-pow((dist - expandRadius * 0.5) * 4.0, 2.0)) * 0.12;
      float wave2 = exp(-pow((dist - expandRadius * 0.8) * 3.0, 2.0)) * 0.08;
      float wave3 = exp(-pow((dist - expandRadius) * 2.5, 2.0)) * 0.05;

      float pulseIntensity = (wave1 + wave2 + wave3) * fadeOut * fadeOut;
      float flash = fadeOut * fadeOut * fadeOut * exp(-dist * 4.0) * 0.1;

      brightness += pulseIntensity + flash;
    }

    gl_FragColor = vec4(vec3(brightness), 1.0);
  }
`;

export const STARFIELD_FRAG = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec3 u_bgColor;
  uniform vec3 u_starColor;
  uniform float u_invert;
  uniform float u_intensity;

  ${STAR_FIELD}

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float starLight = stars(uv, u_time);
    float brightness = clamp(starLight * u_intensity, 0.0, 1.0);
    vec3 color = mix(u_bgColor, u_starColor, brightness);
    color = mix(color, vec3(1.0) - color, u_invert);
    gl_FragColor = vec4(color, 1.0);
  }
`;
