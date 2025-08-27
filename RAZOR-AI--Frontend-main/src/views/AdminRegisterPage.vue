<template>
  <div class="admin-login" @click.self="handleOutsideClick">
    <div class="login-container">
      <el-form
        :model="registerForm"
        :rules="registerRules"
        ref="registerForm"
        @keyup.enter.native="onSubmit"
        v-loading="isLoading"
      >
        <el-form-item label="管理员名称" prop="adminName">
          <el-input
            v-model="registerForm.adminName"
            placeholder="管理员名称"
            prefix-icon="el-icon-user"
          ></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="邮箱"
            prefix-icon="el-icon-message"
          ></el-input>
        </el-form-item>
        <el-form-item label="电话号码（可选）" prop="phone">
          <el-input
            v-model="registerForm.phone"
            placeholder="可不填"
            prefix-icon="el-icon-phone"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="el-icon-lock"
          ></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="确认密码"
            prefix-icon="el-icon-lock"
          ></el-input>
        </el-form-item>
        <el-form-item label="注册理由" prop="RegistrationReason">
          <el-input
            v-model="registerForm.RegistrationReason"
            type="textarea"
            placeholder="请填写注册理由"
            :rows="3"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="onSubmit"
            class="login-button"
            :loading="isLoading"
            >注册</el-button
          >
          <el-button type="text" @click="goToLogin" class="login-link-button"
            >登录</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminRegisterPage',
  data() {
    return {
      registerForm: {
        adminName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        RegistrationReason: '',
      },
      registerRules: {
        adminName: [
          { required: true, message: '请输入管理员名称', trigger: 'blur' },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change'],
          },
        ],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        confirmPassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value !== this.registerForm.password) {
                callback(new Error('两次输入密码不一致!'));
              } else {
                callback();
              }
            },
            trigger: ['blur', 'change'],
          },
        ],
        RegistrationReason: [
          { required: true, message: '请填写注册理由', trigger: 'blur' },
        ],
      },
      isLoading: false,
    };
  },
  methods: {
    handleOutsideClick() {
      // 空方法处理点击外部事件
    },
    goToLogin() {
      this.$router.push('/admin/login');
    },
    async onSubmit() {
      this.$refs.registerForm.validate(async (valid) => {
        if (valid) {
          this.isLoading = true;
          try {
            const payload = {
              AdminName: this.registerForm.adminName,
              Email: this.registerForm.email,
              Password: this.registerForm.password,
              RegistrationReason: this.registerForm.RegistrationReason,
            };
            if (this.registerForm.phone) {
              payload.Phone = this.registerForm.phone;
            }
            const response = await this.$axios.post(
              'http://47.99.66.142:5253/api/admin/register',
              payload
            );
            if (response.data.success) {
              this.$message.success(response.data.message || '注册成功');
              this.registerForm = {
                adminName: '',
                email: '',
                password: '',
                confirmPassword: '',
                phone: '',
                RegistrationReason: '',
              };
            } else {
              this.$message.error(response.data.message || '注册失败');
            }
          } catch (error) {
            // 优化：显示后端返回的具体错误信息
            let msg = '注册失败，请检查控制台';
            if (
              error.response &&
              error.response.data &&
              error.response.data.message
            ) {
              msg = error.response.data.message;
            } else if (error.message) {
              msg = error.message;
            }
            this.$message.error(msg);
            console.error(error);
            console.error(error.response?.data);
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
  border-radius: 5px;
  width: 400px;
}

.login-button {
  width: 100%;
  margin-top: 20px;
}
</style>
