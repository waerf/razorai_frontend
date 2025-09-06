<!-- src/components/LoginForm.vue -->
<template>
  <el-form
    :model="loginForm"
    :rules="loginRules"
    ref="loginForm"
    @keyup.enter.native="onSubmit"
    v-loading="isLoading"
  >
    <el-form-item label="账号" prop="identifier">
      <el-input
        v-model="loginForm.identifier"
        placeholder="用户名/邮箱/手机号"
        prefix-icon="el-icon-user"
      ></el-input>
      <div style="font-size: 12px; color: #909399; margin-top: 2px">
        支持用户名、邮箱或手机号登录
      </div>
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input
        v-model="loginForm.password"
        type="password"
        placeholder="请输入密码"
        prefix-icon="el-icon-lock"
        show-password
      ></el-input>
    </el-form-item>
    <el-form-item>
      <div class="form-footer">
        <div class="register-prompt">
          <span>没有账户？</span>
          <el-button type="text" @click="handleRegister">点击注册</el-button>
        </div>
      </div>
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        @click="onSubmit"
        class="login-button"
        :loading="isLoading"
        >登录</el-button
      >
      <el-button class="login-button" @click="closeDialog">取消</el-button>
      <el-button type="text" @click="handleAdminLogin" style="margin-left: 10px"
        >管理员登录</el-button
      >
    </el-form-item>
  </el-form>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'LoginForm',
  data() {
    return {
      loginForm: {
        identifier: '',
        password: '',
      },
      loginRules: {
        identifier: [
          { required: true, message: '请输入账号', trigger: 'blur' },
          { min: 2, message: '账号至少2个字符', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (!value) {
                callback();
                return;
              }

              // 检查是否是有效的格式（用户名、邮箱或手机号）
              const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
              const isPhone = /^1[3-9]\d{9}$/.test(value);
              const isUsername = /^[a-zA-Z0-9_\u4e00-\u9fa5]{2,20}$/.test(
                value
              );

              if (!isEmail && !isPhone && !isUsername) {
                callback(new Error('请输入有效的用户名、邮箱或手机号'));
              } else {
                callback();
              }
            },
            trigger: 'blur',
          },
        ],
        password: [
          { required: true, message: '请输入您的密码', trigger: 'blur' },
        ],
      },
      isLoading: false,
    };
  },
  computed: {
    ...mapGetters('user', ['isLoggedIn', 'user_id']), // 指定 user 命名空间
  },
  methods: {
    ...mapActions('user', ['login']), // 映射 user 模块中的 login 方法
    async onSubmit() {
      this.$refs.loginForm.validate(async (valid) => {
        if (valid) {
          this.isLoading = true; // 开始加载状态
          try {
            // 调用Vuex中user模块的login方法
            const result = await this.login({
              Identifier: this.loginForm.identifier, // 使用后端期望的参数名
              Password: this.loginForm.password, // 使用后端期望的参数名
            });
            console.log('isLoggedIn in LoginForm:', this.isLoggedIn);
            if (result.success) {
              this.$message.success(result.message || '登录成功！'); // 提示登录成功
              this.closeDialog(); // 关闭对话框
              // 登录成功时刷新页面以更新登录状态
              setTimeout(() => {
                location.reload();
              }, 500); // 延迟0.5秒让用户看到成功消息
            } else {
              this.$message.error(
                result.message || '登录失败，请检查用户名和密码'
              ); // 提示登录失败
              // 登录失败时不刷新页面，保持在当前界面
            }
          } catch (error) {
            console.error(error); // 打印错误信息
            this.$message.error(error.message || '登录失败，打开控制台检查');
            // 登录失败时不刷新页面
          } finally {
            // 无论成功或失败都会执行
            this.isLoading = false; // 结束加载状态
            // 移除了无条件的页面刷新
          }
        } else {
          // 获取具体的验证错误信息
          this.$refs.loginForm.validate((valid, errorFields) => {
            if (!valid && errorFields) {
              const errorMessages = [];
              Object.keys(errorFields).forEach((field) => {
                errorFields[field].forEach((error) => {
                  errorMessages.push(error.message);
                });
              });
              this.$message.error(errorMessages.join('；'));
            } else {
              this.$message.error('请检查输入信息是否正确');
            }
          });
        }
      });
    },
    closeDialog() {
      this.$emit('close'); // 触发关闭事件
      this.resetForm(); // 重置表单
    },
    resetForm() {
      this.loginForm.identifier = '';
      this.loginForm.password = '';
    },
    navigateTo(route) {
      if (this.$route.name !== route) {
        this.$router.push({ name: route });
      }
    },
    handleRegister() {
      this.closeDialog(); // 关闭对话框
      this.navigateTo('Register'); // 跳转到注册页面
    },
    handleAdminLogin() {
      this.closeDialog(); // 关闭对话框
      this.navigateTo('AdminLogin'); // 跳转到管理员登录页面
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins.scss' as *;
@use '@/assets/styles/variables.scss' as *;
.login-button {
  margin-right: 10px;
  color: $text-color; /* 文字颜色 */
  background-color: $primary-color; /* 主色调背景 */
  border-color: $text-color; /* 边框颜色 */
  &:hover {
    color: $text-color; /* 文字颜色 */
    background-color: $hover-text-color; /* 主色调背景 */
    border-color: $text-color; /* 边框颜色 */
  }
}
.form-footer {
  display: flex;
  justify-content: space-between; /* 在左右两边对齐 */
  align-items: center; /* 垂直居中对齐 */
}

.register-prompt {
  display: flex;
  align-items: center; /* 垂直居中对齐 */
}
</style>
