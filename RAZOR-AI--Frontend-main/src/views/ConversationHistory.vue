<template>
  <div class="conversation-history">
    <!-- 主内容区域 -->
    <div class="content-container">
      <!-- 对话历史标题栏 -->
      <el-card class="header-card">
        <div class="header-content">
          <div class="title-section">
            <h1 class="main-title">{{ title }}</h1>
            <p class="sub-title">与小助手Bot的所有对话记录</p>
          </div>
          <div class="action-section">
            <div class="search-box">
              <el-input
                v-model="searchQuery"
                placeholder="搜索对话..."
                class="search-input"
                @input="handleSearch"
                clearable
              >
                <el-button
                  slot="append"
                  icon="el-icon-search"
                  @click="performSearch"
                ></el-button>
              </el-input>
            </div>
            <el-button
              id="deleteSelected"
              class="delete-btn"
              icon="el-icon-delete"
              @click="confirmDelete"
              :disabled="selectedConversations.length === 0"
            >
              删除选中
            </el-button>
          </div>
        </div>

        <!-- 对话过滤器 -->
        <div class="filter-container">
          <el-button
            v-for="filter in filters"
            :key="filter.id"
            class="filter-btn"
            :class="{ active: activeFilter === filter.id }"
            @click="activeFilter = filter.id"
          >
            {{ filter.name }}
          </el-button>
        </div>
      </el-card>

      <!-- 对话历史列表 -->
      <el-card class="list-card">
        <div v-if="filteredConversations.length > 0">
          <div class="robots-grid">
            <!-- 对话项 -->
            <el-card
              v-for="conversation in paginatedConversations"
              :key="conversation.id"
              class="conversation-card"
            >
              <div class="conversation-header">
                <el-checkbox
                  v-model="selectedConversations"
                  :label="conversation.id"
                  class="selection-checkbox"
                  aria-label="选择此对话"
                ></el-checkbox>
                <div class="conversation-title">
                  <h3 class="title-text">{{ conversation.name }}</h3>
                  <span class="timestamp">{{
                    formatDate(conversation.timestamp)
                  }}</span>
                </div>
              </div>
              <div class="conversation-content">
                {{ truncate(conversation.content, 80) }}
              </div>
              <div class="conversation-tags">
                <span class="tag" v-for="tag in conversation.tags" :key="tag">
                  {{ tag }}
                </span>
              </div>
              <div class="conversation-actions">
                <el-button
                  size="mini"
                  @click.stop="viewConversation(conversation.id)"
                >
                  查看详情
                </el-button>
                <el-button
                  size="mini"
                  type="danger"
                  @click.stop="
                    selectConversation(conversation.id);
                    confirmDelete();
                  "
                >
                  删除
                </el-button>
              </div>
            </el-card>
          </div>

          <!-- 分页 -->
          <div class="pagination-container">
            <p class="pagination-info">
              显示 {{ startItem }}-{{ endItem }} 条，共
              {{ filteredConversations.length }} 条
            </p>
            <el-pagination
              background
              :current-page="currentPage"
              :page-size="pageSize"
              :total="filteredConversations.length"
              @current-change="handlePageChange"
            ></el-pagination>
          </div>
        </div>

        <!-- 无对话时显示 -->
        <div class="no-conversations" v-else>
          <div class="empty-state">
            <i class="el-icon-inbox text-4xl mb-3"></i>
            <p class="empty-title">暂无相关对话记录</p>
            <p class="empty-subtitle">开始新的对话，记录将显示在这里</p>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 删除确认对话框 -->
    <el-dialog
      title="确认删除"
      :visible.sync="deleteDialogVisible"
      width="400px"
      center
    >
      <div class="dialog-content">
        <div class="warning-icon">
          <i class="el-icon-warning text-red-500 text-2xl"></i>
        </div>
        <h3 class="dialog-title">确认删除</h3>
        <p class="dialog-message">你确定要删除选中的对话吗？此操作不可撤销。</p>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="deleteConversations"
          >确认删除</el-button
        >
      </div>
    </el-dialog>

    <!-- 回到顶部按钮 -->
    <button
      id="backToTop"
      class="back-to-top"
      aria-label="回到顶部"
      @click="scrollToTop"
    >
      <i class="el-icon-arrow-up"></i>
    </button>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { deleteChat as apiDeleteChat } from '../utils/api';

