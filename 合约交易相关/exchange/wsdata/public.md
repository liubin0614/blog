行情产品文档：行情-Web/Pc
1.接口描述
     行情主要使用Rest API和WebSocket接口对外提供访问。
2.Rest API 接口
深度信息

获取指定交易对的档位深度信息，默认返回买卖盘各1000条信息

HTTP请求

GET /v1/market/depth

请求参数

参数名	数据类型	是否必须	说明	取值范围
businessType	String	否	业务线	如：linear_perpetual，spot
symbol	String	是	交易对名称	如：BTCUSDT
limit	Integer	否	返回的条数	默认 1000; 最大 5000

返回参数

参数名	数据类型	说明	取值范围
bids	String[][]	买盘	

[
    [65000,0.1],
    [65001,0.1],
    [65002,0.5]
[


asks	String[][]	卖盘	

[
    [65003,0.1],
    [65004,0.1],
    [65005,0.3],
    [65006,0.5],
    [65007,0.75]
[


lastUpdateId	Long	最新的深度Id	如：5001
K线数据

获取指定交易对的k线数据

HTTP请求

GET /v1/market/kline

请求参数

参数名	数据类型	是否必须	说明	取值范围
businessType	String	否	业务线	如：linear_perpetual，spot
period	String	是	周期	如：
1s，1m，3m，5m，15m，30m，1h，2h，4h，6h，8h，12h，1d，3d，1w，1M

symbol	String	是	交易对名称	如：BTCUSDT
startTime	Long	否	开始时间	如：1723541956000
endTime	Long	否	结束时间	如：1723541956000
limit	Integer	否	返回的条数	默认 1000; 最大 5000

返回参数

参数名	数据类型	说明	取值范围
data	String[][]	K线数据	

data[0][0]	String	周期	如：
1s，1m，3m，5m，15m，30m，1h，2h，4h，6h，8h，12h，1d，3d，1w，1M

data[0][1]	Long	开盘时间	

如：1723541956000


data[0][2]	Long	收盘时间	

如：1723541956000


data[0][3]	String	开盘价	如：56000
data[0][4]	String	收盘价	如：53000
data[0][5]	String	最高价	如：58000
data[0][6]	String	最低价	如：51000
data[0][7]	String	成交量	如：1200000
data[0][8]	String	成交额	如：250000000
data[0][9]	String	成交笔数	如：2000
data[0][10]	String	涨跌额	如：0.5
data[0][11]	String	涨跌幅	如：0.15
24H行情数据

获取指定交易对的24H价格滚动数据

HTTP请求

GET /v1/market/ticker/24hr

请求参数

参数名	数据类型	是否必须	说明	取值范围
businessType	String	否	业务线	如：linear_perpetual，spot
symbol	String	否	交易对名称	如：BTCUSDT，不填写返回所有币对的数据

返回参数

参数名	数据类型	说明	取值范围
symbol	String	交易对	如：BTCUSDT
lastPrice	String	最近一次成交价	

如：65999.09


priceChange	String	涨跌额	如：200
priceChangePercent	String	涨跌幅	如：3.5
highPrice	String	最高价	如：58000
lowPrice	String	最低价	如：51000
volume	String	成交量	如：190000
quoteVolume	String	成交额	如：390000
count	String	成交笔数	如：3000
baseCurrency	String	

基础币种

	如：BTC
行情简化数据

获取指定交易对简化行情数据

HTTP请求

GET /v1/market/ticker/mini

请求参数

参数名	数据类型	是否必须	说明	取值范围
businessType	String	否	业务线	如：linear_perpetual，spot
symbol	String	否	交易对名称	如：BTCUSDT，不填写返回所有币对的数据

返回参数

参数名	数据类型	说明	取值范围
symbol	String	交易对	如：BTCUSDT
lastPrice	String	最近一次成交价	

如：65999.09


priceChange	String	涨跌额	如：150
priceChangePercent	String	涨跌幅	如：1.2
volume	String	成交量	如：18000
quoteVolume	String	成交额	如：28000
成交记录

获取指定交易对的近期成交信息

HTTP请求

GET /v1/market/trade

请求参数

参数名	数据类型	是否必须	说明	取值范围
businessType	String	否	业务线	如：linear_perpetual，spot
symbol	String	是	交易对名称	如：BTCUSDT
limit	Integer	否	返回的条数	默认 100; 最大 5000

返回参数

参数名	数据类型	说明	取值范围
symbol	String	交易对	如：BTCUSDT
price	String	价格	

如：65999.09


qty	String	数量	如：300
time	long	成交时间	如：1704366000000


side

	

String

	

买卖方向 (buy-买；sell-卖)

	如：buy
交易对搜索

根据交易对名称模糊搜索交易对列表

HTTP请求

GET /v1/market/search

请求参数

参数名	数据类型	是否必须	说明	取值范围
symbol	String	是	交易对名称	如：BTC
pageNum	Integer	否	分页页码	默认：1
pageSize	Integer	否	分页大小	默认：10

返回参数

参数名	数据类型	说明	取值范围
pageNum	Integer	当前页码	如：1
pageSize	Integer	分页大小	如：10
totalSize	Integer	总条数	如：100
totalPage	Integer	总页数	如：3
list[0].businessType	String	业务线	如：linear_perpetual，spot
list[0].symbol	String	交易对	如：BTCUSDT
list[0].lastPrice	String	最近一次成交价	

如：65999.09


list[0].priceChange	String	涨跌额	如：200
list[0].priceChangePercent	String	涨跌幅	如：3.5
list[0].highPrice	String	最高价	如：58000
list[0].lowPrice	String	最低价	如：51000
list[0].volume	String	成交量	如：190000
list[0].quoteVolume	String	成交额	如：390000
list[0].baseCurrency	String	

基础币种

	如：BTC
交易对排行榜

获取交易对排行榜

HTTP请求

GET /v1/market/rankings

请求参数

参数名	数据类型	是否必须	说明	取值范围
businessType	String	否	业务线	如：linear_perpetual，spot
type	Integer	否	排行榜类型	如：1（市值），2（成交额），3（涨幅），4（跌幅），5（热门榜）
pageNum	Integer	否	分页页码	默认：1
pageSize	Integer	否	分页大小	默认：10

返回参数

参数名	数据类型	说明	取值范围
pageNum	Integer	当前页码	如：1
pageSize	Integer	分页大小	如：10
totalSize	Integer	总条数	如：100
totalPage	Integer	总页数	如：3
list[0].businessType	String	业务线	如：linear_perpetual，spot
list[0].symbol	String	交易对	如：BTCUSDT
list[0].lastPrice	String	最近一次成交价	

如：65999.09


list[0].priceChange	String	涨跌额	如：200
list[0].priceChangePercent	String	涨跌幅	如：3.5
list[0].highPrice	String	最高价	如：58000
list[0].lowPrice	String	最低价	如：51000
list[0].volume	String	成交量	如：190000
list[0].quoteVolume	String	成交额	如：390000
list[0].marketCap	String	总市值	如：8888888888
机会/市值榜

获取虚拟币市值榜

HTTP请求

GET /v1/market/cryptocurrency/quotes/latest

请求参数

参数名	数据类型	是否必须	说明	取值范围
pageNum	Integer	否	分页页码	默认：1
pageSize	Integer	否	分页大小	默认：10

返回参数

参数名	数据类型	说明	取值范围
pageNum	Integer	当前页码	如：1
pageSize	Integer	分页大小	如：10
totalSize	Integer	总条数	如：100
totalPage	Integer	总页数	如：3
list[0].symbol	String	简称	如：
list[0].name	String	全称	如：
list[0].price	String	价格（USD）	

如：


list[0].percentChange24h	String	24小时价格变动百分比	如：
list[0].percentChange7d	String	7日价格变动百分比	如：
list[0].percentChange30d	String	30日价格变动百分比	如：
list[0].marketCap	String	总市值	如：
list[0].volume24h	String	交易量（24小时）	如：
list[0].volume7d	String	交易量（7日）	如：
list[0].volume30d	String	交易量（30日）	如：
list[0].circulatingSupply	String	流通供应量	如：
list[0].totalSupply	String	总供应量	如：
list[0].maxSupply	String	最大供应量	如：
3.WebSocket 接口
协议头

通过Https协议握手升级到WebSocket协议时，可以通过设置一些协议头参数指定客户端接收数据的压缩类型和序列号类型

WSS /v1/market

请求头

参数名	数据类型	是否必须	说明	取值范围
serializer	String	否	序列号类型	

默认：json

可选：protobuf，protostuff，SBE，json，xml


compress	String	否	数据压缩类型	

默认：zip

可选：pako，zip，json，xml

心跳检查

客户端可以主动维持心跳，或者被动回复PING响应即可维持连接

WSS /v1/market

服务端心跳检查

读空闲	写空闲	读或者写空闲	连接空闲断连	说明
30s	60s	180s	60s	检查到空闲后服务端会主动发“PING”消息给客户端，如何客户端回复了“PONG”消息，连接的空闲检查计时器会重置。

客户端维持心跳




消息体（文本类型）	说明
PING	客户端可以通过主动发“PING”请求给服务端即可和服务端保持连接，服务端收到“PING”请求后也会回复“PONG”消息给客户端。




24H行情频道

实时获取指定交易对的行情信息

请求

WSS /v1/market

请求参数

参数名	数据类型	是否必须	说明	取值范围
event	String	是	事件类型	如：subscribe，unsubscribe
data	List<Object>	是	数据,支持批量订阅	

data[0].stream	String	是	主题	ticker24hr
data[0].businessType	String	是	业务线	如：linear_perpetual
data[0].symbol	String	否	交易对，不传可订阅所有交易对	如：BTCUSDT

返回参数

参数名	数据类型	说明	取值范围
event	String	事件类型	如：subscribe，unsubscribe
stream	String	主题	

ticker24hr


message	String	处理结果	如：success，fail
code	Int	响应代码	如：200

推送数据参数

参数名	数据类型	说明	取值范围
symbol	String	交易对	如：BTCUSDT
lastPrice	String	最近一次成交价	

如：65999.09


priceChange	String	涨跌额	如：100
priceChangePercent	String	涨跌幅	如：2.8
highPrice	String	最高价	如：58000
lowPrice	String	最低价	如：51000
volume	String	成交量	如：2900000
quoteVolume	String	成交额	如：3900000
count	String	成交笔数	如：2000
Mini行情频道 

实时获取指定交易对的行情信息

请求

WSS /v1/market

请求参数

参数名	数据类型	是否必须	说明	取值范围
event	String	是	事件类型	如：subscribe，unsubscribe
data	List<Object>	是	数据,支持批量订阅	

data[0].stream	String	是	主题	miniTicker
data[0].businessType	String	是	业务线	如：linear_perpetual
data[0].symbol	String	否	交易对，不传可订阅所有交易对	如：BTCUSDT

返回参数

参数名	数据类型	说明	取值范围
event	String	事件类型	如：subscribe，unsubscribe
stream	String	主题	

miniTicker


message	String	处理结果	如：success，fail
code	Int	响应代码	如：200

推送数据参数

参数名	数据类型	说明	取值范围
symbol	String	交易对	如：BTCUSDT
lastPrice	String	最近一次成交价	

如：65999.09


priceChange	String	涨跌额	如：100
priceChangePercent	String	涨跌幅	如：2.5
volume	String	成交量	如：290000
quoteVolume	String	成交额	如：4900000
K线频道

实时获取指定交易对的最新K线数据

请求

WSS /v1/market

请求参数

参数名	数据类型	是否必须	说明	取值范围	完整请求参数例子
event	String	是	事件类型	如：subscribe，unsubscribe	




{"event":"subscribe",
"data":[{"businessType":"linear_perpetual","symbol":"ETHUSDT","stream":"kline#15m"}]}







data	List<Object>	是	数据,支持批量订阅	

data[0].stream	String	是	主题	

kline#${period}

period:周期

取值：1s，1m，3m，5m，15m，30m，1h，2h，4h，6h，8h，12h，1d，3d，1w，1M

举例：订阅15m刻度的主题，stream为kline#15m


data[0].businessType	String	是	业务线	如：linear_perpetual
data[0].symbol	String	否	交易对，不传可订阅所有交易对	如：BTCUSDT

返回参数

参数名	数据类型	说明	取值范围
event	String	事件类型	如：subscribe，unsubscribe
stream	String	主题	

kline#${period}


message	String	处理结果	如：success，fail
code	Int	响应代码	如：200

推送数据参数

参数名	数据类型	说明	取值范围
symbol	String	交易对	如：BTCUSDT


period

	String	周期	如：
1s，1m，3m，5m，15m，30m，1h，2h，4h，6h，8h，12h，1d，3d，1w，1M



openTime

	long	开盘时间	

如：1723541956000




closeTime

	long	收盘时间	

如：1723541956000




openPrice

	String	开盘价	如：56000


closePrice

	String	收盘价	如：53000


highPrice

	String	最高价	如：58000


lowPrice

	String	最低价	如：51000


volume

	String	成交量	如：1200000


quoteVolume

	String	成交额	如：250000000


count

	String	成交笔数	如：2000


priceChange

	String	涨跌额	如：0.5


priceChangePercent

	String	涨跌幅	如：0.15
深度频道

实时获取指定交易对的最新深度变化数据

请求

WSS /v1/market

请求参数

参数名	数据类型	是否必须	说明	取值范围	完整请求参数例子
event	String	是	事件类型	如：subscribe，unsubscribe	


{"event":"subscribe",
"data":[{"businessType":"linear_perpetual","symbol":"BTCUSDT","stream":"depth#100ms"}]}

 





data	List<Object>	是	数据,支持批量订阅	

data[0].stream	String	是	主题	

depth#${interval}

interval:数据接收频率，单位毫秒；不填默认为100ms频率，为0表示实时。

取值：0ms，100ms，500ms，1000ms

默认：100ms

举例：订阅100ms频率的主题，stream为depth#100ms


data[0].businessType	String	是	业务线	如：linear_perpetual
data[0].symbol	String	否	交易对，不传可订阅所有交易对	如：BTCUSDT
data[0].interval	Integer	否	数据接收频率，单位毫秒；不填默认为100ms频率，为0表示实时。	

默认：100ms

如：0ms，100ms，500ms，1000ms

返回参数

参数名	数据类型	说明	取值范围
event	String	事件类型	如：subscribe，unsubscribe
stream	String	主题	

depth#${interval}


message	String	处理结果	如：success，fail
code	Int	响应代码	如：200

推送数据参数

参数名	数据类型	说明	取值范围
symbol	String	交易对	如：BTCUSDT
bids	String[][]	买盘	

[
    [65000,0.1],
    [65001,0.1],
    [65002,0.5]
[


asks	String[][]	卖盘	

[
    [65003,0.1],
    [65004,0.1],
    [65005,0.3],
    [65006,0.5],
    [65007,0.75]
[


lastUpdateId	long	最新的深度Id	如：5001
preUpdateId	long	上次推送的深度Id	如：5000
交易频道

实时获取指定交易对的最新成交数据

请求

WSS /v1/market

请求参数

参数名	数据类型	是否必须	说明	取值范围
event	String	是	事件类型	如：subscribe，unsubscribe
data	List<Object>	是	数据,支持批量订阅	

data[0].stream	String	是	主题	trade
data[0].businessType	String	是	业务线	如：linear_perpetual
data[0].symbol	String	否	交易对，不传可订阅所有交易对	如：BTCUSDT

返回参数

参数名	数据类型	说明	取值范围
event	String	事件类型	如：subscribe，unsubscribe
stream	String	主题	

trade


message	String	处理结果	如：success，fail
code	Int	响应代码	如：200

推送数据参数

参数名	数据类型	说明	取值范围
symbol	String	交易对	如：BTCUSDT
price	String	价格	

如：65999.09


qty	String	数量	如：200
time	long	成交时间	如：1704366000000


side

	

String

	

买卖方向 (buy-买；sell-卖)

	如：buy
指数频道

实时获取指定交易对的指数价，标记价

请求

WSS /v1/market

请求参数

参数名	数据类型	是否必须	说明	取值范围
event	String	是	事件类型	如：subscribe，unsubscribe
data	List<Object>	是	数据,支持批量订阅	

data[0].stream	String	是	主题	index
data[0].businessType	String	是	业务线	如：linear_perpetual
data[0].symbol	String	否	交易对，不传可订阅所有交易对	如：BTCUSDT

返回参数

参数名	数据类型	说明	取值范围
event	String	事件类型	如：subscribe，unsubscribe
stream	String	主题	

index


message	String	处理结果	如：success，fail
code	Int	响应代码	如：200

推送数据参数

参数名	数据类型	说明	取值范围
symbol	String	交易对	如：BTCUSDT
priceIndex	String	指数价格	

如：65999.09


markPrice	String	标记价格	如：65998
lastPrice	String	最新成交价	如：65997
fundingRate	String	资金费率
（按滚动周期时间计算平均溢价指数）
	如：0.005


periodFundingRate

	String	
上次结算资金费率
	如：0.005


toNextFundRateTime

	Long	
距离下次资金费结算时间
（倒计时）	如：1704366000000


time

	Long	
指数价生成时间
	如：1704366000000


version

	Long	版本号	如：101
客户端如何正确在本地维护一个订单薄
订阅 wss://{uri}/v1/market@depth#100ms
开始缓存收到的更新。同一个价位，后收到的更新覆盖前面的。
访问Rest接口 https://{uri}/v1/market/depth 获得一个深度快照。
将目前缓存到的信息中lastUpdateId小于步骤3中获取到的快照中的lastUpdateId的部分丢弃(丢弃更早的信息，已经过期)。
将深度快照中的内容更新到本地订单薄副本中，并从websocket接收到的第一个lastUpdateId >= lastUpdateId+1 的增量数据开始继续更新本地副本。
每一个新的增量数据应该恰好等于上一个增量数据的lastUpdateId+1，否则可能出现了丢包，请从step3重新进行初始化。
每一个增量数据中的挂单量代表这个价格目前的挂单量绝对值，而不是相对变化。
如果某个价格对应的挂单量为0，表示该价位的挂单已经撤单或者被吃，应该移除这个价位。


