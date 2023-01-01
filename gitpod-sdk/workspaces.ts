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
          type: "Standard",
          date: new Date(1628618888939),
          source : "Palanikannan1437/RC4Community"
        },
        status: "running",
        isGitPodified: true, // will be determinded on the basis of if .gitpod.yml is present in the repository
      },
      {
        workspaceId: "https://gitpod.io/start/#raycast-extensions-lfi6vqr3348",
        ownerId: "string",
        projectId: "Gitpod-website",
        context: {
          branch: "my-branch-3",
          commit: "f5d4eb4cd3859a760ac613598e840b94e8094649",
          type: "Large",
          date: new Date(),
          source : "Palanikannan1437/Gitpod-website"
        },
        status: "stopped",
        isGitPodified: true,
      },
      {
        workspaceId: "kapadianait-rc4communit-0b4986ftvc3",
        ownerId: "string",
        projectId: "Gitpod",
        context: {
          branch: "my-branch-3",
          commit: "f5d4eb4cd3859a760ac613598e840b94e8094649",
          type: "Standard",
          date: new Date(),
          source : "Palanikannan1437/kapadinait"
        },
        status: "progressing",
        isGitPodified: false,
      },
      {
        workspaceId: "gitpodio-templatek3s-sbrz83lp885",
        ownerId: "string",
        projectId: "Gitpod-4",
        context: {
          branch: "my-branch-4",
          commit: "f5d4eb4cd3859a760ac613598e840b94e8094649",
          type: "Large",
          date: new Date(),
          source : "Palanikannan1437/gitpodio-template"
        },
        status: "running",
        isGitPodified: true,
      },
      {
        workspaceId: "palanikanna-incubatorde-qymiz93y5la",
        ownerId: "string",
        projectId: "Gitpod-5",
        context: {
          branch: "my-branch",
          commit: "f5d4eb4cd3859a760ac613598e840b94e8094649",
          type: "Standard",
          date: new Date(),
          source : "Palanikannan1437/incubator-devlake"
        },
        status: "stopped",
        isGitPodified: false,
      },
      {
        workspaceId: "palanikanna-rc4conferen-9l0ddzx6jx4",
        ownerId: "string",
        projectId: "Gitpod-6",
        context: {
          branch: "my-branch",
          commit: "f5d4eb4cd3859a760ac613598e840b94e8094649",
          type: "Large",
          date: new Date(),
          source : "Palanikannan1437/RC4Conferences"
        },
        status: "failed",
        isGitPodified: true,
      },
    ]);
  });
}

// export async function getWorkspace(workspaceId: string): Promise<IWorkspace> {
//   return {
//     workspaceId: workspaceId,
//     ownerId: "string",
//     projectId: "string",
//     context: "Pull request",
//     status: "string",
//   };
// }

// export async function startWorkspace(workspaceId: string): Promise<{ instanceId: string; workspaceUrl: string }> {
//   return { instanceId: "1", workspaceUrl: "workspace-1" };
// }

// export async function stopWorkspace(workspaceId: string): Promise<string> {
//   return `Workspace ${workspaceId} has been stopped`;
// }
