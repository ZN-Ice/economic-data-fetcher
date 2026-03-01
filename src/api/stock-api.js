/**
 * 股票API模块 - 使用腾讯财经API获取A股、港股、美股数据
 */
import axios from 'axios';
import { IndexData, StockData } from '../models.js';
import { config } from '../config.js';
import { getTimestamp } from '../utils.js';

// 日志函数
function log(message) {
  console.log(`[StockAPI] ${message}`);
}

/**
 * 解析腾讯财经API返回的数据
 */
function parseTencentData(text) {
  // 格式: v_sh000001="1~名称~代码~当前价~昨收~今开~成交量~..."
  try {
    const matches = text.match(/v_(\w+)="(.+)"/);
    if (!matches) return null;

    const code = matches[1];
    const dataStr = matches[2];
    const values = dataStr.split('~');

    if (values.length < 6) return null;

    const name = values[1] || code;
    const price = parseFloat(values[3]) || 0;
    const prevClose = parseFloat(values[4]) || 0;
    const open = parseFloat(values[5]) || 0;
    const volume = parseFloat(values[6]) || 0;

    if (price === 0 || prevClose === 0) return null;

    const change = price - prevClose;
    const changePercent = (change / prevClose) * 100;

    return {
      name: name.replace(/[\x00-\x1F\x7F-\x9F]/g, ''), // 清除控制字符
      code,
      price,
      change,
      changePercent,
      volume,
      open
    };
  } catch (error) {
    log(`解析数据失败: ${error.message}`);
    return null;
  }
}

/**
 * 股票API类
 */
export class StockAPI {
  /**
   * 获取A股指数实时行情（使用腾讯财经API）
   */
  static async getAShareIndices() {
    const indices = [];

    try {
      const codes = ['sh000001', 'sz399001', 'sz399006'];
      const url = `http://qt.gtimg.cn/q=${codes.join(',')}`;

      const response = await axios.get(url, {
        timeout: config.timeout,
        responseType: 'arraybuffer'
      });

      // 处理GB2312编码
      const iconv = new TextDecoder('gbk');
      const text = iconv.decode(response.data);

      const lines = text.split('\n');

      for (const line of lines) {
        const data = parseTencentData(line);
        if (data) {
          let name = data.name;
          // 根据代码推断名称（中文可能乱码）
          if (data.code === 'sh000001') name = '上证指数';
          else if (data.code === 'sz399001') name = '深证成指';
          else if (data.code === 'sz399006') name = '创业板指';

          indices.push(new IndexData({
            name,
            code: data.code,
            price: data.price,
            change: data.change,
            changePercent: data.changePercent,
            volume: data.volume,
            timestamp: new Date()
          }));
        }
      }

      log(`获取到A股指数 ${indices.length} 条`);
      return indices;
    } catch (error) {
      log(`获取A股指数失败: ${error.message}`);
      return [];
    }
  }

  /**
   * 获取港股指数实时行情
   */
  static async getHKIndices() {
    const indices = [];

    try {
      // 恒生指数: hkHSI, 恒生科技指数: hkHST
      const codes = ['hkHSI', 'hkHST'];
      const url = `http://qt.gtimg.cn/q=${codes.join(',')}`;

      const response = await axios.get(url, {
        timeout: config.timeout,
        responseType: 'arraybuffer'
      });

      const iconv = new TextDecoder('gbk');
      const text = iconv.decode(response.data);
      const lines = text.split('\n');

      for (const line of lines) {
        const data = parseTencentData(line);
        if (data) {
          let name = data.name;
          // 根据代码推断名称
          if (data.code === 'hkHSI') name = '恒生指数';
          else if (data.code === 'hkHST') name = '恒生科技指数';

          indices.push(new IndexData({
            name,
            code: data.code,
            price: data.price,
            change: data.change,
            changePercent: data.changePercent,
            volume: data.volume,
            timestamp: new Date()
          }));
        }
      }

      log(`获取到港股指数 ${indices.length} 条`);
      return indices;
    } catch (error) {
      log(`获取港股指数失败: ${error.message}`);
      return [];
    }
  }

