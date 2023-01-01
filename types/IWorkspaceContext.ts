export default interface workspaceContext {
  source: string;
  branch: string;
  commit?: string;
  uncommitedFiles?: string[];
  type: string;
  date: Date;
}