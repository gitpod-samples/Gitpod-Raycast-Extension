import { LaunchType, LocalStorage, getPreferenceValues, launchCommand, showHUD, Clipboard } from "@raycast/api";

import { IWorkspace } from "./api/Gitpod/Models/IWorkspace";
import { WorkspaceManager } from "./api/Gitpod/WorkspaceManager";
import {
  getFocusedBrowserContext,
  getFocusedTextContext,
  identifyGitHubEntity,
  removeGitHubPrefix,
} from "./helpers/getFocusedContext";
import { dashboardPreferences } from "./preferences/dashboard_preferences";
import { Preferences } from "./preferences/repository_preferences";

export default async function Command() {
  const getDefaultOrg = async (): Promise<string> => {
    const defaultOrg = await LocalStorage.getItem("default_organization");
    return defaultOrg !== undefined ? defaultOrg.toString() : "";
  };

  const dashboardPreferences = getPreferenceValues<dashboardPreferences>();

  const default_organization = await getDefaultOrg();

  if (default_organization) {
    const workspaceManager = new WorkspaceManager(dashboardPreferences.access_token ?? "");

    await workspaceManager.init();
    const contextSelectedUrl = await getFocusedTextContext();

    if (contextSelectedUrl) {
      await showHUD("🍊 Creating Fresh Workspace for " + removeGitHubPrefix(contextSelectedUrl) + " from Selection");
      createGitpodWorkspace(default_organization, contextSelectedUrl);
    } else {
      const contextBrowserUrl = await getFocusedBrowserContext();
      if (contextBrowserUrl) {
        await showHUD("🍊 Creating Fresh Workspace for " + removeGitHubPrefix(contextBrowserUrl) + " from Browser");
        createGitpodWorkspace(default_organization, contextBrowserUrl);
      } else {
        const getClipboardContext = identifyGitHubEntity((await Clipboard.readText()) ?? "");
        if (getClipboardContext) {
          await showHUD(
            "🍊 Creating Fresh Workspace for " + removeGitHubPrefix(contextSelectedUrl) + " from Clipboard"
          );
          createGitpodWorkspace(default_organization, getClipboardContext);
        }
      }
    }

    await sleep(7000);

    await launchCommand({
      name: "gitpod_dashboard",
      type: LaunchType.UserInitiated,
    });
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const createGitpodWorkspace = (default_organization: string, context_url: string) => {
  const EditorPreferences = getPreferenceValues<Preferences>();

  IWorkspace.create(WorkspaceManager.api, {
    contextUrl: context_url,
    organizationId: default_organization,
    ignoreRunningPrebuild: true,
    ignoreRunningWorkspaceOnSameCommit: true,
    worksspaceClass: EditorPreferences.preferredEditorClass,
    ideSetting: {
      defaultIde: EditorPreferences.preferredEditor === "ssh" ? "code" : EditorPreferences.preferredEditor,
      useLatestVersion: false,
    },
  });
};
