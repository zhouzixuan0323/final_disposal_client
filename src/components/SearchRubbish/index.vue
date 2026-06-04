<template>
  <div class="search-rubbish">
    <div class="search-box">
      <input type="text" placeholder="输入垃圾名称，如纸巾、电池、苹果核" v-model.trim="keyword" @keydown.enter="searchRubbish">
      <button class="leave-for" type="button" @click="searchRubbish">搜索</button>
    </div>
    <div class="quick-search">
      <button v-for="item in quickKeywords" :key="item" type="button" @click="searchRubbish(item)">{{ item }}</button>
    </div>
  </div>
</template>

<script>
import {ref} from "vue";
import {Message} from "../../components/library/Message";

export default {
  name: "index",
  props: {
    openDetailBox: {
      type: Function
    }
  },
  setup(props, {emit}) {
    let keyword = ref("");
    const quickKeywords = ["纸巾", "电池", "苹果核", "快递盒"];

    function searchRubbish(value) {
      const searchText = typeof value === "string" ? value : keyword.value;

      if (!searchText) {
        Message({type: "warn", text: "请输入垃圾名称"});
        return;
      }

      emit('openDetailBox', searchText)
      keyword.value = searchText;
    }

    return {
      keyword,
      quickKeywords,
      searchRubbish,
    }
  }
}
</script>

<style scoped lang="less">
.search-rubbish {
  position: relative;
  user-select: none;
  width: min(520px, calc(100vw - 40px));
  color: var(--app-text-inverse);

  .search-box {
    position: relative;
    display: flex;
    height: 58px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 999px;
    background: rgba(8, 21, 18, 0.66);
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.26);
    backdrop-filter: blur(20px);
  }

  .search-box:before {
    content: "";
    position: absolute;
    left: 20px;
    top: 50%;
    width: 16px;
    height: 16px;
    transform: translateY(-50%);
    border: 2px solid rgba(244, 251, 248, 0.62);
    border-radius: 50%;
  }

  .search-box:after {
    content: "";
    position: absolute;
    left: 34px;
    top: 34px;
    width: 8px;
    height: 2px;
    transform: rotate(45deg);
    border-radius: 2px;
    background: rgba(244, 251, 248, 0.62);
  }

  input {
    width: 100%;
    height: 100%;
    font-size: 16px;
    border-radius: 999px;
    padding: 0 112px 0 54px;
    background-color: transparent;
    color: var(--app-text-inverse);
    border: 0;
    outline: none;
  }

  input::placeholder {
    color: rgba(244, 251, 248, 0.55);
  }

  .leave-for {
    position: absolute;
    right: 7px;
    top: 7px;
    width: 88px;
    height: 44px;
    cursor: pointer;
    text-align: center;
    border-radius: 999px;
    border: 0;
    background: linear-gradient(135deg, var(--app-accent), var(--app-accent-blue));
    color: #061512;
    font-weight: 700;
    box-shadow: 0 12px 30px rgba(115, 224, 193, 0.28);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .leave-for:hover {
    transform: translateY(-1px);
    box-shadow: 0 16px 36px rgba(115, 224, 193, 0.34);
  }

  .quick-search {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
    padding-left: 8px;

    button {
      height: 32px;
      padding: 0 14px;
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
      color: rgba(244, 251, 248, 0.82);
      cursor: pointer;
      backdrop-filter: blur(12px);
      transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
    }

    button:hover {
      transform: translateY(-1px);
      background: rgba(255, 255, 255, 0.16);
      color: #fff;
    }
  }
}

@media (max-width: 768px) {
  .search-rubbish {
    width: calc(100vw - 28px);

    input {
      font-size: 14px;
      padding-right: 98px;
    }
  }
}
</style>
