import { useMemo, useState } from "react";
import SectionHeader from "./SectionHeader.jsx";

const filters = ["全部", "学习工具", "Python库", "数据来源", "论文资源", "视频课程", "项目案例", "AI辅助学习"];

const categoryStyles = {
  学习工具: { label: "工具", chip: "border-cyan/30 bg-cyan/10 text-cyan", title: "text-cyan" },
  Python库: { label: "代码", chip: "border-mint/30 bg-mint/10 text-mint", title: "text-mint" },
  数据来源: { label: "数据", chip: "border-violet/30 bg-violet/10 text-violet", title: "text-violet" },
  论文资源: { label: "论文", chip: "border-amber/30 bg-amber/10 text-amber", title: "text-amber" },
  视频课程: { label: "视频", chip: "border-cyan/30 bg-cyan/10 text-cyan", title: "text-cyan" },
  项目案例: { label: "项目", chip: "border-mint/30 bg-mint/10 text-mint", title: "text-mint" },
  AI辅助学习: { label: "AI", chip: "border-violet/30 bg-violet/10 text-violet", title: "text-violet" }
};

const tools = [
  ["Python", "通用编程语言，是本课程完成文本清洗、词频统计、情感分析、主题模型和机器学习分类的基础工具。", "适合在进入数据处理、自动化统计和课程项目实战时使用。学生可以用它读取平台评论、整理字段、批量处理文本并输出图表数据。", "先学变量、列表和字典，再学习 pandas 读表，随后完成分词、统计、可视化和分类任务。", "分析高校新媒体账号一周评论，统计评论长度、互动均值和高频关键词。", `import pandas as pd
df = pd.read_csv("comments.csv")
print(df.head())
print("样本数：", len(df))`, "不要一开始追求复杂代码。先把每一步输入和输出看懂，保存原始数据和处理脚本，遇到报错时先读最后一行错误信息。"],
  ["PyCharm", "适合管理较完整 Python 项目的集成开发环境。", "当课程项目包含多个脚本、数据文件和输出结果时使用，例如清洗脚本、分析脚本、绘图脚本分开管理。", "先建立项目文件夹，再配置解释器，最后把 data、scripts、outputs 分目录保存。", "把“抖音城市文旅传播效果分析”做成可复现项目：raw_data、clean_data、charts 分开管理。", "操作示例：新建项目 -> 创建 scripts/clean.py -> 运行脚本 -> 在 outputs/ 保存清洗结果。", "适合项目阶段使用；课堂快速演示时不一定需要 PyCharm，可以先用 Jupyter Notebook。"],
  ["VS Code", "轻量灵活的代码编辑器，适合同时编辑 Python、Markdown、CSV 和项目说明。", "用于写课程项目脚本、整理 README、查看数据文件和记录分析流程。", "先安装 Python 插件，学会打开文件夹、运行当前文件、使用终端。", "小组项目中用 VS Code 管理分析说明、变量表和 Python 脚本。", "操作示例：打开项目文件夹 -> 选择 Python 解释器 -> 在终端运行 python scripts/analyze.py。", "建议把项目说明写成 Markdown，记录数据来源、采集时间、筛选标准和方法选择。"],
  ["Jupyter Notebook", "可逐步运行代码、插入说明文字和展示图表的交互式学习环境。", "适合课堂演示、初学者调试和项目汇报前的探索性分析。", "先用一个单元格读取数据，再逐步清洗、统计、画图，每一步都写一句解释。", "课堂上逐步演示微博舆情评论从读取、分词到情绪统计的过程。", `# 一个单元格只完成一个小任务
import pandas as pd
df = pd.read_excel("weibo.xlsx")
df[["time", "comment"]].head()`, "Notebook 便于学习，但正式项目要注意整理代码顺序，避免单元格乱跑导致结果不可复现。"],
  ["ChatGPT", "面向自然语言交互的 AI 工具，可辅助理解代码、生成分析思路和润色方法表述。", "当学生不知道如何写清洗规则、如何解释报错、如何把方法写进论文时使用。", "先清楚描述数据字段和研究问题，再让 AI 给出代码或解释，最后由学生验证结果。", "让 AI 帮助生成“评论文本情感分析”的 pandas 处理流程，并要求它解释每一行。", "提示词示例：我有一列中文评论 comment，请用 pandas 帮我去除链接、空值和重复评论，并解释每一步。", "AI 可以帮助学生降低技术门槛，但不能代替研究问题意识、理论理解和结果解释能力。"],
  ["DeepSeek", "适合代码解释、中文任务拆解和本土化表达的 AI 辅助工具。", "用于生成 Python 示例、检查逻辑漏洞、辅助变量设计和优化课堂项目方案。", "把任务拆成“数据字段、目标、方法、输出格式”四部分后再提问。", "让 DeepSeek 帮助设计“小红书品牌传播分析”的变量表。", "提示词示例：请把“品牌认知”操作化为可从小红书评论中观察的 5 个变量，并说明编码标准。", "不要直接提交 AI 输出，必须结合样本阅读修改变量定义。"],
  ["Kimi", "长文本阅读和摘要能力较强的 AI 工具，适合辅助论文、项目材料和报告结构整理。", "用于阅读课程资料、提炼文献综述结构、整理项目汇报提纲。", "先上传或粘贴材料，再要求它按研究问题、方法、发现、局限四类整理。", "把多篇平台传播相关论文摘要整理成文献综述矩阵。", "提示词示例：请根据这些摘要，整理“平台机制如何影响传播效果”的文献综述框架，不要编造文献信息。", "论文资源只能辅助理解，引用信息需要学生回到原文核验。"]
].map(([title, intro, use, path, classroom, example, advice]) => ({
  title, category: "学习工具", tags: ["工具", "项目", "入门"], intro, use, learn: use, path, classroom, example, advice
}));

