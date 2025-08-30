// ====================== 外部通知相关 API ======================
/**
 * 发送外部通知（单个用户）
 * @param {Object} payload { userId: number, message: string }
 * @returns Promise
 */
export const sendExternalNotification = (payload) => {
  // payload: { userId, message }
  return api.post('/external-notifications/create', payload);
};

/**
 * 批量发送外部通知
 * @param {Object} payload { userIds: number[], message: string }
 * @returns Promise
 */
export const sendBulkExternalNotification = (payload) => {
  // payload: { userIds, message }
  return api.post('/external-notifications/create-bulk', payload);
};
// src/utils/api.js
//api.js 文件用于封装 API 请求，方便在项目中进行统一管理和调用。
import axios from 'axios';
import MyStorage from './storage'; // 引入 Storage 工具类

const api = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

const adminApi = axios.create({
  baseURL: '/api',
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

      // 处理token过期（401未授权）
      if (status === 401) {
        // 清除本地存储的token和用户信息
        MyStorage.remove('token');
        MyStorage.remove('user_id');
        MyStorage.remove('userName');

        // 如果在浏览器环境中，使用事件通知主应用处理登录状态
        if (typeof window !== 'undefined') {
          // 不直接跳转，而是触发全局事件让主应用处理
          window.dispatchEvent(new CustomEvent('tokenExpired'));
        }

        return Promise.reject({
          code: 401,
          message: 'token已过期，请重新登录',
        });
      }

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

// 普通用户登出
export const logout = (userId) =>
  api.post(
    '/user/logout',
    { UserId: userId },
    {
      headers: { skipAuth: false }, // 需要 Authorization 头
    }
  );

// 获取用户信息
export const getUserInfo = (userId) => api.get(`/user/${userId}`);

// 更新用户信息
export const updateUserInfo = (userId, payload) =>
  api.post(`/user/update-info/${userId}`, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

// 获取用户积分余额
export const getUserPoints = () => api.get('/points/balance');

// 获取积分历史记录
export const getPointsHistory = (page = 1, pageSize = 20) =>
  api.get(`/points/history?page=${page}&pageSize=${pageSize}`);

// 获取积分统计信息
export const getPointsStats = () => api.get('/points/stats');

// 用户充值积分
export const rechargePoints = (points, description = '用户充值积分') =>
  api.post('/points/recharge', { points, description });

// 获取充值历史记录
export const getRechargeHistory = (page = 1, pageSize = 20) =>
  api.get(`/points/recharge-history?page=${page}&pageSize=${pageSize}`);

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

// 管理员注册
export const adminRegister = (payload) => {
  return adminApi.post('/api/admin/register', payload);
};

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

// 提交机器人审核（新版接口）
export const createAgentForReview = (payload) =>
  adminApi.post('/admin/agent-review/submit', payload, {
    headers: { skipAuth: false },
  });

export const getFeedbacks = () => {
  return adminApi.get('/admin/feedbacks');
};

// 获取待审核管理员列表
export const getPendingAdmins = () => {
  return adminApi.get('/api/admin/pending');
};

// ====================== 帖子举报相关（管理员）API ======================

// 管理员获取举报列表
export const getPostReportList = (params = {}) =>
  adminApi.get('/api/PostReport/list', { params });

// 管理员获取举报统计信息
export const getPostReportStats = () => adminApi.get('/api/PostReport/stats');

// 管理员审核举报
export const reviewPostReport = ({ reportId, status, reviewComment = '' }) =>
  adminApi.post(`/api/PostReport/review/${reportId}`, {
    status,
    reviewComment,
  });

// 管理员获取举报详情
export const getPostReportDetail = (reportId) =>
  adminApi.get(`/api/PostReport/${reportId}`);

// 管理员获取待审核的帖子列表（AUDIT表）
export const getPendingPostAudits = (params = {}) =>
  adminApi.get('/api/PostReport/pending-audits', { params });

// 管理员审核接口
// status: 1=通过, 2=拒绝
export function reviewAdmin({ adminId, status, reviewComment = '' }) {
  if (status === 1) {
    // 通过
    return adminApi.post(`/api/Admin/review/${adminId}/approve`, {
      reviewComment,
    });
  } else if (status === 2) {
    // 拒绝
    return adminApi.post(`/api/Admin/review/${adminId}/reject`, {
      reviewComment,
    });
  } else {
    return Promise.reject({ code: 400, message: '未知的审核操作' });
  }
}
// 获取待审核管理员列表
export const markFeedbackAsRead = (feedbackId) => {
  return adminApi.post(`/admin/feedbacks/${feedbackId}/read`);
};

// 获取所有用户反馈（平台全部反馈）
export const fetchAllFeedbacks = () => {
  return adminApi.get('/feedback/all', {
    headers: { Accept: 'application/json', skipAuth: true },
  });
};

// 获取最近用户反馈（仅取最近3条）
export const fetchRecentFeedbacks = () => {
  return adminApi
    .get('/feedback/all', {
      headers: { Accept: 'application/json', skipAuth: true },
    })
    .then((res) => {
      // 只返回前两条
      if (res && res.data && Array.isArray(res.data.feedbacks)) {
        return {
          ...res,
          data: { ...res.data, feedbacks: res.data.feedbacks.slice(0, 3) },
        };
      }
      return res;
    });
};

// 获取待审核机器人详情（通过审核记录ID）
export const getPendingAgentDetail = (auditId) => {
  return adminApi.get(`/admin/agent-review/pending/${auditId}`);
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
  console.log('chat_id in fetchChatDetailedHistory api.js:', chat_id);
  const response = await api.get(`/agent/user/chat/${chat_id}`, {
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

// 启用机器人
export const startRobots = () =>
  api.post(
    '/market/start',
    {},
    {
      headers: { skipAuth: false },
    }
  );

// 审核机器人
export const reviewAI = (payload) =>
  adminApi.post('/admin/agent-review/submit', payload, {
    headers: { skipAuth: false },
  });

// 创建会话
export const createChat = (payload) =>
  api.post('/agent/user/chat/creation', payload, {
    headers: { skipAuth: false },
  });

// 发送消息
export const sendMessage = (payload) =>
  api.post(
    `/agent/user/chat/${payload.chat_id}`,
    { question: payload.content },
    {
      headers: { skipAuth: false },
      timeout: 5000, // 设置 5 秒超时时间
    }
  );

// 保存聊天记录
export const saveChatHistory = (chatId) =>
  api.post(`/agent/chat/save/${chatId.chat_id}`, null, {
    headers: { skipAuth: false },
  });

// 关闭聊天（仅内存中移除）
export const closeChat = (chatId) =>
  api.delete(`/agent/user/chat/${chatId.chat_id}`, {
    headers: { skipAuth: false },
  });

// 永久删除会话
export const deleteChat = (chat_id) =>
  api.delete(`/agent/user/chat/delete/${chat_id}`, {
    headers: { skipAuth: false },
  });

// 获取管理员信息
export const getAdminInfo = () => {
  return adminApi.get('/api/admin/info');
};

// 根据用户ID获取该用户所有反馈
export const fetchUserFeedbacks = (userId) => {
  return adminApi.get(`/feedback/user/${userId}`, {
    headers: { Accept: 'application/json', skipAuth: true },
  });
};

// 更新用户反馈状态（如标记为已处理）
export const updateFeedbackState = (feedbackId) => {
  return adminApi.put('/feedback/update-state', { FeedbackId: feedbackId });
};

// 发送用户反馈
export const sendUserFeedback = (feedbackload) =>
  api.post('/user/feedback', feedbackload, {
    headers: { skipAuth: false },
  });

// 根据用户id获取对应通知
export const getUserNotifications = (userId) =>
  api.get(`/notifications/unread/${userId}`);

// 向用户发送审核结果通知
export const sendReviewNotification = (payload) => {
  return api.post('/notifications/create', payload);
};

// 根据通知id将通知标记为已读
export const markNotificationAsRead = (notificationId) =>
  api.put(`/notifications/${notificationId}/read`, {
    headers: { skipAuth: false },
  });

// 根据通知id和用户id删除通知
export const deleteNotificationById = ({ id, userId }) =>
  api.delete(`/notifications/${id}/user/${userId}`);

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
// 点赞评论
// POST http://localhost:5000/community/comments/{commentId}/like
// payload: { userId }
export const likeCommunityComment = (commentId, payload) =>
  api.post(`/community/comments/${commentId}/like`, payload, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      skipAuth: false,
    },
  });

// 取消点赞评论
// DELETE http://localhost:5000/community/comments/{commentId}/like
// payload: { userId }
export const cancelLikeCommunityComment = (commentId, payload) =>
  api.delete(`/community/comments/${commentId}/like`, {
    data: payload,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      skipAuth: false,
    },
  });

// 获取评论点赞数量
// GET http://localhost:5000/community/comments/{commentId}/likes/count
export const getCommentLikeCount = (commentId) =>
  api.get(`/community/comments/${commentId}/likes/count`, {
    headers: {
      Accept: 'application/json',
      skipAuth: false,
    },
  });
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
// 创建评论/回复评论
// payload: { userId, commentContent, replyId? }
export const createCommunityComment = (postId, payload) =>
  api.post(`/community/posts/${postId}/comments`, payload, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      skipAuth: false,
    },
  });

// 删除评论
// 删除评论（逻辑删除）
// payload: { userId }
export const deleteCommunityComment = (commentId, payload) =>
  api.delete(`/community/comments/${commentId}`, {
    data: payload,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      skipAuth: false,
    },
  });

