<template>
  <div class="my-posts-container">
    <!-- 主内容区 -->
    <main class="main-content container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">我的帖子</h1>
        <p class="page-description">
          管理和编辑你的所有帖子，查看它们的发布情况和统计数据
        </p>
      </div>

      <!-- 页面右上角按钮 -->
      <div class="action-bar">
        <button
          class="primary-btn"
          @click="$router.push('/community/CreatePost')"
        >
          <i class="fa fa-plus mr-2"></i>
          <span>发布帖子</span>
        </button>
      </div>

      <!-- 帖子列表区域 -->
      <div class="form-card">
        <div class="filter-header">
          <h2 class="feed-title">帖子列表</h2>
        </div>

        <!-- 帖子列表 - 改为网格布局，每行两个 -->
        <div class="post-grid">
          <!-- 帖子卡片 -->
          <div v-for="post in posts" :key="post.id" class="post-card">
            <div class="post-content">
              <div class="post-header">
                <div>
                  <h2 class="post-title">{{ post.title }}</h2>
                  <p class="post-meta">
                    {{ post.category }} · {{ post.createTime }}
                  </p>
                </div>
                <span
                  :class="
                    post.status === 'published'
                      ? 'status-published'
                      : 'status-draft'
                  "
                >
                  {{ post.status === 'published' ? '已发布' : '草稿' }}
                </span>
              </div>

              <!-- 帖子统计 - 新增点赞统计 -->
              <div class="post-stats">
                <div class="stat-item">
                  <i class="fa fa-eye mr-1.5"></i>
                  <span>{{ post.views }} 次浏览</span>
                </div>
                <div class="stat-item">
                  <i class="fa fa-comment-o mr-1.5"></i>
                  <span>{{ post.comments }} 条评论</span>
                </div>
                <div class="stat-item">
                  <i class="fa fa-thumbs-o-up mr-1.5"></i>
                  <span>{{ post.likes }} 个点赞</span>
                </div>
              </div>

              <!-- 帖子操作 - 新增帖子详情按钮 -->
              <div class="post-actions">
                <a
                  class="action-link detail-link"
                  @click.prevent="$router.push(`/community/post`)"
                >
                  <i class="fa fa-eye mr-1.5"></i>
                  帖子详情
                </a>
                <a
                  class="action-link edit-link"
                  @click.prevent="$router.push(`/edit-post/${post.id}`)"
                >
                  <i class="fa fa-pencil mr-1.5"></i>
                  编辑帖子
                </a>
                <a
                  class="action-link delete-link"
                  @click.prevent="handleDelete(post.id)"
                >
                  <i class="fa fa-trash mr-1.5"></i>
                  删除帖子
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态处理 -->
        <div v-if="posts.length === 0" class="empty-state">
          <i class="fa fa-file-text-o empty-icon"></i>
          <p class="empty-text">暂无帖子，快去发布你的第一篇帖子吧！</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'MyPostsPage',
  data() {
    return {
      // 帖子数据 - 新增点赞字段
      posts: [
        {
          id: 1,
          title: '如何高效学习Vue框架',
          category: '技术分享',
          status: 'published',
          createTime: '2023-10-15',
          views: 1258,
          comments: 42,
          likes: 89, // 点赞数
        },
        {
          id: 2,
          title: '前端性能优化实践指南',
          category: '性能优化',
          status: 'published',
          createTime: '2023-10-10',
          views: 986,
          comments: 28,
          likes: 65, // 点赞数
        },
        {
          id: 3,
          title: 'JavaScript设计模式总结',
          category: '技术分享',
          status: 'draft',
          createTime: '2023-10-05',
          views: 0,
          comments: 0,
          likes: 0, // 点赞数
        },
        {
          id: 4,
          title: 'CSS Grid布局完全指南',
          category: '前端布局',
          status: 'published',
          createTime: '2023-09-28',
          views: 1563,
          comments: 57,
          likes: 124, // 点赞数
        },
        {
          id: 5,
          title: 'React Hooks 最佳实践',
          category: '技术分享',
          status: 'published',
          createTime: '2023-09-20',
          views: 876,
          comments: 32,
          likes: 78, // 点赞数
        },
      ],
    };
  },
  methods: {
    handleDelete(postId) {
      if (confirm('确定要删除这篇帖子吗？')) {
        this.posts = this.posts.filter((post) => post.id !== postId);
      }
    },
  },
};
</script>

