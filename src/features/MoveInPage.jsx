import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronDown, ChevronRight, Search, Trash2, X } from 'lucide-react';
import { Button } from '../components/ui.jsx';
import { devices, units, users } from '../domain/mockData.js';
import { useI18n } from '../i18n/useI18n.js';

const rolePermissionPresets = {
  Admin: {
    permissions: {
      manageAdmins: 'Full',
      manageDevices: 'Full',
      ekeys: 'Full',
      doorbell: 'Full',
      mobileAccessType: 'On-site & Remote',
    },
    privacyLabel: 'Display Owner Info in the App',
  },
  Member: {
    permissions: {
      manageMembers: 'None',
      manageGuests: 'None',
      ekeys: 'None',
      doorbell: 'None',
      mobileAccessType: 'On-site & Remote',
    },
    privacyLabel: 'Display Admin Info in the App',
  },
  Guest: {
    permissions: {
      manageGuests: 'None',
      doorbell: 'None',
      mobileAccessType: 'On-site & Remote',
    },
    privacyLabel: 'Display Member Info in the App',
  },
};

const permissionFieldsByRole = {
  Admin: [
    ['manageAdmins', 'Manage Admins', ['Full', 'Edit', 'View', 'None']],
    ['manageDevices', 'Manage Devices', ['Full', 'Edit', 'View', 'None']],
    ['ekeys', 'E-Keys', ['Full', 'Edit', 'View', 'None']],
    ['doorbell', 'Doorbell answering', ['Full', 'None']],
    ['mobileAccessType', 'Mobile Access Type', ['On-site & Remote', 'On-site Only']],
  ],
  Member: [
    ['manageMembers', 'Manage Members', ['Full', 'Edit', 'View', 'None']],
    ['manageGuests', 'Manage Guests', ['Full', 'Edit', 'View', 'None']],
    ['ekeys', 'E-Keys', ['Full', 'Edit', 'View', 'None']],
    ['doorbell', 'Doorbell answering', ['Full', 'None']],
    ['mobileAccessType', 'Mobile Access Type', ['On-site & Remote', 'On-site Only']],
  ],
  Guest: [
    ['manageGuests', 'Manage Guests', ['Full', 'Edit', 'View', 'None']],
    ['doorbell', 'Doorbell answering', ['Full', 'None']],
    ['mobileAccessType', 'Mobile Access Type', ['On-site & Remote', 'On-site Only']],
  ],
};

