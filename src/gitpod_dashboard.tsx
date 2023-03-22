import { Action, ActionPanel, List, open, showToast, Toast, getPreferenceValues } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { useEffect, useState } from "react";

import { GitpodIcons } from "../constants";
import sinceTime from "../utils/sinceTime";

import { IWorkspace } from "./api/Gitpod/Models/IWorkspace";
import { WorkspaceManager } from "./api/Gitpod/WorkspaceManager";
import View from "./components/View";

export interface dashboardPreferences {
  access_token: string;
  cookie_token: string;
}

function ListWorkspaces() {

  const preferences = getPreferenceValues<dashboardPreferences>();
  const workspaceManager = new WorkspaceManager(
    preferences.access_token,
    preferences.cookie_token
  );

  const [workspaces, setWorkspaces] = useState<IWorkspace[]>([]);

  const { isLoading } = usePromise(async () => {
    await workspaceManager.init();
    setWorkspaces(Array.from(WorkspaceManager.workspaces.values()));
  });

  useEffect(() => {
    workspaceManager.on("workspaceUpdated", () => {
      setWorkspaces(Array.from(WorkspaceManager.workspaces.values()));
    });
  }, []);

  return (
    <List isLoading={isLoading}>
      {renderWorkspaces(
        workspaces.filter((workspace) => workspace.getStatus().phase == "PHASE_RUNNING"),
        "Active Workspaces"
      )}
      {renderWorkspaces(
        workspaces.filter(
          (workspace) =>
            workspace.getStatus().phase != "PHASE_RUNNING" && workspace.getStatus().phase != "PHASE_STOPPED"
        ),
        "Progressing Workspaces"
      )}
      {renderWorkspaces(
        workspaces.filter((workspace) => workspace.getStatus().phase == "PHASE_STOPPED"),
        "Inactive Workspaces"
      )}
    </List>
  );
}

function renderWorkspaces(workspaces: IWorkspace[], title: string) {
  return <List.Section title={title}>{workspaces.map((workspace) => renderWorkspaceListItem(workspace))}</List.Section>;
}

function renderWorkspaceListItem(workspace: IWorkspace) {
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
                await showToast({
                  title: "Launching your workspace",
                  style: Toast.Style.Animated,
                });

                const data = {
                  instanceId: workspace.instanceId,
                  workspaceId: workspace.getWorkspaceId(),
                  gitpodHost: "https://gitpod.io",
                };
                const vsCodeURI =
                  "vscode://gitpod.gitpod-desktop/workspace/" +
                  workspace.getDescription().split(" ")[0].split("/")[1] +
                  `?` +
                  encodeURIComponent(JSON.stringify(data));
                setTimeout(() => {
                  open(vsCodeURI);
                }, 1500);
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
