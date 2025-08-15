<template>
  <div class="admin-home">
    <!-- 侧边导航栏 -->
    <aside class="sidebar">
      <button class="toggle-sidebar-btn" @click="toggleSidebar">
        <i class="el-icon-s-fold"></i>
      </button>
      <div class="user-info">
        <div class="avatar">张</div>
        <div>
          <p class="username">张三</p>
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
            <el-form-item label="确认新密码" prop="confirmPwd">
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
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-500 mb-1"
                  >机器人名称</label
                >
                <p class="text-lg font-medium" v-if="robot">{{ robot.name }}</p>
                <p v-else class="text-lg text-gray-400">加载中...</p>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-500 mb-1"
                  >机器人类型</label
                >
                <p class="text-lg" v-if="robot">{{ robot.type }}</p>
                <p v-else class="text-lg text-gray-400">加载中...</p>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-500 mb-1"
                  >LLM名称</label
                >
                <p class="text-lg" v-if="robot">{{ robot.llm }}</p>
                <p v-else class="text-lg text-gray-400">加载中...</p>
              </div>
            </div>
            <div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-500 mb-1"
                  >当前状态</label
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
                >
                  {{
                    robot.status === 'pending'
                      ? '待审核'
                      : robot.status === 'approved'
                        ? '已通过'
                        : '已拒绝'
                  }}
                </el-tag>
                <span v-else class="text-gray-400">加载中...</span>
              </div>
            </div>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-500 mb-2"
              >提示词</label
            >
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-gray-800" v-if="robot">{{ robot.prompt }}</p>
              <p v-else class="text-gray-400">加载中...</p>
            </div>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-500 mb-2"
              >测试机器人</label
            >
            <el-input
              type="textarea"
              :rows="4"
              placeholder="输入测试问题..."
              v-model="testInput"
              class="test-input"
            ></el-input>
            <el-button type="primary" @click="testRobot" class="mt-2">
              测试
            </el-button>
            <div class="bg-gray-50 p-4 rounded-lg mt-4" v-if="testResult">
              <p class="font-medium text-gray-800">测试问题:</p>
              <p class="mb-3">"{{ testInput }}"</p>
              <p class="font-medium text-gray-800">测试结果:</p>
              <p>{{ testResult }}</p>
            </div>
          </div>

          <div class="flex space-x-4">
            <el-button type="success" @click="approveRobot">通过审核</el-button>
            <el-button type="danger" @click="rejectRobot">拒绝审核</el-button>
            <el-button type="primary" @click="$router.push('/admin/review')"
              >返回列表</el-button
            >
          </div>
        </el-card>
      </div>
    </main>
  </div>
</template>

<script>
import MyStorage from '@/utils/storage';
import { changeAdminPassword, adminLogout } from '@/utils/api';

export default {
  name: 'AdminRobotReviewDetail',
  data() {
    return {
      isSidebarCollapsed: false,
      showChangePwd: false,
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
      testInput: '',
      testResult: '',
      loading: false,
    };
  },
  methods: {
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
              this.$router.push('/');
            } else {
              this.$message.error(res.data.message || '登出失败');
            }
          } catch (err) {
            this.$message.error(err.message || '登出失败，请重试');
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
      const id = this.$route.params.id;
      try {
        // 这里建议将 token 存储在 localStorage 或 Vuex，实际项目请替换获取方式
        const token = MyStorage.get('admin_token');
        const res = await fetch(
          `http://localhost:5253/admin/agent-review/${id}`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (data.success) {
          // 适配字段
          this.robot = {
            id: data.data.id,
            name: data.data.name,
            type: data.data.type === 1 ? '文本' : data.data.type,
            llm: data.data.llm || '-',
            status:
              data.data.reviewStatus === 0
                ? 'pending'
                : data.data.reviewStatus === 1
                  ? 'approved'
                  : 'rejected',
            prompt: data.data.chatPrompt,
            description: data.data.description,
            price: data.data.price,
            creatorName: data.data.creatorName,
            createdAt: data.data.createdAt,
            reviewRemarks: data.data.reviewRemarks,
          };
        } else {
          this.$message.error(data.message || '获取机器人详情失败');
        }
      } catch (err) {
        this.$message.error(err.message || '获取机器人详情失败');
      }
      this.loading = false;
    },
    approveRobot() {
      if (!this.robot) return;
      const token = MyStorage.get('admin_token');
      fetch(
        `http://localhost:5253/admin/agent-review/${this.robot.id}/approve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ remarks: '审核通过，机器人质量良好' }),
        }
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            this.robot.status = 'approved';
            this.$message.success(data.message || '审核已通过');
          } else {
            this.$message.error(data.message || '审核失败');
          }
        })
        .catch((err) => {
          this.$message.error(err.message || '审核失败');
        });
    },
    rejectRobot() {
      if (!this.robot) return;
      const token = MyStorage.get('admin_token');
      fetch(
        `http://localhost:5253/admin/agent-review/${this.robot.id}/reject`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ remarks: '审核拒绝，机器人内容不符合规范' }),
        }
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            this.robot.status = 'rejected';
            this.$message.error(data.message || '审核已拒绝');
          } else {
            this.$message.error(data.message || '审核失败');
          }
        })
        .catch((err) => {
          this.$message.error(err.message || '审核失败');
        });
    },
    testRobot() {
      if (!this.testInput) {
        this.$message.warning('请输入测试问题');
        return;
      }
      this.testResult = '机器人响应示例 - 这是对您问题的模拟回答。';
    },
  },
  mounted() {
    this.fetchRobotDetail();
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
        border-radius: 4px;
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
    }
  }
}
</style>
