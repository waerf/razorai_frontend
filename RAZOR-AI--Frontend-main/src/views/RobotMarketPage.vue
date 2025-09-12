<template>
  <div class="robot-market">
    <!-- 搜索区域 -->
    <div class="search-container">
      <div class="search-wrapper">
        <div class="search-mode-selector">
          <el-dropdown @command="setSearchMode">
            <el-button class="search-mode-btn">
              {{ currentSearchModeText }}
              <i class="el-icon-arrow-down"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="name">按名称搜索</el-dropdown-item>
              <el-dropdown-item command="description"
                >按描述搜索</el-dropdown-item
              >
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <el-input
          v-model="searchKeyword"
          class="search-input"
          placeholder="搜索机器人..."
          @clear="handleSearchClear"
          clearable
        >
          <el-button
            slot="append"
            icon="el-icon-search"
            @click="handleSearchClick"
          ></el-button>
        </el-input>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-if="showSearchResults" class="search-results">
      <div v-loading="searchLoading" class="search-results-container">
        <h2 class="section-title">
          搜索结果 (第{{ currentSearchPageNumber }}页，共{{
            searchResults.length
          }}个)
        </h2>
        <div class="robots-grid" :style="mainGridStyle">
          <el-card
            v-for="robot in searchResults"
            :key="robot.id"
            class="robot-card"
            @click.native="showRobotDetail(robot.id)"
          >
            <div class="robot-header">
              <img
                :src="getRobotImage(robot.robotImage)"
                alt="robot"
                class="robot-logo"
              />
              <div class="robot-name">{{ robot.name }}</div>
            </div>
            <div class="robot-description">
              {{ truncate(robot.description, 80) }}
            </div>
            <div class="robot-rating-price">
              <div class="robot-subscription">
                <i class="el-icon-user" style="color: #409eff"></i>
                {{ robot.subscriptionCnt || 0 }} 人订阅
              </div>
              <div class="robot-price">
                {{ formatprice(robot.price) }}
              </div>
            </div>
            <div class="robot-actions">
              <el-button size="mini" @click.stop="showRobotDetail(robot.id)">
                查看详情
              </el-button>
              <el-button
                type="primary"
                size="mini"
                :class="{ subscribed: isSubscribed(robot.id) }"
                @click.stop="subscribeRobot(robot.id)"
              >
                {{ isSubscribed(robot.id) ? '开始对话' : '订阅' }}
              </el-button>
            </div>
          </el-card>
        </div>

        <!-- 搜索结果分页控件 -->
        <div class="pagination-controls">
          <el-button
            :disabled="isFirstSearchPage || searchLoading"
            :class="['pagination-btn', { disabled: isFirstSearchPage }]"
            @click="goToPreviousSearchPage"
          >
            <i class="el-icon-arrow-left"></i>
            上一页
          </el-button>

          <span class="page-info">第 {{ currentSearchPageNumber }} 页</span>

          <el-button
            :disabled="!hasNextSearchPage || searchLoading"
            :class="['pagination-btn', { disabled: !hasNextSearchPage }]"
            @click="goToNextSearchPage"
          >
            下一页
            <i class="el-icon-arrow-right"></i>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 机器人分类展示 -->
    <div v-else class="robots-container">
      <!-- 推荐机器人 -->
      <div v-if="isLoggedIn" class="category-section">
        <div class="category-header">
          <h3 class="category-title">
            <i class="el-icon-collection-tag"></i>
            推荐机器人
          </h3>
          <el-button class="view-more-btn" @click="refreshRecommendedRobots">
            换一批
          </el-button>
        </div>
        <div class="robots-grid" :style="mainGridStyle">
          <el-card
            v-for="robot in displayRecommendedRobots"
            :key="robot.id"
            :class="[
              'robot-card',
              { 'placeholder-card': isPlaceholder(robot) },
            ]"
            @click.native="
              isPlaceholder(robot) ? null : showRobotDetail(robot.id)
            "
          >
            <template v-if="!isPlaceholder(robot)">
              <div class="robot-header">
                <img
                  :src="getRobotImage(robot.robotImage)"
                  alt="robot"
                  class="robot-logo"
                />
                <div class="robot-name">{{ robot.name }}</div>
              </div>
              <div class="robot-description">
                {{ truncate(robot.description, 80) }}
              </div>
              <div class="robot-rating-price">
                <div class="robot-subscription">
                  <i class="el-icon-user" style="color: #409eff"></i>
                  {{ robot.subscription_count || 0 }} 人订阅
                </div>
                <div class="robot-price">
                  {{ formatprice(robot.price) }}
                </div>
              </div>
              <div class="robot-actions">
                <el-button size="mini" @click.stop="showRobotDetail(robot.id)">
                  查看详情
                </el-button>
                <el-button
                  type="primary"
                  size="mini"
                  :class="{ subscribed: isSubscribed(robot.id) }"
                  @click.stop="subscribeRobot(robot.id)"
                >
                  {{ isSubscribed(robot.id) ? '开始对话' : '订阅' }}
                </el-button>
              </div>
            </template>
          </el-card>
        </div>
      </div>

      <!-- 角色扮演机器人 -->
      <div class="category-section">
        <div class="category-header">
          <h3 class="category-title">
            <i class="el-icon-headset"></i>
            角色扮演机器人
          </h3>
          <el-button
            class="view-more-btn"
            @click="showCategoryDetail('roleplay')"
          >
            查看更多
          </el-button>
        </div>
        <div class="robots-grid" :style="mainGridStyle">
          <el-card
            v-for="robot in displayRolePlayRobots"
            :key="robot.id"
            :class="[
              'robot-card',
              { 'placeholder-card': isPlaceholder(robot) },
            ]"
            @click.native="
              isPlaceholder(robot) ? null : showRobotDetail(robot.id)
            "
          >
            <template v-if="!isPlaceholder(robot)">
              <div class="robot-header">
                <img
                  :src="getRobotImage(robot.robotImage)"
                  alt="robot"
                  class="robot-logo"
                />
                <div class="robot-name">{{ robot.name }}</div>
              </div>
              <div class="robot-description">
                {{ truncate(robot.description, 80) }}
              </div>
              <div class="robot-rating-price">
                <div class="robot-subscription">
                  <i class="el-icon-user" style="color: #409eff"></i>
                  {{ robot.subscriptionCnt || 0 }} 人订阅
                </div>
                <div class="robot-price">
                  {{ formatprice(robot.price) }}
                </div>
              </div>
              <div class="robot-actions">
                <el-button size="mini" @click.stop="showRobotDetail(robot.id)">
                  查看详情
                </el-button>
                <el-button
                  type="primary"
                  size="mini"
                  :class="{ subscribed: isSubscribed(robot.id) }"
                  @click.stop="subscribeRobot(robot.id)"
                >
                  {{ isSubscribed(robot.id) ? '开始对话' : '订阅' }}
                </el-button>
              </div>
            </template>
          </el-card>
        </div>
      </div>

      <!-- 代码编程机器人 -->
      <div class="category-section">
        <div class="category-header">
          <h3 class="category-title">
            <i class="el-icon-postcard"></i>
            代码编程机器人
          </h3>
          <el-button
            class="view-more-btn"
            @click="showCategoryDetail('coding')"
          >
            查看更多
          </el-button>
        </div>
        <div class="robots-grid" :style="mainGridStyle">
          <el-card
            v-for="robot in displayCodingRobots"
            :key="robot.id"
            :class="[
              'robot-card',
              { 'placeholder-card': isPlaceholder(robot) },
            ]"
            @click.native="
              isPlaceholder(robot) ? null : showRobotDetail(robot.id)
            "
          >
            <template v-if="!isPlaceholder(robot)">
              <div class="robot-header">
                <img
                  :src="getRobotImage(robot.robotImage)"
                  alt="robot"
                  class="robot-logo"
                />
                <div class="robot-name">{{ robot.name }}</div>
              </div>
              <div class="robot-description">
                {{ truncate(robot.description, 80) }}
              </div>
              <div class="robot-rating-price">
                <div class="robot-subscription">
                  <i class="el-icon-user" style="color: #409eff"></i>
                  {{ robot.subscriptionCnt || 0 }} 人订阅
                </div>
                <div class="robot-price">
                  {{ formatprice(robot.price) }}
                </div>
              </div>
              <div class="robot-actions">
                <el-button size="mini" @click.stop="showRobotDetail(robot.id)">
                  查看详情
                </el-button>
                <el-button
                  type="primary"
                  size="mini"
                  :class="{ subscribed: isSubscribed(robot.id) }"
                  @click.stop="subscribeRobot(robot.id)"
                >
                  {{ isSubscribed(robot.id) ? '开始对话' : '订阅' }}
                </el-button>
              </div>
            </template>
          </el-card>
        </div>
      </div>

      <!-- 文本生成机器人 -->
      <div class="category-section">
        <div class="category-header">
          <h3 class="category-title">
            <i class="el-icon-document"></i>
            文本生成机器人
          </h3>
          <el-button class="view-more-btn" @click="showCategoryDetail('paper')">
            查看更多
          </el-button>
        </div>
        <div class="robots-grid" :style="mainGridStyle">
          <el-card
            v-for="robot in displayPaperRobots"
            :key="robot.id"
            :class="[
              'robot-card',
              { 'placeholder-card': isPlaceholder(robot) },
            ]"
            @click.native="
              isPlaceholder(robot) ? null : showRobotDetail(robot.id)
            "
          >
            <template v-if="!isPlaceholder(robot)">
              <div class="robot-header">
                <img
                  :src="getRobotImage(robot.robotImage)"
                  alt="robot"
                  class="robot-logo"
                />
                <div class="robot-name">{{ robot.name }}</div>
              </div>
              <div class="robot-description">
                {{ truncate(robot.description, 80) }}
              </div>
              <div class="robot-rating-price">
                <div class="robot-subscription">
                  <i class="el-icon-user" style="color: #409eff"></i>
                  {{ robot.subscriptionCnt || 0 }} 人订阅
                </div>
                <div class="robot-price">
                  {{ formatprice(robot.price) }}
                </div>
              </div>
              <div class="robot-actions">
                <el-button size="mini" @click.stop="showRobotDetail(robot.id)">
                  查看详情
                </el-button>
                <el-button
                  type="primary"
                  size="mini"
                  :class="{ subscribed: isSubscribed(robot.id) }"
                  @click.stop="subscribeRobot(robot.id)"
                >
                  {{ isSubscribed(robot.id) ? '开始对话' : '订阅' }}
                </el-button>
              </div>
            </template>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 分类详情对话框 -->
    <el-dialog
      :title="categoryDialogTitle"
      :visible.sync="categoryDialogVisible"
      width="95vw"
      top="5vh"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div v-loading="paginationLoading" class="category-detail-container">
        <div class="category-detail-grid" :style="categoryDetailGridStyle">
          <el-card
            v-for="robot in displayCategoryDetailRobots"
            :key="robot.id"
            class="robot-card"
            :class="{ 'placeholder-card': isPlaceholder(robot) }"
            @click.native="!isPlaceholder(robot) && showRobotDetail(robot.id)"
          >
            <template v-if="!isPlaceholder(robot)">
              <div class="robot-header">
                <img
                  :src="getRobotImage(robot.robotImage)"
                  alt="robot"
                  class="robot-logo"
                />
                <div class="robot-name">{{ robot.name }}</div>
              </div>
              <div class="robot-description">
                {{ truncate(robot.description, 80) }}
              </div>
              <div class="robot-rating-price">
                <div class="robot-subscription">
                  <i class="el-icon-user" style="color: #409eff"></i>
                  {{ robot.subscriptionCnt || 0 }} 人订阅
                </div>
                <div class="robot-price">
                  {{ formatprice(robot.price) }}
                </div>
              </div>
              <div class="robot-actions">
                <el-button size="mini" @click.stop="showRobotDetail(robot.id)">
                  查看详情
                </el-button>
                <el-button
                  type="primary"
                  size="mini"
                  :class="{ subscribed: isSubscribed(robot.id) }"
                  @click.stop="subscribeRobot(robot.id)"
                >
                  {{ isSubscribed(robot.id) ? '开始对话' : '订阅' }}
                </el-button>
              </div>
            </template>
          </el-card>
        </div>

        <!-- 分页控件 -->
        <div class="pagination-controls">
          <el-button
            :disabled="isFirstPage || paginationLoading"
            :class="['pagination-btn', { disabled: isFirstPage }]"
            @click="goToPreviousPage"
          >
            <i class="el-icon-arrow-left"></i>
            上一页
          </el-button>

          <span class="page-info">第 {{ currentPageNumber }} 页</span>

          <el-button
            :disabled="!hasNextPage || paginationLoading"
            :class="['pagination-btn', { disabled: !hasNextPage }]"
            @click="goToNextPage"
          >
            下一页
            <i class="el-icon-arrow-right"></i>
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 订阅确认对话框 -->
    <el-dialog
      title="订阅确认"
      :visible.sync="subscriptionDialogVisible"
      width="400px"
      center
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <subscription-selector
        :robotId="
          currentRobotForSubscription ? currentRobotForSubscription.id : 0
        "
        :price="
          currentRobotForSubscription
            ? currentRobotForSubscription.price !== undefined &&
              currentRobotForSubscription.price !== null
              ? currentRobotForSubscription.price
              : 1
            : 1
        "
        :onConfirm="handleSubscriptionConfirm"
        :onClose="closeSubscriptionDialog"
      />
    </el-dialog>

    <!-- 机器人详情弹窗 -->
    <robot-detail-dialog
      :visible="robotDetailVisible"
      :robotId="currentRobotId"
      @close="handleRobotDetailClose"
      @show-robot="showRobotDetail"
    />
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import {
  subscribeAgent as apiSubscribeAgent,
  getRobotsByType as apiGetRobotsByType,
  searchAgent as apiSearchAgent,
  getRecommendedRobots as apiGetRecommendedRobots,
  createChat as apicreateChat,
  fetchAllChats as apifetchAllChats,
} from '../utils/api';
import RobotDetailDialog from './RobotDetailPage.vue';
import SubscriptionSelector from '@/components/SubscriptionSelector.vue';

