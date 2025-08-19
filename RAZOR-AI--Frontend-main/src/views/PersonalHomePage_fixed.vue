<template>
  <div class="personal-page">
    <!-- 用户头像和基本信息卡片 -->
    <el-card class="profile-card" v-loading="loading">
      <div class="profile-header">
        <div class="avatar-section">
          <img
            :src="avatar"
            alt="用户头像"
            class="user-avatar"
            @error="avatar = 'https://via.placeholder.com/150'"
          />
          <el-button size="mini" type="text" class="change-avatar-btn">
            更换头像
          </el-button>
        </div>

        <div class="user-info">
          <h2 class="username">{{ userInfo.user_name || '未知用户' }}</h2>
          <div class="user-details">
            <div class="info-item">
              <span class="label">邮箱:</span>
              <span class="value">{{ userInfo.email || '未设置' }}</span>
            </div>
            <div class="info-item">
              <span class="label">手机:</span>
              <span class="value">{{ userInfo.phone || '未设置' }}</span>
            </div>
            <div class="info-item">
              <span class="label">性别:</span>
              <span class="value">{{ getGenderText(userInfo.gender) }}</span>
            </div>
            <div class="info-item">
              <span class="label">年龄:</span>
              <span class="value">{{ userInfo.age || '未设置' }}</span>
            </div>
            <div class="info-item">
              <span class="label">注册时间:</span>
              <span class="value">{{ formatDate(userInfo.created_at) }}</span>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <el-button type="primary" size="small" @click="openEditDialog">
            编辑资料
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 积分信息卡片 -->
    <el-card class="points-card">
      <div slot="header" class="clearfix">
        <span class="card-title">我的积分</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="viewPointsHistory"
        >
          查看记录
        </el-button>
      </div>
      <div class="points-info">
        <div class="points-details">
          <div class="points-item">
            <span class="points-label">当前积分:</span>
            <span class="points-value">{{ userInfo.points || 0 }}</span>
          </div>
          <div class="points-item">
            <span class="points-label">会员等级:</span>
            <span class="points-level">
              {{ getPointsLevel(userInfo.points || 0) }}
            </span>
          </div>
          <div
            class="points-item"
            v-if="getPointsToNextLevel(userInfo.points || 0) > 0"
          >
            <span class="points-label">升级还需:</span>
            <span class="points-next">
              {{ getPointsToNextLevel(userInfo.points || 0) }} 积分
            </span>
          </div>
        </div>

        <!-- 积分进度条 -->
        <div class="progress-section">
          <el-progress
            :percentage="getPointsProgress(userInfo.points || 0)"
            :color="getProgressColor(userInfo.points || 0)"
            :stroke-width="10"
            class="points-progress"
          ></el-progress>
        </div>

        <!-- 积分操作按钮 -->
        <div class="points-actions">
          <el-button size="small" type="success" @click="earnPointsDialog">
            赚取积分
          </el-button>
          <el-button size="small" type="info" @click="viewPointsStats">
            积分统计
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 兴趣模块 -->
    <el-card class="interest-card">
      <div slot="header" class="clearfix">
        <span class="card-title">兴趣模块</span>
      </div>
      <div class="interest-content">
        <el-tag
          v-for="module in interestModules"
          :key="module"
          type="info"
          class="interest-tag"
        >
          {{ module }}
        </el-tag>
      </div>
    </el-card>

    <!-- 编辑资料对话框 -->
    <el-dialog
      title="编辑个人信息"
      :visible.sync="editDialogVisible"
      width="500px"
      @close="resetEditForm"
    >
      <el-form
        ref="editForm"
        :model="editForm"
        :rules="editRules"
        label-width="80px"
        v-loading="saveLoading"
      >
        <el-form-item label="用户名" prop="UserName">
          <el-input v-model="editForm.UserName" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item label="邮箱" prop="Email">
          <el-input
            type="email"
            v-model="editForm.Email"
            placeholder="请输入邮箱地址"
          />
        </el-form-item>

        <el-form-item label="手机" prop="Phone">
          <el-input
            v-model="editForm.Phone"
            placeholder="请输入手机号"
            maxlength="11"
          />
        </el-form-item>

        <el-form-item label="性别" prop="Gender">
          <el-select v-model="editForm.Gender" placeholder="请选择性别">
            <el-option label="男" :value="1"></el-option>
            <el-option label="女" :value="2"></el-option>
            <el-option label="其他" :value="0"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="年龄" prop="Age">
          <el-input-number
            v-model="editForm.Age"
            :min="1"
            :max="120"
            placeholder="请输入年龄"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUserInfo" :loading="saveLoading">
          保存
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { MessageBox } from 'element-ui';
import { mapActions, mapState } from 'vuex';
import {
  getUserInfo,
  updateUserInfo,
  getUserPoints,
  getPointsHistory,
  getPointsStats,
  checkPointsEnough,
  addUserPoints,
} from '@/utils/api';

