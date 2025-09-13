<template>
  <div class="version-history">
    <!-- 页面标题区域 -->
    <div class="page-header">
      <h1 class="page-title">机器人历史版本</h1>
      <p class="page-subtitle">
        查看和管理机器人「{{ agentName }}」的所有历史版本记录
      </p>

      <!-- 搜索区域 -->
      <div class="search-container">
        <el-input
          v-model="searchVersion"
          placeholder="输入版本号（如1、2）搜索特定版本..."
          class="version-search"
          @keyup.enter.native="handleSearch"
        >
          <template #append>
            <el-button icon="el-icon-search" @click="handleSearch"></el-button>
          </template>
        </el-input>
      </div>
    </div>

    <div
      class="version-list-container"
      v-loading="isLoading"
      element-loading-text="加载中..."
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(255, 255, 255, 0.8)"
    >
      <!-- 无搜索结果状态 -->
      <div
        v-if="isSearching && filteredVersions.length === 0"
        class="no-result"
      >
        <el-empty description="未找到匹配的版本记录"></el-empty>
      </div>

      <!-- 版本卡片列表 -->
      <div
        v-else
        class="version-cards"
        :class="{ 'search-result': isSearching }"
      >
        <div
          v-for="version in filteredVersions"
          :key="version.versionId"
          class="version-card"
          :class="{ 'current-version': version.isCurrent }"
        >
          <!-- 头像显示区 -->
          <div class="version-avatar-preview">
            <img
              v-if="version.robotImage"
              :src="version.robotImage"
              alt="机器人头像"
              class="version-avatar-img"
              @error="handleVersionAvatarError($event)"
            />
            <div v-else class="version-avatar-placeholder">
              <i class="el-icon-user-robot version-avatar-placeholder-icon"></i>
            </div>
          </div>
          <!-- 版本头部信息 -->
          <div class="version-header">
            <div class="version-info">
              <span class="version-number"
                >版本 #{{ version.versionNumber }}</span
              >
              <span v-if="version.isCurrent" class="current-badge"
                >当前版本</span
              >
            </div>
            <div class="version-date">
              <span>{{ formatDate(version.createdAt) }}</span>
            </div>
          </div>

          <!-- 版本内容摘要 -->
          <div class="version-content">
            <div class="version-detail">
              <p><strong>机器人名称:</strong> {{ version.name }}</p>
              <p><strong>类型:</strong> {{ getRobotType(version.type) }}</p>
              <p><strong>LLM 模型:</strong> {{ getLlmName(version.llmId) }}</p>
              <p><strong>价格:</strong> {{ version.price }}</p>
            </div>

            <!-- 版本变更日志（解析JSON） -->
            <div
              class="version-changes"
              v-if="getVersionChange(version.versionNumber)"
            >
              <p class="changes-title"><strong>更新内容:</strong></p>
              <div class="changes-desc">
                <div
                  v-for="(change, field) in parseChangeLog(
                    version.versionNumber
                  )"
                  :key="field"
                >
                  <span class="change-field"
                    >{{ formatFieldName(field) }}:</span
                  >
                  <span class="change-from" v-if="change.from !== undefined">
                    从「{{ change.from === '' ? '空' : change.from }}」
                  </span>
                  <span class="change-to">
                    改为「{{ change.to === '' ? '空' : change.to }}」
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 版本操作按钮 -->
          <div class="version-actions">
            <el-button
              size="small"
              class="view-details"
              @click="viewVersionDetails(version)"
            >
              查看详情
            </el-button>
            <el-button
              size="small"
              type="primary"
              class="restore-version"
              @click="confirmRestoreVersion(version)"
              :disabled="version.isCurrent"
            >
              恢复此版本
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页控件（当版本数大于一页时显示） -->
    <div
      class="pagination-container"
      v-if="!isLoading && totalVersions > pageSize"
    >
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[5, 10, 20]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalVersions"
      ></el-pagination>
    </div>

    <!-- 恢复版本确认对话框 -->
    <el-dialog
      title="确认恢复版本"
      :visible.sync="showRestoreConfirm"
      width="400px"
      :close-on-click-modal="false"
    >
      <p>
        你确定要将机器人「{{ agentName }}」恢复到版本 #{{
          selectedVersion?.versionNumber
        }}
        吗？
      </p>
      <p class="dialog-warning">
        此操作将覆盖当前版本设置，且不可撤销，请谨慎操作。
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showRestoreConfirm = false">取消</el-button>
        <el-button type="primary" @click="restoreVersion">确认恢复</el-button>
      </span>
    </el-dialog>

    <el-dialog
      :title="`版本详情 - #${selectedVersion?.versionNumber}`"
      :visible.sync="showVersionDetails"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedVersion" class="version-detail-dialog">
        <!-- 头像显示区 -->
        <div class="version-avatar-preview" style="margin-bottom: 18px">
          <img
            v-if="selectedVersion.robotImage"
            :src="selectedVersion.robotImage"
            alt="机器人头像"
            class="version-avatar-img"
            @error="handleVersionAvatarError($event)"
          />
          <div v-else class="version-avatar-placeholder">
            <i class="el-icon-user-robot version-avatar-placeholder-icon"></i>
          </div>
        </div>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="版本号"
            >#{{ selectedVersion.versionNumber }}</el-descriptions-item
          >
          <el-descriptions-item label="创建时间">{{
            formatDate(selectedVersion.createdAt)
          }}</el-descriptions-item>
          <el-descriptions-item label="机器人ID">{{
            agentId
          }}</el-descriptions-item>
          <el-descriptions-item label="机器人名称">{{
            selectedVersion.name
          }}</el-descriptions-item>
          <el-descriptions-item label="机器人类型">{{
            getRobotType(selectedVersion.type)
          }}</el-descriptions-item>
          <el-descriptions-item label="LLM 模型">{{
            getLlmName(selectedVersion.llmId)
          }}</el-descriptions-item>
          <el-descriptions-item label="价格"
            >{{ selectedVersion.price }} 元</el-descriptions-item
          >
          <el-descriptions-item label="提示词">
            <pre class="prompt-content">{{
              selectedVersion.chatPrompt || '无'
            }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="描述">
            <p>{{ selectedVersion.description || '无' }}</p>
          </el-descriptions-item>
          <el-descriptions-item label="更新记录" v-if="selectedVersionChange">
            <div class="detail-change-log">
              <div
                v-for="(change, field) in parseChangeLog(
                  selectedVersion.versionNumber
                )"
                :key="field"
              >
                <span class="change-field">{{ formatFieldName(field) }}:</span>
                <template
                  v-if="field === 'robotImage' || field === 'avatarUrl'"
                >
                  <span
                    class="change-from"
                    v-if="change.from !== undefined || change.to !== undefined"
                  >
                    头像已更换
                  </span>
                </template>
                <template v-else>
                  <span class="change-from" v-if="change.from !== undefined">
                    从「{{ change.from === '' ? '空' : change.from }}」
                  </span>
                  <span class="change-to">
                    改为「{{ change.to === '' ? '空' : change.to }}」
                  </span>
                </template>
              </div>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getAgentAllSettings,
  getAgentVersion,
  updateAgentSettings,
} from '@/utils/api';
import {
  Dialog,
  Descriptions,
  DescriptionsItem,
  Pagination,
  Empty,
  Button,
  Input,
} from 'element-ui';

