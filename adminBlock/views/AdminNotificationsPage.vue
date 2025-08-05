<template>
  <div class="admin-notifications">
    <h2>通知管理</h2>
    <div class="notification-list">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-item"
      >
        <h3>{{ notification.title }}</h3>
        <p>{{ notification.content }}</p>
        <div class="meta">
          <span>发送时间: {{ notification.time }}</span>
          <span>状态: {{ notification.status }}</span>
        </div>
        <div class="actions">
          <button @click="sendNotification(notification.id)">发送</button>
          <button @click="editNotification(notification.id)">编辑</button>
          <button @click="deleteNotification(notification.id)">删除</button>
        </div>
      </div>
    </div>
    <div class="add-notification">
      <h3>添加新通知</h3>
      <input v-model="newNotification.title" placeholder="标题" />
      <textarea v-model="newNotification.content" placeholder="内容"></textarea>
      <button @click="addNotification">添加</button>
    </div>
  </div>
</template>

<script>
import {
  getNotifications,
  sendNotification,
  createNotification,
  deleteNotification,
} from '@/utils/api';

export default {
  name: 'AdminNotificationsPage',
  data() {
    return {
      notifications: [],
      newNotification: {
        title: '',
        content: '',
      },
    };
  },
  async created() {
    await this.fetchNotifications();
  },
  methods: {
    async fetchNotifications() {
      try {
        const response = await getNotifications();
        this.notifications = response.data;
      } catch (error) {
        console.error('获取通知列表失败:', error);
      }
    },
    async sendNotification(id) {
      try {
        await sendNotification(id);
        this.$message.success('发送通知成功');
        await this.fetchNotifications();
      } catch (error) {
        console.error('发送通知失败:', error);
        this.$message.error('发送通知失败');
      }
    },
    async deleteNotification(id) {
      try {
        await deleteNotification(id);
        this.$message.success('删除通知成功');
        await this.fetchNotifications();
      } catch (error) {
        console.error('删除通知失败:', error);
        this.$message.error('删除通知失败');
      }
    },
    async addNotification() {
      try {
        if (!this.newNotification.title || !this.newNotification.content) {
          this.$message.warning('请填写标题和内容');
          return;
        }
        await createNotification(this.newNotification);
        this.$message.success('添加通知成功');
        this.newNotification = { title: '', content: '' };
        await this.fetchNotifications();
      } catch (error) {
        console.error('添加通知失败:', error);
        this.$message.error('添加通知失败');
      }
    },
  },
};
</script>

<style scoped>
.admin-notifications {
  padding: 20px;
}
.notification-list {
  margin-top: 20px;
}
.notification-item {
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
}
.meta {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
  color: #666;
  font-size: 14px;
}
.actions {
  margin-top: 10px;
}
button {
  margin-right: 10px;
  padding: 5px 10px;
}
.add-notification {
  margin-top: 30px;
  padding: 15px;
  border: 1px dashed #ccc;
  border-radius: 4px;
}
input,
textarea {
  display: block;
  width: 100%;
  margin: 10px 0;
  padding: 8px;
}
textarea {
  height: 100px;
}
</style>
