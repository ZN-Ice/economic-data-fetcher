#!/usr/bin/env node
/**
 * 主程序入口
 */
import { EconomicDataFetcher, fetchFocusStocks } from './fetcher.js';
import { saveToJSON } from './utils.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const save = args.includes('--save') || args.includes('-s');
  const printOnly = args.includes('--print-only');
  const showStocks = args.includes('--stocks') || args.includes('-st');
  let outputFile = null;
  let usApiKey = null;
  let goldApiKey = null;

  // 解析参数
  const usKeyIndex = args.indexOf('--us-api-key');
  if (usKeyIndex !== -1 && args[usKeyIndex + 1]) {
    usApiKey = args[usKeyIndex + 1];
  }

  const goldKeyIndex = args.indexOf('--gold-api-key');
  if (goldKeyIndex !== -1 && args[goldKeyIndex + 1]) {
    goldApiKey = args[goldKeyIndex + 1];
  }

  const outputIndex = args.indexOf('--output') || args.indexOf('-o');
  if (outputIndex !== -1 && args[outputIndex + 1]) {
    outputFile = args[outputIndex + 1];
  }

  // 显示API key状态
  if (usApiKey) console.log(`✅ 使用美股真实API (Alpha Vantage)`);
  else console.log(`⚠️  美股使用模拟数据 (可使用 --us-api-key 参数)`);

  if (goldApiKey) console.log(`✅ 使用黄金真实API (Alpha Vantage)`);
  else console.log(`⚠️  贵金属使用模拟数据 (可使用 --gold-api-key 参数)`);

  // 创建抓取器
  const fetcher = new EconomicDataFetcher(usApiKey, goldApiKey);

  // 显示个股详情
  if (showStocks) {
    const stocks = await fetcher.fetchFocusStocks();
    return 0;
  }

  // 抓取数据
  const report = await fetcher.fetchAllData();

  // 打印报告
  fetcher.printReport(report);

  // 保存文件
  if (save || outputFile) {
    let filename;
    if (outputFile) {
      filename = outputFile;
    } else {
      const dateStr = report.date.toISOString().replace(/[:.]/g, '').substring(0, 15);
      filename = `economic_report_${dateStr}.json`;
    }

    const success = await fetcher.saveReport(report, filename);
    if (success) {
      console.log(`✅ 报告已保存到: ${filename}`);
    } else {
      console.log('❌ 保存报告失败');
      process.exit(1);
    }
  }

  return 0;
}

// 运行主函数
main().catch(error => {
  console.error('❌ 发生错误:', error.message);
  process.exit(1);
});
