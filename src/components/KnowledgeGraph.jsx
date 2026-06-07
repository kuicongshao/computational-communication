import { useMemo, useState } from "react";
import { chapters, projects, researchDirections } from "../data.js";
import GraphShell from "./GraphShell.jsx";
import SectionHeader from "./SectionHeader.jsx";
import ChapterDetail from "./ChapterDetail.jsx";
import InfoCard from "./InfoCard.jsx";

const chapterTopics = [
  {
    focus: "理解计算传播学的研究对象、方法升级和平台机制意识。",
    difficulty: "难点在于把传播理论、平台数据和计算方法放在同一个解释框架中，而不是把课程理解成单纯编程课。",
    caseText: "以高校新媒体账号为例，教师可以让学生比较同一条招生宣传内容在公众号、抖音和小红书上的反馈差异。公众号阅读量更像正式传播触达，抖音评论更能呈现情绪表达，小红书收藏和笔记转发则可能反映生活方式认同。这个案例说明传播效果并不是一个单一数字，而是平台规则、内容形式、受众关系和互动机制共同生成的结果。",
    codeTitle: "用一个小型内容表观察不同平台的平均互动",
    method: "本文以公开平台内容互动数据为样本，将平台类型、内容类型、点赞量和评论量作为基础变量，通过描述统计比较不同平台中的传播反馈差异，并结合平台机制讨论互动指标的解释边界。"
  },
  {
    focus: "掌握算法推荐、情绪传播和平台可见度对传播效果的影响。",
    difficulty: "难点在于不能把高互动简单等同于高认可，还要解释争议、情绪和推荐机制如何共同放大内容。",
    caseText: "以城市文旅短视频传播为例，某条视频可能因为音乐、画面节奏和标题情绪强烈而获得较高互动，但评论区中既有旅游向往，也可能有拥挤、商业化和刻板印象的讨论。学生需要把点赞、评论、收藏、转发和评论情绪分开观察，判断传播效果究竟表现为喜欢、争议、扩散还是再解释。",
    codeTitle: "计算内容互动率并按内容类型比较",
    method: "本文将短视频互动量、评论情绪和内容类型纳入同一分析框架，通过互动率指标衡量传播效果，并进一步阅读评论文本解释平台推荐环境下情绪化表达与内容可见度之间的关系。"
  },
  {
    focus: "把传播问题转化为研究问题、变量、指标和数据字段。",
    difficulty: "难点在于操作化。比如喜欢、认同、影响力、国家形象都不能直接测量，需要被转化为可观察指标。",
    caseText: "以“海外受众如何评价中国文化短视频”为例，研究问题可以拆成三个层次：受众关注哪些文化符号，评论情绪是正向还是负向，国家形象如何在评论中被建构。对应字段包括视频标题、发布时间、评论文本、点赞数、评论语言、情感标签、主题标签和国家形象框架。",
    codeTitle: "建立变量表并检查字段完整性",
    method: "本文首先根据研究问题构建变量操作化表，将抽象传播概念转化为可观察字段，再对样本数据进行字段完整性检查，为后续文本分析与统计比较提供结构化基础。"
  },
  {
    focus: "掌握 Python 基础语法，并能读取、循环处理和保存传播数据。",
    difficulty: "难点不是记住所有语法，而是理解变量、列表、字典、循环和文件读取如何服务于可复现研究。",
    caseText: "在课堂中，学生可以从 8 条评论开始练习：先把评论保存为列表，再用循环计算每条评论长度，最后把结果整理为表格。这个过程让学生意识到编程不是抽象计算，而是把重复性的数据处理步骤写成可复查的流程。",
    codeTitle: "用 Python 处理一个评论列表",
    method: "本文使用 Python 对评论文本进行批量处理，计算文本长度并构建结构化结果表。该流程用于展示从非结构化评论到可分析字段的基础转换过程。"
  },
  {
    focus: "掌握缺失值、重复值、字段规范化和文本噪声清理。",
    difficulty: "难点在于清洗规则会影响研究结论，不能为了整洁而删除有意义的文化符号和情绪表达。",
    caseText: "以微博公共事件评论为例，数据中可能包含重复转发、链接、话题标签、表情和空评论。链接通常可以删除，但表情可能是情绪表达的一部分；话题标签有时是噪声，有时又体现议题归属。学生需要根据研究问题决定保留或删除，而不是机械套用清洗模板。",
    codeTitle: "清洗评论中的链接、空值和重复值",
    method: "本文对公开评论数据进行预处理，包括删除重复样本、处理缺失文本、规范化字段并去除链接等噪声信息。清洗规则在方法部分中明确说明，以保证研究过程可复核。"
  },
  {
    focus: "用图表表达传播热度、词频、趋势和网络关系。",
    difficulty: "难点在于图表必须服务于论证。好看的图不一定是好图，能解释问题的图才有研究价值。",
    caseText: "以公共事件舆情为例，折线图可以展示评论量随时间变化，柱状图可以展示高频词，网络图可以呈现议题之间的共现关系。学生需要为每张图写出一句发现，例如“事件第二天情绪词明显增加”，并解释这种变化可能与新闻节点或平台讨论有关。",
    codeTitle: "绘制每日评论量趋势图",
    method: "本文使用可视化方法展示传播过程中的时间变化，将评论数据按日期聚合，绘制互动趋势图，并结合事件节点解释传播热度的阶段性变化。"
  },
  {
    focus: "理解情感分析如何用于传播效果识别和受众反馈解释。",
    difficulty: "难点在于情感分类不能脱离语境。反讽、玩梗、粉丝话语和跨文化表达都可能导致模型误判。",
    caseText: "在国家形象评论分析中，“太震撼了”可能是正向评价，“又来了”可能包含反感或讽刺。学生不能只统计正负面比例，还要抽样阅读代表评论，说明情绪分布背后的文化意义和事件语境。",
    codeTitle: "用简单词典判断评论情感倾向",
    method: "本文采用词典法对评论文本进行初步情感识别，将评论划分为正向、负向和中性，并通过人工抽样校验结果，讨论情感倾向与传播效果之间的关系。"
  },
  {
    focus: "掌握 LDA、BERTopic 等主题模型的研究逻辑。",
    difficulty: "难点在于主题模型只能提供模式线索，主题命名和理论解释仍然需要研究者完成。",
    caseText: "以 YouTube 中国文化视频评论为例，主题模型可能抽取出美食体验、历史想象、政治评价、旅游愿望和语言学习等主题。学生要阅读每个主题的代表评论，判断主题词是否真的构成一个有意义的讨论方向，并把它们连接到文化接受或国家形象理论。",
    codeTitle: "用关键词列表模拟主题归类流程",
    method: "本文使用主题发现方法识别评论文本中的主要讨论方向，并结合代表文本对主题进行命名和解释。主题结果不被视为自动结论，而作为质性解释和后续论文分析的线索。"
  },
  {
    focus: "理解监督学习、人工编码、特征和标签在文本分类中的作用。",
    difficulty: "难点在于标签体系必须来自理论和样本阅读，不能为了训练模型随意设置类别。",
    caseText: "在品牌评论分析中，学生可以把评论分为产品评价、价格讨论、情绪表达、购买意向和售后反馈五类。分类前需要先写清楚编码标准，再由小组成员对样本进行试编码，讨论分歧后再训练模型。",
    codeTitle: "训练一个最小文本分类模型",
    method: "本文基于人工编码样本构建文本分类任务，将评论文本转化为 TF-IDF 特征，并使用监督学习模型识别不同评论类别，同时报告模型表现和错误类型。"
  },
  {
    focus: "比较分类模型，理解准确率、召回率、F1 值等评估指标。",
    difficulty: "难点在于模型评估不是技术附录，而是证明研究方法可靠性的关键证据。",
    caseText: "在舆情风险识别中，如果风险评论只占少数，模型即使全部预测为普通评论也可能有较高准确率，但这对研究没有意义。学生需要关注召回率：模型是否找回了真正重要的风险评论，并结合错误样本解释模型局限。",
    codeTitle: "比较预测结果并计算分类评价指标",
    method: "本文将文本分类模型用于传播类别识别，并通过精确率、召回率和 F1 值评估模型表现。研究重点不只在于获得较高分数，还在于解释模型适用范围和分类错误的传播学含义。"
  }
];

