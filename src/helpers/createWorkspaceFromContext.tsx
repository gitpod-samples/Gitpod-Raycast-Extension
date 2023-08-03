import { LaunchType, Toast, launchCommand, showToast} from "@raycast/api";

import { IWorkspace } from "../api/Gitpod/Models/IWorkspace";
import { WorkspaceManager } from "../api/Gitpod/WorkspaceManager";

export default async function createWorksapceFromContext(defaultOrg: string,context_url: string) {

    IWorkspace.create(WorkspaceManager.api, {
        contextUrl: context_url,
        organizationId: defaultOrg
    });
    await showToast({
        title: "Starting your workspace",
        style: Toast.Style.Animated,
    });
    setTimeout(() => {
        launchCommand({
            name: "gitpod_dashboard",
            type: LaunchType.UserInitiated
        })
    }, 3000);
}