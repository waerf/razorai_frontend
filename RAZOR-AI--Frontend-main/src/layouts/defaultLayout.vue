<template>
  <div class="layout-container">
    <!-- 顶部导航栏 -->
    <el-header class="ourHeader">
      <div class="logo-button-container">
        <img
          @click="toggleSidebar"
          class="logo"
          src="@/assets/images/logo.png"
          alt="Logo"
        />
        <div class="company-name">RAZOR-AI</div>
      </div>

      <!-- 通过占位实现位置的偏移 -->
      <h2 class="header-name-empty">{{ ' ' }}</h2>
      <h2
        class="header-name"
        :class="{ active: currentActiveTab === 'RAZOR-AI' }"
        @click="switchNavigationTo('RAZOR-AI')"
      >
        {{ headername_withRazorAI }}
      </h2>
      <h2
        class="header-name"
        :class="{ active: currentActiveTab === 'Community' }"
        @click="switchNavigationTo('Community')"
      >
        {{ headername_withCommunity }}
      </h2>
      <h2 class="header-name-empty">{{ ' ' }}</h2>
      <div class="header-actions">
        <!-- 向平台反馈按钮 -->
        <el-button
          type="text"
          class="feedback-btn"
          @click="openFeedbackDialog"
          title="向平台反馈"
        >
          <el-icon name="box"></el-icon>
        </el-button>

        <!-- 用户信息 -->
        <div class="user-info">
          <el-icon name="user"></el-icon>
          <span v-if="!isLoggedIn" @click="openLoginDialog">用户登录</span>
          <span v-else @click="navigateTo('PersonalHome')"
            >你好，<br />{{ userName }}</span
          >
        </div>
      </div>
    </el-header>

    <!-- 下半部分：左右布局 -->
    <!-- 左侧菜单栏 -->
    <!-- 在导航为RAZOR-AI时 -->
    <div class="main-content">
      <aside
        v-if="navigation == 'RAZOR-AI'"
        class="sidebar"
        :class="{ hidden: isSidebarHidden }"
      >
        <!-- 侧边栏显示隐藏按键 -->
        <div
          v-if="!isSidebarHidden"
          class="sidebar-button"
          @click="toggleSidebar"
        >
          <el-icon name="s-fold" class="sidebar-button-icon"></el-icon>
        </div>
        <div
          v-if="isSidebarHidden"
          class="sidebar-button"
          @click="toggleSidebar"
        >
          <el-icon name="s-unfold" class="sidebar-button-icon"></el-icon>
        </div>
        <!-- 主要功能区域 -->
        <div
          class="menu-item"
          :class="{ active: $route.name === 'Home' }"
          @click="navigateTo('Home')"
        >
          <el-icon name="s-home" class="menu-item-icon"></el-icon>首页
        </div>
        <div
          class="menu-item"
          :class="{ active: $route.name === 'MyBots' }"
          @click="navigateTo('MyBots')"
        >
          <el-icon name="s-opportunity" class="menu-item-icon"></el-icon>
          我的机器人
        </div>
        <div
          class="menu-item"
          :class="{ active: $route.name === 'SubscribedBots' }"
          @click="navigateTo('SubscribedBots')"
        >
          <el-icon name="s-opportunity" class="menu-item-icon"></el-icon>
          我订阅的机器人
        </div>
        <div
          class="menu-item"
          :class="{ active: $route.name === 'RobotMarket' }"
          @click="navigateTo('RobotMarket')"
        >
          <el-icon name="goods" class="menu-item-icon"></el-icon>机器人市场
        </div>
        <div
          class="menu-item"
          :class="{ active: $route.name === 'CreateBots' }"
          @click="navigateTo('CreateBots')"
        >
          <el-icon name="coordinate" class="menu-item-icon"></el-icon>创造机器人
        </div>
        <div
          class="menu-item"
          :class="{ active: $route.name === 'ConversationHistory' }"
          @click="navigateTo('ConversationHistory')"
        >
          <el-icon name="time" class="menu-item-icon"></el-icon>对话历史
        </div>
        <!-- <div class="menu-item" @click="navigateTo('PersonalHome')">
          <el-icon name="s-custom" class="menu-item-icon"></el-icon>个人主页
        </div> -->
        <!-- <div class="menu-item" @click="navigateTo('Test')">
          <el-icon name="chat-line-round" class="menu-item-icon"></el-icon
          >睿择社区
        </div> -->
        <!-- <div class="menu-item" @click="navigateTo('Setting')">
          <el-icon name="setting" class="menu-item-icon"></el-icon>系统设置
        </div> -->
        <!-- <div class="menu-item" @click="navigateTo('About')">
          <el-icon name="info" class="menu-item-icon"></el-icon>关于我们
        </div> -->
        <!-- <div class="divider">
        </div> -->
        <!-- <div class="menu-item" @click="navigateTo('HelperCenter')">
          <el-icon name="question" class="menu-item-icon"></el-icon>帮助中心
        </div> -->
        <!-- <div class="menu-item" @click="navigateTo('Explorer')">
          <el-icon name="goods" class="menu-item-icon"></el-icon>探索机器人
        </div> -->
        <!-- <div class="menu-item" @click="navigateTo('DeveloperCenter')">
          <el-icon name="coordinate" class="menu-item-icon"></el-icon>开发者中心
        </div> -->
        <!-- <div class="menu-item" @click="navigateTo('Test')">
          <el-icon name="loading" class="menu-item-icon"></el-icon>测试页面
        </div> -->
        <div class="chat-history">
          <!-- 对话项：增加文字容器，让图标与文字紧密对齐 -->
          <div
            class="chat-item"
            v-for="chat in chatlists"
            :key="chat.id"
            @click="navigateToChat(chat.id)"
          >
            <el-icon name="chat-dot-square" class="chat-icon"></el-icon>

            <div class="chat-text-container">
              <div v-if="!isSidebarHidden" class="chat-title">
                {{ chat.title }}
              </div>
              <div v-if="!isSidebarHidden" class="chat-name">
                {{ chat.name }}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <aside
        v-if="navigation == 'Community'"
        class="sidebar"
        :class="{ hidden: isSidebarHidden }"
      >
        <!-- 侧边栏显示隐藏按键 -->
        <div
          v-if="!isSidebarHidden"
          class="sidebar-button"
          @click="toggleSidebar"
        >
          <el-icon name="s-fold" class="sidebar-button-icon"></el-icon>
        </div>
        <div
          v-if="isSidebarHidden"
          class="sidebar-button"
          @click="toggleSidebar"
        >
          <el-icon name="s-unfold" class="sidebar-button-icon"></el-icon>
        </div>
        <!-- 主要功能区域 -->
        <div
          class="menu-item"
          :class="{ active: $route.name === 'Home' }"
          @click="navigateTo('Home')"
        >
          <el-icon name="s-home" class="menu-item-icon"></el-icon>首页
        </div>
        <!-- 新增功能：社区动态 -->
        <div
          class="menu-item"
          :class="{ active: $route.name === 'Community' }"
          @click="navigateTo('Community')"
        >
          <el-icon name="bell" class="menu-item-icon"></el-icon>社区动态
        </div>
        <!-- 新增功能：我的帖子 -->
        <div
          class="menu-item"
          :class="{ active: $route.name === 'MyPosts' }"
          @click="navigateTo('MyPosts')"
        >
          <el-icon name="document" class="menu-item-icon"></el-icon>我的帖子
        </div>
      </aside>

      <!-- 右侧内容区域 -->
      <el-main>
        <router-view :key="$route.fullPath"></router-view>
      </el-main>
    </div>

    <!-- 登录对话框 -->
    <el-dialog
      :visible.sync="loginDialogVisible"
      name="用户登录"
      :modal="true"
      :close-on-click-modal="false"
      center
      width="40%"
    >
      <LoginForm @close="loginDialogVisible = false" />
    </el-dialog>

    <!-- 向平台反馈弹窗 -->
    <div
      v-if="feedbackDialogVisible"
      class="feedback-overlay"
      @click="closeFeedbackDialog"
    >
      <div class="feedback-dialog" @click.stop>
        <!-- 弹窗头部 -->
        <div class="feedback-header">
          <!-- 左侧占位 -->
          <div class="placeholder"></div>
          <!-- 中间标题 -->
          <h3 class="feedback-title">向平台反馈</h3>
          <!-- 右侧关闭按钮 -->
          <el-button type="text" class="close-btn" @click="closeFeedbackDialog">
            <el-icon name="close"></el-icon>
          </el-button>
        </div>

        <!-- 弹窗内容 -->
        <div class="feedback-content">
          <!-- 当前路由显示 -->
          <div class="route-info">
            <label>当前页面：</label>
            <el-input
              v-model="currentRoute"
              size="small"
              disabled
              class="route-input"
            />
          </div>

          <!-- 反馈内容输入 -->
          <div class="feedback-input-area">
            <label>反馈内容：</label>
            <el-input
              v-model="feedbackMessage"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 5 }"
              placeholder="请输入您的反馈内容..."
              class="feedback-textarea"
            />
          </div>

          <!-- 发送按钮 -->
          <div class="feedback-actions">
            <el-button
              type="primary"
              size="small"
              @click="submitFeedback"
              :loading="submittingFeedback"
            >
              发送
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LoginForm from '@/components/LoginForm.vue'; // 引入登录表单组件
import { mapGetters, mapState, mapActions } from 'vuex'; // 引入 mapGetters, mapActions
import {
  sendUserFeedback,
  fetchAllChats as apiFetchAllChats,
} from '@/utils/api'; // 引入反馈API和对话API
import user from '@/store/user';
export default {
  components: {
    LoginForm,
  },
  data() {
    return {
      loginDialogVisible: false,
      isSidebarHidden: false, // 控制菜单栏是否隐藏
      navigation: 'RAZOR-AI',
      currentActiveTab: 'RAZOR-AI', // 添加当前激活标签状态
      // 反馈相关数据
      feedbackDialogVisible: false,
      feedbackMessage: '',
      submittingFeedback: false,
    };
  },
  created() {
    this.getAllChats();
    // 根据当前路由设置初始激活状态
    if (this.$route.path.includes('community')) {
      this.currentActiveTab = 'Community';
      this.navigation = 'Community';
    } else {
      this.currentActiveTab = 'RAZOR-AI';
      this.navigation = 'RAZOR-AI';
    }

    // 监听全局事件，用于打开登录弹窗
    this.$root.$on('openLoginDialog', () => {
      this.loginDialogVisible = true;
    });
  },

  beforeDestroy() {
    // 清除事件监听
    this.$root.$off('openLoginDialog');
  },
  computed: {
    ...mapGetters('user', ['isLoggedIn', 'userId', 'userName']), // 映射 getters
    ...mapState('chat', {
      chatlists: (state) => state.chats,
    }),
    ...mapState('user', ['isLoggedIn', 'userName', 'userId', 'token']), // 绑定 Vuex 状态，当信息改变时，自动更新
    headername_withRazorAI() {
      if (this.navigation != 'RAZOR-AI') return 'RAZOR-AI';
      // 从当前路由的 meta 信息中获取标题
      // console.log('当前路由：', this.$route);
      this.$message('当前路由：' + this.$route.path);
      return this.$route.meta.title;
    },
    headername_withCommunity() {
      if (this.navigation != 'Community') return '社区';
      // 从当前路由的 meta 信息中获取标题并修改前缀
      // console.log('当前路由：', this.$route);
      this.$message('当前路由：' + this.$route.path);
      const fullTitle = this.$route.meta.title || '默认标题';
      return '社区-' + fullTitle.replace(/^(RazorAI-|RAZOR-AI-)/i, '');
    },
    // 获取当前路由信息用于反馈
    currentRoute() {
      return this.$route.path || '首页';
    },
  },
  watch: {
    // 监听路由变化，自动调整激活状态
    $route(to) {
      if (to.path.includes('community')) {
        this.currentActiveTab = 'Community';
        this.navigation = 'Community';
      } else {
        this.currentActiveTab = 'RAZOR-AI';
        this.navigation = 'RAZOR-AI';
      }
    },
  },
  methods: {
    ...mapActions('chat', ['fetchChats']), // 映射 actions, 用于获取聊天列表
    async getAllChats() {
      try {
        const result = await apiFetchAllChats({
          userId: user.state.userId,
        });
        if (result.status === 200) {
          // 确保存入Vuex的是数组
          const chatsData = Array.isArray(result.data) ? result.data : [];
          this.$store.commit('chat/SET_CHATS', chatsData);
          this.$message.success(`对话记录加载成功，共${chatsData.length}条`);
        }
        console.log('获取聊天列表成功：', result);
      } catch (error) {
        console.error('获取聊天列表失败：', error);
      }
    },
    toggleSidebar() {
      this.isSidebarHidden = !this.isSidebarHidden;
    },
    switchNavigationTo(navigation) {
      // 更新当前激活的标签
      this.currentActiveTab = navigation;
      this.navigation = navigation;

      // 根据不同的导航执行不同的逻辑
      if (navigation === 'RAZOR-AI') {
        this.navigateTo('Home');
      } else if (navigation === 'Community') {
        // 如果有Community页面的话
        console.log('切换到Community页面');
        this.navigateTo('Community');
      }

      // 重置侧边栏状态
      this.isSidebarHidden = false;
    },
    navigateTo(route) {
      if (this.$route.name !== route) {
        this.$router.push({ name: route });
      }
    },
    openLoginDialog() {
      this.loginDialogVisible = true;
    },
    // 打开反馈弹窗
    openFeedbackDialog() {
      this.feedbackDialogVisible = true;
      this.feedbackMessage = ''; // 重置反馈内容
    },
    // 关闭反馈弹窗
    closeFeedbackDialog() {
      this.feedbackDialogVisible = false;
      this.feedbackMessage = '';
      this.submittingFeedback = false;
    },
    // 提交反馈
    async submitFeedback() {
      if (!this.feedbackMessage.trim()) {
        this.$message.warning('请输入反馈内容');
        return;
      }

      if (!this.isLoggedIn) {
        this.$message.warning('请先登录后再提交反馈');
        return;
      }

      this.submittingFeedback = true;

      try {
        const feedbackload = {
          userId: this.userId,
          message: `在"${this.currentRoute}"路由中提出以下反馈：${this.feedbackMessage}`,
        };
        console.log('反馈负载：', feedbackload);

        const response = await sendUserFeedback(feedbackload);

        if (response.status === 200) {
          this.$message.success('反馈提交成功，感谢您的反馈！');
          this.closeFeedbackDialog();
        } else {
          throw new Error('反馈提交失败');
        }
      } catch (error) {
        console.error('提交反馈失败:', error);
        if (error.code === 400) {
          this.$message.error(error.message || '反馈提交失败，请检查输入内容');
        } else if (error.code === 'NETWORK_ERROR') {
          this.$message.error('网络连接失败，请检查网络连接');
        } else {
          this.$message.error('反馈提交失败，请稍后重试');
        }
      } finally {
        this.submittingFeedback = false;
      }
    },
    // 跳转到聊天详情页
    navigateToChat(chatId) {
      // 如果当前页面的id和chatId相同，则不跳转
      if (this.$route.params.id === chatId) {
        return;
      }
      this.$router.push({ name: 'ChatRobot', params: { chatId } });
    },
  },
};
</script>
<style lang="scss" scoped>
@use '@/assets/styles/layout.scss' as *;

