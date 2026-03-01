/**
 * 加密货币API模块 - 使用CoinGecko获取加密货币数据
 */
import axios from 'axios';
import { CryptoData } from '../models.js';
import { config } from '../config.js';
import { getTimestamp } from '../utils.js';

// 日志函数
function log(message) {
  console.log(`[CryptoAPI] ${message}`);
}

/**
 * 加密货币API类
 */
export class CryptoAPI {
  /**
   * 获取单个加密货币价格
   */
  static async getCryptoPrice(symbol, currency = 'usd') {
    try {
      const url = `${config.coingeckoBaseUrl}/simple/price`;
      const params = {
        ids: symbol,
        vs_currencies: currency
      };

      const response = await axios.get(url, { params, timeout: config.timeout });
      const data = response.data;

      return data[symbol]?.[currency];
    } catch (error) {
      log(`获取${symbol}价格失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 获取多个加密货币的详细数据
   */
  static async getCryptoData(coinIds) {
    const cryptoList = [];

    try {
      const url = `${config.coingeckoBaseUrl}/coins/markets`;
      const params = {
        vs_currency: 'usd',
        ids: coinIds.join(','),
        order: 'market_cap_desc',
        per_page: coinIds.length,
        page: 1,
        sparkline: 'false'
      };

      const response = await axios.get(url, { params, timeout: config.timeout });
      const data = response.data;

      for (const item of data) {
        const crypto = new CryptoData({
          symbol: item.symbol.toUpperCase(),
          name: item.name,
          priceUsd: item.current_price,
          priceCny: item.current_price * config.usdToCny,
          change24h: item.price_change_percentage_24h || 0,
          volume24h: item.total_volume || 0,
          marketCap: item.market_cap || 0
        });

        cryptoList.push(crypto);
      }

      log(`获取到加密货币数据 ${cryptoList.length} 条`);
      return cryptoList;
    } catch (error) {
      log(`获取加密货币数据失败: ${error.message}`);
      return [];
    }
  }

  /**
   * 获取市值前N的加密货币
   */
  static async getTopCryptos(limit = 10) {
    const cryptoList = [];

    try {
      const url = `${config.coingeckoBaseUrl}/coins/markets`;
      const params = {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: limit,
        page: 1,
        sparkline: 'false'
      };

      const response = await axios.get(url, { params, timeout: config.timeout });
      const data = response.data;

      for (const item of data) {
        const crypto = new CryptoData({
          symbol: item.symbol.toUpperCase(),
          name: item.name,
          priceUsd: item.current_price,
          priceCny: item.current_price * config.usdToCny,
          change24h: item.price_change_percentage_24h || 0,
          volume24h: item.total_volume || 0,
          marketCap: item.market_cap || 0
        });

        cryptoList.push(crypto);
      }

      log(`获取到Top ${limit}加密货币 ${cryptoList.length} 条`);
      return cryptoList;
    } catch (error) {
      log(`获取Top加密货币失败: ${error.message}`);
      return [];
    }
  }
}

/**
 * 获取主要加密货币数据
 */
export async function getMainCryptos() {
  const coinIds = ['bitcoin', 'ethereum', 'binancecoin', 'solana', 'ripple'];
  return await CryptoAPI.getCryptoData(coinIds);
}

/**
 * 获取BTC和ETH数据
 */
export async function getBtcEth() {
  const coinIds = ['bitcoin', 'ethereum'];
  return await CryptoAPI.getCryptoData(coinIds);
}

/**
 * CoinGecko API 说明:
 *
 * - 免费限制: 10-50 calls/minute
 * - 无需API Key
 * - 文档: https://www.coingecko.com/en/api
 *
 * 主要端点:
 * - GET /simple/price - 获取简单价格
 * - GET /coins/markets - 获取市场数据
 * - GET /coins/{id} - 获取币种详情
 */