export default {
  name: 'RobotMarketPage',
  components: {
    RobotDetailDialog,
    SubscriptionSelector,
  },
  data() {
    return {
      searchKeyword: '',
      currentSearchMode: 'name',
      showSearchResults: false,
      searchResults: [],
      categoryDialogVisible: false,
      categoryDialogTitle: '',
      categoryDetailRobots: [],
      subscriptionDialogVisible: false,
      currentRobotForSubscription: null,
      loading: false,
      robotDetailVisible: false,
      currentRobotId: null,
      // 新增的分页相关数据
      recommendedRobots: [], // 推荐机器人
      rolePlayRobots: [], // 角色扮演机器人
      codingRobots: [], // 代码编程机器人
      paperRobots: [], // 文本生成机器人
      currentCategoryType: null, // 当前查看的分类类型
      currentFirstIndex: 0, // 当前分页的起始索引
      paginationLoading: false, // 分页加载状态
      hasNextPage: true, // 是否有下一页
      // 搜索相关数据
      searchType: 1, // 搜索类型：1=名称，2=描述
      searchInfo: '', // 当前搜索关键词
      searchIndex: 0, // 搜索结果起始索引
      searchLoading: false, // 搜索加载状态
      hasNextSearchPage: true, // 是否有下一页搜索结果
      subscriptionCheckInterval: null, // 订阅状态检查定时器
      // 响应式布局相关
      containerWidth: 0, // 容器宽度
      robotsPerRow: 4, // 每行显示的机器人数量
      resizeObserver: null, // 用于监听容器尺寸变化
      resizeTimeout: null, // 防抖超时ID
      // Category detail 相关
      categoryDetailRows: 2, // category detail 显示行数
      categoryDetailPageSize: 8, // 每页显示的机器人数量
    };
  },
  computed: {
    ...mapState('user', ['isLoggedIn', 'userName', 'userId']),
    ...mapState('agent', {
      haveSubscribed: (state) => state.haveSubscribed,
    }),
    currentSearchModeText() {
      const modes = {
        name: '按名称搜索',
        description: '按描述搜索',
      };
      return modes[this.currentSearchMode];
    },
    allRobots() {
      // 过滤掉占位符，只返回真实的机器人数据
      const realRobots = [
        ...this.recommendedRobots.filter((robot) => !robot.isPlaceholder),
        ...this.rolePlayRobots.filter((robot) => !robot.isPlaceholder),
        ...this.codingRobots.filter((robot) => !robot.isPlaceholder),
        ...this.paperRobots.filter((robot) => !robot.isPlaceholder),
      ];
      return realRobots;
    },
    currentPageNumber() {
      const pageSize = this.dynamicCategoryDetailPageSize;
      return Math.floor(this.currentFirstIndex / pageSize) + 1;
    },
    isFirstPage() {
      return this.currentFirstIndex === 0;
    },
    // 搜索相关计算属性
    currentSearchPageNumber() {
      return Math.floor(this.searchIndex / 16) + 1;
    },
    isFirstSearchPage() {
      return this.searchIndex === 0;
    },
    // 响应式布局计算属性
    displayRecommendedRobots() {
      return this.getPaddedRobots(this.recommendedRobots);
    },
    displayRolePlayRobots() {
      return this.getPaddedRobots(this.rolePlayRobots);
    },
    displayCodingRobots() {
      return this.getPaddedRobots(this.codingRobots);
    },
    displayPaperRobots() {
      return this.getPaddedRobots(this.paperRobots);
    },
    // Category detail页面的显示数据
    displayCategoryDetailRobots() {
      return this.getCategoryDetailPaddedRobots(this.categoryDetailRobots);
    },
    // 动态计算category detail网格样式
    categoryDetailGridStyle() {
      const categoryRobotsPerRow = Math.max(4, Math.min(6, this.robotsPerRow));
      return {
        gridTemplateColumns: `repeat(${categoryRobotsPerRow}, 1fr)`,
        width: '100%',
        margin: '0 0 20px 0',
      };
    },
    // 动态计算主页面网格样式
    mainGridStyle() {
      return {
        gridTemplateColumns: `repeat(${this.robotsPerRow}, 1fr)`,
        gap: '20px',
        justifyItems: 'stretch',
      };
    },
    // 计算category detail每行机器人数量
    categoryDetailRobotsPerRow() {
      return Math.max(4, Math.min(6, this.robotsPerRow));
    },
    // 计算category detail行数（根据机器人数量动态决定）
    dynamicCategoryDetailRows() {
      const perRow = this.categoryDetailRobotsPerRow;
      let rows;
      if (perRow === 4) {
        rows = 2; // 2*4 = 8
      } else if (perRow === 5) {
        rows = 2; // 2*5 = 10
      } else if (perRow === 6) {
        rows = 3; // 3*6 = 18
      } else {
        rows = 2; // 默认2行
      }
      console.log(
        `布局计算: ${perRow}列 × ${rows}行 = ${perRow * rows}个机器人`
      );
      return rows;
    },
    // 计算每页应该显示的机器人数量
    dynamicCategoryDetailPageSize() {
      const size =
        this.dynamicCategoryDetailRows * this.categoryDetailRobotsPerRow;
      console.log(
        `计算页面大小: ${this.dynamicCategoryDetailRows} × ${this.categoryDetailRobotsPerRow} = ${size}`
      );
      return size;
    },
  },
  watch: {
    // 监听搜索框内容变化
    searchKeyword(newVal) {
      if (!newVal || newVal.trim() === '') {
        this.handleSearchClear();
      }
    },
    // 监听robotsPerRow变化，重置分页
    robotsPerRow(newVal, oldVal) {
      if (newVal !== oldVal && this.categoryDialogVisible) {
        console.log(`机器人每行数量变化: ${oldVal} -> ${newVal}, 重置分页`);
        this.currentFirstIndex = 0;
        this.hasNextPage = true;
        // 重新加载分类数据
        this.loadCategoryPageData();
      }
    },
  },
  created() {
    // 初始化搜索类型
    this.searchType = this.currentSearchMode === 'name' ? 1 : 2;

    // 先获取用户订阅信息，但延迟加载数据到mounted阶段
    this.getUserSubscriptions();
  },
  mounted() {
    // 设置定时器，每5分钟检查一次订阅状态
    this.subscriptionCheckInterval = setInterval(
      () => {
        if (this.userId) {
          this.getUserSubscriptions();
        }
      },
      5 * 60 * 1000
    ); // 5分钟

    // 初始化响应式布局并加载数据
    this.initializeResponsiveLayoutAndLoadData();
  },
  beforeDestroy() {
    // 组件销毁前清理定时器
    if (this.subscriptionCheckInterval) {
      clearInterval(this.subscriptionCheckInterval);
    }
    // 清理ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    // 清理防抖定时器
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
  },
  methods: {
    ...mapActions('agent', ['fetchAgentDetail', 'fetchUserSubscriptions']),
    // 加载初始数据（首页展示的前4个机器人）
    async loadInitialData() {
      this.loading = true;
      try {
        // 并行加载推荐机器人和其他类型的机器人
        const promises = [
          this.loadRobotsByType(1, 0), // 角色扮演机器人 type=1
          this.loadRobotsByType(2, 0), // 代码编程机器人 type=2
          this.loadRobotsByType(3, 0), // 文本生成机器人 type=3
        ];

        // 如果用户已登录，加载推荐机器人
        if (this.isLoggedIn && this.userId) {
          promises.unshift(this.loadRecommendedRobots());
          const [recommendedData, rolePlayData, codingData, paperData] =
            await Promise.all(promises);
          this.recommendedRobots = recommendedData.slice(0, this.robotsPerRow);
          this.rolePlayRobots = rolePlayData.slice(0, this.robotsPerRow);
          this.codingRobots = codingData.slice(0, this.robotsPerRow);
          this.paperRobots = paperData.slice(0, this.robotsPerRow);
        } else {
          const [rolePlayData, codingData, paperData] =
            await Promise.all(promises);
          this.recommendedRobots = [];
          this.rolePlayRobots = rolePlayData.slice(0, this.robotsPerRow);
          this.codingRobots = codingData.slice(0, this.robotsPerRow);
          this.paperRobots = paperData.slice(0, this.robotsPerRow);
        }

        console.log('初始数据加载成功');
      } catch (error) {
        console.error('加载初始数据失败:', error);
        this.$message.error('加载机器人数据失败');
      } finally {
        this.loading = false;
      }
    },

    // 根据类型和起始索引加载机器人数据
    async loadRobotsByType(type, firstIndex) {
      try {
        const agentload = {
          type: type,
          firstIndex: firstIndex,
        };
        const response = await apiGetRobotsByType(agentload);
        console.log(response);

        if (response.status === 200 && response.data) {
          const robots = response.data.data;
          console.log(response);
          return robots;
        } else {
          console.error('加载机器人数据失败:', response);
          this.$message.error('加载机器人数据失败，请稍后重试');
        }
        return [];
      } catch (error) {
        console.error(
          `加载机器人数据失败 (type: ${type}, firstIndex: ${firstIndex}):`,
          error
        );
        throw error;
      }
    },

    // 专门用于category detail的加载方法，限制数量
    async loadCategoryDetailRobots(type, firstIndex) {
      try {
        const agentload = {
          type: type,
          firstIndex: firstIndex,
        };
        const response = await apiGetRobotsByType(agentload);

        if (response.status === 200 && response.data) {
          const allRobots = response.data.data;
          const requestedCount = this.dynamicCategoryDetailPageSize;

          // 只返回请求数量的机器人
          const limitedRobots = allRobots.slice(0, requestedCount);

          console.log(
            `请求数量: ${requestedCount}, 后端返回: ${allRobots.length}, 实际使用: ${limitedRobots.length}`
          );
          return limitedRobots;
        } else {
          console.error('加载机器人数据失败:', response);
          this.$message.error('加载机器人数据失败，请稍后重试');
        }
        return [];
      } catch (error) {
        console.error(
          `加载分类详情机器人数据失败 (type: ${type}, firstIndex: ${firstIndex}):`,
          error
        );
        throw error;
      }
    },

    // 加载推荐机器人
    async loadRecommendedRobots() {
      try {
        const response = await apiGetRecommendedRobots({ userId: this.userId });

        if (response.status === 200 && response.data) {
          const robots = response.data.agents;
          return robots;
        } else {
          console.error('加载推荐机器人失败:', response);
          return [];
        }
      } catch (error) {
        console.error('加载推荐机器人失败:', error);
        return [];
      }
    },

    // 换一批推荐机器人
    async refreshRecommendedRobots() {
      if (!this.isLoggedIn || !this.userId) return;

      try {
        const newRecommendedRobots = await this.loadRecommendedRobots();
        this.recommendedRobots = newRecommendedRobots.slice(
          0,
          this.robotsPerRow
        );
        console.log('推荐机器人已刷新');
      } catch (error) {
        console.error('刷新推荐机器人失败:', error);
        this.$message.error('刷新推荐失败，请稍后重试');
      }
    },

    async getUserSubscriptions() {
      if (!this.userId) return;
      try {
        await this.fetchUserSubscriptions(this.userId);
        console.log('获取用户订阅信息成功');
      } catch (error) {
        console.error('获取用户订阅信息失败:', error);
      }
    },
    setSearchMode(mode) {
      this.currentSearchMode = mode;
      // 更新搜索类型
      this.searchType = mode === 'name' ? 1 : 2;
    },
    // 处理搜索按钮点击
    async handleSearchClick() {
      if (!this.searchKeyword.trim()) {
        this.$message.warning('请输入搜索关键词');
        return;
      }

      this.searchInfo = this.searchKeyword.trim();
      this.searchIndex = 0;
      this.hasNextSearchPage = true;

      await this.performSearch();
    },

    // 处理搜索框清空
    handleSearchClear() {
      this.showSearchResults = false;
      this.searchResults = [];
      this.searchInfo = '';
      this.searchIndex = 0;
      this.hasNextSearchPage = true;
    },

    // 执行搜索
    async performSearch() {
      this.searchLoading = true;
      try {
        const searchload = {
          searchType: this.searchType,
          searchInfo: this.searchInfo,
          searchIndex: this.searchIndex,
        };

        console.log('搜索请求:', searchload);
        const response = await apiSearchAgent(searchload);

        if (response.status === 200 && response.data) {
          const robots = Array.isArray(response.data)
            ? response.data
            : response.data.data || [];

          this.searchResults = robots;

          // 判断是否有下一页（如果返回的数据少于16个，说明没有下一页）
          this.hasNextSearchPage = robots.length === 16;

          this.showSearchResults = true;
          console.log('搜索成功，获得结果:', robots.length);
        } else {
          throw new Error('搜索响应格式错误');
        }
      } catch (error) {
        console.error('搜索失败:', error);
        this.$message.error('搜索失败，请稍后重试');
      } finally {
        this.searchLoading = false;
      }
    },

    // 搜索结果上一页
    async goToPreviousSearchPage() {
      if (this.isFirstSearchPage || this.searchLoading) return;

      this.searchIndex -= 16;
      await this.performSearch();
    },

    // 搜索结果下一页
    async goToNextSearchPage() {
      if (!this.hasNextSearchPage || this.searchLoading) return;

      this.searchIndex += 16;
      await this.performSearch();
    },
    async showCategoryDetail(categoryType) {
      // 映射分类到类型和标题
      const categoryConfig = {
        recommended: { type: 1, title: '推荐机器人' },
        roleplay: { type: 1, title: '角色扮演机器人' },
        coding: { type: 2, title: '代码编程机器人' },
        paper: { type: 3, title: '文本生成机器人' },
      };

      const config = categoryConfig[categoryType];
      if (!config) {
        console.error('未知的分类类型:', categoryType);
        return;
      }

      this.currentCategoryType = config.type;
      this.categoryDialogTitle = config.title;
      this.currentFirstIndex = 0;
      this.hasNextPage = true;

      // 加载第一页数据
      await this.loadCategoryPageData();
      this.categoryDialogVisible = true;
    },

    // 加载分类页面数据
    async loadCategoryPageData() {
      this.paginationLoading = true;
      try {
        const robots = await this.loadCategoryDetailRobots(
          this.currentCategoryType,
          this.currentFirstIndex
        );
        this.categoryDetailRobots = robots;

        // 使用动态计算的页面大小判断是否有下一页
        const expectedPageSize = this.dynamicCategoryDetailPageSize;
        this.hasNextPage = robots.length === expectedPageSize;

        console.log(
          `加载分类数据成功 (type: ${this.currentCategoryType}, firstIndex: ${this.currentFirstIndex}, 预期数量: ${expectedPageSize}, 实际数量: ${robots.length})`
        );
      } catch (error) {
        console.error('加载分类数据失败:', error);
        this.$message.error('加载数据失败，请稍后重试');
      } finally {
        this.paginationLoading = false;
      }
    },

    // 上一页
    async goToPreviousPage() {
      if (this.isFirstPage || this.paginationLoading) return;

      const pageSize = this.dynamicCategoryDetailPageSize;
      this.currentFirstIndex -= pageSize;
      await this.loadCategoryPageData();
    },

    // 下一页
    async goToNextPage() {
      if (!this.hasNextPage || this.paginationLoading) return;

      const pageSize = this.dynamicCategoryDetailPageSize;
      this.currentFirstIndex += pageSize;
      await this.loadCategoryPageData();
    },
    showRobotDetail(robotId) {
      this.currentRobotId = robotId;
      this.robotDetailVisible = true;
    },
    async handleRobotDetailClose() {
      // 关闭机器人详情弹窗时，更新页面数据
      this.robotDetailVisible = false;

      try {
        // 1. 更新用户订阅数据（可能在详情页面中进行了订阅操作）
        if (this.userId) {
          await this.$store.dispatch(
            'agent/fetchUserSubscriptions',
            this.userId
          );
        }

        // 2. 重新加载初始数据（包含最新的订阅数量）
        await this.loadInitialData();

        // 3. 如果分类详情弹窗是打开的，也更新分类数据
        if (this.categoryDialogVisible && this.currentCategoryType) {
          await this.loadCategoryPageData();
        }

        // 4. 如果当前显示搜索结果，也更新搜索结果
        if (this.showSearchResults && this.searchInfo) {
          await this.performSearch();
        }

        // 4. 强制更新页面，确保所有状态正确显示
        this.$forceUpdate();

        console.log('机器人详情弹窗关闭，页面数据已更新');
      } catch (error) {
        console.error('更新页面数据失败:', error);
      }
    },
    subscribeRobot(robotId) {
      //if (!this.isLoggedIn) {
      //  this.$message.warning('请先登录');
      //  return;
      //}
      // 如果已订阅，则进入对话页面
      if (this.isSubscribed(robotId)) {
        this.enterChatWithRobot(robotId);
        return;
      }

      // 查找机器人（包括搜索结果）
      let robot = this.allRobots.find((r) => r.id === robotId);
      if (!robot && this.categoryDialogVisible) {
        robot = this.categoryDetailRobots.find((r) => r.id === robotId);
      }
      if (!robot && this.showSearchResults) {
        robot = this.searchResults.find((r) => r.id === robotId);
      }

      if (robot) {
        this.currentRobotForSubscription = robot;
        this.subscriptionDialogVisible = true;
      }
    },

    // 新增方法：进入与机器人的对话
    async enterChatWithRobot(robotId) {
      const userId = this.$store.state.user?.userId;
      if (!userId) {
        this.$message.error('未获取到用户信息，请重新登录');
        return;
      }

      // 查找机器人信息
      let robot = this.allRobots.find((r) => r.id === robotId);
      if (!robot && this.categoryDialogVisible) {
        robot = this.categoryDetailRobots.find((r) => r.id === robotId);
      }
      if (!robot && this.showSearchResults) {
        robot = this.searchResults.find((r) => r.id === robotId);
      }

      if (!robot) {
        this.$message.error('未找到机器人信息');
        return;
      }

      const payload = {
        name: robot.name || `chat_${Date.now()}`,
        agentId: robot.id,
        userId: userId,
      };
      console.log('进入会话参数:', payload);

      try {
        // 调用接口，创建会话，返回真实 chatId
        const res = await apicreateChat(payload);
        const chatId = res.data.chat_id;
        console.log('创建的聊天ID:', chatId);

        const result = await apifetchAllChats({ userId: userId });
        this.$store.commit('chat/SET_CHATS', result.data || []);
        console.log('输入的参数:', userId);
        console.log('列表返回结果:', result);

        // 直接跳到真实的 chatId 页面
        this.$router.push({
          name: 'ChatRobot',
          params: { chatId: chatId },
        });
      } catch (err) {
        this.$message.error('创建会话失败');
        console.error(err);
      }
    },

    // 订阅机器人
    async handleSubscriptionConfirm(duration, points) {
      if (!this.currentRobotForSubscription) return;

      try {
        const currentTime = this.formatDateTime(new Date());
        const payload = {
          userId: this.$store.state.user.userId,
          agentId: this.currentRobotForSubscription.id,
          startTime: currentTime,
          duration: duration,
          subscriptionType: 1,
        };

        console.log('请求 payload:', payload);
        console.log('订阅时长:', duration);
        console.log('所需积分:', points);
        const response = await apiSubscribeAgent(payload);
        console.log('订阅信息:', payload);
        if (response.status === 200) {
          this.$message.success('订阅成功！');

          // 1. 更新用户订阅数据
          await this.$store.dispatch(
            'agent/fetchUserSubscriptions',
            this.$store.state.user.userId
          );

          // 2. 重新加载初始数据（包含最新的订阅数量）
          await this.loadInitialData();

          // 3. 如果分类详情弹窗是打开的，也更新分类数据
          if (this.categoryDialogVisible && this.currentCategoryType) {
            await this.loadCategoryPageData();
          }

          // 4. 如果当前显示搜索结果，也更新搜索结果
          if (this.showSearchResults && this.searchInfo) {
            await this.performSearch();
          }

          console.log(
            '订阅成功后的用户订阅列表:',
            this.$store.state.agent.haveSubscribed
          );
          console.log('当前机器人ID:', this.currentRobotForSubscription.id);
          console.log(
            '检查是否已订阅:',
            this.isSubscribed(this.currentRobotForSubscription.id)
          );

          // 3. 强制更新页面，确保所有状态正确显示
          this.$forceUpdate();

          // 4. 最后关闭弹窗
          this.closeSubscriptionDialog();
          console.log('订阅成功!!!:', response);
        }
      } catch (error) {
        console.error('订阅失败:', error);
        if (error.code === 400) {
          this.$message.error(error.message);
        } else if (error.code === 401) {
          this.$message.error('请先登录');
        } else {
          this.$message.error('订阅失败，请稍后重试');
        }
      }
    },
    closeSubscriptionDialog() {
      this.subscriptionDialogVisible = false;
      this.currentRobotForSubscription = null;
    },
    formatDateTime(date) {
      // 使用ISO 8601格式，与后端API保持一致
      return date.toISOString();
    },
    isSubscribed(robotId) {
      // 直接检查后端返回的订阅状态，不在前端进行过期检查
      return this.haveSubscribed.some(
        (sub) => sub.agent_id === robotId && sub.status
      );
    },
    getRobotsByType(type) {
      // 这个方法现在主要用于搜索，返回相应类型的机器人
      switch (type) {
        case 'recommended':
          return this.recommendedRobots;
        case 'roleplay':
          return this.rolePlayRobots;
        case 'coding':
          return this.codingRobots;
        case 'paper':
          return this.paperRobots;
        default:
          return [];
      }
    },
    getRobotImage(robotImageUrl) {
      // 优先使用后端返回的图片URL
      if (robotImageUrl && robotImageUrl.trim()) {
        return robotImageUrl;
      }
      // 如果没有图片URL，返回默认图片
      return require('@/assets/images/Agents/baseAgent.png');
    },
    truncate(text, length = 50) {
      if (!text) return '';
      return text.length > length ? text.slice(0, length) + '...' : text;
    },
    formatprice(points) {
      // 当points为0时，返回"免费"
      if (points === 0) {
        return '免费';
      }
      return `${points} 积分`;
    },

    // 初始化响应式布局并加载数据（确保正确的初始化顺序）
    initializeResponsiveLayoutAndLoadData() {
      this.$nextTick(() => {
        const container = this.$el.querySelector('.robots-grid');
        if (container) {
          // 先计算响应式布局
          this.calculateRobotsPerRow();
          this.setupResizeObserver(container);

          // 然后加载数据
          this.loadInitialData();
        } else {
          // 如果容器还没有渲染，延迟执行
          setTimeout(() => {
            this.initializeResponsiveLayoutAndLoadData();
          }, 100);
        }
      });
    },

    // 响应式布局方法
    initializeResponsiveLayout() {
      this.$nextTick(() => {
        const container = this.$el.querySelector('.robots-grid');
        if (container) {
          this.calculateRobotsPerRow();
          this.setupResizeObserver(container);
        }
      });
    },

    calculateRobotsPerRow() {
      const container = this.$el.querySelector('.robots-grid');
      if (!container) return;

      const containerWidth = container.clientWidth;
      const minCardWidth = 250; // 与CSS中的minmax(250px, 1fr)保持一致
      const gap = 20; // 与CSS中的gap保持一致

      // 计算每行可以容纳的卡片数量
      const robotsPerRow = Math.floor(
        (containerWidth + gap) / (minCardWidth + gap)
      );

      // 最少显示4个，最多显示6个
      const newRobotsPerRow = Math.max(4, Math.min(6, robotsPerRow));

      // 只有当数量发生变化时才更新
      if (this.robotsPerRow !== newRobotsPerRow) {
        this.robotsPerRow = newRobotsPerRow;

        // 使用 nextTick 确保 DOM 更新完成后再重新加载数据
        this.$nextTick(() => {
          this.updateRobotDisplayCount();
        });
      }
    },

    setupResizeObserver(container) {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }

      // 清理之前的防抖定时器
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = null;
      }

      // 使用防抖和 requestAnimationFrame 避免无限循环
      this.resizeObserver = new ResizeObserver(() => {
        if (this.resizeTimeout) {
          clearTimeout(this.resizeTimeout);
        }
        this.resizeTimeout = setTimeout(() => {
          requestAnimationFrame(() => {
            this.calculateRobotsPerRow();
          });
        }, 100); // 100ms 防抖延迟
      });

      this.resizeObserver.observe(container);
    },

    async updateRobotDisplayCount() {
      // 重新加载数据以匹配新的每行数量
      try {
        const promises = [
          this.loadRobotsByType(1, 0), // 角色扮演机器人 type=1
          this.loadRobotsByType(2, 0), // 代码编程机器人 type=2
          this.loadRobotsByType(3, 0), // 文本生成机器人 type=3
        ];

        const [rolePlayData, codingData, paperData] =
          await Promise.all(promises);

        this.rolePlayRobots = rolePlayData.slice(0, this.robotsPerRow);
        this.codingRobots = codingData.slice(0, this.robotsPerRow);
        this.paperRobots = paperData.slice(0, this.robotsPerRow);

        // 如果用户已登录，更新推荐机器人
        if (this.isLoggedIn && this.userId) {
          const recommendedData = await this.loadRecommendedRobots();
          this.recommendedRobots = recommendedData.slice(0, this.robotsPerRow);
        }
      } catch (error) {
        console.error('更新机器人显示数量失败:', error);
      }
    },

    // 获取带空白占位的机器人列表
    getPaddedRobots(robots) {
      // 首先确保不超过当前行的显示数量
      const limitedRobots = robots.slice(0, this.robotsPerRow);
      const paddedRobots = [...limitedRobots];

      // 如果机器人数量不足一行，添加空白占位符
      while (
        paddedRobots.length < this.robotsPerRow &&
        paddedRobots.length > 0
      ) {
        paddedRobots.push({
          id: `placeholder-${paddedRobots.length}`,
          isPlaceholder: true,
        });
      }

      return paddedRobots;
    },

    // 获取category detail页面带空白占位的机器人列表
    getCategoryDetailPaddedRobots(robots) {
      const paddedRobots = [...robots];

      // 使用动态计算的总数量（行数 * 列数）
      const totalSlots = this.dynamicCategoryDetailPageSize;

      // 如果机器人数量不足总槽位数，添加空白占位符
      while (paddedRobots.length < totalSlots && paddedRobots.length > 0) {
        paddedRobots.push({
          id: `category-placeholder-${paddedRobots.length}`,
          isPlaceholder: true,
        });
      }

      return paddedRobots;
    },

    // 检查是否为空白占位符
    isPlaceholder(robot) {
      return robot && robot.isPlaceholder;
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.robot-market {
  padding: 20px;
  min-height: 100vh;

  .search-container {
    justify-content: center; /* 水平居中 */
    background: white;
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 12px;
    box-shadow: $box-shadow-light;

    .search-wrapper {
      display: flex;
      align-items: center;
      gap: 0;
      max-width: 800px;

      .search-mode-selector {
        min-width: 120px;

        .search-mode-btn {
          border-radius: 12px 0 0 12px;
          height: 40px;
          background: $accent-color;
          color: white;
          border-color: $accent-color;

          &:hover {
            background: $accent-hover-color;
            border-color: $accent-hover-color;
          }
        }
      }

      .search-input {
        flex: 1;

        :deep(.el-input__inner) {
          width: 60vw;
          border-radius: 0px;
          border-left: 10vw;
        }

        :deep(.el-input-group__append) {
          background: $accent-color;
          color: white;
          border-color: $accent-color;
          border-radius: 0 12px 12px 0;

          &:hover {
            background: $accent-hover-color;
          }
        }
      }
    }
  }

  .search-results,
  .robots-container {
    .search-results-container {
      min-height: 400px;
    }

    .section-title {
      font-size: 1.5rem;
      color: $text-color;
      margin-bottom: 20px;
      text-align: center;
    }

    .category-section {
      margin-bottom: 40px;

      .category-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;

        .category-title {
          font-size: 1.2rem;
          color: $text-color;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;

          i {
            color: $accent-color;
          }
        }

        .view-more-btn {
          background: white;
          color: $text-color;
          border: 1px solid $border-color;
          border-radius: 12px;
          padding: 8px 16px;

          &:hover {
            background: $accent-color;
            color: white;
            border-color: $accent-color;
          }
        }
      }
    }

    .robots-grid {
      display: grid;
      gap: 20px;
      justify-items: center;

      /* 让网格项比网格单元小一点 */
      & > .robot-card {
        width: calc(100% - 17px);
        min-width: 233px;
        max-width: 320px;
        border-radius: 12px;
      }
    }
  }
  .robot-card {
    cursor: pointer;
    transition: all 0.3s ease;
    height: 300px;
    border: 1px solid $border-color;

    &:hover {
      transform: translateY(-5px);
      box-shadow: $box-shadow-medium;
    }

    &.placeholder-card {
      opacity: 0;
      cursor: default;
      border: none;
      box-shadow: none;
      pointer-events: none;

      &:hover {
        transform: none;
        box-shadow: none;
      }
    }

    .robot-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;

      .robot-logo {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
      }

      .robot-name {
        font-size: 1rem;
        font-weight: 600;
        color: $text-color;
        flex: 1;
      }
    }

    .robot-description {
      color: $text-color;
      font-size: 0.9rem;
      line-height: 1.4;
      margin-bottom: 15px;
      min-height: 120px;
      max-height: 120px;
    }

    .robot-rating-price {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      font-size: 0.9rem;

      .robot-subscription {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #409eff;
      }

      .robot-price {
        color: $text-color;
        font-weight: 500;
      }
    }

    .robot-actions {
      display: flex;
      gap: 8px;

      .el-button {
        flex: 1;

        &.subscribed {
          background: #17a2b8;
          border-color: #17a2b8;
          color: white;

          &:hover {
            background: #138496;
            border-color: #117a8b;
          }
        }
      }
    }
  }

  .category-detail-container {
    height: 75vh;
    display: flex;
    flex-direction: column;
  }

  .category-detail-grid {
    top: 0vh;
    display: grid;
    gap: 10px;
    max-height: calc(75vh - 80px);
    overflow-y: auto;
    margin-bottom: 15px;
    justify-content: start;
    justify-items: center;
    flex: 1;

    /* 让网格项比网格单元小一点 */
    & > .robot-card {
      width: calc(100% - 17px);
      min-width: 183px;
      max-width: 280px;
    }
  }

  /* Category detail 占位符卡片样式 */
  .category-detail-grid .placeholder-card {
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
    cursor: default !important;
    pointer-events: none;
  }

  .category-detail-grid .placeholder-card:hover {
    transform: none !important;
    box-shadow: none !important;
  }

  .pagination-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    padding: 15px 0;
    border-top: 1px solid $border-color;
    background: white;
    flex-shrink: 0;
    margin-top: auto;

    .pagination-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 8px 16px;
      border: 1px solid $border-color;
      border-radius: 12px;
      background: white;
      color: $text-color;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover:not(.disabled) {
        background: white;
        color: $text-color;
        border-color: $accent-color;
      }

      &.disabled {
        background: #f5f5f5;
        color: #c0c4cc;
        cursor: not-allowed;
        border-color: #e4e7ed;

        &:hover {
          background: #f5f5f5;
          color: #c0c4cc;
          border-color: #e4e7ed;
        }
      }
    }

    .page-info {
      font-size: 14px;
      color: $text-color;
      font-weight: 500;
    }
  }
}

@media (max-width: 768px) {
  .robot-market {
    padding: 10px;

    .search-container {
      padding: 15px;

      .search-wrapper {
        flex-direction: column;
        gap: 10px;

        .search-mode-selector {
          width: 100%;

          .search-mode-btn {
            border-radius: 12px;
          }
        }

        .search-input {
          width: 100%;

          :deep(.el-input__inner) {
            border-radius: 12px;
            border: 1px solid $border-color;
          }

          :deep(.el-input-group__append) {
            border-radius: 12px;
          }
        }
      }
    }

    .robots-grid {
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;

      & > .robot-card {
        width: 200px;
      }
    }
  }
}

@media (min-width: 769px) and (max-width: 1200px) {
  .robot-market {
    .robots-grid {
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));

      & > .robot-card {
        width: 230px;
      }
    }
  }
}

@media (min-width: 1201px) {
  .robot-market {
    .robots-grid {
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));

      & > .robot-card {
        width: 250px;
      }
    }
  }
}

/* 订阅对话框机器人名称样式 */
.subscription-robot-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 20px;
  text-align: center;
  color: #333;
}
</style>
