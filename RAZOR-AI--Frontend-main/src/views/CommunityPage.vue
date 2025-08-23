<template>
  <div class="community-container">
    <!-- 主内容区 -->
    <main class="main-content container">
      <div class="content-layout">
        <!-- 中间帖子列表 -->
        <section class="post-feed">
          <!-- 发布按钮 -->
          <div class="action-bar">
            <button
              class="primary-btn"
              @click="$router.push('/community/CreatePost')"
            >
              <i class="fa fa-plus-circle mr-2"></i>
              <span>发布帖子</span>
            </button>
          </div>

          <!-- 筛选区 -->
          <div class="filter-card top-filter">
            <div class="filter-header">
              <h2 class="feed-title">社区讨论</h2>
              <p class="feed-count">
                共 <span class="count-number">{{ totalCount }}</span> 个帖子
              </p>
            </div>

            <div class="filter-tabs">
              <button
                class="tab-item"
                :class="{ active: activeTab === 'latest' }"
                @click="switchTab('latest')"
              >
                最新
              </button>
              <button
                class="tab-item"
                :class="{ active: activeTab === 'hottest' }"
                @click="switchTab('hottest')"
              >
                最热
              </button>
            </div>
          </div>

          <!-- 帖子列表 -->
          <div class="post-list" id="postList">
            <article class="post-card" v-for="post in posts" :key="post.id">
              <div class="post-header">
                <div class="author-info">
                  <div class="author-name-wrap">
                    <p class="author-name">{{ post.authorName }}</p>
                  </div>
                  <p class="post-time">{{ post.createTime }}</p>
                </div>
              </div>

              <!-- 帖子标题 -->
              <router-link
                :to="`/community/post/${post.id}`"
                class="post-title-link"
              >
                <h2 class="post-title-title">{{ post.title }}</h2>
              </router-link>

              <p class="post-excerpt">{{ post.excerpt }}</p>

              <!-- 标签 -->
              <div class="post-tags">
                <span
                  class="tag-item"
                  v-for="(tag, i) in getPostTags(post.id)"
                  :key="i"
                >
                  {{ tag }}
                </span>
              </div>

              <!-- 点赞评论 -->
              <div class="post-actions">
                <div class="action-group">
                  <!-- 点赞仅展示 -->
                  <div class="action-display">
                    <span>{{ post.likeCount }} 个点赞</span>
                  </div>
                  <!-- 评论仅展示 -->
                  <div class="action-display">
                    <span>{{ post.commentCount }} 条评论</span>
                  </div>
                </div>
                <div class="stats-group">
                  <button class="share-btn" @click="sharePost(post.id)">
                    <i class="fa fa-share-alt mr-1.5"></i>
                    <span>分享</span>
                  </button>
                </div>
              </div>
            </article>

            <!-- 无数据提示 -->
            <div v-if="posts.length === 0 && !loading" class="no-posts">
              暂无帖子数据
            </div>
          </div>

          <!-- 加载中 -->
          <div v-if="loading" class="loading-state">
            <i class="fa fa-spinner fa-spin"></i> 加载中...
          </div>

          <!-- 加载更多 -->
          <div class="load-more">
            <button
              class="secondary-btn load-more-btn"
              @click="loadMorePosts"
              v-if="hasMore"
            >
              加载更多 <i class="fa fa-angle-down ml-2"></i>
            </button>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script>
import {
  getRecommendedPosts,
  getCommunityLikeCount,
  getCommunityCommentCount,
} from '@/utils/api';

