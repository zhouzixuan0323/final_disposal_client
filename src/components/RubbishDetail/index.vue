<template>
  <div class="rubbish-detail-box" >
    <div class="title" :style="{backgroundColor:currentType!=='搜索'?rubbishData?.color : 'black'}">
      <h2>{{ currentType === "搜索" ? `${currentType} ${rubbishName} 的结果` : currentType}} <span class="close-btn" @click="closeDetailBox">×</span></h2>
    </div>

    <div v-if="currentType !== '搜索'" class="rubbish-introduce" :style="{backgroundColor:rubbishData?.color}">
      <div>{{rubbishData?.introduce}}</div>
      <div>
        <div><strong>投放要求:</strong></div>
        <ul>
          <li v-for="(item,index) in rubbishData?.ask" :key="index">{{item}}</li>
        </ul>
      </div>
    </div>

    <div class="detail-scroll">
      <ul class="rubbish-list">
        <li @click="handleShowPopUpBox(rubbishItem.rid)" class="item" v-for="rubbishItem in rubbishData?.items" :key="rubbishItem.rid">{{ rubbishItem.rname }}</li>
      </ul>

      <div class="empty-result" v-if="isFinished && rubbishData?.items?.length === 0">
        没有找到相关垃圾，试试纸巾、电池、苹果核这类关键词
      </div>

      <InfiniteLoading @infinite="loadMore" :isLoading="isLoading" :isFinished="isFinished"></InfiniteLoading>
    </div>

    <Transition name="pop-up-box">
      <div class="pop-up-box" v-if="showPopUpBox && rubbishId" @click.self="handleHidePopUpBox">
        <PopUpBox @handleHidePopUpBox="handleHidePopUpBox" :currentType="currentType" :rubbishId="rubbishId"></PopUpBox>
      </div>
    </Transition>

  </div>
</template>

<script>
import {ref, watch} from "vue";
import {getRubbishDetailData, getSearchData} from "../../api/rubbishDetailApi";

import InfiniteLoading from "../../components/InfiniteLoading/index.vue"
import PopUpBox from "../../components/PopUpBox/index.vue"
import {Message} from "../../components/library/Message";


export default {
  name: "RubbishDetail",
  props: {
    currentType: {
      type: String,
      default: ""
    },
    closeDetailBox: {
      type: Function
    },
    rubbishName:{
      type: String
    }
  },
  components: {
    InfiniteLoading,
    PopUpBox,
  },
  setup(props, {emit}) {

    // 控制弹出框显示隐藏
    let showPopUpBox = ref(false)

    let rubbishId = ref()
    function handleShowPopUpBox(id) {
      showPopUpBox.value = true;

      rubbishId.value = id;
    }

    function handleHidePopUpBox() {
      showPopUpBox.value = false;
    }

    // 解构出变量和方法
    const {rubbishData, isLoading, isFinished, loadMore} = useGetRubbishData(props);


    // 关闭弹出框
    function closeDetailBox() {
      showPopUpBox.value = false;
      emit('closeDetailBox')
    }

    return {
      rubbishData,
      closeDetailBox,
      isLoading,
      isFinished,
      loadMore,
      showPopUpBox,
      handleShowPopUpBox,
      handleHidePopUpBox,
      rubbishId,
    }
  }
}

// 用来获取垃圾详情数据的hook
function useGetRubbishData(props) {
  const isLoading = ref(false);

  const isFinished = ref(false);
  // 存储垃圾详情数据
  let rubbishData = ref();

  // 整合参数
  let reqParams = ref({
    rubbishType: props.currentType,
    page: 0,
    pageSize: 100
  })

  // 获取数据的方法
  function getData(reqParams) {
    isLoading.value = true;
    if (props.currentType === '搜索') {
      getSearchData({
        page: reqParams.page,
        pageSize: reqParams.pageSize,
        rubbishName: props.rubbishName
      }).then(({data}) => {
        isLoading.value = false;

        if(reqParams.page === 0) {
          if (data.items.length < 1) isFinished.value = true;
          // if (data.items)
          rubbishData.value = data
          rubbishData.value.items = [...data.items]
        } else {
          rubbishData.value.items = [...rubbishData.value.items,...data?.items];
        }

        if(reqParams.page >= data.pages - 1) {
          isFinished.value = true;
        }
      }).catch(() => {
        isLoading.value = false;
        isFinished.value = true;
        Message({type: "error", text: "搜索数据加载失败"});
      })

      return ;
    }
    // 获取垃圾详情数据 如果不是搜索的情况下
     getRubbishDetailData(reqParams).then(({data}) => {
      isLoading.value = false;

        if(reqParams.page === 0) {
          // console.log(data)
          rubbishData.value = data
          rubbishData.value.items = [...data.items]
        } else {
          rubbishData.value.items = [...rubbishData.value.items,...data?.items];
        }

        if(reqParams.page >= data.pages - 1) {
          isFinished.value = true;
        }

    }).catch(() => {
      isLoading.value = false;
      isFinished.value = true;
      Message({type: "error", text: "垃圾详情加载失败"});
    })

    // 如果是搜索的情况下
  }

  // 调用获取数据的方法
  // getData(reqParams.value);

  watch(() => reqParams.value,
      () => getData(reqParams.value))
    getData(reqParams.value)

  function loadMore() {
    reqParams.value = {...reqParams.value, page: reqParams.value.page + 1}
  }

  return {
    rubbishData,
    isLoading,
    isFinished,
    loadMore
  }
}
</script>

