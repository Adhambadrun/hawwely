import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

/** true when the device has a usable internet connection (optimistic default). */
export function useOnline(): boolean {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setOnline(Boolean(state.isConnected) && state.isInternetReachable !== false);
    });
    return unsub;
  }, []);
  return online;
}
