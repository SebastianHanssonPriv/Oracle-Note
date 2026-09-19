import React, { useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {
  Barlow_400Regular,
  Barlow_500Medium,
  Barlow_600SemiBold,
  Barlow_700Bold,
} from '@expo-google-fonts/barlow';
import {
  BarlowCondensed_400Regular,
  BarlowCondensed_600SemiBold,
} from '@expo-google-fonts/barlow-condensed';

import { HomeScreen } from './src/screens/HomeScreen';
import { CarReadyScreen } from './src/screens/CarReadyScreen';
import { CarRecordingScreen } from './src/screens/CarRecordingScreen';
import { CarAskScreen } from './src/screens/CarAskScreen';
import { CarInactiveScreen } from './src/screens/CarInactiveScreen';
import { AskingScreen } from './src/screens/AskingScreen';
import { StagedScreen } from './src/screens/StagedScreen';
import { SyncedScreen } from './src/screens/SyncedScreen';
import type { RootStackParamList } from './src/navigation/types';
import { color } from './src/theme';
import { AuthProvider, useAuth } from './src/auth/AuthContext';
import { SignInGate } from './src/auth/SignInGate';

SplashScreen.preventAutoHideAsync().catch(() => {});

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const { status } = useAuth();

  // 'unconfigured' (no real Entra ID values yet) behaves exactly like
  // before this file existed — no sign-in wall. Once real values are set,
  // 'checking'/'signed-out'/'signing-in' show the sign-in gate instead.
  if (status !== 'unconfigured' && status !== 'signed-in') {
    return <SignInGate />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: color.paper },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CarReady" component={CarReadyScreen} />
        <Stack.Screen name="CarRecording" component={CarRecordingScreen} />
        <Stack.Screen name="CarAsk" component={CarAskScreen} />
        <Stack.Screen name="CarInactive" component={CarInactiveScreen} />
        <Stack.Screen name="Asking" component={AskingScreen} />
        <Stack.Screen name="Staged" component={StagedScreen} />
        <Stack.Screen name="Synced" component={SyncedScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Barlow_400Regular,
    Barlow_500Medium,
    Barlow_600SemiBold,
    Barlow_700Bold,
    BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </View>
  );
}
