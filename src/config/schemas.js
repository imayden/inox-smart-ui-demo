// Page schema layer: filters, table columns and tabs are configured here for easy extension.
// 页面配置层：搜索表单、表格列、Tab 都走 schema，后续新增字段或版本差异时优先改配置。
// Extension rule: add fields here first, then make sure mockData rows contain matching keys.
// 扩展规则：优先在这里新增字段，再确保 mockData 的 rows 里有对应 key。
export const filterSchemas = {
  properties: [
    { key: 'name', label: 'Property Name', type: 'text', placeholder: 'Property Name' },
    { key: 'address', label: 'Street Address', type: 'text', placeholder: 'Street Address' },
    { key: 'city', label: 'City', type: 'text', placeholder: 'City' },
    { key: 'state', label: 'State', type: 'text', placeholder: 'State' },
    { key: 'zipCode', label: 'Zip Code', type: 'text', placeholder: 'Zip Code' },
    { key: 'country', label: 'Country', type: 'select', placeholder: 'Country' },
    { key: 'owner', label: 'Owner', type: 'text', placeholder: 'Owner' },
  ],
  units: [
    { key: 'unitNumber', label: 'Unit Number', type: 'select', placeholder: 'Select Building & Floor' },
    { key: 'publicUnit', label: 'Public Unit', type: 'select', placeholder: 'Please Select' },
    { key: 'tag', label: 'Tag', type: 'text', placeholder: 'Please enter' },
    { key: 'owner', label: 'Owner', type: 'text', placeholder: 'Please enter' },
    { key: 'occupied', label: 'Occupied', type: 'select', placeholder: 'Please Select' },
  ],
  devices: [
    { key: 'name', label: 'Device Name', type: 'text', placeholder: 'Please enter' },
    { key: 'category', label: 'Device Category', type: 'select', placeholder: 'Please Select' },
    { key: 'unitNumber', label: 'Unit Number', type: 'text', placeholder: 'Please enter' },
  ],
  users: [
    { key: 'name', label: 'User Name', type: 'text', placeholder: 'Please enter' },
    { key: 'email', label: 'Email Address', type: 'text', placeholder: 'Please enter' },
    { key: 'phone', label: 'Phone Number', type: 'text', placeholder: 'Please enter' },
    { key: 'status', label: 'User Status', type: 'select', placeholder: 'Please Select' },
    { key: 'type', label: 'User Type', type: 'text', placeholder: 'Please enter' },
    { key: 'group', label: 'User Group', type: 'text', placeholder: 'Please enter' },
    { key: 'gender', label: 'Gender', type: 'select', placeholder: 'Please Select' },
    { key: 'tag1', label: 'Tag 1', type: 'text', placeholder: 'Please enter' },
    { key: 'tag2', label: 'Tag 2', type: 'text', placeholder: 'Please enter' },
  ],
  access: [
    { key: 'userName', label: 'User Name', type: 'text', placeholder: 'Please enter' },
    { key: 'userEmail', label: 'User Email Address', type: 'text', placeholder: 'Please enter' },
    { key: 'type', label: 'Type', type: 'select', placeholder: 'Please Select' },
    { key: 'name', label: 'Passcode / Card Name', type: 'text', placeholder: 'Please enter' },
    { key: 'unitNumber', label: 'Unit Number', type: 'text', placeholder: 'Please enter' },
    { key: 'device', label: 'Device', type: 'text', placeholder: 'Please enter' },
  ],
  occupancy: [
    { key: 'unitNumber', label: 'Unit Number', type: 'text', placeholder: 'Unit Number' },
    { key: 'userName', label: 'User Name', type: 'text', placeholder: 'Please enter' },
    { key: 'userEmail', label: 'User Email Address', type: 'text', placeholder: 'Please enter' },
    { key: 'phone', label: 'Phone Number', type: 'text', placeholder: 'Please enter' },
    { key: 'role', label: 'Role', type: 'select', placeholder: 'Please Select' },
    { key: 'startTime', label: 'Start Time', type: 'date', placeholder: 'Select date' },
    { key: 'endTime', label: 'End Time', type: 'date', placeholder: 'Select date' },
    { key: 'status', label: 'Occupancy Status', type: 'select', placeholder: 'Please Select' },
  ],
  security: [
    { key: 'deviceName', label: 'Device Name', type: 'text', placeholder: 'Please enter' },
    { key: 'deviceType', label: 'Device Type', type: 'select', placeholder: 'Please Select' },
    { key: 'unitNumber', label: 'Unit Number', type: 'text', placeholder: 'Unit Number' },
    { key: 'userName', label: 'User Name', type: 'text', placeholder: 'Please enter' },
  ],
};

