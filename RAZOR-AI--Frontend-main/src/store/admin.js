import { adminLogin as apiAdminLogin } from '../utils/api';
import Storage from '../utils/storage';

const state = {
  adminToken: Storage.get('admin_token'),
  adminId: Storage.get('admin_id'),
  adminName: Storage.get('admin_name'),
  isAdminLoggedIn: !!Storage.get('admin_token'),
};

const mutations = {
  SET_ADMIN_INFO(state, { token, adminId, adminName }) {
    state.adminToken = token;
    state.adminId = adminId;
    state.adminName = adminName;
    state.isAdminLoggedIn = !!token;

    const TTL = 1 * 24 * 60 * 60 * 1000; // 1天过期
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
