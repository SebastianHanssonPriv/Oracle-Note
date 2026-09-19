import React from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CarFrame } from '../ui/CarFrame';
import { DevAdvance } from '../ui/DevAdvance';
import { color, font, ink } from '../theme';
import { visit } from '../data/mockVisit';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CarInactive'>;

export function CarInactiveScreen({ navigation }: Props) {
  return (
    <CarFrame below={<DevAdvance label="return to Home" onPress={() => navigation.popToTop()} />}>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 14, letterSpacing: 1.8, textTransform: 'uppercase', color: ink(0.55) }}>
            Session inactive
          </Text>
          <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 14, letterSpacing: 1.4, textTransform: 'uppercase', color: ink(0.55) }}>
            {visit.customer}
          </Text>
        </View>

        <View style={{ gap: 10 }}>
          <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 34, lineHeight: 37, color: ink(0.6) }}>
            Saved, not reviewed
          </Text>
          <Text style={{ fontFamily: font.body.medium, fontSize: 14.5, lineHeight: 19, color: ink(0.5) }}>
            Resume anytime from today's visits.
          </Text>
        </View>

        <View style={{ height: 1, backgroundColor: color.border }} />
      </View>
    </CarFrame>
  );
}
