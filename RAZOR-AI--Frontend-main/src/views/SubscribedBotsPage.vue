<template>
  <div class="my-bots-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">已订阅的机器人</h1>
      <p class="page-description">
        管理你订阅的所有AI机器人，查看它们的使用情况和有效期
      </p>
    </div>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 搜索区域 -->
      <div class="search-container mb-6">
        <input
          type="text"
          v-model="searchQuery"
          class="search-input"
          placeholder="搜索机器人名称..."
        />
      </div>

      <!-- 机器人列表区域 -->
      <div class="form-card">
        <div class="flex items-center mb-6">
          <h2 class="text-xl font-bold mr-auto">订阅列表</h2>
          <span class="text-gray-500 text-sm"
            >共 {{ filteredRobots.length }} 个机器人</span
          >
        </div>

        <!-- 空状态显示 -->
        <div v-if="filteredRobots.length === 0" class="empty-state">
          <img
            src="https://picsum.photos/id/237/100/100"
            alt="暂无订阅"
            class="empty-img"
          />
          <p class="empty-text">暂无订阅的机器人</p>
          <button class="empty-button" @click="$router.push('/robotMarket')">
            浏览机器人市场
          </button>
        </div>

        <div class="bots-grid" v-else>
          <!-- 机器人卡片：仅保留名称、描述、核心操作按钮 -->
          <div
            v-for="robot in filteredRobots"
            :key="robot.agent_id"
            class="bot-card card-hover"
          >
            <div class="p-5">
              <!-- 1. 机器人名称（核心信息） -->
              <div class="mb-3">
                <h2 class="text-lg font-semibold">{{ robot.agent_name }}</h2>
              </div>

              <!-- 2. 机器人订阅时间（核心信息） -->
              <div class="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                <div class="flex items-center">
                  <i class="fa fa-calendar mr-1"></i>
                  <span>开始: {{ robot.start_time | formatToMinute }}</span>
                </div>
                <div class="flex items-center">
                  <i class="fa fa-calendar-check-o mr-1"></i>
                  <span>结束: {{ robot.end_time | formatToMinute }}</span>
                </div>
              </div>

              <!-- 3. 核心操作按钮：开始对话 + 机器人详情 -->
              <div class="border-t border-gray-100 pt-4 flex justify-between">
                <a
                  href="#"
                  class="text-razor-blue hover:text-razor-darkBlue font-medium flex items-center transition-all hover:pl-1"
                  @click.prevent="startConversation(robot)"
                >
                  <i class="fa fa-comments-o mr-1"></i>
                  开始对话
                </a>

                <button
                  class="unsubscribe-button text-gray-600 hover:text-gray-800 font-medium flex items-center transition-all hover:pr-1"
                  @click="robotDetail(robot.agent_id)"
                >
                  <i class="fa fa-trash-o mr-1"></i>
                  机器人详情
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 机器人详情弹窗 -->
    <robot-detail-dialog
      :visible="robotDetailVisible"
      :robotId="currentRobotId"
      @close="handleRobotDetailClose"
      @show-robot="viewDetails"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { fetchUserSubscriptions as apiFetchUserSubscriptions } from '../utils/api';
import { createChat as apicreateChat } from '../utils/api';
import RobotDetailDialog from './RobotDetailPage.vue';
//import chat from '@/store/chat';

