import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Card } from './Card';
import { Button } from './Button';
import { color, radius, shadow, space } from '../theme';
import { riskTranscript } from '../data/mockVisit';

export function TranscriptSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: color.bg.overlay, justifyContent: 'flex-end' }} onPress={onClose}>
        <Pressable onPress={() => {}}>
          <View
            style={[
              {
                backgroundColor: color.bg.surface,
                borderTopLeftRadius: radius.xl,
                borderTopRightRadius: radius.xl,
                padding: space[4],
                gap: space[3],
              },
              shadow.xl,
            ]}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.44, textTransform: 'uppercase', color: color.text.muted }}>
                {riskTranscript.window}
              </Text>
              <Pressable onPress={onClose} hitSlop={10}>
                <Text style={{ fontSize: 18, color: color.text.muted }}>×</Text>
              </Pressable>
            </View>

            <Text style={{ fontSize: 14, lineHeight: 22, color: color.text.primary }}>
              {riskTranscript.before}
              <Text style={{ backgroundColor: color.status.info.bg, color: color.status.info.fg }}>{riskTranscript.highlighted}</Text>
              {riskTranscript.after}
            </Text>

            <View style={{ flexDirection: 'row', gap: space[2] }}>
              <Button label="Keep field" onPress={onClose} style={{ flex: 1 }} />
              <Button label="Edit text" variant="secondary" onPress={onClose} style={{ flex: 1 }} />
            </View>

            <Text style={{ fontSize: 12, lineHeight: 17, color: color.text.muted }}>{riskTranscript.origin}</Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
