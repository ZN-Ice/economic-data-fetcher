/**
 * 股票API模块 - 使用腾讯财经API获取A股、港股，真实/模拟美股数据
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

      const iconv = new TextDecoder('gbk');
      const text = iconv.decode(response.data);
      const lines = text.split('\n');

      for (const line of lines) {
        const data = parseTencentData(line);
        if (data) {
          let name = data.name;
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
   * 获取美股指数实时行情（使用真实API或备用）
   */
  static async getUSIndices(apiKey = null) {
    const indices = [];

    try {
      // 优先使用真实API
      if (apiKey) {
        // Alpha Vantage API
        const symbols = ['SPX', 'IXIC', 'DJI'];
        const promises = symbols.map(async (symbol) => {
          try {
            const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
            const response = await fetch(url, { timeout: config.timeout });
            const data = await response.json();

            if (data['Global Quote']) {
              const quote = data['Global Quote'];
              const price = parseFloat(quote['05. Price']);
              const change = parseFloat(quote['09. Change']);
              const changePercent = parseFloat(quote['10. Change Percent'].replace('%', ''));

              const nameMap = { 'SPX': '标普500', 'IXIC': '纳斯达克', 'DJI': '道琼斯' };

              return new IndexData({
                name: nameMap[symbol] || symbol,
                code: symbol,
                price: price,
                change: change,
                changePercent: changePercent,
                volume: 0,
                timestamp: new Date()
              });
            }
          } catch (e) {
            log(`获取${symbol}失败: ${e.message}`);
            return null;
          }
        });

        const results = await Promise.all(promises);
        indices.push(...results.filter(r => r !== null));

        if (indices.length > 0) {
          log(`获取到美股指数 ${indices.length} 条（真实数据）`);
          return indices;
        }
      }

      // 备用：使用模拟数据
      log('美股API不可用，使用模拟数据');
      return StockAPI.getMockUSIndices();
    } catch (error) {
      log(`获取美股指数失败: ${error.message}`);
      return StockAPI.getMockUSIndices();
    }
  }

  /**
   * 获取模拟美股数据
   */
  static getMockUSIndices() {
    const basePrices = { 'SPX': 4856.33, 'IXIC': 15234.56, 'DJI': 37890.12 };
    const tickerMap = { 'SPX': '标普500', 'IXIC': '纳斯达克', 'DJI': '道琼斯' };

    const indices = [];
    for (const [code, basePrice] of Object.entries(basePrices)) {
      const changePercent = randomRange(-2.0, 2.0);
      const change = basePrice * (changePercent / 100);
      const price = basePrice + change;

      indices.push(new IndexData({
        name: tickerMap[code],
        code: code,
        price: parseFloat(price.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        volume: Math.floor(randomRange(1000000000, 5000000000)),
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
      } else if (market === 'HK') {
        const code = stockCode.startsWith('0') || stockCode.startsWith('00') ? `hk${stockCode}` : stockCode;
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

  /**
   * 获取重点个股（腾讯、阿里、茅台）
   */
  static async getFocusStocks() {
    const stocks = [];

    try {
      // 腾讯控股（港股）和贵州茅台（A股）
      const codes = ['hk00700', 'sh600519'];
      const url = `http://qt.gtimg.cn/q=${codes.join(',')}`;

      const response = await axios.get(url, {
        timeout: config.timeout,
        responseType: 'arraybuffer'
      });

      const iconv = new TextDecoder('gbk');
      const text = iconv.decode(response.data);
      const lines = text.split('\n');

      const nameMap = {
        'hk00700': '腾讯控股',
        'sh600519': '贵州茅台'
      };

      for (const line of lines) {
        const data = parseTencentData(line);
        if (data && nameMap[data.code]) {
          stocks.push(new StockData({
            code: data.code,
            name: nameMap[data.code],
            price: data.price,
            change: data.change,
            changePercent: data.changePercent,
            volume: data.volume,
            timestamp: new Date()
          }));
        }
      }

      // 阿里巴巴（美股，使用模拟数据或IEX Cloud）
      // 由于美股API需要API key，暂时使用模拟数据
      const alibabaMock = new StockData({
        code: 'BABA',
        name: '阿里巴巴',
        price: 78.56 + randomRange(-2, 2),
        change: randomRange(-1, 1),
        changePercent: randomRange(-2, 2),
        volume: Math.floor(randomRange(10000000, 50000000)),
        timestamp: new Date()
      });
      stocks.push(alibabaMock);

      log(`获取到重点个股 ${stocks.length} 条（阿里使用美股模拟数据）`);
      return stocks;
    } catch (error) {
      log(`获取重点个股失败: ${error.message}`);
      return [];
    }
  }
}

/**
 * 获取所有指数数据
 */
export async function getAllIndices(usApiKey = null) {
  return {
    aShares: await StockAPI.getAShareIndices(),
    hkShares: await StockAPI.getHKIndices(),
    usShares: await StockAPI.getUSIndices(usApiKey)
  };
}
