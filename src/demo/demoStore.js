import { create } from 'zustand';
import { LANGUAGE_IDS } from '../i18n/languages.js';

const LANGUAGE_STORAGE_KEY = 'inox-smart-ui-language';
const SIDEBAR_STORAGE_KEY = 'inox-smart-ui-sidebar-collapsed';

function readStoredLanguage() {
  // Browser-only persistence keeps the latest selected language across refreshes and new tabs.
  // 仅在浏览器环境读取本地缓存，让刷新页面和新标签页都沿用用户最后选择的语言。
  if (typeof window === 'undefined') return LANGUAGE_IDS.en;
  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return Object.values(LANGUAGE_IDS).includes(storedLanguage) ? storedLanguage : LANGUAGE_IDS.en;
}

function persistLanguage(language) {
  // localStorage is enough for this frontend demo; it survives tabs and refreshes without a backend session.
  // 对前端 demo 来说 localStorage 足够稳定：不需要后端 session，也能跨标签页和刷新保留语言。
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }
}

function readStoredSidebarCollapsed() {
  // Desktop property sidebar defaults to expanded; once users manually toggle it, localStorage becomes the source of truth.
  // 桌面端物业侧栏默认展开；用户手动折叠/展开后，localStorage 记录会成为后续刷新时的状态来源。
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
}

function persistSidebarCollapsed(isCollapsed) {
  // Persisting the boolean as a string keeps the demo independent from backend user preferences.
  // 将布尔值以字符串写入本地缓存，让 demo 不依赖后端用户偏好设置。
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isCollapsed));
  }
}

// Global demo state: keeps shell context, permission role, login status and language in one place.
// Demo 全局状态：集中管理 UI 版本、物业上下文、权限角色、登录态和语言状态。
export const useDemoStore = create((set) => ({
  uiVersion: 'v1',
  propertyId: 'p-1',
  role: 'admin',
  dataMode: 'normal',
  authStatus: 'loggedIn',
  language: readStoredLanguage(),
  demoBarCollapsed: false,
  isSidebarCollapsed: readStoredSidebarCollapsed(),
  setUiVersion: (uiVersion) => set({ uiVersion }),
  setPropertyId: (propertyId) => set({ propertyId }),
  setRole: (role) => set({ role }),
  setDataMode: (dataMode) => set({ dataMode }),
  setAuthStatus: (authStatus) => set({ authStatus }),
  setLanguage: (language) => {
    persistLanguage(language);
    set({ language });
  },
  setSidebarCollapsed: (isSidebarCollapsed) => {
    persistSidebarCollapsed(isSidebarCollapsed);
    set({ isSidebarCollapsed });
  },
  toggleSidebarCollapsed: () => set((state) => {
    const nextValue = !state.isSidebarCollapsed;
    persistSidebarCollapsed(nextValue);
    return { isSidebarCollapsed: nextValue };
  }),
  toggleDemoBar: () => set((state) => ({ demoBarCollapsed: !state.demoBarCollapsed })),
}));
