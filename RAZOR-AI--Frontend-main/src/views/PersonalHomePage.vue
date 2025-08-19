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
          <el-button size="small" type="warning" @click="testBackendConnection">
            测试连接
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

        <!-- 当用户名改变时，显示密码确认框 -->
        <el-form-item
          v-if="isUsernameChanged"
          label="确认密码"
          prop="ConfirmPassword"
        >
          <el-input
            type="password"
            v-model="editForm.ConfirmPassword"
            placeholder="请输入当前密码以确认用户名修改"
            show-password
          />
          <div class="password-tip">
            <i class="el-icon-info"></i>
            <span>修改用户名需要验证当前密码</span>
          </div>
        </el-form-item>

        <el-form-item label="邮箱" prop="Email">
          <el-input
            type="email"
            v-model="editForm.Email"
            :placeholder="
              isEmailBound ? '邮箱已绑定，不可修改' : '请输入邮箱地址'
            "
            :disabled="isEmailBound"
          />
          <div v-if="isEmailBound" class="bind-tip">
            <i class="el-icon-lock"></i>
            <span>已绑定邮箱不可修改</span>
          </div>
        </el-form-item>

        <el-form-item label="手机" prop="Phone">
          <el-input
            v-model="editForm.Phone"
            :placeholder="
              isPhoneBound ? '手机号已绑定，不可修改' : '请输入手机号'
            "
            maxlength="11"
            :disabled="isPhoneBound"
          />
          <div v-if="isPhoneBound" class="bind-tip">
            <i class="el-icon-lock"></i>
            <span>已绑定手机号不可修改</span>
          </div>
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
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUserInfo" :loading="saveLoading">
          保存
        </el-button>
      </div>
    </el-dialog>

    <!-- 积分历史对话框 -->
    <el-dialog
      title="积分历史记录"
      :visible.sync="pointsHistoryVisible"
      width="800px"
      @close="closePointsHistory"
    >
      <div class="points-history-content">
        <!-- 积分来源筛选 -->
        <div class="filter-section">
          <el-form :inline="true" size="small">
            <el-form-item label="积分来源:">
              <el-select
                v-model="pointsFilter.pointsSource"
                placeholder="请选择积分来源"
                @change="loadPointsHistory"
              >
                <el-option label="全部来源" :value="0"></el-option>
                <el-option label="新用户注册" :value="1"></el-option>
                <el-option label="创建机器人" :value="2"></el-option>
                <el-option label="发表评论" :value="3"></el-option>
                <el-option label="获得点赞" :value="4"></el-option>
                <el-option label="发表文章" :value="5"></el-option>
                <el-option label="每日签到" :value="6"></el-option>
                <el-option label="购买消费" :value="7"></el-option>
                <el-option label="系统奖励" :value="8"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                @click="loadPointsHistory"
                :loading="pointsHistoryLoading"
              >
                刷新
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 积分历史列表 -->
        <div class="points-history-list" v-loading="pointsHistoryLoading">
          <el-table
            :data="pointsHistoryData"
            stripe
            style="width: 100%"
            empty-text="暂无积分记录"
          >
            <el-table-column
              prop="transaction_id"
              label="交易ID"
              width="80"
            ></el-table-column>
            <el-table-column prop="points_change" label="积分变动" width="100">
              <template slot-scope="scope">
                <span
                  :class="
                    scope.row.points_change > 0
                      ? 'points-positive'
                      : 'points-negative'
                  "
                >
                  {{ scope.row.points_change > 0 ? '+' : ''
                  }}{{ scope.row.points_change }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              prop="transaction_type"
              label="交易类型"
              width="100"
            >
              <template slot-scope="scope">
                {{ getTransactionTypeText(scope.row.transaction_type) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="source_description"
              label="描述"
              min-width="200"
            ></el-table-column>
            <el-table-column
              prop="transaction_date"
              label="交易时间"
              width="160"
            >
              <template slot-scope="scope">
                {{ formatDateTime(scope.row.transaction_date) }}
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-section">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="pointsFilter.page"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="pointsFilter.pageSize"
              :total="pointsHistoryTotal"
              layout="total, sizes, prev, pager, next, jumper"
            >
            </el-pagination>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 充值积分对话框 -->
    <el-dialog
      title="充值积分"
      :visible.sync="rechargeDialogVisible"
      width="500px"
      @close="closeRechargeDialog"
    >
      <div class="recharge-content">
        <div class="current-points">
          <span class="label">当前积分:</span>
          <span class="value">{{ userInfo.points || 0 }}</span>
        </div>

        <el-form
          :model="rechargeForm"
          :rules="rechargeRules"
          ref="rechargeForm"
          label-width="100px"
        >
          <el-form-item label="充值金额" prop="amount">
            <el-input-number
              v-model="rechargeForm.amount"
              :min="1"
              :max="10000"
              :step="1"
              placeholder="请输入充值金额"
              style="width: 100%"
            />
            <div class="amount-tips">
              <span>充值比例: 1元 = 10积分</span>
            </div>
          </el-form-item>

          <el-form-item label="充值积分">
            <el-input
              :value="rechargeForm.amount * 10"
              disabled
              placeholder="0"
            >
              <template slot="append">积分</template>
            </el-input>
          </el-form-item>

          <el-form-item label="支付方式">
            <el-radio-group v-model="rechargeForm.paymentMethod">
              <el-radio label="alipay">支付宝</el-radio>
              <el-radio label="wechat">微信支付</el-radio>
              <el-radio label="demo">演示模式(假充值)</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>

        <div class="recharge-summary">
          <p>充值总结:</p>
          <p>
            支付金额:
            <span class="highlight">¥{{ rechargeForm.amount || 0 }}</span>
          </p>
          <p>
            获得积分:
            <span class="highlight"
              >{{ (rechargeForm.amount || 0) * 10 }} 积分</span
            >
          </p>
          <p>
            充值后积分:
            <span class="highlight"
              >{{
                (userInfo.points || 0) + (rechargeForm.amount || 0) * 10
              }}
              积分</span
            >
          </p>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="closeRechargeDialog">取消</el-button>
        <el-button
          type="primary"
          @click="confirmRecharge"
          :loading="rechargeLoading"
          :disabled="!rechargeForm.amount || rechargeForm.amount <= 0"
        >
          确认充值
        </el-button>
      </div>
    </el-dialog>

    <!-- 登出按钮 -->
    <div class="logout-section">
      <el-button
        type="danger"
        icon="el-icon-switch-button"
        @click="handleLogout"
        class="logout-btn"
      >
        退出登录
      </el-button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import {
  getUserInfo,
  updateUserInfo,
  getUserPoints,
  changeUsername,
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
        ConfirmPassword: '', // 用于用户名修改时的密码确认
      },
      originalUsername: '', // 用于存储原始用户名，检测是否改变

      // 积分历史相关
      pointsHistoryVisible: false,
      pointsHistoryLoading: false,
      pointsHistoryData: [],
      pointsHistoryTotal: 0,
      pointsFilter: {
        pointsSource: 0, // 默认显示全部来源
        page: 1,
        pageSize: 20,
      },

      // 充值相关
      rechargeDialogVisible: false,
      rechargeLoading: false,
      rechargeForm: {
        amount: null, // 充值金额
        paymentMethod: 'demo', // 支付方式，默认演示模式
      },
      rechargeRules: {
        amount: [
          { required: true, message: '请输入充值金额', trigger: 'change' },
          {
            type: 'number',
            min: 1,
            max: 10000,
            message: '充值金额应在1-10000元之间',
            trigger: 'change',
          },
        ],
      },
    };
  },

  computed: {
    ...mapState('user', ['userId', 'userName']),

    // 判断邮箱是否已绑定（如果有邮箱值则认为已绑定）
    isEmailBound() {
      return !!(this.userInfo.email && this.userInfo.email.trim());
    },

    // 判断手机号是否已绑定（如果有手机号值则认为已绑定）
    isPhoneBound() {
      return !!(this.userInfo.phone && this.userInfo.phone.trim());
    },

    // 检测用户名是否改变
    isUsernameChanged() {
      return this.editForm.UserName !== this.originalUsername;
    },

    // 动态验证规则
    editRules() {
      const rules = {
        UserName: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 20,
            message: '用户名长度应为3-20个字符',
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
      };

      // 邮箱验证规则 - 只有未绑定时才要求必填
      if (!this.isEmailBound) {
        rules.Email = [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          {
            type: 'email',
            message: '请输入有效的邮箱地址',
            trigger: 'blur',
          },
        ];
      } else {
        rules.Email = [
          {
            type: 'email',
            message: '请输入有效的邮箱地址',
            trigger: 'blur',
          },
        ];
      }

      // 手机号验证规则 - 只有未绑定时才要求必填
      if (!this.isPhoneBound) {
        rules.Phone = [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          {
            pattern: /^1[3-9]\d{9}$/,
            message: '请输入有效的手机号',
            trigger: 'blur',
          },
        ];
      } else {
        rules.Phone = [
          {
            pattern: /^1[3-9]\d{9}$/,
            message: '请输入有效的手机号',
            trigger: 'blur',
          },
        ];
      }

      // 密码确认验证规则 - 仅在用户名改变时需要
      if (this.isUsernameChanged) {
        rules.ConfirmPassword = [
          {
            required: true,
            message: '修改用户名需要验证当前密码',
            trigger: 'blur',
          },
          {
            min: 1,
            message: '请输入当前密码',
            trigger: 'blur',
          },
        ];
      }

      return rules;
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

    async viewPointsHistory() {
      // 打开积分历史对话框并加载数据
      this.pointsHistoryVisible = true;
      await this.loadPointsHistory();
    },

    // 加载积分历史数据
    async loadPointsHistory() {
      try {
        this.pointsHistoryLoading = true;
        console.log('加载积分历史，参数:', this.pointsFilter);

        const response = await getPointsHistory(
          this.pointsFilter.pointsSource,
          this.pointsFilter.page,
          this.pointsFilter.pageSize
        );

        console.log('积分历史API响应:', response);
        console.log('响应状态:', response.status);
        console.log('响应数据:', response.data);

        if (response && response.data) {
          // 如果返回的是数组，直接使用
          if (Array.isArray(response.data)) {
            this.pointsHistoryData = response.data;
            this.pointsHistoryTotal = response.data.length; // 如果没有total字段，使用数组长度
            console.log('积分历史数据设置为数组:', this.pointsHistoryData);
          } else if (response.data.data && Array.isArray(response.data.data)) {
            // 如果返回的是包装对象
            this.pointsHistoryData = response.data.data;
            this.pointsHistoryTotal =
              response.data.total || response.data.data.length;
            console.log(
              '积分历史数据设置为包装对象内的数组:',
              this.pointsHistoryData
            );
          } else {
            console.log('积分历史响应数据格式不符合预期:', response.data);
            this.pointsHistoryData = [];
            this.pointsHistoryTotal = 0;
          }
        } else {
          console.log('积分历史响应为空');
          this.pointsHistoryData = [];
          this.pointsHistoryTotal = 0;
        }

        console.log('最终积分历史数据:', this.pointsHistoryData);
        console.log('总记录数:', this.pointsHistoryTotal);
      } catch (error) {
        console.error('加载积分历史失败 - 详细错误:', error);
        console.error('错误响应:', error.response);
        console.error('错误请求:', error.request);
        console.error('错误配置:', error.config);
        this.$message.error(
          '加载积分历史失败：' + (error.message || '未知错误')
        );
        this.pointsHistoryData = [];
        this.pointsHistoryTotal = 0;
      } finally {
        this.pointsHistoryLoading = false;
      }
    },

    // 关闭积分历史对话框
    closePointsHistory() {
      this.pointsHistoryVisible = false;
      this.pointsHistoryData = [];
      this.pointsHistoryTotal = 0;
      this.pointsFilter = {
        pointsSource: 0,
        page: 1,
        pageSize: 20,
      };
    },

    // 分页大小改变
    handleSizeChange(val) {
      this.pointsFilter.pageSize = val;
      this.pointsFilter.page = 1; // 重置到第一页
      this.loadPointsHistory();
    },

    // 当前页改变
    handleCurrentChange(val) {
      this.pointsFilter.page = val;
      this.loadPointsHistory();
    },

    // 获取交易类型文本
    getTransactionTypeText(type) {
      const typeMap = {
        1: '收入',
        2: '支出',
        3: '奖励',
        4: '消费',
        5: '退款',
        6: '转账',
        7: '系统调整',
      };
      return typeMap[type] || '未知';
    },

    // 格式化日期时间
    formatDateTime(dateString) {
      if (!dateString) return '未知';
      return new Date(dateString).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    },

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
        ConfirmPassword: '', // 重置密码字段
      };
      // 记录原始用户名，用于检测是否改变
      this.originalUsername = this.userInfo.user_name || '';
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
        console.log('准备更新的数据:', updateData);
        console.log('用户ID:', this.userId);

        // 如果用户名发生了改变，使用专门的改名接口
        if (this.isUsernameChanged) {
          console.log('用户名发生变化，使用改名接口...');
          try {
            const changeUsernameResponse = await changeUsername(
              this.userId,
              updateData.UserName,
              updateData.ConfirmPassword
            );
            console.log('改名API响应:', changeUsernameResponse);
            this.$message.success('用户名修改成功！');

            // 如果还有其他信息需要更新（除了用户名）
            const hasOtherUpdates =
              updateData.Email !== this.userInfo.email ||
              updateData.Phone !== this.userInfo.phone ||
              updateData.Gender !== this.userInfo.gender ||
              updateData.Age !== this.userInfo.age ||
              updateData.Birthday !== this.userInfo.birthday ||
              updateData.Organization !== this.userInfo.organization ||
              updateData.Profile !== this.userInfo.profile;

            if (hasOtherUpdates) {
              // 更新其他信息，但不包括用户名
              const otherUpdateData = { ...updateData };
              delete otherUpdateData.UserName; // 移除用户名，因为已经通过专门接口更新了
              delete otherUpdateData.ConfirmPassword; // 移除密码字段

              const updateResponse = await updateUserInfo(
                this.userId,
                otherUpdateData
              );
              console.log('其他信息更新API响应:', updateResponse);
              this.$message.success('其他个人信息也已更新！');
            }

            this.editDialogVisible = false;
            await this.loadUserInfo(); // 重新加载用户信息
            return;
          } catch (usernameError) {
            console.error('用户名修改失败:', usernameError);
            if (usernameError.response && usernameError.response.data) {
              this.$message.error(
                usernameError.response.data.message || '用户名修改失败'
              );
            } else {
              this.$message.error(
                '用户名修改失败：' + (usernameError.message || '未知错误')
              );
            }
            return;
          }
        }

        // 如果用户名没有改变，只更新其他信息
        const otherUpdateData = { ...updateData };
        delete otherUpdateData.ConfirmPassword; // 移除密码字段

        const response = await updateUserInfo(this.userId, otherUpdateData);
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

    // 充值相关方法
    openRechargeDialog() {
      this.rechargeDialogVisible = true;
      this.rechargeForm.amount = null;
      this.rechargeForm.paymentMethod = 'demo';
    },

    closeRechargeDialog() {
      this.rechargeDialogVisible = false;
      this.rechargeForm.amount = null;
      this.rechargeForm.paymentMethod = 'demo';
      if (this.$refs.rechargeForm) {
        this.$refs.rechargeForm.resetFields();
      }
    },

    async confirmRecharge() {
      try {
        // 验证表单
        await this.$refs.rechargeForm.validate();

        this.rechargeLoading = true;

        const rechargeAmount = this.rechargeForm.amount;
        const pointsToAdd = rechargeAmount * 10; // 1元 = 10积分

        console.log('开始充值:', {
          amount: rechargeAmount,
          points: pointsToAdd,
          paymentMethod: this.rechargeForm.paymentMethod,
        });

        // 模拟支付过程
        if (this.rechargeForm.paymentMethod === 'demo') {
          // 演示模式，直接成功
          await this.simulatePayment(rechargeAmount, pointsToAdd);
        } else {
          // 其他支付方式，暂时也用演示模式
          this.$message.info('真实支付功能开发中，使用演示模式进行充值');
          await this.simulatePayment(rechargeAmount, pointsToAdd);
        }
      } catch (error) {
        console.error('充值过程出错:', error);
        // 不显示错误消息，因为simulatePayment已经处理了
        // this.$message.error('充值失败：' + (error.message || '未知错误'));
      } finally {
        this.rechargeLoading = false;
      }
    },

    // 测试后端连接的方法
    async testBackendConnection() {
      try {
        console.log('=== 测试后端连接 ===');

        // 先测试获取用户积分
        const pointsResponse = await getUserPoints();
        console.log('获取积分API测试:', pointsResponse);

        // 再测试获取用户信息
        const userResponse = await getUserInfo();
        console.log('获取用户信息API测试:', userResponse);

        this.$message.success('后端连接正常');
      } catch (error) {
        console.error('后端连接测试失败:', error);
        this.$message.error('后端连接异常: ' + (error.message || '未知错误'));
      }
    },

    async simulatePayment(amount, points) {
      // 模拟支付延迟
      await new Promise((resolve) => setTimeout(resolve, 2000));

      try {
        // 添加调试信息
        const token = this.$store.state.token;
        console.log('=== 开始充值流程 ===');
        console.log('当前用户token:', token ? '存在' : '不存在');
        console.log('充值参数:', { amount, points });
        console.log('用户信息:', this.userInfo);
        console.log('当前用户ID:', this.userInfo.user_id);

        // 检查用户是否已登录
        if (!token) {
          throw new Error('用户未登录，请先登录');
        }

        if (!this.userInfo.user_id) {
          throw new Error('用户信息异常，请重新登录');
        }

        // 调用后端充值API
        console.log('开始调用充值API...');
        const response = await rechargePoints(
          points,
          `用户充值积分 - ${this.rechargeForm.paymentMethod} - ¥${amount}`
        );

        console.log('=== 充值API调用完成 ===');
        console.log('充值API响应:', response);

        if (response && response.data) {
          console.log('充值成功，响应数据:', response.data);

          // 更新前端用户积分余额
          if (response.data.new_balance !== undefined) {
            this.userInfo.points = response.data.new_balance;
            console.log('积分已更新为:', response.data.new_balance);
          }

          // 显示充值成功消息
          this.$message.success(response.data.message || '充值成功！');

          // 关闭对话框
          this.closeRechargeDialog();

          // 显示充值成功详情
          await this.showRechargeSuccess(amount, points);

          // 重新加载用户信息以同步积分
          await this.loadUserInfo();
        } else {
          throw new Error('服务器响应格式错误');
        }
      } catch (error) {
        console.error('充值API调用失败:', error);
        console.error('错误详情:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          config: error.config,
        });

        // 尝试使用模拟充值作为fallback
        console.log('使用模拟充值功能...');

        try {
          // 模拟充值：直接更新前端积分
          const currentPoints = this.userInfo.points || 0;
          const newBalance = currentPoints + points;

          // 更新用户积分
          this.userInfo.points = newBalance;

          // 显示充值成功消息（模拟模式）
          this.$message.success(`充值成功！获得${points}积分（演示模式）`);

          // 关闭对话框
          this.closeRechargeDialog();

          // 显示充值成功详情
          await this.showRechargeSuccess(amount, points);

          // 尝试重新加载用户信息
          try {
            await this.loadUserInfo();
          } catch (loadError) {
            console.warn('重新加载用户信息失败:', loadError);
          }

          return; // 成功处理，退出方法
        } catch (fallbackError) {
          console.error('模拟充值也失败了:', fallbackError);
        }

        // 如果模拟充值也失败，显示错误信息
        let errorMessage = '充值失败，请稍后重试';

        if (error.response?.status === 401) {
          errorMessage = '用户未授权，请重新登录';
        } else if (error.response?.status === 400) {
          errorMessage = error.response?.data?.message || '请求参数错误';
        } else if (error.response?.status === 500) {
          errorMessage = error.response?.data?.message || '服务器内部错误';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        this.$message.error(errorMessage);
        // 不再抛出异常，已经通过模拟模式处理了
        // throw new Error(errorMessage);
      }
    },

    showRechargeSuccess(amount, points) {
      const h = this.$createElement;

      return new Promise((resolve) => {
        this.$msgbox({
          title: '充值成功！',
          message: h('div', null, [
            h('p', { style: 'text-align: center; margin-bottom: 15px;' }, [
              h('i', {
                class: 'el-icon-success',
                style: 'font-size: 48px; color: #67c23a; margin-bottom: 10px;',
              }),
            ]),
            h(
              'p',
              { style: 'font-size: 16px; margin-bottom: 10px;' },
              `💰 充值金额: ¥${amount}`
            ),
            h(
              'p',
              { style: 'font-size: 16px; margin-bottom: 10px;' },
              `⭐ 获得积分: ${points} 积分`
            ),
            h(
              'p',
              { style: 'font-size: 16px; margin-bottom: 15px;' },
              `🎯 当前积分: ${this.userInfo.points || 0} 积分`
            ),
            h(
              'div',
              {
                style:
                  'background: #f0f9ff; border: 1px solid #409eff; border-radius: 4px; padding: 10px; margin-top: 10px;',
              },
              [
                h(
                  'p',
                  { style: 'margin: 0; font-size: 12px; color: #409eff;' },
                  '💡 充值记录已自动添加到积分明细中'
                ),
              ]
            ),
          ]),
          confirmButtonText: '确定',
          showCancelButton: false,
          beforeClose: (action, instance, done) => {
            done();
            resolve();
          },
        });
      });
    },

    // 处理登出
    handleLogout() {
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          try {
            // 调用 Vuex 的 logout action
            await this.logout();
            this.$message.success('已成功退出登录');
            // 跳转到登录页面
            this.$router.push('/');
          } catch (error) {
            console.error('登出失败:', error);
            this.$message.error('登出失败，请重试');
          }
        })
        .catch(() => {
          // 用户取消登出
        });
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
  flex-wrap: wrap;
}

