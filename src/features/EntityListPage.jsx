import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, DataTable, Modal, PageHeader, SearchPanel, Tabs } from '../components/ui.jsx';
import { moduleMeta } from '../config/navigation.config.js';
import { filterSchemas, tableSchemas, tabSchemas } from '../config/schemas.js';
import { useDemoStore } from '../demo/demoStore.js';
import { getModuleRows, getProperty } from '../domain/selectors.js';

// 通用列表页承载 Units / Devices / Users / Access / Occupancy / Security，差异由 moduleId + schema 决定。
export function EntityListPage({ moduleId }) {
  const navigate = useNavigate();
  const propertyId = useDemoStore((state) => state.propertyId);
  const uiVersion = useDemoStore((state) => state.uiVersion);
  const [activeTab, setActiveTab] = useState(tabSchemas[moduleId]?.[0]?.id ?? '');
  const [modalRow, setModalRow] = useState(null);
  const property = getProperty(propertyId);
  const meta = moduleMeta[moduleId];

  const rows = useMemo(() => getModuleRows(moduleId, propertyId, activeTab), [moduleId, propertyId, activeTab]);
  const columns = moduleId === 'security' && activeTab === 'audit' ? tableSchemas.securityAudit : tableSchemas[moduleId];

  const handleEdit = (row) => {
    // 需要完整详情页的实体走路由；轻量编辑操作先用弹窗模拟。
    if (['properties', 'devices', 'users'].includes(moduleId)) {
      navigate(`/demo/${uiVersion}/property/${propertyId}/${moduleId}/${row.id}`);
      return;
    }
    setModalRow(row);
  };

  const handleHeaderAction = () => {
    // Access 的主按钮进入 Grant Access 表单；Occupancy 的主按钮进入批量 Move-In 流程。
    if (moduleId === 'access') {
      navigate(`/demo/${uiVersion}/property/${propertyId}/access/grant`);
      return;
    }
    if (moduleId === 'occupancy') {
      navigate(`/demo/${uiVersion}/property/${propertyId}/occupancy/move-in`);
    }
  };

  const handleRowClick = (row) => {
    // Unit 列表复刻线上交互：点击整行任意空白/内容区域，在新标签页打开对应 Unit Detail。
    if (moduleId !== 'units') return;
    window.open(`/demo/${uiVersion}/property/${propertyId}/units/${row.id}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="module-page">
      <PageHeader title={meta.title} property={moduleId === 'properties' ? null : property} action={meta.action} onAction={handleHeaderAction} />
      <Tabs tabs={tabSchemas[moduleId]} activeTab={activeTab} onChange={setActiveTab} />
      <SearchPanel fields={filterSchemas[moduleId]} />
      <div className="section-title-row">
        <h2>{listTitle(moduleId, activeTab)}</h2>
        {moduleId === 'access' && (
          <div className="inline-actions">
            <Button>Read RFIDs</Button>
            <Button onClick={() => navigate(`/demo/${uiVersion}/property/${propertyId}/access/grant`)}>+ Add RFID Key</Button>
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

function listTitle(moduleId, activeTab) {
  if (moduleId === 'access') return 'E-Keys';
  if (moduleId === 'occupancy') return activeTab === 'pending' ? 'Pending Occupancy' : 'Confirmed Occupancy';
  if (moduleId === 'security') return activeTab === 'audit' ? 'Audit Trail' : activeTab === 'passage' ? 'Devices' : activeTab === 'privacy' ? 'Devices' : 'Current Door Propped Alerts';
  return moduleId.charAt(0).toUpperCase() + moduleId.slice(1);
}

function UnitUpdateMock({ row, onClose }) {
  // Unit 更新弹窗先复刻截图里的核心字段，保留后续接入真实表单的结构。
  return (
    <div className="modal-form">
      <div className="unit-photo-box">
        <label>* Photo</label>
        <img src={row.photo} alt="" />
        <small>File Format: .jpg .jpeg .png</small>
      </div>
      <label className="field"><span>Unit ID</span><input value={row.id} readOnly /></label>
      <label className="field"><span>* Unit Name</span><input value={row.name} readOnly /></label>
      <label className="field"><span>Public Unit</span><span className={`switch ${row.publicUnit ? 'is-on' : ''}`} /></label>
      <label className="field"><span>Tag</span><input value={row.tag} readOnly /></label>
      <label className="field"><span>* Building & Floor</span><input value={`${row.building} / ${row.floor}`} readOnly /></label>
      <label className="field"><span>Unit Owner</span><input value={row.owner} readOnly /></label>
      <label className="field modal-form__wide"><span>Owner's Email Address</span><input value={row.ownerEmail} readOnly /></label>
      <p className="helper-text modal-form__wide">Owner role manages devices, credentials and other users. There is only 1 owner's role per unit.</p>
      <div className="modal-actions modal-form__wide">
        <Button variant="muted" onClick={onClose}>Cancel</Button>
        <Button onClick={onClose}>Confirm</Button>
      </div>
    </div>
  );
}
