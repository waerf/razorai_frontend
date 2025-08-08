<template>
  <div class="admin-post-review">
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
        <div class="nav-item" @click="$router.push('/admin')">
          <i class="el-icon-menu"></i>
          <span>控制台概览</span>
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
        <el-button type="primary" @click="logout">退出登录</el-button>
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
            <div class="filter-container">
              <el-select v-model="statusFilter" placeholder="全部状态">
                <el-option label="全部状态" value="all"></el-option>
                <el-option label="待审核" value="pending"></el-option>
                <el-option label="已通过" value="approved"></el-option>
                <el-option label="已拒绝" value="rejected"></el-option>
              </el-select>
              <el-select v-model="typeFilter" placeholder="全部类型">
                <el-option label="全部类型" value="all"></el-option>
                <el-option label="普通帖子" value="normal"></el-option>
                <el-option label="举报内容" value="report"></el-option>
                <el-option label="敏感词检测" value="sensitive"></el-option>
              </el-select>
            </div>
          </div>
        </el-card>

        <!-- 帖子列表 -->
        <el-card class="post-list-card" shadow="hover">
          <div class="card-header">
            <h2 class="card-title">待审核帖子列表</h2>
            <div class="action-buttons">
              <el-button type="text" @click="selectAll">全选</el-button>
              <el-button type="text" @click="batchApprove">批量通过</el-button>
              <el-button type="text" @click="batchReject">批量拒绝</el-button>
              <span class="record-count">共 {{ posts.length }} 条记录</span>
              <el-select v-model="pageSize" class="page-size-select">
                <el-option label="10 条/页" value="10"></el-option>
                <el-option label="20 条/页" value="20"></el-option>
                <el-option label="50 条/页" value="50"></el-option>
              </el-select>
            </div>
          </div>

          <el-table :data="filteredPosts" style="width: 100%">
            <el-table-column width="50">
              <template #default="scope">
                <el-checkbox v-model="scope.row.selected"></el-checkbox>
              </template>
            </el-table-column>
            <el-table-column label="帖子标题" width="300">
              <template #default="scope">
                <p class="post-title">{{ scope.row.title }}</p>
                <p class="post-subtitle">{{ scope.row.subtitle }}</p>
              </template>
            </el-table-column>
            <el-table-column
              prop="author"
              label="作者"
              width="120"
            ></el-table-column>
            <el-table-column
              prop="time"
              label="提交时间"
              width="180"
            ></el-table-column>
            <el-table-column
              prop="type"
              label="类型"
              width="120"
            ></el-table-column>
            <el-table-column label="状态" width="120">
              <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.status)" size="small">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" align="right">
              <template #default="scope">
                <el-button type="text" @click="viewPost(scope.row)"
                  >查看</el-button
                >
                <el-button
                  type="text"
                  @click="approvePost(scope.row)"
                  :disabled="scope.row.status !== 'pending'"
                >
                  通过
                </el-button>
                <el-button
                  type="text"
                  @click="rejectPost(scope.row)"
                  :disabled="scope.row.status !== 'pending'"
                >
                  拒绝
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
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
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'AdminPostReviewPage',
  data() {
    return {
      searchQuery: '',
      statusFilter: 'all',
      typeFilter: 'all',
      pageSize: 10,
      currentPage: 1,
      posts: [
        {
          id: 1,
          title: '违规内容举报',
          subtitle: '举报用户ID:123456发布不当内容',
          author: '李四',
          time: '2025-07-15 14:30',
          type: '举报内容',
          status: 'pending',
          selected: false,
        },
        {
          id: 2,
          title: '敏感词检测',
          subtitle: '检测到敏感词"政治"',
          author: '王五',
          time: '2025-07-15 10:45',
          type: '敏感词检测',
          status: 'pending',
          selected: false,
        },
        {
          id: 3,
          title: '关于机器人API的使用问题',
          subtitle: '如何调用情感分析API?',
          author: '赵六',
          time: '2025-07-14 18:20',
          type: '普通帖子',
          status: 'approved',
          selected: false,
        },
      ],
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

      if (this.statusFilter !== 'all') {
        filtered = filtered.filter((post) => post.status === this.statusFilter);
      }

      if (this.typeFilter !== 'all') {
        filtered = filtered.filter((post) =>
          post.type.includes(this.typeFilter)
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
      // 查看帖子详情逻辑
      console.log('查看帖子:', post);
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
    logout() {
      this.$router.push('/');
    },
  },
};
</script>

<style lang="scss" scoped>
.admin-post-review {
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
            gap: 12px;

            .record-count {
              font-size: 14px;
              color: #666;
              margin: 0 8px;
            }

            .page-size-select {
              width: 120px;
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
