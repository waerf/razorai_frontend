<template>
  <div class="community-container">
    <!-- 主内容区 -->
    <main class="main-content container">
      <div class="content-layout">
        <!-- 帖子详情 -->
        <section class="post-detail">
          <!-- 帖子头部信息 -->
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

          <!-- 帖子标题 -->
          <h1 class="post-title">{{ post.title }}</h1>

          <!-- 帖子标签 -->
          <div class="post-tags">
            <span class="tag-item" v-for="(tag, i) in post.tags" :key="i">{{
              tag
            }}</span>
          </div>

          <!-- 帖子内容 -->
          <div class="post-content">
            <div class="content-section">
              <p>
                随着订阅经济的兴起，我们每天都会面对大量的订阅内容 -
                从技术博客到行业资讯，从专栏文章到视频课程。根据我的观察，一个活跃的学习者平均会订阅5-10个不同类型的内容源，但大多数人都面临着"订阅了却没时间看"的困境。
              </p>
              <p>
                本文将分享我经过3年实践总结的订阅内容管理方法，帮助你解决以下问题：
              </p>
              <ul>
                <li>如何筛选真正有价值的订阅源</li>
                <li>建立高效的内容消费节奏</li>
                <li>利用工具提高信息处理效率</li>
                <li>将碎片化信息转化为系统化知识</li>
              </ul>
            </div>

            <div class="content-section">
              <h3>一、订阅源的精简与分类</h3>
              <p>
                我的经验是，优质的信息源不在于多而在于精。我会每季度对订阅源进行一次全面梳理，遵循"80/20原则"
                - 80%的价值来自20%的订阅源。
              </p>
              <p>具体做法是建立三级分类体系：</p>
              <ol>
                <li>核心订阅（每日必看）：不超过5个</li>
                <li>重要订阅（每周浏览）：10-15个</li>
                <li>兴趣订阅（月度回顾）：不限数量，但需要定期清理</li>
              </ol>
            </div>

            <div class="content-section">
              <h3>二、高效阅读工具推荐</h3>
              <p>经过多年试用，我筛选出几款提高阅读效率的工具：</p>
              <ul>
                <li><strong>Feedly</strong>：聚合各类订阅源，支持标签和过滤</li>
                <li><strong> Pocket</strong>：稍后阅读，支持跨设备同步</li>
                <li>
                  <strong>Notion</strong>：建立个人知识库，整理有价值的内容
                </li>
              </ul>
              <p>
                这些工具的组合使用可以形成"收集-筛选-消化-归档"的完整流程，大幅提高信息处理效率。
              </p>
            </div>

            <div class="content-section">
              <h3>三、建立个人知识管理系统</h3>
              <p>订阅内容的最终目的是转化为自己的知识，我的方法是：</p>
              <p>
                1. 阅读时使用高亮和批注工具记录即时想法<br />
                2. 每周日花1小时整理本周有价值的内容<br />
                3. 每月进行一次知识关联，建立内容之间的联系<br />
                4. 每季度写一篇学习总结，检验知识吸收情况
              </p>
              <p>
                这个过程虽然需要投入时间，但能让订阅的内容真正发挥价值，而不是成为数字垃圾。
              </p>
            </div>
          </div>

          <!-- 帖子底部操作 -->
          <div class="post-actions">
            <div class="action-group">
              <button class="action-btn" @click="likePost">
                <i class="fa fa-thumbs-o-up mr-1.5"></i>
                <span>{{ post.likes }}</span>
              </button>
              <button class="action-btn">
                <i class="fa fa-comment-o mr-1.5"></i>
                <span>{{ post.comments }}</span>
              </button>
              <button class="action-btn" @click="bookmarkPost">
                <i class="fa fa-bookmark-o mr-1.5"></i>
                <span>{{ post.bookmarks }}</span>
              </button>
            </div>
            <div class="stats-group">
              <span class="post-views">阅读 {{ post.views }}</span>
              <button class="share-btn" @click="sharePost">
                <i class="fa fa-share-alt mr-1.5"></i>
                <span>分享</span>
              </button>
            </div>
          </div>

          <!-- 作者信息卡片 -->
          <div class="author-card">
            <img
              :src="post.authorAvatar"
              alt="作者头像"
              class="author-card-avatar"
            />
            <div class="author-card-info">
              <div class="author-card-name">{{ post.authorName }}</div>
              <div class="author-card-bio">
                内容策略师，专注于信息管理与知识体系构建，曾任职于多家知名科技公司
              </div>
              <button class="follow-btn" @click="followAuthor">
                <i class="fa fa-plus mr-1"></i> 关注作者
              </button>
            </div>
          </div>

          <!-- 评论区 -->
          <div class="comments-section">
            <h3 class="comments-title">评论 ({{ post.comments }})</h3>

            <!-- 评论输入框 -->
            <div class="comment-input">
              <textarea
                placeholder="分享你的想法..."
                class="comment-textarea"
                v-model="newComment"
              ></textarea>
              <button class="publish-comment" @click="publishComment">
                发布评论
              </button>
            </div>

            <!-- 评论列表 -->
            <div class="comments-list">
              <div
                class="comment-item"
                v-for="(comment, index) in comments"
                :key="index"
              >
                <img
                  :src="comment.avatar"
                  alt="评论者头像"
                  class="comment-avatar"
                />
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-author">{{ comment.author }}</span>
                    <span class="comment-time">{{ comment.time }}</span>
                  </div>
                  <div class="comment-text">{{ comment.content }}</div>
                  <div class="comment-actions">
                    <button class="comment-action-btn">
                      <i class="fa fa-thumbs-o-up mr-1"></i> {{ comment.likes }}
                    </button>
                    <button class="comment-action-btn">回复</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 加载更多评论 -->
            <div class="load-more-comments">
              <button class="secondary-btn" @click="loadMoreComments">
                查看更多评论
              </button>
            </div>
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
      post: {
        authorAvatar: 'https://picsum.photos/id/1005/48/48',
        authorName: '张小明',
        isAuthor: true,
        postTime: '2小时前',
        category: '订阅专栏',
        title: '如何高效管理订阅内容？分享几个实用技巧',
        tags: ['订阅管理', '效率工具', '信息整理'],
        likes: 128,
        comments: 32,
        bookmarks: 45,
        views: '5.2k',
      },

      // 评论数据
      comments: [
        {
          avatar: 'https://picsum.photos/id/1012/40/40',
          author: '李华',
          time: '1小时前',
          content:
            '非常实用的方法！我一直在为订阅太多内容而烦恼，下周就试试你的三级分类法。',
          likes: 15,
        },
        {
          avatar: 'https://picsum.photos/id/1025/40/40',
          author: '科技前沿',
          time: '1.5小时前',
          content:
            '请问你是如何处理不同平台的订阅内容同步问题的？比如有些专栏只在特定平台发布。',
          likes: 8,
        },
        {
          avatar: 'https://picsum.photos/id/1027/40/40',
          author: '知识管理爱好者',
          time: '2小时前',
          content:
            'Notion确实是个好工具，但对于新手来说可能有点复杂。有没有更简单的替代方案推荐？',
          likes: 5,
        },
      ],

      // 新评论
      newComment: '',
    };
  },
  methods: {
    // 点赞功能
    likePost() {
      this.post.likes++;
    },

    // 收藏功能
    bookmarkPost() {
      this.post.bookmarks++;
    },

    // 分享功能
    sharePost() {
      console.log(`分享帖子: ${this.post.title}`);
      alert('分享功能已触发');
    },

    // 关注作者
    followAuthor() {
      console.log(`关注作者: ${this.post.authorName}`);
      alert(`已关注 ${this.post.authorName}`);
    },

    // 发布评论
    publishComment() {
      if (!this.newComment.trim()) return;

      this.comments.unshift({
        avatar: 'https://picsum.photos/id/1000/40/40', // 当前用户头像
        author: '我',
        time: '刚刚',
        content: this.newComment,
        likes: 0,
      });

      this.post.comments++;
      this.newComment = '';
    },

    // 加载更多评论
    loadMoreComments() {
      console.log('加载更多评论');
      // 模拟加载更多评论
      this.comments.push(
        {
          avatar: 'https://picsum.photos/id/1074/40/40',
          author: '效率控',
          time: '昨天',
          content:
            '每月总结的方法很棒，我之前试过但没坚持下来，看来需要找个 accountability partner 一起坚持。',
          likes: 3,
        },
        {
          avatar: 'https://picsum.photos/id/1066/40/40',
          author: '信息过载患者',
          time: '昨天',
          content:
            '感谢分享！我已经把Feedly和Pocket都下载好了，准备开始整理我的订阅列表。',
          likes: 2,
        }
      );
    },
  },
};
</script>

