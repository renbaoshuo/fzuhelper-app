import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';

import { Provider } from '@/components/Provider';

import '../global.css';

export default function RootLayout() {
  return (
    <Provider>
      <Stack>
        <Stack.Screen name="(root)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>

      <PortalHost />
    </Provider>
  );
}