export default {
  name: 'UserProfile',
  data() {
    return {
      avatar: 'https://via.placeholder.com/150',
      loading: true,
      userInfo: {
        user_id: null,
        user_name: '',
        email: '',
        phone: '',
        gender: null,
        age: null,
        points: 0,
        created_at: null,
        updated_at: null,
      },
      interestModules: ['编程', '旅游', '健身'],
      friends: ['何雯宏', '许昕格', '王加添'],
      favoriteRobots: ['R2-D2', 'C-3PO', 'Optimus Prime'],
      favoriteTools: ['VS Code', 'Sublime Text', 'WebStorm'],

      // 编辑对话框相关
      editDialogVisible: false,
      saveLoading: false,
      editForm: {
        UserName: '',
        Email: '',
        Phone: '',
        Gender: null,
        Age: null,
      },
      editRules: {
        UserName: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 20,
            message: '用户名长度应为3-20个字符',
            trigger: 'blur',
          },
        ],
        Email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          {
            type: 'email',
            message: '请输入有效的邮箱地址',
            trigger: 'blur',
          },
        ],
        Phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          {
            pattern: /^1[3-9]\d{9}$/,
            message: '请输入有效的手机号',
            trigger: 'blur',
          },
        ],
      },
    };
  },

  computed: {
    ...mapState('user', ['userId', 'userName']),
  },

  async created() {
    await this.loadUserInfo();
  },

  methods: {
    ...mapActions('user', ['logout']),

    async loadUserInfo() {
      try {
        this.loading = true;
        console.log('当前用户状态:', {
          userId: this.userId,
          userName: this.userName,
          isLoggedIn: this.$store.state.user.isLoggedIn,
        });

        if (this.userId) {
          // 加载用户基本信息
          const response = await getUserInfo(this.userId);
          this.userInfo = response.data;
          console.log('用户信息加载成功:', this.userInfo);

          // 单独加载积分信息（根据后端文档，积分需要单独获取）
          try {
            const pointsResponse = await getUserPoints();
            this.userInfo.points = this.validateAndFormatPoints(
              pointsResponse.data.points
            );
            console.log('积分信息加载成功:', this.userInfo.points);
          } catch (pointsError) {
            console.warn('积分信息加载失败，使用默认值0:', pointsError);
            this.userInfo.points = 0;
          }
        } else {
          console.log('userId为空，当前store状态:', this.$store.state.user);
          this.$message.error('用户ID不存在，请重新登录');
        }
      } catch (error) {
        console.error('加载用户信息失败:', error);
        this.$message.error(
          '加载用户信息失败：' + (error.message || '未知错误')
        );
      } finally {
        this.loading = false;
      }
    },

    validateAndFormatPoints(points) {
      // 验证和格式化积分数据
      if (typeof points === 'number' && points >= 0) {
        return Math.floor(points); // 确保是整数
      }
      return 0; // 默认值
    },

    getGenderText(gender) {
      const genderMap = { 1: '男', 2: '女', 0: '其他' };
      return genderMap[gender] || '未设置';
    },

    formatDate(dateString) {
      if (!dateString) return '未知';
      return new Date(dateString).toLocaleString('zh-CN');
    },

    // 积分相关方法
    getPointsLevel(points) {
      if (points < 100) return '青铜会员';
      if (points < 500) return '白银会员';
      if (points < 1000) return '黄金会员';
      if (points < 2000) return '铂金会员';
      if (points < 5000) return '钻石会员';
      return '至尊会员';
    },

    getPointsToNextLevel(points) {
      if (points < 100) return 100 - points;
      if (points < 500) return 500 - points;
      if (points < 1000) return 1000 - points;
      if (points < 2000) return 2000 - points;
      if (points < 5000) return 5000 - points;
      return 0; // 已达到最高级
    },

    getPointsProgress(points) {
      if (points < 100) return (points / 100) * 100;
      if (points < 500) return ((points - 100) / 400) * 100;
      if (points < 1000) return ((points - 500) / 500) * 100;
      if (points < 2000) return ((points - 1000) / 1000) * 100;
      if (points < 5000) return ((points - 2000) / 3000) * 100;
      return 100; // 最高级
    },

    getProgressColor(points) {
      if (points < 100) return '#cd7f32'; // 青铜色
      if (points < 500) return '#c0c0c0'; // 白银色
      if (points < 1000) return '#ffd700'; // 黄金色
      if (points < 2000) return '#e5e4e2'; // 铂金色
      if (points < 5000) return '#b9f2ff'; // 钻石色
      return '#ff6b6b'; // 至尊红色
    },

    async viewPointsHistory() {
      try {
        this.loading = true;
        const response = await getPointsHistory(1, 50); // 获取前50条记录
        const history = response.data;

        // 显示积分历史对话框
        this.showPointsHistoryDialog(history);
      } catch (error) {
        console.error('获取积分历史失败:', error);
        // 如果API不存在或失败，显示提示信息
        this.$message({
          type: 'info',
          message: '积分记录功能暂未开放，敬请期待！',
        });
      } finally {
        this.loading = false;
      }
    },

    showPointsHistoryDialog(history) {
      const historyHtml = history
        .map(
          (item) =>
            `<p><strong>${item.type}</strong>: ${item.points} 积分 (${new Date(
              item.created_at
            ).toLocaleString()})</p>`
        )
        .join('');

      this.$msgbox({
        title: '积分历史',
        dangerouslyUseHTMLString: true,
        message: historyHtml || '<p>暂无积分记录</p>',
        showCancelButton: false,
        confirmButtonText: '关闭',
      });
    },

    async viewPointsStats() {
      try {
        this.loading = true;
        const response = await getPointsStats();
        const stats = response.data;

        const statsHtml = `
          <div>
            <p><strong>总获得积分:</strong> ${stats.totalEarned || 0}</p>
            <p><strong>总消费积分:</strong> ${stats.totalSpent || 0}</p>
            <p><strong>当前余额:</strong> ${stats.currentBalance || 0}</p>
          </div>
        `;

        this.$msgbox({
          title: '积分统计',
          dangerouslyUseHTMLString: true,
          message: statsHtml,
          showCancelButton: false,
          confirmButtonText: '关闭',
        });
      } catch (error) {
        console.error('获取积分统计失败:', error);
        this.$message({
          type: 'info',
          message: '积分统计功能暂未开放，敬请期待！',
        });
      } finally {
        this.loading = false;
      }
    },

    earnPointsDialog() {
      this.$msgbox({
        title: '赚取积分',
        message: `
          <div>
            <p>💡 <strong>如何赚取积分：</strong></p>
            <ul>
              <li>🤖 创建机器人：+50积分</li>
              <li>💬 发表评论：+10积分</li>
              <li>👍 获得点赞：+5积分</li>
              <li>📝 发表文章：+30积分</li>
              <li>📅 每日签到：+10积分</li>
            </ul>
          </div>
        `,
        dangerouslyUseHTMLString: true,
        showCancelButton: false,
        confirmButtonText: '知道了',
      });
    },

    // 编辑用户信息相关方法
    openEditDialog() {
      this.editForm = {
        UserName: this.userInfo.user_name || '',
        Email: this.userInfo.email || '',
        Phone: this.userInfo.phone || '',
        Gender: this.userInfo.gender,
        Age: this.userInfo.age,
      };
      this.editDialogVisible = true;
    },

    resetEditForm() {
      if (this.$refs.editForm) {
        this.$refs.editForm.resetFields();
      }
    },

    async saveUserInfo() {
      try {
        await this.$refs.editForm.validate();
        this.saveLoading = true;

        const updateData = { ...this.editForm };
        const response = await updateUserInfo(this.userId, updateData);

        if (response.success) {
          this.$message.success('个人信息更新成功！');
          this.editDialogVisible = false;
          await this.loadUserInfo(); // 重新加载用户信息
        } else {
          throw new Error(response.message || '更新失败');
        }
      } catch (error) {
        console.error('保存用户信息失败:', error);
        this.$message.error('保存失败：' + (error.message || '请检查网络连接'));
      } finally {
        this.saveLoading = false;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.personal-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.profile-card,
.points-card,
.interest-card {
  margin-bottom: 20px;
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.1);
}

.profile-header {
  display: flex;
  align-items: flex-start;
  gap: 30px;
  flex-wrap: wrap;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.change-avatar-btn {
  color: #fff;
  font-size: 12px;
}

.user-info {
  flex: 1;
  min-width: 300px;
}

.username {
  color: #fff;
  margin-bottom: 20px;
  font-size: 2em;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.user-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(5px);
}

.label {
  font-weight: bold;
  color: #e8e8e8;
  min-width: 80px;
}

.value {
  color: #fff;
  flex: 1;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

// 积分卡片样式
.points-card {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.card-title {
  font-size: 1.2em;
  font-weight: bold;
  color: #333;
}

.points-info {
  padding: 10px 0;
}

.progress-section {
  margin: 20px 0;
  animation: borderGlow 2s ease-in-out infinite alternate;
}

@keyframes borderGlow {
  0% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

.points-details {
  margin-bottom: 15px;
}

.points-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 5px 0;
}

.points-label {
  color: #666;
  font-size: 1em;
}

.points-value {
  color: #f39c12;
  font-weight: bold;
  font-size: 1.2em;
}

.points-level {
  color: #e74c3c;
  font-weight: bold;
  background: linear-gradient(45deg, #e74c3c, #f39c12);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.points-next {
  color: #3498db;
  font-weight: bold;
}

.points-actions {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.points-actions .el-button {
  flex: 1;
}

// 兴趣模块样式
.interest-card {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.interest-content {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.interest-tag {
  margin: 0;
  border-radius: 20px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

// 响应式设计
@media (max-width: 768px) {
  .personal-page {
    padding: 10px;
  }

  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .user-details {
    grid-template-columns: 1fr;
  }

  .points-actions {
    flex-direction: column;
  }
}

// 对话框样式优化
.el-dialog {
  border-radius: 15px;
}

.dialog-footer {
  text-align: center;
}
</style>
