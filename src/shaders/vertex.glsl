    attribute vec3 position;
    attribute vec3 normal;
    attribute vec3 offset;
    attribute vec3 random;
    attribute vec3 color;
    attribute vec2 textureCoord;
    attribute vec2 lineWidth;
    attribute vec2 uv;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform mat3 normalMatrix;
    uniform sampler2D uStart;
    uniform sampler2D uEnd;
    uniform float uTransition;
    uniform float uLineWidth;
    uniform float uLineThick;
    uniform float uTime;
    uniform float uCurve;
    varying vec3 vNormal;
    varying vec3 vColor;
    varying float vAlpha;

    vec2 rotate(vec2 v, float a) {
      float s = sin(a);
      float c = cos(a);
      mat2 m = mat2(c, -s, s, c);
      return m * v;
    }

    void main() {
       
        vColor = color;
        
        vec3 pos = position;
        pos.z = random.z * 0.0111;

        float uStartAlpha = step(0.5, texture2D(uStart, textureCoord).r);
        float uEndAlpha = step(0.5, texture2D(uEnd, textureCoord).r);
        float show = max(uStartAlpha, uEndAlpha);

        vAlpha = show*mix(uStartAlpha, uEndAlpha, uTransition);

        //  length of particles

        float scale = mix(lineWidth.x, lineWidth.y, uLineWidth);
        pos.y *= scale;
        pos.x *= uLineThick;

        //  curve to
       

        float curve = uCurve*0.001*sin(uv.y * 2. + uTime);

        pos.x += curve;


        //  rotate particles

        pos.xy = rotate(pos.xy, (uTime*10. + random.z*1000.)/(random.y*50. + 50.));


        // ?
        vec2 origin = textureCoord.xy*vec2(1., 0.5);

        pos.xy += origin-vec2(0.5, 0.25) + (1. - vAlpha)*(random.xy - 0.5);

        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }