import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres@127.0.0.1:5432/myapp'
});

// 帖子标题和内容模板
const postTemplates = [
  // 普通帖子 - 创业经验
  {
    type: 'normal',
    category: 'product_experience',
    titles: [
      '从0到100万用户：我的产品冷启动经验',
      '创业三年，我踩过的10个大坑',
      '如何在没有资源的情况下做增长黑客',
      '我的产品上线第一个月的惨痛教训',
      'SaaS产品如何实现用户留存率提升50%',
      '创业路上的三个关键转折点',
      '为什么我选择放弃稳定工作创业',
      '产品经理必读的5本商业书籍',
      '如何找到你的第一个付费用户',
      '创业团队如何保持高效协作'
    ],
    contents: [
      '分享一下我这几年的创业经验，希望能帮到大家...',
      '今天想聊聊创业过程中遇到的一些问题...',
      '作为一个连续创业者，我想分享一些心得...',
      '这个坑我踩过，希望你们不要再踩...',
      '关于产品运营，我有这几个建议...'
    ]
  },
  // 普通帖子 - 融资经验
  {
    type: 'normal',
    category: 'funding_experience',
    titles: [
      '融资路演的7个黄金法则',
      '如何和投资人谈估值',
      '种子轮融资完全指南',
      '我如何拿到天使轮融资',
      '投资人最看重这三个指标',
      'BP如何写才能打动投资人',
      '融资失败的原因分析',
      '创业公司何时应该融资',
      '如何选择合适的投资人',
      '融资过程中要注意的法律问题'
    ],
    contents: [
      '关于融资，我想分享一些真实的经验...',
      '这是我融资路上的一些心得...',
      '投资人告诉我的那些事儿...',
      '创业融资，这些坑一定要避开...',
      '如何准备一份完美的路演材料...'
    ]
  },
  // 付费问答
  {
    type: 'paid_qa',
    titles: [
      '付费咨询：如何解决用户增长瓶颈',
      '一对一咨询：创业团队搭建建议',
      '付费解答：产品方向选择困惑',
      '深度咨询：融资策略制定',
      '专业咨询：商业模式优化',
      '付费问答：技术架构设计建议',
      '一对一指导：市场营销策略',
      '付费解答：品牌定位问题',
      '深度咨询：团队管理难题',
      '专业咨询：供应链管理经验'
    ],
    contents: [
      '针对您提出的问题，我给出以下建议...',
      '这个问题我见过很多次，解决方案是...',
      '根据我的经验，应该这样处理...',
      '这是一个经典问题，我的建议是...',
      '关于这个问题，我有以下几点思考...'
    ],
    prices: [9.9, 19.9, 29.9, 49.9, 99, 199]
  },
  // 悬赏帖子
  {
    type: 'bounty',
    titles: [
      '悬赏寻找优秀的UI设计师',
      '悬赏：产品推广方案征集',
      '寻找有经验的Java开发工程师',
      '悬赏：品牌Logo设计方案',
      '寻找资深前端开发工程师',
      '悬赏：市场调研报告撰写',
      '寻找专业的视频剪辑师',
      '悬赏：商业计划书撰写',
      '寻找有经验的产品经理',
      '悬赏：技术方案评审'
    ],
    contents: [
      '我们需要一个优秀的UI设计师，要求...',
      '如果您能提供好的推广方案，我们愿意...',
      '寻找一位有经验的开发工程师...',
      '我们的项目需要一个Logo设计师...',
      '如果您有相关经验，欢迎联系我们...'
    ],
    prices: [99, 199, 299, 499, 999, 1999]
  },
  // 产品推广（虚拟资料）
  {
    type: 'product',
    titles: [
      '创业工具包：100+实用工具合集',
      '创业手册：从0到1完整指南',
      '产品运营SOP：全套流程文档',
      '商业计划书模板：专业级BP',
      '用户增长策略：实操案例集',
      '融资PPT模板：100页精美模板',
      '团队管理工具包：HR必备',
      '市场营销方案：完整执行手册',
      '品牌定位指南：方法论+案例',
      '技术架构方案：大厂经验分享'
    ],
    contents: [
      '这份工具包包含了我多年来积累的所有实用工具...',
      '这是我创业过程中总结的完整指南...',
      '这套SOP流程可以直接复制使用...',
      '专业级BP模板，助你轻松融资...',
      '50+真实案例，手把手教你做用户增长...'
    ],
    prices: [19.9, 29.9, 49.9, 99, 199, 299],
    hasFile: true
  }
];

