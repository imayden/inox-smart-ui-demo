import {
  auditEvents,
  credentials,
  devices,
  occupancyTransactions,
  properties,
  securityAlerts,
  units,
  users,
} from './mockData.js';

// Selectors centralize the current property scope so pages only consume ready-to-render rows.
// 数据选择器把“当前物业上下文”集中处理，页面组件只关心拿到什么 rows。
export function getProperty(propertyId) {
  return properties.find((property) => property.id === propertyId) ?? properties[0];
}

export function getModuleRows(moduleId, propertyId, subTab = '') {
  // Every business list is filtered by the selected sidebar property, matching the SaaS permission hierarchy.
  // 所有业务列表都先按侧边栏选中的 Property 过滤，符合 SaaS 的权限层级。
  switch (moduleId) {
    case 'properties':
      return properties;
    case 'units':
      return units.filter((unit) => unit.propertyId === propertyId);
    case 'devices':
      return devices.filter((device) => device.propertyId === propertyId);
    case 'users':
      return users.filter((user) => user.propertyIds.includes(propertyId));
    case 'access':
      // subTab controls Passcodes / RFIDs / Fingerprint / Face ID filtering without adding extra routes.
      // subTab 用于过滤 Passcodes / RFIDs / Fingerprint / Face ID，避免为每个二级 Tab 增加新路由。
      return credentials.filter((credential) => {
        if (!subTab) return credential.propertyId === propertyId;
        return credential.propertyId === propertyId && credential.credentialType === subTab;
      });
    case 'occupancy':
      return occupancyTransactions.filter((item) => item.propertyId === propertyId);
    case 'security':
      return subTab === 'audit' ? auditEvents : securityAlerts.filter((item) => item.propertyId === propertyId);
    default:
      return [];
  }
}

export function getEntity(moduleId, entityId) {
  // Detail pages use a single lookup helper so new entity types only need to register their source here.
  // 详情页共用这一处查找逻辑；新增实体类型时只需要在这里注册数据源。
  const sources = {
    properties,
    units,
    devices,
    users,
  };
  return sources[moduleId]?.find((item) => item.id === entityId);
}

export function getStats(propertyId) {
  const propertyUnits = units.filter((unit) => unit.propertyId === propertyId);
  return {
    occupied: propertyUnits.filter((unit) => unit.occupied).length,
    vacant: propertyUnits.filter((unit) => !unit.occupied).length,
    devices: devices.filter((device) => device.propertyId === propertyId).length,
    users: users.filter((user) => user.propertyIds.includes(propertyId)).length,
  };
}
