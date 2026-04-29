import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Search, Trash2, X } from 'lucide-react';
import { Button } from '../components/ui.jsx';
import { devices, units, users } from '../domain/mockData.js';
import { useI18n } from '../i18n/useI18n.js';

const rolePermissionPresets = {
  Admin: {
    permissions: {
      manageMembers: 'Full',
      manageGuests: 'Full',
      ekeys: 'Full',
      doorbell: 'Full',
    },
    privacyLabel: 'Display Owner Info in the App',
  },
  Member: {
    permissions: {
      manageMembers: 'None',
      manageGuests: 'None',
      ekeys: 'None',
      doorbell: 'None',
    },
    privacyLabel: 'Display Admin Info in the App',
  },
  Guest: {
    permissions: {
      manageMembers: 'None',
      manageGuests: 'None',
      ekeys: 'None',
      doorbell: 'None',
    },
    privacyLabel: 'Display Admin Info in the App',
  },
};

const permissionFields = [
  ['manageMembers', 'Manage Members'],
  ['manageGuests', 'Manage Guests'],
  ['ekeys', 'E-Keys'],
  ['doorbell', 'Doorbell answering'],
];

const weekDays = ['ALL', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Batch Move-In is a production-like workflow: configure access rules, pick users, pick units, review generated unit-device assignments, then submit.
// 批量 Move-In 按线上流程组织：先配置入住/权限规则，再选用户与单元，右侧生成待提交的 Unit-Device 授权清单。
export function MoveInPage() {
  const { t } = useI18n();
  const [role, setRole] = useState('Member');
  const [permissions, setPermissions] = useState(rolePermissionPresets.Member.permissions);
  const [permanentStay, setPermanentStay] = useState(false);
  const [mainResident, setMainResident] = useState(true);
  const [recurringSchedule, setRecurringSchedule] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [displayRoleInfo, setDisplayRoleInfo] = useState(false);
  const [assignMode, setAssignMode] = useState('manual');
  const [linkedPublicUnits, setLinkedPublicUnits] = useState(false);
  const [moveInAt, setMoveInAt] = useState('2026-04-29 09:48 AM');
  const [moveOutAt, setMoveOutAt] = useState('');
  const [startTime, setStartTime] = useState('12:00 AM');
  const [endTime, setEndTime] = useState('11:59 PM');
  const [access, setAccess] = useState({
    mobile: false,
    ekey: false,
    ekeyType: 'RFID Card',
    passcode: false,
    passcodeMode: 'System-Gen',
    passcodeLength: '4 Digits',
    passcodeValue: '',
  });
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);
  const [showVacantOnly, setShowVacantOnly] = useState(false);
  const [showPublicUnits, setShowPublicUnits] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [unitSearch, setUnitSearch] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedUnitIds, setSelectedUnitIds] = useState([]);
  const [expandedSummaryUsers, setExpandedSummaryUsers] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const filteredUsers = useMemo(() => {
    const keyword = userSearch.trim().toLowerCase();
    return users.filter((user) => {
      const haystack = `${user.name} ${user.email}`.toLowerCase();
      return (!keyword || haystack.includes(keyword)) && (!showInactiveOnly || user.status === 'Inactive');
    });
  }, [showInactiveOnly, userSearch]);

  const filteredUnits = useMemo(() => {
    const keyword = unitSearch.trim().toLowerCase();
    return units.filter((unit) => {
      const haystack = `${unit.unitNumber} ${unit.name} ${unit.tag}`.toLowerCase();
      return (!keyword || haystack.includes(keyword)) && (!showVacantOnly || !unit.occupied) && (!showPublicUnits || unit.publicUnit);
    });
  }, [showPublicUnits, showVacantOnly, unitSearch]);

  const selectedUsers = useMemo(() => users.filter((user) => selectedUserIds.includes(user.id)), [selectedUserIds]);
  const selectedUnits = useMemo(() => units.filter((unit) => selectedUnitIds.includes(unit.id)), [selectedUnitIds]);

  const selectedUnitDevices = useMemo(() => {
    const map = new Map();
    selectedUnits.forEach((unit) => {
      const linkedDevices = devices.filter((device) => device.unitId === unit.id);
      map.set(unit.id, linkedDevices.length ? linkedDevices : [devices[0]]);
    });
    return map;
  }, [selectedUnits]);

  const groupedAssignments = useMemo(() => selectedUsers.map((user) => ({
    user,
    units: selectedUnits,
    devices: selectedUnits.flatMap((unit) => selectedUnitDevices.get(unit.id) ?? []),
  })), [selectedUnitDevices, selectedUnits, selectedUsers]);

  const resultRows = useMemo(() => groupedAssignments.flatMap((group, groupIndex) => (
    group.units.flatMap((unit, unitIndex) => {
      const linkedDevices = selectedUnitDevices.get(unit.id) ?? [];
      return linkedDevices.map((device, deviceIndex) => ({
        id: `${group.user.id}-${unit.id}-${device.id}`,
        transactionId: 33186 - groupIndex * 12 - unitIndex - deviceIndex,
        user: group.user,
        unit,
        device,
      }));
    })
  )), [groupedAssignments, selectedUnitDevices]);

  const selectRole = (nextRole) => {
    // Role selection changes the default permission set, mirroring the production form behavior.
    // 切换角色时同步更新默认权限，复刻线上表单中 Role 与 Permission 的联动。
    setRole(nextRole);
    setPermissions(rolePermissionPresets[nextRole].permissions);
  };

  const toggleValue = (value, list, setter) => {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const toggleAllUsers = () => {
    const visibleIds = filteredUsers.map((user) => user.id);
    const allVisibleSelected = visibleIds.every((id) => selectedUserIds.includes(id));
    setSelectedUserIds(allVisibleSelected ? selectedUserIds.filter((id) => !visibleIds.includes(id)) : [...new Set([...selectedUserIds, ...visibleIds])]);
  };

  const toggleAllUnits = () => {
    const visibleIds = filteredUnits.map((unit) => unit.id);
    const allVisibleSelected = visibleIds.every((id) => selectedUnitIds.includes(id));
    setSelectedUnitIds(allVisibleSelected ? selectedUnitIds.filter((id) => !visibleIds.includes(id)) : [...new Set([...selectedUnitIds, ...visibleIds])]);
  };

  const removeUnit = (unitId) => {
    setSelectedUnitIds((current) => current.filter((id) => id !== unitId));
  };

  const removeUser = (userId) => {
    setSelectedUserIds((current) => current.filter((id) => id !== userId));
    setExpandedSummaryUsers((current) => current.filter((id) => id !== userId));
  };

  const handleConfirm = () => {
    if (resultRows.length) setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="move-in-page move-in-page--result">
        <div className="breadcrumb">◂ {t('Batch Move-In')}</div>
        <div className="processing-toolbar">
          <p>{t('Data processing in progress (ETA: 10s). Click to manually sync.')}</p>
          <Button>{t('Refresh')}</Button>
        </div>
        <div className="table-wrap move-result-wrap">
          <table className="data-table move-result-table">
            <thead>
              <tr>
                {['Transaction ID', 'Unit Number', 'User Name', 'User Email Address', 'Phone Number', 'Role', 'Start Time', 'End Time', 'Device', 'Passcode Status', 'Card ID', 'Read RFIDs'].map((header) => (
                  <th key={header}>{t(header)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resultRows.map((row) => (
                <tr key={row.id}>
                  <td data-label={t('Transaction ID')}>{row.transactionId}</td>
                  <td data-label={t('Unit Number')}>{row.unit.unitNumber}</td>
                  <td data-label={t('User Name')}>{row.user.name}</td>
                  <td data-label={t('User Email Address')}>{row.user.email}</td>
                  <td data-label={t('Phone Number')}>-</td>
                  <td data-label={t('Role')}>{t(role === 'Admin' ? 'Administrator' : role)}</td>
                  <td data-label={t('Start Time')}>{moveInAt}</td>
                  <td data-label={t('End Time')}>{permanentStay ? '2100-12-31 11:59 PM' : moveOutAt || '2026-05-29 09:48 AM'}</td>
                  <td data-label={t('Device')}>{row.device.name}</td>
                  <td data-label={t('Passcode Status')}>{access.passcode ? t('Effective') : '-'}</td>
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
        <div className="move-in-stack move-in-stack--primary">
          <Panel step="1" title="Move-In Date & Time">
            <div className="move-date-grid">
              <div className="move-date-main">
                <SwitchRow label="Permanent Stay" checked={permanentStay} onChange={(checked) => {
                  setPermanentStay(checked);
                  if (checked) setMoveOutAt('2100-12-31 11:59 PM');
                }} />
                <TextField label="Move-In" value={moveInAt} onChange={setMoveInAt} />
                <TextField label="Move-Out" value={moveOutAt} onChange={setMoveOutAt} placeholder="End Date & Time" disabled={permanentStay} />
              </div>
              <SwitchRow label="Main Resident" checked={mainResident} onChange={setMainResident} />
            </div>
          </Panel>

          <Panel step="2" title="Access">
            <AccessRow label="Mobile Access" checked={access.mobile} onChange={(checked) => setAccess((current) => ({ ...current, mobile: checked }))} />
            <AccessRow label="E-Keys" checked={access.ekey} onChange={(checked) => setAccess((current) => ({ ...current, ekey: checked }))}>
              <select value={access.ekeyType} onChange={(event) => setAccess((current) => ({ ...current, ekeyType: event.target.value }))}>
                <option>{t('RFID Card')}</option>
                <option>{t('RFID FOB')}</option>
                <option>{t('RFID Wristband')}</option>
              </select>
            </AccessRow>
            <AccessRow label="Passcode" checked={access.passcode} onChange={(checked) => setAccess((current) => ({ ...current, passcode: checked }))}>
              <select value={access.passcodeMode} onChange={(event) => setAccess((current) => ({ ...current, passcodeMode: event.target.value }))}>
                <option>{t('System-Gen')}</option>
                <option>{t('User-Defined')}</option>
              </select>
              <select value={access.passcodeLength} onChange={(event) => setAccess((current) => ({ ...current, passcodeLength: event.target.value }))}>
                <option>{t('4 Digits')}</option>
                <option>{t('6 Digits')}</option>
                <option>{t('8 Digits')}</option>
              </select>
              {access.passcodeMode === 'User-Defined' && (
                <input value={access.passcodeValue} onChange={(event) => setAccess((current) => ({ ...current, passcodeValue: event.target.value }))} placeholder="1234" />
              )}
            </AccessRow>
          </Panel>
        </div>

        <div className="move-in-stack move-in-stack--rules">
          <div className="roles-permissions-grid">
            <Panel step="3" title="Roles" compact>
              {['Admin', 'Member', 'Guest'].map((item) => (
                <button className={role === item ? 'is-active' : ''} key={item} onClick={() => selectRole(item)} type="button">
                  {t(item)}
                  <span>{role === item ? '›' : ''}</span>
                </button>
              ))}
            </Panel>
            <Panel step="4" title="Permissions" compact>
              {permissionFields.map(([key, label]) => (
                <SelectField
                  key={key}
                  label={label}
                  value={permissions[key]}
                  options={['None', 'Full']}
                  onChange={(value) => setPermissions((current) => ({ ...current, [key]: value }))}
                />
              ))}
              <SelectField label="Mobile Access Type" value="On-site & Remote" options={['On-site & Remote', 'On-site Only']} onChange={() => {}} />
            </Panel>
          </div>

          <SubSection title="Privacy">
            <SwitchRow label={rolePermissionPresets[role].privacyLabel} checked={displayRoleInfo} onChange={setDisplayRoleInfo} />
          </SubSection>

          <SubSection title="Assign Units">
            <div className="radio-line">
              <label><input type="radio" name="assignMode" checked={assignMode === 'auto'} onChange={() => setAssignMode('auto')} /> {t('Auto-Assign')}</label>
              <label><input type="radio" name="assignMode" checked={assignMode === 'manual'} onChange={() => setAssignMode('manual')} /> {t('Manual Assign')}</label>
            </div>
            <SwitchRow label="Assign Access to Linked Public Units" checked={linkedPublicUnits} onChange={setLinkedPublicUnits} />
          </SubSection>
        </div>

        <Panel title="Scheduled Access (Optional)" className="move-schedule-panel">
          <SwitchRow label="Recurring Schedule" checked={recurringSchedule} onChange={setRecurringSchedule} alignEnd />
          <div className="time-pair">
            <TextField label="Start Time" value={startTime} onChange={setStartTime} />
            <TextField label="End Time" value={endTime} onChange={setEndTime} />
          </div>
          <SubSection title="Recurring Schedule">
            <div className="schedule-days">
              {weekDays.map((day) => (
                <label key={day} className={!recurringSchedule ? 'is-disabled' : ''}>
                  <input
                    type="checkbox"
                    checked={day === 'ALL' ? selectedDays.length === 7 : selectedDays.includes(day)}
                    disabled={!recurringSchedule}
                    onChange={() => {
                      if (day === 'ALL') {
                        setSelectedDays(selectedDays.length === 7 ? [] : weekDays.filter((item) => item !== 'ALL'));
                        return;
                      }
                      toggleValue(day, selectedDays, setSelectedDays);
                    }}
                  />
                  {t(day)}
                </label>
              ))}
            </div>
          </SubSection>
        </Panel>
      </div>

      <div className="move-in-selectors">
        <SelectorPanel
          title="Show Inactive Users Only"
          checked={showInactiveOnly}
          onToggle={setShowInactiveOnly}
          search={userSearch}
          setSearch={setUserSearch}
          canContinue={selectedUserIds.length > 0}
        >
          <MiniTable headers={['User', 'Email Address']} onToggleAll={toggleAllUsers}>
            {filteredUsers.map((user) => (
              <tr key={user.id} className={selectedUserIds.includes(user.id) ? 'is-selected' : ''}>
                <td data-label={t('Select')}><input type="checkbox" checked={selectedUserIds.includes(user.id)} onChange={() => toggleValue(user.id, selectedUserIds, setSelectedUserIds)} /></td>
                <td data-label={t('User')}>{user.name}</td>
                <td data-label={t('Email Address')}>{user.email}</td>
              </tr>
            ))}
          </MiniTable>
        </SelectorPanel>

        <SelectorPanel
          title="Show Vacant Units Only"
          checked={showVacantOnly}
          onToggle={setShowVacantOnly}
          extraLabel="Show Public Units"
          extraChecked={showPublicUnits}
          onExtraToggle={setShowPublicUnits}
          search={unitSearch}
          setSearch={setUnitSearch}
          canContinue={selectedUnitIds.length > 0}
        >
          <MiniTable headers={['Units', 'Status']} onToggleAll={toggleAllUnits}>
            <tr className="tree-row"><td data-label={t('Select')}><input type="checkbox" onChange={toggleAllUnits} /></td><td data-label={t('Units')}>− Main Building</td><td data-label={t('Status')}> </td></tr>
            <tr className="tree-row"><td data-label={t('Select')}><input type="checkbox" /></td><td data-label={t('Units')}>− 1st Floor</td><td data-label={t('Status')}> </td></tr>
            {filteredUnits.map((unit) => (
              <tr key={unit.id} className={selectedUnitIds.includes(unit.id) ? 'is-selected' : ''}>
                <td data-label={t('Select')}><input type="checkbox" checked={selectedUnitIds.includes(unit.id)} onChange={() => toggleValue(unit.id, selectedUnitIds, setSelectedUnitIds)} /></td>
                <td data-label={t('Units')}>+ {unit.name}</td>
                <td data-label={t('Status')}>{unit.occupied ? t('Occupied') : t('Vacant')}</td>
              </tr>
            ))}
          </MiniTable>
        </SelectorPanel>

        <section className="selector-panel selected-assignment">
          <div className="selector-actions">
            <Button variant="muted" onClick={() => { setSelectedUserIds([]); setSelectedUnitIds([]); setExpandedSummaryUsers([]); }}>{t('Clear All')}</Button>
          </div>
          <MiniTable headers={['User', 'Units', 'Devices']} selectable={false}>
            {groupedAssignments.map((group) => {
              const expanded = expandedSummaryUsers.includes(group.user.id);
              return (
                <tr key={group.user.id} className={expanded ? 'is-expanded' : ''}>
                  <td data-label={t('User')}>{group.user.name}</td>
                  <td data-label={t('Units')}>
                    <ChipStack items={group.units} getLabel={(unit) => unit.unitNumber} onRemove={(unit) => removeUnit(unit.id)} />
                  </td>
                  <td data-label={t('Devices')}>
                    <ChipStack items={group.devices} getLabel={(device) => device.name} maxCollapsed={expanded ? 20 : 2} />
                    <div className="summary-row-actions">
                      <button type="button" onClick={() => toggleValue(group.user.id, expandedSummaryUsers, setExpandedSummaryUsers)} aria-label={t('Details')}>
                        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                      <button type="button" onClick={() => removeUser(group.user.id)} aria-label={t('Delete')}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!groupedAssignments.length && <tr><td colSpan="3"><div className="empty-state">{t('No data')}</div></td></tr>}
          </MiniTable>
        </section>
      </div>

      <div className="form-footer move-in-footer">
        <Button variant="muted">{t('Cancel')}</Button>
        <Button onClick={handleConfirm} disabled={!resultRows.length}>{t('Confirm')}</Button>
      </div>
    </section>
  );
}

function Panel({ step, title, children, compact = false, className = '' }) {
  const { t } = useI18n();
  return (
    <section className={`move-panel ${compact ? 'move-panel--compact' : ''} ${className}`}>
      <h2>{step && <span className="step-badge">{step}</span>}{t(title)}</h2>
      <div className="move-panel__body">{children}</div>
    </section>
  );
}

function SubSection({ title, children }) {
  const { t } = useI18n();
  return (
    <section className="move-subsection">
      <h3>{t(title)}</h3>
      <div className="move-subsection__body">{children}</div>
    </section>
  );
}

function TextField({ label, value, onChange, placeholder, disabled = false }) {
  const { t } = useI18n();
  return (
    <label className="field move-field">
      <span>{t(label)}</span>
      <input value={value} placeholder={placeholder ? t(placeholder) : undefined} disabled={disabled} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectField({ label, value, options, onChange }) {
  const { t } = useI18n();
  return (
    <label className="permission-row">
      <span>{t(label)}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option value={option} key={option}>{t(option)}</option>)}
      </select>
    </label>
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

function AccessRow({ label, checked, onChange, children }) {
  const { t } = useI18n();
  return (
    <div className="access-row">
      <label>
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
        <span>{t(label)}</span>
      </label>
      {checked && <div className="access-row__controls">{children}</div>}
    </div>
  );
}

function SelectorPanel({ title, checked, onToggle, extraLabel, extraChecked, onExtraToggle, search, setSearch, canContinue, children }) {
  const { t } = useI18n();
  return (
    <section className="selector-panel">
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
      {children}
    </section>
  );
}

function MiniTable({ headers, children, selectable = true, onToggleAll }) {
  const { t } = useI18n();
  return (
    <div className="table-wrap">
      <table className="mini-table">
        <thead>
          <tr>
            {selectable && <th><input type="checkbox" onChange={onToggleAll} /></th>}
            {headers.map((header) => <th key={header}>{t(header)}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function ChipStack({ items, getLabel, onRemove, maxCollapsed = 3 }) {
  const visibleItems = items.slice(0, maxCollapsed);
  const hiddenCount = Math.max(items.length - visibleItems.length, 0);
  return (
    <div className="chip-stack">
      {visibleItems.map((item) => (
        <span className="chip" key={item.id} title={getLabel(item)}>
          {getLabel(item)}
          {onRemove && <button type="button" onClick={() => onRemove(item)} aria-label="Remove"><X size={12} /></button>}
        </span>
      ))}
      {hiddenCount > 0 && <span className="chip chip--muted">+{hiddenCount}</span>}
    </div>
  );
}
