<template>
  <!-- 锁定界面 -->
  <div v-if="isLocked && !isUnlocked" class="lock-overlay">
    <div class="lock-card">
      <div class="lock-icon">🔒</div>
      <h2>访问验证</h2>
      <p>此导航站已启用访问保护</p>
      <form @submit.prevent="handleUnlock">
        <input
          type="password"
          v-model="unlockPassword"
          placeholder="请输入访问密钥"
          class="lock-input"
        />
        <button type="submit" class="lock-btn" :disabled="unlocking">
          {{ unlocking ? '验证中...' : '进入' }}
        </button>
      </form>
      <div v-if="unlockError" class="lock-error">{{ unlockError }}</div>
    </div>
  </div>

  <!-- 主导航界面 -->
  <div v-else class="lylme-nav">
    <!-- 固定背景 -->
    <div class="banner-video" :style="{ backgroundImage: `url('${backgroundImage}')` }"></div>

    <!-- 侧边栏触发区域 -->
    <div class="sidebar-trigger" @mouseenter="showSidebar = true"></div>

    <!-- 侧边栏菜单 -->
    <aside :class="['sidebar-menu', { show: showSidebar }]" @mouseleave="showSidebar = false">
      <div class="sidebar-header">
        <h3>Naine导航</h3>
      </div>
      <nav class="sidebar-nav">
        <a
          v-for="category in categories"
          :key="category.id"
          :href="`#category-${category.id}`"
          class="sidebar-item"
          @click="scrollToCategory(category.id)"
        >
          <span class="sidebar-icon">{{ category.icon }}</span>
          <span>{{ category.name }}</span>
        </a>
      </nav>
    </aside>

    <!-- 右侧触发区域 -->
    <div class="theme-trigger" @mouseenter="showThemeBtn = true"></div>

    <!-- 主题切换按钮 -->
    <button
      :class="['theme-toggle', { show: showThemeBtn }]"
      @click="toggleTheme"
      @mouseleave="showThemeBtn = false"
      title="切换主题"
    >
      <span v-if="isDark">🌙</span>
      <span v-else>☀️</span>
    </button>

    <!-- 主容器 -->
    <div class="container">
      <!-- 顶部标题和搜索 -->
      <header class="header-section">
        <!-- 时间日期卡片 -->
        <div class="datetime-card">
          <div class="flip-clock">
            <div class="flip-unit">
              <div class="flip-card" :class="{ flip: flipHourTens }">{{ hourTens }}</div>
            </div>
            <div class="flip-unit">
              <div class="flip-card" :class="{ flip: flipHourOnes }">{{ hourOnes }}</div>
            </div>
            <div class="flip-separator">:</div>
            <div class="flip-unit">
              <div class="flip-card" :class="{ flip: flipMinuteTens }">{{ minuteTens }}</div>
            </div>
            <div class="flip-unit">
              <div class="flip-card" :class="{ flip: flipMinuteOnes }">{{ minuteOnes }}</div>
            </div>
            <div class="flip-separator">:</div>
            <div class="flip-unit">
              <div class="flip-card" :class="{ flip: flipSecondTens }">{{ secondTens }}</div>
            </div>
            <div class="flip-unit">
              <div class="flip-card" :class="{ flip: flipSecondOnes }">{{ secondOnes }}</div>
            </div>
          </div>
          <div class="date-display">{{ currentDate }}</div>
          <div class="title-row">
            <h1 class="main-title">{{ title || 'Naine' }}</h1>
            <p class="sub-title">{{ currentQuote }}</p>
          </div>
        </div>

        <!-- 搜索引擎选择 -->
        <div class="search-engines">
          <button
            v-for="(engine, key) in searchEngines"
            :key="key"
            :class="['engine-item', { active: selectedEngine === key }]"
            @click="selectedEngine = key"
          >
            {{ engine.name }}
          </button>
        </div>

        <!-- 搜索框 -->
        <div class="search-wrapper">
          <input
            type="text"
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            placeholder="搜索你想要的内容..."
            class="search-input"
          />
          <button @click="handleSearch" class="search-button">搜索</button>
        </div>
      </header>

      <!-- 网站列表 - 按分类显示 -->
      <main class="sites-container">
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="error" class="error">
          <p>{{ error }}</p>
          <button @click="fetchCategories" class="retry-btn">重试</button>
        </div>
        <div v-else>
          <!-- 遍历所有分类 -->
          <section
            v-for="category in categories"
            :key="category.id"
            :id="`category-${category.id}`"
            class="category-section"
          >
            <h2 class="category-title">
              <span class="category-icon">{{ category.icon }}</span>
              {{ category.name }}
            </h2>
            <div class="sites-grid">
              <a
                v-for="site in category.sites"
                :key="site.id"
                :href="site.url"
                target="_blank"
                rel="noopener noreferrer"
                class="site-item"
              >
                <img v-if="site.icon" :src="site.icon" :alt="site.name" class="site-icon" />
                <div v-else class="site-icon-placeholder">{{ site.name.charAt(0) }}</div>
                <span class="site-name">{{ site.name }}</span>
              </a>
            </div>
          </section>
        </div>
      </main>

      <!-- 底部 -->
      <footer class="footer">
        <p>© 2026 Naine导航 平凡却不平庸</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNavigation } from '@/apis/useNavigation.js'
