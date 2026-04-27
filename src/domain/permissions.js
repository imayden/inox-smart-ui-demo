// 轻量权限模型：现在只驱动 demo UI 行为，后续可替换成后端返回的 license / role policy。
const roleActions = {
  owner: ['*'],
  admin: ['read', 'create', 'update', 'delete', 'grantAccess', 'moveIn', 'moveOut'],
  member: ['read', 'update'],
  guest: ['read'],
};

export function can(role, action) {
  const actions = roleActions[role] ?? roleActions.guest;
  return actions.includes('*') || actions.includes(action);
}