<style scoped>
/* 基础样式继承自社区页面 */
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

.post-detail {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 30px;
}

/* 帖子头部 */
.post-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  align-items: center;
}

.post-author {
  display: flex;
  align-items: center;
}

.author-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
}

.author-info {
  margin-left: 16px;
}

.author-name-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-name {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 16px;
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
  font-size: 14px;
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

/* 帖子标题 */
.post-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
  line-height: 1.4;
}

/* 帖子标签 */
.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f3f5;
}

.tag-item {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 13px;
  background-color: rgba(15, 136, 235, 0.1);
  color: #0f88eb;
}

/* 帖子内容 */
.post-content {
  margin-bottom: 32px;
  line-height: 1.8;
  color: #333;
}

.content-section {
  margin-bottom: 28px;
}

.post-content h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 20px 0 12px;
  color: #1a1a1a;
}

.post-content p {
  margin-bottom: 16px;
}

.post-content ul,
.post-content ol {
  margin: 0 0 16px 24px;
  padding: 0;
}

.post-content ul {
  list-style-type: disc;
}

.post-content ol {
  list-style-type: decimal;
}

.post-content li {
  margin-bottom: 8px;
}

.post-content strong {
  font-weight: 600;
}

/* 帖子操作区 */
.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-top: 1px solid #f1f3f5;
  border-bottom: 1px solid #f1f3f5;
  margin-bottom: 32px;
  color: #666;
}

