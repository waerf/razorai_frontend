<template>
  <div class="community-container">
    <!-- 调试信息 -->
    <div style="padding: 20px; background: #f0f0f0; margin: 10px">
      <h3>调试信息:</h3>
      <p>路由参数ID: {{ $route.params.id }}</p>
      <p>Props ID: {{ id }}</p>
      <p>帖子标题: {{ post.title || '未加载' }}</p>
      <p>组件状态: {{ post.title ? '已加载' : '未加载' }}</p>
    </div>

    <!-- 加载状态 -->
    <div
      v-if="!post.title"
      style="padding: 20px; text-align: center; color: #666"
    >
      正在加载帖子详情... (ID: {{ $route.params.id || id || '未知' }})
    </div>

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

          <div class="post-content">
            <!-- 使用 v-html 渲染 API 返回的真实帖子内容 -->
            <div class="content-section" v-html="post.content"></div>
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
          </div>
        </section>
      </div>
    </main>

    <!-- 删除确认弹窗 -->
    <div
      v-if="showDeleteModal"
      class="delete-modal-overlay"
      @click="cancelDelete"
    >
      <div class="delete-modal" @click.stop>
        <div class="delete-modal-header">
          <h3 class="delete-modal-title">确认删除</h3>
        </div>
        <div class="delete-modal-body">
          <p>
            {{
              deleteTarget?.type === 'comment'
                ? '确定要删除这条评论吗？'
                : '确定要删除这条回复吗？'
            }}
          </p>
          <p class="delete-modal-warning">此操作无法撤销</p>
        </div>
        <div class="delete-modal-footer">
          <button class="cancel-btn" @click="cancelDelete">取消</button>
          <button class="confirm-delete-btn" @click="confirmDelete">
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getCommunityPostDetail } from '@/utils/api'; // 你的api文件路径

export default {
  props: ['id'],
  data() {
    return {
      // 帖子数据（初始化空，等API填充）
      post: {
        authorAvatar: '',
        authorName: '',
        isAuthor: false,
        postTime: '',
        category: '',
        title: '',
        tags: [],
        likes: 0,
        comments: 0,
        bookmarks: 0,
        views: 0,
        content: '',
      },

      // 当前用户信息（写评论时需要）
      currentUser: {
        avatar: 'https://picsum.photos/id/1000/40/40',
        name: '测试用户',
      },

      // 评论数据（先假数据）
      comments: [
        {
          avatar: 'https://picsum.photos/id/1012/40/40',
          author: '李华',
          time: '1小时前',
          content: '非常实用的方法！',
          likes: 15,
          liked: false,
          isMine: false,
          replies: [],
          showReplyBox: false,
          replyText: '',
        },
      ],

      newComment: '',
      showDeleteModal: false,
      deleteTarget: null,
    };
  },
  created() {
    if (this.id) {
      this.loadPostData(this.id);
    } else {
      console.error('无法获取帖子ID');
      this.$router.push('/community');
    }
  },
  watch: {
    $route(to) {
      if (to.name === 'PostDetail') {
        this.loadPostData(to.params.id);
      } else {
        // 如果跳到别的页面（非帖子详情），就清空当前内容，避免页面残留
        this.post = { title: '', content: '' };
      }
    },
  },

  methods: {
    async loadPostData(postId) {
      if (!postId) {
        console.warn('loadPostData: 无效的帖子ID:', postId);
        return;
      }

      // 避免重复加载相同ID
      if (this.post._loadedId === postId) {
        console.log('已加载过该帖子，无需重复加载:', postId);
        return;
      }
      this.post._loadedId = postId; // 标记已加载
      try {
        console.log('加载帖子数据 ID:', postId);
        const res = await getCommunityPostDetail(postId);
        console.log('帖子详情接口返回:', res);

        const p = res.data.post;

        let contentObj = {};
        try {
          contentObj = p.postContent ? JSON.parse(p.postContent) : {};
        } catch (e) {
          console.error('解析 postContent 失败:', e, p.postContent);
        }

        this.post = {
          authorAvatar: '', // 目前接口没给，先占位
          authorName: contentObj.author || `用户${p.userId}` || '匿名用户',
          isAuthor: false,
          postTime: p.createdAt || '',
          category: contentObj.category || '',
          title: contentObj.title || '未命名帖子',
          tags: contentObj.tags || [],
          likes: 0,
          comments: 0,
          bookmarks: 0,
          views: 0,
          content: contentObj.content || '', // 详情页显示正文
        };

        console.log('帖子详情加载完成:', this.post);
      } catch (err) {
        console.error('加载帖子失败:', err);
      }
    },

    likePost() {
      this.post.likes++;
    },
    bookmarkPost() {
      this.post.bookmarks++;
    },

    publishComment() {
      if (!this.newComment.trim()) return;
      this.comments.unshift({
        avatar: this.currentUser.avatar,
        author: this.currentUser.name,
        time: '刚刚',
        content: this.newComment,
        likes: 0,
        liked: false,
        isMine: true,
        replies: [],
        showReplyBox: false,
        replyText: '',
      });
      this.post.comments++;
      this.newComment = '';
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
  max-width: 100%;
}

.container {
  width: 75vw;
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
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  box-sizing: border-box;
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
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
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
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
}

.content-section {
  margin-bottom: 28px;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
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

/* 回复输入框样式 */
.reply-input {
  margin-top: 10px;
}
.reply-textarea {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 5px;
  margin-bottom: 5px;
}
.publish-reply {
  background-color: #0f88eb;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}

/* 回复列表样式 */
.reply-list {
  margin-top: 10px;
  padding-left: 20px;
}
.reply-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
}
.reply-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}
.reply-content {
  flex: 1;
}
.reply-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}
.reply-actions {
  margin-top: 5px;
}

/* 嵌套回复样式 */
.nested-reply-list {
  margin-top: 10px;
  padding-left: 30px;
  border-left: 2px solid #f1f3f5;
}
.nested-reply-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
}
.reply-content {
  flex: 1;
}
.reply-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}
.reply-actions {
  margin-top: 5px;
}

/* @提及样式 */
.reply-mention {
  color: #0f88eb;
  font-weight: 500;
}

/* 删除按钮样式 */
.delete-comment-btn {
  background-color: rgba(255, 255, 255, 0) !important;
  color: #dc2626 !important;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
}

.delete-comment-btn:hover {
  background-color: #dc2626 !important;
  color: white !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
}

/* 删除确认弹窗样式 */
.delete-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.delete-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 90%;
  animation: slideIn 0.3s ease-out;
}

.delete-modal-header {
  padding: 20px 20px 0;
  border-bottom: 1px solid #f1f3f5;
}

.delete-modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
}

.delete-modal-body {
  padding: 20px;
}

.delete-modal-body p {
  margin: 0 0 8px 0;
  color: #333;
  line-height: 1.5;
}

.delete-modal-warning {
  color: #dc2626;
  font-size: 14px;
}

.delete-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 20px 20px;
}

.cancel-btn {
  background-color: #f8f9fa;
  color: #495057;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background-color: #e9ecef;
}

.confirm-delete-btn {
  background-color: #dc2626;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-delete-btn:hover {
  background-color: #b91c1c;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
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

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s;
  }

  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }
}
</style>