export default {
  name: 'ConversationHistory',
  data() {
    return {
      title: '对话历史',
      conversations: [],
      selectedConversations: [],
      deleteDialogVisible: false,
      searchQuery: '',
      filters: [
        { id: 'all', name: '全部对话' },
        { id: 'today', name: '今日' },
        { id: 'thisWeek', name: '本周' },
        { id: 'thisMonth', name: '本月' },
        { id: 'earlier', name: '更早' },
      ],
      activeFilter: 'all',
      currentPage: 1,
      pageSize: 5,
    };
  },
  mounted() {
    const robotId = this.$route.params.id;
    // 从Vuex获取对话数据
    this.conversations = this.chats.filter(
      (chat) => Number(chat.agent_id) === Number(robotId)
    );

    // 监听滚动事件显示/隐藏回到顶部按钮
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  computed: {
    ...mapState('chat', ['chats']),
    // 过滤后的对话列表
    filteredConversations() {
      let result = [...this.conversations];

      // 搜索过滤
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(
          (conv) =>
            conv.name.toLowerCase().includes(query) ||
            conv.content.toLowerCase().includes(query) ||
            conv.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      // 时间过滤
      if (this.activeFilter !== 'all') {
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        result = result.filter((conv) => {
          const convDate = new Date(conv.timestamp);

          switch (this.activeFilter) {
            case 'today':
              return convDate >= today;
            case 'thisWeek':
              return convDate >= weekStart && convDate < today;
            case 'thisMonth':
              return convDate >= monthStart && convDate < weekStart;
            case 'earlier':
              return convDate < monthStart;
            default:
              return true;
          }
        });
      }

      return result;
    },
    // 分页相关计算
    paginatedConversations() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      return this.filteredConversations.slice(
        startIndex,
        startIndex + this.pageSize
      );
    },
    startItem() {
      return this.filteredConversations.length
        ? (this.currentPage - 1) * this.pageSize + 1
        : 0;
    },
    endItem() {
      return Math.min(
        this.currentPage * this.pageSize,
        this.filteredConversations.length
      );
    },
  },
  methods: {
    // 查看对话详情
    viewConversation(conversationId) {
      this.$router.push({
        name: 'ChatRobot',
        params: { id: conversationId },
      });
    },
    // 处理搜索
    handleSearch() {
      this.currentPage = 1; // 重置到第一页
    },
    performSearch() {
      this.currentPage = 1;
    },
    // 处理分页变化
    handlePageChange(page) {
      this.currentPage = page;
    },
    // 确认删除
    confirmDelete() {
      this.deleteDialogVisible = true;
    },
    // 选择单个对话用于删除
    selectConversation(id) {
      this.selectedConversations = [id];
    },
    // 清除选择
    clearSelection() {
      this.selectedConversations = [];
    },
    // 删除选中的对话
    async deleteConversations() {
      try {
        for (const conversationId of this.selectedConversations) {
          const response = await apiDeleteChat({
            chat_id: conversationId,
          });

          if (response.status !== 200) {
            throw new Error(`删除对话 ${conversationId} 失败`);
          }
        }

        // 刷新对话列表
        this.conversations = this.conversations.filter(
          (conv) => !this.selectedConversations.includes(conv.id)
        );

        // 显示成功提示
        this.$message.success('对话已成功删除');
      } catch (error) {
        console.error('删除对话失败:', error);
        this.$message.error('删除对话失败，请重试');
      } finally {
        this.deleteDialogVisible = false;
        this.selectedConversations = [];
      }
    },
    // 格式化日期显示
    formatDate(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

      if (diffInDays === 0) {
        // 今天
        return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      } else if (diffInDays === 1) {
        // 昨天
        return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      } else if (diffInDays < 7) {
        // 本周
        const weekdays = [
          '周日',
          '周一',
          '周二',
          '周三',
          '周四',
          '周五',
          '周六',
        ];
        return `${weekdays[date.getDay()]} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      } else {
        // 更早
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      }
    },
    // 处理滚动事件
    handleScroll() {
      const backToTopButton = document.getElementById('backToTop');
      if (window.pageYOffset > 300) {
        backToTopButton.classList.add('visible');
      } else {
        backToTopButton.classList.remove('visible');
      }
    },
    // 回到顶部
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    },
    // 截断文本
    truncate(text, length = 50) {
      if (!text) return '';
      return text.length > length ? text.slice(0, length) + '...' : text;
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

$light-accent: #e8f3ff;

.conversation-history {
  padding: 20px;
  min-height: 100vh;
  background-color: $background-color;

  .content-container {
    max-width: 1000px;
    margin: 0 auto;
  }

  .header-card {
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: $box-shadow-light;
    border: 1px solid $border-color;
    overflow: hidden;

    .header-content {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      gap: 20px;

      .title-section {
        .main-title {
          font-size: 1.5rem;
          color: $text-color;
          font-weight: 600;
          margin-bottom: 5px;
        }

        .sub-title {
          color: $secondary-color;
          font-size: 0.9rem;
        }
      }

      .action-section {
        display: flex;
        align-items: center;
        gap: 15px;
        width: 100%;
        max-width: 500px;

        .search-box {
          flex: 1;

          .search-input {
            :deep(.el-input__inner) {
              border-radius: 6px;
              border: 1px solid $border-color;
            }

            :deep(.el-input-group__append) {
              background: $accent-color;
              color: white;
              border-color: $accent-color;

              &:hover {
                background: $accent-hover-color;
              }
            }
          }
        }

        .delete-btn {
          background: white;
          color: #f56c6c;
          border: 1px solid #f56c6c;
          border-radius: 6px;

          &:hover {
            background: #f56c6c;
            color: white;
          }

          &:disabled {
            background: #fef0f0;
            color: #fab0b0;
            border-color: #fab0b0;
            cursor: not-allowed;
          }
        }
      }
    }

    .filter-container {
      padding: 0 20px 20px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;

      .filter-btn {
        background: white;
        color: $text-color;
        border: 1px solid $border-color;
        border-radius: 20px;
        padding: 6px 16px;

        &:hover {
          background: $accent-color;
          color: white;
          border-color: $accent-color;
        }

        &.active {
          background: $accent-color;
          color: white;
          border-color: $accent-color;
        }
      }
    }
  }

  .list-card {
    border-radius: 8px;
    box-shadow: $box-shadow-light;
    border: 1px solid $border-color;
    padding: 20px;

    .robots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .conversation-card {
      cursor: default;
      transition: all 0.3s ease;
      border: 1px solid $border-color;

      &:hover {
        transform: translateY(-5px);
        box-shadow: $box-shadow-medium;
      }

      .conversation-header {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        margin-bottom: 15px;

        .selection-checkbox {
          margin-top: 3px;
        }

        .conversation-title {
          flex: 1;

          .title-text {
            font-size: 1rem;
            font-weight: 600;
            color: $text-color;
            margin-bottom: 5px;
          }

          .timestamp {
            font-size: 0.8rem;
            color: $secondary-color;
          }
        }
      }

      .conversation-content {
        color: $secondary-color;
        font-size: 0.9rem;
        line-height: 1.4;
        margin-bottom: 15px;
        min-height: 40px;
      }

      .conversation-tags {
        margin-bottom: 15px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .tag {
          display: inline-block;
          padding: 0.25em 0.5em;
          background-color: $light-accent;
          color: $accent-color;
          border-radius: 4px;
          font-size: 0.8em;
        }
      }

      .conversation-actions {
        display: flex;
        gap: 8px;

        .el-button {
          flex: 1;

          &:nth-child(1) {
            background: white;
            color: $text-color;
            border: 1px solid $border-color;

            &:hover {
              background: $accent-color;
              color: white;
              border-color: $accent-color;
            }
          }
        }
      }
    }

    .pagination-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 15px;
      border-top: 1px solid $border-color;

      .pagination-info {
        font-size: 0.9rem;
        color: $secondary-color;
      }
    }

    .no-conversations {
      text-align: center;
      padding: 40px 0;

      .empty-state {
        color: $secondary-color;

        .empty-title {
          font-size: 1.2rem;
          margin: 15px 0 5px;
        }

        .empty-subtitle {
          font-size: 0.9rem;
        }
      }
    }
  }

  .dialog-content {
    text-align: center;
    padding: 15px 0;

    .warning-icon {
      width: 40px;
      height: 40px;
      background: #fff1f0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 15px;
    }

    .dialog-title {
      font-size: 1.2rem;
      font-weight: 600;
      color: $text-color;
      margin-bottom: 10px;
    }

    .dialog-message {
      color: $secondary-color;
      font-size: 0.9rem;
    }
  }

  .back-to-top {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: $accent-color;
    color: white;
    box-shadow: $box-shadow-medium;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 100;

    &.visible {
      opacity: 1;
      visibility: visible;
    }

    &:hover {
      background: $accent-hover-color;
    }
  }
}

@media (max-width: 768px) {
  .conversation-history {
    padding: 10px;

    .header-content {
      flex-direction: column;
      align-items: flex-start;
    }

    .action-section {
      width: 100% !important;
      max-width: none !important;
    }

    .robots-grid {
      grid-template-columns: 1fr !important;
    }

    .pagination-container {
      flex-direction: column;
      gap: 15px;
      align-items: flex-start;
    }
  }
}
</style>
