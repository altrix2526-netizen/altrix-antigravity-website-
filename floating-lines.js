/* ========================================================
   ALTRIX AGENCY — floating-lines.js
   WebGL Shader Waves (Highly Optimized for 60fps smoothness)
   ======================================================== */

const vertexShader = `
precision mediump float;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision mediump float;

uniform float iTime;
uniform vec3  iResolution;
uniform float animationSpeed;

uniform bool enableTop;
uniform bool enableMiddle;
uniform bool enableBottom;

uniform int topLineCount;
uniform int middleLineCount;
uniform int bottomLineCount;

uniform float topLineDistance;
uniform float middleLineDistance;
uniform float bottomLineDistance;

uniform vec3 topWavePosition;
uniform vec3 middleWavePosition;
uniform vec3 bottomWavePosition;

uniform vec2 iMouse;
uniform bool interactive;
uniform float bendRadius;
uniform float bendStrength;
uniform float bendInfluence;

uniform bool parallax;
uniform float parallaxStrength;
uniform vec2 parallaxOffset;

uniform vec3 lineGradient[8];
uniform int lineGradientCount;

const vec3 BLACK = vec3(0.0);
const vec3 PINK  = vec3(233.0, 71.0, 245.0) / 255.0;
const vec3 BLUE  = vec3(47.0,  75.0, 162.0) / 255.0;

mat2 rotate(float r) {
  return mat2(cos(r), sin(r), -sin(r), cos(r));
}

vec3 background_color(vec2 uv) {
  vec3 col = vec3(0.0);
  float y = sin(uv.x - 0.2) * 0.3 - 0.1;
  float m = uv.y - y;
  col += mix(BLUE, BLACK, smoothstep(0.0, 1.0, abs(m)));
  col += mix(PINK, BLACK, smoothstep(0.0, 1.0, abs(m - 0.8)));
  return col * 0.5;
}

vec3 getLineColor(float t, vec3 baseColor) {
  if (lineGradientCount <= 0) {
    return baseColor;
  }
  vec3 gradientColor;
  if (lineGradientCount == 1) {
    gradientColor = lineGradient[0];
  } else {
    float clampedT = clamp(t, 0.0, 0.9999);
    float scaled = clampedT * float(lineGradientCount - 1);
    int idx = int(floor(scaled));
    float f = fract(scaled);
    int idx2 = min(idx + 1, lineGradientCount - 1);
    vec3 c1 = lineGradient[idx];
    vec3 c2 = lineGradient[idx2];
    gradientColor = mix(c1, c2, f);
  }
  return gradientColor * 0.5;
}

float wave(vec2 uv, float offset, vec2 screenUv, vec2 mouseUv, bool shouldBend) {
  float time = iTime * animationSpeed;
  float x_offset   = offset;
  float x_movement = time * 0.1;
  float amp        = sin(offset + time * 0.2) * 0.3;
  float y          = sin(uv.x + x_offset + x_movement) * amp;

  if (shouldBend) {
    vec2 d = screenUv - mouseUv;
    float influence = exp(-dot(d, d) * bendRadius); // radial falloff around cursor
    float bendOffset = (mouseUv.y - screenUv.y) * influence * bendStrength * bendInfluence;
    y += bendOffset;
  }

  float m = uv.y - y;
  return 0.0175 / max(abs(m) + 0.01, 1e-3) + 0.01;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 baseUv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
  baseUv.y *= -1.0;
  
  if (parallax) {
    baseUv += parallaxOffset;
  }

  vec3 col = vec3(0.0);
  vec3 b = lineGradientCount > 0 ? vec3(0.0) : background_color(baseUv);

  vec2 mouseUv = vec2(0.0);
  if (interactive) {
    mouseUv = (2.0 * iMouse - iResolution.xy) / iResolution.y;
    mouseUv.y *= -1.0;
  }
  
  // Capped loops to max 12 lines per wave to allow compiler optimizations
  if (enableBottom) {
    for (int i = 0; i < 12; ++i) {
      if (i >= bottomLineCount) break;
      float fi = float(i);
      float t = fi / max(float(bottomLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);
      
      float angle = bottomWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      col += lineCol * wave(
        ruv + vec2(bottomLineDistance * fi + bottomWavePosition.x, bottomWavePosition.y),
        1.5 + 0.2 * fi,
        baseUv,
        mouseUv,
        interactive
      ) * 0.2;
    }
  }

  if (enableMiddle) {
    for (int i = 0; i < 12; ++i) {
      if (i >= middleLineCount) break;
      float fi = float(i);
      float t = fi / max(float(middleLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);
      
      float angle = middleWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      col += lineCol * wave(
        ruv + vec2(middleLineDistance * fi + middleWavePosition.x, middleWavePosition.y),
        2.0 + 0.15 * fi,
        baseUv,
        mouseUv,
        interactive
      );
    }
  }

  if (enableTop) {
    for (int i = 0; i < 12; ++i) {
      if (i >= topLineCount) break;
      float fi = float(i);
      float t = fi / max(float(topLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);
      
      float angle = topWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      ruv.x *= -1.0;
      col += lineCol * wave(
        ruv + vec2(topLineDistance * fi + topWavePosition.x, topWavePosition.y),
        1.0 + 0.2 * fi,
        baseUv,
        mouseUv,
        interactive
      ) * 0.1;
    }
  }

  float alpha = max(max(col.r, col.g), col.b);
  fragColor = vec4(col, clamp(alpha * 1.5, 0.0, 1.0));
}

void main() {
  vec4 color = vec4(0.0);
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}
`;

