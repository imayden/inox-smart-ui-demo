import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui.jsx';
import { devices, units, users } from '../domain/mockData.js';
import { useDemoStore } from '../demo/demoStore.js';
import { useI18n } from '../i18n/useI18n.js';

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
  const [submitted, setSubmitted] = useState(false);

  const selectedUser = users.find((user) => user.id === selectedUserId) ?? users[0];
  const selectedUnit = units.find((unit) => unit.id === selectedUnitId) ?? units[0];
  const availableDevices = useMemo(() => {
    const unitDevices = devices.filter((device) => device.unitId === selectedUnit.id);
    return unitDevices.length ? unitDevices : devices.slice(0, 4);
  }, [selectedUnit]);

  const selectedDevices = devices.filter((device) => selectedDeviceIds.includes(device.id));
  const accessName = credentialType === 'passcode' ? `${selectedUser.name}@5372` : credentialType === 'rfid' ? 'AppCard0422' : `${selectedUser.name} ${credentialType}`;

  const toggleDevice = (deviceId) => {
    setSelectedDeviceIds((current) => current.includes(deviceId) ? current.filter((id) => id !== deviceId) : [...current, deviceId]);
  };

  const toggleDay = (day) => {
    setSelectedDays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day]);
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
        {credentialTabs.map((tab) => (
          <button key={tab.id} className={credentialType === tab.id ? 'is-active' : ''} onClick={() => setCredentialType(tab.id)}>
            {t(tab.label)}
          </button>
        ))}
      </div>

      <div className="grant-layout">
        <section className="grant-card">
          <h2>{t('User')}</h2>
          <label className="field"><span>{t('User Email Address')}</span>
            <select value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}>
              {users.map((user) => <option key={user.id} value={user.id}>{user.email}</option>)}
            </select>
          </label>
          <div className="form-grid compact-grid">
            <label className="field"><span>{t('First Name')}</span><input value={selectedUser.firstName} readOnly /></label>
            <label className="field"><span>{t('Last Name')}</span><input value={selectedUser.lastName} readOnly /></label>
          </div>
          <label className="field"><span>{t('Unit')}</span>
            <select value={selectedUnitId} onChange={(event) => setSelectedUnitId(event.target.value)}>
              {units.map((unit) => <option key={unit.id} value={unit.id}>{unit.unitNumber}</option>)}
            </select>
          </label>
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

      <section className="grant-card grant-card--wide">
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
        <Button onClick={() => setSubmitted(true)} disabled={!selectedDevices.length}>{t('Submit')}</Button>
      </div>
    </section>
  );
}

function PasscodeFields() {
  const { t } = useI18n();
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
