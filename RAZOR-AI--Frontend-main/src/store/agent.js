/*
AI 机器人管理 (store/agent.js)
    功能: 管理 AI 机器人的信息。
    接口:
        获取所有 AI 机器人信息 (/market)
        获取某个机器人的详细信息 (/market/agentdetail/<int:agent_id>)
        创建 AI 机器人 (/agent/user/creation)
*/
import { fetchAllAgentsData as apifetchAllAgentsData } from '../utils/api'; // 引入 API 请求
import { fetchAgentDetail as apifetchAgentDetail } from '../utils/api'; // 引入 API 请求
import { fetchUserSubscriptions as apifetchUserSubscriptions } from '../utils/api';
const state = {
  recommendedRobots: [], // 推荐机器人 (type=1)
  rolePlayRobots: [], // 角色扮演机器人 (type=1)
  codingRobots: [], // 代码编程机器人 (type=2)
  paperRobots: [], // 论文修改机器人 (type=3)
  selectedAgent: null,
  haveSubscribed: [],
};

const getters = {
  allAgents: (state) => {
    return state.recommendedRobots.concat(
      state.rolePlayRobots,
      state.codingRobots,
      state.paperRobots
    );
  },
  recommendedRobots: (state) => {
    return state.recommendedRobots;
  },
  rolePlayRobots: (state) => {
    return state.rolePlayRobots;
  },
  codingRobots: (state) => {
    return state.codingRobots;
  },
  paperRobots: (state) => {
    return state.paperRobots;
  },
  selectedAgent: (state) => {
    return state.selectedAgent;
  },
  haveSubscribed: (state) => {
    return state.haveSubscribed;
  },
};

const mutations = {
  SET_RECOMMENDED_ROBOTS(state, agents) {
    state.recommendedRobots = agents;
  },
  SET_ROLEPLAY_ROBOTS(state, agents) {
    state.rolePlayRobots = agents;
  },
  SET_CODING_ROBOTS(state, agents) {
    state.codingRobots = agents;
  },
  SET_PAPER_ROBOTS(state, agents) {
    state.paperRobots = agents;
  },
  SET_SELECTED_AGENT(state, agent) {
    state.selectedAgent = agent;
  },
  SET_SUBSCRIPTIONS(state, agents) {
    state.haveSubscribed = agents;
  },
  // 保持向后兼容的 mutation 名称
  SET_HAVE_SUBSCRIBED(state, agents) {
    state.haveSubscribed = agents;
  },
};

const actions = {
  // 获取所有 AI 机器人信息
  async fetchAllAgentsData({ commit }) {
    try {
      const response = await apifetchAllAgentsData(); // 调用 API 请求
      if (response.status === 200) {
        const agents = response.data;
        // 根据类型和功能分类
        const recommendedRobots = agents.filter((agent) => agent.type === 1); // 推荐机器人
        const rolePlayRobots = agents.filter((agent) => agent.type === 1); // 角色扮演机器人 (暂时与推荐相同)
        const codingRobots = agents.filter((agent) => agent.type === 2); // 代码编程机器人
        const paperRobots = agents.filter((agent) => agent.type === 3); // 论文修改机器人

        // 更新状态
        commit('SET_RECOMMENDED_ROBOTS', recommendedRobots);
        commit('SET_ROLEPLAY_ROBOTS', rolePlayRobots);
        commit('SET_CODING_ROBOTS', codingRobots);
        commit('SET_PAPER_ROBOTS', paperRobots);

        return { success: true, message: '获取 AI 机器人信息成功' };
      } else {
        throw new Error(`API 响应异常，状态码: ${response.status}`);
      }
    } catch (error) {
      console.error('Error occurred in fetchAllAgentsData:', error);
      return { success: false, message: error.message };
    }
  },

  // 获取某个机器人的详细信息
  async fetchAgentDetail({ commit }, agentId) {
    try {
      const response = await apifetchAgentDetail(agentId); // 调用 API 请求
      if (response.status === 200) {
        const agent = response.data;
        console.log('agent:', agent);
        commit('SET_SELECTED_AGENT', agent); // 更新状态
        return { success: true, message: '获取 AI 机器人信息成功' };
      } else {
        throw new Error(`API 响应异常，状态码: ${response.status}`);
      }
    } catch (error) {
      console.error('Error occurred in fetchAgentDetail:', error);
      return { success: false, message: error.message };
    }
  },

  // 获取用户订阅的机器人
  async fetchUserSubscriptions({ commit }, userId) {
    try {
      const response = await apifetchUserSubscriptions(userId); // 调用 API 请求
      if (response.status === 200) {
        const agents = response.data;
        commit('SET_HAVE_SUBSCRIBED', agents); // 更新状态
        return { success: true, message: '获取用户订阅 AI 机器人成功' };
      } else {
        throw new Error(`API 响应异常，状态码: ${response.status}`);
      }
    } catch (error) {
      console.error('Error occurred in fetchUserSubscriptions:', error);
      return { success: false, message: error.message };
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
