import { useEffect, useState } from 'react';
import {
  Bell,
  Building2,
  ChevronLeft,
  ChevronRight,
  Globe2,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';
import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import { topNavigation } from '../../config/navigation.config.js';
import { properties } from '../../domain/mockData.js';
import { useDemoStore } from '../../demo/demoStore.js';

// v1.0 外壳复刻当前线上 SaaS：顶部模块导航 + 左侧物业导航 + 响应式移动端 overlay。
export function V1Shell({ children, menuIcon }) {
  const { uiVersion = 'v1', propertyId = 'p-1' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const setPropertyId = useDemoStore((state) => state.setPropertyId);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPropertyOverlayOpen, setIsPropertyOverlayOpen] = useState(false);
  const [isModuleMenuOpen, setIsModuleMenuOpen] = useState(false);

  const activeModule = location.pathname.split('/').at(-1);
  const currentProperty = properties.find((property) => property.id === propertyId) ?? properties[0];

  useEffect(() => {
    // 切换路由时自动收起移动端菜单，避免页面内容被旧 overlay 遮挡。
    setIsPropertyOverlayOpen(false);
    setIsModuleMenuOpen(false);
  }, [location.pathname]);

  const switchProperty = (nextPropertyId) => {
    // 物业是权限与数据的上层上下文，切换时同步 URL 和全局 store。
    setPropertyId(nextPropertyId);
    const path = location.pathname.replace(`/property/${propertyId}/`, `/property/${nextPropertyId}/`);
    navigate(path);
  };

  const moduleNav = (
    <nav className={`top-nav__links ${isModuleMenuOpen ? 'is-open' : ''}`} aria-label="Primary modules">
      {topNavigation.map((item) => (
        <NavLink
          key={item.id}
          to={`/demo/${uiVersion}/property/${propertyId}/${item.path}`}
          className={({ isActive }) => isActive || activeModule === item.path ? 'is-active' : ''}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  const propertyNav = (
    <aside className="property-sidebar" aria-label="Property switcher">
      <div className="property-sidebar__top">
        <p>All Properties</p>
        <button
          className="property-sidebar__close"
          type="button"
          aria-label="Close property menu"
          onClick={() => setIsPropertyOverlayOpen(false)}
        >
          <X size={20} />
        </button>
      </div>
      <button
        className="property-sidebar__collapse"
        type="button"
        aria-label={isSidebarCollapsed ? 'Expand property sidebar' : 'Collapse property sidebar'}
        onClick={() => setIsSidebarCollapsed((value) => !value)}
      >
        {isSidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        <span>{isSidebarCollapsed ? 'Expand' : 'Collapse'}</span>
      </button>
      <div className="sidebar-search">⌕ Search here...</div>
      {properties.map((property) => (
        <button
          key={property.id}
          className={property.id === propertyId ? 'is-active' : ''}
          title={property.name}
          onClick={() => switchProperty(property.id)}
        >
          <Building2 size={22} />
          <span>{property.name}</span>
        </button>
      ))}
      <footer>© 2026 INOX by Unison Hardware<br />Version 1.0.12</footer>
    </aside>
  );

  return (
    <div
      className={[
        'product-shell v1-shell',
        isSidebarCollapsed ? 'is-sidebar-collapsed' : '',
        isPropertyOverlayOpen ? 'is-property-overlay-open' : '',
        isModuleMenuOpen ? 'is-module-menu-open' : '',
      ].filter(Boolean).join(' ')}
    >
      <header className="top-nav">
        <div className="brand" aria-label="INOX Smart">
          <img src="/reference-assets/nav/inox-smart-header-logo.png" alt="INOX Smart" />
        </div>
        {moduleNav}
        <div className="top-nav__right">
          <Globe2 size={25} />
          <Bell size={24} />
          <span className="divider" />
          <img src="https://i.pravatar.cc/96?img=12" alt="" />
          <span>INOX Smart Admin</span>
          <button
            className="top-nav__menu"
            type="button"
            aria-expanded={isModuleMenuOpen}
            aria-label="Open module navigation"
            onClick={() => setIsModuleMenuOpen((value) => !value)}
          >
            {isModuleMenuOpen ? <X size={22} /> : (menuIcon ?? <Menu size={22} />)}
          </button>
        </div>
      </header>
      <div className="mobile-property-bar">
        <button type="button" onClick={() => setIsPropertyOverlayOpen(true)}>
          <Building2 size={18} />
          <span>{currentProperty.name}</span>
          <ChevronRight size={18} />
        </button>
      </div>
      <button
        className="property-overlay-backdrop"
        type="button"
        aria-label="Close property menu"
        onClick={() => setIsPropertyOverlayOpen(false)}
      />
      {propertyNav}
      <button
        className="desktop-sidebar-edge"
        type="button"
        aria-label={isSidebarCollapsed ? 'Expand property sidebar' : 'Collapse property sidebar'}
        onClick={() => setIsSidebarCollapsed((value) => !value)}
      >
        {isSidebarCollapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
      </button>
      <main className="main-content">{children}</main>
    </div>
  );
}
