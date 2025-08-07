<template>
  <div class="subscription-selector">
    <div class="subscription-info">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="订阅时长" prop="duration">
          <el-radio-group v-model="form.duration" @change="updatePoints">
            <el-radio :label="1">1 天</el-radio>
            <el-radio :label="7">1 周</el-radio>
            <el-radio :label="30">1 月</el-radio>
            <el-radio :label="180">6 月</el-radio>
            <el-radio :label="365">12 月</el-radio>
            <el-radio :label="0">自定义</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 自定义输入天数 -->
        <el-form-item
          v-if="form.duration === 0"
          label="自定义天数"
          prop="customDays"
        >
          <el-input
            v-model="form.customDays"
            placeholder="请输入天数"
            type="number"
            @input="updatePoints"
          />
        </el-form-item>

        <el-form-item label="积分消耗">
          <el-input :value="form.points + ' 积分'" disabled />
        </el-form-item>
      </el-form>
    </div>

    <!-- 按钮区域 -->
    <div class="action-buttons">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确认</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SubscriptionSelector',
  props: {
    robotId: {
      type: Number,
      required: true,
    },
    onClose: {
      type: Function,
      required: true,
    },
    onConfirm: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      form: {
        duration: 1, // 默认选择1天
        points: 1.5, // 默认积分
        customDays: null, // 自定义天数
      },
      rules: {
        duration: [
          { required: true, message: '请选择订阅时长', trigger: 'change' },
        ],
        customDays: [
          { required: true, message: '请输入自定义天数', trigger: 'blur' },
          { type: 'number', min: 1, message: '天数必须大于0', trigger: 'blur' },
        ],
      },
    };
  },
  methods: {
    // 更新积分
    updatePoints() {
      // 如果是自定义天数
      if (this.form.duration === 0) {
        if (this.form.customDays && this.form.customDays > 0) {
          this.form.points = this.form.customDays * 1.5; // 每天1.5积分
        } else {
          this.form.points = 0;
        }
      } else if (this.form.duration) {
        // 默认选择的时长，自动计算积分
        this.form.points = this.form.duration * 1.5; // 每天1.5积分
      }
    },

    // 确认订阅操作
    async handleConfirm() {
      // 表单验证
      this.$refs.formRef.validate(async (valid) => {
        if (valid) {
          // 如果是自定义模式，需要额外验证自定义天数
          if (this.form.duration === 0) {
            if (!this.form.customDays || this.form.customDays <= 0) {
              this.$message.error('请输入有效的自定义天数');
              return;
            }
          }

          try {
            // 获取实际的订阅天数
            const actualDuration =
              this.form.duration === 0
                ? this.form.customDays
                : this.form.duration;
            // 调用父组件的确认方法
            await this.onConfirm(actualDuration, this.form.points);
            this.handleClose();
          } catch (error) {
            console.error('订阅失败：', error);
            this.$message.error('订阅失败，请稍后重试！');
          }
        }
      });
    },

    // 关闭弹窗
    handleClose() {
      this.onClose();
    },
  },
};
</script>

<style scoped>
.subscription-selector {
  padding: 0;
}

.subscription-info {
  .el-form {
    .el-form-item {
      margin-bottom: 2vw;
    }

    .el-radio-group {
      margin-top: 3.5vw;
      margin-bottom: 0vw;
      .el-radio {
        display: block;
        margin-bottom: 0.5vw;
        margin-right: 0;
      }
    }
  }
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
}
</style>
