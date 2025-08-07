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
              <el-dropdown-item command="tag">按标签搜索</el-dropdown-item>
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
          @input="performSearch"
          clearable
        >
          <el-button
            slot="append"
            icon="el-icon-search"
            @click="performSearch"
          ></el-button>
        </el-input>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-if="showSearchResults" class="search-results">
      <h2 class="section-title">搜索结果 ({{ searchResults.length }})</h2>
      <div class="robots-grid">
        <el-card
          v-for="robot in searchResults"
          :key="robot.id"
          class="robot-card"
          @click.native="showRobotDetail(robot.id)"
        >
          <div class="robot-header">
            <img
              :src="getRobotImage(robot.type)"
              alt="robot"
              class="robot-logo"
            />
            <div class="robot-name">{{ robot.name }}</div>
          </div>
          <div class="robot-description">
            {{ truncate(robot.description, 80) }}
          </div>
          <div class="robot-rating-price">
            <div class="robot-rating">
              <i class="el-icon-star-on" style="color: #ffc107"></i>
              {{ robot.rating || 4.5 }}
            </div>
            <div class="robot-price">{{ formatPrice(robot.price) }}</div>
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
              {{ isSubscribed(robot.id) ? '已订阅' : '订阅' }}
            </el-button>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 机器人分类展示 -->
    <div v-else class="robots-container">
      <!-- 推荐机器人 -->
      <div class="category-section">
        <div class="category-header">
          <h3 class="category-title">
            <i class="el-icon-document"></i>
            推荐机器人
          </h3>
          <el-button class="view-more-btn" @click="showCategoryDetail('text')">
            查看更多
          </el-button>
        </div>
        <div class="robots-grid">
          <el-card
            v-for="robot in textRobots.slice(0, 4)"
            :key="robot.id"
            class="robot-card"
            @click.native="showRobotDetail(robot.id)"
          >
            <div class="robot-header">
              <img
                :src="getRobotImage(robot.type)"
                alt="robot"
                class="robot-logo"
              />
              <div class="robot-name">{{ robot.name }}</div>
            </div>
            <div class="robot-description">
              {{ truncate(robot.description, 80) }}
            </div>
            <div class="robot-rating-price">
              <div class="robot-rating">
                <i class="el-icon-star-on" style="color: #ffc107"></i>
                {{ robot.rating || 4.5 }}
              </div>
              <div class="robot-price">{{ formatPrice(robot.price) }}</div>
            </div>
            <div class="robot-actions">
              <el-button size="mini" @click.stop="showRobotDetail(robot.id)">
                查看详情
              </el-button>
              <el-button
                type="prefered"
                size="mini"
                :class="{ subscribed: isSubscribed(robot.id) }"
                @click.stop="subscribeRobot(robot.id)"
              >
                {{ isSubscribed(robot.id) ? '已订阅' : '订阅' }}
              </el-button>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 角色扮演机器人 -->
      <div class="category-section">
        <div class="category-header">
          <h3 class="category-title">
            <i class="el-icon-document"></i>
            角色扮演机器人
          </h3>
          <el-button class="view-more-btn" @click="showCategoryDetail('text')">
            查看更多
          </el-button>
        </div>
        <div class="robots-grid">
          <el-card
            v-for="robot in textRobots.slice(0, 4)"
            :key="robot.id"
            class="robot-card"
            @click.native="showRobotDetail(robot.id)"
          >
            <div class="robot-header">
              <img
                :src="getRobotImage(robot.type)"
                alt="robot"
                class="robot-logo"
              />
              <div class="robot-name">{{ robot.name }}</div>
            </div>
            <div class="robot-description">
              {{ truncate(robot.description, 80) }}
            </div>
            <div class="robot-rating-price">
              <div class="robot-rating">
                <i class="el-icon-star-on" style="color: #ffc107"></i>
                {{ robot.rating || 4.5 }}
              </div>
              <div class="robot-price">{{ formatPrice(robot.price) }}</div>
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
                {{ isSubscribed(robot.id) ? '已订阅' : '订阅' }}
              </el-button>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 代码编程机器人 -->
      <div class="category-section">
        <div class="category-header">
          <h3 class="category-title">
            <i class="el-icon-picture-outline"></i>
            代码编程机器人
          </h3>
          <el-button class="view-more-btn" @click="showCategoryDetail('image')">
            查看更多
          </el-button>
        </div>
        <div class="robots-grid">
          <el-card
            v-for="robot in imageRobots.slice(0, 4)"
            :key="robot.id"
            class="robot-card"
            @click.native="showRobotDetail(robot.id)"
          >
            <div class="robot-header">
              <img
                :src="getRobotImage(robot.type)"
                alt="robot"
                class="robot-logo"
              />
              <div class="robot-name">{{ robot.name }}</div>
            </div>
            <div class="robot-description">
              {{ truncate(robot.description, 80) }}
            </div>
            <div class="robot-rating-price">
              <div class="robot-rating">
                <i class="el-icon-star-on" style="color: #ffc107"></i>
                {{ robot.rating || 4.5 }}
              </div>
              <div class="robot-price">{{ formatPrice(robot.price) }}</div>
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
                {{ isSubscribed(robot.id) ? '已订阅' : '订阅' }}
              </el-button>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 论文修改机器人 -->
      <div class="category-section">
        <div class="category-header">
          <h3 class="category-title">
            <i class="el-icon-video-camera"></i>
            论文修改机器人
          </h3>
          <el-button class="view-more-btn" @click="showCategoryDetail('video')">
            查看更多
          </el-button>
        </div>
        <div class="robots-grid">
          <el-card
            v-for="robot in videoRobots.slice(0, 4)"
            :key="robot.id"
            class="robot-card"
            @click.native="showRobotDetail(robot.id)"
          >
            <div class="robot-header">
              <img
                :src="getRobotImage(robot.type)"
                alt="robot"
                class="robot-logo"
              />
              <div class="robot-name">{{ robot.name }}</div>
            </div>
            <div class="robot-description">
              {{ truncate(robot.description, 80) }}
            </div>
            <div class="robot-rating-price">
              <div class="robot-rating">
                <i class="el-icon-star-on" style="color: #ffc107"></i>
                {{ robot.rating || 4.5 }}
              </div>
              <div class="robot-price">{{ formatPrice(robot.price) }}</div>
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
                {{ isSubscribed(robot.id) ? '已订阅' : '订阅' }}
              </el-button>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 分类详情对话框 -->
    <el-dialog
      :title="categoryDialogTitle"
      :visible.sync="categoryDialogVisible"
      width="80%"
      center
    >
      <div class="category-detail-grid">
        <el-card
          v-for="robot in categoryDetailRobots"
          :key="robot.id"
          class="robot-card"
          @click.native="showRobotDetail(robot.id)"
        >
          <div class="robot-header">
            <img
              :src="getRobotImage(robot.type)"
              alt="robot"
              class="robot-logo"
            />
            <div class="robot-name">{{ robot.name }}</div>
          </div>
          <div class="robot-description">
            {{ truncate(robot.description, 80) }}
          </div>
          <div class="robot-rating-price">
            <div class="robot-rating">
              <i class="el-icon-star-on" style="color: #ffc107"></i>
              {{ robot.rating || 4.5 }}
            </div>
            <div class="robot-price">{{ formatPrice(robot.price) }}</div>
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
              {{ isSubscribed(robot.id) ? '已订阅' : '订阅' }}
            </el-button>
          </div>
        </el-card>
      </div>
    </el-dialog>

    <!-- 订阅确认对话框 -->
    <el-dialog
      title="订阅确认"
      :visible.sync="subscriptionDialogVisible"
      width="400px"
      center
    >
      <div v-if="currentRobotForSubscription" class="subscription-info">
        <div class="subscription-robot-name">
          {{ currentRobotForSubscription.name }}
        </div>
        <el-form :model="subscriptionForm" label-width="80px">
          <el-form-item label="订阅类型">
            <el-select v-model="subscriptionForm.type" @change="calculateCost">
              <el-option label="月度订阅" value="monthly"></el-option>
              <el-option label="年度订阅" value="yearly"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="订阅时长">
            <el-input-number
              v-model="subscriptionForm.duration"
              :min="1"
              :max="12"
              @change="calculateCost"
            ></el-input-number>
          </el-form-item>
        </el-form>
        <div class="subscription-cost">
          <div class="subscription-cost-label">总费用</div>
          <div class="subscription-cost-value">{{ subscriptionCost }} 积分</div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="subscriptionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSubscription">
          确认订阅
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { subscribeAgent as apiSubscribeAgent } from '../utils/api';

