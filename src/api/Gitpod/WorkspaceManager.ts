import { EventEmitter } from "stream";

import { IWorkspace } from "./Models/IWorkspace";
import { IWorkspaceError } from "./Models/IWorkspaceError";
import { IWorkspaceUpdate } from "./Models/IWorkspaceUpdate";
import { GitpodAPI } from "./api";

export class WorkspaceManager extends EventEmitter {
    private static instance: WorkspaceManager
    public static workspaces: Map<string, IWorkspace>
    public static api: GitpodAPI
    private static token: string
    private static user_id: string

    constructor(token: string, user_id: string){
        super();
        if (!WorkspaceManager.api){
            WorkspaceManager.api = new GitpodAPI(token, user_id);
        }
        WorkspaceManager.token = token;
        WorkspaceManager.user_id = user_id;
    }

    static getInstance(token: string, user_id: string){
        if (!WorkspaceManager.instance){
            WorkspaceManager.instance = new WorkspaceManager(token, user_id)
        }
        return WorkspaceManager.instance
    }

    async init() {
        // this method will give you all the workspaces
        if (WorkspaceManager.instance){
            return;
        }
        try {
            WorkspaceManager.workspaces = await IWorkspace.fetchAll(WorkspaceManager.user_id);
            this.emit("workspaceUpdated", WorkspaceManager.workspaces) 
        } catch (e: any) {
            this.emit("errorOccured", e as IWorkspaceError)
            return;
        }

        WorkspaceManager.api.on("instanceUpdated", (updateInstance : IWorkspaceUpdate) => {
            const targetWorkspace = WorkspaceManager.workspaces.get(updateInstance.workspaceId);
            // don't update anything when the workspace is already in the same state
            updateInstance.status.phase = "PHASE_" + updateInstance.status.phase.toUpperCase()
            if (targetWorkspace == undefined || targetWorkspace.getStatus().phase == updateInstance.status.phase){
                return;
            }

            // update when the workspace is not in the state
            targetWorkspace.setStatus(updateInstance.status)
            WorkspaceManager.workspaces = WorkspaceManager.workspaces.set(updateInstance.workspaceId, targetWorkspace);

            // Workspace has been updated, its time to tell our listeners i.e. UI Components, that workspaces have been updated and it's time to change things.
            this.emit("workspaceUpdated", targetWorkspace)        
        })

        WorkspaceManager.api.on("errorOccured", (error: IWorkspaceError) => {
            this.emit("errorOccured", error)
        })
    }

}