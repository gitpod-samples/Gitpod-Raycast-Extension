import IWorkspaceContext from "./IWorkspaceContext";

export default interface IWorkspace {
  workspaceId: string;
  ownerId: string;
  projectId: string;
  context: IWorkspaceContext;
  status: string;
  isGitPodified: boolean;
}