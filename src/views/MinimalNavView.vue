<template>
  <div class="minimal-nav" :class="{ dark: themeStore.isDarkMode }">
    <!-- 背景层 -->
    <div class="background-layer"></div>

    <!-- 顶部导航栏 -->
    <header class="top-nav">
      <div class="nav-container">
        <div class="logo-area">
          <img src="/logo.png" alt="logo" class="logo-img" />
          <span class="logo-title">{{ title || '猫猫导航' }}</span>
        </div>

        <div class="nav-actions">
          <button class="theme-btn" @click="themeStore.toggleTheme" :title="themeStore.isDarkMode ? '切换到日间模式' : '切换到夜间模式'">
            <svg v-if="!themeStore.isDarkMode" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z"/>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 7C10 10.866 13.134 14 17 14C18.9584 14 20.729 13.1957 21.9995 11.8995C22 11.933 22 11.9665 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C12.0335 2 12.067 2 12.1005 2.00049C10.8043 3.27098 10 5.04157 10 7ZM4 12C4 16.4183 7.58172 20 12 20C15.0583 20 17.7158 18.2839 19.062 15.7621C18.3945 15.9187 17.7035 16 17 16C12.0294 16 8 11.9706 8 7C8 6.29648 8.08133 5.60547 8.2379 4.938C5.71611 6.28423 4 8.9417 4 12Z"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-container">
      <!-- 中心搜索区 -->
      <div class="search-section">
        <h1 class="main-title">{{ title || '猫猫导航' }}</h1>
        <p class="main-subtitle">简洁高效 · 一键直达</p>

        <div class="search-box">
          <div class="search-engines">
            <button
              v-for="engine in searchEngineList"
              :key="engine.value"
              :class="['engine-btn', { active: selectedEngine === engine.value }]"
              @click="selectedEngine = engine.value"
            >
              <img :src="engine.icon" :alt="engine.label" />
            </button>
          </div>
          <div class="search-input-wrapper">
            <input
              type="text"
              v-model="searchQuery"
              :placeholder="searchEngines[selectedEngine].placeholder"
              class="search-input"
              @keyup.enter="handleSearch"
            />
            <button class="search-btn" @click="handleSearch">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" stroke-width="2"/>
                <path d="M21 21L17.5 17.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 分类标签页 -->
      <div class="category-tabs">
        <button
          v-for="category in categories"
          :key="category.id"
          :class="['tab-btn', { active: activeCategory === category.id }]"
          @click="activeCategory = category.id"
        >
          {{ category.name }}
        </button>
      </div>

      <!-- 网站卡片区 -->
      <div class="sites-container">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button @click="fetchCategories" class="retry-btn">重试</button>
        </div>

        <div v-else class="sites-grid">
          <a
            v-for="site in currentCategorySites"
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
              <p class="site-desc">{{ site.description }}</p>
            </div>
          </a>
        </div>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="page-footer">
      <p>&copy; {{ new Date().getFullYear() }} {{ title || '猫猫导航' }}</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNavigation } from '@/apis/useNavigation.js'
import { useThemeStore } from '@/stores/counter.js'
import googleLogo from '@/assets/goolge.png'
import baiduLogo from '@/assets/baidu.png'
import bingLogo from '@/assets/bing.png'
import duckLogo from '@/assets/duck.png'

const { categories, title, defaultSearchEngine, loading, error, fetchCategories } = useNavigation()
const themeStore = useThemeStore()

const searchQuery = ref('')
const selectedEngine = ref('bing')
const activeCategory = ref(null)

const searchEngines = {
  google: {
    icon: googleLogo,
    label: 'Google',
    placeholder: 'Google 搜索',
    url: 'https://www.google.com/search?q='
  },
  baidu: {
    icon: baiduLogo,
    label: 'Baidu',
    placeholder: '百度一下',
    url: 'https://www.baidu.com/s?wd='
  },
  bing: {
    icon: bingLogo,
    label: 'Bing',
    placeholder: 'Bing 搜索',
    url: 'https://www.bing.com/search?q='
  },
  duckduckgo: {
    icon: duckLogo,
    label: 'DuckDuckGo',
    placeholder: 'DuckDuckGo 搜索',
    url: 'https://duckduckgo.com/?q='
  }
}

