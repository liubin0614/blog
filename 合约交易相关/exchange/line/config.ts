export const tvConfig = {
  volumePaneSize: 'tiny',

  'paneProperties.backgroundType': 'solid',
  'mainSeriesProperties.candleStyle.upColor': '#0B8552', // 上涨蜡烛填充色
  'mainSeriesProperties.candleStyle.downColor': '#D42F44', // 下跌蜡烛填充色
  'mainSeriesProperties.candleStyle.borderUpColor': '#0B8552', // 上涨蜡烛边框色
  'mainSeriesProperties.candleStyle.borderDownColor': '#D42F44', // 下跌蜡烛边框色
  'mainSeriesProperties.candleStyle.wickUpColor': '#0B8552', // 上涨蜡烛影线色
  'mainSeriesProperties.candleStyle.wickDownColor': '#D42F44', // 下跌蜡烛影线色

  // K线样式设置
  'mainSeriesProperties.candleStyle.drawWick': true, // 显示影线
  'mainSeriesProperties.candleStyle.drawBorder': true, // 显示边框
  'mainSeriesProperties.candleStyle.borderColor': '', // 边框颜色（为空则使用上下涨颜色）
  'mainSeriesProperties.candleStyle.wickColor': '', // 影线颜色（为空则使用上下涨颜色）
  'mainSeriesProperties.candleStyle.barColorsOnPrevClose': false, // 是否基于前收盘价着色

  // 空心K线设置
  'mainSeriesProperties.hollowCandleStyle.upColor': '#0B8552', // 上涨空心填充色
  'mainSeriesProperties.hollowCandleStyle.downColor': '#D42F44', // 下跌空心填充色
  'mainSeriesProperties.hollowCandleStyle.borderUpColor': '#0B8552', // 上涨空心边框色
  'mainSeriesProperties.hollowCandleStyle.borderDownColor': '#D42F44', // 下跌空心边框色

  // 成交量设置
  'volume.volume.color.0': '#E4384E', // 下跌成交量颜色
  'volume.volume.color.1': '#21A26C', // 上涨成交量颜色
  'mainSeriesProperties.symbolTextColor': '#333333',
  // 'mainSeriesProperties.style': 1,
  // 'mainSeriesProperties.columnStyle.priceSource': 'open',
  // 'mainSeriesProperties.columnStyle.barColorsOnPrevClose': true,
};

export const tvConfigDark = {
  volumePaneSize: 'tiny',

  'paneProperties.backgroundType': 'solid',
  'mainSeriesProperties.candleStyle.upColor': '#21A26C', // 上涨蜡烛填充色
  'mainSeriesProperties.candleStyle.downColor': '#E4384E', // 下跌蜡烛填充色
  'mainSeriesProperties.candleStyle.borderUpColor': '#21A26C', // 上涨蜡烛边框色
  'mainSeriesProperties.candleStyle.borderDownColor': '#E4384E', // 下跌蜡烛边框色
  'mainSeriesProperties.candleStyle.wickUpColor': '#21A26C', // 上涨蜡烛影线色
  'mainSeriesProperties.candleStyle.wickDownColor': '#E4384E', // 下跌蜡烛影线色

  // K线样式设置
  'mainSeriesProperties.candleStyle.drawWick': true, // 显示影线
  'mainSeriesProperties.candleStyle.drawBorder': true, // 显示边框
  'mainSeriesProperties.candleStyle.borderColor': '', // 边框颜色（为空则使用上下涨颜色）
  'mainSeriesProperties.candleStyle.wickColor': '', // 影线颜色（为空则使用上下涨颜色）
  'mainSeriesProperties.candleStyle.barColorsOnPrevClose': false, // 是否基于前收盘价着色

  // 空心K线设置
  'mainSeriesProperties.hollowCandleStyle.upColor': '#21A26C', // 上涨空心填充色
  'mainSeriesProperties.hollowCandleStyle.downColor': '#E4384E', // 下跌空心填充色
  'mainSeriesProperties.hollowCandleStyle.borderUpColor': '#21A26C', // 上涨空心边框色
  'mainSeriesProperties.hollowCandleStyle.borderDownColor': '#E4384E', // 下跌空心边框色

  // 成交量设置
  'volume.volume.color.0': '#E4384E', // 下跌成交量颜色
  'volume.volume.color.1': '#21A26C', // 上涨成交量颜色
  'mainSeriesProperties.symbolTextColor': '#333333',
};
