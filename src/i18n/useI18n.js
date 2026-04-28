import { useDemoStore } from '../demo/demoStore.js';
import { translateUi } from './languages.js';

// Small hook used by UI components to read the active language from the demo store.
// 小型 hook：所有 UI 组件从 demo store 读取当前语言，再用统一字典翻译系统文案。
export function useI18n() {
  const language = useDemoStore((state) => state.language);
  return {
    language,
    t: (key) => translateUi(key, language),
  };
}
