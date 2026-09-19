import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Screen } from '../ui/Screen';
import { CTAButton } from '../ui/CTAButton';
import { color, font, ink } from '../theme';
import { useAuth } from './AuthContext';

/**
 * Shown only when MSAL is actually configured (real tenant/client IDs) and
 * the silent, broker-backed sign-in didn't already succeed. With placeholder
 * config this never renders — App.tsx skips straight to the app.
 */
export function SignInGate() {
  const { status, errorMessage, signIn } = useAuth();

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 18 }}>
        <View>
          <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', color: ink(0.55) }}>
            Oracle Note
          </Text>
          <Text style={{ fontFamily: font.condensed.semiBold, fontSize: 30, lineHeight: 33, marginTop: 6, color: color.ink }}>
            Sign in with your work account
          </Text>
          <Text style={{ fontFamily: font.body.medium, fontSize: 13.5, lineHeight: 20, color: ink(0.58), marginTop: 10 }}>
            On a managed device this is usually silent — Oracle Note reuses
            the sign-in you already have through Company Portal, the same
            way Teams and Outlook do. You're seeing this screen because that
            didn't happen automatically this time.
          </Text>
        </View>

        {status === 'checking' && <ActivityIndicator color={color.steel} />}

        {status !== 'checking' && (
          <CTAButton label="Sign in with Microsoft" onPress={signIn} withDot={status !== 'signing-in'} />
        )}

        {errorMessage && (
          <Text style={{ fontFamily: font.body.medium, fontSize: 12, lineHeight: 17, color: ink(0.5) }}>{errorMessage}</Text>
        )}
      </View>
    </Screen>
  );
}
