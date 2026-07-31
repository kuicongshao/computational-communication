import { clearLocalAIConfig, getLocalAIConfig, saveLocalAIConfig } from "../utils/localAIConfig.js";

const deepseekEndpoint = "https://api.deepseek.com/chat/completions";
const timeoutMs = 20000;

function dispatchRuntimeStatus(status) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("zhi-xing-ai-runtime-status", { detail: status }));
}

export function getAiConfig() { const config = getLocalAIConfig(); return { mode: config.connected ? "api" : "local", apiKey: config.apiKey, hasRuntimeOverride: config.connected }; }
export function setLocalAiConfig({ mode, apiKey }) { return mode === "api" && String(apiKey || "").trim() ? saveLocalAIConfig(apiKey) : clearLocalAIConfig(); }
export function isDeepSeekConfigured() { return getAiConfig().mode === "api"; }

async function requestDeepSeek(messages, temperature = 0.4, override = {}) {
  const saved = getAiConfig();
  const apiKey = String(override.apiKey || saved.apiKey || "").trim();
  const mode = override.mode || saved.mode;
  if (mode !== "api" || !apiKey) return { ok: false, source: "local", mode: "local", reason: "当前使用本地智能模式" };

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  dispatchRuntimeStatus("testing");
  try {
    const response = await fetch(deepseekEndpoint, { method: "POST", signal: controller.signal, headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model: "deepseek-chat", temperature, messages }) });
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("EMPTY_RESPONSE");
    dispatchRuntimeStatus("api");
    return { ok: true, source: "deepseek", mode: "api", content };
  } catch (error) {
    const reason = error?.name === "AbortError" ? "请求超时" : "模型服务暂不可用";
    dispatchRuntimeStatus("fallback");
    return { ok: false, source: "local", mode: "local", reason };
  } finally { window.clearTimeout(timer); }
}

export async function testDeepSeekConnection(override = {}) { return requestDeepSeek([{ role: "user", content: "请仅回复：连接成功" }], 0, override); }

export async function generateTeachingEnhancement({ task, input, localOutline }) {
  const prompt = [`你是计算传播学课程的教学智能体。请根据学生输入和本地规则提纲，补充简洁、可执行的教学建议。`, `任务类型：${task}`, `学生输入：${JSON.stringify(input)}`, `本地提纲：${localOutline}`, "按判断依据、建议行动、注意事项组织；不要虚构数据或替代教师评价。"].join("\n");
  return requestDeepSeek([{ role: "system", content: "你提供结构化、审慎的课程教学建议。" }, { role: "user", content: prompt }]);
}

export async function chatWithDeepSeek({ systemPrompt, userInput, studentState, route }) {
  const result = await requestDeepSeek([{ role: "system", content: systemPrompt }, { role: "user", content: `学生问题：${userInput}\n学生状态：${JSON.stringify(studentState)}\n本地路由建议：${JSON.stringify(route)}` }], 0.35);
  if (!result.ok) return result;
  try {
    const data = JSON.parse(result.content.replace(/^```json\s*|\s*```$/g, "").trim());
    if (!data?.answer) throw new Error("返回格式不完整");
    return { ok: true, source: "deepseek", mode: "api", data: { answer: data.answer, agentType: data.agentType || route.agentType, recommendPage: data.recommendPage || route.recommendPage, nextStep: data.nextStep || route.nextStep } };
  } catch { return { ok: false, source: "local", mode: "local", reason: "模型返回未符合结构化格式" }; }
}

export async function generateTeacherAnalysis(summary) {
  const prompt = `请仅依据以下匿名课堂统计，生成《课程学习智能体教学分析报告》。不要虚构学生记录；按班级概况、学习行为、项目质量、能力诊断、风险预警、教学建议、下一阶段安排分段。\n${JSON.stringify(summary)}`;
  return requestDeepSeek([{ role: "system", content: "你是高校课程教学分析助手，只根据提供的匿名聚合数据给出审慎、可执行的建议。" }, { role: "user", content: prompt }], 0.3);
}
