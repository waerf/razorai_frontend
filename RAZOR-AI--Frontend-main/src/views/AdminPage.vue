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
        <div class="nav-item active">
          <i class="el-icon-menu"></i>
          <span>控制台概览</span>
        </div>
        <div class="nav-item" @click="$router.push('/admin/review')">
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
        <h1 class="title">控制台</h1>
        <el-button type="primary" @click="logout">退出登录</el-button>
      </header>

      <!-- 主要内容 -->
      <div class="content">
        <router-view v-if="$route.matched.length > 1"></router-view>
        <template v-else>
          <!-- 统计卡片 -->
          <div class="stats-grid">
            <el-card class="stat-card" shadow="hover">
              <div class="stat-content">
                <div>
                  <p class="stat-label">待审核机器人</p>
                  <p class="stat-value">12</p>
                </div>
                <div class="stat-icon">
                  <i class="el-icon-cpu"></i>
                </div>
              </div>
            </el-card>

            <el-card class="stat-card" shadow="hover">
              <div class="stat-content">
                <div>
                  <p class="stat-label">未处理反馈</p>
                  <p class="stat-value">8</p>
                </div>
                <div class="stat-icon">
                  <i class="el-icon-chat-dot-round"></i>
                </div>
              </div>
            </el-card>

            <el-card class="stat-card" shadow="hover">
              <div class="stat-content">
                <div>
                  <p class="stat-label">待审核帖子</p>
                  <p class="stat-value">5</p>
                </div>
                <div class="stat-icon">
                  <i class="el-icon-document"></i>
                </div>
              </div>
            </el-card>
          </div>

          <!-- 内容区域 -->
          <div class="content-grid">
            <!-- 待审核机器人 -->
            <el-card class="content-card" shadow="hover">
              <div class="card-header">
                <h2 class="card-title">待审核机器人</h2>
                <el-link
                  type="primary"
                  :underline="false"
                  @click="$router.push('/admin/review')"
                  >查看全部</el-link
                >
              </div>

              <div class="items-list">
                <div class="item" v-for="item in pendingRobots" :key="item.id">
                  <div class="item-header">
                    <p class="item-name">{{ item.name }}</p>
                    <p class="item-time">{{ item.time }}</p>
                  </div>
                  <el-tag
                    :type="item.status === 'pending' ? 'warning' : 'success'"
                  >
                    {{ item.status === 'pending' ? '待审核' : '已通过' }}
                  </el-tag>
                </div>
              </div>
            </el-card>

            <!-- 待审核帖子 -->
            <el-card class="content-card" shadow="hover">
              <div class="card-header">
                <h2 class="card-title">待审核帖子</h2>
                <el-link
                  type="primary"
                  :underline="false"
                  @click="$router.push('/admin/posts')"
                  >查看全部</el-link
                >
              </div>

              <div class="items-list">
                <div class="item" v-for="item in pendingPosts" :key="item.id">
                  <div class="item-header">
                    <p class="item-name">{{ item.name }}</p>
                    <p class="item-time">{{ item.time }}</p>
                  </div>
                  <el-tag type="warning">待审核</el-tag>
                </div>
              </div>
            </el-card>

            <!-- 最新用户反馈 -->
            <el-card class="content-card full-width" shadow="hover">
              <div class="card-header">
                <h2 class="card-title">最新用户反馈</h2>
                <el-link
                  type="primary"
                  :underline="false"
                  @click="$router.push('/admin/feedback')"
                  >查看全部</el-link
                >
              </div>

              <div class="feedback-grid">
                <div
                  class="feedback-item"
                  v-for="feedback in recentFeedbacks"
                  :key="feedback.id"
                >
                  <div class="feedback-header">
                    <p class="feedback-user">{{ feedback.user }}</p>
                    <p class="feedback-time">{{ feedback.time }}</p>
                  </div>
                  <p class="feedback-content">{{ feedback.content }}</p>
                </div>
              </div>
            </el-card>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'AdminHomePage',
  data() {
    return {
      activeTab: 'review',
      pendingRobots: [
        {
          id: 1,
          name: '智能客服机器人 v2.1',
          time: '2025-07-20 14:30',
          status: 'pending',
        },
        {
          id: 2,
          name: '数据分析助手',
          time: '2025-07-19 11:45',
          status: 'pending',
        },
        {
          id: 3,
          name: '内容审核机器人',
          time: '2025-07-18 19:08',
          status: 'approved',
        },
      ],
      pendingPosts: [
        { id: 1, name: '违规内容举报', time: '2025-07-15 14:30' },
        { id: 2, name: '敏感词检测', time: '2025-07-15 10:45' },
      ],
      recentFeedbacks: [
        {
          id: 1,
          user: '李四',
          time: '2025-07-10 15:14',
          content:
            '机器人无法正确识别"退款"相关的问题，总是将用户引导到错误的页面。',
        },
        {
          id: 2,
          user: '王五',
          time: '2025-07-09 16:53',
          content: '数据分析机器人导出报表功能有时会出错。',
        },
      ],
    };
  },
  methods: {
    logout() {
      // 退出登录逻辑
      this.$router.push('/login');
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

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-bottom: 24px;

        .stat-card {
          .stat-content {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .stat-label {
              font-size: 14px;
              color: #666;
              margin-bottom: 8px;
            }

            .stat-value {
              font-size: 24px;
              font-weight: bold;
            }

            .stat-icon {
              width: 48px;
              height: 48px;
              border-radius: 50%;
              background-color: #e8f3ff;
              color: #165dff;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
            }
          }
        }
      }

      .content-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;

        .content-card {
          &.full-width {
            grid-column: 1 / -1;
          }

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;

            .card-title {
              font-size: 18px;
              font-weight: 600;
            }
          }

          .items-list {
            .item {
              padding: 12px;
              border: 1px solid #f0f0f0;
              border-radius: 4px;
              margin-bottom: 8px;

              .item-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;

                .item-name {
                  font-weight: 500;
                }

                .item-time {
                  font-size: 12px;
                  color: #999;
                }
              }
            }
          }

          .feedback-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;

            .feedback-item {
              padding: 12px;
              border: 1px solid #f0f0f0;
              border-radius: 4px;

              .feedback-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;

                .feedback-user {
                  font-weight: 500;
                }

                .feedback-time {
                  font-size: 12px;
                  color: #999;
                }
              }

              .feedback-content {
                font-size: 14px;
                color: #666;
              }
            }
          }
        }
      }
    }
  }
}
</style>
