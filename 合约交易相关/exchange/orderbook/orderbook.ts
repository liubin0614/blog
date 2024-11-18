import  data from './data.js'
import Calculator from './calc.js'



// 合并深度的函数
const mergeDepth = (
  orders,
  mergeLevel,
  isAsk = false
) => {
  const mergedMap = new Map();
  console.log('orders', JSON.stringify(orders));
  orders.forEach(([price, amount]) => {
    const priceNum = parseFloat(price);
    const amountNum = parseFloat(amount);

    const calcNum = Number(Calculator.divide(priceNum, mergeLevel));

    const floorPrice = Calculator.multiply(Math.floor(calcNum), mergeLevel);
    const ceilPrice = Calculator.multiply(Math.floor(calcNum) + 1, mergeLevel);

    let mergedPrice = isAsk
      ? Calculator.multiply(Math.ceil(calcNum), mergeLevel)
      : Calculator.multiply(Math.floor(calcNum), mergeLevel);

    // 卖盘向上，买盘向下 
    // 远离 最新价 合并档位

    // let mergedPrice = isAsk ? ceilPrice : floorPrice;

    mergedPrice = Number(mergedPrice);

    console.log('mergedPrice', mergedPrice, calcNum, floorPrice, ceilPrice);

    const currentAmount = mergedMap.get(mergedPrice) || 0;

    mergedMap.set(mergedPrice, currentAmount + amountNum);
  });
  return Array.from(mergedMap)
    .map(([price, amount]) => ({
      price: String(price),
      amount: String(amount),
    }))
    .sort((a, b) => {
      const diff = parseFloat(a.price) - parseFloat(b.price);
      return isAsk ? diff : -diff;
    });
};
