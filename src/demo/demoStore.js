import { create } from 'zustand';

// Demo 全局状态：集中管理 UI 版本、物业上下文、权限角色、数据模式与登录态。
// 后续接真实后端时，可以把 authStatus / role / propertyId 替换为 API 返回的 session 数据。
export const useDemoStore = create((set) => ({
  uiVersion: 'v1',
  propertyId: 'p-1',
  role: 'admin',
  dataMode: 'normal',
  authStatus: 'loggedIn',
  demoBarCollapsed: false,
  setUiVersion: (uiVersion) => set({ uiVersion }),
  setPropertyId: (propertyId) => set({ propertyId }),
  setRole: (role) => set({ role }),
  setDataMode: (dataMode) => set({ dataMode }),
  setAuthStatus: (authStatus) => set({ authStatus }),
  toggleDemoBar: () => set((state) => ({ demoBarCollapsed: !state.demoBarCollapsed })),
}));
