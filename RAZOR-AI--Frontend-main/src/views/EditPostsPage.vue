<template>
  <div class="edit-post-container">
    <main class="main-content container">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1 class="page-title">编辑帖子</h1>
        <p class="page-description">修改你的帖子内容，与社区成员更好地交流</p>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>加载帖子数据中...</p>
      </div>

      <!-- 错误提示 -->
      <div v-if="errorMessage" class="error-message">
        <i class="fa fa-exclamation-circle mr-2"></i>{{ errorMessage }}
      </div>

      <!-- 编辑表单 -->
      <div v-if="!isLoading && !errorMessage" class="form-card">
        <form @submit.prevent="savePost">
          <!-- 标题输入 -->
          <div class="form-group">
            <label for="title" class="form-label">帖子标题</label>
            <input
              type="text"
              id="title"
              v-model="formData.title"
              class="form-input"
              placeholder="请输入帖子标题"
              required
            />
          </div>

          <!-- 内容编辑器 (Markdown) -->
          <div class="form-group">
            <label for="content" class="form-label"
              >帖子内容 (支持 Markdown)</label
            >
            <mavon-editor
              v-model="formData.content"
              :toolbarsFlag="true"
              style="height: 400px"
            />
          </div>

          <!-- 帖子标签 -->
          <div class="form-group">
            <label class="form-label">帖子标签</label>
            <div class="tags-container">
              <div
                class="tag-option"
                v-for="tag in allTags"
                :key="tag"
                :class="{ 'tag-selected': formData.tags.includes(tag) }"
                @click="toggleTag(tag)"
              >
                {{ tag }}
              </div>
            </div>
            <p class="tags-hint">选择相关标签，最多选择5个</p>
          </div>

          <!-- 底部操作区 -->
          <div class="form-actions">
            <button type="button" class="secondary-btn" @click="goBack">
              取消
            </button>
            <button type="submit" class="primary-btn" :disabled="isSubmitting">
              <span v-if="!isSubmitting">保存帖子</span>
              <span v-if="isSubmitting">保存中...</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { getCommunityPostDetail, updateCommunityPost } from '@/utils/api';
import { mavonEditor } from 'mavon-editor';

export default {
  components: {
    mavonEditor,
  },
  props: ['id'],
  data() {
    return {
      // 表单数据
      formData: {
        title: '',
        tags: [],
        content: '',
      },
      // 预设标签列表（与发布页保持一致）
      allTags: [
        '订阅管理',
        '效率工具',
        '信息整理',
        '专栏推荐',
        '2025精选',
        '内容推荐',
        'AI编程',
        '工具对比',
        '编程技巧',
        '技术分享',
        '性能优化',
        '前端布局',
      ],
      // 状态管理
      isLoading: true,
      isSubmitting: false,
      errorMessage: '',
    };
  },

  computed: {
    ...mapState('user', ['userId', 'userName']),
  },

  created() {
    if (this.id) {
      this.loadPostData(this.id);
    } else {
      this.errorMessage = '无法获取帖子ID';
      this.isLoading = false;
    }
  },

  methods: {
    // 加载帖子数据
    async loadPostData(postId) {
      try {
        const res = await getCommunityPostDetail(postId);
        const p = res.data.post;
        let contentObj = {};

        try {
          contentObj = p.postContent ? JSON.parse(p.postContent) : {};
        } catch (e) {
          console.error('解析 postContent 失败:', e);
        }

        // 填充表单数据
        this.formData = {
          title: contentObj.title || '',
          tags: contentObj.tags || [],
          content: contentObj.content || '',
        };

        this.isLoading = false;
      } catch (err) {
        console.error('加载帖子失败:', err);
        this.errorMessage = '加载帖子失败，请重试';
        this.isLoading = false;
      }
    },

    // 标签切换
    toggleTag(tag) {
      if (this.formData.tags.includes(tag)) {
        this.formData.tags = this.formData.tags.filter((t) => t !== tag);
      } else if (this.formData.tags.length < 5) {
        this.formData.tags.push(tag);
      }
    },

    // 保存帖子
    async savePost() {
      // 表单验证（与发布页保持一致）
      if (!this.formData.title.trim() || !this.formData.content.trim()) {
        return this.$message.warning('标题和内容不能为空');
      }
      if (this.formData.tags.length === 0) {
        return this.$message.warning('请至少选择一个标签');
      }

      this.isSubmitting = true;
      try {
        const user_id = this.$store.state.user?.userId;
        console.log('当前用户ID:', user_id);
        if (!user_id) {
          this.$message.error('未获取到用户信息，请重新登录');
          return;
        }

        const postData = {
          userId: user_id,
          postContent: JSON.stringify({
            title: this.formData.title,
            content: this.formData.content,
            tags: this.formData.tags,
            author: this.userName,
          }),
        };

        // 调用更新API
        console.log('帖子更新数据:', postData);
        const res = await updateCommunityPost(this.id, postData);
        console.log('帖子更新结果:', res);
        this.$message.success('帖子更新成功');
        this.goBack();
      } catch (err) {
        console.error('更新帖子失败:', err);
        this.$message.error(
          err.response?.data?.message || '更新帖子失败，请重试'
        );
        this.isSubmitting = false;
      }
    },

    goBack() {
      this.$router.back();
    },
  },
};
</script>

<style scoped>
.edit-post-container {
  background-color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #333;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
  width: 100%;
}

.main-content {
  padding: 30px 0;
  flex: 1;
}

.page-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f3f5;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.page-description {
  color: #666;
  font-size: 14px;
}

.form-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #1a1a1a;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #0f88eb;
}

.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-family: inherit;
  font-size: 15px;
  resize: vertical;
  transition: border-color 0.2s ease;
}

.form-textarea:focus {
  outline: none;
  border-color: #0f88eb;
}

/* 标签样式（与发布页保持一致） */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
}

.tag-option {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  background-color: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag-selected {
  background-color: rgba(15, 136, 235, 0.1);
  color: #0f88eb;
}

.tags-hint {
  color: #94a3b8;
  font-size: 12px;
  margin: 0;
}

/* 按钮样式（与发布页保持一致） */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 30px;
}

.primary-btn {
  background-color: #0f88eb;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: inline-flex;
  align-items: center;
}

.primary-btn:hover:not(:disabled) {
  background-color: #0a6fcc;
  box-shadow: 0 4px 8px rgba(15, 136, 235, 0.2);
}

.primary-btn:disabled {
  background-color: #94c6f7;
  cursor: not-allowed;
}

.secondary-btn {
  background-color: #f8f9fa;
  color: #495057;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.secondary-btn:hover {
  background-color: #e9ecef;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 50px 0;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 15px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0f88eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 错误提示 */
.error-message {
  background-color: #fff5f5;
  color: #e53e3e;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}
</style>