  /**
   * 获取美股指数实时行情（使用Yahoo Finance）
   */
  static async getUSIndices() {
    const indices = [];

    try {
      // Yahoo Finance API
      const codes = ['^GSPC', '^IXIC', '^DJI'];
      const url = 'https://query1.finance.yahoo.com/v8/finance/chart/' + codes.join(',');

      const response = await axios.get(url, {
        timeout: config.timeout,
        headers: {
          'User-Agent': config.userAgent
        }
      });

      const data = response.data;

      // Yahoo Finance返回的数据格式
      const result = data.chart.result;
      if (!result) return indices;

      const tickerMap = {
        '^GSPC': '标普500',
        '^IXIC': '纳斯达克',
        '^DJI': '道琼斯'
      };

      for (const item of result) {
        const ticker = item.meta.symbol;
        const name = tickerMap[ticker] || ticker;

        const quotes = item.indicators.quote[0].close;
        const timestamps = item.timestamp;

        if (quotes && quotes.length > 1 && timestamps && timestamps.length > 1) {
          const price = parseFloat(quotes[quotes.length - 1]);
          const prevClose = parseFloat(quotes[quotes.length - 2]);

          if (price && prevClose && prevClose > 0) {
            const change = price - prevClose;
            const changePercent = (change / prevClose) * 100;

            indices.push(new IndexData({
              name,
              code: ticker,
              price,
              change,
              changePercent,
              volume: 0,
              timestamp: new Date(timestamps[timestamps.length - 1] * 1000)
            }));
          }
        }
      }

      log(`获取到美股指数 ${indices.length} 条`);
      return indices;
    } catch (error) {
      log(`获取美股指数失败: ${error.message}`);
      // 失败时使用模拟数据
      return StockAPI.getMockUSIndices();
    }
  }

  /**
   * 获取模拟美股数据（备用）
   */
  static getMockUSIndices() {
    const basePrices = { '^GSPC': 4856.33, '^IXIC': 15234.56, '^DJI': 37890.12 };
    const tickerMap = {
      '^GSPC': '标普500',
      '^IXIC': '纳斯达克',
      '^DJI': '道琼斯'
    };

    const indices = [];
    for (const [code, basePrice] of Object.entries(basePrices)) {
      const changePercent = (Math.random() * 4 - 2);
      const change = basePrice * (changePercent / 100);
      const price = basePrice + change;

      indices.push(new IndexData({
        name: tickerMap[code],
        code,
        price: parseFloat(price.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        volume: Math.floor(Math.random() * 5000000000),
        timestamp: new Date()
      }));
    }

    log(`使用美股模拟数据 ${indices.length} 条`);
    return indices;
  }

  /**
   * 获取个股详情
   */
  static async getStockDetail(stockCode, market = 'CN') {
    try {
      if (market === 'CN') {
        const code = stockCode.startsWith('6') ? `sh${stockCode}` : `sz${stockCode}`;
        const url = `http://qt.gtimg.cn/q=${code}`;

        const response = await axios.get(url, {
          timeout: config.timeout,
          responseType: 'arraybuffer'
        });

        const iconv = new TextDecoder('gbk');
        const text = iconv.decode(response.data);
        const data = parseTencentData(text);

        if (data) {
          return new StockData({
            code: stockCode,
            name: data.name,
            price: data.price,
            change: data.change,
            changePercent: data.changePercent,
            volume: data.volume,
            timestamp: new Date()
          });
        }
      }

      return null;
    } catch (error) {
      log(`获取股票详情失败: ${error.message}`);
      return null;
    }
  }
}

/**
 * 获取所有指数数据
 */
export async function getAllIndices() {
  return {
    aShares: await StockAPI.getAShareIndices(),
    hkShares: await StockAPI.getHKIndices(),
    usShares: await StockAPI.getUSIndices()
  };
}
