/**
 * 工具函数
 */
import { promises as fs } from 'fs';
import path from 'path';

/**
 * 格式化数字
 */
export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined) return 'N/A';
  return value.toFixed(decimals);
}

/**
 * 格式化涨跌幅
 */
export function formatChange(value, withSign = true) {
  if (value === null || value === undefined) return 'N/A';
  const sign = value > 0 && withSign ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * 保存数据到JSON文件
 */
export async function saveToJSON(data, filename) {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    await fs.writeFile(filename, jsonData, 'utf-8');
    console.log(`✅ 数据已保存到: ${filename}`);
    return true;
  } catch (error) {
    console.error(`❌ 保存JSON文件失败: ${error.message}`);
    return false;
  }
}

/**
 * 从JSON文件加载数据
 */
export async function loadFromJSON(filename) {
  try {
    const data = await fs.readFile(filename, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`❌ 加载JSON文件失败: ${error.message}`);
    return null;
  }
}

/**
 * 获取当前时间戳字符串
 */
export function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * 计算风险等级
 */
export function calculateRiskRating(changePercent) {
  const absChange = Math.abs(changePercent);
  if (absChange < 1) return '低';
  if (absChange < 3) return '中';
  return '高';
}

/**
 * 格式化大数字
 */
export function formatLargeNumber(value) {
  if (value === null || value === undefined) return 'N/A';

  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }
  return value.toFixed(2);
}

/**
 * 延迟函数（用于重试）
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 生成随机数
 */
export function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}