// 举报评论
export const reportCommunityComment = (reportload) =>
  api.post(`/api/CommentReport/create`, reportload, {
    headers: { skipAuth: false },
  });

// 举报帖子
export const reportCommunityPost = (reportload) =>
  api.post(`/api/PostReport/create`, reportload, {
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

// 获取某个评论的所有回复
export const getCommentReplies = (commentId) =>
  api.get(`/community/comments/${commentId}/replies`, {
    headers: {
      Accept: 'application/json',
      skipAuth: true,
    },
  });

// 获取被回复评论的发布者信息（@xxx）
export const getRepliedCommentAuthor = (replyCommentId) =>
  api.get(`/community/comments/${replyCommentId}/replied-author`, {
    headers: {
      Accept: 'application/json',
      skipAuth: true,
    },
  });

// 通过评论ID获取评论发布者的名字
export const getCommentAuthorName = (commentId) =>
  api.get(`/community/comments/${commentId}/author/name`, {
    headers: {
      Accept: 'application/json',
      skipAuth: true,
    },
  });

// 检查用户是否点赞了特定评论
// 参数：commentId, userId
// 返回：{ commentId, userId, isLiked, likeId }
export const checkUserLikedComment = (commentId, userId) =>
  api.get(`/community/comments/${commentId}/like/status/${userId}`, {
    headers: {
      Accept: 'application/json',
    },
  });
