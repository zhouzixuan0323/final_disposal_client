<template>
  <div class="welcome-page">
    <div id="welcome-canvas-box"></div>
    <button class="enter-button" type="button" @click="goHome">点击或回车进入首页</button>
  </div>

</template>

<script>
import * as THREE from "three";
import { Mesh, PlaneBufferGeometry } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "WelCome",
  setup() {
    let router = useRouter()
    // 创建场景,创建相机,创建渲染器
    let scene, camera, renderer;
    // 创建光源
    let point;

    // 获取浏览器宽
    let width = window.innerWidth;
    // 获取浏览器高
    let height = window.innerHeight;

    let mouseX = 0;
    let mouseY = 0;

    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    let image, imageContext, texture;

    let mesh;
    let animationFrameId;

    // 镜子
    let planeGeometry;

    const roomWidth = 6800;
    const roomDepth = 4600;
    const roomHeight = 1400;
    const roomCenter = new THREE.Vector3(0, 0, -150);
    const cameraBasePosition = new THREE.Vector3(0, 0, 1250);

    // 创建初始化函数
    function init() {
      // 创建场景
      scene = new THREE.Scene();

      //Hexadecimal color (recommended)
      let color = new THREE.Color(0xf0f0f0);
      // 给场景添加背景
      scene.background = color;
      // 初始化
      initCamera();
      initPoint();
      // initStats();
      initFont();
      // initFont2();
      initGround();


      // 创建渲染器
      renderer = new THREE.WebGLRenderer({//增加下面两个属性，可以抗锯齿
        antialias:true,
        alpha:true});
      // 设置渲染器大小
      renderer.setSize(width, height);
      // 设置背景颜色
      renderer.setClearColor(0x000000, 1);
      // 模型开启阴影
      renderer.shadowMap.enabled = true;

      image = document.createElement("canvas");
      image.width = 480;
      image.height = 204;

      imageContext = image.getContext("2d");
      imageContext.fillStyle = "#000000";
      imageContext.fillRect(0, 0, 480, 204);

      texture = new THREE.Texture(image);

      // 监听浏览器可视区变化
      window.addEventListener("resize", onWindowResize);

      document.addEventListener("mousemove", onDocumentMouseMove, false);

      document.getElementById("welcome-canvas-box").appendChild(renderer.domElement);
    }

    // 初始化相机
    function initCamera() {
      // 创建相机对象
      camera = new THREE.PerspectiveCamera(50, width / height, 1, 100000);
      // 设置相机位置
      camera.position.copy(cameraBasePosition);
      // 设置相机方向(指向场景的的坐标)
      camera.lookAt(roomCenter);
    }

    // 初始化光源
    function initPoint() {
      // 创建环境光
      let light = new THREE.AmbientLight(0xffffff); // soft white light
      scene.add(light);
      // 创建白色光源
      point = new THREE.SpotLight(0xffffff);
      // 设置光源位置
      point.position.set(0, 360, 520);
      // 开启阴影
      point.castShadow = true;
      // 设置阴影像素
      point.shadow.mapSize.width = 1024;
      point.shadow.mapSize.height = 1024;

      // point.shadow.camera.near = 500;
      // point.shadow.camera.far = 4000;
      // point.shadow.camera.fov = 30;

      point.intensity = 10;

      // 将光源添加到场景中
      scene.add(point);
    }

    // 初始化地板
    function initGround() {

      planeGeometry = new PlaneBufferGeometry(roomWidth, roomDepth);

      // 镜面反射
      const mirror = new Reflector(planeGeometry, {
        clipBias: 0.03,
        textureWidth: window.innerWidth * window.devicePixelRatio,
        textureHeight: window.innerHeight * window.devicePixelRatio,
        transparent: true,
      });
      mirror.position.z = roomCenter.z
      mirror.position.y = -150
      mirror.rotateX(Math.PI * 1.5)
      scene.add(mirror);

      const plane = new THREE.Mesh(
          planeGeometry,
          new THREE.MeshBasicMaterial({
            color: 0xf0f0f0,
            opacity: 0.7,
            transparent: true,
          })
      );
      plane.position.y = -149;
      plane.position.z = roomCenter.z;
      plane.rotation.x = -Math.PI / 2;
      scene.add(plane);

      let separation = 150;
      let amountx = 26;
      let amounty = 24;

      let PI2 = Math.PI * 2;
      let material = new THREE.SpriteMaterial({
        color: 0x0808080,
      });

      for (let ix = 0; ix < amountx; ix++) {
        for (let iy = 0; iy < amounty; iy++) {
          let sprite = new THREE.Sprite(material);
          sprite.position.x = ix * separation - (amountx * separation) / 2;
          sprite.position.y = -149;
          sprite.position.z = iy * separation - (amounty * separation) / 2 + roomCenter.z;
          sprite.scale.setScalar(2);
          scene.add(sprite);
        }
      }
    }

    // 初始化字体
    function initFont() {
      let loader = new FontLoader();

      loader.load('/fonts/SimHei_Regular.json', function (font) {

        const color = 0x006699;

        const matDark = new THREE.LineBasicMaterial({
          color: color,
          side: THREE.DoubleSide
        });

        const matLite = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.4,
          side: THREE.DoubleSide
        });

        const message = '归宿';

        const shapes = font.generateShapes(message, 100);

        const geometry = new THREE.ShapeGeometry(shapes);

        geometry.computeBoundingBox();

        const xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
        const yMid = roomCenter.y - 0.2 * (geometry.boundingBox.max.y - geometry.boundingBox.min.y);

        geometry.translate(xMid, yMid, roomCenter.z);

        // make shape ( N.B. edge view not visible )

        const text = new THREE.Mesh(geometry, matLite);
        text.position.z = 0;
        scene.add(text);

        // make line shape ( N.B. edge view remains visible )

        const holeShapes = [];

        for (let i = 0; i < shapes.length; i++) {

          const shape = shapes[i];

          if (shape.holes && shape.holes.length > 0) {

            for (let j = 0; j < shape.holes.length; j++) {

              const hole = shape.holes[j];
              holeShapes.push(hole);

            }

          }

        }

        shapes.push.apply(shapes, holeShapes);

        const lineText = new THREE.Object3D();

        for (let i = 0; i < shapes.length; i++) {

          const shape = shapes[i];

          const points = shape.getPoints();
          const geometry = new THREE.BufferGeometry().setFromPoints(points);

          geometry.translate(xMid, yMid - 90, roomCenter.z + 200);

          const lineMesh = new THREE.Line(geometry, matDark);
          lineText.add(lineMesh);

        }


        scene.add(lineText);
      });
    }

    function initFont2() {
      const loader = new FontLoader();
      loader.load( '/fonts/SimHei_Regular.json', function ( font ) {

        const textGeometry = new TextGeometry( '归宿', {
          font: font,
          size: 80,
          height: 5,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 10,
          bevelSize: 8,
          bevelOffset: 0,
          bevelSegments: 5
        } );
        const TextMaterial = new THREE.MeshPhongMaterial( { color: 0x889900, flatShading: true } );

        const TextMesh = new Mesh(textGeometry, TextMaterial)

        scene.add(TextMesh)
      } );
    }

    //窗口变动触发的函数
    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onDocumentMouseMove(event) {
      const cameraOffsetX = (event.clientX - windowHalfX) * 0.12;
      mouseX = THREE.MathUtils.clamp(cameraBasePosition.x + cameraOffsetX, cameraBasePosition.x - 180, cameraBasePosition.x + 180);
      mouseY = (event.clientY - windowHalfY) * 0.12;
    }

    // 渲染
    function render() {
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (cameraBasePosition.y - mouseY - camera.position.y) * 0.05;
      camera.position.z += (cameraBasePosition.z - camera.position.z) * 0.05;
      camera.lookAt(roomCenter);

      // imageReflectionContext.drawImage(image, 0, 0);
      // imageReflectionContext.fillStyle = imageReflectionGradient;
      // imageReflectionContext.fillRect(0, 0, 480, 204);

      renderer.render(scene, camera);
    }

    // 循环渲染-递归
    function animate() {
      render();

      //更新性能插件
      // stats.update();

      animationFrameId = requestAnimationFrame(animate);
    }

    function handleGoHome(e) {
      // console.log(e)
      if(e.code === 'Enter') goHome();
    }

    function goHome() {
      router.push('/home');
    }

    onMounted(() => {
      init();
      animate();
      document.body.addEventListener('keydown', handleGoHome)
    })

    onUnmounted(() => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", onWindowResize);
      document.removeEventListener("mousemove", onDocumentMouseMove, false);
      document.body.removeEventListener('keydown', handleGoHome);

      scene?.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            Object.values(material).forEach((value) => {
              if (value?.isTexture) value.dispose();
            });
            material.dispose();
          });
        }
      });

      renderer?.dispose();
      scene = null;
      renderer = null;
    })

    return {
      handleGoHome,
      goHome
    }
  }
}
</script>

<style scoped lang="less">
.welcome-page {
  position: relative;

  .enter-button {
    position: absolute;
    left: 50%;
    bottom: 48px;
    transform: translateX(-50%);
    min-width: 248px;
    height: 48px;
    border: 1px solid rgba(0, 102, 153, 0.28);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.58);
    color: #005b76;
    font-size: 17px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 18px 44px rgba(0, 102, 153, 0.18);
    backdrop-filter: blur(18px);
    transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  }

  .enter-button:hover {
    transform: translateX(-50%) translateY(-2px);
    border-color: rgba(0, 102, 153, 0.46);
    background: rgba(255, 255, 255, 0.76);
    box-shadow: 0 22px 54px rgba(0, 102, 153, 0.22);
  }

  .enter-button:focus-visible {
    outline: 3px solid rgba(0, 102, 153, 0.2);
    outline-offset: 4px;
  }
}
</style>
