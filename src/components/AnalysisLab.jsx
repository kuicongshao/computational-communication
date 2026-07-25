import { useMemo, useState } from "react";
import SectionHeader from "./SectionHeader.jsx";

const stopWords = new Set([
  "的", "了", "和", "是", "在", "也", "就", "都", "很", "还", "又", "有", "没有", "一个", "我们", "你们", "他们",
  "这个", "那个", "真的", "感觉", "不是", "但是", "因为", "所以", "如果", "可以", "已经", "还是", "什么", "怎么"
]);

const keywordGroups = {
  品牌传播: ["品牌", "产品", "广告", "营销", "种草", "口碑", "代言", "消费", "购买", "推荐", "满意", "体验"],
  文化传播: ["文化", "传统", "中国", "城市", "文旅", "历史", "非遗", "符号", "国家", "形象", "价值", "审美"],
  情绪表达: ["喜欢", "支持", "好看", "优秀", "精彩", "感动", "期待", "有趣", "讨厌", "失望", "无聊", "愤怒", "焦虑", "反感"],
  政治议题: ["政策", "政治", "政府", "国家", "治理", "立场", "舆论", "公共", "社会", "国际", "外交", "权力"],
  娱乐消费: ["明星", "综艺", "影视", "电影", "音乐", "游戏", "娱乐", "二次元", "粉丝", "直播", "演出", "消费"],
  平台机制: ["平台", "算法", "推荐", "流量", "热搜", "限流", "审核", "账号", "数据", "点赞", "收藏", "转发", "评论"],
  社群互动: ["互动", "社群", "粉丝", "用户", "讨论", "回复", "转发", "评论", "共鸣", "参与", "圈层", "认同"]
};

const lexiconWords = Array.from(new Set(Object.values(keywordGroups).flat()));
const positiveWords = ["喜欢", "支持", "好看", "优秀", "精彩", "感动", "期待", "有趣", "满意", "认可", "推荐", "舒服", "震撼"];
const negativeWords = ["讨厌", "失望", "难看", "无聊", "愤怒", "焦虑", "反感", "尴尬", "糟糕", "不满", "抵制", "恶心", "虚假"];

const sampleText = `这个品牌最近的内容很有趣，评论区很多人都说体验不错。
小红书上的种草笔记让我更想了解这个产品，但是广告感有点强。
城市文旅视频很好看，传统文化元素很有感染力。
平台推荐机制好像放大了热门内容，普通用户很难被看见。
有些评论让我失望，感觉内容比较虚假。`;

