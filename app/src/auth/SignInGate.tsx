import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Screen } from '../ui/Screen';
import { Button } from '../ui/Button';
import { color, space } from '../theme';
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
      <View style={{ flex: 1, justifyContent: 'center', padding: space[6], gap: space[5] }}>
        <View>
          <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.44, textTransform: 'uppercase', color: color.text.muted }}>
            Oracle Note
          </Text>
          <Text style={{ fontFamily: 'Archivo_700Bold', fontSize: 26, lineHeight: 32, marginTop: space[1], color: color.text.primary }}>
            Sign in with your work account
          </Text>
          <Text style={{ fontSize: 14, lineHeight: 21, color: color.text.secondary, marginTop: space[2] }}>
            On a managed device this is usually silent — Oracle Note reuses
            the sign-in you already have through Company Portal, the same
            way Teams and Outlook do. You're seeing this screen because that
            didn't happen automatically this time.
          </Text>
        </View>

        {status === 'checking' && <ActivityIndicator color={color.action.primaryBg} />}

        {status !== 'checking' && (
          <Button label="Sign in with Microsoft" size="lg" onPress={signIn} withDot={status !== 'signing-in'} />
        )}

        {errorMessage && <Text style={{ fontSize: 12, lineHeight: 17, color: color.text.muted }}>{errorMessage}</Text>}
      </View>
    </Screen>
  );
}
