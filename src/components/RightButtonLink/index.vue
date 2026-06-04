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
  right: 28px;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 188px;
  height: 46px;
  padding: 0 18px;
  border: 1px solid rgba(8, 31, 27, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 16px 45px rgba(8, 31, 27, 0.16);
  backdrop-filter: blur(18px);
  transition: transform 0.25s ease, background-color 0.25s ease, border-color 0.25s ease;
  overflow: hidden;

  & a {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0;
    text-decoration: none;
    text-align: center;
    color: #263b36;
    user-select: none;
    border: none;
  }
}

.right-button-link:hover,
.right-button-link.active {
  transform: translateX(-8px);
  background: rgba(255, 255, 255, 0.96);
  border-color: rgba(31, 182, 146, 0.32);
}
.right-button-link.current {
  background: linear-gradient(135deg, rgba(115, 224, 193, 0.98), rgba(125, 183, 255, 0.96));
  border-color: transparent;
  box-shadow: 0 18px 50px rgba(31, 182, 146, 0.28);

  a {
    color: #061512;
  }
}

@media (max-width: 768px) {
  .right-button-link {
    right: 14px;
    min-width: 0;
    width: 54px;
    height: 54px;
    padding: 0;
    border-radius: 50%;

    a {
      padding: 0 8px;
      font-size: 11px;
      line-height: 14px;
    }
  }

  .right-button-link:hover,
  .right-button-link.active {
    transform: none;
  }
}
</style>
