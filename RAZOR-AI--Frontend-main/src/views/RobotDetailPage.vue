<template>
  <!-- 机器人详情弹窗遮罩层 -->
  <div
    v-if="visible"
    class="robot-detail-overlay"
    @click="shouldListenToClicks ? closeDetail() : null"
    @wheel="shouldListenToClicks ? null : $event.preventDefault()"
    @touchmove="shouldListenToClicks ? null : $event.preventDefault()"
    @keydown="shouldListenToClicks ? null : $event.preventDefault()"
  >
    <div
      class="robot-detail-content"
      :class="{ 'content-disabled': !shouldListenToClicks }"
      @click.stop
      @wheel.stop="shouldListenToClicks ? null : $event.preventDefault()"
      @touchmove.stop="shouldListenToClicks ? null : $event.preventDefault()"
      @keydown.stop="shouldListenToClicks ? null : $event.preventDefault()"
      v-loading="loading"
    >
      <!-- 弹窗头部 -->
      <div class="robot-detail-header">
        <h2 class="robot-detail-title">机器人详情</h2>
        <button
          class="robot-detail-close"
          @click="shouldListenToClicks ? closeDetail() : null"
        >
          <i class="el-icon-close"></i>
        </button>
      </div>

      <!-- 弹窗内容 -->
      <div class="robot-detail-body">
        <!-- 机器人信息区域 -->
        <div class="robot-info-section">
          <div class="robot-info-header">
            <img
              :src="getRobotImage(robot.robotImage)"
              alt="Robot Icon"
              class="robot-detail-logo"
            />
            <div class="robot-info">
              <h1 class="robot-detail-name">
                {{ robot.name || '机器人名称' }}
              </h1>
              <p class="robot-detail-description">
                {{
                  robot.description ||
                  '这是一个功能强大的AI机器人，可以帮助您完成各种任务。'
                }}
              </p>
              <p class="robot-developer">
                <span class="developer-label">开发者：</span>
                <span class="developer-name">{{
                  robot.creatorName || '未知开发者'
                }}</span>
              </p>
              <div class="robot-stats">
                <div class="stat-item">
                  <div class="stat-value">
                    {{ formatRating(robotStats.rating) }}
                  </div>
                  <div class="stat-label">评分</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ robotStats.subscriptions }}</div>
                  <div class="stat-label">订阅数</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ robotStats.comments }}</div>
                  <div class="stat-label">评论数</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ formatPrice(robot.price) }}</div>
                  <div class="stat-label">所需积分</div>
                </div>
              </div>
              <div class="robot-detail-actions">
                <!-- 未订阅状态 -->
                <template v-if="!isUserSubscribed">
                  <el-button class="action-btn disabled" disabled>
                    未订阅
                  </el-button>
                  <el-button
                    type="primary"
                    class="action-btn primary"
                    @click="openSubscriptionDialog"
                  >
                    订阅
                  </el-button>
                </template>

                <!-- 已订阅状态 -->
                <template v-else>
                  <el-button
                    class="action-btn start-chat"
                    @click="startConversation"
                  >
                    开始对话
                  </el-button>
                  <el-button
                    type="primary"
                    class="action-btn renew"
                    @click="openRenewDialog"
                  >
                    续订
                  </el-button>
                </template>

                <!-- 注释掉推荐相似机器人按钮 -->
                <!--
                <el-button
                  class="action-btn secondary"
                  @click="showRecommendations"
                >
                  推荐相似机器人
                </el-button>
                -->
              </div>
            </div>
          </div>
        </div>

        <!-- 评论区 -->
        <div class="comments-section">
          <div class="comments-header">
            <h3 class="comments-title">用户评论 ({{ comments.length }})</h3>
            <el-button
              v-if="isLoggedIn && isUserSubscribed"
              type="primary"
              class="add-comment-btn"
              @click="showAddCommentForm = !showAddCommentForm"
            >
              添加评论
            </el-button>
            <el-button
              v-else-if="isLoggedIn && !isUserSubscribed"
              type="info"
              class="add-comment-btn"
              disabled
              title="请先订阅该机器人后再发表评论"
            >
              请先订阅后评论
            </el-button>
          </div>

          <!-- 添加评论表单 -->
          <div
            v-if="showAddCommentForm && isLoggedIn && isUserSubscribed"
            class="add-comment-form"
          >
            <div class="comment-form-group">
              <label class="comment-form-label">评分</label>
              <div class="rating-input">
                <i
                  v-for="star in 5"
                  :key="star"
                  class="el-icon-star-on rating-star"
                  :class="{ active: star <= currentRating }"
                  @click="setRating(star)"
                ></i>
              </div>
            </div>
            <div class="comment-form-group">
              <label class="comment-form-label">评论内容</label>
              <el-input
                v-model="newComment.text"
                type="textarea"
                class="comment-input"
                placeholder="请输入您的评论..."
                :rows="4"
              ></el-input>
            </div>
            <div class="comment-form-actions">
              <el-button @click="showAddCommentForm = false">取消</el-button>
              <el-button type="primary" @click="submitComment"
                >提交评论</el-button
              >
            </div>
          </div>

          <!-- 评论列表 -->
          <div class="comments-list">
            <div
              v-for="(comment, index) in comments"
              :key="comment.id"
              class="comment-item"
            >
              <div class="comment-header">
                <div class="comment-user">{{ comment.userName }}</div>
                <div class="comment-rating">
                  <i
                    v-for="star in 5"
                    :key="star"
                    class="el-icon-star-on"
                    :style="{
                      color: star <= comment.rating ? '#ffc107' : '#ddd',
                    }"
                  ></i>
                </div>
                <div class="comment-menu">
                  <button
                    class="comment-delete-btn"
                    v-if="comment.user_id === userId && isLoggedIn"
                    @click="confirmDeleteComment(index)"
                    title="删除评论"
                  >
                    <i class="el-icon-delete"></i>
                  </button>
                </div>
              </div>
              <div class="comment-text">{{ comment.text }}</div>
              <div class="comment-actions">
                <!-- 点赞/点踩功能已注释 -->
                <!--
                <button
                  class="comment-action"
                  :class="{ liked: comment.userLiked }"
                  @click="likeComment(index)"
                >
                  <i class="el-icon-thumb"></i> {{ comment.likes || 0 }}
                </button>
                <button
                  class="comment-action"
                  :class="{ disliked: comment.userDisliked }"
                  @click="dislikeComment(index)"
                >
                  <i class="el-icon-thumb"></i> {{ comment.dislikes || 0 }}
                </button>
                -->
              </div>
            </div>
          </div>

          <!-- 无评论提示 -->
          <div v-if="comments.length === 0" class="no-comments">
            暂无评论，快来添加第一条评论吧！
          </div>
        </div>
      </div>
    </div>

    <!-- 推荐机器人弹窗 -->
    <el-dialog
      title="推荐相似机器人"
      :visible.sync="recommendationDialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="closeRecommendations"
      width="80%"
      center
    >
      <div class="recommendation-content">
        <div
          v-for="category in recommendationCategories"
          :key="category.type"
          class="recommendation-section"
        >
          <h4 class="recommendation-category-title">{{ category.title }}</h4>
          <div class="recommendation-grid">
            <el-card
              v-for="recRobot in category.robots"
              :key="recRobot.id"
              class="recommendation-card"
              @click.native="showAnotherRobotDetail(recRobot.id)"
            >
              <div class="recommendation-card-header">
                <img
                  :src="getRobotImage(recRobot.robotImage)"
                  alt="robot"
                  class="recommendation-card-logo"
                />
                <div class="recommendation-card-info">
                  <div class="recommendation-card-name">
                    {{ recRobot.name }}
                  </div>
                  <div class="recommendation-card-developer">
                    开发者: {{ recRobot.developer || '未知' }}
                  </div>
                </div>
              </div>
              <div class="recommendation-card-description">
                {{ truncate(recRobot.description, 60) }}
              </div>
              <div class="recommendation-card-footer">
                <div class="recommendation-card-stats">
                  <div class="recommendation-card-rating">
                    <i class="el-icon-star-on" style="color: #ffc107"></i>
                    {{ recRobot.rating || 4.5 }}
                  </div>
                  <div class="recommendation-card-points">
                    <i class="el-icon-coin" style="color: #f39c12"></i>
                    {{ formatPrice(recRobot.price) }}
                  </div>
                </div>
                <el-button
                  size="mini"
                  type="primary"
                  class="recommendation-card-btn"
                  @click.stop="subscribeRecommendedRobot(recRobot.id)"
                >
                  订阅
                </el-button>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 订阅确认对话框 -->
    <el-dialog
      title="订阅确认"
      :visible.sync="isSubscriptionDialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="closeSubscriptionDialog"
      width="400px"
      center
    >
      <subscription-selector
        v-if="robot.id"
        :robotId="robot.id"
        :price="
          robot.price !== undefined && robot.price !== null ? robot.price : 1
        "
        :onConfirm="handleSubscriptionConfirm"
        :onClose="closeSubscriptionDialog"
      />
    </el-dialog>

    <!-- 删除评论确认对话框 -->
    <el-dialog
      title="删除确认"
      :visible.sync="deleteCommentDialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="closeDeleteCommentDialog"
      width="400px"
      center
    >
      <div style="text-align: center; padding: 20px 0">
        <p style="margin: 15px 0; font-size: 16px">确定要删除这条评论吗？</p>
        <div
          v-if="deleteCommentIndex >= 0 && comments[deleteCommentIndex]"
        ></div>
      </div>
      <div slot="footer" class="dialog-footer" style="text-align: center">
        <el-button @click="closeDeleteCommentDialog">取消</el-button>
        <el-button @click="executeDeleteComment">确定删除</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { fetchAgentDetail as apifetchAgentDetail } from '../utils/api';
