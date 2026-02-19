import express from 'express';

const router = express.Router();

// 生成随机数据
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// 生成图片URL
function generateImageUrls(keyword: string, count: number = 1): string[] {
  const urls: string[] = [];
  const imageKeywords = ['business', 'startup', 'technology', 'office', 'team', 'meeting', 'innovation', 'strategy', 'marketing', 'finance', 'computer', 'work', 'design', 'data', 'analytics'];
  
  for (let i = 0; i < count; i++) {
    const randomKeyword = keyword || imageKeywords[randomInt(0, imageKeywords.length - 1)];
    const width = randomInt(600, 900);
    const height = Math.floor(width * [0.7, 0.8, 1.0, 1.2, 1.3][randomInt(0, 4)]);
    urls.push(`https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(randomKeyword)}`);
  }
  return urls;
}

// 随机生成评论
function generateComments(postId: number, count: number) {
  const commentTemplates = [
    '非常赞同作者的观点，确实如此！',
    '这个观点很有启发，受教了。',
    '文章写得很详细，感谢分享。',
    '请问可以详细说明一下吗？',
    '我也遇到过类似的问题，这个方法很有用。',
    '期待更多类似的内容。',
    '这篇内容太实用了，已经收藏了。',
    '希望能继续分享这类干货。',
    '这是一个很棒的资源，感谢提供。',
    '学习了，受益匪浅！',
    '这个思路很新颖，值得借鉴。',
    '希望能有机会和作者交流一下。',
    '内容很丰富，需要慢慢消化。',
    '解决了我的困惑，谢谢！',
    '这个建议很中肯，会尝试一下。',
  ];

  const comments = [];
  for (let i = 0; i < count; i++) {
    comments.push({
      id: postId * 100 + i + 1,
      userId: randomInt(1, 20),
      username: `用户${randomInt(1, 50)}`,
      avatar: `https://i.pravatar.cc/150?img=${randomInt(1, 70)}`,
      content: randomItem(commentTemplates),
      createdAt: randomDate(new Date(2025, 0, 1), new Date()).toISOString(),
      likeCount: randomInt(0, 50),
      replyCount: randomInt(0, 10),
    });
  }
  return comments;
}

// 生成推荐帖子数据
function generateRecommendPosts(): any[] {
  const titles = [
    '创业初期需要注意的三个关键点',
    '如何快速验证创业想法的可行性',
    '创业者如何平衡工作和生活',
    '从0到1的创业经验总结',
    '创业者必备的时间管理技巧',
    '如何找到合适的创业合伙人',
    '初创企业如何快速获取第一批用户',
    '创业者应该避免的五个常见误区',
    '如何打造一个有凝聚力的创业团队',
    '创业公司如何制定有效的营销策略',
    '创业者如何保持持续的学习和成长',
    '从失败中学习：创业路上的坑与避坑指南',
    '如何建立良好的创业心态',
    '创业者如何有效利用人脉资源',
    '创业公司如何进行成本控制',
    '如何制定创业公司的战略规划',
    '创业者如何应对压力和焦虑',
    '从产品到市场：创业公司的推广策略',
    '如何培养创业公司的创新文化',
    '创业者如何建立个人品牌',
    '创业公司如何进行人才招聘',
    '如何进行有效的市场调研',
    '创业者如何与投资人沟通',
    '从数据中洞察：创业公司的数据分析方法',
    '如何提高创业公司的运营效率',
    '创业者如何建立良好的客户关系',
    '创业公司如何应对竞争',
    '如何打造让用户喜欢的产品',
    '创业者如何进行有效的财务管理',
    '从失败到成功：创业者的韧性培养',
    '如何保持创业公司的活力和创新力',
  ];

  const categories = ['创业', '产品', '营销', '团队', '管理', '融资', '技术', '运营'];
  const tagsList = [
    ['创业心得', '经验分享'],
    ['产品开发', '用户增长'],
    ['营销策略', '品牌建设'],
    ['团队管理', '领导力'],
    ['创业技巧', '方法论'],
    ['商业模式', '创新'],
    ['运营心得', '效率提升'],
    ['财务规划', '成本控制'],
    ['市场竞争', '差异化'],
    ['产品思维', '用户洞察'],
  ];

  const posts = [];
  for (let i = 1; i <= 30; i++) {
    const hasImage = Math.random() > 0.3;
    const hasMultipleImages = hasImage && Math.random() > 0.7;
    const imageCount = hasMultipleImages ? randomInt(2, 5) : 1;

    const images: string[] = [];
    if (hasImage) {
      const category = categories[i % categories.length];
      images.push(...generateImageUrls(category, imageCount));
    }

    posts.push({
      id: i,
      title: titles[i - 1],
      content: `这是一篇关于${categories[i % categories.length]}的深度分享，包含了我多年来的实践经验和思考。希望能对正在创业或准备创业的朋友有所帮助。内容涵盖策略制定、执行落地、团队协作等多个方面，既有理论也有实践案例。`,
      authorId: randomInt(1, 20),
      authorName: `创作者${randomInt(1, 50)}`,
      authorAvatar: `https://i.pravatar.cc/150?img=${randomInt(1, 70)}`,
      isMerchant: Math.random() > 0.7,
      type: 'article',
      contentType: hasImage ? 'image' : 'text',
      category: categories[i % categories.length],
      tags: tagsList[i % tagsList.length],
      images,
      videoUrl: '',
      virtualResources: [],
      price: 0,
      status: 'published',
      createdAt: randomDate(new Date(2025, 0, 1), new Date()).toISOString(),
      viewCount: randomInt(100, 5000),
      likeCount: randomInt(10, 500),
      commentCount: randomInt(0, 100),
      forwardCount: randomInt(0, 200),
      collectCount: randomInt(0, 150),
      isLiked: false,
      isCollected: false,
      aspectRatio: [0.8, 1.0, 1.2, 1.4][randomInt(0, 3)],
      comments: generateComments(i, randomInt(0, 10)),
    });
  }
  return posts;
}

