import { query } from './database';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 初始化数据库表结构
 * 在应用启动时自动执行
 */
export const initDatabaseTables = async () => {
  console.log('🔧 检查并初始化数据库表...');
  
  try {
    // 读取 SQLite 初始化脚本
    const initScriptPath = path.resolve(__dirname, '../../database/init-sqlite.sql');
    
    if (!fs.existsSync(initScriptPath)) {
      console.log('⚠️  未找到初始化脚本，跳过自动建表');
      return;
    }
    
    const initScript = fs.readFileSync(initScriptPath, 'utf-8');
    
    // 分割 SQL 语句（按分号分隔）
    const statements = initScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    // 执行每个 SQL 语句
    for (const statement of statements) {
      // 跳过注释和空语句
      if (statement.startsWith('--') || statement.length === 0) {
        continue;
      }
      
      try {
        await query(statement);
      } catch (error: any) {
        // 忽略 "已存在" 错误
        if (error.message?.includes('already exists') || 
            error.message?.includes('duplicate column') ||
            error.message?.includes('no such table: main')) {
          continue;
        }
        // 其他错误抛出
        throw error;
      }
    }
    
    console.log('✅ 数据库表初始化完成');
  } catch (error: any) {
    console.error('❌ 数据库表初始化失败:', error.message);
    // 不抛出错误，让应用继续运行（可能是权限问题）
  }
};
