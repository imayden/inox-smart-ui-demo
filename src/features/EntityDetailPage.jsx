import { useNavigate, useParams } from 'react-router-dom';
import { Button, DataTable, FormGrid, Tabs } from '../components/ui.jsx';
import { tableSchemas } from '../config/schemas.js';
import { getEntity, getModuleRows } from '../domain/selectors.js';
import { useDemoStore } from '../demo/demoStore.js';

// 详情页按实体类型分流：Property / Device / User 的信息层级不同，但共用路由形态。
export function EntityDetailPage({ moduleId }) {
  const { entityId } = useParams();
  const propertyId = useDemoStore((state) => state.propertyId);
  const entity = getEntity(moduleId, entityId);
  if (!entity) return <div className="module-page"><h1>Not Found</h1></div>;

  if (moduleId === 'units') return <UnitDetail entity={entity} propertyId={propertyId} />;
  if (moduleId === 'devices') return <DeviceDetail entity={entity} propertyId={propertyId} />;
  if (moduleId === 'users') return <UserDetail entity={entity} propertyId={propertyId} />;
  return <PropertyDetail entity={entity} />;
}

function PropertyDetail({ entity }) {
  return (
    <section className="detail-page">
      <div className="breadcrumb">◂ Property Details</div>
      <Button className="detail-page__update">Update</Button>
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
        <img src={entity.image} alt={entity.name} />
      </div>
    </section>
  );
}

function DeviceDetail({ entity }) {
  return (
    <section className="detail-page">
      <div className="breadcrumb">◂ Device Details</div>
      <header className="detail-hero">
        <h1>{entity.name}</h1>
        <span>{entity.unitNumber}</span>
      </header>
      <Tabs tabs={[{ id: '', label: 'Settings' }, { id: 'users', label: 'Users' }, { id: 'ekeys', label: 'E-Keys' }, { id: 'audit', label: 'Audit Trail' }]} activeTab="" onChange={() => {}} />
      <div className="settings-grid">
        {['Device Type', 'Device ID', 'MAC Address', 'Lock Installation Date & Time', 'Unit Owner', 'Lock Activated By', 'MCU Module Version', 'Bluetooth Module Version'].map((label, index) => (
          <label className="field" key={label}>
            <span>{label}</span>
            <input value={index === 0 ? entity.category : index === 1 ? entity.id : index === 3 ? entity.installedAt : index > 5 ? '1.1.4' : 'inoxsmartadmin@unisonhardware.com'} readOnly />
          </label>
        ))}
      </div>
      <div className="settings-cards">
        {['Audio and Light Settings', 'Auto-Lock Settings', 'Passage Mode (One-Time)', 'Privacy Mode (One-Time)', 'Passage Mode Recurring Schedule', 'Privacy Mode Recurring Schedule', 'Door Position Sensor (DPS) Settings'].map((title) => (
          <article key={title}>
            <h3>{title}</h3>
            <p>When enabled, device behavior is applied to the selected unit and access users.</p>
            <span className="switch" />
          </article>
        ))}
      </div>
    </section>
  );
}

function UnitDetail({ entity, propertyId }) {
  const navigate = useNavigate();
  const uiVersion = useDemoStore((state) => state.uiVersion);
  const rows = getModuleRows('users', propertyId).slice(0, 8).map((user, index) => ({
    ...user,
    role: index === 0 ? 'Owner' : index % 3 === 0 ? 'Administrator' : index % 2 === 0 ? 'Member' : 'Guest',
    mainResident: index % 2 === 0,
    startTime: index === 0 ? '-' : '2026-04-25 03:09 PM',
    endTime: index === 0 ? '-' : '2100-12-31 11:59 PM',
    status: 'Moved-In',
  }));

  // Unit Detail 是 Move-In 的真实入口之一，按钮直接进入批量 Move-In 页面。
  return (
    <section className="detail-page">
      <div className="breadcrumb">◂ Unit Details</div>
      <header className="detail-hero unit-detail-hero">
        <div>
          <h1>{entity.name}</h1>
          <span>{entity.floor} | {entity.building} {entity.tag} - 1.INOXHQ - Sacramento - California</span>
        </div>
        <div className="detail-hero__actions">
          <Button>+ Add User</Button>
          <Button onClick={() => navigate(`/demo/${uiVersion}/property/${propertyId}/occupancy/move-in`)}>Move-In</Button>
          <Button variant="muted">Action</Button>
        </div>
        <img src={entity.photo} alt={entity.name} />
      </header>
      <Tabs tabs={[{ id: '', label: 'Users' }, { id: 'devices', label: 'Devices' }, { id: 'ekeys', label: 'E-Keys' }, { id: 'audit', label: 'Audit Trail' }, { id: 'occupancy', label: 'Occupancy Log' }]} activeTab="" onChange={() => {}} />
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th className="checkbox-cell"><input type="checkbox" /></th>
              <th>User Name</th>
              <th>User Email Address</th>
              <th>Role</th>
              <th>Main Resident</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="checkbox-cell"><input type="checkbox" /></td>
                <td>{row.name}</td>
                <td>{row.email}</td>
                <td>{row.role}</td>
                <td><span className={`status-box ${row.mainResident ? 'is-on' : ''}`} /></td>
                <td>{row.startTime}</td>
                <td>{row.endTime}</td>
                <td>{row.status}</td>
                <td>-</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function UserDetail({ entity, propertyId }) {
  // User 详情内嵌该用户的 Occupancy 记录，展示用户与 Unit 关系。
  const rows = getModuleRows('occupancy', propertyId);
  return (
    <section className="detail-page">
      <div className="breadcrumb">◂ Users</div>
      <header className="detail-hero user-hero">
        <div className="avatar-large">⌾</div>
        <div>
          <h1>{entity.name}</h1>
          <span><b>Email Address:</b> {entity.email}</span>
        </div>
        <div className="detail-hero__actions">
          <Button variant="muted">Edit</Button>
          <Button>Move-In</Button>
          <Button>Move-Out</Button>
        </div>
      </header>
      <h2>General Info</h2>
      <div className="settings-grid">
        {['firstName', 'lastName', 'email', 'phone', 'gender', 'type', 'group', 'tag1', 'tag2'].map((key) => (
          <label className="field" key={key}><span>{labelize(key)}</span><input value={entity[key] || ''} readOnly /></label>
        ))}
      </div>
      <h2>Details</h2>
      <Tabs tabs={[{ id: '', label: 'Units' }, { id: 'mobile', label: 'Mobile Accesses' }, { id: 'ekeys', label: 'E-Keys' }, { id: 'devices', label: 'Devices' }, { id: 'audit', label: 'Audit Trail' }, { id: 'occupancy', label: 'Occupancy Log' }]} activeTab="" onChange={() => {}} />
      <DataTable columns={tableSchemas.occupancy} rows={rows} />
    </section>
  );
}

function labelize(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
}
