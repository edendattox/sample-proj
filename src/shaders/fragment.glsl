    precision highp float;
    precision highp int;
    varying vec3 vNormal;
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      
      if(vAlpha==0.) discard;
      gl_FragColor = vec4(vColor, vAlpha);
    }