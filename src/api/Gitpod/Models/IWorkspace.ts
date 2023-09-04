import fetch from "node-fetch";

import { CreateWorkspace, WorkspaceStreamer } from "../WorkspaceStreamer";

import { IWorkspaceError } from "./IWorkspaceError";
import { GitpodDataModel } from "./Model";

type IWorkspaceParams = {
  workspaceID: string;
};

type ICreateWorkspaceParams = {
  contextUrl: string;
  organizationId: string;
  ignoreRunningWorkspaceOnSameCommit: true;
  ignoreRunningPrebuild: true;
  worksspaceClass: "g1-standard" | "g1-large";
  ideSetting: {
    defaultIde: string;
    useLatestVersion: false;
  };
};

const workspaceURLs = {
  getWorkspace: "https://api.gitpod.io/gitpod.experimental.v1.WorkspacesService/GetWorkspace",
  getAllWorkspaces: "https://api.gitpod.io/gitpod.experimental.v1.WorkspacesService/ListWorkspaces",
  deleteWorkspace: "https://api.gitpod.io/gitpod.experimental.v1.WorkspacesService/DeleteWorkspace",
  startWorkspace: "https://api.gitpod.io/gitpod.experimental.v1.WorkspacesService/StartWorkspace",
  stopWorkspace: "https://api.gitpod.io/gitpod.experimental.v1.WorkspacesService/StopWorkspace",
};

export class IWorkspace implements GitpodDataModel {
  private token = "";
  private initialized = false;
  private workspaceId: string;
  private ownerId: string;
  private projectId: string;
  private ideURL: string;
  private workspaceClass?: "g1-standard" | "g1-large";
  private context: {
    contextURL: string;
    git: {
      normalizedContextUrl: string;
    };
  };
  private description: string;
  public instanceId: string;
  public createdAt: string;
  private status: {
    phase: string;
  };

  private repository: string;
  private totalUntrackedFiles?: number;
  private untrackedFiles?: string[];
  private recentFolders: string[];

  private totalUncommittedFiles?: number;
  private UncommittedFiles?: string[];

  getUntrackedFiles() {
    return this.untrackedFiles
  }

  getUncommittedFiles() {
    return this.UncommittedFiles
  }

  getRecentFolders() {
    return this.recentFolders;
  }

  getTotalUntrackedFiles() {
    return this.totalUntrackedFiles
  }

  getTotatUncommittedFiles() {
    return this.totalUncommittedFiles
  }

  getWorkspaceClass() {
    return this.workspaceClass
  }

  setWorkspaceClass(workspaceClass: "g1-standard" | "g1-large") {
    this.workspaceClass = workspaceClass
  }

  getIDEURL() {
    return this.ideURL;
  }

  setIDEURL(url: string) {
    this.ideURL = url;
  }

  setStatus(status: { phase: string }): IWorkspace {
    this.status = status;
    return this;
  }

  getWorkspaceId(): string {
    if (!this.initialized) {
      throw new Error("IWorkspace instance not initialized");
    }
    return this.workspaceId;
  }

  getOwnerId(): string {
    if (!this.initialized) {
      throw new Error("IWorkspace instance not initialized");
    }
    return this.ownerId;
  }

  getProjectId(): string {
    if (!this.initialized) {
      throw new Error("IWorkspace instance not initialized");
    }
    return this.projectId;
  }

  getContext(): { contextURL: string; git: { normalizedContextUrl: string } } {
    if (!this.initialized) {
      throw new Error("IWorkspace instance not initialized");
    }
    return this.context;
  }

  getDescription(): string {
    if (!this.initialized) {
      throw new Error("IWorkspace instance not initialized");
    }
    return this.description;
  }

  getRepositoryName(): string {
    if (!this.initialized) {
      throw new Error("IWorkspace instance not initailized");
    }
    return this.repository;
  }

  getStatus(): { phase: string } {
    if (!this.initialized) {
      throw new Error("IWorkspace instance not initialized");
    }
    return this.status;
  }

  constructor(workspace: any, token: string) {
    this.workspaceId = workspace.workspaceId;
    this.ownerId = workspace.ownerId;
    this.projectId = workspace.projectId;
    this.context = workspace.context;
    this.status = workspace.status.instance.status;
    this.description = workspace.description;
    this.token = token;
    this.instanceId = workspace.status.instance.instanceId;
    this.initialized = true;
    this.createdAt = workspace.status.instance.createdAt;
    this.ideURL = workspace.status.instance ? workspace.status.instance.status.url : "https://gitpod.io";
    this.repository = workspace.context.git.repository.name;

    if (workspace.status.instance.status.gitStatus.totalUntrackedFiles){
      this.totalUntrackedFiles = workspace.status.instance.status.gitStatus.totalUntrackedFiles; 
      this.untrackedFiles = workspace.status.instance.status.gitStatus.untrackedFiles;
    }

    if (workspace.status.instance.status.gitStatus.uncommitedFiles){
      this.totalUncommittedFiles = workspace.status.instance.status.gitStatus.totalUncommitedFiles
      this.UncommittedFiles = workspace.status.instance.status.gitStatus.uncommitedFiles
    }

    this.recentFolders = workspace.status.instance.status.recentFolders as string[];
  }

