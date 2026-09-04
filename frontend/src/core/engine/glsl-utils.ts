export const glslTypeCast = (value: string, fromType: string, toType: string): string => {
  if (fromType === toType) return value;
  
  if (toType === 'float') {
    if (fromType === 'vec2') return `${value}.x`;
    if (fromType === 'vec3') return `${value}.x`;
    if (fromType === 'vec4') return `${value}.x`;
  }
  
  if (toType === 'vec2') {
    if (fromType === 'float') return `vec2(${value})`;
    if (fromType === 'vec3') return `${value}.xy`;
    if (fromType === 'vec4') return `${value}.xy`;
  }

  if (toType === 'vec3') {
    if (fromType === 'float') return `vec3(${value})`;
    if (fromType === 'vec2') return `vec3(${value}, 0.0)`;
    if (fromType === 'vec4') return `${value}.xyz`;
  }

  if (toType === 'vec4') {
    if (fromType === 'float') return `vec4(${value})`;
    if (fromType === 'vec2') return `vec4(${value}, 0.0, 1.0)`;
    if (fromType === 'vec3') return `vec4(${value}, 1.0)`;
  }
  
  return value; // fallback
};

export const GLSL_LIBRARIES = {
  simplex2d: `
// Simplex 2D noise
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`,
  voronoi: `
// Voronoi/Worley Noise
vec2 random2( vec2 p ) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}
float voronoi(vec2 x) {
    vec2 n = floor(x);
    vec2 f = fract(x);
    float m = 8.0;
    for( int j=-1; j<=1; j++ )
    for( int i=-1; i<=1; i++ ) {
        vec2 g = vec2(float(i),float(j));
        vec2 o = random2( n + g );
        vec2 r = g - f + o;
        float d = dot(r,r);
        m = min(m,d);
    }
    return sqrt(m);
}
`
};
