<template>
  <div class="admin-home">
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
        <h1 class="title">用户反馈管理</h1>
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
              placeholder="搜索用户名或反馈内容..."
              prefix-icon="el-icon-search"
              v-model="searchQuery"
              class="search-input"
            ></el-input>
          </div>
        </el-card>

        <!-- 反馈列表 -->
        <el-card class="post-list-card" shadow="hover">
          <div class="card-header">
            <h2 class="card-title">待处理用户反馈列表</h2>
            <div class="action-buttons">
              <span class="record-count"
                >共 {{ feedbackList.length }} 条记录</span
              >
              <el-select v-model="pageSize" class="page-size-select">
                <el-option label="10 条/页" value="10"></el-option>
                <el-option label="20 条/页" value="20"></el-option>
                <el-option label="50 条/页" value="50"></el-option>
              </el-select>
            </div>
          </div>

          <el-table
            :data="filteredFeedbacks"
            style="width: 100%"
            @row-click="viewFeedback"
          >
            <el-table-column
              prop="name"
              label="用户名"
              min-width="120"
            ></el-table-column>
            <el-table-column label="反馈内容" min-width="300">
              <template #default="scope">
                <p>{{ scope.row.content | truncateText(100) }}</p>
              </template>
            </el-table-column>
            <el-table-column label="提交时间" min-width="140">
              <template #default="scope">
                {{ formatTime(scope.row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <span class="pagination-info">
              显示 {{ currentPageStart }} 到 {{ currentPageEnd }} 条，共
              {{ feedbackList.length }} 条
            </span>
            <el-pagination
              layout="prev, pager, next"
              :total="feedbackList.length"
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
  getAdminInfo,
  fetchAllFeedbacks,
} from '@/utils/api';
export default {
  name: 'AdminFeedbackPage',
  filters: {
    truncateText(text, length) {
      if (!text) return '';
      if (text.length <= length) return text;
      return text.substring(0, length) + '...';
    },
  },
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
      feedbackList: [],
      async fetchFeedbackList() {
        try {
          const res = await fetchAllFeedbacks();
          // 适配后端返回 { message, feedbacks: [...] }
          if (res.data && Array.isArray(res.data.feedbacks)) {
            this.feedbackList = res.data.feedbacks
              .filter((f) => f.state === 0) // 只保留未解决的反馈
              .map((f) => ({
                id: f.id,
                name: f.userName || '未知用户',
                createdAt: f.time,
                content: f.feedback,
                status: 'pending', // 只有待处理的状态
                userId: f.userId,
              }));
          } else {
            this.$message.error('获取反馈数据失败');
          }
        } catch (err) {
          this.$message.error(err.message || '获取反馈数据失败');
        }
      },
    };
  },
  computed: {
    filteredFeedbacks() {
      let filtered = this.feedbackList;

      // 应用搜索过滤
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (feedback) =>
            feedback.name.toLowerCase().includes(query) ||
            feedback.content.toLowerCase().includes(query)
        );
      }

      // 应用分页
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + parseInt(this.pageSize);

      return filtered.slice(start, end);
    },
    currentPageStart() {
      return (this.currentPage - 1) * this.pageSize + 1;
    },
    currentPageEnd() {
      const end = this.currentPage * this.pageSize;
      return Math.min(end, this.feedbackList.length);
    },
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
        } else {
          this.$message.error(res.data.message || '获取管理员信息失败');
        }
      } catch (err) {
        this.$message.error(err.message || '获取管理员信息失败');
      }
    },
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
      localStorage.setItem('admin_sidebar_collapsed', this.isSidebarCollapsed);
    },
    handleCurrentChange(page) {
      this.currentPage = page;
    },
    viewFeedback(feedback) {
      this.$router.push(`/admin/feedback/${feedback.userId}/${feedback.id}`);
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
  },
  mounted() {
    this.fetchAdminInfo();
    this.fetchFeedbackList();
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

.content {
  padding: 24px;

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

  .post-list-card {
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
