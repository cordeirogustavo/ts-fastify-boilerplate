import NodeCache from 'node-cache'
import { singleton } from 'tsyringe'

@singleton()
export class NodeCacheFactory {
  create(): NodeCache {
    const client = new NodeCache()
    return client
  }
}
