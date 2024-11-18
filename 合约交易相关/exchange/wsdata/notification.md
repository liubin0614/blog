1.接口描述
     私有推送主要使用WebSocket接口对外提供访问。
2.WebSocket 接口
协议头

通过Https协议握手升级到WebSocket协议时，可以通过设置一些协议头参数指定客户端接收数据的压缩类型和序列号类型

WSS /v1/notification

请求头

参数名	数据类型	是否必须	说明	取值范围
serializer	String	否	序列号类型	

默认：json

可选：protobuf，protostuff，SBE，json，xml


compress	String	否	数据压缩类型	

默认：zip

可选：pako，zip，json，xml

用户认证

私有推送建立WebSocket连接后，在订阅之前需要先进行认证，认证失败或未认证的情况下无法进行主题订阅。

WSS /v1/notification

请求参数

参数名	数据类型	是否必须	说明	取值范围
event	String	是	事件类型	authorization
data	Object	是	数据	

data.type	String	是	认证类型	Token
data.token	String	是	

用户token

当检测到用户token过期后服务端会主动发送给客户端用户token过期的消息，并断开和客户端的连接。

客户端收到token过期消息后需要重新建立连接并订阅主题。

	用户token

返回参数

参数名	数据类型	说明	取值范围
event	String	事件类型	authorization
message	String	响应消息	如：success，fail
code	Int	响应代码	如：200
持仓频道

实时获取用户持仓变化信息

请求

WSS /v1/notification

请求参数

参数名	数据类型	是否必须	说明	取值范围
event	String	是	事件类型	如：subscribe，unsubscribe
data	List<Object>	是	数据,支持批量订阅	

data[0].stream	String	是	主题	position
data[0].accountId	Long	是	账户id	 
data[0].businessType	String	否	业务线	如：linear_perpetual
data[0].symbol	String	否	交易对，不传可订阅所有交易对	如：BTCUSDT

返回参数

参数名	数据类型	说明	取值范围
event	String	事件类型	如：subscribe，unsubscribe
stream	String	主题	

position


message	String	处理结果	如：success，fail
code	Int	响应代码	如：200
data	Object	业务数据	





推送数据参数

参数名

	

类型

	

描述


accountId	Long	账户id
businessType	String	产品类型
symbol	String	交易对名称
symbol	String	交易对名称
positionId	Long	持仓ID
positionQty	String	持仓数量
avgPrice	String	开仓平均价
upl	String	未实现收益(以标记价格计算)
lever	int	杠杆倍数
liquidationPrice	String	预估强平价
markPrice	String	标记价格
im	String	初始保证金
mm	String	维持保证金
indexPrice	String	最新指数价格
realizadPnl	String	已实现收益,仅适用于交割/永续/期权
pnl	String	平仓订单累计收益额
fee	String	累计手续费金额,正数代表平台返佣,负数代表平台扣除
fundingFee	String	累计资金费用
createTime	Long	持仓创建时间
updateTime	Long	持仓最后更新时间戳
positionId	Long	仓位id




订单频道

实时获取用户当前委托

请求参数

参数名	数据类型	是否必须	说明	取值范围
event	String	是	事件类型	如：subscribe，unsubscribe
data	List<Object>	是	数据,支持批量订阅	

data[0].stream	String	是	主题	orders
data[0].businessType	String	否	业务线	如：linear_perpetual
data[0].symbol	String	否	交易对，不传可订阅所有交易对	如：BTCUSDT
data[0].accountId	Long	是	账户id	


返回参数

参数名	数据类型	说明	取值范围
event	String	事件类型	如：subscribe，unsubscribe
stream	String	主题	

orders


message	String	处理结果	如：success，fail
code	Int	响应代码	如：200

推送数据参数