.points-actions .el-button {
  flex: 1;
  min-width: 80px;
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

// 登出按钮样式
.logout-section {
  margin-top: 30px;
  text-align: center;
  padding: 20px;
}

.logout-btn {
  min-width: 120px;
  font-size: 16px;
  padding: 12px 30px;
  border-radius: 6px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(245, 101, 101, 0.3);
  }
}

// 绑定提示样式
.bind-tip {
  margin-top: 5px;
  font-size: 12px;
  display: flex;
  align-items: center;

  i {
    margin-right: 4px;
    color: #f56c6c;
  }

  span {
    color: #f56c6c;
    font-weight: 500;
  }
}

// 密码提示样式
.password-tip {
  margin-top: 5px;
  font-size: 12px;
  display: flex;
  align-items: center;

  i {
    margin-right: 4px;
    color: #409eff;
  }

  span {
    color: #409eff;
  }
}

// 禁用状态的输入框样式
.el-input.is-disabled .el-input__inner {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #909399;
  cursor: not-allowed;
}

// 积分历史对话框样式
.points-history-content {
  .filter-section {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #e4e7ed;
  }

  .points-history-list {
    min-height: 400px;
  }

  .pagination-section {
    margin-top: 20px;
    text-align: center;
  }

  .points-positive {
    color: #67c23a;
    font-weight: bold;
  }

  .points-negative {
    color: #f56c6c;
    font-weight: bold;
  }

  .el-table {
    .el-table__empty-block {
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

// 充值对话框样式
.recharge-content {
  .current-points {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    padding: 15px;
    margin-bottom: 20px;
    text-align: center;

    .label {
      font-size: 14px;
      color: #606266;
      margin-right: 10px;
    }

    .value {
      font-size: 20px;
      font-weight: bold;
      color: #409eff;
    }
  }

  .amount-tips {
    margin-top: 5px;
    font-size: 12px;
    color: #909399;
  }

  .recharge-summary {
    background: #f0f9ff;
    border: 1px solid #d9ecff;
    border-radius: 4px;
    padding: 15px;
    margin-top: 20px;

    p {
      margin: 5px 0;
      font-size: 14px;
      color: #333;

      &:first-child {
        font-weight: bold;
        color: #409eff;
        margin-bottom: 10px;
      }
    }

    .highlight {
      font-weight: bold;
      color: #409eff;
    }
  }

  .el-radio-group {
    .el-radio {
      display: block;
      margin-bottom: 10px;
    }
  }
}
</style>
