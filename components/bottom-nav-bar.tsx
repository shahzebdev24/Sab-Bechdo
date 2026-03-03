import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CommentIcon, ProfileIcon, ReelIcon } from '@/components/bottom-icons';
import { theme } from '@/theme';

const ROUTE_KEYS: (string | null)[] = ['index', 'reel', null, null, null];

export function BottomNavBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const handlePress = (index: number) => {
    if (index === 2) {
      router.push('/post-ad');
      return;
    }

    if (index === 3) {
      router.push('/chat');
      return;
    }

    if (index === 4) {
      router.push('/profile');
      return;
    }

    const routeKey = ROUTE_KEYS[index];
    if (!routeKey) return;

    navigation.navigate(routeKey as never);
  };

  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: insets.bottom > 0 ? insets.bottom : theme.spacing.lg },
      ]}>
      <View style={styles.bar}>
        {[0, 1, 2, 3, 4].map((index) => {
          const isCenter = index === 2;
          const routeKey = ROUTE_KEYS[index];
          const isFocused = !isCenter && routeKey === state.routes[state.index]?.name;

          const tint = isFocused ? theme.colors.primary : theme.colors.iconDefault;

          return (
            <TouchableOpacity
              key={`tab-${index}`}
              activeOpacity={0.9}
              onPress={() => handlePress(index)}
              style={[styles.item, isCenter && styles.centerButtonWrapper]}>
              <View style={isCenter ? styles.centerButton : styles.iconWrapper}>
                {index === 0 && (
                  <Ionicons name="home-outline" size={22} color={tint} />
                )}
                {index === 1 && <ReelIcon size={22} color={tint} />}
                {isCenter && (
                  <Ionicons name="add" size={26} color={theme.colors.card} />
                )}
                {index === 3 && <CommentIcon size={22} color={tint} />}
                {index === 4 && <ProfileIcon size={22} color={tint} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0, // Padding bottom is applied dynamically
    backgroundColor: 'transparent',
    paddingBottom: 20,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 32,
    paddingHorizontal: 24,
    height: 64,
    shadowColor: '#4A54DF',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButtonWrapper: {
    top: -24,
    height: 'auto',
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
});

