// src/utils/api.js
//api.js 文件用于封装 API 请求，方便在项目中进行统一管理和调用。

import axios from 'axios';
import MyStorage from './storage'; // 引入 Storage 工具类

// 统一管理后端 API 地址
const BASE_API_URL = 'http://localhost:5253';
const BASE_ADMIN_API_URL = 'http://localhost:5253';

const api = axios.create({
  baseURL: BASE_API_URL,
  timeout: 10000,
});

const adminApi = axios.create({
  baseURL: BASE_ADMIN_API_URL,
  timeout: 10000,
});

// 为adminApi添加请求拦截器
// 管理员登出
export const adminLogout = () => {
  return adminApi.post('api/admin/logout');
};
adminApi.interceptors.request.use(
  (config) => {
    const token = MyStorage.get('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    if (config.method === 'post' && !config.headers.get('Content-Type')) {
      config.headers.set('Content-Type', 'application/json');
    }
    const skipAuth = config.headers.get('skipAuth');
    if (!skipAuth) {
      const token = MyStorage.get('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.warn('Token is missing; Authorization header not set.');
      }
    }
    // 移除自定义标志以免发送到服务器
    config.headers.delete('skipAuth');
    return config;
  },
  (error) => {
    return Promise.reject(error); // 请求错误直接返回
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => response, // 正常响应直接返回
  (error) => {
    // 处理错误响应
    if (error.response) {
      console.log('Error response in api.js:', error.response);
      const { status, data } = error.response;
      return Promise.reject({ code: status, message: data.message }); // 返回错误状态码和消息
    } else {
      return Promise.reject({ code: 500, message: '哈哈哈出错咯，debug咯' }); // 返回默认错误消息
    }
  }
);

// API 请求方法
// 修改管理员密码
export const changeAdminPassword = (payload) => {
  // payload: { oldPassword, newPassword }
  return adminApi.put('api/admin/password', payload);
};
export const login = (payload) =>
  api.post('/user/login', payload, {
    headers: { skipAuth: true }, // 跳过 Authorization 头
  });

export const register = (payload) =>
  api.post('/user/register', payload, {
    headers: { skipAuth: true }, // 跳过 Authorization 头
  });

export const adminLogin = (data) => {
  return adminApi.post('/api/admin/login', data);
};

export const approveRobot = (robotId) => {
  return adminApi.post(`/admin/robots/${robotId}/approve`);
};

export const rejectRobot = (robotId) => {
  return adminApi.post(`/admin/robots/${robotId}/reject`);
};

export const getPendingRobots = (params = {}) => {
  // params: { page, pageSize }
  return adminApi.get('/admin/agent-review/pending', {
    params,
  });
};

export const getFeedbacks = () => {
  return adminApi.get('/admin/feedbacks');
};

// 获取待审核管理员列表
export const getPendingAdmins = () => {
  return adminApi.get('/api/admin/pending');
};

// 管理员审核接口
export function reviewAdmin({ adminId, status, reviewComment = '' }) {
  return adminApi.post('/api/Admin/review', {
    adminId,
    status,
    reviewComment,
  });
}
// 获取待审核管理员列表
export const markFeedbackAsRead = (feedbackId) => {
  return adminApi.post(`/admin/feedbacks/${feedbackId}/read`);
};

export const deleteFeedback = (feedbackId) => {
  return adminApi.delete(`/admin/feedbacks/${feedbackId}`);
};

export const getNotifications = () => {
  return adminApi.get('/admin/notifications');
};

export const sendNotification = (notificationId) => {
  return adminApi.post(`/admin/notifications/${notificationId}/send`);
};

export const createNotification = (data) => {
  return adminApi.post('/admin/notifications', data);
};

export const deleteNotification = (notificationId) => {
  return adminApi.delete(`/admin/notifications/${notificationId}`);
};

export const fetchAllAgentsData = () =>
  api.get('/market', { headers: { skipAuth: true } }); // 跳过 Authorization 头

export const fetchAgentDetail = (agentId) =>
  api.get(`/market/agentdetail/${agentId}`, { headers: { skipAuth: true } }); // 跳过 Authorization 头

export const fetchUserSubscriptions = async (userId) => {
  const response = await api.get(`/market/user/subs/${userId}`, {
    headers: { skipAuth: false },
  });
  return response;
};

export const fetchChatDetailedHistory = async (chat_id) => {
  console.log('chat_id in api.js:', chat_id);
  const response = await api.get(`/agent/user/chat/${chat_id.chat_id}`, {
    headers: { skipAuth: false },
  });
  return response;
};

export const fetchAllChats = (user_id) =>
  api.post('/agent/user/chat/all', user_id, {
    headers: { skipAuth: false },
  });

export const subscribeAgent = (payload) =>
  api.post('/market/user/agent/subscribe', payload, {
    headers: { skipAuth: false },
  });

export const createAI = (payload) =>
  api.post('/agent/user/creation', payload, {
    headers: { skipAuth: false },
  });

export const createAgentPending = (payload) =>
  adminApi.post('/admin/agent-review/pending', payload, {
    headers: { skipAuth: false },
  });

export const createChat = (payload) =>
  api.post('/agent/user/chat/creation', payload, {
    headers: { skipAuth: false },
  });

export const sendMessage = (payload) =>
  api.post(
    `/agent/user/chat/${payload.chat_id}`,
    { question: payload.content },
    {
      headers: { skipAuth: false },
      timeout: 30000, // 设置 30 秒超时时间
    }
  );

export const saveChatHistory = (chatId) =>
  api.post(`/agent/chat/save/${chatId.chat_id}`, {
    headers: { skipAuth: true },
  });

export const closeChat = (chatId) =>
  api.delete(`/agent/user/chat/${chatId.chat_id}`, {
    headers: { skipAuth: false },
  });

export const deleteChat = (chatId) =>
  api.delete(`/agent/user/chat/delete/${chatId.chat_id}`, {
    headers: { skipAuth: false },
  });

// 获取管理员信息
export const getAdminInfo = () => {
  return adminApi.get('/api/admin/info');
};
