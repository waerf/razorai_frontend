<template>
  <div class="admin-home">
    <!-- 侧边导航栏 -->
    <aside class="sidebar">
      <div class="user-info">
        <div class="avatar">{{ adminName ? adminName.charAt(0) : '管' }}</div>
        <div>
          <p class="username">{{ adminName || '管理员' }}</p>
          <p class="role">系统管理员</p>
        </div>
      </div>

      <nav class="nav-menu">
        <div class="nav-item" @click="$router.push('/admin')">
          <i class="el-icon-menu"></i>
          <span>控制台概览</span>
        </div>
        <div class="nav-item" @click="$router.push('/admin/admin-review')">
          <i class="el-icon-user-solid"></i>
          <span>管理员审核</span>
        </div>
        <div class="nav-item active">
          <i class="el-icon-cpu"></i>
          <span>机器人审核</span>
        </div>
        <div class="nav-item" @click="$router.push('/admin/posts')">
          <i class="el-icon-document"></i>
          <span>帖子审核</span>
        </div>
        <div class="nav-item" @click="$router.push('/admin/feedback')">
          <i class="el-icon-chat-dot-round"></i>
          <span>用户反馈</span>
        </div>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 顶部导航栏 -->
      <header class="header">
        <button class="toggle-sidebar-btn" @click="toggleSidebar">
          <i class="el-icon-s-fold"></i>
        </button>
        <h1 class="title">机器人审核详情</h1>
        <div style="display: flex; align-items: center; margin-left: auto">
          <el-button
            type="warning"
            style="margin-right: 8px"
            @click="showChangePwd = true"
            >修改密码</el-button
          >
          <el-button type="primary" @click="logout">退出登录</el-button>
        </div>
        <el-dialog
          title="修改密码"
          :visible.sync="showChangePwd"
          width="400px"
          @close="resetPwdForm"
        >
          <el-form
            :model="pwdForm"
            :rules="pwdRules"
            ref="pwdFormRef"
            label-width="90px"
          >
            <el-form-item label="旧密码" prop="oldPwd">
              <el-input
                v-model="pwdForm.oldPwd"
                type="password"
                autocomplete="off"
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPwd">
              <el-input
                v-model="pwdForm.newPwd"
                type="password"
                autocomplete="off"
              />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPwd">
              <el-input
                v-model="pwdForm.confirmPwd"
                type="password"
                autocomplete="off"
              />
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="showChangePwd = false">取消</el-button>
            <el-button type="primary" @click="submitPwdForm"
              >确认修改</el-button
            >
          </span>
        </el-dialog>
      </header>

      <!-- 主要内容 -->
      <div class="content">
        <el-button
          type="default"
          icon="el-icon-arrow-left"
          style="margin-bottom: 16px"
          @click="$router.push('/admin/review')"
        >
          返回列表
        </el-button>
        <el-card class="robot-detail-card" shadow="hover">
          <div v-if="loading" class="robot-loading">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-line"></div>
            <div class="skeleton skeleton-line"></div>
            <div class="skeleton skeleton-line"></div>
          </div>
          <div v-else-if="robot">
            <div class="robot-header">
              <div class="avatar-placeholder">
                {{ robot.name ? robot.name.charAt(0) : 'AI' }}
              </div>
              <div class="robot-user-info">
                <div class="robot-name">
                  {{ robot.name || '未命名机器人' }}
                </div>
                <div class="robot-type">
                  <span class="robot-type-badge">{{ robot.type }}</span>
                </div>
              </div>
            </div>

            <div class="robot-content">
              <span
                class="robot-state"
                :class="{
                  pending: robot.status === 'pending',
                  approved: robot.status === 'approved',
                  rejected: robot.status === 'rejected',
                }"
              >
                {{
                  robot.status === 'pending'
                    ? '待审核'
                    : robot.status === 'approved'
                      ? '已通过'
                      : '已拒绝'
                }}
              </span>

              <div class="section-title">
                <i class="el-icon-document robot-icon"></i>
                <span>提示词</span>
              </div>
              <div class="prompt-container">
                <pre class="prompt-content">{{ robot.prompt }}</pre>
              </div>

              <div class="section-title">
                <i class="el-icon-warning robot-icon"></i>
                <span>拒绝理由</span>
              </div>
              <el-input
                type="textarea"
                :rows="3"
                placeholder="请输入拒绝理由"
                v-model="rejectReason"
                class="reject-reason-input"
                maxlength="200"
                show-word-limit
              ></el-input>

              <div class="action-buttons">
                <el-button
                  type="success"
                  icon="el-icon-check"
                  class="action-btn approve-btn"
                  @click="approveRobot"
                >
                  通过审核
                </el-button>
                <el-button
                  type="danger"
                  icon="el-icon-close"
                  class="action-btn reject-btn"
                  :disabled="!rejectReason"
                  @click="rejectRobot"
                >
                  拒绝审核
                </el-button>
              </div>
            </div>
          </div>
          <div v-else class="robot-empty">
            <div v-if="errorMsg" style="color: #e74c3c; margin-bottom: 12px">
              {{ errorMsg }}
            </div>
            暂无机器人详情
          </div>
        </el-card>
      </div>
    </main>
  </div>
