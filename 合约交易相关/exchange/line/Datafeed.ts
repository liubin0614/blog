/* eslint-disable @typescript-eslint/no-explicit-any */
// import { getKline } from '@/requests/trade-request';
import getWsStore, { WsStoreType } from '@/stores/wsStore';
import { BusinessType } from '@/stores/enums';
import { getMarketWsPayload } from '@/utils/websocket-helper';
import { SubscriptionManager } from '@/utils/subscrib';

interface PeriodParams {
  from: number;
  to: number;
  countBack: number;
  firstDataRequest: boolean;
}

interface SymbolInfo {
  name: string;
  businessType?: BusinessType;
}

interface Bar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Intervals {
  [key: string]: string;
}

interface ResolvedSymbol {
  name: string;
  description: string;
  type: string;
  session: string;
  timezone: string;
  minmov: number;
  pricescale: number;
  has_intraday: boolean;
  has_daily: boolean;
  has_weekly_and_monthly: boolean;
  supported_resolutions: string[];
  has_empty_bars: boolean;
  has_volume: boolean;
  volume_precision: number;
  data_status: string;
  volume_multiplier: number;
  format: string;
  ticker: string;
  base_name: string[];
  legs: string[];
  exchange: string;
  listed_exchange: string;
  has_seconds: boolean;
}

class HouseDatafeed {
  private originalSymbol: string;

  private baseUrl: string;

  private wsStore: WsStoreType;

  private subscriptions: Map<string, Function> = new Map();

  private subscriptionManager: SubscriptionManager;

  constructor(symbol: string) {
    this.originalSymbol = symbol;
    // this.baseUrl = 'https://api.binance.com/api/v3';
    this.baseUrl = '/api-rest/v1/market/kline';
    this.wsStore = getWsStore();
    this.subscriptionManager = SubscriptionManager.getInstance();
  }

  subscribeBars(
    symbolInfo: SymbolInfo,
    resolution: string,
    onRealtimeCallback: (bar: Bar) => void,
    subscriberUID: string
  ) {
    const interval = this.getInterval(resolution);
    const symbol = symbolInfo.name;
    //首先先要在这里用对应payload 注册一下 kline 的数据
    // const symbol = spotCommonStore.currentSymbol;
    const KlinePayLoad = getMarketWsPayload('kline', {
      businessType: (symbolInfo.businessType ?? BusinessType.SPOT).toString(),
      symbol: symbol,
      period: interval,
    });

    this.subscriptionManager.registerSubscribeTopic(
      'kline',
      `${symbol}#kline#${interval}`,
      KlinePayLoad
    );
    // 保存回调函数
    this.subscriptions.set(subscriberUID, onRealtimeCallback);
    // 注册 WebSocket 任务
    this.wsStore.registerTask({
      messageType: 'marketData',
      frequency: 1000, // 更新频率，可以根据需要调整
      topic: `${symbol}:kline#${interval}`, // 对应您的 WebSocket 订阅主题
      callback: (messages: any[]) => {
        messages.forEach((message) => {
          try {
            const res = JSON.parse(message);
            // 根据您的数据格式进行解析
            if (res?.data?.length) {
              const data = res.data[0];
              const bar: Bar = {
                time: Number(data.openTime),
                open: parseFloat(data.openPrice),
                high: parseFloat(data.highPrice),
                low: parseFloat(data.lowPrice),
                close: parseFloat(data.closePrice),
                volume: parseFloat(data.volume),
              };
              onRealtimeCallback(bar);
            }
          } catch (error) {
            console.error('Failed to parse kline data:', error);
          }
        });
      },
      moduleName: `tradingview`,
      size: 1, // 因为是实时K线，每次只需要最新的一条数据
    });

    // 发送订阅消息
    // const subscribePayload = {
    //   method: 'SUBSCRIBE',
    //   params: [`${symbol.toLowerCase()}@kline_${interval}`],
    //   id: Date.now(),
    // };

    // this.wsStore.subscribeChannel(
    //   `${symbol}_${interval}`,
    //   subscribePayload,
    //   'market'
    // );
  }