<style scoped lang="less">
.rubbish-detail-box {
  width: 100%;
  height: min(820px, calc(100vh - 64px));
  max-width: 1180px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  color: var(--app-text);
  border: 1px solid rgba(255, 255, 255, 0.62);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: var(--app-shadow);
  overflow: hidden;
  backdrop-filter: blur(24px);

  .title {
    position: sticky;
    top: 0;
    left: 0;
    z-index: 20;
    min-height: 78px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid rgba(8, 31, 27, 0.08);
    background: rgba(255, 255, 255, 0.82) !important;
    backdrop-filter: blur(18px);
    text-align: center;
    padding: 0 72px;

    h2 {
      color: var(--app-text);
      font-size: 26px;
      font-weight: 750;
      letter-spacing: 0;
    }

    .close-btn {
      position: absolute;
      right: 22px;
      top: 50%;
      width: 42px;
      height: 42px;
      transform: translateY(-50%);
      border-radius: 50%;
      background: #f3f6f4;
      color: #6c7d78;
      font-size: 32px;
      line-height: 38px;
      cursor: pointer;
      user-select: none;
      transition: background-color 0.2s ease, color 0.2s ease;
    }

    .close-btn:hover {
      background: #feecec;
      color: var(--app-danger);
    }
  }

  .rubbish-introduce {
    flex: 0 0 auto;
    margin: 28px auto 10px;
    width: calc(100% - 56px);
    padding: 24px 28px;
    border: 1px solid rgba(8, 31, 27, 0.08);
    border-radius: 20px;
    background: linear-gradient(135deg, rgba(31, 182, 146, 0.12), rgba(125, 183, 255, 0.12)) !important;
    color: var(--app-text);
    font-size: 16px;
    line-height: 28px;

    strong {
      font-weight: 750;
    }

    ul {
      margin-top: 10px;
      display: grid;
      gap: 8px;
    }

    li {
      position: relative;
      padding-left: 18px;
      color: var(--app-text-soft);
    }

    li:before {
      content: "";
      position: absolute;
      left: 0;
      top: 12px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--app-accent-strong);
    }
  }

  .detail-scroll {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding-bottom: 12px;
  }

  .detail-scroll::-webkit-scrollbar {
    width: 10px;
  }

  .detail-scroll::-webkit-scrollbar-thumb {
    border: 3px solid transparent;
    border-radius: 999px;
    background: rgba(8, 31, 27, 0.24);
    background-clip: content-box;
  }

  .pop-up-box {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index:1000;
    background: rgba(5, 12, 11, 0.52);
    backdrop-filter: blur(14px);
  }

  .rubbish-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 14px;
    padding: 28px;

    .item {
      display: flex;
      min-height: 58px;
      border-radius: 16px;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--app-text);
      border: 1px solid rgba(8, 31, 27, 0.1);
      background: #f8faf9;
      font-size: 15px;
      font-weight: 650;
      text-align: center;
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
    }

    .item:hover {
      transform: translateY(-2px);
      border-color: rgba(31, 182, 146, 0.36);
      background: #ffffff;
      box-shadow: 0 16px 38px rgba(8, 31, 27, 0.1);
      color: var(--app-accent-strong);
    }
  }

  .empty-result {
    margin: 80px auto 0;
    width: min(680px, calc(100% - 40px));
    padding: 24px;
    border: 1px dashed rgba(8, 31, 27, 0.22);
    border-radius: 18px;
    color: var(--app-text-soft);
    text-align: center;
    line-height: 24px;
    background-color: #f7f7f7;
  }

  /* info弹出框 */
  .pop-up-box-enter-active,
  .pop-up-box-leave-active{
    transition: all .3s ease;
  }

  .pop-up-box-enter-from{
    opacity: 0;
  }

  .pop-up-box-enter-to{
    opacity: 1;
  }

  .pop-up-box-leave-from{
    opacity: 1;
  }

  .pop-up-box-leave-to{
    opacity: 0;
  }
}

@media (max-width: 768px) {
  .rubbish-detail-box {
    height: calc(100vh - 28px);
    border-radius: 22px;

    .title {
      min-height: 68px;
      padding: 0 62px 0 18px;

      h2 {
        font-size: 20px;
      }
    }

    .rubbish-introduce {
      width: calc(100% - 28px);
      margin-top: 16px;
      padding: 18px;
    }

    .rubbish-list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      padding: 14px;
    }
  }
}
</style>