const MAX_GRADIENT_STOPS = 8;

function hexToVec3(hex) {
  let value = hex.trim();
  if (value.startsWith('#')) {
    value = value.slice(1);
  }
  let r = 255, g = 255, b = 255;
  if (value.length === 3) {
    r = parseInt(value[0] + value[0], 16);
    g = parseInt(value[1] + value[1], 16);
    b = parseInt(value[2] + value[2], 16);
  } else if (value.length === 6) {
    r = parseInt(value.slice(0, 2), 16);
    g = parseInt(value.slice(2, 4), 16);
    b = parseInt(value.slice(4, 6), 16);
  }
  return new THREE.Vector3(r / 255, g / 255, b / 255);
}

class FloatingLines {
  constructor(container, options = {}) {
    this.container = container;
    
    this.linesGradient = options.linesGradient || undefined;
    this.enabledWaves = options.enabledWaves || ['top', 'middle', 'bottom'];
    this.lineCount = options.lineCount !== undefined ? options.lineCount : [6];
    this.lineDistance = options.lineDistance !== undefined ? options.lineDistance : [5];
    
    this.topWavePosition = options.topWavePosition || { x: 10.0, y: 0.5, rotate: -0.4 };
    this.middleWavePosition = options.middleWavePosition || { x: 5.0, y: 0.0, rotate: 0.2 };
    this.bottomWavePosition = options.bottomWavePosition || { x: 2.0, y: -0.7, rotate: -1 };
    
    this.animationSpeed = options.animationSpeed !== undefined ? options.animationSpeed : 1.0;
    this.interactive = options.interactive !== undefined ? options.interactive : true;
    this.bendRadius = options.bendRadius !== undefined ? options.bendRadius : 5.0;
    this.bendStrength = options.bendStrength !== undefined ? options.bendStrength : -0.5;
    this.mouseDamping = options.mouseDamping !== undefined ? options.mouseDamping : 0.05;
    
    this.parallax = options.parallax !== undefined ? options.parallax : true;
    this.parallaxStrength = options.parallaxStrength !== undefined ? options.parallaxStrength : 0.2;
    this.mixBlendMode = options.mixBlendMode || 'screen';
    
    this.eventSource = options.eventSource || window;

    this.targetMouse = new THREE.Vector2(-1000, -1000);
    this.currentMouse = new THREE.Vector2(-1000, -1000);
    this.targetInfluence = 0.0;
    this.currentInfluence = 0.0;
    this.targetParallax = new THREE.Vector2(0, 0);
    this.currentParallax = new THREE.Vector2(0, 0);
    
    this.active = true;
    this.raf = null;
    
    this.init();
  }

  getLineCount(waveType) {
    if (typeof this.lineCount === 'number') return this.lineCount;
    if (!this.enabledWaves.includes(waveType)) return 0;
    const index = this.enabledWaves.indexOf(waveType);
    return this.lineCount[index] ?? 6;
  }

  getLineDistance(waveType) {
    if (typeof this.lineDistance === 'number') return this.lineDistance;
    if (!this.enabledWaves.includes(waveType)) return 0.1;
    const index = this.enabledWaves.indexOf(waveType);
    return this.lineDistance[index] ?? 0.1;
  }

  init() {
    const container = this.container;
    if (!container) return;

    container.style.mixBlendMode = this.mixBlendMode;
    container.style.position = 'absolute';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.overflow = 'hidden';

    this.scene = new THREE.Scene();

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.camera.position.z = 1;

    // Performance Optimization: Set alpha to true and set pixel ratio to 1.0 (prevents high-DPI retina rendering overload)
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(1.0); 
    this.renderer.setSize(container.clientWidth || 1, container.clientHeight || 1, false);
    
    const canvas = this.renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    container.appendChild(canvas);

    const topLineCount = this.enabledWaves.includes('top') ? this.getLineCount('top') : 0;
    const middleLineCount = this.enabledWaves.includes('middle') ? this.getLineCount('middle') : 0;
    const bottomLineCount = this.enabledWaves.includes('bottom') ? this.getLineCount('bottom') : 0;

    const topLineDistance = this.enabledWaves.includes('top') ? this.getLineDistance('top') * 0.01 : 0.01;
    const middleLineDistance = this.enabledWaves.includes('middle') ? this.getLineDistance('middle') * 0.01 : 0.01;
    const bottomLineDistance = this.enabledWaves.includes('bottom') ? this.getLineDistance('bottom') * 0.01 : 0.01;

    this.uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector3(1, 1, 1) },
      animationSpeed: { value: this.animationSpeed },

