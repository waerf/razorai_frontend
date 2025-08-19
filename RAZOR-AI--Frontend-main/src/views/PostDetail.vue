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
                    <button
                      class="comment-action-btn bg-razor-lightBlue text-razor-blue px-3 py-1 rounded-full hover:bg-razor-blue hover:text-white transition"
                      @click="likeComment(index)"
                    >
                      <img
                        :src="
                          require(
                            '@/assets/images/community/' +
                              (comment.liked ? 'like.png' : 'like_empty.png')
                          )
                        "
                        alt="点赞图标"
                        class="like-icon mr-1"
                        style="width: 20px; height: 20px"
                      />
                      {{ comment.likes }}
                    </button>
                    <button
                      class="comment-action-btn bg-razor-lightBlue text-razor-blue px-3 py-1 rounded-full hover:bg-razor-blue hover:text-white transition"
                      @click="toggleReplyBox(index)"
                    >
                      回复
                    </button>
                    <button
                      v-if="comment.isMine"
                      class="comment-action-btn delete-comment-btn"
                      @click="deleteComment(index)"
                    >
                      删除
                    </button>
                  </div>
                  <!-- 回复输入框 -->
                  <div v-if="comment.showReplyBox" class="reply-input">
                    <textarea
                      :placeholder="
                        comment.replyTarget
                          ? `回复 @${comment.replyTarget}...`
                          : `回复 ${comment.author}...`
                      "
                      class="reply-textarea"
                      v-model="comment.replyText"
                    ></textarea>
                    <button class="publish-reply" @click="publishReply(index)">
                      发布回复
                    </button>
                  </div>
                  <!-- 回复列表 -->
                  <div class="reply-list">
                    <div
                      class="reply-item"
                      v-for="(reply, replyIndex) in comment.replies"
                      :key="replyIndex"
                    >
                      <img
                        :src="reply.avatar"
                        alt="回复者头像"
                        class="reply-avatar"
                      />
                      <div class="reply-content">
                        <div class="reply-header">
                          <span class="comment-author">{{ reply.author }}</span>
                          <span class="comment-time">{{ reply.time }}</span>
                        </div>
                        <div class="reply-text">
                          <span v-if="reply.replyTo" class="reply-mention"
                            >@{{ reply.replyTo }} </span
                          >{{ reply.content }}
                        </div>
                        <div class="comment-actions">
                          <button
                            class="comment-action-btn bg-razor-lightBlue text-razor-blue px-3 py-1 rounded-full hover:bg-razor-blue hover:text-white transition"
                            @click="likeReply(index, replyIndex)"
                          >
                            <img
                              :src="
                                require(
                                  '@/assets/images/community/' +
                                    (reply.liked
                                      ? 'like.png'
                                      : 'like_empty.png')
                                )
                              "
                              alt="点赞图标"
                              class="like-icon mr-1"
                              style="width: 20px; height: 20px"
                            />
                            {{ reply.likes }}
                          </button>
                          <button
                            class="comment-action-btn bg-razor-lightBlue text-razor-blue px-3 py-1 rounded-full hover:bg-razor-blue hover:text-white transition"
                            @click="replyToReply(index, reply.author)"
                          >
                            回复
                          </button>
                          <button
                            v-if="reply.isMine"
                            class="comment-action-btn delete-comment-btn"
                            @click="deleteReply(index, replyIndex)"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    </div>
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
export default {
  props: ['id'],
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

      // 当前用户信息
      currentUser: {
        avatar: 'https://picsum.photos/id/1000/40/40',
        name: '王小红', // 用户自己的名字
      },

      // 评论数据
      comments: [
        {
          avatar: 'https://picsum.photos/id/1012/40/40',
          author: '李华',
          time: '1小时前',
          content: '非常实用的方法！',
          likes: 15,
          liked: false,
          isMine: false,
          replies: [
            {
              avatar: 'https://picsum.photos/id/1015/40/40',
              author: '小王',
              time: '50分钟前',
              content: '我也觉得很棒！',
              likes: 3,
              liked: false,
              replyTo: null,
              isMine: false,
            },
            {
              avatar: 'https://picsum.photos/id/1020/40/40',
              author: '张三',
              time: '45分钟前',
              content: '同意，特别是Feedly这个工具推荐得很好',
              likes: 5,
              liked: false,
              replyTo: '李华',
              isMine: false,
            },
            {
              avatar: 'https://picsum.photos/id/1000/40/40',
              author: '王小红',
              time: '40分钟前',
              content: '请问有具体的使用教程吗？',
              likes: 2,
              liked: false,
              replyTo: '张三',
              isMine: true,
            },
          ],
          showReplyBox: false,
          replyText: '',
        },
        {
          avatar: 'https://picsum.photos/id/1025/40/40',
          author: '科技前沿',
          time: '1.5小时前',
          content:
            '请问你是如何处理不同平台的订阅内容同步问题的？比如有些专栏只在特定平台发布。',
          likes: 8,
          liked: false,
          isMine: false,
          replies: [],
          showReplyBox: false,
          replyText: '',
        },
        {
          avatar: 'https://picsum.photos/id/1000/40/40',
          author: '王小红',
          time: '2小时前',
          content:
            'Notion确实是个好工具，但对于新手来说可能有点复杂。有没有更简单的替代方案推荐？',
          likes: 5,
          liked: false,
          isMine: true, // 这是用户自己的评论
          replies: [],
          showReplyBox: false,
          replyText: '',
        },
      ],

      // 新评论
      newComment: '',

      // 删除确认弹窗状态
      showDeleteModal: false,
      deleteTarget: null, // 存储要删除的目标信息 {type: 'comment'|'reply', commentIndex: number, replyIndex?: number}
    };
  },
  watch: {
    // 监听路由参数变化，重新加载帖子数据
    $route(to, from) {
      if (to.params.id && to.params.id !== from.params.id) {
        this.loadPostData(to.params.id);
      }
    },
  },
  created() {
    console.log('PostDetail组件被创建');
    // 获取路由参数中的帖子ID
    const postId = this.$route.params.id || this.id;
    console.log('获取到的帖子ID:', postId);
    // 加载对应ID的帖子数据
    if (postId) {
      this.loadPostData(postId);
    } else {
      console.warn('没有获取到有效的帖子ID');
    }
  },
  mounted() {
    // 这里可以添加根据this.id加载帖子详情的逻辑
    if (this.id) {
      console.log('加载帖子ID:', this.id);
    }
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
        avatar: this.currentUser.avatar,
        author: this.currentUser.name,
        time: '刚刚',
        content: this.newComment,
        likes: 0,
        liked: false,
        isMine: true, // 新发布的评论标记为用户自己的
        replies: [],
        showReplyBox: false,
        replyText: '',
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
          replies: [],
          showReplyBox: false,
          replyText: '',
        },
        {
          avatar: 'https://picsum.photos/id/1066/40/40',
          author: '信息过载患者',
          time: '昨天',
          content:
            '感谢分享！我已经把Feedly和Pocket都下载好了，准备开始整理我的订阅列表。',
          likes: 2,
          replies: [],
          showReplyBox: false,
          replyText: '',
        }
      );
    },
    likeComment(index) {
      const comment = this.comments[index];
      if (comment.liked) {
        comment.likes = Math.max(0, comment.likes - 1);
        comment.liked = false;
      } else {
        comment.likes++;
        comment.liked = true;
      }
    },
    toggleReplyBox(index) {
      const comment = this.comments[index];
      comment.showReplyBox = !comment.showReplyBox;
      // 直接回复评论时，清除回复目标
      if (comment.showReplyBox) {
        comment.replyTarget = null;
      }
    },
    replyToReply(commentIndex, replyToAuthor) {
      // 直接在该评论下显示回复框，并预设回复目标
      const comment = this.comments[commentIndex];
      comment.showReplyBox = true;
      comment.replyText = '';
      comment.replyTarget = replyToAuthor; // 记录回复目标
    },
    publishReply(index) {
      const comment = this.comments[index];
      if (!comment.replyText.trim()) return;

      const replyContent = comment.replyText;
      const replyTo = comment.replyTarget || null;

      comment.replies.push({
        avatar: this.currentUser.avatar,
        author: this.currentUser.name,
        time: '刚刚',
        content: replyContent,
        likes: 0,
        liked: false,
        replyTo: replyTo,
        isMine: true, // 新发布的回复标记为用户自己的
      });

      comment.replyText = '';
      comment.showReplyBox = false;
      comment.replyTarget = null; // 清除回复目标
    },
    likeReply(commentIndex, replyIndex) {
      const reply = this.comments[commentIndex].replies[replyIndex];
      if (reply.liked) {
        reply.likes = Math.max(0, reply.likes - 1);
        reply.liked = false;
      } else {
        reply.likes++;
        reply.liked = true;
      }
    },
    deleteComment(index) {
      this.deleteTarget = { type: 'comment', commentIndex: index };
      this.showDeleteModal = true;
    },
    deleteReply(commentIndex, replyIndex) {
      this.deleteTarget = {
        type: 'reply',
        commentIndex: commentIndex,
        replyIndex: replyIndex,
      };
      this.showDeleteModal = true;
    },
    confirmDelete() {
      if (this.deleteTarget?.type === 'comment') {
        this.comments.splice(this.deleteTarget.commentIndex, 1);
        this.post.comments--;
      } else if (this.deleteTarget?.type === 'reply') {
        this.comments[this.deleteTarget.commentIndex].replies.splice(
          this.deleteTarget.replyIndex,
          1
        );
      }
      this.cancelDelete();
    },
    cancelDelete() {
      this.showDeleteModal = false;
      this.deleteTarget = null;
    },

    // 根据帖子ID加载帖子数据
    loadPostData(postId) {
      // 根据postId获取帖子详情数据
      console.log('加载帖子数据，ID:', postId);

      // 模拟帖子数据库
      const postsData = {
        1: {
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
        2: {
          authorAvatar: 'https://picsum.photos/id/1012/48/48',
          authorName: '李华',
          isAuthor: true,
          postTime: '昨天',
          category: '专栏推荐',
          title: '2025年值得订阅的10个优质专栏推荐',
          tags: ['专栏推荐', '2025精选', '内容推荐'],
          likes: 356,
          comments: 89,
          bookmarks: 210,
          views: '12.8k',
        },
        3: {
          authorAvatar: 'https://picsum.photos/id/1025/48/48',
          authorName: '科技前沿',
          isAuthor: false,
          postTime: '3天前',
          category: '技术讨论',
          title: 'AI辅助编程工具对比：GitHub Copilot vs. RAZOR-AI',
          tags: ['AI编程', '工具对比', '编程技巧'],
          likes: 247,
          comments: 63,
          bookmarks: 178,
          views: '8.5k',
        },
      };

      // 如果找到对应的帖子数据，则更新当前帖子
      if (postsData[postId]) {
        this.post = { ...this.post, ...postsData[postId] };
        console.log('帖子数据加载成功:', this.post);
      } else {
        console.warn('未找到对应ID的帖子:', postId);
        // 设置一个默认的错误帖子
        this.post = {
          ...this.post,
          title: `帖子未找到 (ID: ${postId})`,
          authorName: '未知作者',
          authorAvatar: 'https://picsum.photos/id/1000/48/48',
          postTime: '未知时间',
          category: '未知分类',
          tags: ['错误'],
          likes: 0,
          comments: 0,
          bookmarks: 0,
          views: '0',
        };
      }
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
}
</style>