// 生成知识库帖子数据
function generateKnowledgePosts(): any[] {
  const titles = [
    '2024年创业环境分析报告',
    '创业融资全流程指南（含PPT模板）',
    'SaaS产品从0到1的开发手册',
    '创业者必读的10本经典书籍清单',
    '创业公司股权设计实战指南',
    '企业税务筹划与合规指南',
    '用户增长黑客实战案例集',
    '内容营销策略与执行手册',
    '初创企业法律风险防范指南',
    '创业团队绩效考核体系设计',
    '产品原型设计工具与流程指南',
    '创业公司品牌建设完整方案',
    '电商运营从入门到精通（含实战案例）',
    '私域流量运营实战手册',
    '短视频营销完整操作指南',
    '直播带货创业实操指南',
    '跨境电商平台选择与运营策略',
    '创业公司HR招聘与管理手册',
    '新媒体平台运营策略对比分析',
    '创业项目商业计划书写作指南',
    '创业公司财务报表分析与优化',
    '用户调研方法论与工具使用指南',
    '创业公司敏捷开发实践手册',
    '企业数据安全与隐私保护指南',
    '创业者个人IP打造完整方案',
    '社交媒体营销策略与实战技巧',
    '创业危机公关处理手册',
    '创业公司办公效率提升工具集',
    '创业项目路演技巧与注意事项',
    '创业者心理健康维护指南',
    '创业失败案例分析总结报告',
  ];

  const categories = ['报告', '模板', '手册', '指南', '清单', '案例', '方案'];
  const tagsList = [
    ['创业资料', '融资', 'PPT'],
    ['SaaS', '产品开发', '技术'],
    ['股权设计', '法律', '管理'],
    ['用户增长', '营销', '运营'],
    ['内容营销', '品牌', '策略'],
    ['法律风险', '合规', '防范'],
    ['私域流量', '运营', '实操'],
    ['短视频', '直播', '营销'],
    ['跨境电商', '电商', '平台'],
    ['数据分析', '财务', '优化'],
  ];

  const posts = [];
  for (let i = 1; i <= 30; i++) {
    const hasImage = Math.random() > 0.5;
    const images = hasImage
      ? generateImageUrls(categories[i % categories.length], 1)
      : [];

    posts.push({
      id: 100 + i,
      title: titles[i - 1],
      content: `这是一份精心整理的${categories[i % categories.length]}，包含了丰富的实战经验和专业指导。内容详实、条理清晰，适合创业者系统学习和参考。`,
      authorId: randomInt(1, 20),
      authorName: `知识官${randomInt(1, 50)}`,
      authorAvatar: `https://i.pravatar.cc/150?img=${randomInt(1, 70)}`,
      isMerchant: true,
      type: 'qa',
      contentType: hasImage ? 'image' : 'text',
      category: categories[i % categories.length],
      tags: tagsList[i % tagsList.length],
      images,
      videoUrl: '',
      virtualResources: [
        {
          id: i,
          name: `${titles[i - 1]}.pdf`,
          size: `${randomInt(1, 50)}MB`,
          description: '高清PDF版本，支持下载和打印',
          downloadUrl: `https://example.com/download/resource_${i}.pdf`,
          price: randomInt(9, 199),
        },
      ],
      price: randomInt(9, 199),
      status: 'published',
      createdAt: randomDate(new Date(2025, 0, 1), new Date()).toISOString(),
      viewCount: randomInt(200, 10000),
      likeCount: randomInt(50, 1000),
      commentCount: randomInt(0, 50),
      forwardCount: randomInt(10, 300),
      collectCount: randomInt(20, 500),
      isLiked: false,
      isCollected: false,
      aspectRatio: [0.8, 1.0, 1.2, 1.4][randomInt(0, 3)],
      comments: generateComments(100 + i, randomInt(0, 10)),
    });
  }
  return posts;
}

