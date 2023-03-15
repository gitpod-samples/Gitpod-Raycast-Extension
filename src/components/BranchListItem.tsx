import { Action, ActionPanel, Color, List, open, showToast, Toast } from "@raycast/api";

import { branchStatus, GitpodIcons } from "../../constants";
import { BranchDetailsFragment } from "../generated/graphql";

type BranchItemProps = {
  branch: BranchDetailsFragment;
  mainBranch?: string;
  repository: string;
  visitBranch?: (branch: BranchDetailsFragment, repository: string) => void;
  removeBranch?: (branch: BranchDetailsFragment, repository: string) => void;
  fromCache?: boolean
};

export default function BranchListItem({ branch, repository, visitBranch, fromCache, removeBranch }: BranchItemProps) {
  const accessories: List.Item.Accessory[] = [];
  const branchURL = "https://github.com/" + repository + "/tree/" + branch.branchName;

  if (branch.compData) {
    if (branch.compData.status) {
      switch (branch.compData.status.toString()) {
        case branchStatus.ahead:
          accessories.unshift({
            text: branch.compData.aheadBy.toString(),
            icon: GitpodIcons.branchAhead,
          });
          break;
        case branchStatus.behind:
          accessories.unshift({
            text: branch.compData.aheadBy.toString(),
            icon: GitpodIcons.branchBehind,
          });
          break;
        case branchStatus.diverged:
          accessories.unshift({
            text: branch.compData.aheadBy.toString(),
            icon: GitpodIcons.branchDiverged,
          });
          break;
        case branchStatus.IDENTICAL:
          accessories.unshift({
            text: "IDN",
            icon: GitpodIcons.branchIdentical,
          });
          break;
      }
    }

    if (branch.compData.commits) {
      accessories.unshift({
        tag: {
          value: branch.compData.commits.totalCount.toString(),
          color: Color.Yellow,
        },
        icon: GitpodIcons.commit_icon,
      });
    }
  }

  return (
    <List.Item
      icon={GitpodIcons.branchIcon}
      subtitle={repository ?? ""}
      title={branch.branchName}
      accessories={accessories}
      actions={
        <ActionPanel>
          <Action
            title="Open Branch in Gitpod"
            onAction={() => {
              visitBranch?.(branch, repository)
              open(`https://gitpod.io/#${branchURL}`);
            }}
          />
          <Action
            title="Open Branch in GitHub"
            onAction={() => {
              open(branchURL);
            }}
          />
          {fromCache &&
            <Action
              title="Remove from Recents"
              onAction={async () => {
                removeBranch?.(branch, repository)
                await showToast({
                  title: `Removed "${branch.branchName}" of "${repository}" from recents`,
                  style: Toast.Style.Success,
                });
              }}
              shortcut={{ modifiers: ["cmd"], key: "d" }}
            />}
        </ActionPanel>
      }
    />
  );
}
