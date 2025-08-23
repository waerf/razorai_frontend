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
      </div>
    </div>
    <div v-else class="feedback-empty">暂无反馈详情</div>
  </div>
</template>

<script>
import { fetchUserFeedbacks } from '@/utils/api';

export default {
  name: 'AdminFeedbackDetail',
  props: {
    userId: {
      type: [String, Number],
      required: true,
    },
    feedbackId: {
      type: [String, Number],
      required: true,
    },
  },
  data() {
    return {
      feedbackDetail: null,
      loading: true,
      errorMsg: '',
    };
  },
  methods: {
    async loadFeedbackDetail() {
      this.loading = true;
      try {
        const res = await fetchUserFeedbacks(this.userId);
        if (res && res.feedbacks) {
          this.feedbackDetail = res.feedbacks.find(
            (f) => f.id == this.feedbackId
          );
        }
        // 无需弹窗，页面直接显示空提示
      } catch (e) {
        // 可选：可在页面顶部显示错误信息
        this.errorMsg = e.message || '获取反馈详情失败';
      } finally {
        this.loading = false;
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
