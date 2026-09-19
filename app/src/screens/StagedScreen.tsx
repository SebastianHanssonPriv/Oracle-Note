import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../ui/Screen';
import { PhoneChrome } from '../ui/PhoneChrome';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Row } from '../ui/Row';
import { TranscriptSheet } from '../ui/TranscriptSheet';
import { color, space } from '../theme';
import { gapQuestions, stagedFields as mockStagedFields, visit } from '../data/mockVisit';
import { saveVisitState } from '../data/visitStore';
import { useAuth } from '../auth/AuthContext';
import { extractStagedFields, syncVisit } from '../services/backendClient';
import { DEMO_VISIT_ID } from '../services/backendConfig';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Staged'>;

export function StagedScreen({ navigation }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [fields, setFields] = useState(mockStagedFields);
  const [syncing, setSyncing] = useState(false);
  const { status, account } = useAuth();
  // App.tsx's RootNavigator only reaches this screen when status is
  // 'unconfigured' (no real Entra ID values yet, demo mode) or 'signed-in'
  // (SSO actually verified this session) — never a half-signed-in state.
  const verified = status === 'signed-in';

  // Ask the backend to turn the answered gap questions into staged "you
  // said" fields — a real network round-trip (see backend/README.md),
  // replacing what used to be hardcoded twice (once in AskingScreen's
  // liveTranscript, again here). If the backend isn't configured or isn't
  // reachable, extractStagedFields() resolves null and this silently keeps
  // the static mock values already showing — never a broken or blank field.
  useEffect(() => {
    let active = true;
    const gapAnswers = gapQuestions
      .filter((q) => q.mandatory)
      .map((q) => ({ questionId: q.id, topicLabel: q.stagedLabel ?? q.title, question: q.oracleAsked, answer: q.stagedAnswer ?? q.liveTranscript }));
    extractStagedFields(DEMO_VISIT_ID, gapAnswers).then((remote) => {
      if (!active || !remote) return;
      setFields((current) =>
        current.map((f) => {
          const match = remote.find((r) => r.label === f.label);
          return match ? { ...f, value: match.value } : f;
        })
      );
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Screen>
      <PhoneChrome time="11:12" />
      <View style={{ paddingHorizontal: space[4], paddingBottom: space[3], borderBottomWidth: 1, borderBottomColor: color.border.subtle }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.44, textTransform: 'uppercase', color: color.text.muted }}>
            In staging · not in CRM
          </Text>
          <Badge label="Draft" variant="neutral" />
        </View>
        <Text style={{ fontFamily: 'Archivo_700Bold', fontSize: 22, lineHeight: 28, marginTop: space[1], color: color.text.primary }}>
          {visit.customer}
        </Text>
        <Text style={{ fontSize: 12, lineHeight: 17, color: color.text.muted, marginTop: space['025'] }}>
          {visit.visitKind} · {visit.visitDate}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        {fields.map((f) => (
          <Row
            key={f.label}
            label={f.label}
            value={f.value}
            badge={f.badge}
            highlighted={'highlighted' in f ? f.highlighted : false}
            valueColor={'muted' in f && f.muted ? color.text.disabled : undefined}
            onPress={'linksToTranscript' in f && f.linksToTranscript ? () => setSheetOpen(true) : undefined}
          />
        ))}
        <Text style={{ padding: space[4], fontSize: 12, lineHeight: 18, color: color.text.muted }}>
          Tap a row for the transcript line behind it. Transcript kept; audio deleted after transcription.
        </Text>
      </View>

      <View style={{ padding: space[4], paddingTop: space[3], borderTopWidth: 1, borderTopColor: color.border.subtle, gap: space[2] }}>
        <View style={{ flexDirection: 'row', gap: space[2], alignItems: 'center' }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: verified ? color.status.success.icon : color.text.disabled }} />
          <Text style={{ fontSize: 12, lineHeight: 16, color: color.text.muted }}>
            {verified
              ? `Signed in as ${account?.username} · managed device verified`
              : 'Demo mode · device verification not configured'}
          </Text>
        </View>
        <Button
          label="Confirm & sync 6 fields"
          size="lg"
          block
          loading={syncing}
          onPress={async () => {
            setSyncing(true);
            await saveVisitState({ status: 'synced' });
            // Best-effort — see backend/README.md. If unconfigured or
            // unreachable this resolves null and the local status change
            // above still stands; the demo never blocks on it.
            await syncVisit(DEMO_VISIT_ID, {
              customer: visit.customer,
              stagedFields: fields.map((f) => ({
                id: f.label,
                label: f.label,
                value: f.value,
                origin: f.badge?.variant === 'brand' ? 'you-said' : 'extracted',
              })),
            });
            setSyncing(false);
            navigation.navigate('Synced');
          }}
        />
      </View>

      <TranscriptSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </Screen>
  );
}