<style scoped>
/* 基础样式 */
.my-posts-container {
  background-color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #333;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
  width: 100%;
}

/* 主内容区 */
.main-content {
  padding: 30px 0;
  flex: 1;
}

/* 页面标题 */
.page-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f3f5;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.page-description {
  color: #666;
  font-size: 14px;
}

/* 操作栏 */
.action-bar {
  margin-bottom: 24px;
  text-align: right;
}

/* 按钮样式 */
.primary-btn {
  background-color: #0f88eb;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: inline-flex;
  align-items: center;
}

.primary-btn:hover {
  background-color: #0a6fcc;
  box-shadow: 0 4px 8px rgba(15, 136, 235, 0.2);
}

/* 表单卡片 */
.form-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 30px;
  width: 100%;
}

.filter-header {
  margin-bottom: 24px;
}

.feed-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

/* 帖子网格 - 关键修改：设置为网格布局，每行两个 */
.post-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 每行两列 */
  gap: 24px; /* 卡片之间的间距 */
}

/* 帖子卡片 */
.post-card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #f1f3f5;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  border-color: #e2e8f0;
}

.post-content {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.post-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  align-items: flex-start;
}

.post-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
  transition: color 0.2s ease;
  word-wrap: break-word;
}

.post-title:hover {
  color: #0f88eb;
}

.post-meta {
  color: #666;
  font-size: 14px;
}

/* 状态标签 */
.status-published {
  padding: 4px 10px;
  background-color: rgba(34, 197, 94, 0.1);
  color: #166534;
  font-size: 12px;
  border-radius: 16px;
  font-weight: 500;
}

.status-draft {
  padding: 4px 10px;
  background-color: rgba(15, 136, 235, 0.1);
  color: #0f88eb;
  font-size: 12px;
  border-radius: 16px;
  font-weight: 500;
}

/* 帖子统计 - 包含点赞统计 */
.post-stats {
  display: flex;
  gap: 16px;
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
}

/* 帖子操作 - 包含详情按钮 */
.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f1f3f5;
  margin-top: auto; /* 推到卡片底部 */
}

.action-link {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;
  text-decoration: none;
  padding: 4px 8px;
  border-radius: 4px;
}

.detail-link {
  color: #64748b;
}

.detail-link:hover {
  color: #334155;
  background-color: #f1f5f9;
}

.edit-link {
  color: #0f88eb;
}

.edit-link:hover {
  color: #0a6fcc;
  background-color: rgba(15, 136, 235, 0.1);
}

.delete-link {
  color: #e53e3e;
}

.delete-link:hover {
  color: #c53030;
  background-color: rgba(229, 62, 62, 0.1);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  grid-column: span 2; /* 空状态占满两列 */
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #cbd5e1;
}

.empty-text {
  font-size: 16px;
}

/* 页脚 */
.main-footer {
  background-color: #fff;
  border-top: 1px solid #e2e8f0;
  padding: 20px 0;
  margin-top: auto;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copyright {
  color: #666;
  font-size: 14px;
}

.footer-links {
  display: flex;
  gap: 24px;
}

.footer-link {
  color: #666;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #0f88eb;
}

/* 响应式调整 - 在小屏幕上改为每行一个 */
@media (max-width: 992px) {
  .post-grid {
    grid-template-columns: 1fr; /* 小屏幕每行一个 */
  }

  .empty-state {
    grid-column: span 1; /* 空状态占满一列 */
  }
}

@media (max-width: 768px) {
  .container {
    max-width: 100%;
    padding: 0 15px;
  }

  .form-card {
    padding: 16px;
  }

  .post-header {
    flex-direction: column;
    gap: 8px;
  }

  .post-actions {
    flex-wrap: wrap;
    gap: 8px;
  }

  .action-link {
    flex: 1;
    justify-content: center;
    margin-bottom: 4px;
  }

  .footer-content {
    flex-direction: column;
    gap: 16px;
  }

  .copyright {
    text-align: center;
  }

  .footer-links {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