const searchEngineList = [
  { value: 'bing', icon: bingLogo, label: 'Bing' },
  { value: 'baidu', icon: baiduLogo, label: 'Baidu' },
  { value: 'google', icon: googleLogo, label: 'Google' },
  { value: 'duckduckgo', icon: duckLogo, label: 'DuckDuckGo' }
]

const currentCategorySites = computed(() => {
  if (!activeCategory.value || !categories.value.length) return []
  const category = categories.value.find(c => c.id === activeCategory.value)
  return category?.sites || []
})

const handleSearch = () => {
  if (!searchQuery.value.trim()) return
  const engine = searchEngines[selectedEngine.value]
  window.open(engine.url + encodeURIComponent(searchQuery.value), '_blank')
}

const handleImageError = (e) => {
  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"/%3E%3Cpath d="M9 9h.01M21 15l-5-5L5 21"/%3E%3C/svg%3E'
}

onMounted(async () => {
  await fetchCategories()
  if (categories.value.length > 0) {
    activeCategory.value = categories.value[0].id
  }
  if (defaultSearchEngine.value) {
    selectedEngine.value = defaultSearchEngine.value
  }
})
</script>

<style scoped>
.minimal-nav {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* 背景层 */
.background-layer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: -1;
}

.minimal-nav.dark .background-layer {
  background: linear-gradient(135deg, #1e3a8a 0%, #312e81 100%);
}

/* 顶部导航栏 */
.top-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.minimal-nav.dark .top-nav {
  background: rgba(0, 0, 0, 0.2);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-img {
  width: 36px;
  height: 36px;
  border-radius: 8px;
}

.logo-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.theme-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.theme-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

/* 主内容区 */
.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

/* 搜索区域 */
.search-section {
  text-align: center;
  margin-bottom: 3rem;
}

.main-title {
  font-size: 3rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.main-subtitle {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-box {
  max-width: 700px;
  margin: 0 auto;
}

.search-engines {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.engine-btn {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 2px solid transparent;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  padding: 8px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.engine-btn img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.engine-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.engine-btn.active {
  border-color: white;
  box-shadow: 0 4px 16px rgba(255, 255, 255, 0.3);
}

.search-input-wrapper {
  display: flex;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.search-input-wrapper:focus-within {
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  background: transparent;
}

.search-btn {
  border: none;
  background: transparent;
  padding: 0 1.5rem;
  cursor: pointer;
  color: #667eea;
  transition: all 0.3s;
}

.search-btn:hover {
  color: #764ba2;
}

/* 分类标签页 */
.category-tabs {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
}

.tab-btn {
  padding: 0.625rem 1.5rem;
  border: none;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.tab-btn.active {
  background: white;
  color: #667eea;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 网站卡片区 */
.sites-container {
  min-height: 400px;
}

.sites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.site-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.site-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.site-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.site-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.site-info {
  flex: 1;
  min-width: 0;
}

.site-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.site-desc {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 加载和错误状态 */
.loading-state,
.error-state {
  text-align: center;
  padding: 3rem;
  color: white;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 50px;
  background: white;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 页脚 */
.page-footer {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-title {
    font-size: 2rem;
  }

  .main-subtitle {
    font-size: 1rem;
  }

  .nav-container {
    padding: 1rem;
  }

  .main-container {
    padding: 2rem 1rem;
  }

  .sites-grid {
    grid-template-columns: 1fr;
  }

  .category-tabs {
    padding: 1rem;
  }

  .search-engines {
    gap: 0.5rem;
  }

  .engine-btn {
    width: 40px;
    height: 40px;
  }
}
</style>
