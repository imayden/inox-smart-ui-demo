import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui.jsx';
import { devices, units, users } from '../domain/mockData.js';
import { useDemoStore } from '../demo/demoStore.js';
import { useI18n } from '../i18n/useI18n.js';
import { ChipStack, MiniTable, SelectorPanel, UnitTreeRows } from './MoveInPage.jsx';

const credentialTabs = [
  { id: 'passcode', label: 'Passcodes' },
  { id: 'rfid', label: 'RFIDs' },
  { id: 'fingerprint', label: 'Fingerprint' },
  { id: 'face', label: 'Face ID' },
];

const dayOptions = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Grant Access is a guided credential assignment flow from Access Management.
// Grant Access 是从 Access Management 进入的凭证授权流程：选择用户、凭证类型、时间规则和设备后提交。
export function GrantAccessPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const uiVersion = useDemoStore((state) => state.uiVersion);
  const propertyId = useDemoStore((state) => state.propertyId);
  const [credentialType, setCredentialType] = useState('passcode');
  const [selectedUserId, setSelectedUserId] = useState('usr-7');
  const [selectedUnitId, setSelectedUnitId] = useState('u-6');
  const [selectedDeviceIds, setSelectedDeviceIds] = useState(['d-6']);
  const [permanent, setPermanent] = useState(true);
  const [recurringSchedule, setRecurringSchedule] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);
  const [showVacantOnly, setShowVacantOnly] = useState(false);
  const [showPublicUnits, setShowPublicUnits] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [unitSearch, setUnitSearch] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedUnitIds, setSelectedUnitIds] = useState([]);
  const [accessPairs, setAccessPairs] = useState([]);
  const [expandedPairUsers, setExpandedPairUsers] = useState([]);
  const [expandedTreeIds, setExpandedTreeIds] = useState(['building-Main Building', 'floor-Main Building-1st Floor']);
  const [submitted, setSubmitted] = useState(false);

  const selectedUser = users.find((user) => user.id === selectedUserId) ?? users[0];
  const selectedUnit = units.find((unit) => unit.id === selectedUnitId) ?? units[0];
  const availableDevices = useMemo(() => {
    // Devices are scoped by selected unit; fallback rows keep the demo usable when mock data is sparse.
    // 设备按所选 Unit 过滤；当 mock 数据不足时使用备用设备，保证 demo 始终可操作。
    const unitDevices = devices.filter((device) => device.unitId === selectedUnit.id);
    return unitDevices.length ? unitDevices : devices.slice(0, 4);
  }, [selectedUnit]);

  const selectedDevices = devices.filter((device) => selectedDeviceIds.includes(device.id));
  const accessName = credentialType === 'passcode' ? `${selectedUser.name}@5372` : credentialType === 'rfid' ? 'AppCard0422' : `${selectedUser.name} ${credentialType}`;

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

  const toggleDevice = (deviceId) => {
    setSelectedDeviceIds((current) => current.includes(deviceId) ? current.filter((id) => id !== deviceId) : [...current, deviceId]);
  };

  const toggleDay = (day) => {
    setSelectedDays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day]);
  };

  const toggleValue = (value, list, setter) => {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const toggleTreeNode = (nodeId) => {
    setExpandedTreeIds((current) => current.includes(nodeId) ? current.filter((id) => id !== nodeId) : [...current, nodeId]);
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

  const pairSelections = () => {
    if (!canPairSelections) return;

    // Grant Access uses the same explicit Pair staging model as Move-In so review rows are intentional.
    // Grant Access 复用 Move-In 的显式 Pair 暂存模型，确保右侧复核行来自用户主动配对。
    setAccessPairs((current) => mergeAccessPairs(current, selectedUsers, selectedUnits));
    setSelectedUserId(selectedUsers[0].id);
    setSelectedUnitId(selectedUnits[0].id);
    setSelectedDeviceIds(getDevicesForUnit(selectedUnits[0]).map((device) => device.id));
    setSelectedUserIds([]);
    setSelectedUnitIds([]);
  };

  const removeUnitFromPair = (userId, unitId) => {
    setAccessPairs((current) => current
      .map((pair) => ({
        ...pair,
        units: pair.user.id === userId ? pair.units.filter((unit) => unit.id !== unitId) : pair.units,
        devices: pair.user.id === userId ? pair.devices.filter((device) => device.unitId !== unitId) : pair.devices,
      }))
      .filter((pair) => pair.units.length > 0));
  };

  const removeDeviceFromPair = (userId, deviceId) => {
    setAccessPairs((current) => current
      .map((pair) => {
        if (pair.user.id !== userId) return pair;

        const removedDevice = pair.devices.find((device) => device.id === deviceId);
        const devicesAfterRemoval = pair.devices.filter((device) => device.id !== deviceId);
        const unitsAfterRemoval = removedDevice && !devicesAfterRemoval.some((device) => device.unitId === removedDevice.unitId)
          ? pair.units.filter((unit) => unit.id !== removedDevice.unitId)
          : pair.units;

        return { ...pair, units: unitsAfterRemoval, devices: devicesAfterRemoval };
      })
      .filter((pair) => pair.units.length > 0));
  };

  const removePair = (userId) => {
    setAccessPairs((current) => current.filter((pair) => pair.user.id !== userId));
    setExpandedPairUsers((current) => current.filter((id) => id !== userId));
  };

  const backToAccess = () => navigate(`/demo/${uiVersion}/property/${propertyId}/access`);

  return (
    <section className="grant-access-page">
      <button className="breadcrumb breadcrumb-button" type="button" onClick={backToAccess}>‹ {t('Access Management')}</button>
      <div className="grant-page-title">
        <h1>{t('Grant Access')}</h1>
        {submitted && <span className="success-pill">{t('Submitted')}</span>}
      </div>

      <div className="credential-tabs">
        {/* Credential tabs reuse the same form shell; only credential-specific fields change below. */}
        {/* 凭证 tab 共用同一个表单外壳，下面仅切换不同凭证类型的专属字段。 */}
        {credentialTabs.map((tab) => (
          <button key={tab.id} className={credentialType === tab.id ? 'is-active' : ''} onClick={() => setCredentialType(tab.id)}>
            {t(tab.label)}
          </button>
        ))}
      </div>

      <div className="grant-layout">
        {/* Three-card layout mirrors production: user/unit, credential details, then date/schedule rules. */}
        {/* 三卡片布局贴近线上结构：用户/单元、凭证详情、日期与计划规则。 */}
        <section className="grant-card">
          <h2>{t('Credential Owner')}</h2>
          <label className="field"><span>{t('User Email Address')}</span><input value={selectedUser.email} readOnly /></label>
          <div className="form-grid compact-grid">
            <label className="field"><span>{t('First Name')}</span><input value={selectedUser.firstName} readOnly /></label>
            <label className="field"><span>{t('Last Name')}</span><input value={selectedUser.lastName} readOnly /></label>
          </div>
          <label className="field"><span>{t('Unit')}</span><input value={selectedUnit.unitNumber} readOnly /></label>
        </section>

        <section className="grant-card">
          <h2>{t(credentialTypeLabel(credentialType))}</h2>
          {credentialType === 'passcode' && <PasscodeFields />}
          {credentialType === 'rfid' && <RfidFields />}
          {credentialType === 'fingerprint' && <BiometricFields label="Fingerprint" />}
          {credentialType === 'face' && <BiometricFields label="Face ID" />}
        </section>

        <section className="grant-card">
          <h2>{t('Date & Time')}</h2>
          <div className="form-grid compact-grid">
            <label className="field"><span>{t('Access Start Time')}</span><input defaultValue="2026-04-25 03:09 PM" /></label>
            <label className="field"><span>{t('Access End Time')}</span><input defaultValue={permanent ? '2100-12-31 11:59 PM' : ''} disabled={permanent} /></label>
          </div>
          <SwitchRow label="Permanently" checked={permanent} onChange={setPermanent} />
          <div className="form-grid compact-grid">
            <label className="field"><span>{t('Start Time')}</span><input defaultValue="12:00 AM" /></label>
            <label className="field"><span>{t('End Time')}</span><input defaultValue="11:59 PM" /></label>
          </div>
          <SwitchRow label="Recurring Schedule" checked={recurringSchedule} onChange={setRecurringSchedule} />
          <div className="grant-days">
            {dayOptions.map((day) => (
              <label key={day}>
                <input type="checkbox" checked={selectedDays.includes(day)} disabled={!recurringSchedule} onChange={() => toggleDay(day)} /> {t(day)}
              </label>
            ))}
          </div>
        </section>
      </div>

      <section className="grant-card grant-card--wide grant-pair-section">
        <div className="grant-card-header">
          <h2>{t('User + Unit Selection')}</h2>
          <Button variant="muted" onClick={() => { setAccessPairs([]); setSelectedUserIds([]); setSelectedUnitIds([]); setExpandedPairUsers([]); }}>{t('Clear All')}</Button>
        </div>
        <div className="move-in-selectors grant-selectors">
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
            <MiniTable className="assignment-review-table" headers={['User', 'Units', 'Devices']} selectable={false}>
              {accessPairs.map((pair) => (
                <tr key={pair.user.id}>
                  <td data-label={t('User')}>{pair.user.name}</td>
                  <td data-label={t('Units')}>
                    <ChipStack
                      items={pair.units}
                      getLabel={(unit) => unit.unitNumber}
                      maxCollapsed={expandedPairUsers.includes(pair.user.id) ? 20 : 3}
                      onRemove={(unit) => removeUnitFromPair(pair.user.id, unit.id)}
                      onExpandAll={() => toggleValue(pair.user.id, expandedPairUsers, setExpandedPairUsers)}
                      onRemoveAll={() => removePair(pair.user.id)}
                    />
                  </td>
                  <td data-label={t('Devices')}>
                    <ChipStack
                      items={pair.devices}
                      getLabel={(device) => device.name}
                      maxCollapsed={expandedPairUsers.includes(pair.user.id) ? 20 : 2}
                      onRemove={(device) => removeDeviceFromPair(pair.user.id, device.id)}
                      onExpandAll={() => toggleValue(pair.user.id, expandedPairUsers, setExpandedPairUsers)}
                      onRemoveAll={() => removePair(pair.user.id)}
                    />
                  </td>
                </tr>
              ))}
              {!accessPairs.length && <tr><td colSpan="3"><div className="empty-state">{t('No data')}</div></td></tr>}
            </MiniTable>
          </section>
        </div>
      </section>

      <section className="grant-card grant-card--wide">
        {/* Device assignment is separated from credential fields so future API data can be loaded independently. */}
        {/* 设备分配区与凭证字段解耦，方便后续单独接入设备查询 API。 */}
        <div className="grant-card-header">
          <h2>{t('Assigned Devices')}</h2>
          <div>
            <Button variant="muted" onClick={() => setSelectedDeviceIds([])}>{t('Clear Selection')}</Button>
            <Button onClick={() => setSelectedDeviceIds((current) => current.length ? current : [availableDevices[0]?.id].filter(Boolean))}>{t('+ Assign Devices')}</Button>
          </div>
        </div>
        <div className="assign-grid">
          <SimplePickList title="Available Devices">
            {availableDevices.map((device) => (
              <label key={device.id} className={selectedDeviceIds.includes(device.id) ? 'is-selected' : ''}>
                <input type="checkbox" checked={selectedDeviceIds.includes(device.id)} onChange={() => toggleDevice(device.id)} />
                <span>{device.name}</span>
                <small>{device.category}</small>
              </label>
            ))}
          </SimplePickList>
          <div className="table-wrap">
            <table className="mini-table assigned-table">
              <thead>
                <tr>
                  <th>{t('Unit Number')}</th>
                  <th>{t('Device Type')}</th>
                  <th>{t('Device Name')}</th>
                  <th>{t('Device ID')}</th>
                  <th>{t('Status')}</th>
                  <th>{t('Action')}</th>
                </tr>
              </thead>
              <tbody>
                {selectedDevices.map((device) => (
                  <tr key={device.id}>
                    <td data-label={t('Unit Number')}>{selectedUnit.unitNumber}</td>
                    <td data-label={t('Device Type')}>{device.category}</td>
                    <td data-label={t('Device Name')}>{device.name}</td>
                    <td data-label={t('Device ID')}>{device.id}</td>
                    <td data-label={t('Status')}>{t('Effective')}</td>
                    <td data-label={t('Action')}><button onClick={() => toggleDevice(device.id)}>{t('Remove')}</button></td>
                  </tr>
                ))}
                {!selectedDevices.length && <tr><td colSpan="6"><div className="empty-state">{t('No data')}</div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {submitted && (
        <section className="grant-result">
          <strong>{t('Access granted for')} {selectedUser.name}</strong>
          <span>{accessName} {t('has been assigned to')} {selectedDevices.length || 0} {t('device(s).')}</span>
        </section>
      )}

      <div className="form-footer">
        <Button variant="muted" onClick={backToAccess}>{t('Cancel')}</Button>
        <Button onClick={() => setSubmitted(true)} disabled={!selectedDevices.length || !accessPairs.length}>{t('Submit')}</Button>
      </div>
    </section>
  );
}

function getDevicesForUnit(unit) {
  const linkedDevices = devices.filter((device) => device.unitId === unit.id);
  return linkedDevices.length ? linkedDevices : [devices[0]];
}

function mergeAccessPairs(currentPairs, usersToPair, unitsToPair) {
  // Pair rows are grouped by user; unit/device chips are deduped for repeated assignments.
  // Pair 结果按用户分组；重复添加时 Unit/Device 标签会去重。
  const nextPairs = currentPairs.map((pair) => ({ ...pair, units: [...pair.units], devices: [...pair.devices] }));

  usersToPair.forEach((user) => {
    const devicesToPair = unitsToPair.flatMap(getDevicesForUnit);
    const existing = nextPairs.find((pair) => pair.user.id === user.id);
    if (!existing) {
      nextPairs.push({ user, units: [...unitsToPair], devices: dedupeById(devicesToPair) });
      return;
    }
    existing.units = dedupeById([...existing.units, ...unitsToPair]);
    existing.devices = dedupeById([...existing.devices, ...devicesToPair]);
  });

  return nextPairs;
}

function dedupeById(items) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

function PasscodeFields() {
  const { t } = useI18n();
  // Passcode naming is editable in the demo because production dedupes passcodes by name within a property.
  // Demo 中允许编辑 Passcode Name，因为线上 Passcode 按物业内的名称去重。
  return (
    <>
      <div className="radio-row">
        {['4 Digits', '6 Digits', '8 Digits'].map((item, index) => <label key={item}><input type="radio" name="passcodeDigits" defaultChecked={index === 1} /> {item}</label>)}
      </div>
      <div className="radio-stack">
        <label><input type="radio" name="passcodeMode" /> {t('System-Generated Passcode')}</label>
        <label><input type="radio" name="passcodeMode" /> {t('One-Time Passcode')}</label>
        <label><input type="radio" name="passcodeMode" defaultChecked /> {t('User-Defined Passcode')}</label>
      </div>
      <label className="field"><span>{t('Passcode Name')}</span><input defaultValue="Ayden Deng@5372" /></label>
      <label className="field"><span>{t('Passcode')}</span><input defaultValue="******" /></label>
    </>
  );
}

function RfidFields() {
  const { t } = useI18n();
  // RFID-like credentials dedupe by Card ID, so card ID stays visible beside card name.
  // RFID 类凭证按 Card ID 去重，因此 Card ID 与 Card Name 并列展示。
  return (
    <>
      <div className="radio-stack">
        {['RFID Card', 'RFID Wristband', 'RFID FOB', 'RFID Others'].map((item, index) => <label key={item}><input type="radio" name="rfidType" defaultChecked={index === 0} /> {t(item)}</label>)}
      </div>
      <div className="form-grid compact-grid">
        <label className="field"><span>{t('Card Name')}</span><input defaultValue="AppCard0422" /></label>
        <label className="field"><span>{t('Card ID')}</span><input defaultValue="CE5FB42F" /></label>
      </div>
    </>
  );
}

function BiometricFields({ label }) {
  const { t } = useI18n();
  // Biometric enrollment is not implemented; this keeps the assignment structure visible for product review.
  // Demo 不做真实生物识别录入，只保留授权配置结构供产品与研发评审。
  return (
    <>
      <label className="field"><span>{t(label)} {t('Name')}</span><input defaultValue={`Ayden ${label}`} /></label>
      <label className="field"><span>{t(label)} ID</span><input placeholder={`${t(label)} ID`} /></label>
      <p className="helper-text">{t('Biometric IDs are stored on the local device. This demo keeps the assignment flow visible without enrolling real biometric data.')}</p>
    </>
  );
}

function SwitchRow({ label, checked, onChange }) {
  const { t } = useI18n();
  return (
    <label className="switch-row">
      <span>{t(label)}</span>
      <input className="sr-only" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className={`switch ${checked ? 'is-on' : ''}`} />
    </label>
  );
}

function SimplePickList({ title, children }) {
  const { t } = useI18n();
  return <div className="pick-list"><h3>{t(title)}</h3>{children}</div>;
}

function credentialTypeLabel(type) {
  if (type === 'rfid') return 'RFID Type';
  if (type === 'fingerprint') return 'Fingerprint';
  if (type === 'face') return 'Face ID';
  return 'Passcode Type';
}
