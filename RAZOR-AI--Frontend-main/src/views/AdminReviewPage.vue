<template>
  <div class="admin-home">
    <!-- 侧边导航栏 -->
    <aside class="sidebar">
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
              >共 {{ pendingRobots.length }} 个待审核</span
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
          </div>
        </el-card>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'AdminReviewPage',
  data() {
    return {
      pendingRobots: [
        {
          id: 1,
          name: '智能客服机器人 v2.1',
          createdAt: '2025-07-20 14:30',
          description: '智能客服机器人，能够处理常见客户咨询问题',
        },
        {
          id: 2,
          name: '数据分析助手',
          createdAt: '2025-07-19 11:45',
          description: '数据分析助手，提供数据可视化与分析功能',
        },
      ],
    };
  },
  methods: {
    logout() {
      // 退出登录逻辑
      this.$router.push('/login');
    },
    goToReviewPage(id) {
      this.$router.push(`/admin/robots/${id}`);
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
