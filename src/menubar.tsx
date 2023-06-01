import { getPreferenceValues, MenuBarExtra, open, showHUD, showToast, Toast, getApplications } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { useEffect, useState } from "react";

import { GitpodIcons } from "../constants";

import { IWorkspace } from "./api/Gitpod/Models/IWorkspace";
import { IWorkspaceError } from "./api/Gitpod/Models/IWorkspaceError";
import { WorkspaceManager } from "./api/Gitpod/WorkspaceManager";
import { getCodeEncodedURI } from "./helpers/getVSCodeEncodedURI";
import { useHistory } from "./helpers/repository";
import { dashboardPreferences } from "./preferences/dashboard_preferences";
import { getGitpodEndpoint } from "./preferences/gitpod_endpoint";
import {  Preferences } from "./preferences/repository_preferences";


export default function command() {

  const preferences = getPreferenceValues<dashboardPreferences>();
  const EditorPreferences = getPreferenceValues<Preferences>();

  const { data } = useHistory("", "");
  const gitpodEndpoint = getGitpodEndpoint();

  const workspaceManager = new WorkspaceManager(
    ""
  );

  const [workspaces, setWorkspaces] = useState<IWorkspace[]>([]);
  const [vsCodePresent, setVSCodePresent] = useState<boolean>(false);

  const { isLoading } = usePromise(async () => {
    if (preferences.cookie_token) {
      await workspaceManager.init();
      const apps = await getApplications();

      // checking if vsCode is present in all the apps with its bundle id
      const CodePresent = apps.find((app) => {
        return app.bundleId && app.bundleId === "com.microsoft.VSCode"
      });

      if (CodePresent !== undefined){
        setVSCodePresent(true);
      } 
    }
  });

  useEffect(() => {
    if (preferences.cookie_token) {
      workspaceManager.on("workspaceUpdated", async () => {
        setWorkspaces(Array.from(WorkspaceManager.workspaces.values()))
      })
      workspaceManager.on("errorOccured", (e: IWorkspaceError) => {
        console.log(e);
        // if (e.code === 401) {
        //   showHUD("Cookie Expired, Kindly Update Session Cookie.")
        //
        // } else {
        //   showHUD(e.message)
        // }
      })
    }
  }, [preferences.access_token])

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

  function splitUrl(url: string) {
    const urlWithoutProtocol = url.replace(/^https?:\/\//, '');
    const parts = urlWithoutProtocol.split('.');

    return parts[0] + ".ssh." + parts[1] + "." + parts[2] + "." + parts[3];
  }


  return (
    <MenuBarExtra icon={GitpodIcons.gitpod_logo_primary} isLoading={isLoading}>
      {preferences.cookie_token && <MenuBarExtra.Section title="Active Workspaces">
        {activeWorkspaces.map((workspace) => (
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
                if (vsCodePresent && EditorPreferences.preferredEditor === "code-desktop"){

                  const vsCodeURI = getCodeEncodedURI(workspace)
                  open(vsCodeURI, "com.microsoft.VSCode");
                }
                else {
                  if (workspace.getIDEURL() !== ''){
                    if (EditorPreferences.preferredEditor === "code-desktop"){
                      showHUD("Unable to find VSCode Desktop, opening in VSCode Insiders.")
                    }
                    open(workspace.getIDEURL());
                  }
                }
              }
            }}
          />
        ))}
      </MenuBarExtra.Section>}
      {preferences.cookie_token && <MenuBarExtra.Section title="Recent Workspaces">
        {recentWorkspaces.slice(0, 7).map((workspace) => (
          <MenuBarExtra.Item
            key={workspace.getWorkspaceId()}
            icon={GitpodIcons.stopped_icon_menubar}
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
