import IWorkspace from "../types/IWorkspace";

export async function listWorkspaces(Pagesize: number): Promise<IWorkspace[]> {
  return new Promise(function (resolve, reject) {
    resolve([
      {
        workspaceId: "palanikannan1437-k8s-xefn4qbl2dj",
        ownerId: "string",
        projectId: "RC4Community",
        context: {
          branch: "my-branch",
          commit: "f5d4eb4cd3859a760ac613598e840b94e8094649",
          type: "small",
          date: new Date(),
        },
        status: "running",
      },
      {
        workspaceId: "2",
        ownerId: "string",
        projectId: "Gitpod-website",
        context: {
          branch: "my-branch-3",
          commit: "f5d4eb4cd3859a760ac613598e840b94e8094649",
          type: "small",
          date: new Date(),
        },
        status: "stopped",
      },
      {
        workspaceId: "3",
        ownerId: "string",
        projectId: "Gitpod",
        context: {
          branch: "my-branch-3",
          commit: "f5d4eb4cd3859a760ac613598e840b94e8094649",
          type: "small",
          date: new Date(),
        },
        status: "running",
      },
      {
        workspaceId: "4",
        ownerId: "string",
        projectId: "Gitpod-4",
        context: {
          branch: "my-branch-4",
          commit: "f5d4eb4cd3859a760ac613598e840b94e8094649",
          type: "large",
          date: new Date(),
        },
        status: "running",
      },
      {
        workspaceId: "5",
        ownerId: "string",
        projectId: "Gitpod-5",
        context: {
          branch: "my-branch",
          commit: "f5d4eb4cd3859a760ac613598e840b94e8094649",
          type: "small",
          date: new Date(),
        },
        status: "stopped",
      },
      {
        workspaceId: "6",
        ownerId: "string",
        projectId: "Gitpod-6",
        context: {
          branch: "my-branch",
          commit: "f5d4eb4cd3859a760ac613598e840b94e8094649",
          type: "large",
          date: new Date(),
        },
        status: "stopped",
      },
    ]);
  });
}

export async function getWorkspace(workspaceId: string): Promise<IWorkspace> {
  return {
    workspaceId: workspaceId,
    ownerId: "string",
    projectId: "string",
    context: "Pull request",
    status: "string",
  };
}

export async function startWorkspace(workspaceId: string): Promise<{ instanceId: string; workspaceUrl: string }> {
  return { instanceId: "1", workspaceUrl: "workspace-1" };
}

export async function stopWorkspace(workspaceId: string): Promise<string> {
  return `Workspace ${workspaceId} has been stopped`;
}
