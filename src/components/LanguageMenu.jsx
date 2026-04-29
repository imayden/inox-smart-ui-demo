import { useEffect, useRef, useState } from 'react';
import { Globe2 } from 'lucide-react';
import { languageOptions } from '../i18n/languages.js';
import { useI18n } from '../i18n/useI18n.js';
import { useDemoStore } from '../demo/demoStore.js';

// Reusable language dropdown for the app shell and login page.
// 可复用语言下拉菜单：顶部导航和登录页共用，保证语言状态全局同步。
export function LanguageMenu({ variant = 'dark' }) {
  const { t } = useI18n();
  const language = useDemoStore((state) => state.language);
  const setLanguage = useDemoStore((state) => state.setLanguage);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    // Close the dropdown when users click outside so the menu behaves like production SaaS navigation.
    // 点击菜单外部时自动关闭，复刻生产 SaaS 顶栏下拉菜单的常见行为。
    const closeOnOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  return (
    <div className={`language-menu language-menu--${variant}`} ref={menuRef}>
      <button
        className="language-menu__trigger"
        type="button"
        aria-label={t('Language')}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
      >
        <Globe2 size={25} />
      </button>
      {isOpen && (
        <div className="language-menu__panel" role="menu">
          {languageOptions.map((option) => (
            <button
              key={option.id}
              className={language === option.id ? 'is-active' : ''}
              type="button"
              role="menuitem"
              onClick={() => {
                // Language is stored globally and persisted in localStorage by demoStore.
                // 语言写入全局状态，并由 demoStore 同步到 localStorage。
                setLanguage(option.id);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
