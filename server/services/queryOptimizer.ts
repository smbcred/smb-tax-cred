import { and, desc, asc, count, max, min, avg, sum } from 'drizzle-orm';
import { queryCache } from '../middleware/caching';

// Query optimization utilities for database operations

// Query builder with automatic optimization
export class OptimizedQueryBuilder {
  private selectFields: string[] = [];
  private whereConditions: any[] = [];
  private orderByFields: any[] = [];
  private limitValue?: number;
  private offsetValue?: number;
  private joinTables: string[] = [];
  private cacheKey?: string;
  private cacheTTL = 5 * 60 * 1000; // 5 minutes default

  select(fields: string[]): this {
    this.selectFields = fields;
    return this;
  }

  where(condition: any): this {
    this.whereConditions.push(condition);
    return this;
  }

  orderBy(field: any, direction: 'asc' | 'desc' = 'asc'): this {
    this.orderByFields.push(direction === 'desc' ? desc(field) : asc(field));
    return this;
  }

  limit(value: number): this {
    this.limitValue = value;
    return this;
  }

  offset(value: number): this {
    this.offsetValue = value;
    return this;
  }

  join(table: string): this {
    this.joinTables.push(table);
    return this;
  }

  cache(key: string, ttl = this.cacheTTL): this {
    this.cacheKey = key;
    this.cacheTTL = ttl;
    return this;
  }

  // Execute optimized query
  async execute<T>(db: any, table: any): Promise<T[]> {
    const cacheKey = this.cacheKey || this.generateCacheKey();
    
    if (this.cacheKey) {
      return queryCache.get(cacheKey, () => this.executeQuery(db, table), this.cacheTTL);
    }
    
    return this.executeQuery(db, table);
  }

  private async executeQuery<T>(db: any, table: any): Promise<T[]> {
    let query = db.select();
    
    if (this.selectFields.length > 0) {
      // Only select specified fields to reduce data transfer
      const selectObject: any = {};
      this.selectFields.forEach(field => {
        selectObject[field] = table[field];
      });
      query = db.select(selectObject);
    } else {
      query = db.select().from(table);
    }

    // Apply WHERE conditions
    if (this.whereConditions.length > 0) {
      const combinedConditions = this.whereConditions.length === 1 
        ? this.whereConditions[0]
        : and(...this.whereConditions);
      query = query.where(combinedConditions);
    }

    // Apply ORDER BY
    if (this.orderByFields.length > 0) {
      query = query.orderBy(...this.orderByFields);
    }

    // Apply LIMIT and OFFSET
    if (this.limitValue !== undefined) {
      query = query.limit(this.limitValue);
    }
    
    if (this.offsetValue !== undefined) {
      query = query.offset(this.offsetValue);
    }

    return query;
  }

  private generateCacheKey(): string {
    const parts = [
      'fields:' + this.selectFields.join(','),
      'where:' + JSON.stringify(this.whereConditions),
      'order:' + this.orderByFields.length,
      'limit:' + this.limitValue,
      'offset:' + this.offsetValue,
    ];
    return parts.join('|');
  }
}

