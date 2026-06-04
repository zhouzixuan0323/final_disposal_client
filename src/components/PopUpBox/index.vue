<template>
  <div class="pop-up">
    <div class="close" @click="handleHidePopUpBox">×</div>
    <div class="info-title">
      垃圾基本信息
    </div>
    <div class="info">

      <div class="rubbish-name">
        <span class="introduce-text">名称：</span>{{ rubbishTypeData?.rname }}
      </div>
      <div class="rubbish-type">
        <span class="introduce-text">种类：</span><span class="type"
                                                     :style="{backgroundColor:rubbishTypeData?.color}">{{ rubbishTypeData?.cname }}</span>
      </div>
      <div class="introduce">
        <span class="introduce-text">简介：</span>{{ rubbishTypeData?.introduce }}
      </div>
    </div>

    <div class="roll-title">
      垃圾回收后的处理方法
    </div>

    <div class="roll">
      <div id="roll-canvas-container" v-show="isCanvasVisible">
        <canvas id="roll-canvas" width="300" height="300"></canvas>
      </div>

      <div id="tags" class="tags">
        <ul>
          <li v-for="method in processMethods" :key="method">
            <a href="#" @click.prevent>{{ method }}</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import {nextTick, onMounted, onUnmounted, ref} from "vue";
import {getRubbishType} from "../../api/rubbishDetailApi";

const DEFAULT_PROCESS_METHODS = ["填埋法", "焚烧法", "特殊处理法", "堆肥法"];

const PROCESS_METHODS = {
  "干垃圾": ["卫生填埋法", "卫生分解法", "生物解决法", "焚烧法"],
  "湿垃圾": ["微生物发酵制肥法", "微生物分解法", "物理粉碎法"],
  "可回收垃圾": ["垃圾再生法", "焚烧发电法", "堆肥法", "生物降解法"],
  "有害垃圾": DEFAULT_PROCESS_METHODS,
};

export default {
  name: "index",
  props: {
    handleHidePopUpBox: {
      type: Function,
    },
    currentType: {
      type: String,
    },
    rubbishId: {
      type: Number,
    }
  },
  setup(props, {emit}) {
    function handleHidePopUpBox() {
      emit('handleHidePopUpBox');
    }

    let isCanvasVisible = ref(true);
    const processMethods = PROCESS_METHODS[props.currentType] || DEFAULT_PROCESS_METHODS;

    let {rubbishTypeData} = getRubbishData(props);

    function init() {
      try {
        window.TagCanvas.Start('roll-canvas', 'tags', {
          shape: "sphere",
          dragControl: false, // 取消点击才能移动
          reverse: true, // 反方向移动
          wheelZoom: false, // 不允许缩小云
          outlineMethod: 'none',
          textFont: 'Impact,"Arial Black",sans-serif',
          textColour: '#000',
          decel: 0.95,
          textHeight: 30,
          // minSpeed: 0.01,
          initial: [
            0.1 * Math.random() + 0.01,
            -(0.1 * Math.random() + 0.01),
          ],
        });
      } catch (e) {
        isCanvasVisible.value = false;
      }
    }

    onMounted(async () => {
      await nextTick(() => {
        init();
      });
    })

    onUnmounted(() => {
      window.TagCanvas?.Delete?.('roll-canvas');
    })

    return {
      handleHidePopUpBox,
      rubbishTypeData,
      processMethods,
      isCanvasVisible
    }
  }
}

function getRubbishData(props) {
  let rubbishTypeData = ref();

  function getData() {
    getRubbishType(props.rubbishId).then(({data}) => {
      rubbishTypeData.value = data.rubbishType;
    })
  }

  getData();

  return {
    rubbishTypeData,
    getData
  }
}
</script>

<style scoped lang="less">
.pop-up {
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 1200px;
  height: 500px;
  background-color: #fff;
  overflow: hidden;
  border: 2px solid #000;

  .close {
    position: absolute;
    right: 10px;
    top: 10px;
    width: 50px;
    height: 50px;
    //background-color: aqua;
    text-align: center;
    line-height: 45px;
    font-size: 40px;
    //border: 2px solid yellow;
    border-radius: 50%;
    cursor: pointer;
    user-select: none;
    color: #000;
  }

  .close:hover {
    color: red;
  }

  .info-title {
    position: fixed;
    left: 130px;
    top: 60px;
    color: #000;
    font-size: 26px;
    font-weight: bolder;
  }

  .info {
    width: 400px;
    height: 300px;
    //background-color: #999;
    color: #000;
    border: 1px solid #000;
    border-radius: 15px;
    padding-left: 20px;
    padding-top: 20px;
    box-sizing: border-box;


    & div {
      margin-bottom: 20px;
    }

    .rubbish-name {
      font-size: 24px;
      font-weight: bolder;
    }

    .rubbish-type {

      .type {
        display: inline-block;
        padding: 5px 20px;
        border-radius: 20px;
        font-size: 20px;
        color: #fff;
        /*font-weight: bolder;*/
      }
    }
  }

  .roll-title {
    position: fixed;
    right: 160px;
    top: 60px;
    color: #000;
    font-size: 26px;
    font-weight: bolder;
  }

  .roll {
    width: 300px;
    height: 300px;
    /*background-color: green;*/
  }

  .tags {
    display: none;
  }

  .introduce {
    /*text-indent: 2em;*/
    line-height: 24px;
  }

  .introduce-text {
    font-size: 20px;
    font-weight: bolder;
  }
}
</style>