const libraries = [
  ["pandas", "用于读取、整理和统计表格数据。", "CSV、Excel、平台评论表、互动指标表", "清洗评论、统计样本量、按平台或日期汇总互动数据。", "read_csv、read_excel、head、drop_duplicates、groupby、value_counts", `import pandas as pd
df = pd.read_csv("comments.csv")
print(df.head())
print(df["platform"].value_counts())`, "统计不同平台评论数量和平均点赞量。"],
  ["jieba", "中文分词库，可把连续中文文本切分成词语。", "中文评论、标题、弹幕、新闻文本", "词频分析、关键词提取、词云图和主题模型前的预处理。", "cut、lcut、add_word、load_userdict", `import jieba
text = "这条城市文旅短视频很有感染力"
words = jieba.lcut(text)
print(words)`, "对小红书品牌评论分词，统计产品、情绪和场景词。"],
  ["matplotlib", "基础绘图库，用于绘制柱状图、折线图和散点图。", "统计结果、时间序列、词频表", "展示传播热度、情绪变化和关键词排名。", "plot、bar、hist、title、xlabel、savefig", `import matplotlib.pyplot as plt
words = ["文化", "城市", "美食"]
counts = [42, 31, 25]
plt.bar(words, counts)
plt.title("高频词柱状图")
plt.show()`, "绘制公共事件评论高频词柱状图。"],
  ["sklearn", "机器学习工具库，适合文本特征提取、分类和聚类。", "带标签文本、TF-IDF 特征、数值指标表", "文本分类、情感识别、聚类分析和模型评估。", "TfidfVectorizer、train_test_split、LinearSVC、classification_report", `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
texts = ["我喜欢这个视频", "内容让人失望"]
labels = ["正向", "负向"]
X = TfidfVectorizer().fit_transform(texts)
model = LinearSVC().fit(X, labels)`, "训练一个简单模型区分正向和负向评论。"],
  ["networkx", "网络分析库，用于构建节点和边的关系图。", "关键词共现、用户互动、转发关系", "分析议题之间、用户之间或文化符号之间的连接。", "Graph、add_edge、degree、draw_networkx", `import networkx as nx
G = nx.Graph()
G.add_edge("国家形象", "文化符号")
G.add_edge("国家形象", "情感评价")
print(G.degree())`, "构建海外评论中“国家形象”相关共词网络。"],
  ["wordcloud", "根据词频生成词云图，适合快速展示文本主题印象。", "分词后的词频字典", "展示评论区高频词、品牌认知词和舆情关键词。", "WordCloud、generate、to_file", `from wordcloud import WordCloud
text = "文化 美食 城市 文化 体验"
wc = WordCloud(font_path="simhei.ttf").generate(text)
wc.to_file("wordcloud.png")`, "生成短视频评论词云，展示受众关注点。"],
  ["bertopic", "基于语义向量和聚类的主题发现工具。", "较大规模文本集合，尤其是评论、新闻标题和弹幕", "发现讨论主题、比较不同主题的代表文本和时间变化。", "BERTopic、fit_transform、get_topic_info、get_topic", `# 流程示例
texts = ["评论文本1", "评论文本2", "评论文本3"]
# model = BERTopic(language="multilingual")
# topics, probs = model.fit_transform(texts)
# model.get_topic_info()`, "发现 YouTube 中国文化评论中的主题类别。"],
  ["openpyxl", "读写 Excel 文件的 Python 库，常与 pandas 配合使用。", "xlsx 表格、课堂数据记录、编码表", "读取问卷、保存多工作表结果、整理人工编码数据。", "load_workbook、Workbook、to_excel", `import pandas as pd
df = pd.read_excel("survey.xlsx", engine="openpyxl")
df.to_excel("clean_survey.xlsx", index=False)`, "整理问卷数据并输出清洗后的 Excel 文件。"],
  ["numpy", "数值计算基础库，适合数组、均值、标准差等计算。", "互动指标、问卷量表、模型特征矩阵", "计算传播效果指标、标准化变量和支持机器学习输入。", "array、mean、std、where、reshape", `import numpy as np
likes = np.array([10, 25, 40])
print(likes.mean())
print(likes.std())`, "比较不同内容类型的平均互动量和波动程度。"],
  ["seaborn", "基于 matplotlib 的统计可视化库，图表更适合展示分布和关系。", "数值型指标表、分类变量、情绪评分", "绘制箱线图、热力图、回归趋势图和分组对比图。", "barplot、lineplot、heatmap、boxplot", `import seaborn as sns
import pandas as pd
df = pd.DataFrame({"type":["A","B"], "likes":[20,35]})
sns.barplot(data=df, x="type", y="likes")`, "比较不同视频类型的平均点赞量。"]
].map(([title, intro, data, use, funcs, example, classroom]) => ({
  title, category: "Python库", tags: ["代码", "Python", "方法"], intro, use: `适合处理${data}。${use}`, learn: `重点掌握：${funcs}。`, path: "先运行最小示例，再替换为自己的课程数据；先得到正确输出，再优化图表样式或模型参数。", classroom, example, advice: "代码结果必须和样本内容互相校验，不能只因为程序能运行就认为结论可靠。"
}));

