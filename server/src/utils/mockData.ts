// 模拟帖子数据生成器

interface User {
  id: number;
  username: string;
  avatar: string;
}

interface Comment {
  id: number;
  userId: number;
  username: string;
  avatar: string;
  content: string;
  createdAt: string;
  likeCount: number;
  replyCount: number;
}

interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  authorName: string;
  authorAvatar: string;
  type: 'free' | 'paid' | 'bounty';
  category: string;
  tags: string[];
  images?: string[];
  price?: number;
  status: 'published';
  createdAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  forwardCount: number;
  collectCount: number;
  isLiked: boolean;
  isCollected: boolean;
}

// 模拟用户
const users: User[] = [
  { id: 1, username: 'tech_founder', avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: 2, username: 'startup_mentor', avatar: 'https://i.pravatar.cc/150?img=2' },
  { id: 3, username: 'product_manager', avatar: 'https://i.pravatar.cc/150?img=3' },
  { id: 4, username: 'dev_lead', avatar: 'https://i.pravatar.cc/150?img=4' },
  { id: 5, username: 'marketing_guru', avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: 6, username: 'design_expert', avatar: 'https://i.pravatar.cc/150?img=6' },
  { id: 7, username: 'growth_hacker', avatar: 'https://i.pravatar.cc/150?img=7' },
  { id: 8, username: 'data_scientist', avatar: 'https://i.pravatar.cc/150?img=8' },
  { id: 9, username: 'ai_researcher', avatar: 'https://i.pravatar.cc/150?img=9' },
  { id: 10, username: 'saas_expert', avatar: 'https://i.pravatar.cc/150?img=10' },
];

// 帖子标题模板
const titleTemplates = [
  '如何从0到1打造{product}产品',
  '融资{round}轮的{number}个关键建议',
  '我在创业第{year}年学到的教训',
  '为什么{number}%的初创公司会在前{month}个月失败',
  '打造百万用户产品的{number}个秘诀',
  '从技术到产品：{role}的转型之路',
  '如何找到{number}个付费种子用户',
  'SaaS产品的{metric}指标优化指南',
  '创业公司的{number}个致命错误',
  '如何用{money}预算启动{product}',
  '{industry}行业创业趋势报告',
  '从0到{revenue}营收的{month}个月成长记录',
  '如何管理远程创业团队',
  '产品PMF的{number}个验证方法',
  '创业公司的品牌建设策略',
  '如何通过{channel}获取低成本流量',
  'B2B销售的{number}个实战技巧',
  '创业者的时间管理方法论',
  '如何构建可扩展的技术架构',
  '创业团队的股权分配方案',
];

// 帖子内容模板
const contentTemplates = [
  '在创业过程中，{experience}。经过{number}个月的实践，我总结了以下几点：\n\n1. {point1}\n2. {point2}\n3. {point3}\n\n希望对大家有所启发，欢迎交流讨论！',
  '今天分享一个关于{topic}的实战案例。我们通过{method}，在{time}内实现了{result}。\n\n关键步骤：\n- {step1}\n- {step2}\n- {step3}\n\n如果有同学想要深入了解，欢迎私信交流。',
  '{number}年前我开始{project}时，完全没想到会达到今天的成就。回顾这段旅程，最重要的是{lesson}。\n\n这里我分享几个核心观点：\n1. {view1}\n2. {view2}\n3. {view3}',
  '很多创业者在{area}上容易犯错，包括{mistake1}和{mistake2}。通过我的{experience}经历，我发现了更好的解决方案。\n\n详细内容如下...',
  '关于{topic}，我有不同的看法。传统的{method}已经不再适用，我们需要从{perspective}重新思考问题。',
];

// 填充词
const fillWords = {
  product: ['SaaS平台', '移动应用', 'AI工具', '电商平台', '内容社区', '社交网络'],
  round: ['天使', 'A', 'B', 'C'],
  number: ['3', '5', '7', '10', '15', '20'],
  year: ['1', '2', '3', '4', '5'],
  month: ['3', '6', '9', '12', '18'],
  role: ['技术总监', '产品经理', '运营总监', '市场负责人'],
  metric: ['LTV/CAC', '用户留存', '转化率', '活跃度'],
  money: ['5万', '10万', '20万', '50万'],
  industry: ['人工智能', '企业服务', '消费零售', '金融科技', '教育科技'],
  revenue: ['10万', '50万', '100万', '500万'],
  channel: ['SEO优化', '内容营销', '社交媒体', '社群运营'],
  experience: ['遇到了很多挑战', '积累了一些经验', '踩过不少坑', '学到很多教训'],
  point1: ['明确目标用户', '快速迭代验证', '建立数据指标', '注重用户体验'],
  point2: ['保持团队协作', '控制成本开支', '关注核心指标', '持续学习改进'],
  point3: ['坚持长期主义', '灵活调整策略', '倾听用户反馈', '保持战略定力'],
  topic: ['用户增长', '产品运营', '团队管理', '融资路演'],
  method: ['A/B测试', '数据分析', '用户访谈', '竞品研究'],
  time: ['3个月', '6个月', '1年', '2年'],
  result: ['用户翻倍', '收入增长50%', '转化率提升30%', '留存率达到40%'],
  step1: ['确定目标', '制定计划', '搭建团队', '验证想法'],
  step2: ['开发产品', '获取用户', '优化体验', '扩大规模'],
  step3: ['持续迭代', '数据驱动', '生态建设', '品牌建设'],
  project: ['第一次创业', '这个项目', '我们的产品', '转型之路'],
  lesson: ['坚持和耐心', '团队的力量', '用户价值', '市场洞察'],
  view1: ['相信自己的直觉', '学会快速试错', '建立长期视角', '保持简单专注'],
  view2: ['重视数据反馈', '培养创业心态', '保持学习热情', '关注现金流'],
  view3: ['建立核心价值观', '保持战略清晰', '注重产品质量', '培养团队文化'],
  area: ['产品定位', '市场推广', '团队管理', '融资规划'],
  mistake1: ['急于求成', '忽视用户需求', '过度扩张', '现金流管理不当'],
  mistake2: ['缺乏数据驱动', '团队协作不畅', '产品功能臃肿', '市场定位不清'],
  perspective: ['用户价值', '商业本质', '长期视角', '系统思维'],
};

