import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '../components/ui.jsx';
import { devices, units, users } from '../domain/mockData.js';
import { useI18n } from '../i18n/useI18n.js';

const rolePermissionPresets = {
  Admin: ['Full', 'Full', 'Full', 'Full'],
  Member: ['None', 'None', 'None', 'None'],
  Guest: ['None', 'None', 'None', 'None'],
};

const permissionLabels = ['Manage Members', 'Manage Guests', 'E-Keys', 'Doorbell answering'];
const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Move-In mirrors the production batch workflow: configure rules, select users/units, then submit assignments.
// Move-In 复刻线上批量入住页：上半区配置入住规则，下半区把用户、Unit/设备组合成待提交任务。
export function MoveInPage() {
  const { t } = useI18n();
  const [role, setRole] = useState('Member');
  const [permanentStay, setPermanentStay] = useState(false);
  const [mainResident, setMainResident] = useState(true);
  const [recurringSchedule, setRecurringSchedule] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [access, setAccess] = useState({ mobile: false, ekey: false, passcode: false });
  const [displayAdminInfo, setDisplayAdminInfo] = useState(false);
  const [assignMode, setAssignMode] = useState('manual');
  const [linkedPublicUnits, setLinkedPublicUnits] = useState(false);
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);
  const [showVacantOnly, setShowVacantOnly] = useState(false);
  const [showPublicUnits, setShowPublicUnits] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [unitSearch, setUnitSearch] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedUnitIds, setSelectedUnitIds] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const permissions = rolePermissionPresets[role];
  const filteredUsers = useMemo(() => {
    const keyword = userSearch.trim().toLowerCase();
    return users.filter((user) => {
      const matchesKeyword = !keyword || `${user.name} ${user.email}`.toLowerCase().includes(keyword);
      const matchesStatus = !showInactiveOnly || user.status === 'Inactive';
      return matchesKeyword && matchesStatus;
    });
  }, [showInactiveOnly, userSearch]);

  const filteredUnits = useMemo(() => {
    const keyword = unitSearch.trim().toLowerCase();
    return units.filter((unit) => {
      const matchesKeyword = !keyword || unit.unitNumber.toLowerCase().includes(keyword);
      const matchesVacant = !showVacantOnly || !unit.occupied;
      const matchesPublic = !showPublicUnits || unit.publicUnit;
      return matchesKeyword && matchesVacant && matchesPublic;
    });
  }, [showPublicUnits, showVacantOnly, unitSearch]);

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
        <div className="breadcrumb">◂ {t('Batch Move-In')}</div>
        <div className="processing-toolbar">
          <p>{t('Data processing in progress (ETA: 10s). Click to manually sync.')}</p>
          <Button>{t('Refresh')}</Button>
        </div>
        <div className="table-wrap">
          <table className="data-table move-result-table">
            <thead>
              <tr>
                <th>{t('Transaction ID')}</th>
                <th>{t('Unit Number')}</th>
                <th>{t('User Name')}</th>
                <th>{t('User Email Address')}</th>
                <th>{t('Role')}</th>
                <th>{t('Start Time')}</th>
                <th>{t('End Time')}</th>
                <th>{t('Device')}</th>
                <th>{t('Passcode Status')}</th>
                <th>{t('Card ID')}</th>
                <th>{t('Read RFIDs')}</th>
              </tr>
            </thead>
            <tbody>
              {selectedAssignments.map((assignment, index) => (
                <tr key={assignment.id}>
                  <td data-label={t('Transaction ID')}>{32945 + index}</td>
                  <td data-label={t('Unit Number')}>{assignment.unit.unitNumber}</td>
                  <td data-label={t('User Name')}>{assignment.user.name}</td>
                  <td data-label={t('User Email Address')}>{assignment.user.email}</td>
                  <td data-label={t('Role')}>{t(role)}</td>
                  <td data-label={t('Start Time')}>2026-04-25 03:09 PM</td>
                  <td data-label={t('End Time')}>{permanentStay ? '2100-12-31 11:59 PM' : '2026-05-25 11:59 PM'}</td>
                  <td data-label={t('Device')}>{assignment.device.name}</td>
                  <td data-label={t('Passcode Status')}>{access.passcode ? t('Queued') : '-'}</td>
                  <td data-label={t('Card ID')}>{access.ekey ? t('Pending') : '-'}</td>
                  <td data-label={t('Read RFIDs')}>-</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="form-footer">
          <Button variant="muted" onClick={() => setSubmitted(false)}>{t('Back to Move-In')}</Button>
          <Button>{t('Refresh')}</Button>
        </div>
      </section>
    );
  }

  return (
    <section className="move-in-page">
      <div className="breadcrumb">◂ {t('Batch Move-In')}</div>
      <h1>{t('Move-In')}</h1>

      <div className="move-in-config">
        <div className="move-in-left-column">
          <Panel title="1 Move-In Date & Time">
            <div className="move-date-grid">
              <div>
                <SwitchRow label="Permanent Stay" checked={permanentStay} onChange={setPermanentStay} />
                <label className="field"><span>{t('Move-In')}</span><input defaultValue="2026-04-28 03:00 PM" /></label>
                <label className="field"><span>{t('Move-Out')}</span><input defaultValue={permanentStay ? '2100-12-31 11:59 PM' : ''} placeholder={t('End Date & Time')} disabled={permanentStay} /></label>
              </div>
              <SwitchRow label="Main Resident" checked={mainResident} onChange={setMainResident} />
            </div>
          </Panel>
          <Panel title="2 Access" tone="muted">
            <CheckboxRow label="Mobile Access" checked={access.mobile} onChange={(checked) => setAccess((current) => ({ ...current, mobile: checked }))} />
            <CheckboxRow label="E-Keys" checked={access.ekey} onChange={(checked) => setAccess((current) => ({ ...current, ekey: checked }))}>
              <select><option>{t('RFID Card')}</option><option>{t('RFID FOB')}</option></select>
            </CheckboxRow>
            <CheckboxRow label="Passcode" checked={access.passcode} onChange={(checked) => setAccess((current) => ({ ...current, passcode: checked }))}>
              <select><option>{t('System-Gen')}</option><option>{t('User-Defined')}</option></select>
            </CheckboxRow>
          </Panel>
        </div>

        <div className="move-in-middle-column">
          <div className="roles-permissions-grid">
            <Panel title="3 Roles" tone="muted">
              {['Admin', 'Member', 'Guest'].map((item) => (
                <button className={role === item ? 'is-active' : ''} key={item} onClick={() => setRole(item)}>{t(item)} <span>{role === item ? '›' : ''}</span></button>
              ))}
            </Panel>
            <Panel title="4 Permissions" tone="muted">
              {permissionLabels.map((item, index) => (
                <label className="permission-row" key={item}>
                  <span>{t(item)}</span>
                  <select value={permissions[index]} onChange={() => {}}>
                    <option value="Full">{t('Full')}</option>
                    <option value="None">{t('None')}</option>
                  </select>
                </label>
              ))}
              <label className="permission-row"><span>{t('Mobile Access Type')}</span><select defaultValue="On-site & Remote"><option value="On-site & Remote">{t('On-site & Remote')}</option><option value="On-site Only">{t('On-site Only')}</option></select></label>
            </Panel>
          </div>
          <SubSection title="Privacy">
            <SwitchRow label="Display Admin Info in the App" checked={displayAdminInfo} onChange={setDisplayAdminInfo} />
          </SubSection>
          <SubSection title="Assign Units">
            <div className="radio-line">
              <label><input type="radio" name="assignMode" checked={assignMode === 'auto'} onChange={() => setAssignMode('auto')} /> {t('Auto-Assign')}</label>
              <label><input type="radio" name="assignMode" checked={assignMode === 'manual'} onChange={() => setAssignMode('manual')} /> {t('Manual Assign')}</label>
            </div>
            <SwitchRow label="Assign Access to Linked Public Units" checked={linkedPublicUnits} onChange={setLinkedPublicUnits} />
          </SubSection>
        </div>

        <Panel title="Scheduled Access (Optional)" tone="light">
          <SwitchRow label="Recurring Schedule" checked={recurringSchedule} onChange={setRecurringSchedule} alignEnd />
          <div className="time-pair">
            <label className="field"><span>{t('Start Time')}</span><input defaultValue="12:00 AM" /></label>
            <label className="field"><span>{t('End Time')}</span><input defaultValue="11:59 PM" /></label>
          </div>
          <SubSection title="Recurring Schedule">
            <div className="schedule-days">
              {weekDays.map((day) => (
                <label key={day}>
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(day)}
                    disabled={!recurringSchedule}
                    onChange={() => toggleListValue(day, selectedDays, setSelectedDays)}
                  /> {t(day)}
                </label>
              ))}
            </div>
          </SubSection>
        </Panel>
      </div>

      <div className="move-in-selectors">
        <section className="selector-panel">
          <SelectorHeader title="Show Inactive Users Only" checked={showInactiveOnly} onToggle={setShowInactiveOnly} search={userSearch} setSearch={setUserSearch} canContinue={selectedUserIds.length > 0} />
          <SimpleTable headers={['User', 'Email Address']}>
            {filteredUsers.map((user) => (
              <tr key={user.id} className={selectedUserIds.includes(user.id) ? 'is-selected' : ''}>
                <td data-label={t('Select')}><input type="checkbox" checked={selectedUserIds.includes(user.id)} onChange={() => toggleListValue(user.id, selectedUserIds, setSelectedUserIds)} /></td>
                <td data-label={t('User')}>{user.name}</td>
                <td data-label={t('Email Address')}>{user.email}</td>
              </tr>
            ))}
          </SimpleTable>
        </section>

        <section className="selector-panel">
          <SelectorHeader title="Show Vacant Units Only" checked={showVacantOnly} onToggle={setShowVacantOnly} extraLabel="Show Public Units" extraChecked={showPublicUnits} onExtraToggle={setShowPublicUnits} search={unitSearch} setSearch={setUnitSearch} canContinue={selectedUnitIds.length > 0} />
          <SimpleTable headers={['Units', 'Status']}>
            <tr className="tree-row"><td data-label={t('Select')}><input type="checkbox" /></td><td data-label={t('Units')}>− Main Building</td><td data-label={t('Status')} /></tr>
            <tr className="tree-row"><td data-label={t('Select')}><input type="checkbox" /></td><td data-label={t('Units')}>− 1st Floor</td><td data-label={t('Status')} /></tr>
            {filteredUnits.map((unit) => (
              <tr key={unit.id} className={selectedUnitIds.includes(unit.id) ? 'is-selected' : ''}>
                <td data-label={t('Select')}><input type="checkbox" checked={selectedUnitIds.includes(unit.id)} onChange={() => toggleListValue(unit.id, selectedUnitIds, setSelectedUnitIds)} /></td>
                <td data-label={t('Units')}>+ {unit.name}</td>
                <td data-label={t('Status')}>{unit.occupied ? t('Occupied') : t('Vacant')}</td>
              </tr>
            ))}
          </SimpleTable>
        </section>

        <section className="selector-panel selected-assignment">
          <div className="selector-actions">
            <Button variant="muted" onClick={() => { setSelectedUserIds([]); setSelectedUnitIds([]); }}>{t('Clear All')}</Button>
          </div>
          <SimpleTable headers={['User', 'Units', 'Devices']} selectable={false}>
            {selectedAssignments.map((assignment) => (
              <tr key={assignment.id}>
                <td data-label={t('User')}>{assignment.user.name}</td>
                <td data-label={t('Units')}><span className="chip">{assignment.unit.unitNumber}</span></td>
                <td data-label={t('Devices')}><span className="chip">{assignment.device.name}</span></td>
              </tr>
            ))}
            {!selectedAssignments.length && <tr><td colSpan="3"><div className="empty-state">{t('No data')}</div></td></tr>}
          </SimpleTable>
        </section>
      </div>

      <div className="form-footer">
        <Button variant="muted">{t('Cancel')}</Button>
        <Button onClick={handleConfirm} disabled={!selectedAssignments.length}>{t('Confirm')}</Button>
      </div>
    </section>
  );
}

