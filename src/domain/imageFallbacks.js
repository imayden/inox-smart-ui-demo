export const PROPERTY_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=520&q=80';

// Use one shared fallback for remote demo images so a broken URL does not expose alt text in the UI.
// 远程示例图片如果加载失败，统一切换到备用图，避免页面直接显示破图文字。
export function applyPropertyImageFallback(event) {
  if (event.currentTarget.dataset.fallbackApplied) return;
  event.currentTarget.dataset.fallbackApplied = 'true';
  event.currentTarget.src = PROPERTY_IMAGE_FALLBACK;
}
