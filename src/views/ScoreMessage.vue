<template>
  <div class="score-page">
    <h1 class="title">积分明细</h1>
    <p class="description">查看您的积分获取和使用记录。</p>

    <div class="score-container">
      <div class="current-score">
        <h2>
          当前积分：<span class="highlight">{{ points }}</span>
        </h2>
      </div>

      <!-- 积分说明 -->
      <div class="score-info">
        <h3>积分说明</h3>
        <ul>
          <li>• 通过贡献内容（如开发AI机器人）可获得激励积分奖励</li>
          <li>• 每日签到和充值也可获取积分</li>
          <li>• 积分可用于新增模型、解锁更多AI能力等</li>
        </ul>
      </div>

      <!-- 标签页切换 -->
      <div class="tabs">
        <button
          :class="['tab-button', currentTab === 'all' ? 'tab-active' : '']"
          @click="switchTab('all')"
        >
          全部
        </button>
        <button
          :class="[
            'tab-button tab-in',
            currentTab === 'in' ? 'tab-active' : '',
          ]"
          @click="switchTab('in')"
        >
          获取
        </button>
        <button
          :class="[
            'tab-button tab-out',
            currentTab === 'out' ? 'tab-active' : '',
          ]"
          @click="switchTab('out')"
        >
          消耗
        </button>
      </div>

      <div class="score-details">
        <table class="score-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>类型</th>
              <th>描述</th>
              <th>变动</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in paginatedData" :key="entry.time">
              <td>{{ entry.time }}</td>
              <td>
                <span
                  :class="entry.badge === 'in' ? 'badge-in' : 'badge-out'"
                  >{{ entry.type }}</span
                >
              </td>
              <td>{{ entry.desc }}</td>
              <td :class="entry.badge === 'in' ? 'text-green' : 'text-red'">
                {{ entry.change }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页控件 -->
      <div class="pagination" v-if="totalPages > 1">
        <button
          class="pagination-button"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          上一页
        </button>
        <span>第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
        <button
          class="pagination-button"
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ScoreMessage',
  data() {
    return {
      points: 100, // 当前积分
      currentTab: 'all', // 当前选中的标签页
      currentPage: 1, // 当前页码
      pageSize: 5, // 每页显示的记录数
      scoreData: [
        {
          time: '2025-07-18 09:30',
          type: '获取',
          desc: '每日签到',
          change: '+10',
          badge: 'in',
        },
        {
          time: '2025-07-18 08:00',
          type: '获取',
          desc: '开发AI机器人激励',
          change: '+200',
          badge: 'in',
        },
        {
          time: '2025-07-17 20:15',
          type: '消耗',
          desc: '新增AI模型',
          change: '-100',
          badge: 'out',
        },
        {
          time: '2025-07-17 18:00',
          type: '获取',
          desc: '充值积分',
          change: '+100',
          badge: 'in',
        },
        {
          time: '2025-07-17 10:00',
          type: '获取',
          desc: '每日签到',
          change: '+10',
          badge: 'in',
        },
        {
          time: '2025-07-16 09:00',
          type: '消耗',
          desc: '解锁高级功能',
          change: '-50',
          badge: 'out',
        },
        {
          time: '2025-07-15 12:00',
          type: '获取',
          desc: '活动奖励',
          change: '+30',
          badge: 'in',
        },
        {
          time: '2025-07-14 15:00',
          type: '消耗',
          desc: '兑换礼品',
          change: '-20',
          badge: 'out',
        },
        {
          time: '2025-07-13 10:00',
          type: '获取',
          desc: '每日签到',
          change: '+10',
          badge: 'in',
        },
        {
          time: '2025-07-12 18:00',
          type: '消耗',
          desc: '购买服务',
          change: '-80',
          badge: 'out',
        },
      ],
    };
  },
  computed: {
    filteredScoreData() {
      if (this.currentTab === 'all') {
        return this.scoreData;
      }
      return this.scoreData.filter((entry) => entry.badge === this.currentTab);
    },
    totalPages() {
      return Math.ceil(this.filteredScoreData.length / this.pageSize);
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredScoreData.slice(start, end);
    },
  },
  methods: {
    switchTab(tab) {
      this.currentTab = tab;
      this.currentPage = 1; // 切换标签时重置到第一页
    },
    changePage(page) {
      this.currentPage = page;
    },
  },
  watch: {
    $route(to) {
      if (to.params.points) {
        this.points = to.params.points;
      }
    },
  },
};
</script>

<style scoped>
.score-page {
  padding: 20px;
  background-color: #f7f8fa;
  color: #333;
  font-family: Arial, sans-serif;
}

.title {
  font-size: 2em;
  text-align: center;
  margin-bottom: 20px;
  color: #165dff;
}

.description {
  text-align: center;
  margin-bottom: 20px;
  color: #666;
}

.score-container {
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.current-score {
  text-align: center;
  margin-bottom: 20px;
}

.current-score .highlight {
  color: #52c41a;
  font-weight: bold;
}

.score-info {
  margin: 20px 0;
  padding: 15px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.score-info h3 {
  margin-bottom: 10px;
  font-size: 1.2em;
  color: #333;
}

.score-info ul {
  list-style-type: none;
  padding: 0;
}

.score-info li {
  margin-bottom: 5px;
  color: #666;
}

.tabs {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.tab-button {
  flex: 1;
  text-align: center;
  padding: 10px 20px;
  margin: 0 5px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f4f4f4;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-button:hover {
  background-color: #e6e6e6;
}

.tab-in {
  background-color: #e6f7ff;
  color: #52c41a;
}

.tab-out {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.tab-active {
  background-color: #165dff;
  color: #fff;
  font-weight: bold;
}

.score-table {
  width: 100%;
  border-collapse: collapse;
}

.score-table th,
.score-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.score-table th {
  background-color: #f4f4f4;
  font-weight: bold;
}

.text-green {
  color: #52c41a;
}

.text-red {
  color: #ff4d4f;
}

.badge-in {
  background-color: #52c41a;
  color: white;
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
}

.badge-out {
  background-color: #ff4d4f;
  color: white;
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.pagination-button {
  padding: 5px 10px;
  margin: 0 5px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f4f4f4;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-button:disabled {
  background-color: #e6e6e6;
  color: #999;
  cursor: not-allowed;
}

.pagination-button:hover:not(:disabled) {
  background-color: #e6e6e6;
}
</style>