// 头部操作区域样式
.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;

  .feedback-btn {
    color: #606266;
    font-size: 18px;
    padding: 8px;
    transition: color 0.3s ease;

    &:hover {
      color: #409eff;
    }
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;

    span {
      cursor: pointer;
      color: #606266;
      transition: color 0.3s ease;

      &:hover {
        color: #409eff;
      }
    }
  }
}

// 反馈弹窗样式
.feedback-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feedback-dialog {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 400px;
  max-width: 90vw;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .feedback-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #ebeef5;
    background-color: #f5f7fa;

    .placeholder {
      width: 24px; // 与关闭按钮宽度相同，用于居中
    }

    .feedback-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }

    .close-btn {
      color: #909399;
      font-size: 16px;
      padding: 4px;

      &:hover {
        color: #f56c6c;
      }
    }
  }

  .feedback-content {
    padding: 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 15px;

    .route-info {
      display: flex;
      flex-direction: column;
      gap: 5px;

      label {
        font-size: 14px;
        color: #606266;
        font-weight: 500;
      }

      .route-input {
        .el-input__inner {
          background-color: #f5f7fa;
          border-color: #dcdfe6;
        }
      }
    }

    .feedback-input-area {
      display: flex;
      flex-direction: column;
      gap: 5px;
      flex: 1;

      label {
        font-size: 14px;
        color: #606266;
        font-weight: 500;
      }

      .feedback-textarea {
        .el-textarea__inner {
          resize: vertical;
          min-height: 80px;
        }
      }
    }

    .feedback-actions {
      display: flex;
      justify-content: flex-end;
      padding-top: 10px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .feedback-dialog {
    width: 90vw;
    margin: 0 20px;

    .feedback-content {
      padding: 15px;
    }
  }

  .header-actions {
    gap: 10px;

    .feedback-btn {
      font-size: 16px;
      padding: 6px;
    }
  }
}

.chat-history {
  padding: 4px 0;
  margin: 0;
  list-style: none;
}

.chat-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 5px 12px;
  margin: 0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.chat-icon {
  font-size: 14px;
  color: #606266;
  margin-top: 1px;
}

.chat-text-container {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
}

.chat-name {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.chat-title {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}
</style>
