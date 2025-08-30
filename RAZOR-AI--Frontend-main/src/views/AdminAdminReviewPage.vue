<template>
  <div class="admin-home">
    <!-- 侧边导航栏 -->
    <aside class="sidebar">
      <button class="toggle-sidebar-btn" @click="toggleSidebar">
        <i class="el-icon-s-fold"></i>
      </button>
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
        <div class="nav-item active">
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
        <h1 class="title">管理员审核列表</h1>
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
        <!-- 管理员列表 -->
        <el-card class="post-list-card" shadow="hover">
          <div class="card-header">
            <h2 class="card-title">待审核管理员</h2>
            <span class="text-sm text-gray-500"
              >共 {{ pendingAdmins.length }} 个待审核</span
            >
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div
                v-for="(admin, index) in pendingAdmins"
                :key="index"
                class="p-4 border border-gray-100 rounded-lg card-hover cursor-pointer"
              >
                <div class="flex items-center justify-between mb-2">
                  <p class="font-medium">{{ admin.username }}</p>
                  <p class="text-sm text-gray-500">{{ admin.registeredAt }}</p>
                </div>
                <el-tag type="warning">待审核</el-tag>
                <p class="text-gray-600 text-sm mt-2">
                  邮箱：{{ admin.email }}
                </p>
                <p
                  v-if="admin.RegistrationReason"
                  class="text-gray-600 text-sm mt-2"
                >
                  注册理由：{{ admin.RegistrationReason }}
                </p>
                <div class="mt-3 flex gap-2">
                  <el-button
                    type="success"
                    size="mini"
                    @click="approveAdmin(admin.id)"
                    >通过</el-button
                  >
                  <el-button
                    type="danger"
                    size="mini"
                    @click="rejectAdmin(admin.id)"
                    >拒绝</el-button
                  >
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </main>
  </div>
</template>

<script>
import {
  changeAdminPassword,
  adminLogout,
  getPendingAdmins,
  getAdminInfo,
  reviewAdmin,
} from '@/utils/api';
export default {
  name: 'AdminAdminReviewPage',
  data() {
    return {
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
      pendingAdmins: [],
    };
  },
  created() {
    this.fetchPendingAdmins();
    this.fetchAdminInfo();
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
    async fetchPendingAdmins() {
      try {
        const res = await getPendingAdmins();
        if (res.data && res.data.success) {
          // 兼容后端返回的字段
          this.pendingAdmins = (res.data.data || []).map((a) => ({
            id: a.adminId || a.id || a.auditId,
            username: a.adminName || a.username,
            registeredAt: a.createdAt || a.registeredAt,
            email: a.email,
            RegistrationReason:
              a.RegistrationReason ||
              a.registrationReason ||
              a.register_reason ||
              a.reason ||
              '',
          }));
        } else {
          this.$message.error(res.data.message || '获取待审核管理员失败');
        }
      } catch (err) {
        this.$message.error(err.message || '获取待审核管理员失败');
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
    async approveAdmin(adminId) {
      try {
        const res = await reviewAdmin({ adminId, status: 1 });
        if (res.data && res.data.success) {
          this.$message.success(res.data.message || '审核通过成功');
          await this.fetchPendingAdmins();
        } else {
          this.$message.error(res.data.message || '审核失败');
        }
      } catch (err) {
        this.$message.error(err.message || '审核失败，请重试');
      }
    },
    async rejectAdmin(adminId) {
      try {
        const res = await reviewAdmin({ adminId, status: 2 });
        if (res.data && res.data.success) {
          this.$message.success(res.data.message || '已拒绝该管理员');
          await this.fetchPendingAdmins();
        } else {
          this.$message.error(res.data.message || '操作失败');
        }
      } catch (err) {
        this.$message.error(err.message || '操作失败，请重试');
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
