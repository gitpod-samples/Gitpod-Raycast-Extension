export default interface workspaceContext {
    branch: string;
    commit? : string;
    uncommitedFiles? : string[];
    type : string;
    date : Date;
}