export default {
  name: 'BotsHistoryVersionPage',
  components: {
    'el-dialog': Dialog,
    'el-descriptions': Descriptions,
    'el-descriptions-item': DescriptionsItem,
    'el-pagination': Pagination,
    'el-empty': Empty,
    'el-button': Button,
    'el-input': Input,
  },
  data() {
    return {
      allVersions: [],
      filteredVersions: [],
      versionChanges: [],
      totalVersions: 0,
      agentName: '',

      // 分页配置
      currentPage: 1,
      pageSize: 10,

      // 搜索相关
      searchVersion: '',
      isSearching: false,

      // 对话框状态
      showRestoreConfirm: false,
      showVersionDetails: false,
      selectedVersion: null,
      selectedVersionChange: null,

      // 基础状态
      agentId: null,
      isLoading: false,

      // 常量映射
      robotTypes: [
        { label: '角色扮演', value: 1 },
        { label: '代码编程', value: 2 },
        { label: '文本生成', value: 3 },
      ],
      llmOptions: [
        { label: 'Kimi', value: 1 },
        { label: 'Deepseek', value: 2 },
      ],
    };
  },

  async created() {
    // 1. 获取路由中的机器人ID
    this.agentId = this.$route.params.agentId;
    if (!this.agentId) {
      this.$message.error('未获取到机器人ID，无法查看历史版本');
      this.$router.go(-1);
      return;
    }

    // 2. 加载历史版本数据
    await this.loadVersionHistory();
  },

  methods: {
    // 历史卡片头像加载失败处理
    handleVersionAvatarError(event) {
      event.target.style.display = 'none';
      // 可选：弹出提示或显示占位图
    },
    async loadVersionHistory() {
      this.isLoading = true;
      try {
        const response = await getAgentAllSettings(this.agentId, {
          params: {
            page: this.currentPage,
            pageSize: this.pageSize,
          },
        });

        if (response.status === 200 && response.data.success) {
          const apiData = response.data;
          this.allVersions = apiData.versions || [];
          this.versionChanges = apiData.versionChanges || [];
          this.totalVersions = apiData.totalVersions || 0;
          this.agentName = apiData.agentName || '未知机器人';

          if (this.allVersions.length > 0) {
            const maxVersionNum = Math.max(
              ...this.allVersions.map((v) => v.versionNumber)
            );
            this.allVersions = this.allVersions.map((version) => ({
              ...version,
              isCurrent: version.versionNumber === maxVersionNum,
            }));
          }

          this.filteredVersions = [...this.allVersions];
          this.isSearching = false;
        } else {
          this.$message.error(
            '加载历史版本失败：' + (response.data?.message || '数据异常')
          );
        }
      } catch (error) {
        console.error('加载历史版本错误：', error);
        this.$message.error(
          '加载失败：' + (error.response?.data?.message || '网络异常')
        );
      } finally {
        this.isLoading = false;
      }
    },

    handleSearch() {
      const searchVal = this.searchVersion.trim();
      if (!searchVal) {
        this.filteredVersions = [...this.allVersions];
        this.isSearching = false;
        return;
      }

      const targetVersionNum = parseInt(searchVal, 10);
      this.isSearching = true;

      if (!isNaN(targetVersionNum)) {
        this.filteredVersions = this.allVersions.filter(
          (version) => version.versionNumber === targetVersionNum
        );
      } else {
        this.filteredVersions = [];
        this.$message.warning('请输入有效的版本号（如1、2等数字）');
      }
    },

    async viewVersionDetails(version) {
      this.isLoading = true;
      try {
        const response = await getAgentVersion(
          this.agentId,
          version.versionNumber
        );

        if (response.status === 200 && response.data.success) {
          this.selectedVersion = response.data.version;
          this.selectedVersionChange = this.getVersionChange(
            version.versionNumber
          );
          this.showVersionDetails = true;
        } else {
          this.$message.error(
            '获取版本详情失败：' + (response.data?.message || '数据异常')
          );
        }
      } catch (error) {
        console.error('获取版本详情错误：', error);
        this.$message.error(
          '获取详情失败：' + (error.response?.data?.message || '网络异常')
        );
        this.selectedVersion = version;
        this.selectedVersionChange = this.getVersionChange(
          version.versionNumber
        );
        this.showVersionDetails = true;
      } finally {
        this.isLoading = false;
      }
    },

    confirmRestoreVersion(version) {
      this.selectedVersion = version;
      this.showRestoreConfirm = true;
    },

    async restoreVersion() {
      if (!this.selectedVersion) return;

      this.isLoading = true;
      try {
        const payload = {
          name: this.selectedVersion.name,
          type: this.selectedVersion.type,
          llmId: this.selectedVersion.llmId,
          chatPrompt: this.selectedVersion.chatPrompt,
          description: this.selectedVersion.description || '',
          price: this.selectedVersion.price,
          robotImage: this.selectedVersion.robotImage || '',
        };

        console.log(
          `恢复版本请求：agentId=${this.agentId}，versionNumber=${this.selectedVersion.versionNumber}，payload=`,
          payload
        );
        const response = await updateAgentSettings(this.agentId, payload);

        if (response.status === 200) {
          this.$message.success(
            `已成功提交恢复到版本 #${this.selectedVersion.versionNumber}申请，等待管理员审核！`
          );
          this.showRestoreConfirm = false;
          await this.loadVersionHistory();
        } else {
          throw new Error(
            response.data?.message || '恢复请求已发送，但后端返回异常'
          );
        }
      } catch (error) {
        console.error('恢复版本错误：', error);
        this.$message.error(
          '恢复失败：' +
            (error.response?.data?.message || error.message || '操作异常')
        );
        this.showRestoreConfirm = false;
      } finally {
        this.isLoading = false;
      }
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      // 中文时间格式：2025-09-03 22:34
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    },

    getRobotType(typeValue) {
      const type = this.robotTypes.find((t) => t.value === typeValue);
      return type ? type.label : `未知类型(${typeValue})`;
    },

    getLlmName(llmValue) {
      const llm = this.llmOptions.find((l) => l.value === llmValue);
      return llm ? llm.label : `未知模型(${llmValue})`;
    },

    getVersionChange(versionNumber) {
      return this.versionChanges.find(
        (change) => change.toVersionNumber === versionNumber
      );
    },

    parseChangeLog(versionNumber) {
      const change = this.getVersionChange(versionNumber);
      if (!change || !change.changedFields) return {};

      try {
        return JSON.parse(change.changedFields);
      } catch (e) {
        console.error('解析变更记录失败：', e);
        return { 解析错误: { to: '变更记录格式异常' } };
      }
    },

    formatFieldName(field) {
      const fieldMap = {
        name: '机器人名称',
        type: '机器人类型',
        llmId: 'LLM模型ID',
        chatPrompt: '提示词',
        description: '描述',
        price: '价格',
      };
      return fieldMap[field] || field;
    },

    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
      this.loadVersionHistory();
    },

    handleCurrentChange(val) {
      this.currentPage = val;
      this.loadVersionHistory();
    },
  },
};
</script>

