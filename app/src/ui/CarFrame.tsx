import React from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Blueprint } from './Blueprint';
import { color, font, ink } from '../theme';

/**
 * Renders car-display content inside a bounded landscape card matching the
 * design's 560:320 head-unit mockup, centered on the phone screen. This is
 * not a real CarPlay/Android Auto surface — that would need a separate
 * native extension (see README "Known limitations"). The caption makes the
 * boundary explicit since, unlike the phone screens, this content does not
 * fill the device.
 */
export function CarFrame({ children, below }: { children: React.ReactNode; below?: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const frameWidth = Math.min(width - 48, 560);
  const frameHeight = frameWidth * (320 / 560);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#d9d9da' }} edges={['top', 'bottom']}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, backgroundColor: '#d9d9da', padding: 24 }}>
        <Text
          style={{
            fontFamily: font.condensed.semiBold,
            fontSize: 11,
            letterSpacing: 1.6,
            textTransform: 'uppercase',
            color: ink(0.45),
          }}
        >
          In-car display
        </Text>
        <Blueprint style={{ width: frameWidth, height: frameHeight, backgroundColor: color.paper, padding: frameWidth > 420 ? 30 : 18 }}>
          {children}
        </Blueprint>
        {below}
      </View>
    </SafeAreaView>
  );
}
