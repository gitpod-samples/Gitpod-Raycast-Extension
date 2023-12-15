import { getPreferenceValues } from "@raycast/api";

import { GitpodIcons } from "../../constants";

export interface WorkspaceMenubarPreferences {
  name: "menubar_workspaces"
  menubar_icon_style: string;
}

export function getIcon() {
    const preferences = getPreferenceValues<WorkspaceMenubarPreferences>()
    switch(preferences.menubar_icon_style) {
        case "monochrome": {
            return GitpodIcons.gitpod_logo_monochrome
        }
        case "orange": {
            return GitpodIcons.gitpod_logo_primary
        }
        default: {
            console.error(`Unknown icon style ${preferences.menubar_icon_style}. Falling back to orange`)
            return GitpodIcons.gitpod_logo_primary
        }
    }
}
