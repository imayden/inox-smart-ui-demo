import { Button } from '../components/ui.jsx';
import { useI18n } from '../i18n/useI18n.js';

export function CalendarPage() {
  const { t } = useI18n();
  // Calendar uses static events for the v1.0 visual pass; later it can aggregate occupancy transactions.
  // 日历先用固定事件复刻 v1.0 视觉，后续可改为从 occupancyTransactions 聚合。
  const events = {
    3: ['Move-In:34', 'Move-Out:0'],
    6: ['Move-In:2', 'Move-Out:0'],
    8: ['Move-In:2', 'Move-Out:0'],
  };

  return (
    <section className="calendar-page">
      <header className="calendar-page__top">
        <h1>{t('Calendar')}</h1>
        <div>
          <Button>{t('Move-In')}</Button>
          <Button>{t('Move-Out')}</Button>
        </div>
      </header>
      <div className="calendar-toolbar">
        <strong>‹ April 2026 ›</strong>
        <span>{t('This Month')}</span>
        <div><Button variant="muted">{t('Day')}</Button><Button variant="muted">{t('Week')}</Button><Button>{t('Month')}</Button></div>
      </div>
      <div className="month-grid">
        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => <b key={day}>{t(day)}</b>)}
        {Array.from({ length: 42 }, (_, index) => {
          const date = index < 3 ? 29 + index : index - 2;
          const dim = index < 3 || index > 32;
          return (
            <article key={index} className={dim ? 'is-dim' : ''}>
              <strong>{date}</strong>
              {events[date]?.map((item) => <span key={item}>{item.replace('Move-In', t('Move-In')).replace('Move-Out', t('Move-Out'))}</span>)}
            </article>
          );
        })}
      </div>
    </section>
  );
}
