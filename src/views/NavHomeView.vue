<template>
  <!-- 锁定界面 -->
  <div v-if="isLocked && !isUnlocked" class="lock-container">
    <div class="lock-box">
      <h1 class="lock-title">
        <span class="lock-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M7 10V7C7 4.79086 8.79086 3 11 3H13C15.2091 3 17 4.79086 17 7V10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" stroke-width="2"/>
            <path d="M12 14V17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
        访问验证
      </h1>
      <p class="lock-description">此导航站已启用访问保护</p>
      <form @submit.prevent="handleUnlock">
        <div class="form-group">
          <label for="unlock-password">请输入访问密钥:</label>
          <input
            id="unlock-password"
            type="password"
            v-model="unlockPassword"
            placeholder="请输入访问密钥"
            required
            class="form-input"
          />
        </div>
        <button type="submit" class="unlock-btn" :disabled="unlocking">
          {{ unlocking ? '验证中...' : '进入导航' }}
        </button>
      </form>
      <div v-if="unlockError" class="error-message">
        {{ unlockError }}
      </div>
    </div>
  </div>

  <!-- 正常导航界面 -->
  <div v-else class="nav-home" :class="{ 'has-background': backgroundUrl }" :style="backgroundStyle">
    <!-- 左侧边栏 -->
    <aside class="sidebar">
      <!-- Logo区域 -->
      <div class="logo-section">
        <img src="/logo.png" alt="logo" class="logo" />
        <div class="logo-text">
          <h1 class="site-title">{{ title || '猫猫导航' }}</h1>
          <p class="site-tagline">高效收藏 · 一键直达</p>
        </div>
      </div>

      <!-- 分类导航 -->
      <nav class="category-nav">
        <h2 class="nav-title">
          <span class="nav-title-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 7H20M4 12H14M4 17H18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </span>
          分类导航
        </h2>
        <ul class="category-list">
          <li
            v-for="category in categories"
            :key="category.id"
            class="category-item"
            @click="scrollToCategory(category.id)"
          >
            <span class="category-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" v-html="getCategoryIconSVG(category)"></svg>
            </span>
            <span class="category-name">{{ category.name }}</span>
          </li>
        </ul>
      </nav>

      <!-- 左侧边栏底部信息 -->
      <!--      <div class="sidebar-footer">-->
      <!--        <a-->
      <!--          href="https://github.com/maodeyu180/mao_nav"-->
      <!--          target="_blank"-->
      <!--          rel="noopener noreferrer"-->
      <!--          class="github-link"-->
      <!--          title="查看源代码"-->
      <!--        >-->
      <!--          <span>开源不易，Star一下吧！⭐</span>-->
      <!--        </a>-->
      <!--      </div>-->
    </aside>

    <!-- 右侧主内容区 -->
    <main class="main-content">
      <!-- 顶部搜索栏 -->
      <header class="search-header">
        <div class="search-container">
          <div class="search-engine-selector">
            <img :src="searchEngines[selectedEngine].icon" :alt="selectedEngine" class="engine-logo" />
            <select v-model="selectedEngine" class="engine-select">
              <option value="google">Google</option>
              <option value="baidu">Baidu</option>
              <option value="bing">Bing</option>
              <option value="duckduckgo">DuckDuckGo</option>
            </select>
          </div>
          <input
            type="text"
            v-model="searchQuery"
            :placeholder="searchEngines[selectedEngine].placeholder"
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <button type="button" class="search-button" @click="handleSearch" aria-label="搜索">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" stroke-width="2"/>
              <path d="M21 21L17.5 17.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>搜索</span>
          </button>
        </div>

        <!-- 主题切换按钮 -->
        <button class="theme-toggle-btn" @click="themeStore.toggleTheme" :title="themeStore.isDarkMode ? '切换到日间模式' : '切换到夜间模式'">
          <svg v-if="!themeStore.isDarkMode" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 7C10 10.866 13.134 14 17 14C18.9584 14 20.729 13.1957 21.9995 11.8995C22 11.933 22 11.9665 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C12.0335 2 12.067 2 12.1005 2.00049C10.8043 3.27098 10 5.04157 10 7ZM4 12C4 16.4183 7.58172 20 12 20C15.0583 20 17.7158 18.2839 19.062 15.7621C18.3945 15.9187 17.7035 16 17 16C12.0294 16 8 11.9706 8 7C8 6.29648 8.08133 5.60547 8.2379 4.938C5.71611 6.28423 4 8.9417 4 12Z"/>
          </svg>
        </button>

        <!-- 移动端菜单按钮 -->
        <button class="mobile-menu-btn" @click="toggleMobileMenu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>

        <!-- 移动端分类菜单 -->
        <div class="mobile-menu" :class="{ active: showMobileMenu }">
          <div class="mobile-menu-header">
            <div class="header-left">
              <h3>分类导航</h3>
              <img :src="githubLogo" alt="GitHub" class="header-github-icon" @click="openGitHub" />
            </div>
            <button class="close-btn" @click="closeMobileMenu">×</button>
          </div>
                    <ul class="mobile-category-list">
            <li
              v-for="category in categories"
              :key="category.id"
              class="mobile-category-item"
              @click="scrollToCategoryMobile(category.id)"
            >
              <span class="category-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" v-html="getCategoryIconSVG(category)"></svg>
            </span>
              <span class="category-name">{{ category.name }}</span>
            </li>
          </ul>
        </div>

        <!-- 移动端菜单遮罩 -->
        <div class="mobile-menu-overlay" :class="{ active: showMobileMenu }" @click="closeMobileMenu"></div>
      </header>

      <!-- 导航内容区 -->
      <div class="content-area">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error">
          <p>{{ error }}</p>
          <button @click="fetchCategories" class="retry-btn">重试</button>
        </div>

        <!-- 分类内容 -->
        <div v-else class="categories-container">
          <section
            v-for="category in categories"
            :key="category.id"
            class="category-section"
            :id="`category-${category.id}`"
          >
            <h2 class="category-title">
              <span class="category-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" v-html="getCategoryIconSVG(category)"></svg>
            </span>
              <span class="category-name">{{ category.name }}</span>
            </h2>

            <div class="sites-grid">
              <a
                v-for="site in category.sites"
                :key="site.id"
                :href="site.url"
                target="_blank"
                rel="noopener noreferrer"
                class="site-card"
              >
                <div class="site-icon">
                  <img :src="site.icon" :alt="site.name" @error="handleImageError" />
                </div>
                <div class="site-info">
                  <h3 class="site-name">{{ site.name }}</h3>
                  <p class="site-description">{{ site.description }}</p>
                </div>
                <span class="site-action" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M7 17L17 7M9 7H17V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </a>
            </div>
          </section>

          <!-- 页面底部信息 -->
          <footer class="page-footer" hidden="true">
            <div class="footer-content">
              <div class="footer-info">
                <h3>{{ title || '猫猫导航' }}</h3>
                <p>一个简洁、美观的导航网站，收录优质网站资源</p>
              </div>

              <div class="footer-links">
                <a
                  href="https://github.com/maodeyu180/mao_nav"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="footer-link"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  开源项目
                </a>
              </div>
            </div>

            <div class="footer-bottom">
              <p>&copy; {{ new Date().getFullYear() }} 猫猫导航 - 由 <a href="https://github.com/maodeyu180" target="_blank" rel="noopener noreferrer">maodeyu180</a> 用 ❤️ 制作</p>
              <p class="footer-tech">基于 Vue.js 构建 | <a href="https://github.com/maodeyu180/mao_nav" target="_blank" rel="noopener noreferrer">查看源代码</a></p>
            </div>
          </footer>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useNavigation } from '@/apis/useNavigation.js'
