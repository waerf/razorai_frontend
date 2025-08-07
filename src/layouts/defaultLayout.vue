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
      <div class="user-info">
        <button v-if="!isLoggedIn" class="user-button" @click="openLoginDialog">
          <el-icon name="user" class="user-icon"></el-icon>
          <div class="user-text">
            <span>用户登录</span>
          </div>
        </button>
        <button
          v-else
          class="user-button"
          :class="{ 'user-active': $route.name === 'PersonalHome' }"
          @click="navigateTo('PersonalHome')"
        >
          <el-icon name="user" class="user-icon"></el-icon>
          <div class="user-text">
            <span>你好</span>
            <span>{{ userName }}</span>
          </div>
        </button>
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
          :class="{ active: $route.name === 'SubscribedBots' }"
          @click="navigateTo('SubscribedBots')"
        >
          <el-icon name="s-opportunity" class="menu-item-icon"></el-icon>
          已订阅机器人
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
          <el-icon name="time" class="menu-item-icon"></el-icon>历史记录
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
          <div
            class="chat-item"
            v-for="chat in chatlists"
            :key="chat.id"
            @click="navigateToChat(chat.id)"
          >
            <el-icon name="chat-dot-square" class="chat-icon"></el-icon
            >{{ chat.name }}
            <span>{{ chat.agent_name }}</span>
          </div>
        </div>
      </aside>

      <aside
        v-if="navigation == 'Community'"
        class="sidebar"
        :class="{ hidden: isSidebarHidden }"
      >
        <!-- 主要功能区域 -->
        <div class="menu-item" @click="navigateTo('Home')">
          <el-icon name="s-home" class="menu-item-icon"></el-icon>首页
        </div>
      </aside>

      <!-- 右侧内容区域 -->
      <el-main>
        <router-view></router-view>
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
  </div>
</template>

<script>
import LoginForm from '@/components/LoginForm.vue'; // 引入登录表单组件
import { mapGetters, mapState, mapActions } from 'vuex'; // 引入 mapGetters, mapActions
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
        const response = await this.fetchChats({
          user_id: user.state.userId,
        });
        console.log('获取聊天列表成功：', response);
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
        // this.navigateTo('Community');
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
    // 跳转到聊天详情页
    navigateToChat(chatId) {
      // 如果当前页面的id和chatId相同，则不跳转
      if (this.$route.params.id === chatId) {
        return;
      }
      this.$router.push({ name: 'ChatRobot', params: { id: chatId } });
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/assets/styles/layout.scss' as *;

.user-info .user-button {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background-color: #f4f4f4;
  border: 1px solid #ddd;
  border-radius: 5px; /* 调整按钮圆角 */
  padding: 10px 20px; /* 调整按钮内边距 */
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 500px; /* 进一步加宽按钮 */
}

.user-info .user-button:hover {
  background-color: #e6e6e6;
}

.user-info .user-active {
  background-color: #165dff;
  color: #fff;
  font-weight: bold;
}

.user-info .user-icon {
  margin-right: 15px; /* 图标左移 */
}

.user-info .user-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1.5;
}
</style>
