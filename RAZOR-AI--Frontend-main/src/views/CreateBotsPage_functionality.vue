<template>
  <div class="create-bot-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">功能配置</h1>
      <p class="page-description">
        选择并配置你的 AI 机器人的功能模块，打造专属于你的智能助手。
      </p>
    </div>

    <!-- 步骤指示器 -->
    <div class="steps-navigation">
      <div class="step-item">
        <div class="step-number">1</div>
        <div class="step-label">基本信息</div>
      </div>
      <div class="step-connector active"></div>
      <div class="step-item active">
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
        <!-- 核心功能选择 -->
        <h2 class="section-title">核心功能</h2>

        <div class="features-grid">
          <!-- 功能卡片 1 -->
          <div
            class="feature-card"
            :class="{ active: selectedFeatures.includes('chat') }"
            @click="toggleFeature('chat')"
          >
            <div class="flex items-start">
              <div class="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
                <i class="fa fa-comments text-primary text-xl"></i>
              </div>
              <div class="ml-3">
                <h3 class="text-base font-medium text-gray-900">对话功能</h3>
                <p class="mt-1 text-sm text-gray-600">
                  基础对话能力，支持多轮对话和上下文理解
                </p>
                <div class="mt-2 flex flex-wrap gap-2">
                  <span class="tag tag-primary">基础</span>
                  <span class="tag tag-primary">必需</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 功能卡片 2 -->
          <div
            class="feature-card"
            :class="{ active: selectedFeatures.includes('knowledge') }"
            @click="toggleFeature('knowledge')"
          >
            <div class="flex items-start">
              <div class="flex-shrink-0 bg-green-100 p-3 rounded-lg">
                <i class="fa fa-book text-green-600 text-xl"></i>
              </div>
              <div class="ml-3">
                <h3 class="text-base font-medium text-gray-900">知识库</h3>
                <p class="mt-1 text-sm text-gray-600">
                  上传并检索自定义知识库，增强专业领域能力
                </p>
                <div class="mt-2 flex flex-wrap gap-2">
                  <span class="tag tag-secondary">高级</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 功能卡片 3 -->
          <div
            class="feature-card"
            :class="{ active: selectedFeatures.includes('code') }"
            @click="toggleFeature('code')"
          >
            <div class="flex items-start">
              <div class="flex-shrink-0 bg-purple-100 p-3 rounded-lg">
                <i class="fa fa-code text-purple-600 text-xl"></i>
              </div>
              <div class="ml-3">
                <h3 class="text-base font-medium text-gray-900">代码助手</h3>
                <p class="mt-1 text-sm text-gray-600">
                  代码生成、调试和解释能力
                </p>
                <div class="mt-2 flex flex-wrap gap-2">
                  <span class="tag tag-secondary">专业</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 功能卡片 4 -->
          <div
            class="feature-card"
            :class="{ active: selectedFeatures.includes('image') }"
            @click="toggleFeature('image')"
          >
            <div class="flex items-start">
              <div class="flex-shrink-0 bg-yellow-100 p-3 rounded-lg">
                <i class="fa fa-picture-o text-yellow-600 text-xl"></i>
              </div>
              <div class="ml-3">
                <h3 class="text-base font-medium text-gray-900">图像生成</h3>
                <p class="mt-1 text-sm text-gray-600">基于文本描述生成图像</p>
                <div class="mt-2 flex flex-wrap gap-2">
                  <span class="tag tag-secondary">高级</span>
                  <span class="tag tag-secondary">额外收费</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 功能卡片 5 -->
          <div
            class="feature-card"
            :class="{ active: selectedFeatures.includes('plugin') }"
            @click="toggleFeature('plugin')"
          >
            <div class="flex items-start">
              <div class="flex-shrink-0 bg-red-100 p-3 rounded-lg">
                <i class="fa fa-puzzle-piece text-red-600 text-xl"></i>
              </div>
              <div class="ml-3">
                <h3 class="text-base font-medium text-gray-900">插件系统</h3>
                <p class="mt-1 text-sm text-gray-600">
                  集成第三方工具和服务扩展功能
                </p>
                <div class="mt-2 flex flex-wrap gap-2">
                  <span class="tag tag-secondary">高级</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 功能卡片 6 -->
          <div
            class="feature-card"
            :class="{ active: selectedFeatures.includes('custom') }"
            @click="toggleFeature('custom')"
          >
            <div class="flex items-start">
              <div class="flex-shrink-0 bg-teal-100 p-3 rounded-lg">
                <i class="fa fa-cogs text-teal-600 text-xl"></i>
              </div>
              <div class="ml-3">
                <h3 class="text-base font-medium text-gray-900">自定义API</h3>
                <p class="mt-1 text-sm text-gray-600">
                  连接自定义API，实现个性化功能
                </p>
                <div class="mt-2 flex flex-wrap gap-2">
                  <span class="tag tag-secondary">专家</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 对话功能配置 -->
        <div v-if="selectedFeatures.includes('chat')" class="feature-config">
          <h3 class="config-title">对话功能配置</h3>

          <div class="form-group">
            <label for="personality" class="form-label">对话风格</label>
            <select
              id="personality"
              v-model="botFeatures.chat.personality"
              class="form-input"
            >
              <option value="professional">专业严谨</option>
              <option value="friendly">友好亲切</option>
              <option value="creative">富有创意</option>
              <option value="concise">简洁明了</option>
              <option value="humorous">幽默风趣</option>
            </select>
            <p class="form-hint">选择适合你机器人的对话风格</p>
          </div>

          <div class="form-group">
            <label for="promptTemplate" class="form-label"
              >系统提示词模板</label
            >
            <textarea
              id="promptTemplate"
              v-model="botFeatures.chat.promptTemplate"
              rows="4"
              class="form-input"
              placeholder="设置引导机器人行为的系统提示词"
            ></textarea>
            <p class="form-hint">使用JSON格式设置机器人的基本行为准则</p>
          </div>
        </div>

        <!-- 知识库配置 -->
        <div
          v-if="selectedFeatures.includes('knowledge')"
          class="feature-config"
        >
          <h3 class="config-title">知识库配置</h3>

          <div class="form-group">
            <label class="form-label">知识库来源</label>
            <div class="checkbox-group">
              <div class="checkbox-item">
                <input
                  id="webSources"
                  type="checkbox"
                  v-model="botFeatures.knowledge.sources.web"
                  class="form-checkbox"
                />
                <label for="webSources">网络抓取</label>
              </div>
              <div class="checkbox-item">
                <input
                  id="customApi"
                  type="checkbox"
                  v-model="botFeatures.knowledge.sources.api"
                  class="form-checkbox"
                />
                <label for="customApi">自定义API</label>
              </div>
              <div class="checkbox-item">
                <input
                  id="documentDb"
                  type="checkbox"
                  v-model="botFeatures.knowledge.sources.document"
                  class="form-checkbox"
                />
                <label for="documentDb">文档数据库</label>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="knowledgeRefresh" class="form-label"
              >自动刷新频率</label
            >
            <select
              id="knowledgeRefresh"
              v-model="botFeatures.knowledge.refreshFrequency"
              class="form-input"
            >
              <option value="daily">每天</option>
              <option value="weekly">每周</option>
              <option value="monthly">每月</option>
              <option value="manual">手动</option>
            </select>
            <p class="form-hint">设置知识库自动更新的频率</p>
          </div>
        </div>

        <!-- 代码助手配置 -->
        <div v-if="selectedFeatures.includes('code')" class="feature-config">
          <h3 class="config-title">代码助手配置</h3>

          <div class="form-group">
            <label for="codeLanguage" class="form-label">支持的代码语言</label>
            <select
              id="codeLanguage"
              v-model="botFeatures.code.languages"
              multiple
              class="form-input"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="csharp">C#</option>
              <option value="cpp">C++</option>
            </select>
            <p class="form-hint">选择代码助手支持的编程语言</p>
          </div>

          <div class="form-group">
            <label for="codeStyle" class="form-label">代码风格</label>
            <select
              id="codeStyle"
              v-model="botFeatures.code.style"
              class="form-input"
            >
              <option value="pep8">PEP 8 (Python)</option>
              <option value="eslint">ESLint (JavaScript)</option>
              <option value="google">Google Style (Java)</option>
            </select>
            <p class="form-hint">选择代码生成和格式化的风格</p>
          </div>
        </div>

        <!-- 图像生成配置 -->
        <div v-if="selectedFeatures.includes('image')" class="feature-config">
          <h3 class="config-title">图像生成配置</h3>

          <div class="form-group">
            <label for="imageResolution" class="form-label">图像分辨率</label>
            <select
              id="imageResolution"
              v-model="botFeatures.image.resolution"
              class="form-input"
            >
              <option value="low">低 (512x512)</option>
              <option value="medium">中 (1024x1024)</option>
              <option value="high">高 (2048x2048)</option>
            </select>
            <p class="form-hint">选择图像生成的分辨率</p>
          </div>

          <div class="form-group">
            <label for="imageStyle" class="form-label">图像风格</label>
            <select
              id="imageStyle"
              v-model="botFeatures.image.style"
              class="form-input"
            >
              <option value="realistic">写实</option>
              <option value="cartoon">卡通</option>
              <option value="abstract">抽象</option>
            </select>
            <p class="form-hint">选择图像生成的风格</p>
          </div>
        </div>

        <!-- 插件系统配置 -->
        <div v-if="selectedFeatures.includes('plugin')" class="feature-config">
          <h3 class="config-title">插件系统配置</h3>

          <div class="form-group">
            <label for="pluginSearch" class="form-label">搜索插件</label>
            <div class="relative">
              <input
                type="text"
                id="pluginSearch"
                v-model="pluginSearchQuery"
                class="form-input with-icon"
                placeholder="搜索可用插件..."
              />
              <i class="fa fa-search input-icon"></i>
            </div>
          </div>

          <div class="plugins-list">
            <h4 class="plugins-title">可用插件</h4>

            <!-- 动态渲染插件列表 -->
            <div
              v-for="plugin in filteredPlugins"
              :key="plugin.id"
              class="plugin-item"
            >
              <input
                type="checkbox"
                :id="plugin.id"
                :checked="isPluginSelected(plugin.name)"
                @change="togglePlugin(plugin.name, $event)"
                class="form-checkbox"
              />
              <label :for="plugin.id">
                <span class="plugin-name">{{ plugin.title }}</span>
                <p class="plugin-desc">{{ plugin.description }}</p>
              </label>
            </div>

            <!-- 无搜索结果时显示 -->
            <div
              v-if="pluginSearchQuery && filteredPlugins.length === 0"
              class="no-results"
            >
              没有找到匹配 "{{ pluginSearchQuery }}" 的插件
            </div>
          </div>
        </div>

        <!-- 自定义API配置 -->
        <div v-if="selectedFeatures.includes('custom')" class="feature-config">
          <h3 class="config-title">自定义API配置</h3>

          <div class="form-group">
            <label for="apiUrl" class="form-label">API URL</label>
            <input
              type="text"
              id="apiUrl"
              v-model="botFeatures.customApi.url"
              class="form-input"
              placeholder="https://api.example.com"
            />
            <p class="form-hint">输入自定义API的URL</p>
          </div>

          <div class="form-group">
            <label for="apiKey" class="form-label">API Key</label>
            <input
              type="text"
              id="apiKey"
              v-model="botFeatures.customApi.key"
              class="form-input"
              placeholder="你的API密钥"
            />
            <p class="form-hint">用于API身份验证的密钥</p>
          </div>
        </div>

        <!-- 帮助提示 -->
        <div class="help-section">
          <h3 class="help-title">配置提示</h3>
          <ul class="help-list">
            <li>• 选择的功能越多，机器人的能力越强，但资源消耗也会相应增加</li>
            <li>• 可以随时返回修改已选择的功能和配置</li>
            <li>• 部分高级功能可能需要额外付费或满足特定条件才能使用</li>
          </ul>
        </div>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <button type="button" class="btn secondary-btn" @click="goBack">
            上一步
          </button>
          <button type="submit" class="btn primary-btn">下一步</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 选中的功能
      selectedFeatures: ['chat'],

      // 插件搜索查询
      pluginSearchQuery: '',

      // 所有可用插件列表
      availablePlugins: [
        {
          id: 'plugin1',
          name: 'weather',
          title: '天气查询',
          description: '查询实时天气和预报',
        },
        {
          id: 'plugin2',
          name: 'webscrape',
          title: '网页抓取',
          description: '提取网页内容和信息',
        },
        {
          id: 'plugin3',
          name: 'calculator',
          title: '数学计算',
          description: '执行复杂数学运算',
        },
        {
          id: 'plugin4',
          name: 'translator',
          title: '翻译工具',
          description: '支持多语言互译',
        },
        {
          id: 'plugin5',
          name: 'calendar',
          title: '日历助手',
          description: '日程管理和提醒',
        },
      ],

      // 机器人功能配置详情
      botFeatures: {
        chat: {
          personality: 'friendly',
          promptTemplate: `{
  "name": "机器人名称",
  "description": "机器人描述",
  "personality": "友好亲切，乐于助人",
  "abilities": ["对话", "知识问答", "创意生成"],
  "guidelines": ["保持礼貌", "提供准确信息", "避免争议性话题"]
}`,
        },
        knowledge: {
          sources: {
            web: false,
            api: false,
            document: true,
          },
          refreshFrequency: 'weekly',
        },
        code: {
          languages: ['python', 'javascript'],
          style: 'pep8',
        },
        image: {
          resolution: 'medium',
          style: 'realistic',
        },
        plugins: [],
        customApi: {
          url: '',
          key: '',
        },
      },
    };
  },
  computed: {
    // 根据搜索词过滤插件列表
    filteredPlugins() {
      if (!this.pluginSearchQuery) {
        // 如果没有搜索词，返回所有插件
        return this.availablePlugins;
      }

      // 搜索逻辑：匹配插件名称或描述
      const query = this.pluginSearchQuery.toLowerCase();
      return this.availablePlugins.filter(
        (plugin) =>
          plugin.title.toLowerCase().includes(query) ||
          plugin.description.toLowerCase().includes(query)
      );
    },
  },
  methods: {
    // 切换功能选择状态
    toggleFeature(feature) {
      // 对话功能是必需的，不能取消
      if (feature === 'chat' && this.selectedFeatures.includes('chat')) {
        return;
      }

      const index = this.selectedFeatures.indexOf(feature);
      if (index > -1) {
        this.selectedFeatures.splice(index, 1);
      } else {
        this.selectedFeatures.push(feature);
      }
    },

    // 检查插件是否被选中
    isPluginSelected(pluginName) {
      return this.botFeatures.plugins.includes(pluginName);
    },

    // 切换插件选中状态
    togglePlugin(pluginName, event) {
      if (event.target.checked) {
        // 如果勾选，添加到数组
        if (!this.botFeatures.plugins.includes(pluginName)) {
          this.botFeatures.plugins.push(pluginName);
        }
      } else {
        // 如果取消勾选，从数组中移除
        const index = this.botFeatures.plugins.indexOf(pluginName);
        if (index > -1) {
          this.botFeatures.plugins.splice(index, 1);
        }
      }
    },

    // 提交表单
    handleSubmit() {
      // 保存功能配置并进入下一步
      this.$store.dispatch('saveBotFeatures', {
        features: this.selectedFeatures,
        config: this.botFeatures,
      });
      this.$router.push('/create/completion');
    },

    // 返回上一步
    goBack() {
      this.$router.push('/create/basic');
    },
  },
};
</script>