<style lang="scss" scoped>
// 版本卡片头像样式
.version-avatar-preview {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 12px auto;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}
.version-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.version-avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}
.version-avatar-placeholder-icon {
  font-size: 32px;
}
// 基础样式
.version-history {
  width: 100%;
  min-height: 100vh;
  background-color: #f9f9f9;
  padding: 30px 20px;
  box-sizing: border-box;
}

// 页面标题区域
.page-header {
  max-width: 1200px;
  margin: 0 auto 30px;

  .page-title {
    font-size: 1.8rem;
    color: #1a1a1a;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .page-subtitle {
    color: #646464;
    font-size: 1rem;
    margin-bottom: 20px;
  }
}

// 搜索区域
.search-container {
  width: 100%;
  max-width: 500px;

  .version-search {
    width: 100%;

    ::v-deep .el-input__inner {
      border-radius: 6px;
      padding: 10px 15px;
      border: 1px solid #e5e7eb;
    }

    ::v-deep .el-input-group__append {
      border-radius: 0 6px 6px 0;
    }
  }
}

// 版本列表区域
.version-list {
  max-width: 1200px;
  margin: 0 auto;
}

// 版本卡片容器
.version-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(550px, 1fr));
  gap: 20px;

  &.search-result {
    justify-content: center;
  }
}