// 随机数生成器
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 生成随机帖子
async function generatePosts() {
  console.log('开始生成帖子数据...');

  // 先检查用户数量，不足则创建
  const userResult = await pool.query('SELECT COUNT(*) FROM users');
  const userCount = parseInt(userResult.rows[0].count);
  let userIds: number[] = [];

  if (userCount < 20) {
    console.log('创建测试用户...');
    for (let i = 0; i < 20; i++) {
      const isMerchant = i < 5; // 前5个是商家
      const result = await pool.query(
        `INSERT INTO users (phone, username, password, is_merchant, merchant_time, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING id`,
        [
          `138000000${i.toString().padStart(3, '0')}`,
          `用户${i + 1}`,
          'hashed_password',
          isMerchant,
          isMerchant ? new Date() : null
        ]
      );
      userIds.push(result.rows[0].id);
    }
  } else {
    const result = await pool.query('SELECT id FROM users LIMIT 20');
    userIds = result.rows.map(r => r.id);
  }

  console.log(`可用用户数：${userIds.length}`);

  // 生成100条帖子
  const posts: any[] = [];

  for (let i = 0; i < 100; i++) {
    const template = randomChoice(postTemplates);
    const title = randomChoice(template.titles);
    const content = randomChoice(template.contents) + '\n\n' + '这是一段详细的内容描述...'.repeat(randomInt(3, 8));
    const userId = randomChoice(userIds);
    const mediaType = randomChoice(['text', 'image', 'video']);
    const likeCount = randomInt(0, 500);
    const collectCount = randomInt(0, 200);
    const commentCount = randomInt(0, 100);
    const shareCount = randomInt(0, 50);

    let fileUrl = null;
    let price = 0;

    // 产品推广类型需要商家才能发布
    if (template.type === 'product') {
      const userResult = await pool.query('SELECT is_merchant FROM users WHERE id = $1', [userId]);
      if (userResult.rows[0].is_merchant) {
        fileUrl = `https://example.com/files/product_${i}.zip`;
        price = randomChoice(template.prices || [19.9]);
      } else {
        // 非商家不能发布产品推广，转为普通帖子
        continue;
      }
    } else if (template.type === 'paid_qa' || template.type === 'bounty') {
      price = randomChoice(template.prices || [9.9]);
    }

    let imageUrls = null;
    let videoUrl = null;

    if (mediaType === 'image') {
      const numImages = randomInt(1, 4);
      imageUrls = [];
      for (let j = 0; j < numImages; j++) {
        imageUrls.push(`https://picsum.photos/800/600?random=${i}_${j}`);
      }
    } else if (mediaType === 'video') {
      videoUrl = `https://example.com/videos/video_${i}.mp4`;
    }

    const post = {
      user_id: userId,
      title,
      content,
      post_type: template.type,
      media_type: mediaType,
      like_count: likeCount,
      collect_count: collectCount,
      comment_count: commentCount,
      share_count: shareCount,
      image_urls: imageUrls,
      video_url: videoUrl,
      file_url: fileUrl,
      price: price,
      status: 1, // 已发布
      create_time: new Date(Date.now() - randomInt(0, 30 * 24 * 60 * 60 * 1000)).toISOString() // 30天内
    };

    posts.push(post);
  }

  console.log(`生成${posts.length}条帖子数据`);

  // 批量插入帖子
  for (const post of posts) {
    await pool.query(
      `INSERT INTO posts (
        user_id, title, content, post_type, media_type,
        like_count, collect_count, comment_count, share_count,
        image_urls, video_url, file_url, price, status, create_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        post.user_id, post.title, post.content, post.post_type, post.media_type,
        post.like_count, post.collect_count, post.comment_count, post.share_count,
        JSON.stringify(post.image_urls), post.video_url, post.file_url, post.price, post.status, post.create_time
      ]
    );
  }

  console.log('帖子数据插入完成');

  // 生成点赞数据
  console.log('生成点赞数据...');
  const postsResult = await pool.query('SELECT id FROM posts LIMIT 50');
  const postIds = postsResult.rows.map(r => r.id);

  for (const postId of postIds) {
    const likeCount = randomInt(0, 50);
    for (let i = 0; i < likeCount; i++) {
      const userId = randomChoice(userIds);
      try {
        await pool.query(
          `INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT (post_id, user_id) DO NOTHING`,
          [postId, userId]
        );
      } catch (e) {
        // 忽略重复
      }
    }
  }

  console.log('点赞数据生成完成');

  // 生成收藏数据
  console.log('生成收藏数据...');
  for (const postId of postIds.slice(0, 30)) {
    const collectCount = randomInt(0, 30);
    for (let i = 0; i < collectCount; i++) {
      const userId = randomChoice(userIds);
      try {
        await pool.query(
          `INSERT INTO post_collects (post_id, user_id) VALUES ($1, $2) ON CONFLICT (post_id, user_id) DO NOTHING`,
          [postId, userId]
        );
      } catch (e) {
        // 忽略重复
      }
    }
  }

  console.log('收藏数据生成完成');

  // 生成评论数据
  console.log('生成评论数据...');
  const comments = [
    '非常有用的分享，感谢！',
    '学到了很多，收藏了',
    '这个观点很新颖',
    '同意楼上的说法',
    '我也遇到过类似问题',
    '太棒了，希望能更新更多',
    '有具体的案例吗？',
    '请问可以详细说一下吗？',
    '这个方法太实用了',
    '期待后续内容'
  ];

  for (const postId of postIds.slice(0, 40)) {
    const commentCount = randomInt(0, 20);
    for (let i = 0; i < commentCount; i++) {
      const userId = randomChoice(userIds);
      const content = randomChoice(comments);
      await pool.query(
        `INSERT INTO post_comments (post_id, user_id, content, like_count, create_time)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          postId,
          userId,
          content,
          randomInt(0, 20),
          new Date(Date.now() - randomInt(0, 7 * 24 * 60 * 60 * 1000)).toISOString()
        ]
      );
    }
  }

  console.log('评论数据生成完成');

  // 更新帖子的统计数据
  console.log('更新帖子统计数据...');
  await pool.query(`
    UPDATE posts
    SET
      like_count = (SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id = posts.id),
      collect_count = (SELECT COUNT(*) FROM post_collects WHERE post_collects.post_id = posts.id),
      comment_count = (SELECT COUNT(*) FROM post_comments WHERE post_comments.post_id = posts.id)
  `);

  console.log('所有数据生成完成！');
}

// 执行
generatePosts().catch(console.error).then(() => {
  process.exit(0);
});
