// src/store/user.js
import { login as apiLogin } from '../utils/api'; // 引入 API 请求
import { register as apiRegister } from '../utils/api'; // 引入 API 请求
import { logout as apiLogout } from '../utils/api'; // 引入登出 API 请求
import Storage from '../utils/storage'; // 引入 Storage 工具类
const state = {
  token: Storage.get('token'),
  userId: Storage.get('user_id'),
  userName: Storage.get('userName'),
  isLoggedIn: !!Storage.get('token'),
};

// 检查token是否过期的辅助函数
const isTokenExpired = () => {
  const token = Storage.get('token');
  if (!token) return true;

  // 检查Storage是否支持过期时间检查
  const tokenData = Storage.getRaw('token');
  if (tokenData && tokenData.expiry) {
    return Date.now() > tokenData.expiry;
  }

  return false;
};

const mutations = {
  SET_USER_INFO(state, { token, userId, username }) {
    state.token = token;
    state.userId = userId;
    state.userName = username;
    state.isLoggedIn = !!token;

    // 设置过期时间为 7 天（与后端一致）（单位：毫秒）
    const TTL = 7 * 24 * 60 * 60 * 1000;
    Storage.set('token', token, TTL);
    Storage.set('user_id', userId, TTL);
    Storage.set('userName', username, TTL);
  },
  LOGOUT(state) {
    state.token = null;
    state.userId = null;
    state.userName = null;
    state.isLoggedIn = false;

    Storage.remove('token');
    Storage.remove('user_id');
    Storage.remove('userName');
  },

  REGISTER() {}, // 注册逻辑 commit 一个空的函数
};

const actions = {
  // 登录逻辑
  async login({ commit }, payload) {
    try {
      console.log('payload:', payload);
      const response = await apiLogin(payload); // 调用登录接口 response是来自api.js的login函数的返回值
      console.log('登录API响应:', response.data);
      const { token, message, username, user_id } = response.data; // 从响应中解构出 token、user_id 和userName
      commit('SET_USER_INFO', { token, userId: user_id, username }); // 保存后端返回的真实 userId
      return { success: true, message }; // 返回成功信息给LoginForm组件
    } catch (error) {
      console.log('Error occurred in user.js:', error);
      return { success: false, message: error.message };
    }
  },

  // 退出登录逻辑
  async logout({ commit, state }) {
    try {
      // 如果有userId，调用后端logout接口
      if (state.userId) {
        const response = await apiLogout(state.userId);
        console.log('后端登出响应:', response.data);
      }

      // 清除本地状态和存储
      commit('LOGOUT');
      localStorage.clear(); // 清除所有缓存

      return { success: true, message: '成功退出登录' }; // 返回成功信息
    } catch (error) {
      console.error('登出时发生错误:', error);

      // 即使后端调用失败，也要清除本地状态
      commit('LOGOUT');
      localStorage.clear();

      // 根据错误类型返回不同的消息
      let errorMessage = '登出成功（本地清除）';
      if (error.code === 'NETWORK_ERROR') {
        errorMessage = '网络错误，但已成功清除本地登录状态';
      } else if (error.message) {
        errorMessage = `登出警告: ${error.message}，但已清除本地状态`;
      }

      return { success: true, message: errorMessage };
    }
  },

  // 注册逻辑
  async register({ commit }, payload) {
    try {
      console.log('Vuex register action 收到payload:', payload);
      const response = await apiRegister(payload);
      console.log('API注册响应:', response);

      if (response && response.data) {
        const { user_id, message } = response.data;
        console.log('解析的响应数据:', { user_id, message });
        commit('REGISTER', {}); // 进行一个空的commit，否则payload不会被提交
        return { success: true, message, user_id }; // 返回成功信息给RegisterPage
      } else {
        console.error('响应格式异常:', response);
        return { success: false, message: '服务器响应格式异常' };
      }
    } catch (error) {
      console.log('Vuex register action 发生错误:', error);
      console.log('错误类型:', typeof error);
      console.log('错误详情:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });

      let errorMessage = '注册失败';
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, message: errorMessage };
    }
  },

  // 检查token有效性
  checkTokenValidity({ commit, state }) {
    if (!state.token) {
      commit('LOGOUT');
      return false;
    }

    // 检查本地存储的token是否过期
    if (isTokenExpired()) {
      console.log('Token已过期，清除本地状态');
      commit('LOGOUT');
      Storage.remove('token');
      Storage.remove('user_id');
      Storage.remove('userName');
      return false;
    }

    return true;
  },

  // 自动登出（token过期时调用）
  autoLogout({ commit }) {
    console.log('自动登出：token已过期');
    commit('LOGOUT');
    Storage.remove('token');
    Storage.remove('user_id');
    Storage.remove('userName');
  },
};

const getters = {
  isLoggedIn: (state) => state.isLoggedIn,
  userId: (state) => state.userId,
  userName: (state) => state.userName,
};

export default {
  namespaced: true, // 启动命名空间
  state,
  mutations,
  actions,
  getters,
};
