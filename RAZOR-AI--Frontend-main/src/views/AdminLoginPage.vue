<template>
  <div class="admin-login">
    <el-dialog :visible.sync="showModal" title="管理员登录" width="30%" center>
      <el-form @submit.native.prevent="login">
        <el-form-item label="用户名">
          <el-input v-model="username" type="text" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="password" type="password" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit" style="width: 100%">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AdminLoginPage',
  data() {
    return {
      username: '',
      password: '',
      showModal: true,
    };
  },
  methods: {
    login() {
      this.$router.push('/admin');
    },
  },
};
</script>

<style scoped>
.admin-login {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