export default {
  name: 'RobotMarketPage',
  data() {
    return {
      searchKeyword: '',
      currentSearchMode: 'tag',
      showSearchResults: false,
      searchResults: [],
      categoryDialogVisible: false,
      categoryDialogTitle: '',
      categoryDetailRobots: [],
      subscriptionDialogVisible: false,
      currentRobotForSubscription: null,
      subscriptionForm: {
        type: 'monthly',
        duration: 1,
      },
      subscriptionCost: 0,
      loading: false,
    };
  },
  computed: {
    ...mapState('user', ['isLoggedIn', 'userName', 'userId']),
    ...mapState('agent', {
      textRobots: (state) => state.textAgents,
      imageRobots: (state) => state.imageAgents,
      videoRobots: (state) => state.videoAgents,
      haveSubscribed: (state) => state.haveSubscribed,
    }),
    currentSearchModeText() {
      const modes = {
        tag: '按标签搜索',
        name: '按名称搜索',
        description: '按描述搜索',
      };
      return modes[this.currentSearchMode];
    },
    allRobots() {
      return [...this.textRobots, ...this.imageRobots, ...this.videoRobots];
    },
  },
  created() {
    this.getAllAgentsData();
    this.getUserSubscriptions();
  },
  methods: {
    ...mapActions('agent', [
      'fetchAllAgentsData',
      'fetchAgentDetail',
      'fetchUserSubscriptions',
    ]),
    async getAllAgentsData() {
      this.loading = true;
      try {
        await this.fetchAllAgentsData();
        console.log('获取机器人数据成功');
      } catch (error) {
        console.error('获取机器人数据失败:', error);
        this.$message.error('获取机器人数据失败');
      } finally {
        this.loading = false;
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
      this.performSearch();
    },
    performSearch() {
      if (!this.searchKeyword.trim()) {
        this.showSearchResults = false;
        return;
      }

      const keyword = this.searchKeyword.toLowerCase();
      this.searchResults = this.allRobots.filter((robot) => {
        switch (this.currentSearchMode) {
          case 'name':
            return robot.name && robot.name.toLowerCase().includes(keyword);
          case 'description':
            return (
              robot.description &&
              robot.description.toLowerCase().includes(keyword)
            );
          case 'tag':
          default:
            return (
              (robot.name && robot.name.toLowerCase().includes(keyword)) ||
              (robot.description &&
                robot.description.toLowerCase().includes(keyword))
            );
        }
      });
      this.showSearchResults = true;
    },
    showCategoryDetail(categoryType) {
      const titles = {
        text: '文本对话机器人',
        image: '图片生成机器人',
        video: '音视频机器人',
      };
      this.categoryDialogTitle = titles[categoryType];
      this.categoryDetailRobots = this.getRobotsByType(categoryType);
      this.categoryDialogVisible = true;
    },
    showRobotDetail(robotId) {
      this.$router.push({ name: 'RobotDetail', params: { id: robotId } });
    },
    subscribeRobot(robotId) {
      if (!this.isLoggedIn) {
        this.$message.warning('请先登录');
        return;
      }

      if (this.isSubscribed(robotId)) {
        this.$message.info('您已订阅该机器人');
        return;
      }

      const robot = this.allRobots.find((r) => r.id === robotId);
      if (robot) {
        this.currentRobotForSubscription = robot;
        this.calculateCost();
        this.subscriptionDialogVisible = true;
      }
    },
    async confirmSubscription() {
      if (!this.currentRobotForSubscription) return;

      try {
        const payload = {
          agent_id: this.currentRobotForSubscription.id,
          user_id: this.userId,
          subscription_type: this.subscriptionForm.type,
          duration: this.subscriptionForm.duration,
        };

        const response = await apiSubscribeAgent(payload);
        if (response.status === 200) {
          this.$message.success('订阅成功！');
          this.subscriptionDialogVisible = false;
          this.getUserSubscriptions();
        } else {
          this.$message.error('订阅失败，请稍后重试');
        }
      } catch (error) {
        console.error('订阅失败:', error);
        this.$message.error('订阅失败，请稍后重试');
      }
    },
    calculateCost() {
      if (!this.currentRobotForSubscription) return;

      const basePrice = this.currentRobotForSubscription.price || 100;
      const multiplier = this.subscriptionForm.type === 'yearly' ? 10 : 1;
      this.subscriptionCost =
        basePrice * multiplier * this.subscriptionForm.duration;
    },
    isSubscribed(robotId) {
      return this.haveSubscribed.some(
        (sub) => sub.agent_id === robotId && sub.status
      );
    },
    getRobotsByType(type) {
      switch (type) {
        case 'text':
          return this.textRobots;
        case 'image':
          return this.imageRobots;
        case 'video':
          return this.videoRobots;
        default:
          return [];
      }
    },
    getRobotImage(type) {
      switch (type) {
        case 1:
          return require('@/assets/images/Agents/textAgent.png');
        case 2:
          return require('@/assets/images/Agents/imageAgent.png');
        case 3:
          return require('@/assets/images/Agents/videoAgent.png');
        default:
          return require('@/assets/images/Agents/baseAgent.png');
      }
    },
    truncate(text, length = 50) {
      if (!text) return '';
      return text.length > length ? text.slice(0, length) + '...' : text;
    },
    formatPrice(price) {
      return price ? `${price} 积分` : '免费';
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
    background: white;
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: $box-shadow-light;

    .search-wrapper {
      display: flex;
      align-items: center;
      gap: 0;
      max-width: 800px;

      .search-mode-selector {
        min-width: 120px;

        .search-mode-btn {
          border-radius: 6px 0 0 6px;
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
          border-radius: 0;
          border-left: none;
        }

        :deep(.el-input-group__append) {
          border-radius: 0 6px 6px 0;
          background: $accent-color;
          color: white;
          border-color: $accent-color;

          &:hover {
            background: $accent-hover-color;
          }
        }
      }
    }
  }

  .search-results,
  .robots-container {
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
          border-radius: 20px;
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
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
    }
  }

  .robot-card {
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid $border-color;

    &:hover {
      transform: translateY(-5px);
      box-shadow: $box-shadow-medium;
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
      color: $secondary-color;
      font-size: 0.9rem;
      line-height: 1.4;
      margin-bottom: 15px;
      min-height: 40px;
    }

    .robot-rating-price {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      font-size: 0.9rem;

      .robot-rating {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #ffc107;
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
          background: #28a745;
          border-color: #28a745;
        }
      }
    }
  }

  .category-detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 15px;
    max-height: 60vh;
    overflow-y: auto;
  }

  .subscription-info {
    .subscription-robot-name {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 20px;
      color: $text-color;
    }

    .subscription-cost {
      background: $background-color;
      padding: 15px;
      border-radius: 6px;
      margin-top: 20px;

      .subscription-cost-label {
        font-weight: 500;
        color: $secondary-color;
        margin-bottom: 5px;
      }

      .subscription-cost-value {
        font-size: 1.2rem;
        font-weight: 600;
        color: $accent-color;
      }
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
            border-radius: 6px;
          }
        }

        .search-input {
          width: 100%;

          :deep(.el-input__inner) {
            border-radius: 6px 0 0 6px;
            border: 1px solid $border-color;
          }

          :deep(.el-input-group__append) {
            border-radius: 0 6px 6px 0;
          }
        }
      }
    }

    .robots-grid {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 15px;
    }
  }
}
</style>
