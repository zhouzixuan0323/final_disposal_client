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
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 32px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: min(1080px, calc(100vw - 48px));
  min-height: 520px;
  padding: 72px 48px 44px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 30px 100px rgba(0, 0, 0, 0.32);
  overflow: hidden;
  color: var(--app-text);

  .close {
    position: absolute;
    right: 24px;
    top: 22px;
    width: 42px;
    height: 42px;
    text-align: center;
    line-height: 38px;
    font-size: 30px;
    border-radius: 50%;
    background: #f4f7f5;
    cursor: pointer;
    user-select: none;
    color: #73837e;
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  .close:hover {
    background: #feecec;
    color: var(--app-danger);
  }

  .info-title {
    position: absolute;
    left: 48px;
    top: 34px;
    color: var(--app-text);
    font-size: 24px;
    font-weight: 800;
  }

  .info {
    min-height: 320px;
    color: var(--app-text);
    border: 1px solid var(--app-border-dark);
    border-radius: 22px;
    padding: 28px;
    background: linear-gradient(135deg, #ffffff, #f5faf7);


    & div {
      margin-bottom: 22px;
    }

    .rubbish-name {
      font-size: 28px;
      font-weight: 800;
    }

    .rubbish-type {

      .type {
        display: inline-block;
        padding: 7px 16px;
        border-radius: 999px;
        font-size: 15px;
        font-weight: 700;
        color: #fff;
      }
    }
  }

  .roll-title {
    position: absolute;
    right: 120px;
    top: 34px;
    color: var(--app-text);
    font-size: 24px;
    font-weight: 800;
  }

  .roll {
    width: 300px;
    height: 300px;
    align-self: center;
    justify-self: center;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(115, 224, 193, 0.18), rgba(125, 183, 255, 0.08) 55%, transparent 70%);
  }

  .tags {
    display: none;
  }

  .introduce {
    line-height: 26px;
    color: var(--app-text-soft);
  }

  .introduce-text {
    font-size: 15px;
    font-weight: 800;
    color: var(--app-text);
  }
}

@media (max-width: 860px) {
  .pop-up {
    grid-template-columns: 1fr;
    width: calc(100vw - 28px);
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    padding: 72px 22px 28px;

    .info-title,
    .roll-title {
      position: static;
      margin-bottom: 16px;
    }

    .roll-title {
      margin-top: 10px;
    }
  }
}
</style>