function Panel({ title, children }) {
  const { t } = useI18n();
  const displayTitle = title.replace(/^\d\s/, '');
  const step = title.match(/^\d/)?.[0];
  return (
    <section className="move-panel">
      <h2>{step && <span className="step-badge">{step}</span>}{t(displayTitle)}</h2>
      {children}
    </section>
  );
}

function SubSection({ title, children }) {
  const { t } = useI18n();
  return (
    <section className="move-subsection">
      <h3>{t(title)}</h3>
      {children}
    </section>
  );
}

function SwitchRow({ label, checked, onChange, alignEnd = false }) {
  const { t } = useI18n();
  return (
    <label className={`switch-row ${alignEnd ? 'switch-row--end' : ''}`}>
      <span>{t(label)}</span>
      <input className="sr-only" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className={`switch ${checked ? 'is-on' : ''}`} />
    </label>
  );
}

function CheckboxRow({ label, checked, onChange, children }) {
  const { t } = useI18n();
  return (
    <label className="checkbox-row">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{t(label)}</span>
      {children}
    </label>
  );
}

function SelectorHeader({ title, checked, onToggle, extraLabel, extraChecked, onExtraToggle, search, setSearch, canContinue }) {
  const { t } = useI18n();
  return (
    <div className="selector-header">
      <div className="selector-header__toggles">
        <SwitchRow label={title} checked={checked} onChange={onToggle} />
        {extraLabel && <SwitchRow label={extraLabel} checked={extraChecked} onChange={onExtraToggle} />}
      </div>
      <div className="selector-search">
        <input value={search} placeholder={t('Search here...')} onChange={(event) => setSearch(event.target.value)} />
        <button className="selector-search__icon" type="button" aria-label={t('Search')}><Search size={16} /></button>
        <Button variant="muted" disabled={!canContinue}>{t('Next')}</Button>
      </div>
    </div>
  );
}

function SimpleTable({ headers, children, selectable = true }) {
  const { t } = useI18n();
  return (
    <div className="table-wrap">
      <table className="mini-table">
        <thead>
          <tr>
            {selectable && <th><input type="checkbox" /></th>}
            {headers.map((header) => <th key={header}>{t(header)}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
