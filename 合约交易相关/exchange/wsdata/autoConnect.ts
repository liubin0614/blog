import { useEffect, useRef, useCallback } from 'react';
import getWsStore from '@/stores/wsStore';
import { SubscriptionManager } from '@/utils/subscrib';

/**
 * WebSocket 自动重连 Hook 的配置接口
 * @interface UseWebSocketAutoReconnectProps
 */

// 全局重连状态控制
const reconnectState = {
  current: false,
  attempts: 0,
  maxAttempts: 3,
};

/**
 * WebSocket 自动重连 Hook
 * 用于管理 WebSocket 连接的自动重连机制
 *
 * @param props - Hook 配置项
 * @returns 包含重连相关方法的对象
 */
export function useWebSocketAutoReconnect() {
  /** 重连尝试次数计数器 */

  const wsStore = getWsStore();

  const { marketWs, notificationWs } = wsStore;

  // const reconnectAttempts = useRef(0);
  /** 重连定时器引用 */
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * 检查 WebSocket 连接是否健康
   * @returns {boolean} 如果所有 WebSocket 连接都正常则返回 true
   */
  const isConnectionHealthy = useCallback(() => {
    try {
      // return Boolean(marketWs?.isConnected() && notificationWs?.isConnected());
      const mWs = marketWs?.ws;
      const nWs = notificationWs?.ws;
      return (
        mWs?.readyState === WebSocket.OPEN && nWs?.readyState === WebSocket.OPEN
      );
    } catch (error) {
      console.error('检查 WebSocket 连接状态失败-------》', error);
      return false;
    }
  }, [marketWs, notificationWs]);

  /**
   * 执行快速重连流程
   * 包含多次重试和降级策略
   */
  const quickReconnect = useCallback(async () => {
    if (reconnectState.current) {
      console.log('已经在重连中，跳过本次重连');
      return;
    }
    const currentUrl = new URL(window.location.href);
    // window.location.replace(currentUrl.toString());
    // return;

    try {
      reconnectState.current = true;
      console.log('开始快速重连流程');
      reconnectState.attempts += 1;

      const attemptDirectReconnect = async (retryCount = 0, maxRetries = 3) => {
        if (retryCount >= maxRetries) {
          throw new Error('达到最大重试次数');
        }

        const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
        console.log(`第 ${retryCount + 1} 次尝试重连，延迟: ${delay}ms`);

        await new Promise((resolve) => setTimeout(resolve, delay));

        // 清理现有连接
        marketWs?.stopPing();
        notificationWs?.stopPing();
        marketWs?.close();
        notificationWs?.close();

        wsStore.initMarketWs();
        wsStore.initNotificationWs();

        return new Promise((resolve, reject) => {
          setTimeout(() => {
            if (isConnectionHealthy()) {
              resolve(true);
            } else {
              console.log(`第 ${retryCount + 1} 次重连失败，准备重试`);
              attemptDirectReconnect(retryCount + 1, maxRetries)
                .then(resolve)
                .catch(reject);
            }
          }, 1000);
        });
      };

      await attemptDirectReconnect();
      console.log('快速重连成功！');
      reconnectState.attempts = 0;
      const subscriptionManager = SubscriptionManager.getInstance();
      subscriptionManager.initSubscribe();
    } catch (error) {
      console.log('多次快速重连失败，尝试刷新重连');
      if (reconnectState.attempts >= reconnectState.maxAttempts) {
        // const currentUrl = new URL(window.location.href);
        window.location.replace(currentUrl.toString());
      }
    } finally {
      reconnectState.current = false;
    }
  }, [isConnectionHealthy, marketWs, notificationWs, wsStore]);

  /**
   * 定期检查连接状态的副作用
   * 每30秒检查一次连接状态，如果发现异常则触发重连
   */
  useEffect(() => {
    const checkConnection = () => {
      if (!isConnectionHealthy() && !reconnectState.current) {
        console.log('检测到连接异常，触发重连');
        quickReconnect();
      }
    };

    const intervalId = setInterval(checkConnection, 30000);

    // 清理函数
    return () => {
      clearInterval(intervalId);
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
    };
  }, [isConnectionHealthy, quickReconnect]);

  /**
   * 监听页面可见性变化的副作用
   * 当页面从后台切换到前台时，检查连接状态并在需要时重连
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !reconnectState.current) {
        console.log('页面重新可见，检查连接状态');
        if (!isConnectionHealthy()) {
          quickReconnect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isConnectionHealthy, quickReconnect]);

  return {
    quickReconnect,
    isConnectionHealthy,
  };
}
