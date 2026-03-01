/**
 * 商品API模块 - 获取贵金属、原油等商品数据
 * 注意：当前使用模拟数据，真实API需要API Key
 */
import { CommodityData } from '../models.js';
import { config, randomRange } from '../config.js';
import { getTimestamp } from '../utils.js';

// 日志函数
function log(message) {
  console.log(`[CommodityAPI] ${message}`);
}

/**
 * 商品API类
 */
export class CommodityAPI {
  /**
   * 获取真实黄金价格（使用外部API，需要API Key）
   */
  static async getRealGoldPrice(apiKey = null) {
    if (!apiKey) {
      log('未提供黄金API Key，使用模拟数据');
      return CommodityAPI.getGoldPrice();
    }

    try {
      const url = `https://www.alphavantage.co/query?function=COMMODITY_EXCHANGE_RATE&from_currency=XAU&to_currency=USD&apikey=${apiKey}`;
      const response = await fetch(url, { timeout: config.timeout });
      const data = await response.json();

      if (data['Global Quote']) {
        const price = parseFloat(data['Global Quote']['05. Exchange Rate']);
        return [new CommodityData({
          name: '伦敦金现货',
          symbol: 'XAU',
          price: price,
          unit: '美元/盎司',
          change: 0,
          changePercent: 0,
          exchange: 'Alpha Vantage',
          timestamp: new Date()
        })];
      }

      return CommodityAPI.getGoldPrice();
    } catch (error) {
      log(`获取真实黄金价格失败: ${error.message}`);
      return CommodityAPI.getGoldPrice();
    }
  }

  /**
   * 生成模拟商品数据
   */
  static generateMockCommodity(name, symbol, basePrice, unit) {
    const changePercent = randomRange(-1.5, 1.5);
    const change = basePrice * (changePercent / 100);
    const price = basePrice + change;

    return new CommodityData({
      name,
      symbol,
      price: parseFloat(price.toFixed(2)),
      unit,
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      exchange: '模拟交易所',
      timestamp: new Date()
    });
  }

  /**
   * 获取黄金价格
   */
  static getGoldPrice() {
    const commodities = [
      this.generateMockCommodity('伦敦金现货', 'GC', 5370.87, '美元/盎司'),
      this.generateMockCommodity('上海金AU9999', 'SGE', 560.50, '人民币/克')
    ];

    log(`获取到黄金数据 ${commodities.length} 条（模拟数据）`);
    return commodities;
  }

  /**
   * 获取白银价格
   */
  static getSilverPrice() {
    const commodities = [
      this.generateMockCommodity('伦敦银现货', 'SI', 62.45, '美元/盎司')
    ];

    log(`获取到白银数据 ${commodities.length} 条（模拟数据）`);
    return commodities;
  }

  /**
   * 获取原油价格（布伦特、WTI）
   */
  static getOilPrice() {
    const commodities = [
      this.generateMockCommodity('布伦特原油', 'BRN', 82.45, '美元/桶'),
      this.generateMockCommodity('WTI原油', 'CL', 78.23, '美元/桶')
    ];

    log(`获取到原油数据 ${commodities.length} 条（模拟数据）`);
    return commodities;
  }

  /**
   * 获取所有商品数据
   */
  static getAllCommodities() {
    const goldData = this.getGoldPrice();
    const silverData = this.getSilverPrice();
    const oilData = this.getOilPrice();

    return {
      preciousMetals: [...goldData, ...silverData],
      energy: oilData
    };
  }
}

/**
 * 获取主要商品数据
 */
export function getCommodities() {
  const result = CommodityAPI.getAllCommodities();
  return [...result.preciousMetals, ...result.energy];
}

/**
 * 真实API集成说明：
 *
 * 1. Alpha Vantage（推荐，免费API Key）:
 *    URL: https://www.alphavantage.co/query
 *    黄金: function=COMMODITY_EXCHANGE_RATE&from_currency=XAU&to_currency=USD
 *    白银: function=COMMODITY_EXCHANGE_RATE&from_currency=XAG&to_currency=USD
 *    原油: function=COMMODITY_EXCHANGE_RATE&from_currency=CRUDE&to_currency=USD
 *    免费API Key: https://www.alphavantage.co/support/#api-key
 *    限制: 25 calls/day for free tier
 *
 * 2. 新浪财经期货API:
 *    URL: http://hq.sinajs.cn/list=hf_GC0
 *    - 黄金: hf_GC0
 *    - 白银: hf_SI0
 *    - 原油: hf_CL0
 *    注意: 需要设置User-Agent，可能被限制
 *
 * 3. Trading Economics:
 *    URL: https://tradingeconomics.com/api/
 *    免费版有功能限制
 */
