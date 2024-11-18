/* eslint-disable @typescript-eslint/no-explicit-any */
import Konva from 'konva';

// 添加节流函数定义
const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

const CHART_COLORS = {
  light: {
    axis: {
      line: '#888',
      text: '#888',
    },
    midLine: '#888',
    midPriceText: '#888',
    crosshair: '#888',
    background: '#fff',
  },
  dark: {
    axis: {
      line: '#444',
      text: '#444',
    },
    midLine: '#444',
    midPriceText: '#444',
    crosshair: '#444',
    background: '#151920',
  },
  bid: {
    area: 'rgba(0, 255, 0, 0.2)',
    hover: 'green',
    shadow: 'rgba(0, 255, 0, 0.1)',
    hoverLine: '#00ff00',
    hoverText: '#008000',
    percentage: '#008000',
    totalText: '#00a86b',
  },
  ask: {
    area: 'rgba(255, 0, 0, 0.2)',
    hover: 'red',
    shadow: 'rgba(255, 0, 0, 0.1)',
    hoverLine: '#ff0000',
    hoverText: '#dc143c',
    percentage: '#dc143c',
    totalText: '#ff4136',
  },
  axis: {
    line: '#888',
    text: '#888',
  },
  midLine: '#888',
  midPriceText: '#888',
  tooltip: {
    background: 'black',
    text: 'white',
  },
  crosshair: 'black',
};

interface DepthChartOptions {
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  animationDuration?: number;
  colors?: typeof CHART_COLORS;
  theme?: 'light' | 'dark';
}

interface DataPoint {
  price: number;
  amount: number;
}

export default class DepthChartKonva {
  private stage: Konva.Stage;

  private layer: Konva.Layer;

  private options: Required<DepthChartOptions>;

  private data: { bids: DataPoint[]; asks: DataPoint[] } = {
    bids: [],
    asks: [],
  };

  private priceRange: { min: number; max: number } = { min: 0, max: 0 };

  private amountRange: { min: number; max: number } = { min: 0, max: 0 };

  private totalBidAmount: number = 0;

  private totalAskAmount: number = 0;

  private bidArea: Konva.Line;

  private askArea: Konva.Line;

  private xAxis: Konva.Line;

  private yAxis: Konva.Line;

  private midPriceLine: Konva.Line;

  private midPriceText: Konva.Text;

  private totalBidText: Konva.Text;

  private totalAskText: Konva.Text;

  private tooltip: Konva.Label;

  private xAxisLabels: Konva.Text[] = [];

  private yAxisLabels: Konva.Text[] = [];

  private crosshair: Konva.Group;

  private midPrice: number = 0;

  private hoverRect: Konva.Rect;

  private hoverLine: Konva.Line;

  private hoverVerticalLine: Konva.Line;

  private hoverYLabel: Konva.Text;

  private hoverXLabel: Konva.Text;

  private percentageText: Konva.Text;

  private mirrorHoverLine: Konva.Line;

  private mirrorHoverVerticalLine: Konva.Line;

  private mirrorHoverRect: Konva.Rect;

  private mirrorPercentageText: Konva.Text | null = null;

  private mirrorHoverXLabel: Konva.Text | null = null;

  private leftYLabel: Konva.Text | null = null;

  private totalBidGroup: Konva.Group;

  private totalAskGroup: Konva.Group;

  private depthChartGroup!: Konva.Group;

