import { useMemo, useState } from 'react';
import { Button } from '../components/ui.jsx';
import { devices, units, users } from '../domain/mockData.js';

const rolePermissionPresets = {
  Admin: ['Full', 'Full', 'Full', 'Full'],
  Member: ['None', 'None', 'None', 'None'],
  Guest: ['None', 'None', 'None', 'None'],
};

const permissionLabels = ['Manage Members', 'Manage Guests', 'E-Keys', 'Doorbell answering'];
const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Move-In 复刻线上批量入住页：上半区配置入住规则，下半区把用户、Unit/设备组合成待提交任务。
export function MoveInPage() {
  const [role, setRole] = useState('Admin');
  const [permanentStay, setPermanentStay] = useState(true);
  const [mainResident, setMainResident] = useState(true);
  const [recurringSchedule, setRecurringSchedule] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [access, setAccess] = useState({ mobile: true, ekey: false, passcode: true });
  const [userSearch, setUserSearch] = useState('ayden');
  const [unitSearch, setUnitSearch] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState(['usr-7']);
  const [selectedUnitIds, setSelectedUnitIds] = useState(['u-6']);
  const [submitted, setSubmitted] = useState(false);

  const permissions = rolePermissionPresets[role];
  const filteredUsers = useMemo(() => {
    const keyword = userSearch.trim().toLowerCase();
    return users.filter((user) => !keyword || `${user.name} ${user.email}`.toLowerCase().includes(keyword));
  }, [userSearch]);

  const filteredUnits = useMemo(() => {
    const keyword = unitSearch.trim().toLowerCase();
    return units.filter((unit) => !keyword || unit.unitNumber.toLowerCase().includes(keyword));
  }, [unitSearch]);

  const selectedAssignments = useMemo(() => {
    const selectedUsers = users.filter((user) => selectedUserIds.includes(user.id));
    const selectedUnits = units.filter((unit) => selectedUnitIds.includes(unit.id));
    return selectedUsers.flatMap((user) => selectedUnits.map((unit) => {
      const assignedDevice = devices.find((device) => device.unitId === unit.id) ?? devices[0];
      return { id: `${user.id}-${unit.id}`, user, unit, device: assignedDevice };
    }));
  }, [selectedUserIds, selectedUnitIds]);

  const toggleListValue = (value, list, setter) => {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const handleConfirm = () => {
    if (selectedAssignments.length) setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="move-in-page">
        <div className="breadcrumb">◂ Batch Move-In</div>
        <div className="processing-toolbar">
          <p>Data processing in progress (ETA: 10s). Click to manually sync.</p>
          <Button>Refresh</Button>
        </div>
        <div className="table-wrap">
          <table className="data-table move-result-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Unit Number</th>
                <th>User Name</th>
                <th>User Email Address</th>
                <th>Role</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Device</th>
                <th>Passcode Status</th>
                <th>Card ID</th>
                <th>Read RFIDs</th>
              </tr>
            </thead>
            <tbody>
              {selectedAssignments.map((assignment, index) => (
                <tr key={assignment.id}>
                  <td data-label="Transaction ID">{32945 + index}</td>
                  <td data-label="Unit Number">{assignment.unit.unitNumber}</td>
                  <td data-label="User Name">{assignment.user.name}</td>
                  <td data-label="User Email Address">{assignment.user.email}</td>
                  <td data-label="Role">{role}</td>
                  <td data-label="Start Time">2026-04-25 03:09 PM</td>
                  <td data-label="End Time">{permanentStay ? '2100-12-31 11:59 PM' : '2026-05-25 11:59 PM'}</td>
                  <td data-label="Device">{assignment.device.name}</td>
                  <td data-label="Passcode Status">{access.passcode ? 'Queued' : '-'}</td>
                  <td data-label="Card ID">{access.ekey ? 'Pending' : '-'}</td>
                  <td data-label="Read RFIDs">-</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="form-footer">
          <Button variant="muted" onClick={() => setSubmitted(false)}>Back to Move-In</Button>
          <Button>Refresh</Button>
        </div>
      </section>
    );
  }

  return (
    <section className="move-in-page">
      <div className="breadcrumb">◂ Batch Move-In</div>
      <h1>Move-In</h1>
      <div className="move-in-layout">
        <Panel title="1 Move-In Date & Time">
          <SwitchRow label="Permanent Stay" checked={permanentStay} onChange={setPermanentStay} />
          <SwitchRow label="Main Resident" checked={mainResident} onChange={setMainResident} />
          <label className="field"><span>Move-In</span><input defaultValue="2026-04-25 03:09 PM" /></label>
          <label className="field"><span>Move-Out</span><input defaultValue={permanentStay ? '2100-12-31 11:59 PM' : ''} disabled={permanentStay} /></label>
        </Panel>
        <Panel title="2 Access">
          <CheckboxRow label="Mobile Access" checked={access.mobile} onChange={(checked) => setAccess((current) => ({ ...current, mobile: checked }))} />
          <CheckboxRow label="E-Keys" checked={access.ekey} onChange={(checked) => setAccess((current) => ({ ...current, ekey: checked }))}>
            <select><option>RFID Card</option><option>RFID FOB</option></select>
          </CheckboxRow>
          <CheckboxRow label="Passcode" checked={access.passcode} onChange={(checked) => setAccess((current) => ({ ...current, passcode: checked }))}>
            <select><option>System-Gen</option><option>User-Defined</option></select>
            <select><option>4 Digits</option><option>6 Digits</option></select>
          </CheckboxRow>
        </Panel>
        <Panel title="3 Roles">
          {['Admin', 'Member', 'Guest'].map((item) => (
            <button className={role === item ? 'is-active' : ''} key={item} onClick={() => setRole(item)}>{item}</button>
          ))}
        </Panel>
        <Panel title="4 Permissions">
          {permissionLabels.map((item, index) => (
            <label className="permission-row" key={item}>
              <span>{item}</span>
              <select value={permissions[index]} onChange={() => {}}>
                <option>Full</option>
                <option>None</option>
              </select>
            </label>
          ))}
          <label className="permission-row"><span>Mobile Access Type</span><select defaultValue="On-site & Remote"><option>On-site & Remote</option><option>On-site Only</option></select></label>
        </Panel>
        <Panel title="Scheduled Access (Optional)">
          <SwitchRow label="Recurring Schedule" checked={recurringSchedule} onChange={setRecurringSchedule} />
          <div className="time-pair">
            <label className="field"><span>Start Time</span><input defaultValue="12:00 AM" /></label>
            <label className="field"><span>End Time</span><input defaultValue="11:59 PM" /></label>
          </div>
          <div className="schedule-days">
            {weekDays.map((day) => (
              <label key={day}>
                <input
                  type="checkbox"
                  checked={selectedDays.includes(day)}
                  disabled={!recurringSchedule}
                  onChange={() => toggleListValue(day, selectedDays, setSelectedDays)}
                /> {day}
              </label>
            ))}
          </div>
        </Panel>
      </div>

      <div className="move-in-selectors">
        <section className="selector-panel">
          <SelectorHeader title="Show Inactive Users Only" search={userSearch} setSearch={setUserSearch} />
          <SimpleTable headers={['User', 'Email Address']}>
            {filteredUsers.map((user) => (
              <tr key={user.id} className={selectedUserIds.includes(user.id) ? 'is-selected' : ''}>
                <td data-label="Select"><input type="checkbox" checked={selectedUserIds.includes(user.id)} onChange={() => toggleListValue(user.id, selectedUserIds, setSelectedUserIds)} /></td>
                <td data-label="User">{user.name}</td>
                <td data-label="Email Address">{user.email}</td>
              </tr>
            ))}
          </SimpleTable>
        </section>

        <section className="selector-panel">
          <SelectorHeader title="Show Vacant Units Only" search={unitSearch} setSearch={setUnitSearch} />
          <SimpleTable headers={['Units', 'Status']}>
            <tr className="tree-row"><td data-label="Select"><input type="checkbox" /></td><td data-label="Units">− Main Building</td><td data-label="Status" /></tr>
            <tr className="tree-row"><td data-label="Select"><input type="checkbox" /></td><td data-label="Units">− 1st Floor</td><td data-label="Status" /></tr>
            {filteredUnits.map((unit) => (
              <tr key={unit.id} className={selectedUnitIds.includes(unit.id) ? 'is-selected' : ''}>
                <td data-label="Select"><input type="checkbox" checked={selectedUnitIds.includes(unit.id)} onChange={() => toggleListValue(unit.id, selectedUnitIds, setSelectedUnitIds)} /></td>
                <td data-label="Units">+ {unit.name}</td>
                <td data-label="Status">{unit.occupied ? 'Occupied' : 'Vacant'}</td>
              </tr>
            ))}
          </SimpleTable>
        </section>

        <section className="selector-panel selected-assignment">
          <div className="selector-actions">
            <Button variant="muted" onClick={() => { setSelectedUserIds([]); setSelectedUnitIds([]); }}>Clear All</Button>
          </div>
          <SimpleTable headers={['User', 'Units', 'Devices']} selectable={false}>
            {selectedAssignments.map((assignment) => (
              <tr key={assignment.id}>
                <td data-label="User">{assignment.user.name}</td>
                <td data-label="Units"><span className="chip">{assignment.unit.unitNumber}</span></td>
                <td data-label="Devices"><span className="chip">{assignment.device.name}</span></td>
              </tr>
            ))}
            {!selectedAssignments.length && <tr><td colSpan="3"><div className="empty-state">No data</div></td></tr>}
          </SimpleTable>
        </section>
      </div>

      <div className="form-footer">
        <Button variant="muted">Cancel</Button>
        <Button onClick={handleConfirm} disabled={!selectedAssignments.length}>Confirm</Button>
      </div>
    </section>
  );
}

function Panel({ title, children }) {
  return <section className="move-panel"><h2>{title}</h2>{children}</section>;
}

function SwitchRow({ label, checked, onChange }) {
  return (
    <label className="switch-row">
      <span>{label}</span>
      <input className="sr-only" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className={`switch ${checked ? 'is-on' : ''}`} />
    </label>
  );
}

function CheckboxRow({ label, checked, onChange, children }) {
  return (
    <label className="checkbox-row">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
      {children}
    </label>
  );
}

function SelectorHeader({ title, search, setSearch }) {
  return (
    <div className="selector-header">
      <SwitchRow label={title} checked={false} onChange={() => {}} />
      <div className="selector-search">
        <input value={search} placeholder="Search here..." onChange={(event) => setSearch(event.target.value)} />
        <Button>Next</Button>
      </div>
    </div>
  );
}

function SimpleTable({ headers, children, selectable = true }) {
  return (
    <div className="table-wrap">
      <table className="mini-table">
        <thead>
          <tr>
            {selectable && <th><input type="checkbox" /></th>}
            {headers.map((header) => <th key={header}>{header}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