const dataSources = [
  ["微博", "公共事件、热点话题和转发评论丰富，适合观察舆情扩散。", "公共事件中公众关注哪些议题，情绪如何随时间变化。", "词频、情感分析、主题模型、趋势图", "情绪时间线、议题趋势图、互动量折线图", "微博公共事件舆情分析"],
  ["小红书", "生活方式、消费体验和品牌种草内容密集，评论常带有体验细节。", "品牌认知如何形成，哪些内容元素更能引发收藏和评论。", "词频、情感分析、品牌认知分类", "品牌关键词词云、情绪分布图、内容类型对比图", "小红书品牌传播分析"],
  ["抖音", "短视频传播快，互动指标明显，适合研究内容形式与传播效果。", "城市文旅内容如何影响互动量，哪些视觉和标题元素更有效。", "描述统计、回归分析、评论情感分析", "播放互动趋势图、评论情绪图、内容类型柱状图", "抖音城市文旅传播效果分析"],
  ["B站", "弹幕和评论具有社群文化特征，适合研究互动话语和情绪传播。", "弹幕情绪如何随视频段落变化，社群身份如何表达。", "弹幕时间分析、情感分析、话语分类", "弹幕情绪时间线、关键词共现网络", "B站弹幕情绪传播分析"],
  ["YouTube", "适合国际传播和跨文化接受研究，评论常体现海外受众评价。", "海外受众如何理解中国文化符号，国家形象如何被建构。", "主题模型、情感分析、框架分析", "主题分布图、国家形象词网、情绪比例图", "YouTube中国文化海外接受研究"],
  ["新闻网站", "新闻文本结构规范，适合研究议题框架和媒体叙事。", "不同媒体如何报道同一事件，报道框架有何差异。", "文本分类、框架分析、关键词分析", "媒体框架对比图、关键词排名图", "新闻舆论框架分析"],
  ["评论区文本", "平台用户的直接反馈，适合分析态度、情绪和关注点。", "受众是否喜欢某类内容，评论中有哪些赞同、质疑或误读。", "情感分析、词频分析、人工编码", "情绪分布图、评论类型柱状图", "高校新媒体传播效果分析"],
  ["问卷数据", "结构化程度高，可直接测量态度、认知和行为意向。", "品牌情绪是否影响购买意愿，媒介使用是否影响认知。", "描述统计、相关分析、回归分析", "量表均值图、相关热力图、回归结果表", "品牌传播效果问卷研究"],
  ["公众号文章", "长文本叙事完整，适合研究机构传播、品牌叙事和议题设置。", "机构如何塑造形象，标题和叙事策略如何影响阅读反馈。", "文本分析、标题分析、框架分析", "标题关键词图、文章主题分布图", "高校公众号传播策略分析"],
  ["豆瓣评论", "评论相对长，观点表达清楚，适合影视文化和社群评价研究。", "观众如何评价影视文化内容，哪些元素影响口碑。", "主题模型、情感分析、质性文本分析", "主题结构图、评分对比图、评价词云", "俄罗斯影视文化内容海外接受研究"]
].map(([title, intro, question, methods, charts, classroom]) => ({
  title, category: "数据来源", tags: ["数据", "伦理", "平台"], intro, use: `可研究的问题：${question}`, learn: `适合方法：${methods}。可形成图表：${charts}。`, path: "只使用公开数据，遵守平台规则，不采集隐私数据；论文中说明数据来源、采集时间、筛选标准和样本规模。", classroom, example: `项目操作示例：确定关键词和时间范围，记录公开页面样本，建立字段表，再进行${methods.split("、")[0]}。`, advice: "研究伦理优先于数据规模。不要采集手机号、私信、精确位置等隐私信息，引用评论时应做匿名化处理。"
}));