<style scoped>
/* 基础样式 */
.create-bot-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 25px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #333;
}

/* 页面标题 */
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

/* 步骤导航 */
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

/* 表单卡片 */
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

/* 功能卡片网格 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
}

/* 功能卡片样式 */
.feature-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.feature-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.feature-card.active {
  border-color: #0f88eb;
  background-color: rgba(15, 136, 235, 0.05);
}

.feature-card.active::after {
  content: '✓';
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 16px;
  font-weight: bold;
  color: #0f88eb;
}

/* 标签样式 */
.tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.tag-primary {
  background-color: rgba(15, 136, 235, 0.1);
  color: #0f88eb;
}

.tag-secondary {
  background-color: #f1f3f5;
  color: #495057;
}

/* 功能配置区域 */
.feature-config {
  margin: 30px 0;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  animation: fadeIn 0.3s ease-in-out;
}

.config-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #1a1a1a;
}

/* 表单样式 */
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

/* 带图标的输入框 */
.form-input.with-icon {
  padding-left: 40px;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #868e96;
}

.relative {
  position: relative;
}

/* 复选框组 */
.checkbox-group {
  margin-top: 8px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.form-checkbox {
  width: 16px;
  height: 16px;
  margin-right: 10px;
  accent-color: #0f88eb;
}

/* 插件相关样式 */
.plugins-list {
  margin-top: 20px;
}

.plugins-title {
  font-weight: 600;
  margin-bottom: 15px;
  color: #495057;
}

.plugin-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  background-color: #f8fafc;
  border-radius: 6px;
  margin-bottom: 10px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  position: relative;
}

