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
      </div>
      <!-- 评论区移到content-layout外部，紧跟帖子详情后面 -->
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
          <button class="login-btn" @click="goToLoginDialog">立即登录</button>
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
            v-for="comment in filteredComments"
            :key="comment.id"
            class="comment-item"
            style="align-items: flex-start"
          >
            <img
              :src="comment.avatar || defaultAvatar"
              :alt="comment.author"
              class="comment-avatar"
              style="
                width: 40px;
                height: 40px;
                object-fit: cover;
                border-radius: 50%;
                flex-shrink: 0;
              "
            />
            <div
              class="comment-content"
              style="
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: flex-start;
              "
            >
              <div
                style="
                  display: flex;
                  flex-direction: column;
                  align-items: flex-start;
                "
              >
                <span
                  class="comment-author"
                  style="
                    font-weight: 600;
                    color: #0f88eb;
                    font-size: 15px;
                    line-height: 1;
                  "
                >
                  {{ comment.author }}
                </span>
                <span
                  class="comment-time"
                  style="
                    color: #999;
                    font-size: 12px;
                    line-height: 1;
                    margin-bottom: 2px;
                  "
                >
                  {{ formatTime(comment.createdAt) }}
                </span>
              </div>
              <div class="comment-text" style="margin-top: 4px">
                {{ comment.commentContent }}
              </div>
              <!--
              <div
                style="
                  background: #ffecec;
                  color: #d00;
                  font-size: 12px;
                  padding: 4px 8px;
                  margin: 4px 0;
                  border-radius: 4px;
                "
              >
                <strong>调试信息：</strong>
                <pre
                  style="
                    white-space: pre-wrap;
                    word-break: break-all;
                    margin: 0;
                  "
                  >{{ comment }}\nAPI获取评论者名字: {{
                    comment.debugAuthorName || comment.author
                  }}</pre
                >
              </div>
              -->
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
                <button
                  class="reply-comment-btn"
                  @click="toggleReplyBox(comment.id)"
                >
                  回复
                </button>
                <button
                  class="like-btn"
                  @click="toggleLikeComment(comment)"
                  style="
                    margin-left: 8px;
                    background: none;
                    border: none;
                    cursor: pointer;
                  "
                >
                  <img
                    :src="
                      comment.likedByMe
                        ? require('@/assets/images/community/like.png')
                        : require('@/assets/images/community/like_empty.png')
                    "
                    alt="点赞"
                    style="width: 20px; height: 20px; vertical-align: middle"
                  />
                  <span
                    style="margin-left: 2px; font-size: 13px; color: #888"
                    >{{ comment.likeCount || 0 }}</span
                  >
                </button>
              </div>
              <!-- 回复输入框 -->
              <div v-if="replyBoxVisible[comment.id]" class="reply-input">
                <textarea
                  v-model="replyContent[comment.id]"
                  class="comment-textarea"
                  placeholder="回复内容..."
                ></textarea>
                <button
                  class="publish-comment"
                  @click="submitReply(comment)"
                  :disabled="!replyContent[comment.id] || isSubmittingReply"
                >
                  {{ isSubmittingReply ? '发布中...' : '发布回复' }}
                </button>
              </div>
              <!-- 回复列表（默认显示3条，超过3条可展开/收起） -->
              <div
                v-if="
                  commentReplies[comment.id] &&
                  commentReplies[comment.id].length
                "
                class="reply-list"
              >
                <div style="margin-bottom: 8px">
                  <div
                    v-for="reply in replyListExpanded[comment.id]
                      ? commentReplies[comment.id]
                      : commentReplies[comment.id].slice(0, 3)"
                    :key="reply.id"
                    class="reply-item"
                    style="display: flex; align-items: flex-start"
                  >
                    <img
                      :src="reply.avatar || defaultAvatar"
                      :alt="reply.author"
                      class="comment-avatar"
                      style="
                        width: 32px;
                        height: 32px;
                        margin-right: 8px;
                        object-fit: cover;
                        border-radius: 50%;
                        flex-shrink: 0;
                      "
                    />
                    <div style="flex: 1; display: flex; flex-direction: column">
                      <div style="display: flex; align-items: flex-start">
                        <div
                          style="
                            display: flex;
                            flex-direction: column;
                            align-items: flex-start;
                          "
                        >
                          <span
                            style="
                              font-weight: 600;
                              color: #0f88eb;
                              font-size: 14px;
                              line-height: 1;
                            "
                          >
                            {{ reply.author }}
                          </span>
                          <span
                            class="reply-time"
                            style="
                              color: #999;
                              font-size: 12px;
                              line-height: 1;
                              margin-bottom: 2px;
                            "
                          >
                            {{ formatTime(reply.createdAt) }}
                          </span>
                        </div>
                      </div>
                      <span class="reply-content" style="margin-top: 4px">{{
                        reply.commentContent
                      }}</span>
                      <!--
                      <div
                        style="
                          background: #ffecec;
                          color: #d00;
                          font-size: 12px;
                          padding: 4px 8px;
                          margin: 4px 0;
                          border-radius: 4px;
                        "
                      >
                        <strong>调试信息：</strong>
                        <pre
                          style="
                            white-space: pre-wrap;
                            word-break: break-all;
                            margin: 0;
                          "
                          >{{ reply }}\nAPI获取评论者名字: {{
                            reply.debugAuthorName || reply.author
                          }}</pre
                        >
                      </div>
                      -->
                      <div class="comment-actions" style="margin-top: 4px">
                        <button
                          v-if="reply.userId === currentUserId"
                          class="delete-comment-btn"
                          @click="confirmDeleteComment(reply)"
                        >
                          <i class="fa fa-trash"></i> 删除
                        </button>
                        <button
                          v-if="reply.userId !== currentUserId"
                          class="report-comment-btn"
                          @click="openReportCommentDialog(reply)"
                        >
                          <i class="el-icon-warning-outline"></i> 举报
                        </button>
                        <button
                          class="reply-comment-btn"
                          @click="toggleReplyBoxInReply(reply.id)"
                        >
                          回复
                        </button>
                        <button
                          class="like-btn"
                          @click="toggleLikeComment(reply)"
                          style="
                            margin-left: 8px;
                            background: none;
                            border: none;
                            cursor: pointer;
                          "
                        >
                          <img
                            :src="
                              reply.likedByMe
                                ? require('@/assets/images/community/like.png')
                                : require('@/assets/images/community/like_empty.png')
                            "
                            alt="点赞"
                            style="
                              width: 18px;
                              height: 18px;
                              vertical-align: middle;
                            "
                          />
                          <span
                            style="
                              margin-left: 2px;
                              font-size: 13px;
                              color: #888;
                            "
                            >{{ reply.likeCount || 0 }}</span
                          >
                        </button>
                      </div>
                      <div v-if="replyBoxVisible[reply.id]" class="reply-input">
                        <textarea
                          v-model="replyContent[reply.id]"
                          class="comment-textarea"
                          placeholder="回复内容..."
                        ></textarea>
                        <button
                          class="publish-comment"
                          @click="submitReplyInReply(reply, comment.id)"
                          :disabled="
                            !replyContent[reply.id] || isSubmittingReply
                          "
                        >
                          {{ isSubmittingReply ? '发布中...' : '发布回复' }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  v-if="commentReplies[comment.id].length > 3"
                  class="secondary-btn"
                  @click="toggleReplyList(comment.id)"
                >
                  {{ replyListExpanded[comment.id] ? '收起' : '展开' }}
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
  //getCommunityLikeCount as apiGetCommunityLikeCount,
  getCommentReplies,
  getRepliedCommentAuthor,
  getCommentAuthorName,
  likeCommunityComment,
  cancelLikeCommunityComment,
  getCommentLikeCount,
  checkUserLikedComment,
} from '@/utils/api'; // 你的api文件路径
import { mapState } from 'vuex';

