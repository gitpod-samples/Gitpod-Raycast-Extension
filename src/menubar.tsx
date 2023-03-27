import { getPreferenceValues, MenuBarExtra, open, showHUD, showToast, Toast } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { useEffect, useState } from "react";

import { GitpodIcons } from "../constants";

import { IWorkspace } from "./api/Gitpod/Models/IWorkspace";
import { IWorkspaceError } from "./api/Gitpod/Models/IWorkspaceError";
import { WorkspaceManager } from "./api/Gitpod/WorkspaceManager";
import { useHistory } from "./helpers/repository";
import { getGitpodEndpoint } from "./preferences/gitpod_endpoint";

interface menuBarPreferences {
  // access_token?: string
  cookie_token?: string
}

export default function command() {

  const preferences = getPreferenceValues<menuBarPreferences>();

  const { data } = useHistory("", "");
  const gitpodEndpoint = getGitpodEndpoint();

  const workspaceManager = new WorkspaceManager(
    "",
    preferences.cookie_token ?? "",
  );

  const [workspaces, setWorkspaces] = useState<IWorkspace[]>([]);

  const { isLoading } = usePromise(async () => {
    if (preferences.cookie_token){
      await workspaceManager.init();
    }
  });

  if (preferences.cookie_token){
    useEffect(() => {
      workspaceManager.on("workspaceUpdated", async () => {
        setWorkspaces(Array.from(WorkspaceManager.workspaces.values()))
      })
      workspaceManager.on("errorOccured", (e: IWorkspaceError) => {
        console.log(e);
        if (e.code === 401){
          showHUD("Cookie Expired, Kindly Update Session Cookie.")
        } else {
          showHUD(e.message)
        }
      })
    }, [])
  }

  if (isLoading) {
    return <MenuBarExtra isLoading={true}></MenuBarExtra>;
  }

  const activeWorkspaces = workspaces.filter(
    (workspace) =>
      workspace.getStatus().phase === "PHASE_RUNNING" ||
      workspace.getStatus().phase !== "PHASE_STOPPED" 
  );

  const recentWorkspaces = workspaces.filter(
    (workspace) => workspace.getStatus().phase === "PHASE_STOPPED"
  );

  return (
    <MenuBarExtra icon={GitpodIcons.gitpod_logo_primary} isLoading={isLoading}>
      { preferences.cookie_token && <MenuBarExtra.Section title="Active Workspaces">
        { activeWorkspaces.map((workspace) => (
          <MenuBarExtra.Item
            key={workspace.getWorkspaceId()}
            icon={
              workspace.getStatus().phase === "PHASE_RUNNING"
                ? GitpodIcons.running_icon_menubar
                : GitpodIcons.progressing_icon_menubar
            }
            title={workspace.getDescription()}
            onAction={() => {
              if (workspace.getStatus().phase === "PHASE_RUNNING") {
                const data = {
                  instanceId : workspace.instanceId,
                  workspaceId : workspace.getWorkspaceId(),
                  gitpodHost: "https://gitpod.io"
                }
                const vsCodeURI = "vscode://gitpod.gitpod-desktop/workspace/" + (workspace.getDescription().split(" ")[0]).split("/")[1] + `?`+ encodeURIComponent(JSON.stringify(data))
                open(vsCodeURI)
              }
            }}
          />
        ))}
      </MenuBarExtra.Section> }
      { preferences.cookie_token && <MenuBarExtra.Section title="Recent Workspaces">
        {recentWorkspaces.slice(0, 7).map((workspace) => (
          <MenuBarExtra.Item
            key={workspace.getWorkspaceId()}
            icon={ GitpodIcons.stopped_icon_menubar }
            title={workspace.getDescription()}
            onAction={() => {
              workspace.start(WorkspaceManager.api)
            }
            }
          />
        ))}
      </MenuBarExtra.Section>}
             <MenuBarExtra.Section title="Recent Repositories">
         {data.slice(0, 7).map((repository) => (
          <MenuBarExtra.Item
            key={repository.nameWithOwner}
            title={repository.nameWithOwner}
            icon={GitpodIcons.repoIcon}
            onAction={() => open(`${gitpodEndpoint}#https://github.com/${repository.nameWithOwner}`)}
          />
        ))}
      </MenuBarExtra.Section>
    </MenuBarExtra>
  );
}
