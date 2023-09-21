export interface IWorkspaceUpdate {
  id: string;
  workspaceId: string;
  region: string;
  creationTime: string;
  ideUrl: string;
  status: {
    phase: string;
  };
  phasePersisted: string;
  deleted: boolean;
  workspaceClass: "g1-standard" | "g1-large";
}

export function NewIWorkspaceUpdateObject(jsonObj: any): IWorkspaceUpdate {
  return jsonObj.params as IWorkspaceUpdate;
}
