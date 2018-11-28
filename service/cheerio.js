/**
 * 解析dom
 */

const cheerio = require('cheerio');

/**
 * 使用正则表达式获取数据
 * @param {*} pattern 正则表达式
 * @param {*} str 原始字符串
 */
const getDataByReg = (pattern, str) => {
  const reg = new RegExp(pattern);
  const arr = reg.exec(str);
  if (arr && arr instanceof Array && arr.length > 0) { return parseInt(arr[1], 10); }
  return null;
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
    const content = $(element).find('.aw-question-content')[0];
    const link = $(content).find('h4 > a')[0];
    const doc = $(content).find('p')[0];
    const author = $(element).find('a.aw-user-name')[0];
    const statistics = $($(doc).find('span.text-color-999')[0])[0].children[0].data;
    const question = {
      author: {
        id: $(author)[0].attribs['data-id'], // 作者编号
      },
      href: $(link)[0].attribs.href, // 链接
      title: $(link)[0].children[0].data, // 标题
      follow: {
        count: getDataByReg('(\\d+) 人关注', statistics) || 0,
      },
      comment: {
        count: getDataByReg('(\\d+) 个回复', statistics) || getDataByReg('(\\d+) 个评论', statistics) || 0,
      },
      read: {
        count: getDataByReg('(\\d+) 次浏览', statistics) || 0,
      },
    };
    questions.push(question);
  });
  return questions;
}

module.exports = {
  analysisQuestionPage,
};
