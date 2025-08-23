<template>
  <div class="my-bots-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">我的 AI 机器人</h1>
      <p class="page-description">
        管理和配置你的所有AI机器人，查看它们的使用情况和统计数据
      </p>
    </div>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 页面右上角按钮 -->
      <div class="absolute top-0 right-0 mt-2 mr-4 z-10">
        <button
          class="btn primary-btn flex items-center justify-center h-10 px-4"
          @click="$router.push('/createRobot')"
        >
          <i class="fa fa-plus mr-2"></i>
          <span class="align-middle leading-none">创建新机器人</span>
        </button>
      </div>

      <!-- 机器人列表区域 -->
      <div class="form-card">
        <div class="flex items-center mb-6">
          <h2 class="text-xl font-bold mr-auto">机器人列表</h2>
        </div>

        <div class="bots-grid">
          <!-- 机器人卡片 -->
          <div v-for="bot in bots" :key="bot.id" class="bot-card card-hover">
            <div class="p-5">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h2 class="text-lg font-semibold">{{ bot.name }}</h2>
                  <p class="text-sm text-gray-500 mt-1">
                    {{ bot.description }}
                  </p>
                </div>
                <span class="status-active"> 活跃 </span>
              </div>

              <div class="flex items-center text-sm text-gray-600 mb-4">
                <div class="flex items-center mr-4">
                  <i class="fa fa-code-fork mr-1"></i>
                  <span>当前版本：{{ bot.version }}</span>
                </div>
                <div class="flex items-center">
                  <i class="fa fa-comments-o mr-1"></i>
                  <span>{{ bot.conversations }} 次对话</span>
                </div>
              </div>

              <div class="border-t border-gray-100 pt-4 flex justify-between">
                <a
                  href="#"
                  class="text-razor-blue hover:text-razor-darkBlue font-medium flex items-center transition-all hover:pl-1"
                  @click.prevent="$router.push('/ChatRobot')"
                >
                  <i class="fa fa-comments-o mr-1"></i>
                  开始对话
                </a>
                <a
                  href="#"
                  class="text-gray-600 hover:text-gray-800 font-medium flex items-center transition-all hover:pr-1"
                  @click.prevent="$router.push('/bot-detail')"
                >
                  <i class="fa fa-cog mr-1"></i>
                  编辑设置
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'MyBotsPage',
  data() {
    return {
      // 机器人数据
      bots: [
        {
          id: 1,
          name: '小助手Bot',
          description: '知识问答 · 创意生成',
          status: 'active',
          version: 'v1.2',
          conversations: 328,
        },
        {
          id: 2,
          name: '客服机器人',
          description: '自动回复 · 问题分类',
          status: 'active',
          version: 'v1.0',
          conversations: 156,
        },
      ],
    };
  },
};
</script>

<style scoped>
/* 基础样式 - 与帖子页面保持一致 */
.my-bots-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #333;
  background-color: #fff;
  min-height: 100vh;
}

/* 页面标题 - 与帖子页面统一 */
.page-header {
  margin-bottom: 35px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e2e8f0;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 10px;
  letter-spacing: -0.02em;
}

.page-description {
  color: #64748b;
  font-size: 16px;
  max-width: 700px;
}

/* 主内容区 */
.main-content {
  flex: 1;
}

/* 表单卡片样式 - 与帖子页面统一 */
.form-card {
  background: #fff;
  border-radius: 12px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 2px 4px -1px rgba(0, 0, 0, 0.03);
  padding: 35px;
  margin-bottom: 30px;
  transition: box-shadow 0.3s ease;
}

.form-card:hover {
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.06),
    0 4px 6px -2px rgba(0, 0, 0, 0.04);
}

/* 机器人网格布局 - 与帖子页面统一 */
.bots-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
}

/* 机器人卡片样式 - 与帖子卡片统一 */
.bot-card {
  flex: 1;
  min-width: 300px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

/* 卡片悬停效果 - 与帖子卡片统一 */
.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-6px);
  box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}

/* 状态标签 - 优化为与帖子状态标签风格一致 */
.status-active {
  padding: 3px 10px;
  background-color: #f0fff4;
  color: #166534;
  font-size: 12px;
  border-radius: 12px;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(34, 197, 94, 0.1);
}

/* 按钮样式 - 与帖子页面统一 */
.btn {
  height: 40px;
  padding: 3px 3px;
  border-radius: 8px;
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
  box-shadow: 0 2px 4px rgba(22, 93, 255, 0.15);
}

.primary-btn:hover {
  background-color: #0a6fcc;
  box-shadow: 0 4px 8px rgba(22, 93, 255, 0.25);
}

/* 链接样式 - 优化为与帖子页面一致 */
a {
  text-decoration: none;
  transition: all 0.2s ease;
}

/* 自定义颜色 - 与帖子页面统一 */
.text-razor-blue {
  color: #0f88eb;
}

.text-razor-darkBlue {
  color: #0a6fcc;
}

.text-gray-500 {
  color: #64748b;
}

.text-gray-600 {
  color: #475569;
}

.border-gray-100 {
  border-color: #f1f5f9;
}

.border-gray-200 {
  border-color: #e2e8f0;
}

/* 布局工具类 - 与帖子页面统一 */
.flex {
  display: flex;
}

.flex-wrap {
  flex-wrap: wrap;
}

.flex justify-between {
  justify-content: space-between;
}

.flex items-center {
  align-items: center;
}

.mb-4 {
  margin-bottom: 16px;
}

.mb-6 {
  margin-bottom: 24px;
}

.mr-1 {
  margin-right: 4px;
}

.mr-2 {
  margin-right: 8px;
}

.mr-4 {
  margin-right: 16px;
}

.pt-4 {
  padding-top: 16px;
}

.p-5 {
  padding: 24px;
}

.text-lg {
  font-size: 18px;
}

.text-xl {
  font-size: 22px;
}

.font-bold {
  font-weight: 700;
}

.font-semibold {
  font-weight: 600;
}

.font-medium {
  font-weight: 500;
}

.text-sm {
  font-size: 14px;
}

.border-t {
  border-top: 1px solid;
}

/* 响应式调整 - 与帖子页面统一 */
@media (max-width: 768px) {
  .my-bots-container {
    padding: 20px 15px;
  }

  .form-card {
    padding: 25px 20px;
  }

  .btn {
    padding: 9px 18px;
    font-size: 14px;
  }

  .bots-grid {
    flex-direction: column;
    gap: 20px;
  }

  .bot-card {
    width: 100%;
    min-width: auto;
  }

  .page-title {
    font-size: 24px;
  }
}
</style>
