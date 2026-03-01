# 经济数据抓取工具 (Economic Data Fetcher) - Node.js版

一个基于Node.js的经济数据抓取工具，使用免费API获取实时经济数据，包括A股、港股、美股、加密货币、贵金属和原油价格。

## 功能特性

- 📈 **股票行情**: 获取A股（上证、深证、创业板）、港股（恒指、恒生科技）、美股（标普500、纳指、道琼斯）实时指数
- ₿ **加密货币**: 获取比特币、以太坊等主流加密货币价格和涨跌幅
- 💰 **商品价格**: 获取黄金、白银、石油等大宗商品实时价格
- 📊 **统一接口**: 提供简洁统一的API接口
- 💾 **数据导出**: 支持JSON格式数据导出
- 🧪 **完整测试**: 包含完整的测试脚本
- 🚀 **快速运行**: 使用Node.js，运行速度快

## 技术栈

- **Node.js 18+**
- **ES Modules** (ESM)
- **Axios**: HTTP请求库
- **CoinGecko API**: 加密货币数据

## 安装

### 1. 克隆仓库

```bash
cd /home/admin/.openclaw/workspace/feishubot-economist/economic-data-fetcher-nodejs
```

### 2. 安装依赖

```bash
npm install
```

## 使用方法

### 基本使用

```javascript
import { EconomicDataFetcher } from './src/fetcher.js';

// 创建抓取器
const fetcher = new EconomicDataFetcher();

// 抓取所有数据
const report = await fetcher.fetchAllData();

// 打印报告
fetcher.printReport(report);

// 保存到文件
await fetcher.saveReport(report, 'report.json');
```

### 命令行使用

```bash
# 运行测试
npm test

# 抓取并打印数据
npm start

# 保存到JSON文件
node src/main.js --save

# 指定输出文件名
node src/main.js --save --output my_report.json

# 只打印不保存
node src/main.js --print-only
```

### 使用各个API模块

```javascript
import { StockAPI } from './src/api/stock-api.js';
import { CryptoAPI } from './src/api/crypto-api.js';
import { getCommodities } from './src/api/commodity-api.js';

// 获取A股指数
const aShares = StockAPI.getAShareIndices();
console.log(aShares);

// 获取加密货币
const cryptoAPI = new CryptoAPI();
const btcEth = await cryptoAPI.getCryptoData(['bitcoin', 'ethereum']);
console.log(btcEth);

// 获取商品数据
const commodities = getCommodities();
console.log(commodities);
```

## 测试

运行测试脚本验证所有API是否正常工作：

```bash
npm test
```

测试内容包括：
- ✅ A股指数获取
- ✅ 港股指数获取
- ✅ 美股指数获取
- ✅ 加密货币价格获取
- ✅ 黄金价格获取
- ✅ 白银价格获取
- ✅ 原油价格获取
- ✅ 工具函数测试

## 项目结构

```
economic-data-fetcher-nodejs/
├── package.json         # 项目配置
├── README.md           # 项目说明
├── src/                # 源代码
│   ├── main.js        # 主程序入口
│   ├── fetcher.js     # 主抓取逻辑
│   ├── models.js      # 数据模型
│   ├── config.js      # 配置文件
│   ├── utils.js       # 工具函数
│   └── api/          # API模块
│       ├── stock-api.js     # 股票API
│       ├── crypto-api.js    # 加密货币API
│       └── commodity-api.js # 商品API
└── tests/             # 测试模块
    └── test-apis.js  # 测试脚本
```

## API说明

### 免费API使用情况

| 数据类型 | API来源 | 免费额度 | 状态 |
|---------|---------|---------|------|
| A股/港股/美股 | 模拟数据 | N/A | ⚠️ 模拟 |
| 加密货币 | CoinGecko | 10-50 calls/min | ✅ 真实 |
| 商品（黄金/原油） | 模拟数据 | N/A | ⚠️ 模拟 |

### CoinGecko

- 文档: https://www.coingecko.com/en/api
- 免费限制：10-50 calls/minute
- 无需API Key

## 数据模型

### IndexData（指数数据）

```javascript
{
  name: "上证指数",
  code: "000001",
  price: 3245.67,
  change: 12.34,
  changePercent: 0.38,
  volume: 1234567890,
  timestamp: Date
}
```

### CryptoData（加密货币数据）

```javascript
{
  symbol: "BTC",
  name: "Bitcoin",
  priceUsd: 68000.00,
  priceCny: 489600.00,
  change24h: 2.34,
  volume24h: 15000000000,
  marketCap: 1300000000000,
  timestamp: Date
}
```

### CommodityData（商品数据）

```javascript
{
  name: "布伦特原油",
  symbol: "CL",
  price: 82.45,
  unit: "美元/桶",
  change: 0.45,
  changePercent: 0.55,
  exchange: "新浪财经",
  timestamp: Date
}
```

## 开发计划

- [ ] 添加新闻API获取全球经济大事
- [ ] 集成真实的股票和商品API
- [ ] 支持更多加密货币交易所
- [ ] 添加数据图表生成功能
- [ ] 支持WebSocket实时推送
- [ ] 添加历史数据查询功能
- [ ] Web界面开发

## 注意事项

1. **Node.js版本**: 需要Node.js 18+ (支持ESM)
2. **网络连接**: 需要稳定的网络连接访问API
3. **API限制**: CoinGecko有调用频率限制，建议合理使用
4. **数据延迟**: 不同API的数据更新频率不同，部分数据可能有延迟
5. **模拟数据**: 股票和商品数据当前为模拟数据

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！

## 联系方式

- GitHub: https://github.com/ZN-Ice/economic-data-fetcher
- 开发者: ZN-Ice

---

**免责声明**: 本工具仅供学习和研究使用，不构成投资建议。市场有风险，投资需谨慎。