export default function AnalysisLab() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const reportText = useMemo(() => {
    if (!result) return "";
    return [
      "智能分析实验室报告",
      "",
      result.paperDescription,
      "",
      "项目诊断：",
      ...result.diagnosis.map((item) => `- ${item}`),
      "",
      "方法建议：",
      ...result.methods.map((item) => `- ${item}`)
    ].join("\n");
  }, [result]);

  const analyze = () => {
    const comments = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (comments.length === 0) {
      setResult(null);
      setMessage("请先输入文本");
      return;
    }
    setMessage("");
    setCopied(false);
    setResult(buildAnalysis(comments));
    try {
      const previous = Number(window.localStorage.getItem("zhichuan-analysis-lab-usage") || "0");
      window.localStorage.setItem("zhichuan-analysis-lab-usage", String(previous + 1));
    } catch {
      // localStorage 不可用时仍可完成本次本地分析。
    }
  };

  const clearAll = () => {
    setText("");
    setResult(null);
    setMessage("");
    setCopied(false);
  };

  const copyReport = async () => {
    if (!reportText) return;
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(reportText);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = reportText;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="space-y-7">
      <SectionHeader
        eyebrow="Analysis Lab"
        title="智能分析实验室"
        subtitle="把多行评论文本粘贴到网页中，系统会用前端规则完成样本概况、词频、情感、主题识别、方法建议和课程报告式解释。"
      />

      <section className="rounded-2xl border border-cyan/20 bg-panel/85 p-5 shadow-glow">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">评论文本输入区</h2>
            <p className="mt-1 text-sm text-slate-400">每行视为一条评论。当前分析不上传数据，不调用外部接口。</p>
          </div>
          <button
            onClick={() => setText(sampleText)}
            className="rounded-full border border-violet/30 bg-violet/10 px-4 py-2 text-sm text-violet transition hover:bg-violet/15"
          >
            填入示例
          </button>
        </div>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={9}
          placeholder="请粘贴评论文本，每行一条。例如：这个品牌最近的内容很有趣，评论区很多人都说体验不错。"
          className="w-full resize-y rounded-xl border border-white/10 bg-ink/80 px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan focus:shadow-glow"
        />
        {message && (
          <div className="mt-3 rounded-xl border border-amber/30 bg-amber/10 px-4 py-3 text-sm text-amber">
            {message}
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={analyze} className="rounded-xl border border-cyan/40 bg-cyan/15 px-5 py-3 text-sm font-semibold text-cyan shadow-glow transition hover:bg-cyan/20">
            开始分析
          </button>
          <button onClick={clearAll} className="rounded-xl border border-white/10 bg-white/[.045] px-5 py-3 text-sm text-slate-300 transition hover:border-amber/60 hover:text-amber">
            清空文本
          </button>
          <button
            onClick={copyReport}
            disabled={!result}
            className="rounded-xl border border-mint/30 bg-mint/10 px-5 py-3 text-sm font-semibold text-mint transition hover:bg-mint/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[.035] disabled:text-slate-500"
          >
            {copied ? "已复制" : "复制报告"}
          </button>
        </div>
      </section>

      {result ? <AnalysisResult result={result} /> : (
        <section className="rounded-2xl border border-white/10 bg-panel/70 p-8 text-center text-sm leading-7 text-slate-400">
          分析结果会在这里以卡片形式展示。可以先使用示例文本体验完整流程。
        </section>
      )}
    </div>
  );
}

function AnalysisResult({ result }) {
  const topTheme = result.themes.find((item) => item.count > 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="文本条数" value={`${result.summary.count} 条`} />
        <MetricCard label="总字数" value={`${result.summary.totalChars} 字`} />
        <MetricCard label="平均文本长度" value={`${result.summary.avgLength} 字`} />
      </div>

      <section className="rounded-2xl border border-white/10 bg-panel/80 p-5 shadow-glow">
        <SectionTitle title="高频词分析" subtitle="基于标点切分、内置词典识别和停用词过滤的轻量规则分词。" />
        <div className="space-y-3">
          {result.topWords.map((item) => (
            <BarRow key={item.word} label={item.word} value={item.count} max={result.topWords[0]?.count || 1} tone="cyan" />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-panel/80 p-5 shadow-glow">
        <SectionTitle title="情感分析" subtitle={`整体情感倾向：${result.sentiment.overall}`} />
        <div className="grid gap-4 lg:grid-cols-3">
          <SentimentCard label="正面文本" count={result.sentiment.positive} total={result.summary.count} tone="mint" />
          <SentimentCard label="负面文本" count={result.sentiment.negative} total={result.summary.count} tone="amber" />
          <SentimentCard label="中性文本" count={result.sentiment.neutral} total={result.summary.count} tone="violet" />
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-panel/80 p-5 shadow-glow">
        <SectionTitle title="主题规则识别" subtitle={topTheme ? `占比最高：${topTheme.name}` : "暂无明显主题类别"} />
        <div className="grid gap-4 lg:grid-cols-2">
          {result.themes.map((theme) => (
            <article key={theme.name} className="rounded-xl border border-white/10 bg-ink/70 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-white">{theme.name}</h3>
                <span className="rounded-full border border-cyan/25 bg-cyan/10 px-3 py-1 text-xs text-cyan">
                  {theme.count} 条 / {theme.percent}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan to-mint" style={{ width: `${theme.percent}%` }} />
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-300">代表性关键词：{theme.keywords.length ? theme.keywords.join("、") : "暂无明显关键词"}</p>
              <p className="mt-2 text-sm leading-7 text-slate-400">示例：{theme.example || "暂无匹配文本"}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <ReportCard title="方法建议" items={result.methods} tone="mint" />
        <ReportCard title="项目诊断" items={result.diagnosis} tone="amber" />
      </div>

      <section className="rounded-2xl border border-violet/25 bg-violet/10 p-5 shadow-glow">
        <SectionTitle title="论文式结果描述" subtitle="可复制后作为课程报告初稿，再结合人工核验修改。" />
        <p className="text-sm leading-8 text-slate-200">{result.paperDescription}</p>
      </section>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <article className="rounded-2xl border border-cyan/20 bg-panel/80 p-5 shadow-glow">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-2 text-3xl font-bold text-cyan">{value}</div>
    </article>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="mt-1 text-sm leading-7 text-slate-400">{subtitle}</p>
    </div>
  );
}

function BarRow({ label, value, max, tone }) {
  const color = tone === "cyan" ? "from-cyan to-mint" : "from-violet to-cyan";
  return (
    <div className="grid grid-cols-[5rem_1fr_3rem] items-center gap-3 text-sm">
      <span className="truncate text-slate-200">{label}</span>
      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${Math.max(6, (value / max) * 100)}%` }} />
      </div>
      <span className="text-right text-cyan">{value}</span>
    </div>
  );
}

function SentimentCard({ label, count, total, tone }) {
  const percent = total ? Math.round((count / total) * 100) : 0;
  const color = {
    mint: "text-mint border-mint/25 bg-mint/10 from-mint to-cyan",
    amber: "text-amber border-amber/25 bg-amber/10 from-amber to-violet",
    violet: "text-violet border-violet/25 bg-violet/10 from-violet to-cyan"
  }[tone];

  return (
    <article className={`rounded-xl border p-4 ${color}`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">{label}</h3>
        <span className="text-sm">{percent}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-3 text-sm text-slate-300">{count} 条文本</p>
    </article>
  );
}

function ReportCard({ title, items, tone }) {
  const classes = tone === "mint" ? "border-mint/25 bg-mint/10 text-mint" : "border-amber/25 bg-amber/10 text-amber";
  return (
    <section className={`rounded-2xl border p-5 shadow-glow ${classes}`}>
      <h2 className="mb-3 text-xl font-semibold">{title}</h2>
      <ul className="space-y-2 text-sm leading-7 text-slate-300">
        {items.map((item) => <li key={item}>• {item}</li>)}
      </ul>
    </section>
  );
}

function buildAnalysis(comments) {
  const summary = buildSummary(comments);
  const wordCounts = countWords(comments);
  const topWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));
  const sentiment = analyzeSentiment(comments);
  const themes = analyzeThemes(comments);
  const methods = recommendMethods({ topWords, sentiment, themes, comments });
  const diagnosis = diagnoseProject({ summary, sentiment, themes, topWords });
  const paperDescription = buildPaperDescription({ summary, topWords, sentiment, themes, methods });

  return { summary, topWords, sentiment, themes, methods, diagnosis, paperDescription };
}

function buildSummary(comments) {
  const lengths = comments.map((item) => item.replace(/\s/g, "").length);
  const totalChars = lengths.reduce((sum, value) => sum + value, 0);
  return {
    count: comments.length,
    totalChars,
    avgLength: comments.length ? Math.round(totalChars / comments.length) : 0
  };
}

function countWords(comments) {
  const counts = {};
  comments.forEach((comment) => {
    const words = tokenize(comment);
    words.forEach((word) => {
      counts[word] = (counts[word] || 0) + 1;
    });
  });
  return counts;
}

function tokenize(text) {
  const found = [];
  lexiconWords.forEach((word) => {
    if (text.includes(word)) found.push(word);
  });
  const rough = text
    .replace(/[，。！？；：、“”‘’（）()[\]{}<>《》.,!?;:\-_/\\|~`@#$%^&*+=\s]/g, " ")
    .split(" ")
    .map((item) => item.trim())
    .filter((item) => item.length >= 2 && !stopWords.has(item));
  return [...found, ...rough].filter((word) => !stopWords.has(word));
}

function analyzeSentiment(comments) {
  let positive = 0;
  let negative = 0;
  let neutral = 0;

  comments.forEach((comment) => {
    const pos = positiveWords.filter((word) => comment.includes(word)).length;
    const neg = negativeWords.filter((word) => comment.includes(word)).length;
    if (pos > neg) positive += 1;
    else if (neg > pos) negative += 1;
    else neutral += 1;
  });

  const overall = positive > negative && positive >= neutral
    ? "偏正面"
    : negative > positive && negative >= neutral
      ? "偏负面"
      : "中性或分化";

  return { positive, negative, neutral, overall };
}

function analyzeThemes(comments) {
  return Object.entries(keywordGroups).map(([name, words]) => {
    const matched = comments
      .map((comment) => ({
        comment,
        keywords: words.filter((word) => comment.includes(word))
      }))
      .filter((item) => item.keywords.length > 0);

    const keywords = Array.from(new Set(matched.flatMap((item) => item.keywords))).slice(0, 6);
    const example = matched[0]?.comment || "";
    return {
      name,
      count: matched.length,
      percent: comments.length ? Math.round((matched.length / comments.length) * 100) : 0,
      keywords,
      example
    };
  }).concat({
    name: "其他",
    count: comments.filter((comment) => !Object.values(keywordGroups).some((words) => words.some((word) => comment.includes(word)))).length,
    percent: comments.length ? Math.round((comments.filter((comment) => !Object.values(keywordGroups).some((words) => words.some((word) => comment.includes(word)))).length / comments.length) * 100) : 0,
    keywords: [],
    example: comments.find((comment) => !Object.values(keywordGroups).some((words) => words.some((word) => comment.includes(word)))) || ""
  }).sort((a, b) => b.count - a.count);
}

function recommendMethods({ topWords, sentiment, themes, comments }) {
  const methods = [];
  const maxWordCount = topWords[0]?.count || 0;
  const emotionTotal = sentiment.positive + sentiment.negative;
  const activeThemes = themes.filter((item) => item.name !== "其他" && item.count > 0).length;
  const hasInteraction = comments.some((item) => /点赞|转发|收藏|评论数|播放|阅读|互动|likes|views|share/i.test(item));
  const hasClassNeed = comments.some((item) => /分类|类别|判断|预测|标签|正面|负面/.test(item));

  if (maxWordCount >= 2) methods.push("高频词较集中，推荐词频分析和关键词分析，用于识别样本讨论焦点。");
  if (emotionTotal / comments.length >= 0.35) methods.push("情绪词出现较多，推荐情感分析和情绪传播分析。");
  if (activeThemes >= 4) methods.push("主题类别较多，推荐 LDA 或 BERTopic 主题模型进一步发现潜在结构。");
  if (hasInteraction) methods.push("文本中出现互动数据线索，后续可加入相关分析或回归分析。");
  if (hasClassNeed) methods.push("如果需要自动判断文本类别，可进一步使用决策树、随机森林或 SVM。");
  if (methods.length === 0) methods.push("当前样本特征较弱，建议先扩大样本量，再进行词频分析、人工编码和可视化分析。");

  return methods;
}

function diagnoseProject({ summary, sentiment, themes, topWords }) {
  const activeThemes = themes.filter((item) => item.name !== "其他" && item.count > 0).length;
  const diagnosis = [];

  if (summary.count < 10) diagnosis.push("样本量明显偏少，只适合课堂演示，不适合直接写小论文。");
  else if (summary.count < 100) diagnosis.push("样本量偏少，适合小型课程项目，不建议使用复杂机器学习。");
  else diagnosis.push("样本量具备课程项目基础，可进一步清洗后开展系统分析。");

  if (activeThemes >= 3) diagnosis.push("主题分布有一定层次，适合扩展为主题分析或人工编码研究。");
  else diagnosis.push("主题类别较少，建议补充更多样本或缩小研究问题。");

  if ((sentiment.positive + sentiment.negative) / summary.count >= 0.4) diagnosis.push("情感表达较明显，适合写情感倾向与受众评价部分。");
  else diagnosis.push("情绪词较少，情感分析只能作为辅助，不宜作为唯一方法。");

  if ((topWords[0]?.count || 0) >= 3) diagnosis.push("高频词集中度较高，可继续做关键词解释和代表文本阅读。");
  else diagnosis.push("高频词集中度不高，建议扩大样本或完善关键词词典。");

  diagnosis.push("下一步建议：补充平台、时间、互动指标等字段，并用人工抽样核验规则分类结果。");
  return diagnosis;
}

function buildPaperDescription({ summary, topWords, sentiment, themes, methods }) {
  const wordList = topWords.slice(0, 6).map((item) => item.word).join("、") || "暂无明显高频词";
  const posPercent = percent(sentiment.positive, summary.count);
  const negPercent = percent(sentiment.negative, summary.count);
  const neuPercent = percent(sentiment.neutral, summary.count);
  const topTheme = themes.find((item) => item.count > 0) || { name: "其他", percent: 0 };
  const methodNames = methods.slice(0, 3).map((item) => item.replace(/，.*/, "").replace(/。$/, "")).join("、");

  return `本次分析共纳入${summary.count}条文本。词频结果显示，样本中高频词主要包括${wordList}，说明讨论焦点集中在这些关键词所代表的传播对象和评价维度。情感分析结果显示，正面文本占比${posPercent}%，负面文本占比${negPercent}%，中性文本占比${neuPercent}%，整体情感倾向呈现${sentiment.overall}。主题分类结果显示，${topTheme.name}类文本占比最高，约为${topTheme.percent}%，表明该样本主要围绕${topTheme.name}相关内容展开。后续研究可进一步采用${methodNames || "词频分析和人工编码"}方法进行深入分析。`;
}

function percent(value, total) {
  return total ? Math.round((value / total) * 100) : 0;
}
