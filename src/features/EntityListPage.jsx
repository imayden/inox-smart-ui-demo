import { useMemo, useState } from 'react';
import { Grid2X2, List, MessageSquare, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, DataTable, Modal, PageHeader, SearchPanel, Tabs } from '../components/ui.jsx';
import { moduleMeta } from '../config/navigation.config.js';
import { filterSchemas, tableSchemas, tabSchemas } from '../config/schemas.js';
import { useDemoStore } from '../demo/demoStore.js';
import { applyPropertyImageFallback, PROPERTY_IMAGE_FALLBACK } from '../domain/imageFallbacks.js';
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