// 生成悬赏帖子数据
function generateBountyPosts(): any[] {
  const titles = [
    '悬赏500元：求推荐优质的CRM系统',
    '悬赏800元：需要一位UI设计师合作完成项目',
    '悬赏1000元：求大神提供SEO优化方案',
    '悬赏2000元：急需开发一个小程序',
    '悬赏1500元：需要撰写商业计划书',
    '悬赏600元：求解答法律相关问题',
    '悬赏1200元：需要一位产品经理协助梳理需求',
    '悬赏1800元：求推荐靠谱的供应链资源',
    '悬赏700元：需要制作企业宣传片',
    '悬赏2500元：急需一个专业的融资顾问',
    '悬赏900元：求解答财务税务问题',
    '悬赏3000元：需要开发一个APP原型',
    '悬赏1100元：求推荐优质的办公场地',
    '悬赏1600元：需要一位营销顾问制定推广方案',
    '悬赏1300元：求解答人力资源相关问题',
    '悬赏2200元：需要一位技术合伙人',
    '悬赏850元：求推荐优质的物流服务商',
    '悬赏1750元：需要撰写产品文案',
    '悬赏2100元：求解答品牌营销问题',
    '悬赏950元：需要一位翻译协助',
    '悬赏2800元：需要开发一个网站',
    '悬赏1400元：求推荐优质的代账公司',
    '悬赏1950元：需要一位运营顾问',
    '悬赏2600元：急需一个数据分析专家',
    '悬赏1050元：求解答知识产权问题',
    '悬赏2300元：需要一位投资人对接',
    '悬赏1650元：求推荐优质的招聘渠道',
    '悬赏1900元：需要一位客服培训师',
    '悬赏2400元：求解答合规相关问题',
    '悬赏1550元：需要一位内容编辑',
    '悬赏2700元：需要一位战略规划顾问',
  ];

  const categories = ['技术开发', '设计', '营销', '财务', '法务', '人力资源', '运营', '其他'];
  const tagsList = [
    ['需求悬赏', '合作'],
    ['技术支持', '开发'],
    ['设计需求', 'UI/UX'],
    ['营销推广', '品牌'],
    ['财务咨询', '税务'],
    ['法律咨询', '合规'],
    ['人力资源', '招聘'],
    ['运营支持', '咨询'],
  ];

  const posts = [];
  for (let i = 1; i <= 30; i++) {
    const hasImage = Math.random() > 0.7;
    const images = hasImage
      ? generateImageUrls(categories[i % categories.length], 1)
      : [];

    posts.push({
      id: 200 + i,
      title: titles[i - 1],
      content: `我正在寻找一位专业人士协助我解决${categories[i % categories.length]}方面的问题，预算已定，请有意者私信联系。要求：有相关经验，能按时交付质量可靠的工作成果。`,
      authorId: randomInt(1, 20),
      authorName: `求助者${randomInt(1, 50)}`,
      authorAvatar: `https://i.pravatar.cc/150?img=${randomInt(1, 70)}`,
      isMerchant: false,
      type: 'bounty',
      contentType: hasImage ? 'image' : 'text',
      category: categories[i % categories.length],
      tags: tagsList[i % tagsList.length],
      images,
      videoUrl: '',
      virtualResources: [],
      price: randomInt(500, 5000),
      status: 'published',
      createdAt: randomDate(new Date(2025, 0, 1), new Date()).toISOString(),
      viewCount: randomInt(150, 5000),
      likeCount: randomInt(20, 300),
      commentCount: randomInt(5, 80),
      forwardCount: randomInt(5, 100),
      collectCount: randomInt(5, 50),
      isLiked: false,
      isCollected: false,
      aspectRatio: [0.8, 1.0, 1.2, 1.4][randomInt(0, 3)],
      comments: generateComments(200 + i, randomInt(5, 20)),
    });
  }
  return posts;
}

