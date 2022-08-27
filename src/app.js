import {
  Renderer,
  Texture,
  Camera,
  Transform,
  Program,
  Mesh,
  Orbit,
  Plane,
} from "ogl";
import t1 from "../img/1.jpg";
import t2 from "../img/2.png";
import * as dat from "dat.gui";
import gsap from "gsap";
import vertex from "./shaders/vertex.glsl";
import fragment from "./shaders/fragment.glsl";

// hexToRgb function convert colors from hex to rgb

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255, // we divide by 255 to have decimal values
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : null;
}

var colors = require("nice-color-palettes");

let rand = Math.floor(Math.random() * 100);

let p = colors[rand];

let palette = p.map((c) => {
  return hexToRgb(c);
});

let settings = {
  transition: 0,
  uLineWidth: 0,
  uLineThick: 0.1,
  uCurve: 0.5,
  speed: 1,
  run: () => {
    gsap.to(settings, {
      duration: 0.5,
      uCurve: 20,
      uLineThick: 0.01,
      speed: 10,
      repeat: true,

      onComplete: () => {
        gsap.to(settings, {
          duration: 0.5,
          uCurve: 0.5,
          uLineThick: 0.1,
          speed: 1,

          onComplete: () => {},
        });
      },
    });
  },
};

gsap.fromTo(
  settings,
  {
    duration: 4,
    uCurve: 20,
    uLineThick: 0.01,
    uLineThick: 0.1,
    uCurve: 0.5,
  },
  {
    duration: 4,
    speed: 5,
    uCurve: 3.84,
    repeat: -1,
    delay: 1,
    yoyo: true,
  }
);

let gui = new dat.GUI();
gui.add(settings, "transition", 0, 1, 0.01);
gui.add(settings, "uLineWidth", 0, 1, 0.01);
gui.add(settings, "uLineThick", 0, 1, 0.01);
gui.add(settings, "uCurve", 0, 30, 0.01);
gui.add(settings, "run");

{
  const renderer = new Renderer({ dpr: 2 });
  const gl = renderer.gl;
  const container = document.querySelector(".container");
  container.appendChild(gl.canvas);
  gl.clearColor(1, 1, 1, 1);

  const camera = new Camera(gl, { fov: 15 });
  camera.position.set(0, 0, 3);
  const controls = new Orbit(camera);
  controls.enabled = false;

  function resize() {
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    camera.perspective({
      aspect: container.offsetWidth / container.offsetHeight,
    });
  }
  window.addEventListener("resize", resize, false);
  resize();

  const scene = new Transform();

  // Upload empty texture while source loading
  const texture = new Texture(gl);

  // update image value with source once loaded
  const img = new Image();
  img.src = t1;
  img.onload = () => (texture.image = img);

  const texture1 = new Texture(gl);

  const img1 = new Image();
  img1.src = t2;
  img1.onload = () => (texture1.image = img1);

  const num = 19000;

  let offset = new Float32Array(num * 3);
  let random = new Float32Array(num * 3);
  let colors = new Float32Array(num * 3);
  let textureCoord = new Float32Array(num * 2);
  let lineWidth = new Float32Array(num * 2);

  for (let i = 0; i < num; i++) {
    let x = (Math.random() * 2 - 1) * 0.5;
    let y = (Math.random() * 2 - 1) * 0.5;

    offset.set([x, y, 0], i * 3);

    textureCoord.set([x + 0.5, y + 0.5], i * 2);

    lineWidth.set([Math.random(), Math.random() * 6], i * 2);

    let color = palette[Math.floor(Math.random() * 5)];

    colors.set([color.r, color.g, color.b], i * 3);

    random.set([Math.random(), Math.random(), Math.random()], i * 3);
  }

  const planeGeometry = new Plane(gl, {
    width: 0.02,
    height: 0.02,
    widthSegments: 10,
    heightSegments: 10,
    attributes: {
      offset: { instanced: 1, size: 3, data: offset },
      random: { instanced: 1, size: 3, data: random },
      color: { instanced: 1, size: 3, data: colors },
      textureCoord: { instanced: 1, size: 2, data: textureCoord },
      lineWidth: { instanced: 1, size: 2, data: lineWidth },
    },
  });
  const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      uStart: { value: texture },
      uEnd: { value: texture1 },
      uTransition: { value: 0 },
      uLineWidth: { value: 0 },
      uLineThick: { value: 0 },
      uCurve: { value: 0 },
      uTime: { value: 0 },
    },
    transparent: true,
    // Don't cull faces so that plane is double sided - default is gl.BACK
    cullFace: null,
  });

  const plane = new Mesh(gl, {
    geometry: planeGeometry,
    program,
  });
  plane.position.set(0, 0, 0);
  plane.setParent(scene);

  requestAnimationFrame(update);

  function update() {
    requestAnimationFrame(update);
    controls.update();

    program.uniforms.uTransition.value = settings.transition;
    program.uniforms.uLineWidth.value = settings.uLineWidth;
    program.uniforms.uLineThick.value = settings.uLineThick;
    program.uniforms.uCurve.value = settings.uCurve;
    program.uniforms.uTime.value += settings.speed * 0.01;
    renderer.render({ scene, camera });
  }
}
