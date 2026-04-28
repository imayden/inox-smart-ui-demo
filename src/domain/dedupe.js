// Dedupe rules live here so pages do not hard-code ID/email/cardId/passcode uniqueness logic.
// 去重规则集中放在这里，避免页面各自硬编码 ID / email / cardId / passcode name 的判断。
export const dedupeKeys = {
  property: (property) => property.id,
  unit: (unit) => unit.id,
  device: (device) => device.id,
  user: (user) => `${user.email.toLowerCase()}::${user.id}`,
  rfid: (credential) => credential.cardId,
  fingerprint: (credential) => credential.cardId,
  faceId: (credential) => credential.cardId,
  passcode: (credential) => `${credential.propertyId}::${credential.name.toLowerCase()}`,
};
