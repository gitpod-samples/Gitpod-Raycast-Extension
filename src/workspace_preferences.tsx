import { ActionPanel, Action, Detail, openCommandPreferences } from "@raycast/api";

export default function Command() {
  const markdown = "API key incorrect. Please update it in command preferences and try again.";
  return (
    <Detail
      markdown={markdown}
      actions={
        <ActionPanel>
          <Action title="Open Extension Preferences" onAction={openCommandPreferences} />
        </ActionPanel>
      }
    />
  );
}
