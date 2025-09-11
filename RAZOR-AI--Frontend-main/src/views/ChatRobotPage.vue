<template>
  <div class="chat-page">
    <div class="content-container">
      <!-- 标题栏 -->
      <el-card class="header-card">
        <div class="header-content">
          <div class="title-section">
            <h1 class="main-title">
              <i class="el-icon-comments-o title-icon"></i>
              机器人对话
            </h1>
          </div>
          <div class="action-section">
            <!-- 导出按钮 -->
            <el-button
              @click="exportChatAsTXT"
              class="export-btn"
              icon="el-icon-download"
            >
              导出对话记录
            </el-button>

            <!-- 返回按钮 -->
            <router-link to="/conversationHistory">
              <el-button class="back-btn" icon="el-icon-back">
                返回对话历史
              </el-button>
            </router-link>
          </div>
        </div>
      </el-card>

      <!-- 对话信息卡片 -->
      <el-card class="info-card">
        <div class="info-item">
          <span class="info-label">会话名称:</span>
          <span class="info-value">{{ chattitle || '未命名会话' }}</span>
        </div>
        <div class="info-item timestamp">
          <span class="info-value">{{ new Date().toLocaleString() }}</span>
        </div>
      </el-card>

      <!-- 聊天窗口 -->
      <el-card class="chat-card">
        <div class="chat-window">
          <div class="chat-log" id="chat-log" ref="chatlog">
            <!-- 欢迎消息 -->
            <div v-if="messages.length === 0" class="welcome-message">
              <p>
                👋 您好！我是{{ currentChat?.name || '你的机器人小助手' }},
                有什么可以帮助您的吗？
              </p>
            </div>

            <div
              v-for="(msg, index) in messages"
              :key="index"
              :class="{
                'message-wrapper': true,
                'user-message-wrapper': msg.role === 'user',
                'bot-message-wrapper': msg.role === 'assistant',
              }"
              class="message-appear"
            >
              <!-- 机器人消息头像 -->
              <img
                v-if="msg.role === 'assistant'"
                :src="currentAgentAvatar"
                alt="机器人头像"
                class="avatar"
              />
              <!-- 消息气泡框 -->
              <div
                :class="{
                  'message-bubble': true,
                  'user-message': msg.role === 'user',
                  'bot-message': msg.role === 'assistant',
                }"
              >
                <div class="message-content">{{ msg.content }}</div>
              </div>
              <!-- 用户消息头像 -->
              <img
                v-if="msg.role === 'user'"
                :src="currentUserAvatar"
                alt="用户头像"
                class="avatar"
              />
            </div>
          </div>

          <div class="input-container">
            <el-input
              v-model="newMessage"
              placeholder="输入您想聊的内容..."
              @keyup.enter.native="sendMessage()"
              class="message-input"
              clearable
              style="padding-right: 74px"
            >
              <template slot="append">
                <button
                  class="custom-send-btn"
                  @click="sendMessage()"
                  :disabled="!newMessage.trim()"
                  :class="{ 'send-btn-disabled': !newMessage.trim() }"
                >
                  <!-- 图标+文字组合，hover时文字展开 -->
                  <span class="send-icon">
                    <i class="el-icon-paper-plane"></i>
                  </span>
                  <span class="send-text">发送</span>
                </button>
              </template>
            </el-input>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import {
  fetchChatDetailedHistory as apifetchChatDetailedHistory,
  closeChat as apicloseChat,
  saveChatHistory as apisaveChatHistory,
  sendMessage as apisendMessage,
  createChat as apicreateChat,
  getChatTitle as apigetChatTitle,
  getUserAvatar as apigetUserAvatar,
  getAgentAvatar as apigetAgentAvatar,
  fetchAllChats as apifetchAllChats,
} from '../utils/api';
import { mapActions } from 'vuex';

