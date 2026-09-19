import React from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../ui/Screen';
import { PhoneChrome } from '../ui/PhoneChrome';
import { Button } from '../ui/Button';
import { Row } from '../ui/Row';
import { color, space } from '../theme';
import { syncedRows, visit } from '../data/mockVisit';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Synced'>;

export function SyncedScreen({ navigation }: Props) {
  return (
    <Screen>
      <PhoneChrome time="11:13" />
      <View style={{ paddingHorizontal: space[4], paddingTop: space[4], paddingBottom: space[5], borderBottomWidth: 1, borderBottomColor: color.border.subtle }}>
        <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.44, textTransform: 'uppercase', color: color.text.brand }}>Synced 11:13</Text>
        <Text style={{ fontFamily: 'Archivo_700Bold', fontSize: 28, lineHeight: 34, marginTop: space[1], color: color.text.primary }}>
          Six fields written{'\n'}to your CRM
        </Text>
        <Text style={{ fontSize: 13, lineHeight: 19, color: color.text.muted, marginTop: space[2] }}>
          {visit.customer} · {visit.visitKind.toLowerCase()}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        {syncedRows.map((r) => (
          <Row key={r.label} label={r.label} value={r.value} badge={r.badge} />
        ))}
        <Text style={{ padding: space[4], fontSize: 12.5, lineHeight: 19, color: color.text.muted }}>
          Total rep effort after the visit: one spoken debrief and three answers. No form filling.
        </Text>
      </View>

      <View style={{ padding: space[4] }}>
        <Button label="Back to today" variant="secondary" size="lg" block onPress={() => navigation.popToTop()} />
      </View>
    </Screen>
  );
}
