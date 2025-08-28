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
                <span>{{ post.likes }}个点赞</span>
              </button>
              <button class="action-btn">
                <span>{{ post.comments }}个评论</span>
              </button>
              <button class="action-btn report-btn" @click="openReportDialog">
                <i class="el-icon-warning-outline"></i>
                <span>举报该帖子</span>
              </button>
            </div>
          </div>
        </section>

        <!-- 评论区 -->
        <section class="comments-section">
          <h3 class="comments-title">评论 ({{ totalComments }})</h3>

          <!-- 评论输入框 -->
          <div class="comment-input" v-if="isLoggedIn">
            <textarea
              v-model="newComment"
              class="comment-textarea"
              placeholder="写下你的评论..."
              @keydown.ctrl.enter="publishComment"
            ></textarea>
            <button
              class="publish-comment"
              @click="publishComment"
              :disabled="!newComment.trim() || isSubmittingComment"
            >
              {{ isSubmittingComment ? '发布中...' : '发布评论' }}
            </button>
          </div>

          <!-- 未登录提示 -->
          <div v-else class="login-prompt">
            <p>请先登录后再发表评论</p>
            <button class="login-btn" @click="$router.push('/login')">
              立即登录
            </button>
          </div>

          <!-- 评论列表 -->
          <div v-if="isLoadingComments" class="loading-comments">
            正在加载评论...
          </div>

          <div v-else-if="comments.length === 0" class="no-comments">
            暂无评论，来发表第一条评论吧！
          </div>

          <div v-else class="comments-list">
            <div
              v-for="comment in comments"
              :key="comment.id"
              class="comment-item"
            >
              <img
                :src="comment.avatar || defaultAvatar"
                :alt="comment.author"
                class="comment-avatar"
              />
              <div class="comment-content">
                <div class="comment-header">
                  <div class="comment-author">{{ comment.author }}</div>
                  <div class="comment-time">
                    {{ formatTime(comment.createdAt) }}
                  </div>
                </div>
                <div class="comment-text">{{ comment.commentContent }}</div>
                <div class="comment-actions">
                  <button
                    v-if="comment.userId === currentUserId"
                    class="delete-comment-btn"
                    @click="confirmDeleteComment(comment)"
                  >
                    <i class="fa fa-trash"></i> 删除
                  </button>
                  <button
                    v-if="comment.userId !== currentUserId"
                    class="report-comment-btn"
                    @click="openReportCommentDialog(comment)"
                  >
                    <i class="el-icon-warning-outline"></i> 举报
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 加载更多按钮 -->
          <div v-if="hasMoreComments" class="load-more-comments">
            <button class="secondary-btn" @click="loadMoreComments">
              加载更多评论
            </button>
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

    <!-- 举报弹窗 -->
    <el-dialog
      title="举报帖子"
      :visible.sync="reportDialogVisible"
      width="500px"
      :close-on-click-modal="false"
      class="report-dialog"
    >
      <div class="report-form">
        <div class="report-post-title">
          <span class="label">举报帖子：</span>
          <span class="post-title">{{ post.title }}</span>
        </div>
        <el-form
          :model="reportForm"
          :rules="reportRules"
          ref="reportForm"
          label-width="80px"
        >
          <el-form-item label="举报原因" prop="reportContent">
            <el-input
              type="textarea"
              v-model="reportForm.reportContent"
              placeholder="请描述举报原因..."
              :rows="4"
              maxlength="500"
              show-word-limit
            >
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="reportDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="submitReport"
          :loading="reportSubmitting"
          >提交举报</el-button
        >
      </span>
    </el-dialog>

    <!-- 评论举报弹窗 -->
    <el-dialog
      title="举报评论"
      :visible.sync="reportCommentDialogVisible"
      width="500px"
      :close-on-click-modal="false"
      class="report-dialog"
    >
      <div class="report-form">
        <div class="report-comment-info">
          <span class="label">举报：</span>
          <span class="comment-author-name">{{
            reportTargetComment?.author
          }}</span>
          <span class="comment-content-preview">{{
            reportTargetComment?.commentContent
          }}</span>
        </div>
        <el-form
          :model="reportCommentForm"
          :rules="reportCommentRules"
          ref="reportCommentForm"
          label-width="80px"
        >
          <el-form-item label="举报原因" prop="reportReason">
            <el-input
              type="textarea"
              v-model="reportCommentForm.reportReason"
              placeholder="请描述举报原因..."
              :rows="4"
              maxlength="500"
              show-word-limit
            >
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="reportCommentDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="submitCommentReport"
          :loading="reportCommentSubmitting"
          >提交举报</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  getCommunityPostDetail,
  getCommunityPostComments,
  getCommunityCommentCount,
  createCommunityComment,
  deleteCommunityComment,
  reportCommunityPost as apiReportCommunityPost,
  reportCommunityComment as apiReportCommunityComment,
} from '@/utils/api'; // 你的api文件路径
import { mapState } from 'vuex';

