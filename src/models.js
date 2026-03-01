/**
 * 数据模型
 */

/**
 * 指数数据模型
 */
export class IndexData {
  constructor(data) {
    this.name = data.name;
    this.code = data.code;
    this.price = data.price;
    this.change = data.change;
    this.changePercent = data.changePercent;
    this.volume = data.volume || 0;
    this.timestamp = data.timestamp || new Date();
  }

  toString() {
    return `${this.name}(${this.code}): ${this.price.toFixed(2)} (${this.changePercent >= 0 ? '+' : ''}${this.changePercent.toFixed(2)}%)`;
  }
}

/**
 * 股票数据模型
 */
export class StockData {
  constructor(data) {
    this.code = data.code;
    this.name = data.name;
    this.price = data.price;
    this.change = data.change;
    this.changePercent = data.changePercent;
    this.volume = data.volume || 0;
    this.timestamp = data.timestamp || new Date();
  }

  toString() {
    return `${this.name}(${this.code}): ${this.price.toFixed(2)} (${this.changePercent >= 0 ? '+' : ''}${this.changePercent.toFixed(2)}%)`;
  }
}

/**
 * 加密货币数据模型
 */
export class CryptoData {
  constructor(data) {
    this.symbol = data.symbol;
    this.name = data.name;
    this.priceUsd = data.priceUsd;
    this.priceCny = data.priceCny;
    this.change24h = data.change24h;
    this.volume24h = data.volume24h;
    this.marketCap = data.marketCap;
    this.timestamp = data.timestamp || new Date();
  }

  toString() {
    return `${this.symbol}: $${this.priceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${this.change24h >= 0 ? '+' : ''}${this.change24h.toFixed(2)}%)`;
  }

  toJSON() {
    return {
      symbol: this.symbol,
      name: this.name,
      priceUsd: this.priceUsd,
      priceCny: this.priceCny,
      change24h: this.change24h
    };
  }
}

/**
 * 商品数据模型
 */
export class CommodityData {
  constructor(data) {
    this.name = data.name;
    this.symbol = data.symbol;
    this.price = data.price;
    this.unit = data.unit;
    this.change = data.change;
    this.changePercent = data.changePercent;
    this.exchange = data.exchange;
    this.timestamp = data.timestamp || new Date();
  }

  toString() {
    return `${this.name}: ${this.price.toFixed(2)} ${this.unit} (${this.changePercent >= 0 ? '+' : ''}${this.changePercent.toFixed(2)}%)`;
  }

  toJSON() {
    return {
      name: this.name,
      symbol: this.symbol,
      price: this.price,
      unit: this.unit,
      change: this.change,
      changePercent: this.changePercent
    };
  }
}

/**
 * 经济报告模型
 */
export class EconomicReport {
  constructor(data) {
    this.date = data.date || new Date();
    this.aShares = data.aShares || [];
    this.hkShares = data.hkShares || [];
    this.usShares = data.usShares || [];
    this.crypto = data.crypto || [];
    this.commodities = data.commodities || [];
    this.globalEvents = data.globalEvents || [];
  }

  toJSON() {
    return {
      date: this.date.toISOString(),
      aShares: this.aShares.map(item => ({
        name: item.name,
        code: item.code,
        price: item.price,
        change: item.change,
        changePercent: item.changePercent
      })),
      hkShares: this.hkShares.map(item => ({
        name: item.name,
        code: item.code,
        price: item.price,
        change: item.change,
        changePercent: item.changePercent
      })),
      usShares: this.usShares.map(item => ({
        name: item.name,
        code: item.code,
        price: item.price,
        change: item.change,
        changePercent: item.changePercent
      })),
      crypto: this.crypto.map(item => item.toJSON()),
      commodities: this.commodities.map(item => item.toJSON()),
      globalEvents: this.globalEvents
    };
  }
}
