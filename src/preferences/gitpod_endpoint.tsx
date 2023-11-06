import { getPreferenceValues } from "@raycast/api";

export function getGitpodEndpoint(): string {
  const { gitpodUrl } = getPreferenceValues();
  return gitpodUrl;
}

export function getPublicAPIEndpoint(): string {
  const { gitpodUrl } = getPreferenceValues();
  return gitpodUrl.replace("https://", "https://api.");
}

export function getWebsocketEndpoint(): string {
  const { gitpodUrl } = getPreferenceValues();
  return gitpodUrl.replace("https://", "wss://");
}
