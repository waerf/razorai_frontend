<template>
  <div class="post-review-detail">
    <el-button
      type="default"
      icon="el-icon-arrow-left"
      style="margin-bottom: 16px"
      @click="$router.push('/admin/posts')"
    >
      返回列表
    </el-button>
    <el-card v-if="loading" class="loading-card"
      ><el-skeleton rows="6" animated
    /></el-card>
    <el-card v-else class="detail-card" shadow="hover">
      <div class="detail-header">
        <h2>举报详情</h2>
        <el-tag :type="getStatusTagType(report.status)" size="small">{{
          getStatusText(report.status)
        }}</el-tag>
      </div>
      <el-descriptions :column="2" border :label-width="90">
        <el-descriptions-item label="举报ID">{{
          report.reportId
        }}</el-descriptions-item>
        <el-descriptions-item label="帖子ID">{{
          report.postId
        }}</el-descriptions-item>
        <el-descriptions-item label="帖子标题">{{
          parsedPostTitle.title || '-'
        }}</el-descriptions-item>
        <el-descriptions-item label="帖子作者">{{
          parsedPostTitle.author || '-'
        }}</el-descriptions-item>
        <el-descriptions-item label="帖子标签" :span="2">
          <template v-if="parsedPostTitle.tags && parsedPostTitle.tags.length">
            <el-tag
              v-for="tag in parsedPostTitle.tags"
              :key="tag"
              style="margin-right: 4px"
              >{{ tag }}</el-tag
            >
          </template>
          <template v-else>-</template>
        </el-descriptions-item>
        <el-descriptions-item label="举报人">{{
          report.reporterName
        }}</el-descriptions-item>
        <el-descriptions-item label="举报原因">{{
          report.reportReason
        }}</el-descriptions-item>
        <el-descriptions-item label="举报详情" :span="2">
          <div class="markdown-content" v-html="formattedReportDetails"></div>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{
          formatTime(report.createdAt)
        }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{
          formatTime(report.updatedAt)
        }}</el-descriptions-item>
      </el-descriptions>
      <div class="action-section" v-if="report.status === 0">
        <el-form :model="reviewForm" label-width="80px" class="review-form">
          <el-form-item label="审核操作">
            <el-radio-group v-model="reviewForm.status">
              <el-radio :label="1">有效</el-radio>
              <el-radio :label="2">无效</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="审核备注">
            <el-input
              v-model="reviewForm.reviewComment"
              type="textarea"
              :rows="2"
              placeholder="请输入审核备注（可选）"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitReview" :loading="reviewing"
              >提交审核</el-button
            >
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script>
import { marked } from 'marked';
import {
  getPostReportDetail,
  reviewPostReport,
  //sendReviewNotification,
} from '@/utils/api';
export default {
  name: 'AdminPostReviewDetail',
  data() {
    return {
      loading: true,
      report: {},
      parsedPostTitle: {},
      reviewForm: {
        status: 1,
        reviewComment: '',
      },
      reviewing: false,
    };
  },
  methods: {
    formatTime(time) {
      if (!time) return '';
      const d = new Date(time);
      return d.toLocaleString();
    },
    getStatusTagType(status) {
      switch (status) {
        case 0:
        case 'pending':
          return 'warning';
        case 1:
        case 'approved':
          return 'success';
        case 2:
        case 'rejected':
          return 'danger';
        default:
          return '';
      }
    },
    getStatusText(status) {
      switch (status) {
        case 0:
        case 'pending':
          return '待审核';
        case 1:
        case 'approved':
          return '已通过';
        case 2:
        case 'rejected':
          return '已拒绝';
        default:
          return '';
      }
    },
    async fetchReportDetail() {
      this.loading = true;
      try {
        const reportId = this.$route.params.id;
        const res = await getPostReportDetail(reportId);
        if (res.data && res.data.success) {
          this.report = res.data.data;
          // 解析帖子标题内容
          let parsed = {};
          try {
            if (typeof this.report.postTitle === 'string') {
              parsed = JSON.parse(this.report.postTitle);
            } else if (
              typeof this.report.postTitle === 'object' &&
              this.report.postTitle !== null
            ) {
              parsed = this.report.postTitle;
            }
          } catch (e) {
            parsed = { title: this.report.postTitle || '' };
          }
          this.parsedPostTitle = parsed || {};
        } else {
          this.$message.error(res.data.message || '获取举报详情失败');
        }
      } catch (err) {
        this.$message.error(err.message || '获取举报详情失败');
      } finally {
        this.loading = false;
      }
    },
    async submitReview() {
      if (!this.reviewForm.status) {
        this.$message.warning('请选择审核操作');
        return;
      }
      this.reviewing = true;
      try {
        const res = await reviewPostReport({
          reportId: this.report.reportId,
          status: this.reviewForm.status,
          reviewComment: this.reviewForm.reviewComment,
        });
        if (res.data && res.data.success) {
          /*
          // 审核通过时向举报人发送通知，内容为“您举报的帖子已被处理，感谢您的反馈”
          if (this.reviewForm.status === 1 && this.report.reporterId) {
            const notifyMsg = `您举报的帖子已被处理，感谢您的反馈。`;
            sendReviewNotification({
              userId: this.report.reporterId,
              notificationType: 0,
              message: notifyMsg,
            }).catch(() => {}); // 忽略通知失败
          }
          */
          this.$message.success(res.data.message || '审核成功');
          this.fetchReportDetail();

          // 审核提交成功后，返回列表页
          this.$router.push('/admin/posts');
        } else {
          this.$message.error(res.data.message || '审核失败');
        }
      } catch (err) {
        this.$message.error(err.message || '审核失败');
      } finally {
        this.reviewing = false;
      }
    },
  },
  mounted() {
    this.fetchReportDetail();
  },
  computed: {
    formattedReportDetails() {
      if (!this.report.reportDetails) return '';
      try {
        return marked(this.report.reportDetails);
      } catch (error) {
        console.error('Markdown parsing error:', error);
        return this.report.reportDetails; // 如果解析失败，返回原始文本
      }
    },
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

.post-review-detail {
  padding: 24px;

  .loading-card {
    min-height: 300px;
  }

  .detail-card {
    max-width: 800px;
    margin: 0 auto;

    .detail-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    ::v-deep .el-descriptions__cell {
      &.is-bordered-label {
        min-width: 90px;
      }
    }

    ::v-deep .el-descriptions__cell {
      &.el-descriptions-item__content {
        white-space: nowrap;
      }
    }

    .action-section {
      margin-top: 32px;

      .review-form {
        max-width: 400px;
      }
    }

    // Markdown 内容样式
    .markdown-content {
      line-height: 1.6;
      color: #333;

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        margin: 16px 0 8px 0;
        font-weight: 600;
        color: #2c3e50;
      }

      h1 {
        font-size: 1.6em;
      }
      h2 {
        font-size: 1.4em;
      }
      h3 {
        font-size: 1.2em;
      }
      h4 {
        font-size: 1.1em;
      }

      p {
        margin: 8px 0;
      }

      ul,
      ol {
        margin: 8px 0;
        padding-left: 20px;
      }

      li {
        margin: 4px 0;
      }

      code {
        background: #f5f5f5;
        padding: 2px 4px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
        font-size: 0.9em;
      }

      pre {
        background: #f5f5f5;
        padding: 12px;
        border-radius: 6px;
        overflow-x: auto;
        margin: 12px 0;

        code {
          background: none;
          padding: 0;
        }
      }

      blockquote {
        border-left: 4px solid #409eff;
        margin: 12px 0;
        padding: 8px 12px;
        background: #f8f9fa;
        color: #666;
      }

      a {
        color: #409eff;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }

      table {
        border-collapse: collapse;
        width: 100%;
        margin: 12px 0;

        th,
        td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }

        th {
          background: #f5f5f5;
          font-weight: 600;
        }
      }
    }
  }
}
</style>