  constructor(container: HTMLElement, options: DepthChartOptions = {}) {
    this.options = {
      width: container.clientWidth,
      height: container.clientHeight,
      margin: options.margin || { top: 20, right: 50, bottom: 30, left: 20 },
      colors: options.colors || CHART_COLORS,
      animationDuration: options.animationDuration || 300,
      theme: options.theme || 'light',
    };

    this.stage = new Konva.Stage({
      container: container as HTMLDivElement,
      width: this.options.width,
      height: this.options.height,
    });

    // 设置容器背景色
    this.stage.container().style.backgroundColor =
      CHART_COLORS[this.options.theme].background;

    this.mirrorHoverRect = new Konva.Rect({
      fill: 'rgba(0, 0, 0, 0.1)',
      visible: false,
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    this.bidArea = new Konva.Line();
    this.askArea = new Konva.Line();
    this.xAxis = new Konva.Line();
    this.yAxis = new Konva.Line();
    this.midPriceLine = new Konva.Line();
    this.midPriceText = new Konva.Text();
    this.totalBidText = new Konva.Text();
    this.totalAskText = new Konva.Text();
    this.tooltip = new Konva.Label();
    this.crosshair = new Konva.Group();
    this.hoverRect = new Konva.Rect({
      fill: 'rgba(0, 0, 0, 0.1)',
      visible: false,
    });
    this.hoverLine = new Konva.Line({
      stroke: 'red',
      strokeWidth: 1,
      dash: [5, 5],
      visible: false,
    });
    this.hoverVerticalLine = new Konva.Line({
      stroke: 'red',
      strokeWidth: 1,
      dash: [5, 5],
      visible: false,
    });
    this.hoverYLabel = new Konva.Text({
      fill: 'red',
      fontSize: 12,
      visible: false,
    });
    this.hoverXLabel = new Konva.Text({
      fill: 'red',
      fontSize: 12,
      visible: false,
    });
    this.percentageText = new Konva.Text({
      fill: 'red',
      fontSize: 12,
      visible: false,
    });
    this.mirrorHoverLine = new Konva.Line({
      stroke: 'green',
      strokeWidth: 1,
      dash: [5, 5],
      visible: false,
    });
    this.mirrorHoverVerticalLine = new Konva.Line({
      stroke: 'green',
      strokeWidth: 1,
      dash: [5, 5],
      visible: false,
    });

    this.totalBidGroup = new Konva.Group();
    this.totalAskGroup = new Konva.Group();

    this.initializeShapes();
    this.addEventListeners();

    const resizeObserver = new ResizeObserver(() => {
      this.handleResize();
    });
    resizeObserver.observe(container);
  }

  private handleResize(): void {
    if (!this.stage || !this.layer) return;

    const container = this.stage.container();
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 避免不必要的更新
    if (this.options.width === width && this.options.height === height) {
      return;
    }

    // 批量更新
    requestAnimationFrame(() => {
      this.stage.width(width);
      this.stage.height(height);
      this.options.width = width;
      this.options.height = height;

      const chartWidth =
        width - this.options.margin.left - this.options.margin.right;
      const chartHeight =
        height - this.options.margin.top - this.options.margin.bottom;

      this.depthChartGroup.clipX(this.options.margin.left);
      this.depthChartGroup.clipY(this.options.margin.top);
      this.depthChartGroup.clipWidth(chartWidth);
      this.depthChartGroup.clipHeight(chartHeight);

      this.updateRanges();
      this.updateShapes();
      this.layer.batchDraw();
    });
  }

  private initializeShapes(): void {
    const { width, height, margin, colors } = this.options;

    // 创建深度图区域容器，带裁剪功能
    this.depthChartGroup = new Konva.Group({
      clip: {
        x: margin.left,
        y: margin.top,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
      },
    });

    this.bidArea = new Konva.Line({
      points: [],
      fill: colors.bid.area,
      stroke: colors.bid.hover,
      strokeWidth: 1,
      closed: true,
    });

    this.askArea = new Konva.Line({
      points: [],
      fill: colors.ask.area,
      stroke: colors.ask.hover,
      strokeWidth: 1,
      closed: true,
    });

    // 将买卖单区域添加到裁剪组中
    this.depthChartGroup.add(this.bidArea, this.askArea);

    // 将裁剪组添加到图层
    this.layer.add(this.depthChartGroup);

    this.hoverRect = new Konva.Rect({
      fill: 'rgba(0, 0, 0, 0.1)',
      visible: false,
    });

    this.hoverLine = new Konva.Line({
      stroke: 'red',
      strokeWidth: 1,
      dash: [5, 5],
      visible: false,
    });

    this.hoverVerticalLine = new Konva.Line({
      stroke: 'red',
      strokeWidth: 1,
      dash: [5, 5],
      visible: false,
    });

    this.mirrorHoverLine = new Konva.Line({
      stroke: 'green',
      strokeWidth: 1,
      dash: [5, 5],
      visible: false,
    });

    this.mirrorHoverVerticalLine = new Konva.Line({
      stroke: 'green',
      strokeWidth: 1,
      dash: [5, 5],
      visible: false,
    });

    this.mirrorHoverRect = new Konva.Rect({
      fill: 'rgba(0, 0, 0, 0.1)',
      visible: false,
    });

    this.xAxis = new Konva.Line({
      points: [
        margin.left,
        height - margin.bottom,
        width - margin.right,
        height - margin.bottom,
      ],
      stroke: colors.axis.line,
      strokeWidth: 1,
    });

    this.yAxis = new Konva.Line({
      points: [
        width - margin.right,
        margin.top,
        width - margin.right,
        height - margin.bottom,
      ],
      stroke: colors.axis.line,
      strokeWidth: 1,
    });

    this.midPriceLine = new Konva.Line({
      points: [],
      stroke: colors.midLine,
      strokeWidth: 1,
      dash: [5, 5],
    });

    this.midPriceText = new Konva.Text({
      text: '',
      fontSize: 12,
      fill: colors.midPriceText,
      align: 'center',
    });

    this.tooltip = new Konva.Label({
      opacity: 0.75,
      visible: false,
      listening: false,
    });

    this.tooltip.add(
      new Konva.Tag({
        fill: colors.tooltip.background,
        pointerDirection: 'down',
        pointerWidth: 10,
        pointerHeight: 10,
        lineJoin: 'round',
        shadowColor: 'black',
        shadowBlur: 10,
        shadowOffset: { x: 10, y: 10 },
        shadowOpacity: 0.5,
      })
    );

    this.tooltip.add(
      new Konva.Text({
        text: '',
        fontFamily: 'Arial',
        fontSize: 12,
        padding: 5,
        fill: colors.tooltip.text,
      })
    );

    this.crosshair = new Konva.Group();

    const horizontalLine = new Konva.Line({
      stroke: colors.crosshair,
      strokeWidth: 1,
      dash: [5, 5],
      name: 'horizontalLine',
    });

    const verticalLine = new Konva.Line({
      stroke: colors.crosshair,
      strokeWidth: 1,
      dash: [5, 5],
      name: 'verticalLine',
    });

    this.crosshair.add(horizontalLine, verticalLine);

    for (let i = 0; i < 6; i++) {
      const label = new Konva.Text({
        x: margin.left + (i * (width - margin.left - margin.right)) / 5,
        y: height - margin.bottom + 5,
        text: '',
        fontSize: 10,
        fill: colors.axis.text,
        align: 'center',
      });
      this.xAxisLabels.push(label);
    }

    for (let i = 0; i < 6; i++) {
      const label = new Konva.Text({
        x: width - margin.right + 5,
        y: margin.top + (i * (height - margin.top - margin.bottom)) / 5,
        text: '',
        fontSize: 10,
        fill: colors.axis.text,
        align: 'left',
      });
      this.yAxisLabels.push(label);
    }

    this.createTotalAmountGroups();

    this.layer.add(
      this.bidArea,
      this.askArea,
      this.xAxis,
      this.yAxis,
      this.midPriceLine,
      this.midPriceText,
      ...this.xAxisLabels,
      ...this.yAxisLabels,
      this.tooltip,
      this.crosshair,
      this.hoverRect,
      this.hoverLine,
      this.hoverVerticalLine,
      this.hoverYLabel,
      this.hoverXLabel,
      this.percentageText,
      this.mirrorHoverLine,
      this.mirrorHoverVerticalLine,
      this.mirrorHoverRect
    );

    this.layer.add(this.totalBidGroup, this.totalAskGroup);
  }

  private createTotalAmountGroups(): void {
    const { width, margin, colors } = this.options;
    const midX = width / 2;

    this.totalBidGroup = new Konva.Group({
      x: midX - 80,
      y: margin.top + 10,
      draggable: true,
    });

    this.totalAskGroup = new Konva.Group({
      x: midX + 10,
      y: margin.top + 10,
      draggable: true,
    });

    const backgroundWidth = 140;
    const backgroundHeight = 25;

    const bidBackground = new Konva.Rect({
      width: backgroundWidth,
      height: backgroundHeight,
      fill: 'white',
      cornerRadius: 5,
    });

    const askBackground = new Konva.Rect({
      width: backgroundWidth,
      height: backgroundHeight,
      fill: 'white',
      cornerRadius: 5,
    });

    this.totalBidText = new Konva.Text({
      text: 'Total Bid: 0',
      fontSize: 12,
      fill: colors.bid.totalText,
      padding: 5,
      width: backgroundWidth,
    });

    this.totalAskText = new Konva.Text({
      text: 'Total Ask: 0',
      fontSize: 12,
      fill: colors.ask.totalText,
      padding: 5,
      width: backgroundWidth,
    });

    this.totalBidGroup.add(bidBackground, this.totalBidText);
    this.totalAskGroup.add(askBackground, this.totalAskText);

    this.layer.add(this.totalBidGroup, this.totalAskGroup);
  }

  private addEventListeners(): void {
    // 使用节流控制 mousemove 事件
    const throttledMouseMove = throttle((pos: { x: number; y: number }) => {
      const { x, y } = pos;
      const { width, height, margin } = this.options;

      if (
        x >= margin.left &&
        x <= width - margin.right &&
        y >= margin.top &&
        y <= height - margin.bottom
      ) {
        const price = this.xToPrice(x);
        this.showTooltip(x, y, price);
      } else {
        this.hideTooltip();
      }
    }, 16); // 约60fps

    this.stage.on('mousemove', () => {
      const pos = this.stage.getPointerPosition();
      if (pos) {
        throttledMouseMove(pos);
      }
    });

    this.stage.on('mouseleave', () => {
      this.hideTooltip();
    });
  }

  public setData(bids: DataPoint[], asks: DataPoint[]): void {
    this.data = {
      bids: bids.sort((a, b) => b.price - a.price),
      asks: asks.sort((a, b) => a.price - b.price),
    };

    console.log('depthData', this.data);
    this.updateRanges();
    this.updateShapes();
    this.layer.batchDraw();
  }

  private updateRanges(): void {
    if (!this.data.bids.length && !this.data.asks.length) return;

    const allPrices = new Float32Array(
      this.data.bids.length + this.data.asks.length
    );
    let index = 0;

    let maxBidTotal = 0;
    let maxAskTotal = 0;

    // 使用 reduce 替代循环
    maxBidTotal = this.data.bids.reduce((acc, bid) => acc + bid.amount, 0);
    maxAskTotal = this.data.asks.reduce((acc, ask) => acc + ask.amount, 0);

    this.data.bids.forEach((bid) => (allPrices[index++] = bid.price));
    this.data.asks.forEach((ask) => (allPrices[index++] = ask.price));

    this.priceRange = {
      min: Math.min(...Array.from(allPrices)),
      max: Math.max(...Array.from(allPrices)),
    };

    const maxTotal = Math.max(maxBidTotal, maxAskTotal);
    this.amountRange = {
      min: 0,
      max: maxTotal * 2,
    };

    this.totalBidAmount = maxBidTotal;
    this.totalAskAmount = maxAskTotal;
  }

  private updateMidPrice(): void {
    const highestBid = this.data.bids[0]?.price || 0;
    const lowestAsk = this.data.asks[0]?.price || 0;
    this.midPrice = (highestBid + lowestAsk) / 2;
  }

  private updateShapes(): void {
    const { width, height, margin } = this.options;
    const midX = width / 2;

    this.updateMidPrice();

    // 买单区域点
    const bidPoints: number[] = [];
    let accumulatedBidAmount = 0;

    // 起始点
    bidPoints.push(midX, height - margin.bottom);

    // 计算买单点位
    for (const bid of this.data.bids) {
      const currentX = this.priceToX(bid.price);
      // 如果点位已经超出左边界，跳过后续点位
      if (currentX < margin.left) {
        break;
      }

      accumulatedBidAmount += bid.amount;
      const currentY = this.amountToY(accumulatedBidAmount);

      bidPoints.push(currentX, currentY);
      if (bid !== this.data.bids[this.data.bids.length - 1]) {
        bidPoints.push(currentX, currentY);
      }
    }

    // 如果最后一个点不在左边界，加边界点
    if (bidPoints.length > 0 && bidPoints[bidPoints.length - 2] > margin.left) {
      bidPoints.push(margin.left, bidPoints[bidPoints.length - 1]);
      bidPoints.push(margin.left, height - margin.bottom);
    }

    // 卖单区域点
    const askPoints: number[] = [];
    let accumulatedAskAmount = 0;

    // 起始点
    askPoints.push(midX, height - margin.bottom);

    // 计算卖单点位
    for (const ask of this.data.asks) {
      const currentX = this.priceToX(ask.price);
      // 如果点位已经超出右边界，跳过后续点位
      if (currentX > width - margin.right) {
        break;
      }

      accumulatedAskAmount += ask.amount;
      const currentY = this.amountToY(accumulatedAskAmount);

      askPoints.push(currentX, currentY);
      if (ask !== this.data.asks[this.data.asks.length - 1]) {
        askPoints.push(currentX, currentY);
      }
    }

    // 如果最后一个点不在右边界，添加边界点
    if (
      askPoints.length > 0 &&
      askPoints[askPoints.length - 2] < width - margin.right
    ) {
      askPoints.push(width - margin.right, askPoints[askPoints.length - 1]);
      askPoints.push(width - margin.right, height - margin.bottom);
    }

    this.bidArea.points(bidPoints);
    this.askArea.points(askPoints);

    this.midPriceLine.points([midX, margin.top, midX, height - margin.bottom]);
    this.midPriceText.position({
      x: midX - 40,
      y: margin.top,
    });
    this.midPriceText.text(`Mid: ${this.midPrice.toFixed(2)}`);

    this.totalBidText.text(`Total Bid: ${this.totalBidAmount.toFixed(2)}`);
    this.totalAskText.text(`Total Ask: ${this.totalAskAmount.toFixed(2)}`);

    if (!this.totalBidGroup.isDragging()) {
      this.totalBidGroup.x(midX - 150);
    }
    if (!this.totalAskGroup.isDragging()) {
      this.totalAskGroup.x(midX + 10);
    }

    this.updateAxisLabels();
  }

  private updateAxisLabels(): void {
    const { width, height, margin } = this.options;

    const priceRange = (this.priceRange.max - this.priceRange.min) / 5;
    this.xAxisLabels.forEach((label, index) => {
      const price = this.midPrice + (index - 2) * priceRange;
      label.text(price.toFixed(2));
      label.position({
        x: this.priceToX(price) - 20,
        y: height - margin.bottom + 5,
      });
    });

    const maxAmount = Math.max(this.totalBidAmount, this.totalAskAmount);
    const amountStep = maxAmount / 5;
    this.yAxisLabels.forEach((label, index) => {
      const amount = (5 - index) * amountStep;
      label.text(amount.toFixed(2));
      label.position({
        x: width - margin.right + 5,
        y: this.amountToY(amount) - 6,
      });
    });
  }

  private priceToX(price: number): number {
    const { width, margin } = this.options;
    const midX = width / 2;
    const priceRange = this.priceRange.max - this.priceRange.min;
    return (
      midX +
      ((price - this.midPrice) / priceRange) *
        (width - margin.left - margin.right)
    );
  }

  private amountToY(amount: number): number {
    const { height, margin } = this.options;
    return (
      height -
      margin.bottom -
      (amount / this.amountRange.max) * (height - margin.top - margin.bottom)
    );
  }

  private xToPrice(x: number): number {
    const { width, margin } = this.options;
    const midX = width / 2;
    const priceRange = this.priceRange.max - this.priceRange.min;
    return (
      this.midPrice +
      ((x - midX) / (width - margin.left - margin.right)) * priceRange
    );
  }

  private yToAmount(y: number): number {
    const { height, margin } = this.options;
    return (
      this.amountRange.max *
      (1 - (y - margin.top) / (height - margin.top - margin.bottom))
    );
  }

  private showTooltip(
    x: number,
    y: number,
    price: number
    // amount: number
  ): void {
    const { width, height, margin, colors } = this.options;
    const midX = width / 2;
    const isAskSide = x > midX;

    const sideColors = isAskSide ? colors.ask : colors.bid;

    let curveY: number;
    let hoverPoint: DataPoint | undefined;
    if (isAskSide) {
      hoverPoint = this.data.asks.find(
        (point) => this.priceToX(point.price) >= x
      );
      curveY = hoverPoint
        ? this.amountToY(hoverPoint.amount)
        : height - margin.bottom;
    } else {
      hoverPoint = this.data.bids.find(
        (point) => this.priceToX(point.price) <= x
      );
      curveY = hoverPoint
        ? this.amountToY(hoverPoint.amount)
        : height - margin.bottom;
    }

    let accumulatedAmount = 0;
    if (isAskSide) {
      for (const ask of this.data.asks) {
        accumulatedAmount += ask.amount;
        if (this.priceToX(ask.price) >= x) {
          break;
        }
      }
    } else {
      for (let i = this.data.bids.length - 1; i >= 0; i--) {
        accumulatedAmount += this.data.bids[i].amount;
        if (this.priceToX(this.data.bids[i].price) <= x) {
          break;
        }
      }
    }

    this.tooltip.position({ x, y: curveY - 20 });
    (this.tooltip.findOne('Text') as Konva.Text).text(
      `Price: ${price.toFixed(2)}\nTotal Amount: ${accumulatedAmount.toFixed(2)}`
    );
    this.tooltip.visible(true);

    const mirrorX = midX - (x - midX);

    this.hoverRect.setAttrs({
      x: isAskSide ? x : margin.left,
      y: margin.top,
      width: isAskSide ? width - margin.right - x : x - margin.left,
      height: height - margin.top - margin.bottom,
      fill: sideColors.shadow,
      opacity: 0.1,
      visible: true,
    });

    this.mirrorHoverRect.setAttrs({
      x: isAskSide ? margin.left : mirrorX,
      y: margin.top,
      width: isAskSide ? mirrorX - margin.left : width - margin.right - mirrorX,
      height: height - margin.top - margin.bottom,
      fill: sideColors.shadow,
      opacity: 0.1,
      visible: true,
    });

    this.hoverLine.stroke(sideColors.hoverLine);
    this.hoverVerticalLine.stroke(sideColors.hoverLine);

    this.hoverLine.points([
      midX,
      curveY,
      isAskSide ? width - margin.right : margin.left,
      curveY,
    ]);
    this.hoverLine.visible(true);

    this.hoverVerticalLine.points([x, margin.top, x, height - margin.bottom]);
    this.hoverVerticalLine.visible(true);

    const yValue = this.yToAmount(curveY).toFixed(2);
    this.hoverYLabel.setAttrs({
      x: isAskSide ? width - margin.right + 5 : margin.left - 5,
      y: curveY - 6,
      text: yValue,
      fill: sideColors.hoverText,
      align: isAskSide ? 'left' : 'right',
      visible: true,
    });

    const percentage = ((price - this.midPrice) / this.midPrice) * 100;
    const percentageStr =
      percentage > 0
        ? `+${percentage.toFixed(2)}%`
        : `${percentage.toFixed(2)}%`;

    this.percentageText.setAttrs({
      x: (midX + x) / 2 - 20,
      y: curveY - 20,
      text: percentageStr,
      fill: sideColors.percentage,
      visible: true,
    });

    this.hoverXLabel.setAttrs({
      x: x - 20,
      y: height - margin.bottom + 5,
      text: price.toFixed(2),
      fill: sideColors.hoverText,
      visible: true,
    });

    let mirrorCurveY: number;
    let mirrorPoint: DataPoint | undefined;
    if (isAskSide) {
      mirrorPoint = this.data.bids.find(
        (point) => this.priceToX(point.price) <= mirrorX
      );
    } else {
      mirrorPoint = this.data.asks.find(
        (point) => this.priceToX(point.price) >= mirrorX
      );
    }
    mirrorCurveY = mirrorPoint
      ? this.amountToY(mirrorPoint.amount)
      : height - margin.bottom;

    const mirrorSideColors = isAskSide ? colors.bid : colors.ask;
    this.mirrorHoverLine.stroke(mirrorSideColors.hoverLine);
    this.mirrorHoverVerticalLine.stroke(mirrorSideColors.hoverLine);

    this.mirrorHoverLine.points([
      midX,
      mirrorCurveY,
      isAskSide ? margin.left : width - margin.right,
      mirrorCurveY,
    ]);
    this.mirrorHoverLine.visible(true);

    this.mirrorHoverVerticalLine.points([
      mirrorX,
      margin.top,
      mirrorX,
      height - margin.bottom,
    ]);
    this.mirrorHoverVerticalLine.visible(true);

    if (!this.mirrorPercentageText) {
      this.mirrorPercentageText = new Konva.Text({
        fontSize: 12,
        visible: false,
      });
      this.layer.add(this.mirrorPercentageText);
    }
    this.mirrorPercentageText.setAttrs({
      x: (midX + mirrorX) / 2 - 20,
      y: mirrorCurveY - 20,
      text: percentageStr,
      fill: mirrorSideColors.percentage,
      visible: true,
    });

    if (!this.mirrorHoverXLabel) {
      this.mirrorHoverXLabel = new Konva.Text({
        fontSize: 12,
        visible: false,
      });
      this.layer.add(this.mirrorHoverXLabel);
    }
    this.mirrorHoverXLabel.setAttrs({
      x: mirrorX - 20,
      y: height - margin.bottom + 5,
      text: this.xToPrice(mirrorX).toFixed(2),
      fill: mirrorSideColors.hoverText,
      visible: true,
    });

    if (!this.leftYLabel) {
      this.leftYLabel = new Konva.Text({
        fontSize: 12,
        visible: false,
      });
      this.layer.add(this.leftYLabel);
    }
    this.leftYLabel.setAttrs({
      x: margin.left - 5,
      y: curveY - 6,
      text: yValue,
      fill: colors.bid.hoverText,
      align: 'right',
      visible: !isAskSide,
    });

    this.layer.batchDraw();
  }

  private hideTooltip(): void {
    this.tooltip.visible(false);
    this.hoverRect.visible(false);
    this.mirrorHoverRect.visible(false);
    this.hoverLine.visible(false);
    this.hoverVerticalLine.visible(false);
    this.hoverYLabel.visible(false);
    this.hoverXLabel.visible(false);
    this.percentageText.visible(false);
    this.mirrorHoverLine.visible(false);
    this.mirrorHoverVerticalLine.visible(false);
    if (this.leftYLabel) {
      this.leftYLabel.visible(false);
    }
    this.layer.batchDraw();
  }

  // public resize(width: number, height: number): void {
  //   this.stage.width(width);
  //   this.stage.height(height);
  //   this.layer.draw();
  // }

  public updateRealtimeData(newBids: DataPoint[], newAsks: DataPoint[]): void {
    if (!this.data.bids.length && this.data.asks.length) {
      console.warn('Depth data is empty, skip updating');
      return;
    }
    this.data.bids = this.mergeData(this.data.bids, newBids).sort(
      (a, b) => b.price - a.price
    );
    this.data.asks = this.mergeData(this.data.asks, newAsks).sort(
      (a, b) => a.price - b.price
    );
    console.log('depthDataRealtime', this.data);
    this.updateRanges();
    this.updateShapes();
    this.layer.batchDraw();
  }

  private mergeData(
    existingData: DataPoint[],
    newData: DataPoint[]
  ): DataPoint[] {
    const mergedData = [...existingData];
    newData.forEach((newPoint) => {
      const existingIndex = mergedData.findIndex(
        (point) => point.price === newPoint.price
      );
      if (existingIndex !== -1) {
        mergedData[existingIndex] = newPoint;
      } else {
        mergedData.push(newPoint);
      }
    });
    return mergedData;
  }

  // 添加一个公共方法用于手动触发重绘
  public resize(): void {
    this.handleResize();
  }

  public updateTheme(theme: 'light' | 'dark'): void {
    this.options.theme = theme;

    // 更新背景色
    this.stage.container().style.backgroundColor =
      CHART_COLORS[theme].background;

    // 更新坐标轴颜色
    this.xAxis.stroke(CHART_COLORS[theme].axis.line);
    this.yAxis.stroke(CHART_COLORS[theme].axis.line);

    // 更新中线颜色
    this.midPriceLine.stroke(CHART_COLORS[theme].midLine);
    this.midPriceText.fill(CHART_COLORS[theme].midPriceText);

    // 更新坐标轴文字颜色
    this.xAxisLabels.forEach((label) => {
      label.fill(CHART_COLORS[theme].axis.text);
    });
    this.yAxisLabels.forEach((label) => {
      label.fill(CHART_COLORS[theme].axis.text);
    });

    // 更新十字线颜色
    this.crosshair.children.forEach(() => {
      // line?.stroke(CHART_COLORS[theme].crosshair);
    });

    // 重绘
    this.layer.batchDraw();
  }
}
