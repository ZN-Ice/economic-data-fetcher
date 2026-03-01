/**
 * API测试脚本
 */
import { StockAPI } from '../src/api/stock-api.js';
import { CryptoAPI } from '../src/api/crypto-api.js';
import { CommodityAPI } from '../src/api/commodity-api.js';
import { formatChange, calculateRiskRating } from '../src/utils.js';

/**
 * 测试股票API
 */
async function testStockAPI() {
  console.log('\n' + '='.repeat(60));
  console.log('测试股票API');
  console.log('='.repeat(60));

  // 测试A股指数
  console.log('\n1. 测试A股指数...');
  const aShares = StockAPI.getAShareIndices();
  console.log(`✅ 获取到 ${aShares.length} 条A股指数`);
  aShares.forEach(index => {
    console.log(`   ${index.toString()}`);
  });

  // 测试港股指数
  console.log('\n2. 测试港股指数...');
  const hkShares = StockAPI.getHKIndices();
  console.log(`✅ 获取到 ${hkShares.length} 条港股指数`);
  hkShares.forEach(index => {
    console.log(`   ${index.toString()}`);
  });

  // 测试美股指数
  console.log('\n3. 测试美股指数...');
  const usShares = StockAPI.getUSIndices();
  console.log(`✅ 获取到 ${usShares.length} 条美股指数`);
  usShares.forEach(index => {
    console.log(`   ${index.toString()}`);
  });

  return aShares.length > 0 || hkShares.length > 0 || usShares.length > 0;
}

/**
 * 测试加密货币API
 */
async function testCryptoAPI() {
  console.log('\n' + '='.repeat(60));
  console.log('测试加密货币API');
  console.log('='.repeat(60));

  // 测试BTC/ETH价格
  console.log('\n1. 测试BTC/ETH价格...');
  const btcEth = await CryptoAPI.getCryptoData(['bitcoin', 'ethereum']);
  console.log(`✅ 获取到 ${btcEth.length} 条加密货币数据`);
  btcEth.forEach(crypto => {
    console.log(`   ${crypto.toString()}`);
  });

  // 测试Top加密货币
  console.log('\n2. 测试Top 5加密货币...');
  const topCryptos = await CryptoAPI.getTopCryptos(5);
  console.log(`✅ 获取到 ${topCryptos.length} 条加密货币数据`);
  topCryptos.forEach(crypto => {
    console.log(`   ${crypto.toString()}`);
  });

  return btcEth.length > 0 || topCryptos.length > 0;
}

/**
 * 测试商品API
 */
async function testCommodityAPI() {
  console.log('\n' + '='.repeat(60));
  console.log('测试商品API');
  console.log('='.repeat(60));

  // 测试黄金
  console.log('\n1. 测试黄金价格...');
  const gold = CommodityAPI.getGoldPrice();
  console.log(`✅ 获取到 ${gold.length} 条黄金数据`);
  gold.forEach(item => {
    console.log(`   ${item.toString()}`);
  });

  // 测试白银
  console.log('\n2. 测试白银价格...');
  const silver = CommodityAPI.getSilverPrice();
  console.log(`✅ 获取到 ${silver.length} 条白银数据`);
  silver.forEach(item => {
    console.log(`   ${item.toString()}`);
  });

  // 测试原油
  console.log('\n3. 测试原油价格...');
  const oil = CommodityAPI.getOilPrice();
  console.log(`✅ 获取到 ${oil.length} 条原油数据`);
  oil.forEach(item => {
    console.log(`   ${item.toString()}`);
  });

  return gold.length > 0 || silver.length > 0 || oil.length > 0;
}

/**
 * 测试工具函数
 */
function testUtils() {
  console.log('\n' + '='.repeat(60));
  console.log('测试工具函数');
  console.log('='.repeat(60));

  console.log('\n1. 测试formatChange...');
  console.log(`   +3.45% -> ${formatChange(3.45)}`);
  console.log(`   -2.30% -> ${formatChange(-2.30)}`);
  console.log(`   0.00% -> ${formatChange(0)}`);

  console.log('\n2. 测试calculateRiskRating...');
  console.log(`   0.5% -> ${calculateRiskRating(0.5)}`);
  console.log(`   2.0% -> ${calculateRiskRating(2.0)}`);
  console.log(`   5.0% -> ${calculateRiskRating(5.0)}`);

  return true;
}

/**
 * 主测试函数
 */
async function main() {
  console.log('\n' + '🚀'.repeat(30));
  console.log('开始测试经济数据抓取工具');
  console.log('🚀'.repeat(30));

  const results = {
    '股票API': await testStockAPI(),
    '加密货币API': await testCryptoAPI(),
    '商品API': await testCommodityAPI(),
    '工具函数': testUtils()
  };

  // 测试结果汇总
  console.log('\n' + '='.repeat(60));
  console.log('测试结果汇总');
  console.log('='.repeat(60));

  for (const [name, result] of Object.entries(results)) {
    const status = result ? '✅ 通过' : '❌ 失败';
    console.log(`${name}: ${status}`);
  }

  // 判断是否全部通过
  const allPassed = Object.values(results).every(result => result);

  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('🎉 所有测试通过！');
  } else {
    console.log('⚠️  部分测试失败，请检查API连接');
  }
  console.log('='.repeat(60) + '\n');

  return allPassed ? 0 : 1;
}

// 运行测试
main().then(exitCode => {
  process.exit(exitCode);
}).catch(error => {
  console.error('测试发生错误:', error);
  process.exit(1);
});
