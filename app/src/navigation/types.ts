export type RootStackParamList = {
  Home: undefined;
  CarReady: undefined;
  CarRecording: undefined;
  CarAsk: { elapsedSeconds: number };
  CarInactive: undefined;
  Asking: { questionIndex: number };
  Staged: { sheetOpen?: boolean };
  Synced: undefined;
};
