<template>
  <div class="create-bot-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">基本信息</h1>
      <p class="page-description">
        填写你的 AI 机器人的基本信息，这将帮助用户了解它的用途和特点。
      </p>
    </div>

    <!-- 步骤指示器 -->
    <div class="steps-navigation">
      <div class="step-item active">
        <div class="step-number">1</div>
        <div class="step-label">基本信息</div>
      </div>
      <div class="step-connector active"></div>
      <div class="step-item">
        <div class="step-number">2</div>
        <div class="step-label">功能配置</div>
      </div>
      <div class="step-connector"></div>
      <div class="step-item">
        <div class="step-number">3</div>
        <div class="step-label">完成创建</div>
      </div>
    </div>

    <!-- 表单卡片 -->
    <div class="form-card">
      <form @submit.prevent="handleSubmit">
        <!-- 机器人名称 -->
        <div class="form-group">
          <label for="botName" class="form-label">
            机器人名称 <span class="required">*</span>
          </label>
          <input
            type="text"
            id="botName"
            v-model="botInfo.name"
            class="form-input"
            placeholder="输入机器人的名称"
            required
            maxlength="50"
          />
          <p class="form-hint">
            给你的机器人起一个简洁易记的名称（最多50个字符）
          </p>
        </div>

        <!-- 机器人头像 -->
        <div class="form-group">
          <label class="form-label">机器人头像</label>
          <div class="avatar-upload">
            <div
              class="avatar-preview"
              :style="{ backgroundImage: `url(${botInfo.avatarUrl})` }"
              :class="{
                'has-image':
                  botInfo.avatarUrl !== 'https://via.placeholder.com/200',
              }"
            >
              <input
                type="file"
                id="avatarUpload"
                class="avatar-input"
                accept="image/*"
                @change="handleAvatarUpload"
              />
              <label for="avatarUpload" class="avatar-upload-btn">
                <i class="fa fa-upload"></i>
                <span>上传头像</span>
              </label>
              <button
                type="button"
                class="avatar-remove-btn"
                v-if="botInfo.avatarUrl !== 'https://via.placeholder.com/200'"
                @click="removeAvatar"
              >
                <i class="fa fa-times"></i>
              </button>
            </div>
          </div>
          <p class="form-hint">
            上传一张清晰的图片作为机器人头像（建议尺寸：200x200px）
          </p>
        </div>

        <!-- 机器人描述 -->
        <div class="form-group">
          <label for="botDescription" class="form-label">
            机器人描述 <span class="required">*</span>
          </label>
          <textarea
            id="botDescription"
            v-model="botInfo.description"
            rows="4"
            class="form-input"
            placeholder="描述这个机器人的功能和特点"
            required
            maxlength="500"
          ></textarea>
          <div class="form-footer">
            <p class="form-hint">
              简要介绍机器人的主要功能和用途（最多500个字符）
            </p>
            <p class="char-count">{{ botInfo.description.length }}/500</p>
          </div>
        </div>

        <!-- 机器人类型和语言（并排布局） -->
        <div class="form-row">
          <div class="form-group col-6">
            <label for="botType" class="form-label">机器人类型</label>
            <select id="botType" v-model="botInfo.type" class="form-input">
              <option value="general">通用助手</option>
              <option value="customerService">客服助手</option>
              <option value="knowledge">知识专家</option>
              <option value="creative">创意助手</option>
              <option value="programming">编程助手</option>
              <option value="custom">自定义类型</option>
            </select>
            <p class="form-hint">选择最符合机器人功能的类型</p>
          </div>

          <div class="form-group col-6">
            <label for="botLanguage" class="form-label">默认语言</label>
            <select
              id="botLanguage"
              v-model="botInfo.language"
              class="form-input"
            >
              <option value="zh-CN">简体中文</option>
              <option value="en-US">英语</option>
              <option value="ja-JP">日语</option>
              <option value="ko-KR">韩语</option>
              <option value="zh-TW">繁体中文</option>
            </select>
            <p class="form-hint">设置机器人的默认对话语言</p>
          </div>
        </div>

        <!-- 帮助提示 -->
        <div class="help-section">
          <h3 class="help-title">填写提示</h3>
          <ul class="help-list">
            <li>• 带 <span class="required">*</span> 的为必填项</li>
            <li>• 机器人名称和描述将展示给用户，尽量清晰准确</li>
            <li>• 后续可以在机器人设置中修改这些信息</li>
          </ul>
        </div>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <button
            type="button"
            class="btn secondary-btn"
            @click="$router.go(-1)"
          >
            取消
          </button>
          <button
            type="submit"
            class="btn primary-btn"
            :disabled="!isFormValid"
          >
            下一步
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 机器人基本信息
      botInfo: {
        name: '',
        description: '',
        avatarUrl: 'https://via.placeholder.com/200', // 默认头像占位图
        type: 'general',
        language: 'zh-CN',
      },
    };
  },
  computed: {
    // 表单验证状态
    isFormValid() {
      return (
        this.botInfo.name.trim() !== '' &&
        this.botInfo.description.trim() !== ''
      );
    },
  },
  methods: {
    // 处理头像上传
    handleAvatarUpload(event) {
      const file = event.target.files[0];
      if (file) {
        // 简单的文件类型验证
        if (!file.type.startsWith('image/')) {
          alert('请上传图片文件');
          return;
        }

        // 文件大小限制 (2MB)
        if (file.size > 2 * 1024 * 1024) {
          alert('图片大小不能超过2MB');
          return;
        }

        // 预览图片
        const reader = new FileReader();
        reader.onload = (e) => {
          this.botInfo.avatarUrl = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },

    // 移除头像
    removeAvatar() {
      this.botInfo.avatarUrl = 'https://via.placeholder.com/200';
      document.getElementById('avatarUpload').value = '';
    },

    // 提交表单
    handleSubmit() {
      if (!this.isFormValid) return;

      // 保存基本信息到 store
      this.$store.dispatch('saveBotBasicInfo', { ...this.botInfo });
      // 跳转到功能配置页面
      this.$router.push('/create/features');
    },
  },
};
</script>

<style scoped>
/* 基础样式 - 与功能配置页完全一致 */
.create-bot-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 25px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #333;
}

