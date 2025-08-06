<template>
  <div class="robot-detail-page" v-loading="loading">
    <!-- 机器人信息区域 -->
    <div class="robot-info-section">
      <div class="robot-info-header">
        <img
          :src="getRobotImage(robot.type)"
          alt="Robot Icon"
          class="robot-detail-logo"
        />
        <div class="robot-info">
          <h1 class="robot-detail-name">{{ robot.name || '机器人名称' }}</h1>
          <p class="robot-detail-description">
            {{
              robot.description ||
              '这是一个功能强大的AI机器人，可以帮助您完成各种任务。'
            }}
          </p>
          <div class="robot-stats">
            <div class="stat-item">
              <div class="stat-value">{{ robotStats.rating }}</div>
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
          </div>
          <div class="robot-detail-actions">
            <el-button
              type="primary"
              class="action-btn primary"
              @click="handleSubscription"
            >
              {{ subscriptionButtonText }}
            </el-button>
            <el-button
              class="action-btn secondary"
              @click="showRecommendations"
            >
              推荐相似机器人
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 评论区 -->
    <div class="comments-section">
      <div class="comments-header">
        <h3 class="comments-title">用户评论 ({{ comments.length }})</h3>
        <el-button
          v-if="isLoggedIn"
          type="primary"
          class="add-comment-btn"
          @click="showAddCommentForm = !showAddCommentForm"
        >
          添加评论
        </el-button>
      </div>

      <!-- 添加评论表单 -->
      <div v-if="showAddCommentForm && isLoggedIn" class="add-comment-form">
        <div class="comment-form-group">
          <label class="comment-form-label">评分</label>
          <div class="rating-input">
            <i
              v-for="star in 5"
              :key="star"
              class="el-icon-star-on rating-star"
              :class="{ active: star <= currentRating }"
              @click="setRating(star)"
              @mouseover="setRating(star)"
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
          <el-button type="primary" @click="submitComment">提交评论</el-button>
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
                :style="{ color: star <= comment.rating ? '#ffc107' : '#ddd' }"
              ></i>
            </div>
            <div class="comment-menu">
              <el-dropdown
                @command="handleCommentAction"
                trigger="click"
                v-if="comment.userId === userId"
              >
                <span class="comment-menu-btn">
                  <i class="el-icon-more"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :command="`delete-${index}`">
                    删除评论
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </div>
          <div class="comment-text">{{ comment.text }}</div>
          <div class="comment-actions">
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
          </div>
        </div>
      </div>

      <!-- 无评论提示 -->
      <div v-if="comments.length === 0" class="no-comments">
        暂无评论，快来添加第一条评论吧！
      </div>
    </div>

    <!-- 推荐机器人弹窗 -->
    <el-dialog
      title="推荐相似机器人"
      :visible.sync="recommendationDialogVisible"
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
              @click.native="goToRobotDetail(recRobot.id)"
            >
              <div class="recommendation-card-header">
                <img
                  :src="getRobotImage(recRobot.type)"
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
      width="400px"
      center
    >
      <subscription-selector
        :robotId="robot.id"
        :onConfirm="handleSubscriptionConfirm"
        :onClose="() => (isSubscriptionDialogVisible = false)"
      />
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { fetchAgentDetail as apifetchAgentDetail } from '../utils/api';
import { subscribeAgent as apisubscribeAgent } from '../utils/api';
import SubscriptionSelector from '@/components/SubscriptionSelector.vue';