const papers = [
  "计算传播学入门论文", "文本挖掘研究论文", "情感分析研究论文", "主题模型研究论文", "机器学习与传播分类论文", "平台化传播研究论文", "国际传播与国家形象研究论文", "品牌传播数据分析论文"
].map((title) => ({
  title,
  category: "论文资源",
  tags: ["论文", "综述", "研究设计"],
  intro: `${title}适合作为课程项目的理论和方法入口，用来理解研究问题、数据来源、变量设计和结果解释方式。`,
  use: "帮助学生把课堂项目放进已有研究脉络，明确自己的研究是在回答什么问题、补充什么材料、使用什么方法。",
  learn: "阅读时重点看研究问题、理论概念、样本来源、变量定义、方法流程、结果解释和局限讨论。",
  path: "不要编造题名和作者。建议在 CNKI、Google Scholar、学校图书馆或数据库中检索关键词：计算传播学、文本挖掘、平台传播、情感分析、主题模型、国家形象、品牌传播数据分析。",
  classroom: "把一篇论文拆成“问题-数据-方法-发现-局限”五列表格，再转化为自己的课程项目设计。",
  example: "文献综述写法示例：已有研究多从平台机制、用户互动和文本情绪三个角度解释传播效果，本项目在此基础上以评论文本为材料，进一步分析受众关注点与互动表现之间的关系。",
  advice: "检索到文献后必须核验真实来源、作者、年份和页码；AI 只能辅助总结，不能替代原文阅读和规范引用。"
}));

