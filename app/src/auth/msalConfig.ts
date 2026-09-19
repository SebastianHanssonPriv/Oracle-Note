// Placeholder Entra ID (Azure AD) configuration for Oracle Note's own SSO.
//
// Company Portal / Authenticator already give Teams, Outlook, Copilot and
// Defender silent sign-in on a managed device because they're Microsoft
// first-party apps. Oracle Note isn't — to get the same silent-broker
// experience it has to register itself the same way those apps did. That
// registration happens in the Entra ID admin center, not in this codebase:
//
//   1. Entra admin center -> App registrations -> New registration.
//      - Redirect URI (platform: Android): msauth://<androidPackage>/<androidPackageSignatureHash>
//        (see ANDROID_PACKAGE_SIGNATURE_HASH below for how to get the hash)
//      - Redirect URI (platform: iOS/macOS): msauth.<iosBundleIdentifier>://auth
//   2. Copy the "Application (client) ID" and "Directory (tenant) ID" from
//      the registration's Overview page into TENANT_ID / CLIENT_ID below.
//   3. Under "API permissions", add whatever scope the backend this app
//      eventually syncs to actually exposes (or User.Read on Microsoft
//      Graph, to prove sign-in works, before there's a real API to call).
//
// Every value below is a placeholder. isMsalConfigured() stays false, and
// the app runs exactly as it did before this file existed (no sign-in
// wall), until real values are dropped in.

export const MSAL_TENANT_ID = 'YOUR_TENANT_ID';
export const MSAL_CLIENT_ID = 'YOUR_CLIENT_ID';

// The Android redirect URI needs a base64-encoded SHA-1 hash of the signing
// certificate. For a local debug build:
//   keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore \
//     | openssl sha1 -binary | openssl base64
// For an EAS-managed release build, `eas credentials` shows the equivalent
// for whichever keystore EAS is signing with.
export const ANDROID_PACKAGE_SIGNATURE_HASH = 'YOUR_ANDROID_SIGNATURE_HASH';

export const MSAL_AUTHORITY = `https://login.microsoftonline.com/${MSAL_TENANT_ID}`;

// Swap for the scope the target backend/CRM API exposes, e.g.
// 'api://<api-application-id>/access_as_user'. 'User.Read' (Microsoft
// Graph) is left as a placeholder that proves sign-in works even before
// that API exists.
export const MSAL_SCOPES = ['User.Read'];

export function isMsalConfigured(): boolean {
  return (
    MSAL_TENANT_ID !== 'YOUR_TENANT_ID' &&
    MSAL_CLIENT_ID !== 'YOUR_CLIENT_ID' &&
    ANDROID_PACKAGE_SIGNATURE_HASH !== 'YOUR_ANDROID_SIGNATURE_HASH'
  );
}
