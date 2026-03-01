#!/usr/bin/env node
/**
 * 主程序入口
 */
import { EconomicDataFetcher } from './fetcher.js';
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
  let outputFile = null;

  // 解析输出文件名
  const outputIndex = args.indexOf('--output') || args.indexOf('-o');
  if (outputIndex !== -1 && args[outputIndex + 1]) {
    outputFile = args[outputIndex + 1];
  }

  // 创建抓取器
  const fetcher = new EconomicDataFetcher();

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
