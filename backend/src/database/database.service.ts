import { Injectable, OnModuleInit } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
require('dotenv').config();

@Injectable()
export class DatabaseService implements OnModuleInit {
  private pool: mysql.Pool;

  constructor() {
    console.log('DEBUG DB CONFIG:', {
      host: process.env.MYSQLHOST,
      port: process.env.MYSQLPORT,
      user: process.env.MYSQLUSER,
      database: process.env.MYSQLDATABASE,
    });

    this.pool = mysql.createPool({
      host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306'),
      user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
      password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
      database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'vexa_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4',
    });
  }

  async onModuleInit() {
    try {
      const conn = await this.pool.getConnection();
      console.log('✅ Conectado a MySQL correctamente');
      conn.release();
    } catch (err) {
      console.error('❌ Error al conectar a MySQL:', err.message);
    }
  }

  query(sql: string, params?: any[]): Promise<any> {
    return this.pool.query(sql, params);
  }

  async getConnection(): Promise<mysql.PoolConnection> {
    return this.pool.getConnection();
  }

  async end() {
    return this.pool.end();
  }
}