const weekDays = ['ALL', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const timeHours = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0'));
const timeMinutes = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'));

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
  const [moveInAt, setMoveInAt] = useState('2026-04-29 03:00 PM');
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
  const [assignmentGroups, setAssignmentGroups] = useState([]);
  const [expandedSummaryUsers, setExpandedSummaryUsers] = useState([]);
  const [expandedTreeIds, setExpandedTreeIds] = useState(['building-Main Building', 'floor-Main Building-1st Floor', 'unit-u-6']);
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
      return (!keyword || haystack.includes(keyword)) && (!showVacantOnly || !unit.occupied) && (showPublicUnits || !unit.publicUnit);
    });
  }, [showPublicUnits, showVacantOnly, unitSearch]);

  const selectedUsers = useMemo(() => users.filter((user) => selectedUserIds.includes(user.id)), [selectedUserIds]);
  const selectedUnits = useMemo(() => units.filter((unit) => selectedUnitIds.includes(unit.id)), [selectedUnitIds]);

  const canPairSelections = selectedUsers.length > 0 && selectedUnits.length > 0;

  const groupedAssignments = assignmentGroups;

  const resultRows = useMemo(() => groupedAssignments.flatMap((group, groupIndex) => (
    // Flatten grouped assignments into transaction rows to mimic the production processing screen.
    // 将用户分组授权压平成交易记录行，用于模拟线上提交后的处理页。
    group.units.flatMap((unit, unitIndex) => {
      const linkedDevices = getDevicesForUnit(unit);
      return linkedDevices.map((device, deviceIndex) => ({
        id: `${group.user.id}-${unit.id}-${device.id}`,
        transactionId: 33186 - groupIndex * 12 - unitIndex - deviceIndex,
        user: group.user,
        unit,
        device,
      }));
    })
  )), [groupedAssignments]);

  const selectRole = (nextRole) => {
    // Role selection changes the default permission set, mirroring the production form behavior.
    // 切换角色时同步更新默认权限，复刻线上表单中 Role 与 Permission 的联动。
    setRole(nextRole);
    setPermissions(rolePermissionPresets[nextRole].permissions);
  };

  const toggleTreeNode = (nodeId) => {
    setExpandedTreeIds((current) => current.includes(nodeId) ? current.filter((id) => id !== nodeId) : [...current, nodeId]);
  };

  const toggleValue = (value, list, setter) => {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const toggleAllUsers = () => {
    // Select-all only applies to the currently filtered list, matching common SaaS table behavior.
    // 全选只作用于当前筛选后的可见用户，符合常见 SaaS 表格操作逻辑。
    const visibleIds = filteredUsers.map((user) => user.id);
    const allVisibleSelected = visibleIds.every((id) => selectedUserIds.includes(id));
    setSelectedUserIds(allVisibleSelected ? selectedUserIds.filter((id) => !visibleIds.includes(id)) : [...new Set([...selectedUserIds, ...visibleIds])]);
  };

  const toggleAllUnits = () => {
    // Unit select-all follows the same visible-list rule, so filters never mutate hidden rows unexpectedly.
    // Unit 全选同样只影响可见列表，避免筛选后误改隐藏行。
    const visibleIds = filteredUnits.map((unit) => unit.id);
    const allVisibleSelected = visibleIds.every((id) => selectedUnitIds.includes(id));
    setSelectedUnitIds(allVisibleSelected ? selectedUnitIds.filter((id) => !visibleIds.includes(id)) : [...new Set([...selectedUnitIds, ...visibleIds])]);
  };

  const removeUnit = (unitId) => {
    // Removing a unit affects the review area, not the temporary selector state.
    // 删除 Unit 作用于右侧复核区，不影响当前临时选择状态。
    setAssignmentGroups((current) => current
      .map((group) => ({
        ...group,
        units: group.units.filter((unit) => unit.id !== unitId),
        devices: group.devices.filter((device) => device.unitId !== unitId),
      }))
      .filter((group) => group.units.length > 0));
  };

  const removeUser = (userId) => {
    setAssignmentGroups((current) => current.filter((group) => group.user.id !== userId));
    setExpandedSummaryUsers((current) => current.filter((id) => id !== userId));
  };

  const clearAssignments = () => {
    setAssignmentGroups([]);
    setSelectedUserIds([]);
    setSelectedUnitIds([]);
    setExpandedSummaryUsers([]);
  };

  const pairSelections = () => {
    if (!canPairSelections) return;

    // Pair is an explicit staging action: selected users + selected units move to review, then selectors reset.
    // Pair 是显式暂存动作：把已选用户和 Unit 加入右侧复核区，然后清空左右选择器以便继续添加。
    setAssignmentGroups((current) => mergeAssignmentGroups(current, selectedUsers, selectedUnits));
    setSelectedUserIds([]);
    setSelectedUnitIds([]);
  };

  const handleConfirm = () => {
    if (resultRows.length) setSubmitted(true);
  };

  if (submitted) {
    // Submitted state intentionally becomes a read-only processing table, matching the uploaded production recording.
    // 提交后切换为只读处理表格，贴近用户上传录屏中的线上结果页。
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
        {/* Top configuration area: date/access/role/permission/schedule are independent blocks for responsive rearrangement. */}
        {/* 顶部配置区：日期、访问方式、角色、权限、计划访问相互独立，便于响应式重排。 */}
        <div className="move-in-stack move-in-stack--primary">
          <Panel step="1" title="Move-In Date & Time">
            <div className="move-date-grid">
              <div className="move-date-main">
                <SwitchRow label="Permanent Stay" checked={permanentStay} onChange={(checked) => {
                  setPermanentStay(checked);
                  if (checked) setMoveOutAt('2100-12-31 11:59 PM');
                }} />
                <DateTimeField label="Move-In" value={moveInAt} onChange={setMoveInAt} />
                <DateTimeField label="Move-Out" value={moveOutAt} onChange={setMoveOutAt} placeholder="End Date & Time" disabled={permanentStay} />
              </div>
              <SwitchRow label="Main Resident" checked={mainResident} onChange={setMainResident} />
            </div>
          </Panel>

          <Panel step="2" title="Access">
            <AccessRow label="Mobile Access" checked={access.mobile} onChange={(checked) => setAccess((current) => ({ ...current, mobile: checked }))} />
            <AccessRow label="E-Keys" checked={access.ekey} onChange={(checked) => setAccess((current) => ({ ...current, ekey: checked }))}>
              <CustomSelect
                className="custom-select--access"
                value={access.ekeyType}
                options={['RFID Card', 'RFID FOB', 'RFID Wristband']}
                onChange={(value) => setAccess((current) => ({ ...current, ekeyType: value }))}
              />
            </AccessRow>
            <AccessRow label="Passcode" checked={access.passcode} onChange={(checked) => setAccess((current) => ({ ...current, passcode: checked }))}>
              <CustomSelect
                className="custom-select--access"
                value={access.passcodeMode}
                options={['System-Gen', 'User-Defined']}
                onChange={(value) => setAccess((current) => ({ ...current, passcodeMode: value }))}
              />
              <CustomSelect
                className="custom-select--access"
                value={access.passcodeLength}
                options={['4 Digits', '6 Digits', '8 Digits']}
                onChange={(value) => setAccess((current) => ({ ...current, passcodeLength: value }))}
              />
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
              {permissionFieldsByRole[role].map(([key, label, options]) => (
                <CustomSelectField
                  key={key}
                  label={label}
                  value={permissions[key]}
                  options={options}
                  onChange={(value) => setPermissions((current) => ({ ...current, [key]: value }))}
                />
              ))}
            </Panel>
          </div>

          <SubSection title="Privacy">
            <SwitchRow label={rolePermissionPresets[role].privacyLabel} checked={displayRoleInfo} onChange={setDisplayRoleInfo} />
          </SubSection>

          <SubSection title="Assign Units">
            <div className="radio-line">
              <RadioOption name="assignMode" label="Auto-Assign" checked={assignMode === 'auto'} onChange={() => setAssignMode('auto')} />
              <RadioOption name="assignMode" label="Manual Assign" checked={assignMode === 'manual'} onChange={() => setAssignMode('manual')} />
            </div>
            <SwitchRow label="Assign Access to Linked Public Units" checked={linkedPublicUnits} onChange={setLinkedPublicUnits} />
          </SubSection>
        </div>

        <Panel title="Scheduled Access (Optional)" className="move-schedule-panel">
          <SwitchRow label="Recurring Schedule" checked={recurringSchedule} onChange={setRecurringSchedule} alignEnd />
          <div className="time-pair">
            <TimeField label="Start Time" value={startTime} onChange={setStartTime} />
            <TimeField label="End Time" value={endTime} onChange={setEndTime} />
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
        {/* Bottom selector area: users + units generate the assignment summary on the right. */}
        {/* 底部选择区：左侧用户与中间 Unit 的选择结果，会实时生成右侧授权摘要。 */}
        <SelectorPanel
          title="Show Inactive Users Only"
          checked={showInactiveOnly}
          onToggle={setShowInactiveOnly}
          search={userSearch}
          setSearch={setUserSearch}
          showAction={false}
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
          actionLabel="Pair"
          canAction={canPairSelections}
          onAction={pairSelections}
        >
          <MiniTable headers={['Units', 'Status']} onToggleAll={toggleAllUnits}>
            <UnitTreeRows
              unitsList={filteredUnits}
              selectedUnitIds={selectedUnitIds}
              setSelectedUnitIds={setSelectedUnitIds}
              expandedTreeIds={expandedTreeIds}
              toggleTreeNode={toggleTreeNode}
            />
          </MiniTable>
        </SelectorPanel>

        <section className="selector-panel selected-assignment">
          <div className="selector-actions">
            <Button variant="muted" onClick={clearAssignments}>{t('Clear All')}</Button>
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
  // Section wrapper for the numbered Move-In cards; keep content children flexible for v2/v3.
  // Move-In 编号卡片容器；children 保持开放，方便 v2/v3 改布局但复用逻辑。
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

function CustomSelectField({ label, value, options, onChange }) {
  const { t } = useI18n();

  return (
    <div className="permission-row custom-select-row">
      <span>{t(label)}</span>
      <CustomSelect value={value} options={options} onChange={onChange} />
    </div>
  );
}

function CustomSelect({ value, options, onChange, className = '' }) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const fieldRef = useRef(null);

  // Reusable custom dropdown for Move-In; used by Permissions and Access controls to avoid browser-native select UI.
  // Move-In 可复用自定义下拉；Permissions 与 Access 共用，避免出现浏览器原生 select 样式。
  useOutsideDismiss(fieldRef, isOpen, () => setIsOpen(false));

  return (
    <span className={`custom-select ${className}`} ref={fieldRef}>
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

function DateTimeField({ label, value, onChange, placeholder, disabled = false }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const fieldRef = useRef(null);

  // The picker is visually an overlay; outside clicks close it without changing the draft value.
  // 日期选择器按浮层处理；点击外部只关闭，不会修改未确认的草稿值。
  useOutsideDismiss(fieldRef, open, () => setOpen(false));

  // Custom date-time field mirrors the production picker instead of using the browser-native date input.
  // 自定义日期时间字段复刻线上选择器，而不是使用浏览器原生 date input。
  return (
    <div className={`field move-field datetime-field ${open ? 'is-layer-open' : ''}`} ref={fieldRef}>
      <span>{t(label)}</span>
      <button type="button" className={open ? 'is-open' : ''} disabled={disabled} onClick={() => setOpen((current) => !current)}>
        <span>{value || (placeholder ? t(placeholder) : '')}</span>
        <CalendarDays size={14} />
      </button>
      {!disabled && (
        <DateTimePopover
          value={value}
          isOpen={open}
          onCancel={() => setOpen(false)}
          onApply={(nextValue) => {
            onChange(nextValue);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function TimeField({ label, value, onChange }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const fieldRef = useRef(null);

  // Scheduled access uses a time-only picker with the same overlay and outside-click behavior.
  // Scheduled Access 使用仅时间选择器，并复用浮层和点击外部关闭的交互。
  useOutsideDismiss(fieldRef, open, () => setOpen(false));

  return (
    <div className={`field move-field time-field ${open ? 'is-layer-open' : ''}`} ref={fieldRef}>
      <span>{t(label)}</span>
      <button type="button" className={open ? 'is-open' : ''} onClick={() => setOpen((current) => !current)}>
        <span>{value}</span>
        <CalendarDays size={14} />
      </button>
      <TimePopover
        value={value}
        isOpen={open}
        onCancel={() => setOpen(false)}
        onApply={(nextValue) => {
          onChange(nextValue);
          setOpen(false);
        }}
      />
    </div>
  );
}

function DateTimePopover({ value, isOpen, onApply, onCancel }) {
  const [draft, setDraft] = useState(() => parseDemoDate(value) ?? new Date(2026, 3, 29, 15, 0));
  const year = draft.getFullYear();
  const month = draft.getMonth();
  const calendarDays = getCalendarDays(year, month);
  const selectedDateKey = toDateKey(draft);
  const displayHour = draft.getHours() % 12 || 12;
  const amPm = draft.getHours() >= 12 ? 'PM' : 'AM';

  useEffect(() => {
    if (isOpen) setDraft(parseDemoDate(value) ?? new Date());
  }, [isOpen, value]);

  const updateDraftTime = ({ hour = displayHour, minute = draft.getMinutes(), period = amPm }) => {
    const next = new Date(draft);
    const normalizedHour = period === 'PM' ? (Number(hour) % 12) + 12 : Number(hour) % 12;
    next.setHours(normalizedHour, Number(minute), 0, 0);
    setDraft(next);
  };

  const shiftMonth = (offset) => {
    const next = new Date(draft);
    next.setMonth(next.getMonth() + offset);
    setDraft(next);
  };

  return (
    <div className={`datetime-popover ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen}>
      <div className="datetime-popover__top">
        <button type="button" onClick={() => shiftMonth(-1)}>‹‹</button>
        <strong>{monthLabels[month]} {year}</strong>
        <button type="button" onClick={() => shiftMonth(1)}>››</button>
        <span>{formatDemoDate(draft)}</span>
      </div>
      <div className="datetime-popover__body">
        <div className="calendar-picker">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => <b key={day}>{day}</b>)}
          {calendarDays.map((day) => (
            <button
              type="button"
              key={`${day.date.toISOString()}-${day.inMonth}`}
              className={`${!day.inMonth ? 'is-dim' : ''} ${selectedDateKey === toDateKey(day.date) ? 'is-selected' : ''}`}
              onClick={() => {
                const next = new Date(draft);
                next.setFullYear(day.date.getFullYear(), day.date.getMonth(), day.date.getDate());
                setDraft(next);
              }}
            >
              {day.date.getDate()}
            </button>
          ))}
        </div>
        <div className="time-picker-list">
          {timeHours.map((hour) => (
            <button type="button" key={hour} className={Number(hour) === displayHour ? 'is-selected' : ''} onClick={() => updateDraftTime({ hour })}>{hour}</button>
          ))}
        </div>
        <div className="time-picker-list">
          {timeMinutes.map((minute) => (
            <button type="button" key={minute} className={Number(minute) === draft.getMinutes() ? 'is-selected' : ''} onClick={() => updateDraftTime({ minute })}>{minute}</button>
          ))}
        </div>
        <div className="time-picker-list time-picker-list--period">
          {['AM', 'PM'].map((period) => (
            <button type="button" key={period} className={period === amPm ? 'is-selected' : ''} onClick={() => updateDraftTime({ period })}>{period}</button>
          ))}
        </div>
      </div>
      <div className="datetime-popover__actions">
        <button type="button" onClick={() => setDraft(new Date())}>Now</button>
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="button" className="is-primary" onClick={() => onApply(formatDemoDate(draft))}>OK</button>
      </div>
    </div>
  );
}

function TimePopover({ value, isOpen, onApply, onCancel }) {
  const [draft, setDraft] = useState(() => parseDemoTime(value));

  // Reset the draft each time the overlay opens, so Cancel always discards temporary picker changes.
  // 每次打开浮层时重置草稿值，确保 Cancel 会丢弃临时选择。
  useEffect(() => {
    if (isOpen) setDraft(parseDemoTime(value));
  }, [isOpen, value]);

  const applyNow = () => setDraft(parseDemoTime(formatDemoTime(new Date())));

  return (
    <div className={`time-popover ${isOpen ? 'is-open' : ''}`} aria-hidden={!isOpen}>
      <div className="time-popover__body">
        <div className="time-picker-list">
          {timeHours.map((hour) => (
            <button type="button" key={hour} className={draft.hour === hour ? 'is-selected' : ''} onClick={() => setDraft((current) => ({ ...current, hour }))}>{hour}</button>
          ))}
        </div>
        <div className="time-picker-list">
          {timeMinutes.map((minute) => (
            <button type="button" key={minute} className={draft.minute === minute ? 'is-selected' : ''} onClick={() => setDraft((current) => ({ ...current, minute }))}>{minute}</button>
          ))}
        </div>
        <div className="time-picker-list time-picker-list--period">
          {['AM', 'PM'].map((period) => (
            <button type="button" key={period} className={draft.period === period ? 'is-selected' : ''} onClick={() => setDraft((current) => ({ ...current, period }))}>{period}</button>
          ))}
        </div>
      </div>
      <div className="datetime-popover__actions">
        <button type="button" onClick={applyNow}>Now</button>
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="button" className="is-primary" onClick={() => onApply(`${draft.hour}:${draft.minute} ${draft.period}`)}>OK</button>
      </div>
    </div>
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

function RadioOption({ name, label, checked, onChange }) {
  const { t } = useI18n();
  return (
    <label className="radio-option">
      <input className="sr-only" type="radio" name={name} checked={checked} onChange={onChange} />
      <span className={`radio-indicator ${checked ? 'is-checked' : ''}`} />
      <span>{t(label)}</span>
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

export function SelectorPanel({
  title,
  checked,
  onToggle,
  extraLabel,
  extraChecked,
  onExtraToggle,
  search,
  setSearch,
  actionLabel = 'Next',
  canAction = false,
  onAction,
  showAction = true,
  children,
}) {
  const { t } = useI18n();
  // Shared picker shell for Users and Units; actions stay local while table content is injected.
  // 用户与 Unit 选择器共用外壳；搜索/开关在外层，表格内容由 children 注入。
  return (
    <section className="selector-panel">
      <div className="selector-header">
        <div className="selector-header__toggles">
          <SwitchRow label={title} checked={checked} onChange={onToggle} />
          {extraLabel && <SwitchRow label={extraLabel} checked={extraChecked} onChange={onExtraToggle} />}
        </div>
        <div className={`selector-search ${!showAction ? 'selector-search--no-action' : ''}`}>
          <input value={search} placeholder={t('Search here...')} onChange={(event) => setSearch(event.target.value)} />
          <button className="selector-search__icon" type="button" aria-label={t('Search')}><Search size={16} /></button>
          {showAction && <Button onClick={onAction} disabled={!canAction}>{t(actionLabel)}</Button>}
        </div>
      </div>
      {children}
    </section>
  );
}

export function MiniTable({ headers, children, selectable = true, onToggleAll }) {
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

export function UnitTreeRows({ unitsList, selectedUnitIds, setSelectedUnitIds, expandedTreeIds, toggleTreeNode }) {
  const { t } = useI18n();
  const grouped = useMemo(() => groupUnitsForTree(unitsList), [unitsList]);

  // Unit picker is hierarchical: parent rows select descendants and child rows can be expanded independently.
  // Unit 选择器是层级树：父级行可选择子级，子级也可以独立展开/折叠。
  const toggleUnit = (unitId) => {
    setSelectedUnitIds((current) => current.includes(unitId) ? current.filter((id) => id !== unitId) : [...current, unitId]);
  };

  const toggleUnitSet = (unitIds) => {
    setSelectedUnitIds((current) => {
      const allSelected = unitIds.every((id) => current.includes(id));
      return allSelected ? current.filter((id) => !unitIds.includes(id)) : [...new Set([...current, ...unitIds])];
    });
  };

  return grouped.flatMap((building) => {
    const buildingId = `building-${building.name}`;
    const buildingExpanded = expandedTreeIds.includes(buildingId);
    const buildingUnitIds = building.floors.flatMap((floor) => floor.units.map((unit) => unit.id));
    const rows = [
      <TreeRow
        key={buildingId}
        level={0}
        label={building.name}
        expandable
        expanded={buildingExpanded}
        checked={buildingUnitIds.length > 0 && buildingUnitIds.every((id) => selectedUnitIds.includes(id))}
        onExpand={() => toggleTreeNode(buildingId)}
        onCheck={() => toggleUnitSet(buildingUnitIds)}
      />,
    ];

    if (!buildingExpanded) return rows;

    building.floors.forEach((floor) => {
      const floorId = `floor-${building.name}-${floor.name}`;
      const floorExpanded = expandedTreeIds.includes(floorId);
      const floorUnitIds = floor.units.map((unit) => unit.id);
      rows.push(
        <TreeRow
          key={floorId}
          level={1}
          label={floor.name}
          expandable
          expanded={floorExpanded}
          checked={floorUnitIds.length > 0 && floorUnitIds.every((id) => selectedUnitIds.includes(id))}
          onExpand={() => toggleTreeNode(floorId)}
          onCheck={() => toggleUnitSet(floorUnitIds)}
        />,
      );

      if (!floorExpanded) return;

      floor.units.forEach((unit) => {
        const unitId = `unit-${unit.id}`;
        const linkedDevices = devices.filter((device) => device.unitId === unit.id);
        const unitExpanded = expandedTreeIds.includes(unitId);
        rows.push(
          <TreeRow
            key={unitId}
            level={2}
            label={unit.name}
            status={unit.occupied ? t('Occupied') : t('Vacant')}
            expandable={linkedDevices.length > 0}
            expanded={unitExpanded}
            checked={selectedUnitIds.includes(unit.id)}
            onExpand={() => toggleTreeNode(unitId)}
            onCheck={() => toggleUnit(unit.id)}
          />,
        );

        if (!unitExpanded) return;

        linkedDevices.forEach((device) => {
          rows.push(
            <TreeRow
              key={`device-${device.id}`}
              level={3}
              label={device.name}
              checked={selectedUnitIds.includes(unit.id)}
              onCheck={() => toggleUnit(unit.id)}
            />,
          );
        });
      });
    });

    return rows;
  });
}

function TreeRow({ level, label, status = '', expandable = false, expanded = false, checked = false, onExpand, onCheck }) {
  const { t } = useI18n();
  // One tree row can represent building, floor, unit or device; level controls indentation only.
  // 同一个树行组件可表示楼栋、楼层、Unit 或 Device；level 只控制缩进。
  return (
    <tr className={`tree-row tree-row--level-${level} ${checked ? 'is-selected' : ''}`}>
      <td data-label={t('Select')}><input type="checkbox" checked={checked} onChange={onCheck} /></td>
      <td data-label={t('Units')}>
        <span className="tree-cell" style={{ '--tree-indent': `${level * 18}px` }}>
          {expandable ? (
            <button type="button" className="tree-toggle" onClick={onExpand}>{expanded ? '−' : '+'}</button>
          ) : (
            <span className="tree-toggle tree-toggle--empty" />
          )}
          <span>{label}</span>
        </span>
      </td>
      <td data-label={t('Status')}>{status}</td>
    </tr>
  );
}

export function ChipStack({ items, getLabel, onRemove, maxCollapsed = 3 }) {
  // Collapse long unit/device lists to protect table width; expanded rows can pass a larger maxCollapsed value.
  // 长 Unit/Device 列表默认折叠，避免撑破表格；展开行可传入更大的 maxCollapsed。
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

function groupUnitsForTree(unitsList) {
  // Group flat mock units into Building > Floor > Units for the Move-In selector.
  // 将扁平 mock Unit 数据整理为 Building > Floor > Units，供 Move-In 选择器渲染。
  const buildings = new Map();
  unitsList.forEach((unit) => {
    if (!buildings.has(unit.building)) buildings.set(unit.building, new Map());
    const floors = buildings.get(unit.building);
    if (!floors.has(unit.floor)) floors.set(unit.floor, []);
    floors.get(unit.floor).push(unit);
  });

  return Array.from(buildings, ([name, floors]) => ({
    name,
    floors: Array.from(floors, ([floorName, floorUnits]) => ({ name: floorName, units: floorUnits })),
  }));
}

function getDevicesForUnit(unit) {
  const linkedDevices = devices.filter((device) => device.unitId === unit.id);
  return linkedDevices.length ? linkedDevices : [devices[0]];
}

function mergeAssignmentGroups(currentGroups, usersToPair, unitsToPair) {
  // Merge by user ID and dedupe unit/device IDs so repeated Pair clicks do not create duplicate chips.
  // 按 User ID 合并，并对 Unit/Device 去重，避免重复点击 Pair 生成重复标签。
  const nextGroups = currentGroups.map((group) => ({
    ...group,
    units: [...group.units],
    devices: [...group.devices],
  }));

  usersToPair.forEach((user) => {
    const devicesToPair = unitsToPair.flatMap(getDevicesForUnit);
    const existing = nextGroups.find((group) => group.user.id === user.id);

    if (!existing) {
      nextGroups.push({ user, units: [...unitsToPair], devices: dedupeById(devicesToPair) });
      return;
    }

    existing.units = dedupeById([...existing.units, ...unitsToPair]);
    existing.devices = dedupeById([...existing.devices, ...devicesToPair]);
  });

  return nextGroups;
}

function dedupeById(items) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

function useOutsideDismiss(ref, enabled, onDismiss) {
  // Shared outside-click listener for floating controls that are visually above their parent panels.
  // 浮层控件共用的外部点击监听，用于让下拉/日期时间选择器在父容器上层正确收起。
  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return undefined;

    const handlePointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onDismiss();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [enabled, onDismiss, ref]);
}

function parseDemoDate(value) {
  if (!value) return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2})\s+(AM|PM)$/);
  if (!match) return null;
  const [, year, month, day, hour, minute, period] = match;
  const normalizedHour = period === 'PM' ? (Number(hour) % 12) + 12 : Number(hour) % 12;
  return new Date(Number(year), Number(month) - 1, Number(day), normalizedHour, Number(minute), 0, 0);
}

function parseDemoTime(value) {
  const match = value?.match(/^(\d{1,2}):(\d{2})\s+(AM|PM)$/);
  if (!match) return { hour: '12', minute: '00', period: 'AM' };
  const [, hour, minute, period] = match;
  return { hour: String(Number(hour)).padStart(2, '0'), minute, period };
}

function formatDemoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = date.getHours() % 12 || 12;
  const minute = String(date.getMinutes()).padStart(2, '0');
  const period = date.getHours() >= 12 ? 'PM' : 'AM';
  return `${year}-${month}-${day} ${String(hour).padStart(2, '0')}:${minute} ${period}`;
}

function formatDemoTime(date) {
  const hour = date.getHours() % 12 || 12;
  const minute = String(date.getMinutes()).padStart(2, '0');
  const period = date.getHours() >= 12 ? 'PM' : 'AM';
  return `${String(hour).padStart(2, '0')}:${minute} ${period}`;
}

function getCalendarDays(year, month) {
  const start = new Date(year, month, 1);
  const gridStart = new Date(start);
  gridStart.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return { date, inMonth: date.getMonth() === month };
  });
}

function toDateKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