// 生成热点讨论帖子数据
function generateHotTopicPosts(): any[] {
  const titles = [
    '创业者如何应对2025年的市场变化？',
    'ChatGPT等AI工具对创业的影响和机遇',
    '创业公司应该优先选择哪条赛道？',
    '如何判断一个创业项目是否值得投入？',
    '创业者需要具备哪些核心能力？',
    '初创企业如何快速建立品牌影响力？',
    '创业过程中最难的是什么？',
    '如何找到适合自己的创业方向？',
    '创业公司如何应对资金短缺？',
    '创业者如何平衡短期利益和长期发展？',
    '2025年最值得关注的创业趋势',
    '创业公司如何进行有效的人才培养？',
    '如何提高创业成功率？',
    '创业者如何建立良好的行业人脉？',
    '创业公司如何进行有效的市场定位？',
    '如何打造有竞争力的产品？',
    '创业者如何应对激烈的竞争环境？',
    '创业公司如何进行有效的成本管理？',
    '如何进行创业项目的风险评估？',
    '创业者如何建立可持续的商业模式？',
    '2025年创业环境的新变化',
    '创业公司如何进行创新管理？',
    '如何选择合适的创业合伙人？',
    '创业者如何保持持续的创新能力？',
    '创业公司如何建立良好的企业文化？',
    '如何进行创业项目的有效执行？',
    '创业者如何应对市场的不确定性？',
    '创业公司如何进行有效的资源整合？',
    '如何进行创业项目的持续优化？',
    '创业者如何建立个人影响力？',
    '2025年创业者需要关注的关键问题',
  ];

  const categories = ['市场趋势', '创业策略', '产品创新', '团队管理', '资金管理', '品牌建设', '风险管理', '商业模式'];
  const tagsList = [
    ['创业讨论', '趋势'],
    ['AI创业', '新技术'],
    ['赛道选择', '方向'],
    ['项目评估', '投资'],
    ['创业能力', '素质'],
    ['品牌建设', '营销'],
    ['创业困难', '挑战'],
    ['创业方向', '定位'],
    ['资金问题', '融资'],
    ['长期发展', '战略'],
    ['2025趋势', '预测'],
    ['人才培养', '团队'],
    ['成功率', '方法'],
    ['人脉建设', '社交'],
    ['市场定位', '策略'],
    ['产品竞争力', '创新'],
    ['市场竞争', '应对'],
    ['成本管理', '优化'],
    ['风险评估', '控制'],
    ['商业模式', '盈利'],
  ];

  const posts = [];
  for (let i = 1; i <= 30; i++) {
    const hasImage = Math.random() > 0.4;
    const hasMultipleImages = hasImage && Math.random() > 0.6;
    const imageCount = hasMultipleImages ? randomInt(2, 5) : 1;

    const images: string[] = [];
    if (hasImage) {
      const category = categories[i % categories.length];
      images.push(...generateImageUrls(category, imageCount));
    }

    posts.push({
      id: 300 + i,
      title: titles[i - 1],
      content: `这是一个关于${categories[i % categories.length]}的热门话题，希望能引发大家的讨论和思考。欢迎分享你的观点和经验！`,
      authorId: randomInt(1, 20),
      authorName: `话题发起者${randomInt(1, 50)}`,
      authorAvatar: `https://i.pravatar.cc/150?img=${randomInt(1, 70)}`,
      isMerchant: Math.random() > 0.6,
      type: 'product',
      contentType: hasImage ? 'image' : 'text',
      category: categories[i % categories.length],
      tags: tagsList[i % tagsList.length],
      images,
      videoUrl: '',
      virtualResources: [],
      price: 0,
      status: 'published',
      createdAt: randomDate(new Date(2025, 0, 1), new Date()).toISOString(),
      viewCount: randomInt(500, 20000),
      likeCount: randomInt(100, 2000),
      commentCount: randomInt(20, 200),
      forwardCount: randomInt(20, 500),
      collectCount: randomInt(30, 400),
      isLiked: false,
      isCollected: false,
      aspectRatio: [0.8, 1.0, 1.2, 1.4][randomInt(0, 3)],
      comments: generateComments(300 + i, randomInt(10, 30)),
    });
  }
  return posts;
}

