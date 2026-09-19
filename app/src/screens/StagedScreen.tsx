import React, { useState } from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../ui/Screen';
import { PhoneChrome } from '../ui/PhoneChrome';
import { CTAButton } from '../ui/CTAButton';
import { Tag } from '../ui/Tag';
import { Row } from '../ui/Row';
import { TranscriptSheet } from '../ui/TranscriptSheet';
import { color, font, ink } from '../theme';
import { stagedFields, visit } from '../data/mockVisit';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Staged'>;

export function StagedScreen({ navigation }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <Screen>
      <PhoneChrome time="11:41" />
      <View style={{ paddingHorizontal: 18, paddingBottom: 13, borderBottomWidth: 1, borderBottomColor: color.border }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: ink(0.55) }}>
            In staging · not in CRM
          </Text>
          <View style={{ borderWidth: 1, borderColor: color.paleBlueBorderStrong, paddingHorizontal: 5, paddingVertical: 3 }}>
            <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 9.5, letterSpacing: 1.2, textTransform: 'uppercase', color: color.blueprint }}>
              Draft
            </Text>
          </View>
        </View>
        <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 26, lineHeight: 29, marginTop: 5, color: color.ink }}>{visit.customer}</Text>
        <Text style={{ fontFamily: font.body.medium, fontSize: 12, lineHeight: 17, color: ink(0.55), marginTop: 3 }}>
          {visit.visitKind} · {visit.visitDate}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        {stagedFields.map((f) => (
          <Row
            key={f.label}
            label={f.label}
            value={f.value}
            badge={f.badge}
            highlighted={'highlighted' in f ? f.highlighted : false}
            valueColor={'muted' in f && f.muted ? ink(0.5) : undefined}
            onPress={'linksToTranscript' in f && f.linksToTranscript ? () => setSheetOpen(true) : undefined}
          />
        ))}
        <Text style={{ padding: 18, fontFamily: font.body.medium, fontSize: 12, lineHeight: 18, color: ink(0.55) }}>
          Tap a row for the transcript line behind it. Transcript kept; audio deleted after transcription.
        </Text>
      </View>

      <View style={{ padding: 18, paddingTop: 12, borderTopWidth: 1, borderTopColor: color.border, gap: 9 }}>
        <View style={{ flexDirection: 'row', gap: 7, alignItems: 'center' }}>
          <View style={{ width: 7, height: 7, backgroundColor: color.steel }} />
          <Text style={{ fontFamily: font.body.medium, fontSize: 11.5, lineHeight: 15, color: ink(0.58) }}>
            Managed device and corporate network verified
          </Text>
        </View>
        <CTAButton label="Confirm & sync 6 fields" height={50} onPress={() => navigation.navigate('Synced')} />
      </View>

      <TranscriptSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </Screen>
  );
}
