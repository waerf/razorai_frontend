<template>
  <div class="my-bots-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">我的 AI 机器人</h1>
      <p class="page-description">
        管理和配置你的所有AI机器人，查看它们的使用情况和统计数据
      </p>
    </div>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 页面右上角按钮 -->
      <div class="absolute top-0 right-0 mt-2 mr-4 z-10">
        <button
          class="btn primary-btn flex items-center justify-center h-10 px-4"
          @click="$router.push('/createRobot')"
        >
          <i class="fa fa-plus mr-2"></i>
          <span class="align-middle leading-none">创建新机器人</span>
        </button>
      </div>

      <!-- 加载中状态 -->
      <div
        v-if="loading"
        class="flex justify-center items-center fixed inset-0 bg-white bg-opacity-70 z-50"
      >
        <div class="flex flex-col items-center">
          <i class="fa fa-spinner fa-spin text-3xl text-gray-600 mb-4"></i>
          <span class="text-gray-600 text-lg">正在加载，请稍候...</span>
        </div>
      </div>

      <!-- 空数据状态 -->
      <div
        v-else-if="!activeBots.length"
        class="text-center py-20 text-gray-500"
      >
        <i class="fa fa-robot text-3xl mb-2"></i>
        <p>您还没有创建任何机器人</p>
      </div>

      <!-- 机器人列表区域 -->
      <div v-else class="bots-grid">
        <!-- 机器人卡片 -->
        <div
          v-for="bot in activeBots"
          :key="bot.id"
          class="bot-card card-hover"
        >
          <div class="p-5">
            <!-- 名字 & 描述 -->
            <div class="mb-4">
              <h2 class="text-lg font-semibold">{{ bot.name }}</h2>
              <p class="text-sm text-gray-500 mt-1">{{ bot.description }}</p>
            </div>

            <!-- 价格 & 活跃状态 -->
            <div
              class="flex justify-between items-center text-sm text-gray-600 mb-4"
            >
              <div>
                <i class="fa fa-yen mr-1"></i>
                <span>价格：{{ bot.price }}</span>
              </div>
              <span class="status-active text-green-600">活跃</span>
            </div>

            <!-- 按钮 -->
            <div class="border-t border-gray-100 pt-4 flex justify-between">
              <a
                href="#"
                class="text-razor-blue hover:text-razor-darkBlue font-medium flex items-center transition-all hover:pl-1"
                @click.prevent="startConversation(bot)"
              >
                <i class="fa fa-comments-o mr-1"></i>
                开始对话
              </a>
              <a
                href="#"
                class="text-gray-600 hover:text-gray-800 font-medium flex items-center transition-all hover:pr-1"
                @click.prevent="$router.push(`/BotsEditversion/${bot.id}`)"
              >
                <i class="fa fa-cog mr-1"></i>
                编辑当前版本
              </a>
              <a
                href="#"
                class="text-gray-600 hover:text-gray-800 font-medium flex items-center transition-all hover:pr-1"
                @click.prevent="$router.push(`/BotsHistoryVersions/${bot.id}`)"
              >
                <i class="fa fa-cog mr-1"></i>
                查看历史版本
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { fetchUserCreatedAgents } from '@/utils/api';
import { createChat as apicreateChat } from '@/utils/api';
export default {
  name: 'MyBotsPage',
  data() {
    return {
      bots: [
        {
          id: null,
          name: '',
          description: '',
          type: null,
          price: null,
          llmId: null,
          chatPrompt: '',
          creatorId: null,
          subscriptionCnt: null,
          auditStatus: null,
          version: '',
        },
      ],
      loading: true,
    };
  },

  computed: {
    activeBots() {
      return this.bots
        .filter((bot) => bot.auditStatus === 1)
        .slice()
        .reverse();
    },
  },

  methods: {
    // 获取用户创建机器人信息
    async getUserCreatedAI() {
      try {
        const userId = this.$store.state.user?.userId;
        console.log('准备获取机器人列表, userId:', userId);

        if (!userId) {
          this.$message.error('未获取到用户信息，请重新登录');
          return;
        }

        this.loading = true;
        console.log('正在请求 fetchUserCreatedAgents...');

        const result = await fetchUserCreatedAgents(userId);
        console.log('API返回结果:', result);

        if (result.status === 200) {
          const createdBots = result.data.data || [];
          this.bots = createdBots;
          console.log('成功赋值给 bots:', this.bots);

          if (createdBots.length === 0) {
            this.$message.info('您当前没有创建任何机器人');
          } else {
            console.log(`成功获取 ${createdBots.length} 个创建的机器人`);
          }
        } else {
          this.$message.warning(`获取创建列表失败: ${result.message}`);
        }
      } catch (error) {
        console.error('获取创建列表失败:', error);
        this.$message.error('获取创建列表时发生网络错误，请重试');
      } finally {
        this.loading = false;
      }
    },

    async startConversation(bot) {
      const userId = this.$store.state.user?.userId;
      if (!userId) {
        this.$message.error('未获取到用户信息，请重新登录');
        return;
      }

      const payload = {
        name: bot.name || `chat_${Date.now()}`,
        agentId: bot.id,
        userId: userId,
      };
      console.log('进入会话参数:', payload);

      try {
        // 调用接口，创建会话，返回真实 chatId
        const res = await apicreateChat(payload);
        const chatId = res.data.chat_id;
        console.log('创建的聊天ID:', chatId);

        // 直接跳到真实的 chatId 页面
        this.$router.push({
          name: 'ChatRobot',
          params: { chatId: chatId },
        });
      } catch (err) {
        this.$message.error('创建会话失败');
        console.error(err);
      }
    },
  },

  // 页面初始化时调用
  created() {
    console.log('MyBotsPage 已加载, 开始初始化...');
    this.getUserCreatedAI();
  },
};
</script>

