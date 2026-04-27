import { V1Shell } from '../v1/V1Shell.jsx';

// v3 暂时复用 v1 外壳，作为未来交互风格实验位。
export function V3Shell({ children }) {
  return <V1Shell>{children}</V1Shell>;
}