// Pagination optimizer
export class PaginationOptimizer {
  static async paginate<T>(
    db: any,
    table: any,
    options: {
      page: number;
      pageSize: number;
      where?: any;
      orderBy?: any;
      select?: string[];
      cacheKey?: string;
    }
  ): Promise<{
    data: T[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const { page = 1, pageSize = 20, where, orderBy, select, cacheKey } = options;
    const offset = (page - 1) * pageSize;

    // Use cursor-based pagination for better performance on large datasets
    if (page > 100) {
      return this.cursorPaginate(db, table, options);
    }

    const builder = new OptimizedQueryBuilder()
      .limit(pageSize)
      .offset(offset);

    if (select) builder.select(select);
    if (where) builder.where(where);
    if (orderBy) builder.orderBy(orderBy);
    if (cacheKey) builder.cache(`${cacheKey}:page:${page}`);

    // Get total count efficiently
    const totalCountQuery = where 
      ? db.select({ count: count() }).from(table).where(where)
      : db.select({ count: count() }).from(table);

    const [data, totalResult] = await Promise.all([
      builder.execute(db, table),
      totalCountQuery,
    ]);

    const total = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(total / pageSize);

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  private static async cursorPaginate<T>(
    db: any,
    table: any,
    options: any
  ): Promise<any> {
    // Cursor-based pagination implementation
    // More efficient for large offsets
    const { pageSize = 20, where, orderBy, select } = options;
    
    const builder = new OptimizedQueryBuilder()
      .limit(pageSize + 1); // Get one extra to check if there's a next page

    if (select) builder.select(select);
    if (where) builder.where(where);
    if (orderBy) builder.orderBy(orderBy);

    const results = await builder.execute(db, table);
    const hasNext = results.length > pageSize;
    
    if (hasNext) {
      results.pop(); // Remove the extra item
    }

    return {
      data: results,
      pagination: {
        hasNext,
        pageSize,
        cursor: results.length > 0 ? results[results.length - 1].id : null,
      },
    };
  }
}

// Aggregate query optimizer
export class AggregateOptimizer {
  static async getStats(
    db: any,
    table: any,
    field: any,
    options: {
      where?: any;
      groupBy?: any;
      cacheKey?: string;
      cacheTTL?: number;
    } = {}
  ): Promise<{
    count: number;
    sum: number;
    avg: number;
    min: number;
    max: number;
  }> {
    const { where, cacheKey, cacheTTL = 10 * 60 * 1000 } = options;

    const executeQuery = async () => {
      let query = db.select({
        count: count(),
        sum: sum(field),
        avg: avg(field),
        min: min(field),
        max: max(field),
      }).from(table);

      if (where) {
        query = query.where(where);
      }

      const results = await query;
      return results[0] || { count: 0, sum: 0, avg: 0, min: 0, max: 0 };
    };

    if (cacheKey) {
      return queryCache.get(cacheKey, executeQuery, cacheTTL);
    }

    return executeQuery();
  }
}

// Query performance monitor
export class QueryPerformanceMonitor {
  private static queries: Map<string, {
    count: number;
    totalTime: number;
    avgTime: number;
    slowQueries: number;
  }> = new Map();

  static startTimer(queryKey: string): () => void {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      this.recordQuery(queryKey, duration);
    };
  }

  private static recordQuery(queryKey: string, duration: number): void {
    const existing = this.queries.get(queryKey) || {
      count: 0,
      totalTime: 0,
      avgTime: 0,
      slowQueries: 0,
    };

    existing.count++;
    existing.totalTime += duration;
    existing.avgTime = existing.totalTime / existing.count;
    
    if (duration > 1000) { // Queries slower than 1 second
      existing.slowQueries++;
    }

    this.queries.set(queryKey, existing);

    // Log slow queries
    if (duration > 2000) {
      console.warn(`Slow query detected: ${queryKey} took ${duration}ms`);
    }
  }

  static getStats(): Record<string, any> {
    const stats: any = {};
    this.queries.forEach((value, key) => {
      stats[key] = value;
    });
    return stats;
  }

  static clearStats(): void {
    this.queries.clear();
  }
}

// Connection pool optimizer
export class ConnectionPoolOptimizer {
  private static activeConnections = 0;
  private static maxConnections = 10;
  private static connectionQueue: Array<() => void> = [];

  static async withConnection<T>(operation: () => Promise<T>): Promise<T> {
    await this.acquireConnection();
    
    try {
      const timer = QueryPerformanceMonitor.startTimer('connection-operation');
      const result = await operation();
      timer();
      return result;
    } finally {
      this.releaseConnection();
    }
  }

  private static async acquireConnection(): Promise<void> {
    if (this.activeConnections < this.maxConnections) {
      this.activeConnections++;
      return;
    }

    // Wait for available connection
    return new Promise((resolve) => {
      this.connectionQueue.push(resolve);
    });
  }

  private static releaseConnection(): void {
    this.activeConnections--;
    
    // Process queue
    if (this.connectionQueue.length > 0) {
      const next = this.connectionQueue.shift();
      if (next) {
        this.activeConnections++;
        next();
      }
    }
  }

  static getStats(): {
    active: number;
    max: number;
    queued: number;
  } {
    return {
      active: this.activeConnections,
      max: this.maxConnections,
      queued: this.connectionQueue.length,
    };
  }
}

// Batch operation optimizer
export class BatchOptimizer {
  static async batchInsert<T>(
    db: any,
    table: any,
    data: T[],
    batchSize = 100
  ): Promise<void> {
    const batches = [];
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      batches.push(batch);
    }

    // Process batches in parallel (but limit concurrency)
    const concurrencyLimit = 3;
    for (let i = 0; i < batches.length; i += concurrencyLimit) {
      const batchGroup = batches.slice(i, i + concurrencyLimit);
      const insertPromises = batchGroup.map(batch => 
        db.insert(table).values(batch)
      );
      
      await Promise.all(insertPromises);
    }
  }

  static async batchUpdate<T>(
    db: any,
    table: any,
    updates: Array<{ where: any; data: Partial<T> }>,
    batchSize = 50
  ): Promise<void> {
    const batches = [];
    
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      batches.push(batch);
    }

    for (const batch of batches) {
      const updatePromises = batch.map(({ where, data }) =>
        db.update(table).set(data).where(where)
      );
      
      await Promise.all(updatePromises);
    }
  }
}

// Export optimized query utilities
export {
  OptimizedQueryBuilder,
  PaginationOptimizer,
  AggregateOptimizer,
  QueryPerformanceMonitor,
  ConnectionPoolOptimizer,
  BatchOptimizer,
};