import { createRouter, createWebHistory } from 'vue-router'
import NavHomeView from '../views/NavHomeView.vue'
import MinimalNavView from '../views/MinimalNavView.vue'
import SimpleNavView from '../views/SimpleNavView.vue'
import TestView from '../views/TestView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: SimpleNavView,
      meta: {
        title: 'Naine导航'
      }
    },
    {
      path: '/nav',
      name: 'nav',
      component: NavHomeView,
      meta: {
        title: '经典导航 - 猫猫导航'
      }
    },
    {
      path: '/minimal',
      name: 'minimal',
      component: MinimalNavView,
      meta: {
        title: '极简导航 - 猫猫导航'
      }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: {
        title: '管理后台 - 猫猫导航',
        requiresAuth: true
      }
    },
    {
      path: '/test',
      name: 'test',
      component: TestView,
      meta: {
        title: '环境变量测试 - 猫猫导航'
      }
    },
  ],
})

// 路由前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = to.meta.title
  } else {
    document.title = '猫猫导航'
  }

  next()
})

export default router
