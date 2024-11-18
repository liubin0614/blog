# layer2

## 目录

- [什么是比特币Layer 2网络？](#什么是比特币Layer-2网络)
- [为什么要推出比特币Layer 2网络？](#为什么要推出比特币Layer-2网络)
- [比特币Layer 2网络如何运作](#比特币Layer-2网络如何运作)
  - [1.状态通道](#1状态通道)
  - [2.区块链汇总](#2区块链汇总)
  - [3.侧链](#3侧链)
- [比特币Layer 2解决方案示例](#比特币Layer-2解决方案示例)
  - [1.闪电网络](#1闪电网络)
  - [2.Rootstock (RSK)](#2Rootstock-RSK)
  - [3.Stacks Protocol](#3Stacks-Protocol)
  - [4.Liquid Network](#4Liquid-Network)

## 什么是比特币Layer 2网络？

比特币Layer 2网络是建立在比特币区块链之上的协议。它们通常旨在解决主链所面临的性能问题或其他限制。Layer 2协议在主链之外处理交易，提供更高的可扩展性和可编程性及支持各种DApp的扩展功能等优势。

## 为什么要推出比特币Layer 2网络？

比特币的设计初衷是成为一个去中心化的安全支付系统，但其在可扩展性方面却面临限制。事实证明，在成交量较高的时期，平均10分钟的出块时间和每秒7笔交易([TPS](https://academy.binance.com/zh/glossary/transactions-per-second-tps "TPS"))的吞吐量无法满足用户的交易需求，从而会导致手续费增加并出现延迟。

比特币区块链有限的脚本语言也限制了其支持复杂[智能合约](https://academy.binance.com/zh/articles/what-are-smart-contracts "智能合约")和去中心化应用程序([DApp](https://academy.binance.com/zh/articles/what-are-decentralized-applications-dapps "DApp"))的能力。为应对这些挑战，比特币Layer 2网络的概念应运而生。

## 比特币Layer 2网络如何运作

[Layer 2](https://academy.binance.com/zh/glossary/layer-2 "Layer 2")解决方案基于链下处理原则运作，即在主链之外处理交易，从而减轻了[Layer 1](https://academy.binance.com/zh/articles/what-is-layer-1-in-blockchain "Layer 1")网络的负担。通过创建链下通道，用户可以进行多笔交易，而无需将每笔交易直接添加至区块链中。这种链下处理方法不仅提高了交易吞吐量，还最大限度地降低了手续费，让微交易和销售点交易变得更加切实可行。

支撑比特币Layer 2网络功能的机制包括状态通道、汇总链和侧链。

### 1.状态通道

依托状态通道，[闪电网络](https://academy.binance.com/zh/articles/what-is-lightning-network "闪电网络")等Layer 2解决方案可赋能用户创建用于收发款项的端到端加密通道。这些通道内的交易在链下进行，只需向主网报告期初和期末余额，从而减少网络拥堵并提高交易效率。

### 2.区块链汇总

区块链[汇总](https://academy.binance.com/zh/articles/optimistic-vs-zero-knowledge-rollups-what-s-the-difference "汇总")（包括乐观汇总和零知识汇总）可将多笔交易在链下合并为一条数据，然后再将其添加至主链中。这种方法不仅提高了可扩展性，还可以显著提高交易吞吐量。

### 3.侧链

侧链是拥有自己的[共识机制](https://academy.binance.com/zh/articles/what-is-a-blockchain-consensus-algorithm "共识机制")的独立区块链，通过双向跨链桥连接至Layer 1区块链。这种连接不仅可以实现区块链之间的资产划转、支持更多Layer 2解决方案，还可以拓展比特币网络的功能。

## 比特币Layer 2解决方案示例

比特币生态系统已经推出了多个Layer 2解决方案，各方案均有助于提高可扩展性及引入新的功能。

### 1.闪电网络

闪电网络于2018年推出，它采用状态通道，在比特币Layer 1网络之上实现了微交易。闪电网络在链下处理多笔交易，并在主链上结算期初和期末余额，以此来提高交易速度并降低交易成本。

### 2.Rootstock (RSK)

Rootstock是一条侧链，开创了比特币区块链上智能合约的先河。它支持用户将比特币发送至Rootstock网络，随后，这部分比特币将成为用户RSK钱包中锁定的Smart Bitcoin (RBTC)，从而提高交易速度并降低交易成本。

### 3.Stacks Protocol

Layer 2区块链Stacks Protocol（原名为Blockstack）可为比特币区块链上的智能合约和DApp提供支持。Stacks利用微区块来提高交易速度，并采用传输证明(PoX)机制，将交易与比特币区块链联系起来。

### 4.Liquid Network

Liquid Network是一条比特币Layer 2侧链，它采用双向锚定机制，支持用户来回划转比特币。当BTC被划转至Liquid Network时，将以1:1的比例兑换为Liquid BTC (L-BTC)。该链还支持代币和其他数字资产的发行。