  parse(json: string): IWorkspace {
    const data = JSON.parse(json);
    const workspace = data.result;
    this.workspaceId = workspace.workspaceId;
    this.ownerId = workspace.ownerId;
    this.projectId = workspace.context.git.normalizedContextUrl.split("/").slice(-2)[0];
    this.context = {
      contextURL: workspace.context.contextUrl,
      git: {
        normalizedContextUrl: workspace.context.git.normalizedContextUrl,
      },
    };
    this.repository = workspace.context.git.repository.name;
    this.instanceId = workspace.status.instance.instanceId;
    this.description = workspace.description;
    this.status = {
      phase: workspace.status.instance.status.phase,
    };
    this.ideURL = workspace.status.instance ? data.result.status.instance.status.url : "";

    this.createdAt = workspace.status.instance.createdAt;

    if (workspace.status.instance.status.gitStatus.totalUntrackedFiles){
      this.totalUntrackedFiles = workspace.status.instance.status.gitStatus.totalUntrackedFiles; 
      this.untrackedFiles = workspace.status.instance.status.gitStatus.untrackedFiles;
    }

    this.recentFolders = workspace.status.instance.status.recentFolders;

    return this;
  }

  dispose(): void {
    // Clear all properties
    this.workspaceId = "";
    this.ownerId = "";
    this.projectId = "";
    this.context = { contextURL: "", git: { normalizedContextUrl: "" } };
    this.description = "";
    this.status = { phase: "" };
  }

  public start: (params: IWorkspaceParams) => Promise<IWorkspace> | never = async (params: IWorkspaceParams) => {
    const { workspaceID } = params;
    const response = await fetch(workspaceURLs.startWorkspace, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ workspaceId: workspaceID }),
    });
    const json = await response.json();
    if (response.status !== 200) {
      const errorState = json as { code?: string; message?: string };
      const error: IWorkspaceError = {
        name: "WorkspaceStartError",
        code: response.status,
        message:
          errorState.message && errorState.message.startsWith("You cannot run more than 4 workspaces at the same time")
            ? errorState.message
            : "Error Occured in Starting Workspace",
      };
      throw error;
    }
    const workspace = this.parse(JSON.stringify(json));
    return workspace;
  };

  public stop: (params: IWorkspaceParams) => void = async (params: IWorkspaceParams) => {
    const { workspaceID } = params;

    const response = await fetch(workspaceURLs.stopWorkspace, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ workspaceId: workspaceID }),
    });

    if (response.status !== 200) {
      const error: IWorkspaceError = {
        name: "WorkspaceStartError",
        code: response.status,
        message: "Error Occured in Stopping Workspace",
      };
      throw error;
    }
  };

  public static create: (streamer: WorkspaceStreamer, params: ICreateWorkspaceParams) => void = async (
    streamer: WorkspaceStreamer,
    params: ICreateWorkspaceParams
  ) => {
    const createParams: CreateWorkspace = {
      method: "createWorkspace",
      params: params,
    };

    streamer.execute(createParams);
  };

  public fetch: (params: IWorkspaceParams) => Promise<IWorkspace> | never = async (params: IWorkspaceParams) => {
    const { workspaceID } = params;

    const response = await fetch(workspaceURLs.getWorkspace, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ workspaceID }),
    });

    if (response.status != 200) {
      const error: IWorkspaceError = {
        name: "WorkspaceFetchError",
        code: response.status,
        message: response.statusText,
      };
      throw error;
    }

    const json = await response.json();

    const workspace = this.parse(JSON.stringify(json));
    return workspace;
  };

  public static fetchAll = async (token: string): Promise<Map<string, IWorkspace>> => {
    const workspaceMap = new Map<string, IWorkspace>();
    const response = await fetch(workspaceURLs.getAllWorkspaces, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });
    if (response.status != 200) {
      const error: IWorkspaceError = {
        name: "WorkspaceFetchError",
        code: response.status,
        message: response.statusText,
      };
      throw error;
    }

    const json = (await response.json()) as any;


    json.result.map((workspace: unknown) => {
      const space = new IWorkspace(workspace, token);
      workspaceMap.set(space.workspaceId, space);
    });
    return workspaceMap;
  };

  public delete = async () => {

    const workspace_id = this.workspaceId
    const response = await fetch(workspaceURLs.deleteWorkspace, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ workspaceId: workspace_id }),
    });

    if (response.status !== 200) {
      const error: IWorkspaceError = {
        name: "WorkspaceDeleteError",
        code: response.status,
        message: "Error Occured in Deleting Workspace",
      };
      throw error;
    }
    return workspace_id
  };
}
