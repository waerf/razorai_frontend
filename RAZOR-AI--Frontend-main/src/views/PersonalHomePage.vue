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
              <span class="label">生日:</span>
              <span class="value">{{ formatBirthday(userInfo.birthday) }}</span>
            </div>
            <div class="info-item">
              <span class="label">机构:</span>
              <span class="value">{{ userInfo.organization || '未设置' }}</span>
            </div>
            <div class="info-item">
              <span class="label">个人简介:</span>
              <span class="value profile-text">{{
                userInfo.profile || '未设置'
              }}</span>
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
        </div>

        <!-- 积分操作按钮 -->
        <div class="points-actions">
          <el-button size="small" type="primary" @click="earnPointsDialog">
            积分说明
          </el-button>
          <el-button size="small" type="info" @click="viewPointsHistory">
            积分明细
          </el-button>
          <el-button size="small" type="success" @click="openRechargeDialog">
            充值积分
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

        <el-form-item label="生日" prop="Birthday">
          <el-date-picker
            v-model="editForm.Birthday"
            type="date"
            placeholder="请选择生日"
            style="width: 100%"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>

        <el-form-item label="机构" prop="Organization">
          <el-input
            v-model="editForm.Organization"
            placeholder="请输入所属机构"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="个人简介" prop="Profile">
          <el-input
            type="textarea"
            v-model="editForm.Profile"
            placeholder="请输入个人简介"
            :rows="3"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="验证密码" prop="Password">
          <el-input
            type="password"
            v-model="editForm.Password"
            placeholder="请输入当前密码以验证身份"
            show-password
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

    <!-- 积分明细对话框 -->
    <el-dialog
      title="积分明细"
      :visible.sync="pointsHistoryDialogVisible"
      width="800px"
      @close="resetPointsHistory"
    >
      <div class="points-dialog-content" v-loading="pointsLoading">
        <!-- 当前积分显示 -->
        <div class="current-points">
          <h3>
            当前积分：<span class="points-highlight">{{
              userInfo.points || 0
            }}</span>
          </h3>
        </div>

        <!-- 积分说明 -->
        <div class="points-info-section">
          <h4>积分说明</h4>
          <ul class="points-info-list">
            <li>• 积分主要用于购买机器人功能和服务</li>
            <li>• 通过贡献内容（如开发AI机器人）可获得激励积分奖励</li>
            <li>• 每日签到和参与活动也可获取积分</li>
            <li>• 积分可用于解锁高级机器人、购买机器人服务等</li>
          </ul>
        </div>

        <!-- 标签页切换 -->
        <div class="points-tabs">
          <el-button
            :type="currentPointsTab === 'all' ? 'primary' : 'default'"
            size="small"
            @click="switchPointsTab('all')"
          >
            全部
          </el-button>
          <el-button
            :type="currentPointsTab === 'in' ? 'success' : 'default'"
            size="small"
            @click="switchPointsTab('in')"
          >
            获取
          </el-button>
          <el-button
            :type="currentPointsTab === 'out' ? 'danger' : 'default'"
            size="small"
            @click="switchPointsTab('out')"
          >
            消耗
          </el-button>
        </div>

        <!-- 积分记录表格 -->
        <div class="points-table-container">
          <el-table
            :data="paginatedPointsData"
            style="width: 100%"
            stripe
            v-if="paginatedPointsData.length > 0"
          >
            <el-table-column prop="time" label="时间" width="180">
            </el-table-column>
            <el-table-column prop="type" label="类型" width="100">
              <template slot-scope="scope">
                <el-tag
                  :type="scope.row.badge === 'in' ? 'success' : 'danger'"
                  size="small"
                >
                  {{ scope.row.type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="desc" label="描述"> </el-table-column>
            <el-table-column prop="change" label="变动" width="100">
              <template slot-scope="scope">
                <span
                  :class="scope.row.badge === 'in' ? 'text-green' : 'text-red'"
                >
                  {{ scope.row.change }}
                </span>
              </template>
            </el-table-column>
          </el-table>

          <!-- 空状态 -->
          <div v-if="paginatedPointsData.length === 0" class="empty-state">
            <i class="el-icon-document"></i>
            <p>暂无积分记录</p>
          </div>
        </div>

        <!-- 分页 -->
        <div class="points-pagination" v-if="totalPointsPages > 1">
          <el-pagination
            @current-change="changePointsPage"
            :current-page="currentPointsPage"
            :page-size="pointsPageSize"
            layout="prev, pager, next"
            :total="filteredPointsData.length"
          >
          </el-pagination>
        </div>
      </div>
    </el-dialog>

    <!-- 充值积分对话框 -->
    <el-dialog
      title="充值积分"
      :visible.sync="rechargeDialogVisible"
      width="500px"
      @close="resetRechargeForm"
    >
      <el-form
        ref="rechargeForm"
        :model="rechargeForm"
        :rules="rechargeRules"
        label-width="100px"
        v-loading="rechargeLoading"
      >
        <div class="recharge-info">
          <div class="current-balance">
            <span class="label">当前积分：</span>
            <span class="balance">{{ userInfo.points || 0 }}</span>
          </div>

          <div class="recharge-rates">
            <h4>充值说明</h4>
            <ul>
              <li>• 最低充值10积分，最高单次充值10000积分</li>
              <li>• 充值的积分立即到账，可用于购买各种服务</li>
              <li>• 充值记录可在积分明细中查看</li>
            </ul>
          </div>
        </div>

        <el-form-item label="充值数量" prop="points">
          <el-input-number
            v-model="rechargeForm.points"
            :min="10"
            :max="10000"
            :step="10"
            style="width: 100%"
            placeholder="请输入充值积分数量"
          />
        </el-form-item>

        <el-form-item label="充值说明" prop="description">
          <el-input
            v-model="rechargeForm.description"
            placeholder="可选择添加充值说明"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <div class="quick-amounts">
          <span class="quick-label">快速选择：</span>
          <el-button size="mini" @click="setQuickAmount(100)">100</el-button>
          <el-button size="mini" @click="setQuickAmount(500)">500</el-button>
          <el-button size="mini" @click="setQuickAmount(1000)">1000</el-button>
          <el-button size="mini" @click="setQuickAmount(5000)">5000</el-button>
        </div>

        <div class="recharge-preview" v-if="rechargeForm.points > 0">
          <div class="preview-item">
            <span>充值后积分：</span>
            <span class="new-balance">{{
              (userInfo.points || 0) + rechargeForm.points
            }}</span>
          </div>
        </div>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="rechargeDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="submitRecharge"
          :loading="rechargeLoading"
        >
          确认充值
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import {
  getUserInfo,
  updateUserInfo,
  getUserPoints,
  getPointsHistory,
  rechargePoints,
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
        birthday: null,
        organization: '',
        profile: '',
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
        Birthday: null,
        Organization: '',
        Profile: '',
        Password: '', // 添加密码字段
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
        Organization: [
          {
            max: 100,
            message: '机构名称不能超过100个字符',
            trigger: 'blur',
          },
        ],
        Profile: [
          {
            max: 500,
            message: '个人简介不能超过500个字符',
            trigger: 'blur',
          },
        ],
        Password: [
          { required: true, message: '请输入当前密码', trigger: 'blur' },
          {
            min: 6,
            message: '密码长度至少6位',
            trigger: 'blur',
          },
        ],
      },

      // 积分明细相关
      pointsHistoryDialogVisible: false,
      pointsLoading: false,
      currentPointsTab: 'all', // 当前选中的积分标签页
      currentPointsPage: 1, // 当前页码
      pointsPageSize: 5, // 每页显示的记录数
      pointsData: [], // 积分记录数据

      // 充值积分相关
      rechargeDialogVisible: false,
      rechargeLoading: false,
      rechargeForm: {
        points: 100,
        description: '用户充值积分',
      },
      rechargeRules: {
        points: [
          { required: true, message: '请输入充值积分数量', trigger: 'blur' },
          {
            type: 'number',
            min: 10,
            max: 10000,
            message: '充值积分需在10-10000之间',
            trigger: 'blur',
          },
        ],
      },
    };
  },

  computed: {
    ...mapState('user', ['userId', 'userName']),

    // 积分明细相关计算属性
    filteredPointsData() {
      if (this.currentPointsTab === 'all') {
        return this.pointsData;
      } else if (this.currentPointsTab === 'in') {
        return this.pointsData.filter((item) => item.badge === 'in');
      } else if (this.currentPointsTab === 'out') {
        return this.pointsData.filter((item) => item.badge === 'out');
      }
      return this.pointsData;
    },

    paginatedPointsData() {
      const start = (this.currentPointsPage - 1) * this.pointsPageSize;
      const end = start + this.pointsPageSize;
      return this.filteredPointsData.slice(start, end);
    },

    totalPointsPages() {
      return Math.ceil(this.filteredPointsData.length / this.pointsPageSize);
    },
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

    formatBirthday(dateString) {
      if (!dateString) return '未设置';
      return new Date(dateString).toLocaleDateString('zh-CN');
    },

    // 积分相关方法 - 仅用于购买机器人
    // 已删除会员等级相关方法

    earnPointsDialog() {
      this.$msgbox({
        title: '积分用途',
        message: `
          <div>
            <p>� <strong>积分可用于：</strong></p>
            <ul>
              <li>🤖 购买机器人功能</li>
              <li>🛒 机器人市场消费</li>
              <li>⭐ 解锁高级机器人</li>
            </ul>
            <br>
            <p>�💡 <strong>如何获取积分：</strong></p>
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
        Birthday: this.userInfo.birthday || null,
        Organization: this.userInfo.organization || '',
        Profile: this.userInfo.profile || '',
        Password: '', // 重置密码字段
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

        // 转换为后端期望的格式
        const updateData = {
          NewUsername: this.editForm.UserName,
          NewGender: this.editForm.Gender,
          NewAge: this.editForm.Age,
          Password: this.editForm.Password, // 需要添加密码字段
        };

        console.log('准备更新的数据:', updateData);
        console.log('用户ID:', this.userId);

        const response = await updateUserInfo(this.userId, updateData);
        console.log('API响应:', response);

        // 检查不同的响应格式
        if (response && response.data) {
          // 如果有data字段，检查data中的success
          if (response.data.success !== false) {
            this.$message.success('个人信息更新成功！');
            this.editDialogVisible = false;
            await this.loadUserInfo(); // 重新加载用户信息
            return;
          } else {
            throw new Error(
              response.data.message || response.data.error || '更新失败'
            );
          }
        } else if (
          response &&
          response.success !== false &&
          response.status !== 'error'
        ) {
          // 直接检查响应对象
          this.$message.success('个人信息更新成功！');
          this.editDialogVisible = false;
          await this.loadUserInfo();
          return;
        } else {
          throw new Error(
            response.message || response.error || '服务器返回更新失败'
          );
        }
      } catch (error) {
        console.error('保存用户信息详细错误:', error);
        console.error('错误响应:', error.response);

        let errorMessage = '请检查网络连接';

        if (error.response) {
          // 服务器返回了错误状态码
          if (error.response.data) {
            errorMessage =
              error.response.data.message ||
              error.response.data.error ||
              `服务器错误 (${error.response.status})`;
          } else {
            errorMessage = `网络错误 (${error.response.status})`;
          }
        } else if (error.message) {
          // 其他错误（包括我们手动抛出的错误）
          errorMessage = error.message;
        }

        this.$message.error('保存失败：' + errorMessage);
      } finally {
        this.saveLoading = false;
      }
    },

    // 积分明细相关方法
    viewPointsHistory() {
      this.pointsHistoryDialogVisible = true;
      this.loadPointsHistory();
    },

    async loadPointsHistory() {
      this.pointsLoading = true;
      try {
        // 调用真实的API获取积分记录
        const response = await getPointsHistory(
          this.currentPointsPage,
          this.pointsPageSize
        );

        console.log('积分记录API响应:', response);

        if (response && response.data) {
          // 处理API返回的数据
          let records = response.data.records || response.data || [];

          console.log('原始记录数据:', records);
          console.log('第一条记录结构:', records[0]);

          // 如果API返回的是数组，直接使用
          if (Array.isArray(records)) {
            // 转换数据格式以匹配模板
            this.pointsData = records.map((record) => {
              console.log('正在处理记录:', record);

              // 根据后端API返回的字段名获取值
              const pointsChange =
                record.points_change ||
                record.change_amount ||
                record.amount ||
                record.points ||
                0;
              const transactionType =
                record.transaction_type ||
                record.change_type ||
                record.type ||
                'unknown';

              // 判断是获取还是消耗积分
              const isEarn =
                pointsChange > 0 ||
                transactionType === 'earn' ||
                transactionType === 'PURCHASE';

              return {
                id:
                  record.transaction_id ||
                  record.id ||
                  record.point_id ||
                  Math.random(),
                type: isEarn ? '获取' : '消耗',
                badge: isEarn ? 'in' : 'out',
                change:
                  pointsChange > 0
                    ? `+${pointsChange}`
                    : pointsChange.toString(),
                desc:
                  record.source_description ||
                  record.description ||
                  record.reason ||
                  record.desc ||
                  '积分变动',
                time:
                  record.transaction_date ||
                  record.created_at ||
                  record.timestamp ||
                  record.time ||
                  new Date().toLocaleString(),
              };
            });

            console.log('转换后的积分数据:', this.pointsData);
          } else {
            console.warn('API返回的数据格式不是数组:', records);
            this.pointsData = this.getMockPointsData();
          }
        } else {
          console.warn('API返回数据为空，使用模拟数据');
          this.pointsData = this.getMockPointsData();
        }
      } catch (error) {
        console.error('加载积分记录失败:', error);
        console.error('错误详情:', error.response);

        // API调用失败时才使用模拟数据
        this.$message.warning('无法加载积分记录，显示示例数据');
        this.pointsData = this.getMockPointsData();
      } finally {
        this.pointsLoading = false;
      }
    },

    switchPointsTab(tabName) {
      this.currentPointsTab = tabName;
      this.currentPointsPage = 1; // 切换标签页时重置页码
      this.loadPointsHistory();
    },

    handlePointsPageChange(page) {
      this.currentPointsPage = page;
      this.loadPointsHistory();
    },

    getMockPointsData() {
      const allData = [
        {
          id: 1,
          type: '获取',
          badge: 'in',
          change: '+50',
          desc: '创建机器人奖励',
          time: '2024-01-15 10:30:00',
        },
        {
          id: 2,
          type: '消耗',
          badge: 'out',
          change: '-30',
          desc: '购买高级功能',
          time: '2024-01-14 15:45:00',
        },
        {
          id: 3,
          type: '获取',
          badge: 'in',
          change: '+10',
          desc: '每日签到奖励',
          time: '2024-01-14 09:00:00',
        },
        {
          id: 4,
          type: '获取',
          badge: 'in',
          change: '+30',
          desc: '发表文章奖励',
          time: '2024-01-13 14:20:00',
        },
        {
          id: 5,
          type: '消耗',
          badge: 'out',
          change: '-20',
          desc: '购买机器人',
          time: '2024-01-12 11:10:00',
        },
        {
          id: 6,
          type: '获取',
          badge: 'in',
          change: '+5',
          desc: '获得点赞奖励',
          time: '2024-01-11 16:30:00',
        },
      ];

      // 根据当前标签页过滤数据
      if (this.currentPointsTab === 'in') {
        return allData.filter((item) => item.badge === 'in');
      } else if (this.currentPointsTab === 'out') {
        return allData.filter((item) => item.badge === 'out');
      }
      return allData;
    },

    formatPointsAmount(amount) {
      return amount > 0 ? `+${amount}` : amount.toString();
    },

    getPointsTypeClass(type) {
      return type === 'in' ? 'points-in' : 'points-out';
    },

    // 积分对话框相关方法
    resetPointsHistory() {
      this.currentPointsPage = 1;
      this.currentPointsTab = 'all';
      this.pointsData = [];
    },

    changePointsPage(page) {
      this.currentPointsPage = page;
    },

    // 充值积分相关方法
    openRechargeDialog() {
      this.rechargeDialogVisible = true;
      this.resetRechargeForm();
    },

    resetRechargeForm() {
      if (this.$refs.rechargeForm) {
        this.$refs.rechargeForm.resetFields();
      }
      this.rechargeForm = {
        points: 100,
        description: '用户充值积分',
      };
    },

    setQuickAmount(amount) {
      this.rechargeForm.points = amount;
    },

    async submitRecharge() {
      try {
        await this.$refs.rechargeForm.validate();
        this.rechargeLoading = true;

        console.log('准备充值积分:', this.rechargeForm);

        const response = await rechargePoints(
          this.rechargeForm.points,
          this.rechargeForm.description
        );

        console.log('充值响应:', response);

        if (response && response.data) {
          this.$message.success(
            `充值成功！获得 ${this.rechargeForm.points} 积分，当前余额: ${response.data.new_balance}`
          );

          // 更新用户积分显示
          this.userInfo.points = response.data.new_balance;

          // 关闭对话框
          this.rechargeDialogVisible = false;

          // 如果积分明细对话框是打开的，刷新数据
          if (this.pointsHistoryDialogVisible) {
            this.loadPointsHistory();
          }
        } else {
          throw new Error('服务器返回数据格式错误');
        }
      } catch (error) {
        console.error('充值失败:', error);

        let errorMessage = '充值失败，请重试';
        if (error.response && error.response.data) {
          errorMessage = error.response.data.message || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.$message.error(errorMessage);
      } finally {
        this.rechargeLoading = false;
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
  background: #f5f7fa;
  min-height: 100vh;
}

.profile-card,
.points-card,
.interest-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e4e7ed;
  background: #ffffff;
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
  border: 4px solid #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.change-avatar-btn {
  color: #409eff;
  font-size: 12px;
}

.user-info {
  flex: 1;
  min-width: 300px;
}

.username {
  color: #303133;
  margin-bottom: 20px;
  font-size: 2em;
  font-weight: bold;
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
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.label {
  font-weight: bold;
  color: #606266;
  min-width: 80px;
}

.value {
  color: #303133;
  flex: 1;
}

.profile-text {
  word-wrap: break-word;
  white-space: pre-wrap;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

// 积分卡片样式
.points-card {
  background: #ffffff;
  border-left: 4px solid #409eff;
}

.card-title {
  font-size: 1.2em;
  font-weight: bold;
  color: #303133;
}

.points-info {
  padding: 10px 0;
}

.points-details {
  margin-bottom: 15px;
}

.points-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.points-label {
  color: #606266;
  font-size: 1em;
}

.points-value {
  color: #409eff;
  font-weight: bold;
  font-size: 1.2em;
}

.points-actions {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.points-actions .el-button {
  flex: 1;
  min-width: 0; // 允许按钮缩小
}

// 兴趣模块样式
.interest-card {
  background: #ffffff;
  border-left: 4px solid #67c23a;
}

.interest-content {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.interest-tag {
  margin: 0;
  border-radius: 4px;
  padding: 6px 12px;
  background: #ecf5ff;
  border: 1px solid #d9ecff;
  color: #409eff;
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
  border-radius: 8px;
}

.dialog-footer {
  text-align: center;
}

// 积分明细样式
.points-dialog {
  .el-tabs__header {
    margin-bottom: 20px;
  }

  .points-table {
    .points-in {
      color: #67c23a;
      font-weight: bold;
    }

    .points-out {
      color: #f56c6c;
      font-weight: bold;
    }
  }

  .empty-state {
    text-align: center;
    padding: 40px 0;
    color: #999;

    .el-icon-document {
      font-size: 64px;
      margin-bottom: 16px;
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    padding: 20px 0;
  }
}

// 积分明细对话框特定样式
.points-dialog-content {
  .current-points {
    text-align: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      color: #303133;
    }

    .points-highlight {
      color: #409eff;
      font-size: 1.2em;
      font-weight: bold;
    }
  }

  .points-info-section {
    margin-bottom: 20px;

    h4 {
      margin: 0 0 10px 0;
      color: #606266;
    }

    .points-info-list {
      margin: 0;
      padding-left: 20px;
      color: #909399;

      li {
        margin-bottom: 5px;
      }
    }
  }

  .points-tabs {
    margin-bottom: 20px;
    text-align: center;

    .el-button {
      margin: 0 5px;
    }
  }

  .points-table-container {
    margin-bottom: 20px;
  }

  .text-green {
    color: #67c23a;
    font-weight: bold;
  }

  .text-red {
    color: #f56c6c;
    font-weight: bold;
  }

  .points-pagination {
    text-align: center;
  }
}

// 充值对话框样式
.recharge-info {
  margin-bottom: 20px;

  .current-balance {
    padding: 15px;
    background: #f5f7fa;
    border-radius: 6px;
    margin-bottom: 15px;
    text-align: center;

    .label {
      color: #606266;
      margin-right: 10px;
    }

    .balance {
      color: #409eff;
      font-size: 24px;
      font-weight: bold;
    }
  }

  .recharge-rates {
    h4 {
      margin: 0 0 10px 0;
      color: #303133;
      font-size: 14px;
    }

    ul {
      margin: 0;
      padding-left: 20px;
      color: #909399;
      font-size: 13px;

      li {
        margin-bottom: 5px;
      }
    }
  }
}

.quick-amounts {
  margin: 15px 0;
  display: flex;
  align-items: center;
  gap: 10px;

  .quick-label {
    color: #606266;
    font-size: 14px;
    margin-right: 10px;
  }

  .el-button {
    min-width: 60px;
  }
}

.recharge-preview {
  margin-top: 20px;
  padding: 15px;
  background: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 6px;

  .preview-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #303133;

    .new-balance {
      color: #67c23a;
      font-size: 18px;
      font-weight: bold;
    }
  }
}
</style>