const videos = [
  ["Python基础", "Python 入门 变量 列表 文件读取"],
  ["pandas数据分析", "Python pandas 入门 数据分析 CSV Excel"],
  ["中文文本分析", "中文文本分析 jieba 词频 情感分析"],
  ["数据可视化", "matplotlib seaborn 数据可视化 入门"],
  ["机器学习入门", "sklearn 文本分类 机器学习 入门"],
  ["主题模型", "BERTopic 中文 主题模型 教程 LDA"],
  ["社交媒体数据分析", "社交媒体 数据分析 评论 文本挖掘"],
  ["论文写作与研究设计", "传播学 论文写作 研究设计 文献综述"]
].map(([title, keyword]) => ({
  title,
  category: "视频课程",
  tags: ["视频", "自学", "入门"],
  intro: `${title}方向适合用视频补足课堂之外的操作演示和方法理解。`,
  use: "用于预习、复习和项目阶段查漏补缺，尤其适合看别人如何逐步运行代码或拆解研究设计。",
  learn: `推荐搜索关键词：“${keyword}”。适合观看的内容类型包括入门演示、完整案例、错误排查和项目实战复盘。`,
  path: "建议先看基础概念，再跟做一个最小案例，最后把示例替换为自己的课程数据。",
  classroom: "教师可把视频学习作为课前任务，课堂上检查学生是否能复现一个小步骤。",
  example: `学完${title}后，学生应能完成一个与课程项目直接相关的小任务，例如读取数据、绘制图表或写出研究设计框架。`,
  advice: "不要只收藏视频。每看完 15-20 分钟就暂停复现一次，并记录自己项目中可以迁移的步骤。"
}));

const projectCases = [
  ["小红书品牌传播分析", "品牌内容中哪些元素影响收藏、评论和情感评价？", "小红书公开笔记、评论和互动指标", "词频、情感分析、内容类型对比", "品牌认知词云、情绪分布图、互动对比图"],
  ["抖音城市文旅传播效果分析", "城市形象、音乐、景点和叙事方式如何影响传播效果？", "抖音公开短视频标题、评论和互动数据", "描述统计、回归分析、评论情感分析", "互动趋势图、内容类型柱状图"],
  ["B站弹幕情绪传播分析", "视频不同段落中的弹幕情绪如何变化？", "B站公开弹幕和评论", "情感分析、时间序列、关键词共现", "弹幕情绪时间线、共词网络"],
  ["微博公共事件舆情分析", "公共事件中公众关注哪些议题，舆论焦点如何转移？", "微博公开话题、评论和发布时间", "主题模型、情绪趋势、词频分析", "议题演化图、情绪时间线"],
  ["YouTube中国文化海外接受研究", "海外受众如何理解中国文化符号？", "YouTube公开评论、视频标题和频道信息", "主题模型、情感分析、框架分析", "主题分布图、国家形象词网"],
  ["俄罗斯影视文化内容海外接受研究", "海外观众如何评价俄罗斯影视文化叙事？", "公开评论、评分和视频讨论文本", "主题模型、情感分析、质性阅读", "评价主题图、情感比例图"],
  ["二次元社群话语规训分析", "社群如何形成身份边界和互动规则？", "公开帖子、评论、弹幕和讨论文本", "话语分析、文本分类、共词网络", "身份标签图、互动关系图"],
  ["高校新媒体传播效果分析", "高校账号哪些内容更能引发学生互动？", "高校公开公众号、短视频和评论数据", "内容分类、互动统计、情感分析", "内容类型互动图、评论情绪图"]
].map(([title, question, data, methods, charts]) => ({
  title,
  category: "项目案例",
  tags: ["项目", "实践", "论文"],
  intro: `${title}是适合课程展示的综合项目，能够串联研究问题、数据来源、方法选择和图表表达。`,
  use: `研究问题：${question}`,
  learn: `数据来源：${data}。分析方法：${methods}。预期图表：${charts}。`,
  path: "先写研究问题和变量表，再采集公开样本，完成清洗、分析、图表和结果解释。",
  classroom: "适合小组合作：一人负责数据清洗，一人负责文本分析，一人负责图表，一人负责论文式表达。",
  example: `论文式表达示例：本文以${data}为样本，采用${methods}，分析${question}研究发现可通过${charts}呈现。`,
  advice: "最终成果可以是课程汇报、研究海报、数据分析报告或论文初稿。"
}));

