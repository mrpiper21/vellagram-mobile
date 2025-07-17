import * as Network from 'expo-network';
import { useEffect, useState } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkStatus() {
      const state = await Network.getNetworkStateAsync();
      const online = !!state.isConnected && !!state.isInternetReachable;
      if (isMounted) setIsOnline(online);
    }

    checkStatus();
    const interval = setInterval(checkStatus, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return isOnline;
} 