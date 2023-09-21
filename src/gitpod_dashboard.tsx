import {
  Action,
  ActionPanel,
  List,
  open,
  showToast,
  showHUD,
  Toast,
  getPreferenceValues,
  getApplications,
  LocalStorage,
  confirmAlert,
  ToastStyle,
  Alert,
} from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { useEffect, useState } from "react";

import { GitpodIcons, UIColors } from "../constants";
import sinceTime from "../utils/sinceTime";

import { IWorkspace } from "./api/Gitpod/Models/IWorkspace";
import { IWorkspaceError } from "./api/Gitpod/Models/IWorkspaceError";
import { WorkspaceManager } from "./api/Gitpod/WorkspaceManager";
import DefaultOrgForm from "./components/DefaultOrgForm";
import View from "./components/View";
import { ErrorListView, errorMessage } from "./components/errorListView";
import { getCodeEncodedURI } from "./helpers/getVSCodeEncodedURI";
import { splitUrl } from "./helpers/splitURL";
import { dashboardPreferences } from "./preferences/dashboard_preferences";
import { Preferences } from "./preferences/repository_preferences";

function ListWorkspaces() {
  const dashboardPreferences = getPreferenceValues<dashboardPreferences>();
  const [isUnauthorised, setIsUnauthorized] = useState<boolean>(false);
  const [isNetworkError, setNetworkError] = useState<boolean>(false);

  if (dashboardPreferences.access_token === undefined || dashboardPreferences.access_token.trim() === "") {
    return <ErrorListView message={errorMessage.invalidAccessToken} />;
  }

  const EditorPreferences = getPreferenceValues<Preferences>();

  const workspaceManager = new WorkspaceManager(dashboardPreferences.access_token ?? "");

  const [workspaces, setWorkspaces] = useState<IWorkspace[]>([]);
  const [vsCodePresent, setVSCodePresent] = useState<boolean>(false);

  const [defaultOrganization, setDefaultOrganization] = useState<string | undefined>();

  const { isLoading, revalidate } = usePromise(
    async () => {
      // await LocalStorage.clear();
      await workspaceManager.init();
      const apps = await getApplications();
      const defaultOrg = await LocalStorage.getItem("default_organization");
      if (defaultOrg !== undefined) {
        setDefaultOrganization(defaultOrg.toString());
      }

      // checking if vsCode is present in all the apps with its bundle id
      const CodePresent = apps.find((app) => {
        return app.bundleId && app.bundleId === "com.microsoft.VSCode";
      });

      if (CodePresent !== undefined) {
        setVSCodePresent(true);
      }
    },
    [],
    {
      onError: (error) => {
        console.log(error.name);
      },
    }
  );

  const deleteWorkspaceCallback = (workspace_id: string) => {
    const workspaces: IWorkspace[] = Array.from(workspaceManager.deleteWorkspace(workspace_id).values())
    setWorkspaces(workspaces)
  }

  useEffect(() => {
    workspaceManager.on("workspaceUpdated", () => {
      setWorkspaces(Array.from(WorkspaceManager.workspaces.values()));
    });
    workspaceManager.on("errorOccured", (error: IWorkspaceError) => {
      if (error.code.toString() === "ENOTFOUND") {
        return setNetworkError(true);
      }
      if (error.code === 500 || error.code === 401) {
        setIsUnauthorized(true);
      } else {
        showToast({
          style: Toast.Style.Failure,
          title: "Unable to perform this action, please check your network, your token expiry or try again later.",
        });
      }
    });
  }, []);

  if (isUnauthorised || isNetworkError) {
    return <ErrorListView message={isUnauthorised ? errorMessage.invalidAccessToken : errorMessage.networkError} />;
  }

  return (
    <List isLoading={isLoading}>
      {!isLoading && defaultOrganization === undefined && (
        <List.Item
          icon={GitpodIcons.info_icon}
          title={"Setup Default Organization"}
          subtitle={"Where is it billed? "}
          actions={
            <ActionPanel>
              <Action.Push title={"Setup Default Organization"} target={<DefaultOrgForm revalidate={revalidate} />} />
            </ActionPanel>
          }
        />
      )}
      {renderWorkspaces(
        workspaces.filter((workspace) => workspace.getStatus().phase == "PHASE_RUNNING"),
        "Active Workspaces",
        EditorPreferences,
        vsCodePresent,
        deleteWorkspaceCallback
      )}
      {renderWorkspaces(
        workspaces.filter(
          (workspace) =>
            workspace.getStatus().phase != "PHASE_RUNNING" && workspace.getStatus().phase != "PHASE_STOPPED"
        ),
        "Progressing Workspaces",
        EditorPreferences,
        vsCodePresent,
        deleteWorkspaceCallback
      )}
      {renderWorkspaces(
        workspaces.filter((workspace) => workspace.getStatus().phase == "PHASE_STOPPED"),
        "Inactive Workspaces",
        EditorPreferences,
        vsCodePresent,
        deleteWorkspaceCallback
      )}
    </List>
  );
}

