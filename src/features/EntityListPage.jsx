import { useMemo, useState } from 'react';
import {
  Edit3,
  Grid2X2,
  List,
  Lock,
  MessageSquare,
  RefreshCw,
  Trash2,
  Unlock,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, DataTable, Modal, PageHeader, SearchPanel, Tabs } from '../components/ui.jsx';
import { moduleMeta } from '../config/navigation.config.js';
import { filterSchemas, tableSchemas, tabSchemas } from '../config/schemas.js';
import { useDemoStore } from '../demo/demoStore.js';
import { applyPropertyImageFallback, PROPERTY_IMAGE_FALLBACK } from '../domain/imageFallbacks.js';
import { devices } from '../domain/mockData.js';
import { getModuleRows, getProperty } from '../domain/selectors.js';
import { useI18n } from '../i18n/useI18n.js';

// Generic list page: moduleId + schema decide fields, tabs and table structure.
// 通用列表页承载 Units / Devices / Users / Access / Occupancy / Security，差异由 moduleId + schema 决定。
export function EntityListPage({ moduleId }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const propertyId = useDemoStore((state) => state.propertyId);
  const uiVersion = useDemoStore((state) => state.uiVersion);
  const [activeTab, setActiveTab] = useState(tabSchemas[moduleId]?.[0]?.id ?? '');
  const [modalRow, setModalRow] = useState(null);
  const [propertyView, setPropertyView] = useState('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [visiblePropertyColumns, setVisiblePropertyColumns] = useState(() => tableSchemas.properties.map((column) => column.key));
  const property = getProperty(propertyId);
  const meta = moduleMeta[moduleId];

  const rows = useMemo(() => getModuleRows(moduleId, propertyId, activeTab), [moduleId, propertyId, activeTab]);
  const baseColumns = moduleId === 'security' && activeTab === 'audit' ? tableSchemas.securityAudit : tableSchemas[moduleId];
  const columns = moduleId === 'properties'
    ? baseColumns.filter((column) => visiblePropertyColumns.includes(column.key))
    : baseColumns;

  if (moduleId === 'devices') {
    return <DeviceListPage property={property} propertyId={propertyId} uiVersion={uiVersion} />;
  }

  const handleEdit = (row) => {
    // Full-detail entities navigate to detail pages; lightweight edits stay in a modal.
    // 需要完整详情页的实体走路由；轻量编辑操作先用弹窗模拟。
    if (moduleId === 'properties') {
      setModalRow(row);
      return;
    }
    if (['devices', 'users'].includes(moduleId)) {
      navigate(`/demo/${uiVersion}/property/${propertyId}/${moduleId}/${row.id}`);
      return;
    }
    setModalRow(row);
  };

  const handleHeaderAction = () => {
    // Header actions route into the two guided workflows: Grant Access and Move-In.
    // Access 的主按钮进入 Grant Access 表单；Occupancy 的主按钮进入批量 Move-In 流程。
    if (moduleId === 'properties') {
      setModalRow({ id: 'new-property', name: '', address: '', owner: '' });
      return;
    }
    if (moduleId === 'access') {
      navigate(`/demo/${uiVersion}/property/${propertyId}/access/grant`);
      return;
    }
    if (moduleId === 'occupancy') {
      navigate(`/demo/${uiVersion}/property/${propertyId}/occupancy/move-in`);
    }
  };

  const handleRowClick = (row) => {
    // Unit rows mirror production behavior: click anywhere to open Unit Details in a new tab.
    // Unit 列表复刻线上交互：点击整行任意空白/内容区域，在新标签页打开对应 Unit Detail。
    if (moduleId !== 'units') return;
    window.open(`/demo/${uiVersion}/property/${propertyId}/units/${row.id}`, '_blank', 'noopener,noreferrer');
  };

  if (moduleId === 'properties') {
    return (
      <section className="module-page properties-page">
        {/* Properties has a dedicated grid/list header because it is both a global module and the property switcher source. */}
        {/* Properties 需要独立的宫格/列表页头，因为它既是全局模块，也是物业切换数据来源。 */}
        <PropertiesHeader
          view={propertyView}
          setView={setPropertyView}
          filterOpen={filterOpen}
          setFilterOpen={setFilterOpen}
          visibleColumns={visiblePropertyColumns}
          setVisibleColumns={setVisiblePropertyColumns}
          onAdd={handleHeaderAction}
        />
        <SearchPanel fields={filterSchemas.properties} />
        {propertyView === 'grid' ? (
          <PropertyCardGrid rows={rows} onOpen={(row) => navigate(`/demo/${uiVersion}/property/${propertyId}/properties/${row.id}`)} onEdit={handleEdit} />
        ) : (
          <DataTable columns={columns} rows={rows} onEdit={handleEdit} onRowClick={(row) => navigate(`/demo/${uiVersion}/property/${propertyId}/properties/${row.id}`)} />
        )}
        {modalRow && (
          <Modal title={modalRow.id === 'new-property' ? '+ Add Property' : 'Update Property'} onClose={() => setModalRow(null)}>
            <PropertyEditorMock row={modalRow} onClose={() => setModalRow(null)} />
          </Modal>
        )}
      </section>
    );
  }

  return (
    <section className="module-page">
      <PageHeader title={meta.title} property={moduleId === 'properties' ? null : property} action={meta.action} onAction={handleHeaderAction} />
      <Tabs tabs={tabSchemas[moduleId]} activeTab={activeTab} onChange={setActiveTab} />
      <SearchPanel fields={filterSchemas[moduleId]} />
      <div className="section-title-row">
        <h2>{t(listTitle(moduleId, activeTab))}</h2>
        {moduleId === 'access' && (
          <div className="inline-actions">
            <Button>{t('Read RFIDs')}</Button>
            <Button onClick={() => navigate(`/demo/${uiVersion}/property/${propertyId}/access/grant`)}>{t('+ Add RFID Key')}</Button>
          </div>
        )}
      </div>
      <DataTable columns={columns} rows={rows} onEdit={handleEdit} onRowClick={moduleId === 'units' ? handleRowClick : undefined} />
      {modalRow && (
        <Modal title={moduleId === 'units' ? 'Update Unit' : 'Update Item'} onClose={() => setModalRow(null)}>
          <UnitUpdateMock row={modalRow} onClose={() => setModalRow(null)} />
        </Modal>
      )}
    </section>
  );
}

function PropertiesHeader({ view, setView, filterOpen, setFilterOpen, visibleColumns, setVisibleColumns, onAdd }) {
  const { t } = useI18n();
  const propertyColumns = tableSchemas.properties.filter((column) => column.key !== 'image');
  const allVisible = propertyColumns.every((column) => visibleColumns.includes(column.key));

  const toggleColumn = (key) => {
    // Column visibility is local UI state only; tableSchemas remains the canonical column definition.
    // 列显示状态只是当前页面状态；tableSchemas 仍是正式的列定义来源。
    setVisibleColumns((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  };

  return (
    <header className="page-header property-page-header">
      <h1>{t('Properties')}</h1>
      <div className="page-header__actions property-toolbar">
        <div className="filter-popover-wrap">
          <Button variant="muted" onClick={() => setFilterOpen(!filterOpen)}>{t('Filter')}</Button>
          {filterOpen && (
            <div className="filter-popover">
              <label><input type="checkbox" checked={allVisible} onChange={(event) => setVisibleColumns(event.target.checked ? tableSchemas.properties.map((column) => column.key) : ['image'])} /> {t('Check all')}</label>
              {propertyColumns.map((column) => (
                <label key={column.key}>
                  <input type="checkbox" checked={visibleColumns.includes(column.key)} onChange={() => toggleColumn(column.key)} /> {t(column.label)}
                </label>
              ))}
              <div className="filter-popover__actions">
                <Button onClick={() => setFilterOpen(false)}>{t('Apply')}</Button>
                <Button variant="muted" onClick={() => setVisibleColumns(tableSchemas.properties.map((column) => column.key))}>{t('Reset')}</Button>
              </div>
            </div>
          )}
        </div>
        <button className="icon-only" aria-label={t('List view')} onClick={() => setView('list')}><List className={view === 'list' ? 'state-green' : ''} /></button>
        <button className="icon-only" aria-label={t('Grid view')} onClick={() => setView('grid')}><Grid2X2 className={view === 'grid' ? 'state-green' : ''} /></button>
        <Button onClick={onAdd}>{t('+ Add Property')}</Button>
      </div>
    </header>
  );
}

function PropertyCardGrid({ rows, onOpen, onEdit }) {
  const { t } = useI18n();
  return (
    <div className="property-card-grid">
      {/* Whole card opens property details; inner action buttons stop propagation to keep their own actions. */}
      {/* 整张卡片点击进入详情；内部按钮会阻止冒泡，避免误触详情跳转。 */}
      {rows.map((row) => (
        <article className="property-card" key={row.id} onClick={() => onOpen(row)}>
          <img src={row.image} alt={row.name} onError={applyPropertyImageFallback} />
          <h2>{row.name}</h2>
          <p>{row.address} · {row.country}</p>
          <div className="property-card__actions" onClick={(event) => event.stopPropagation()}>
            <button aria-label={t('Details')} onClick={() => onOpen(row)}><MessageSquare size={22} /></button>
            <button aria-label={t('Delete')}><Trash2 size={22} /></button>
            <Button variant="muted" onClick={() => onEdit(row)}>{t('Update')}</Button>
          </div>
        </article>
      ))}
    </div>
  );
}

function PropertyEditorMock({ row, onClose }) {
  const { t } = useI18n();
  // This mock editor documents the expected property fields without persisting data yet.
  // 这个模拟编辑器用于展示物业字段结构，当前暂不做数据持久化。
  return (
    <div className="modal-form property-editor">
      <div className="unit-photo-box">
        <label>* {t('Photo')}</label>
        <img src={row.image || PROPERTY_IMAGE_FALLBACK} alt="" onError={applyPropertyImageFallback} />
        <small>{t('File Format')}: .jpg .jpeg .png</small>
      </div>
      <label className="field"><span>{t('Property ID')}</span><input value={row.id || ''} readOnly /></label>
      {['Property Name', 'Street Address', 'City', 'State', 'Zip Code', 'Country', 'Owner', 'Time Zone'].map((label) => (
        <label className="field" key={label}>
          <span>{t(label)}</span>
          <input defaultValue={row[labelKey(label)] || ''} placeholder={t(label)} />
        </label>
      ))}
      <div className="modal-actions modal-form__wide">
        <Button variant="muted" onClick={onClose}>{t('Cancel')}</Button>
        <Button onClick={onClose}>{t('Confirm')}</Button>
      </div>
    </div>
  );
}

function labelKey(label) {
  return {
    'Property Name': 'name',
    'Street Address': 'address',
    'Zip Code': 'zipCode',
    'Time Zone': 'timeZone',
  }[label] ?? label.charAt(0).toLowerCase() + label.slice(1);
}

function listTitle(moduleId, activeTab) {
  if (moduleId === 'access') return 'E-Keys';
  if (moduleId === 'occupancy') return activeTab === 'pending' ? 'Pending Occupancy' : 'Confirmed Occupancy';
  if (moduleId === 'security') return activeTab === 'audit' ? 'Audit Trail' : activeTab === 'passage' ? 'Devices' : activeTab === 'privacy' ? 'Devices' : 'Current Door Propped Alerts';
  return moduleId.charAt(0).toUpperCase() + moduleId.slice(1);
}

function DeviceListPage({ property, propertyId, uiVersion }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('');
  const [lockModal, setLockModal] = useState(null);
  const [lockState, setLockState] = useState('locked');
  const baseRows = useMemo(() => getModuleRows('devices', propertyId), [propertyId]);
  const rows = useMemo(() => getDeviceTabRows(activeTab, baseRows), [activeTab, baseRows]);
  const fields = activeTab === 'pending' ? devicePendingFilters : activeTab === 'unpaired' ? deviceUnpairedFilters : filterSchemas.devices;
  const title = activeTab === 'pending' ? 'Pending Occupancy' : activeTab === 'unpaired' ? 'Unpaired Devices' : `${deviceTabLabel(activeTab)} Devices`;

  const openDevice = (row) => navigate(`/demo/${uiVersion}/property/${propertyId}/devices/${row.id}`);

  const openLockModal = (row) => {
    // Lock controls are simulated locally; they document the expected device-command surface for engineers.
    // 锁控弹窗只做本地模拟，用来说明后续真实设备指令应挂接的位置。
    setLockState(row.status === 'online' ? 'unlocked' : 'locked');
    setLockModal(row);
  };

  return (
    <section className="module-page devices-page">
      <PageHeader title="Devices" property={property} action="+ Add Device" onAction={() => {}} />
      <Tabs tabs={tabSchemas.devices} activeTab={activeTab} onChange={setActiveTab} />
      <SearchPanel fields={fields} />
      <div className="section-title-row">
        <h2>{t(title)}</h2>
      </div>
      {activeTab === 'pending' ? (
        <DevicePendingTable rows={rows} onEdit={() => openDevice(baseRows[0] ?? devices[0])} />
      ) : activeTab === 'unpaired' ? (
        <DeviceUnpairedTable rows={rows} />
      ) : (
        <DeviceTable rows={rows} onEdit={openDevice} onLock={openLockModal} />
      )}
      {lockModal && (
        <DeviceLockModal
          device={lockModal}
          lockState={lockState}
          setLockState={setLockState}
          onClose={() => setLockModal(null)}
        />
      )}
    </section>
  );
}

function DeviceTable({ rows, onEdit, onLock }) {
  const { t } = useI18n();
  return (
    <div className="table-wrap device-table-wrap">
      <table className="data-table device-table">
        <thead>
          <tr>
            <th className="checkbox-cell"><input type="checkbox" /></th>
            {['Device Name', 'Device Category', 'Unit Number', 'Public Unit', 'Battery Level %', 'Installation Time', 'Upgrade', 'Status', 'Action'].map((header) => (
              <th key={header}>{t(header)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="checkbox-cell"><input type="checkbox" /></td>
              <td>{row.name}</td>
              <td>{row.category}</td>
              <td>{row.unitNumber}</td>
              <td><span className={`fake-check ${row.publicUnit ? 'is-checked' : ''}`} /></td>
              <td>{row.battery}</td>
              <td>{row.installedAt}</td>
              <td>{row.upgrade ? <RefreshCw className="state-green" size={20} /> : '-'}</td>
              <td>
                <div className="device-status-icons">
                  {row.status === 'online' ? <Wifi className="state-green" size={20} /> : <WifiOff className="state-muted" size={20} />}
                  {row.category === 'Smart Lock' && (
                    <button type="button" aria-label={t('Lock')} onClick={() => onLock(row)}>
                      {row.status === 'online' ? <Unlock size={20} /> : <Lock size={20} />}
                    </button>
                  )}
                  {row.category === 'Smart Lock' && <RefreshCw className={row.status === 'online' ? 'state-green' : 'state-muted'} size={20} />}
                </div>
              </td>
              <td className="action-cell">
                <button aria-label={t('Edit')} onClick={() => onEdit(row)}><Edit3 size={18} /></button>
                {row.status === 'online' && <button aria-label={t('Delete')}><Trash2 size={18} /></button>}
              </td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan="10"><div className="empty-state">{t('No data')}</div></td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function DevicePendingTable({ rows, onEdit }) {
  const { t } = useI18n();
  return (
    <div className="table-wrap">
      <table className="data-table device-pending-table">
        <thead>
          <tr>
            {['Unit Number', 'Public Unit', 'Device Category', 'Description', 'Number of Devices', 'Installer', "Installer's Email Address", 'Installation Date & Time', 'Action'].map((header) => (
              <th key={header}>{t(header)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.unitNumber}</td>
              <td><span className={`fake-check ${row.publicUnit ? 'is-checked' : ''}`} /></td>
              <td>{row.category}</td>
              <td>{row.description}</td>
              <td>{row.count}</td>
              <td>{row.installer}</td>
              <td>{row.installerEmail}</td>
              <td>{row.installationRange}</td>
              <td className="action-cell">
                <button aria-label={t('Edit')} onClick={() => onEdit(row)}><Edit3 size={18} /></button>
                <button aria-label={t('Delete')}><Trash2 size={18} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DeviceUnpairedTable({ rows }) {
  const { t } = useI18n();
  return (
    <div className="table-wrap">
      <table className="data-table device-unpaired-table">
        <thead>
          <tr>
            {['Device Name', 'Device ID', 'Product ID', 'Device Category', 'Battery Level %', 'Status'].map((header) => (
              <th key={header}>{t(header)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.deviceId}</td>
              <td>{row.productId}</td>
              <td>{row.category}</td>
              <td>{row.battery}</td>
              <td>{row.status === 'online' ? <Wifi className="state-green" size={20} /> : <WifiOff className="state-muted" size={20} />}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DeviceLockModal({ device, lockState, setLockState, onClose }) {
  const { t } = useI18n();
  const isUnlocked = lockState === 'unlocked';

  return (
    <div className="modal-backdrop device-command-backdrop">
      <section className="device-command-modal">
        <button className="device-command-close" onClick={onClose} aria-label={t('Close')}><X size={22} /></button>
        <p>{device.unitNumber.split('-').slice(0, 2).join('-')}</p>
        <h2>{device.unitNumber.split('-').slice(2).join('-') || device.name}</h2>
        <div className="device-command-status"><span className="device-command-status-dot" /> {t('Occupied')}</div>
        <button className="device-command-refresh" type="button"><RefreshCw size={18} /> {t('Refresh')}</button>
        <button
          type="button"
          className={`device-command-lock ${isUnlocked ? 'is-unlocked' : ''}`}
          onClick={() => setLockState(isUnlocked ? 'locked' : 'unlocked')}
        >
          <span>{isUnlocked ? t('Click to lock') : t('Click to unlock')}</span>
          {isUnlocked ? <Unlock size={150} /> : <Lock size={150} />}
          <b>{isUnlocked ? t('Unlocked') : t('Locked')}</b>
        </button>
      </section>
    </div>
  );
}

function getDeviceTabRows(activeTab, baseRows) {
  if (activeTab === 'public') return [];
  if (activeTab === 'pending') return devicePendingRows;
  if (activeTab === 'unpaired') return deviceUnpairedRows;
  if (activeTab === 'private') return baseRows.filter((device) => !device.publicUnit);
  return expandDeviceRows(baseRows);
}

function expandDeviceRows(baseRows) {
  const seed = baseRows[0] ?? devices[0];
  const extraLocks = Array.from({ length: 12 }, (_, index) => ({
    ...seed,
    id: `demo-lock-${index + 1}`,
    name: index < 2 ? `ISGK-B750 ${index + 7}` : `ISM7000 ${index + 16}`,
    battery: `${index % 3 === 0 ? 100 : 89 + (index % 12)}%`,
    status: index > 8 ? 'online' : 'offline',
    installedAt: `2026-05-${String(5 + Math.floor(index / 3)).padStart(2, '0')} 08:${String((index * 7) % 60).padStart(2, '0')} AM`,
  }));
  return [...extraLocks, ...baseRows];
}

function deviceTabLabel(activeTab) {
  return {
    public: 'Public',
    private: 'Private',
    pending: 'Pending',
    unpaired: 'Unpaired',
  }[activeTab] ?? 'All';
}

const devicePendingFilters = [
  { key: 'unitNumber', label: 'Unit Number', type: 'text', placeholder: 'Please enter' },
  { key: 'publicUnit', label: 'Public Unit', type: 'select', placeholder: 'Please Select' },
  { key: 'category', label: 'Device Category', type: 'select', placeholder: 'Please Select' },
  { key: 'installer', label: 'Installer', type: 'text', placeholder: 'Please enter' },
  { key: 'installerEmail', label: "Installer's Email Address", type: 'text', placeholder: 'Please enter' },
  { key: 'installationDate', label: 'Installation Date & Time', type: 'date', placeholder: 'Select date' },
];

const deviceUnpairedFilters = [
  { key: 'name', label: 'Device Name', type: 'text', placeholder: 'Please enter' },
  { key: 'deviceId', label: 'Device ID', type: 'text', placeholder: 'Please enter' },
  { key: 'productId', label: 'Product ID', type: 'text', placeholder: 'Please enter' },
  { key: 'category', label: 'Device Category', type: 'select', placeholder: 'Please Select' },
];

const devicePendingRows = [
  {
    id: 'pending-device-1',
    unitNumber: 'Main Building-2nd Floor-Upstairs Conference Room',
    publicUnit: false,
    category: 'Smart Lock',
    description: 'TEST Installation',
    count: 6,
    installer: 'Ayden Deng',
    installerEmail: 'ayden.deng@unisonhardware.com',
    installationRange: '2026-03-30 03:49 PM ~ 2026-03-31 03:49 PM',
  },
];

const deviceUnpairedRows = Array.from({ length: 16 }, (_, index) => ({
  id: `unpaired-${index + 1}`,
  name: ['ISGK-B750 3', 'ISM7000 11', 'INOX BLE SMART LOCK', 'ISGK 2', 'Smart lock'][index % 5],
  deviceId: `eb${(5906 + index * 37).toString(16)}haqhmfate${index}`,
  productId: index % 3 === 0 ? 'vqhin3jm' : index % 3 === 1 ? 'n6vuoczx' : 'upepagiy',
  category: 'Smart Lock',
  battery: index % 4 === 0 ? '-' : `${68 + (index % 31)}%`,
  status: index === 10 ? 'online' : 'offline',
}));

function UnitUpdateMock({ row, onClose }) {
  const { t } = useI18n();
  // Unit modal mirrors the production core fields while keeping the form ready for real data binding.
  // Unit 更新弹窗先复刻截图里的核心字段，保留后续接入真实表单的结构。
  return (
    <div className="modal-form">
      <div className="unit-photo-box">
        <label>* {t('Photo')}</label>
        <img src={row.photo} alt="" />
        <small>{t('File Format')}: .jpg .jpeg .png</small>
      </div>
      <label className="field"><span>{t('Unit ID')}</span><input value={row.id} readOnly /></label>
      <label className="field"><span>* {t('Unit Name')}</span><input value={row.name} readOnly /></label>
      <label className="field"><span>{t('Public Unit')}</span><span className={`switch ${row.publicUnit ? 'is-on' : ''}`} /></label>
      <label className="field"><span>{t('Tag')}</span><input value={row.tag} readOnly /></label>
      <label className="field"><span>* {t('Building & Floor')}</span><input value={`${row.building} / ${row.floor}`} readOnly /></label>
      <label className="field"><span>{t('Unit Owner')}</span><input value={row.owner} readOnly /></label>
      <label className="field modal-form__wide"><span>{t("Owner's Email Address")}</span><input value={row.ownerEmail} readOnly /></label>
      <p className="helper-text modal-form__wide">{t("Owner role manages devices, credentials and other users. There is only 1 owner's role per unit.")}</p>
      <div className="modal-actions modal-form__wide">
        <Button variant="muted" onClick={onClose}>{t('Cancel')}</Button>
        <Button onClick={onClose}>{t('Confirm')}</Button>
      </div>
    </div>
  );
}
