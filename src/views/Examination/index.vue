<template>
  <div class="examination">

    <div class="examination-container">
      <div class="examination-title">
        <h1>考试</h1>
      </div>
      <!--   开始按钮   -->
      <div class="start" @click="handleStartingToWork" v-if="!isStartingWork">
        开始答题
      </div>

      <!--   题目   -->
      <div class="question" v-else-if="questionList && isStartingWork">
        <div class="progress">
          <div class="progress-bar" :style="{width: `${((questionIndex + 1) / questionList.length) * 100}%`}"></div>
        </div>
        <!--   当前是第几题   -->
        <div class="qid">{{ questionIndex + 1 }}/{{ questionList.length }}</div>
        <div class="question-title">{{ questionList[questionIndex].title }}</div>
        <div class="answer">
          <div class="answer-item optionA" :class="getOptionClass('A')" @click="handleClickOption('A', questionList[questionIndex].optionA)">
            {{ questionList[questionIndex].optionA }}
          </div>
          <div class="answer-item optionB" :class="getOptionClass('B')" @click="handleClickOption('B', questionList[questionIndex].optionB)">
            {{ questionList[questionIndex].optionB }}
          </div>
          <div class="answer-item optionC" :class="getOptionClass('C')" @click="handleClickOption('C', questionList[questionIndex].optionC)">
            {{ questionList[questionIndex].optionC }}
          </div>
          <div class="answer-item optionD" :class="getOptionClass('D')" @click="handleClickOption('D', questionList[questionIndex].optionD)">
            {{ questionList[questionIndex].optionD }}
          </div>
        </div>
      </div>

      <!--   注册框   -->
      <div class="register" v-if="isShowRegister">
        <div class="register-title">填写昵称后开始答题</div>
        <form id="addUser" ref="form">
          <div class="register-username">
            <span class="username">昵称：</span><input type="text" name="username">
          </div>
          <div class="register-gender">
            <span class="gender">性别：</span>
            <label class="gender-option">
              <input type="radio" name="gender" value="0" checked>
              <span>男生</span>
            </label>
            <label class="gender-option">
              <input type="radio" name="gender" value="1">
              <span>女生</span>
            </label>
          </div>

        </form>
        <div class="buttons">
          <button class="affirm" @click="handleAddUser">确定</button>
        </div>

      </div>

      <!--   得分情况   -->
      <div class="score-situation" v-if="isShowScoreBox">
        <div class="score-situation-left" v-if="isShowAnswer">
          <div class="left-answer-title">本次答题答案</div>
          <div class="left-answer">
            <div class="left-answer-list" v-for="(item,index) in questionList" :key="index">
              <span class="answer-timu">{{ item.title }}</span>
              <div class="answer-left">
                <span class="answer-wrong">{{ item.wrongText }}</span>
                <span class="answer-daan">{{ item.daanText }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="score-situation-center">
          <div class="title"><h2>获得 <span class="score">{{ score }}</span> 分</h2></div>
          <img class="jiangbei" src="../../assets/images/jiangbei2.png" alt="">
          <div class="question-result">共 <span class="question-result-num">{{ allQuestionComputed }}</span> 题 答对 <span
              class="question-result-num">{{ answerQuestionComputed }}</span> 题 答错 <span
              class="question-result-num">{{ allQuestionComputed - answerQuestionComputed }}</span> 题
          </div>
          <div class="again" @click="handleHideScoreBox">再试一次</div>
          <div class="center-buttons">
            <div class="check-answer" @click="handleShowAnswer">查看答案</div>
            <div class="check-wrong" @click="handleShowRanking">排行榜</div>
          </div>
        </div>
        <div class="score-situation-right" v-if="isShowRanking">
          <div class="right-title">排行榜前十名</div>
          <div class="ranking-list" v-for="(item,index) in rankingUsers" :key="item.raid">
            <div class="ranking-num" :style="{color: index+1 < 4?'red':'#999'}">{{ index + 1 }}</div>
            <div class="ranking-right">
              <div class="ranking-user-gender">{{ item.gender ? '👦' : '👧' }}</div>
              <div class="ranking-username">{{ item.username }}</div>
              <div class="ranking-score">{{ item.score }}分</div>
            </div>
          </div>
          <div class="right-bottom-text">每天00:00重置排行榜</div>
        </div>
      </div>

      <div v-if="!isStartingWork">
        <RightButtonLink v-for="(item, index) in rightButtons" :key="index" :style="{top: index * 60 + 100 + 'px'}"
                         :class="[rightButtonActiveIndex === index ? 'active':'']"
                         @mouseenter="handleShowActiveClass(index)" @mouseleave="handleHideActiveClass" :to="item.path">
          {{ item.text }}
        </RightButtonLink>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from "vue";
// 引入api
import {
  addRankingData,
  addUserNicknameAndGender,
  checkUsernameExists,
  getQuestionData,
  getRankingUser
} from "../../api/ExaminationApi";
// 引入生成随机不重复ID的方法
import { GenNonDuplicateID } from "../../assets/js/randomId";

import RightButtonLink from "../../components/RightButtonLink/index.vue";
import { Message } from "../../components/library/Message";

export default {
  name: "index",
  components: {
    RightButtonLink,
  },
  setup() {
    // 用户信息(username, uid)
    let userInfo = ref()

    onMounted(() => {
      // 进入页面获取用户名
      userInfo.value = getStoredUserInfo();
      handleCheckUserExists();
    })

    // 显示/隐藏注册弹框
    let isShowRegister = ref(false);

    // 判断用户是否存在localStore中
    function handleCheckUserExists() {
      // 用户存在
      if (userInfo?.value) {

        let reqParams = {
          id: userInfo.value.id,
          username: userInfo.value.username
        }
        // 发起请求，查看用户名是否存在数据库中
        checkUsernameExists(reqParams).then((data) => {
          if (data?.code === 500) {
            localStorage.removeItem('userInfo');
            Message({type: "error", text: '用户已过期，请重新注册'});
            isShowRegister.value = true;
            return;
          } else if (data?.code === 200) {
            Message({type:"success", text: userInfo.value?.username + ' 欢迎回来'})
          }
        }).catch(() => {
          Message({type: "error", text: "用户信息校验失败"});
          isShowRegister.value = true;
        })
      } else {
        // 用户不存在就让用户注册
        isShowRegister.value = true;
      }
    }

    let form = ref();

    // 添加用户
    function handleAddUser() {
      let formData = new FormData(form.value);

      let username = formData.get('username');

      let gender = formData.get('gender');

      if (username.trim().length === 0) return Message({type: 'error', text: '昵称不能为空'});

      // 生成随机不重复id
      let randomId = GenNonDuplicateID(10)

      // 发起请求，向数据库中添加用户数据
      addUserNicknameAndGender({id: randomId, username, gender}).then((data) => {
        if (data?.code === 500) {
          // 用户添加失败后
          // 提示用户
          return Message({type:"error", text: data?.message});
        } else if (data?.code === 200) {
          // 用户添加成功后
          // 提示用户
          Message({type: 'success', text: data?.message});
          // 关闭注册弹框
          isShowRegister.value = false;
          userInfo.value = {username, id: randomId};
          // 把用户名保存到本地，用作第二次进入页面时去数据库查找有没有这个用户
          localStorage.setItem('userInfo', JSON.stringify({username, id: randomId}));
        }
      }).catch(() => {
        Message({type: "error", text: "注册失败，请稍后重试"});
      })
    }


    // 控制开始答题按钮
    let isStartingWork = ref(false);
    let questionList = ref();
    // 题目序号
    let questionIndex = ref(0);

    // 分数
    let score = ref(0)
    let isAnswerLocked = ref(false);
    let answerFeedback = ref(null);

    // 显示分数框
    let isShowScoreBox = ref(false)


    // 点击开始答题按钮
    function handleStartingToWork() {
      if (!userInfo.value) {
        isShowRegister.value = true;
        return;
      }

      isStartingWork.value = true;
      // 获取题目数据
      getQuestionData().then(({data}) => {
        questionList.value = [...data];
      }).catch(() => {
        isStartingWork.value = false;
        Message({type: "error", text: "题目加载失败"});
      })
    }

    // 选择答案
    function handleClickOption(option, optionText) {
      if (isAnswerLocked.value) return;

      isAnswerLocked.value = true;
      const isLastQuestion = questionIndex.value === questionList.value.length - 1;
      const question = questionList.value[questionIndex.value];
      const isCorrect = option === question.daan;
      answerFeedback.value = {
        selected: option,
        correct: question.daan,
      };

      if (isCorrect) {
        score.value += 10;
        question.daanText = question[`option${option}`]
      } else {
        question.wrongText = optionText;
        question.daanText = question[`option${question.daan}`]
      }

      setTimeout(() => {
        if (isLastQuestion) {
        // 到最后一题了, 到最后一题后还需要在执行一次保存答案，不然最后一题不会记录，但是不能让索引继续往上加
        // 最后一题记录完成后显示得分情况，并将用户分数同步到数据库
        // 弹出得分框
        isShowScoreBox.value = true;
        // 隐藏答题框，并且显示开始答题按钮
        isStartingWork.value = false;

        // 生成随机不重复id
        let randomId = GenNonDuplicateID(10)
        // 获取用户信息
        let {username, id} = userInfo.value;

        let reqParams = {
          raid: randomId,
          score: score.value,
          username: username,
          uid: id
        }

        addRankingData(reqParams).then((data) => {
          Message({type: 'success', text: data?.message});
        }).catch(() => {
          Message({type: "error", text: "排行榜提交失败"});
        })


      } else {
        questionIndex.value = questionIndex.value + 1;
      }
        answerFeedback.value = null;
        isAnswerLocked.value = false;
      }, 500);
    }

    function getOptionClass(option) {
      if (!answerFeedback.value) return "";
      if (option === answerFeedback.value.correct) return "correct";
      if (option === answerFeedback.value.selected) return "wrong";
      return "disabled";
    }


    // 计算总共有多少题目
    let allQuestionComputed = computed(() => {
      return questionList.value.length;
    })

    // 计算答对多少题目
    let answerQuestionComputed = computed(() => {
      return questionList.value.filter(item => !item.wrongText).length;
    })

    let isShowAnswer = ref(false);

    function handleShowAnswer() {
      isShowAnswer.value = !isShowAnswer.value;
    }

    let isShowRanking = ref(false);

    let rankingUsers = ref();

    function handleShowRanking() {
      isShowRanking.value = !isShowRanking.value;

      getRankingUser().then(({data}) => {
        rankingUsers.value = data.rankingUsers;
      }).catch(() => {
        Message({type: "error", text: "排行榜加载失败"});
      })
    }

    function handleHideScoreBox() {
      // 清空所有状态
      isShowScoreBox.value = false;
      isShowRanking.value = false;
      isShowAnswer.value = false;
      questionIndex.value = 0;
      questionList.value = null;
      score.value = 0;
    }

    let rightButtonActiveIndex = ref(false);

    let rightButtons = [
      {
        text: '首页',
        path: "/home"
      },
      {
        text: '2021全国各省垃圾产量',
        path: "/provinceRanking"
      },
      {
        text: '垃圾分类小课堂',
        path: "/rubbishClass"
      }
    ]

    function handleShowActiveClass(index) {
      rightButtonActiveIndex.value = index;
    }

    function handleHideActiveClass() {
      rightButtonActiveIndex.value = null;
    }


    return {
      handleStartingToWork,
      handleAddUser,
      handleClickOption,
      getOptionClass,
      isShowRegister,
      form,
      isStartingWork,
      questionList,
      questionIndex,
      isShowScoreBox,
      score,
      allQuestionComputed,
      answerQuestionComputed,
      handleShowAnswer,
      isShowAnswer,
      handleShowRanking,
      isShowRanking,
      rankingUsers,
      handleHideScoreBox,
      rightButtons,
      rightButtonActiveIndex,
      handleShowActiveClass,
      handleHideActiveClass,
      isAnswerLocked,
      answerFeedback
    }
  }
}

function getStoredUserInfo() {
  try {
    return JSON.parse(localStorage.getItem('userInfo')) || null;
  } catch (e) {
    localStorage.removeItem('userInfo');
    return null;
  }
}
</script>

<style scoped lang="less">
.examination-container {
  position: relative;
  width: 1200px;
  margin: 0 auto;

  .question {
    margin-top: 100px;

    .progress {
      width: 420px;
      height: 10px;
      margin: 0 auto 36px;
      border-radius: 999px;
      background: #e7eef3;
      overflow: hidden;

      .progress-bar {
        height: 100%;
        border-radius: 999px;
        background: #006699;
        transition: width 0.25s ease;
      }
    }

    .question-title {
      font-size: 26px;
      text-align: center;
      margin-bottom: 40px;
    }

    .qid {
      position: absolute;
      right: 130px;
      top: 100px;
      padding: 20px 40px;
      background-color: red;
      font-size: 20px;
      color: #000;
    }

    .answer {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;
      height: 400px;

      .answer-item {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 350px;
        height: 60px;
        border: 2px solid #000;
        text-align: center;
        cursor: pointer;
        user-select: none;
        transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
      }

      .answer-item:hover {
        border-color: #006699;
        color: #006699;
      }

      .answer-item.correct {
        background-color: #67c23a;
        border-color: #67c23a;
        color: #fff;
      }

      .answer-item.wrong {
        background-color: #f56c6c;
        border-color: #f56c6c;
        color: #fff;
      }

      .answer-item.disabled {
        opacity: 0.45;
        cursor: default;
      }
    }
  }

  .examination-title h1 {
    padding: 20px 0;
    font-size: 40px;
    font-weight: bolder;
    text-align: center;
    user-select: none;
  }

  .start {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 200px auto;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    border: 2px solid #000;
    cursor: pointer;
    user-select: none;
    font-size: 30px;
  }

  .register {
    position: fixed;
    left: 50%;
    top: 400px;
    transform: translate(-50%, -50%);
    width: 500px;
    height: 300px;
    background-color: #fff;
    border: 2px solid #000;
    padding: 20px 120px;
    box-sizing: border-box;

    .register-title {
      margin-bottom: 24px;
      font-size: 22px;
      font-weight: bolder;
      text-align: center;
      color: #006699;
    }

    .register-username {
      margin-bottom: 30px;

      .username {
        font-size: 20px;
        font-weight: bolder;
      }

      & input {
        height: 20px;
      }
    }

    .register-gender {
      display: flex;
      align-items: center;
      gap: 10px;

      .gender {
        font-size: 20px;
        font-weight: bolder;
      }

      .gender-option {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 72px;
        height: 36px;
        border: 1px solid rgba(8, 31, 27, 0.14);
        border-radius: 999px;
        background: #f8faf9;
        color: var(--app-text-soft);
        font-size: 15px;
        font-weight: 750;
        cursor: pointer;
        transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;

        input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }
      }

      .gender-option:has(input:checked) {
        border-color: transparent;
        background: linear-gradient(135deg, var(--app-accent), var(--app-accent-blue));
        color: #061512;
        box-shadow: 0 10px 26px rgba(31, 182, 146, 0.2);
      }
    }

    .buttons {
      position: absolute;
      right: 50%;
      bottom: 30px;
      transform: translate(50%);

      .affirm {
        padding: 10px 40px;
        background-color: #4F9CEE;
        color: #fff;
        border: none;
        border-radius: 3px;
        cursor: pointer;
      }
    }
  }


  .score-situation {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -10%);
    width: 100%;
    //height: 120%;
    height: 640px;
    padding: 20px 0;
    background-color: #fff;
    border: 2px solid #000;

    .score-situation-center {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;

      .title {
        padding: 10px 10px;
        font-size: 40px;
        font-weight: bolder;
        text-align: center;
      }

      .score {
        font-size: 70px;
        color: red;
        padding: 10px 10px;

        .score-text {
          font-size: 40px;
          font-weight: bolder;
          color: #000;
        }
      }

      .jiangbei {
        width: 200px;
        height: 200px;
      }

      .question-result {
        font-size: 20px;
        font-weight: bolder;

        .question-result-num {
          color: red;
        }
      }

      .again {
        width: 320px;
        height: 50px;
        text-align: center;
        line-height: 50px;
        background-color: #b9e0ed;
        user-select: none;
        cursor: pointer;
        margin-top: 10px;
      }

      .center-buttons {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
        margin-top: 10px;

        .check-answer,
        .check-wrong {
          width: 150px;
          height: 50px;
          text-align: center;
          line-height: 50px;
          background-color: #3d5ca8;
          user-select: none;
          cursor: pointer;
          color: #fff;
        }

        .check-wrong {
          margin-left: 20px;
          background-color: orangered;
          color: #fff;
        }
      }

    }

    .score-situation-left {
      height: 100%;
      width: 450px;

      .left-answer-title {
        font-size: 26px;
        font-weight: bold;
        text-align: center;
      }

      .left-answer {
        margin-top: 40px;
      }

      .left-answer-list {
        margin-bottom: 20px;
        overflow: hidden;

        .answer-left {
          float: right;
        }

        .answer-wrong {
          text-decoration: line-through;
          color: #999;
          margin-right: 5px;
        }

        .answer-daan {
          color: green;
        }
      }

    }

    .score-situation-right {
      height: 100%;

      .right-bottom-text {
        font-size: 14px;
        text-align: center;
        margin-top: 10px;
      }

      .right-title {
        font-size: 26px;
        text-align: center;
        font-weight: bolder;
        margin-bottom: 20px;
      }

      .ranking-list {
        padding: 15px;
        overflow: hidden;

        .ranking-num {
          float: left;
          font-size: 26px;
          margin-right: 10px;
        }

        .ranking-right {
          float: left;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;

          .ranking-user-gender {
            font-size: 26px;
          }

          .ranking-score {
            margin-left: 20px;
            color: red;
            font-size: 20px;
          }
        }
      }
    }
  }
  /* Modern visual layer */
  min-height: 100vh;
  width: 100%;
  padding: 36px 24px 80px;
  background:
      radial-gradient(circle at 20% 12%, rgba(115, 224, 193, 0.16), transparent 30%),
      radial-gradient(circle at 82% 8%, rgba(125, 183, 255, 0.16), transparent 32%),
      #f5f8f6;

  .examination-title h1 {
    color: var(--app-text);
    font-size: 34px;
    font-weight: 850;
  }

  .start {
    width: 172px;
    height: 172px;
    border: 0;
    background: linear-gradient(135deg, var(--app-accent), var(--app-accent-blue));
    box-shadow: 0 28px 70px rgba(31, 182, 146, 0.28);
    color: #061512;
    font-weight: 800;
    transition: transform 0.22s ease, box-shadow 0.22s ease;
  }

  .start:hover {
    transform: translateY(-4px);
    box-shadow: 0 34px 80px rgba(31, 182, 146, 0.34);
  }

  .question {
    width: min(820px, 100%);
    margin: 80px auto 0;
    padding: 34px;
    border: 1px solid var(--app-border-dark);
    border-radius: 28px;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 24px 70px rgba(8, 31, 27, 0.12);

    .progress {
      background: #e6eeeb;

      .progress-bar {
        background: linear-gradient(135deg, var(--app-accent-strong), var(--app-accent-blue));
      }
    }

    .qid {
      right: 34px;
      top: 120px;
      padding: 10px 18px;
      border-radius: 999px;
      background: #eef8f5;
      color: var(--app-accent-strong);
      font-weight: 800;
    }

    .question-title {
      color: var(--app-text);
      font-weight: 800;
      line-height: 36px;
    }

    .answer {
      gap: 14px;
      height: auto;

      .answer-item {
        width: min(560px, 100%);
        min-height: 60px;
        border: 1px solid rgba(8, 31, 27, 0.1);
        border-radius: 18px;
        background: #f8faf9;
        color: var(--app-text);
        font-weight: 700;
      }

      .answer-item:hover {
        border-color: rgba(31, 182, 146, 0.42);
        background: #fff;
        color: var(--app-accent-strong);
      }
    }
  }

  .register,
  .score-situation {
    border: 1px solid var(--app-border-dark);
    border-radius: 26px;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: var(--app-shadow);
  }

  .register {
    height: auto;
    padding: 32px 54px 92px;

    input[type="text"] {
      width: 180px;
      height: 36px;
      padding: 0 12px;
      border: 1px solid rgba(8, 31, 27, 0.16);
      border-radius: 12px;
      outline: none;
    }

    .buttons .affirm {
      border-radius: 999px;
      background: var(--app-accent-strong);
      font-weight: 800;
    }
  }

  .score-situation {
    height: auto;
    min-height: 620px;
    border: 1px solid var(--app-border-dark);

    .score {
      color: var(--app-accent-strong) !important;
    }

    .again,
    .center-buttons .check-answer,
    .center-buttons .check-wrong {
      border-radius: 999px;
      background: var(--app-text);
      color: #fff;
      font-weight: 750;
    }

    .center-buttons .check-wrong {
      background: var(--app-accent-strong);
    }
  }
}

@media (max-width: 860px) {
  .examination-container {
    padding: 20px 14px 60px;

    .question {
      padding: 24px 16px;

      .progress {
        width: 100%;
      }

      .qid {
        position: static;
        width: fit-content;
        margin: 0 auto 18px;
      }
    }

    .register {
      width: calc(100vw - 32px);
      padding: 28px 24px 92px;
    }

    .score-situation {
      position: static;
      transform: none;
      width: 100%;
      flex-direction: column;
      gap: 24px;
    }
  }
}
</style>