  // 取消订阅
  unsubscribeBars(
    subscriberUID: string,
    businessType: BusinessType = BusinessType.SPOT
  ) {
    const [symbol, , resolution] = subscriberUID.split('_');
    const interval = this.getInterval(resolution);
    // 移除 WebSocket 任务
    this.wsStore.removeTask({
      topic: `${symbol}:kline#${interval}`,
      moduleName: `tradingview_${symbol}`,
    });

    // 发送取消订阅消息
    const unsubscribePayload = getMarketWsPayload('kline', {
      businessType: businessType.toString(),
      symbol: symbol,
      period: interval,
    });

    this.subscriptionManager.unRegisterSubscribeTopic(`kline`, {
      ...unsubscribePayload,
      event: 'unsubscribe',
    });

    // 移除回调函数
    this.subscriptions.delete(subscriberUID);
  }

  async getBars(
    symbolInfo: SymbolInfo,
    resolution: string,
    periodParams: PeriodParams
  ): Promise<Bar[]> {
    const { from, to } = periodParams;
    const interval = this.getInterval(resolution);

    let params = new URLSearchParams({
      businessType: (symbolInfo.businessType ?? BusinessType.SPOT).toString(),
      symbol: symbolInfo.name,
      period: interval,
      //interval: interval,
      limit: '1000',
    });

    if (from) {
      params.append('startTime', (from * 1000).toString());
    }
    if (to) {
      params.append('endTime', (to * 1000).toString());
    }

    const url = `${this.baseUrl}?${params.toString()}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.data.length === 0) {
        return [];
      }

      // const bars: Bar[] = data.map((bar: any) => ({
      //   time: Math.floor(bar[0]),
      //   open: parseFloat(bar[1]),
      //   high: parseFloat(bar[2]),
      //   low: parseFloat(bar[3]),
      //   close: parseFloat(bar[4]),
      //   volume: parseFloat(bar[5]),
      // }));

      const bars: Bar[] = data.data
        .map((bar: any) => {
          return {
            time: Number(bar[1]),
            open: parseFloat(bar[3]),
            high: parseFloat(bar[5]),
            low: parseFloat(bar[6]),
            close: parseFloat(bar[4]),
            volume: parseFloat(bar[7]),
          };
        })
        .sort((a: Bar, b: Bar) => a.time - b.time);
      return bars;
    } catch (error) {
      console.error('Failed to load data from Binance:', error);
      return [];
    }
  }

  private getInterval(resolution: string): string {
    const intervals: Intervals = {
      '1S': '1s',
      '1': '1m',
      '3': '3m',
      '5': '5m',
      '15': '15m',
      '30': '30m',
      '60': '1h',
      '120': '2h',
      '240': '4h',
      '360': '6h',
      '480': '8h',
      '720': '12h',
      D: '1d',
      '3D': '3d',
      W: '1w',
      M: '1M',
    };
    return intervals[resolution] || '1d';
  }

  async resolveSymbol(
    symbolName: string,
    pricescale: number
    // minmov: number
  ): Promise<ResolvedSymbol> {
    return {
      name: symbolName,
      description: `${symbolName} House`,
      type: 'crypto',
      session: '24x7',
      timezone: 'Etc/UTC',
      minmov: 1,
      pricescale: pricescale,
      has_intraday: true,
      has_daily: true,
      has_seconds: true,
      has_weekly_and_monthly: true,
      supported_resolutions: [
        '1S',
        '1',
        '3',
        '5',
        '15',
        '30',
        '60',
        '120',
        '240',
        '360',
        '480',
        '720',
        'D',
        '3D',
        'W',
        'M',
      ],
      has_empty_bars: true,
      has_volume: true,
      volume_precision: 8,
      data_status: 'streaming',
      volume_multiplier: 1,
      format: 'price',
      ticker: symbolName,
      base_name: [symbolName],
      legs: [symbolName],
      exchange: 'House',
      listed_exchange: 'House',
    };
  }
}

export default HouseDatafeed;
