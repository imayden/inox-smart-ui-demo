import { Menu } from 'lucide-react';
import { DemoControlBar } from '../demo/DemoControlBar.jsx';
import { useDemoStore } from '../demo/demoStore.js';
import { LoginPage } from '../features/LoginPage.jsx';
import { uiRegistry } from '../ui-versions/registry.js';

export function ProductShell({ children }) {
  const uiVersion = useDemoStore((state) => state.uiVersion);
  const authStatus = useDemoStore((state) => state.authStatus);
  const activeUi = uiRegistry[uiVersion] ?? uiRegistry.v1;
  const Shell = activeUi.Shell;

  return (
    <div className={`theme-${uiVersion}`}>
      <DemoControlBar />
      {/* Auth state switches only the shell surface: logged out shows Login, logged in shows the active SaaS version. / 登录态只影响产品壳层：未登录时展示登录页，已登录时恢复当前 UI 版本的 SaaS 框架。 */}
      {authStatus === 'loggedOut' ? (
        <LoginPage />
      ) : (
        <Shell menuIcon={<Menu size={22} />}>{children}</Shell>
      )}
    </div>
  );
}