// 模拟数据生成函数
function generateMockData(type: string) {
  const dataMap: Record<string, any> = {
    normal: generateRecommendPosts(),
    paid_qa: generateKnowledgePosts(),
    bounty: generateBountyPosts(),
    product: generateHotTopicPosts(),
  };
  return dataMap[type] || [];
}

/**
 * 获取帖子列表
 * GET /api/v1/posts
 * Query: {
 *   userId?: number,
 *   type?: string,
 *   category?: string,
 *   excludeType?: string,
 *   page?: number,
 *   pageSize?: number
 * }
 */
router.get('/', (req, res) => {
  try {
    const { type, category, excludeType, page = 1, pageSize = 20 } = req.query;

    // 获取对应类型的数据
    let posts: any[] = [];
    
    if (type && String(type) !== 'all') {
      posts = generateMockData(String(type));
    } else {
      // 获取所有类型的数据
      const allTypes = ['normal', 'paid_qa', 'bounty', 'product'];
      allTypes.forEach(t => {
        posts = posts.concat(generateMockData(t));
      });
    }

    // 如果需要排除特定类型
    if (excludeType) {
      const excludeTypes = Array.isArray(excludeType) 
        ? excludeType.map(String)
        : [String(excludeType)];
      posts = posts.filter((post: any) => !excludeTypes.includes(post.type));
    }

    // 分页
    const offset = (Number(page) - 1) * Number(pageSize);
    const paginatedPosts = posts.slice(offset, offset + Number(pageSize));

    res.json({
      success: true,
      posts: paginatedPosts,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total: posts.length,
        totalPages: Math.ceil(posts.length / Number(pageSize)),
      },
    });
  } catch (error) {
    console.error('获取帖子列表失败:', error);
    res.status(500).json({ error: '获取帖子列表失败' });
  }
});

/**
 * 获取帖子详情
 * GET /api/v1/posts/:id
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    // 从所有类型中查找帖子
    const allTypes = ['normal', 'paid_qa', 'bounty', 'product'];
    let post: any = null;
    
    for (const type of allTypes) {
      const posts = generateMockData(type);
      post = posts.find((p: any) => p.id === Number(id));
      if (post) break;
    }

    if (!post) {
      return res.status(404).json({ error: '帖子不存在' });
    }

    res.json({
      success: true,
      post: {
        ...post,
        isLiked: false,
        isCollected: false,
        isFollowing: false,
      }
    });
  } catch (error) {
    console.error('获取帖子详情失败:', error);
    res.status(500).json({ error: '获取帖子详情失败' });
  }
});

/**
 * 关注/取消关注用户
 * POST /api/v1/users/:id/follow
 * Body: { currentUserId: number }
 */
router.post('/:id/follow', (req, res) => {
  try {
    const { id } = req.params;
    const { currentUserId } = req.body;

    // 模拟关注操作
    res.json({
      success: true,
      message: '关注成功',
      isFollowing: true,
    });
  } catch (error) {
    console.error('关注操作失败:', error);
    res.status(500).json({ error: '关注操作失败' });
  }
});

export default router;
