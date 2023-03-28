import { EventEmitter } from "events";

import WebSocket from 'ws';

import { NewIWorkspaceErrorObject } from "./Models/IWorkspaceError";
import { NewIWorkspaceUpdateObject } from "./Models/IWorkspaceUpdate";

export interface StartWorkspace {
  method: "startWorkspace";
  params: string;
}

export interface StopWorkspace {
  method: "stopWorkspace";
  params: string;
}

export type APIEvents = "errorOccured" | "instanceUpdated"
export type WorkspaceMethods = StartWorkspace | StopWorkspace

export class GitpodAPI extends EventEmitter {
  private static instance: GitpodAPI;
  private static webSocket: WebSocket;
  private static connected = false;
  private static error: WebSocket.ErrorEvent;
  public static token: string

  constructor(token: string, cookie: string) {
    super();
    try {
      GitpodAPI.token = token;
      GitpodAPI.webSocket = new WebSocket('wss://gitpod.io/api/gitpod', {
        headers: {
          Cookie: `_gitpod_io_v2_=${cookie}`
        }
      });
      GitpodAPI.webSocket.onopen = (_) => {
        this.registerWebSocketEvents();
        GitpodAPI.connected = true
      };

      GitpodAPI.webSocket.onerror = (error) => {
        this.emit("errorOccured", NewIWorkspaceErrorObject(error))
        GitpodAPI.error = error;
      }
    } catch (e){
      this.emit("errorOccured", NewIWorkspaceErrorObject(e))
    }
    
  }

  public static getInstance(): GitpodAPI {
    if (!GitpodAPI.instance) {
      throw new Error("GitpodAPI Class not initialized yet.")
    }
    return GitpodAPI.instance;
  }

  public on(event: APIEvents, listener: (event: any) => void) {
    return super.on(event, listener);
  }

  public execute(method: WorkspaceMethods) {
    if (GitpodAPI.connected == true) {
      const data = {
        "jsonrpc": "2.0",
        "id": Math.round(Math.random() * 1000),
        ...method
      }
      GitpodAPI.webSocket.send(JSON.stringify(data))
    } else {
      this.emit("errorOccured", NewIWorkspaceErrorObject(GitpodAPI.error))
    }
  }

  private registerWebSocketEvents() {
    // here I have to parse all the messages and then emit according to the type of message that has been occured
    // Currently let's go for start only

    GitpodAPI.webSocket.on("message", (message) => {
      const jsonObj = JSON.parse(message.toString());
      console.log(jsonObj)
      if (jsonObj.method) {
        if (jsonObj.method == "onInstanceUpdate") {
          this.emit("instanceUpdated", NewIWorkspaceUpdateObject(jsonObj));
        }
      }
      if (jsonObj.error) {
        this.emit("errorOccured", NewIWorkspaceErrorObject(jsonObj.error))
      }
    })
  }

}


