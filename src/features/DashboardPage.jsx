import { Building2, DoorOpen, KeyRound, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui.jsx';
import { useDemoStore } from '../demo/demoStore.js';
import { applyPropertyImageFallback } from '../domain/imageFallbacks.js';
import { getProperty, getStats } from '../domain/selectors.js';
import { useI18n } from '../i18n/useI18n.js';

export function DashboardPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const propertyId = useDemoStore((state) => state.propertyId);
  const uiVersion = useDemoStore((state) => state.uiVersion);
  const property = getProperty(propertyId);
  const stats = getStats(propertyId);
  const goTo = (path) => navigate(`/demo/${uiVersion}/property/${propertyId}/${path}`);

  return (
    <section className="dashboard-page">
      {/* Dashboard cards mirror v1.0 while stats still react to the selected property. / Dashboard 复刻 v1.0 首页信息卡片，数据按当前物业动态切换。 */}
      <div className="dashboard-grid">
        <FeatureCard
          icon={<DoorOpen />}
          title="Unit"
          items={[
            { label: 'Move-In', path: 'occupancy/move-in' },
            { label: 'Move-Out', path: 'occupancy' },
            { label: 'Update Occupancy', path: 'occupancy' },
            { label: 'Schedule Viewing', path: 'calendar' },
          ]}
          onSelect={goTo}
        />
        <FeatureCard
          icon={<KeyRound />}
          title="Access"
          items={[
            { label: 'Add an RFID', path: 'access/grant?type=rfid' },
            { label: 'Delete an RFID', path: 'access' },
            { label: 'Add a Passcode', path: 'access/grant?type=passcode' },
            { label: 'Delete a Passcode', path: 'access' },
            { label: 'Quick One-Time Passcode', path: 'access/grant?type=passcode' },
          ]}
          onSelect={goTo}
        />
        <FeatureCard
          icon={<ShieldAlert />}
          title="Security"
          items={[
            { label: 'Audit Trail', path: 'security' },
            { label: 'Security Alert', path: 'security' },
            { label: 'Passage Mode', path: 'security' },
            { label: 'Privacy Mode', path: 'security' },
          ]}
          onSelect={goTo}
        />
        <article className="dashboard-card property-overview">
          <h2><Building2 /> {t('Property Overview')}</h2>
          <div><span>{t('Total Units Occupied')}</span><b>{stats.occupied}</b></div>
          <div><span>{t('Total Units Vacant')}</span><b>{stats.vacant}</b></div>
          <img src={property.image} alt={property.name} onError={applyPropertyImageFallback} />
        </article>
        <article className="dashboard-card quick-search-card">
          <h2><DoorOpen /> {t('Quick Search')}</h2>
          <label className="field"><span>{t('Name')}</span><input placeholder={t('Name')} /></label>
          <label className="field"><span>{t('Type')}</span><select><option>{t('Units')}</option></select></label>
          <label className="field"><span>{t('Property')}</span><select><option>{property.name}</option></select></label>
          <Button onClick={() => goTo('units')}>{t('Search')}</Button>
        </article>
        <CalendarMini />
        <article className="dashboard-card quick-add">
          <h2><KeyRound /> {t('Quick Add E-Keys')}</h2>
          {['User Email Address', 'First Name', 'Last Name', 'From', 'To', 'Unit', 'Card Name', 'E-Key Type', 'Device'].map((label) => (
            <label className="field" key={label}><span>{t(label)}</span><input placeholder={t(label)} /></label>
          ))}
          <div className="quick-add__actions"><Button variant="muted">{t('Cancel')}</Button><Button onClick={() => goTo('access/grant')}>{t('Confirm')}</Button></div>
        </article>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, items, onSelect }) {
  const { t } = useI18n();
  return (
    <article className="dashboard-card feature-card">
      <h2>{icon} {t(title)}</h2>
      {items.map((item) => <button key={item.label} onClick={() => onSelect(item.path)}>{t(item.label)}</button>)}
    </article>
  );
}

function CalendarMini() {
  const { t } = useI18n();
  return (
    <article className="dashboard-card calendar-mini">
      <h2>{t('Calendar')} <span>{t('Move-In')}&nbsp;&nbsp; {t('Move-Out')}</span></h2>
      <div className="calendar-mini__header">Apr 2026</div>
      <div className="mini-calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <b key={day}>{t(day)}</b>)}
        {Array.from({ length: 35 }, (_, index) => <span key={index} className={[3, 6, 8].includes(index) ? 'has-event' : ''}>{index < 3 ? 29 + index : index - 2}</span>)}
      </div>
    </article>
  );
}
