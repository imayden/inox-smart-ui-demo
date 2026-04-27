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

// 基础按钮：所有页面共用同一套按钮样式，v2/v3 可以通过主题变量覆盖视觉。
export function Button({ children, variant = 'primary', className = '', ...props }) {
  return (
    <button className={`btn btn--${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function PageHeader({ title, property, action, onAction }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {property && <span className="page-header__property">● {property.name}</span>}
      </div>
      <div className="page-header__actions">
        <button className="icon-only" aria-label="Export"><Download size={22} /></button>
        {action && <Button onClick={onAction}>{action}</Button>}
        <Button variant="muted">Action <ChevronDown size={16} /></Button>
        <Button variant="muted"><Filter size={18} /> Filter <ChevronDown size={16} /></Button>
        {property?.image && <img className="property-thumb" src={property.image} alt={property.name} />}
      </div>
    </header>
  );
}

// 通用搜索区：字段来源于 config/schemas.js，避免每个模块重复写表单布局。
export function SearchPanel({ fields = [] }) {
  return (
    <section className="search-panel">
      <h2>Quick Search</h2>
      <div className="search-panel__grid">
        {fields.map((field) => (
          <label key={field.key} className="field">
            <span>{field.label}</span>
            {field.type === 'select' ? (
              <select>
                <option>{field.placeholder}</option>
              </select>
            ) : (
              <input type={field.type === 'date' ? 'text' : 'text'} placeholder={field.placeholder} />
            )}
          </label>
        ))}
      </div>
      <div className="search-panel__actions">
        <Button><Search size={16} /> Search</Button>
        <Button variant="muted">Clear</Button>
      </div>
    </section>
  );
}

export function Tabs({ tabs = [], activeTab, onChange }) {
  if (!tabs.length) return null;
  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab ${activeTab === tab.id ? 'is-active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function DataTable({ columns = [], rows = [], onEdit, onDelete, onRowClick }) {
  const handleInteractiveClick = (event) => {
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
              <th key={column.key}>{column.label}</th>
            ))}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={onRowClick ? 'is-clickable' : ''}
              onClick={() => onRowClick?.(row)}
            >
              <td className="checkbox-cell"><input type="checkbox" onClick={handleInteractiveClick} /></td>
              {columns.map((column) => (
                <td key={column.key}>{renderCell(row, column)}</td>
              ))}
              <td className="action-cell" onClick={handleInteractiveClick}>
                <button aria-label="Edit" onClick={() => onEdit?.(row)}><Edit3 size={18} /></button>
                <button aria-label="Delete" onClick={() => onDelete?.(row)}><Trash2 size={18} /></button>
              </td>
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td colSpan={columns.length + 2}>
                <div className="empty-state">No data</div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function renderCell(row, column) {
  // 表格单元格按 column.type 渲染不同 UI，后续新增类型时只扩展这里。
  const value = row[column.key];
  if (column.type === 'image') {
    return value ? <img className="table-image" src={value} alt="" /> : null;
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
    return <span className={value === 'Removal Failed' ? 'state-red' : ''}>{value}</span>;
  }
  return value || '-';
}

export function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop">
      <section className="modal">
        <header className="modal__header">
          <h2>{title}</h2>
          <button onClick={onClose} aria-label="Close">×</button>
        </header>
        {children}
      </section>
    </div>
  );
}

export function FormGrid({ fields, values }) {
  return (
    <div className="form-grid">
      {fields.map((field) => (
        <label key={field.key} className="field">
          <span>{field.label}</span>
          <input value={values[field.key] ?? ''} readOnly />
        </label>
      ))}
    </div>
  );
}