import { useThemeStore } from '@/stores/counter.js'
// 导入搜索引擎logo图片
import googleLogo from '@/assets/goolge.png'
import baiduLogo from '@/assets/baidu.png'
import bingLogo from '@/assets/bing.png'
import duckLogo from '@/assets/duck.png'
// 导入GitHub logo
import githubLogo from '@/assets/github.png'

// 分类图标映射 - 将 emoji 替换为 SVG
const getCategoryIconSVG = (category) => {
  const iconMap = {
    '💥': '<path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    '🛠️': '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    '📚': '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    '🎨': '<path d="M12 2a10 10 0 0 0-9.95 9h11.64L9.74 7.05a1 1 0 0 1 1.41-1.41l5.66 5.65a1 1 0 0 1 0 1.42l-5.66 5.65a1 1 0 0 1-1.41 0 1 1 0 0 1 0-1.41L13.69 13H2.05A10 10 0 1 0 12 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    '🎮': '<path d="M6 12h4m2 0h4M8 16h8M6 8h.01M18 8h.01M8 21h8a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v10a4 4 0 0 0 4 4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    '🌐': '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" stroke-width="2" fill="none"/>',
    '📱': '<rect x="5" y="2" width="14" height="20" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 18h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    '💻': '<rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M8 21h8M12 17v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    '🔧': '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    '⚙️': '<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  }

  // 默认图标（文件夹）
  const defaultIcon = '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'

  return iconMap[category.icon] || defaultIcon
}

// 使用导航API
const { categories, title, defaultSearchEngine, backgroundUrl, loading, error, fetchCategories } = useNavigation()

