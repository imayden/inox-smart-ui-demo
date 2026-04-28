import {
  Activity,
  Building2,
  CalendarDays,
  DoorOpen,
  Gauge,
  KeyRound,
  LockKeyhole,
  MonitorSmartphone,
  ShieldAlert,
  Users,
} from 'lucide-react';

// Top navigation defines core product modules; the property sidebar is generated from mockData properties.
// 顶部导航定义核心功能区块；侧边物业导航由 mockData 中的 properties 生成。
export const MODULE_IDS = {
  dashboard: 'dashboard',
  properties: 'properties',
  units: 'units',
  devices: 'devices',
  users: 'users',
  calendar: 'calendar',
  access: 'access',
  occupancy: 'occupancy',
  security: 'security',
};

export const topNavigation = [
  { id: MODULE_IDS.dashboard, label: 'Dashboard', path: 'dashboard', icon: Gauge },
  { id: MODULE_IDS.properties, label: 'Properties', path: 'properties', icon: Building2 },
  { id: MODULE_IDS.units, label: 'Units', path: 'units', icon: DoorOpen },
  { id: MODULE_IDS.devices, label: 'Devices', path: 'devices', icon: MonitorSmartphone },
  { id: MODULE_IDS.users, label: 'Users', path: 'users', icon: Users },
  { id: MODULE_IDS.calendar, label: 'Calendar', path: 'calendar', icon: CalendarDays },
  { id: MODULE_IDS.access, label: 'Access', path: 'access', icon: KeyRound },
  { id: MODULE_IDS.occupancy, label: 'Occupancy', path: 'occupancy', icon: Activity },
  { id: MODULE_IDS.security, label: 'Security', path: 'security', icon: ShieldAlert },
];

export const moduleMeta = {
  dashboard: { title: 'Dashboard' },
  properties: { title: 'Properties', action: '+ Add Property' },
  units: { title: 'Units', action: '+ Add Unit' },
  devices: { title: 'Devices', action: '+ Add Device' },
  users: { title: 'Users', action: '+ Add User' },
  calendar: { title: 'Calendar' },
  access: { title: 'Access Management', action: 'Grant Access' },
  occupancy: { title: 'Occupancy', action: '+ New' },
  security: { title: 'Security' },
};

// Dashboard shortcuts store business target paths only, so v2/v3 can reuse the same route intent.
// Dashboard 上的快捷入口只保存业务目标路径，不绑定具体 UI 版本，便于 v2/v3 复用。
export const quickActions = [
  { label: 'Move-In', path: 'occupancy/move-in', icon: DoorOpen },
  { label: 'Grant Access', path: 'access', icon: LockKeyhole },
];
