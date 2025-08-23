<template>
  <div class="personal-home" v-loading="loading">
    <div class="header">
      <div class="header-left">
        <h2>个人主页</h2>
      </div>
      <div class="header-right">
        <el-button
          type="primary"
          icon="el-icon-refresh-right"
          @click="loadUserInfo"
          >刷新</el-button
        >
        <el-button
          type="danger"
          icon="el-icon-switch-button"
          @click="confirmLogout"
          >退出登录</el-button
        >
      </div>
    </div>

    <div class="profile-container">
      <!-- 基本信息卡片 -->
      <el-card class="info-card" shadow="hover">
        <div slot="header" class="card-header">
          <span class="card-title">基本信息</span>
          <div class="card-actions">
            <el-button
              v-if="!editMode"
              type="text"
              icon="el-icon-edit"
              @click="enterEditMode"
              >编辑</el-button
            >
            <div v-else>
              <el-button type="text" size="small" @click="cancelEdit"
                >取消</el-button
              >
              <el-button type="primary" size="small" @click="saveProfile"
                >保存</el-button
              >
            </div>
          </div>
        </div>

        <div class="profile-info">
          <div class="avatar-section">
            <el-avatar :size="80" :src="'https://via.placeholder.com/150'">
              {{
                userInfo.user_name
                  ? userInfo.user_name.charAt(0).toUpperCase()
                  : 'U'
              }}
            </el-avatar>
          </div>

          <div class="info-section">
            <el-form
              v-if="editMode"
              ref="userForm"
              :model="userForm"
              :rules="userRules"
              label-width="80px"
            >
              <el-form-item label="用户名" prop="UserName">
                <el-input
                  v-model="userForm.UserName"
                  placeholder="请输入用户名"
                ></el-input>
              </el-form-item>

              <el-form-item label="邮箱" prop="Email">
                <el-input
                  v-model="userForm.Email"
                  placeholder="请输入邮箱地址"
                ></el-input>
              </el-form-item>

              <el-form-item label="手机号" prop="Phone">
                <el-input
                  v-model="userForm.Phone"
                  placeholder="请输入手机号"
                ></el-input>
              </el-form-item>

              <el-form-item label="性别">
                <el-select
                  v-model="userForm.Gender"
                  placeholder="请选择性别"
                  style="width: 100%"
                >
                  <el-option label="男" :value="1"></el-option>
                  <el-option label="女" :value="2"></el-option>
                  <el-option label="其他" :value="0"></el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="年龄">
                <el-input-number
                  v-model="userForm.Age"
                  :min="1"
                  :max="120"
                  style="width: 100%"
                ></el-input-number>
              </el-form-item>
            </el-form>

            <div v-else class="info-display">
              <div class="info-item">
                <span class="label">用户名:</span>
                <span class="value">{{ userInfo.user_name || '未设置' }}</span>
              </div>
              <div class="info-item">
                <span class="label">用户ID:</span>
                <span class="value">{{ userInfo.user_id || '未知' }}</span>
              </div>
              <div class="info-item">
                <span class="label">邮箱:</span>
                <span class="value">{{ userInfo.email || '未设置' }}</span>
              </div>
              <div class="info-item">
                <span class="label">手机号:</span>
                <span class="value">{{ userInfo.phone || '未设置' }}</span>
              </div>
              <div class="info-item">
                <span class="label">性别:</span>
                <span class="value">{{ getGenderText(userInfo.gender) }}</span>
              </div>
              <div class="info-item">
                <span class="label">年龄:</span>
                <span class="value">{{ userInfo.age || '未设置' }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 账户信息卡片 -->
      <el-card class="info-card" shadow="hover">
        <div slot="header" class="card-header">
          <span class="card-title">账户信息</span>
          <el-button
            type="text"
            icon="el-icon-key"
            @click="changePasswordDialog = true"
            >修改密码</el-button
          >
        </div>

        <div class="account-info">
          <div class="info-item">
            <span class="label">注册时间:</span>
            <span class="value">{{ formatDate(userInfo.created_at) }}</span>
          </div>
          <div class="info-item">
            <span class="label">最后更新:</span>
            <span class="value">{{ formatDate(userInfo.updated_at) }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog
      title="修改密码"
      :visible.sync="changePasswordDialog"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="passwordForm"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="80px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入原密码"
            show-password
          ></el-input>
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          ></el-input>
          <div class="password-tips">
            密码必须包含大写字母、小写字母、数字和特殊字符，长度8-128位
          </div>
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          ></el-input>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button
          @click="
            changePasswordDialog = false;
            resetPasswordForm();
          "
          >取消</el-button
        >
        <el-button
          type="primary"
          :loading="passwordLoading"
          @click="changePassword"
          >确认修改</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { MessageBox } from 'element-ui';
import { mapActions, mapGetters } from 'vuex';
import axios from 'axios';

export default {
  name: 'PersonalHomePage',
  data() {
    return {
      loading: false,
      editMode: false,
      changePasswordDialog: false,
      passwordLoading: false,

      userInfo: {
        user_id: null,
        user_name: '',
        email: '',
        phone: '',
        gender: null,
        age: null,
        created_at: null,
        updated_at: null,
      },

      userForm: {
        UserName: '',
        Email: '',
        Phone: '',
        Gender: null,
        Age: null,
      },

      originalUserForm: {},

      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      },

      userRules: {
        UserName: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 20,
            message: '用户名长度应为3-20个字符',
            trigger: 'blur',
          },
        ],
        Email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
        ],
        Phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          {
            pattern: /^1[3-9]\d{9}$/,
            message: '请输入有效的手机号',
            trigger: 'blur',
          },
        ],
      },

      passwordRules: {
        oldPassword: [
          { required: true, message: '请输入原密码', trigger: 'blur' },
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          {
            min: 8,
            max: 128,
            message: '密码长度应为8-128个字符',
            trigger: 'blur',
          },
          {
            validator: (rule, value, callback) => {
              if (!value) return callback();

              const hasUpper = /[A-Z]/.test(value);
              const hasLower = /[a-z]/.test(value);
              const hasDigit = /\d/.test(value);
              const hasSpecial = /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(value);

              if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
                callback(
                  new Error('密码必须包含大写字母、小写字母、数字和特殊字符')
                );
              } else {
                callback();
              }
            },
            trigger: 'blur',
          },
        ],
        confirmPassword: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value !== this.passwordForm.newPassword) {
                callback(new Error('两次输入的密码不一致'));
              } else {
                callback();
              }
            },
            trigger: 'blur',
          },
        ],
      },
    };
  },

  computed: {
    ...mapGetters('user', ['userId', 'userName', 'isLoggedIn']),
  },

  async created() {
    if (!this.isLoggedIn) {
      this.$message.warning('请先登录');
      this.$router.push('/');
      return;
    }
    await this.loadUserInfo();
  },

  methods: {
    ...mapActions('user', ['logout']),

    async loadUserInfo() {
      this.loading = true;
      try {
        const response = await this.getUserInfo(this.userId);
        this.userInfo = response.data;
        this.userForm = {
          UserName: this.userInfo.user_name,
          Email: this.userInfo.email,
          Phone: this.userInfo.phone,
          Gender: this.userInfo.gender,
          Age: this.userInfo.age,
        };
        this.originalUserForm = { ...this.userForm };
      } catch (error) {
        console.error('加载用户信息失败:', error);
        this.$message.error('加载用户信息失败');
      } finally {
        this.loading = false;
      }
    },

    async getUserInfo(userId) {
      const token =
        localStorage.getItem('token') || this.$store.state.user.token;
      return await axios.get(`/api/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },

    async updateUserInfo(userId, userData) {
      const token =
        localStorage.getItem('token') || this.$store.state.user.token;
      return await axios.put(`/api/user/${userId}`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },

    enterEditMode() {
      this.editMode = true;
      this.originalUserForm = { ...this.userForm };
    },

    cancelEdit() {
      this.editMode = false;
      this.userForm = { ...this.originalUserForm };
    },

    async saveProfile() {
      try {
        await this.$refs.userForm.validate();

        await this.updateUserInfo(this.userId, this.userForm);

        this.$message.success('个人信息更新成功');
        this.editMode = false;

        // 重新加载用户信息
        await this.loadUserInfo();
      } catch (error) {
        console.error('更新用户信息失败:', error);
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          this.$message.error(error.response.data.message);
        } else {
          this.$message.error('更新用户信息失败');
        }
      }
    },

    async changePassword() {
      try {
        await this.$refs.passwordForm.validate();

        this.passwordLoading = true;

        const token =
          localStorage.getItem('token') || this.$store.state.user.token;
        await axios.post(
          '/api/user/change-password',
          {
            OldPassword: this.passwordForm.oldPassword,
            NewPassword: this.passwordForm.newPassword,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        this.$message.success('密码修改成功');
        this.changePasswordDialog = false;
        this.resetPasswordForm();
      } catch (error) {
        console.error('修改密码失败:', error);
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          this.$message.error(error.response.data.message);
        } else {
          this.$message.error('修改密码失败');
        }
      } finally {
        this.passwordLoading = false;
      }
    },

    resetPasswordForm() {
      this.passwordForm = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      };
      if (this.$refs.passwordForm) {
        this.$refs.passwordForm.resetFields();
      }
    },

    formatDate(dateString) {
      if (!dateString) return '未知';
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN');
    },

    getGenderText(gender) {
      const genderMap = {
        1: '男',
        2: '女',
        0: '其他',
      };
      return genderMap[gender] || '未设置';
    },

    confirmLogout() {
      MessageBox.confirm('您确定要退出登录吗？', '确认退出', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.outSubmit();
        })
        .catch(() => {
          console.log('取消退出');
        });
    },

    async outSubmit() {
      try {
        const result = await this.logout();
        console.log(result);
        this.$message.success('退出登录成功！');

        // 清除所有本地存储
        localStorage.clear();

        // 跳转到首页并刷新
        this.$router.push('/');
        setTimeout(() => {
          location.reload();
        }, 500);
      } catch (error) {
        console.error(error);
        this.$message.error(error.message || '退出登录失败');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.personal-home {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

  h2 {
    margin: 0;
    color: #333;
    font-weight: 600;
  }

  .header-right {
    display: flex;
    gap: 12px;
  }
}

.profile-container {
  display: grid;
  gap: 30px;
  grid-template-columns: 1fr;
  max-width: 1200px;
  margin: 0 auto;

  @media (min-width: 768px) {
    grid-template-columns: 2fr 1fr;
  }
}

.info-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0;

    .card-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .card-actions {
      display: flex;
      gap: 8px;
    }
  }
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 30px;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-start;
  }

  .avatar-section {
    display: flex;
    justify-content: center;
    align-items: center;

    .el-avatar {
      border: 4px solid #fff;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }
  }

  .info-section {
    flex: 1;

    .info-display {
      display: grid;
      gap: 15px;

      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .label {
          font-weight: 500;
          color: #666;
          min-width: 80px;
        }

        .value {
          color: #333;
          font-weight: 600;
        }
      }
    }
  }
}

.account-info {
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: 500;
      color: #666;
    }

    .value {
      color: #333;
      font-weight: 600;
    }
  }
}

.password-tips {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  line-height: 1.4;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// Form styling
.el-form {
  .el-form-item {
    margin-bottom: 20px;
  }

  .el-form-item__label {
    color: #333;
    font-weight: 500;
  }
}

// Button hover effects
.el-button {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

// Loading overlay
.el-loading-mask {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
}
</style>