import { useThemeStore } from '@/stores/counter.js'
import googleLogo from '@/assets/goolge.png'
import baiduLogo from '@/assets/baidu.png'
import bingLogo from '@/assets/bing.png'

// 使用导航API
const { categories, title, defaultSearchEngine, backgroundUrl, loading, error, fetchCategories } = useNavigation()

// 使用主题store
const themeStore = useThemeStore()

// 主题状态（使用 computed 自动响应 store 变化）
const isDark = computed(() => themeStore.isDark)

const toggleTheme = () => {
  themeStore.toggleTheme()
}

// 锁定功能
const isLocked = ref(false)
const isUnlocked = ref(false)
const unlockPassword = ref('')
const unlocking = ref(false)
const unlockError = ref('')

const handleUnlock = async () => {
  unlocking.value = true
  unlockError.value = ''

  try {
    const response = await fetch('/api/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: unlockPassword.value })
    })

    if (response.ok) {
      isUnlocked.value = true
      localStorage.setItem('nav_unlocked', 'true')
    } else {
      unlockError.value = '密钥错误，请重试'
    }
  } catch (err) {
    unlockError.value = '验证失败，请重试'
  } finally {
    unlocking.value = false
  }
}

// 搜索引擎
const searchEngines = {
  baidu: { name: '百度', url: 'https://www.baidu.com/s?wd=', icon: baiduLogo },
  google: { name: 'Google', url: 'https://www.google.com/search?q=', icon: googleLogo },
  bing: { name: 'Bing', url: 'https://www.bing.com/search?q=', icon: bingLogo }
}

const selectedEngine = ref('baidu')
const searchQuery = ref('')

const handleSearch = () => {
  if (!searchQuery.value.trim()) return
  const url = searchEngines[selectedEngine.value].url + encodeURIComponent(searchQuery.value)
  window.open(url, '_blank')
}

// 侧边栏显示状态
const showSidebar = ref(false)

// 主题按钮显示状态
const showThemeBtn = ref(false)

// 励志句子列表
const quotes = [
  '平凡却不平庸，每一天都是新的开始',
  '星光不问赶路人，时光不负有心人',
  '愿你历尽千帆，归来仍是少年',
  '山高路远，看世界也找自己',
  '生活明朗，万物可爱',
  '热爱可抵岁月漫长',
  '心之所向，素履以往',
  '不负光阴不负己，不负青春不负梦',
  '世界很大，风景很美，机会很多',
  '保持热爱，奔赴山海'
]

// 当前显示的励志句子
const currentQuote = ref('')

// 当前日期时间
const currentDate = ref('')
const hourTens = ref('0')
const hourOnes = ref('0')
const minuteTens = ref('0')
const minuteOnes = ref('0')
const secondTens = ref('0')
const secondOnes = ref('0')

