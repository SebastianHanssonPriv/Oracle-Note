import React from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../ui/Screen';
import { CTAButton } from '../ui/CTAButton';
import { Tag } from '../ui/Tag';
import { color, font, ink } from '../theme';
import { homeVisits } from '../data/mockVisit';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  return (
    <Screen>
      <View style={{ paddingHorizontal: 18, paddingTop: 10, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: color.border }}>
        <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: ink(0.55) }}>
          Oracle Note
        </Text>
        <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 32, lineHeight: 34, marginTop: 5, color: color.ink }}>Tue 15 Sep</Text>
      </View>

      <View style={{ flex: 1 }}>
        {homeVisits.map((v) => (
          <View
            key={v.time}
            style={{
              flexDirection: 'row',
              gap: 14,
              paddingHorizontal: 18,
              paddingVertical: 15,
              borderBottomWidth: 1,
              borderBottomColor: color.border,
              backgroundColor: v.status === 'next' ? color.paleBlueBg : 'transparent',
              opacity: v.status === 'upcoming' ? 0.55 : 1,
            }}
          >
            <Text
              style={{
                width: 40,
                fontFamily: font.condensed.semiBold,
                fontSize: 14,
                color: v.status === 'next' ? color.blueprint : ink(0.55),
              }}
            >
              {v.time}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 19, lineHeight: 22, color: color.ink }}>{v.customer}</Text>
              <Text style={{ fontFamily: font.body.medium, fontSize: 12.5, lineHeight: 17, color: v.status === 'next' ? '#2c455d' : ink(0.55) }}>
                {v.note}
              </Text>
            </View>
            {v.status === 'synced' && <Tag label="Synced" variant="outline" />}
            {v.status === 'next' && <Tag label="Next" variant="filled" />}
          </View>
        ))}
        <Text style={{ padding: 18, fontFamily: font.body.medium, fontSize: 12.5, lineHeight: 19, color: ink(0.55) }}>
          Each visit is matched to its customer from the calendar, the timestamp and your location. No account picking.
        </Text>
      </View>

      <View style={{ padding: 18 }}>
        <CTAButton label="Debrief Bergman visit" withDot onPress={() => navigation.navigate('CarReady')} />
      </View>
    </Screen>
  );
}
