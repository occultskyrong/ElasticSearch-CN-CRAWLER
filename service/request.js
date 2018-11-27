// TODO:分页请求数据，确定分页方式、链接和总页数
// TODO:解析dom结构获取数据，下探文章详情页

const request = require('request-promise');

const { target: { host, url } } = require('../config');

/**
 * 请求 - 分页 - 信息
 * @param {string} module 模块
 * @param {number} page 分页页数
 */
async function readPage(module, page) {
  if (!(module in url)) { throw new Error('未找到此模块'); }
  const urlParams = url[module]; // 目标url参数
  const requestUrl = `${host}${urlParams}${page}`; // 请求地址
  const response = await request(requestUrl); // 发起请求
  return response;
}

module.exports = {
  readPage,
};
