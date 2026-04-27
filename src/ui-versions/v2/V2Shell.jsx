import { V1Shell } from '../v1/V1Shell.jsx';

// v2 暂时复用 v1 外壳，后续可以只替换这里而不动业务页面。
export function V2Shell({ children }) {
  return <V1Shell>{children}</V1Shell>;
}
