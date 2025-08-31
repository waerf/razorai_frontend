// src/router/index.js
import Vue from 'vue';
import VueRouter from 'vue-router';
import Layout from '@/layouts/defaultLayout.vue';
import Home from '@/views/HomePage.vue';
import About from '@/views/AboutPage.vue';
import Setting from '@/views/UserSettingPage.vue';
import PersonalHome from '@/views/PersonalHomePage.vue';
import Test from '@/views/TestPage.vue';
import ChatRobot from '@/views/ChatRobotPage.vue';
import SubscribedBots from '@/views/SubscribedBotsPage.vue';
import MyBots from '@/views/MyBotsPage.vue';
import DeveloperCenter from '@/views/DeveloperCenterPage.vue';
import Rgister from '@/views/RegisterPage.vue';
import RobotDetail from '@/views/RobotDetailPage.vue';
import Explorer from '@/views/ExplorerPage.vue';
import CreateBots from '@/views/CreateBotsPage.vue';
import HelperCenter from '@/views/HelperCenterPage.vue';
import ConversationHistory from '@/views/ConversationHistory.vue';
import RobotMarket from '@/views/RobotMarketPage.vue';
import community from '@/views/CommunityPage.vue';
import PostDetail from '@/views/PostDetail.vue';
import ScoreMessage from '@/views/ScoreMessage.vue';
//import { component } from 'vue/types/umd';
import AdminPage from '@/views/AdminPage.vue';
import AdminLogin from '@/views/AdminLoginPage.vue';
import AdminFeedback from '@/views/AdminFeedbackPage.vue';
import Editpost from '@/views/EditPostsPage.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'layout',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Home',
        component: Home,
        meta: {
          title: 'Razor-AI-首页', // 首页标题
        },
      },
      {
        path: 'MyBots',
        name: 'MyBots',
        component: MyBots,
        meta: {
          title: 'Razor-AI-我的机器人', // 我的机器人页标题
        },
      },
      {
        path: 'subscribedBots',
        name: 'SubscribedBots',
        component: SubscribedBots,
        meta: {
          title: 'Razor-AI-我订阅的机器人', // 订阅机器人页标题
        },
      },
      {
        path: '/developerCenter',
        name: 'DeveloperCenter',
        component: DeveloperCenter,
        meta: {
          title: 'Razor-AI-开发者中心', // 开发者中心页标题
        },
      },
      {
        path: '/createRobot',
        name: 'CreateBots',
        component: CreateBots,
        meta: {
          title: 'Razor-AI-创建机器人', // 创建机器人页标题
        },
      },
      {
        path: '/robotMarket',
        name: 'RobotMarket',
        component: RobotMarket,
        meta: {
          title: 'Razor-AI-机器人市场', // 机器人市场页标题
        },
      },
      {
        path: '/about',
        name: 'About',
        component: About,
        meta: {
          title: 'Razor-AI-关于我们', // 关于页面标题
        },
      },
      {
        path: '/setting',
        name: 'Setting',
        component: Setting,
        meta: {
          title: 'Razor-AI-系统设置', // 系统设置页面标题
        },
      },
      {
        path: '/personalhome',
        name: 'PersonalHome',
        component: PersonalHome,
        meta: {
          title: 'Razor-AI-个人主页', // 个人主页标题
        },
      },
      {
        path: '/score-message',
        name: 'ScoreMessage',
        component: ScoreMessage,
        meta: {
          title: 'Razor-AI-积分明细', // 积分明细页标题
        },
      },
      {
        path: '/test',
        name: 'Test',
        component: Test,
        meta: {
          title: 'Razor-AI-测试页面', // 测试页面标题
        },
      },
      {
        path: '/chatRobot/:chatId',
        name: 'ChatRobot',
        component: ChatRobot,
        meta: {
          title: '聊天',
        },
      },
      {
        path: 'register',
        name: 'Register',
        component: Rgister,
        meta: {
          title: '注册',
        },
      },
      {
        path: '/robot/:id',
        name: 'RobotDetail',
        component: RobotDetail,
        meta: {
          title: '机器人详情',
        },
      },
      {
        path: '/explorer',
        name: 'Explorer',
        component: Explorer,
        meta: {
          title: '探索',
        },
      },
      {
        path: '/helperCenter',
        name: 'HelperCenter',
        component: HelperCenter,
        meta: {
          title: '帮助中心',
        },
      },
      {
        path: '/conversationHistory',
        name: 'ConversationHistory',
        component: ConversationHistory,
        meta: {
          title: 'Razor-AI-对话历史',
        },
      },
      {
        path: 'community',
        name: 'Community',
        component: community,
        meta: { title: '社区动态' },
      },
      {
        path: 'community/post/:id',
        name: 'PostDetail',
        component: PostDetail,
        meta: { title: '帖子详情' },
        props: true,
      },
      {
        path: 'community/editpost/:id',
        name: 'EditPost',
        component: Editpost,
        meta: { title: '编辑帖子' },
        props: true,
      },
      {
        path: 'community/news',
        name: 'CommunityNews',
        component: () => import('@/views/CommunityPage.vue'),
        meta: {
          title: '社区动态',
        },
      },
      {
        path: 'community/my-posts',
        name: 'MyPosts',
        component: () => import('@/views/MyPostsPage.vue'),
        meta: {
          title: '我的帖子',
        },
      },
      {
        path: 'community/createPost',
        name: 'CreatePost',
        component: () => import('@/views/CreatePost.vue'),
        meta: {
          title: '发布帖子',
        },
      },
    ],
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    ...routes,
    {
      path: '/admin/login',
      name: 'AdminLogin',
      component: AdminLogin,
      meta: {
        title: 'RazorAI-管理员登录',
      },
    },
    {
      path: '/admin/admin-review',
      name: 'AdminAdminReview',
      component: () => import('@/views/AdminAdminReviewPage.vue'),
      meta: {
        title: 'RazorAI-管理员审核',
        requiresAdmin: true,
      },
    },
    {
      path: '/admin/register',
      name: 'AdminRegister',
      component: () => import('@/views/AdminRegisterPage.vue'),
      meta: {
        title: 'RazorAI-管理员注册',
      },
    },
    {
      path: '/admin',
      name: 'Admin',
      component: AdminPage,
      meta: {
        title: 'RazorAI-管理员控制台',
        requiresAdmin: true,
      },
    },
    {
      path: '/admin/review',
      name: 'AdminReview',
      component: () => import('@/views/AdminReviewPage.vue'),
      meta: {
        title: 'RazorAI-机器人审核',
        requiresAdmin: true,
      },
    },
    {
      path: '/admin/robots/:id',
      name: 'AdminRobotReviewDetail',
      component: () => import('@/views/AdminRobotReviewDetail.vue'),
      meta: {
        title: 'RazorAI-机器人审核详情',
        requiresAdmin: true,
      },
    },
    {
      path: '/admin/feedback',
      name: 'AdminFeedback',
      component: AdminFeedback,
      meta: {
        title: 'RazorAI-用户反馈',
        requiresAdmin: true,
      },
    },
    {
      path: '/admin/feedback/:userId/:feedbackId',
      name: 'AdminFeedbackDetail',
      component: () => import('@/views/AdminFeedbackDetail.vue'),
      meta: {
        title: 'RazorAI-反馈详情',
        requiresAdmin: true,
      },
    },
    {
      path: '/admin/posts',
      name: 'PostReview',
      component: () => import('@/views/AdminPostReviewPage.vue'),
      meta: {
        title: 'RazorAI-帖子审核',
        requiresAdmin: true,
      },
    },
    {
      path: '/admin/post-report/:id',
      name: 'AdminPostReviewDetail',
      component: () => import('@/views/AdminPostReviewDetail.vue'),
      meta: {
        title: 'RazorAI-帖子举报详情',
        requiresAdmin: true,
      },
    },
    {
      path: '/admin/comment-report/:id',
      name: 'AdminCommentReviewDetail',
      component: () => import('@/views/AdminCommentReviewDetail.vue'),
      meta: {
        title: 'RazorAI-评论举报详情',
        requiresAdmin: true,
      },
    },
  ],
});

router.beforeEach((to, from, next) => {
  // 如果路由有定义 meta.title 就使用它作为页面标题
  if (to.meta.title) {
    document.title = to.meta.title;
  } else {
    document.title = 'Razor-AI'; // 这里可以设置一个默认的标题
  }

  next(); // 继续导航
});

export default router;
