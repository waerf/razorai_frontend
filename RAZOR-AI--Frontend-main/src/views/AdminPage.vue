<template>
  <div class="admin-home">
    <!-- 侧边导航栏 -->
    <aside class="sidebar">
      <button class="toggle-sidebar-btn" @click="toggleSidebar">
        <i class="el-icon-s-fold"></i>
      </button>
      <div class="user-info">
        <div class="avatar">{{ adminName.charAt(0) }}</div>
        <div>
          <p class="username">{{ adminName }}</p>
          <p class="role">系统管理员</p>
        </div>
      </div>

      <nav class="nav-menu">
        <div class="nav-item active">
          <i class="el-icon-menu"></i>
          <span>控制台概览</span>
        </div>
        <div class="nav-item" @click="$router.push('/admin/admin-review')">
          <i class="el-icon-user-solid"></i>
          <span>管理员审核</span>
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
        <div style="display: flex; align-items: center; margin-left: auto">
          <el-button
            type="warning"
            style="margin-right: 8px"
            @click="showChangePwd = true"
            >修改密码</el-button
          >
          <el-button type="primary" @click="logout">退出登录</el-button>
        </div>
        <el-dialog
          title="修改密码"
          :visible.sync="showChangePwd"
          width="400px"
          @close="resetPwdForm"
        >
          <el-form
            :model="pwdForm"
            :rules="pwdRules"
            ref="pwdFormRef"
            label-width="90px"
          >
            <el-form-item label="旧密码" prop="oldPwd">
              <el-input
                v-model="pwdForm.oldPwd"
                type="password"
                autocomplete="off"
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPwd">
              <el-input
                v-model="pwdForm.newPwd"
                type="password"
                autocomplete="off"
              />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPwd">
              <el-input
                v-model="pwdForm.confirmPwd"
                type="password"
                autocomplete="off"
              />
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="showChangePwd = false">取消</el-button>
            <el-button type="primary" @click="submitPwdForm"
              >确认修改</el-button
            >
          </span>
        </el-dialog>
      </header>

      <!-- 主要内容 -->
      <div class="content">
        <router-view v-if="$route.matched.length > 1"></router-view>
        <template v-else>
          <!-- 统计卡片 -->
          <div class="stats-grid">
            <el-card
              class="stat-card"
              shadow="hover"
              style="cursor: pointer"
              @click.native="handleStatCardClick('/admin/review')"
            >
              <div class="stat-content">
                <div>
                  <p class="stat-label">待审核机器人</p>
                  <p class="stat-value">{{ pendingRobotsTotal }}</p>
                </div>
                <div class="stat-icon">
                  <i class="el-icon-cpu"></i>
                </div>
              </div>
            </el-card>

            <el-card
              class="stat-card"
              shadow="hover"
              style="cursor: pointer"
              @click.native="handleStatCardClick('/admin/posts')"
            >
              <div class="stat-content">
                <div>
                  <p class="stat-label">待审核帖子和评论</p>
                  <p class="stat-value">
                    {{ pendingPostsTotal + pendingCommentsTotal }}
                  </p>
                </div>
                <div class="stat-icon">
                  <i class="el-icon-document"></i>
                </div>
              </div>
            </el-card>

            <el-card
              class="stat-card"
              shadow="hover"
              style="cursor: pointer"
              @click.native="handleStatCardClick('/admin/feedback')"
            >
              <div class="stat-content">
                <div>
                  <p class="stat-label">未处理反馈</p>
                  <p class="stat-value">{{ feedbackTotal }}</p>
                </div>
                <div class="stat-icon">
                  <i class="el-icon-chat-dot-round"></i>
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
                <div
                  class="item"
                  v-for="item in pendingRobots"
                  :key="item.id"
                  @click="navigateToRobotDetail(item)"
                  style="cursor: pointer"
                >
                  <div class="item-header">
                    <p class="item-name">{{ item.name }}</p>
                    <p class="item-time">{{ formatTime(item.time) }}</p>
                  </div>
                  <el-tag
                    :type="item.status === 'pending' ? 'warning' : 'success'"
                  >
                    {{ item.status === 'pending' ? '待审核' : '已通过' }}
                  </el-tag>
                </div>
              </div>
            </el-card>

            <!-- 待审核帖子和评论 -->
            <el-card class="content-card" shadow="hover">
              <div class="card-header">
                <h2 class="card-title">待审核帖子和评论</h2>
                <el-link
                  type="primary"
                  :underline="false"
                  @click="$router.push('/admin/posts')"
                  >查看全部</el-link
                >
              </div>

              <div class="items-list">
                <div
                  class="item"
                  v-for="item in combinedPendingItems.slice(0, 3)"
                  :key="item.id"
                  @click="navigateToDetail(item)"
                  style="cursor: pointer"
                >
                  <div class="item-header">
                    <p class="item-name">{{ item.name }}</p>
                    <p class="item-time">{{ formatTime(item.time) }}</p>
                  </div>
                  <el-tag type="warning">{{
                    item.type === 'post' ? '帖子' : '评论'
                  }}</el-tag>
                </div>
              </div>
            </el-card>

            <!-- 最新用户反馈 -->
            <el-card class="content-card" shadow="hover">
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
                  @click="navigateToFeedbackDetail(feedback)"
                  style="cursor: pointer"
                >
                  <div class="feedback-header">
                    <p class="feedback-user">{{ feedback.user }}</p>
                    <p class="feedback-time">{{ formatTime(feedback.time) }}</p>
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
import {
  changeAdminPassword,
  getPendingRobots,
  adminLogout,
  getAdminInfo,
  fetchRecentFeedbacks,
  fetchAllFeedbacks,
  getPostReportList,
  getCommentReportList,
} from '@/utils/api';

