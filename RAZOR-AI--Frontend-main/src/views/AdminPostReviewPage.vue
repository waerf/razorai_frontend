<template>
  <div class="admin-post-review">
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

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 顶部导航栏 -->
      <header class="header">
        <h1 class="title">帖子审核</h1>
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
              placeholder="搜索帖子标题或内容..."
              prefix-icon="el-icon-search"
              v-model="searchQuery"
              class="search-input"
            ></el-input>
            <!-- 已移除状态和类型筛选 -->
          </div>
        </el-card>

        <!-- 列表切换标签 -->
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="待审核帖子" name="posts"></el-tab-pane>
          <el-tab-pane label="待审核评论" name="comments"></el-tab-pane>
        </el-tabs>

        <!-- 帖子列表 -->
        <el-card
          v-if="activeTab === 'posts'"
          class="post-list-card"
          shadow="hover"
        >
          <div class="card-header">
            <h2 class="card-title">待审核帖子列表</h2>
            <div class="action-buttons">
              <span class="record-count">共 {{ posts.length }} 条记录</span>
              <el-select v-model="pageSize" class="page-size-select">
                <el-option label="10 条/页" value="10"></el-option>
                <el-option label="20 条/页" value="20"></el-option>
                <el-option label="50 条/页" value="50"></el-option>
              </el-select>
            </div>
          </div>

          <el-table
            :data="filteredPosts"
            style="width: 100%"
            @row-click="viewPost"
          >
            <el-table-column label="帖子标题" min-width="220">
              <template #default="scope">
                <p class="post-title">{{ scope.row.title }}</p>
                <p class="post-subtitle">{{ scope.row.subtitle }}</p>
              </template>
            </el-table-column>
            <el-table-column
              prop="author"
              label="作者"
              min-width="100"
            ></el-table-column>
            <el-table-column label="提交时间" min-width="140">
              <template #default="scope">
                {{ formatTime(scope.row.time) }}
              </template>
            </el-table-column>
            <!-- 已移除类型列 -->
            <el-table-column label="状态" min-width="100">
              <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.status)" size="small">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>

          <!-- 帖子分页 -->
          <div class="pagination-container">
            <span class="pagination-info">
              显示 {{ currentPageStart }} 到 {{ currentPageEnd }} 条，共
              {{ posts.length }} 条
            </span>
            <el-pagination
              layout="prev, pager, next"
              :total="posts.length"
              :page-size="pageSize"
              @current-change="handleCurrentChange"
            ></el-pagination>
          </div>
        </el-card>

        <!-- 评论列表 -->
        <el-card
          v-if="activeTab === 'comments'"
          class="post-list-card"
          shadow="hover"
        >
          <div class="card-header">
            <h2 class="card-title">待审核评论列表</h2>
            <div class="action-buttons">
              <span class="record-count">共 {{ comments.length }} 条记录</span>
              <el-select v-model="commentPageSize" class="page-size-select">
                <el-option label="10 条/页" value="10"></el-option>
                <el-option label="20 条/页" value="20"></el-option>
                <el-option label="50 条/页" value="50"></el-option>
              </el-select>
            </div>
          </div>

          <el-table
            :data="filteredComments"
            style="width: 100%"
            @row-click="viewComment"
          >
            <el-table-column label="评论内容" min-width="220">
              <template #default="scope">
                <p class="post-title">{{ scope.row.commentContent }}</p>
                <p class="post-subtitle">{{ scope.row.reportReason }}</p>
              </template>
            </el-table-column>
            <el-table-column
              prop="reporterName"
              label="举报人"
              min-width="100"
            ></el-table-column>
            <el-table-column label="举报时间" min-width="140">
              <template #default="scope">
                {{ formatTime(scope.row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="状态" min-width="100">
              <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.status)" size="small">
                  {{ scope.row.statusText }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <span class="pagination-info">
              显示 {{ commentCurrentPageStart }} 到
              {{ commentCurrentPageEnd }} 条，共 {{ comments.length }} 条
            </span>
            <el-pagination
              layout="prev, pager, next"
              :total="comments.length"
              :page-size="commentPageSize"
              @current-change="handleCommentCurrentChange"
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
  getPostReportList,
  getCommentReportList,
} from '@/utils/api';
export default {
  name: 'AdminPostReviewPage',
  data() {
    return {
      isSidebarCollapsed: false,
      showChangePwd: false,
      adminName: '',
      activeTab: 'posts', // 默认显示帖子tab
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
      searchQuery: '',
      // 已移除状态和类型筛选相关变量
      pageSize: 10,
      currentPage: 1,
      posts: [],
      // 评论相关数据
      commentPageSize: 10,
      commentCurrentPage: 1,
      comments: [],
      async fetchPendingPosts() {
        try {
          const res = await getPostReportList({
            status: 0,
            page: this.currentPage,
            pageSize: this.pageSize,
          });
          if (res.data && res.data.success) {
            this.posts = (res.data.data || []).map((item) => {
              let parsedTitle = {};
              try {
                parsedTitle =
                  typeof item.postTitle === 'string'
                    ? JSON.parse(item.postTitle)
                    : item.postTitle || {};
              } catch (e) {
                parsedTitle = { title: item.postTitle || '无标题' };
              }
              return {
                id: item.reportId || item.ReportId || item.id,
                title: parsedTitle.title || '无标题',
                subtitle: parsedTitle.content || item.reportReason || '',
                author: parsedTitle.author || item.reporterName || '未知',
                time: item.createdAt || item.CreatedAt || '',
                type: '举报内容',
                status: this.mapStatus(item.status || item.Status),
                selected: false,
                raw: item,
              };
            });
          } else {
            this.$message.error(res.data.message || '获取待审核帖子失败');
          }
        } catch (err) {
          this.$message.error(err.message || '获取待审核帖子失败');
        }
      },

      async fetchPendingComments() {
        try {
          const res = await getCommentReportList({
            status: 0,
            page: this.commentCurrentPage,
            pageSize: this.commentPageSize,
          });
          if (res.data && res.data.success) {
            this.comments = res.data.data || [];
          } else {
            this.$message.error(res.data.message || '获取待审核评论失败');
          }
        } catch (err) {
          this.$message.error(err.message || '获取待审核评论失败');
        }
      },
      mapStatus(status) {
        switch (status) {
          case 0:
          case '0':
            return 'pending';
          case 1:
          case '1':
            return 'approved';
          case 2:
          case '2':
            return 'rejected';
          default:
            return 'pending';
        }
      },
    };
  },
  computed: {
    filteredPosts() {
      let filtered = this.posts;
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (post) =>
            post.title.toLowerCase().includes(query) ||
            post.subtitle.toLowerCase().includes(query)
        );
      }
      return filtered;
    },
    filteredComments() {
      let filtered = this.comments;
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (comment) =>
            comment.commentContent.toLowerCase().includes(query) ||
            comment.reportReason.toLowerCase().includes(query)
        );
      }
      return filtered;
    },
    currentPageStart() {
      return (this.currentPage - 1) * this.pageSize + 1;
    },
    currentPageEnd() {
      return Math.min(this.currentPage * this.pageSize, this.posts.length);
    },
    commentCurrentPageStart() {
      return (this.commentCurrentPage - 1) * this.commentPageSize + 1;
    },
    commentCurrentPageEnd() {
      return Math.min(
        this.commentCurrentPage * this.commentPageSize,
        this.comments.length
      );
    },
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
          return '';
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
          return '';
      }
    },
    selectAll() {
      const allSelected = this.filteredPosts.every((post) => post.selected);
      this.filteredPosts.forEach((post) => {
        post.selected = !allSelected;
      });
    },
    batchApprove() {
      const selectedPosts = this.posts.filter(
        (post) => post.selected && post.status === 'pending'
      );
      if (selectedPosts.length === 0) {
        this.$message.warning('请至少选择一条待审核的帖子');
        return;
      }

      this.$confirm(
        `确定要通过选中的 ${selectedPosts.length} 条帖子吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
        selectedPosts.forEach((post) => {
          post.status = 'approved';
          post.selected = false;
        });
        this.$message.success(`已通过 ${selectedPosts.length} 条帖子`);
      });
    },
    batchReject() {
      const selectedPosts = this.posts.filter(
        (post) => post.selected && post.status === 'pending'
      );
      if (selectedPosts.length === 0) {
        this.$message.warning('请至少选择一条待审核的帖子');
        return;
      }

      this.$confirm(
        `确定要拒绝选中的 ${selectedPosts.length} 条帖子吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
        selectedPosts.forEach((post) => {
          post.status = 'rejected';
          post.selected = false;
        });
        this.$message.success(`已拒绝 ${selectedPosts.length} 条帖子`);
      });
    },
    viewPost(post) {
      // 跳转到举报详情页
      this.$router.push({
        name: 'AdminPostReviewDetail',
        params: { id: post.id },
      });
    },
    viewComment(comment) {
      // 跳转到评论举报详情页
      this.$router.push({
        name: 'AdminCommentReviewDetail',
        params: { id: comment.reportId },
      });
    },
    handleTabClick() {
      // 切换标签时重置搜索
      this.searchQuery = '';

      // 根据当前标签加载相应数据
      if (this.activeTab === 'posts') {
        this.fetchPendingPosts();
      } else if (this.activeTab === 'comments') {
        this.fetchPendingComments();
      }
    },
    approvePost(post) {
      post.status = 'approved';
      this.$message.success('帖子已通过审核');
    },
    rejectPost(post) {
      post.status = 'rejected';
      this.$message.success('帖子已拒绝审核');
    },
    handleCurrentChange(page) {
      this.currentPage = page;
    },
    handleCommentCurrentChange(page) {
      this.commentCurrentPage = page;
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
    this.fetchPendingPosts();
    this.fetchPendingComments();
  },
};
</script>

<style lang="scss" scoped>
.admin-post-review {
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

        .post-title {
          font-weight: 500;
        }

        .post-subtitle {
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
</style>
