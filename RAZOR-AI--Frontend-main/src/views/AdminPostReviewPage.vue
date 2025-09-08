<template>
  <div class="admin-post-review">
    <!-- 搜索和筛选 -->
    <el-card class="search-card" shadow="hover">
      <div class="search-container">
        <el-input
          placeholder="搜索帖子标题或内容..."
          prefix-icon="el-icon-search"
          v-model="searchQuery"
          class="search-input"
        ></el-input>
        <!-- 已移除状态和类型筛选 -->
      </div>
    </el-card>

    <!-- 列表切换标签 -->
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="待审核帖子" name="posts"></el-tab-pane>
      <el-tab-pane label="待审核评论" name="comments"></el-tab-pane>
    </el-tabs>

    <!-- 帖子列表 -->
    <el-card v-if="activeTab === 'posts'" class="post-list-card" shadow="hover">
      <div class="card-header">
        <h2 class="card-title">待审核帖子列表</h2>
        <div class="action-buttons">
          <span class="record-count">共 {{ posts.length }} 条记录</span>
          <el-select v-model="pageSize" class="page-size-select">
            <el-option label="10 条/页" value="10"></el-option>
            <el-option label="20 条/页" value="20"></el-option>
            <el-option label="50 条/页" value="50"></el-option>
          </el-select>
        </div>
      </div>

      <el-table :data="filteredPosts" style="width: 100%" @row-click="viewPost">
        <el-table-column label="帖子标题" min-width="220">
          <template #default="scope">
            <p class="post-title">{{ scope.row.title }}</p>
            <p class="post-subtitle">{{ scope.row.subtitle }}</p>
          </template>
        </el-table-column>
        <el-table-column
          prop="author"
          label="作者"
          min-width="100"
        ></el-table-column>
        <el-table-column label="提交时间" min-width="140">
          <template #default="scope">
            {{ formatTime(scope.row.time) }}
          </template>
        </el-table-column>
        <!-- 已移除类型列 -->
        <el-table-column label="状态" min-width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 帖子分页 -->
      <div class="pagination-container">
        <span class="pagination-info">
          显示 {{ currentPageStart }} 到 {{ currentPageEnd }} 条，共
          {{ posts.length }} 条
        </span>
        <el-pagination
          layout="prev, pager, next"
          :total="posts.length"
          :page-size="pageSize"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-card>

    <!-- 评论列表 -->
    <el-card
      v-if="activeTab === 'comments'"
      class="post-list-card"
      shadow="hover"
    >
      <div class="card-header">
        <h2 class="card-title">待审核评论列表</h2>
        <div class="action-buttons">
          <span class="record-count">共 {{ comments.length }} 条记录</span>
          <el-select v-model="commentPageSize" class="page-size-select">
            <el-option label="10 条/页" value="10"></el-option>
            <el-option label="20 条/页" value="20"></el-option>
            <el-option label="50 条/页" value="50"></el-option>
          </el-select>
        </div>
      </div>

      <el-table
        :data="filteredComments"
        style="width: 100%"
        @row-click="viewComment"
      >
        <el-table-column label="评论内容" min-width="220">
          <template #default="scope">
            <p class="post-title">{{ scope.row.commentContent }}</p>
            <p class="post-subtitle">{{ scope.row.reportReason }}</p>
          </template>
        </el-table-column>
        <el-table-column
          prop="reporterName"
          label="举报人"
          min-width="100"
        ></el-table-column>
        <el-table-column label="举报时间" min-width="140">
          <template #default="scope">
            {{ formatTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="small">
              {{ scope.row.statusText }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <span class="pagination-info">
          显示 {{ commentCurrentPageStart }} 到
          {{ commentCurrentPageEnd }} 条，共 {{ comments.length }} 条
        </span>
        <el-pagination
          layout="prev, pager, next"
          :total="comments.length"
          :page-size="commentPageSize"
          @current-change="handleCommentCurrentChange"
        ></el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getPostReportList, getCommentReportList } from '@/utils/api';
export default {
  name: 'AdminPostReviewPage',
  data() {
    return {
      activeTab: 'posts', // 默认显示帖子tab
      searchQuery: '',
      // 已移除状态和类型筛选相关变量
      pageSize: 10,
      currentPage: 1,
      posts: [],
      // 评论相关数据
      commentPageSize: 10,
      commentCurrentPage: 1,
      comments: [],
      async fetchPendingPosts() {
        try {
          const res = await getPostReportList({
            status: 0,
            page: this.currentPage,
            pageSize: this.pageSize,
          });
          if (res.data && res.data.success) {
            this.posts = (res.data.data || []).map((item) => {
              let parsedTitle = {};
              try {
                parsedTitle =
                  typeof item.postTitle === 'string'
                    ? JSON.parse(item.postTitle)
                    : item.postTitle || {};
              } catch (e) {
                parsedTitle = { title: item.postTitle || '无标题' };
              }
              return {
                id: item.reportId || item.ReportId || item.id,
                title: parsedTitle.title || '无标题',
                subtitle: parsedTitle.content || item.reportReason || '',
                author: parsedTitle.author || item.reporterName || '未知',
                time: item.createdAt || item.CreatedAt || '',
                type: '举报内容',
                status: this.mapStatus(item.status || item.Status),
                selected: false,
                raw: item,
              };
            });
          } else {
            this.$message.error(res.data.message || '获取待审核帖子失败');
          }
        } catch (err) {
          this.$message.error(err.message || '获取待审核帖子失败');
        }
      },

      async fetchPendingComments() {
        try {
          const res = await getCommentReportList({
            status: 0,
            page: this.commentCurrentPage,
            pageSize: this.commentPageSize,
          });
          if (res.data && res.data.success) {
            this.comments = res.data.data || [];
          } else {
            this.$message.error(res.data.message || '获取待审核评论失败');
          }
        } catch (err) {
          this.$message.error(err.message || '获取待审核评论失败');
        }
      },
      mapStatus(status) {
        switch (status) {
          case 0:
          case '0':
            return 'pending';
          case 1:
          case '1':
            return 'approved';
          case 2:
          case '2':
            return 'rejected';
          default:
            return 'pending';
        }
      },
    };
  },
  computed: {
    filteredPosts() {
      let filtered = this.posts;
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (post) =>
            post.title.toLowerCase().includes(query) ||
            post.subtitle.toLowerCase().includes(query)
        );
      }
      return filtered;
    },
    filteredComments() {
      let filtered = this.comments;
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (comment) =>
            comment.commentContent.toLowerCase().includes(query) ||
            comment.reportReason.toLowerCase().includes(query)
        );
      }
      return filtered;
    },
    currentPageStart() {
      return (this.currentPage - 1) * this.pageSize + 1;
    },
    currentPageEnd() {
      return Math.min(this.currentPage * this.pageSize, this.posts.length);
    },
    commentCurrentPageStart() {
      return (this.commentCurrentPage - 1) * this.commentPageSize + 1;
    },
    commentCurrentPageEnd() {
      return Math.min(
        this.commentCurrentPage * this.commentPageSize,
        this.comments.length
      );
    },
  },
  methods: {
    formatTime(time) {
      if (!time) return '';
      const d = new Date(time);
      return d.toLocaleString();
    },
    getStatusTagType(status) {
      switch (status) {
        case 'pending':
          return 'warning';
        case 'approved':
          return 'success';
        case 'rejected':
          return 'danger';
        default:
          return '';
      }
    },
    getStatusText(status) {
      switch (status) {
        case 'pending':
          return '待审核';
        case 'approved':
          return '已通过';
        case 'rejected':
          return '已拒绝';
        default:
          return '';
      }
    },
    selectAll() {
      const allSelected = this.filteredPosts.every((post) => post.selected);
      this.filteredPosts.forEach((post) => {
        post.selected = !allSelected;
      });
    },
    batchApprove() {
      const selectedPosts = this.posts.filter(
        (post) => post.selected && post.status === 'pending'
      );
      if (selectedPosts.length === 0) {
        this.$message.warning('请至少选择一条待审核的帖子');
        return;
      }

      this.$confirm(
        `确定要通过选中的 ${selectedPosts.length} 条帖子吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
        selectedPosts.forEach((post) => {
          post.status = 'approved';
          post.selected = false;
        });
        this.$message.success(`已通过 ${selectedPosts.length} 条帖子`);
      });
    },
    batchReject() {
      const selectedPosts = this.posts.filter(
        (post) => post.selected && post.status === 'pending'
      );
      if (selectedPosts.length === 0) {
        this.$message.warning('请至少选择一条待审核的帖子');
        return;
      }

      this.$confirm(
        `确定要拒绝选中的 ${selectedPosts.length} 条帖子吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
        selectedPosts.forEach((post) => {
          post.status = 'rejected';
          post.selected = false;
        });
        this.$message.success(`已拒绝 ${selectedPosts.length} 条帖子`);
      });
    },
    viewPost(post) {
      // 跳转到举报详情页
      this.$router.push({
        name: 'AdminPostReviewDetail',
        params: { id: post.id },
      });
    },
    viewComment(comment) {
      // 跳转到评论举报详情页
      this.$router.push({
        name: 'AdminCommentReviewDetail',
        params: { id: comment.reportId },
      });
    },
    handleTabClick() {
      // 切换标签时重置搜索
      this.searchQuery = '';

      // 根据当前标签加载相应数据
      if (this.activeTab === 'posts') {
        this.fetchPendingPosts();
      } else if (this.activeTab === 'comments') {
        this.fetchPendingComments();
      }
    },
    approvePost(post) {
      post.status = 'approved';
      this.$message.success('帖子已通过审核');
    },
    rejectPost(post) {
      post.status = 'rejected';
      this.$message.success('帖子已拒绝审核');
    },
    handleCurrentChange(page) {
      this.currentPage = page;
    },
    handleCommentCurrentChange(page) {
      this.commentCurrentPage = page;
    },
  },
  mounted() {
    this.fetchPendingPosts();
    this.fetchPendingComments();
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

.admin-post-review {
  // 内容区自定义样式
  .search-card {
    margin-bottom: 24px;

    .search-container {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .search-input {
        width: 400px;
      }

      .filter-container {
        display: flex;
        gap: 12px;
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

    .post-title {
      font-weight: 500;
    }

    .post-subtitle {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
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
