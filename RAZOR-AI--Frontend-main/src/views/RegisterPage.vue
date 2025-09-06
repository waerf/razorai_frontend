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
      <div style="font-size: 12px; color: #909399; margin-top: 2px">
        用户名只能包含字母、数字、下划线和中文，3-20个字符
      </div>
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
        placeholder="请输入手机号（可选）"
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
        Gender: 0, // 默认选择"其他"
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
          {
            validator: (rule, value, callback) => {
              if (!value) {
                callback();
                return;
              }

              // 用户名只允许字母、数字、下划线和中文
              const usernamePattern = /^[a-zA-Z0-9_\u4e00-\u9fa5]{3,20}$/;

              if (!usernamePattern.test(value)) {
                callback(
                  new Error(
                    '用户名只能包含字母、数字、下划线和中文，不允许特殊字符（如@等）'
                  )
                );
              } else {
                callback();
              }
            },
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
          Phone: this.registerForm.Phone || 'N/A', // 如果手机号为空，发送默认值
          Gender:
            this.registerForm.Gender !== null ? this.registerForm.Gender : '',
          Age: this.registerForm.Age || 0,
        };

        console.log('原始表单数据:', this.registerForm);
        console.log('准备发送的注册数据:', registerData);
        console.log('性别值详情:', {
          原始值: this.registerForm.Gender,
          类型: typeof this.registerForm.Gender,
          处理后的值: registerData.Gender,
          处理后的类型: typeof registerData.Gender,
        });

        // 调用注册API
        const result = await this.$store.dispatch(
          'user/register',
          registerData
        );
        console.log('注册API返回结果:', result);

        if (result.success) {
          console.log('注册成功！');

          // 注册成功消息
          this.$message.success('注册成功！系统已为您发放100积分注册奖励');

          // 显示注册成功弹窗
          await this.showInfoformRegister(result);

          // 清空表单
          this.resetForm();

          // 检查当前路由，避免重复导航
          if (this.$route.path === '/') {
            // 如果已经在首页，直接打开登录弹窗
            this.$nextTick(() => {
              this.$root.$emit('openLoginDialog');
            });
          } else {
            // 否则跳转到首页并打开登录弹窗
            this.$router
              .push('/')
              .then(() => {
                this.$nextTick(() => {
                  this.$root.$emit('openLoginDialog');
                });
              })
              .catch((err) => {
                // 捕获重复导航错误，但仍然打开登录弹窗
                if (err.name !== 'NavigationDuplicated') {
                  console.error('路由跳转错误:', err);
                }
                this.$nextTick(() => {
                  this.$root.$emit('openLoginDialog');
                });
              });
          }
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
        let duration = 3000; // 默认显示时间

        if (error.response) {
          console.error('HTTP错误响应:', error.response.data);
          const responseData = error.response.data;

          const errorMsg = responseData.message || responseData.error;

          if (errorMsg.includes('邮箱已注册')) {
            errorMessage = '该邮箱已被注册，请您使用其他邮箱注册';
            duration = 6000; // 显示更长时间
          } else if (errorMsg.includes('用户名已存在')) {
            errorMessage = '该用户名已被使用，请更换其他用户名';
          } else if (
            errorMsg.includes('手机号已存在') ||
            errorMsg.includes('手机号已注册')
          ) {
            errorMessage = '该手机号已被注册，请使用其他手机号注册';
            duration = 6000; // 显示更长时间
          } else {
            errorMessage = errorMsg || errorMessage;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.$message({
          message: errorMessage,
          type: 'warning',
          duration: duration,
          showClose: true,
          dangerouslyUseHTMLString: false,
        });
      }
    },

    showInfoformRegister(result) {
      const h = this.$createElement;

      // 返回一个Promise
      return new Promise((resolve) => {
        this.$msgbox({
          title: '注册成功！',
          message: h('p', null, [
            h('span', null, `🎉 欢迎加入RAZOR-AI！`),
            h('p', null, [
              h(
                'span',
                { style: 'font-weight: bold; color: #409EFF;' },
                `用户名: ${this.registerForm.UserName}`
              ),
            ]),
            h('p', null, [
              h(
                'span',
                { style: 'font-weight: bold; color: #67C23A;' },
                `注册状态: ${result.success ? '成功' : '失败'}`
              ),
            ]),
            h(
              'div',
              {
                style:
                  'margin: 15px 0; padding: 10px; background: #f0f9ff; border-left: 4px solid #409eff; border-radius: 4px;',
              },
              [
                h(
                  'p',
                  {
                    style:
                      'margin: 0 0 8px 0; font-weight: bold; color: #409eff;',
                  },
                  '🎁 新用户注册奖励'
                ),
                h(
                  'p',
                  { style: 'margin: 0 0 5px 0; font-size: 14px; color: #333;' },
                  '✨ 您已获得 100 积分奖励'
                ),
                h(
                  'p',
                  { style: 'margin: 0 0 5px 0; font-size: 12px; color: #666;' },
                  '积分可用于购买机器人功能、解锁高级服务等'
                ),
                h(
                  'p',
                  { style: 'margin: 0; font-size: 12px; color: #409eff;' },
                  '💡 登录后可在个人主页查看积分明细'
                ),
              ]
            ),
          ]),
          confirmButtonText: '确定',
          beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true; // 开启确定按钮的加载状态
              instance.confirmButtonText = '注册成功，正在跳转首页'; // 修改确定按钮的文字
              setTimeout(() => {
                done(); // 关闭弹窗
                resolve(); // 执行resolve，标记Promise完成
                instance.confirmButtonLoading = false; // 恢复按钮状态

                // 检查当前路由，避免重复导航
                if (this.$route.path === '/') {
                  // 如果已经在首页，直接打开登录弹窗
                  this.$nextTick(() => {
                    this.$root.$emit('openLoginDialog');
                  });
                } else {
                  // 否则跳转到首页并打开登录弹窗
                  this.$router
                    .push('/')
                    .then(() => {
                      this.$nextTick(() => {
                        this.$root.$emit('openLoginDialog');
                      });
                    })
                    .catch((err) => {
                      // 捕获重复导航错误，但仍然打开登录弹窗
                      if (err.name !== 'NavigationDuplicated') {
                        console.error('路由跳转错误:', err);
                      }
                      this.$nextTick(() => {
                        this.$root.$emit('openLoginDialog');
                      });
                    });
                }
              }, 500); // 延迟0.5秒，等待弹窗的用户交互
            } else if (action === 'cancel' || action === 'close') {
              // 用户点击X按钮或取消按钮也跳转到首页
              done();
              resolve(); // 确保Promise正常完成
              // 检查当前路由，避免重复导航
              if (this.$route.path === '/') {
                // 如果已经在首页，直接打开登录弹窗
                this.$nextTick(() => {
                  this.$root.$emit('openLoginDialog');
                });
              } else {
                // 否则跳转到首页并打开登录弹窗
                this.$router
                  .push('/')
                  .then(() => {
                    this.$nextTick(() => {
                      this.$root.$emit('openLoginDialog');
                    });
                  })
                  .catch((err) => {
                    // 捕获重复导航错误，但仍然打开登录弹窗
                    if (err.name !== 'NavigationDuplicated') {
                      console.error('路由跳转错误:', err);
                    }
                    this.$nextTick(() => {
                      this.$root.$emit('openLoginDialog');
                    });
                  });
              }
            } else {
              // 其他情况直接关闭
              done();
              resolve();
            }
          },
        });
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
</style>
