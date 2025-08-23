<template>
  <div class="feedback-detail-container">
    <div v-if="loading" class="feedback-loading">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-line"></div>
      <div class="skeleton skeleton-line"></div>
      <div class="skeleton skeleton-line"></div>
    </div>
    <div v-else-if="feedbackDetail" class="feedback-detail-card">
      <div class="feedback-header">
        <div class="avatar-placeholder">
          {{
            feedbackDetail.userName ? feedbackDetail.userName.charAt(0) : '匿'
          }}
        </div>
        <div class="feedback-user-info">
          <div class="feedback-username">
            {{ feedbackDetail.userName || '匿名用户' }}
          </div>
          <div class="feedback-time">{{ formatTime(feedbackDetail.time) }}</div>
        </div>
      </div>
      <div class="feedback-content">
        <span
          class="feedback-state"
          :class="{ processed: feedbackDetail.state === 1 }"
        >
          {{ feedbackDetail.state === 1 ? '已处理' : '未处理' }}
        </span>
        <p>{{ feedbackDetail.feedback }}</p>
        <div v-if="feedbackDetail.state !== 1" style="margin-top: 16px">
          <button @click="handleProcessFeedback" class="process-btn">
            标记为已处理
          </button>
        </div>
      </div>
    </div>
    <div v-else class="feedback-empty">
      <div v-if="errorMsg" style="color: #e74c3c; margin-bottom: 12px">
        {{ errorMsg }}
      </div>
      暂无反馈详情
    </div>
  </div>
</template>

<script>
import { fetchUserFeedbacks, updateFeedbackState } from '@/utils/api';

export default {
  name: 'AdminFeedbackDetail',
  props: {
    userId: {
      type: [String, Number],
      required: false,
      default: null,
    },
    feedbackId: {
      type: [String, Number],
      required: false,
      default: null,
    },
  },
  data() {
    return {
      feedbackDetail: null,
      loading: true,
      errorMsg: '',
    };
  },
  computed: {
    resolvedUserId() {
      // 优先用 props，否则用路由参数
      return this.userId !== null && this.userId !== undefined
        ? this.userId
        : this.$route.params.userId;
    },
    resolvedFeedbackId() {
      return this.feedbackId !== null && this.feedbackId !== undefined
        ? this.feedbackId
        : this.$route.params.feedbackId;
    },
  },
  methods: {
    async loadFeedbackDetail() {
      this.loading = true;
      const userId = this.resolvedUserId;
      const feedbackId = this.resolvedFeedbackId;
      if (
        userId === undefined ||
        userId === null ||
        userId === '' ||
        isNaN(Number(userId)) ||
        feedbackId === undefined ||
        feedbackId === null ||
        feedbackId === '' ||
        isNaN(Number(feedbackId))
      ) {
        this.errorMsg = '用户ID或反馈ID无效，无法获取反馈详情';
        this.feedbackDetail = null;
        this.loading = false;
        return;
      }
      try {
        const res = await fetchUserFeedbacks(userId);
        if (res && res.data && Array.isArray(res.data.feedbacks)) {
          this.feedbackDetail = res.data.feedbacks.find(
            (f) => f.id == feedbackId
          );
        }
      } catch (e) {
        this.errorMsg = e.message || '获取反馈详情失败';
      } finally {
        this.loading = false;
      }
    },
    async handleProcessFeedback() {
      if (!this.feedbackDetail || this.feedbackDetail.state === 1) return;
      try {
        await updateFeedbackState(this.feedbackDetail.id);
        this.$message && this.$message.success
          ? this.$message.success('反馈已标记为已处理')
          : alert('反馈已标记为已处理');
        this.feedbackDetail.state = 1;
      } catch (e) {
        this.$message && this.$message.error
          ? this.$message.error(e.message || '处理失败')
          : alert(e.message || '处理失败');
      }
    },
    formatTime(time) {
      if (!time) return '';
      const d = new Date(time);
      return d.toLocaleString();
    },
  },
  mounted() {
    this.loadFeedbackDetail();
  },
};
</script>

<style scoped>
.feedback-detail-container {
  max-width: 600px;
  margin: 40px auto;
}
.feedback-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}
.avatar-placeholder {
  width: 48px;
  height: 48px;
  background: #eee;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #888;
  margin-right: 16px;
}
.feedback-user-info {
  margin-left: 16px;
}
.feedback-username {
  font-weight: bold;
  font-size: 18px;
}
.feedback-time {
  color: #888;
  font-size: 14px;
}
.feedback-content {
  margin-top: 16px;
}
.feedback-state {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 13px;
  background: #f0f0f0;
  color: #888;
  margin-bottom: 8px;
}
.feedback-state.processed {
  background: #e6f7e6;
  color: #52c41a;
}
.process-btn {
  padding: 6px 18px;
  background: #52c41a;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 15px;
  margin-top: 8px;
  transition: background 0.2s;
}
.process-btn:hover {
  background: #389e0d;
}
.feedback-empty {
  text-align: center;
  color: #aaa;
  padding: 40px 0;
  font-size: 18px;
}
.skeleton {
  background: #f2f2f2;
  border-radius: 4px;
  margin-bottom: 12px;
  animation: skeleton-loading 1.2s infinite linear alternate;
}
.skeleton-title {
  width: 60%;
  height: 24px;
}
.skeleton-line {
  width: 100%;
  height: 16px;
}
@keyframes skeleton-loading {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}
</style>
