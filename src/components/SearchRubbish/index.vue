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
  color: #fff;

  .search-box {
    position: relative;
    display: flex;
    height: 44px;
  }

  input {
    width: 300px;
    height: 40px;
    font-size: 16px;
    border-radius: 10px;
    padding-left: 10px;
    padding-right: 64px;
    background-color: rgba(0, 0, 0, 0.25);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.7);
    outline: none;
  }

  input::placeholder {
    color: rgba(255, 255, 255, 0.76);
  }

  .leave-for {
    position: absolute;
    right: 0;
    top: 0;
    width: 58px;
    height: 44px;
    cursor: pointer;
    text-align: center;
    border-radius: 10px;
    border: 0;
    background-color: #ffffff;
    color: #006699;
  }

  .quick-search {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;

    button {
      height: 28px;
      padding: 0 10px;
      border: 1px solid rgba(255, 255, 255, 0.72);
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
      cursor: pointer;
    }
  }
}

@media (max-width: 768px) {
  .search-rubbish {
    width: calc(100vw - 32px);

    input {
      width: 100%;
      box-sizing: border-box;
    }
  }
}
</style>
