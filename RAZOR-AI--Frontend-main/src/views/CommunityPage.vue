<template>
  <div class="community-container">
    <!-- 主内容区 -->
    <main class="main-content container">
      <div class="content-layout">
        <!-- 中间帖子列表 -->
        <section class="post-feed">
          <!-- 发布按钮区域 -->
          <div class="action-bar">
            <button
              class="primary-btn"
              @click="$router.push('/community/CreatePost')"
            >
              <i class="fa fa-plus-circle mr-2"></i>
              <span>发布帖子</span>
            </button>
          </div>

          <!-- 排序筛选 -->
          <div class="filter-card">
            <div class="filter-header">
              <h2 class="feed-title">社区讨论</h2>
              <p class="feed-count">
                共 <span class="count-number">328</span> 个帖子
              </p>
            </div>

            <div class="filter-tabs">
              <button class="tab-item active">推荐</button>
              <button class="tab-item">最新</button>
              <button class="tab-item">最热</button>
              <button class="tab-item">关注</button>
            </div>
          </div>

          <!-- 帖子列表 -->
          <div class="post-list" id="postList">
            <!-- 帖子卡片 -->
            <article
              class="post-card"
              v-for="(post, index) in posts"
              :key="index"
            >
              <div class="post-header">
                <div class="post-author">
                  <img
                    :src="post.authorAvatar"
                    alt="用户头像"
                    class="author-avatar"
                  />
                  <div class="author-info">
                    <div class="author-name-wrap">
                      <p class="author-name">{{ post.authorName }}</p>
                      <span v-if="post.isAuthor" class="author-badge"
                        >专栏作者</span
                      >
                    </div>
                    <p class="post-time">
                      {{ post.postTime }} · 发布于 {{ post.category }}
                    </p>
                  </div>
                </div>
                <button class="more-btn" aria-label="更多操作">
                  <i class="fa fa-ellipsis-h"></i>
                </button>
              </div>

              <!-- 帖子标题添加路由链接 -->
              <router-link
                :to="`/community/post/${post.id}`"
                class="post-title-link"
              >
                <h2 class="post-title-title">{{ post.title }}</h2>
              </router-link>

              <p class="post-excerpt">{{ post.excerpt }}</p>

              <div class="post-tags">
                <span class="tag-item" v-for="(tag, i) in post.tags" :key="i">{{
                  tag
                }}</span>
              </div>

              <div class="post-actions">
                <div class="action-group">
                  <button class="action-btn" @click="likePost(index)">
                    <i class="fa fa-thumbs-o-up mr-1.5"></i>
                    <span>{{ post.likes }}</span>
                  </button>
                  <button class="action-btn">
                    <i class="fa fa-comment-o mr-1.5"></i>
                    <span>{{ post.comments }}</span>
                  </button>
                  <button class="action-btn" @click="bookmarkPost(index)">
                    <i class="fa fa-bookmark-o mr-1.5"></i>
                    <span>{{ post.bookmarks }}</span>
                  </button>
                </div>
                <div class="stats-group">
                  <span class="post-views">阅读 {{ post.views }}</span>
                  <button class="share-btn" @click="sharePost(index)">
                    <i class="fa fa-share-alt mr-1.5"></i>
                    <span>分享</span>
                  </button>
                </div>
              </div>
            </article>
          </div>

          <!-- 加载更多 -->
          <div class="load-more">
            <button class="secondary-btn load-more-btn" @click="loadMorePosts">
              加载更多 <i class="fa fa-angle-down ml-2"></i>
            </button>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 帖子数据
      posts: [
        {
          id: 1,
          authorAvatar: 'https://picsum.photos/id/1005/48/48',
          authorName: '张小明',
          isAuthor: true,
          postTime: '2小时前',
          category: '订阅专栏',
          title: '如何高效管理订阅内容？分享几个实用技巧',
          excerpt:
            '随着订阅的内容越来越多，如何高效筛选和管理成为了难题。本文分享几个我使用了3年的方法，帮助你从信息海洋中快速找到有价值的内容。这些方法不仅提高了我的阅读效率，还让我能够更好地消化和吸收知识。',
          tags: ['订阅管理', '效率工具', '信息整理'],
          likes: 128,
          comments: 32,
          bookmarks: 45,
          views: '5.2k',
        },
        {
          id: 2,
          authorAvatar: 'https://picsum.photos/id/1012/48/48',
          authorName: '李华',
          isAuthor: true,
          postTime: '昨天',
          category: '专栏推荐',
          title: '2025年值得订阅的10个优质专栏推荐',
          excerpt:
            '经过半年的体验和筛选，整理出这份2025年最值得订阅的专栏清单，涵盖科技、职场、生活等多个领域，每个都经过实际验证。无论你是想提升专业技能，还是寻找灵感创意，这份清单都能满足你的需求。',
          tags: ['专栏推荐', '2025精选', '内容推荐'],
          likes: 356,
          comments: 89,
          bookmarks: 210,
          views: '12.8k',
        },
        {
          id: 3,
          authorAvatar: 'https://picsum.photos/id/1025/48/48',
          authorName: '科技前沿',
          isAuthor: false,
          postTime: '3天前',
          category: '技术讨论',
          title: 'AI辅助编程工具对比：GitHub Copilot vs. RAZOR-AI',
          excerpt:
            '随着AI技术的发展，编程辅助工具越来越受到开发者的欢迎。本文详细对比了当前市场上两款主流的AI辅助编程工具：GitHub Copilot和RAZOR-AI。通过实际代码示例，分析它们的优缺点和适用场景，帮助开发者选择最适合自己的工具。',
          tags: ['AI编程', '工具对比', '编程技巧'],
          likes: 247,
          comments: 63,
          bookmarks: 178,
          views: '8.5k',
        },
      ],
    };
  },
  computed: {
    filteredPosts() {
      return this.posts;
    },
  },
  methods: {
    // 点赞功能
    likePost(index) {
      this.posts[index].likes++;
    },

    // 收藏功能
    bookmarkPost(index) {
      this.posts[index].bookmarks++;
    },

    // 分享功能
    sharePost(index) {
      console.log(`分享帖子: ${this.posts[index].title}`);
    },

    // 加载更多帖子
    loadMorePosts() {
      console.log('加载更多帖子');
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
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
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
  display: flex;
  gap: 24px;
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

.post-title-link:hover .post-title-title {
  color: #0f88eb; /* 浅紫色文字 */
  transition: color 0.2s ease; /* 平滑过渡效果 */
}

.tab-item:active,
.action-btn:active,
.share-btn:active,
.secondary-btn:active {
  color: #0f88eb !important;
  background-color: rgba(90, 24, 154, 0.1) !important;
}

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
