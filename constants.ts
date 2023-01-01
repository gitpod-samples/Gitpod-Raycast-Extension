export enum workspaceStatus {
  workspace_Inactive = "stopped",
  workspace_active = "running",
  workspace_progressing = "progressing",
  workspace_failed = "failed",
}

export enum workspaceClass {
  standard = "Standard",
  large = "Large"
}

export enum desc {
  standard_workspace_desc = "Up to 4 vCPU, 8GB memory, 30GB disk",
  large_workspace_desc = "Up to 8 vCPU, 16GB memory, 50GB disk"
}

export enum UIColors {
  primary_dark = "#12100C",
  primary_light = "#f5f4f4",
  gitpod_gold = "#FFB45B",
}

export enum statusColors {
  running = "#84cc18",
  progressing = "#FFB45B",
  stopped = "#a8a29e",
  failed = "#f77171",
}

export const GitpodIcons = {
  running_icon: { source: "Icons/status_icon.png", tintColor: statusColors.running },
  stopped_icon: { source: "Icons/status_icon.png", tintColor: statusColors.stopped },
  failed_icon: { source: "Icons/status_icon.png", tintColor: statusColors.failed },
  progressing_icon: { source: "Icons/status_icon.png", tintColor: statusColors.progressing },
  octicon_branch_icon: {
    source: "https://raw.githubusercontent.com/primer/octicons-v2/master/icons/24/git-branch.svg",
    tintColor: statusColors.running,
  },
  gitpod_logo_primary: { source: "logo-mark.png" },
  gitpod_logo_secondary: { source: "logo-mark.png", tintColor: statusColors.stopped },
};
