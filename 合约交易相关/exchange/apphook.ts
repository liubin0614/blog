import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { usePathname } from 'next/navigation';
import OpenOrderStore from '@/stores/openOrderStore';
import { SubscriptionManager } from '@/utils/subscrib';
import getWsStore from '@/stores/wsStore';
import getSpotMarketStore, {
  defaultIndexData,
} from '@/stores/spot/marketStore';
import getSelfFavoritesStore from '@/stores/favoriteStore';
// import getPerpetualMarketStore from '@/stores/perpetual/marketStore';
import { PathName } from '@/constants/router';
import getTokenStore from '@/stores/tokenStore';
// import getportfolioStore from '@/stores/portfolioStore';

import getTradeCommonStore from '@/stores/tradeCommonStore';

import getSpotCommonStore from '@/stores/spot/commonStore';
import getPerpetualCommonStore from '@/stores/perpetual/commonStore';
import { useWebSocketAutoReconnect } from '@/hooks/useWebSocketAutoReconnect';

const tradeCommonStore = getTradeCommonStore();

const useAppHook = () => {
  const router = useRouter();
  const pathName = usePathname();
  const { accountId, accessToken } = getTokenStore();
  let { symbol } = router.query;
  const spotCommonStore = getSpotCommonStore();
  const perpetualCommonStore = getPerpetualCommonStore();
  const { currentSymbol } = spotCommonStore;
  // const { current: accountId } = getportfolioStore();
  const openOrderStore = OpenOrderStore();
  const spotMarketStore = getSpotMarketStore();

  const selfFavoriteStore = getSelfFavoritesStore();

  if (typeof window !== 'undefined') {
    // todo
    useWebSocketAutoReconnect();
  }

  // 路由重定向
  useEffect(() => {
    if (pathName?.includes(`/${PathName.SPOT}`)) {
      // spot
      if (symbol) {
        if (Array.isArray(symbol)) {
          symbol = symbol[0];
        }
        spotCommonStore.setCurrentSymbol({ symbol } as { symbol: string });
        // 针对单一币种的数据会做更新
        spotMarketStore.setSpotMarket24hrForCurrentSymbol(symbol);
      } else {
        router.push(`/${PathName.SPOT}/${currentSymbol}`);
      }
    } else if (pathName?.includes(`/${PathName.PERPETUAL}`)) {
      // perpetual
      if (symbol) {
        if (Array.isArray(symbol)) {
          symbol = symbol[0];
        }
        perpetualCommonStore.setCurrentSymbol({ symbol } as { symbol: string });
      } else {
        router.push(`/${PathName.PERPETUAL}/${currentSymbol}`);
      }
    }
  }, [symbol, pathName]);

  // 涉及到多业务线 busnessType  两个及以上需要用到的接口 整体发起接口，
  // 整体发起接口 开始
  useEffect(() => {
    // 获取24小时行情行情
    spotMarketStore.getSpotMarketTicker24hr();
    // 获取所有的交易对基础信息
    tradeCommonStore.getBaseSymbolInfoRes();
  }, []);

  // 币对基本信息
  useEffect(() => {
    perpetualCommonStore.getPerpetualSymbolBaseInfo();
    spotCommonStore.getSpotSymbolBaseInfo();
  }, []);

  // 整体发起接口 结束

  // ws 初始化
  useEffect(() => {
    // 初始化 ws
    const subscriptionManager = SubscriptionManager.getInstance();
    subscriptionManager.loadSubscriptionsFromStorage();
    subscriptionManager.initSubscribe();

    const wsStore = getWsStore();
    // 现货 24 hr
    spotMarketStore.getSpotMarketTicker24hrWs(wsStore);
    // 合约 24 hr
    // perpetualMarketStore.getMarketPerpetualTicker24rWs(wsStore);
    // mini ticker
    spotMarketStore.getMiniMarketTickerWs(wsStore);
    // index
    spotMarketStore.registerIndexUpdater(wsStore);
    // todo 当前仓位
  }, []);

  useEffect(() => {
    if (accountId) {
      // 现货委托单
      openOrderStore.getOrderFromWs();
    }
  }, [accountId]);

  useEffect(() => {
    // 登陆态变化就要重新发一次
    selfFavoriteStore.getSelfFavorites();
  }, [accessToken]);

  useEffect(() => {
    spotMarketStore.indexPriceForCurrentSymbol = defaultIndexData;
  }, [currentSymbol]);

  return {
    currentSymbol,
  };
};

export default useAppHook;
