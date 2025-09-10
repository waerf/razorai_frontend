<template>
  <div class="register-page">
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

      <!-- 头像设置 -->
      <el-form-item label="头像设置" prop="AvatarURL">
        <div class="avatar-section">
          <div class="avatar-preview">
            <img
              :src="registerForm.AvatarURL || defaultAvatar"
              alt="头像预览"
              class="avatar-image"
              @error="handleAvatarError"
            />
            <div class="avatar-overlay" @click="triggerFileInput">
              <i class="el-icon-camera"></i>
              <span>选择头像</span>
            </div>
          </div>
          <input
            ref="avatarInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleAvatarChange"
          />
          <div class="avatar-actions">
            <el-button
              size="mini"
              type="primary"
              @click="triggerFileInput"
              :loading="avatarUploading"
            >
              {{ avatarUploading ? '上传中...' : '选择头像' }}
            </el-button>
            <el-button
              size="mini"
              type="info"
              @click="useDefaultAvatar"
              v-if="registerForm.AvatarURL"
            >
              使用默认头像
            </el-button>
          </div>
          <div class="avatar-tip">
            <p>• 支持 JPG、PNG 格式，建议尺寸：200x200像素</p>
            <p>• 文件大小不超过 5MB</p>
            <p>• 头像为可选项，不设置将使用默认头像</p>
          </div>
        </div>
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

    <!-- 头像裁剪对话框 -->
    <el-dialog
      title="头像裁剪"
      :visible.sync="avatarPreviewVisible"
      width="600px"
      @close="resetAvatarPreview"
    >
      <div class="avatar-cropper-content" v-loading="avatarUploading">
        <div class="cropper-section">
          <div class="cropper-container">
            <vue-cropper
              ref="cropper"
              :img="cropperOption.img"
              :outputSize="cropperOption.outputSize"
              :outputType="cropperOption.outputType"
              :info="cropperOption.info"
              :canScale="cropperOption.canScale"
              :autoCrop="cropperOption.autoCrop"
              :autoCropWidth="cropperOption.autoCropWidth"
              :autoCropHeight="cropperOption.autoCropHeight"
              :fixedBox="cropperOption.fixedBox"
              :fixed="cropperOption.fixed"
              :fixedNumber="cropperOption.fixedNumber"
              :full="cropperOption.full"
              :canMoveBox="cropperOption.canMoveBox"
              :original="cropperOption.original"
              :centerBox="cropperOption.centerBox"
              :height="cropperOption.height"
              :infoTrue="cropperOption.infoTrue"
              :maxImgSize="cropperOption.maxImgSize"
              :enlarge="cropperOption.enlarge"
              :mode="cropperOption.mode"
              :canMove="cropperOption.canMove"
              :canChangeScale="cropperOption.canChangeScale"
              :limitMinSize="cropperOption.limitMinSize"
              :high="cropperOption.high"
              @crop-moving="updateCirclePreview"
              @real-time="updateCirclePreview"
            ></vue-cropper>
          </div>

          <div class="preview-section">
            <h4>圆形头像预览</h4>
            <div class="circle-preview" ref="circlePreview">
              <!-- 圆形预览将通过JavaScript动态生成 -->
            </div>
          </div>
        </div>

        <div class="cropper-controls">
          <el-button-group>
            <el-button size="mini" @click="rotateLeft">
              <i class="el-icon-refresh-left"></i> 左转
            </el-button>
            <el-button size="mini" @click="rotateRight">
              <i class="el-icon-refresh-right"></i> 右转
            </el-button>
            <el-button size="mini" @click="scaleUp">
              <i class="el-icon-zoom-in"></i> 放大
            </el-button>
            <el-button size="mini" @click="scaleDown">
              <i class="el-icon-zoom-out"></i> 缩小
            </el-button>
          </el-button-group>
        </div>

        <div class="upload-tip">
          <p>• 拖动图片调整位置，拖动边框调整大小</p>
          <p>• 滚轮缩放，双击重置</p>
          <p>• 头像将被裁剪为圆形</p>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="avatarPreviewVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="confirmAvatarUpload"
          :loading="avatarUploading"
        >
          {{ avatarUploading ? '上传中...' : '确认上传' }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { VueCropper } from 'vue-cropper';

export default {
  name: 'Register',
  components: {
    VueCropper,
  },
  data() {
    return {
      labelPosition: 'top',
      avatarUploading: false,
      avatarPreviewVisible: false,
      currentAvatarFile: null,
      defaultAvatar: 'https://picsum.photos/id/1000/40/40',
      registerForm: {
        UserName: '',
        Password: '',
        Email: '',
        Phone: '',
        Gender: 0, // 默认选择"其他"
        Age: null,
        AvatarURL: '', // 头像URL
      },

      // 裁剪器配置
      cropperOption: {
        img: '', // 裁剪图片的地址
        outputSize: 1, // 裁剪生成图片的质量
        outputType: 'png', // 裁剪生成图片的格式
        info: true, // 图片大小信息
        canScale: true, // 图片是否允许滚轮缩放
        autoCrop: true, // 是否默认生成截图框
        autoCropWidth: 200, // 默认生成截图框宽度
        autoCropHeight: 200, // 默认生成截图框高度
        fixedBox: false, // 固定截图框大小
        fixed: true, // 是否开启截图框宽高固定比例
        fixedNumber: [1, 1], // 截图框的宽高比例
        full: false, // 是否输出原图比例的截图
        canMoveBox: true, // 截图框能否拖动
        original: false, // 上传图片按照原始比例渲染
        centerBox: true, // 截图框是否被限制在图片里面
        height: true, // 是否按照设备的dpr 输出等比例图片
        infoTrue: true, // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
        maxImgSize: 3000, // 限制图片最大宽度和高度
        enlarge: 1, // 图片根据截图框输出比例倍数
        mode: 'contain', // 图片默认渲染方式
        canMove: true, // 上传图片是否可以移动
        canChangeScale: true, // 是否可以改变截图框大小
        limitMinSize: 50, // 截图框最小尺寸
        high: true, // 是否按照设备的dpr 输出等比例图片
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
          AvatarURL: this.registerForm.AvatarURL || null, // 头像URL，可选
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

          // 显示注册成功弹窗（弹窗内部会处理导航）
          this.showInfoformRegister(result);

          // 清空表单
          this.resetForm();
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

      // 不使用Promise，直接处理弹窗
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
            instance.confirmButtonLoading = true;
            instance.confirmButtonText = '注册成功，正在跳转首页';
            setTimeout(() => {
              done();
              instance.confirmButtonLoading = false;
              // 确认按钮：导航到首页并打开登录弹窗
              this.navigateToHome();
            }, 500);
          } else {
            // 用户点击 X 按钮或其他关闭操作：与确认按钮相同的功能
            done();
            this.navigateToHome();
          }
        },
      }).catch(() => {
        // 捕获所有可能的错误，包括用户取消操作
        console.log('用户取消了弹窗操作');
        this.navigateToHome();
      });
    },

    resetForm() {
      this.registerForm.UserName = '';
      this.registerForm.Password = '';
      this.registerForm.Email = '';
      this.registerForm.Phone = '';
      this.registerForm.Gender = null;
      this.registerForm.Age = null;
      this.registerForm.AvatarURL = '';
      this.avatarUploading = false;
      this.avatarPreviewVisible = false;
      this.resetAvatarPreview();
    },

    // 头像相关方法
    handleAvatarError() {
      console.log('[注册头像] 头像加载失败，使用默认头像');
      this.registerForm.AvatarURL = this.defaultAvatar;
    },

    triggerFileInput() {
      if (this.avatarUploading) return;
      this.$refs.avatarInput.click();
    },

    async handleAvatarChange(event) {
      const file = event.target.files[0];
      if (!file) return;

      // 基本文件验证
      if (!file.type.startsWith('image/')) {
        this.$message.error('请选择图片文件');
        return;
      }

      // 文件大小限制 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.$message.error('图片大小不能超过 5MB');
        return;
      }

      try {
        // 创建图片URL供裁剪器使用
        const imageUrl = URL.createObjectURL(file);
        this.cropperOption.img = imageUrl;
        this.currentAvatarFile = file;

        // 显示裁剪对话框
        this.avatarPreviewVisible = true;

        // 延迟一下确保对话框完全打开后再初始化预览
        this.$nextTick(() => {
          this.updateCirclePreview();
        });
      } catch (error) {
        console.error('头像预览失败:', error);
        this.$message.error('头像预览失败：' + error.message);
      } finally {
        // 清空文件输入框
        this.$refs.avatarInput.value = '';
      }
    },

    // 裁剪器控制方法
    rotateLeft() {
      this.$refs.cropper.rotateLeft();
      this.updateCirclePreview();
    },

    rotateRight() {
      this.$refs.cropper.rotateRight();
      this.updateCirclePreview();
    },

    scaleUp() {
      this.$refs.cropper.changeScale(1);
      this.updateCirclePreview();
    },

    scaleDown() {
      this.$refs.cropper.changeScale(-1);
      this.updateCirclePreview();
    },

    // 更新圆形预览
    updateCirclePreview() {
      this.$nextTick(() => {
        if (this.$refs.cropper) {
          this.$refs.cropper.getCropData((data) => {
            if (this.$refs.circlePreview) {
              this.$refs.circlePreview.innerHTML = `
                <div style="
                  width: 100px;
                  height: 100px;
                  border-radius: 50%;
                  overflow: hidden;
                  margin: 0 auto;
                  background: #f5f5f5;
                ">
                  <img src="${data}" style="
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                  " />
                </div>
              `;
            }
          });
        }
      });
    },

    async confirmAvatarUpload() {
      if (!this.$refs.cropper) return;

      try {
        this.avatarUploading = true;
        this.$message.info('正在生成裁剪图片...');

        // 获取裁剪后的blob数据
        this.$refs.cropper.getCropBlob((blob) => {
          this.uploadCroppedImage(blob);
        });
      } catch (error) {
        console.error('头像上传失败:', error);
        this.$message.error('头像上传失败：' + error.message);
        this.avatarUploading = false;
      }
    },

    async uploadCroppedImage(blob) {
      try {
        this.$message.info('正在上传头像...');

        // 创建FormData
        const formData = new FormData();
        formData.append('file', blob, 'avatar.png');

        // 调用Python服务上传图片
        const response = await fetch('http://localhost:5000/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          // 上传成功，更新头像URL
          this.registerForm.AvatarURL = result.url;
          this.$message.success('头像上传成功！');
          this.avatarPreviewVisible = false;
        } else {
          throw new Error(result.error || '上传失败');
        }
      } catch (error) {
        console.error('头像上传失败:', error);
        this.$message.error('头像上传失败：' + error.message);
      } finally {
        this.avatarUploading = false;
      }
    },

    resetAvatarPreview() {
      if (this.cropperOption.img) {
        URL.revokeObjectURL(this.cropperOption.img);
      }
      this.cropperOption.img = '';
      this.currentAvatarFile = null;

      // 清空圆形预览
      if (this.$refs.circlePreview) {
        this.$refs.circlePreview.innerHTML = '';
      }
    },

    // 导航到首页的统一方法
    navigateToHome() {
      try {
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
      } catch (error) {
        console.error('导航处理出错:', error);
        // 最后的回退方案：尝试直接跳转到首页
        try {
          this.$router.push('/');
        } catch (finalError) {
          console.error('最终导航回退也失败:', finalError);
        }
      }
    },

    useDefaultAvatar() {
      this.registerForm.AvatarURL = '';
      this.$message.info('已重置为默认头像');
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

/* 头像相关样式 */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.avatar-preview {
  position: relative;
  display: inline-block;

  &:hover .avatar-overlay {
    opacity: 1;
  }
}

.avatar-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
  color: white;
  font-size: 12px;

  .el-icon-camera {
    font-size: 20px;
    margin-bottom: 4px;
  }
}