export default {
  data() {
    return {
      posts: [],
      totalCount: 0,
      loading: false,
      hasMore: true,
      activeTab: 'latest',
      page: 1,
      pageSize: 10,
    };
  },
  created() {
    this.fetchPosts(true);
  },
  methods: {
    // 获取帖子列表
    async fetchPosts(reset = false) {
      if (reset) {
        this.page = 1;
        this.posts = [];
      }
      this.loading = true;
      try {
        const res = await getRecommendedPosts(this.pageSize * this.page);
        const data = res.data;

        const records = data.posts || data || [];
        const total = data.total || records.length;

        this.totalCount = total;
        if (records && records.length) {
          this.posts = records.map((p) => {
            let contentObj = {};
            try {
              contentObj = p.postContent ? JSON.parse(p.postContent) : {};
            } catch (e) {
              console.error('解析 postContent 失败:', e, p.postContent);
            }

            return {
              id: p.postId || p.id,
              authorName:
                contentObj.author ||
                p.author?.name ||
                p.authorName ||
                '匿名用户',
              createTime: p.createdAt || p.createTime || '',
              title: contentObj.title || p.title || '未命名帖子',
              excerpt: contentObj.content?.slice(0, 50) || p.excerpt || '',
              likeCount: 0, // 默认值
              commentCount: 0, // 默认值
              views: p.views || 0,
              tags: contentObj.tags || p.tags || [],
            };
          });

          // 🔥 并行获取点赞数和评论数
          await Promise.all(
            this.posts.map(async (post) => {
              try {
                const [likeRes, commentRes] = await Promise.all([
                  getCommunityLikeCount(post.id),
                  getCommunityCommentCount(post.id),
                ]);
                post.likeCount = likeRes.data?.likeCount ?? 0;
                post.commentCount = commentRes.data?.commentCount ?? 0;
              } catch (e) {
                console.error(`获取帖子 ${post.id} 的点赞/评论数失败:`, e);
              }
            })
          );

          this.hasMore = this.posts.length < this.totalCount;
        } else {
          this.hasMore = false;
        }
      } catch (error) {
        console.error('获取帖子失败:', error);
      } finally {
        this.loading = false;
      }
    },

    // 加载更多
    loadMorePosts() {
      this.page++;
      this.fetchPosts();
    },
    // 切换tab
    switchTab(tab) {
      if (this.activeTab === tab) return;
      this.activeTab = tab;
      this.fetchPosts(true);
    },
    // 获取帖子标签
    getPostTags(postId) {
      const post = this.posts.find((p) => p.id === postId);
      return post && post.tags ? post.tags : [];
    },
  },
};
</script>

<style scoped>
/* 基础样式 */
.community-container {
  background-color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #333;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  max-width: 100%;
}

.container {
  position: relative;
  left: 3.5vw;
  width: 70vw;
  margin: 0;
  padding: 0 200px; /* 两边保留点空隙 */
}

.text-primary {
  color: #0f88eb;
}

/* 主内容区 */
.main-content {
  padding: 25px 0;
  flex: 1;
}

.content-layout {
  display: block; /* 不需要多列 */
  width: 100%;
}

.post-feed {
  flex: 1;
}

.post-title-link {
  text-decoration: none;
}

/* 筛选卡片 */
.filter-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 24px;
}

.filter-header {
  margin-bottom: 16px;
}

.feed-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.feed-count {
  color: #666;
  font-size: 14px;
}

.filter-tabs {
  display: flex;
  gap: 4px;
}

.tab-item {
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-item:hover {
  background-color: #f1f5f9;
  color: #333;
}

.tab-item.active {
  background-color: rgba(15, 136, 235, 0.1);
  color: #0f88eb;
}

/* 帖子列表 */
.post-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 24px;
  transition: all 0.3s ease;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  box-sizing: border-box;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.post-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.post-author {
  display: flex;
  align-items: center;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.author-info {
  margin-left: 12px;
}

.author-name-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-name {
  font-weight: 600;
  color: #1a1a1a;
}

.author-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  background-color: rgba(15, 136, 235, 0.1);
  color: #0f88eb;
}

.post-time {
  color: #666;
  margin-top: 4px;
}

.more-btn {
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  transition: color 0.2s ease;
}

.more-btn:hover {
  color: #333;
}

.post-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
  transition: color 0.2s ease;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
}

.post-title:hover {
  color: #0f88eb;
}

.title-link {
  color: #1a1a1a;
  text-decoration: none;
  transition: color 0.2s ease;
}

.title-link:hover {
  color: #0f88eb;
}

.post-title-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
  transition: color 0.2s ease;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
}

.post-title-link:hover .post-title-title {
  color: #0f88eb;
  transition: color 0.2s ease; /* 平滑过渡效果 */
}

.tab-item:active,
.action-btn:active,
.share-btn:active,

/* 链接点击状态 */
.post-title-link:active .post-title-title {
  color: #0f88eb !important;
}

.post-excerpt {
  color: #666;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.tag-item {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 13px;
  background-color: rgba(15, 136, 235, 0.1);
  color: #0f88eb;
}

.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f1f3f5;
  color: #666;
}

.action-group {
  display: flex;
  gap: 24px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  transition: color 0.2s ease;
  font-size: 14px;
}

.action-btn:hover {
  color: #0f88eb;
}

.stats-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.post-views {
  font-size: 14px;
}

.share-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  transition: color 0.2s ease;
  font-size: 14px;
}

.share-btn:hover {
  color: #0f88eb;
}

/* 加载更多 */
.load-more {
  margin-top: 30px;
  text-align: center;
}

.secondary-btn {
  background-color: #f8f9fa;
  color: #495057;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.secondary-btn:hover {
  background-color: #e9ecef;
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

.action-bar {
  margin-bottom: 24px;
  text-align: right;
}

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

/* 响应式调整 */
@media (max-width: 1024px) {
  .sidebar-right {
    display: none;
  }
}

@media (max-width: 768px) {
  .sidebar-left {
    display: none;
  }

  .main-nav {
    display: none;
  }

  .search-box {
    display: none;
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
