<template>
  <div class="admin-home">
    <!-- 侧边导航栏 -->
    <aside class="sidebar">
      <div class="user-info">
        <div class="avatar">{{ adminName ? adminName.charAt(0) : '管' }}</div>
        <div>
          <p class="username">{{ adminName || '管理员' }}</p>
          <p class="role">系统管理员</p>
        </div>
      </div>
      <nav class="nav-menu">
        <div class="nav-item" @click="$router.push('/admin')">
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
        <div class="nav-item active">
          <i class="el-icon-chat-dot-round"></i>
          <span>用户反馈</span>
        </div>
      </nav>
    </aside>
    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 顶部导航栏 -->
      <header class="header">
        <button class="toggle-sidebar-btn" @click="toggleSidebar">
          <i class="el-icon-s-fold"></i>
        </button>
        <h1 class="title">用户反馈详情</h1>
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
        <el-button
          type="default"
          icon="el-icon-arrow-left"
          style="margin-bottom: 16px"
          @click="$router.push('/admin/feedback')"
        >
          返回列表
        </el-button>
        <el-card class="feedback-detail-card" shadow="hover">
          <div v-if="loading" class="feedback-loading">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-line"></div>
            <div class="skeleton skeleton-line"></div>
            <div class="skeleton skeleton-line"></div>
          </div>
          <div v-else-if="feedbackDetail">
            <div class="feedback-header">
              <div class="avatar-placeholder">
                {{
                  feedbackDetail.userName
                    ? feedbackDetail.userName.charAt(0)
                    : '匿'
                }}
              </div>
              <div class="feedback-user-info">
                <div class="feedback-username">
                  {{ feedbackDetail.userName || '匿名用户' }}
                </div>
                <div class="feedback-time">
                  {{ formatTime(feedbackDetail.time) }}
                </div>
              </div>
            </div>
            <div class="feedback-content">
              <span
                class="feedback-state"
                :class="{ processed: feedbackDetail.state === 1 }"
              >
                {{ feedbackDetail.state === 1 ? '已处理' : '未处理' }}
              </span>
              <p>{{ feedbackDetail.feedback }}</p>
              <div v-if="feedbackDetail.state !== 1" style="margin-top: 16px">
                <button @click="handleProcessFeedback" class="process-btn">
                  标记为已处理
                </button>
              </div>
            </div>
          </div>
          <div v-else class="feedback-empty">
            <div v-if="errorMsg" style="color: #e74c3c; margin-bottom: 12px">
              {{ errorMsg }}
            </div>
            暂无反馈详情
          </div>
        </el-card>
      </div>
    </main>
  </div>
</template>

<script>
import {
  fetchUserFeedbacks,
  updateFeedbackState,
  changeAdminPassword,
  adminLogout,
  getAdminInfo,
} from '@/utils/api';

export default {
  name: 'AdminFeedbackDetail',
  props: {
    userId: {
      type: [String, Number],
      required: false,
      default: null,
    },
    feedbackId: {
      type: [String, Number],
      required: false,
      default: null,
    },
  },
  data() {
    return {
      feedbackDetail: null,
      loading: true,
      errorMsg: '',
      isSidebarCollapsed: false,
      showChangePwd: false,
      adminName: '',
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
    };
  },
  computed: {
    resolvedUserId() {
      // 优先用 props，否则用路由参数
      return this.userId !== null && this.userId !== undefined
        ? this.userId
        : this.$route.params.userId;
    },
    resolvedFeedbackId() {
      return this.feedbackId !== null && this.feedbackId !== undefined
        ? this.feedbackId
        : this.$route.params.feedbackId;
    },
  },
  methods: {
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
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
      const sidebar = document.querySelector('.sidebar');
      sidebar.classList.toggle('hidden');
    },
    logout() {
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
    async loadFeedbackDetail() {
      this.loading = true;
      const userId = this.resolvedUserId;
      const feedbackId = this.resolvedFeedbackId;
      if (
        userId === undefined ||
        userId === null ||
        userId === '' ||
        isNaN(Number(userId)) ||
        feedbackId === undefined ||
        feedbackId === null ||
        feedbackId === '' ||
        isNaN(Number(feedbackId))
      ) {
        this.errorMsg = '用户ID或反馈ID无效，无法获取反馈详情';
        this.feedbackDetail = null;
        this.loading = false;
        return;
      }
      try {
        const res = await fetchUserFeedbacks(userId);
        if (res && res.data && Array.isArray(res.data.feedbacks)) {
          this.feedbackDetail = res.data.feedbacks.find(
            (f) => f.id == feedbackId
          );
        }
      } catch (e) {
        this.errorMsg = e.message || '获取反馈详情失败';
      } finally {
        this.loading = false;
      }
    },
    async handleProcessFeedback() {
      if (!this.feedbackDetail || this.feedbackDetail.state === 1) return;
      try {
        await updateFeedbackState(this.feedbackDetail.id);
        this.$message && this.$message.success
          ? this.$message.success('反馈已标记为已处理')
          : alert('反馈已标记为已处理');
        this.feedbackDetail.state = 1;
      } catch (e) {
        this.$message && this.$message.error
          ? this.$message.error(e.message || '处理失败')
          : alert(e.message || '处理失败');
      }
    },
    formatTime(time) {
      if (!time) return '';
      const d = new Date(time);
      return d.toLocaleString();
    },
  },
  mounted() {
    this.fetchAdminInfo();
    this.loadFeedbackDetail();
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/admin-home.scss';

.feedback-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}
.avatar-placeholder {
  width: 48px;
  height: 48px;
  background: #eee;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #888;
  margin-right: 16px;
}
.feedback-user-info {
  margin-left: 16px;
}
.feedback-username {
  font-weight: bold;
  font-size: 18px;
}
.feedback-time {
  color: #888;
  font-size: 14px;
}
.feedback-content {
  margin-top: 16px;
}
.feedback-state {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 13px;
  background: #f0f0f0;
  color: #888;
  margin-bottom: 8px;
}
.feedback-state.processed {
  background: #e6f7e6;
  color: #52c41a;
}
.process-btn {
  padding: 6px 18px;
  background: #52c41a;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 15px;
  margin-top: 8px;
  transition: background 0.2s;
}
.process-btn:hover {
  background: #389e0d;
}
.feedback-empty {
  text-align: center;
  color: #aaa;
  padding: 40px 0;
  font-size: 18px;
}
.skeleton {
  background: #f2f2f2;
  border-radius: 4px;
  margin-bottom: 12px;
  animation: skeleton-loading 1.2s infinite linear alternate;
}
.skeleton-title {
  width: 60%;
  height: 24px;
}
.skeleton-line {
  width: 100%;
  height: 16px;
}
@keyframes skeleton-loading {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}
</style>