      enableTop: { value: this.enabledWaves.includes('top') },
      enableMiddle: { value: this.enabledWaves.includes('middle') },
      enableBottom: { value: this.enabledWaves.includes('bottom') },

      topLineCount: { value: Math.min(topLineCount, 12) },
      middleLineCount: { value: Math.min(middleLineCount, 12) },
      bottomLineCount: { value: Math.min(bottomLineCount, 12) },

      topLineDistance: { value: topLineDistance },
      middleLineDistance: { value: middleLineDistance },
      bottomLineDistance: { value: bottomLineDistance },

      topWavePosition: {
        value: new THREE.Vector3(
          this.topWavePosition?.x ?? 10.0,
          this.topWavePosition?.y ?? 0.5,
          this.topWavePosition?.rotate ?? -0.4
        )
      },
      middleWavePosition: {
        value: new THREE.Vector3(
          this.middleWavePosition?.x ?? 5.0,
          this.middleWavePosition?.y ?? 0.0,
          this.middleWavePosition?.rotate ?? 0.2
        )
      },
      bottomWavePosition: {
        value: new THREE.Vector3(
          this.bottomWavePosition?.x ?? 2.0,
          this.bottomWavePosition?.y ?? -0.7,
          this.bottomWavePosition?.rotate ?? -1.0
        )
      },

      iMouse: { value: new THREE.Vector2(-1000, -1000) },
      interactive: { value: this.interactive },
      bendRadius: { value: this.bendRadius },
      bendStrength: { value: this.bendStrength },
      bendInfluence: { value: 0 },

      parallax: { value: this.parallax },
      parallaxStrength: { value: this.parallaxStrength },
      parallaxOffset: { value: new THREE.Vector2(0, 0) },

      lineGradient: {
        value: Array.from({ length: MAX_GRADIENT_STOPS }, () => new THREE.Vector3(1, 1, 1))
      },
      lineGradientCount: { value: 0 }
    };

    if (this.linesGradient && this.linesGradient.length > 0) {
      const stops = this.linesGradient.slice(0, MAX_GRADIENT_STOPS);
      this.uniforms.lineGradientCount.value = stops.length;

      stops.forEach((hex, i) => {
        const color = hexToVec3(hex);
        this.uniforms.lineGradient.value[i].copy(color);
      });
    }

    // Performance Optimization: Use mediump precision inside ShaderMaterial
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      precision: "mediump"
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(mesh);

    this.clock = new THREE.Clock();

    this.setSize = () => {
      if (!this.active) return;
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      this.renderer.setSize(w, h, false);
      this.uniforms.iResolution.value.set(canvas.width, canvas.height, 1);
    };
    
    this.setSize();

    window.addEventListener('resize', this.setSize);

    this.handlePointerMove = (event) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const dpr = this.renderer.getPixelRatio();

      this.targetMouse.set(x * dpr, (rect.height - y) * dpr);
      this.targetInfluence = 1.0;

      if (this.parallax) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const offsetX = (x - centerX) / rect.width;
        const offsetY = -(y - centerY) / rect.height;
        this.targetParallax.set(offsetX * this.parallaxStrength, offsetY * this.parallaxStrength);
      }
    };

    this.handlePointerLeave = () => {
      this.targetInfluence = 0.0;
    };

    if (this.interactive) {
      this.eventSource.addEventListener('pointermove', this.handlePointerMove);
      this.eventSource.addEventListener('pointerleave', this.handlePointerLeave);
    }

    this.renderLoop();
  }

  renderLoop() {
    if (!this.active) return;

    this.uniforms.iTime.value = this.clock.getElapsedTime();

    if (this.interactive) {
      this.currentMouse.lerp(this.targetMouse, this.mouseDamping);
      this.uniforms.iMouse.value.copy(this.currentMouse);

      this.currentInfluence += (this.targetInfluence - this.currentInfluence) * this.mouseDamping;
      this.uniforms.bendInfluence.value = this.currentInfluence;
    }

    if (this.parallax) {
      this.currentParallax.lerp(this.targetParallax, this.mouseDamping);
      this.uniforms.parallaxOffset.value.copy(this.currentParallax);
    }

    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame(() => this.renderLoop());
  }

  destroy() {
    this.active = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.setSize);

    if (this.interactive) {
      this.eventSource.removeEventListener('pointermove', this.handlePointerMove);
      this.eventSource.removeEventListener('pointerleave', this.handlePointerLeave);
    }

    if (this.material) this.material.dispose();
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
      if (this.renderer.domElement.parentElement) {
        this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
      }
    }
  }
}

window.FloatingLines = FloatingLines;
