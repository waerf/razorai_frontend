<template>
  <div class="admin-login" @click.self="handleOutsideClick">
    <div class="login-container">
      <el-form
        :model="loginForm"
        :rules="loginRules"
        ref="loginForm"
        @keyup.enter.native="onSubmit"
        v-loading="isLoading"
      >
        <el-form-item label="账号 (ID/邮箱/手机号)" prop="identifier">
          <el-input
            v-model="loginForm.identifier"
            placeholder="请输入管理员账号、邮箱或手机号"
            prefix-icon="el-icon-user"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="el-icon-lock"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="onSubmit"
            class="login-button"
            :loading="isLoading"
            >登录</el-button
          >
          <el-button type="text" @click="goToRegister" class="register-button"
            >注册</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import MyStorage from '@/utils/storage';
import { adminLogin } from '@/utils/api';
export default {
  name: 'AdminLoginPage',
  data() {
    return {
      loginForm: {
        identifier: '',
        password: '',
      },
      loginRules: {
        identifier: [
          {
            required: true,
            message: '请输入账号/邮箱/手机号',
            trigger: 'blur',
          },
        ],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
      },
      isLoading: false,
    };
  },
  methods: {
    handleOutsideClick() {
      // 空方法处理点击外部事件
    },
    goToRegister() {
      this.$router.push('/admin/register');
    },
    async onSubmit() {
      this.$refs.loginForm.validate(async (valid) => {
        if (valid) {
          this.isLoading = true;
          try {
            const response = await adminLogin({
              identifier: this.loginForm.identifier,
              password: this.loginForm.password,
            });

            if (response.data.success) {
              this.$message.success('登录成功！');
              MyStorage.set('admin_token', response.data.token);
              this.$router.push('/admin');
            } else {
              this.$message.error(response.data.message || '登录失败');
            }
          } catch (error) {
            console.error(error);
            this.$message.error(error.message || '登录失败，请检查控制台');
          } finally {
            this.isLoading = false;
          }
        } else {
          this.$message.error('请正确填写表单');
        }
      });
    },
  },
};
</script>

<style scoped>
/* 全局卡片圆角统一 */
:deep(.el-card) {
  border-radius: 12px !important;
}

/* 按钮圆角统一 */
:deep(.el-button) {
  border-radius: 12px !important;
}

.admin-login {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.login-container {
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  width: 400px;
}

.login-button {
  width: 100%;
  margin-top: 20px;
}
</style>
