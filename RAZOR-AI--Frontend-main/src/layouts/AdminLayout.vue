<template>
  <div class="admin-layout">
    <!-- 侧边导航栏 -->
    <aside class="sidebar" :class="{ hidden: isSidebarCollapsed }">
      <div class="user-info">
        <div class="avatar">{{ adminName.charAt(0) }}</div>
        <div>
          <p class="username">{{ adminName }}</p>
          <p class="role">系统管理员</p>
        </div>
      </div>

      <nav class="nav-menu">
        <div
          class="nav-item"
          :class="{ active: $route.path === '/admin' }"
          @click="$router.push('/admin')"
        >
          <i class="el-icon-menu"></i>
          <span>控制台概览</span>
        </div>
        <div
          class="nav-item"
          :class="{ active: $route.path === '/admin/admin-review' }"
          @click="$router.push('/admin/admin-review')"
        >
          <i class="el-icon-user-solid"></i>
          <span>管理员审核</span>
        </div>
        <div
          class="nav-item"
          :class="{
            active:
              $route.path === '/admin/review' ||
              $route.path.startsWith('/admin/robots/'),
          }"
          @click="$router.push('/admin/review')"
        >
          <i class="el-icon-cpu"></i>
          <span>机器人审核</span>
        </div>
        <div
          class="nav-item"
          :class="{
            active:
              $route.path.startsWith('/admin/posts') ||
              $route.path.startsWith('/admin/post-report') ||
              $route.path.startsWith('/admin/comment-report'),
          }"
          @click="$router.push('/admin/posts')"
        >
          <i class="el-icon-document"></i>
          <span>帖子审核</span>
        </div>
        <div
          class="nav-item"
          :class="{
            active:
              $route.path === '/admin/feedback' ||
              $route.path.startsWith('/admin/feedback/'),
          }"
          @click="$router.push('/admin/feedback')"
        >
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
        <h1 class="title">{{ pageTitle }}</h1>
        <div style="display: flex; align-items: center; margin-left: auto">
          <el-button
            type="warning"
            style="margin-right: 8px"
            @click="showChangePwd = true"
          >
            修改密码
          </el-button>
          <el-button type="primary" @click="logout">退出登录</el-button>
        </div>
      </header>

      <!-- 主要内容 -->
      <div class="content">
        <router-view></router-view>
      </div>
    </main>

    <!-- 修改密码对话框 -->
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
        <el-button type="primary" @click="submitPwdForm">确认修改</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { changeAdminPassword, adminLogout, getAdminInfo } from '@/utils/api';

export default {
  name: 'AdminLayout',
  provide() {
    return {
      adminInfo: this.adminInfo,
      refreshAdminInfo: this.fetchAdminInfo,
    };
  },
  data() {
    return {
      isSidebarCollapsed:
        localStorage.getItem('admin_sidebar_collapsed') === 'true',
      showChangePwd: false,
      adminName: '',
      adminInfo: {},
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
    pageTitle() {
      const path = this.$route.path;

      if (path === '/admin') return '控制台';
      if (path === '/admin/admin-review') return '管理员审核';
      if (path === '/admin/review') return '机器人审核';
      if (path.startsWith('/admin/robots/')) return '机器人审核详情';
      if (path.startsWith('/admin/comment-report/')) return '评论举报详情';
      if (path.startsWith('/admin/post-report/')) return '帖子举报详情';
      if (path.startsWith('/admin/posts')) return '帖子审核';
      if (path.startsWith('/admin/feedback/')) return '用户反馈详情';
      if (path === '/admin/feedback') return '用户反馈管理';

      return '管理员控制台';
    },
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
      localStorage.setItem('admin_sidebar_collapsed', this.isSidebarCollapsed);
    },
    async fetchAdminInfo() {
      try {
        const res = await getAdminInfo();
        if (res.data && res.data.success) {
          this.adminName = res.data.adminInfo.adminName;
          this.adminInfo = res.data.adminInfo;
        } else {
          this.$message.error(res.data.message || '获取管理员信息失败');
        }
      } catch (err) {
        this.$message.error(err.message || '获取管理员信息失败');
      }
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
            }
          } catch (err) {
            // 忽略登出API错误
          } finally {
            if (window.localStorage) {
              localStorage.removeItem('admin_token');
            }
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
  },
  mounted() {
    this.fetchAdminInfo();
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

.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f5;

  .sidebar {
    position: relative;
    transition: width 0.3s ease;

    &.hidden {
      width: 60px !important;

      .nav-item {
        span {
          opacity: 0;
          white-space: nowrap;
          width: 0;
          overflow: hidden;
          transition: opacity 0.1s ease;
        }

        i {
          margin-right: 0;
          width: auto;
        }
      }

      .user-info {
        flex-direction: column;
        align-items: center;
        padding: 10px;
        height: 80px;
        box-sizing: border-box;
        position: relative;
        transition: padding 0.3s ease;

        .avatar {
          position: absolute;
          left: 10px;
          top: 20px;
          margin-right: 0;
          margin-bottom: 0;
          width: 40px;
          height: 40px;
          min-width: 40px;
          min-height: 40px;
        }

        .username,
        .role {
          opacity: 0;
          width: 0;
          white-space: nowrap;
          overflow: hidden;
          transition: opacity 0.1s ease;
          position: absolute;
          left: -9999px;
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
      padding: 0 10px 0 70px;
      border-bottom: 1px solid #e6e6e6;
      height: 80px;
      box-sizing: border-box;
      transition: padding 0.3s ease;
      position: relative;

      .avatar {
        position: absolute;
        left: 10px;
        top: 20px;
        width: 40px;
        height: 40px;
        min-width: 40px;
        min-height: 40px;
        background-color: #165dff;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        transition: none;
      }

      .username {
        font-weight: 500;
        margin-bottom: 4px;
        opacity: 1;
        transition: opacity 0.2s ease 0.2s;
        white-space: nowrap;
        padding-left: 0;
        position: relative;
      }

      .role {
        font-size: 12px;
        color: #999;
        opacity: 1;
        transition: opacity 0.2s ease 0.2s;
        white-space: nowrap;
        padding-left: 0;
      }
    }

    .nav-menu {
      padding: 10px 0;

      .nav-item {
        display: flex;
        align-items: center;
        height: 48px;
        padding: 0 20px;
        margin: 4px 0;
        cursor: pointer;
        transition: background-color 0.3s ease;
        box-sizing: border-box;

        span {
          opacity: 1;
          transition: opacity 0.2s ease 0.2s;
          white-space: nowrap;
          overflow: hidden;
        }

        i {
          margin-right: 12px;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          transition: margin-right 0.2s ease;
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
      justify-content: flex-start;
      align-items: center;
      padding: 16px 24px;
      background-color: white;
      border-bottom: 1px solid #e6e6e6;
      position: sticky;
      top: 0;
      z-index: 10;

      .toggle-sidebar-btn {
        cursor: pointer;
        font-size: 18px;
        background: none;
        border: none;
        color: #606266;
        padding: 5px;
        margin-right: 16px;
        border-radius: 4px;

        &:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
      }

      .title {
        font-size: 20px;
        font-weight: 600;
      }
    }

    .content {
      padding: 24px;
    }
  }
}
</style>
