<template>
  <div class="admin-admin-review">
    <!-- 搜索和筛选 -->
    <el-card class="search-card" shadow="hover">
      <div class="search-container">
        <el-input
          placeholder="搜索管理员名称或邮箱..."
          prefix-icon="el-icon-search"
          v-model="searchQuery"
          class="search-input"
        ></el-input>
      </div>
    </el-card>

    <!-- 管理员列表 -->
    <el-card class="admin-list-card" shadow="hover">
      <div class="card-header">
        <h2 class="card-title">待审核管理员列表</h2>
        <div class="action-buttons">
          <span class="record-count">共 {{ pendingAdmins.length }} 条记录</span>
          <el-select v-model="pageSize" class="page-size-select">
            <el-option label="10 条/页" :value="10"></el-option>
            <el-option label="20 条/页" :value="20"></el-option>
            <el-option label="50 条/页" :value="50"></el-option>
          </el-select>
        </div>
      </div>

      <el-table :data="filteredAdmins" style="width: 100%">
        <el-table-column label="管理员信息" min-width="220">
          <template #default="scope">
            <p class="admin-name">{{ scope.row.username }}</p>
            <p class="admin-email">{{ scope.row.email }}</p>
          </template>
        </el-table-column>
        <el-table-column label="注册理由" min-width="200">
          <template #default="scope">
            <p>{{ scope.row.RegistrationReason || '无' }}</p>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" min-width="180">
          <template #default="scope">
            {{ formatTime(scope.row.registeredAt) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="160">
          <template #default="scope">
            <el-button
              type="success"
              size="mini"
              @click="approveAdmin(scope.row.id)"
              >通过</el-button
            >
            <el-button
              type="danger"
              size="mini"
              @click="rejectAdmin(scope.row.id)"
              >拒绝</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <span class="pagination-info">
          显示 {{ currentPageStart }} 到 {{ currentPageEnd }} 条，共
          {{ pendingAdmins.length }} 条
        </span>
        <el-pagination
          layout="prev, pager, next"
          :total="pendingAdmins.length"
          :page-size="pageSize"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
import {
  getPendingAdmins,
  reviewAdmin,
  sendExternalNotification,
} from '@/utils/api';

export default {
  name: 'AdminAdminReviewPage',
  inject: {
    adminInfo: {
      default: () => ({}),
    },
  },
  data() {
    return {
      searchQuery: '',
      pageSize: 10,
      currentPage: 1,
      pendingAdmins: [],
    };
  },
  computed: {
    filteredAdmins() {
      let filtered = this.pendingAdmins;
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (admin) =>
            admin.username.toLowerCase().includes(query) ||
            admin.email.toLowerCase().includes(query) ||
            (admin.RegistrationReason &&
              admin.RegistrationReason.toLowerCase().includes(query))
        );
      }
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + parseInt(this.pageSize);
      return filtered.slice(start, end);
    },
    currentPageStart() {
      return this.pendingAdmins.length === 0
        ? 0
        : (this.currentPage - 1) * this.pageSize + 1;
    },
    currentPageEnd() {
      return Math.min(
        this.currentPage * this.pageSize,
        this.pendingAdmins.length
      );
    },
  },
  mounted() {
    this.fetchPendingAdmins();
  },
  methods: {
    formatTime(time) {
      if (!time) return '';
      const d = new Date(time);
      return d.toLocaleString();
    },
    getStatusTagType(status) {
      switch (status) {
        case 'pending':
          return 'warning';
        case 'approved':
          return 'success';
        case 'rejected':
          return 'danger';
        default:
          return 'warning';
      }
    },
    getStatusText(status) {
      switch (status) {
        case 'pending':
          return '待审核';
        case 'approved':
          return '已通过';
        case 'rejected':
          return '已拒绝';
        default:
          return '待审核';
      }
    },
    handleCurrentChange(page) {
      this.currentPage = page;
    },
    async fetchPendingAdmins() {
      try {
        const res = await getPendingAdmins();
        if (res.data && res.data.success) {
          // 兼容后端返回的字段
          this.pendingAdmins = (res.data.data || []).map((a) => ({
            id: a.adminId || a.id || a.auditId,
            username: a.adminName || a.username,
            registeredAt: a.createdAt || a.registeredAt,
            email: a.email,
            RegistrationReason:
              a.RegistrationReason ||
              a.registrationReason ||
              a.register_reason ||
              a.reason ||
              '',
            status: 'pending', // 默认状态为待审核
          }));
        } else {
          this.$message.error(res.data.message || '获取待审核管理员失败');
        }
      } catch (err) {
        this.$message.error(err.message || '获取待审核管理员失败');
      }
    },
    async approveAdmin(adminId) {
      try {
        const res = await reviewAdmin({ adminId, status: 1 });
        if (res.data && res.data.success) {
          this.$message.success(res.data.message || '审核通过成功');

          // 发送外部通知前，先查找对应的管理员信息
          const admin = this.pendingAdmins.find(
            (admin) => admin.id === adminId
          );
          if (admin && admin.email) {
            // 使用管理员的邮箱作为目标地址
            try {
              await sendExternalNotification({
                UserId: adminId, // 仍然保留ID用于创建通知记录
                Message: '您的管理员申请已通过审核。',
                Email: admin.email, // 添加额外的邮箱字段
              });
            } catch (e) {
              this.$message.warning('外部通知发送失败: ' + (e.message || '')); // 不影响主流程
            }
          }
          await this.fetchPendingAdmins();
        } else {
          this.$message.error(res.data.message || '审核失败');
        }
      } catch (err) {
        this.$message.error(err.message || '审核失败，请重试');
      }
    },
    async rejectAdmin(adminId) {
      try {
        const res = await reviewAdmin({ adminId, status: 2 });
        if (res.data && res.data.success) {
          this.$message.success(res.data.message || '已拒绝该管理员');

          // 发送外部通知前，先查找对应的管理员信息
          const admin = this.pendingAdmins.find(
            (admin) => admin.id === adminId
          );
          if (admin && admin.email) {
            // 使用管理员的邮箱作为目标地址
            try {
              await sendExternalNotification({
                UserId: adminId, // 仍然保留ID用于创建通知记录
                Message: '您的管理员申请未通过审核。',
                Email: admin.email, // 添加额外的邮箱字段
              });
            } catch (e) {
              this.$message.warning('外部通知发送失败: ' + (e.message || ''));
            }
          }
          await this.fetchPendingAdmins();
        } else {
          this.$message.error(res.data.message || '操作失败');
        }
      } catch (err) {
        this.$message.error(err.message || '操作失败，请重试');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
// 按钮圆角统一
:deep(.el-button) {
  border-radius: 12px !important;
}

// 全局卡片圆角统一
:deep(.el-card) {
  border-radius: 12px !important;
}

.admin-admin-review {
  .search-card {
    margin-bottom: 20px;

    .search-container {
      display: flex;
      justify-content: flex-start;

      .search-input {
        width: 300px;
      }
    }
  }

  .admin-list-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .card-title {
        font-size: 18px;
        font-weight: 600;
      }

      .action-buttons {
        display: flex;
        align-items: center;
        gap: 16px;

        .record-count {
          font-size: 14px;
          color: #666;
        }

        .page-size-select {
          width: 120px;
        }
      }
    }

    .admin-name {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .admin-email {
      font-size: 12px;
      color: #999;
      margin: 0;
    }

    .pagination-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e6e6e6;

      .pagination-info {
        font-size: 14px;
        color: #666;
      }
    }
  }
}
</style>
