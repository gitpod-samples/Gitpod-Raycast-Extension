import { ActionPanel, Detail, List, Action, Color, Icon } from "@raycast/api";
import IWorkspace from "../types/IWorkspace";
import { usePromise } from "@raycast/utils";
import { statusColors, workspaceStatus } from "../constants";
import { listWorkspaces } from "../gitpod-sdk/workspaces";

export default function Command() {
  const { isLoading, data: workspaces } = usePromise(async () => await listWorkspaces(25));

  if (workspaces == undefined) {
    return <Detail markdown={"- Something went wrong..."} />;
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search your gitpod workspaces">
      {renderWorkspaces(
        workspaces.filter((workspace) => workspace.status == workspaceStatus.workspace_active),
        "Active Workspaces"
      )}
      {renderWorkspaces(
        workspaces.filter((workspace) => workspace.status == workspaceStatus.workspace_Inactive),
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
      title={workspace.workspaceId}
      subtitle={{ value: workspace.context.type, tooltip: "8gb, 4 Cores" }}
      // icon={{ source: "../assets/logo-mark.png" }}
      icon = { workspace.status === workspaceStatus.workspace_active
              ? { source: Icon.CircleFilled, tintColor: statusColors.running }
              : { source: Icon.CircleFilled, tintColor: Color.Red } }
      key={workspace.workspaceId}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser url={`https://gitpod.io/start/#${workspace.workspaceId}`} />
        </ActionPanel>
      }
      accessories={[
        {
          icon : { source: "../assets/logo-mark.png" }
        },
        {
          text: {
            value: `${workspace.context.date.getDate()}-${workspace.context.date.getMonth() + 1}-${workspace.context.date.getFullYear()}`,
          },
        },
        {
          icon: {
            source: "https://raw.githubusercontent.com/primer/octicons-v2/master/icons/24/git-branch.svg",
            tintColor: statusColors.running,
          },
          tag: {
            value: workspace.context.branch,
          },
        },
      ]}
    />
  );
}
