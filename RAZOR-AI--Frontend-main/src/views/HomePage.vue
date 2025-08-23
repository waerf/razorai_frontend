<!-- filepath: /d:/MyGitHub/razor-ai-frontend/src/views/HomePage.vue -->
<template>
  <div class="homepage">
    <!-- 上部分布局：Logo + 机器人选项卡 + 通知区域 -->
    <div class="top-section">
      <!-- 左侧：Logo 和机器人选项卡 -->
      <div class="left-content">
        <!-- Logo 和名称 -->
        <div class="header">
          <img src="@/assets/images/logo.png" alt="Razor AI" class="logo" />
          <h1 class="title">Razor AI</h1>
        </div>

        <!-- 已经订阅的机器人选项卡和输入框 -->
        <div class="subscribed-robots">
          <el-tabs
            v-model="selectedRobot"
            class="subscribed-tabs"
            @tab-click="handleRobotSelect"
          >
            <el-tab-pane
              v-for="robot in filteredSubscribedRobots"
              :key="robot.agent_id"
              :label="robot.agent_name"
              :name="robot.agent_id.toString()"
            >
            </el-tab-pane>
          </el-tabs>
          <div class="chat-input-section">
            <el-input
              v-model="userInput"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              placeholder="选择机器人并输入您的问题..."
              class="chat-input"
              clearable
            ></el-input>
            <el-button
              class="send-button"
              type="info"
              icon="el-icon-upload2"
              @click="sendMessageToRobot"
              >发送并创建对话</el-button
            >
          </div>
        </div>
      </div>

      <!-- 右侧：通知区域 -->
      <div class="notification-area">
        <div class="notification-header">
          <!-- 左侧占位按钮（不可点击，用于居中） -->
          <el-button
            size="mini"
            class="placeholder-btn"
            disabled
            style="visibility: hidden"
          >
            <i class="el-icon-refresh"></i>
          </el-button>

          <!-- 中间标题 -->
          <h3 class="notification-title">系统通知 ({{ notificationCount }})</h3>

          <!-- 右侧刷新按钮 -->
          <el-button
            size="mini"
            @click="refreshNotifications"
            class="refresh-btn"
            title="刷新通知"
          >
            <i class="el-icon-refresh"></i>
          </el-button>
        </div>

        <div class="notification-list">
          <div
            v-for="(notification, index) in notifications"
            :key="notification.id"
            class="notification-item"
            :class="{
              clicked: notification.clicked,
              unread: notification.status === 0,
            }"
          >
            <div
              class="notification-content"
              @click="handleNotificationClick(index)"
            >
              <div class="notification-text">{{ notification.message }}</div>
              <div class="notification-time">{{ notification.time }}</div>
            </div>
            <div class="notification-actions">
              <el-button
                type="text"
                size="mini"
                icon="el-icon-delete"
                @click.stop="deleteNotification(index)"
                class="delete-btn"
                title="删除通知"
              ></el-button>
            </div>
          </div>

          <!-- 无通知时的提示 -->
          <div v-if="notifications.length === 0" class="no-notifications">
            暂无通知
          </div>
        </div>
      </div>
    </div>

    <!-- 快速访问区域 -->
    <div class="quick-access-section">
      <h2 class="section-title">快速访问</h2>
      <div class="quick-access-cards">
        <el-card class="quick-access-card" @click.native="goToRobotMarket">
          <div class="quick-access-icon">
            <i class="el-icon-goods"></i>
          </div>
          <div class="quick-access-title">机器人市场</div>
          <div class="quick-access-description">浏览和订阅AI机器人</div>
        </el-card>

        <el-card class="quick-access-card" @click.native="goToSubscribedBots">
          <div class="quick-access-icon">
            <i class="el-icon-star-on"></i>
          </div>
          <div class="quick-access-title">我的订阅</div>
          <div class="quick-access-description">管理已订阅的机器人</div>
        </el-card>

        <el-card class="quick-access-card" @click.native="goToCreateBots">
          <div class="quick-access-icon">
            <i class="el-icon-plus"></i>
          </div>
          <div class="quick-access-title">创建机器人</div>
          <div class="quick-access-description">创建自定义AI机器人</div>
        </el-card>

        <el-card
          class="quick-access-card"
          @click.native="goToConversationHistory"
        >
          <div class="quick-access-icon">
            <i class="el-icon-chat-line-round"></i>
          </div>
          <div class="quick-access-title">对话历史</div>
          <div class="quick-access-description">查看聊天记录</div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import user from '@/store/user';
