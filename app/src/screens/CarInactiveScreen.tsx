import React from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CarFrame } from '../ui/CarFrame';
import { DevAdvance } from '../ui/DevAdvance';
import { color, space } from '../theme';
import { visit } from '../data/mockVisit';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CarInactive'>;

export function CarInactiveScreen({ navigation }: Props) {
  return (
    <CarFrame below={<DevAdvance label="return to Home" onPress={() => navigation.popToTop()} />}>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.44, textTransform: 'uppercase', color: color.text.muted }}>
            Session inactive
          </Text>
          <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.44, textTransform: 'uppercase', color: color.text.muted }}>
            {visit.customer}
          </Text>
        </View>

        <View style={{ gap: space[2] }}>
          <Text style={{ fontFamily: 'Archivo_700Bold', fontSize: 30, lineHeight: 36, color: color.text.secondary }}>Saved, not reviewed</Text>
          <Text style={{ fontSize: 15, lineHeight: 21, color: color.text.muted }}>
            No rush — it'll be waiting on Home whenever you pick it back up.
          </Text>
        </View>

        <View style={{ height: 1, backgroundColor: color.border.subtle }} />
      </View>
    </CarFrame>
  );
}
