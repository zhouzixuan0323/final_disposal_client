<template>
  <Loading v-if="!isLoadingEnd" text="正在生成 3D 地图..."></Loading>
  <div class="provinceRanking">
    <div class="provinceRanking-title">
      <h2>
        2021年全国各个省份垃圾产量3D地图展示
      </h2>
    </div>

    <div class="map-canvas-container">
      <canvas id="map-canvas" width="500" height="500"></canvas>
    </div>

    <div id="tooltip"></div>

    <div class="colorRanking">
      <div>
        <div class="color level1"></div>
        <span> >= 1400 </span>
      </div>
      <div>
        <div class="color level2"></div>
        <span> >= 1200 </span>
      </div>
      <div>
        <div class="color level3"></div>
        <span> >= 800 </span>
      </div>
      <div>
        <div class="color level4"></div>
        <span> >= 600 </span>
      </div>
      <div>
        <div class="color level5"></div>
        <span> >= 400 </span>
      </div>
      <div>
        <div class="color level6"></div>
        <span> >= 200 </span>
      </div>
      <div>
        <div class="color level7"></div>
        <span> &lt; 200 </span>
      </div>
      <div>
        单位：万吨
      </div>
      <div class="source">
        数据口径：2021年城市生活垃圾产生量
      </div>
    </div>

    <button class="reset-view" type="button" @click="resetMapView">重置视角</button>

    <div class="histogram-canvas-container">
      <canvas id="histogram-canvas" width="400" height="400"></canvas>
    </div>

    <RightButtonLink v-for="(item, index) in rightButtons" :key="index" :style="{top: index * 100 + 100 + 'px'}"
                     :class="[rightButtonActiveIndex === index ? 'active':'']"
                     @mouseenter="handleShowActiveClass(index)" @mouseleave="handleHideActiveClass" :to="item.path">
      {{ item.text }}
    </RightButtonLink>
  </div>
</template>

<script>
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TitleComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import * as THREE from "three";
// import {Geo} from 'three'
import { geoMercator } from "d3-geo";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { onMounted, onUnmounted, ref } from "vue";

import RightButtonLink from "../../components/RightButtonLink/index.vue";

import Loading from "../../components/Loading/index.vue";

echarts.use([BarChart, CanvasRenderer, GridComponent, TitleComponent]);

