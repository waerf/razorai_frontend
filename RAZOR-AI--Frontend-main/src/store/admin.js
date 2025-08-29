import { adminLogin as apiAdminLogin } from '../utils/api';
import Storage from '../utils/storage';

const state = {
  // 审核机器人状态变更通知
  robotReviewStatusChanged: false,
  adminToken: Storage.get('admin_token'),
  adminId: Storage.get('admin_id'),
  adminName: Storage.get('admin_name'),
  isAdminLoggedIn: !!Storage.get('admin_token'),
};

const mutations = {
  SET_ROBOT_REVIEW_STATUS_CHANGED(state, changed) {
    state.robotReviewStatusChanged = changed;
  },
  SET_ADMIN_INFO(state, { token, adminId, adminName }) {
    state.adminToken = token;
    state.adminId = adminId;
    state.adminName = adminName;
    state.isAdminLoggedIn = !!token;

    const TTL = 7 * 24 * 60 * 60 * 1000; // 7天过期
    Storage.set('admin_token', token, TTL);
    Storage.set('admin_id', adminId, TTL);
    Storage.set('admin_name', adminName, TTL);
  },
  ADMIN_LOGOUT(state) {
    state.adminToken = null;
    state.adminId = null;
    state.adminName = null;
    state.isAdminLoggedIn = false;
    Storage.remove('admin_token');
    Storage.remove('admin_id');
    Storage.remove('admin_name');
  },
};

const actions = {
  setRobotReviewStatusChanged({ commit }, changed) {
    commit('SET_ROBOT_REVIEW_STATUS_CHANGED', changed);
  },
  async adminLogin({ commit }, payload) {
    try {
      const response = await apiAdminLogin(payload);
      const { token, adminId, adminName } = response.data;
      commit('SET_ADMIN_INFO', { token, adminId, adminName });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  adminLogout({ commit }) {
    commit('ADMIN_LOGOUT');
    return { success: true };
  },
};

const getters = {
  robotReviewStatusChanged: (state) => state.robotReviewStatusChanged,
  isAdminLoggedIn: (state) => state.isAdminLoggedIn,
  adminId: (state) => state.adminId,
  adminName: (state) => state.adminName,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
