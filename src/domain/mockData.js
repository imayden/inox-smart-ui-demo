// Temporary demo data source: every entity keeps a stable ID for routing, dedupe and future API migration.
// 前端 demo 的临时数据源：保持 Property / Unit / Device / User / Credential 都有稳定 ID，方便路由和去重。
export const properties = [
  {
    id: 'p-1',
    name: '1.INOXHQ',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=520&q=80',
    address: '6 Wayne Court',
    city: 'Sacramento',
    state: 'California',
    zipCode: '95829',
    country: 'United States of America',
    owner: 'Admin Inox',
    timeZone: 'America/Los_Angeles',
  },
  {
    id: 'p-2',
    name: "Alef's House",
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=520&q=80',
    address: '7505 E 35th Ave #330',
    city: 'Denver',
    state: 'Colorado',
    zipCode: '80238',
    country: 'United States of America',
    owner: 'Alef Admin',
    timeZone: 'America/Denver',
  },
  {
    id: 'p-3',
    name: 'HQ Property',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=520&q=80',
    address: '6 Wayne Court',
    city: 'Sacramento',
    state: 'California',
    zipCode: '95829',
    country: 'United States of America',
    owner: 'Admin Inox',
    timeZone: 'America/Los_Angeles',
  },
  {
    id: 'p-4',
    name: 'INOX Academy',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=520&q=80',
    address: '6 Wayne Ct.',
    city: 'Sacramento',
    state: 'California',
    zipCode: '95829',
    country: 'United States of America',
    owner: 'Admin Inox',
    timeZone: 'America/Los_Angeles',
  },
  { id: 'p-5', name: 'INOX Entry & Exit', image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=520&q=80', address: '6 Wayne Ct.', city: 'Sacramento', state: 'California', zipCode: '95829', country: 'United States of America', owner: 'Admin Inox', timeZone: 'America/Los_Angeles' },
  { id: 'p-6', name: 'Kajabi Property 1', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=520&q=80', address: '6 Wayne Ct.', city: 'Sacramento', state: 'California', zipCode: '95829', country: 'United States of America', owner: 'Admin Inox', timeZone: 'America/Los_Angeles' },
  { id: 'p-7', name: "Kajabi's Property 2", image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=520&q=80', address: '6 Wayne Ct.', city: 'Sacramento', state: 'California', zipCode: '95829', country: 'United States of America', owner: 'Admin Inox', timeZone: 'America/Los_Angeles' },
  { id: 'p-8', name: "Travis' Property", image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=520&q=80', address: '4000 Marconi Ave', city: 'Sacramento', state: 'California', zipCode: '95821', country: 'United States of America', owner: 'Travis Admin', timeZone: 'America/Los_Angeles' },
];

// Compact source arrays keep the demo readable; mapping below expands them into production-like row objects.
// 为了让示例数据更易读，先用紧凑数组保存核心字段，再统一映射成接近真实接口的对象结构。
const unitNames = [
  ['u-1', 'Break Room to Lounge', 'Common Area', 'Admin Inox', true, false],
  ['u-2', 'Break Room to Warehouse', 'Warehouse', 'Admin Inox', true, false],
  ['u-3', 'CEO Office', 'Office', 'Admin Inox', true, false],
  ['u-4', 'Downstairs Conference Room', 'Office', 'Admin Inox', true, false],
  ['u-5', 'Glass Door Test - Abdul', 'Block', 'Admin Inox', false, true],
  ['u-6', 'INOX HQ Lobby', 'Common Area', 'Admin Inox', true, false],
  ['u-7', 'ISC West Demo', 'Office', 'Qianyan Cheng', true, false],
  ['u-8', "Joe's Office", 'IST Block', 'Joe Gutierrez', true, false],
  ['u-9', 'Office 1 - IST', 'Office', 'Admin Inox', true, false],
  ['u-10', 'Office 2 - IST', 'Office', 'Admin Inox', true, false],
  ['u-11', 'Office 3', 'O3', 'Pan Wang', true, false],
  ['u-12', 'Office 3 - IST', 'Office', 'Admin Inox', true, false],
  ['u-13', 'Office 3.5 - ISC', 'Office', 'Admin Inox', true, false],
  ['u-14', 'Office 4 - ISTH', 'Office', 'Admin Inox', true, false],
];

// Unit IDs are stable and should be used for routing and dedupe. Display names can change freely.
// Unit ID 是稳定标识，用于路由和去重；展示名称可以按 UI 需要调整。
export const units = unitNames.map(([id, name, tag, owner, occupied, publicUnit], index) => ({
  id,
  propertyId: 'p-1',
  building: 'Main Building',
  floor: index === 2 ? '2nd Floor' : '1st Floor',
  name,
  unitNumber: `Main Building-${index === 2 ? '2nd' : '1st'} Floor-${name}`,
  tag,
  owner,
  ownerEmail: 'inoxsmartadmin@unisonhardware.com',
  occupied,
  publicUnit,
  photo: `https://picsum.photos/seed/inox-unit-${index}/80/80`,
}));

// Devices belong to the selected property and reference units through unitId, matching the expected future API shape.
// Device 属于当前物业，并通过 unitId 关联 Unit，便于后续替换成真实 API 数据。
export const devices = [
  ['d-1', 'ISGK-B750 7', 'Smart Lock', 'Warehouse Office 2', '97%', 'online'],
  ['d-2', 'Lock - Office to Warehouse', 'Smart Lock', 'Office to Warehouse', '31%', 'offline'],
  ['d-3', 'Lock - Server Room', 'Smart Lock', 'Server Room - ISM', '69%', 'offline'],
  ['d-4', 'Lock Break Room to Warehouse', 'Smart Lock', 'Break Room to Warehouse', '93%', 'online'],
  ['d-5', 'Chalin Office GW', 'Gateway', "Silvia's Office", '-', 'online'],
  ['d-6', 'Cliff Office GW', 'Gateway', 'Office 2 - IST', '-', 'online'],
  ['d-7', 'Gateway', 'Gateway', 'Downstairs Conference Room', '-', 'offline'],
  ['d-8', 'Gateway 2', 'Gateway', 'Downstairs Conference Room', '-', 'online'],
  ['d-9', 'GW - Breakroom to Lounge', 'Gateway', 'Break Room to Lounge', '-', 'online'],
  ['d-10', 'GW - BREAKROOM-WAREHOUSE', 'Gateway', 'Break Room to Warehouse', '-', 'online'],
].map(([id, name, category, unitName, battery, status], index) => ({
  id,
  propertyId: 'p-1',
  name,
  category,
  unitId: units[index % units.length].id,
  unitNumber: `Main Building-1st Floor-${unitName}`,
  publicUnit: false,
  battery,
  installedAt: `2026-04-${String(23 - index).padStart(2, '0')} 03:42 PM`,
  status,
  upgrade: index < 4,
  passageMode: index === 8,
  privacyMode: false,
  recurringSchedule: index % 5 === 0,
}));

// Users dedupe by email in product logic, but still keep unique IDs for routing and table keys.
// Users 业务上按 email 去重，但仍保留唯一 ID 以支持路由和表格 key。
export const users = [
  ['usr-1', 'Brian', 'Woodward', 'brian@anchorsl.com', 'Inactive', 'Unspecified'],
  ['usr-2', 'Joseph', 'Goodson', 'joseph.goodson@unisonhardware.com', 'Active', 'Male'],
  ['usr-3', 'Grah', 'Safe', 'grahsafelock1@gmail.com', 'Active', 'Unspecified'],
  ['usr-4', 'Yiming', 'Deng', 'dengyiming0129@gmail.com', 'Unregistered', 'Unspecified'],
  ['usr-5', 'Eugene', 'Jeun', 'ejeun@agencysea.com', 'Inactive', 'Male'],
  ['usr-6', 'James', 'Arnold', 'arnoldssafeandlock@gmail.com', 'Active', 'Unspecified'],
  ['usr-7', 'Ayden', 'Deng', 'ayden.deng@unisonhardware.com', 'Active', 'Unspecified'],
  ['usr-8', 'Laarnie', 'Macalisang', 'laarnie.macalisang@unisonhardware.com', 'Active', 'Male'],
].map(([id, firstName, lastName, email, status, gender]) => ({
  id,
  propertyIds: ['p-1'],
  firstName,
  lastName,
  name: `${firstName} ${lastName}`,
  email,
  phone: '',
  status,
  type: '',
  group: '',
  gender,
  tag1: '',
  tag2: '',
}));

// Credentials cover passcodes and RFID-like keys. cardId is used for RFID/Fingerprint/Face ID uniqueness; passcode uses name.
// Credentials 覆盖密码和 RFID 类凭证：RFID/指纹/面容按 cardId 去重，Passcode 按 name 去重。
export const credentials = [
  ['c-1', 'passcode', 'Ayden Deng@7320', '', 'System-Generated Passcode', 'Effective'],
  ['c-2', 'passcode', 'Ayden Deng@5372', '', 'User-Defined Passcode', 'Effective'],
  ['c-3', 'passcode', '0416 passcode', '', 'User-Defined Passcode', 'Removal Failed'],
  ['c-4', 'rfid', 'AppCard0422', 'CE5FB42F', 'RFID Card', 'Effective'],
  ['c-5', 'rfid', "Kevin's Fob", 'A26BFE05', 'RFID FOB', 'Effective'],
].map(([id, credentialType, name, cardId, type, status], index) => ({
  id,
  propertyId: 'p-1',
  userId: users[index % users.length].id,
  userName: users[index % users.length].name,
  userEmail: users[index % users.length].email,
  credentialType,
  name,
  cardId,
  type,
  unitNumber: units[index % units.length].unitNumber,
  device: devices[index % devices.length].name,
  status,
  expirationDate: index === 2 ? '2026-05-10 08:43 AM' : '2100-12-31 11:59 PM',
  addedBy: 'Admin Inox',
  addedOn: '2026-04-25 03:11 PM',
}));

// Occupancy transactions are intentionally separate from units/users so Move-In and Move-Out can be audited historically.
// 入住记录独立于 Unit/User，方便后续保留 Move-In / Move-Out 的历史审计记录。
export const occupancyTransactions = Array.from({ length: 14 }, (_, index) => ({
  id: `occ-${index + 1}`,
  transactionId: 45205 - index * 13,
  propertyId: 'p-1',
  unitId: units[index % units.length].id,
  unitNumber: units[index % units.length].unitNumber,
  userId: users[6].id,
  userName: 'Ayden Deng',
  userEmail: 'ayden.deng@unisonhardware.com',
  phone: '',
  role: index % 3 === 0 ? 'Administrator' : 'Member',
  startTime: '2026-04-22 03:00 PM',
  endTime: index % 2 === 0 ? '2026-04-25 03:09 PM' : '2026-04-21 01:02 PM',
  status: 'Moved-Out',
  mainResident: true,
  publicUnit: false,
}));

export const securityAlerts = Array.from({ length: 12 }, (_, index) => ({
  id: `alert-${index + 1}`,
  propertyId: 'p-1',
  alertTime: `2026-03-${String(26 - index).padStart(2, '0')} 12:19:23 PM`,
  deviceType: 'Smart Access',
  unlockedBy: '',
  unitNumber: units[index % units.length].unitNumber,
  deviceName: devices[index % devices.length].name,
  refreshStatus: 'ready',
}));

export const auditEvents = Array.from({ length: 12 }, (_, index) => ({
  id: `audit-${index + 1}`,
  propertyId: 'p-1',
  accessType: index % 2 === 0 ? 'Lock' : 'Unlock',
  accessMethod: index % 3 === 0 ? 'Auto-Lock' : index % 3 === 1 ? 'RFID Fob' : 'Mechanical',
  accessTime: `2026-04-${String(25 - index).padStart(2, '0')} 10:51 AM`,
  deviceType: 'Smart Access',
  deviceName: devices[index % devices.length].name,
  unitNumber: units[index % units.length].unitNumber,
  name: index % 2 ? 'Kevin’s Fob(A26BFE05)' : '',
  userEmail: index % 2 ? 'techsupport@unisonhardware.com' : '',
  userName: index % 2 ? 'Abdul Nawab' : '',
}));