function renderWorkspaces(
  workspaces: IWorkspace[],
  title: string,
  EditorPreferences: Preferences,
  CodePresent: boolean,
  deleteWorkspaceCallback: (workspace_id: string) => void
) {
  return (
    <List.Section title={title}>
      {workspaces.map((workspace) => renderWorkspaceListItem(workspace, EditorPreferences, CodePresent, deleteWorkspaceCallback))}
    </List.Section>
  );
}

function renderWorkspaceListItem(workspace: IWorkspace, EditorPreferences: Preferences, CodePresent: boolean, deleteWorkspaceCallback: (workspace_id: string) => void) {

  const dashboardPreferences = getPreferenceValues<dashboardPreferences>();

  const accessories : List.Item.Accessory[] =  [
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
  ]

  if (workspace.getTotalUntrackedFiles()) {
    accessories.unshift({
      icon: GitpodIcons.github_untracked,
      tooltip: workspace.getUntrackedFiles()?.join("\n"),
      text: {
        value: workspace.getTotalUntrackedFiles()?.toString(),
      }
    })
  }

  if (workspace.getTotatUncommittedFiles()){
    accessories.unshift({
      icon: {
        ...GitpodIcons.commit_icon,
        tintColor: UIColors.grey
      },
      tooltip: workspace.getUncommittedFiles()?.join("\n"),
      text: {
        value: workspace.getTotatUncommittedFiles()?.toString(),
      }
    })
  }

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
                if (CodePresent && EditorPreferences.preferredEditor === "code-desktop") {
                  const toast = await showToast({
                    title: "Launching your workspace in VSCode Desktop",
                    style: Toast.Style.Animated,
                  });

                  const vsCodeURI = getCodeEncodedURI(workspace);
                  setTimeout(() => {
                    open(vsCodeURI, "com.microsoft.VSCode");
                    toast.hide();
                  }, 1500);
                } else if (EditorPreferences.preferredEditor === "ssh") {
                  const terminalURL = "ssh://" + workspace.getWorkspaceId() + "@" + splitUrl(workspace.getIDEURL());
                  open(terminalURL);
                } else {
                  if (workspace.getIDEURL() !== "") {
                    if (EditorPreferences.preferredEditor === "code-desktop") {
                      showHUD("Unable to find VSCode Desktop, opening in VSCode Insiders.");
                    }
                    setTimeout(() => {
                      open(workspace.getIDEURL());
                    }, 1500);
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
                try {
                  workspace.stop({ workspaceID: workspace.getWorkspaceId() });
                } catch (e) {
                  await showHUD("Failed to stop your workspace, check your network, your token, or try later.");
                }
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
                try {
                  await workspace.start({ workspaceID: workspace.getWorkspaceId() });
                } catch (error) {
                  const workspaceError: IWorkspaceError = error as IWorkspaceError;
                  showHUD(workspaceError.message);
                }
              }}
            />
            
          )}
          
          {(workspace.getStatus().phase === "PHASE_RUNNING" || workspace.getStatus().phase === "PHASE_STOPPED") && (
            <Action.Push
              shortcut={{ modifiers: ["cmd", "shift"], key: "o" }}
              title="Switch Default Organization"
              target={<DefaultOrgForm />}
            />
          )}
          {(workspace.getStatus().phase === "PHASE_STOPPED" && dashboardPreferences.allow_delete_workspaces) && 
            <Action 
              title="Delete Workspace"
              shortcut={{ modifiers: ["ctrl"], key: "x" }}
              onAction = {
                async () => {
                  const options: Alert.Options = {
                    title: "Delete Workspace",
                    icon: {
                      ...GitpodIcons.gitpod_logo_secondary,
                      tintColor: UIColors.red
                    },
                    message: `Confirm Deleting ${workspace.getDescription()}`,
                    primaryAction: {
                      title: "Confirm",
                      style: Alert.ActionStyle.Destructive,
                      onAction: async () => {
                        const toast = await showToast({
                          title: "Failed Deleting Workspace",
                          style: ToastStyle.Animated
                        })
                        try { 
                          const workspace_id = await workspace.delete() 
                          deleteWorkspaceCallback(workspace_id)
                        }
                        catch (e) {
                          toast.title = "Failed Deleting Workspace",
                          toast.style = ToastStyle.Failure
                        };
    
                        toast.title = "Successfully Deleted Workspace",
                        toast.style = ToastStyle.Success
                      },
                    },
                  };
                  confirmAlert(options)
                }
              }
            />
          }
        </ActionPanel>
      }
      accessories={ accessories }
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
