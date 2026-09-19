import React from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CarFrame } from '../ui/CarFrame';
import { DevAdvance } from '../ui/DevAdvance';
import { color, font, ink } from '../theme';
import { visit } from '../data/mockVisit';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CarReady'>;

export function CarReadyScreen({ navigation }: Props) {
  return (
    <CarFrame below={<DevAdvance label='"Oracle, start debrief"' onPress={() => navigation.replace('CarRecording')} />}>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 13, letterSpacing: 1.8, textTransform: 'uppercase', color: color.blueprint }}>
            Ready to debrief
          </Text>
          <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 13, letterSpacing: 1.4, textTransform: 'uppercase', color: ink(0.55) }}>
            Oracle Note
          </Text>
        </View>

        <View style={{ gap: 10 }}>
          <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 34, lineHeight: 36, color: color.ink }}>{visit.customer}</Text>
          <Text style={{ fontFamily: font.body.medium, fontSize: 14, lineHeight: 19, color: ink(0.6) }}>{visit.visitMeta}</Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderTopWidth: 1,
            borderTopColor: color.border,
            paddingTop: 12,
          }}
        >
          <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 14, letterSpacing: 1.2, textTransform: 'uppercase', color: color.blueprint }}>
            Say "Oracle, start debrief"
          </Text>
          <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: ink(0.5) }}>
            Existing customer visit
          </Text>
        </View>
      </View>
    </CarFrame>
  );
}
