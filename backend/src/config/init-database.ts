import { getSqliteDb } from './database';
import { config } from './index';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 初始化数据库表结构
 * 在应用启动时自动执行
 */
export const initDatabaseTables = async () => {
  console.log('🔧 检查并初始化数据库表...');
  
  try {
    // 只在 SQLite 模式下自动初始化
    if (config.database.type !== 'sqlite') {
      console.log('ℹ️  PostgreSQL 模式，请手动运行初始化脚本');
      return;
    }
    
    // 读取 SQLite 初始化脚本
    const initScriptPath = path.resolve(__dirname, '../../database/init-sqlite.sql');
    
    if (!fs.existsSync(initScriptPath)) {
      console.log('⚠️  未找到初始化脚本，跳过自动建表');
      return;
    }
    
    const initScript = fs.readFileSync(initScriptPath, 'utf-8');
    const db = getSqliteDb();
    
    // 分割 SQL 语句（按分号分隔）
    const statements = initScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // 执行每个 SQL 语句
    for (const statement of statements) {
      // 清理语句：移除前后空白和注释行
      const cleanStatement = statement
        .split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n')
        .trim();
      
      if (cleanStatement.length === 0) {
        continue;
      }
      
      try {
        // 所有初始化语句都使用 run()，因为它们都是 DDL 语句
        const stmt = db.prepare(cleanStatement);
        stmt.run();
      } catch (error: any) {
        // 忽略 "已存在" 错误
        if (error.message?.includes('already exists') || 
            error.message?.includes('duplicate column') ||
            error.message?.includes('no such table: main')) {
          continue;
        }
        // 其他错误也忽略，继续执行
        console.log('⚠️  跳过语句:', error.message?.substring(0, 100));
      }
    }
    
    console.log('✅ 数据库表初始化完成');
  } catch (error: any) {
    console.error('❌ 数据库表初始化失败:', error.message);
    // 不抛出错误，让应用继续运行
  }
};