const codeSamples = [
`import pandas as pd

data = [
    {"platform": "公众号", "content_type": "招生宣传", "likes": 120, "comments": 18},
    {"platform": "抖音", "content_type": "校园生活", "likes": 860, "comments": 96},
    {"platform": "小红书", "content_type": "学习经验", "likes": 430, "comments": 51}
]
df = pd.DataFrame(data)
df["total_interaction"] = df["likes"] + df["comments"]
result = df.groupby("platform")["total_interaction"].mean()
print(result)`,
`import pandas as pd

data = [
    {"type": "城市风景", "views": 10000, "likes": 900, "comments": 120},
    {"type": "美食体验", "views": 8000, "likes": 760, "comments": 88},
    {"type": "历史文化", "views": 6000, "likes": 390, "comments": 66}
]
df = pd.DataFrame(data)
df["interaction_rate"] = (df["likes"] + df["comments"]) / df["views"]
print(df[["type", "interaction_rate"]].sort_values("interaction_rate", ascending=False))`,
`import pandas as pd

variables = [
    {"concept": "传播效果", "field": "likes", "meaning": "点赞量"},
    {"concept": "受众反馈", "field": "comment", "meaning": "评论文本"},
    {"concept": "情绪倾向", "field": "sentiment", "meaning": "正向/负向/中性"}
]
df = pd.DataFrame(variables)
print(df)
print("字段数：", len(df))`,
`comments = ["这个视频很有感染力", "标题很吸引人", "评论区讨论很热烈"]
rows = []

for index, text in enumerate(comments, start=1):
    rows.append({"id": index, "comment": text, "length": len(text)})

for row in rows:
    print(row)`,
`import pandas as pd
import re

data = [{"comment": "很好看 https://example.com"}, {"comment": ""}, {"comment": "很好看 https://example.com"}]
df = pd.DataFrame(data)
df = df.drop_duplicates()
df["comment"] = df["comment"].fillna("")
df["comment"] = df["comment"].map(lambda text: re.sub(r"http\\S+", "", text).strip())
df = df[df["comment"].str.len() > 0]
print(df)`,
`import pandas as pd
import matplotlib.pyplot as plt

data = [{"date": "2026-01-01", "comments": 20}, {"date": "2026-01-02", "comments": 55}, {"date": "2026-01-03", "comments": 38}]
df = pd.DataFrame(data)
plt.plot(df["date"], df["comments"], marker="o")
plt.title("每日评论量趋势")
plt.xlabel("日期")
plt.ylabel("评论量")
plt.tight_layout()
plt.show()`,
`comments = ["我很喜欢这个文化视频", "这个表达有点失望", "内容还可以"]
positive = {"喜欢", "精彩", "感动", "认同"}
negative = {"失望", "反感", "担心", "误解"}

for text in comments:
    score = sum(word in text for word in positive) - sum(word in text for word in negative)
    label = "正向" if score > 0 else "负向" if score < 0 else "中性"
    print(text, label)`,
`texts = ["熊猫 文化 可爱", "美食 城市 旅游", "文化 历史 传统", "城市 夜景 旅游"]
topics = {"文化主题": ["文化", "历史", "传统", "熊猫"], "旅游主题": ["城市", "旅游", "夜景", "美食"]}

for text in texts:
    scores = {topic: sum(word in text for word in words) for topic, words in topics.items()}
    best_topic = max(scores, key=scores.get)
    print(text, best_topic)`,
`from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB

texts = ["质量很好值得买", "价格太贵不推荐", "物流很快体验好", "售后不好很失望"]
labels = ["正向", "负向", "正向", "负向"]
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(texts)
model = MultinomialNB()
model.fit(X, labels)
print(model.predict(vectorizer.transform(["体验很好值得推荐"])))`,
`from sklearn.metrics import classification_report

real_labels = ["风险", "普通", "风险", "普通", "普通"]
pred_labels = ["风险", "普通", "普通", "普通", "风险"]
report = classification_report(real_labels, pred_labels, zero_division=0)
print(report)`
];

function explainLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return "空行用于分隔代码结构，让阅读更清楚。";
  if (trimmed.startsWith("import pandas")) return "导入 pandas，用来创建和处理表格型传播数据。";
  if (trimmed.startsWith("import matplotlib")) return "导入绘图库，用来把统计结果画成趋势图或柱状图。";
  if (trimmed.startsWith("import re")) return "导入正则表达式库，用来清理链接等文本噪声。";
  if (trimmed.startsWith("from sklearn")) return "从 sklearn 中导入文本特征、模型或评价工具，用于机器学习分析。";
  if (trimmed.includes("DataFrame")) return "把列表数据转换成表格，方便按字段统计和分析。";
  if (trimmed.includes("groupby")) return "按某个字段分组，比较不同平台、类型或日期的传播表现。";
  if (trimmed.includes("drop_duplicates")) return "删除重复样本，避免同一条评论或内容被重复计算。";
  if (trimmed.includes("fillna")) return "处理缺失值，避免空文本影响后续分析。";
  if (trimmed.includes("re.sub")) return "用正则表达式删除链接等噪声文本。";
  if (trimmed.includes("plt.")) return "设置图表内容，让传播趋势或统计结果可以被直观展示。";
  if (trimmed.includes("TfidfVectorizer")) return "把文本转换为机器学习可处理的数字特征。";
  if (trimmed.includes("fit(")) return "让模型从已有样本中学习文本特征与标签之间的关系。";
  if (trimmed.includes("predict")) return "使用训练后的模型预测新文本的类别。";
  if (trimmed.includes("classification_report")) return "输出精确率、召回率和 F1 值，用于评价分类模型。";
  if (trimmed.startsWith("print")) return "输出结果，便于检查每一步是否符合预期。";
  if (trimmed.startsWith("for ")) return "使用循环批量处理多条评论或多行数据。";
  if (trimmed.includes("lambda")) return "对每条文本应用同一条清洗规则。";
  if (trimmed.includes("=")) return "创建变量或新字段，把分析过程中的中间结果保存下来。";
  return "这一行承担数据准备、计算或结果展示的一部分，需要结合上下文理解。";
}

