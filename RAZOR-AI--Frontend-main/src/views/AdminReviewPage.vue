<template>
  <div class="admin-robot-review">
    <!-- loading 遮罩 -->
    <div v-if="loading" class="loading-mask">
      <div class="spinner"></div>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card" shadow="hover">
      <div class="search-container">
        <el-input
          placeholder="搜索机器人名称或描述..."
          prefix-icon="el-icon-search"
          v-model="searchQuery"
          class="search-input"
        ></el-input>
      </div>
    </el-card>

    <!-- 机器人列表 -->
    <el-card class="robot-list-card" shadow="hover">
      <div class="card-header">
        <h2 class="card-title">待审核机器人列表</h2>
        <div class="action-buttons">
          <span class="record-count">共 {{ totalCount }} 条记录</span>
          <el-select
            v-model="pageSize"
            class="page-size-select"
            @change="handlePageSizeChange"
          >
            <el-option :label="'10 条/页'" :value="10"></el-option>
            <el-option :label="'20 条/页'" :value="20"></el-option>
            <el-option :label="'50 条/页'" :value="50"></el-option>
          </el-select>
        </div>
      </div>

      <el-table
        :data="filteredRobots"
        style="width: 100%"
        @row-click="goToReviewPage"
      >
        <el-table-column label="机器人信息" min-width="220">
          <template #default="scope">
            <div class="robot-info-container">
              <div class="robot-avatar-container">
                <img
                  v-if="scope.row.avatarUrl"
                  :src="scope.row.avatarUrl"
                  :alt="scope.row.name"
                  class="robot-avatar-list"
                  @error="handleAvatarError(scope.row)"
                />
                <div v-else class="avatar-placeholder-list">
                  {{ scope.row.name ? scope.row.name.charAt(0) : 'AI' }}
                </div>
              </div>
              <div class="robot-text-info">
                <p class="robot-name">{{ scope.row.name }}</p>
                <p class="robot-description">{{ scope.row.description }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="creatorName"
          label="创建者"
          min-width="100"
        ></el-table-column>
        <el-table-column label="创建时间" min-width="140">
          <template #default="scope">
            {{ formatTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <span class="pagination-info">
          显示 {{ currentPageStart }} 到 {{ currentPageEnd }} 条，共
          {{ totalCount }} 条
        </span>
        <el-pagination
          layout="prev, pager, next"
          :total="totalCount"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getPendingRobots } from '@/utils/api';
export default {
  name: 'AdminReviewPage',
  data() {
    return {
      searchQuery: '',
      pendingRobots: [], // 当前页显示的机器人
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      loading: false,
    };
  },
  methods: {
    // 处理头像图片加载错误
    handleAvatarError(robot) {
      // 图片加载失败时设置avatarUrl为null，显示默认头像
      this.$set(robot, 'avatarUrl', null);
    },
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
          return 'warning';
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
          return '待审核';
      }
    },
    goToReviewPage(row) {
      // 跳转详情页，使用路由 name+params，确保 id 正确传递
      // row是整行数据，我们需要提取id属性
      const id = row.id;
      this.$router.push({
        name: 'AdminRobotReviewDetail',
        params: { id: id },
        query: { fromList: true },
      });
    },
    handleCurrentChange(page) {
      this.currentPage = page;
      this.fetchPendingRobots(page);
    },
    handlePageSizeChange() {
      this.currentPage = 1;
      this.fetchPendingRobots(1);
    },
    async fetchPendingRobots(page = 1) {
      this.loading = true;
      try {
        const res = await getPendingRobots({ page, pageSize: this.pageSize });
        if (res.data && res.data.success) {
          this.pendingRobots = res.data.data.map((robot) => ({
            id: robot.auditId,
            name: robot.name,
            createdAt: robot.createdAt,
            description: robot.description,
            creatorId: robot.creatorId,
            creatorName: robot.creatorName || robot.userName || '未知',
            avatarUrl: robot.avatarUrl, // 新增头像URL字段
            status: 'pending', // 默认待审核状态
          }));
          this.totalCount =
            res.data.pagination?.totalCount || this.pendingRobots.length;
        } else {
          this.$message.error(res.data.message || '获取待审核机器人失败');
        }
      } catch (err) {
        this.$message.error(err.message || '获取待审核机器人失败');
      }
      this.loading = false;
    },
  },
  mounted() {
    this.fetchPendingRobots(1);

    // 监听页面返回，移除已审核机器人并刷新列表
    this.$watch(
      () => this.$route,
      (to) => {
        if (to.path === '/admin/review' && to.query && to.query.removedId) {
          // 重新拉取当前页，确保分页数据准确
          this.fetchPendingRobots(this.currentPage);
          // 清除 query，避免刷新重复删除
          this.$router.replace({ path: '/admin/review', query: {} });
        }
      }
    );
  },
  computed: {
    filteredRobots() {
      let filtered = this.pendingRobots;
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (robot) =>
            robot.name.toLowerCase().includes(query) ||
            (robot.description &&
              robot.description.toLowerCase().includes(query))
        );
      }
      return filtered;
    },
    currentPageStart() {
      return this.totalCount === 0
        ? 0
        : (this.currentPage - 1) * this.pageSize + 1;
    },
    currentPageEnd() {
      return Math.min(this.currentPage * this.pageSize, this.totalCount);
    },
    hasNextPage() {
      return this.currentPage * this.pageSize < this.totalCount;
    },
    hasPrevPage() {
      return this.currentPage > 1;
    },
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

.admin-robot-review {
  position: relative;
  min-height: 300px;

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

  .robot-list-card {
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

    .robot-info-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .robot-avatar-container {
      flex-shrink: 0;
    }

    .robot-avatar-list {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #e4e7ed;
    }

    .avatar-placeholder-list {
      width: 40px;
      height: 40px;
      background: #165dff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: white;
      font-weight: 600;
    }

    .robot-text-info {
      flex: 1;
      min-width: 0;
    }

    .robot-name {
      font-weight: 500;
      margin: 0 0 4px 0;
    }

    .robot-description {
      font-size: 12px;
      color: #999;
      margin: 0;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
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

/* loading 遮罩样式 */
.loading-mask {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #409eff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
