import { Action, ActionPanel, List, open, showToast, showHUD, Toast, getPreferenceValues, getApplications, openExtensionPreferences } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { useEffect, useState } from "react";

import { GitpodIcons } from "../constants";
import sinceTime from "../utils/sinceTime";

import { IWorkspace } from "./api/Gitpod/Models/IWorkspace";
import { IWorkspaceError } from "./api/Gitpod/Models/IWorkspaceError";
import { WorkspaceManager } from "./api/Gitpod/WorkspaceManager";
import View from "./components/View";
import { getCodeEncodedURI } from "./helpers/getVSCodeEncodedURI";
import { dashboardPreferences } from "./preferences/dashboard_preferences";
import {  Preferences } from "./preferences/repository_preferences";

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

function renderWorkspaceListItem(workspace: IWorkspace, EditorPreferences: Preferences, CodePresent: boolean) {
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

                  const vsCodeURI = getCodeEncodedURI(workspace)
                  setTimeout(() => {
                    open(vsCodeURI, "com.microsoft.VSCode");
                    toast.hide();
                  }, 1500);
                }

                else {

                  if (workspace.getIDEURL() !== ''){
                    if (EditorPreferences.preferredEditor === "code-desktop"){
                      showHUD("Unable to find VSCode Desktop, opening in VSCode Insiders.")
                    }
                    setTimeout(() => {
                      open(workspace.getIDEURL());
                    }, 1500)
                    
                  }
                }
              }}
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