/* 页面标题 - 与功能配置页统一 */
.page-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 26px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.page-description {
  color: #666;
  font-size: 16px;
}

/* 步骤导航 - 与功能配置页统一 */
.steps-navigation {
  display: flex;
  align-items: center;
  margin-bottom: 35px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
  width: 33.333%;
}

.step-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #eaecef;
  color: #868e96;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.step-label {
  font-size: 14px;
  color: #868e96;
  font-weight: 500;
}

.step-item.active .step-number {
  background: #0f88eb;
  color: white;
}

.step-item.active .step-label {
  color: #0f88eb;
}

.step-connector {
  flex: 1;
  height: 2px;
  background: #eaecef;
  transition: all 0.3s ease;
}

.step-connector.active {
  background: #0f88eb;
}

/* 表单卡片 - 与功能配置页统一 */
.form-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 30px;
  margin-bottom: 25px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 25px;
  color: #1a1a1a;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f3f5;
}

/* 表单布局 - 与功能配置页统一 */
.form-row {
  display: flex;
  gap: 24px;
  margin-bottom: 25px;
}

.col-6 {
  flex: 1;
  min-width: 0;
}

.form-group {
  margin-bottom: 25px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
}

.required {
  color: #e53e3e;
}

.form-input {
  width: 90%;
  padding: 11px 14px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 15px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #0f88eb;
  box-shadow: 0 0 0 3px rgba(15, 136, 235, 0.1);
}

.form-hint {
  margin-top: 6px;
  font-size: 13px;
  color: #868e96;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 字符计数样式 */
.char-count {
  margin-top: 6px;
  font-size: 13px;
  text-align: right;
  color: #868e96;
}

/* 头像上传样式 */
.avatar-upload {
  margin-top: 8px;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  border: 2px dashed #ced4da;
  position: relative;
  overflow: hidden;
}

.avatar-preview.has-image {
  border-style: solid;
  border-color: #e5e6eb;
}

.avatar-input {
  display: none;
}

.avatar-upload-btn {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  text-align: center;
  padding: 8px 0;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.avatar-upload-btn:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

.avatar-remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: background-color 0.2s;
}

.avatar-remove-btn:hover {
  background-color: #ff4d4f;
}

/* 帮助部分 - 与功能配置页统一 */
.help-section {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin: 30px 0;
}

.help-title {
  font-weight: 600;
  margin-bottom: 10px;
  color: #334155;
  font-size: 16px;
}

.help-list {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  padding-left: 20px;
}

/* 按钮样式 - 与功能配置页统一 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f1f3f5;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.primary-btn {
  background-color: #0f88eb;
  color: white;
}

.primary-btn:hover {
  background-color: #0a68b8;
  box-shadow: 0 2px 5px rgba(15, 136, 235, 0.2);
}

.primary-btn:disabled {
  background-color: #8cc5ff;
  cursor: not-allowed;
  box-shadow: none;
}

.secondary-btn {
  background-color: #f8f9fa;
  color: #495057;
}

.secondary-btn:hover {
  background-color: #e9ecef;
}

/* 响应式调整 - 与功能配置页统一 */
@media (max-width: 768px) {
  .create-bot-container {
    padding: 15px;
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .form-card {
    padding: 20px;
  }

  .step-label {
    font-size: 12px;
  }

  .btn {
    padding: 8px 16px;
    font-size: 14px;
    width: 100%;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .avatar-preview {
    width: 100px;
    height: 100px;
  }

  .steps-navigation {
    overflow-x: auto;
    padding-bottom: 8px;
    justify-content: flex-start;
  }

  .step-connector {
    min-width: 40px;
  }
}
</style>
