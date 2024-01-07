import { LaunchType, List, LocalStorage, getPreferenceValues, launchCommand, useNavigation } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { useEffect, useState } from "react";

import { IWorkspace } from "./api/Gitpod/Models/IWorkspace";
import { WorkspaceManager } from "./api/Gitpod/WorkspaceManager";
import DefaultOrgForm from "./components/DefaultOrgForm";
import View from "./components/View";
import { ErrorListView, errorMessage } from "./components/errorListView";
import { getFocusedBrowserContext } from "./helpers/getFocusedContext";
import { dashboardPreferences } from "./preferences/dashboard_preferences";
import { Preferences } from "./preferences/repository_preferences";

const BrowserContext = () => {
  const { push } = useNavigation();

  const [defaultOrganization, setDefaultOrganization] = useState<string | undefined>();
  const EditorPreferences = getPreferenceValues<Preferences>();

  const dashboardPreferences = getPreferenceValues<dashboardPreferences>();

  if (dashboardPreferences.access_token === undefined || dashboardPreferences.access_token.trim() === "") {
    return <ErrorListView message={errorMessage.invalidAccessToken} />;
  }

  const workspaceManager = new WorkspaceManager(dashboardPreferences.access_token ?? "");

  const { isLoading, revalidate } = usePromise(async () => {
    await workspaceManager.init();
    const defaultOrg = await LocalStorage.getItem("default_organization");
    if (defaultOrg !== undefined) {
      setDefaultOrganization(defaultOrg.toString());
    }
  });

  useEffect(() => {
    if (!isLoading) {
      if (!defaultOrganization) {
        push(<DefaultOrgForm revalidate={revalidate} />);
      } else {
        getFocusedBrowserContext().then((context_url) => {
          if (context_url) {
            console.log(context_url);
            IWorkspace.create(WorkspaceManager.api, {
              contextUrl: "https://github.com/" + context_url,
              organizationId: defaultOrganization.toString(),
              ignoreRunningPrebuild: true,
              ignoreRunningWorkspaceOnSameCommit: true,
              worksspaceClass: EditorPreferences.preferredEditorClass,
              ideSetting: {
                defaultIde: EditorPreferences.preferredEditor === "ssh" ? "code" : EditorPreferences.preferredEditor,
                useLatestVersion: false,
              },
            });

            setTimeout(() => {
              launchCommand({
                name: "gitpod_dashboard",
                type: LaunchType.UserInitiated,
              });
            }, 2000);
          } else {
            console.log("Nothing in browser context");
          }
        });
      }
    }
  }, [isLoading]);

  return (
    <List>
      <List.EmptyView
        icon={{
          source: "Icons/gitpod_logo_bouncing.gif",
        }}
        title="Creating Fresh Workspace"
      />
    </List>
  );
};

export default function Command() {
  return (
    <View>
      <BrowserContext />
    </View>
  );
}