.avatar-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.avatar-tip {
  background: #f5f7fa;
  border-radius: 6px;
  padding: 10px;
  text-align: left;
  max-width: 300px;

  p {
    margin: 3px 0;
    color: #909399;
    font-size: 12px;
    line-height: 1.4;

    &:first-child {
      margin-top: 0;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}

// 头像裁剪器样式
.avatar-cropper-content {
  .cropper-section {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;

    .cropper-container {
      flex: 1;
      height: 300px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      overflow: hidden;
    }

    .preview-section {
      width: 150px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;

      h4 {
        margin: 0;
        font-size: 14px;
        color: #606266;
      }

      .circle-preview {
        width: 100px;
        height: 100px;
        border: 2px dashed #dcdfe6;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #fafafa;

        &:empty::before {
          content: '预览';
          color: #c0c4cc;
          font-size: 12px;
        }
      }
    }
  }

  .cropper-controls {
    text-align: center;
    margin-bottom: 15px;

    .el-button-group {
      .el-button {
        padding: 5px 8px;
        font-size: 12px;
      }
    }
  }

  .upload-tip {
    background: #f4f4f5;
    padding: 10px;
    border-radius: 4px;
    margin-top: 10px;

    p {
      margin: 5px 0;
      font-size: 12px;
      color: #909399;

      &:first-child {
        margin-top: 0;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

// 对话框样式优化
.el-dialog {
  border-radius: 8px;
}

.dialog-footer {
  text-align: center;
}
</style>
