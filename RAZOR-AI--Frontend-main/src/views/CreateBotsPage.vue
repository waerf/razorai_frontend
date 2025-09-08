<template>
  <div class="create-robot">
    <el-form
      :model="form"
      ref="form"
      :rules="rules"
      label-width="120px"
      class="creat-robot-form"
    >
      <div class="form-header">
        <h1 class="form-title">创建新机器人</h1>
        <p class="form-subtitle">设置机器人的基本信息和参数</p>
      </div>

      <el-form-item label="机器人名字" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入机器人名字"
          class="custom-input"
        ></el-input>
      </el-form-item>

      <el-form-item label="机器人类型" prop="type">
        <el-select
          v-model="form.type"
          placeholder="请选择机器人类型"
          class="custom-select"
        >
          <el-option
            v-for="option in robotTypes"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="LLM ID" prop="LLM_id">
        <el-select
          v-model="form.LLM_id"
          placeholder="请选择 LLM"
          class="custom-select"
        >
          <el-option
            v-for="option in llmOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="提示词" prop="chatprompt">
        <el-input
          v-model="form.chatprompt"
          placeholder="请输入提示词"
          class="custom-input"
          type="textarea"
          rows="4"
        ></el-input>
      </el-form-item>

      <el-form-item label="描述">
        <el-input
          v-model="form.description"
          placeholder="请输入机器人的描述（可无）"
          class="custom-input"
          type="textarea"
          rows="3"
        ></el-input>
      </el-form-item>

      <el-form-item class="form-actions">
        <el-button class="cancel-button" @click="onCancel"> 取消 </el-button>
        <el-button type="primary" class="submit-button" @click="onSubmit">
          创建机器人
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { createAgentForReview } from '@/utils/api';
export default {
  data() {
    return {
      form: {
        name: '',
        type: null,
        LLM_id: null,
        chatprompt: '',
        description: '',
      },
      rules: {
        name: [
          { required: true, message: '请输入机器人名字', trigger: 'blur' },
        ],
        type: [
          { required: true, message: '请选择机器人类型', trigger: 'change' },
        ],
        LLM_id: [
          { required: true, message: '请选择 LLM ID', trigger: 'change' },
        ],
        chatprompt: [
          { required: true, message: '请输入提示词', trigger: 'blur' },
        ],
      },
      robotTypes: [
        { label: '文本机器人', value: 1 },
        { label: '图像机器人', value: 2 },
        { label: '音视频机器人', value: 3 },
      ],
      llmOptions: [
        { label: 'Kimi', value: 1 },
        { label: 'Deepseek', value: 2 },
        { label: 'Claude', value: 3 },
        { label: 'GPT-4', value: 4 },
      ],
    };
  },
  methods: {
    onSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          // 获取用户ID并检查
          const userId = this.$store.state.user?.userId;
          if (!userId) {
            this.$message.error('未获取到用户信息，请重新登录');
            return;
          }

          const payload = {
            name: this.form.name,
            type: this.form.type,
            llmId: this.form.LLM_id,
            chatPrompt: this.form.chatprompt,
            description: this.form.description,
            CreatorId: userId,
            price: this.form.price,
          };
          console.log('提交参数:', payload);
          this.apiCreateAgentForReview(payload);
        } else {
          console.log('表单验证失败');
          this.$message.warning('请完善表单信息后重试');
        }
      });
    },
    onCancel() {
      this.$router.go(-1); // 返回上一页
    },
    async apiCreateAgentForReview(payload) {
      try {
        const response = await createAgentForReview(payload);
        console.log('接口响应:', response);

        // 检查HTTP状态码和业务状态码
        const isSuccess =
          response.status === 200 &&
          (response.data.code === 200 || response.data.success);

        if (isSuccess) {
          this.$message.success('创建机器人成功，等待审核');
          // 审核提交成功后，后端返回 auditId
          const auditId = response.data.auditId;
          if (auditId) {
            // 可跳转到审核进度页或首页
            this.$router.push({ name: 'Home' });
          } else {
            this.$message.warning('未获取到审核ID');
          }
        } else {
          const errorMsg = response.data?.message || '创建失败，服务器返回异常';
          this.$message.error(`创建失败: ${errorMsg}`);
        }
      } catch (error) {
        // 详细打印错误信息
        console.error('创建机器人错误详情:', error);
        console.error('错误响应数据:', error.response?.data);
        console.error('错误状态码:', error.response?.status);

        // 用户友好提示
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          '网络错误，请稍后重试';
        this.$message.error(`创建失败: ${errorMsg}`);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins.scss' as *;
@use '@/assets/styles/variables.scss' as *;

// 知乎风格基础样式
.create-robot {
  width: 100%;
  min-height: 100vh;
  background-color: $background-color;
  padding: 40px 20px;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
}

// 表单卡片样式，与对话历史页面保持一致
.creat-robot-form {
  width: 100%;
  max-width: 1000px;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: $box-shadow-light;
  border: 1px solid $border-color;
}

// 表单标题区域
.form-header {
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid $border-color;

  .form-title {
    font-size: 1.5rem;
    color: $text-color;
    font-weight: 600;
    margin-bottom: 5px;
  }

  .form-subtitle {
    color: $text-color;
    font-size: 0.9rem;
  }
}

// 表单项样式调整
::v-deep .el-form-item {
  margin-bottom: 20px;

  &.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 30px;
    padding-top: 15px;
    border-top: 1px solid $border-color;
  }
}

::v-deep .el-form-item__label {
  color: $text-color;
  font-weight: 500;
  font-size: 14px;
}

// 输入框样式
.custom-input,
.custom-select {
  width: 100%;

  ::v-deep .el-input__inner,
  ::v-deep .el-select__input {
    border-radius: 6px;
    border: 1px solid $border-color;
    padding: 10px 15px;
    font-size: 14px;
    transition: border-color 0.3s;

    &:focus {
      border-color: $accent-color;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
    }
  }

  // 下拉框样式
  ::v-deep .el-select-dropdown {
    border-radius: 6px;
    box-shadow: $box-shadow-medium;
  }
}

// 按钮样式，与对话历史页面保持一致
.cancel-button {
  background: white;
  color: $text-color;
  border: 1px solid $border-color;
  border-radius: 6px;
  padding: 8px 20px;

  &:hover {
    background: #f5f5f5; /* 使用具体颜色值替代未定义的变量 */
    color: $text-color;
    border-color: $border-color;
  }
}

.submit-button {
  background: $accent-color;
  color: white;
  border: 1px solid $accent-color;
  border-radius: 6px;
  padding: 8px 20px;

  &:hover {
    background: $accent-hover-color;
    border-color: $accent-hover-color;
  }
}

// 响应式调整
@media (max-width: 768px) {
  .create-robot {
    padding: 20px 10px;
  }

  .creat-robot-form {
    padding: 20px 15px;
  }

  ::v-deep .el-form-item__label {
    width: 100px;
  }

  .form-actions {
    flex-direction: column;
    gap: 10px;

    .el-button {
      width: 100%;
    }
  }
}
</style>
