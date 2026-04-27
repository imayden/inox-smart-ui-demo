import { Button } from '../components/ui.jsx';

export function CalendarPage() {
  // 日历先用固定事件复刻 v1.0 视觉，后续可改为从 occupancyTransactions 聚合。
  const events = {
    3: ['Move-In:34', 'Move-Out:0'],
    6: ['Move-In:2', 'Move-Out:0'],
    8: ['Move-In:2', 'Move-Out:0'],
  };

  return (
    <section className="calendar-page">
      <header className="calendar-page__top">
        <h1>Calendar</h1>
        <div>
          <Button>Move-In</Button>
          <Button>Move-Out</Button>
        </div>
      </header>
      <div className="calendar-toolbar">
        <strong>‹ April 2026 ›</strong>
        <span>This Month</span>
        <div><Button variant="muted">Day</Button><Button variant="muted">Week</Button><Button>Month</Button></div>
      </div>
      <div className="month-grid">
        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => <b key={day}>{day}</b>)}
        {Array.from({ length: 42 }, (_, index) => {
          const date = index < 3 ? 29 + index : index - 2;
          const dim = index < 3 || index > 32;
          return (
            <article key={index} className={dim ? 'is-dim' : ''}>
              <strong>{date}</strong>
              {events[date]?.map((item) => <span key={item}>{item}</span>)}
            </article>
          );
        })}
      </div>
    </section>
  );
}
