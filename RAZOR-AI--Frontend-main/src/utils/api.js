// src/utils/api.js
//api.js 文件用于封装 API 请求，方便在项目中进行统一管理和调用。
import axios from 'axios';
import MyStorage from './storage'; // 引入 Storage 工具类

const api = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

const adminApi = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:8000',
  timeout: 5000,
});

// 为adminApi添加请求拦截器
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
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('No response received:', error.request);
      return Promise.reject({
        code: 'NETWORK_ERROR',
        message: '网络连接失败，请检查后端服务是否正常运行',
      });
    } else {
      // 请求配置错误
      console.error('Request setup error:', error.message);
      return Promise.reject({
        code: 'REQUEST_ERROR',
        message: '请求配置错误: ' + error.message,
      });
    }
  }
);

// API 请求方法
export const login = (payload) =>
  api.post('/user/login', payload, {
    headers: { skipAuth: true }, // 跳过 Authorization 头
  });

export const register = (payload) =>
  api.post('/user/register', payload, {
    headers: { skipAuth: true }, // 跳过 Authorization 头
  });

// 获取用户信息
export const getUserInfo = (userId) => api.get(`/user/${userId}`);

// 更新用户信息
export const updateUserInfo = (userId, payload) =>
  api.put(`/user/${userId}`, payload);

// 改名专用接口 (使用后端的专门改名接口，包含重名检查)
export const changeUsername = (userId, newUsername, password) =>
  api.post(`/user/change-username/${userId}`, {
    NewUsername: newUsername,
    Password: password,
  });

// 获取用户积分余额
export const getUserPoints = () => api.get('/points/balance');

// 获取积分历史记录
export const getPointsHistory = (pointsSource, page = 1, pageSize = 20) => {
  // 如果有积分来源筛选（且不是0，0表示全部），使用专门的接口
  if (pointsSource && pointsSource !== 0 && pointsSource !== '') {
    return api.get(`/points/history/by-source`, {
      params: {
        pointsSource,
        page,
        pageSize,
      },
    });
  }
  // 否则获取所有积分历史
  return api.get(`/points/history`, {
    params: {
      page,
      pageSize,
    },
  });
};

// 获取积分统计信息
export const getPointsStats = () => api.get('/points/stats');

// 用户充值积分
export const rechargePoints = async (points, description = '用户充值积分') => {
  console.log('=== 充值API调用开始 ===');
  console.log('发送充值请求:', { points, description });
  console.log('请求URL:', '/points/recharge');

  const token = MyStorage.get('token');
  console.log('Token状态:', token ? '存在' : '不存在');
  console.log(
    'Token前50字符:',
    token ? token.substring(0, 50) + '...' : 'null'
  );

  const requestData = {
    Points: points,
    Description: description,
  };
  console.log('请求数据:', requestData);

  try {
    const response = await api.post('/points/recharge', requestData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('=== 充值API响应成功 ===');
    console.log('响应状态:', response.status);
    console.log('充值API响应成功:', response.data);
    return response;
  } catch (error) {
    console.log('=== 充值API请求失败 ===');
    console.error('充值API请求失败:', error);
    console.error('错误详情:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: error.config,
    });

    // 添加更详细的错误信息
    if (error.response) {
      console.error(
        '收到错误响应:',
        error.response.status,
        error.response.statusText
      );
      console.error('错误响应数据:', error.response.data);
    } else if (error.request) {
      console.error('请求发送失败，没有收到响应:', error.request);
    } else {
      console.error('请求配置错误:', error.message);
    }
    throw error;
  }
};

// 删除已撤销的管理员添加积分接口
// export const addPointsForUser = (userId, points, pointsSource, description) =>
//   api.post('/api/admin/points/add', {
//     userId,
//     points,
//     pointsSource,
//     description,
//   });

// 检查积分是否足够
export const checkPointsEnough = (requiredPoints) =>
  api.post('/points/check', { requiredPoints });

// 管理员增加积分
export const addUserPoints = (
  userId,
  points,
  actionType,
  description,
  relatedId = null
) =>
  api.post('/points/add', {
    userId,
    points,
    actionType,
    description,
    relatedId,
  });

