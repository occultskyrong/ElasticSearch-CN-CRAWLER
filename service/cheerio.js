/**
 * 解析dom
 */

const cheerio = require('cheerio');

/**
 * 使用正则表达式 - 获取 - 数据
 * @param {string} pattern 正则表达式
 * @param {string} str 原始字符串
 * @param {boolean} isNumber 是否是数字
 */
const getDataByReg = (pattern, str, isNumber = true) => {
  const reg = new RegExp(pattern);
  const arr = reg.exec(str);
  if (arr && arr instanceof Array && arr.length > 0) {
    return isNumber ? parseInt(arr[1], 10) : arr[1];
  }
  return null;
};

/**
 * 使用正则表达式 - 获取 - 时间
 * @param {string} str 原始字符串
 */
const getDateByReg = (str) => {
  try {
    const dayArr = /(\d+)年(\d+)月(\d+)日/.exec(str);
    if (dayArr && dayArr instanceof Array && dayArr.length > 0) {
      const [, year, month, day] = dayArr;
      return new Date(year, month, day);
    }
    const timeArr = /(\d+)-(\d+)-(\d+) (\d+):(\d+)/.exec(str);
    if (timeArr && timeArr instanceof Array && timeArr.length > 0) {
      const [, year, month, day, hour, minute] = timeArr;
      return new Date(year, month, day, hour, minute);
    }
    const daysArr = /(\d+)\s*天前/.exec(str);
    if (daysArr && daysArr instanceof Array && daysArr.length > 0) {
      const days = daysArr[1];
      return new Date(new Date().getTime() - (days * 86400000));
    }
    const hoursArr = /(\d+)\s*小时前/.exec(str);
    if (hoursArr && hoursArr instanceof Array && hoursArr.length > 0) {
      const hours = hoursArr[1];
      return new Date(new Date().getTime() - (hours * 3600000));
    }
    const minutesArr = /(\d+)\s*分钟前/.exec(str);
    if (minutesArr && minutesArr instanceof Array && minutesArr.length > 0) {
      const minutes = minutesArr[1];
      return new Date(new Date().getTime() - (minutes * 60000));
    }
    const secondsArr = /(\d+)\s*秒前/.exec(str);
    if (secondsArr && secondsArr instanceof Array && secondsArr.length > 0) {
      const seconds = secondsArr[1];
      return new Date(new Date().getTime() - (seconds * 1000));
    }
  } catch (e) {
    console.error(e);
  }
  return '';
};

/**
 * 解析 - question - 页面结构
 * @param {*} html 页面html结构
 */
async function analysisQuestionPage(html) {
  const $ = cheerio.load(html);
  const eles = $('.aw-common-list').find('.aw-item');
  const questions = [];
  eles.each((index, element) => {
    const topicId = $(element).get(0).attribs['data-topic-id'];
    const content = $(element).find('.aw-question-content').get(0);
    const link = $(content).find('h4 > a').get(0);
    const { href } = $(link).get(0).attribs; // 链接
    const module = getDataByReg('\\/(\\w+)\\/\\d+', href, false); // 模块
    const id = getDataByReg('\\/(\\d+)', href); // 编号
    const doc = $(content).find('p').get(0);
    const author = $(element).find('a.aw-user-name').get(0);
    const statistics = $($(doc).find('span.text-color-999')[0]).get(0).children[0].data;
    const updatedAt = getDateByReg(statistics); // 提取时间
    const question = {
      author: {
        id: parseInt($(author)[0].attribs['data-id'], 10), // 作者编号
      },
      comment: {
        count: getDataByReg('(\\d+) 个回复', statistics) || getDataByReg('(\\d+) 个评论', statistics) || 0,
      },
      follow: {
        count: getDataByReg('(\\d+) 人关注', statistics) || 0,
      },
      href,
      id,
      module,
      read: {
        count: getDataByReg('(\\d+) 次浏览', statistics) || 0,
      },
      title: $(link)[0].children[0].data, // 标题
      topic: topicId.split(',').map(item => parseInt(item, 10)).filter(item => !!item),
      updatedAt,
    };
    questions.push(question);
  });
  return questions;
}

/**
 * 解析 - question - 详情结构
 * @param {string} html 详情页面html结构
 * @param {object} obj 原始值
 */
async function analysisQuestionDetail(html, obj) {
  const detail = obj;
  const $ = cheerio.load(html);
  // console.info($('meta[name="keywords"]').get(0).attribs.content, '---');
  // console.info($('.aw-question-detail .text-color-999').length);
  detail.author.name = $('.aw-user-name').get(0).children[0].data;
  // 信息行
  const info = $('.aw-question-detail .text-color-999').get(0).children[2].data.replace(/\s+/g, '');
  const createdAt = getDateByReg(info) || ''; // 发布时间
  const description = $('meta[name="description"]').get(0).attribs.content.replace(/\s+/g, ''); // 文档描述
  const keywords = $('meta[name="keywords"]').get(0).attribs.content.split(','); // 关键词
  return Object.assign(detail, {
    createdAt,
    description,
    keywords,
  });
}

module.exports = {
  analysisQuestionDetail,
  analysisQuestionPage,
};