// 前一个值（用于翻页动画）
const prevHourTens = ref('0')
const prevHourOnes = ref('0')
const prevMinuteTens = ref('0')
const prevMinuteOnes = ref('0')
const prevSecondTens = ref('0')
const prevSecondOnes = ref('0')

// 翻页动画状态
const flipHourTens = ref(false)
const flipHourOnes = ref(false)
const flipMinuteTens = ref(false)
const flipMinuteOnes = ref(false)
const flipSecondTens = ref(false)
const flipSecondOnes = ref(false)

let dateTimeTimer = null

// 背景图
const backgroundImage = ref('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920')

// 检查是否有自定义背景图
const checkCustomBackground = async () => {
  // 优先级1: 如果设置了backgroundUrl，使用它
  if (backgroundUrl.value) {
    backgroundImage.value = backgroundUrl.value
    return
  }

  // 优先级2: 尝试加载上传的 background.jpg
  try {
    const jpgResponse = await fetch('/background.jpg', { method: 'HEAD' })
    if (jpgResponse.ok) {
      backgroundImage.value = '/background.jpg'
      return
    }
  } catch (e) {
    // 忽略错误
  }

  // 优先级3: 尝试加载上传的 background.png
  try {
    const pngResponse = await fetch('/background.png', { method: 'HEAD' })
    if (pngResponse.ok) {
      backgroundImage.value = '/background.png'
      return
    }
  } catch (e) {
    // 忽略错误，使用默认背景
  }
}

// 更新日期时间
const updateDateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const weekDay = weekDays[now.getDay()]

  // 检查并触发翻页动画
  if (hours[0] !== hourTens.value) {
    prevHourTens.value = hourTens.value
    flipHourTens.value = true
    setTimeout(() => { flipHourTens.value = false }, 600)
  }
  if (hours[1] !== hourOnes.value) {
    prevHourOnes.value = hourOnes.value
    flipHourOnes.value = true
    setTimeout(() => { flipHourOnes.value = false }, 600)
  }
  if (minutes[0] !== minuteTens.value) {
    prevMinuteTens.value = minuteTens.value
    flipMinuteTens.value = true
    setTimeout(() => { flipMinuteTens.value = false }, 600)
  }
  if (minutes[1] !== minuteOnes.value) {
    prevMinuteOnes.value = minuteOnes.value
    flipMinuteOnes.value = true
    setTimeout(() => { flipMinuteOnes.value = false }, 600)
  }
  if (seconds[0] !== secondTens.value) {
    prevSecondTens.value = secondTens.value
    flipSecondTens.value = true
    setTimeout(() => { flipSecondTens.value = false }, 600)
  }
  if (seconds[1] !== secondOnes.value) {
    prevSecondOnes.value = secondOnes.value
    flipSecondOnes.value = true
    setTimeout(() => { flipSecondOnes.value = false }, 600)
  }

  // 更新当前值
  hourTens.value = hours[0]
  hourOnes.value = hours[1]
  minuteTens.value = minutes[0]
  minuteOnes.value = minutes[1]
  secondTens.value = seconds[0]
  secondOnes.value = seconds[1]

  currentDate.value = `${year}年${month}月${day}日 ${weekDay}`
}

// 随机选择一句励志语
const getRandomQuote = () => {
  const randomIndex = Math.floor(Math.random() * quotes.length)
  currentQuote.value = quotes[randomIndex]
}