// 管理员扣除积分
export const deductUserPoints = (
  userId,
  points,
  actionType,
  description,
  relatedId = null
) =>
  api.post('/points/deduct', {
    userId,
    points,
    actionType,
    description,
    relatedId,
  });

export const adminLogin = (data) => {
  return adminApi.post('/admin/login', data);
};

export const approveRobot = (robotId) => {
  return adminApi.post(`/admin/robots/${robotId}/approve`);
};

export const rejectRobot = (robotId) => {
  return adminApi.post(`/admin/robots/${robotId}/reject`);
};

export const getPendingRobots = () => {
  return adminApi.get('/admin/robots/pending');
};

export const getFeedbacks = () => {
  return adminApi.get('/admin/feedbacks');
};

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

export const searchAgent = (searchload) =>
  api.post(`/market/search`, searchload); // 跳过 Authorization 头

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

// 获取机器人订阅数量
export const getSubscriptionCnt = (agentId) =>
  api.get(`/market/subscription/count/${agentId}`, {
    headers: { skipAuth: true },
  });

// 获取机器人评论
export const getAgentComment = (agentId) =>
  api.get(`/market/feedback/${agentId}`, {
    headers: { skipAuth: true },
  });

// 发布机器人评论
export const sendAgentComment = (payload) =>
  api.post('/market/feedback', payload, {
    headers: { skipAuth: false },
  });

// 删除机器人评论
export const deleteAgentComment = (feedbackId) =>
  api.delete(`/market/feedback/${feedbackId}`, {
    headers: { skipAuth: false },
  });

//根据机器人类型分页
export const getRobotsByType = (agentload) =>
  api.post(`/market/agents/by-type`, agentload, {
    headers: { skipAuth: true },
  });

//获取推荐机器人
export const getRecommendedRobots = (userId) =>
  api.post(`/agent/recommend`, userId, {
    headers: { skipAuth: true },
  });

// ====================== 社区模块 API ======================
// 创建帖子
export const createCommunityPost = (payload) =>
  api.post('/community/posts', payload, {
    headers: { skipAuth: false },
  });

// 修改帖子
export const updateCommunityPost = (postId, payload) =>
  api.put(`/community/posts/${postId}`, payload, {
    headers: { skipAuth: false },
  });

// 删除帖子
export const deleteCommunityPost = (postId, payload) =>
  api.delete(`/community/posts/${postId}`, {
    data: payload,
    headers: { skipAuth: false },
  });

// 获取单个帖子详情
export const getCommunityPostDetail = (postId) =>
  api.get(`/community/posts/${postId}`, {
    headers: { skipAuth: true },
  });

// 获取指定用户的所有帖子
export const getCommunityUserPosts = (userId) =>
  api.get(`/community/posts/user/${userId}`, {
    headers: { skipAuth: false },
  });

// 发布评论
export const createCommunityComment = (postId, payload) =>
  api.post(`/community/posts/${postId}/comments`, payload, {
    headers: { skipAuth: false },
  });

// 删除评论
export const deleteCommunityComment = (commentId, payload) =>
  api.delete(`/community/comments/${commentId}`, {
    data: payload, // DELETE 请求携带请求体
    headers: { skipAuth: false },
  });

// 获取帖子的所有评论
export const getCommunityPostComments = (postId) =>
  api.get(`/community/posts/${postId}/comments`, {
    headers: { skipAuth: true },
  });

// 获取帖子评论数
export const getCommunityCommentCount = (postId) =>
  api.get(`/community/posts/${postId}/comments/count`, {
    headers: { skipAuth: true },
  });

// 点赞帖子
export const likeCommunityPost = (postId, payload) =>
  api.post(`/community/posts/${postId}/like`, payload, {
    headers: { skipAuth: false },
  });

// 取消点赞
export const cancelLikeCommunityPost = (postId, payload) =>
  api.delete(`/community/posts/${postId}/like`, {
    data: payload,
    headers: { skipAuth: false },
  });

// 获取帖子点赞数
export const getCommunityLikeCount = (postId) =>
  api.get(`/community/posts/${postId}/likes/count`, {
    headers: { skipAuth: true },
  });

// 获取推荐的最新帖子
export const getRecommendedPosts = (count) =>
  api.post(
    '/community/posts/recommend',
    { Count: count },
    {
      headers: { skipAuth: true },
    }
  );
