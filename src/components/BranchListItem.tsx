import { Action, ActionPanel, Color, Icon, List, open, useNavigation ,showToast, Toast} from "@raycast/api";
import { usePromise } from "@raycast/utils";

import { branchStatus, GitpodIcons, UIColors } from "../../constants";
import { BranchDetailsFragment } from "../generated/graphql";

import OpenInGitpod, { getPreferencesForContext } from "../helpers/openInGitpod";
import ContextPreferences from "../preferences/context_preferences";

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

  const { data: preferences, revalidate } = usePromise(
    async () => {
      const response = await getPreferencesForContext("Branch", repository, branch.branchName);
      return response;
    },
  );

  const { push } = useNavigation();

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

    accessories.unshift(
      {
        text: {
          value: preferences?.preferredEditorClass === "g1-large" ? "L" : "S",
        },
        icon: {
          source: Icon.ComputerChip,
          tintColor: UIColors.gitpod_gold,
        },
        tooltip: `Editor: ${preferences?.preferredEditor}, Class: ${preferences?.preferredEditorClass} `
      },

    )
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
              OpenInGitpod(branchURL, "Branch", repository, branch.branchName)
            }}
            shortcut={{ modifiers: ["cmd"], key: "g" }}
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
          <Action title="Configure Workspace" onAction={() => push(<ContextPreferences revalidate={revalidate} type="Branch" repository={repository} context={branch.branchName} />)} shortcut={{ modifiers: ["cmd"], key: "w" }} />
        </ActionPanel>
      }
    />
  );
}
