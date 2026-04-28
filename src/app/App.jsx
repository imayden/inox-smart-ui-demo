import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { ProductShell } from './ProductShell.jsx';
import { useDemoStore } from '../demo/demoStore.js';
import { DashboardPage } from '../features/DashboardPage.jsx';
import { EntityListPage } from '../features/EntityListPage.jsx';
import { EntityDetailPage } from '../features/EntityDetailPage.jsx';
import { CalendarPage } from '../features/CalendarPage.jsx';
import { MoveInPage } from '../features/MoveInPage.jsx';
import { GrantAccessPage } from '../features/GrantAccessPage.jsx';
import { MODULE_IDS } from '../config/navigation.config.js';

// URL owns version/property/module identity; the store shares that context across shell and pages.
// URL 负责表达 demo 版本、当前物业和当前模块；全局 store 负责让导航、侧栏和页面共享这些上下文。
function ScopedDemoRoutes() {
  const { uiVersion, propertyId } = useParams();
  const setUiVersion = useDemoStore((state) => state.setUiVersion);
  const setPropertyId = useDemoStore((state) => state.setPropertyId);

  if (uiVersion) setUiVersion(uiVersion);
  if (propertyId) setPropertyId(propertyId);

  return (
    <ProductShell>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="properties" element={<EntityListPage moduleId={MODULE_IDS.properties} />} />
        <Route path="properties/:entityId" element={<EntityDetailPage moduleId={MODULE_IDS.properties} />} />
        <Route path="units" element={<EntityListPage moduleId={MODULE_IDS.units} />} />
        <Route path="units/:entityId" element={<EntityDetailPage moduleId={MODULE_IDS.units} />} />
        <Route path="devices" element={<EntityListPage moduleId={MODULE_IDS.devices} />} />
        <Route path="devices/:entityId" element={<EntityDetailPage moduleId={MODULE_IDS.devices} />} />
        <Route path="users" element={<EntityListPage moduleId={MODULE_IDS.users} />} />
        <Route path="users/:entityId" element={<EntityDetailPage moduleId={MODULE_IDS.users} />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="access" element={<EntityListPage moduleId={MODULE_IDS.access} />} />
        <Route path="access/grant" element={<GrantAccessPage />} />
        <Route path="occupancy" element={<EntityListPage moduleId={MODULE_IDS.occupancy} />} />
        <Route path="occupancy/move-in" element={<MoveInPage />} />
        <Route path="security" element={<EntityListPage moduleId={MODULE_IDS.security} />} />
      </Routes>
    </ProductShell>
  );
}

export function App() {
  return (
    <Routes>
      {/* Default route opens the v1.0 SaaS shell for fast UI review. / 默认进入 v1.0 SaaS 主界面，方便直接查看当前复刻版本。 */}
      <Route path="/" element={<Navigate to="/demo/v1/property/p-1/dashboard" replace />} />
      <Route path="/demo/:uiVersion/property/:propertyId/*" element={<ScopedDemoRoutes />} />
      <Route path="*" element={<Navigate to="/demo/v1/property/p-1/dashboard" replace />} />
    </Routes>
  );
}