// 分类
const categories = [
  '产品心得', '融资经验', '运营推广', '团队管理', '技术分享',
  '市场营销', '商业模式', '创业故事', '行业洞察', '工具推荐'
];

// 标签
const tagLists = [
  ['创业', '产品', '心得'],
  ['融资', '投资', '路演'],
  ['运营', '增长', '获客'],
  ['团队', '管理', '文化'],
  ['技术', '架构', '开发'],
  ['营销', '品牌', '传播'],
  ['商业模式', '变现', 'SaaS'],
  ['创业故事', '经历', '反思'],
  ['行业趋势', '洞察', '分析'],
  ['工具', '效率', '推荐'],
];

// 随机选择
function randomChoice(arr: any[]): any {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 填充模板
function fillTemplate(template: string): string {
  let result = template;
  Object.keys(fillWords).forEach((key) => {
    const regex = new RegExp(`{${key}}`, 'g');
    result = result.replace(regex, () => randomChoice(fillWords[key as keyof typeof fillWords]));
  });
  return result;
}

// 生成评论
function generateComments(postId: number, count: number): Comment[] {
  const commentContents = [
    '太有用了！感谢分享！',
    '学到了很多，实践后效果很好',
    '这个观点很新颖，值得思考',
    '请问可以详细讲讲{point}吗？',
    '我在创业中也遇到过类似问题',
    '期待更多干货分享',
    '已经分享给团队了',
    '非常实用的建议',
    '能否推荐一些相关资源？',
    '这篇文章帮我节省了很多时间',
  ];

  const comments: Comment[] = [];
  for (let i = 0; i < count; i++) {
    const user = randomChoice(users);
    const content = fillTemplate(randomChoice(commentContents));
    comments.push({
      id: postId * 100 + i + 1,
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      content,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      likeCount: Math.floor(Math.random() * 50),
      replyCount: Math.floor(Math.random() * 10),
    });
  }
  return comments;
}

// 生成帖子
export function generatePosts(count: number = 100): Post[] {
  const posts: Post[] = [];

  for (let i = 1; i <= count; i++) {
    const user = randomChoice(users);
    const type = randomChoice(['free', 'paid', 'bounty']) as 'free' | 'paid' | 'bounty';
    const hasImage = Math.random() > 0.5;
    const images = hasImage ? [
      `https://picsum.photos/400/300?random=${i}`,
      `https://picsum.photos/400/300?random=${i + 1000}`,
    ] : undefined;

    const post: Post = {
      id: i,
      title: fillTemplate(randomChoice(titleTemplates)),
      content: fillTemplate(randomChoice(contentTemplates)),
      authorId: user.id,
      authorName: user.username,
      authorAvatar: user.avatar,
      type,
      category: randomChoice(categories),
      tags: randomChoice(tagLists),
      images,
      price: type === 'paid' || type === 'bounty' ? Math.floor(Math.random() * 900 + 99) : undefined,
      status: 'published',
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      viewCount: Math.floor(Math.random() * 10000) + 100,
      likeCount: Math.floor(Math.random() * 500),
      commentCount: Math.floor(Math.random() * 100),
      forwardCount: Math.floor(Math.random() * 200),
      collectCount: Math.floor(Math.random() * 150),
      isLiked: false,
      isCollected: false,
    };

    posts.push(post);
  }

  // 按创建时间倒序排列
  return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// 导出评论
export function generateAllComments(posts: Post[]): Map<number, Comment[]> {
  const commentMap = new Map<number, Comment[]>();
  posts.forEach(post => {
    const commentCount = Math.floor(Math.random() * 20);
    commentMap.set(post.id, generateComments(post.id, commentCount));
  });
  return commentMap;
}