export default {
  name: 'RobotDetailPage',
  components: {
    SubscriptionSelector,
  },
  data() {
    return {
      robot: {},
      robotType: {
        1: '文本对话机器人',
        2: '图片生成机器人',
        3: '音视频机器人',
      },
      loading: true,
      isSubscriptionDialogVisible: false,
      recommendationDialogVisible: false,
      showAddCommentForm: false,
      currentRating: 5,
      newComment: {
        text: '',
        rating: 5,
      },
      // *&* 模拟数据 - 机器人统计信息
      robotStats: {
        rating: 4.7,
        subscriptions: 1234,
        comments: 89,
      },
      // *&* 模拟数据 - 评论列表
      comments: [
        {
          id: 1,
          userName: '用户A',
          userId: 'user1',
          rating: 5,
          text: '这个机器人非常好用，回答问题很准确，强烈推荐！',
          likes: 15,
          dislikes: 2,
          userLiked: false,
          userDisliked: false,
          timestamp: '2024-01-15 14:30',
        },
        {
          id: 2,
          userName: '用户B',
          userId: 'user2',
          rating: 4,
          text: '功能很强大，但有时候响应速度有点慢，总体还是不错的。',
          likes: 8,
          dislikes: 1,
          userLiked: false,
          userDisliked: false,
          timestamp: '2024-01-14 09:15',
        },
        {
          id: 3,
          userName: '用户C',
          userId: 'user3',
          rating: 5,
          text: '界面友好，操作简单，是我用过最好的AI助手之一。',
          likes: 12,
          dislikes: 0,
          userLiked: false,
          userDisliked: false,
          timestamp: '2024-01-13 16:45',
        },
      ],
      // *&* 模拟数据 - 推荐机器人分类
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
            },
            {
              id: 102,
              name: 'Smart Assistant',
              type: 1,
              description: '智能助手，可以帮您处理日常事务',
              rating: 4.6,
              developer: '开发者B',
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
            },
            {
              id: 202,
              name: 'Video AI',
              type: 3,
              description: '视频处理和生成专家',
              rating: 4.7,
              developer: '开发者D',
            },
          ],
        },
      ],
    };
  },
  computed: {
    ...mapState('user', ['isLoggedIn', 'userName', 'userId']),
    subscriptionButtonText() {
      const subscribedRobot = this.$store.state.agent.haveSubscribed.find(
        (r) => r.agent_id === this.robot.id
      );
      return subscribedRobot && subscribedRobot.status
        ? '已订阅，查看对话历史'
        : '未订阅，点击订阅';
    },
  },
  created() {
    const agentId = this.$route.params.id;
    if (!agentId) {
      this.$message.error('无法获取机器人信息');
      this.$router.push('/');
    } else {
      this.fetchRobotDetail(agentId);
    }
  },
  methods: {
    getRobotImage(type) {
      switch (type) {
        case 1:
          return require('@/assets/images/Agents/textAgent.png');
        case 2:
          return require('@/assets/images/Agents/imageAgent.png');
        case 3:
          return require('@/assets/images/Agents/videoAgent.png');
        default:
          return require('@/assets/images/Agents/baseAgent.png');
      }
    },
    truncate(text, length = 50) {
      if (!text) return '';
      return text.length > length ? text.slice(0, length) + '...' : text;
    },
    // *&* 评论相关方法 - 后端接口待实现
    setRating(rating) {
      this.currentRating = rating;
      this.newComment.rating = rating;
    },
    async submitComment() {
      if (!this.newComment.text.trim()) {
        this.$message.warning('请输入评论内容');
        return;
      }

      // *&* 模拟添加评论 - 实际需要调用后端API
      const newComment = {
        id: Date.now(),
        userName: this.userName || '当前用户',
        userId: this.userId,
        rating: this.currentRating,
        text: this.newComment.text,
        likes: 0,
        dislikes: 0,
        userLiked: false,
        userDisliked: false,
        timestamp: new Date().toLocaleString(),
      };

      this.comments.unshift(newComment);
      this.robotStats.comments = this.comments.length;

      // 重置表单
      this.newComment.text = '';
      this.currentRating = 5;
      this.showAddCommentForm = false;

      this.$message.success('评论添加成功！');
    },
    likeComment(index) {
      // *&* 模拟点赞功能 - 实际需要调用后端API
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
      // *&* 模拟踩功能 - 实际需要调用后端API
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
    handleCommentAction(command) {
      if (command.startsWith('delete-')) {
        const index = parseInt(command.split('-')[1]);
        this.deleteComment(index);
      }
    },
    deleteComment(index) {
      // *&* 模拟删除评论 - 实际需要调用后端API
      this.$confirm('确定要删除这条评论吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.comments.splice(index, 1);
          this.robotStats.comments = this.comments.length;
          this.$message.success('评论删除成功！');
        })
        .catch(() => {
          // 用户取消删除
        });
    },
    showRecommendations() {
      this.recommendationDialogVisible = true;
    },
    goToRobotDetail(robotId) {
      this.$router.push({ name: 'RobotDetail', params: { id: robotId } });
      this.recommendationDialogVisible = false;
    },
    subscribeRecommendedRobot(robotId) {
      // *&* 模拟订阅推荐机器人 - 实际需要调用后端API
      console.log('订阅机器人ID:', robotId);
      this.$message.success(`订阅机器人 ${robotId} 成功！`);
    },
    formatDateTime(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
    openSubscriptionDialog() {
      this.isSubscriptionDialogVisible = true; // 打开弹窗
    },
    async handleSubscriptionConfirm(duration, points) {
      console.log('订阅时长:', duration);
      console.log('所需积分:', points);
      // 这里可以添加积分检查逻辑

      // 调用订阅方法
      await this.subscribeRobot(duration);
    },
    async fetchRobotDetail(agentId) {
      try {
        const response = await apifetchAgentDetail(agentId);
        this.robot = response.data;
        this.loading = false; // 加载完成
      } catch (error) {
        console.error('获取机器人详情失败:', error);
        this.$message.error('无法加载机器人详情');
      }
    },
    async subscribeRobot(Duration) {
      try {
        const currentTime = this.formatDateTime(new Date()); // 格式化当前时间
        // 构造 payload
        const payload = {
          user_id: this.$store.state.user.userId,
          agent_id: this.robot.id,
          startime: currentTime, // 使用格式化后的时间
          duration: Duration,
        };
        console.log('请求 payload:', payload);
        const response = await apisubscribeAgent(payload);
        if (response.status === 200) {
          this.$message.success('订阅成功！');
          // 订阅成功后，重新获取用户订阅列表
          this.$store.dispatch(
            'agent/fetchUserSubscriptions',
            this.$store.state.user.userId
          );
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
        // 已订阅，跳转到查看对话历史页面
        this.$router.push({
          name: 'ConversationHistory',
          params: { id: this.robot.id },
        });
      } else {
        // 未订阅，打开订阅弹窗
        this.openSubscriptionDialog();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins.scss' as *;
@use '@/assets/styles/variables.scss' as *;

.robot-detail-page {
  background-color: $background-color;
  color: $text-color;
  padding: 20px;
  font-family: Arial, sans-serif;
  min-height: 100vh;

  .robot-info-section {
    background: white;
    padding: 30px;
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: $box-shadow-light;

    .robot-info-header {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;

      .robot-detail-logo {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        object-fit: cover;
        background: #f0f0f0;
      }

      .robot-info {
        flex: 1;

        .robot-detail-name {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 10px;
          color: $text-color;
        }

        .robot-detail-description {
          color: $secondary-color;
          line-height: 1.6;
          margin-bottom: 15px;
        }

        .robot-stats {
          display: flex;
          gap: 30px;
          margin-bottom: 20px;

          .stat-item {
            text-align: center;

            .stat-value {
              font-size: 1.2rem;
              font-weight: 600;
              color: $accent-color;
            }

            .stat-label {
              font-size: 0.9rem;
              color: $secondary-color;
            }
          }
        }

        .robot-detail-actions {
          display: flex;
          gap: 15px;

          .action-btn {
            padding: 12px 24px;
            border-radius: 6px;
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
          }
        }
      }
    }
  }

  .comments-section {
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: $box-shadow-light;

    .comments-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;

      .comments-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: $text-color;
      }

      .add-comment-btn {
        background: $accent-color;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
      }
    }

    .add-comment-form {
      border: 1px solid $border-color;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      background: #f8f9fa;

      .comment-form-group {
        margin-bottom: 15px;

        .comment-form-label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: $text-color;
        }

        .rating-input {
          display: flex;
          gap: 5px;
          margin-top: 5px;

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
          padding: 10px;
          border: 1px solid $border-color;
          border-radius: 4px;
          font-size: 0.9rem;
          resize: vertical;
          min-height: 80px;
        }
      }

      .comment-form-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;

        .el-button {
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 0.9rem;
        }
      }
    }

    .comments-list {
      .comment-item {
        border-bottom: 1px solid #f0f0f0;
        padding: 20px 0;

        &:last-child {
          border-bottom: none;
        }

        .comment-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;

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

            .comment-menu-btn {
              background: none;
              border: none;
              color: $secondary-color;
              cursor: pointer;
              padding: 5px;
              border-radius: 50%;
              width: 30px;
              height: 30px;
              display: flex;
              align-items: center;
              justify-content: center;

              &:hover {
                background: #f5f5f5;
              }
            }
          }
        }

        .comment-text {
          color: $secondary-color;
          line-height: 1.6;
          margin-bottom: 10px;
        }

        .comment-actions {
          display: flex;
          gap: 15px;

          .comment-action {
            background: none;
            border: none;
            color: $secondary-color;
            cursor: pointer;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 4px;

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
        }
      }
    }

    .no-comments {
      text-align: center;
      color: $secondary-color;
      padding: 40px;
      font-style: italic;
    }
  }

  .recommendation-content {
    .recommendation-section {
      margin-bottom: 30px;

      &:last-child {
        margin-bottom: 0;
      }

      .recommendation-category-title {
        font-size: 1.1rem;
        color: $text-color;
        font-weight: 600;
        margin-bottom: 15px;
        padding-bottom: 8px;
        border-bottom: 2px solid $accent-color;
      }

      .recommendation-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 15px;

        .recommendation-card {
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid $border-color;

          &:hover {
            transform: translateY(-2px);
            box-shadow: $box-shadow-medium;
          }

          .recommendation-card-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;

            .recommendation-card-logo {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              object-fit: cover;
            }

            .recommendation-card-info {
              flex: 1;

              .recommendation-card-name {
                font-size: 0.9rem;
                font-weight: 600;
                color: $text-color;
                margin-bottom: 2px;
              }

              .recommendation-card-developer {
                font-size: 0.8rem;
                color: $secondary-color;
              }
            }
          }

          .recommendation-card-description {
            color: $secondary-color;
            font-size: 0.8rem;
            line-height: 1.4;
            margin-bottom: 15px;
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
                gap: 4px;
                color: #ffc107;
                font-size: 0.8rem;
              }
            }

            .recommendation-card-btn {
              background: $accent-color;
              color: white;
              border: none;
              padding: 4px 12px;
              border-radius: 4px;
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
}

@media (max-width: 768px) {
  .robot-detail-page {
    padding: 10px;

    .robot-info-section {
      padding: 20px;

      .robot-info-header {
        flex-direction: column;
        text-align: center;

        .robot-detail-logo {
          align-self: center;
        }

        .robot-info {
          .robot-stats {
            justify-content: center;
            gap: 20px;
          }

          .robot-detail-actions {
            flex-direction: column;
            align-items: center;

            .action-btn {
              width: 100%;
              max-width: 200px;
            }
          }
        }
      }
    }

    .comments-section {
      padding: 20px;

      .comments-header {
        flex-direction: column;
        gap: 10px;
        align-items: stretch;
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
}
</style>
