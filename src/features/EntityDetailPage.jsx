import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Edit3, Eye, EyeOff, KeyRound, RefreshCw, Trash2, Wifi } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, DataTable, FormGrid, Tabs } from '../components/ui.jsx';
import { tableSchemas } from '../config/schemas.js';
import { applyPropertyImageFallback } from '../domain/imageFallbacks.js';
import { auditEvents, credentials, devices, occupancyTransactions, users } from '../domain/mockData.js';
import { getEntity, getModuleRows } from '../domain/selectors.js';
import { useDemoStore } from '../demo/demoStore.js';
import { useI18n } from '../i18n/useI18n.js';

// Detail router: entity type controls layout while the URL pattern stays consistent.
// 详情页按实体类型分流：Property / Device / User 的信息层级不同，但共用路由形态。
export function EntityDetailPage({ moduleId }) {
  const { t } = useI18n();
  const { entityId } = useParams();
  const propertyId = useDemoStore((state) => state.propertyId);
  const entity = getEntity(moduleId, entityId);
  if (!entity) return <div className="module-page"><h1>{t('Not Found')}</h1></div>;

  if (moduleId === 'units') return <UnitDetail entity={entity} propertyId={propertyId} />;
  if (moduleId === 'devices') return <DeviceDetail entity={entity} propertyId={propertyId} />;
  if (moduleId === 'users') return <UserDetail entity={entity} propertyId={propertyId} />;
  return <PropertyDetail entity={entity} />;
}

function PropertyDetail({ entity }) {
  const { t } = useI18n();
  return (
    <section className="detail-page">
      <div className="breadcrumb">◂ {t('Property Details')}</div>
      <Button className="detail-page__update">{t('Update')}</Button>
      <div className="detail-panel property-detail">
        <div>
          <FormGrid
            values={entity}
            fields={[
              { key: 'id', label: 'Property ID:' },
              { key: 'name', label: 'Property Name:' },
              { key: 'address', label: 'Street Address:' },
              { key: 'zipCode', label: 'Zip Code:' },
              { key: 'country', label: 'Country:' },
              { key: 'state', label: 'State:' },
              { key: 'city', label: 'City:' },
              { key: 'timeZone', label: 'Time Zone:' },
              { key: 'owner', label: 'Owner:' },
            ]}
          />
        </div>
        <img src={entity.image} alt={entity.name} onError={applyPropertyImageFallback} />
      </div>
    </section>
  );
}

