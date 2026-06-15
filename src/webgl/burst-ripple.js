import { VERTEX_QUAD } from './shaders/glsl-utils.js';
import { BURST_RIPPLE_FRAG } from './shaders/intro-frag.js';
import { getGL, createProgram, bindFullscreenQuad, sizeCanvas } from './gl-context.js';

// Transparent muse-spectrum ripple overlay (the intro's "constellation burst", reused).
// Driven by setPulse(0..1); draws nothing while pulse<=0. Centred on setCenter(uvX, uvY).
// Cleared transparent each frame so it composites over whatever is behind it.
export function createBurstRipple(canvasId) {
  return {
    canvasId,
    canvas: null,
    gl: null,
    program: null,
    pulse: 0,
    cx: 0.5,
    cy: 0.5,
    _u: {},
    _contextLost: false,

    init() {
      this.canvas = document.getElementById(this.canvasId);
      if (!this.canvas) return;
      this.gl = getGL(this.canvas);
      if (!this.gl) return;
      this.canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        this._contextLost = true;
      });
      this.canvas.addEventListener('webglcontextrestored', () => {
        this._contextLost = false;
        this._build();
      });
      this.resize();
      this._build();
    },

    _build() {
      const gl = this.gl;
      this.program = createProgram(gl, VERTEX_QUAD, BURST_RIPPLE_FRAG);
      if (!this.program) return;
      this._u = {
        res: gl.getUniformLocation(this.program, 'u_resolution'),
        pulse: gl.getUniformLocation(this.program, 'u_pulse'),
        center: gl.getUniformLocation(this.program, 'u_center'),
      };
      bindFullscreenQuad(gl, this.program);
    },

    resize() {
      if (this.canvas) sizeCanvas(this.canvas, this.gl);
    },

    setPulse(v) {
      this.pulse = v;
    },

    // Focal point in 0..1 uv (origin bottom-left, matching gl_FragCoord).
    setCenter(x, y) {
      this.cx = x;
      this.cy = y;
    },

    render() {
      const gl = this.gl;
      if (!gl || !this.program || this._contextLost) return;
      gl.useProgram(this.program);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(this._u.res, this.canvas.width, this.canvas.height);
      gl.uniform1f(this._u.pulse, this.pulse);
      gl.uniform2f(this._u.center, this.cx, this.cy);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    },
  };
}
