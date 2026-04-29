import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, DataTable, FormGrid, Tabs } from '../components/ui.jsx';
import { tableSchemas } from '../config/schemas.js';
import { applyPropertyImageFallback } from '../domain/imageFallbacks.js';
import { auditEvents, credentials, devices, occupancyTransactions } from '../domain/mockData.js';
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
  return (
    <section className="detail-page">
      <div className="breadcrumb">◂ {t('Device Details')}</div>
      <header className="detail-hero">
        <h1>{entity.name}</h1>
        <span>{entity.unitNumber}</span>
      </header>
      <Tabs tabs={[{ id: '', label: 'Settings' }, { id: 'users', label: 'Users' }, { id: 'ekeys', label: 'E-Keys' }, { id: 'audit', label: 'Audit Trail' }]} activeTab="" onChange={() => {}} />
      <div className="settings-grid">
        {['Device Type', 'Device ID', 'MAC Address', 'Lock Installation Date & Time', 'Unit Owner', 'Lock Activated By', 'MCU Module Version', 'Bluetooth Module Version'].map((label, index) => (
          <label className="field" key={label}>
            <span>{t(label)}</span>
            <input value={index === 0 ? entity.category : index === 1 ? entity.id : index === 3 ? entity.installedAt : index > 5 ? '1.1.4' : 'inoxsmartadmin@unisonhardware.com'} readOnly />
          </label>
        ))}
      </div>
      <div className="settings-cards">
        {['Audio and Light Settings', 'Auto-Lock Settings', 'Passage Mode (One-Time)', 'Privacy Mode (One-Time)', 'Passage Mode Recurring Schedule', 'Privacy Mode Recurring Schedule', 'Door Position Sensor (DPS) Settings'].map((title) => (
          <article key={title}>
            <h3>{t(title)}</h3>
            <p>{t('When enabled, device behavior is applied to the selected unit and access users.')}</p>
            <span className="switch" />
          </article>
        ))}
      </div>
    </section>
  );
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