export default {
  name: "index",
  components:{
    RightButtonLink,
    Loading
  },
  setup() {
    let scene, camera, renderer;
    let controller;
    let raycaster, mouse, tooltip;
    let lastPick;
    let map;
    let animationFrameId;
    let mouseMoveHandler;
    let histogramChart;
    let rubbishRankMap = {};

    function init() {
      // 第一步新建一个场景
      scene = new THREE.Scene();
      setRenderer();
      setCamera();
      setController();
      setRaycaster();
      animate();
      loadMapData();
      setLight();
      // 监听浏览器可视区变化
      window.addEventListener("resize", onWindowResize);
    }

    // 加载地图数据
    function loadMapData() {
      const loader = new THREE.FileLoader();
      loader.load("json/china.json", (data) => {
        const jsondata = JSON.parse(data);
        generateGeometry(jsondata);
      });
    }

    let isLoadingEnd = ref(false);

    function generateGeometry(jsondata) {
      // 初始化一个地图对象
      map = new THREE.Object3D();
      rubbishRankMap = jsondata.features
          .filter((feature) => feature.properties?.name)
          .sort((a, b) => b.properties.rubbishData - a.properties.rubbishData)
          .reduce((rankMap, feature, index) => {
            rankMap[feature.properties.name] = index + 1;
            return rankMap;
          }, {});
      // 墨卡托投影转换
      const projection = geoMercator()
          .center([104.0, 37.5])
          .translate([0, 0]);

      jsondata.features.forEach((elem) => {
        // 定一个省份3D对象
        const province = new THREE.Object3D();
        // 每个的 坐标 数组
        const coordinates = elem.geometry.coordinates;
        // 循环坐标数组
        coordinates.forEach((multiPolygon) => {
          multiPolygon.forEach((polygon) => {
            const shape = new THREE.Shape();
            const lineMaterial = new THREE.LineBasicMaterial({
              color: "white",
            });
            const lineGeometry = new THREE.BufferGeometry()
            const pointsArray = new Array()

            for (let i = 0; i < polygon.length; i++) {
              const [x, y] = projection(polygon[i]);
              if (i === 0) {
                shape.moveTo(x, -y);
              }
              shape.lineTo(x, -y);
              pointsArray.push(new THREE.Vector3(x, -y, 5));
            }
            lineGeometry.setFromPoints(pointsArray)

            const extrudeSettings = {
              depth: 10,
              bevelEnabled: false,
            };

            const geometry = new THREE.ExtrudeGeometry(
                shape,
                extrudeSettings
            );

            let tempColor;

            if (elem.properties.rubbishData >= 1400) {
              tempColor = 0xa50026;
            } else if (elem.properties.rubbishData >= 1200) {
              tempColor = 0xfdb76a;
            } else if (elem.properties.rubbishData >= 800) {
              tempColor = 0xfffebe;
            } else if (elem.properties.rubbishData >= 600) {
              tempColor = 0xb9e0ed;
            } else if (elem.properties.rubbishData >= 400) {
              tempColor = 0x77afd2;
            } else if (elem.properties.rubbishData >= 200) {
              tempColor = 0x37489e;
            } else {
              tempColor = 0x323a97;
            }

            const material = new THREE.MeshBasicMaterial({
              color: tempColor,
              transparent: true,
              opacity: 0.6,
            });
            const material1 = new THREE.MeshBasicMaterial({
              color: "#3480C4",
              transparent: true,
              opacity: 0.5,
            });

            const mesh = new THREE.Mesh(geometry, [material, material1]);
            const line = new THREE.Line(lineGeometry, lineMaterial);
            // 将省份的属性 加进来
            province.properties = elem.properties;
            // console.log(province);
            province.add(mesh);
            province.add(line);
          });
        });
        map.add(province);
      });
      scene.add(map);
      isLoadingEnd.value = true;
    }

    function setController() {
      controller = new OrbitControls(
          camera,
          document.getElementById("map-canvas")
      );
    }

    // 设置渲染器
    function setRenderer() {
      renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById("map-canvas"),
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      // 设置画布的大小
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // 设置环境光
    function setLight() {
      let ambientLight = new THREE.AmbientLight(0x191970, 20); // 环境光
      scene.add(ambientLight);
    }

    function render() {
      renderer.render(scene, camera);
    }

    // 新建透视相机
    function setCamera() {
      // 第二参数就是 长度和宽度比 默认采用浏览器  返回以像素为单位的窗口的内部宽度和高度
      camera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
      );
      camera.position.set(0, 0, 120);
      camera.lookAt(scene.position);
    }

    function setRaycaster() {
      raycaster = new THREE.Raycaster();
      mouse = new THREE.Vector2();
      tooltip = document.getElementById("tooltip");
      mouseMoveHandler = (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        tooltip.style.left = event.clientX + 2 + "px";
        tooltip.style.top = event.clientY + 2 + "px";
      };

      window.addEventListener("mousemove", mouseMoveHandler, false);
    }

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      // 通过摄像机和鼠标位置更新射线
      raycaster.setFromCamera(mouse, camera);
      // 算出射线 与当场景相交的对象有那些
      const intersects = raycaster.intersectObjects(
          scene.children,
          true
      );
      // 恢复上一次清空的
      if (lastPick) {
        // this.lastPick.object.material[0].color.set("#2defff");
        // this.lastPick.object.material[1].color.set("#3480C4");
      }
      lastPick = null;
      lastPick = intersects.find(
          (item) => item.object.material && item.object.material.length === 2
      );
      if (lastPick) {
        // this.lastPick.object.material[0].color.set(0xff0000);
        // this.lastPick.object.material[1].color.set(0xffffff);
      }
      showTip();
      render();
    }

    function showTip() {
      // 显示省份的信息
      if (lastPick && lastPick.object.parent.properties.name !== '') {
        const properties = lastPick.object.parent.properties;

        tooltip.textContent = `${properties.name}\n产量：${properties.rubbishData}万吨\n全国排名：第${rubbishRankMap[properties.name] || "--"}名`;

        tooltip.style.visibility = "visible";
      } else {
        tooltip.style.visibility = "hidden";
      }
    }

    function resetMapView() {
      camera.position.set(0, 0, 120);
      camera.lookAt(scene.position);
      controller?.target.set(0, 0, 0);
      controller?.update();
    }

    //窗口变动触发的函数
    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      histogramChart?.resize();
    }

    function histogramInit() {
      let chartDom = document.getElementById('histogram-canvas');
      histogramChart = echarts.init(chartDom);
      let option;

      option = {
        title: {
          text: '2021年城市生活垃圾主产生量排名前十的省份',
          left:"center",
          textStyle:{
            color:"#fff"
          }

        },
        xAxis: {
          type: 'category',
          data: ['广东', '江苏', '浙江', '四川', '河南', '山东', '北京','上海', '辽宁', '湖南']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: [
              {
                value: 1900,
                itemStyle: {
                  color: '#a90000'
                }
              },
              {
                value: 1600,
                itemStyle: {
                  color: '#a90000'
                }
              },
              {
                value: 1550,
                itemStyle: {
                  color: '#a90000'
                }
              },
              {
                value: 1190,
                itemStyle: {
                  color: '#fffebe'
                }
              },
              {
                value: 1050,
                itemStyle: {
                  color: '#fffebe'
                }
              },
              {
                value: 1000,
                itemStyle: {
                  color: '#fffebe'
                }
              },
              {
                value: 790.3,
                itemStyle: {
                  color: '#b9e0ed'
                }
              },
              {
                value: 789.9,
                itemStyle: {
                  color: '#b9e0ed'
                }
              },
              {
                value: 780,
                itemStyle: {
                  color: '#b9e0ed'
                }
              },
              {
                value: 700,
                itemStyle: {
                  color: '#b9e0ed'
                }
              },
            ],
            type: 'bar'
          }
        ]
      };

      option && histogramChart.setOption(option);
    }

    let rightButtonActiveIndex = ref();

    let rightButtons = [
      {
        text: '首页',
        path: "/home"
      },
      {
        text: '垃圾分类小课堂',
        path: "/rubbishClass"
      },
      {
        text: '垃圾分类考试',
        path: "/examination"
      }
    ]

    function handleShowActiveClass(index) {
      rightButtonActiveIndex.value = index;
    }

    function handleHideActiveClass() {
      rightButtonActiveIndex.value = null;
    }

    onMounted(() => {
      init();
      histogramInit();
    })

    onUnmounted(() => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", onWindowResize);
      if (mouseMoveHandler) window.removeEventListener("mousemove", mouseMoveHandler, false);

      controller?.dispose();
      histogramChart?.dispose();

      scene?.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });

      renderer?.dispose();
      scene = null;
      renderer = null;
    })

    return {
      handleShowActiveClass,
      handleHideActiveClass,
      rightButtons,
      rightButtonActiveIndex,
      isLoadingEnd,
      resetMapView
    };
  }
}
</script>

