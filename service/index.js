// # TODO: 定时任务+sleep延时请求，保证时间间隔
// # TODO: 分页请求数据，确定分页方式、链接和总页数
// # TODO: 解析dom结构获取数据，下探文章详情页
// # TODO: 根据详情页信息确定数据（文章/问题ID、标题、作者、开始时间、关注数量、评论数量、浏览数量）
// # TODO: 写入ES
// # TODO: 分析数据、产出可视化


const { readListPage } = require('./request');
const { analysisQuestionPage } = require('./cheerio');

readListPage('question', 1)
  .then(analysisQuestionPage)
  .then(console.info)
  .catch(console.error)
  .then(() => process.exit(1));