</template>

<script>
import MyStorage from '@/utils/storage';
import {
  changeAdminPassword,
  adminLogout,
  getAdminInfo,
  getPendingAgentDetail,
  sendReviewNotification,
} from '@/utils/api';

export default {
  name: 'AdminRobotReviewDetail',
  data() {
    return {
      isSidebarCollapsed: false,
      showChangePwd: false,
      adminName: '',
      pwdForm: {
        oldPwd: '',
        newPwd: '',
        confirmPwd: '',
      },
      pwdRules: {
        oldPwd: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
        newPwd: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '新密码至少6位', trigger: 'blur' },
        ],
        confirmPwd: [
          { required: true, message: '请确认新密码', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value !== this.pwdForm.newPwd) {
                callback(new Error('两次输入的新密码不一致'));
              } else {
                callback();
              }
            },
            trigger: 'blur',
          },
        ],
      },
      robot: null,
      rejectReason: '',
      loading: false,
      errorMsg: '',
    };
  },
  methods: {
    getPendingAgentDetail,
    async fetchAdminInfo() {
      try {
        const res = await getAdminInfo();
        if (res.data && res.data.success) {
          this.adminName = res.data.adminInfo.adminName;
        } else {
          this.$message.error(res.data.message || '获取管理员信息失败');
        }
      } catch (err) {
        this.$message.error(err.message || '获取管理员信息失败');
      }
    },
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
      const sidebar = document.querySelector('.sidebar');
      sidebar.classList.toggle('hidden');
    },
    logout() {
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          try {
            const res = await adminLogout();
            if (res.data && res.data.success) {
              this.$message.success(res.data.message || '登出成功');
              if (window.localStorage) {
                localStorage.removeItem('admin_token');
              }
            } else {
              if (window.localStorage) {
                localStorage.removeItem('admin_token');
              }
            }
          } catch (err) {
            if (window.localStorage) {
              localStorage.removeItem('admin_token');
            }
          } finally {
            this.$router.push('/');
          }
        })
        .catch(() => {
          // 用户取消
        });
    },
    async submitPwdForm() {
      this.$refs.pwdFormRef.validate(async (valid) => {
        if (!valid) return;
        try {
          const res = await changeAdminPassword({
            oldPassword: this.pwdForm.oldPwd,
            newPassword: this.pwdForm.newPwd,
          });
          if (res.data && res.data.success) {
            this.$message({
              type: 'success',
              message: res.data.message || '密码修改成功',
            });
            this.showChangePwd = false;
            this.resetPwdForm();
          } else {
            this.$message({
              type: 'error',
              message: res.data.message || '密码修改失败',
            });
          }
        } catch (err) {
          this.$message({
            type: 'error',
            message: err.response?.data?.message || '密码修改失败，请重试',
          });
        }
      });
    },
    resetPwdForm() {
      this.pwdForm.oldPwd = '';
      this.pwdForm.newPwd = '';
      this.pwdForm.confirmPwd = '';
      if (this.$refs.pwdFormRef) this.$refs.pwdFormRef.clearValidate();
    },
    async fetchRobotDetail() {
      this.loading = true;
      // 正确获取 auditId，路由为 /admin/robots/:id
      const auditId = this.$route.params.id;
      if (!auditId) {
        this.$message.error('未获取到审核ID，无法加载详情');
        this.loading = false;
        return;
      }
      try {
        const res = await getPendingAgentDetail(auditId);
        if (res.data && res.data.success) {
          const data = res.data.data;
          this.robot = {
            id: data.auditId,
            name: data.name,
            type: data.type,
            llmId: data.llmId,
            status:
              data.reviewStatus === 0
                ? 'pending'
                : data.reviewStatus === 1
                  ? 'approved'
                  : 'rejected',
            prompt: data.chatPrompt,
            description: data.description,
            price: data.price,
            creatorId: data.creatorId,
            creatorName: data.creatorName,
            createdAt: data.createdAt,
            reviewRemarks: data.reviewRemarks,
          };
        } else {
          this.$message.error(res.data?.message || '获取机器人详情失败');
        }
      } catch (err) {
        this.$message.error(err?.message || '获取机器人详情失败');
      }
      this.loading = false;
    },
    async approveRobot() {
      if (!this.robot) return;
      // 先调用后端审核通过接口
      const token = MyStorage.get('admin_token');
      try {
        // 字段映射
        let type = 1;
        if (typeof this.robot.type === 'number') {
          type = this.robot.type;
        } else if (typeof this.robot.type === 'string') {
          if (this.robot.type.includes('任务')) type = 2;
          else if (this.robot.type.includes('分析')) type = 3;
          else type = 1;
        }
        let llmId = 1;
        let creatorId = this.robot.creatorId;
        if (!creatorId) {
          creatorId = MyStorage.get('user_id') || 1;
        }
        const payload = {
          Name: this.robot.name,
          Type: type,
          LLMId: llmId,
          ChatPrompt: this.robot.prompt,
          Description: this.robot.description,
          CreatorId: parseInt(creatorId),
          Price: this.robot.price || 0,
          Remarks: '', // 审核备注
        };
        const approveRes = await fetch(
          `http://47.99.66.142:5253/admin/agent-review/${this.robot.id}/approve`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );
        const approveData = await approveRes.json();
        if (approveData.success) {
          this.robot.status = 'approved';
          // 发送审核通过通知
          await sendReviewNotification({
            userId: creatorId,
            title: '机器人审核通过',
            message: `您的机器人“${this.robot.name}”已通过审核。`,
            robotId: this.robot.id,
            status: 'approved',
          });
          this.$message.success(
            approveData.message || '审核已通过，AI创建成功'
          );
          this.$router.push({
            path: '/admin/review',
            query: { removedId: this.robot.id },
          });
        } else {
          this.$message.error(approveData.message || '审核操作失败');
        }
      } catch (err) {
        this.$message.error(err.message || '审核操作失败');
      }
    },
    async rejectRobot() {
      if (!this.robot) return;
      if (!this.rejectReason) {
        this.$message.warning('请输入拒绝理由');
        return;
      }
      const token = MyStorage.get('admin_token');
      // 字段映射，和通过审核时保持一致
      let type = 1;
      if (typeof this.robot.type === 'number') {
        type = this.robot.type;
      } else if (typeof this.robot.type === 'string') {
        if (this.robot.type.includes('任务')) type = 2;
        else if (this.robot.type.includes('分析')) type = 3;
        else type = 1;
      }
      let llmId = this.robot.llmId || 1;
      let creatorId = this.robot.creatorId;
      if (!creatorId) {
        creatorId = MyStorage.get('user_id') || 1;
      }
      const payload = {
        Name: this.robot.name,
        Type: type,
        LLMId: llmId,
        ChatPrompt: this.robot.prompt,
        Description: this.robot.description,
        CreatorId: parseInt(creatorId),
        Price: this.robot.price || 0,
        Remarks: this.rejectReason,
      };
      try {
        const res = await fetch(
          `http://47.99.66.142:5253/admin/agent-review/${this.robot.id}/reject`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );
        const data = await res.json();
        if (data.success) {
          this.robot.status = 'rejected';
          // 发送审核拒绝通知
          await sendReviewNotification({
            userId: creatorId,
            title: '机器人审核未通过',
            message: `您的机器人“${this.robot.name}”未通过审核，原因：${this.rejectReason}`,
            robotId: this.robot.id,
            status: 'rejected',
          });
          this.$message.error(data.message || '审核已拒绝');
          this.rejectReason = '';
          // 跳转回列表页并传递已审核 id
          this.$router.push({
            path: '/admin/review',
            query: { removedId: this.robot.id },
          });
        } else {
          this.$message.error(data.message || '审核失败');
        }
      } catch (err) {
        this.$message.error(err.message || '审核失败');
      }
    },
  },
  mounted() {
    this.fetchRobotDetail();
    this.fetchAdminInfo();
  },
};
</script>

