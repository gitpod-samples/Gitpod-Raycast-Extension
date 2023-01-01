import { ActionPanel, Detail, List, Action, Icon } from "@raycast/api";
import IWorkspace from "../types/IWorkspace";
import { usePromise } from "@raycast/utils";
import { desc, GitpodIcons, UIColors, workspaceClass, workspaceStatus } from "../constants";
import { listWorkspaces } from "../gitpod-sdk/workspaces";
import sinceTime from "../utils/sinceTime";

export default function Command() {
  const { isLoading, data: workspaces } = usePromise(async () => await listWorkspaces(25));

  if (!workspaces) {
    return <Detail markdown={"- Something went wrong..."} />;
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search your gitpod workspaces">
      {renderWorkspaces(
        workspaces.filter((workspace) => workspace.status == workspaceStatus.workspace_active),
        "Active Workspaces"
      )}
      {renderWorkspaces(
        workspaces.filter((workspace) => workspace.status == workspaceStatus.workspace_progressing),
        "Progressing Workspaces"
      )}
      {renderWorkspaces(
        workspaces.filter((workspace) => workspace.status == workspaceStatus.workspace_Inactive),
        "Inactive Workspaces"
      )}
      {renderWorkspaces(
        workspaces.filter((workspace) => workspace.status == workspaceStatus.workspace_failed),
        "Failed Workspaces"
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
      title={workspace.context.source}
      subtitle={{ value: sinceTime(workspace.context.date) + " ago" }}
      key={workspace.workspaceId}
      icon={workspace.isGitPodified ? GitpodIcons.gitpod_logo_primary : GitpodIcons.gitpod_logo_secondary}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser title="Open Workspace" url={`https://gitpod.io/start/#${workspace.workspaceId}`} />
          <Action.OpenInBrowser title="Open Repository" url={`https://github.com/${workspace.context.source}`} />
          <Action.OpenInBrowser title="Open Gitpod Dashboard" url={`https://gitpod.io/workspaces`} />
        </ActionPanel>
      }
      accessories={[
        {
          text: {
            value: workspace.context.branch,
          }
        },
        {
          icon: GitpodIcons.octicon_branch_icon,
        },
        {
          tag: {
            value: workspace.context.type === "Large" ? workspaceClass.large : workspaceClass.standard
          },
          icon: {
            source: Icon.ComputerChip,
            tintColor: UIColors.gitpod_gold,
          },
          tooltip:
            workspace.context.type === workspaceClass.standard
              ? desc.standard_workspace_desc
              : desc.large_workspace_desc,
        },
        {
          icon:
            workspace.status === workspaceStatus.workspace_active
              ? GitpodIcons.running_icon
              : workspace.status === workspaceStatus.workspace_Inactive
              ? GitpodIcons.stopped_icon
              : workspace.status === workspaceStatus.workspace_failed
              ? GitpodIcons.failed_icon
              : GitpodIcons.progressing_icon
        },
      ]}
    />
  );
}