<style scoped>
/* 基础样式 - 与帖子页面保持一致 */
.my-bots-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #333;
  background-color: #fff;
  min-height: 100vh;
}

/* 页面标题 - 与帖子页面统一 */
.page-header {
  margin-bottom: 35px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e2e8f0;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 10px;
  letter-spacing: -0.02em;
}

.page-description {
  color: #64748b;
  font-size: 16px;
  max-width: 700px;
}

/* 主内容区 */
.main-content {
  flex: 1;
}

/* 表单卡片样式 - 与帖子页面统一 */
.form-card {
  background: #fff;
  border-radius: 12px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 2px 4px -1px rgba(0, 0, 0, 0.03);
  padding: 35px;
  margin-bottom: 30px;
  transition: box-shadow 0.3s ease;
}

.form-card:hover {
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.06),
    0 4px 6px -2px rgba(0, 0, 0, 0.04);
}

/* 机器人网格布局 - 与帖子页面统一 */
.bots-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
}

/* 机器人卡片样式 - 与帖子卡片统一 */
.bot-card {
  flex: 1;
  min-width: 300px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

/* 卡片悬停效果 - 与帖子卡片统一 */
.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-6px);
  box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}

/* 状态标签 - 优化为与帖子状态标签风格一致 */
.status-active {
  padding: 3px 10px;
  background-color: #f0fff4;
  color: #166534;
  font-size: 12px;
  border-radius: 12px;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(34, 197, 94, 0.1);
}

/* 按钮样式 - 与帖子页面统一 */
.btn {
  height: 40px;
  padding: 3px 3px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.primary-btn {
  background-color: #0f88eb;
  color: white;
  box-shadow: 0 2px 4px rgba(22, 93, 255, 0.15);
}

.primary-btn:hover {
  background-color: #0a6fcc;
  box-shadow: 0 4px 8px rgba(22, 93, 255, 0.25);
}

/* 链接样式 - 优化为与帖子页面一致 */
a {
  text-decoration: none;
  transition: all 0.2s ease;
}

/* 自定义颜色 - 与帖子页面统一 */
.text-razor-blue {
  color: #0f88eb;
}

.text-razor-darkBlue {
  color: #0a6fcc;
}

.text-gray-500 {
  color: #64748b;
}

.text-gray-600 {
  color: #475569;
}

.border-gray-100 {
  border-color: #f1f5f9;
}

.border-gray-200 {
  border-color: #e2e8f0;
}

/* 布局工具类 - 与帖子页面统一 */
.flex {
  display: flex;
}

.flex-wrap {
  flex-wrap: wrap;
}

.flex justify-between {
  justify-content: space-between;
}

.flex items-center {
  align-items: center;
}

.mb-4 {
  margin-bottom: 16px;
}

.mb-6 {
  margin-bottom: 24px;
}

.mr-1 {
  margin-right: 4px;
}

.mr-2 {
  margin-right: 8px;
}

.mr-4 {
  margin-right: 16px;
}

.pt-4 {
  padding-top: 16px;
}

.p-5 {
  padding: 24px;
}

.text-lg {
  font-size: 18px;
}

.text-xl {
  font-size: 22px;
}

.font-bold {
  font-weight: 700;
}

.font-semibold {
  font-weight: 600;
}

.font-medium {
  font-weight: 500;
}

.text-sm {
  font-size: 14px;
}

.border-t {
  border-top: 1px solid;
}

/* 响应式调整 - 与帖子页面统一 */
@media (max-width: 768px) {
  .my-bots-container {
    padding: 20px 15px;
  }

  .form-card {
    padding: 25px 20px;
  }

  .btn {
    padding: 9px 18px;
    font-size: 14px;
  }

  .bots-grid {
    flex-direction: column;
    gap: 20px;
  }

  .bot-card {
    width: 100%;
    min-width: auto;
  }

  .page-title {
    font-size: 24px;
  }
}
</style>