import { subscribeAgent as apisubscribeAgent } from '../utils/api';
import { getSubscriptionCnt } from '../utils/api';
import {
  getAgentComment as apiGetAgentComment,
  sendAgentComment as apiSendAgentComment,
  deleteAgentComment as apiDeleteAgentComment,
} from '../utils/api';
import SubscriptionSelector from '@/components/SubscriptionSelector.vue';

export default {
  name: 'RobotDetailDialog',
  components: {
    SubscriptionSelector,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    robotId: {
      type: [String, Number],
      default: null,
    },
  },
  data() {
    return {
      robot: {},
      loading: false,
      isSubscriptionDialogVisible: false,
      recommendationDialogVisible: false,
      showAddCommentForm: false,
      currentRating: 5,
      newComment: {
        text: '',
        rating: 5,
      },
      // 弹窗引用计数管理
      dialogRefCount: 0,
      // 防止连带关闭的标识
      isClosingSubDialog: false,
      // 删除评论确认弹窗
      deleteCommentDialogVisible: false,
      deleteCommentIndex: -1,
      // 机器人统计信息
      robotStats: {
        rating: 0, // 初始为0，将通过评论计算
        subscriptions: 0, // 将通过API获取
        comments: 0, // 将通过评论数量设置
      },
      // 评论列表 - 从后端获取
      comments: [],
      // 模拟数据 - 推荐机器人分类
      recommendationCategories: [
        {
          type: 'similar',
          title: '相似功能机器人',
          robots: [
            {
              id: 101,
              name: 'ChatBot Pro',
              type: 1,
              description: '专业的对话机器人，支持多种语言',
              rating: 4.8,
              developer: '开发者A',
              price: 1,
            },
          ],
        },
        {
          type: 'popular',
          title: '热门推荐',
          robots: [
            {
              id: 201,
              name: 'Image Creator',
              type: 2,
              description: '强大的图像生成工具',
              rating: 4.9,
              developer: '开发者C',
              price: 1,
            },
          ],
        },
      ],
    };
  },
  computed: {
    ...mapState('user', ['isLoggedIn', 'userName', 'userId']),
    // 注释掉不再使用的subscriptionButtonText
    // subscriptionButtonText() {
    //   const subscribedRobot = this.$store.state.agent.haveSubscribed.find(
    //     (r) => r.agent_id === this.robot.id
    //   );
    //   return subscribedRobot && subscribedRobot.status
    //     ? '已订阅，查看对话历史'
    //     : '未订阅，点击订阅';
    // },
    // 计算是否应该监听点击事件（引用计数为0且没有正在关闭子弹窗时才监听）
    shouldListenToClicks() {
      return this.dialogRefCount === 0 && !this.isClosingSubDialog;
    },
    // 检查用户是否已订阅该机器人
    isUserSubscribed() {
      const subscribedRobot = this.$store.state.agent.haveSubscribed.find(
        (r) => r.agent_id === this.robot.id
      );
      return subscribedRobot && subscribedRobot.status;
    },
  },
  watch: {
    visible(newVal) {
      if (newVal && this.robotId) {
        this.fetchRobotDetail(this.robotId);
        this.loadComments(this.robotId);
        this.loadSubscriptionCount(this.robotId);
      }
      // 监听弹窗显示状态变化，添加或移除键盘事件监听
      if (newVal) {
        this.addKeyboardListener();
        this.disableBodyScroll();
      } else {
        this.removeKeyboardListener();
        this.enableBodyScroll();
      }
    },
    robotId(newVal) {
      if (newVal && this.visible) {
        this.fetchRobotDetail(newVal);
        this.loadComments(newVal);
        this.loadSubscriptionCount(newVal);
      }
    },
  },
  methods: {
    // 键盘事件监听管理
    addKeyboardListener() {
      document.addEventListener('keydown', this.handleKeyDown);
      // 添加滚轮事件监听
      document.addEventListener('wheel', this.handleWheelEvent, {
        passive: false,
      });
      // 添加触摸事件监听（移动端）
      document.addEventListener('touchmove', this.handleTouchEvent, {
        passive: false,
      });
    },
    removeKeyboardListener() {
      document.removeEventListener('keydown', this.handleKeyDown);
      // 移除滚轮事件监听
      document.removeEventListener('wheel', this.handleWheelEvent);
      // 移除触摸事件监听
      document.removeEventListener('touchmove', this.handleTouchEvent);
    },
    handleKeyDown(event) {
      // 只处理ESC键
      if (event.key === 'Escape') {
        event.preventDefault();
        this.handleEscapeKey();
      } else if (!this.shouldListenToClicks) {
        // 如果有子弹窗打开，阻止所有其他键盘事件
        event.preventDefault();
        event.stopPropagation();
      }
    },
    handleWheelEvent(event) {
      // 如果有子弹窗打开，阻止滚轮事件
      if (!this.shouldListenToClicks) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    handleTouchEvent(event) {
      // 如果有子弹窗打开，阻止触摸滚动事件
      if (!this.shouldListenToClicks) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    // 禁用body滚动
    disableBodyScroll() {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
    },
    // 恢复body滚动
    enableBodyScroll() {
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    },
    handleEscapeKey() {
      // 按照优先级顺序关闭弹窗：同级别的子弹窗（删除确认、订阅确认、推荐机器人）> 机器人详情
      if (this.deleteCommentDialogVisible) {
        this.closeDeleteCommentDialog();
      } else if (this.isSubscriptionDialogVisible) {
        this.closeSubscriptionDialog();
      } else if (this.recommendationDialogVisible) {
        this.closeRecommendations();
      } else if (this.shouldListenToClicks) {
        // 只有在没有子弹窗时才允许关闭主弹窗
        this.closeDetail();
      }
    },
    // 弹窗引用计数管理方法
    incrementDialogRef() {
      this.dialogRefCount++;
      console.log('Dialog ref count incremented:', this.dialogRefCount);
    },
    decrementDialogRef() {
      this.dialogRefCount = Math.max(0, this.dialogRefCount - 1);
      console.log('Dialog ref count decremented:', this.dialogRefCount);
    },
    closeDetail() {
      // 只有在没有子弹窗时才允许关闭
      if (this.shouldListenToClicks) {
        this.$emit('close');
      }
    },
    getRobotImage(robotImageUrl) {
      // 优先使用后端返回的图片URL
      if (robotImageUrl && robotImageUrl.trim()) {
        return robotImageUrl;
      }
      // 如果没有图片URL，返回默认图片
      return require('@/assets/images/Agents/baseAgent.png');
    },
    truncate(text, length = 50) {
      if (!text) return '';
      return text.length > length ? text.slice(0, length) + '...' : text;
    },
    formatPrice(points) {
      // 当points为0时，返回"免费"
      if (points === 0) {
        return '免费';
      }
      return `${points} 积分`;
    },
    formatRating(rating) {
      // 当rating为0时，返回"暂无评分"
      if (rating === 0) {
        return '暂无评分';
      }
      return rating.toString();
    },
    // 评论相关方法
    setRating(rating) {
      this.currentRating = rating;
      this.newComment.rating = rating;
    },
    async submitComment() {
      if (!this.newComment.text.trim()) {
        this.$message.warning('请输入评论内容');
        return;
      }

      // 检查用户是否已订阅该机器人
      if (!this.isUserSubscribed) {
        this.$message.warning('请先订阅该机器人后再发表评论');
        return;
      }

      try {
        const commentLoad = {
          agentId: this.robot.id,
          comment: this.newComment.text,
          score: this.currentRating,
        };

        const response = await apiSendAgentComment(commentLoad);

        if (response.status === 200) {
          this.$message.success('评论发布成功！');

          // 重置表单
          this.newComment.text = '';
          this.currentRating = 5;
          this.showAddCommentForm = false;

          // 重新加载评论列表
          await this.loadComments(this.robot.id);
        } else {
          this.$message.error('评论发布失败，请稍后重试');
        }
      } catch (error) {
        if (error.code === 400) {
          this.$message.error(error.message);
        } else {
          this.$message.error('评论发布失败，请稍后重试');
        }
      }
    },
    // 点赞/点踩功能已注释
    /*
    likeComment(index) {
      const comment = this.comments[index];
      if (comment.userLiked) {
        comment.likes--;
        comment.userLiked = false;
      } else {
        if (comment.userDisliked) {
          comment.dislikes--;
          comment.userDisliked = false;
        }
        comment.likes++;
        comment.userLiked = true;
      }
    },
    dislikeComment(index) {
      const comment = this.comments[index];
      if (comment.userDisliked) {
        comment.dislikes--;
        comment.userDisliked = false;
      } else {
        if (comment.userLiked) {
          comment.likes--;
          comment.userLiked = false;
        }
        comment.dislikes++;
        comment.userDisliked = true;
      }
    },
    */
    // 确认删除评论
    confirmDeleteComment(index) {
      console.log('准备删除评论，索引:', index);
      if (index < 0 || index >= this.comments.length) {
        this.$message.error('评论不存在');
        return;
      }

      const comment = this.comments[index];
      console.log('当前用户ID:', this.userId);
      console.log('评论用户ID:', comment.user_id);

      // 检查权限：只能删除自己的评论
      if (comment.user_id !== this.userId) {
        this.$message.error('您只能删除自己的评论');
        return;
      }

      this.deleteCommentIndex = index;
      this.deleteCommentDialogVisible = true;
      this.incrementDialogRef();
      console.log('删除确认弹窗已显示，引用计数:', this.dialogRefCount);
    },
    // 执行删除评论
    async executeDeleteComment() {
      if (
        this.deleteCommentIndex >= 0 &&
        this.deleteCommentIndex < this.comments.length
      ) {
        try {
          const comment = this.comments[this.deleteCommentIndex];
          const response = await apiDeleteAgentComment(comment.id);

          if (response.status === 200) {
            this.$message.success('评论删除成功！');

            // 重新加载评论列表
            await this.loadComments(this.robot.id);

            // 如果删除后没有评论了，显示提示
            if (this.comments.length === 0) {
              this.$message.info('已删除所有评论，快来添加第一条评论吧！');
            }
          } else {
            this.$message.error('评论删除失败，请稍后重试');
          }
        } catch (error) {
          console.error('删除评论失败:', error);
          this.$message.error('评论删除失败，请稍后重试');
        }
      }
      this.closeDeleteCommentDialog();
    },
    // 关闭删除确认弹窗
    closeDeleteCommentDialog() {
      this.isClosingSubDialog = true;
      this.deleteCommentDialogVisible = false;
      this.deleteCommentIndex = -1;
      this.decrementDialogRef();
      // 延迟重置标识，防止连带关闭
      setTimeout(() => {
        this.isClosingSubDialog = false;
      }, 100);
      console.log('删除确认弹窗已关闭，防连带关闭标识已设置');
    },
    handleCommentAction(command) {
      if (command.startsWith('delete-')) {
        const index = parseInt(command.split('-')[1]);

        // 验证索引有效性
        if (isNaN(index)) {
          this.$message.error('无效的评论索引');
          return;
        }

        this.confirmDeleteComment(index);
      } else {
        // 处理其他可能的评论操作
        console.log('未知的评论操作:', command);
      }
    },
    deleteComment(index) {
      // 这个方法已被 confirmDeleteComment 替代，保留以防兼容性问题
      this.confirmDeleteComment(index);
    },
    showRecommendations() {
      this.incrementDialogRef();
      this.recommendationDialogVisible = true;
      this.disableBodyScroll();
    },
    closeRecommendations() {
      this.isClosingSubDialog = true;
      this.recommendationDialogVisible = false;
      this.decrementDialogRef();
      // 延迟重置标识，防止连带关闭
      setTimeout(() => {
        this.isClosingSubDialog = false;
      }, 100);
    },
    showAnotherRobotDetail(robotId) {
      this.closeRecommendations();
      this.$emit('show-robot', robotId);
    },
    subscribeRecommendedRobot(robotId) {
      this.incrementDialogRef();
      console.log('订阅机器人ID:', robotId);
      this.$message.success(`订阅机器人 ${robotId} 成功！`);
      // 模拟订阅完成后自动关闭
      setTimeout(() => {
        this.decrementDialogRef();
      }, 1500);
    },
    formatDateTime(date) {
      // 使用ISO 8601格式，与后端API保持一致
      return date.toISOString();
    },
    openSubscriptionDialog() {
      this.incrementDialogRef();
      this.isSubscriptionDialogVisible = true;
      this.disableBodyScroll();
    },
    closeSubscriptionDialog() {
      this.isClosingSubDialog = true;
      this.isSubscriptionDialogVisible = false;
      this.decrementDialogRef();
      this.enableBodyScroll();
      // 延迟重置标识，防止连带关闭
      setTimeout(() => {
        this.isClosingSubDialog = false;
      }, 100);
    },
    async handleSubscriptionConfirm(duration, points) {
      console.log('订阅时长:', duration);
      console.log('所需积分:', points);

      // 判断是首次订阅还是续订
      if (this.isUserSubscribed) {
        await this.renewSubscription(duration);
      } else {
        await this.subscribeRobot(duration);
      }

      this.closeSubscriptionDialog();
    },
    async fetchRobotDetail(agentId) {
      this.loading = true;
      try {
        const response = await apifetchAgentDetail(agentId);
        this.robot = response.data;
        // 确保机器人对象有price属性，当price为undefined或null时默认为1，但保留0值
        if (this.robot.price === undefined || this.robot.price === null) {
          this.robot.price = 1;
        }
      } catch (error) {
        console.error('获取机器人详情失败:', error);
        this.$message.error('无法加载机器人详情');
      } finally {
        this.loading = false;
      }
    },
    async loadSubscriptionCount(agentId) {
      try {
        const response = await getSubscriptionCnt(agentId);
        if (response.status === 200) {
          this.robotStats.subscriptions = response.data.subscriptionCnt;
        }
      } catch (error) {
        console.warn('获取订阅数失败:', error);
        this.robotStats.subscriptions = 0;
      }
    },
    async subscribeRobot(Duration) {
      try {
        const currentTime = this.formatDateTime(new Date());
        const payload = {
          userId: this.$store.state.user.userId,
          agentId: this.robot.id,
          startTime: currentTime,
          duration: Duration,
          subscriptionType: 1,
        };
        console.log('请求 payload:', payload);
        const response = await apisubscribeAgent(payload);
        if (response.status === 200) {
          this.$message.success('订阅成功！');

          // 1. 更新用户订阅数据
          await this.$store.dispatch(
            'agent/fetchUserSubscriptions',
            this.$store.state.user.userId
          );

          // 2. 重新加载机器人订阅数量
          await this.loadSubscriptionCount(this.robot.id);

          // 3. 强制更新页面，确保按钮状态正确显示
          this.$forceUpdate();

          // 4. 通知父组件订阅状态已变化
          this.$emit('subscription-changed', this.robot.id);

          console.log('订阅成功!!!:', response);
          console.log(
            '订阅成功后的用户订阅列表:',
            this.$store.state.agent.haveSubscribed
          );
        } else {
          this.$message.error('订阅失败，请稍后重试。');
        }
      } catch (error) {
        console.error('订阅失败:', error);
        this.$message.error('无法订阅机器人，请稍后重试。');
      }
    },
    handleSubscription() {
      const subscribedRobot = this.$store.state.agent.haveSubscribed.find(
        (r) => r.agent_id === this.robot.id
      );

      if (subscribedRobot && subscribedRobot.status) {
        this.$router.push({
          name: 'ConversationHistory',
          params: { id: this.robot.id },
        });
      } else {
        this.openSubscriptionDialog();
      }
    },
    // 开始对话
    async startConversation() {
      const userId = this.$store.state.user?.userId;
      if (!userId) {
        this.$message.error('未获取到用户信息，请重新登录');
        return;
      }

      const payload = {
        name: this.robot.name || `chat_${Date.now()}`,
        agentId: this.robot.id,
        userId: userId,
      };
      console.log('进入会话参数:', payload);

      this.$router.push({
        path: `/chatRobot/null`,
        query: payload,
      });
    },
    // 打开续订对话框
    openRenewDialog() {
      this.incrementDialogRef();
      this.isSubscriptionDialogVisible = true;
      this.disableBodyScroll();
    },
    // 续订机器人（仿照subscribeAgent的逻辑）
    async renewSubscription(Duration) {
      try {
        const currentTime = this.formatDateTime(new Date());
        const payload = {
          userId: this.$store.state.user.userId,
          agentId: this.robot.id,
          startTime: currentTime,
          duration: Duration,
          subscriptionType: 2, // 续订类型
        };
        console.log('续订请求 payload:', payload);

        // 调用续订API（目前使用相同的subscribeAgent接口）
        const response = await apisubscribeAgent(payload);

        if (response.status === 200) {
          this.$message.success('续订成功！');

          // 1. 更新用户订阅数据
          await this.$store.dispatch(
            'agent/fetchUserSubscriptions',
            this.$store.state.user.userId
          );

          // 2. 重新加载机器人订阅数量
          await this.loadSubscriptionCount(this.robot.id);

          // 3. 强制更新页面，确保按钮状态正确显示
          this.$forceUpdate();

          // 4. 通知父组件订阅状态已变化
          this.$emit('subscription-changed', this.robot.id);

          console.log('续订成功!!!:', response);
          console.log(
            '续订成功后的用户订阅列表:',
            this.$store.state.agent.haveSubscribed
          );
        } else {
          this.$message.error('续订失败，请稍后重试。');
        }
      } catch (error) {
        console.error('续订失败:', error);
        this.$message.error('无法续订机器人，请稍后重试。');
      }
    },
    // 加载机器人评论
    async loadComments(agentId) {
      try {
        const response = await apiGetAgentComment(agentId);
        if (response.status === 200 && response.data) {
          // 后端返回的数据格式：id, user_id, userName, comment, createdAt, score
          this.comments = response.data.map((comment) => ({
            id: comment.id,
            user_id: comment.user_id,
            userName: comment.userName || '匿名用户',
            rating: comment.rating,
            text: comment.comment,
            timestamp: new Date(comment.createdAt).toLocaleString('zh-CN'),
          }));

          // 更新评论统计
          this.robotStats.comments = this.comments.length;

          // 计算平均评分
          if (this.comments.length > 0) {
            const avgRating =
              this.comments.reduce(
                (sum, comment) => sum + (comment.rating || 0),
                0
              ) / this.comments.length;
            this.robotStats.rating = Math.round(avgRating * 10) / 10; // 保留一位小数
          } else {
            // 没有评论时显示暂无评分
            this.robotStats.rating = 0;
          }
        } else {
          this.comments = [];
          this.robotStats.comments = 0;
          this.robotStats.rating = 0;
        }
      } catch (error) {
        console.error('加载评论失败:', error);
        this.comments = [];
        this.robotStats.comments = 0;
        this.robotStats.rating = 0;
      }
    },
  },
  // 组件销毁时移除键盘事件监听
  beforeDestroy() {
    this.removeKeyboardListener();
  },
};
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins.scss' as *;
@use '@/assets/styles/variables.scss' as *;

// 弹窗覆盖层样式
.robot-detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.95); // 使用完全覆盖下层
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2vh;
  overflow: hidden; // 防止滚动穿透

  // 确保完全阻止滚动穿透
  &::-webkit-scrollbar {
    display: none;
  }

  // 禁用滚动
  overscroll-behavior: contain;
  touch-action: none;
}

