import {
  ChevronDown,
  Download,
  Edit3,
  Filter,
  RefreshCw,
  Search,
  Trash2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { applyPropertyImageFallback } from '../domain/imageFallbacks.js';
import { useI18n } from '../i18n/useI18n.js';

// Shared UI primitives used by all feature pages. Keep business rules out of this file; pass behavior through props.
// 全局基础 UI 组件放在这里。这里不要写业务规则，业务动作通过 props 从页面传入。
// Base button: all versions share behavior, while visual style can be themed by CSS variables.
// 基础按钮：所有版本共用行为，视觉样式通过 CSS 变量按 v1/v2/v3 覆盖。
export function Button({ children, variant = 'primary', className = '', ...props }) {
  return (
    <button className={`btn btn--${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function PageHeader({ title, property, action, onAction }) {
  const { t } = useI18n();
  return (
    <header className="page-header">
      <div>
        <h1>{t(title)}</h1>
        {property && <span className="page-header__property">● {property.name}</span>}
      </div>
      <div className="page-header__actions">
        {/* Header action slots intentionally stay generic; feature pages decide whether the button means Add, Grant Access, or Move-In. */}
        {/* 页头操作区保持通用，具体按钮代表 Add、Grant Access 还是 Move-In，由业务页面决定。 */}
        <button className="icon-only" aria-label={t('Export')}><Download size={22} /></button>
        {action && <Button onClick={onAction}>{t(action)}</Button>}
        <Button variant="muted">{t('Action')} <ChevronDown size={16} /></Button>
        <Button variant="muted"><Filter size={18} /> {t('Filter')} <ChevronDown size={16} /></Button>
        {property?.image && <img className="property-thumb" src={property.image} alt={property.name} onError={applyPropertyImageFallback} />}
      </div>
    </header>
  );
}

// Generic search panel: schema-driven fields keep module pages compact and extensible.
// 通用搜索区：字段来源于 config/schemas.js，避免每个模块重复写表单布局。
export function SearchPanel({ fields = [] }) {
  const { t } = useI18n();
  return (
    <section className="search-panel">
      <h2>{t('Quick Search')}</h2>
      <div className="search-panel__grid">
        {fields.map((field) => (
          <label key={field.key} className="field">
            <span>{t(field.label)}</span>
            {field.type === 'select' ? (
              <select>
                <option>{t(field.placeholder)}</option>
              </select>
            ) : (
              <input type={field.type === 'date' ? 'text' : 'text'} placeholder={t(field.placeholder)} />
            )}
          </label>
        ))}
      </div>
      <div className="search-panel__actions">
        <Button><Search size={16} /> {t('Search')}</Button>
        <Button variant="muted">{t('Clear')}</Button>
      </div>
    </section>
  );
}

export function Tabs({ tabs = [], activeTab, onChange }) {
  const { t } = useI18n();
  if (!tabs.length) return null;
  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab ${activeTab === tab.id ? 'is-active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {t(tab.label)}
        </button>
      ))}
    </div>
  );
}

export function DataTable({ columns = [], rows = [], onEdit, onDelete, onRowClick }) {
  const { t } = useI18n();
  const handleInteractiveClick = (event) => {
    // Keep row-click tables usable: controls inside the row do not trigger navigation.
    // 表格支持整行点击时，复选框和操作按钮仍保持自己的独立动作。
    event.stopPropagation();
  };

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th className="checkbox-cell"><input type="checkbox" onClick={handleInteractiveClick} /></th>
            {columns.map((column) => (
              <th key={column.key}>{t(column.label)}</th>
            ))}
            <th>{t('Action')}</th>
          </tr>
        </thead>
        <tbody>
          {/* DataTable is schema-driven: columns decide each cell's renderer, rows only provide data. */}
          {/* DataTable 由 schema 驱动：columns 决定单元格渲染方式，rows 只负责提供数据。 */}
          {rows.map((row) => (
            <tr
              key={row.id}
              className={onRowClick ? 'is-clickable' : ''}
              onClick={() => onRowClick?.(row)}
            >
              <td className="checkbox-cell"><input type="checkbox" onClick={handleInteractiveClick} /></td>
              {columns.map((column) => (
                <td key={column.key}>{renderCell(row, column, t)}</td>
              ))}
              <td className="action-cell" onClick={handleInteractiveClick}>
                <button aria-label={t('Edit')} onClick={() => onEdit?.(row)}><Edit3 size={18} /></button>
                <button aria-label={t('Delete')} onClick={() => onDelete?.(row)}><Trash2 size={18} /></button>
              </td>
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td colSpan={columns.length + 2}>
                <div className="empty-state">{t('No data')}</div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function renderCell(row, column, t) {
  // Render table cells by schema type so future UI versions can reuse the same data model.
  // 表格单元格按 column.type 渲染不同 UI，后续新增类型时只扩展这里。
  const value = row[column.key];
  if (column.type === 'image') {
    return value ? <img className="table-image" src={value} alt="" onError={applyPropertyImageFallback} /> : null;
  }
  if (column.type === 'checkbox') {
    return <span className={`fake-check ${value ? 'is-checked' : ''}`} />;
  }
  if (column.type === 'statusBox') {
    return <span className={`status-box ${value ? 'is-on' : ''}`} />;
  }
  if (column.type === 'connection') {
    return value === 'online' ? <Wifi className="state-green" size={20} /> : <WifiOff className="state-muted" size={20} />;
  }
  if (column.type === 'refresh') {
    return <RefreshCw className="state-green" size={20} />;
  }
  if (column.type === 'icons') {
    return value ? <RefreshCw className="state-green" size={20} /> : null;
  }
  if (column.type === 'statusText') {
    return <span className={value === 'Removal Failed' ? 'state-red' : ''}>{t(value)}</span>;
  }
  return typeof value === 'string' ? t(value) : value || '-';
}

export function Modal({ title, children, onClose }) {
  const { t } = useI18n();
  return (
    <div className="modal-backdrop">
      <section className="modal">
        <header className="modal__header">
          <h2>{t(title)}</h2>
          <button onClick={onClose} aria-label={t('Close')}>×</button>
        </header>
        {children}
      </section>
    </div>
  );
}

export function FormGrid({ fields, values }) {
  const { t } = useI18n();
  return (
    <div className="form-grid">
      {fields.map((field) => (
        <label key={field.key} className="field">
          <span>{t(field.label)}</span>
          <input value={values[field.key] ?? ''} readOnly />
        </label>
      ))}
    </div>
  );
}
