import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Blueprint } from './Blueprint';
import { CTAButton } from './CTAButton';
import { color, font, ink } from '../theme';
import { riskTranscript } from '../data/mockVisit';

export function TranscriptSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(29,31,32,0.35)', justifyContent: 'flex-end' }} onPress={onClose}>
        <Pressable onPress={() => {}}>
          <Blueprint
            borderColor={color.ink}
            style={{
              backgroundColor: color.paper,
              padding: 18,
              gap: 12,
              shadowColor: '#2b2b2d',
              shadowOpacity: 0.16,
              shadowOffset: { width: 0, height: -12 },
              shadowRadius: 32,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: ink(0.55) }}>
                {riskTranscript.window}
              </Text>
              <Pressable onPress={onClose} hitSlop={10}>
                <Text style={{ fontFamily: font.body.medium, fontSize: 18, color: ink(0.45) }}>×</Text>
              </Pressable>
            </View>

            <Text style={{ fontFamily: font.body.regular, fontSize: 14.5, lineHeight: 24, color: color.ink }}>
              {riskTranscript.before}
              <Text style={{ backgroundColor: color.highlightMark }}>{riskTranscript.highlighted}</Text>
              {riskTranscript.after}
            </Text>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <CTAButton label="Keep field" onPress={onClose} height={44} style={{ flex: 1 }} />
              <CTAButton label="Edit text" variant="ghost" onPress={onClose} height={44} style={{ flex: 1 }} />
            </View>

            <Text style={{ fontFamily: font.body.medium, fontSize: 12, lineHeight: 17, color: ink(0.55) }}>{riskTranscript.origin}</Text>
          </Blueprint>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