const aiItems = [
  ["用 AI 生成 Python 代码", "不知道如何从需求写出第一版脚本时", "请根据我的字段 comment、time、likes，生成一个 pandas 脚本，完成去重、统计样本数和保存结果，并逐行解释。"],
  ["用 AI 解释代码", "能运行代码但不理解每一步含义时", "请解释下面这段 Python 代码每一行在做什么，并指出它适合回答什么传播学问题。"],
  ["用 AI 修改报错", "代码报错但无法定位问题时", "这是我的报错信息和代码，请先解释错误原因，再给出最小修改方案，不要重写整个项目。"],
  ["用 AI 生成变量设计", "把传播概念转成数据字段时", "请把“传播效果”操作化为可从短视频平台公开数据观察的变量，并说明每个变量的局限。"],
  ["用 AI 辅助论文方法表述", "不知道如何把方法写成论文语言时", "请把我的分析流程改写为本科论文方法部分，包含数据来源、样本筛选、变量和分析方法。"],
  ["用 AI 辅助图表解读", "图表做出来但不会解释时", "请根据这张图表描述三条发现，并提醒我哪些结论不能过度推断。"],
  ["用 AI 辅助课程项目选题", "项目方向太宽，需要缩小题目时", "我想研究小红书品牌传播，请帮我提出 5 个可用公开数据完成的研究问题，并说明对应方法。"]
].map(([title, scene, prompt]) => ({
  title,
  category: "AI辅助学习",
  tags: ["AI", "提示词", "学习"],
  intro: `${title}可以帮助学生把模糊任务拆成可执行步骤。`,
  use: `使用场景：${scene}。`,
  learn: "适合训练提示词表达、代码理解、变量设计、方法写作和结果解释。",
  path: "先写清楚研究问题、数据字段和期望输出，再让 AI 给出步骤；得到答案后必须运行、核验和修改。",
  classroom: "课堂上可让学生比较 AI 输出与人工判断的差异，讨论哪些部分需要理论解释。",
  example: `示例提示词：${prompt}`,
  advice: "AI 可以帮助学生降低技术门槛，但不能代替研究问题意识、理论理解和结果解释能力。学生不能完全依赖 AI 生成结论、虚构文献、替代数据核验或绕过研究伦理。"
}));

const resources = [...tools, ...libraries, ...dataSources, ...papers, ...videos, ...projectCases, ...aiItems];

