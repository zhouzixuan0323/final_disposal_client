<template>
  <div class="loader-page">
    <div class="loader-ring"></div>
    <div class="loader-text">{{ text }}</div>
  </div>
</template>

<script>
export default {
  name: "Loading",
  props: {
    text: {
      type: String,
      default: "正在加载资源..."
    }
  }
}
</script>

<style scoped lang="less">
.loader-page {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 22px;
  align-items: center;
  justify-content: center;
  background:
      radial-gradient(circle at 50% 42%, rgba(115, 224, 193, 0.18), transparent 32%),
      rgba(7, 19, 17, 0.92);
  backdrop-filter: blur(18px);
}

.loader-ring {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-top-color: var(--app-accent);
  box-shadow: 0 0 40px rgba(115, 224, 193, 0.22);
  animation: spin 1s linear infinite;
}

.loader-text {
  color: rgba(244, 251, 248, 0.82);
  font-size: 15px;
  letter-spacing: 0;
  text-align: center;
  user-select: none;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