// 版本卡片样式
.version-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }

  &.current-version {
    border-left: 4px solid #0f88eb; // 知乎蓝作为当前版本标识
  }
}

// 版本头部信息
.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;

  .version-info {
    display: flex;
    align-items: center;
    gap: 10px;

    .version-number {
      font-weight: 600;
      color: #1a1a1a;
    }

    .current-badge {
      background-color: #0f88eb;
      color: white;
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 12px;
    }
  }

  .version-date {
    text-align: right;
    font-size: 0.9rem;
    color: #646464;
  }
}

// 版本内容区域
.version-content {
  margin-bottom: 20px;

  .version-detail {
    margin-bottom: 15px;
    font-size: 0.9rem;
    line-height: 1.6;

    p {
      margin: 5px 0;
      color: #1a1a1a;
    }
  }

  .version-changes {
    background-color: #f9f9f9;
    padding: 12px;
    border-radius: 6px;
    font-size: 0.9rem;

    .changes-title {
      margin-bottom: 8px;
      color: #1a1a1a;
      font-weight: 500;
    }

    .changes-desc {
      color: #646464;

      .change-field {
        color: #1a1a1a;
        font-weight: 500;
        margin-right: 5px;
      }

      .change-from {
        color: #ff4d4f; // 红色标识旧值
        margin-right: 5px;
      }

      .change-to {
        color: #00b42a; // 绿色标识新值
      }
    }
  }
}

// 版本操作按钮
.version-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  .view-details {
    background: white;
    color: #1a1a1a;
    border: 1px solid #e5e7eb;
    border-radius: 6px;

    &:hover {
      background: #f5f5f5;
      border-color: #dcdfe6;
    }
  }

  .restore-version {
    background: #0f88eb;
    color: white;
    border-radius: 6px;

    &:disabled {
      background: #ccc;
      border-color: #ccc;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      background: #0968c3;
    }
  }
}

// 无结果状态
.no-result {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

// 分页控件
.pagination-container {
  max-width: 1200px;
  margin: 30px auto 0;
  text-align: right;

  ::v-deep .el-pagination {
    display: inline-flex;
  }
}

// 版本详情对话框
::v-deep .version-detail-dialog {
  .prompt-content {
    white-space: pre-wrap;
    word-wrap: break-word;
    background-color: #f5f5f5;
    padding: 10px;
    border-radius: 4px;
    margin: 0;
    color: #1a1a1a;
  }

  .detail-change-log {
    color: #646464;

    .change-field {
      color: #1a1a1a;
      font-weight: 500;
      margin-right: 5px;
    }

    .change-from {
      color: #ff4d4f;
      margin-right: 5px;
    }

    .change-to {
      color: #00b42a;
    }
  }
}

// 对话框警告文本
::v-deep .dialog-warning {
  color: #ff7a45;
  margin-top: 10px;
}

// 响应式调整
@media (max-width: 1200px) {
  .version-cards {
    grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  }
}

@media (max-width: 768px) {
  .version-history {
    padding: 20px 10px;
  }

  .version-cards {
    grid-template-columns: 1fr;
  }

  .version-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;

    .version-date {
      text-align: left;
      width: 100%;
    }
  }

  .pagination-container {
    text-align: center;
  }
  .version-list-container {
    max-width: 1200px;
    margin: 0 auto;
    min-height: calc(100vh - 200px);
    position: relative;
  }
}
</style>