参数名	类型	描述
accountId	Long	账户id
uid	Long	操作用户id
username	String	操作用户名
businessType	String	业务类型linear_perpetual/linear_futures/inverse_perpetual/inverse_futures/options/spot/leverage
symbolId	int	交易对id
symbol	String	交易对名称
orderId	Long	订单id
clientOrderId	String	客户端自定义订单ID
price	String	委托价格,对于期权,以币(如BTC,ETH)为单位
qty	String	委托数量
pnl	Struing	收益,适用于有成交的平仓订单,其它情况均为0
orderType	String	订单类型
side	String	订单方向
totalFillQty	String	累计成交数量,对于币币和杠杆,单位为基础币种;对于交割.永续以及期权,单位为张
avgPrice	String	成交均价,如果成交数量为0,该字段也为""
status	String	订单状态,pending/new/partially_filled/prtially_canceled/canceled/filled/expired/rejected
lever	int	杠杆倍数
baseFee	String	基础币种手续费
quoteFee	String	计价币种手续费
source	String	订单来源none/api/web/ios/android/client/riskEngine/match/admin
reduceOnly	boolean	是否只减仓,true或false
createTime	Long	创建时间
updateTime	Long	更新时间
cancelSource	String	撤单来源none/api/web/ios/android/client/riskEngine/match/admin
cancelUid	Long	撤单用户uid
cancelUsername	String	撤单用户名
category	String	订单分类
timeInForce	String	事件生效类型
unFrozen	String	解冻量
canceledQty	String	撤单量
quoteQty	String	计价币种数量
marketUnit	String	现货市价下单单位,baseCoin(基础币种)/quoteCoin(计价币种)
tradeList	List<Trade>	成交列表，数据结构请参考如下Trade

Trade

参数名	类型	描述
pnl	String	收益，适用于平仓成交
orderType	String	订单类型，参考报单接口
side	String	订单方向
positionSide	String	持仓方向
fillPrice	String	成交价格，如果成交数量为0，该字段为""
tradeId	Long	成交id，对应撮合结果id，symbol + orderId + tradeId唯一
counterPartyAccountId	Long	对手方账户id，与账户中心portfolioId一一对应
role	String	成交角色，taker/maker
fillQty	String	最新成交数量
fillTime	Long	最新成交时间
lever	Integer	杠杆倍数
feeCurrency	String	交易手续费币种
fee	String	手续费
faceOrderId	Long	对手方订单id
faceAccountId	Long	对手方账户id
prePositionSide	String	成交前多空方向,long/short
postPositionSide	String	成交后多空方向,long/short
prePositionQty	String	成交前持仓量
postPositionQty	String	成交后持仓量
preAvgPrice	String	成交前持仓均价
postAvgPrice	String	成交后持仓均价





资金账户频道

实时获取用户资金变化信息

请求参数

参数名	数据类型	是否必须	说明	取值范围
event	String	是	事件类型	如：subscribe，unsubscribe
data	List<Object>	是	数据,支持批量订阅	

data[0].stream	String	是	主题	tradingAccount
data[0].accountId	Long	是	账户id	 

返回参数

参数名	数据类型	说明	取值范围
event	String	事件类型	如：subscribe，unsubscribe
stream	String	主题	

tradingAccount


message	String	处理结果	如：success，fail
code	Int	响应代码	如：200




推送数据参数

参数名

	

类型

	

描述


updateTime	Long	账户信息更新时间
accountId	Long	账户id
userType	Integer	用户类型
totalEquity	String	usdt折合总权益，如下资金字段如无特殊说明默认以USDT为单位
totalMarginBalance	String	账户总保证金
totalEffectiveBalance	String	总有效保证金
totalAvailableBalance	String	总可用保证金
totalPositionValue	String	总仓位价值
totalIm	String	总占用保证金
totalMm	String	总维持保证金
totalOpenLoss	String	保证金开平仓损失
mmr	String	总维持保证金率
imr	String	总占用保证金率
accountLeverage	String	账户杠杆
totalUpl	String	账户层面未实现盈亏
details	Array	各币种资产详细信息
> currency	String	币种
> equity	String	币种总权益
> balance	String	币种余额
> borrow	String	杠杆借币
> realLiability	String	真实负债
> potentialLiability	String	潜在负债
> accruedInterest	String	累计利息
> upl	String	未实现盈亏
> positionInitialMargin	String	
合约仓位占用保证金

> orderInitialMargin	String	
订单占用保证金

> updateTime	Long	最后更新时间








