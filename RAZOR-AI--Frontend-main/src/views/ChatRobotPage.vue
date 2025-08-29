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
            <p class="sub-title">
              与 {{ currentChat?.name || '小助手Bot' }} 的对话
            </p>
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
        <div class="chat-info">
          <div class="info-item">
            <span class="info-label">机器人名称:</span>
            <span class="info-value">{{
              currentChat?.agent_name || '未知'
            }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">会话名称:</span>
            <span class="info-value">{{
              currentChat?.name || '未命名会话'
            }}</span>
          </div>
          <div class="info-item timestamp">
            <span class="info-value">{{ new Date().toLocaleString() }}</span>
          </div>
        </div>
      </el-card>

      <!-- 聊天窗口 -->
      <el-card class="chat-card">
        <div class="chat-window">
          <div class="chat-log" id="chat-log" ref="chatlog">
            <!-- 欢迎消息 -->
            <div v-if="messages.length === 0" class="welcome-message">
              <p>
                👋 您好！我是{{ currentChat?.name || '小助手Bot' }},
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
                :src="botAvatar"
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
                <div class="message-time">
                  {{
                    new Date().toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  }}
                </div>
              </div>
              <!-- 用户消息头像 -->
              <img
                v-if="msg.role === 'user'"
                :src="userAvatar"
                alt="用户头像"
                class="avatar"
              />
            </div>
          </div>

          <div class="input-container">
            <el-input
              v-model="newMessage"
              placeholder="输入您想聊的内容..."
              @keyup.enter="sendMessage"
              class="message-input"
              clearable
            >
              <el-button
                slot="append"
                class="send-btn"
                @click="sendMessage"
                :disabled="!newMessage.trim()"
                icon="el-icon-paper-plane"
              >
                发送
              </el-button>
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
  startRobots as apistartRobots,
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
      currentChat: null,
      chatId: null,
      robotsStarted: false,
    };
  },

  created() {
    this.chatId = this.$route.params.chatId;
    console.log('当前对话ID:', this.chatId);

    if (this.chatId && this.chatId !== 'null') {
      this.getChatHistory();
    } else {
      this.createNewChat();
    }
  },

  mounted() {
    // 开启定时保存，每隔10秒保存一次
    this.startAutoSave();
  },

  deactivated() {
    // 组件被缓存时
    this.switchChat();
    console.log('组件被缓存，停止自动保存');
  },

  beforeRouteLeave(to, from, next) {
    // 停止自动保存
    this.switchChat();
    // 清空消息，避免跳转时残留
    this.messages = [];
    console.log('离开路由，停止自动保存并清空消息');
    next();
  },

  watch: {
    '$route.params.chatId': {
      async handler(newId, oldId) {
        // 如果有旧会话，先切换保存它
        if (oldId) {
          await this.switchChat(oldId);
        }

        if (newId) {
          this.chatId = newId;
          this.messages = [];
          await this.getChatHistory();
          this.startAutoSave();
        }
      },
      immediate: true,
    },
  },

  methods: {
    ...mapActions('chat', ['getChatByID']),

    async getChatHistory() {
      try {
        const response = await apifetchChatDetailedHistory(this.chatId);
        console.log('获取聊天记录响应:', response);
        if (response.status === 200) {
          this.messages = (response.data || []).slice().reverse();
        }
        this.$nextTick(() => this.scrollToBottom());
      } catch (error) {
        console.error('获取聊天记录失败:', error);
      }
    },

    async createNewChat() {
      try {
        const { agentId, userId, name } = this.$route.query;
        const requestBody = { name, agentId, userId, chatId: null };
        console.log('创建新对话请求体:', requestBody);

        const res = await apicreateChat(requestBody);
        console.log('创建新对话响应:', res);

        if (res.data.chat_id) {
          this.chatId = res.data.chat_id;
          this.currentChat = res.data;
          this.$router.replace(`/chatRobot/${this.chatId}`);
        }
      } catch (error) {
        console.error('创建新对话失败:', error);
      }
    },

    async sendMessage() {
      const content = this.newMessage.trim();
      if (!content) return;

      this.messages.push({ content, role: 'user' });
      this.newMessage = '';

      this.$nextTick(() => this.scrollToBottom());

      try {
        if (!this.robotsStarted) {
          try {
            const startRes = await apistartRobots();
            console.log('机器人启动结果:', startRes);
            if (startRes?.status === 200) {
              this.robotsStarted = true;
            }
          } catch (e) {
            console.error('机器人启动失败:', e);
            this.messages.push({
              content: '对不起，机器人启动失败，请稍后再试。',
              role: 'assistant',
            });
            return;
          }
        }

        const response = await apisendMessage({
          chat_id: this.chatId,
          content,
        });
        console.log('发送消息:', content);
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
      }
    },

    async startAutoSave() {
      if (!this.chatId) return;

      if (this.saveInterval) {
        console.log('已有定时器，不再重复开启:', this.saveInterval);
        return;
      }

      // 每10秒自动保存一次
      this.saveInterval = setInterval(async () => {
        try {
          const response = await apisaveChatHistory({ chat_id: this.chatId });
          if (response.status === 200) {
            console.log('聊天记录已自动保存', response.data);
          }
        } catch (error) {
          console.error('自动保存聊天记录失败:', error);
        }
      }, 10000);

      console.log('已开启自动保存定时器:', this.saveInterval);
    },

    stopAutoSave() {
      if (this.saveInterval) {
        console.log('清除定时器:', this.saveInterval);
        clearInterval(this.saveInterval);
        this.saveInterval = null;
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
        await apisaveChatHistory({ chat_id: this.chatId });
        console.log('聊天记录已保存，开始导出TXT');

        // 2. 获取后端聊天记录
        const res = await apifetchChatDetailedHistory(this.chatId);
        let records = res.data || [];

        if (records.length === 0) {
          this.$message.warning('当前没有对话记录可导出');
          return;
        }

        // 逆转数组，让最早的消息在前
        records = records.slice().reverse();

        // 3. 生成 TXT 内容
        let txtContent = `对话记录 - ${this.currentChat?.name || '未知会话'}\n`;
        txtContent += `机器人: ${this.currentChat?.agent_name || '未知机器人'}\n`;
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
        await apisaveChatHistory({ chat_id: this.chatId });
        console.log('切换前聊天记录已保存');

        // 2. 关闭内存会话
        const response = await apicloseChat({ chat_id: this.chatId });

        if (response.status === 200) {
          console.log('切换对话成功：', response.data);
          this.$message.success(response.data.message || '切换对话成功');

          // 3. 清理定时器
          this.stopAutoSave();
          console.log('切换对话，停止定时保存');
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
</style>