function buildLongLecture(chapter, topic, index) {
  const conceptText = chapter.concepts.join("、");
  return [
    `本章重点：${topic.focus} 对传播学学生来说，计算传播学的学习不是从工具开始，而是从传播现象和研究问题开始。围绕“${chapter.title}”，学生需要把 ${conceptText} 这些概念放到真实平台环境中理解：平台内容不是孤立文本，评论、点赞、转发、收藏、发布时间、用户关系和算法可见度都会参与传播效果的形成。`,
    `知识讲解：本章要求学生形成三层意识。第一层是理论意识，即知道自己研究的是传播效果、受众反馈、平台机制、国家形象、品牌认知还是社群互动。第二层是数据意识，即知道哪些现象可以通过公开数据观察，哪些现象只能通过访谈、问卷或质性阅读补充。第三层是方法意识，即知道词频、情感分析、主题模型、机器学习和可视化各自能回答什么问题，也知道它们不能回答什么问题。很多初学者会把“能跑出结果”误认为“完成研究”，但计算传播学真正需要的是把结果解释回传播学问题。`,
    `操作路径：学习本章时，可以按照“提出问题-设计字段-整理数据-运行代码-检查结果-回到理论解释”的顺序推进。比如一个关于平台传播效果的题目，不能只收集点赞量，还要说明点赞量为什么能代表某种反馈，它和评论情绪、内容类型、发布时间之间是什么关系。如果研究对象是评论文本，学生还要理解文本清洗、分词、编码和抽样阅读的重要性。`,
    `方法连接：${topic.method} 在论文写作中，方法部分不能只写“使用 Python 分析数据”，而要交代数据来源、采集时间、筛选标准、变量定义、分析工具和结果校验方式。对于初学者，最稳妥的写法是先说明研究问题，再说明样本如何获得，随后说明每个字段如何进入分析，最后说明图表或模型结果如何被解释。`,
    `本章难点：${topic.difficulty} 常见错误包括：把平台指标直接等同于受众态度；没有说明数据来源和筛选标准；只展示词云或图表但没有解释；把 AI 生成的代码当成结论；忽视公开数据使用规范和研究伦理。本章学习完成后，学生应能用自己的话说明本章概念、写出一个可分析问题、运行一段基础代码，并把结果转化为论文式表达。`,
    `延伸训练：教师可以要求学生用同一套流程分析一个小样本。第一步选定 10 到 30 条公开文本，第二步建立字段表，第三步运行本章示例代码，第四步写出三句话结果解释，第五步说明这个结果有哪些局限。这样做可以避免学生停留在“看懂页面”的层面，而是真正进入可操作、可展示、可复核的学习状态。`
  ].join("\n\n");
}

