<template>
  <el-form
    :model="registerForm"
    :rules="registerRules"
    :label-position="labelPosition"
    ref="registerForm"
    @keyup.enter.native="onSubmit"
    class="register-form"
  >
    <el-form-item label="用户名" prop="UserName">
      <el-input
        v-model="registerForm.UserName"
        placeholder="请输入用户名"
        class="register-input"
      ></el-input>
    </el-form-item>
    <el-form-item label="密码" prop="Password">
      <el-input
        v-model="registerForm.Password"
        type="password"
        placeholder="请输入密码（至少8位，包含大小写字母、数字和特殊字符）"
        class="register-input"
        show-password
      ></el-input>
    </el-form-item>
    <el-form-item label="邮箱" prop="Email">
      <el-input
        v-model="registerForm.Email"
        type="email"
        placeholder="请输入邮箱地址"
        class="register-input"
      ></el-input>
    </el-form-item>
    <el-form-item label="手机号" prop="Phone">
      <el-input
        v-model="registerForm.Phone"
        placeholder="请输入手机号"
        class="register-input"
      ></el-input>
    </el-form-item>
    <el-form-item label="性别" prop="Gender">
      <el-select
        v-model="registerForm.Gender"
        placeholder="请选择性别（可选）"
        class="register-input"
        clearable
      >
        <el-option label="男" :value="1"></el-option>
        <el-option label="女" :value="2"></el-option>
        <el-option label="其他" :value="0"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="年龄" prop="Age">
      <el-input-number
        v-model="registerForm.Age"
        :min="1"
        :max="120"
        placeholder="请输入年龄（可选）"
        class="register-input"
        controls-position="right"
      ></el-input-number>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" class="register-btn" @click="onSubmit">
        注册
      </el-button>
    </el-form-item>
    <el-form-item>
      <el-button class="register-btn-secondary" @click="goBack">
        返回
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: 'Register',
  data() {
    return {
      labelPosition: 'top',
      registerForm: {
        UserName: '',
        Password: '',
        Email: '',
        Phone: '',
        Gender: null,
        Age: null,
      },
      registerRules: {
        UserName: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 20,
            message: '用户名长度应为3-20个字符',
            trigger: 'blur',
          },
        ],
        Password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
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
        Gender: [],
        Age: [{ type: 'number', message: '年龄必须为数字', trigger: 'blur' }],
      },
    };
  },
  methods: {
    async onSubmit() {
      try {
        console.log('开始注册流程...');

        // 验证表单
        await this.$refs.registerForm.validate();
        console.log('表单验证通过');

        // 准备数据
        const registerData = {
          UserName: this.registerForm.UserName,
          Password: this.registerForm.Password,
          Email: this.registerForm.Email,
          Phone: this.registerForm.Phone,
          Gender: this.registerForm.Gender || '',
          Age: this.registerForm.Age || 0,
        };

        console.log('准备发送的注册数据:', registerData);

        // 调用注册API
        const result = await this.$store.dispatch(
          'user/register',
          registerData
        );
        console.log('注册API返回结果:', result);

        if (result.success) {
          // 显示注册成功的详细信息弹窗
          this.showRegistrationSuccessDialog(result);

          // 清空表单
          this.resetForm();

          // 延迟跳转到首页
          setTimeout(() => {
            this.$router.push('/');
          }, 3000);
        } else {
          console.error('注册失败，错误信息:', result.message);
          throw new Error(result.message || '注册失败');
        }
      } catch (error) {
        console.error('注册过程中发生错误:', error);
        console.error('错误详情:', {
          message: error.message,
          response: error.response,
          stack: error.stack,
        });

        let errorMessage = '注册失败，请重试';

        if (error.response) {
          console.error('HTTP错误响应:', error.response.data);
          errorMessage =
            error.response.data.message ||
            error.response.data.error ||
            errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.$message.error(errorMessage);
      }
    },

    showRegistrationSuccessDialog(result) {
      const h = this.$createElement;

      this.$msgbox({
        title: '注册成功！',
        message: h('div', { style: 'text-align: left; line-height: 1.6;' }, [
          h(
            'p',
            {
              style: 'color: #67C23A; font-weight: bold; margin-bottom: 15px;',
            },
            '🎉 欢迎加入RAZOR-AI！'
          ),

          h(
            'div',
            {
              style:
                'background: #f5f7fa; padding: 15px; border-radius: 8px; margin: 10px 0;',
            },
            [
              h(
                'p',
                { style: 'margin: 5px 0; font-weight: bold; color: #303133;' },
                '您的账户信息：'
              ),
              h('p', { style: 'margin: 5px 0;' }, [
                h('span', { style: 'color: #909399;' }, '用户名: '),
                h(
                  'span',
                  { style: 'font-weight: bold; color: #409EFF;' },
                  this.registerForm.UserName
                ),
              ]),
              h('p', { style: 'margin: 5px 0;' }, [
                h('span', { style: 'color: #909399;' }, '账号ID: '),
                h(
                  'span',
                  {
                    style:
                      'font-weight: bold; color: #E6A23C; font-size: 18px;',
                  },
                  result.user_id || '待分配'
                ),
              ]),
              h('p', { style: 'margin: 5px 0;' }, [
                h('span', { style: 'color: #909399;' }, '邮箱: '),
                h(
                  'span',
                  { style: 'color: #303133;' },
                  this.registerForm.Email
                ),
              ]),
              h('p', { style: 'margin: 5px 0;' }, [
                h('span', { style: 'color: #909399;' }, '注册时间: '),
                h(
                  'span',
                  { style: 'color: #303133;' },
                  new Date().toLocaleString()
                ),
              ]),
            ]
          ),

          h(
            'div',
            {
              style:
                'background: #e8f4fd; padding: 12px; border-radius: 6px; border-left: 4px solid #409EFF; margin: 10px 0;',
            },
            [
              h(
                'p',
                { style: 'margin: 0; color: #409EFF; font-weight: bold;' },
                '💡 重要提示：'
              ),
              h(
                'p',
                {
                  style: 'margin: 5px 0 0 0; color: #606266; font-size: 14px;',
                },
                result.user_id
                  ? '请牢记您的账号ID，这将是您登录和找回密码的重要凭证！'
                  : '您的账号ID将在系统处理完成后分配，请稍后查看个人中心。'
              ),
            ]
          ),

          h(
            'div',
            {
              style:
                'background: #f0f9ff; padding: 12px; border-radius: 6px; border-left: 4px solid #67C23A; margin: 10px 0;',
            },
            [
              h(
                'p',
                { style: 'margin: 0; color: #67C23A; font-weight: bold;' },
                '🎁 新用户福利：'
              ),
              h(
                'p',
                {
                  style: 'margin: 5px 0 0 0; color: #606266; font-size: 14px;',
                },
                '您已获得100积分的新用户注册奖励！'
              ),
            ]
          ),

          h(
            'p',
            { style: 'margin-top: 15px; text-align: center; color: #909399;' },
            '页面将在3秒后自动跳转到首页...'
          ),
        ]),
        showCancelButton: false,
        confirmButtonText: '我知道了',
        confirmButtonClass: 'el-button--success',
        customClass: 'registration-success-dialog',
      })
        .then(() => {
          this.$router.push('/');
        })
        .catch(() => {
          this.$router.push('/');
        });
    },

    resetForm() {
      this.registerForm.UserName = '';
      this.registerForm.Password = '';
      this.registerForm.Email = '';
      this.registerForm.Phone = '';
      this.registerForm.Gender = null;
      this.registerForm.Age = null;
    },

    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins.scss' as *;
@use '@/assets/styles/variables.scss' as *;
.register-form {
  width: 100%;
  max-width: 500px;
  margin: 100px auto;
  padding: 30px;
  background: $card-background-color;
  border-radius: 10px;
  box-shadow: $box-shadow-medium;
  font-family: 'Roboto', sans-serif;
}

/* 输入框样式 */
.register-input {
  width: 100%;
}

.register-input .el-input__inner {
  width: 100%;
  border-radius: 25px;
  padding: 12px 20px;
  padding-right: 45px; /* 为密码显示按钮留出空间 */
  font-size: 16px;
  background: rgba(255, 255, 255, 0.1);
  color: $text-color;
  border: 1px solid $border-color;
  transition: all 0.3s ease;
}

.register-input .el-input__inner:hover,
.register-input .el-input__inner:focus {
  border-color: $accent-color;
  background: rgba(255, 255, 255, 0.2);
}

/* 密码显示按钮样式调整 */
.register-input .el-input__suffix {
  right: 12px; /* 调整按钮位置，确保在边框内 */
  top: 50%;
  transform: translateY(-50%);
}

.register-input .el-input__suffix-inner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-input .el-input__suffix-inner .el-input__icon {
  color: $text-color;
  font-size: 18px;
  cursor: pointer;
  padding: 2px;
}

/* 按钮样式 */
.register-btn {
  width: 100%;
  margin-top: 20px;
  padding: 15px;
  font-size: 18px;
  border-radius: 50px;
  background: $accent-color;
  color: white;
  transition:
    background 0.3s ease,
    transform 0.3s ease;
  box-shadow: $box-shadow-light;
}

.register-btn:hover {
  background: $accent-hover-color;
  transform: translateY(-3px); /* 鼠标悬浮时抬升效果 */
}

.register-btn:active {
  transform: translateY(2px); /* 点击时下压效果 */
}

.register-btn-secondary {
  width: 100%;
  margin-top: 10px;
  padding: 15px;
  font-size: 18px;
  border-radius: 50px;
  background: $secondary-color;
  color: $text-color;
  transition:
    background 0.3s ease,
    transform 0.3s ease;
  box-shadow: $box-shadow-light;
}

.register-btn-secondary:hover {
  background: $hover-background-color;
  transform: translateY(-3px); /* 鼠标悬浮时抬升效果 */
}

.register-btn-secondary:active {
  transform: translateY(2px); /* 点击时下压效果 */
}

/* 表单标签 */
.el-form-item label {
  font-size: 16px;
  font-weight: bold;
  color: $text-color;
  margin-bottom: 10px;
}

/* 注册成功弹窗自定义样式 */
:deep(.registration-success-dialog) {
  .el-message-box {
    width: 480px;
    border-radius: 12px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  }

  .el-message-box__title {
    font-size: 20px;
    font-weight: bold;
    color: #67c23a;
  }

  .el-message-box__content {
    padding: 20px 25px;
  }

  .el-button--success {
    background: #67c23a;
    border-color: #67c23a;
    padding: 12px 30px;
    font-size: 16px;
    border-radius: 25px;
    transition: all 0.3s ease;
  }

  .el-button--success:hover {
    background: #85ce61;
    border-color: #85ce61;
    transform: translateY(-2px);
  }
}
</style>
