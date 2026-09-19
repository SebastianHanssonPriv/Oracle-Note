export type RootStackParamList = {
  Home: undefined;
  CarReady: undefined;
  CarRecording: undefined;
  CarSaved: { elapsedSeconds: number };
  Gaps: { elapsedSeconds: number };
  Asking: { questionIndex: number };
  Staged: { sheetOpen?: boolean };
  Synced: undefined;
};
