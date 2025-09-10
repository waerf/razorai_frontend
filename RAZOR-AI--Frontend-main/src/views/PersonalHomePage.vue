<template>
  <div class="personal-page">
    <!-- 用户头像和基本信息卡片 -->
    <el-card class="profile-card" v-loading="loading">
      <div class="profile-header">
        <div class="avatar-section">
          <div class="avatar-container">
            <img
              :src="avatar"
              alt="用户头像"
              class="user-avatar"
              @error="handleImageError"
            />
            <div class="avatar-overlay" @click="triggerFileInput">
              <i class="el-icon-camera"></i>
              <span>更换头像</span>
            </div>
          </div>
          <input
            ref="avatarInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleAvatarChange"
          />
          <el-button
            size="mini"
            type="text"
            class="change-avatar-btn"
            @click="triggerFileInput"
            :loading="avatarUploading"
          >
            {{ avatarUploading ? '上传中...' : '更换头像' }}
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
          <el-button type="danger" size="small" @click="handleLogout">
            退出登录
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

    <!-- 订阅记录 -->
    <el-card class="subscription-card">
      <div slot="header" class="clearfix">
        <span class="card-title">
          我的订阅记录
          <el-badge
            v-if="expiredSubscriptionsCount > 0"
            :value="expiredSubscriptionsCount"
            type="warning"
            style="margin-left: 10px"
          >
            <span style="color: #e6a23c; font-size: 12px">过期</span>
          </el-badge>
        </span>
        <div style="float: right">
          <el-select
            v-model="subscriptionFilter"
            placeholder="筛选状态"
            size="mini"
            style="width: 120px; margin-right: 10px"
          >
            <el-option label="全部" value="all"></el-option>
            <el-option label="活跃" value="1"></el-option>
            <el-option label="已过期" value="2"></el-option>
          </el-select>
          <el-button
            size="mini"
            type="text"
            @click="refreshSubscriptions"
            :loading="subscriptionsLoading"
          >
            刷新
          </el-button>
        </div>
      </div>
      <div class="subscription-content" v-loading="subscriptionsLoading">
        <div v-if="filteredSubscriptions.length === 0" class="no-subscriptions">
          <el-empty
            :description="
              subscriptions.length === 0
                ? '暂无订阅记录'
                : '当前筛选条件下无记录'
            "
          />
        </div>
        <div v-else>
          <el-table
            :data="filteredSubscriptions"
            style="width: 100%"
            stripe
            border
            :row-class-name="getRowClassName"
          >
            <el-table-column prop="agent_name" label="机器人名称" width="180" />
            <el-table-column
              prop="subscription_type"
              label="订阅类型"
              width="120"
            >
              <template slot-scope="scope">
                <el-tag
                  :type="
                    scope.row.subscription_type === 1 ? 'primary' : 'success'
                  "
                  size="small"
                >
                  {{ getSubscriptionTypeText(scope.row.subscription_type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="start_time" label="开始时间" width="160">
              <template slot-scope="scope">
                {{ formatDate(scope.row.start_time) }}
              </template>
            </el-table-column>
            <el-table-column prop="end_time" label="结束时间" width="160">
              <template slot-scope="scope">
                {{ formatDate(scope.row.end_time) }}
              </template>
            </el-table-column>
            <el-table-column label="剩余时间" width="120">
              <template slot-scope="scope">
                <span :class="getRemainingTimeClass(scope.row)">
                  {{ getRemainingTimeText(scope.row) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="getStatusTagType(scope.row.status)" size="small">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
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
            placeholder="邮箱不可修改"
            readonly
            disabled
          />
        </el-form-item>

        <el-form-item label="手机" prop="Phone">
          <el-input
            v-model="editForm.Phone"
            placeholder="手机号不可修改"
            maxlength="11"
            readonly
            disabled
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
          </div>

          <div class="recharge-rates"></div>
        </div>

        <el-form-item label="充值数量" prop="points">
          <el-input-number placeholder="请输入充值积分数量" />
        </el-form-item>

        <div class="quick-amounts">
          <span class="quick-label">快速选择：</span>
          <el-button size="mini" @click="setQuickAmount(100)">100</el-button>
          <el-button size="mini" @click="setQuickAmount(500)">500</el-button>
          <el-button size="mini" @click="setQuickAmount(1000)">1000</el-button>
          <el-button size="mini" @click="setQuickAmount(5000)">5000</el-button>
        </div>

        <div class="recharge-preview" v-if="rechargeForm.points > 0">
          <div class="preview-item"></div>
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

    <!-- 头像裁剪对话框 -->
    <el-dialog
      title="头像裁剪"
      :visible.sync="avatarPreviewVisible"
      width="600px"
      @close="resetAvatarPreview"
    >
      <div class="avatar-cropper-content" v-loading="avatarUploading">
        <div class="cropper-section">
          <div class="cropper-container">
            <vue-cropper
              ref="cropper"
              :img="cropperOption.img"
              :outputSize="cropperOption.outputSize"
              :outputType="cropperOption.outputType"
              :info="cropperOption.info"
              :canScale="cropperOption.canScale"
              :autoCrop="cropperOption.autoCrop"
              :autoCropWidth="cropperOption.autoCropWidth"
              :autoCropHeight="cropperOption.autoCropHeight"
              :fixedBox="cropperOption.fixedBox"
              :fixed="cropperOption.fixed"
              :fixedNumber="cropperOption.fixedNumber"
              :full="cropperOption.full"
              :canMoveBox="cropperOption.canMoveBox"
              :original="cropperOption.original"
              :centerBox="cropperOption.centerBox"
              :height="cropperOption.height"
              :infoTrue="cropperOption.infoTrue"
              :maxImgSize="cropperOption.maxImgSize"
              :enlarge="cropperOption.enlarge"
              :mode="cropperOption.mode"
              :canMove="cropperOption.canMove"
              :canChangeScale="cropperOption.canChangeScale"
              :limitMinSize="cropperOption.limitMinSize"
              :high="cropperOption.high"
              @crop-moving="updateCirclePreview"
              @real-time="updateCirclePreview"
            ></vue-cropper>
          </div>

          <div class="preview-section">
            <h4>圆形头像预览</h4>
            <div class="circle-preview" ref="circlePreview">
              <!-- 圆形预览将通过JavaScript动态生成 -->
            </div>
          </div>
        </div>

        <div class="cropper-controls">
          <el-button-group>
            <el-button size="mini" @click="rotateLeft">
              <i class="el-icon-refresh-left"></i> 左转
            </el-button>
            <el-button size="mini" @click="rotateRight">
              <i class="el-icon-refresh-right"></i> 右转
            </el-button>
            <el-button size="mini" @click="scaleUp">
              <i class="el-icon-zoom-in"></i> 放大
            </el-button>
            <el-button size="mini" @click="scaleDown">
              <i class="el-icon-zoom-out"></i> 缩小
            </el-button>
          </el-button-group>
        </div>

        <div class="upload-tip">
          <p>• 拖动图片调整位置，拖动边框调整大小</p>
          <p>• 滚轮缩放，双击重置</p>
          <p>• 头像将被裁剪为圆形</p>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="avatarPreviewVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="confirmAvatarUpload"
          :loading="avatarUploading"
        >
          {{ avatarUploading ? '上传中...' : '确认更换' }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapActions, mapState, mapMutations } from 'vuex';
import { VueCropper } from 'vue-cropper';
import {
  getUserInfo,
  updateUserInfo,
  getUserPoints,
  getPointsHistory,
  rechargePoints,
  fetchUserSubscriptions,
  updateUserAvatar,
} from '@/utils/api';

export default {
  name: 'UserProfile',
  components: {
    VueCropper,
  },
  data() {
    return {
      avatar: 'https://picsum.photos/id/1000/40/40',
      loading: true,
      avatarUploading: false, // 头像上传状态
      userInfo: {
        user_id: null,
        user_name: '',
        email: '',
        phone: '',
        gender: null,
        age: null,
        avatar_url: '', // 添加头像URL字段
        points: 0,
        created_at: null,
        updated_at: null,
      },

      // 订阅记录相关
      subscriptions: [],
      subscriptionsLoading: false,
      subscriptionFilter: 'all', // 订阅筛选条件

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

      // 头像裁剪相关
      avatarPreviewVisible: false,
      previewAvatarUrl: '',
      currentAvatarFile: null,

      // 裁剪器配置
      cropperOption: {
        img: '', // 裁剪图片的地址
        outputSize: 1, // 裁剪生成图片的质量
        outputType: 'png', // 裁剪生成图片的格式
        info: true, // 图片大小信息
        canScale: true, // 图片是否允许滚轮缩放
        autoCrop: true, // 是否默认生成截图框
        autoCropWidth: 200, // 默认生成截图框宽度
        autoCropHeight: 200, // 默认生成截图框高度
        fixedBox: false, // 固定截图框大小
        fixed: true, // 是否开启截图框宽高固定比例
        fixedNumber: [1, 1], // 截图框的宽高比例
        full: false, // 是否输出原图比例的截图
        canMoveBox: true, // 截图框能否拖动
        original: false, // 上传图片按照原始比例渲染
        centerBox: true, // 截图框是否被限制在图片里面
        height: true, // 是否按照设备的dpr 输出等比例图片
        infoTrue: true, // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
        maxImgSize: 3000, // 限制图片最大宽度和高度
        enlarge: 1, // 图片根据截图框输出比例倍数
        mode: 'contain', // 图片默认渲染方式
        canMove: true, // 上传图片是否可以移动
        canChangeScale: true, // 是否可以改变截图框大小
        limitMinSize: 50, // 截图框最小尺寸
        high: true, // 是否按照设备的dpr 输出等比例图片
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

    // 过滤后的订阅记录
    filteredSubscriptions() {
      if (this.subscriptionFilter === 'all') {
        return this.subscriptions;
      }
      return this.subscriptions.filter(
        (sub) => sub.status == this.subscriptionFilter
      );
    },

    // 过期订阅数量
    expiredSubscriptionsCount() {
      return this.subscriptions.filter((sub) => sub.status === 2).length;
    },
  },

  async created() {
    await this.loadUserInfo();
    await this.loadSubscriptions();
  },

  methods: {
    ...mapActions('user', ['logout']),
    ...mapMutations('user', ['UPDATE_USER_NAME']),

    // 登出功能
    handleLogout() {
      this.$confirm('确定要退出登录吗？', '确认退出', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          try {
            // 调用store中的logout action
            const result = await this.logout();

            // 显示logout action返回的消息
            this.$message.success(result.message || '已成功退出登录');

            // 跳转到登录页面或首页
            this.$router.push('/').catch(() => {
              // 如果没有登录页面，跳转到首页
              this.$router.push('/');
            });
          } catch (error) {
            console.error('退出登录失败:', error);
            this.$message.error('退出登录失败，请重试');
          }
        })
        .catch(() => {
          // 用户取消登出，不需要处理
        });
    },

    // 头像上传相关方法
    handleImageError() {
      this.avatar = 'https://picsum.photos/id/1000/40/40';
    },

    triggerFileInput() {
      if (this.avatarUploading) return;
      this.$refs.avatarInput.click();
    },

    async handleAvatarChange(event) {
      const file = event.target.files[0];
      if (!file) return;

      // 基本文件验证
      if (!file.type.startsWith('image/')) {
        this.$message.error('请选择图片文件');
        return;
      }

      // 文件大小限制 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.$message.error('图片大小不能超过 5MB');
        return;
      }

      try {
        // 创建图片URL供裁剪器使用
        const imageUrl = URL.createObjectURL(file);
        this.cropperOption.img = imageUrl;
        this.currentAvatarFile = file;

        // 显示裁剪对话框
        this.avatarPreviewVisible = true;

        // 延迟一下确保对话框完全打开后再初始化预览
        this.$nextTick(() => {
          this.updateCirclePreview();
        });
      } catch (error) {
        console.error('头像预览失败:', error);
        this.$message.error('头像预览失败：' + error.message);
      } finally {
        // 清空文件输入框
        this.$refs.avatarInput.value = '';
      }
    },

    // 裁剪器控制方法
    rotateLeft() {
      this.$refs.cropper.rotateLeft();
      this.updateCirclePreview();
    },

    rotateRight() {
      this.$refs.cropper.rotateRight();
      this.updateCirclePreview();
    },

    scaleUp() {
      this.$refs.cropper.changeScale(1);
      this.updateCirclePreview();
    },

    scaleDown() {
      this.$refs.cropper.changeScale(-1);
      this.updateCirclePreview();
    },

    // 更新圆形预览
    updateCirclePreview() {
      this.$nextTick(() => {
        if (this.$refs.cropper) {
          this.$refs.cropper.getCropData((data) => {
            if (this.$refs.circlePreview) {
              this.$refs.circlePreview.innerHTML = `
                <div style="
                  width: 100px;
                  height: 100px;
                  border-radius: 50%;
                  overflow: hidden;
                  margin: 0 auto;
                  background: #f5f5f5;
                ">
                  <img src="${data}" style="
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                  " />
                </div>
              `;
            }
          });
        }
      });
    },

    async confirmAvatarUpload() {
      if (!this.$refs.cropper) return;

      try {
        this.avatarUploading = true;
        this.$message.info('正在生成裁剪图片...');

        // 获取裁剪后的blob数据
        this.$refs.cropper.getCropBlob((blob) => {
          this.uploadCroppedImage(blob);
        });
      } catch (error) {
        console.error('头像上传失败:', error);
        this.$message.error('头像上传失败：' + error.message);
        this.avatarUploading = false;
      }
    },

    async uploadCroppedImage(blob) {
      try {
        this.$message.info('正在上传头像...');

        // 创建FormData
        const formData = new FormData();
        formData.append('file', blob, 'avatar.png');

        // 调用Python服务上传图片
        const response = await fetch('http://localhost:5000/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          // 上传成功，更新头像显示
          this.avatar = result.url;

          // 调用后端API更新用户头像
          await this.updateUserAvatar(result.url);

          this.$message.success('头像更新成功！');
          this.avatarPreviewVisible = false;
        } else {
          throw new Error(result.error || '上传失败');
        }
      } catch (error) {
        console.error('头像上传失败:', error);
        this.$message.error('头像上传失败：' + error.message);
      } finally {
        this.avatarUploading = false;
      }
    },

    resetAvatarPreview() {
      if (this.cropperOption.img) {
        URL.revokeObjectURL(this.cropperOption.img);
      }
      this.cropperOption.img = '';
      this.currentAvatarFile = null;

      // 清空圆形预览
      if (this.$refs.circlePreview) {
        this.$refs.circlePreview.innerHTML = '';
      }
    },

    async updateUserAvatar(avatarUrl) {
      try {
        console.log('准备更新头像URL到后端:', avatarUrl);

        // 直接使用头像更新API，不进行额外的删除操作
        // 旧头像的清理应该由后端统一管理，或者通过定时任务处理
        const response = await updateUserAvatar(this.userId, avatarUrl);
        console.log('头像更新API响应:', response);

        // 检查响应结果
        if (response && response.data) {
          // 更新本地用户信息
          this.userInfo.avatar_url = avatarUrl;
          console.log('头像URL已成功保存到后端');

          // 更新页面显示的头像
          this.avatar = avatarUrl;

          return true;
        } else {
          throw new Error('后端更新失败');
        }
      } catch (error) {
        console.error('更新用户头像到后端失败:', error);

        // 处理不同类型的错误
        if (error.response) {
          const errorMsg =
            error.response.data?.message || `HTTP ${error.response.status}`;
          throw new Error('保存到服务器失败: ' + errorMsg);
        } else {
          throw new Error('保存到服务器失败: ' + (error.message || '网络错误'));
        }
      }
    },

    async getPasswordForAvatarUpdate() {
      // 简化的密码获取方式，实际项目中可能需要更安全的方式
      return new Promise((resolve, reject) => {
        this.$prompt('请输入当前密码以验证身份：', '更新头像', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputType: 'password',
          inputValidator: (value) => {
            if (!value) {
              return '请输入密码';
            }
            return true;
          },
          inputErrorMessage: '密码不能为空',
        })
          .then(({ value }) => {
            resolve(value);
          })
          .catch(() => {
            reject(new Error('用户取消了密码验证'));
          });
      });
    },

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

          // 设置头像
          if (this.userInfo.avatar_url) {
            this.avatar = this.userInfo.avatar_url;
          } else {
            this.avatar = 'https://picsum.photos/id/1000/40/40';
          }

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

    // 积分相关方法 - 仅用于购买机器人
    // 已删除会员等级相关方法

    earnPointsDialog() {
      this.$msgbox({
        title: '积分用途',
        message: `
          <div>
            <p>💰 <strong>积分可用于：</strong></p>
            <ul>
              <li>🤖 订阅AI代理服务</li>
              <li>⭐ 续订机器人</li>
            </ul>
            <br>
            <p>💡 <strong>如何获取积分：</strong></p>
            <ul>
              <li>🎁 新用户注册</li>
              <li>🤖 创建AI代理</li>
              <li>🤖 更新机器人</li>
              <li>💰 充值购买</li>
            </ul>
            <br>
            <p style="color: #909399; font-size: 12px;">
              💡 提示：积分实时到账，可在积分明细中查看详细记录
            </p>
          </div>
        `,
        dangerouslyUseHTMLString: true,
        showCancelButton: false,
        confirmButtonText: '知道了',
      })
        .then(() => {
          // 用户点击确定按钮
          console.log('用户查看了积分说明');
        })
        .catch(() => {
          // 用户点击X按钮或按ESC键关闭弹窗
          console.log('用户关闭了积分说明弹窗');
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
            // 更新 Vuex store 中的用户名
            this.UPDATE_USER_NAME(this.editForm.UserName);
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
          // 更新 Vuex store 中的用户名
          this.UPDATE_USER_NAME(this.editForm.UserName);
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
          '用户充值积分'
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

    // 订阅记录相关方法
    async loadSubscriptions() {
      this.subscriptionsLoading = true;
      try {
        const response = await this.fetchUserSubscriptions(this.userId);
        console.log('订阅记录API响应:', response);

        if (response && Array.isArray(response)) {
          this.subscriptions = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          this.subscriptions = response.data;
        } else {
          this.subscriptions = [];
        }

        console.log('加载的订阅记录:', this.subscriptions);
      } catch (error) {
        console.error('加载订阅记录失败:', error);
        this.$message.error(
          '加载订阅记录失败：' + (error.message || '网络错误')
        );
        this.subscriptions = [];
      } finally {
        this.subscriptionsLoading = false;
      }
    },

    async fetchUserSubscriptions(userId) {
      try {
        const response = await fetchUserSubscriptions(userId);
        return response.data;
      } catch (error) {
        console.error('获取订阅记录失败:', error);
        throw error;
      }
    },

    refreshSubscriptions() {
      this.loadSubscriptions();
    },

    getSubscriptionTypeText(type) {
      const typeMap = {
        1: '基础订阅',
        2: '高级订阅',
        3: '专业订阅',
      };
      return typeMap[type] || '未知类型';
    },

    getStatusText(status) {
      const statusMap = {
        1: '活跃',
        2: '已过期',
      };
      return statusMap[status] || '未知状态';
    },

    getStatusTagType(status) {
      const tagTypeMap = {
        1: 'success',
        2: 'warning',
      };
      return tagTypeMap[status] || 'info';
    },

    // 获取表格行的样式类名
    getRowClassName({ row }) {
      if (row.status === 2) {
        return 'expired-row';
      }
      return '';
    },

    // 获取剩余时间文本
    getRemainingTimeText(subscription) {
      if (subscription.status === 2) return '已过期';

      if (!subscription.end_time) return '无期限';

      const endDate = new Date(subscription.end_time);
      const currentDate = new Date();
      const diffTime = endDate - currentDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return `已过期${Math.abs(diffDays)}天`;
      } else if (diffDays === 0) {
        return '今日到期';
      } else if (diffDays <= 7) {
        return `${diffDays}天后到期`;
      } else {
        return `${diffDays}天`;
      }
    }, // 获取剩余时间的样式类名
    getRemainingTimeClass(subscription) {
      if (subscription.status !== 1) return '';

      if (!subscription.end_time) return '';

      const endDate = new Date(subscription.end_time);
      const currentDate = new Date();
      const diffTime = endDate - currentDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        return 'text-danger';
      } else if (diffDays <= 7) {
        return 'text-warning';
      } else if (diffDays <= 30) {
        return 'text-info';
      }
      return 'text-success';
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
.subscription-card {
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

.avatar-container {
  position: relative;
  display: inline-block;

  &:hover .avatar-overlay {
    opacity: 1;
  }
}

.user-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
  color: white;
  font-size: 12px;

  .el-icon-camera {
    font-size: 20px;
    margin-bottom: 4px;
  }

  span {
    font-size: 10px;
    text-align: center;
  }
}

.change-avatar-btn {
  color: #409eff;
  font-size: 12px;
}

// 头像裁剪器样式
.avatar-cropper-content {
  .cropper-section {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;

    .cropper-container {
      flex: 1;
      height: 300px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      overflow: hidden;
    }

    .preview-section {
      width: 150px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;

      h4 {
        margin: 0;
        font-size: 14px;
        color: #606266;
      }

      .circle-preview {
        width: 100px;
        height: 100px;
        border: 2px dashed #dcdfe6;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #fafafa;

        &:empty::before {
          content: '预览';
          color: #c0c4cc;
          font-size: 12px;
        }
      }
    }
  }

  .cropper-controls {
    text-align: center;
    margin-bottom: 15px;

    .el-button-group {
      .el-button {
        padding: 5px 8px;
        font-size: 12px;
      }
    }
  }

  .upload-tip {
    background: #f4f4f5;
    padding: 10px;
    border-radius: 4px;
    margin-top: 10px;

    p {
      margin: 5px 0;
      font-size: 12px;
      color: #909399;

      &:first-child {
        margin-top: 0;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
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
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  max-width: 800px;
  column-gap: 40px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  width: 100%;
  max-width: 100%;
}

.label {
  font-weight: bold;
  color: #606266;
  min-width: 70px;
  flex-shrink: 0;
}

.value {
  color: #303133;
  flex: 1;
  min-width: 0;
  word-break: break-all;
  overflow-wrap: break-word;
}

.profile-text {
  word-wrap: break-word;
  white-space: pre-wrap;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

.action-buttons {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: center;
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

// 订阅记录样式
.subscription-card {
  background: #ffffff;
  border-left: 4px solid #67c23a;
}

.subscription-content {
  .no-subscriptions {
    text-align: center;
    padding: 40px 0;
  }

  .el-table {
    border-radius: 8px;
    overflow: hidden;
  }

  .el-table th {
    background: #f5f7fa;
    color: #606266;
    font-weight: 600;
  }
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

// 禁用字段样式
.el-form-item {
  .el-input.is-disabled .el-input__inner {
    background-color: #f5f7fa;
    color: #909399;
    cursor: not-allowed;
  }
}

// 头像预览对话框样式
.avatar-preview-content {
  text-align: center;

  .preview-section {
    margin-bottom: 20px;

    .preview-avatar {
      display: inline-block;
      margin-bottom: 10px;

      img {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #409eff;
        box-shadow: 0 2px 12px rgba(64, 158, 255, 0.3);
      }
    }

    .preview-tip {
      color: #606266;
      font-size: 14px;
      margin: 0;
    }
  }

  .upload-tip {
    background: #f5f7fa;
    border-radius: 6px;
    padding: 15px;
    text-align: left;

    p {
      margin: 5px 0;
      color: #909399;
      font-size: 13px;
    }
  }
}

// 订阅记录表格样式
::v-deep .expired-row {
  background-color: #fef0f0 !important;

  td {
    color: #909399 !important;
  }
}

// 剩余时间文本颜色
.text-danger {
  color: #f56c6c !important;
  font-weight: bold;
}

.text-warning {
  color: #e6a23c !important;
  font-weight: bold;
}

.text-info {
  color: #409eff !important;
}

.text-success {
  color: #67c23a !important;
}
</style>
