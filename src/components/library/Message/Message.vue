<template>
  <Transition name="down" mode="out-in">
    <div class="message" :style="style[currentMessage]" v-if="isShow">
      <span class="text">{{text}}</span>
    </div>
  </Transition>
</template>
<script lang="ts">
import {defineComponent, onMounted, ref} from "vue";

export default defineComponent({
  name: "Message",
  props:{
    type:{
      type:String,
      default: 'success'
    },
    text:{
      type:String,
      default: ''
    }
  },
  setup(props) {
    const style = {
      // 警告类型的提示
      warn: {
        color: "#6b4d11",
        backgroundColor: "rgba(255, 246, 219, 0.96)",
        borderColor: "rgba(238, 190, 91, 0.45)",
      },
      // 错误类型的提示
      error: {
        color: "#7b2323",
        backgroundColor: "rgba(255, 238, 238, 0.96)",
        borderColor: "rgba(239, 107, 107, 0.35)",
      },
      // 成功类型的提示
      success: {
        color: "#0d5c48",
        backgroundColor: "rgba(230, 251, 244, 0.96)",
        borderColor: "rgba(31, 182, 146, 0.35)",
      },
    };

    const currentMessage = props.type;

    // 是否显示组件
    const isShow = ref(false);

    // 定时器变量
    let timer: any = null;

    // 每次开启定时器前，先清除定时器
    clearTimeout(timer);
    // 开启定时器
    timer = setTimeout(() => {
      isShow.value = false;
    }, 3000)

    // 当组件挂在完成后显示组件
    onMounted(() => {
      isShow.value = true;
    })

    return { style, currentMessage, isShow };
  },
});
</script>
<style scoped lang="less">
.message {
  min-width: 260px;
  max-width: min(420px, calc(100vw - 40px));
  min-height: 48px;
  position: fixed;
  z-index: 9999;
  left: 50%;
  transform: translateX(-50%);
  top: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 22px;
  padding: 12px 22px;
  border: 1px solid #e4e4e4;
  border-radius: 999px;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(16px);
  font-weight: 650;
  text-align: center;

  .text {
    vertical-align: middle;
  }
}

.down {
  &-enter {
    &-from {
      transform: translate3d(-50%, -75px, 0);
      opacity: 0;
    }
    &-active {
      transition: all 0.5s;
    }
    &-to {
      transform: translateX(-50%);
      opacity: 1;
    }
  }
}

.down {
  &-leave {
    &-from {
      transform: translateX(-50%);
      opacity: 1;
    }
    &-active {
      transition: all 0.5s;
    }
    &-to {
      transform: translate3d(-50%, -75px, 0);
      opacity: 0;
    }
  }
}
</style>
