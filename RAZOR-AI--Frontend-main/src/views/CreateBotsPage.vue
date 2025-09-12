<template>
  <div class="create-robot">
    <el-form
      :model="form"
      ref="form"
      :rules="rules"
      label-width="120px"
      class="creat-robot-form"
    >
      <div class="form-header">
        <h1 class="form-title">创建新机器人</h1>
        <p class="form-subtitle">设置机器人的基本信息和参数</p>
      </div>

      <!-- 机器人头像上传+裁剪模块 -->
      <el-form-item label="机器人头像" class="avatar-form-item">
        <div class="avatar-upload-container">
          <!-- 1. 头像预览区 -->
          <div class="avatar-preview">
            <img
              v-if="form.avatarUrl"
              :src="form.avatarUrl"
              alt="机器人头像"
              class="avatar-img"
            />
            <div v-else class="avatar-placeholder">
              <i class="el-icon-user-robot avatar-placeholder-icon"></i>
              <span class="avatar-placeholder-text">未选择头像</span>
            </div>
            <button
              v-if="form.avatarUrl"
              class="avatar-clear-btn"
              @click.stop="clearAvatar"
              title="清空头像"
            >
              <i class="el-icon-circle-close"></i>
            </button>
          </div>

          <!-- 2. 上传操作区 -->
          <div class="avatar-upload-actions">
            <input
              type="file"
              ref="avatarFileInput"
              class="avatar-file-input"
              accept="image/jpeg,image/png,image/gif"
              @change="handleAvatarSelect"
            />
            <el-button
              type="primary"
              icon="el-icon-upload"
              size="mini"
              @click="$refs.avatarFileInput.click()"
              class="avatar-upload-btn"
              :disabled="isCropping"
            >
              选择图片
            </el-button>
            <p class="avatar-tip">
              支持JPG、PNG、GIF，建议200x200px（裁剪后使用）
            </p>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="机器人名字" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入机器人名字"
          class="custom-input"
        ></el-input>
      </el-form-item>

      <el-form-item label="机器人类型" prop="type">
        <el-select
          v-model="form.type"
          placeholder="请选择机器人类型"
          class="custom-select"
        >
          <el-option
            v-for="option in robotTypes"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="LLM ID" prop="LLM_id">
        <el-select
          v-model="form.LLM_id"
          placeholder="请选择 LLM"
          class="custom-select"
        >
          <el-option
            v-for="option in llmOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="提示词" prop="chatprompt">
        <el-input
          v-model="form.chatprompt"
          placeholder="请输入提示词"
          class="custom-input"
          type="textarea"
          rows="4"
        ></el-input>
      </el-form-item>

      <el-form-item label="描述">
        <el-input
          v-model="form.description"
          placeholder="请输入机器人的描述（可无）"
          class="custom-input"
          type="textarea"
          rows="3"
        ></el-input>
      </el-form-item>

      <el-form-item label="价格" prop="price">
        <el-input-number
          v-model="form.price"
          :min="0"
          :step="100"
          placeholder="请输入价格"
          class="custom-input"
        />
      </el-form-item>

      <el-form-item class="form-actions">
        <el-button class="cancel-button" @click="onCancel"> 取消 </el-button>
        <el-button type="primary" class="submit-button" @click="onSubmit">
          创建机器人
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
          {{ avatarUploading ? '上传中...' : '确认更换' }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { reviewAI as apireviewAI } from '@/utils/api';
import { VueCropper } from 'vue-cropper';

export default {
  components: {
    VueCropper,
  },
  data() {
    return {
      form: {
        name: '',
        type: null,
        LLM_id: null,
        chatprompt: '',
        description: '',
        price: 0,
        avatarUrl: '',
      },
      rules: {
        name: [
          { required: true, message: '请输入机器人名字', trigger: 'blur' },
        ],
        type: [
          { required: true, message: '请选择机器人类型', trigger: 'change' },
        ],
        LLM_id: [
          { required: true, message: '请选择 LLM ID', trigger: 'change' },
        ],
        chatprompt: [
          { required: true, message: '请输入提示词', trigger: 'blur' },
        ],
        price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
      },
      robotTypes: [
        { label: '文本生成', value: 1 },
        { label: '代码编程', value: 2 },
        { label: '情感伙伴', value: 3 },
      ],
      llmOptions: [
        { label: 'Kimi', value: 1 },
        { label: 'Deepseek', value: 2 },
      ],
      // 头像裁剪相关
      avatarPreviewVisible: false,
      previewAvatarUrl: '',
      currentAvatarFile: null,
      avatarUploading: false,
      isCropping: false,

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
    };
  },
  methods: {
    // 图片放大
    scaleUp() {
      this.$refs.cropper && this.$refs.cropper.changeScale(0.1); // 正数为放大
    },

    // 补充图片缩小方法（缺失的方法）
    scaleDown() {
      this.$refs.cropper && this.$refs.cropper.changeScale(-0.1); // 负数为缩小
    },

    // 图片左转
    rotateLeft() {
      this.$refs.cropper && this.$refs.cropper.rotateLeft();
    },

    // 图片右转
    rotateRight() {
      this.$refs.cropper && this.$refs.cropper.rotateRight();
    },
    // 清空头像
    clearAvatar() {
      this.form.avatarUrl = '';
    },

    handleAvatarSelect(event) {
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
        // 创建图片URL并更新裁剪配置
        const imageUrl = URL.createObjectURL(file);
        this.cropperOption = { ...this.cropperOption, img: imageUrl };
        this.currentAvatarFile = file;

        // 显示裁剪对话框
        this.avatarPreviewVisible = true;

        // 关键优化：等待对话框渲染完成 + 组件初始化
        this.$nextTick(() => {
          // 对话框DOM渲染完成后，再等待组件初始化
          const checkCropper = () => {
            if (
              this.$refs.cropper &&
              typeof this.$refs.cropper.getCropData === 'function'
            ) {
              // 组件就绪，调用预览方法
              this.updateCirclePreview();
            } else {
              // 未就绪，100ms后重试（最多重试5次，避免无限循环）
              if (this.cropperRetryCount < 5) {
                this.cropperRetryCount = (this.cropperRetryCount || 0) + 1;
                setTimeout(checkCropper, 100);
              } else {
                console.error('cropper组件初始化超时');
              }
            }
          };
          checkCropper(); // 开始检查
        });
      } catch (error) {
        console.error('头像预览失败:', error);
        this.$message.error('头像预览失败：' + error.message);
      } finally {
        // 清空文件输入框
        event.target.value = '';
      }
    },

    updateCirclePreview() {
      this.$nextTick(() => {
        // 检查组件实例是否存在
        if (!this.$refs.cropper) {
          console.error('cropper组件实例不存在');
          return;
        }

        // 检查方法是否存在（核心！）
        if (typeof this.$refs.cropper.getCropData !== 'function') {
          console.error('cropper组件的getCropData方法不存在');
          // 100ms后重试
          setTimeout(() => this.updateCirclePreview(), 100);
          return;
        }

        // 检查图片是否加载
        if (!this.cropperOption.img) {
          console.error('裁剪图片URL为空');
          return;
        }

        // 安全调用方法
        this.$refs.cropper.getCropData((data) => {
          if (this.$refs.circlePreview) {
            this.$refs.circlePreview.innerHTML = `
          <div style="width: 100px; height: 100px; border-radius: 50%; overflow: hidden; margin: 0 auto;">
            <img src="${data}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
        `;
          }
        });
      });
    },

    // 确认上传方法也增加检查
    async confirmAvatarUpload() {
      if (
        !this.$refs.cropper ||
        typeof this.$refs.cropper.getCropBlob !== 'function'
      ) {
        this.$message.error('裁剪组件未正确加载');
        return;
      }

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
        formData.append('file', blob, `avatar-${Date.now()}.png`);

        // 调用图片上传API
        const response = await fetch(
          'http://47.99.66.142:5000/api2/upload-image',
          {
            method: 'POST',
            body: formData,
          }
        );

        const result = await response.json();

        if (result.success) {
          // 上传成功，更新头像显示
          this.form.avatarUrl = result.url;
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
        this.isCropping = false;
      }
    },

    resetAvatarPreview() {
      if (this.cropperOption.img) {
        URL.revokeObjectURL(this.cropperOption.img);
      }
      this.cropperOption.img = '';
      this.currentAvatarFile = null;
      this.avatarPreviewVisible = false;
      this.isCropping = false;

      // 清空圆形预览
      if (this.$refs.circlePreview) {
        this.$refs.circlePreview.innerHTML = '';
      }
    },

    onSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const userId = this.$store.state.user?.userId;
          if (!userId) {
            this.$message.error('未获取到用户信息，请重新登录');
            return;
          }

          const payload = {
            name: this.form.name,
            type: this.form.type,
            llmid: this.form.LLM_id,
            chatprompt: this.form.chatprompt,
            description: this.form.description,
            CreatorId: userId,
            price: this.form.price,
            robotImage: this.form.avatarUrl,
            creatorId: userId,
          };
          console.log('提交参数:', payload);
          this.apicreateRobot(payload);
        } else {
          console.log('表单验证失败');
          this.$message.warning('请完善表单信息后重试');
        }
      });
    },

    onCancel() {
      this.$router.go(-1);
    },

    async apicreateRobot(payload) {
      try {
        const response = await apireviewAI(payload);
        console.log('接口响应:', response);

        const isSuccess =
          response.status === 200 &&
          (response.data.code === 200 || response.data.success);

        if (isSuccess) {
          this.$message.success('请等待管理员审核');
          // 重置表单
          this.$refs.form?.resetFields();
          this.form.avatarUrl = ''; // 重置头像
        } else {
          const errorMsg = response.data?.message || '创建失败，服务器返回异常';
          this.$message.error(`创建失败: ${errorMsg}`);
        }
      } catch (error) {
        console.error('创建机器人错误详情:', error);
        console.error('错误响应数据:', error.response?.data);
        console.error('错误状态码:', error.response?.status);

        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          '网络错误，请稍后重试';
        this.$message.error(`创建失败: ${errorMsg}`);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins.scss' as *;
@use '@/assets/styles/variables.scss' as *;

// 知乎风格基础样式

.avatar-form-item .el-form-item__content {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.avatar-upload-container {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
  max-width: 600px;
}

/* 头像预览区 */
.avatar-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px dashed #dcdfe6;
  background-color: #f5f7fa;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.avatar-preview:hover {
  border-color: #409eff;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.avatar-placeholder-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.avatar-placeholder-text {
  font-size: 12px;
}

.avatar-clear-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.avatar-clear-btn:hover {
  background-color: #f56c6c;
}

/* 上传操作区 */
.avatar-upload-actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.avatar-file-input {
  display: none;
}

.avatar-upload-btn {
  width: 120px;
}

.avatar-tip {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

/* 裁剪弹窗样式 */
.avatar-cropper-content {
  padding: 15px 0;
}

.cropper-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cropper-container {
  width: 100%;
  height: 300px;
}

.preview-section {
  text-align: center;
}

.circle-preview {
  margin-top: 10px;
}

/* 其他样式保持不变 */
.create-robot {
  width: 100%;
  min-height: 100vh;
  background-color: $background-color;
  padding: 40px 20px;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
}

.creat-robot-form {
  width: 100%;
  max-width: 1000px;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: $box-shadow-light;
  border: 1px solid $border-color;
}

.form-header {
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid $border-color;

  .form-title {
    font-size: 1.5rem;
    color: $text-color;
    font-weight: 600;
    margin-bottom: 5px;
  }

  .form-subtitle {
    color: $text-color;
    font-size: 0.9rem;
  }
}

::v-deep .el-form-item {
  margin-bottom: 20px;

  &.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 30px;
    padding-top: 15px;
    border-top: 1px solid $border-color;
  }
}

::v-deep .el-form-item__label {
  color: $text-color;
  font-weight: 500;
  font-size: 14px;
}

.custom-input,
.custom-select {
  width: 100%;

  ::v-deep .el-input__inner,
  ::v-deep .el-select__input {
    border-radius: 6px;
    border: 1px solid $border-color;
    padding: 10px 15px;
    font-size: 14px;
    transition: border-color 0.3s;

    &:focus {
      border-color: $accent-color;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
    }
  }

  ::v-deep .el-select-dropdown {
    border-radius: 6px;
    box-shadow: $box-shadow-medium;
  }
}

.cancel-button {
  background: white;
  color: $text-color;
  border: 1px solid $border-color;
  border-radius: 6px;
  padding: 8px 20px;

  &:hover {
    background: #f5f5f5;
    color: $text-color;
    border-color: $border-color;
  }
}

.submit-button {
  background: $accent-color;
  color: white;
  border: 1px solid $accent-color;
  border-radius: 6px;
  padding: 8px 20px;

  &:hover {
    background: $accent-hover-color;
    border-color: $accent-hover-color;
  }
}

@media (max-width: 768px) {
  .create-robot {
    padding: 20px 10px;
  }

  .creat-robot-form {
    padding: 20px 15px;
  }

  ::v-deep .el-form-item__label {
    width: 100px;
  }

  .form-actions {
    flex-direction: column;
    gap: 10px;

    .el-button {
      width: 100%;
    }
  }
}
</style>