function DeviceDetail({ entity }) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('settings');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    voiceAudio: 'Medium',
    voiceLanguage: 'English',
    indicatorLights: true,
    autoLock: false,
    autoLockTime: '5s',
    passageMode: false,
    privacyMode: false,
    passageSchedule: false,
    privacySchedule: false,
    adminPassword: '12345678',
    showAdminPassword: false,
    physicalButtonsDisabled: false,
    dps: false,
  });
  const relatedUsers = users.slice(0, 5).map((user, index) => ({
    ...user,
    role: index % 2 ? 'Member' : 'Administrator',
    startTime: '2026-04-25 03:09 PM',
    endTime: '2100-12-31 11:59 PM',
    status: 'Moved-In',
  }));
  const relatedCredentials = credentials.filter((credential) => credential.device === entity.name).length
    ? credentials.filter((credential) => credential.device === entity.name)
    : credentials.slice(0, 5);
  const relatedAudits = auditEvents.filter((event) => event.deviceName === entity.name).length
    ? auditEvents.filter((event) => event.deviceName === entity.name)
    : auditEvents.slice(0, 8);

  const updateForm = (key, value) => {
    // Device Settings are local draft state in the demo; Confirm simulates pushing changes to the lock.
    // Device Settings 在 demo 中是本地草稿状态；Confirm 用来模拟向设备下发配置。
    setForm((current) => ({ ...current, [key]: value }));
    setDirty(true);
  };

  const toggleAdminPasswordVisibility = () => {
    // Password visibility is only a view preference, so it should not mark the form as changed.
    // 密码显示/隐藏只是查看偏好，不应触发“有未保存修改”的状态。
    setForm((current) => ({ ...current, showAdminPassword: !current.showAdminPassword }));
  };

  const saveChanges = () => {
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      setDirty(false);
    }, 700);
  };

  return (
    <section className="detail-page device-detail-page">
      <div className="breadcrumb">◂ {t('Device Details')}</div>
      <header className="detail-hero device-detail-hero">
        <div>
          <h1>{entity.name} <Edit3 size={18} /></h1>
          <span>{deviceUnitLabel(entity.unitNumber)}</span>
        </div>
        <SmartLockIllustration />
      </header>
      <Tabs
        tabs={[
          { id: 'settings', label: 'Settings' },
          { id: 'users', label: 'Users' },
          { id: 'ekeys', label: 'E-Keys' },
          { id: 'audit', label: 'Audit Trail' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
      {activeTab === 'settings' && (
        <>
          {saving && <div className="device-saving-mask"><RefreshCw className="spin" /> {t('Saving device settings...')}</div>}
          <div className="device-settings-body">
            <div className="settings-grid device-settings-grid">
              {deviceSettingFields(entity).map((field) => (
                <label className="field" key={field.label}>
                  <span>{t(field.label)}</span>
                  <input value={field.value} readOnly />
                </label>
              ))}
            </div>
            <div className="device-settings-cards">
              <DeviceSettingCard title="Audio and Light Settings">
                <SettingSelect label="Lock Voice Audio" value={form.voiceAudio} options={['High', 'Medium', 'Low', 'Mute']} onChange={(value) => updateForm('voiceAudio', value)} />
                <SettingSelect label="Lock Voice Language" value={form.voiceLanguage} options={['English', 'Español', '中文']} onChange={(value) => updateForm('voiceLanguage', value)} />
                <SettingSwitch label="Lock Indicator Lights" checked={form.indicatorLights} onChange={(value) => updateForm('indicatorLights', value)} />
              </DeviceSettingCard>
              <DeviceSettingCard title="Auto-Lock Settings">
                <SettingSwitch label="Auto-Lock" checked={form.autoLock} onChange={(value) => updateForm('autoLock', value)} />
                <SettingSelect label="Auto-Lock Time" value={form.autoLockTime} options={['0', '5s', '10s', '30s', '60s']} onChange={(value) => updateForm('autoLockTime', value)} />
              </DeviceSettingCard>
              <DeviceSettingCard title="Lock Mode Settings" subtitle="Passage Mode (One-Time)" helper="When Passage Mode is enabled, the Auto-Lock function will be temporarily disabled, and the door will remain unlocked.">
                <SettingSwitch checked={form.passageMode} onChange={(value) => updateForm('passageMode', value)} />
              </DeviceSettingCard>
              <DeviceSettingCard title="Lock Mode Settings" subtitle="Privacy Mode (One-Time)" helper="When Privacy Mode is enabled, the door will remain locked. Users will not be able to unlock the door using digital credentials until Privacy Mode is turned off.">
                <SettingSwitch checked={form.privacyMode} onChange={(value) => updateForm('privacyMode', value)} />
              </DeviceSettingCard>
              <DeviceSettingCard title="Lock Mode Settings" subtitle="Passage Mode Recurring Schedule" helper="When Passage Mode is enabled, the Auto-Lock function will be temporarily disabled, and the door will remain unlocked.">
                <SettingSwitch checked={form.passageSchedule} onChange={(value) => updateForm('passageSchedule', value)} />
              </DeviceSettingCard>
              <DeviceSettingCard title="Lock Mode Settings" subtitle="Privacy Mode Recurring Schedule" helper="When Privacy Mode is enabled, the door will remain locked. Users will not be able to unlock the door using digital credentials until Privacy Mode is turned off.">
                <SettingSwitch checked={form.privacySchedule} onChange={(value) => updateForm('privacySchedule', value)} />
              </DeviceSettingCard>
              <KeypadConfigurationsCard
                password={form.adminPassword}
                isVisible={form.showAdminPassword}
                onPasswordChange={(value) => updateForm('adminPassword', value)}
                onToggleVisibility={toggleAdminPasswordVisibility}
              />
              <PhysicalButtonControlsCard
                disabled={form.physicalButtonsDisabled}
                onChange={(value) => updateForm('physicalButtonsDisabled', value)}
              />
              <DeviceSettingCard title="Door Position Sensor (DPS) Settings" subtitle="Activate Door Position Sensor (DPS)" helper="Activate installed door position sensor (DPS) to monitor door's open and close status.">
                <SettingSwitch checked={form.dps} onChange={(value) => updateForm('dps', value)} />
              </DeviceSettingCard>
            </div>
          </div>
          <div className="device-danger-row">
            <DeviceDangerAction title="Remove Device" text="The device is taken out of active use but is not erased from the system." />
            <DeviceDangerAction title="Delete Device" text="The device is permanently erased from the system." />
          </div>
          <div className="form-footer device-detail-footer">
            <Button variant="muted">{t('Cancel')}</Button>
            <Button disabled={saving} onClick={saveChanges}>{t('Confirm')}</Button>
          </div>
        </>
      )}
      {activeTab === 'users' && <DeviceUsersTable rows={relatedUsers} />}
      {activeTab === 'ekeys' && <DataTable columns={tableSchemas.access} rows={relatedCredentials} />}
      {activeTab === 'audit' && <DataTable columns={tableSchemas.securityAudit} rows={relatedAudits} />}
    </section>
  );
}

function DeviceSettingCard({ title, subtitle, helper, children, className = '' }) {
  const { t } = useI18n();
  return (
    <article className={`device-setting-card ${helper ? 'device-setting-card--mode' : ''} ${className}`}>
      <h3>{t(title)}</h3>
      <div className="device-setting-card__body">
        {subtitle && <b>{t(subtitle)}</b>}
        {helper && <p>{t(helper)}</p>}
        {children}
      </div>
    </article>
  );
}

function KeypadConfigurationsCard({ password, isVisible, onPasswordChange, onToggleVisibility }) {
  const { t } = useI18n();
  return (
    <DeviceSettingCard title="Keypad Configurations" className="device-setting-card--keypad">
      <label className="device-password-row">
        <span>{t('Admin Password')}</span>
        <span className="device-password-control">
          <input
            type={isVisible ? 'text' : 'password'}
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            aria-label={t('Admin Password')}
          />
          <button type="button" onClick={onToggleVisibility} aria-label={t('Toggle admin password visibility')}>
            {isVisible ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </span>
      </label>
      <p className="device-setting-helper">{t('The admin password is used to access the physical keypad, change lock settings, and program new RFID E-Keys.')}</p>
    </DeviceSettingCard>
  );
}

function PhysicalButtonControlsCard({ disabled, onChange }) {
  const { t } = useI18n();
  const statusLabel = disabled ? 'Enabled' : 'Disabled';
  return (
    <DeviceSettingCard title="Physical Button Controls" className="device-setting-card--physical-buttons">
      <div className="device-lock-buttons-row">
        <strong>
          {t('Lock Physical Buttons')}: <span className={`device-lock-buttons-state ${disabled ? 'is-on' : ''}`}>{t(statusLabel)}</span>
        </strong>
        <label className="device-inline-switch" aria-label={t('Lock Physical Buttons')}>
          <input type="checkbox" checked={disabled} onChange={(event) => onChange(event.target.checked)} />
          <span className={`switch ${disabled ? 'is-on' : ''}`} />
        </label>
      </div>
      <p className="device-setting-helper">{t('Disable the physical buttons on the lock to prevent users from changing settings directly on the device.')}</p>
    </DeviceSettingCard>
  );
}

function SettingSelect({ label, value, options, onChange }) {
  const { t } = useI18n();
  return (
    <label className="device-setting-row">
      {label && <span>{t(label)}</span>}
      <DeviceCustomSelect value={value} options={options} onChange={onChange} />
    </label>
  );
}

function SettingSwitch({ label, checked, onChange }) {
  const { t } = useI18n();
  return (
    <label className={`device-setting-row device-setting-row--switch ${label ? '' : 'device-setting-row--floating-switch'}`}>
      {label && <span>{t(label)}</span>}
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className={`switch ${checked ? 'is-on' : ''}`} />
    </label>
  );
}

function DeviceDangerAction({ title, text }) {
  const { t } = useI18n();
  return (
    <article className="device-danger-action">
      <span><Trash2 size={24} /></span>
      <div>
        <h3>{t(title)}</h3>
        <p>{t(text)}</p>
      </div>
    </article>
  );
}

function DeviceCustomSelect({ value, options, onChange }) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const fieldRef = useRef(null);

  // Device Details uses the same custom dropdown behavior seen in the recording, including outside-click dismissal.
  // Device Details 按录屏使用自定义下拉菜单，并支持点击外部区域自动收起。
  useOutsideDismiss(fieldRef, isOpen, () => setIsOpen(false));

  return (
    <span className="custom-select device-custom-select" ref={fieldRef}>
      <button type="button" className={isOpen ? 'is-open' : ''} onClick={() => setIsOpen((open) => !open)}>
        {t(value)}
        <ChevronDown size={14} />
      </button>
      <span className={`custom-select__menu ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen}>
        {options.map((option) => (
          <button
            type="button"
            key={option}
            className={value === option ? 'is-selected' : ''}
            onClick={() => {
              onChange(option);
              setIsOpen(false);
            }}
          >
            {t(option)}
          </button>
        ))}
      </span>
    </span>
  );
}

function SmartLockIllustration() {
  return (
    <div className="device-detail-hero__icon" aria-hidden="true">
      <div className="smart-lock-glyph">
        <span className="smart-lock-glyph__body" />
        <span className="smart-lock-glyph__handle" />
        <Wifi className="smart-lock-glyph__wifi" size={42} />
        <KeyRound className="smart-lock-glyph__key" size={42} />
      </div>
    </div>
  );
}

function DeviceUsersTable({ rows }) {
  const { t } = useI18n();
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th className="checkbox-cell"><input type="checkbox" /></th>
            {['User Name', 'User Email Address', 'Phone Number', 'Role', 'Start Time', 'End Time', 'Status', 'Action'].map((header) => (
              <th key={header}>{t(header)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="checkbox-cell"><input type="checkbox" /></td>
              <td>{row.name}</td>
              <td>{row.email}</td>
              <td>{row.phone || '-'}</td>
              <td>{t(row.role)}</td>
              <td>{row.startTime}</td>
              <td>{row.endTime}</td>
              <td>{t(row.status)}</td>
              <td className="action-cell"><KeyRound size={18} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function deviceSettingFields(entity) {
  return [
    { label: 'Device Type', value: entity.category },
    { label: 'Device ID', value: entity.id },
    { label: 'MAC Address', value: 'DC:23:4F:0A:24:2B' },
    { label: 'Lock Installation Date & Time', value: entity.installedAt },
    { label: 'Unit Owner', value: 'inoxsmartadmin@unisonhardware.com' },
    { label: 'Lock Activated By', value: 'inoxsmartadmin@unisonhardware.com' },
    { label: 'MCU Module Version', value: '2.3.8' },
    { label: 'Bluetooth Module Version', value: '5.1' },
  ];
}

function deviceUnitLabel(unitNumber) {
  const parts = unitNumber.split('-');
  return `${parts.slice(2).join('-')} | ${parts[1] || '1st Floor'} | ${parts[0] || 'Main Building'}`;
}

function useOutsideDismiss(ref, enabled, onDismiss) {
  // Shared outside-click listener for floating controls.
  // 浮层控件共用的外部点击监听。
  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return undefined;

    const handlePointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onDismiss();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [enabled, onDismiss, ref]);
}

function UnitDetail({ entity, propertyId }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const uiVersion = useDemoStore((state) => state.uiVersion);
  const [activeTab, setActiveTab] = useState('users');
  const [activeUserTab, setActiveUserTab] = useState('all');
  // The production Unit Detail page mixes live user/unit relationships with nested tabs; mock rows preserve that shape.
  // 线上 Unit Detail 同时承载用户-单元关系和多层 tab；这里用 mock rows 保留相同信息结构。
  const userRows = getModuleRows('users', propertyId).slice(0, 8).map((user, index) => ({
    ...user,
    role: index === 0 ? 'Owner' : index % 3 === 0 ? 'Administrator' : index % 2 === 0 ? 'Member' : 'Guest',
    mainResident: index % 2 === 0,
    startTime: index === 0 ? '-' : '2026-04-25 03:09 PM',
    endTime: index === 0 ? '-' : '2100-12-31 11:59 PM',
    status: 'Moved-In',
  }));
  const visibleUserRows = useMemo(() => {
    // Inner user tabs filter the same unit-user relationship table instead of changing route.
    // 内层用户 tab 只筛选同一张 Unit-User 关系表，不改变路由。
    if (activeUserTab === 'all') return userRows;
    if (activeUserTab === 'pending' || activeUserTab === 'accessible') return [];
    return userRows.filter((row) => row.role.toLowerCase() === activeUserTab);
  }, [activeUserTab, userRows]);
  const unitDevices = devices.filter((device) => device.unitId === entity.id);
  // Related tables derive from the unit identity first and fall back to demo samples when no exact match exists.
  // 关联表优先按 Unit 身份过滤；没有精确 mock 数据时回退到示例数据，避免空白页面影响评审。
  const unitCredentials = credentials.filter((credential) => credential.unitNumber === entity.unitNumber || credential.unitNumber.includes(entity.name)).slice(0, 8);
  const unitAudits = auditEvents.filter((event) => event.unitNumber === entity.unitNumber || event.unitNumber.includes(entity.name)).slice(0, 8);
  const unitOccupancy = occupancyTransactions.filter((item) => item.unitId === entity.id || item.unitNumber === entity.unitNumber).slice(0, 8);

  // Unit Detail is one real entry point for Move-In, matching the production workflow.
  // Unit Detail 是 Move-In 的真实入口之一，按钮直接进入批量 Move-In 页面。
  return (
    <section className="detail-page">
      <div className="breadcrumb">◂ {t('Unit Details')}</div>
      <header className="detail-hero unit-detail-hero">
        <div>
          <h1>{entity.name}</h1>
          <span>{entity.floor} | {entity.building} {entity.tag} - 1.INOXHQ - Sacramento - California</span>
        </div>
        <div className="detail-hero__actions">
          <Button>{t('+ Add User')}</Button>
          <Button onClick={() => navigate(`/demo/${uiVersion}/property/${propertyId}/occupancy/move-in`)}>{t('Move-In')}</Button>
          <Button variant="muted">{t('Action')}</Button>
        </div>
        <img src={entity.photo} alt={entity.name} />
      </header>
      <Tabs
        tabs={[
          { id: 'users', label: 'Users' },
          { id: 'devices', label: 'Devices' },
          { id: 'ekeys', label: 'E-Keys' },
          { id: 'audit', label: 'Audit Trail' },
          { id: 'occupancy', label: 'Occupancy Log' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
      {activeTab === 'users' && (
        <>
          <Tabs
            tabs={[
              { id: 'all', label: 'All (Checked-In)' },
              { id: 'member', label: 'Member' },
              { id: 'guest', label: 'Guest' },
              { id: 'administrator', label: 'Administrator' },
              { id: 'owner', label: 'Owner' },
              { id: 'pending', label: 'Pending' },
              { id: 'accessible', label: 'Accessible Users' },
            ]}
            activeTab={activeUserTab}
            onChange={setActiveUserTab}
          />
          <UnitUsersTable rows={visibleUserRows} />
        </>
      )}
      {activeTab === 'devices' && (
        <DataTable columns={tableSchemas.devices} rows={unitDevices.length ? unitDevices : devices.slice(0, 3)} />
      )}
      {activeTab === 'ekeys' && (
        <DataTable columns={tableSchemas.access} rows={unitCredentials.length ? unitCredentials : credentials.slice(0, 4)} />
      )}
      {activeTab === 'audit' && (
        <DataTable columns={tableSchemas.securityAudit} rows={unitAudits.length ? unitAudits : auditEvents.slice(0, 5)} />
      )}
      {activeTab === 'occupancy' && (
        <DataTable columns={tableSchemas.occupancy} rows={unitOccupancy.length ? unitOccupancy : occupancyTransactions.slice(0, 5)} />
      )}
    </section>
  );
}

function UnitUsersTable({ rows }) {
  const { t } = useI18n();
  // Unit user table is custom because it has nested role/status columns not shared with the generic DataTable schema.
  // Unit 用户表为定制表格，因为它包含通用 DataTable schema 没有的角色与入住状态列。
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th className="checkbox-cell"><input type="checkbox" /></th>
            <th>{t('User Name')}</th>
            <th>{t('User Email Address')}</th>
            <th>{t('Phone Number')}</th>
            <th>{t('Role')}</th>
            <th>{t('Main Resident')}</th>
            <th>{t('Start Time')}</th>
            <th>{t('End Time')}</th>
            <th>{t('Status')}</th>
            <th>{t('Action')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="checkbox-cell"><input type="checkbox" /></td>
              <td>{row.name}</td>
              <td>{row.email}</td>
              <td>{row.phone || '-'}</td>
              <td>{t(row.role)}</td>
              <td><span className={`status-box ${row.mainResident ? 'is-on' : ''}`} /></td>
              <td>{row.startTime}</td>
              <td>{row.endTime}</td>
              <td>{t(row.status)}</td>
              <td>-</td>
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td colSpan="10"><div className="empty-state">{t('No data')}</div></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function UserDetail({ entity, propertyId }) {
  const { t } = useI18n();
  // User detail embeds occupancy rows to show the relationship between users and units.
  // User 详情内嵌该用户的 Occupancy 记录，展示用户与 Unit 关系。
  const rows = getModuleRows('occupancy', propertyId);
  return (
    <section className="detail-page">
      <div className="breadcrumb">◂ {t('Users')}</div>
      <header className="detail-hero user-hero">
        <div className="avatar-large">⌾</div>
        <div>
          <h1>{entity.name}</h1>
          <span><b>{t('Email Address')}:</b> {entity.email}</span>
        </div>
        <div className="detail-hero__actions">
          <Button variant="muted">{t('Edit')}</Button>
          <Button>{t('Move-In')}</Button>
          <Button>{t('Move-Out')}</Button>
        </div>
      </header>
      <h2>{t('General Info')}</h2>
      <div className="settings-grid">
        {['firstName', 'lastName', 'email', 'phone', 'gender', 'type', 'group', 'tag1', 'tag2'].map((key) => (
          <label className="field" key={key}><span>{t(labelize(key))}</span><input value={entity[key] || ''} readOnly /></label>
        ))}
      </div>
      <h2>{t('Details')}</h2>
      <Tabs tabs={[{ id: '', label: 'Units' }, { id: 'mobile', label: 'Mobile Accesses' }, { id: 'ekeys', label: 'E-Keys' }, { id: 'devices', label: 'Devices' }, { id: 'audit', label: 'Audit Trail' }, { id: 'occupancy', label: 'Occupancy Log' }]} activeTab="" onChange={() => {}} />
      <DataTable columns={tableSchemas.occupancy} rows={rows} />
    </section>
  );
}

function labelize(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
}
