<template>
  <div class="admin-home">
    <!-- 侧边导航栏 -->
    <aside class="sidebar">
      <button class="toggle-sidebar-btn" @click="toggleSidebar">
        <i class="el-icon-s-fold"></i>
      </button>
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
        <el-card class="robot-detail-card" shadow="hover">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div class="mb-4 robot-info-item">
                <label
                  class="block text-sm font-bold text-gray-600 mb-1 info-label"
                  ><i class="el-icon-robot robot-icon"></i> 机器人名称</label
                >
                <p class="text-lg font-bold robot-name" v-if="robot">
                  {{ robot.name }}
                </p>
                <p v-else class="text-lg text-gray-400">加载中...</p>
              </div>
              <div class="mb-4 robot-info-item">
                <label
                  class="block text-sm font-bold text-gray-600 mb-1 info-label"
                  ><i class="el-icon-collection-tag robot-icon"></i>
                  机器人类型</label
                >
                <div class="robot-type-container" v-if="robot">
                  <span class="robot-type-badge">{{ robot.type }}</span>
                </div>
                <p v-else class="text-lg text-gray-400">加载中...</p>
              </div>
              <div class="mb-4">
                <!-- LLM名称部分已移除 -->
              </div>
            </div>
            <div>
              <div class="mb-4 robot-info-item">
                <label
                  class="block text-sm font-bold text-gray-600 mb-1 info-label"
                  ><i class="el-icon-info robot-icon"></i> 当前状态</label
                >
                <el-tag
                  v-if="robot"
                  :type="
                    robot.status === 'pending'
                      ? 'warning'
                      : robot.status === 'approved'
                        ? 'success'
                        : 'danger'
                  "
                  class="status-tag"
                  size="medium"
                  effect="dark"
                >
                  <span class="status-content">
                    <i
                      :class="[
                        robot.status === 'pending'
                          ? 'el-icon-time'
                          : robot.status === 'approved'
                            ? 'el-icon-check'
                            : 'el-icon-close',
                      ]"
                      class="status-icon"
                    ></i>
                    <span>{{
                      robot.status === 'pending'
                        ? '待审核'
                        : robot.status === 'approved'
                          ? '已通过'
                          : '已拒绝'
                    }}</span>
                  </span>
                </el-tag>
                <span v-else class="text-gray-400">加载中...</span>
              </div>
            </div>
          </div>

          <div class="mb-6 robot-info-item">
            <label class="block text-sm font-bold text-gray-600 mb-2 info-label"
              ><i class="el-icon-document robot-icon"></i> 提示词</label
            >
            <div class="prompt-container">
              <pre class="prompt-content" v-if="robot">{{ robot.prompt }}</pre>
              <p v-else class="text-gray-400">加载中...</p>
            </div>
          </div>

          <div class="mb-6 robot-info-item">
            <label class="block text-sm font-bold text-gray-600 mb-2 info-label"
              ><i class="el-icon-warning robot-icon"></i> 拒绝理由</label
            >
            <el-input
              type="textarea"
              :rows="3"
              placeholder="请输入拒绝理由"
              v-model="rejectReason"
              class="reject-reason-input"
              maxlength="200"
              show-word-limit
            ></el-input>
          </div>

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
            <el-button
              type="primary"
              icon="el-icon-back"
              class="action-btn return-btn"
              @click="$router.push('/admin/review')"
            >
              返回列表
            </el-button>
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

    .toggle-sidebar-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      cursor: pointer;
      font-size: 16px;
      background: none;
      border: none;
      color: #606266;
      padding: 5px;

      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }
    }

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
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background-color: white;
      border-bottom: 1px solid #e6e6e6;
      position: sticky;
      top: 0;
      z-index: 10;

      .title {
        font-size: 20px;
        font-weight: 600;
      }
    }

    .content {
      padding: 24px;

      .robot-detail-card {
        padding: 24px;
      }

      .test-input {
        width: 100%;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        transition: border-color 0.3s;

        &:focus {
          border-color: #165dff;
        }
      }

      .card-hover {
        transition: all 0.3s ease;
      }
      .card-hover:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
      }

      /* 新增的样式 - 机器人审核详情页面元素样式 */
      .robot-info-item {
        border-left: 4px solid #165dff;
        padding-left: 16px;
        position: relative;
        transition: all 0.3s;
      }

      .info-label {
        display: flex;
        align-items: center;
        color: #165dff;
        font-size: 14px;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }

      .robot-icon {
        margin-right: 6px;
        font-size: 16px;
      }

      .robot-name {
        font-size: 20px;
        color: #303133;
        font-weight: 600;
        text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
        margin-top: 4px;
      }

      .robot-type-container {
        margin-top: 4px;
      }

      .robot-type-badge {
        display: inline-block;
        background-color: #ecf5ff;
        color: #165dff;
        padding: 6px 12px;
        border-radius: 16px;
        font-weight: 600;
        font-size: 14px;
        border: 2px solid #d9ecff;
      }

      .status-tag {
        padding: 8px 12px;
        font-size: 14px;
        font-weight: 600;
        border-radius: 8px;
        margin-top: 4px;
        display: inline-flex;
        align-items: center;
        height: 32px;
      }

      .status-icon {
        margin-right: 6px;
        display: inline-flex;
        align-items: center;
      }

      .status-content {
        display: flex;
        align-items: center;
        height: 100%;
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
      }

      .prompt-container:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-color: #c6e2ff;
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
        .el-textarea__inner {
          border: 2px solid #f56c6c;
          border-radius: 8px;
          transition: all 0.3s;
          font-size: 14px;
          background-color: #fff8f8;

          &:focus {
            border-color: #f56c6c;
            box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.2);
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
        padding: 12px 24px;
        font-size: 15px;
        font-weight: 600;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        &:active {
          transform: translateY(1px);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
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
    }
  }
}
</style>
