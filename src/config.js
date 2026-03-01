/**
 * 配置文件
 */
export const config = {
  // CoinGecko API
  coingeckoBaseUrl: 'https://api.coingecko.com/api/v3',

  // Binance API
  binanceBaseUrl: 'https://api.binance.com/api/v3',

  // 请求超时时间（毫秒）
  timeout: 10000,

  // 重试次数
  maxRetries: 3,

  // HTTP User-Agent
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',

  // 美元兑人民币汇率（固定汇率，实际可调用汇率API）
  usdToCny: 7.2
};

/**
 * 生成随机数
 */
export function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}