// 滚动到指定分类
const scrollToCategory = (categoryId) => {
  const element = document.getElementById(`category-${categoryId}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    showSidebar.value = false
  }
}

onMounted(async () => {
  // 加载数据
  await fetchCategories()

  // 检查自定义背景图
  await checkCustomBackground()

  // 设置默认搜索引擎
  if (defaultSearchEngine.value) {
    selectedEngine.value = defaultSearchEngine.value
  }

  // 随机显示励志句子
  getRandomQuote()

  // 初始化日期时间并启动定时器
  updateDateTime()
  dateTimeTimer = setInterval(updateDateTime, 1000)
})

onUnmounted(() => {
  // 清理定时器
  if (dateTimeTimer) {
    clearInterval(dateTimeTimer)
  }
})
</script>

<style scoped>
/* 全局重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 主容器 */
.lylme-nav {
  min-height: 100vh;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

/* 固定背景 */
.banner-video {
  position: fixed !important;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  z-index: -1;
}

.banner-video::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.1);
}

.dark .banner-video::after {
  background: rgba(0, 0, 0, 0.3);
}

/* 右侧触发区域 */
.theme-trigger {
  position: fixed;
  right: 0;
  top: 0;
  width: 20px;
  height: 100vh;
  z-index: 999;
}

/* 主题切换按钮 */
.theme-toggle {
  position: fixed;
  top: 20px;
  right: -60px;
  width: 50px;
  height: 50px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
  z-index: 100;
  transition: right 0.3s ease;
}

.theme-toggle.show {
  right: 20px;
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

/* 侧边栏触发区域 */
.sidebar-trigger {
  position: fixed;
  left: 0;
  top: 0;
  width: 20px;
  height: 100vh;
  z-index: 999;
}

/* 侧边栏菜单 */
.sidebar-menu {
  position: fixed;
  left: -280px;
  top: 0;
  width: 280px;
  height: 100vh;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: left 0.3s ease;
  overflow-y: auto;
}

.sidebar-menu.show {
  left: 0;
}

.sidebar-header {
  padding: 30px 20px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.sidebar-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.3);
}

.sidebar-nav {
  padding: 20px 0;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  color: #fff;
  text-decoration: none;
  font-size: 15px;
  transition: all 0.3s;
  border-left: 3px solid transparent;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
}

.sidebar-item:hover {
  background: rgba(255, 255, 255, 0.2);
  border-left-color: #fff;
  color: #fff;
}

.sidebar-icon {
  font-size: 18px;
  flex-shrink: 0;
}

/* 容器 */
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 30px;
}

/* 头部区域 */
.header-section {
  text-align: center;
  margin-bottom: 40px;
}

.main-title {
  font-size: 42px;
  font-weight: 700;
  color: #fff;
  text-shadow: 2px 2px 12px rgba(0, 0, 0, 0.4);
  margin-bottom: 10px;
  letter-spacing: 2px;
}

.sub-title {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 1px 1px 6px rgba(0, 0, 0, 0.4);
  font-weight: 400;
  margin: 0 0 30px 0;
}

.datetime-card {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 30px 40px;
  margin-bottom: 15px;
}

/* 翻页时钟 */
.flip-clock {
  display: flex;
  align-items: center;
  gap: 8px;
}

.flip-unit {
  position: relative;
  width: 60px;
  height: 80px;
}

.flip-separator {
  font-size: 48px;
  font-weight: 700;
  color: #fff;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
  margin: 0 4px;
  line-height: 80px;
  height: 80px;
  display: flex;
  align-items: center;
}

.flip-card {
  position: relative;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: 700;
  color: #fff;
  font-family: 'Courier New', monospace;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.1s ease;
}

.flip-card::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
}

.flip-card.flip {
  animation: flipAnimation 0.6s ease-in-out;
}

@keyframes flipAnimation {
  0% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(0.8);
  }
  100% {
    transform: scaleY(1);
  }
}

.date-display {
  font-size: 16px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.datetime-card .main-title {
  font-size: 28px;
  font-weight: 600;
  color: #fff;
  text-shadow: 1px 1px 6px rgba(0, 0, 0, 0.3);
  margin: 0;
  letter-spacing: 2px;
}

.title-separator {
  font-size: 24px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.7);
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.3);
}

.datetime-card .sub-title {
  font-size: 22px;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.3);
  font-weight: 400;
  margin: 0;
}

/* 搜索引擎选择 */
.search-engines {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.engine-item {
  padding: 8px 20px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: #fff;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.engine-item:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.engine-item.active {
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-weight: 600;
}

/* 搜索框 */
.search-wrapper {
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(15px);
  border-radius: 50px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.search-input {
  flex: 1;
  padding: 16px 28px;
  border: none;
  outline: none;
  font-size: 16px;
  background: transparent;
  color: #333;
}

.search-input::placeholder {
  color: #999;
}

.search-button {
  padding: 16px 40px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.search-button:hover {
  filter: brightness(1.15);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  transform: translateY(-1px);
}

/* 网站列表容器 */
.sites-container {
  min-height: 400px;
}

/* 分类区块 */
.category-section {
  background: rgb(239, 246, 246);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.6);
  transition: all 0.3s;
}

.category-section:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* 分类标题 */
.category-title {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-icon {
  font-size: 20px;
}

/* 网站网格 */
.sites-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 20px;
}

/* 网站项 */
.site-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 8px;
  background: transparent;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.site-item:hover {
  background: rgba(102, 126, 234, 0.08);
  transform: translateY(-5px);
}

.site-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  margin-bottom: 10px;
  object-fit: contain;
  background: #fff;
  padding: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transition: all 0.3s;
}

.site-item:hover .site-icon {
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.25);
  transform: scale(1.05);
}

.site-icon-placeholder {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s;
}

.site-item:hover .site-icon-placeholder {
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  transform: scale(1.05);
}

.site-name {
  font-size: 13px;
  color: #2c3e50;
  text-align: center;
  font-weight: 500;
  line-height: 1.3;
  word-break: break-all;
  transition: all 0.3s;
}

.site-item:hover .site-name {
  color: #667eea;
  font-weight: 600;
}

/* 加载和错误状态 */
.loading,
.error {
  text-align: center;
  padding: 60px 20px;
  color: #fff;
  font-size: 18px;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.3);
}

.retry-btn {
  margin-top: 20px;
  padding: 12px 30px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.3s;
}

.retry-btn:hover {
  background: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

/* 底部 */
.footer {
  text-align: center;
  padding: 30px 20px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.3);
}

/* 锁定界面 */
.lock-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.lock-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 50px 40px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.lock-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.lock-card h2 {
  font-size: 28px;
  margin-bottom: 10px;
  color: #333;
}

.lock-card p {
  color: #666;
  margin-bottom: 30px;
  font-size: 15px;
}

.lock-input {
  width: 100%;
  padding: 15px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  margin-bottom: 15px;
  outline: none;
  transition: border-color 0.3s;
}

.lock-input:focus {
  border-color: #667eea;
}

.lock-btn {
  width: 100%;
  padding: 15px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.lock-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.lock-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.lock-error {
  color: #e53e3e;
  margin-top: 15px;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .sites-grid {
    grid-template-columns: repeat(8, 1fr);
  }
}

@media (max-width: 1024px) {
  .sites-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (max-width: 768px) {
  .main-title {
    font-size: 28px;
  }

  .sub-title {
    font-size: 14px;
  }

  .datetime-card {
    padding: 20px 25px;
    margin-bottom: 25px;
  }

  .flip-unit {
    width: 40px;
    height: 60px;
  }

  .flip-separator {
    font-size: 36px;
    margin: 0 2px;
  }

  .flip-card-top,
  .flip-card-bottom,
  .flip-card-back,
  .flip-card-back-bottom {
    font-size: 32px;
  }

  .date-display {
    font-size: 13px;
  }

  .search-engines {
    gap: 8px;
  }

  .engine-item {
    padding: 6px 15px;
    font-size: 13px;
  }

  .category-section {
    padding: 20px 15px;
  }

  .category-title {
    font-size: 16px;
  }

  .sites-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
  }

  .site-item {
    padding: 12px 6px;
  }

  .site-icon,
  .site-icon-placeholder {
    width: 36px;
    height: 36px;
  }

  .site-name {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 20px 10px;
  }

  .search-wrapper {
    flex-direction: column;
    border-radius: 15px;
  }

  .search-button {
    border-radius: 0 0 15px 15px;
  }

  .sites-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }

  .category-section {
    padding: 15px 10px;
  }
}
</style>
