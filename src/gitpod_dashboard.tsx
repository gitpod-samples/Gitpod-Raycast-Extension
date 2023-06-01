import { Action, ActionPanel, List, open, showToast, showHUD, Toast, getPreferenceValues, getApplications, openExtensionPreferences } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { useEffect, useState } from "react";

import { GitpodIcons } from "../constants";
import sinceTime from "../utils/sinceTime";

import { IWorkspace } from "./api/Gitpod/Models/IWorkspace";
import { IWorkspaceError } from "./api/Gitpod/Models/IWorkspaceError";
import { WorkspaceManager } from "./api/Gitpod/WorkspaceManager";
import View from "./components/View";
import WorkspacePreference from "./preferences/workspace_preferences";

export interface dashboardPreferences {
  // access_token: string;
  preferredEditor: string;
  cookie_token: string;
}

export interface dashboardState {
  // access_token: string;
  preferredEditor: string;
  cookie_token: string;
}

function ListWorkspaces() {

  const CookiePreferences = getPreferenceValues<dashboardPreferences>();
  const EditorPreferences = getPreferenceValues<Preferences>();

  const workspaceManager = new WorkspaceManager(
    "",
    CookiePreferences.cookie_token
  );

  const [workspaces, setWorkspaces] = useState<IWorkspace[]>([]);
  const [vsCodePresent, setVSCodePresent] = useState<boolean>(false);

  const { isLoading } = usePromise(async () => {
    await workspaceManager.init();
    const apps = await getApplications();

    // checking if vsCode is present in all the apps with its bundle id
    const CodePresent = apps.find((app) => {
      return app.bundleId && app.bundleId === "com.microsoft.VSCode"
    });

    if (CodePresent !== undefined){
      setVSCodePresent(true);
    }
  });

  useEffect(() => {
    workspaceManager.on("workspaceUpdated", () => {
      setWorkspaces(Array.from(WorkspaceManager.workspaces.values()));
    });
    workspaceManager.on("errorOccured", (e: IWorkspaceError) => {
      if (e.code === 401) {
        showToast({
          style: Toast.Style.Failure,
          title: "Cookie Expired, Kindly Update Session Cookie."
        })
        openExtensionPreferences();
      } else {
        showToast({
          style: Toast.Style.Failure,
          title: e.message
        })
      }
    })
  }, []);

  return (
    <List isLoading={isLoading}>
      {renderWorkspaces(
        workspaces.filter((workspace) => workspace.getStatus().phase == "PHASE_RUNNING"),
        "Active Workspaces",
        EditorPreferences,
        vsCodePresent,
      )}
      {renderWorkspaces(
        workspaces.filter(
          (workspace) =>
            workspace.getStatus().phase != "PHASE_RUNNING" && workspace.getStatus().phase != "PHASE_STOPPED"
        ),
        "Progressing Workspaces",
        EditorPreferences,
        vsCodePresent,
      )}
      {renderWorkspaces(
        workspaces.filter((workspace) => workspace.getStatus().phase == "PHASE_STOPPED"),
        "Inactive Workspaces",
        EditorPreferences,
        vsCodePresent,
      )}
    </List>
  );
}

function renderWorkspaces(workspaces: IWorkspace[], title: string, EditorPreferences: Preferences, CodePresent: boolean) {
  return <List.Section title={title}>{workspaces.map((workspace) => renderWorkspaceListItem(workspace, EditorPreferences, CodePresent))}</List.Section>;
}

function renderWorkspaceListItem(workspace: IWorkspace) {
  const preferences = getPreferenceValues<dashboardPreferences>();
  function splitUrl(url: string) {
    const urlWithoutProtocol = url.replace(/^https?:\/\//, '');
    const parts = urlWithoutProtocol.split('.');

    return parts[0] + ".ssh." + parts[1] + "." + parts[2] + "." + parts[3];
  }
  const { push } = useNavigation();

  return (
    <List.Item
      title={workspace.getDescription()}
      subtitle={{ value: sinceTime(new Date(workspace.createdAt)) + " ago" }}
      key={workspace.getWorkspaceId()}
      icon={GitpodIcons.gitpod_logo_primary}
      actions={
        <ActionPanel>
          {workspace.getStatus().phase === "PHASE_RUNNING" && (
            <Action
              title="Open Workspace"
              onAction={async () => {
              
                if (CodePresent && EditorPreferences.preferredEditor === "code-desktop"){
                  const toast = await showToast({
                    title: "Launching your workspace in VSCode Desktop",
                    style: Toast.Style.Animated,
                  });

                const data = {
                  instanceId: workspace.instanceId,
                  workspaceId: workspace.getWorkspaceId(),
                  gitpodHost: "https://gitpod.io"
                }
                if (preferences.preferredEditor === "vim") {
                  const terminalURL = "ssh://" + workspace.getWorkspaceId() + "@" + splitUrl(workspace.status.url);
                  open(terminalURL)
                } else if (preferences.preferredEditor === "code-desktop") {
                  const vsCodeURI = "vscode://gitpod.gitpod-desktop/workspace/" + (workspace.getDescription().split(" ")[0]).split("/")[1] + `?` + encodeURIComponent(JSON.stringify(data))
                  open(vsCodeURI)
                }
              }}
            />
          )}


          {workspace.getStatus().phase === "PHASE_RUNNING" && (
            <Action
              title="Configure Workspace"
              onAction={() => {
                push(<WorkspacePreference workspace={workspace.instanceId} />)
              }}
              shortcut={{ modifiers: ["cmd"], key: "w" }}
            />
          )}

          {workspace.getStatus().phase === "PHASE_RUNNING" && (
            <Action
              title="Stop Workspace"
              onAction={async () => {
                await showToast({
                  title: "Stopping your workspace",
                  style: Toast.Style.Failure,
                });
                workspace.stop(WorkspaceManager.api);
              }}
              shortcut={{ modifiers: ["cmd"], key: "s" }}
            />
          )}

          {workspace.getStatus().phase === "PHASE_STOPPED" && (
            <Action
              title="Start Workspace"
              onAction={async () => {
                await showToast({
                  title: "Starting your workspace",
                  style: Toast.Style.Success,
                });
                workspace.start(WorkspaceManager.api);
              }}
            />
          )}
        </ActionPanel>
      }
      accessories={[
        {
          icon: GitpodIcons.branchIcon,
          text: {
            value: workspace.getDescription().split(" ")[2],
          },
        },
        {
          icon:
            workspace.getStatus().phase === "PHASE_RUNNING"
              ? GitpodIcons.running_icon
              : workspace.getStatus().phase === "PHASE_STOPPED"
                ? GitpodIcons.stopped_icon
                : GitpodIcons.progressing_icon,
        },
      ]}
    />
  );
}

export default function Command() {
  return (
    <View>
      <ListWorkspaces />
    </View>
  );
}