<style scoped lang="less">
.provinceRanking {
  height: 100vh;
  overflow: hidden;

  .provinceRanking-title {
    position: absolute;
    left: 50%;
    top: 0;
    transform: translate(-50%, 0);
    user-select: none;
    padding: 10px 0;
  }

  .provinceRanking-title h2 {
    color: #fff;
    font-size: 25px;
  }

  .map-canvas-container {
    //height: 929px;
    height: 100%;
    overflow: hidden;
  }

  #tooltip {
    position: fixed;
    z-index: 2;
    background: white;
    padding: 10px;
    border-radius: 2px;
    visibility: hidden;
    user-select: none;
    white-space: pre-line;
    line-height: 20px;
  }

  .colorRanking {
    position: absolute;
    right: 0;
    bottom: 32px;
    color: #fff;
    padding: 10px 20px;
    user-select: none;
    line-height: 25px;
    background: rgba(0, 0, 0, 0.28);
    border-radius: 8px 0 0 8px;

    .color {
      display: inline-block;
      width: 30px;
      height: 20px;
      border-radius: 5px;
      line-height: 20px;
    }

    .level1 {
      background-color: #a50026;
    }

    .level2 {
      background-color: #fdb76a;
    }

    .level3 {
      background-color: #fffebe;
    }

    .level4 {
      background-color: #b9e0ed;
    }

    .level5 {
      background-color: #77afd2;
    }

    .level6 {
      background-color: #3d5ca8;
    }

    .level7 {
      background-color: #323a97;
    }

    .source {
      margin-top: 8px;
      max-width: 180px;
      color: rgba(255, 255, 255, 0.82);
      font-size: 13px;
      line-height: 18px;
    }
  }

  .histogram-canvas-container {
    position: absolute;
    left: 0;
    top: 0;
  }

  .reset-view {
    position: absolute;
    left: 24px;
    bottom: 28px;
    height: 40px;
    padding: 0 18px;
    border: 1px solid rgba(255, 255, 255, 0.72);
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.9);
    color: #006699;
    cursor: pointer;
  }
}
</style>