export default {
  props: ['id'],
  computed: {
    ...mapState('user', ['userId', 'userName', 'token']),
    currentUserId() {
      return this.userId;
    },
    isLoggedIn() {
      // 标准登录判断：token存在且userId为有效数字
      return !!this.token && !!this.userId && !isNaN(Number(this.userId));
    },
    defaultAvatar() {
      return 'https://picsum.photos/id/1000/40/40';
    },
    filteredComments() {
      // 只显示主评论（无replyId）
      return this.comments.filter((c) => !c.replyId);
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

      // 回复相关数据
      replyBoxVisible: {}, // 控制每条评论的回复输入框显示
      replyContent: {}, // 每条评论的回复内容
      isSubmittingReply: false,
      commentReplies: {}, // 每条评论的回复列表
      repliesLoaded: {}, // 标记回复是否已加载

      // 回复楼层展开状态
      replyListExpanded: {}, // 每条评论的回复楼层展开状态

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
      // 新增：自动加载每条主评论的回复
      this.$nextTick(() => {
        this.loadAllCommentReplies();
      });
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
    // 跳转首页并弹出登录弹窗
    goToLoginDialog() {
      if (this.$route.path !== '/') {
        this.$router.push('/').then(() => {
          this.$root.$emit && this.$root.$emit('openLoginDialog');
        });
      } else {
        this.$root.$emit && this.$root.$emit('openLoginDialog');
      }
    },
    // 点赞/取消点赞评论或回复
    async toggleLikeComment(item) {
      if (!item || !item.id) {
        console.error('点赞失败：item或item.id无效', item);
        return;
      }
      const commentId = Number(item.id);
      const userId = Number(this.currentUserId);
      if (!userId || isNaN(userId)) {
        this.$message?.warning({
          message: '请先登录',
          type: 'warning',
          iconClass: 'el-icon-warning-outline',
          duration: 2000,
        });
        return;
      }
      // 点赞前先用API实时检查状态，防止前端状态不同步
      let isLiked = !!item.likedByMe;
      try {
        const likedRes = await checkUserLikedComment(commentId, userId);
        isLiked = !!likedRes.data?.isLiked;
        item.likedByMe = isLiked;
      } catch (e) {
        // 检查失败时保留本地状态
      }
      try {
        if (isLiked) {
          await this.cancelLikeCommunityComment(commentId);
          item.likedByMe = false;
          item.likeCount = (item.likeCount || 1) - 1;
        } else {
          await this.likeCommunityComment(commentId);
          item.likedByMe = true;
          item.likeCount = (item.likeCount || 0) + 1;
        }
      } catch (e) {
        // 如果是已点赞导致的400，直接提示已点赞
        if (e && e.code === 400 && /already/i.test(e.message)) {
          item.likedByMe = true;
          this.$message?.info('您已点赞过该评论');
        } else {
          this.$message?.error('操作失败，请稍后重试');
        }
        console.error('点赞API调用异常', e);
      }
    },
    // 点赞API
    async likeCommunityComment(commentId) {
      // 直接调用import进来的API，确保userId为数字
      return await likeCommunityComment(commentId, {
        userId: Number(this.currentUserId),
      });
    },
    // 取消点赞API
    async cancelLikeCommunityComment(commentId) {
      return await cancelLikeCommunityComment(commentId, {
        userId: Number(this.currentUserId),
      });
    },
    // 修复：回复楼层内回复按钮事件
    toggleReplyBoxInReply(replyId) {
      if (!this.isLoggedIn) {
        this.$message?.warning({
          message: '请先登录',
          type: 'warning',
          iconClass: 'el-icon-warning-outline',
          duration: 2000,
        });
        return;
      }
      Object.keys(this.replyBoxVisible).forEach((key) => {
        this.$set(this.replyBoxVisible, key, false);
      });
      this.$set(this.replyBoxVisible, replyId, !this.replyBoxVisible[replyId]);
    },
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
      this.isLoadingComments = true;
      try {
        const res = await getCommunityPostComments(postId);
        // 兼容后端返回结构，确保comments为数组
        let commentsArr = [];
        if (res.data) {
          if (Array.isArray(res.data.comments)) {
            commentsArr = res.data.comments;
          } else if (Array.isArray(res.data)) {
            commentsArr = res.data;
          } else if (Array.isArray(res.comments)) {
            commentsArr = res.comments;
          }
        }
        // 为每条主评论补充author、likeCount、likedByMe字段
        const userId = Number(this.currentUserId);
        const commentsWithLike = await Promise.all(
          commentsArr.map(async (comment) => {
            let author = '';
            let likeCount = 0;
            let likedByMe = false;
            try {
              const nameRes = await getCommentAuthorName(comment.id);
              author = nameRes.data?.authorName || `用户${comment.userId}`;
            } catch (e) {
              author = `用户${comment.userId}`;
            }
            try {
              const likeRes = await getCommentLikeCount(comment.id);
              likeCount = likeRes.data?.likeCount || 0;
            } catch (e) {
              likeCount = 0;
            }
            try {
              if (userId) {
                const likedRes = await checkUserLikedComment(
                  comment.id,
                  userId
                );
                likedByMe = !!likedRes.data?.isLiked;
              }
            } catch (e) {
              likedByMe = false;
            }
            return { ...comment, author, likeCount, likedByMe };
          })
        );
        this.comments = commentsWithLike;
        this.$forceUpdate(); // 强制刷新，确保点赞贴图立即切换
        // 新增：加载所有主评论的回复
        await this.loadAllCommentReplies();
      } catch (err) {
        this.comments = [];
        this.$message?.error('评论加载失败');
      } finally {
        this.isLoadingComments = false;
      }
    },
    async loadAllCommentReplies() {
      if (!Array.isArray(this.comments)) return;
      const userId = Number(this.currentUserId);
      for (const comment of this.comments) {
        if (!comment.replyId) {
          try {
            const res = await getCommentReplies(comment.id);
            if (res.data && Array.isArray(res.data.replies)) {
              // 每条回复都通过API获取评论者名字、点赞数、点赞状态
              const replies = await Promise.all(
                res.data.replies.map(async (reply) => {
                  let repliedAuthor = null;
                  let author = '';
                  let likeCount = 0;
                  let likedByMe = false;
                  try {
                    const nameRes = await getCommentAuthorName(reply.id);
                    author = nameRes.data?.authorName || `用户${reply.userId}`;
                  } catch (e) {
                    author = `用户${reply.userId}`;
                  }
                  try {
                    const likeRes = await getCommentLikeCount(reply.id);
                    likeCount = likeRes.data?.likeCount || 0;
                  } catch (e) {
                    likeCount = 0;
                  }
                  try {
                    if (userId) {
                      const likedRes = await checkUserLikedComment(
                        reply.id,
                        userId
                      );
                      likedByMe = !!likedRes.data?.isLiked;
                    }
                  } catch (e) {
                    likedByMe = false;
                  }
                  if (reply.parentId) {
                    try {
                      const authorRes = await getRepliedCommentAuthor(reply.id);
                      repliedAuthor = authorRes.data?.repliedAuthor || null;
                    } catch (e) {
                      // 获取被回复作者失败时，repliedAuthor为null
                    }
                  }
                  return {
                    ...reply,
                    repliedAuthor,
                    author,
                    likeCount,
                    likedByMe,
                  };
                })
              );
              this.$set(this.commentReplies, comment.id, replies);
              this.$set(this.repliesLoaded, comment.id, true);
              this.$set(this.replyListExpanded, comment.id, false);
              this.$forceUpdate(); // 回复加载后也强制刷新
            }
          } catch (e) {
            this.$set(this.commentReplies, comment.id, []);
          }
        }
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
        window.location.reload(); // 删除后刷新页面，保证评论区同步
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

    toggleReplyBox(commentId) {
      if (!this.isLoggedIn) {
        this.$message?.warning({
          message: '请先登录',
          type: 'warning',
          iconClass: 'el-icon-warning-outline',
          duration: 2000,
        });
        return;
      }
      // 只允许一个回复输入框
      Object.keys(this.replyBoxVisible).forEach((key) => {
        this.$set(this.replyBoxVisible, key, false);
      });
      this.$set(
        this.replyBoxVisible,
        commentId,
        !this.replyBoxVisible[commentId]
      );
    },
    async submitReply(comment) {
      if (!this.replyContent[comment.id]) return;
      this.isSubmittingReply = true;
      try {
        // 回复任何评论都应传 replyId = comment.id
        let repliedAuthor = null;
        let payload = {
          userId: this.currentUserId,
          commentContent: this.replyContent[comment.id],
          replyId: comment.id,
        };
        try {
          const authorRes = await getRepliedCommentAuthor(comment.id);
          repliedAuthor = authorRes.data?.repliedAuthor || null;
        } catch (e) {
          // 获取被回复作者失败时，repliedAuthor为null
        }
        // 发送评论/回复
        const res = await createCommunityComment(this.id, payload);
        if (res.data && res.data.comment) {
          const newReply = {
            ...res.data.comment,
            repliedAuthor,
          };
          if (!this.commentReplies[comment.id])
            this.$set(this.commentReplies, comment.id, []);
          this.commentReplies[comment.id].unshift(newReply);
          this.replyContent[comment.id] = '';
          this.$message?.success('回复发布成功');
          this.$set(this.replyBoxVisible, comment.id, false);
          window.location.reload(); // 发布后刷新页面
        }
      } catch (error) {
        this.$message?.error(error?.message || '回复发布失败');
      } finally {
        this.isSubmittingReply = false;
      }
    },
    async submitReplyInReply(reply, parentCommentId) {
      if (!this.replyContent[reply.id]) return;
      this.isSubmittingReply = true;
      try {
        let repliedAuthor = null;
        let author = '';
        let payload = {
          userId: this.currentUserId,
          // 内容加上@被回复人名字
          commentContent: '',
          // replyId始终为主评论id
          replyId: parentCommentId,
        };
        try {
          const nameRes = await getCommentAuthorName(reply.id);
          author = nameRes.data?.authorName || `用户${reply.userId}`;
        } catch (e) {
          author = `用户${reply.userId}`;
        }
        // 被回复人名字优先用reply.author
        let atText = reply.author ? `@${reply.author} ` : '';
        payload.commentContent = atText + this.replyContent[reply.id];
        // 发送回复评论
        const res = await createCommunityComment(this.id, payload);
        if (res.data && res.data.comment) {
          const newReply = {
            ...res.data.comment,
            repliedAuthor,
            author,
            avatar: this.defaultAvatar,
          };
          if (!this.commentReplies[parentCommentId])
            this.$set(this.commentReplies, parentCommentId, []);
          this.commentReplies[parentCommentId].unshift(newReply);
          this.replyContent[reply.id] = '';
          this.$message?.success('回复发布成功');
          this.$set(this.replyBoxVisible, reply.id, false);
          window.location.reload(); // 发布后刷新页面
        }
      } catch (error) {
        this.$message?.error(error?.message || '回复发布失败');
      } finally {
        this.isSubmittingReply = false;
      }
    },
    async loadReplies(commentId) {
      try {
        const res = await getCommentReplies(commentId);
        if (res.data && res.data.replies) {
          // 仅对有parentId的回复评论请求@对象
          const replies = await Promise.all(
            res.data.replies.map(async (reply) => {
              let repliedAuthor = null;
              if (reply.parentId) {
                try {
                  const authorRes = await getRepliedCommentAuthor(reply.id);
                  repliedAuthor = authorRes.data?.repliedAuthor || null;
                } catch (e) {
                  // 获取被回复作者失败时，repliedAuthor为null
                }
              }
              return { ...reply, repliedAuthor };
            })
          );
          this.$set(this.commentReplies, commentId, replies);
          this.$set(this.repliesLoaded, commentId, true);
        }
      } catch (error) {
        this.$message?.error('加载回复失败');
      }
    },
    toggleReplyList(commentId) {
      this.$set(
        this.replyListExpanded,
        commentId,
        !this.replyListExpanded[commentId]
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
  align-items: center;
  margin-bottom: 8px;
}
.reply-mention {
  color: #0f88eb;
  font-weight: 500;
  margin-right: 6px;
}
.reply-content {
  color: #333;
  margin-right: 6px;
}
.reply-time {
  color: #999;
  font-size: 12px;
}
.reply-comment-btn,
.secondary-btn {
  background: none;
  border: none;
  color: #0f88eb;
  font-size: 14px;
  padding: 0 8px;
  cursor: pointer;
  outline: none;
  transition: color 0.2s;
}
.reply-comment-btn:hover,
.secondary-btn:hover {
  color: #1976d2;
  text-decoration: underline;
}
.delete-comment-btn {
  background: none;
  border: none;
  color: #dc2626;
  font-size: 14px;
  padding: 0 8px;
  cursor: pointer;
  outline: none;
  transition: color 0.2s;
}
.delete-comment-btn:hover {
  color: #b91c1c;
  text-decoration: underline;
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
