import { MenuBarExtra } from "@raycast/api";
import { usePromise } from "@raycast/utils";

import { GitpodIcons, workspaceStatus } from "../constants";
import { listWorkspaces } from "../gitpod-sdk/workspaces";

export default function command() {
  const { isLoading, data: workspaces } = usePromise(async () => await listWorkspaces(10));

  if (!workspaces) {
    return <MenuBarExtra isLoading={true}></MenuBarExtra>;
  }

  const activeWorkspaces = workspaces.filter(
    (workspace) =>
      workspace.status === workspaceStatus.workspace_active ||
      workspace.status === workspaceStatus.workspace_progressing
  );

  const recentWorkspaces = workspaces.filter(
    (workspace) =>
      workspace.status !== workspaceStatus.workspace_active &&
      workspace.status !== workspaceStatus.workspace_progressing
  );

  return (
    <MenuBarExtra icon={GitpodIcons.gitpod_logo_primary} isLoading={isLoading}>
      <MenuBarExtra.Section title="Active Workspaces">
        {activeWorkspaces.map((workspace) => (
          <MenuBarExtra.Item
            key={workspace.workspaceId}
            icon={
              workspace.status === workspaceStatus.workspace_active
                ? GitpodIcons.running_icon_menubar
                : GitpodIcons.progressing_icon_menubar
            }
            title={workspace.context.source}
            onAction={() => {
              console.log("oka");
            }}
          />
        ))}
      </MenuBarExtra.Section>
      <MenuBarExtra.Section title="Recent Workspaces">
        {recentWorkspaces.map((workspace) => (
          <MenuBarExtra.Item
            key={workspace.workspaceId}
            icon={
              workspace.status === workspaceStatus.workspace_Inactive
                ? GitpodIcons.stopped_icon_menubar
                : GitpodIcons.failed_icon_menubar
            }
            title={workspace.context.source}
            onAction={() => console.log("MKC")}
          />
        ))}
      </MenuBarExtra.Section>
    </MenuBarExtra>
  );
}
