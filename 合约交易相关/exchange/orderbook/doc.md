## orderBook

#### 

买盘第一档 > 买盘第一档 重新拉取 快照

#### 流程

订阅 wss://{uri}/v1/market@depth#100ms
开始缓存收到的更新。同一个价位，后收到的更新覆盖前面的。
访问Rest接口 https://{uri}/v1/market/depth 获得一个深度快照。
将目前缓存到的信息中lastUpdateId小于步骤3中获取到的快照中的lastUpdateId的部分丢弃(丢弃更早的信息，已经过期)。
将深度快照中的内容更新到本地订单薄副本中，并从websocket接收到的第一个lastUpdateId >= lastUpdateId+1 的增量数据开始继续更新本地副本。
每一个新的增量数据应该恰好等于上一个增量数据的lastUpdateId+1，否则可能出现了丢包，请从step3重新进行初始化。
每一个增量数据中的挂单量代表这个价格目前的挂单量绝对值，而不是相对变化。
如果某个价格对应的挂单量为0，表示该价位的挂单已经撤单或者被吃，应该移除这个价位。

#### lastPrice 最新价 绿涨红跌

- 盘口最新价和上一次 lastPrice 比较
- 行情 priceChange
