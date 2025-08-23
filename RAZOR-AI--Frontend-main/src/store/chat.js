/*
 *store/chat.js:会话管理
 *功能: 管理用户创建的会话、历史会话记录和消息。
 *接口:
 *创建会话 (/agent/user/chat/creation)
 *发送消息 (/agent/user/chat/<int:chat_id>)
 *获取所有会话 (/agent/user/chat/all)
 *获取某个会话的历史消息 (/agent/user/chat/<int:chat_id>)
 */

import {
  fetchAllChats as apifetchAllChats,
  createChat as apiCreateChat,
} from '../utils/api';

const state = {
  chats: [],
  currentChat: null,
};

const mutations = {
  SET_CHATS(state, chats) {
    state.chats = chats;
  },
  SET_CURRENT_CHAT(state, chat) {
    state.currentChat = chat;
  },
};

const getters = {
  chats: (state) => state.chats,
  currentChat: (state) => state.currentChat,
};

const actions = {
  async fetchChats({ commit }, payload) {
    try {
      const response = await apifetchAllChats(payload);
      if (response.status === 200) {
        commit('SET_CHATS', response.data);
        return { success: true, message: '获取会话列表成功' };
      } else {
        throw new Error(`API 响应异常，状态码: ${response.status}`);
      }
    } catch (error) {
      console.log('Error occurred in chat.js:', error);
      return { success: false, message: error.message };
    }
  },

  getChatByID({ commit, state }, chatid) {
    for (const chat of state.chats) {
      if (Number(chat.id) === Number(chatid)) {
        commit('SET_CURRENT_CHAT', chat);
        return chat;
      }
    }
    return null;
  },

  async createChat({ commit }, chatData) {
    try {
      const response = await apiCreateChat(chatData);

      if (response.status === 200 && response.data.chat_id) {
        commit('SET_CURRENT_CHAT', response.data);

        return {
          success: true,
          chatId: response.data.chat_id,
          message: response.data.message || '会话创建成功',
        };
      } else {
        return {
          success: false,
          message: response.data.message || '创建会话失败',
        };
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        return { success: false, message: '无有效订阅，无法创建会话' };
      }
      return { success: false, message: error.message || '请求失败' };
    }
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
