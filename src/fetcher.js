/**
 * 经济数据抓取器
 */
import { EconomicReport } from './models.js';
import { StockAPI } from './api/stock-api.js';
import { getMainCryptos } from './api/crypto-api.js';
import { getCommodities } from './api/commodity-api.js';
import { saveToJSON, getTimestamp } from './utils.js';

// 日志函数
function log(message) {
  console.log(`[Fetcher] ${message}`);
}

/**
 * 经济数据抓取器类
 */
export class EconomicDataFetcher {
  constructor(usApiKey = null, goldApiKey = null) {
    this.reportDate = new Date();
    this.usApiKey = usApiKey;
    this.goldApiKey = goldApiKey;
  }

  /**
   * 抓取所有经济数据
   */
  async fetchAllData() {
    log(`开始抓取经济数据 - ${getTimestamp()}`);

    // 股市数据
    log('正在获取股市数据...');
    const aShares = await StockAPI.getAShareIndices();
    const hkShares = await StockAPI.getHKIndices();
    const usShares = await StockAPI.getUSIndices(this.usApiKey);

    // 加密货币数据
    log('正在获取加密货币数据...');
    const crypto = await getMainCryptos();

    // 商品数据
    log('正在获取商品数据...');
    const commodities = getCommodities();

    // 全球经济大事
    const globalEvents = this.getGlobalEvents();

    // 生成报告
    const report = new EconomicReport({
      date: this.reportDate,
      aShares,
      hkShares,
      usShares,
      crypto,
      commodities,
      globalEvents
    });

    log(`数据抓取完成 - A股:${aShares.length} 港股:${hkShares.length} 美股:${usShares.length} 加密货币:${crypto.length} 商品:${commodities.length}`);

    return report;
  }

  /**
   * 获取重点个股数据
   */
  async fetchFocusStocks() {
    log('正在获取重点个股数据...');
    const stocks = await StockAPI.getFocusStocks();

    log(`获取到重点个股 ${stocks.length} 条`);
    return stocks;
  }

  /**
   * 获取全球经济大事
   */
  getGlobalEvents() {
    // TODO: 可以集成新闻API获取实时重大事件
    return [];
  }

  /**
   * 保存报告到文件
   */
  async saveReport(report, filename) {
    const data = report.toJSON();
    return await saveToJSON(data, filename);
  }

  /**
   * 打印报告
   */
  printReport(report) {
    console.log('\n' + '='.repeat(60));
    console.log(`📊 经济数据报告 - ${getTimestamp()}`);
    console.log('='.repeat(60));

    // A股
    if (report.aShares.length > 0) {
      console.log('\n📈 A股指数');
      console.log('-'.repeat(40));
      report.aShares.forEach(index => {
        console.log(`  ${index.toString()}`);
      });
    }

    // 港股
    if (report.hkShares.length > 0) {
      console.log('\n📈 港股指数');
      console.log('-'.repeat(40));
      report.hkShares.forEach(index => {
        console.log(`  ${index.toString()}`);
      });
    }

    // 美股
    if (report.usShares.length > 0) {
      console.log('\n📈 美股指数');
      console.log('-'.repeat(40));
      report.usShares.forEach(index => {
        console.log(`  ${index.toString()}`);
      });
    }

    // 加密货币
    if (report.crypto.length > 0) {
      console.log('\n₿ 加密货币');
      console.log('-'.repeat(40));
      report.crypto.slice(0, 5).forEach(coin => {
        console.log(`  ${coin.toString()}`);
      });
    }

    // 商品
    if (report.commodities.length > 0) {
      console.log('\n💰 商品价格');
      console.log('-'.repeat(40));
      report.commodities.forEach(commodity => {
        console.log(`  ${commodity.toString()}`);
      });
    }

    // 全球事件
    if (report.globalEvents.length > 0) {
      console.log('\n🌍 全球经济大事');
      console.log('-'.repeat(40));
      report.globalEvents.forEach(event => {
        console.log(`  • ${event}`);
      });
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }

  /**
   * 打印个股报告
   */
  printStocks(stocks) {
    console.log('\n' + '='.repeat(60));
    console.log(`📋 重点个股报告 - ${getTimestamp()}`);
    console.log('='.repeat(60));

    stocks.forEach(stock => {
      console.log(`\n  ${stock.name} (${stock.code})`);
      console.log(`  价格: ${stock.price.toFixed(2)}`);
      console.log(`  涨跌: ${stock.change.toFixed(2)} (${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)`);
      console.log(`  成交量: ${(stock.volume / 100000000).toFixed(2)}亿`);
    });

    console.log('\n' + '='.repeat(60) + '\n');
  }
}

/**
 * 抓取并打印数据
 */
export async function fetchAndPrint() {
  const fetcher = new EconomicDataFetcher();
  const report = await fetcher.fetchAllData();
  fetcher.printReport(report);
  return report;
}

/**
 * 抓取并打印重点个股
 */
export async function fetchFocusStocks() {
  const fetcher = new EconomicDataFetcher();
  const stocks = await fetcher.fetchFocusStocks();
  fetcher.printStocks(stocks);
  return stocks;
}

