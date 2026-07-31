import { useEffect, useState } from "react";
import { testDeepSeekConnection } from "../api/deepseek.js";
import { getLocalAIConfig, maskAPIKey, saveLocalAIConfig } from "../utils/localAIConfig.js";

export default function APIConnectModal({ open, onClose, onChanged }) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState({ type: "idle", text: "未连接" });
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const config = getLocalAIConfig();
    setApiKey(config.apiKey);
    setShowKey(false);
    setStatus(config.connected ? { type: "success", text: `已连接 · ${maskAPIKey(config.apiKey)}` } : { type: "idle", text: "未连接" });
  }, [open]);

  const saveConnection = () => {
    if (!apiKey.trim()) return setStatus({ type: "warning", text: "请输入 DeepSeek API Key" });
    saveLocalAIConfig(apiKey);
    setStatus({ type: "success", text: `AI模型已连接 · ${maskAPIKey(apiKey)}` });
    onChanged?.();
  };

  const testConnection = async () => {
    if (!apiKey.trim()) return setStatus({ type: "warning", text: "请输入 DeepSeek API Key 后再测试" });
    setTesting(true);
    setStatus({ type: "testing", text: "正在测试连接…" });
    const result = await testDeepSeekConnection({ apiKey: apiKey.trim(), mode: "api" });
    setTesting(false);
    setStatus(result.ok
      ? { type: "success", text: "模型连接成功，知行助手已切换至生成式AI增强模式。" }
      : { type: "warning", text: "暂时无法连接模型，系统将继续使用本地智能模式，不影响基础学习功能。" });
  };

  if (!open) return null;
  const statusClass = status.type === "success" ? "border-mint/30 bg-mint/10 text-mint" : status.type === "testing" ? "border-cyan/30 bg-cyan/10 text-cyan" : "border-amber/25 bg-amber/10 text-amber";

  return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#020813]/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="连接你的AI模型">
    <section className="w-full max-w-lg rounded-3xl border border-cyan/30 bg-panel/95 p-6 shadow-glow">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">Local model connection</p><h2 className="mt-1 text-2xl font-bold text-white">连接你的AI模型</h2>
      <div className="mt-4 rounded-2xl border border-cyan/25 bg-cyan/10 p-4 text-sm leading-7 text-slate-200"><p className="font-semibold text-cyan">本地安全说明</p><p className="mt-2">您填写的 API Key 仅保存在当前浏览器的本地存储中，平台不会将其上传至服务器、GitHub 或 Cloudflare。请勿在公共电脑或多人共用设备中长期保存个人 API Key，使用结束后可随时清除本地配置。</p><p className="mt-3 text-slate-300">模型连接信息仅保存在当前浏览器和当前网站域名下。更换浏览器、设备或网站域名后，需要重新连接AI模型。</p><p className="mt-3 text-slate-300">连接模型后，您向智能体提交的文本将直接发送至所选择的模型服务商，用于生成回答。请勿提交身份证号、联系方式、未公开学生信息或其他敏感数据。</p></div>
      <label className="mt-5 block text-sm font-medium text-slate-200">DeepSeek API Key<div className="mt-2 flex gap-2"><input type={showKey ? "text" : "password"} value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="sk-..." autoComplete="off" className="min-w-0 flex-1 rounded-xl border border-white/15 bg-ink/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan" /><button onClick={() => setShowKey((value) => !value)} className="shrink-0 rounded-xl border border-white/10 px-3 text-xs text-slate-300 hover:text-white">{showKey ? "隐藏密钥" : "显示密钥"}</button></div></label>
      {getLocalAIConfig().connected && <p className="mt-2 text-xs text-slate-400">当前已保存：{maskAPIKey(getLocalAIConfig().apiKey)}</p>}
      <div className={`mt-4 rounded-xl border px-3 py-2 text-sm ${statusClass}`}>状态：{status.text}</div>
      <div className="mt-5 flex flex-wrap justify-end gap-3"><button onClick={onClose} className="rounded-xl border border-white/10 bg-ink/70 px-4 py-2.5 text-sm text-slate-300 hover:border-white/25 hover:text-white">取消</button><button onClick={testConnection} disabled={testing} className="rounded-xl border border-mint/40 bg-mint/10 px-4 py-2.5 text-sm font-semibold text-mint disabled:opacity-50 hover:bg-mint/20">{testing ? "测试中…" : "测试连接"}</button><button onClick={saveConnection} className="rounded-xl border border-cyan/40 bg-cyan/15 px-4 py-2.5 text-sm font-semibold text-cyan hover:bg-cyan/25">保存连接</button></div>
    </section>
  </div>;
}
