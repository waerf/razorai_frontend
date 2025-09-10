<template>
  <div class="admin-feedback-page">
    <!-- 搜索和筛选 -->
    <el-card class="search-card" shadow="hover">
      <div class="search-container">
        <el-input
          placeholder="搜索用户名或反馈内容..."
          prefix-icon="el-icon-search"
          v-model="searchQuery"
          class="search-input"
        ></el-input>
      </div>
    </el-card>

    <!-- 反馈列表 -->
    <el-card class="post-list-card" shadow="hover">
      <div class="card-header">
        <h2 class="card-title">待处理用户反馈列表</h2>
        <div class="action-buttons">
          <span class="record-count">共 {{ feedbackList.length }} 条记录</span>
          <el-select v-model="pageSize" class="page-size-select">
            <el-option label="10 条/页" value="10"></el-option>
            <el-option label="20 条/页" value="20"></el-option>
            <el-option label="50 条/页" value="50"></el-option>
          </el-select>
        </div>
      </div>

      <el-table
        :data="filteredFeedbacks"
        style="width: 100%"
        @row-click="viewFeedback"
      >
        <el-table-column
          prop="name"
          label="用户名"
          min-width="120"
        ></el-table-column>
        <el-table-column label="反馈内容" min-width="300">
          <template #default="scope">
            <p>{{ scope.row.content | truncateText(100) }}</p>
          </template>
        </el-table-column>
        <el-table-column label="提交时间" min-width="140">
          <template #default="scope">
            {{ formatTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <span class="pagination-info">
          显示 {{ currentPageStart }} 到 {{ currentPageEnd }} 条，共
          {{ feedbackList.length }} 条
        </span>
        <el-pagination
          layout="prev, pager, next"
          :total="feedbackList.length"
          :page-size="pageSize"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
import { fetchAllFeedbacks } from '@/utils/api';
export default {
  name: 'AdminFeedbackPage',
  filters: {
    truncateText(text, length) {
      if (!text) return '';
      if (text.length <= length) return text;
      return text.substring(0, length) + '...';
    },
  },
  data() {
    return {
      searchQuery: '',
      pageSize: 10,
      currentPage: 1,
      feedbackList: [],
    };
  },
  computed: {
    filteredFeedbacks() {
      let filtered = this.feedbackList;

      // 应用搜索过滤
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (feedback) =>
            feedback.name.toLowerCase().includes(query) ||
            feedback.content.toLowerCase().includes(query)
        );
      }

      // 应用分页
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + parseInt(this.pageSize);

      return filtered.slice(start, end);
    },
    currentPageStart() {
      return (this.currentPage - 1) * this.pageSize + 1;
    },
    currentPageEnd() {
      const end = this.currentPage * this.pageSize;
      return Math.min(end, this.feedbackList.length);
    },
  },
  methods: {
    async fetchFeedbackList() {
      try {
        const res = await fetchAllFeedbacks();
        // 适配后端返回 { message, feedbacks: [...] }
        if (res.data && Array.isArray(res.data.feedbacks)) {
          this.feedbackList = res.data.feedbacks
            .filter((f) => f.state === 0) // 只保留未解决的反馈
            .map((f) => ({
              id: f.id,
              name: f.userName || '未知用户',
              createdAt: f.time,
              content: f.feedback,
              status: 'pending', // 只有待处理的状态
              userId: f.userId,
            }));
        } else {
          this.$message.error('获取反馈数据失败');
        }
      } catch (err) {
        this.$message.error(err.message || '获取反馈数据失败');
      }
    },
    formatTime(time) {
      if (!time) return '';
      const d = new Date(time);
      return d.toLocaleString();
    },
    handleCurrentChange(page) {
      this.currentPage = page;
    },
    viewFeedback(feedback) {
      this.$router.push(`/admin/feedback/${feedback.userId}/${feedback.id}`);
    },
  },
  mounted() {
    this.fetchFeedbackList();
  },
};
</script>

<style lang="scss" scoped>
// 全局卡片圆角统一
:deep(.el-card) {
  border-radius: 12px !important;
}

// 按钮圆角统一
:deep(.el-button) {
  border-radius: 12px !important;
}

.admin-feedback-page {
  .search-card {
    margin-bottom: 24px;

    .search-container {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .search-input {
        width: 400px;
      }
    }
  }

  .post-list-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .card-title {
        font-size: 18px;
        font-weight: 600;
      }

      .action-buttons {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        .record-count {
          font-size: 14px;
          color: #666;
          margin: 0 8px 0 0;
        }
        .page-size-select {
          width: 110px;
        }
      }
    }

    .pagination-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e6e6e6;

      .pagination-info {
        font-size: 14px;
        color: #666;
      }
    }
  }
}
</style>