export default {
  props: ['id'],
  computed: {
    ...mapState('user', ['userId', 'userName', 'isLoggedIn']),
    currentUserId() {
      return this.userId;
    },
    defaultAvatar() {
      return 'https://picsum.photos/id/1000/40/40';
    },
  },
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

      // 评论相关数据
      comments: [],
      totalComments: 0,
      newComment: '',
      isLoadingComments: false,
      isSubmittingComment: false,
      hasMoreComments: false,

      // 弹窗相关
      showDeleteModal: false,
      deleteTarget: null,

      // 举报相关
      reportDialogVisible: false,
      reportSubmitting: false,
      reportForm: {
        reportContent: '',
      },
      reportRules: {
        reportContent: [
          { required: true, message: '请输入举报原因', trigger: 'blur' },
          { min: 10, message: '举报原因至少需要10个字符', trigger: 'blur' },
        ],
      },

      // 评论举报相关
      reportCommentDialogVisible: false,
      reportCommentSubmitting: false,
      reportTargetComment: null,
      reportCommentForm: {
        reportReason: '',
      },
      reportCommentRules: {
        reportReason: [
          { required: true, message: '请输入举报原因', trigger: 'blur' },
          { min: 10, message: '举报原因至少需要10个字符', trigger: 'blur' },
        ],
      },
    };
  },
  created() {
    if (this.id) {
      this.loadPostData(this.id);
      this.loadComments(this.id);
      this.loadCommentCount(this.id);
    } else {
      console.error('无法获取帖子ID');
      this.$router.push('/community');
    }
  },
  watch: {
    $route(to) {
      if (to.name === 'PostDetail') {
        this.loadPostData(to.params.id);
        this.loadComments(to.params.id);
        this.loadCommentCount(to.params.id);
      } else {
        // 如果跳到别的页面（非帖子详情），就清空当前内容，避免页面残留
        this.post = { title: '', content: '' };
        this.comments = [];
        this.totalComments = 0;
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
          comments: this.totalComments, // 使用实际的评论数
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

    // 加载评论列表
    async loadComments(postId) {
      if (!postId) return;

      this.isLoadingComments = true;
      try {
        const response = await getCommunityPostComments(postId);
        console.log('评论列表响应:', response);

        if (response.data && response.data.comments) {
          this.comments = response.data.comments.map((comment) => ({
            ...comment,
            author: comment.userId ? `用户${comment.userId}` : '匿名用户',
            avatar: this.defaultAvatar,
          }));
        } else {
          this.comments = [];
        }
      } catch (error) {
        console.error('加载评论失败:', error);
        this.comments = [];
        this.$message?.error('加载评论失败，请稍后重试');
      } finally {
        this.isLoadingComments = false;
      }
    },

    // 加载评论数量
    async loadCommentCount(postId) {
      if (!postId) return;

      try {
        const response = await getCommunityCommentCount(postId);
        console.log('评论数量响应:', response);

        if (response.data && typeof response.data.commentCount === 'number') {
          this.totalComments = response.data.commentCount;
          this.post.comments = this.totalComments;
        }
      } catch (error) {
        console.error('加载评论数量失败:', error);
        this.totalComments = 0;
      }
    },

    // 发布评论
    async publishComment() {
      if (!this.newComment.trim()) {
        this.$message?.warning('评论内容不能为空');
        return;
      }

      if (!this.isLoggedIn) {
        this.$message?.warning('请先登录');
        this.$router.push('/login');
        return;
      }

      this.isSubmittingComment = true;
      try {
        const payload = {
          userId: this.currentUserId,
          commentContent: this.newComment.trim(),
        };

        console.log('发布评论请求:', payload);
        const response = await createCommunityComment(this.id, payload);
        console.log('发布评论响应:', response);

        if (response.data && response.data.comment) {
          // 添加新评论到列表顶部
          const newComment = {
            ...response.data.comment,
            author: this.userName || `用户${this.currentUserId}`,
            avatar: this.defaultAvatar,
          };
          this.comments.unshift(newComment);

          // 更新评论数量
          this.totalComments++;
          this.post.comments = this.totalComments;

          // 清空输入框
          this.newComment = '';

          this.$message?.success('评论发布成功');
        }
      } catch (error) {
        console.error('发布评论失败:', error);
        this.$message?.error('发布评论失败，请稍后重试');
      } finally {
        this.isSubmittingComment = false;
      }
    },

    // 确认删除评论
    confirmDeleteComment(comment) {
      this.deleteTarget = { type: 'comment', data: comment };
      this.showDeleteModal = true;
    },

    // 取消删除
    cancelDelete() {
      this.showDeleteModal = false;
      this.deleteTarget = null;
    },

    // 执行删除
    async confirmDelete() {
      if (!this.deleteTarget || this.deleteTarget.type !== 'comment') {
        return;
      }

      const comment = this.deleteTarget.data;

      try {
        const payload = {
          userId: this.currentUserId,
        };

        console.log('删除评论请求:', comment.id, payload);
        const response = await deleteCommunityComment(comment.id, payload);
        console.log('删除评论响应:', response);

        // 从列表中移除评论
        const index = this.comments.findIndex((c) => c.id === comment.id);
        if (index !== -1) {
          this.comments.splice(index, 1);

          // 更新评论数量
          this.totalComments = Math.max(0, this.totalComments - 1);
          this.post.comments = this.totalComments;
        }

        this.$message?.success('评论删除成功');
      } catch (error) {
        console.error('删除评论失败:', error);
        this.$message?.error('删除评论失败，请稍后重试');
      } finally {
        this.cancelDelete();
      }
    },

    // 加载更多评论（预留功能）
    loadMoreComments() {
      // TODO: 实现分页加载评论
      console.log('加载更多评论');
    },

    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr) return '';

      try {
        const time = new Date(timeStr);
        const now = new Date();
        const diff = now - time;

        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 60) {
          return minutes <= 0 ? '刚刚' : `${minutes}分钟前`;
        } else if (hours < 24) {
          return `${hours}小时前`;
        } else if (days < 7) {
          return `${days}天前`;
        } else {
          return time.toLocaleDateString('zh-CN');
        }
      } catch (error) {
        console.error('时间格式化失败:', error);
        return timeStr;
      }
    },

    // 打开举报弹窗
    openReportDialog() {
      this.reportDialogVisible = true;
      this.reportForm.reportContent = '';
    },

    // 提交举报
    async submitReport() {
      this.$refs.reportForm.validate(async (valid) => {
        if (valid) {
          this.reportSubmitting = true;
          try {
            const currentTime = new Date().toISOString();
            const reportload = {
              postId: this.id, // 帖子ID
              postTitle: this.post.title, // 帖子标题
              postAuthorName: this.post.authorName, // 帖子作者姓名
              reportTime: currentTime, // 举报时间
              reportReason: this.reportForm.reportContent, // 举报原因(至少10个字符)
              reportContent: this.post.content, //帖子内容
            };

            console.log('举报提交的reportload:', reportload);
            const response = await apiReportCommunityPost(reportload);

            if (response.data.success) {
              this.$message.success('举报提交成功，我们会尽快处理');
              this.reportDialogVisible = false;
              this.reportForm.reportContent = '';
            } else {
              this.$message.error(response.data.message || '举报提交失败');
            }
          } catch (error) {
            console.error('举报提交失败:', error);
            this.$message.error('举报提交失败，请稍后重试');
          } finally {
            this.reportSubmitting = false;
          }
        }
      });
    },

    // 打开评论举报弹窗
    openReportCommentDialog(comment) {
      this.reportTargetComment = comment;
      this.reportCommentDialogVisible = true;
      this.reportCommentForm.reportReason = '';
    },

    // 提交评论举报
    async submitCommentReport() {
      this.$refs.reportCommentForm.validate(async (valid) => {
        if (valid) {
          this.reportCommentSubmitting = true;
          try {
            const currentTime = new Date().toISOString();
            const reportload = {
              commentId: this.reportTargetComment.id,
              reportReason: this.reportCommentForm.reportReason,
              reportDetails: '',
              reportContent: this.reportTargetComment.commentContent,
              reportTime: currentTime,
            };

            console.log('评论举报提交的reportload:', reportload);
            const response = await apiReportCommunityComment(reportload);

            if (response.data.success) {
              this.$message.success('举报提交成功，我们会尽快处理');
              this.reportCommentDialogVisible = false;
              this.reportCommentForm.reportReason = '';
              this.reportTargetComment = null;
            } else {
              this.$message.error(response.data.message || '举报提交失败');
            }
          } catch (error) {
            console.error('评论举报提交失败:', error);
            this.$message.error('举报提交失败，请稍后重试');
          } finally {
            this.reportCommentSubmitting = false;
          }
        }
      });
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
  box-sizing: border-box;
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

.publish-comment:hover:not(:disabled) {
  background-color: #0a6fca;
}

.publish-comment:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* 未登录提示 */
.login-prompt {
  text-align: center;
  padding: 20px;
  background-color: #f8fafc;
  border-radius: 8px;
  margin-bottom: 20px;
}

.login-prompt p {
  margin-bottom: 12px;
  color: #666;
}

.login-btn {
  background-color: #0f88eb;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 20px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.login-btn:hover {
  background-color: #0a6fca;
}

/* 加载和空状态 */
.loading-comments,
.no-comments {
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 14px;
}

.no-comments {
  background-color: #f8fafc;
  border-radius: 8px;
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
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.comment-item:hover {
  background-color: #f1f5f9;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-author {
  font-weight: 500;
  font-size: 14px;
  color: #1a1a1a;
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
  word-wrap: break-word;
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
  gap: 4px;
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

/* 举报按钮样式 */
.report-btn {
  color: #f56565 !important;
  border-color: transparent !important;
}

.report-btn:hover {
  background-color: #fee2e2 !important;
  color: #dc2626 !important;
}

/* 举报弹窗样式 */
.report-dialog .el-dialog__header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.report-dialog .el-dialog__title {
  color: #1a1a1a;
  font-weight: 600;
}

.report-form {
  padding: 20px 0;
}

.report-post-title {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.report-post-title .label {
  color: #666;
  font-size: 14px;
  margin-right: 8px;
}

.report-post-title .post-title {
  color: #1a1a1a;
  font-weight: 500;
  font-size: 16px;
}

.report-dialog .el-textarea__inner {
  min-height: 100px !important;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

.report-dialog .el-textarea__inner:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.report-dialog .dialog-footer {
  text-align: right;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

/* 评论举报按钮样式 */
.report-comment-btn {
  color: #f56565 !important;
  border: none !important;
  background: none !important;
  padding: 4px 8px !important;
  font-size: 12px !important;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.report-comment-btn:hover {
  background-color: #fee2e2 !important;
  color: #dc2626 !important;
}

/* 评论操作区域样式调整 */
.comment-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  align-items: center;
}

/* 评论举报弹窗特定样式 */
.report-comment-info {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #f56565;
}

.report-comment-info .label {
  color: #666;
  font-size: 14px;
  margin-right: 8px;
}

.report-comment-info .comment-author-name {
  color: #1a1a1a;
  font-weight: 500;
  font-size: 16px;
  margin-right: 8px;
}

.report-comment-info .comment-content-preview {
  color: #555;
  font-size: 14px;
  font-style: italic;
  display: block;
  margin-top: 8px;
  word-wrap: break-word;
  max-height: 100px;
  overflow-y: auto;
}
</style>
