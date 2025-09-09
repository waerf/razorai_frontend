<template>
  <div class="admin-comment-review-detail">
    <!-- 主要内容 -->
    <div class="content" v-if="report">
      <el-card class="report-card" shadow="hover">
        <div class="report-header">
          <h2>举报信息</h2>
          <el-tag :type="getStatusTagType(report.status)">{{
            report.statusText
          }}</el-tag>
        </div>

        <el-descriptions :column="1" border>
          <el-descriptions-item label="举报ID">
            {{ report.reportId }}
          </el-descriptions-item>
          <el-descriptions-item label="举报人">
            {{ report.reporterName }}
          </el-descriptions-item>
          <el-descriptions-item label="举报原因">
            {{ report.reportReason }}
          </el-descriptions-item>
          <el-descriptions-item label="举报详情">
            {{ report.reportDetails || '无详细说明' }}
          </el-descriptions-item>
          <el-descriptions-item label="举报时间">
            {{ formatTime(report.createdAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card class="comment-card" shadow="hover">
        <div class="card-header">
          <h2>评论内容</h2>
        </div>

        <div class="comment-content">
          <p>{{ report.commentContent }}</p>
        </div>

        <div class="comment-info">
          <div class="comment-id">
            <strong>评论ID:</strong> {{ report.commentId }}
          </div>
        </div>
      </el-card>

      <el-card class="review-card" shadow="hover" v-if="report.status === 0">
        <div class="card-header">
          <h2>审核操作</h2>
        </div>

        <el-form :model="reviewForm" ref="reviewFormRef" label-width="100px">
          <el-form-item label="审核决定" prop="status">
            <el-radio-group v-model="reviewForm.status">
              <el-radio :label="1">通过举报（删除评论）</el-radio>
              <el-radio :label="2">拒绝举报（保留评论）</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="审核意见">
            <el-input
              type="textarea"
              v-model="reviewForm.reviewComment"
              rows="4"
              placeholder="请输入审核意见（可选）"
            ></el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="submitReview">提交审核</el-button>
            <el-button @click="goBack">取消</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="review-result-card" shadow="hover" v-else>
        <div class="card-header">
          <h2>审核结果</h2>
        </div>

        <el-descriptions :column="1" border>
          <el-descriptions-item label="审核人">
            {{ report.adminName || '未知' }}
          </el-descriptions-item>
          <el-descriptions-item label="审核意见">
            {{ report.reviewComment || '无审核意见' }}
          </el-descriptions-item>
          <el-descriptions-item label="审核时间">
            {{ formatTime(report.updatedAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="审核状态">
            <el-tag :type="getStatusTagType(report.status)">{{
              report.statusText
            }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>
    <div v-else class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
  </div>
</template>

<script>
import {
  reviewCommentReport,
  getCommentReportDetail,
  //sendReviewNotification,
} from '@/utils/api';

export default {
  name: 'AdminCommentReviewDetail',
  inject: ['adminInfo'],
  data() {
    return {
      reportId: null,
      report: null,
      loading: true,
      reviewForm: {
        status: 1,
        reviewComment: '',
      },
    };
  },
  methods: {
    async fetchReportDetail() {
      try {
        this.loading = true;
        const res = await getCommentReportDetail(this.reportId);
        if (res.data && res.data.success) {
          this.report = res.data.data;
          this.loading = false;
        } else {
          this.$message.error(res.data.message || '获取评论举报详情失败');
          this.loading = false;
        }
      } catch (err) {
        this.$message.error(err.message || '获取评论举报详情失败');
        this.loading = false;
      }
    },
    formatTime(time) {
      if (!time) return '';
      const d = new Date(time);
      return d.toLocaleString();
    },
    getStatusTagType(status) {
      switch (status) {
        case 0:
          return 'warning';
        case 1:
          return 'success';
        case 2:
          return 'danger';
        default:
          return '';
      }
    },
    async submitReview() {
      try {
        const res = await reviewCommentReport({
          reportId: this.reportId,
          status: this.reviewForm.status,
          reviewComment: this.reviewForm.reviewComment,
        });

        if (res.data && res.data.success) {
          this.$message.success('审核提交成功');
          /*
          // 如果是通过举报（status=1），向举报者发送通知
          if (
            this.reviewForm.status === 1 &&
            this.report &&
            this.report.reporterId
          ) {
            const notifyMsg = `您举报的帖子已被处理，感谢您的反馈。`;
            sendReviewNotification({
              userId: this.report.reporterId,
              notificationType: 0,
              message: notifyMsg,
            }).catch(() => {});
          }
          */
          // 审核提交成功后，返回列表页
          this.$router.push('/admin/posts');
        } else {
          this.$message.error(res.data.message || '审核提交失败');
        }
      } catch (err) {
        this.$message.error(err.message || '审核提交失败');
      }
    },
    goBack() {
      this.$router.push('/admin/posts');
    },
  },
  created() {
    this.reportId = this.$route.params.id;
    this.fetchReportDetail();
  },
};
</script>

<style lang="scss" scoped>
// 全局卡片圆角统一
:deep(.el-card) {
  border-radius: 12px !important;
}

// 按钮圆角统一
:deep(.el-button) {
  border-radius: 12px !important;
}

.admin-comment-review-detail {
  // 内容区自定义样式
  .report-card,
  .comment-card,
  .review-card,
  .review-result-card {
    margin-bottom: 24px;

    .report-header,
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h2 {
        font-size: 18px;
        font-weight: 600;
        margin: 0;
      }
    }

    .comment-content {
      padding: 16px;
      background-color: #f9f9f9;
      border-radius: 4px;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 16px;
    }

    .comment-info {
      color: #666;
      font-size: 14px;
    }
  }

  .loading-container {
    padding: 24px;
  }
}
</style>