export default function Resources() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("全部");
  const [openKey, setOpenKey] = useState("");

  const filteredResources = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return resources.filter((item) => {
      const matchFilter = activeFilter === "全部" || item.category === activeFilter;
      const haystack = [item.title, item.category, item.intro, item.use, item.learn, item.path, item.classroom, item.example, item.advice, ...item.tags].join(" ").toLowerCase();
      const matchQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      return matchFilter && matchQuery;
    });
  }, [query, activeFilter]);

  const grouped = useMemo(() => {
    return filters.slice(1).map((category) => ({
      category,
      items: filteredResources.filter((item) => item.category === category)
    })).filter((group) => group.items.length > 0);
  }, [filteredResources]);

  return (
    <div className="space-y-7">
      <SectionHeader
        eyebrow="Resources"
        title="学习资源中心"
        subtitle="从工具、代码库、平台数据到论文、视频、项目和 AI 辅助学习，把计算传播学课程所需资源组织成可检索、可展开、可直接用于课堂项目的资源库。"
      />

      <section className="rounded-2xl border border-cyan/20 bg-panel/85 p-5 shadow-glow">
        <label className="mb-3 block text-sm font-semibold text-cyan" htmlFor="resource-search">资源搜索</label>
        <input
          id="resource-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索 Python、情感分析、微博、论文、AI 提示词、项目案例..."
          className="w-full rounded-xl border border-white/10 bg-ink/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan focus:shadow-glow"
        />
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-soft">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setActiveFilter(filter);
                setOpenKey("");
              }}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${
                activeFilter === filter
                  ? "border-cyan bg-cyan/15 text-cyan"
                  : "border-white/10 bg-white/[.045] text-slate-300 hover:border-cyan/50 hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="mt-3 text-sm text-slate-400">当前显示 {filteredResources.length} 个资源</div>
      </section>

      {grouped.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-panel/80 p-8 text-center text-slate-300">
          没有找到匹配资源。可以尝试搜索“文本分析”“平台数据”“Python”“项目”。
        </div>
      ) : (
        grouped.map(({ category, items }) => (
          <section key={category} className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className={`text-2xl font-bold ${categoryStyles[category].title}`}>{category}</h2>
              <span className={`rounded-full border px-3 py-1 text-xs ${categoryStyles[category].chip}`}>{items.length} 项</span>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {items.map((item) => {
                const key = `${item.category}-${item.title}`;
                const open = openKey === key;
                return (
                  <article key={key} className="overflow-hidden rounded-2xl border border-white/10 bg-panel/80 shadow-glow transition hover:border-cyan/40">
                    <button
                      onClick={() => setOpenKey(open ? "" : key)}
                      className="flex w-full items-start justify-between gap-4 p-5 text-left"
                    >
                      <div>
                        <div className="mb-3 flex flex-wrap gap-2">
                          <span className={`rounded-full border px-3 py-1 text-xs ${categoryStyles[item.category].chip}`}>
                            {categoryStyles[item.category].label}
                          </span>
                          {item.tags.map((tag) => (
                            <span key={tag} className="rounded-full border border-white/10 bg-white/[.045] px-3 py-1 text-xs text-slate-300">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-slate-300">{item.intro}</p>
                      </div>
                      <span className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan/30 text-cyan transition ${open ? "rotate-45 bg-cyan/15" : "bg-white/[.04]"}`}>
                        +
                      </span>
                    </button>
                    {open && (
                      <div className="border-t border-white/10 p-5">
                        <div className="grid gap-4 md:grid-cols-2">
                          <Detail title="在计算传播学中的用途" text={item.use} />
                          <Detail title="适合学习的内容" text={item.learn} />
                          <Detail title="推荐学习路径" text={item.path} />
                          <Detail title="课堂案例" text={item.classroom} />
                        </div>
                        <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
                          <div className="rounded-xl border border-amber/25 bg-amber/10 p-4">
                            <h4 className="mb-2 font-semibold text-amber">示例代码或操作示例</h4>
                            <pre className="rounded-lg bg-ink/90 p-4 text-xs leading-6 text-slate-200">{item.example}</pre>
                          </div>
                          <Detail title="使用建议" text={item.advice} tone="mint" />
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

function Detail({ title, text, tone = "cyan" }) {
  const toneClass = tone === "mint" ? "text-mint border-mint/25 bg-mint/10" : "text-cyan border-cyan/20 bg-white/[.04]";
  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <h4 className="mb-2 font-semibold">{title}</h4>
      <p className="text-sm leading-7 text-slate-300">{text}</p>
    </div>
  );
}