// 计算背景图样式
const backgroundStyle = computed(() => {
  if (backgroundUrl.value) {
    return {
      backgroundImage: `url(${backgroundUrl.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }
  }
  return {}
})

// 使用主题store
const themeStore = useThemeStore()

// 响应式数据
const searchQuery = ref('') // 搜索查询
const selectedEngine = ref('bing') // 选中的搜索引擎，初始值会在组件挂载后更新
const showMobileMenu = ref(false) // 移动端菜单显示状态

// 锁定功能相关
const isLocked = ref(false) // 是否启用锁定功能
const isUnlocked = ref(false) // 是否已解锁
const unlockPassword = ref('') // 解锁密码输入
const unlocking = ref(false) // 解锁中状态
const unlockError = ref('') // 解锁错误信息

// 搜索引擎配置
const searchEngines = {
  google: {
    url: 'https://www.google.com/search?q=',
    icon: googleLogo,
    placeholder: 'Google (点logo切换搜索引擎'
  },
  baidu: {
    url: 'https://www.baidu.com/s?wd=',
    icon: baiduLogo,
    placeholder: '百度一下(点logo切换搜索引擎'
  },
  bing: {
    url: 'https://www.bing.com/search?q=',
    icon: bingLogo,
    placeholder: 'Bing (点logo切换搜索引擎)'
  },
  duckduckgo: {
    url: 'https://duckduckgo.com/?q=',
    icon: duckLogo,
    placeholder: 'DuckDuckGo (点logo切换搜索引擎)'
  }
}

// 自定义固定时间滚动函数
const smoothScrollTo = (container, targetTop, duration = 600) => {
  const startTop = container.scrollTop
  const distance = targetTop - startTop
  let startTime = null

  const animateScroll = (currentTime) => {
    if (startTime === null) startTime = currentTime
    const timeElapsed = currentTime - startTime
    const progress = Math.min(timeElapsed / duration, 1)

    // 使用缓动函数 (easeInOutCubic)
    const ease = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2

    container.scrollTop = startTop + distance * ease

    if (progress < 1) {
      requestAnimationFrame(animateScroll)
    }
  }

  requestAnimationFrame(animateScroll)
}

// 滚动到指定分类
const scrollToCategory = (categoryId) => {
  const element = document.getElementById(`category-${categoryId}`)
  const container = document.querySelector('.content-area')

  if (element && container) {
    // 检查是否为移动端
    const isMobile = window.innerWidth <= 768

    let targetTop = 0

    if (isMobile) {
      // 移动端：在 content-area 容器内滚动
      const elementOffsetTop = element.offsetTop
      const searchHeaderHeight = 80 // 固定高度，因为搜索框是fixed定位
      targetTop = elementOffsetTop - searchHeaderHeight
    } else {
      // 桌面端：在容器内滚动
      const searchHeader = document.querySelector('.search-header')
      const elementOffsetTop = element.offsetTop
      const searchHeaderHeight = searchHeader ? searchHeader.offsetHeight + 20 : 100
      targetTop = elementOffsetTop - searchHeaderHeight
    }

    // 使用固定时间滚动（600毫秒）
    smoothScrollTo(container, Math.max(0, targetTop), 600)
  }
}

// 检查是否启用锁定功能
const checkLockStatus = () => {
  const openLock = import.meta.env.VITE_OPEN_LOCK
  if (openLock && openLock.trim() !== '') {
    isLocked.value = true
    // 检查是否已经解锁过
    const savedUnlock = localStorage.getItem('nav_unlocked')
    if (savedUnlock === 'true') {
      isUnlocked.value = true
    }
  } else {
    isLocked.value = false
    isUnlocked.value = true // 如果没有启用锁定，默认为解锁状态
  }
}

// 处理解锁
const handleUnlock = async () => {
  unlocking.value = true
  unlockError.value = ''

    try {
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD

    if (!adminPassword) {
      throw new Error('访问密钥未配置')
    }

    if (unlockPassword.value === adminPassword) {
      isUnlocked.value = true
      localStorage.setItem('nav_unlocked', 'true')
      unlockPassword.value = ''
      console.log('导航站解锁成功')
    } else {
      throw new Error('访问密钥错误，请重新输入')
    }
  } catch (error) {
    unlockError.value = error.message
  } finally {
    unlocking.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  if (!searchQuery.value.trim()) return

  const engine = searchEngines[selectedEngine.value]
  const url = engine.url + encodeURIComponent(searchQuery.value)
  window.open(url, '_blank')
}

// 处理图片加载错误
const handleImageError = (event) => {
  // 设置默认的 favicon.ico 作为 fallback 图片
  event.target.src = '/favicon.ico'
  event.target.onerror = null // 防止无限循环
}

// 移动端菜单控制
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
  // 控制body滚动
  if (showMobileMenu.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
  // 恢复body滚动
  document.body.style.overflow = ''
}

// 移动端分类滚动
const scrollToCategoryMobile = (categoryId) => {
  closeMobileMenu() // 先关闭菜单

  // 稍微延迟一下再滚动，确保菜单关闭动画完成
  setTimeout(() => {
    scrollToCategory(categoryId)
  }, 200)
}

// 打开GitHub项目页面
const openGitHub = () => {
  window.open('https://github.com/maodeyu180/mao_nav', '_blank')
}

// 组件挂载时获取数据
onMounted(async () => {
  checkLockStatus() // 检查锁定状态
  await fetchCategories()
  // 设置默认搜索引擎
  selectedEngine.value = defaultSearchEngine.value
})

// 组件卸载时清理样式
onUnmounted(() => {
  // 确保卸载时恢复body滚动
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* 锁定界面样式 */
.lock-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top, rgba(var(--brand-accent-rgb), 0.2), transparent 55%),
    radial-gradient(circle at 80% 20%, rgba(var(--brand-accent-soft-rgb), 0.25), transparent 45%),
    #0b1120;
  padding: 20px;
  z-index: 9999;
}

.lock-box {
  background: var(--surface);
  padding: 40px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.lock-title {
  color: var(--brand-ink);
  margin-bottom: 8px;
  font-size: 28px;
  font-weight: 600;
  font-family: var(--font-display);
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.lock-icon {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(34, 197, 94, 0.12);
  color: var(--brand-accent);
  box-shadow: inset 0 0 0 1px rgba(34, 197, 94, 0.25);
}

.lock-description {
  color: var(--brand-muted);
  margin-bottom: 30px;
  font-size: 16px;
}

.lock-box .form-group {
  margin-bottom: 20px;
  text-align: left;
}

.lock-box .form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--brand-muted);
  font-weight: 500;
  font-size: 14px;
}

.lock-box .form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid var(--color-border);
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.25s ease;
  background: var(--surface-soft);
}

.lock-box .form-input:focus {
  outline: none;
  border-color: var(--brand-accent);
  box-shadow: 0 0 0 3px rgba(var(--brand-accent-rgb), 0.18);
}

.unlock-btn {
  width: 100%;
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--brand-accent) 0%, var(--brand-accent-soft) 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  margin-top: 10px;
}

.unlock-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(var(--brand-accent-rgb), 0.3);
}

.unlock-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.lock-box .error-message {
  margin-top: 15px;
  padding: 12px;
  background: #fed7d7;
  color: #c53030;
  border-radius: 8px;
  font-size: 14px;
  border: 1px solid #feb2b2;
}

.nav-home {
  display: flex;
  min-height: 100vh;
  background:
    radial-gradient(circle at 12% 18%, rgba(var(--brand-accent-rgb), 0.12), transparent 45%),
    radial-gradient(circle at 88% 8%, rgba(var(--brand-accent-soft-rgb), 0.12), transparent 40%),
    var(--color-background);
  position: relative;
}

/* 有自定义背景图时的样式 */
.nav-home.has-background {
  background-color: var(--color-background);
}

.nav-home::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(transparent 23px, rgba(148, 163, 184, 0.25) 24px),
    linear-gradient(90deg, transparent 23px, rgba(148, 163, 184, 0.25) 24px);
  background-size: 24px 24px;
  opacity: 0.35;
  pointer-events: none;
}

.nav-home > * {
  position: relative;
  z-index: 1;
}

/* 左侧边栏样式 */
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #0b1120 0%, #0f172a 55%, #111827 100%);
  color: white;
  padding: 0;
  box-shadow: 12px 0 35px rgba(15, 23, 42, 0.25);
  height: 100vh;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
}

.sidebar::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top, rgba(var(--brand-accent-soft-rgb), 0.22), transparent 55%),
    linear-gradient(120deg, rgba(255, 255, 255, 0.05), transparent 60%);
  opacity: 0.9;
  pointer-events: none;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
  position: relative;
  z-index: 1;
}

.logo {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.site-title {
  font-size: 26px;
  font-weight: 700;
  margin: 0;
  color: white;
  font-family: var(--font-display);
  letter-spacing: 1px;
}

.site-tagline {
  font-size: 12px;
  color: rgba(226, 232, 240, 0.75);
  margin: 0;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.category-nav {
  padding: 24px 14px 32px;
  height: calc(100vh - 180px); /* 为底部留出空间 */
  overflow-y: auto;
  position: relative;
  z-index: 1;
}

.nav-title {
  font-size: 13px;
  font-weight: 700;
  margin: 0 6px 18px;
  color: rgba(226, 232, 240, 0.8);
  text-transform: uppercase;
  letter-spacing: 1.6px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-title-icon {
  width: 28px;
  height: 28px;
  border-radius: 9px;
  background: rgba(var(--brand-accent-rgb), 0.2);
  color: #bbf7d0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.35);
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  border-radius: 12px;
  margin: 6px 0;
  background: rgba(255, 255, 255, 0.04);
}

.category-item:hover {
  background-color: rgba(255, 255, 255, 0.12);
  box-shadow: inset 4px 0 0 rgba(var(--brand-accent-rgb), 0.9);
}

.category-item::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(var(--brand-accent-rgb), 0.85), rgba(var(--brand-accent-soft-rgb), 0.7));
  opacity: 0;
  transition: opacity 0.25s ease;
}

.category-item:hover::before {
  opacity: 1;
}

.category-item:focus-visible {
  outline: 2px solid rgba(var(--brand-accent-rgb), 0.8);
  outline-offset: 2px;
}

.category-icon {
  font-size: 16px;
  margin-right: 12px;
  width: 32px;
  height: 32px;
  text-align: center;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.2);
}

.category-name {
  font-size: 15px;
  font-weight: 500;
}

/* 左侧边栏底部 */
.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;
}

.github-link {
  display: flex;
  align-items: center;
  color: #bdc3c7;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.25s ease;
  font-size: 14px;
}

.github-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateY(-1px);
}

.github-link svg {
  margin-right: 8px;
  transition: transform 0.3s ease;
}

.github-link:hover svg {
  transform: scale(1.1);
}

/* 右侧主内容区样式 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.search-header {
  background: rgba(255, 255, 255, 0.86);
  padding: 18px 24px;
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 14px;
}

.search-container {
  display: flex;
  max-width: 640px;
  margin: 0 auto;
  gap: 0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  flex: 1;
  border: 1px solid var(--color-border);
  background: var(--surface);
  align-items: stretch;
}

@media (max-width: 768px) {
  .search-container {
    margin: 0;
    max-width: none;
  }
}

.search-engine-selector {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(248, 250, 252, 0.9);
  border-right: 1px solid var(--color-border);
  transition: background-color 0.2s ease;
  padding: 0 4px;
}

.search-engine-selector:hover {
  background: rgba(226, 232, 240, 0.9);
}

.engine-logo {
  width: 22px;
  height: 22px;
  margin: 10px;
  object-fit: contain;
  pointer-events: none;
  border-radius: 6px;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.4);
}

.engine-select {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  border: none;
  outline: none;
  background: transparent;
}

.search-input {
  flex: 1;
  border: none;
  padding: 14px 16px;
  font-size: 15px;
  font-weight: 500;
  outline: none;
  background: transparent;
  color: var(--brand-ink);
}

.search-input::placeholder {
  color: rgba(100, 116, 139, 0.8);
}

.search-button {
  border: none;
  background: linear-gradient(135deg, var(--brand-accent) 0%, var(--brand-accent-soft) 100%);
  color: white;
  padding: 0 18px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.25s ease;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.search-button:hover {
  filter: brightness(1.05);
  box-shadow: 0 12px 20px rgba(var(--brand-accent-rgb), 0.25);
}

.search-button:active {
  transform: translateY(1px);
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  display: none;
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid var(--color-border);
  color: var(--brand-ink);
  cursor: pointer;
  padding: 8px;
  border-radius: 10px;
  transition: background-color 0.2s ease;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
}

.mobile-menu-btn:hover {
  background: rgba(226, 232, 240, 0.9);
}

/* 移动端菜单 */
.mobile-menu {
  position: fixed;
  top: 0;
  right: -100%;
  width: 240px;
  height: 100vh;
  background: var(--surface);
  box-shadow: -12px 0 30px rgba(15, 23, 42, 0.2);
  border-left: 1px solid var(--color-border);
  z-index: 1001;
  transition: right 0.3s ease;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.mobile-menu.active {
  right: 0;
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  background: linear-gradient(135deg, #0b1120 0%, #0f172a 100%);
  color: white;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-menu-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.header-github-icon {
  width: 30px;
  height: 30px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.25s ease;
  opacity: 0.8;
}

.header-github-icon:hover {
  opacity: 1;
  transform: scale(1.1);
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.mobile-category-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  overflow-y: auto;
  padding-bottom: 160px; /* 增加底部内边距确保最后一项完全可见 */
}

.mobile-category-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid var(--color-border);
}

.mobile-category-item:hover {
  background: rgba(226, 232, 240, 0.6);
}

.mobile-category-item .category-icon {
  font-size: 20px;
  margin-right: 12px;
  width: 24px;
  text-align: center;
}

.mobile-category-item .category-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--brand-ink);
}



/* 移动端菜单遮罩 */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.mobile-menu-overlay.active {
  opacity: 1;
  visibility: visible;
}

/* 内容区域样式 */
.content-area {
  flex: 1;
  padding: 34px 30px 400px;
  overflow-y: auto;
  position: relative;
  background: transparent;
}

.content-area::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(var(--brand-accent-rgb), 0.08), transparent 40%),
    radial-gradient(circle at 80% 30%, rgba(var(--brand-accent-soft-rgb), 0.08), transparent 35%),
    linear-gradient(180deg, rgba(248, 250, 252, 0.7), rgba(248, 250, 252, 0));
  opacity: 0.8;
  pointer-events: none;
}

.content-area > * {
  position: relative;
  z-index: 1;
}

.loading, .error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: var(--brand-muted);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #ecf0f1;
  border-top: 4px solid var(--brand-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--brand-accent) 0%, var(--brand-accent-soft) 100%);
  color: white;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 10px 18px rgba(var(--brand-accent-rgb), 0.25);
}

.categories-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 8px 0;
}

.category-section {
  margin-bottom: 50px;
  scroll-margin-top: 120px;
}

.category-title {
  font-size: 30px;
  font-weight: 700;
  margin-bottom: 25px;
  color: var(--brand-ink);
  display: flex;
  align-items: center;
  font-family: var(--font-display);
  letter-spacing: 0.6px;
}

.category-title .category-icon {
  font-size: 28px;
  margin-right: 14px;
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--brand-accent-rgb), 0.12);
  box-shadow: inset 0 0 0 1px rgba(var(--brand-accent-rgb), 0.2);
}

.category-title .category-name {
  margin-left: 10px;
  font-size: 26px;
}

.sites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

.site-card {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: space-between;
  background: var(--surface);
  border-radius: var(--radius-md);
  padding: 20px;
  text-decoration: none;
  color: inherit;
  transition: all 0.25s ease;
  border: 1px solid var(--color-border);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  cursor: pointer;
}

.site-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(var(--brand-accent-rgb), 0.16), rgba(var(--brand-accent-soft-rgb), 0.12));
  opacity: 0;
  transition: opacity 0.25s ease;
}

.site-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(var(--brand-accent-rgb), 0.4);
}

.site-card:hover::before {
  opacity: 1;
}

.site-card:focus-visible {
  outline: 2px solid rgba(var(--brand-accent-rgb), 0.6);
  outline-offset: 3px;
}

.site-icon {
  width: 50px;
  height: 50px;
  margin-right: 0;
  border-radius: 14px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(187, 247, 208, 0.9), rgba(186, 230, 253, 0.9));
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.35);
}

.site-icon img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.site-info {
  flex: 1;
  position: relative;
  z-index: 1;
  min-width: 0;
}

.site-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 5px 0;
  color: var(--brand-ink);
}

.site-description {
  font-size: 14px;
  color: var(--brand-muted);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.site-action {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: rgba(var(--brand-accent-rgb), 0.12);
  color: var(--brand-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: inset 0 0 0 1px rgba(var(--brand-accent-rgb), 0.2);
}

/* 页面底部 */
.page-footer {
  margin-top: 60px;
  padding: 40px 0;
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(226, 232, 240, 0.9) 100%);
  border-radius: 12px;
  border-top: 3px solid var(--brand-accent);
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  gap: 30px;
}

.footer-info h3 {
  color: var(--brand-ink);
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.footer-info p {
  color: var(--brand-muted);
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}

.footer-links {
  display: flex;
  gap: 15px;
}

.footer-link {
  display: flex;
  align-items: center;
  color: var(--brand-accent-strong);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 20px;
  background: white;
  border: 1px solid var(--color-border);
  transition: all 0.25s ease;
  font-size: 14px;
  font-weight: 500;
}

.footer-link:hover {
  background: var(--brand-accent);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--brand-accent-rgb), 0.3);
}

.footer-link svg {
  margin-right: 6px;
  transition: transform 0.3s ease;
}

.footer-link:hover svg {
  transform: scale(1.1);
}

.footer-bottom {
  border-top: 1px solid var(--color-border);
  padding-top: 20px;
  text-align: center;
}

.footer-bottom p {
  color: var(--brand-muted);
  font-size: 13px;
  margin: 5px 0;
  line-height: 1.4;
}

.footer-bottom a {
  color: var(--brand-accent-strong);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.footer-bottom a:hover {
  color: var(--brand-accent);
  text-decoration: underline;
}

.footer-tech {
  font-size: 12px !important;
  opacity: 0.8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-home {
    flex-direction: column;
    height: 100vh;
    height: 100svh; /* 使用动态视口高度 */
    overflow: hidden;
  }

  .sidebar {
    display: none; /* 在移动端隐藏左侧边栏 */
  }

  .main-content {
    flex: 1;
    height: 100vh;
    height: 100svh; /* 使用动态视口高度，更准确 */
    margin-left: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .search-header {
    padding: 15px 20px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 500;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
    backdrop-filter: blur(16px);
  }

  .content-area {
    flex: 1;
    padding: 20px 15px;
    padding-top: 100px; /* 为固定的搜索框留出空间 */
    padding-bottom: 300px; /* 增加底部padding确保内容可以完全滚动 */
    overflow-y: auto;
    -webkit-overflow-scrolling: touch; /* iOS平滑滚动 */
  }

  .mobile-menu-btn {
    display: block; /* 在移动端显示菜单按钮 */
    flex-shrink: 0;
  }

  .sites-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .site-card {
    padding: 12px;
    flex-direction: column;
    text-align: center;
  }

  .site-card .site-icon {
    margin-right: 0;
    margin-bottom: 8px;
  }

  .site-action {
    display: none;
  }

  .site-card .site-name {
    font-size: 15px;
  }

  .site-card .site-description {
    font-size: 12px;
  }

  .category-title {
    font-size: 24px;
    margin-bottom: 20px;
  }

  .category-title .category-icon {
    font-size: 28px;
    margin-right: 12px;
  }

  .category-title .category-name {
    font-size: 22px;
  }

  .search-button span {
    display: none;
  }

  .search-button {
    padding: 0 14px;
  }

  /* 移动端页面底部 */
  .page-footer {
    margin-top: 40px;
    padding: 30px 20px;
  }

  .footer-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .footer-links {
    justify-content: center;
  }

  .footer-bottom {
    padding-top: 15px;
  }

  .footer-bottom p {
    font-size: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nav-home,
  .nav-home * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* 主题切换按钮样式 */
.theme-toggle-btn {
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid var(--color-border);
  color: var(--brand-ink);
  cursor: pointer;
  padding: 8px;
  border-radius: 10px;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
}

.theme-toggle-btn:hover {
  background: rgba(226, 232, 240, 0.9);
  transform: scale(1.1);
}

/* 暗色模式样式 */
.dark .nav-home {
  background:
    radial-gradient(circle at 15% 18%, rgba(var(--brand-accent-rgb), 0.18), transparent 45%),
    radial-gradient(circle at 85% 12%, rgba(var(--brand-accent-soft-rgb), 0.18), transparent 40%),
    var(--color-background);
}

.dark .nav-home.has-background {
  background-color: var(--color-background);
}

.dark .nav-home::before {
  background:
    linear-gradient(transparent 23px, rgba(148, 163, 184, 0.12) 24px),
    linear-gradient(90deg, transparent 23px, rgba(148, 163, 184, 0.12) 24px);
  background-size: 24px 24px;
  opacity: 0.25;
}

.dark .sidebar {
  background: linear-gradient(180deg, #0b1120 0%, #111827 70%, #0f172a 100%);
  box-shadow: 12px 0 35px rgba(2, 6, 23, 0.55);
}

.dark .sidebar::before {
  background:
    radial-gradient(circle at top, rgba(var(--brand-accent-soft-rgb), 0.22), transparent 60%),
    linear-gradient(120deg, rgba(255, 255, 255, 0.08), transparent 65%);
}

.dark .nav-title {
  color: rgba(226, 232, 240, 0.75);
}

.dark .category-item {
  background: rgba(255, 255, 255, 0.05);
}

.dark .category-item:hover {
  background: rgba(var(--brand-accent-rgb), 0.2);
}

.dark .category-icon {
  background: rgba(148, 163, 184, 0.15);
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.2);
}

.dark .search-header {
  background: rgba(15, 23, 42, 0.88);
  box-shadow: 0 16px 30px rgba(2, 6, 23, 0.45);
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}



.dark .theme-toggle-btn {
  color: var(--brand-ink);
  background: rgba(15, 23, 42, 0.9);
  border-color: rgba(148, 163, 184, 0.2);
  box-shadow: 0 10px 20px rgba(2, 6, 23, 0.4);
}

.dark .theme-toggle-btn:hover {
  background: rgba(30, 41, 59, 0.9);
}

.dark .mobile-menu-btn {
  color: var(--brand-ink);
  background: rgba(15, 23, 42, 0.9);
  border-color: rgba(148, 163, 184, 0.2);
  box-shadow: 0 10px 20px rgba(2, 6, 23, 0.4);
}

.dark .mobile-menu-btn:hover {
  background: rgba(30, 41, 59, 0.9);
}

.dark .search-container {
  background: rgba(15, 23, 42, 0.9);
  border-color: rgba(148, 163, 184, 0.25);
  box-shadow: 0 12px 24px rgba(2, 6, 23, 0.45);
}

.dark .search-engine-selector {
  background: rgba(30, 41, 59, 0.85);
  border-right: 1px solid rgba(148, 163, 184, 0.2);
}

.dark .search-engine-selector:hover {
  background: rgba(51, 65, 85, 0.9);
}

.dark .search-input {
  background: transparent;
  color: var(--brand-ink);
  border: none;
}

.dark .search-input::placeholder {
  color: rgba(148, 163, 184, 0.8);
}

.dark .engine-select {
  background: transparent;
  color: var(--brand-ink);
}

.dark .engine-select option {
  background: #0f172a;
  color: #e2e8f0;
}

.dark .search-button {
  background: linear-gradient(135deg, var(--brand-accent-strong) 0%, var(--brand-accent-soft) 100%);
  box-shadow: 0 12px 24px rgba(var(--brand-accent-rgb), 0.3);
}


.dark .content-area::before {
  background:
    radial-gradient(circle at 20% 20%, rgba(var(--brand-accent-rgb), 0.15), transparent 45%),
    radial-gradient(circle at 80% 30%, rgba(var(--brand-accent-soft-rgb), 0.12), transparent 40%),
    linear-gradient(180deg, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.2));
}

.dark .site-card {
  background: rgba(30, 41, 59, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #e2e8f0;
  box-shadow: 0 12px 24px rgba(2, 6, 23, 0.45);
}

.dark .site-card:hover {
  box-shadow: 0 20px 40px rgba(2, 6, 23, 0.55);
  border-color: rgba(var(--brand-accent-rgb), 0.6);
}

.dark .site-card::before {
  background: linear-gradient(135deg, rgba(var(--brand-accent-rgb), 0.2), rgba(var(--brand-accent-soft-rgb), 0.15));
}

.dark .site-name {
  color: var(--brand-ink);
}

.dark .site-description {
  color: rgba(148, 163, 184, 0.9);
}

.dark .site-icon {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.35), rgba(30, 41, 59, 0.6));
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.2);
}

.dark .category-title {
  color: var(--brand-ink);
}

.dark .category-title .category-icon {
  background: rgba(var(--brand-accent-rgb), 0.2);
  box-shadow: inset 0 0 0 1px rgba(var(--brand-accent-rgb), 0.3);
}

.dark .site-action {
  background: rgba(var(--brand-accent-rgb), 0.18);
  color: #bbf7d0;
  box-shadow: inset 0 0 0 1px rgba(var(--brand-accent-rgb), 0.35);
}

.dark .mobile-menu {
  background: rgba(15, 23, 42, 0.98);
  box-shadow: -12px 0 30px rgba(2, 6, 23, 0.6);
  border-left: 1px solid rgba(148, 163, 184, 0.2);
}

.dark .mobile-category-item {
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.dark .mobile-category-item:hover {
  background: rgba(30, 41, 59, 0.9);
}

.dark .mobile-category-item .category-name {
  color: var(--brand-ink);
}

.dark .page-footer {
  background: linear-gradient(135deg, #1e293b 0%, #374151 100%);
  border-top: 3px solid var(--brand-accent);
}

.dark .footer-info h3 {
  color: #e2e8f0;
}

.dark .footer-info p {
  color: #9ca3af;
}

.dark .footer-link {
  background: #374151;
  border: 1px solid #4b5563;
  color: var(--brand-accent);
}

.dark .footer-link:hover {
  background: var(--brand-accent);
  color: white;
  box-shadow: 0 4px 12px rgba(var(--brand-accent-rgb), 0.4);
}

.dark .footer-bottom p {
  color: #9ca3af;
}

.dark .footer-bottom a {
  color: var(--brand-accent);
}

.dark .footer-bottom a:hover {
  color: var(--brand-accent-soft);
}

.dark .loading,
.dark .error {
  color: rgba(148, 163, 184, 0.9);
}

.dark .retry-btn {
  background: linear-gradient(135deg, var(--brand-accent-strong) 0%, var(--brand-accent-soft) 100%);
  color: white;
}

.dark .retry-btn:hover {
  filter: brightness(1.05);
}

/* 锁定界面暗色模式 */
.dark .lock-container {
  background:
    radial-gradient(circle at top, rgba(var(--brand-accent-rgb), 0.2), transparent 55%),
    radial-gradient(circle at 80% 20%, rgba(var(--brand-accent-soft-rgb), 0.2), transparent 45%),
    #0b1120;
}

.dark .lock-box {
  background: var(--surface-soft);
  color: var(--brand-ink);
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.dark .lock-title {
  color: var(--brand-ink);
}

.dark .lock-icon {
  background: rgba(34, 197, 94, 0.18);
  color: #86efac;
  box-shadow: inset 0 0 0 1px rgba(34, 197, 94, 0.35);
}

.dark .lock-description {
  color: var(--brand-muted);
}

.dark .lock-box .form-group label {
  color: var(--brand-muted);
}

.dark .lock-box .form-input {
  background: rgba(30, 41, 59, 0.8);
  border: 1.5px solid rgba(148, 163, 184, 0.25);
  color: var(--brand-ink);
}

.dark .lock-box .form-input:focus {
  border-color: var(--brand-accent-strong);
  box-shadow: 0 0 0 3px rgba(var(--brand-accent-rgb), 0.2);
}

.dark .unlock-btn {
  background: linear-gradient(135deg, var(--brand-accent-strong) 0%, var(--brand-accent-soft) 100%);
}

.dark .unlock-btn:hover:not(:disabled) {
  box-shadow: 0 10px 30px rgba(var(--brand-accent-rgb), 0.35);
}

/* 无障碍性：尊重用户的运动偏好 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
</style>