.plugin-item:hover {
  background-color: #f1f5f9;
}

/* 插件选中高亮效果 - 修正后的样式 */
.plugin-item input:checked + label {
  color: #0f88eb;
}

.plugin-item input:checked + label .plugin-name {
  font-weight: 600;
}

.plugin-item input:checked {
  accent-color: #0f88eb;
}

.plugin-item input:checked + label .plugin-desc {
  color: #3b82f6;
}

.plugin-item input:checked + label::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 136, 235, 0.05);
  border-radius: 6px;
  z-index: -1;
}

.plugin-item .form-checkbox {
  margin-top: 3px;
  z-index: 1;
}

.plugin-name {
  font-weight: 500;
  display: block;
  transition: color 0.2s ease;
}

.plugin-desc {
  font-size: 12px;
  color: #868e96;
  margin-top: 2px;
  transition: color 0.2s ease;
}

.no-results {
  padding: 15px;
  text-align: center;
  color: #666;
  background-color: #f8fafc;
  border-radius: 6px;
  margin-top: 10px;
}

/* 帮助部分 */
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

/* 按钮样式 */
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

.secondary-btn {
  background-color: #f8f9fa;
  color: #495057;
}

.secondary-btn:hover {
  background-color: #e9ecef;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .create-bot-container {
    padding: 15px;
  }

  .features-grid {
    grid-template-columns: 1fr;
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
  }
}
</style>
