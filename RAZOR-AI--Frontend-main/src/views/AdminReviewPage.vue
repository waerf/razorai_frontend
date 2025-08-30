<template>
  <div class="admin-robot-review">
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
        <div class="nav-item" @click="$router.push('/admin/admin-review')">
          <i class="el-icon-user-solid"></i>
          <span>管理员审核</span>
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
        <h1 class="title">机器人审核</h1>
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
      <div class="content" style="position: relative; min-height: 300px">
        <!-- loading 遮罩 -->
        <div v-if="loading" class="loading-mask">
          <div class="spinner"></div>
        </div>

        <!-- 搜索和筛选 -->
        <el-card class="search-card" shadow="hover">
          <div class="search-container">
            <el-input
              placeholder="搜索机器人名称或描述..."
              prefix-icon="el-icon-search"
              v-model="searchQuery"
              class="search-input"
            ></el-input>
          </div>
        </el-card>

        <!-- 机器人列表 -->
        <el-card class="robot-list-card" shadow="hover">
          <div class="card-header">
            <h2 class="card-title">待审核机器人列表</h2>
            <div class="action-buttons">
              <span class="record-count">共 {{ totalCount }} 条记录</span>
              <el-select
                v-model="pageSize"
                class="page-size-select"
                @change="handlePageSizeChange"
              >
                <el-option :label="'10 条/页'" :value="10"></el-option>
                <el-option :label="'20 条/页'" :value="20"></el-option>
                <el-option :label="'50 条/页'" :value="50"></el-option>
              </el-select>
            </div>
          </div>

          <el-table
            :data="filteredRobots"
            style="width: 100%"
            @row-click="goToReviewPage"
          >
            <el-table-column label="机器人信息" min-width="220">
              <template #default="scope">
                <p class="robot-name">{{ scope.row.name }}</p>
                <p class="robot-description">{{ scope.row.description }}</p>
              </template>
            </el-table-column>
            <el-table-column
              prop="creatorName"
              label="创建者"
              min-width="100"
            ></el-table-column>
            <el-table-column
              prop="createdAt"
              label="创建时间"
              min-width="140"
            ></el-table-column>
            <el-table-column label="状态" min-width="100">
              <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.status)" size="small">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <span class="pagination-info">
              显示 {{ currentPageStart }} 到 {{ currentPageEnd }} 条，共
              {{ totalCount }} 条
            </span>
            <el-pagination
              layout="prev, pager, next"
              :total="totalCount"
              :page-size="pageSize"
              :current-page="currentPage"
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
  getPendingRobots,
  changeAdminPassword,
  adminLogout,
  getAdminInfo,
} from '@/utils/api';
export default {
  name: 'AdminReviewPage',
  data() {
    return {
      isSidebarCollapsed: false,
      showChangePwd: false,
      adminName: '',
      searchQuery: '',
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
      pendingRobots: [], // 当前页显示的机器人
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      loading: false,
    };
  },
  methods: {
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
    goToReviewPage(row) {
      // 跳转详情页，使用路由 name+params，确保 id 正确传递
      // row是整行数据，我们需要提取id属性
      const id = row.id;
      this.$router.push({
        name: 'AdminRobotReviewDetail',
        params: { id: id },
        query: { fromList: true },
      });
    },
    handleCurrentChange(page) {
      this.currentPage = page;
      this.fetchPendingRobots(page);
    },
    handlePageSizeChange() {
      this.currentPage = 1;
      this.fetchPendingRobots(1);
    },
    async fetchPendingRobots(page = 1) {
      this.loading = true;
      try {
        const res = await getPendingRobots({ page, pageSize: this.pageSize });
        if (res.data && res.data.success) {
          this.pendingRobots = res.data.data.map((robot) => ({
            id: robot.auditId,
            name: robot.name,
            createdAt: robot.createdAt,
            description: robot.description,
            creatorName: robot.creatorName || robot.userName || '未知',
            status: 'pending', // 默认待审核状态
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
    this.fetchPendingRobots(1);
    this.fetchAdminInfo();
    // 监听页面返回，移除已审核机器人并刷新列表
    this.$watch(
      () => this.$route,
      (to) => {
        if (to.path === '/admin/review' && to.query && to.query.removedId) {
          // 重新拉取当前页，确保分页数据准确
          this.fetchPendingRobots(this.currentPage);
          // 清除 query，避免刷新重复删除
          this.$router.replace({ path: '/admin/review', query: {} });
        }
      }
    );
  },
  computed: {
    filteredRobots() {
      let filtered = this.pendingRobots;
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (robot) =>
            robot.name.toLowerCase().includes(query) ||
            (robot.description &&
              robot.description.toLowerCase().includes(query))
        );
      }
      return filtered;
    },
    currentPageStart() {
      return this.totalCount === 0
        ? 0
        : (this.currentPage - 1) * this.pageSize + 1;
    },
    currentPageEnd() {
      return Math.min(this.currentPage * this.pageSize, this.totalCount);
    },
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
.admin-robot-review {
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

      .search-card {
        margin-bottom: 24px;

        .search-container {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .search-input {
            width: 400px;
          }

          .filter-container {
            display: flex;
            gap: 12px;
          }
        }
      }

      .robot-list-card {
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

        .robot-name {
          font-weight: 500;
        }

        .robot-description {
          font-size: 12px;
          color: #999;
          margin-top: 4px;
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
  }
}
/* loading 遮罩样式 */
.loading-mask {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #409eff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
