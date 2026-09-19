import React from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../ui/Screen';
import { PhoneChrome } from '../ui/PhoneChrome';
import { CTAButton } from '../ui/CTAButton';
import { Row } from '../ui/Row';
import { color, font, ink } from '../theme';
import { syncedRows, visit } from '../data/mockVisit';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Synced'>;

export function SyncedScreen({ navigation }: Props) {
  return (
    <Screen>
      <PhoneChrome time="11:42" />
      <View style={{ paddingHorizontal: 18, paddingTop: 16, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: color.border }}>
        <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: color.blueprint }}>
          Synced 11:42
        </Text>
        <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 32, lineHeight: 34, marginTop: 6, color: color.ink }}>
          Six fields written{'\n'}to your CRM
        </Text>
        <Text style={{ fontFamily: font.body.medium, fontSize: 13, lineHeight: 19, color: ink(0.58), marginTop: 8 }}>
          {visit.customer} · {visit.visitKind.toLowerCase()}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        {syncedRows.map((r) => (
          <Row key={r.label} label={r.label} value={r.value} badge={r.badge} />
        ))}
        <Text style={{ padding: 18, fontFamily: font.body.medium, fontSize: 12.5, lineHeight: 19, color: ink(0.55) }}>
          Total rep effort after the visit: one spoken debrief and three answers. No form filling.
        </Text>
      </View>

      <View style={{ padding: 18 }}>
        <CTAButton label="Back to today" variant="ghost" onPress={() => navigation.popToTop()} />
      </View>
    </Screen>
  );
}
