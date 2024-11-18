/* eslint-disable @typescript-eslint/no-explicit-any */
/** 深度数据接口 */
import { updateOrderBook } from './websocket-helper';
interface DepthData {
  lastUpdateId: number;
  preUpdateId: number;
  data: any;
}

export class DepthQueue {
  private static instance: DepthQueue;

  private queue: DepthData[] = [];

  private currentSymbol: string = '';

  private constructor() {
    // 防止外部实例化
  }

  public static getInstance(): DepthQueue {
    if (!DepthQueue.instance) {
      DepthQueue.instance = new DepthQueue();
    }
    return DepthQueue.instance;
  }

  /**
   * 初始化/重置队列
   * @param symbol 交易对
   */
  public init(symbol: string): void {
    if (this.currentSymbol !== symbol) {
      this.currentSymbol = symbol;
      this.queue = []; // 重置队列
    }
  }

  /**
   * 清空队列
   */
  public clear(): void {
    this.queue = [];
    this.currentSymbol = '';
  }

  /**
   * 将新的深度数据添加到队列中
   * @param data 深度数据
   */
  push(data: DepthData): void {
    this.queue.push(data);
    this.queue.sort((a, b) => a.preUpdateId - b.preUpdateId);
  }

  /**
   * 处理快照数据并与队列中的数据合并
   * @param snapshot 快照数据
   * @returns 处理结果，包含合并后的深度数据和是否需要重新请求的标志
   */
  processSnapshot(snapshot: {
    lastUpdateId: number;
    bids: [string, string][];
    asks: [string, string][];
  }): { data: DepthData; needRefresh: boolean } {
    const nextId = snapshot.lastUpdateId + 1;
    // 找到第一个可以合并的数据的索引
    const nextDataIndex = this.queue.findIndex(
      (item) => item.preUpdateId === nextId
    );

    // 检查队列中的数据是否连续
    const hasGap = this.checkSequenceGap();

    if (hasGap) {
      console.log('the id is not continuous>>>', snapshot.lastUpdateId);
      // 如果数据不连续，清空队列并要求重新请求
      this.queue = [];
      return {
        data: {
          lastUpdateId: snapshot.lastUpdateId,
          preUpdateId: snapshot.lastUpdateId,
          data: {
            bids: snapshot.bids,
            asks: snapshot.asks,
          },
        },
        needRefresh: true,
      };
    }

    if (nextDataIndex !== -1) {
      // 删除所有过期的数据
      this.queue.splice(0, nextDataIndex);

      // 遍历队列中的数据，依次更新snapshot
      this.queue.forEach((item) => {
        // 更新bids
        if (snapshot.bids && item.data.bids) {
          item.data.bids.forEach((bid: [string, string]) => {
            snapshot.bids = updateOrderBook(snapshot.bids, bid, false);
          });
        }

        // 更新asks
        if (snapshot.asks && item.data.asks) {
          item.data.asks.forEach((ask: [string, string]) => {
            snapshot.asks = updateOrderBook(snapshot.asks, ask, true);
          });
        }

        // 更新lastUpdateId
        snapshot.lastUpdateId = item.lastUpdateId;
      });

      // 清空已处理的数据
      this.queue = [];

      return {
        data: {
          lastUpdateId: snapshot.lastUpdateId,
          preUpdateId: snapshot.lastUpdateId, // 或根据实际需求设置
          data: {
            bids: snapshot.bids,
            asks: snapshot.asks,
          },
        },
        needRefresh: false,
      };
    }

    return {
      data: {
        lastUpdateId: snapshot.lastUpdateId,
        preUpdateId: snapshot.lastUpdateId,
        data: {
          bids: snapshot.bids,
          asks: snapshot.asks,
        },
      },
      needRefresh: false,
    };
  }

  /**
   * 检查队列中的数据是否存在跳号
   * @returns 是否存在跳号
   */
  private checkSequenceGap(): boolean {
    if (this.queue.length <= 1) return false;

    for (let i = 1; i < this.queue.length; i++) {
      const prevItem = this.queue[i - 1];
      const currentItem = this.queue[i];

      // 检查前一个更新的lastUpdateId是否等于当前更新的preUpdateId
      if (prevItem.lastUpdateId + 1 !== currentItem.preUpdateId) {
        return true;
      }
    }

    return false;
  }

  /**
   * 获取当前队列中的所有数据
   * @returns 深度数据数组
   */
  getQueue(): DepthData[] {
    return this.queue;
  }
}
