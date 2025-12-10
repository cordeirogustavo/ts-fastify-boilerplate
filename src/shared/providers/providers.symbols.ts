const ProvidersSymbols = {
  GoogleAuthProvider: Symbol.for('GoogleAuthProvider'),
  FacebookAuthProvider: Symbol.for('FacebookAuthProvider'),
  RedisFactory: Symbol.for('RedisFactory'),
  NodeCacheFactory: Symbol.for('NodeCacheFactory'),
  CacheFactory: Symbol.for('CacheFactory'),
}

export { ProvidersSymbols }