// Table column type controls DataTable renderCell behavior in components/ui.jsx.
// 表格列的 type 会交给 components/ui.jsx 里的 renderCell 决定具体视觉呈现。
export const tableSchemas = {
  properties: [
    { key: 'image', label: '', type: 'image' },
    { key: 'name', label: 'Property Name' },
    { key: 'address', label: 'Street Address' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'zipCode', label: 'Zip Code' },
    { key: 'country', label: 'Country' },
    { key: 'owner', label: 'Owner' },
  ],
  units: [
    { key: 'photo', label: '', type: 'image' },
    { key: 'unitNumber', label: 'Unit Number' },
    { key: 'publicUnit', label: 'Public Unit', type: 'checkbox' },
    { key: 'tag', label: 'Tag' },
    { key: 'owner', label: 'Owner' },
    { key: 'occupied', label: 'Occupied', type: 'statusBox' },
  ],
  devices: [
    { key: 'name', label: 'Device Name' },
    { key: 'category', label: 'Device Category' },
    { key: 'unitNumber', label: 'Unit Number' },
    { key: 'publicUnit', label: 'Public Unit', type: 'checkbox' },
    { key: 'battery', label: 'Battery Level %' },
    { key: 'installedAt', label: 'Installation Time' },
    { key: 'upgrade', label: 'Upgrade', type: 'icons' },
    { key: 'status', label: 'Status', type: 'connection' },
  ],
  users: [
    { key: 'name', label: 'User Name' },
    { key: 'email', label: 'Email Address' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'status', label: 'User Status' },
    { key: 'type', label: 'User Type' },
    { key: 'group', label: 'User Group' },
    { key: 'gender', label: 'Gender' },
    { key: 'tag1', label: 'Tag 1' },
    { key: 'tag2', label: 'Tag 2' },
  ],
  access: [
    { key: 'userName', label: 'User Name' },
    { key: 'userEmail', label: 'User Email Address' },
    { key: 'cardId', label: 'Card ID' },
    { key: 'type', label: 'Type' },
    { key: 'name', label: 'Passcode / Card Name' },
    { key: 'unitNumber', label: 'Unit Number' },
    { key: 'device', label: 'Device' },
    { key: 'status', label: 'Status', type: 'statusText' },
    { key: 'expirationDate', label: 'Expiration Date' },
    { key: 'addedBy', label: 'Added By' },
    { key: 'addedOn', label: 'Added on' },
  ],
  occupancy: [
    { key: 'transactionId', label: 'Transaction ID' },
    { key: 'unitNumber', label: 'Unit Number' },
    { key: 'userName', label: 'User Name' },
    { key: 'userEmail', label: 'User Email Address' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'role', label: 'Role' },
    { key: 'startTime', label: 'Start Time' },
    { key: 'endTime', label: 'End Time' },
    { key: 'status', label: 'Occupancy Status' },
  ],
  security: [
    { key: 'alertTime', label: 'Alert Time' },
    { key: 'deviceType', label: 'Device Type' },
    { key: 'unlockedBy', label: 'Unlocked By' },
    { key: 'unitNumber', label: 'Unit Number' },
    { key: 'deviceName', label: 'Device Name' },
    { key: 'refreshStatus', label: 'Refresh Status', type: 'refresh' },
  ],
  securityAudit: [
    { key: 'accessType', label: 'Access Type' },
    { key: 'accessMethod', label: 'Access Method' },
    { key: 'accessTime', label: 'Access Time' },
    { key: 'deviceType', label: 'Device Type' },
    { key: 'deviceName', label: 'Device Name' },
    { key: 'unitNumber', label: 'Unit Number' },
    { key: 'name', label: 'Name' },
    { key: 'userEmail', label: 'User Email Address' },
    { key: 'userName', label: 'User Name' },
  ],
};

// Tabs are separated from pages so each module can add, remove or rename secondary views without touching route code.
// Tab 配置独立于页面，方便每个模块新增、删除或改名二级视图，而不用修改路由。
export const tabSchemas = {
  devices: [
    { id: '', label: 'All Devices' },
    { id: 'public', label: 'Public Devices' },
    { id: 'private', label: 'Private Devices' },
    { id: 'pending', label: 'Pending Installation' },
    { id: 'unpaired', label: 'Unpaired' },
  ],
  access: [
    { id: 'passcode', label: 'Passcodes' },
    { id: 'rfid', label: 'RFIDs' },
    { id: 'fingerprint', label: 'Fingerprint' },
    { id: 'face', label: 'Face ID' },
  ],
  occupancy: [
    { id: '', label: 'Confirmed' },
    { id: 'pending', label: 'Pending' },
  ],
  security: [
    { id: '', label: 'Security Alert' },
    { id: 'passage', label: 'Passage Mode' },
    { id: 'privacy', label: 'Privacy Mode' },
    { id: 'audit', label: 'Audit Trail' },
  ],
};
