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
          label="自定义"
          prop="customDays"
        >
          <el-input
            v-model.number="form.customDays"
            placeholder="请输入天数"
            type="number"
            @input="updatePoints"
          />
        </el-form-item>

        <el-form-item label="积分消耗">
          <el-input :value="formatPrice(form.points)" disabled />
        </el-form-item>
      </el-form>
    </div>

    <!-- 按钮区域 -->
    <div class="action-buttons">
      <el-button @click="handleClose">取消</el-button>
      <el-button
        type="primary"
        :disabled="isDisabled"
        :style="
          isDisabled
            ? { background: '#ccc', borderColor: '#ccc', color: '#fff' }
            : {}
        "
        @click="handleConfirm"
        >确认</el-button
      >
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
    price: {
      type: Number,
      default: 1,
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
        points: this.price, // 使用机器人的积分费率
        customDays: null, // 自定义天数
      },
      rules: {
        duration: [
          { required: true, message: '请选择订阅时长', trigger: 'change' },
        ],
        customDays: [
          { required: true, message: '请输入自定义天数', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value === null || value === undefined || value === '') {
                callback(new Error('请输入自定义天数'));
              } else if (isNaN(value) || Number(value) <= 0) {
                callback(new Error('天数必须大于0'));
              } else {
                callback();
              }
            },
            trigger: 'blur',
          },
        ],
      },
      isDisabled: false,
    };
  },
  mounted() {
    // 组件挂载时初始化积分
    this.updatePoints();
  },
  watch: {
    // 监听机器人ID或价格变化，重置表单状态
    robotId: {
      handler() {
        this.resetForm();
      },
      immediate: false,
    },
    price: {
      handler() {
        this.resetForm();
      },
      immediate: false,
    },
  },
  methods: {
    // 重置表单状态
    resetForm() {
      this.form.duration = 1; // 重置为默认1天
      this.form.customDays = null; // 清空自定义天数
      this.updatePoints(); // 重新计算积分
      // 清除表单验证状态
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate();
        }
      });
    },
    // 更新积分
    updatePoints() {
      // 如果是自定义天数
      if (this.form.duration === 0) {
        const customDays = Number(this.form.customDays);
        if (this.form.customDays && customDays > 0) {
          this.form.points = customDays * this.price; // 使用机器人的积分费率
        } else {
          this.form.points = 0;
        }
      } else if (this.form.duration) {
        // 默认选择的时长，自动计算积分
        this.form.points = this.form.duration * this.price; // 使用机器人的积分费率
      }
    },

    // 确认订阅操作
    async handleConfirm() {
      if (this.isDisabled) return;
      this.isDisabled = true;
      this.$refs.formRef.validate(async (valid) => {
        if (valid) {
          // 如果是自定义模式，需要额外验证自定义天数
          if (this.form.duration === 0) {
            const customDays = Number(this.form.customDays);
            if (!this.form.customDays || isNaN(customDays) || customDays <= 0) {
              this.$message.error('请输入有效的自定义天数');
              this.isDisabled = false;
              return;
            }
          }
          this.$message.info('正在订阅中，请稍后');
          try {
            // 获取实际的订阅天数
            const actualDuration =
              this.form.duration === 0
                ? Number(this.form.customDays)
                : this.form.duration;
            // 调用父组件的确认方法
            await this.onConfirm(actualDuration, this.form.points);
            this.isDisabled = false;
            this.handleClose();
          } catch (error) {
            this.isDisabled = false;
            this.$message.error('订阅失败，请稍后重试！');
          }
        } else {
          this.isDisabled = false;
        }
      });
    },

    // 关闭弹窗
    handleClose() {
      this.form.customDays = null;
      this.onClose();
    },

    // 格式化积分显示
    formatPrice(points) {
      // 当points为0时，返回"免费"
      if (points === 0) {
        return '免费';
      }
      return `${points} 积分`;
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