.action-group {
  display: flex;
  gap: 30px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  transition: color 0.2s ease;
  font-size: 15px;
  padding: 6px 0;
}

.action-btn:hover {
  color: #0f88eb;
}

.stats-group {
  display: flex;
  align-items: center;
  gap: 20px;
}

.post-views {
  font-size: 14px;
}

.share-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  transition: color 0.2s ease;
  font-size: 15px;
  padding: 6px 0;
}

.share-btn:hover {
  color: #0f88eb;
}

/* 作者信息卡片 */
.author-card {
  display: flex;
  align-items: center;
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 32px;
}

.author-card-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
}

.author-card-info {
  margin-left: 16px;
  flex: 1;
}

.author-card-name {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
}

.author-card-bio {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.follow-btn {
  background-color: #0f88eb;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.follow-btn:hover {
  background-color: #0a6fca;
}

/* 评论区 */
.comments-section {
  margin-top: 40px;
}

.comments-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #1a1a1a;
}

.comment-input {
  margin-bottom: 30px;
}

.comment-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.comment-textarea:focus {
  outline: none;
  border-color: #0f88eb;
}

.publish-comment {
  background-color: #0f88eb;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-top: 12px;
}

.publish-comment:hover {
  background-color: #0a6fca;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 30px;
}

.comment-item {
  display: flex;
  gap: 12px;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.comment-author {
  font-weight: 500;
  font-size: 14px;
}

.comment-time {
  color: #999;
  font-size: 12px;
}

.comment-text {
  color: #333;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 8px;
}

.comment-actions {
  display: flex;
  gap: 16px;
}

.comment-action-btn {
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  transition: color 0.2s ease;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.comment-action-btn:hover {
  color: #0f88eb;
}

.load-more-comments {
  text-align: center;
  margin-top: 16px;
}

.secondary-btn {
  background-color: #f8f9fa;
  color: #495057;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.secondary-btn:hover {
  background-color: #e9ecef;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .post-detail {
    padding: 20px 16px;
  }

  .post-title {
    font-size: 20px;
  }

  .action-group {
    gap: 20px;
  }

  .action-btn,
  .share-btn {
    font-size: 14px;
  }
}
</style>
