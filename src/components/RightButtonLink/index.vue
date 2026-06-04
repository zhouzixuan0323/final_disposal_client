<template>
  <div class="right-button-link" :class="{current: isCurrent}">
    <RouterLink :to="`${to}`">
      <slot></slot>
    </RouterLink>
  </div>
</template>

<script>
import {computed} from "vue";
import {useRoute} from "vue-router";

export default {
  name: "index",
  props: {
    active: {
      type: Boolean,
      default: false,
    },
    to: {
      type: String
    }
  },
  setup(props) {
    const route = useRoute();
    const isCurrent = computed(() => route.path === props.to);

    return {
      isCurrent
    }
  }
}
</script>

<style scoped lang="less">
.right-button-link {
  position: fixed;
  right: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 220px;
  padding: 5px 10px;
  height: 50px;
  background-color: #fff;
  border: 2px solid #000;
  border-bottom-left-radius: 50px;
  border-top-left-radius: 50px;
  transition: all 0.3s;
  margin-right: -150px;
  margin-bottom: 20px;

  & a {
    font-size: 20px;
    text-decoration: none;
    text-align: center;
    color: #006699;
    user-select: none;
    border: none;
  }
}
.right-button-link.active {
  margin-right: 0;
}
.right-button-link.current {
  margin-right: 0;
  background-color: #006699;
  border-color: #006699;

  a {
    color: #fff;
  }
}

@media (max-width: 768px) {
  .right-button-link {
    right: 12px;
    width: 48px;
    height: 48px;
    padding: 0;
    margin-right: 0;
    border-radius: 50%;
    overflow: hidden;

    a {
      display: flex;
      width: 100%;
      height: 100%;
      align-items: center;
      justify-content: center;
      padding: 0 8px;
      box-sizing: border-box;
      font-size: 12px;
      line-height: 16px;
    }
  }
}
</style>