// 弹窗主体样式
.robot-detail-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
  max-width: 90vw;
  max-height: 90vh;
  width: 80vw;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
  transition:
    opacity 0.3s ease,
    filter 0.3s ease;

  // 当有子弹窗时的禁用状态样式
  &.content-disabled {
    opacity: 0.5;
    filter: grayscale(30%);
    pointer-events: none;
    user-select: none;
    overflow: hidden;

    // 禁用所有滚动
    * {
      overflow: hidden !important;
      pointer-events: none !important;
      user-select: none !important;
    }
  }
}

// 弹窗动画
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

// 弹窗头部样式
.robot-detail-header {
  background: linear-gradient(135deg, $accent-color, $primary-color);
  color: white;
  padding: 2vh 3vw;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;

  .robot-detail-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
  }

  .robot-detail-close {
    background: none;
    border: none;
    color: $accent-color;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5vh 1vw;
    border-radius: 12px;
    transition: background-color 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
  }
}

// 弹窗主内容区域
.robot-detail-body {
  flex: 1;
  overflow-y: auto;
  padding: 3vh 3vw;
  background-color: $background-color;
  color: $text-color;
  font-family: Arial, sans-serif;

  .robot-info-section {
    background: white;
    padding: 3vh 3vw;
    margin-bottom: 2vh;
    border-radius: 12px;
    box-shadow: $box-shadow-light;

    .robot-info-header {
      display: flex;
      gap: 2vw;
      margin-bottom: 2vh;

      .robot-detail-logo {
        width: 8vh;
        height: 8vh;
        border-radius: 12px;
        object-fit: cover;
        background: #f0f0f0;
      }

      .robot-info {
        flex: 1;

        .robot-detail-name {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1vh;
          color: $text-color;
        }

        .robot-detail-description {
          color: $text-color;
          line-height: 1.6;
          margin-bottom: 2vh;
        }

        .robot-developer {
          color: $text-color;
          margin-bottom: 2vh;
          font-size: 0.95rem;

          .developer-label {
            font-weight: 500;
            color: #666;
          }

          .developer-name {
            color: $accent-color;
            font-weight: 500;
          }
        }

        .robot-stats {
          display: flex;
          gap: 3vw;
          margin-bottom: 2vh;

          .stat-item {
            text-align: center;

            .stat-value {
              font-size: 1.2rem;
              font-weight: 600;
              color: $accent-color;
            }

            .stat-label {
              font-size: 0.9rem;
              color: $text-color;
            }
          }
        }

        .robot-detail-actions {
          display: flex;
          gap: 1.5vw;

          .action-btn {
            padding: 1.5vh 2.5vw;
            border-radius: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;

            &.primary {
              background: $accent-color;
              color: white;
              border: none;

              &:hover {
                background: $accent-hover-color;
              }
            }

            &.secondary {
              background: white;
              color: $text-color;
              border: 1px solid $border-color;

              &:hover {
                background: #f5f5f5;
              }
            }

            // 新增：禁用状态（未订阅按钮）
            &.disabled {
              background: #f8f9fa;
              color: #6c757d;
              border: 1px solid #dee2e6;
              cursor: not-allowed;

              &:hover {
                background: #f8f9fa;
                color: #6c757d;
              }
            }

            // 新增：开始对话按钮
            &.start-chat {
              background: #17a2b8;
              color: white;
              border: 1px solid #17a2b8;

              &:hover {
                background: #138496;
                border-color: #117a8b;
              }
            }

            // 新增：续订按钮
            &.renew {
              background: $accent-color;
              color: white;
              border: none;

              &:hover {
                background: #138496;
                border-color: #117a8b;
              }
            }
          }
        }
      }
    }
  }

  .comments-section {
    background: white;
    padding: 3vh 3vw;
    border-radius: 12px;
    box-shadow: $box-shadow-light;

    .comments-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2vh;

      .comments-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: $text-color;
      }

      .add-comment-btn {
        background: $accent-color;
        color: white;
        border: none;
        padding: 1vh 1.5vw;
        border-radius: 12px;
        cursor: pointer;
      }
    }

    .add-comment-form {
      border: 1px solid $border-color;
      border-radius: 12px;
      padding: 2vh 2vw;
      margin-bottom: 2vh;
      background: #f8f9fa;

      .comment-form-group {
        margin-bottom: 1.5vh;

        .comment-form-label {
          display: block;
          margin-bottom: 0.5vh;
          font-weight: 500;
          color: $text-color;
        }

        .rating-input {
          display: flex;
          gap: 0.5vw;
          margin-top: 0.5vh;

          .rating-star {
            color: #ddd;
            font-size: 1.2rem;
            cursor: pointer;
            transition: color 0.2s;

            &.active,
            &:hover {
              color: #ffc107;
            }
          }
        }

        .comment-input {
          width: 100%;
          padding: 1vh 1vw;
          border: 1px solid $border-color;
          border-radius: 12px;
          font-size: 0.9rem;
          resize: vertical;
          min-height: 8vh;
        }
      }

      .comment-form-actions {
        display: flex;
        gap: 1vw;
        justify-content: flex-end;

        .el-button {
          padding: 1vh 1.5vw;
          border-radius: 12px;
          font-size: 0.9rem;
        }
      }
    }

    .comments-list {
      .comment-item {
        border-bottom: 1px solid #f0f0f0;
        padding: 2vh 0;

        &:last-child {
          border-bottom: none;
        }

        .comment-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1vh;

          .comment-user {
            font-weight: 500;
            color: $text-color;
          }

          .comment-rating {
            color: #ffc107;
          }

          .comment-menu {
            position: relative;
            margin-left: auto;

            .comment-delete-btn {
              background: none;
              border: none;
              color: #999;
              cursor: pointer;
              padding: 0.5vh;
              border-radius: 12px;
              width: 3vh;
              height: 3vh;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.3s ease;

              &:hover {
                background: #ffe6e6;
                color: #f56c6c;
                transform: scale(1.1);
              }

              &:active {
                transform: scale(0.95);
              }

              i {
                font-size: 1rem;
              }
            }
          }
        }

        .comment-text {
          color: $text-color;
          line-height: 1.6;
          margin-bottom: 1vh;
        }

        .comment-actions {
          display: flex;
          gap: 1.5vw;

          /* 点赞/点踩功能相关样式已注释
          .comment-action {
            background: none;
            border: none;
            color: $text-color;
            cursor: pointer;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 0.5vw;

            &:hover {
              color: $text-color;
            }

            &.liked {
              color: #007bff;
            }

            &.disliked {
              color: #dc3545;
            }
          }
          */
        }
      }
    }

    .no-comments {
      text-align: center;
      color: $text-color;
      padding: 4vh;
      font-style: italic;
    }
  }
}

