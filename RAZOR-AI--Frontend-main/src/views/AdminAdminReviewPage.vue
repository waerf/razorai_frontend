<template>
  <div class="admin-admin-review">
    <!-- 侧边导航栏 -->
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
        <button class="toggle-sidebar-btn" @click="toggleSidebar">
          <i class="el-icon-s-fold"></i>
        </button>
        <h1 class="title">管理员审核</h1>
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
        <!-- 搜索和筛选 -->
        <el-card class="search-card" shadow="hover">
          <div class="search-container">
            <el-input
              placeholder="搜索管理员名称或邮箱..."
              prefix-icon="el-icon-search"
              v-model="searchQuery"
              class="search-input"
            ></el-input>
          </div>
        </el-card>

        <!-- 管理员列表 -->
        <el-card class="admin-list-card" shadow="hover">
          <div class="card-header">
            <h2 class="card-title">待审核管理员列表</h2>
            <div class="action-buttons">
              <span class="record-count"
                >共 {{ pendingAdmins.length }} 条记录</span
              >
              <el-select v-model="pageSize" class="page-size-select">
                <el-option label="10 条/页" :value="10"></el-option>
                <el-option label="20 条/页" :value="20"></el-option>
                <el-option label="50 条/页" :value="50"></el-option>
              </el-select>
            </div>
          </div>

          <el-table :data="filteredAdmins" style="width: 100%">
            <el-table-column label="管理员信息" min-width="220">
              <template #default="scope">
                <p class="admin-name">{{ scope.row.username }}</p>
                <p class="admin-email">{{ scope.row.email }}</p>
              </template>
            </el-table-column>
            <el-table-column label="注册理由" min-width="200">
              <template #default="scope">
                <p>{{ scope.row.RegistrationReason || '无' }}</p>
              </template>
            </el-table-column>
            <el-table-column label="申请时间" min-width="180">
              <template #default="scope">
                {{ formatTime(scope.row.registeredAt) }}
              </template>
            </el-table-column>
            <el-table-column label="状态" min-width="100">
              <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.status)" size="small">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="160">
              <template #default="scope">
                <el-button
                  type="success"
                  size="mini"
                  @click="approveAdmin(scope.row.id)"
                  >通过</el-button
                >
                <el-button
                  type="danger"
                  size="mini"
                  @click="rejectAdmin(scope.row.id)"
                  >拒绝</el-button
                >
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <span class="pagination-info">
              显示 {{ currentPageStart }} 到 {{ currentPageEnd }} 条，共
              {{ pendingAdmins.length }} 条
            </span>
            <el-pagination
              layout="prev, pager, next"
              :total="pendingAdmins.length"
              :page-size="pageSize"
              @current-change="handleCurrentChange"
            ></el-pagination>
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
  sendExternalNotification,
} from '@/utils/api';
export default {
  name: 'AdminAdminReviewPage',
  data() {
    return {
      isSidebarCollapsed:
        localStorage.getItem('admin_sidebar_collapsed') === 'true',
      showChangePwd: false,
      adminName: '',
      searchQuery: '',
      pageSize: 10,
      currentPage: 1,
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
  computed: {
    filteredAdmins() {
      let filtered = this.pendingAdmins;
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (admin) =>
            admin.username.toLowerCase().includes(query) ||
            admin.email.toLowerCase().includes(query) ||
            (admin.RegistrationReason &&
              admin.RegistrationReason.toLowerCase().includes(query))
        );
      }
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + parseInt(this.pageSize);
      return filtered.slice(start, end);
    },
    currentPageStart() {
      return this.pendingAdmins.length === 0
        ? 0
        : (this.currentPage - 1) * this.pageSize + 1;
    },
    currentPageEnd() {
      return Math.min(
        this.currentPage * this.pageSize,
        this.pendingAdmins.length
      );
    },
  },
  mounted() {
    this.fetchPendingAdmins();
    this.fetchAdminInfo();
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
    handleCurrentChange(page) {
      this.currentPage = page;
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
            status: 'pending', // 默认状态为待审核
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
      localStorage.setItem('admin_sidebar_collapsed', this.isSidebarCollapsed);
      // 不再需要手动切换class，由上面的:class绑定自动处理
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

          // 发送外部通知前，先查找对应的管理员信息
          const admin = this.pendingAdmins.find(
            (admin) => admin.id === adminId
          );
          if (admin && admin.email) {
            // 使用管理员的邮箱作为目标地址
            try {
              await sendExternalNotification({
                UserId: adminId, // 仍然保留ID用于创建通知记录
                Message: '您的管理员申请已通过审核。',
                Email: admin.email, // 添加额外的邮箱字段
              });
            } catch (e) {
              this.$message.warning('外部通知发送失败: ' + (e.message || '')); // 不影响主流程
            }
          }
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

          // 发送外部通知前，先查找对应的管理员信息
          const admin = this.pendingAdmins.find(
            (admin) => admin.id === adminId
          );
          if (admin && admin.email) {
            // 使用管理员的邮箱作为目标地址
            try {
              await sendExternalNotification({
                UserId: adminId, // 仍然保留ID用于创建通知记录
                Message: '您的管理员申请未通过审核。',
                Email: admin.email, // 添加额外的邮箱字段
              });
            } catch (e) {
              this.$message.warning('外部通知发送失败: ' + (e.message || ''));
            }
          }
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
@import '@/assets/styles/admin-home.scss';

// 复用 admin-home 的布局和 sidebar 样式，单独调整 admin-admin-review 的内容区
.admin-admin-review {
  @extend .admin-home;

  .admin-list-card {
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

    .admin-name {
      font-weight: 500;
    }

    .admin-email {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
    }

    ::v-deep .el-table__row td:nth-child(3) {
      white-space: nowrap;
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
