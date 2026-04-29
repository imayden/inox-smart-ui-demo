import { V1Shell } from '../v1/V1Shell.jsx';

// v2 currently reuses v1 shell; replace this component when a new navigation/layout concept is ready.
// v2 暂时复用 v1 外壳；未来确定新的导航/布局风格后，只替换这个组件即可。
export function V2Shell({ children }) {
  return <V1Shell>{children}</V1Shell>;
}
