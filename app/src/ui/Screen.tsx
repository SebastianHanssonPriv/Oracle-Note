import React from 'react';
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { color } from '../theme';

export function Screen({
  children,
  scroll = false,
  style,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const Wrapper = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.paper }} edges={['top', 'bottom']}>
      <Wrapper style={scroll ? undefined : [{ flex: 1 }, style]} contentContainerStyle={scroll ? [{ flexGrow: 1 }, style] : undefined}>
        {children}
      </Wrapper>
    </SafeAreaView>
  );
}