export default {
  name: 'ChatRobot',
  data() {
    return {
      newMessage: '',
      messages: [],
      userAvatar: require('@/assets/images/Avatar/User.png'),
      botAvatar: require('@/assets/images/Avatar/Assistant.png'),
      currentUserAvatar: '',
      currentAgentAvatar: '',
      currentChat: {},
      chatId: null,
      agentId: null,
      isHistoryChat: false,
      isFirstmessage: false,
      chattitle: '',
      hasHandledInitMessage: false,
    };
  },

  async created() {
    this.chatId = this.$route.params.chatId;
    this.chattitle = this.$route.params.chatTitle || '未命名';
    const initMessage = this.$route.query.initMessage;

    this.isFirstmessage = ['未命名', '', undefined, null].includes(
      this.chattitle
    );
    console.log('是否为首次发送消息:', this.isFirstmessage);

    this.isHistoryChat = !!this.chatId && this.chatId !== 'null';
    console.log('是否为历史对话:', this.isHistoryChat);

    await this.createNewChat();

    await this.initAvatars();

    if (this.chatId && this.chatId !== 'null') {
      await this.getChatHistory();
    }

    if (initMessage && !this.hasHandledInitMessage) {
      this.sendMessage(initMessage);
      this.hasHandledInitMessage = true;
    }
  },

  beforeRouteLeave(to, from, next) {
    this.switchChat();
    this.messages = [];
    this.isHistoryChat = false;
    console.log('离开路由，保存并清空消息');
    next();
  },

  beforeRouteUpdate(to, from, next) {
    const newId = to.params.chatId;
    const oldId = from?.params?.chatId;

    console.log('[路由更新触发]', oldId, '=>', newId);

    // 如果存在旧会话，做清理工作
    if (oldId && oldId !== 'null') {
      this.saveChat(oldId);
      console.log('[保存旧会话]', oldId);
    }

    if (newId && newId !== 'null') {
      console.log('[切换到新会话]', newId);

      // 更新 chatId
      this.chatId = newId;

      // 清空消息
      this.messages = [];

      // 重置历史聊天标志
      this.isHistoryChat = false;
    }

    next();
  },

  methods: {
    ...mapActions('chat', ['getChatByID']),

    async initAvatars() {
      // 1. 获取用户头像
      this.targetUserId = this.$store.state.user?.userId;
      if (this.targetUserId) {
        this.currentUserAvatar = await this.getUserAvatar(this.targetUserId);
        console.log('用户头像已设置:', this.currentUserAvatar);
      } else {
        // 无userId时，直接用默认用户头像
        this.currentUserAvatar = this.userAvatar;
        console.warn('未获取到用户ID，使用默认用户头像');
      }

      // 2. 获取机器人头像
      this.targetAgentId = this.agentId;
      console.log('路由参数 agentId:', this.targetAgentId);
      if (this.targetAgentId) {
        this.currentAgentAvatar = await this.getAgentAvatar(this.targetAgentId);
      } else {
        // 无agentId时，直接用默认机器人头像
        this.currentAgentAvatar = this.botAvatar;
        console.warn('未获取到机器人ID，使用默认机器人头像');
      }
    },

    async getUserAvatar(userId) {
      try {
        const response = await apigetUserAvatar(userId);
        const apiAvatarUrl = response?.data.avatar_url;
        console.log('获取用户头像响应:', response);
        return apiAvatarUrl ? apiAvatarUrl : this.userAvatar;
      } catch (error) {
        console.error(`获取用户[${userId}]头像失败:`, error);
        return this.userAvatar;
      }
    },

    async getAgentAvatar(agentId) {
      try {
        const response = await apigetAgentAvatar(agentId);
        console.log('获取机器人头像响应:', response);
        const apiAvatarUrl = response?.data.robot_image;
        return apiAvatarUrl ? apiAvatarUrl : this.botAvatar;
      } catch (error) {
        console.error(`获取机器人[${agentId}]头像失败:`, error);
        return this.botAvatar;
      }
    },

    async getChatTitle() {
      try {
        const response = await apigetChatTitle(this.chatId);
        console.log('获取聊天标题响应:', response);
        if (response.status === 200) {
          const newTitle = response.data.title || '无标题';
          this.chattitle = newTitle;
          console.log('获取聊天标题成功:', newTitle);

          try {
            await this.$router.push({
              name: 'ChatRobot',
              params: { chatId: this.chatId, chatTitle: newTitle },
            });
          } catch (error) {
            if (!error.message.includes('Avoided redundant navigation')) {
              console.error('路由跳转错误:', error);
            }
          }
        }
      } catch (error) {
        console.error('获取聊天标题失败:', error);
      }
    },

    async getChatHistory() {
      try {
        const response = await apifetchChatDetailedHistory(this.chatId);
        console.log('获取聊天记录响应:', response);
        if (response.status === 200) {
          this.messages = response.data || [];
        }
        this.$nextTick(() => this.scrollToBottom());
      } catch (error) {
        console.error('获取聊天记录失败:', error);
      }
    },

    async saveChat(chatId) {
      if (!chatId) return;
      try {
        const response = await apisaveChatHistory({ chat_id: chatId });
        console.log('保存聊天记录响应:', response);
      } catch (error) {
        console.error('保存聊天记录失败:', error);
      }
    },

    async createNewChat() {
      try {
        if (this.isHistoryChat) {
          if (!this.chatId) {
            console.error('历史对话启动失败：缺少chatId');
            return;
          }

          const requestBody = {
            name: 'string',
            agentId: -1,
            userId: -1,
            chatId: this.chatId,
          };
          console.log('历史对话启动 - 请求体:', requestBody);
          const historyRes = await apicreateChat(requestBody);
          this.agentId = historyRes.data.agent_id;
          console.log('历史对话启动 - API响应:', historyRes);

          return;
        }

        const { agentId, userId, name } = this.$route.query;
        if (!agentId || !userId) {
          console.error('首次创建对话失败：缺少agentId或userId');
          return;
        }

        const requestBody = {
          name: name,
          agentId,
          userId,
          chatId: this.chatId,
        };
        console.log('首次创建对话 - 请求体:', requestBody);

        const createRes = await apicreateChat(requestBody);
        this.agentId = createRes.data.agent_id;
        console.log('首次创建对话 - API响应:', createRes);

        if (createRes.data.chat_id) {
          this.chatId = createRes.data.chat_id;
          this.currentChat = createRes.data;
          this.$router.replace(`/chatRobot/${this.chatId}`);
        }
      } catch (error) {
        if (this.isHistoryChat) {
          console.error('历史对话启动失败:', error);
        } else {
          console.error('首次创建对话失败:', error);
        }
      }
    },

    async sendMessage(content) {
      const messageContent = content || this.newMessage.trim();
      if (!messageContent) return;

      // 先显示用户消息
      this.messages.push({ content: messageContent, role: 'user' });
      if (!content) {
        this.newMessage = '';
      }

      this.$nextTick(() => this.scrollToBottom());

      try {
        const response = await apisendMessage({
          chat_id: this.chatId,
          content: messageContent,
        });

        console.log('发送消息:', messageContent);
        console.log('接口返回:', response);

        if (response.status === 200) {
          this.messages.push({
            content: response.data.content,
            role: 'assistant',
          });
        } else {
          console.error('接口状态码异常:', response.status, response.data);
          this.messages.push({
            content: '对不起，我暂时无法回复。',
            role: 'assistant',
          });
        }
      } catch (error) {
        if (error.response) {
          console.error(
            '请求失败 - 响应错误:',
            error.response.status,
            error.response.data
          );
        } else if (error.request) {
          console.error('请求失败 - 没有收到响应:', error.request);
        } else {
          console.error('请求配置错误:', error.message);
        }

        this.messages.push({
          content: '对不起，服务暂时不可用。',
          role: 'assistant',
        });
      } finally {
        this.$nextTick(() => this.scrollToBottom());

        if (this.isFirstmessage) {
          await this.saveChat(this.chatId);
          console.log('首次发送未命名对话消息，开始获取标题...');
          await this.getChatTitle();
          this.isFirstmessage = false;
          const result = await apifetchAllChats({
            userId: this.$store.state.user?.userId,
          });
          this.$store.commit('chat/SET_CHATS', result.data || []);
        }
      }
    },

    scrollToBottom() {
      const chatLog = this.$refs.chatlog;
      if (chatLog) {
        chatLog.scrollTop = chatLog.scrollHeight;
      }
    },

    async exportChatAsTXT() {
      if (!this.chatId) {
        this.$message.warning('当前会话不存在');
        return;
      }
      this.$message.info('正在导出对话记录，请稍候...');

      try {
        // 1. 先保存当前对话记录
        this.saveChat(this.chatId);
        console.log('聊天记录已保存，开始导出TXT');

        // 2. 获取后端聊天记录
        const res = await apifetchChatDetailedHistory(this.chatId);
        let records = res.data || [];
        console.log('获取的聊天记录:', records);

        if (records.length === 0) {
          this.$message.warning('当前没有对话记录可导出');
          return;
        }

        // 逆转数组，让最早的消息在前
        records = records.slice().reverse();

        // 3. 生成 TXT 内容
        console.log('currentChat:', this.currentChat);
        let txtContent = `对话记录 - ${this.currentChat?.title || '未知会话'}\n`;
        txtContent += `导出时间: ${new Date().toLocaleString()}\n\n`;

        records.forEach((msg) => {
          const role =
            msg.role === 'user'
              ? '我'
              : this.currentChat?.agent_name || '机器人';
          txtContent += `${role}: ${msg.content}\n\n`;
        });

        // 4. 创建下载链接
        const blob = new Blob([txtContent], {
          type: 'text/plain;charset=utf-8',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentChat?.name || 'chat'}_${Date.now()}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);

        this.$message.success('对话记录已成功导出为 TXT！');
      } catch (error) {
        console.error('导出 TXT 失败:', error);
        this.$message.error('导出失败，请稍后重试');
      }
    },

    async switchChat() {
      if (!this.chatId) {
        this.$message.warning('当前会话不存在，无法切换');
        return;
      }

      try {
        // 1. 保存聊天记录
        this.saveChat(this.chatId);
        console.log('切换前聊天记录已保存');

        // 2. 关闭内存会话
        const response = await apicloseChat({ chat_id: this.chatId });

        if (response.status === 200) {
          console.log('切换对话成功：', response.data);
          this.$message.success(response.data.message || '切换对话成功');
        }
      } catch (error) {
        console.error('切换对话异常:', error);
        this.$message.error(
          error?.response?.data?.message || '网络错误，切换对话失败'
        );
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

// 主色调调整为更现代的蓝色
$primary-color: #409eff;
$primary-light: #e6f7ff;
$primary-dark: #1890ff;
$text-primary: #303133;
$text-secondary: #606266;
$bg-light: #f5f7fa;
$border-radius: 12px;
$shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
$shadow-hover: 0 6px 16px rgba(0, 0, 0, 0.08);

.chat-page {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(180deg, $bg-light 0%, #fff 100%);

  .content-container {
    max-width: 1000px;
    margin: 0 auto;
  }

  .header-card {
    margin-bottom: 20px;
    border-radius: $border-radius;
    box-shadow: $shadow;
    border: none;
    overflow: hidden;
    background: #fff;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: $shadow-hover;
    }

    .header-content {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      padding: 20px 30px;
      gap: 20px;

      .title-section {
        .main-title {
          font-size: 1.8rem;
          color: $text-primary;
          font-weight: 600;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 10px;

          .title-icon {
            font-size: 1.5em;
          }
        }

        .sub-title {
          color: $text-secondary;
          font-size: 0.95rem;
          padding-left: 34px;
        }
      }

      .action-section {
        display: flex;
        gap: 10px; // 按钮间距

        .export-btn,
        .back-btn,
        .exit-btn {
          background: $primary-light;
          color: $primary-color;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          transition: all 0.2s ease;

          &:hover {
            background: $primary-color;
            color: white;
            transform: translateY(-2px);
          }
        }
      }
    }
  }

  .info-card {
    margin-bottom: 20px;
    border-radius: $border-radius;
    box-shadow: $shadow;
    border: none;
    padding: 18px 30px;
    background: #fff;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: $shadow-hover;
    }

    .chat-info {
      display: flex;
      flex-wrap: wrap;
      gap: 25px;
      align-items: center;

      .info-item {
        display: flex;
        align-items: center;

        .info-label {
          color: $text-secondary;
          margin-right: 8px;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .info-value {
          color: $text-primary;
          font-weight: 500;
          font-size: 1rem;
        }
      }

      .timestamp {
        margin-left: auto;
        .info-value {
          color: $text-secondary;
          font-size: 0.85rem;
        }
      }
    }
  }

  .chat-card {
    border-radius: $border-radius;
    box-shadow: $shadow;
    border: none;
    overflow: hidden;
    background: #fff;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: $shadow-hover;
    }

    .chat-window {
      display: flex;
      flex-direction: column;
      height: 600px;

      .chat-log {
        flex: 1;
        padding: 30px;
        overflow-y: auto;
        background-color: $bg-light;
        background-image: radial-gradient(
          circle at 10px 10px,
          rgba(64, 158, 255, 0.05) 1px,
          transparent 0
        );
        background-size: 20px 20px;

        &::-webkit-scrollbar {
          width: 6px;
        }

        &::-webkit-scrollbar-thumb {
          background-color: rgba(64, 158, 255, 0.3);
          border-radius: 3px;
        }

        .welcome-message {
          text-align: center;
          padding: 20px;
          color: $text-secondary;
          font-size: 1rem;
          margin-top: 20px;
        }

        .message-wrapper {
          display: flex;
          align-items: flex-end;
          margin-bottom: 20px;
          max-width: 100%;
          animation: fadeIn 0.3s ease forwards;
          opacity: 0;
        }

        .message-appear {
          animation: fadeIn 0.3s ease forwards;
        }

        .user-message-wrapper {
          justify-content: flex-end;
        }

        .bot-message-wrapper {
          justify-content: flex-start;
        }

        .avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          margin: 0 12px;
          flex-shrink: 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease;

          &:hover {
            transform: scale(1.05);
          }
        }

        .message-bubble {
          max-width: 70%;
          padding: 12px 18px;
          border-radius: 18px;
          word-wrap: break-word;
          line-height: 1.6;
          position: relative;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);

          .message-content {
            margin-bottom: 5px;
          }

          .message-time {
            font-size: 0.75rem;
            opacity: 0.7;
            text-align: right;
          }
        }

        .user-message {
          background-color: $primary-color;
          color: white;
          border-top-right-radius: 4px;
        }

        .bot-message {
          background-color: white;
          color: $text-primary;
          border-top-left-radius: 4px;
        }
      }

      .input-container {
        padding: 20px 30px;
        background-color: #fff;
        border-top: 1px solid #f0f0f0;

        .message-input {
          width: 100%;

          :deep(.el-input__inner) {
            border-radius: 25px;
            padding: 12px 20px;
            border-color: #e0e0e0;
            font-size: 1rem;
            transition: all 0.2s ease;

            &:focus {
              border-color: $primary-color;
              box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
            }
          }

          :deep(.el-button) {
            background-color: $primary-color;
            color: white;
            border-radius: 25px;
            width: 120px;
            padding: 10px 16px;
            margin-right: 5px;
            margin-left: 0;
            transition: all 0.2s ease;
            align-items: center;
            justify-content: center;

            &:hover {
              background-color: $primary-dark;
              transform: translateY(-2px);
            }

            &:disabled {
              background-color: #f0f0f0;
              color: #aaa;
              cursor: not-allowed;
              transform: none;
            }
          }
        }
      }
    }
  }
}

// 动画效果
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .chat-page {
    padding: 10px;

    .header-content {
      padding: 15px 20px;
    }

    .chat-window {
      height: 500px;
    }

    .chat-log {
      padding: 15px !important;
    }

    .message-bubble {
      max-width: 85% !important;
      padding: 10px 15px !important;
    }

    .input-container {
      padding: 15px !important;
    }

    .info-card {
      padding: 15px 20px !important;
    }

    .chat-info {
      gap: 15px !important;
      flex-direction: column;
      align-items: flex-start !important;
    }

    .timestamp {
      margin-left: 0 !important;
      align-self: flex-end !important;
    }
  }
}

.custom-send-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background-color: $primary-color;
  color: white;
  border: none;
  border-radius: 0px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  height: 100%;
  min-width: 70px;

  &:hover {
    background-color: $primary-dark;
    transform: translateY(-2px);
  }

  &.send-btn-disabled {
    background-color: #f0f0f0;
    color: #aaa;
    cursor: not-allowed;
    transform: none;
  }

  .send-icon {
    display: flex;
    align-items: center;
    font-size: 16px;
  }

  .send-text {
    white-space: nowrap;
    transition: opacity 0.2s ease;
  }

  // 小屏幕优化
  @media (max-width: 768px) {
    min-width: auto;
    padding: 6px 12px;

    .send-text {
      font-size: 12px;
    }
  }
}

// 调整输入框容器样式配合按钮
.input-container {
  :deep(.el-input-group__append) {
    padding: 0;
    border-left: none;
    background: transparent;
  }

  :deep(.el-input__inner) {
    border-right: none !important;
    border-top-right-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
  }
}
</style>
