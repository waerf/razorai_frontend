<template>
  <div class="admin-dashboard">
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card
        class="stat-card"
        shadow="hover"
        style="cursor: pointer"
        @click.native="handleStatCardClick('/admin/review')"
      >
        <div class="stat-content">
          <div>
            <p class="stat-label">待审核机器人</p>
            <p class="stat-value">{{ pendingRobotsTotal }}</p>
          </div>
          <div class="stat-icon">
            <i class="el-icon-cpu"></i>
          </div>
        </div>
      </el-card>

      <el-card
        class="stat-card"
        shadow="hover"
        style="cursor: pointer"
        @click.native="handleStatCardClick('/admin/posts')"
      >
        <div class="stat-content">
          <div>
            <p class="stat-label">待审核帖子和评论</p>
            <p class="stat-value">
              {{ pendingPostsTotal + pendingCommentsTotal }}
            </p>
          </div>
          <div class="stat-icon">
            <i class="el-icon-document"></i>
          </div>
        </div>
      </el-card>

      <el-card
        class="stat-card"
        shadow="hover"
        style="cursor: pointer"
        @click.native="handleStatCardClick('/admin/feedback')"
      >
        <div class="stat-content">
          <div>
            <p class="stat-label">未处理反馈</p>
            <p class="stat-value">{{ feedbackTotal }}</p>
          </div>
          <div class="stat-icon">
            <i class="el-icon-chat-dot-round"></i>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 内容区域 -->
    <div class="content-grid">
      <!-- 待审核机器人 -->
      <el-card class="content-card" shadow="hover">
        <div class="card-header">
          <h2 class="card-title">待审核机器人</h2>
          <el-link
            type="primary"
            :underline="false"
            @click="$router.push('/admin/review')"
            >查看全部</el-link
          >
        </div>

        <div class="items-list">
          <div
            class="item"
            v-for="item in pendingRobots"
            :key="item.id"
            @click="navigateToRobotDetail(item)"
            style="cursor: pointer"
          >
            <div class="item-header">
              <p class="item-name">{{ item.name }}</p>
              <p class="item-time">{{ formatTime(item.time) }}</p>
            </div>
            <el-tag :type="item.status === 'pending' ? 'warning' : 'success'">
              {{ item.status === 'pending' ? '待审核' : '已通过' }}
            </el-tag>
          </div>
        </div>
      </el-card>

      <!-- 待审核帖子和评论 -->
      <el-card class="content-card" shadow="hover">
        <div class="card-header">
          <h2 class="card-title">待审核帖子和评论</h2>
          <el-link
            type="primary"
            :underline="false"
            @click="$router.push('/admin/posts')"
            >查看全部</el-link
          >
        </div>

        <div class="items-list">
          <div
            class="item"
            v-for="item in combinedPendingItems.slice(0, 3)"
            :key="item.id"
            @click="navigateToDetail(item)"
            style="cursor: pointer"
          >
            <div class="item-header">
              <p class="item-name">{{ item.name }}</p>
              <p class="item-time">{{ formatTime(item.time) }}</p>
            </div>
            <el-tag type="warning">{{
              item.type === 'post' ? '帖子' : '评论'
            }}</el-tag>
          </div>
        </div>
      </el-card>

      <!-- 最新用户反馈 -->
      <el-card class="content-card" shadow="hover">
        <div class="card-header">
          <h2 class="card-title">最新用户反馈</h2>
          <el-link
            type="primary"
            :underline="false"
            @click="$router.push('/admin/feedback')"
            >查看全部</el-link
          >
        </div>

        <div class="feedback-grid">
          <div
            class="feedback-item"
            v-for="feedback in recentFeedbacks"
            :key="feedback.id"
            @click="navigateToFeedbackDetail(feedback)"
            style="cursor: pointer"
          >
            <div class="feedback-header">
              <p class="feedback-user">{{ feedback.user }}</p>
              <p class="feedback-time">{{ formatTime(feedback.time) }}</p>
            </div>
            <p class="feedback-content">{{ feedback.content }}</p>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import {
  getPendingRobots,
  fetchRecentFeedbacks,
  fetchAllFeedbacks,
  getPostReportList,
  getCommentReportList,
} from '@/utils/api';

