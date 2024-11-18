/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import HouseDatafeed from './Datafeed.ts';
import { DARK } from '@/contexts/ThemeContext';
import { observer } from 'mobx-react-lite';
import getSpotCommonStore from '@/stores/spot/commonStore';
import getPerpetualCommonStore from '@/stores/perpetual/commonStore';
import { BusinessType } from '@/stores/enums';
import { tvConfig } from './config';
interface TradingViewProps {
  symbol?: string;
  theme?: 'light' | 'dark' | undefined;
  businessType: BusinessType;
}

function TradingViewChart({
  symbol = 'BTC-USDT',
  theme = 'dark',
  businessType = BusinessType.SPOT,
}: TradingViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    // 检查 TradingView 对象是否已经存在
    /* @ts-ignore */
    if (typeof window !== 'undefined' && window.TradingView) {
      setIsLibraryLoaded(true);
    }
  }, []);

  const updateChartTheme = (newTheme: string) => {
    if (!widgetRef.current) return;

    try {
      widgetRef.current.changeTheme(newTheme);
      // 更新背景颜色
      widgetRef.current.applyOverrides({
        'paneProperties.background': newTheme === DARK ? '#151920' : '#ffffff',
      });
    } catch (error) {
      console.error('Error updating chart theme:', error);
    }
  };

  const createWidget = () => {
    if (!containerRef.current) return;

    /* @ts-ignore */
    if (window.tvWidget) {
      // @ts-ignore
      window.tvWidget.remove();
      // @ts-ignore
      window.tvWidget = null;
    }

    const houseDatafeed = new HouseDatafeed(symbol);

    const spotCommonStore = getSpotCommonStore();
    const perpetualCommonStore = getPerpetualCommonStore();

    let complexPrecision =
      spotCommonStore.currentSpotSymbolBaseInfo?.pricePrecision ?? '5';
    if (businessType === BusinessType.LINEAR_PERPETUAL) {
      complexPrecision =
        perpetualCommonStore.currentSymbolPrecisionInfo?.pricePrecision ?? '5';
    }

    // const precision =
    //   spotCommonStore.currentSpotSymbolBaseInfo?.pricePrecision ?? '2';
    const pricescale = Math.pow(10, Number(complexPrecision)); // 添加这行
    /* @ts-ignore */
    const widget = new window.TradingView.widget({
      debug: false,
      symbol: symbol,
      interval: '5',
      timezone: 'Asia/Shanghai',
      height: '100%',
      width: '100%',
      has_seconds: true,
      has_intraday: true,
      intraday_multipliers: ['1S', '5S', '10S', '15S', '30S', 'S'], // 日内支持的时间单位
      supported_time_frames: [
        // 支持的时间范围
        { text: '1S', resolution: '1S', description: '1 Second' },
        { text: '5S', resolution: '5S', description: '5 Seconds' },
        { text: '10S', resolution: '10S', description: '10 Seconds' },
        { text: '15S', resolution: '15S', description: '15 Seconds' },
        { text: '30S', resolution: '30S', description: '30 Seconds' },
        // ... 其他时间范围
      ],
      container: containerRef.current.id,
      datafeed: {
        onReady: (cb: any) => {
          return cb({
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
          });
        },
        resolveSymbol: (
          symbolName: string,
          onSymbolResolvedCallback: any,
          onResolveErrorCallback: any
        ) => {
          houseDatafeed
            .resolveSymbol(symbolName, pricescale)
            .then((symbolInfo: any) =>
              onSymbolResolvedCallback({
                ...symbolInfo,
                pricescale,
                businessType,
              })
            )
            .catch((err: any) => onResolveErrorCallback(err));
        },
        getBars: (
          symbolInfo: any,
          resolution: string,
          periodParams: any,
          onHistoryCallback: any,
          onErrorCallback: any
        ) => {
          houseDatafeed
            .getBars({ ...symbolInfo, businessType }, resolution, periodParams)
            .then((bars: any) => {
              onHistoryCallback(bars, { noData: bars.length === 0 });
            })
            .catch((err: any) => onErrorCallback(err));
        },
        subscribeBars: (
          symbolInfo: any,
          resolution: string,
          onRealtimeCallback: any,
          subscriberUID: string
        ) => {
          // 直接调用 HouseDatafeed 的 subscribeBars 方法
          houseDatafeed.subscribeBars(
            { ...symbolInfo, businessType },
            resolution,
            onRealtimeCallback,
            subscriberUID
          );
        },

        unsubscribeBars: (subscriberUID: string) => {
          // 直接调用 HouseDatafeed 的 unsubscribeBars 方法
          houseDatafeed.unsubscribeBars(subscriberUID, businessType);
        },
      },
      library_path: '/charting_library/',
      locale: 'en',
      theme: theme,
      loading_screen: {
        backgroundColor: theme === DARK ? '#151920' : '#ffffff',
      },
      disabled_features: [
        'study_templates',
        'use_localstorage_for_settings',
        'header_symbol_search',
        'compare_symbol',
        'display_market_status',
        'show_interval_dialog_on_key_press',
        'show_zoom_buttons',
        'show_series_markers',
        'popup_hints',
        'header_compare',
        'show_symbol_logos',
        'symbol_info',

        'edit_buttons_in_legend', // 图例编辑按钮
        'legend_context_menu', // 图例右键菜单
        'study_templates',
      ],
      enabled_features: [
        'volume_force_overlay',
        'show_volume_by_default',
        'create_volume_indicator_by_default',
        'symbol_search_hot_key',
        'seconds_resolution',
      ],
      overrides: {
        'paneProperties.background': theme === DARK ? '#151920' : '#ffffff',
        ...tvConfig,
      },
    });

    // @ts-ignore
    window.tvWidget = widget;
    widgetRef.current = widget;
    return widget;
  };

  useEffect(() => {
    if (widgetRef.current) {
      updateChartTheme(theme);
    }
  }, [theme]);

  useEffect(() => {
    const init = () => {
      if (!isLibraryLoaded) return;

      try {
        const widget = createWidget();
        if (!widget) {
          console.error('Widget creation failed');
          return;
        }

        // 等待 widget 完全加载
        const waitForChartReady = () => {
          return new Promise((resolve: any) => {
            const check = () => {
              try {
                /* @ts-ignore */
                if (widget && widget.chart()) {
                  resolve();
                } else {
                  setTimeout(check, 100);
                }
              } catch (error) {
                console.error('Error checking chart readiness:', error);
                setTimeout(check, 100);
              }
            };
            setTimeout(check, 1000);
          });
        };

        // 使用 Promise 来添加 Volume 指标
        waitForChartReady()
          .then(() => {
            try {
              /* @ts-ignore */
              widget.chart().createStudy('Volume', false, false, {
                'volume.height': 8,
                'volume.precision': 0,
                'volume.format.type': 'volume',
                'volume.volume.transparency': 100,
              });
            } catch (error) {
              console.error('Error adding volume indicator:', error);
            }
          })
          .catch((error) => {
            console.error('Error in waitForChartReady:', error);
          });

        return () => {
          try {
            /* @ts-ignore */
            if (window.tvWidget) {
              /* @ts-ignore */
              window.tvWidget.remove();
              /* @ts-ignore */
              window.tvWidget = null;
            }
          } catch (error) {
            console.error('Error cleaning up widget:', error);
          }
        };
      } catch (error) {
        console.error('Error in TradingView chart initialization:', error);
      }
    };
    init();
  }, [isLibraryLoaded, symbol]);
  return (
    <div className="relative h-[calc(100%-45px)] w-full">
      <Script
        src="/charting_library/charting_library.standalone.js"
        strategy="lazyOnload"
        onLoad={() => {
          setIsLibraryLoaded(true);
        }}
        onError={(e) => {
          console.error('Script load error:', e);
        }}
      />
      <div
        id="tv_chart_container"
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}

export default observer(TradingViewChart);