import { mapActions, mapState } from 'vuex';
import { saveChatHistory as apisaveChatHistory } from '../utils/api'; // 保存对话
import { sendMessage as apisendMessage } from '../utils/api'; // 发送消息
import { createChat as apicreateChat } from '../utils/api'; // 创建对话
import { closeChat as apicloseChat } from '../utils/api'; // 关闭对话
import { deleteChat as apideleteChat } from '../utils/api'; // 删除对话
import {
  getUserNotifications,
  markNotificationAsRead,
  deleteNotificationById,
} from '../utils/api'; // 通知相关API
export default {
  data() {
    return {
      selectedRobot: null, // 当前选中的机器人
      userInput: '', // 用户输入内容
      loading: false, // 加载状态
      notifications: [], // 通知列表，从API获取
      notificationCount: 0, // 通知总数
    };
  },
  computed: {
    ...mapState('user', ['isLoggedIn', 'userName', 'userId', 'token']), // 绑定 Vuex 状态，当信息改变时，自动更新
    ...mapState('agent', {
      haveSubscribed: (state) => state.haveSubscribed,
    }),
    filteredSubscribedRobots() {
      return this.haveSubscribed.filter((robot) => robot.status);
    },
  },
  watch: {
    // 监听路由变化，每次跳转时刷新通知
    $route: {
      handler(to, from) {
        // 只有在路由真正发生变化且用户已登录时才刷新
        if (to.path !== from?.path && this.isLoggedIn && this.userId) {
          this.refreshNotifications();
        }
      },
      immediate: false,
    },
  },
  created() {
    this.getUserSubscriptions(); // 获取用户订阅列表
    // 只有在用户登录时才获取通知
    if (this.isLoggedIn && this.userId) {
      this.loadUserNotifications(); // 获取用户通知列表
    }
  },
  methods: {
    ...mapActions('agent', ['fetchUserSubscriptions']),
    async getUserSubscriptions() {
      try {
        const user_id = user.state.userId;
        console.log('user_id:', user_id);
        const response = await this.fetchUserSubscriptions(user_id);
        console.log(
          'subscribed agents:',
          this.$store.state.agent.haveSubscribed
        );
        if (this.$store.state.agent.haveSubscribed.length === 0) {
          this.$message.info('您还没有订阅任何机器人');
        } else {
          this.$message.success('获取订阅机器人列表成功');
          this.selectedRobot = this.haveSubscribed[0].agent_id.toString(); // 默认选择第一个机器人
        }
        console.log('response from getUserSubscriptions:', response);
      } catch (error) {
        console.error('error in getUserSubscriptions:', error);
      }
    },
    truncate(text, length = 20) {
      if (text === null || text === undefined) {
        return '';
      }
      return text.length > length ? text.slice(0, length) + '...' : text;
    },
    async sendMessageToRobot() {
      if (this.userInput.trim() && this.selectedRobot) {
        // 名字为时间戳YMD+时间格式(精确到时分)
        const defaultName =
          new Date().toLocaleDateString().replace(/\//g, '') +
          new Date().toLocaleTimeString().slice(0, 5);

        // 第一步，创造对话
        // 第二步，发送消息
        // 第三步, 保存用户发送消息和机器人回复消息
        // 第四步，获取对话详细信息
        // 第五步，更新对话列表
        // 第六步，转到对话详细页面

        // 第一步，创造对话, 获得chat_id
        const chat_id = await this.createChatinHome(defaultName);
        if (!chat_id) {
          this.$message.error('无法创建对话，请稍后重试');
          return;
        }
        // 第二步，发送消息
        const answer = await this.sendMessageinHome(chat_id, this.userInput);
        if (!answer || !answer.content) {
          this.$message.error('无法发送消息，请稍后重试');
          await this.closeChatinHome(chat_id);
          await this.deleteChatinHome(chat_id);
          return;
        }
        // 获取当前选中的机器人信息
        const currentRobot = this.haveSubscribed.find(
          (robot) => robot.agent_id.toString() === this.selectedRobot
        );
        this.$message.success(
          `已向机器人 ${currentRobot?.agent_name || '未知机器人'} 发送消息: ${this.userInput} 名称: ${defaultName} chat_id: ${chat_id}`
        );
        console.log('answer.content:', answer.content);
        console.log('answer.role:', answer.role);
        this.userInput = '';

        // 第三步，保存用户发送消息和机器人恢复信息到数据库
        const responseFromSave = await this.saveChatHistoryinHome(chat_id);
        if (responseFromSave.status === 200) {
          console.log('保存对话成功:', responseFromSave);
        } else {
          this.$message.error('保存对话失败:', responseFromSave.message);
          await this.closeChatinHome(chat_id);
          await this.deleteChatinHome(chat_id);
          return;
        }
        console.log('responseFromSave:', responseFromSave);

        // 第四步，关闭会话
        const responseFromClose = await this.closeChatinHome(chat_id);
        if (responseFromClose.status === 200) {
          this.$message.success('关闭对话成功:', responseFromClose.message);
        } else {
          this.$message.error('关闭对话失败:', responseFromClose.message);
          await this.deleteChatinHome(chat_id);
          return;
        }

        // 第五步，刷新并跳转到对话详情页面
        await this.handleReloadAndNavigate(chat_id);
        // await location.reload(); // 刷新页面
        // await this.$router.replace({
        //   name: 'ChatRobot',
        //   params: { id: chat_id },
        // });
      } else {
        this.$message.warning('请选择机器人并输入内容');
      }
    },

    async handleReloadAndNavigate(chat_id) {
      try {
        // 跳转到目标页面，使用 replace 以替换当前历史记录
        await this.$router.replace({
          name: 'ChatRobot',
          params: { id: chat_id },
        });
      } catch (error) {
        console.error('导航失败:', error);
      } finally {
        // 刷新页面
        this.$message.success('刷新页面');
        location.reload(); // 刷新页面
      }
    },

    async deleteChatinHome(id) {
      try {
        const response = await apideleteChat({ chat_id: id });
        if (response.status === 200) {
          console.log('删除对话成功:', response);
        } else {
          console.error('删除对话失败:', response);
        }
        return response;
      } catch (error) {
        console.error('error in deleteChatinHome:', error);
      }
    },

    async createChatinHome(defaultName) {
      try {
        // 根据this.selectedRobot获取agent_id
        const robot = this.haveSubscribed.find(
          (robot) => robot.agent_id.toString() === this.selectedRobot
        );
        if (!robot || !robot.agent_id) {
          this.$message.error('无法获取机器人信息，请稍后重试');
          return;
        } else {
          console.log('robot:', robot);
          const payload = {
            agent_id: robot.agent_id,
            user_id: user.state.userId,
            name: defaultName,
          };
          console.log('xxxxxpayload:', payload);
          const responseFromCreate = await apicreateChat(payload);
          if (responseFromCreate.status === 200) {
            console.log('创建对话成功:', responseFromCreate);
            console.log(
              'response.data.chat_id:',
              responseFromCreate.data.chat_id
            );
            return responseFromCreate.data.chat_id;
          } else {
            console.error('创建对话失败:', responseFromCreate);
          }
        }
      } catch (error) {
        console.error('error in sendMessageToRobot:', error);
      }
    },
    async sendMessageinHome(chat_id, content) {
      // try {
      //   const payload = {
      //     chat_id: chat_id,
      //     content: content,
      //   };
      //   console.log('xxxxxpayload:', payload);
      //   const response = await apisendMessage(payload);
      //   if (response.status === 200) {
      //     console.log('发送消息成功:', response);
      //     return response.data;
      //   } else {
      //     console.error('发送消息失败:', response);
      //   }
      //   console.log('test-response:', response);
      // } catch (error) {
      //   console.error('出错在sendMessageinHome:', error);
      // }
      const payload = {
        chat_id: chat_id,
        content: content,
      };
      console.log('xxxxxpayload:', payload);
      const response = await apisendMessage(payload);
      if (response.status === 200) {
        console.log('发送消息成功:', response);
        return response.data;
      } else {
        console.error('发送消息失败:', response);
      }
      console.log('test-response:', response);
    },
    async saveChatHistoryinHome(id) {
      try {
        const response = await apisaveChatHistory({ chat_id: id });
        if (response.status === 200) {
          console.log('保存对话成功:', response);
        } else {
          console.error('保存对话失败:', response);
        }
        return response;
      } catch (error) {
        console.error('error in saveChatHistoryinHome:', error);
      }
    },
    async closeChatinHome(id) {
      try {
        const response = await apicloseChat({ chat_id: id });
        if (response.status === 200) {
          console.log('关闭对话成功:', response);
        } else {
          console.error('关闭对话失败:', response);
        }
        return response;
      } catch (error) {
        console.error('error in closeChatinHome:', error);
      }
    },

    // === 通知相关方法开始 ===
    // 加载用户通知
    async loadUserNotifications() {
      try {
        if (!this.userId) {
          console.warn('用户未登录，无法获取通知');
          return;
        }

        const response = await getUserNotifications(this.userId);
        console.log('获取通知响应:', response);

        if (response.status === 200 && response.data) {
          // 使用 response.data.notifications 获取通知数组
          const notifications = response.data.notifications || [];
          this.notificationCount = response.data.count || 0;

          // 处理通知数据，添加clicked状态和格式化时间
          this.notifications = notifications.map((notification) => ({
            id: notification.id,
            message: notification.message,
            time: this.formatNotificationTime(notification.createdAt),
            status: notification.status, // 0: 未读, 1: 已读
            type: notification.type,
            clicked: notification.status === 1, // 已读状态映射为clicked
            createdAt: notification.createdAt,
          }));

          console.log('成功加载通知:', this.notifications);
        } else {
          console.error('获取通知失败:', response);
          this.$message.error('获取通知失败，请稍后重试');
        }
      } catch (error) {
        console.error('加载通知时出错:', error);
        // 不显示错误消息，避免影响用户体验
      }
    },

    // 格式化通知时间
    formatNotificationTime(createdAt) {
      const now = new Date();
      const notificationTime = new Date(createdAt);
      const diffMs = now - notificationTime;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMinutes < 60) {
        return `${diffMinutes}分钟前`;
      } else if (diffHours < 24) {
        return `${diffHours}小时前`;
      } else {
        return `${diffDays}天前`;
      }
    },

    // 处理通知点击事件
    async handleNotificationClick(index) {
      const notification = this.notifications[index];

      try {
        // 如果通知未读，标记为已读
        if (notification.status === 0) {
          const response = await markNotificationAsRead(notification.id);
          console.log('标记通知已读响应:', response);

          if (response.status === 200) {
            // 更新本地状态
            this.notifications[index].status = 1;
            this.notifications[index].clicked = true;
            this.$message.success('通知已标记为已读');
          } else {
            console.error('标记通知已读失败:', response);
            this.$message.error('标记已读失败，请稍后重试');
            return;
          }
        } else {
          // 如果已读，只是切换本地显示状态
          this.notifications[index].clicked =
            !this.notifications[index].clicked;
        }
      } catch (error) {
        console.error('处理通知点击时出错:', error);
        this.$message.error('操作失败，请稍后重试');
      }
    },

    // 删除通知
    async deleteNotification(index) {
      const notification = this.notifications[index];

      try {
        const response = await deleteNotificationById({
          id: notification.id,
          userId: this.userId,
        });

        console.log('删除通知响应:', response);

        if (response.status === 200) {
          // 从本地列表中移除
          this.notifications.splice(index, 1);
          this.notificationCount = Math.max(0, this.notificationCount - 1);
          this.$message.success('通知已删除');
        } else {
          console.error('删除通知失败:', response);
          this.$message.error('删除失败，请稍后重试');
        }
      } catch (error) {
        console.error('删除通知时出错:', error);
        this.$message.error('删除失败，请稍后重试');
      }
    },

    // 刷新通知列表（在路由变化时调用）
    async refreshNotifications() {
      if (this.isLoggedIn && this.userId) {
        await this.loadUserNotifications();
      }
    },
    // === 通知相关方法结束 ===

    handleRobotSelect(tab) {
      this.selectedRobot = tab.name; // 当前选择机器人（agent_id的字符串形式）
      const robot = this.haveSubscribed.find(
        (r) => r.agent_id.toString() === tab.name
      );
      const robotName = robot ? robot.agent_name : '未知机器人';
      this.$message.info(`已切换至机器人: ${robotName}`);
    },

    // 导航方法
    goToRobotMarket() {
      this.$router.push({ name: 'RobotMarket' });
    },

    goToSubscribedBots() {
      this.$router.push({ name: 'SubscribedBots' });
    },

    goToCreateBots() {
      this.$router.push({ name: 'CreateBots' });
    },

    goToConversationHistory() {
      // 如果没有订阅的机器人，提示用户
      if (this.haveSubscribed.length === 0) {
        this.$message.warning('您还没有任何对话记录');
        return;
      }
      // 跳转到第一个机器人的对话历史
      const firstRobot = this.haveSubscribed[0];
      this.$router.push({
        name: 'ConversationHistory',
        params: { id: firstRobot.agent_id },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;
.homepage {
  padding: 20px;
  display: flex;
  flex-direction: column;

  .top-section {
    display: flex;
    margin-bottom: 30px;
    gap: 20px;

    .left-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;

      .header {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 20px;

        .logo {
          width: 100px;
          height: 100px;
        }

        .title {
          font-size: 2rem;
          color: $primary-color;
        }
      }

      .subscribed-robots {
        width: 80%;
        display: flex;
        flex-direction: column;
        align-items: center;

        .subscribed-tabs {
          width: 100%;
        }

        .chat-input-section {
          display: flex;
          align-items: center;
          margin-top: 15px;
          width: 100%;

          .chat-input {
            flex: 1;
            margin-right: 15px;
          }

          .send-button {
            width: 25%;
            height: 100%;
          }
        }
      }
    }

    .notification-area {
      width: 15vw;
      padding: 1vh 1vw;
      background-color: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;

      .notification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;

        .notification-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: $text-color;
          text-align: center;
          margin: 0;
          flex: 1;
        }

        .refresh-btn {
          font-size: 0.8rem;
          padding: 5px 8px;
          color: #666;
          border: 1px solid #ddd;
          background: white;

          &:hover {
            color: $accent-color;
            border-color: $accent-color;
          }
        }

        .placeholder-btn {
          font-size: 0.8rem;
          padding: 5px 8px;
          pointer-events: none;
        }
      }

      .notification-list {
        .notification-item {
          background: white;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 10px;
          border: 1px solid #e9ecef;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          justify-content: space-between;
          align-items: center;

          &.unread {
            border-left: 3px solid #f56c6c;
            background-color: #ffebee;
            color: #d32f2f;
          }

          &:hover {
            background-color: #f0f0f0;
          }

          &.clicked {
            background-color: white;
            color: #333;
            border-color: #e9ecef;
          }

          &:last-child {
            margin-bottom: 0;
          }

          .notification-content {
            flex: 1;
            cursor: pointer;

            .notification-text {
              font-size: 0.9rem;
              line-height: 1.4;
              margin-bottom: 5px;
              word-wrap: break-word;
            }

            .notification-time {
              font-size: 0.8rem;
              color: #666;
              text-align: right;
            }
          }

          .notification-actions {
            margin-left: 8px;

            .delete-btn {
              color: #999;
              padding: 4px;

              &:hover {
                color: #f56c6c;
              }
            }
          }
        }

        .no-notifications {
          text-align: center;
          color: #999;
          font-size: 0.9rem;
          padding: 20px;
        }
      }
    }
  }

  .quick-access-section {
    width: 100%;
    max-width: 1200px;
    align-self: center;

    .section-title {
      font-size: 1.75rem;
      margin-top: 0;
      margin-bottom: 30px;
      text-align: center;
      color: $text-color;
    }

    .quick-access-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;

      .quick-access-card {
        cursor: pointer;
        transition: all 0.3s ease;
        border: 1px solid $border-color;
        text-align: center;
        padding: 30px 20px;

        &:hover {
          transform: translateY(-5px);
          box-shadow: $box-shadow-medium;
          background-color: $hover-background-color;
        }

        .quick-access-icon {
          font-size: 3rem;
          color: $accent-color;
          margin-bottom: 15px;

          i {
            display: block;
          }
        }

        .quick-access-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: $text-color;
          margin-bottom: 10px;
        }

        .quick-access-description {
          font-size: 0.9rem;
          color: $secondary-color;
          line-height: 1.4;
        }
      }
    }
  }
}
</style>
