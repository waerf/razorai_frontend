<template>
  <div class="create-post-container">
    <main class="main-content container">
      <div class="page-header">
        <h1 class="page-title">发布新帖子</h1>
        <p class="page-description">分享你的想法和经验，与社区成员交流</p>
      </div>

      <div class="form-card">
        <form @submit.prevent="submitPost">
          <!-- 帖子标题 -->
          <div class="form-group">
            <label for="title" class="form-label">帖子标题</label>
            <input
              type="text"
              id="title"
              v-model="post.title"
              class="form-input"
              placeholder="请输入帖子标题"
              required
            />
          </div>

          <!-- 帖子内容 -->
          <div class="form-group">
            <label for="content" class="form-label">帖子内容</label>
            <textarea
              id="content"
              v-model="post.content"
              class="form-textarea"
              placeholder="请输入帖子内容..."
              rows="10"
              required
            ></textarea>
          </div>

          <!-- 帖子标签 -->
          <div class="form-group">
            <label class="form-label">帖子标签</label>
            <div class="tags-container">
              <div
                class="tag-option"
                v-for="tag in allTags"
                :key="tag"
                :class="{ 'tag-selected': post.tags.includes(tag) }"
                @click="toggleTag(tag)"
              >
                {{ tag }}
              </div>
            </div>
            <p class="tags-hint">选择相关标签，最多选择5个</p>
          </div>

          <!-- 提交按钮 -->
          <div class="form-actions">
            <button type="button" class="secondary-btn" @click="$router.go(-1)">
              取消
            </button>
            <button type="submit" class="primary-btn" :disabled="submitting">
              <span v-if="!submitting">发布帖子</span>
              <span v-if="submitting">发布中...</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { createCommunityPost } from '@/utils/api';

export default {
  data() {
    return {
      post: {
        title: '',
        content: '',
        tags: [],
      },
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
      submitting: false,
    };
  },
  computed: {
    ...mapState('user', ['isLoggedIn', 'userId', 'userName']),
  },
  methods: {
    toggleTag(tag) {
      if (this.post.tags.includes(tag)) {
        this.post.tags = this.post.tags.filter((t) => t !== tag);
      } else if (this.post.tags.length < 5) {
        this.post.tags.push(tag);
      }
    },

    async submitPost() {
      if (!this.isLoggedIn || !this.userId) {
        this.$message.warning('请先登录后再发布帖子');
        this.$router.push('/login');
        return;
      }

      if (!this.post.title.trim() || !this.post.content.trim()) {
        return this.$message.warning('标题和内容不能为空');
      }
      if (this.post.tags.length === 0) {
        return this.$message.warning('请至少选择一个标签');
      }

      this.submitting = true;
      try {
        const payload = {
          userId: this.userId,
          postContent: JSON.stringify({
            title: this.post.title,
            content: this.post.content,
            tags: this.post.tags,
            author: this.userName,
          }),
        };

        const res = await createCommunityPost(payload); // ✅ 使用封装的 API

        if (res.data && res.data.success !== false) {
          this.$message.success('帖子发布成功！');
          this.$router.push('/community');
        } else {
          this.$message.error(res.data.message || '发布失败');
        }
      } catch (err) {
        console.error('发布帖子失败:', err.response ? err.response.data : err);
        this.$message.error(
          err.response?.data?.message || '服务器错误，请稍后重试'
        );
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped>
.create-post-container {
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

.primary-btn:hover {
  background-color: #0a6fcc;
  box-shadow: 0 4px 8px rgba(15, 136, 235, 0.2);
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
</style>
