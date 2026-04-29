import { V1Shell } from './v1/V1Shell.jsx';
import { V2Shell } from './v2/V2Shell.jsx';
import { V3Shell } from './v3/V3Shell.jsx';

// UI version registry: business pages do not know whether they are rendered in v1/v2/v3.
// UI 版本注册表：业务页面不感知 v1/v2/v3，只由 ProductShell 注入不同外壳。
export const uiRegistry = {
  v1: { Shell: V1Shell },
  v2: { Shell: V2Shell },
  v3: { Shell: V3Shell },
};
