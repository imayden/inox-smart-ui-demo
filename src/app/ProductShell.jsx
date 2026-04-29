import { Menu } from 'lucide-react';
import { DemoControlBar } from '../demo/DemoControlBar.jsx';
import { useDemoStore } from '../demo/demoStore.js';
import { LoginPage } from '../features/LoginPage.jsx';
import { uiRegistry } from '../ui-versions/registry.js';

// ProductShell is the boundary between demo controls, auth state and the selected UI version.
// ProductShell 是 demo 控制条、登录态和 UI 版本外壳之间的边界层。
export function ProductShell({ children }) {
  const uiVersion = useDemoStore((state) => state.uiVersion);
  const authStatus = useDemoStore((state) => state.authStatus);
  const activeUi = uiRegistry[uiVersion] ?? uiRegistry.v1;
  const Shell = activeUi.Shell;

  return (
    <div className={`theme-${uiVersion}`}>
      {/* DemoControlBar is testing-only UI; remove or hide it before turning this into a production shell. */}
      {/* DemoControlBar 只用于测试与评审；如果转成生产项目，需要移除或按环境变量隐藏。 */}
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
