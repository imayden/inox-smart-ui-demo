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