export default {
  name: 'AdminHomePage',
  inject: {
    adminInfo: {
      default: () => ({}),
    },
  },
  computed: {
    combinedPendingItems() {
      // 合并帖子和评论，按时间排序
      const combined = [...this.pendingPosts, ...this.pendingComments];
      return combined.sort((a, b) => {
        return new Date(b.time) - new Date(a.time);
      });
    },
  },
  data() {
    return {
      pendingRobots: [],
      pendingRobotsLoading: false,
      pendingRobotsTotal: 0,
      pendingPosts: [],
      pendingPostsTotal: 0,
      pendingComments: [],
      pendingCommentsTotal: 0,
      recentFeedbacks: [],
      feedbackTotal: 0,
    };
  },
  methods: {
    formatTime(time) {
      if (!time) return '';
      const d = new Date(time);
      return d.toLocaleString();
    },
    handleStatCardClick(path) {
      this.$router.push(path);
    },
    navigateToDetail(item) {
      if (item.type === 'post') {
        this.$router.push({
          name: 'AdminPostReviewDetail',
          params: { id: item.id },
        });
      } else {
        this.$router.push({
          name: 'AdminCommentReviewDetail',
          params: { id: item.id },
        });
      }
    },
    navigateToRobotDetail(robot) {
      this.$router.push({
        name: 'AdminRobotReviewDetail',
        params: { id: robot.id },
      });
    },
    navigateToFeedbackDetail(feedback) {
      if (feedback && feedback.id) {
        this.$router.push({
          name: 'AdminFeedbackDetail',
          params: {
            userId: feedback.userId || 'unknown',
            feedbackId: feedback.id,
          },
        });
      }
    },
    async fetchPendingRobots() {
      this.pendingRobotsLoading = true;
      try {
        const res = await getPendingRobots({ page: 1, pageSize: 3 });
        if (res.data && res.data.success) {
          this.pendingRobots = res.data.data.map((robot) => ({
            id: robot.auditId,
            name: robot.name,
            time: robot.createdAt,
            status: 'pending',
          }));
          this.pendingRobotsTotal =
            res.data.pagination?.totalCount || this.pendingRobots.length;
        } else {
          this.$message.error(res.data.message || '获取待审核机器人失败');
        }
      } catch (err) {
        this.$message.error(err.message || '获取待审核机器人失败');
      }
      this.pendingRobotsLoading = false;
    },
    async fetchPendingPosts() {
      try {
        const res = await getPostReportList({
          status: 0,
          page: 1,
          pageSize: 100,
        });
        if (res.data && res.data.success) {
          this.pendingPosts = res.data.data.map((item) => {
            let postTitle = '未知帖子';
            if (item.postTitle) {
              try {
                const titleObj = JSON.parse(item.postTitle);
                postTitle = titleObj.title || '未知帖子';
              } catch (e) {
                postTitle = item.postTitle;
              }
            }
            return {
              id: item.reportId || item.id,
              name: postTitle,
              time: item.createdAt || '',
              type: 'post',
            };
          });
          this.pendingPostsTotal = res.data.data.length;
        } else {
          this.pendingPosts = [];
          this.pendingPostsTotal = 0;
        }
      } catch (err) {
        this.pendingPosts = [];
        this.pendingPostsTotal = 0;
      }
    },
    async fetchPendingComments() {
      try {
        const res = await getCommentReportList({
          status: 0,
          page: 1,
          pageSize: 100,
        });
        if (res.data && res.data.success) {
          this.pendingComments = res.data.data.map((item) => {
            return {
              id: item.reportId || item.id,
              name: item.commentContent
                ? item.commentContent.length > 30
                  ? `${item.commentContent.substring(0, 30)}...`
                  : item.commentContent
                : '未知评论',
              time: item.createdAt || '',
              type: 'comment',
            };
          });
          this.pendingCommentsTotal = res.data.data.length;
        } else {
          this.pendingComments = [];
          this.pendingCommentsTotal = 0;
        }
      } catch (err) {
        this.pendingComments = [];
        this.pendingCommentsTotal = 0;
      }
    },
    async fetchRecentFeedbacks() {
      try {
        const res = await fetchRecentFeedbacks();
        if (res && res.data && Array.isArray(res.data.feedbacks)) {
          this.recentFeedbacks = res.data.feedbacks.map((fb) => ({
            id: fb.id,
            userId: fb.userId,
            user: fb.userName || `用户${fb.userId}`,
            time: fb.time,
            content: fb.feedback,
          }));
        } else {
          this.recentFeedbacks = [];
        }
      } catch (err) {
        this.recentFeedbacks = [];
        this.$message.error(err.message || '获取最新用户反馈失败');
      }
    },
    async fetchAllFeedbackTotal() {
      try {
        const res = await fetchAllFeedbacks();
        if (res && res.data && Array.isArray(res.data.feedbacks)) {
          this.feedbackTotal = res.data.feedbacks.filter(
            (fb) => !fb.state || fb.state === '0'
          ).length;
        } else {
          this.feedbackTotal = 0;
        }
      } catch (err) {
        this.feedbackTotal = 0;
      }
    },
  },
  mounted() {
    this.fetchPendingRobots();
    this.fetchRecentFeedbacks();
    this.fetchAllFeedbackTotal();
    this.fetchPendingPosts();
    this.fetchPendingComments();
  },
};
</script>

<style lang="scss" scoped>
// 全局卡片圆角统一
:deep(.el-card) {
  border-radius: 12px !important;
}

.admin-dashboard {
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 24px;

    .stat-card {
      border-radius: 12px !important;

      .stat-content {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .stat-label {
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: bold;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: #e8f3ff;
          color: #165dff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
      }
    }
  }

  .content-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    .content-card {
      border-radius: 12px !important;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .card-title {
          font-size: 18px;
          font-weight: 600;
        }
      }

      .items-list {
        .item {
          padding: 12px;
          border: 1px solid #f0f0f0;
          border-radius: 12px;
          margin-bottom: 8px;

          .item-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;

            .item-name {
              font-weight: 500;
            }

            .item-time {
              font-size: 12px;
              color: #999;
            }
          }
        }
      }

      .feedback-grid {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .feedback-item {
          padding: 10px;
          border: 1px solid #f0f0f0;
          border-radius: 12px;

          .feedback-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;

            .feedback-user {
              font-weight: 500;
            }

            .feedback-time {
              font-size: 12px;
              color: #999;
            }
          }

          .feedback-content {
            font-size: 14px;
            color: #666;
          }
        }
      }
    }
  }
}
</style>
