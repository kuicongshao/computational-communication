const storageKey = "zhi_xing_ai_config";
const emptyConfig = { provider: "deepseek", apiKey: "", connected: false };

export function getLocalAIConfig() {
  if (typeof window === "undefined") return emptyConfig;
  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey) || "null");
    const apiKey = typeof saved?.apiKey === "string" ? saved.apiKey.trim() : "";
    return { provider: "deepseek", apiKey, connected: Boolean(saved?.connected && apiKey) };
  } catch { return emptyConfig; }
}

export function maskAPIKey(apiKey) {
  const value = String(apiKey || "").trim();
  if (!value) return "未保存";
  if (value.length <= 7) return "已保存的密钥";
  return `${value.slice(0, 3)}-••••••••••••${value.slice(-3)}`;
}

export function saveLocalAIConfig(apiKey) {
  const next = { provider: "deepseek", apiKey: String(apiKey || "").trim(), connected: Boolean(String(apiKey || "").trim()) };
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(next));
    window.dispatchEvent(new Event("zhi-xing-ai-config-changed"));
  } catch { /* 本地存储不可用时，调用方会继续使用本地智能模式。 */ }
  return next;
}

export function clearLocalAIConfig() {
  try {
    window.localStorage.removeItem(storageKey);
    window.dispatchEvent(new Event("zhi-xing-ai-config-changed"));
  } catch { /* 无配置时默认使用本地智能模式。 */ }
  return emptyConfig;
}

export function isLocalAIConnected() { return getLocalAIConfig().connected; }
