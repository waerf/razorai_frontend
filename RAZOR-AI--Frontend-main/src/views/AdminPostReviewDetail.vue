<template>
  <div class="admin-post-review-detail">
    <aside class="sidebar" :class="{ hidden: isSidebarCollapsed }">
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
        <div class="nav-item active">
          <i class="el-icon-document"></i>
          <span>帖子审核</span>
        </div>
        <div class="nav-item" @click="$router.push('/admin/feedback')">
          <i class="el-icon-chat-dot-round"></i>
          <span>用户反馈</span>
        </div>
      </nav>
    </aside>
    <main class="main-content">
      <header class="header">
        <button class="toggle-sidebar-btn" @click="toggleSidebar">
          <i class="el-icon-s-fold"></i>
        </button>
        <h1 class="title">帖子举报详情</h1>
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
      <div class="content">
        <el-button
          type="default"
          icon="el-icon-arrow-left"
          style="margin-bottom: 16px"
          @click="$router.push('/admin/posts')"
        >
          返回列表
        </el-button>
        <el-card v-if="loading" class="loading-card"
          ><el-skeleton rows="6" animated
        /></el-card>
        <el-card v-else class="detail-card" shadow="hover">
          <div class="detail-header">
            <h2>举报详情</h2>
            <el-tag :type="getStatusTagType(report.status)" size="small">{{
              getStatusText(report.status)
            }}</el-tag>
          </div>
          <el-descriptions :column="2" border :label-width="90">
            <el-descriptions-item label="举报ID">{{
              report.reportId
            }}</el-descriptions-item>
            <el-descriptions-item label="帖子ID">{{
              report.postId
            }}</el-descriptions-item>
            <el-descriptions-item label="帖子标题">{{
              parsedPostTitle.title || '-'
            }}</el-descriptions-item>
            <el-descriptions-item label="帖子作者">{{
              parsedPostTitle.author || '-'
            }}</el-descriptions-item>
            <el-descriptions-item label="帖子内容" :span="2">{{
              parsedPostTitle.content || '-'
            }}</el-descriptions-item>
            <el-descriptions-item label="帖子标签" :span="2">
              <template
                v-if="parsedPostTitle.tags && parsedPostTitle.tags.length"
              >
                <el-tag
                  v-for="tag in parsedPostTitle.tags"
                  :key="tag"
                  style="margin-right: 4px"
                  >{{ tag }}</el-tag
                >
              </template>
              <template v-else>-</template>
            </el-descriptions-item>
            <el-descriptions-item label="举报人">{{
              report.reporterName
            }}</el-descriptions-item>
            <el-descriptions-item label="举报原因">{{
              report.reportReason
            }}</el-descriptions-item>
            <el-descriptions-item label="举报详情" :span="2">{{
              report.reportDetails
            }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{
              formatTime(report.createdAt)
            }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{
              formatTime(report.updatedAt)
            }}</el-descriptions-item>
          </el-descriptions>
          <div class="action-section" v-if="report.status === 0">
            <el-form :model="reviewForm" label-width="80px" class="review-form">
              <el-form-item label="审核操作">
                <el-radio-group v-model="reviewForm.status">
                  <el-radio :label="1">有效</el-radio>
                  <el-radio :label="2">无效</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="审核备注">
                <el-input
                  v-model="reviewForm.reviewComment"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入审核备注（可选）"
                />
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  @click="submitReview"
                  :loading="reviewing"
                  >提交审核</el-button
                >
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </div>
    </main>
  </div>
</template>

