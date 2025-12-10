interface BaseCacheDelFn {
  (identifier: string | string[]): Promise<number>
  (): Promise<number>
}

interface BaseCacheGetFn<T> {
  (identifier: string): Promise<T | undefined>
  (): Promise<T | undefined>
}

interface BaseCacheSetFn<T> {
  (identifier: string, data: T, ttl?: string | number): Promise<boolean>
  (data: T, ttl?: string | number): Promise<boolean>
}

interface BaseCacheTakeFn<T> {
  (identifier: string): Promise<T | undefined>
  (): Promise<T | undefined>
}

export interface BaseCache<Entity> {
  del: BaseCacheDelFn
  get: BaseCacheGetFn<Entity>
  set: BaseCacheSetFn<Entity>
  take: BaseCacheTakeFn<Entity>
}