.recommendation-content {
  .recommendation-section {
    margin-bottom: 3vh;

    &:last-child {
      margin-bottom: 0;
    }

    .recommendation-category-title {
      font-size: 1.1rem;
      color: $text-color;
      font-weight: 600;
      margin-bottom: 1.5vh;
      padding-bottom: 1vh;
      border-bottom: 2px solid $accent-color;
    }

    .recommendation-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(25vw, 1fr));
      gap: 1.5vh;

      .recommendation-card {
        cursor: pointer;
        transition: all 0.3s ease;
        border: 1px solid $border-color;
        padding: 1.5vh 1.5vw;
        border-radius: 12px;

        &:hover {
          transform: translateY(-2px);
          box-shadow: $box-shadow-medium;
        }

        .recommendation-card-header {
          display: flex;
          align-items: center;
          gap: 1vw;
          margin-bottom: 1vh;

          .recommendation-card-logo {
            width: 4vh;
            height: 4vh;
            border-radius: 12px;
            object-fit: cover;
          }

          .recommendation-card-info {
            flex: 1;

            .recommendation-card-name {
              font-size: 0.9rem;
              font-weight: 600;
              color: $text-color;
              margin-bottom: 0.2vh;
            }

            .recommendation-card-developer {
              font-size: 0.8rem;
              color: $text-color;
            }
          }
        }

        .recommendation-card-description {
          color: $text-color;
          font-size: 0.8rem;
          line-height: 1.4;
          margin-bottom: 1.5vh;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .recommendation-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .recommendation-card-stats {
            .recommendation-card-rating {
              display: flex;
              align-items: center;
              gap: 0.5vw;
              color: #ffc107;
              font-size: 0.8rem;
              margin-bottom: 0.5vh;
            }

            .recommendation-card-points {
              display: flex;
              align-items: center;
              gap: 0.5vw;
              color: #f39c12;
              font-size: 0.8rem;
            }
          }

          .recommendation-card-btn {
            background: $accent-color;
            color: white;
            border: none;
            padding: 0.5vh 1vw;
            border-radius: 12px;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              background: $accent-hover-color;
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .robot-detail-content {
    width: 95vw;
    max-height: 95vh;
  }

  .robot-detail-header {
    padding: 1.5vh 2vw;

    .robot-detail-title {
      font-size: 1.2rem;
    }

    .robot-detail-close {
      width: 3.5vh;
      height: 3.5vh;
    }
  }

  .robot-detail-body {
    padding: 2vh 2vw;

    .robot-info-section {
      padding: 2vh 2vw;

      .robot-info-header {
        flex-direction: column;
        text-align: center;
        gap: 1.5vh;

        .robot-detail-logo {
          align-self: center;
          width: 6vh;
          height: 6vh;
        }

        .robot-info {
          .robot-stats {
            justify-content: center;
            gap: 2vw;
          }

          .robot-detail-actions {
            flex-direction: column;
            align-items: center;
            gap: 1vh;

            .action-btn {
              width: 100%;
              max-width: 50vw;
            }
          }
        }
      }
    }

    .comments-section {
      padding: 2vh 2vw;

      .comments-header {
        flex-direction: column;
        gap: 1vh;
        align-items: stretch;
      }
    }
  }

  .recommendation-content {
    .recommendation-section {
      .recommendation-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
