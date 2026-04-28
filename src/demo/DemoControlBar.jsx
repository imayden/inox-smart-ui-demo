import { ChevronDown, ChevronUp, MonitorCog } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { properties } from '../domain/mockData.js';
import { useDemoStore } from './demoStore.js';
import { useI18n } from '../i18n/useI18n.js';

const uiVersions = ['v1', 'v2', 'v3'];
const roles = ['owner', 'admin', 'member', 'guest'];
const dataModes = ['normal', 'heavy', 'empty', 'restricted'];
const authStatuses = [
  { value: 'loggedIn', label: 'Logged In' },
  { value: 'loggedOut', label: 'Logged Out' },
];

export function DemoControlBar() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const {
    uiVersion,
    propertyId,
    role,
    dataMode,
    authStatus,
    demoBarCollapsed,
    setRole,
    setDataMode,
    setAuthStatus,
    toggleDemoBar,
  } = useDemoStore();

  // Replace only version/property URL segments so the current module stays open.
  // 只替换 URL 中的 UI 版本与物业 ID，避免切换 demo 控件时丢失当前模块路径。
  const updateRoutePart = (nextVersion, nextPropertyId) => {
    const path = location.pathname
      .replace(`/demo/${params.uiVersion || uiVersion}/`, `/demo/${nextVersion}/`)
      .replace(`/property/${params.propertyId || propertyId}/`, `/property/${nextPropertyId}/`);
    navigate(path);
  };

  return (
    <div className={`demo-control ${demoBarCollapsed ? 'is-collapsed' : ''}`}>
      <button className="demo-control__toggle" onClick={toggleDemoBar} aria-label={t('Toggle demo controls')}>
        <MonitorCog size={18} />
        <span>{t('Demo Controls')}</span>
        {demoBarCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
      </button>
      {!demoBarCollapsed && (
        <div className="demo-control__fields">
          <label>
            {t('UI Version')}
            <select value={uiVersion} onChange={(event) => updateRoutePart(event.target.value, propertyId)}>
              {uiVersions.map((version) => (
                <option key={version} value={version}>{version.toUpperCase()}</option>
              ))}
            </select>
          </label>
          <label>
            {t('Login')}
            <select value={authStatus} onChange={(event) => setAuthStatus(event.target.value)}>
              {authStatuses.map((option) => (
                <option key={option.value} value={option.value}>{t(option.label)}</option>
              ))}
            </select>
          </label>
          <label>
            {t('Property')}
            <select value={propertyId} onChange={(event) => updateRoutePart(uiVersion, event.target.value)}>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>{property.name}</option>
              ))}
            </select>
          </label>
          <label>
            {t('Role')}
            <select value={role} onChange={(event) => setRole(event.target.value)}>
              {roles.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <label>
            {t('Data Mode')}
            <select value={dataMode} onChange={(event) => setDataMode(event.target.value)}>
              {dataModes.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
