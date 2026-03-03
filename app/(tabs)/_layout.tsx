import { Tabs } from 'expo-router';
import React from 'react';

import { BottomNavBar } from '@/components/bottom-nav-bar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomNavBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="reel"
        options={{
          title: 'Reel',
        }}
      />
    </Tabs>
  );
}