export default {
  name: 'AdminHomePage',
  computed: {
    combinedPendingItems() {
      // 合并帖子和评论，按时间排序
      const combined = [...this.pendingPosts, ...this.pendingComments];
      return combined.sort((a, b) => {
        return new Date(b.time) - new Date(a.time);
      });
    },
  },
  data() {
    return {
      isSidebarCollapsed: false,
      activeTab: 'review',
      showChangePwd: false,
      pwdForm: {
        oldPwd: '',
        newPwd: '',
        confirmPwd: '',
      },
      pwdRules: {
        oldPwd: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
        newPwd: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '新密码至少6位', trigger: 'blur' },
        ],
        confirmPwd: [
          { required: true, message: '请确认新密码', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value !== this.pwdForm.newPwd) {
                callback(new Error('两次输入的新密码不一致'));
              } else {
                callback();
              }
            },
            trigger: 'blur',
          },
        ],
      },
      pendingRobots: [],
      pendingRobotsLoading: false,
      pendingRobotsTotal: 0, // 新增总数量
      adminName: '', // 新增管理员名称
      pendingPosts: [], // 待审核帖子列表
      pendingPostsTotal: 0, // 待审核帖子总数
      pendingComments: [], // 待审核评论列表
      pendingCommentsTotal: 0, // 待审核评论总数
      recentFeedbacks: [],
      feedbackTotal: 0,
      async fetchRecentFeedbacks() {
        try {
          // 获取最新两条用于展示
          const res = await fetchRecentFeedbacks();
          if (res && res.data && Array.isArray(res.data.feedbacks)) {
            this.recentFeedbacks = res.data.feedbacks.map((fb) => ({
              id: fb.id,
              userId: fb.userId,
              user: fb.userName || `用户${fb.userId}`,
              time: fb.time,
              content: fb.feedback,
            }));
          } else {
            this.recentFeedbacks = [];
          }
        } catch (err) {
          this.recentFeedbacks = [];
          this.$message.error(err.message || '获取最新用户反馈失败');
        }
      },
      async fetchAllFeedbackTotal() {
        try {
          const res = await fetchAllFeedbacks();
          if (res && res.data && Array.isArray(res.data.feedbacks)) {
            // 只统计未处理的反馈数量（state字段未处理为0）
            this.feedbackTotal = res.data.feedbacks.filter(
              (fb) => !fb.state || fb.state === '0'
            ).length;
          } else {
            this.feedbackTotal = 0;
          }
        } catch (err) {
          this.feedbackTotal = 0;
        }
      },
    };
  },
  methods: {
    formatTime(time) {
      if (!time) return '';
      const d = new Date(time);
      return d.toLocaleString();
    },
    handleStatCardClick(path) {
      this.$router.push(path);
    },
    navigateToDetail(item) {
      if (item.type === 'post') {
        this.$router.push({
          name: 'AdminPostReviewDetail',
          params: { id: item.id },
        });
      } else {
        this.$router.push({
          name: 'AdminCommentReviewDetail',
          params: { id: item.id },
        });
      }
    },
    navigateToRobotDetail(robot) {
      this.$router.push({
        name: 'AdminRobotReviewDetail',
        params: { id: robot.id },
      });
    },
    navigateToFeedbackDetail(feedback) {
      if (feedback && feedback.id) {
        this.$router.push({
          name: 'AdminFeedbackDetail',
          params: {
            userId: feedback.userId || 'unknown',
            feedbackId: feedback.id,
          },
        });
      }
    },
    async fetchAdminInfo() {
      try {
        const res = await getAdminInfo();
        if (res.data && res.data.success) {
          this.adminName = res.data.adminInfo.adminName;
        } else {
          this.$message.error(res.data.message || '获取管理员信息失败');
        }
      } catch (err) {
        this.$message.error(err.message || '获取管理员信息失败');
      }
    },
    logout() {
      // 管理员登出逻辑
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          try {
            const res = await adminLogout();
            if (res.data && res.data.success) {
              this.$message.success(res.data.message || '登出成功');
              if (window.localStorage) {
                localStorage.removeItem('admin_token');
              }
            } else {
              if (window.localStorage) {
                localStorage.removeItem('admin_token');
              }
            }
          } catch (err) {
            if (window.localStorage) {
              localStorage.removeItem('admin_token');
            }
          } finally {
            this.$router.push('/');
          }
        })
        .catch(() => {
          // 用户取消
        });
    },
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
      const sidebar = document.querySelector('.sidebar');
      sidebar.classList.toggle('hidden');
    },
    async fetchPendingRobots() {
      this.pendingRobotsLoading = true;
      try {
        const res = await getPendingRobots({ page: 1, pageSize: 3 });
        if (res.data && res.data.success) {
          this.pendingRobots = res.data.data.map((robot) => ({
            id: robot.auditId, // 使用auditId作为ID
            name: robot.name,
            time: robot.createdAt,
            status: 'pending',
          }));
          this.pendingRobotsTotal =
            res.data.pagination?.totalCount || this.pendingRobots.length;
        } else {
          this.$message.error(res.data.message || '获取待审核机器人失败');
        }
      } catch (err) {
        this.$message.error(err.message || '获取待审核机器人失败');
      }
      this.pendingRobotsLoading = false;
    },
    async fetchPendingPosts() {
      try {
        // 获取待审核举报列表（status=0）
        const res = await getPostReportList({
          status: 0,
          page: 1,
          pageSize: 100,
        });
        if (res.data && res.data.success) {
          this.pendingPosts = res.data.data.map((item) => {
            let postTitle = '未知帖子';
            if (item.postTitle) {
              try {
                const titleObj = JSON.parse(item.postTitle);
                postTitle = titleObj.title || '未知帖子';
              } catch (e) {
                postTitle = item.postTitle;
              }
            }
            return {
              id: item.reportId || item.id,
              name: postTitle,
              time: item.createdAt || '',
              type: 'post',
            };
          });
          this.pendingPostsTotal = res.data.data.length;
        } else {
          this.pendingPosts = [];
          this.pendingPostsTotal = 0;
        }
      } catch (err) {
        this.pendingPosts = [];
        this.pendingPostsTotal = 0;
      }
    },

    async fetchPendingComments() {
      try {
        // 获取待审核评论举报列表（status=0）
        const res = await getCommentReportList({
          status: 0,
          page: 1,
          pageSize: 100,
        });
        if (res.data && res.data.success) {
          this.pendingComments = res.data.data.map((item) => {
            return {
              id: item.reportId || item.id,
              name: item.commentContent
                ? item.commentContent.length > 30
                  ? `${item.commentContent.substring(0, 30)}...`
                  : item.commentContent
                : '未知评论',
              time: item.createdAt || '',
              type: 'comment',
            };
          });
          this.pendingCommentsTotal = res.data.data.length;
        } else {
          this.pendingComments = [];
          this.pendingCommentsTotal = 0;
        }
      } catch (err) {
        this.pendingComments = [];
        this.pendingCommentsTotal = 0;
      }
    },
    async submitPwdForm() {
      this.$refs.pwdFormRef.validate(async (valid) => {
        if (!valid) return;
        try {
          const res = await changeAdminPassword({
            oldPassword: this.pwdForm.oldPwd,
            newPassword: this.pwdForm.newPwd,
          });
          if (res.data && res.data.success) {
            this.$message({
              type: 'success',
              message: res.data.message || '密码修改成功',
            });
            this.showChangePwd = false;
            this.resetPwdForm();
          } else {
            this.$message({
              type: 'error',
              message: res.data.message || '密码修改失败',
            });
          }
        } catch (err) {
          this.$message({
            type: 'error',
            message: err.response?.data?.message || '密码修改失败，请重试',
          });
        }
      });
    },
    resetPwdForm() {
      this.pwdForm.oldPwd = '';
      this.pwdForm.newPwd = '';
      this.pwdForm.confirmPwd = '';
      if (this.$refs.pwdFormRef) this.$refs.pwdFormRef.clearValidate();
    },
  },
  mounted() {
    this.fetchPendingRobots();
    this.fetchAdminInfo();
    this.fetchRecentFeedbacks();
    this.fetchAllFeedbackTotal();
    this.fetchPendingPosts();
    this.fetchPendingComments();
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
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;

        .content-card {
          /* 移除全宽样式，使每个卡片占据一列 */
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
            display: flex;
            flex-direction: column;
            gap: 8px;

            .feedback-item {
              padding: 10px;
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