function enhanceChapter(chapter, index) {
  const topic = chapterTopics[index];
  const code = codeSamples[index];
  const lineExplanations = code.split("\n").map((line, lineIndex) => ({
    lineNumber: lineIndex + 1,
    code: line || " ",
    explanation: explainLine(line)
  }));
  const goals = [
    `说清楚${chapter.title.replace(/^第\d+章 /, "")}与计算传播学课程主线的关系。`,
    "能够把传播现象转化为数据字段、分析方法和论文表达。",
    "能够运行本章 Python 示例，并解释每一行代码的研究含义。",
    "能够识别本章常见错误，并使用 AI 辅助但不依赖 AI 生成结论。"
  ];
  const commonMistakes = [
    "只看互动量，不解释互动背后的平台机制和受众语境。",
    "没有记录数据来源、采集时间、筛选标准和清洗规则。",
    "把代码输出当成论文结论，缺少样本阅读和理论解释。",
    "直接复制 AI 输出，没有检查代码、变量和文献表述是否可靠。"
  ];
  const aiPrompt = `我正在学习《${chapter.title}》。请基于“${topic.focus}”帮我完成三件事：1. 把一个传播现象转化为研究问题；2. 设计可观察变量和字段表；3. 给出 Python 分析步骤。请解释每一步的传播学意义，并提醒我可能的研究伦理风险。`;
  const lecture = buildLongLecture(chapter, topic, index);
  const totalText = [
    ...goals,
    chapter.concepts.join(""),
    lecture,
    topic.caseText,
    code,
    lineExplanations.map((item) => item.explanation).join(""),
    topic.method,
    chapter.quiz.join(""),
    chapter.exercise,
    chapter.summary,
    topic.focus,
    topic.difficulty,
    commonMistakes.join(""),
    aiPrompt
  ].join("");

  return {
    ...chapter,
    goalList: goals,
    focus: topic.focus,
    difficulty: topic.difficulty,
    commonMistakes,
    aiPrompt,
    case: topic.caseText,
    lecture,
    codeTitle: topic.codeTitle,
    code,
    lineExplanations,
    paperMethod: topic.method,
    wordCount: totalText.length,
    quiz: [
      ...chapter.quiz,
      "本章代码输出可以支持什么论文结论，又不能支持什么结论？",
      "如果使用 AI 辅助，本章最需要人工核验的部分是什么？"
    ],
    exercise: `${chapter.exercise} 在此基础上，请补充一段 200 字左右的方法说明，写清数据来源、字段设计、分析步骤和结果解释方式。`,
    summary: `${chapter.summary} 本章完成后，学生应能从“概念理解”进入“研究操作”：知道如何设计字段、运行代码、解释图表或模型结果，并把分析过程写成规范的论文方法表述。`
  };
}

export default function KnowledgeGraph({ onNavigate }) {
  const enhancedChapters = useMemo(() => chapters.slice(0, 10).map(enhanceChapter), []);
  const [selected, setSelected] = useState(enhancedChapters[0]);
  const [completed, setCompleted] = useState(() => new Set());

  const progress = Math.round((completed.size / enhancedChapters.length) * 100);
  const graphNodes = [
    ...enhancedChapters.map((chapter) => ({
      title: chapter.title,
      caption: `${chapter.concepts.slice(0, 3).join(" / ")} · ${chapter.wordCount}字`,
      chapter
    })),
    { title: "论文研究", caption: "研究方向、问题表达、论文写作" },
    { title: "项目实战", caption: "综合项目训练与课程展示" }
  ];

  function handleSelect(node) {
    if (!node) return setSelected(enhancedChapters[0]);
    if (node.chapter) setSelected(node.chapter);
    if (node.title === "项目实战") onNavigate("projects");
  }

  function toggleComplete(id) {
    setCompleted((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Knowledge Graph"
        title="知识图谱"
        subtitle="以“计算传播学”为中心节点，连接 10 个可深入学习的章节。每章包含完整学习目标、知识讲解、代码三版、论文方法表述、重点难点和学习进度。"
      />

      <section className="rounded-2xl border border-cyan/20 bg-panel/85 p-5 shadow-glow">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-cyan">学习进度</div>
            <div className="mt-1 text-sm text-slate-300">已完成 {completed.size} / {enhancedChapters.length} 章</div>
          </div>
          <div className="rounded-full border border-mint/30 bg-mint/10 px-4 py-2 text-sm font-semibold text-mint">{progress}%</div>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-ink">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan via-mint to-violet transition-all" style={{ width: `${progress}%` }} />
        </div>
      </section>

      <GraphShell
        center="计算传播学"
        nodes={graphNodes}
        activeTitle={selected?.title}
        onSelect={handleSelect}
        color="cyan"
      />

      <ChapterDetail
        chapter={selected}
        completed={completed.has(selected.id)}
        onToggleComplete={() => toggleComplete(selected.id)}
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <InfoCard title="论文研究方向" tone="violet">
          <div className="flex flex-wrap gap-2">
            {researchDirections.map((item) => <span key={item} className="rounded-full bg-violet/10 px-3 py-1 text-violet">{item}</span>)}
          </div>
        </InfoCard>
        <InfoCard title="项目实战模块" tone="amber">
          <div className="flex flex-wrap gap-2">
            {projects.slice(0, 9).map((item) => <span key={item.name} className="rounded-full bg-amber/10 px-3 py-1 text-amber">{item.name}</span>)}
          </div>
        </InfoCard>
      </section>
    </div>
  );
}