<script>
import {
  getAdminInfo,
  adminLogout,
  changeAdminPassword,
  getPostReportDetail,
  reviewPostReport,
  //sendReviewNotification,
} from '@/utils/api';
export default {
  name: 'AdminPostReviewDetail',
  data() {
    return {
      isSidebarCollapsed:
        localStorage.getItem('admin_sidebar_collapsed') === 'true',
      adminName: '',
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
      loading: true,
      report: {},
      parsedPostTitle: {},
      reviewForm: {
        status: 1,
        reviewComment: '',
      },
      reviewing: false,
    };
  },
  methods: {
    formatTime(time) {
      if (!time) return '';
      const d = new Date(time);
      return d.toLocaleString();
    },
    async fetchAdminInfo() {
      try {
        const res = await getAdminInfo();
        if (res.data && res.data.success) {
          this.adminName = res.data.adminInfo.adminName;
        }
      } catch (e) {
        // intentionally ignored
      }
    },
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
      localStorage.setItem('admin_sidebar_collapsed', this.isSidebarCollapsed);
    },
    logout() {
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
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
      });
      // 用户取消操作时无需处理
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
    getStatusTagType(status) {
      switch (status) {
        case 0:
        case 'pending':
          return 'warning';
        case 1:
        case 'approved':
          return 'success';
        case 2:
        case 'rejected':
          return 'danger';
        default:
          return '';
      }
    },
    getStatusText(status) {
      switch (status) {
        case 0:
        case 'pending':
          return '待审核';
        case 1:
        case 'approved':
          return '已通过';
        case 2:
        case 'rejected':
          return '已拒绝';
        default:
          return '';
      }
    },
    async fetchReportDetail() {
      this.loading = true;
      try {
        const reportId = this.$route.params.id;
        const res = await getPostReportDetail(reportId);
        if (res.data && res.data.success) {
          this.report = res.data.data;
          // 解析帖子标题内容
          let parsed = {};
          try {
            if (typeof this.report.postTitle === 'string') {
              parsed = JSON.parse(this.report.postTitle);
            } else if (
              typeof this.report.postTitle === 'object' &&
              this.report.postTitle !== null
            ) {
              parsed = this.report.postTitle;
            }
          } catch (e) {
            parsed = { title: this.report.postTitle || '' };
          }
          this.parsedPostTitle = parsed || {};
        } else {
          this.$message.error(res.data.message || '获取举报详情失败');
        }
      } catch (err) {
        this.$message.error(err.message || '获取举报详情失败');
      } finally {
        this.loading = false;
      }
    },
    async submitReview() {
      if (!this.reviewForm.status) {
        this.$message.warning('请选择审核操作');
        return;
      }
      this.reviewing = true;
      try {
        const res = await reviewPostReport({
          reportId: this.report.reportId,
          status: this.reviewForm.status,
          reviewComment: this.reviewForm.reviewComment,
        });
        if (res.data && res.data.success) {
          /*
          // 审核通过时向举报人发送通知，内容为“您举报的帖子已被处理，感谢您的反馈”
          if (this.reviewForm.status === 1 && this.report.reporterId) {
            const notifyMsg = `您举报的帖子已被处理，感谢您的反馈。`;
            sendReviewNotification({
              userId: this.report.reporterId,
              notificationType: 0,
              message: notifyMsg,
            }).catch(() => {}); // 忽略通知失败
          }
          */
          this.$message.success(res.data.message || '审核成功');
          this.fetchReportDetail();

          // 审核提交成功后，返回列表页
          this.$router.push('/admin/posts');
        } else {
          this.$message.error(res.data.message || '审核失败');
        }
      } catch (err) {
        this.$message.error(err.message || '审核失败');
      } finally {
        this.reviewing = false;
      }
    },
  },
  mounted() {
    this.fetchAdminInfo();
    this.fetchReportDetail();
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

@import '@/assets/styles/admin-home.scss';

.admin-post-review-detail {
  @extend .admin-home;

  // 内容区自定义样式
  .content {
    padding: 24px;

    .loading-card {
      min-height: 300px;
    }

    .detail-card {
      max-width: 800px;
      margin: 0 auto;

      .detail-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
      }

      ::v-deep .el-descriptions__cell {
        &.is-bordered-label {
          min-width: 90px;
        }
      }

      ::v-deep .el-descriptions__cell {
        &.el-descriptions-item__content {
          white-space: nowrap;
        }
      }

      .action-section {
        margin-top: 32px;

        .review-form {
          max-width: 400px;
        }
      }
    }
  }
}
</style>