export default {
  name: 'SubscribedBotsPage',
  components: {
    RobotDetailDialog,
  },
  data() {
    return {
      searchQuery: '', // 搜索关键字
      robotDetailVisible: false,
      currentRobotId: null,
      loading: false, // 加载状态
    };
  },
  computed: {
    ...mapState('agent', {
      // 修改：对应state中的haveSubscribed字段
      subscribedRobots: (state) => state.haveSubscribed || [],
      isLoading: (state) => state.loading,
    }),
    filteredRobots() {
      // 注意：这里不能直接调用异步函数，应该使用已经存储在state中的数据
      const robots = this.subscribedRobots;

      if (!this.searchQuery) {
        return robots;
      }
      return robots.filter((robot) =>
        robot.agent_name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  methods: {
    ...mapActions('agent'),

    //获取用户订阅信息
    async getUserSubscriptions() {
      try {
        const userId = this.$store.state.user?.userId;
        if (!userId) {
          this.$message.error('未获取到用户信息，请重新登录');
          return;
        }

        this.loading = true;

        const result = await apiFetchUserSubscriptions(userId);
        console.log('找到订阅机器人结果:', result);

        if (result.status == 200) {
          const subscriptions = this.subscribedRobots;
          console.log('当前订阅机器人列表:', subscriptions);
          if (subscriptions.length === 0) {
            this.$message.info('您当前没有订阅任何机器人');
          } else {
            this.$message.success(
              `成功获取${subscriptions.length}个订阅机器人`
            );
          }
        } else {
          this.$message.warning(`获取订阅列表失败: ${result.message}`);
        }
      } catch (error) {
        console.error('获取订阅列表失败:', error);
        this.$message.error('获取订阅列表时发生网络错误，请重试');
      } finally {
        this.loading = false;
      }
    },

    async startConversation(robot) {
      const userId = this.$store.state.user?.userId;
      if (!userId) {
        this.$message.error('未获取到用户信息，请重新登录');
        return;
      }

      const payload = {
        name: robot.agent_name || `chat_${Date.now()}`,
        agentId: robot.agent_id,
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

    // 打开机器人详情弹窗
    robotDetail(robotId) {
      this.currentRobotId = robotId;
      this.robotDetailVisible = true;
    },

    // 查看机器人详情（用于@show-robot事件）
    viewDetails(robotId) {
      this.currentRobotId = robotId;
      this.robotDetailVisible = true;
    },

    // 关闭机器人详情弹窗并更新数据
    async handleRobotDetailClose() {
      this.robotDetailVisible = false;

      try {
        // 重新获取用户订阅信息，以更新可能的订阅状态变化
        await this.getUserSubscriptions();

        console.log('机器人详情弹窗关闭，订阅数据已更新');
      } catch (error) {
        console.error('更新订阅数据失败:', error);
      }
    },
  },
  created() {
    this.getUserSubscriptions(); // 组件创建时获取用户订阅列表
  },

  filters: {
    formatToMinute(timeStr) {
      if (!timeStr || typeof timeStr !== 'string') {
        return '未设置';
      }

      const date = new Date(timeStr);

      if (isNaN(date.getTime())) {
        return '时间格式错误';
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');

      // 5. 拼接最终格式（如：2025-09-01 17:37）
      return `${year}-${month}-${day} ${hour}:${minute}`;
    },
  },
};
</script>

<style scoped>
/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 50px 0;
}

.empty-img {
  width: 100px;
  height: 100px;
  margin: 0 auto 20px;
  opacity: 0.5;
  border-radius: 50%;
}

.empty-text {
  color: #64748b;
  font-size: 16px;
  margin-bottom: 20px;
}

.empty-button {
  background-color: #0f88eb;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.empty-button:hover {
  background-color: #0a6fcc;
}

/* 星级评分颜色 */
.text-yellow-400 {
  color: #facc15;
}

/* 卡片描述限制行数 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 基础样式 */
.my-bots-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #333;
  background-color: #fff;
  min-height: 100vh;
}

/* 页面标题 */
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

/* 表单卡片样式 */
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

/* 机器人网格布局 */
.bots-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
}

/* 机器人卡片样式 */
.bot-card {
  flex: 1;
  min-width: 300px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

/* 卡片悬停效果 */
.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-6px);
  box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}

/* 状态标签 */
.status-active {
  padding: 3px 10px;
  background-color: #f0fff4;
  color: #166534;
  font-size: 12px;
  border-radius: 12px;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(34, 197, 94, 0.1);
}

/* 过期标签样式 */
.expired-tag {
  position: absolute;
  top: 24px;
  right: 24px;
  padding: 3px 10px;
  background-color: #fff5f5;
  color: #c53030;
  font-size: 12px;
  border-radius: 12px;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(239, 68, 68, 0.1);
  z-index: 1;
}

/* 搜索框样式 */
.search-container {
  text-align: center;
}

.search-input {
  width: 60%;
  padding: 10px 12px;
  font-size: 15px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* 按钮样式 */
.unsubscribe-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
}

/* 链接样式 */
a {
  text-decoration: none;
  transition: all 0.2s ease;
}

/* 自定义颜色 */
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

/* 布局工具类 */
.flex {
  display: flex;
}

.flex-wrap {
  flex-wrap: wrap;
}

.justify-between {
  justify-content: space-between;
}

.items-center {
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

.mb-2 {
  margin-bottom: 8px;
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

/* 响应式调整 */
@media (max-width: 768px) {
  .my-bots-container {
    padding: 20px 15px;
  }

  .form-card {
    padding: 25px 20px;
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

  .search-input {
    width: 100%;
  }
}
</style>
