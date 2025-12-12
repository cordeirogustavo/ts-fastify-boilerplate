import type { Readable } from 'node:stream'

export class BufferHelper {
  /**
   * Converts a ReadableStream into a Buffer (copies everything from the stream into buffers and concatenate them)
   * @param readableStream
   * @returns Buffer with all the content
   */
  static async readableToBuffer(readableStream: Readable): Promise<Buffer> {
    const buffs: any[] = []

    for await (const data of readableStream) {
      buffs.push(data)
    }

    return Buffer.concat(buffs)
  }
}
