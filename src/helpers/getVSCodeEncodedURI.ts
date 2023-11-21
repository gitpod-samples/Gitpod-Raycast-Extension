import { IWorkspace } from "../api/Gitpod/Models/IWorkspace";
import { getGitpodEndpoint } from "../preferences/gitpod_endpoint";

export function getCodeEncodedURI(workspace: IWorkspace): string {
  const gitpodEndpoint = getGitpodEndpoint();
  const data = {
    instanceId: workspace.instanceId,
    workspaceId: workspace.getWorkspaceId(),
    gitpodHost: gitpodEndpoint,
  };

  const vsCodeURI =
    "vscode://gitpod.gitpod-desktop/workspace/" +
    workspace.getRepositoryName() +
    `?` +
    encodeURIComponent(JSON.stringify(data));

  return vsCodeURI;
}