<style lang="scss" scoped>
.admin-home {
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f5;

  .sidebar {
    position: relative;
    transition: all 0.3s ease;

    &.hidden {
      width: 60px !important;

      .nav-item {
        span {
          display: none;
        }

        i {
          margin-right: 0;
        }
      }

      .user-info {
        flex-direction: column;
        align-items: center;
        padding: 10px;

        .avatar {
          margin-right: 0;
          margin-bottom: 5px;
        }

        .username,
        .role {
          display: none;
        }
      }
    }
    width: 250px;
    background-color: white;
    border-right: 1px solid #e6e6e6;
    padding: 20px 0;

    .user-info {
      display: flex;
      align-items: center;
      padding: 0 20px 20px;
      border-bottom: 1px solid #e6e6e6;

      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #165dff;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        font-weight: bold;
      }

      .username {
        font-weight: 500;
        margin-bottom: 4px;
      }

      .role {
        font-size: 12px;
        color: #999;
      }
    }

    .nav-menu {
      padding: 10px 0;

      .nav-item {
        display: flex;
        align-items: center;
        padding: 12px 20px;
        margin: 4px 0;
        cursor: pointer;
        transition: all 0.3s;

        i {
          margin-right: 12px;
          font-size: 18px;
        }

        &:hover {
          background-color: #f6f6f6;
        }

        &.active {
          background-color: #e8f3ff;
          color: #165dff;
          border-left: 3px solid #165dff;
        }
      }
    }
  }

  .main-content {
    flex: 1;
    overflow: auto;

    .header {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      padding: 16px 24px;
      background-color: white;
      border-bottom: 1px solid #e6e6e6;
      position: sticky;
      top: 0;
      z-index: 10;

      .toggle-sidebar-btn {
        cursor: pointer;
        font-size: 18px;
        background: none;
        border: none;
        color: #606266;
        padding: 5px;
        margin-right: 16px;

        &:hover {
          background-color: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
        }
      }

      .title {
        font-size: 20px;
        font-weight: 600;
      }
    }

    .content {
      padding: 24px;

      .robot-detail-card {
        max-width: 800px;
        margin: 20px auto;
      }

      .card-hover {
        transition: all 0.3s ease;
      }
      .card-hover:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
      }

      .robot-header {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
      }

      .avatar-placeholder {
        width: 48px;
        height: 48px;
        background: #165dff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        color: white;
        margin-right: 16px;
      }

      .robot-user-info {
        margin-left: 16px;
      }

      .robot-name {
        font-weight: bold;
        font-size: 18px;
      }

      .robot-type {
        margin-top: 4px;
      }

      .robot-type-badge {
        display: inline-block;
        background-color: #ecf5ff;
        color: #165dff;
        padding: 3px 10px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 13px;
      }

      .robot-content {
        margin-top: 16px;
      }

      .section-title {
        font-weight: bold;
        margin: 16px 0 8px;
        display: flex;
        align-items: center;
        color: #303133;
      }

      .robot-icon {
        margin-right: 6px;
        font-size: 16px;
      }

      .robot-state {
        display: inline-block;
        padding: 2px 10px;
        border-radius: 12px;
        font-size: 13px;
        background: #f0f0f0;
        color: #888;
        margin-bottom: 16px;
      }

      .robot-state.pending {
        background: #fdf6ec;
        color: #e6a23c;
      }

      .robot-state.approved {
        background: #e6f7e6;
        color: #52c41a;
      }

      .robot-state.rejected {
        background: #fef0f0;
        color: #f56c6c;
      }

      .prompt-container {
        background-color: #f5f7fa;
        border: 1px solid #e4e7ed;
        border-radius: 8px;
        padding: 16px;
        max-height: 300px;
        overflow-y: auto;
        transition: all 0.3s;
        position: relative;
        margin-bottom: 16px;
      }

      .prompt-content {
        font-family: 'Courier New', Courier, monospace;
        white-space: pre-wrap;
        font-size: 14px;
        line-height: 1.6;
        color: #303133;
        margin: 0;
      }

      .reject-reason-input {
        margin-bottom: 16px;

        .el-textarea__inner {
          border: 1px solid #e4e7ed;
          border-radius: 8px;
          transition: all 0.3s;
          font-size: 14px;

          &:focus {
            border-color: #f56c6c;
          }
        }
      }

      .action-buttons {
        display: flex;
        gap: 16px;
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px dashed #e4e7ed;
      }

      .action-btn {
        padding: 10px 20px;
        font-size: 15px;
        font-weight: 600;
        transition: all 0.3s;
      }

      .approve-btn {
        background-color: #67c23a;
        border-color: #67c23a;

        &:hover,
        &:focus {
          background-color: #5daf34;
          border-color: #5daf34;
        }
      }

      .reject-btn {
        background-color: #f56c6c;
        border-color: #f56c6c;

        &:hover,
        &:focus {
          background-color: #e45656;
          border-color: #e45656;
        }

        &:disabled {
          background-color: #fab6b6;
          border-color: #fab6b6;
          opacity: 0.7;
        }
      }

      .robot-loading {
        padding: 20px 0;
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

      .robot-empty {
        text-align: center;
        color: #aaa;
        padding: 40px 0;
        font-size: 18px;
      }

      @keyframes skeleton-loading {
        0% {
          opacity: 1;
        }
        100% {
          opacity: 0.5;
        }
      }
    }
  }
}
</style>
