/**
 * 股票API模块 - 获取A股、港股、美股数据
 */
import axios from 'axios';
import { IndexData, StockData } from '../models.js';
import { config, randomRange } from '../config.js';
import { getTimestamp } from '../utils.js';

// 日志函数
function log(message) {
  console.log(`[StockAPI] ${message}`);
}

/**
 * 股票API类
 */
export class StockAPI {
  /**
   * 生成模拟指数数据
   */
  static generateMockIndexData(name, basePrice) {
    const changePercent = randomRange(-2.0, 2.0);
    const change = basePrice * (changePercent / 100);
    const price = basePrice + change;

    return new IndexData({
      name,
      code: `MOCK_${name.substring(0, 2)}`,
      price: parseFloat(price.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume: Math.floor(randomRange(1000000000, 5000000000))
    });
  }

  /**
   * 获取A股指数实时行情
   */
  static getAShareIndices() {
    const indices = [
      this.generateMockIndexData('上证指数', 3245.67),
      this.generateMockIndexData('深证成指', 10892.33),
      this.generateMockIndexData('创业板指', 2156.89)
    ];

    log(`获取到A股指数 ${indices.length} 条（模拟数据）`);
    return indices;
  }

  /**
   * 获取港股指数实时行情
   */
  static getHKIndices() {
    const indices = [
      this.generateMockIndexData('恒生指数', 18765.22),
      this.generateMockIndexData('恒生科技指数', 3892.45)
    ];

    log(`获取到港股指数 ${indices.length} 条（模拟数据）`);
    return indices;
  }

  /**
   * 获取美股指数实时行情
   */
  static getUSIndices() {
    const indices = [
      this.generateMockIndexData('标普500', 4856.33),
      this.generateMockIndexData('纳斯达克', 15234.56),
      this.generateMockIndexData('道琼斯', 37890.12)
    ];

    log(`获取到美股指数 ${indices.length} 条（模拟数据）`);
    return indices;
  }

  /**
   * 获取个股详情
   */
  static getStockDetail(stockCode, market = 'CN') {
    const changePercent = randomRange(-5.0, 5.0);
    const basePrice = randomRange(10, 100);
    const change = basePrice * (changePercent / 100);

    return new StockData({
      code: stockCode,
      name: `模拟股票${stockCode}`,
      price: parseFloat(basePrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume: Math.floor(randomRange(1000000, 10000000))
    });
  }
}

/**
 * 获取所有指数数据
 */
export function getAllIndices() {
  return {
    aShares: StockAPI.getAShareIndices(),
    hkShares: StockAPI.getHKIndices(),
    usShares: StockAPI.getUSIndices()
  };
}

/**
 * 真实API集成说明：
 *
 * 1. 腾讯财经API:
 *    URL: http://qt.gtimg.cn/
 *    示例: http://qt.gtimg.cn/q=sh000001,sz399001
 *    注意: 需要设置User-Agent
 *
 * 2. 新浪财经API:
 *    URL: http://hq.sinajs.cn/list=sh000001
 *    注意: 可能有反爬虫限制
 *
 * 3. Yahoo Finance (使用axios):
 *    URL: https://query1.finance.yahoo.com/v8/finance/chart/^GSPC
 *    注意: 需要处理CORS
 *
 * 4. 东方财富API:
 *    URL: http://push2.eastmoney.com/api/qt/stock/get
 *    注意: 免费但需要处理反爬虫
 */
