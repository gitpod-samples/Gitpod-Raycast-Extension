import { EventEmitter } from "events";

import WebSocket from 'ws';

import { NewIWorkspaceUpdateObject } from "./Models/IWorkspaceUpdate";

export interface StartWorkspace {
    method: "startWorkspace";
    params: string;
}

export interface StopWorkspace {
    method: "stopWorkspace";
    params: string;
}

export type APIEvents = "WorkspaceUpdate" | "getWorkspace" | "instanceUpdated"
export type WorkspaceMethods = StartWorkspace | StopWorkspace

export class GitpodAPI extends EventEmitter {
  private static instance: GitpodAPI;
  private static webSocket: WebSocket;
  public static token: string

  constructor(token: string, cookie: string) {
    super();
    GitpodAPI.token = token;
    GitpodAPI.webSocket  = new WebSocket('wss://gitpod.io/api/gitpod', {
        headers: {
        Cookie: `_gitpod_io_v2_=${cookie}`
    }
    });
    this.registerWebSocketEvents();
  }

  public static getInstance(): GitpodAPI {
    if (!GitpodAPI.instance) {
        throw new Error("GitpodAPI Class not initialized yet.")
    }
    return GitpodAPI.instance;    
  }

  public on(event: APIEvents, listener: (event: any) => void){
    return super.on(event, listener);
  }

  public execute( method: WorkspaceMethods ){
    const data = {
      "jsonrpc": "2.0",
      "id" : Math.round(Math.random() * 1000),
      ...method
    }
    GitpodAPI.webSocket.send(JSON.stringify(data))
  }

  private registerWebSocketEvents(){
    // here I have to parse all the messages and then emit according to the type of message that has been occured
    // Currently let's go for start only

    GitpodAPI.webSocket.on("message", (message) => {
        const jsonObj = JSON.parse(message.toString());
        if (jsonObj.method){
            // method for the changing instance of the workspaces
            if (jsonObj.method == "onInstanceUpdate"){
                this.emit("instanceUpdated", NewIWorkspaceUpdateObject(jsonObj));
            }
        }
    })

    GitpodAPI.webSocket.on("error", (error) => {
        // todo: Handle the necessary errors
    })

    GitpodAPI.webSocket.on("open", () => {
        // todo: Handle the open operation
    })
  }

}


