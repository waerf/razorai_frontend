<template>
  <div class="admin-home">
    <!-- 侧边导航栏 -->
    <aside class="sidebar">
      <button class="toggle-sidebar-btn" @click="toggleSidebar">
        <i class="el-icon-s-fold"></i>
      </button>
      <div class="user-info">
        <div class="avatar">张</div>
        <div>
          <p class="username">张三</p>
          <p class="role">系统管理员</p>
        </div>
      </div>

      <nav class="nav-menu">
        <div class="nav-item" @click="$router.push('/admin')">
          <i class="el-icon-menu"></i>
          <span>控制台概览</span>
        </div>
        <div class="nav-item active">
          <i class="el-icon-cpu"></i>
          <span>机器人审核</span>
        </div>
        <div class="nav-item" @click="$router.push('/admin/posts')">
          <i class="el-icon-document"></i>
          <span>帖子审核</span>
        </div>
        <div class="nav-item" @click="$router.push('/admin/feedback')">
          <i class="el-icon-chat-dot-round"></i>
          <span>用户反馈</span>
        </div>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 顶部导航栏 -->
      <header class="header">
        <h1 class="title">机器人审核列表</h1>
        <el-button type="primary" @click="logout">退出登录</el-button>
      </header>

      <!-- 主要内容 -->
      <div class="content">
        <!-- 机器人列表 -->
        <el-card class="post-list-card" shadow="hover">
          <div class="card-header">
            <h2 class="card-title">待审核机器人</h2>
            <span class="text-sm text-gray-500"
              >共 {{ totalCount }} 个待审核</span
            >
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div
                v-for="(robot, index) in pendingRobots"
                :key="index"
                class="p-4 border border-gray-100 rounded-lg card-hover cursor-pointer"
                @click="goToReviewPage(robot.id)"
              >
                <div class="flex items-center justify-between mb-2">
                  <p class="font-medium">{{ robot.name }}</p>
                  <p class="text-sm text-gray-500">{{ robot.createdAt }}</p>
                </div>
                <el-tag type="warning">待审核</el-tag>
                <p class="text-gray-600 text-sm mt-2">
                  {{ robot.description }}
                </p>
              </div>
            </div>
            <div class="mt-6 text-center">
              <el-button
                v-if="hasPrevPage"
                type="default"
                @click="loadPrevPage"
                style="margin-right: 12px"
                >上一页</el-button
              >
              <el-button v-if="hasNextPage" type="primary" @click="loadNextPage"
                >下一页</el-button
              >
            </div>
          </div>
        </el-card>
      </div>
    </main>
  </div>
</template>

<script>
import { getPendingRobots } from '@/utils/api';
export default {
  name: 'AdminReviewPage',
  data() {
    return {
      isSidebarCollapsed: false,
      pendingRobots: [], // 当前页显示的机器人
      currentPage: 1,
      pageSize: 3,
      totalCount: 0,
      loading: false,
    };
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
      const sidebar = document.querySelector('.sidebar');
      sidebar.classList.toggle('hidden');
    },
    logout() {
      this.$router.push('/');
    },
    goToReviewPage(id) {
      // 跳转详情页，监听返回时的状态
      this.$router.push({
        path: `/admin/robots/${id}`,
        query: { fromList: true },
      });
    },
    async fetchPendingRobots(page = 1) {
      this.loading = true;
      try {
        const res = await getPendingRobots({ page, pageSize: this.pageSize });
        if (res.data && res.data.success) {
          this.pendingRobots = res.data.data.map((robot) => ({
            id: robot.id,
            name: robot.name,
            createdAt: robot.createdAt,
            description: robot.description,
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
    loadNextPage() {
      if (this.hasNextPage && !this.loading) {
        this.currentPage++;
        this.fetchPendingRobots(this.currentPage);
      }
    },
    loadPrevPage() {
      if (this.hasPrevPage && !this.loading) {
        this.currentPage--;
        this.fetchPendingRobots(this.currentPage);
      }
    },
  },
  mounted() {
    this.fetchPendingRobots(1);
    // 监听页面返回，更新状态
    this.$watch(
      () => this.$route,
      (to, from) => {
        // 仅在从详情页返回列表页时触发
        if (
          to.path === '/admin/review' &&
          from.path.startsWith('/admin/robots/')
        ) {
          // 获取详情页返回的审核结果
          const reviewedId = from.params.id;
          const reviewedStatus = from.query && from.query.status;
          if (reviewedId && reviewedStatus) {
            const idx = this.pendingRobots.findIndex((r) => r.id == reviewedId);
            if (idx !== -1) {
              // 更新状态（可根据实际字段调整）
              this.$set(this.pendingRobots, idx, {
                ...this.pendingRobots[idx],
                status: reviewedStatus,
              });
            }
          }
        }
      }
    );
  },
  computed: {
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
.admin-home {
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f5;

  .sidebar {
    position: relative;
    transition: all 0.3s ease;

    .toggle-sidebar-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      cursor: pointer;
      font-size: 16px;
      background: none;
      border: none;
      color: #606266;
      padding: 5px;

      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
        border-radius: 4px;
      }
    }

    &.hidden {
      width: 60px !important;

      .nav-item {
        span {
          display: none;
        }

        i {
          margin-right: 0;
        }
      }

      .user-info {
        flex-direction: column;
        align-items: center;
        padding: 10px;

        .avatar {
          margin-right: 0;
          margin-bottom: 5px;
        }

        .username,
        .role {
          display: none;
        }
      }
    }
    width: 250px;
    background-color: white;
    border-right: 1px solid #e6e6e6;
    padding: 20px 0;

    .user-info {
      display: flex;
      align-items: center;
      padding: 0 20px 20px;
      border-bottom: 1px solid #e6e6e6;

      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #165dff;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        font-weight: bold;
      }

      .username {
        font-weight: 500;
        margin-bottom: 4px;
      }

      .role {
        font-size: 12px;
        color: #999;
      }
    }

    .nav-menu {
      padding: 10px 0;

      .nav-item {
        display: flex;
        align-items: center;
        padding: 12px 20px;
        margin: 4px 0;
        cursor: pointer;
        transition: all 0.3s;

        i {
          margin-right: 12px;
          font-size: 18px;
        }

        &:hover {
          background-color: #f6f6f6;
        }

        &.active {
          background-color: #e8f3ff;
          color: #165dff;
          border-left: 3px solid #165dff;
        }
      }
    }
  }

  .main-content {
    flex: 1;
    overflow: auto;

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background-color: white;
      border-bottom: 1px solid #e6e6e6;
      position: sticky;
      top: 0;
      z-index: 10;

      .title {
        font-size: 20px;
        font-weight: 600;
      }
    }

    .content {
      padding: 24px;

      .card-hover {
        transition: all 0.3s ease;
      }
      .card-hover:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
      }
    }
  }
}
</style>
