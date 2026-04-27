import { Building2, DoorOpen, KeyRound, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui.jsx';
import { quickActions } from '../config/navigation.config.js';
import { useDemoStore } from '../demo/demoStore.js';
import { getProperty, getStats } from '../domain/selectors.js';

export function DashboardPage() {
  const propertyId = useDemoStore((state) => state.propertyId);
  const property = getProperty(propertyId);
  const stats = getStats(propertyId);

  return (
    <section className="dashboard-page">
      {/* Dashboard 复刻 v1.0 首页的信息卡片，数据仍按当前物业动态切换。 */}
      <div className="dashboard-grid">
        <FeatureCard icon={<DoorOpen />} title="Unit" items={['Move-In', 'Move-Out', 'Update Occupancy', 'Schedule Viewing']} />
        <FeatureCard icon={<KeyRound />} title="Access" items={['Add an RFID', 'Delete an RFID', 'Add a Passcode', 'Delete a Passcode', 'Quick One-Time Passcode']} />
        <FeatureCard icon={<ShieldAlert />} title="Security" items={['Audit Trail', 'Security Alert', 'Passage Mode', 'Privacy Mode']} />
        <article className="dashboard-card property-overview">
          <h2><Building2 /> Property Overview</h2>
          <div><span>Total Units Occupied</span><b>{stats.occupied}</b></div>
          <div><span>Total Units Vacant</span><b>{stats.vacant}</b></div>
          <img src={property.image} alt={property.name} />
        </article>
        <article className="dashboard-card quick-search-card">
          <h2><DoorOpen /> Quick Search</h2>
          <label className="field"><span>Name</span><input placeholder="Name" /></label>
          <label className="field"><span>Type</span><select><option>Units</option></select></label>
          <label className="field"><span>Property</span><select><option>{property.name}</option></select></label>
          <Button>Search</Button>
        </article>
        <CalendarMini />
        <article className="dashboard-card quick-add">
          <h2><KeyRound /> Quick Add E-Keys</h2>
          {['User Email Address', 'First Name', 'Last Name', 'From', 'To', 'Unit', 'Card Name', 'E-Key Type', 'Device'].map((label) => (
            <label className="field" key={label}><span>{label}</span><input placeholder={label} /></label>
          ))}
          <div className="quick-add__actions"><Button variant="muted">Cancel</Button><Button>Confirm</Button></div>
        </article>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, items }) {
  return (
    <article className="dashboard-card feature-card">
      <h2>{icon} {title}</h2>
      {items.map((item) => <button key={item}>{item}</button>)}
    </article>
  );
}

function CalendarMini() {
  return (
    <article className="dashboard-card calendar-mini">
      <h2>Calendar <span>Move-In&nbsp;&nbsp; Move-Out</span></h2>
      <div className="calendar-mini__header">Apr 2026</div>
      <div className="mini-calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <b key={day}>{day}</b>)}
        {Array.from({ length: 35 }, (_, index) => <span key={index} className={[3, 6, 8].includes(index) ? 'has-event' : ''}>{index < 3 ? 29 + index : index - 2}</span>)}
      </div>
    </article>
  );
}
