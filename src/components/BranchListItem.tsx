import { Action, ActionPanel, Color, List, open, useNavigation } from "@raycast/api";

import { branchStatus, GitpodIcons } from "../../constants";
import { BranchDetailsFragment, UserFieldsFragment } from "../generated/graphql";
import OpenInGitpod from "../helpers/openInGitpod";
import ContextPreferences from "../preferences/context_preferences";

type BranchItemProps = {
  branch: BranchDetailsFragment;
  mainBranch: string;
  viewer?: UserFieldsFragment;
  repository: string;
};

export default function BranchListItem({ branch, mainBranch, repository }: BranchItemProps) {
  const accessories: List.Item.Accessory[] = [];
  const branchURL = "https://github.com/" + repository + "/tree/" + branch.branchName;

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
      subtitle={mainBranch}
      title={branch.branchName}
      accessories={accessories}
      actions={
        <ActionPanel>
          <Action
            title="Open Branch in Gitpod"
            onAction={() => {
              OpenInGitpod(branchURL,"Branch",repository,branch.branchName)
            }}
            shortcut={{ modifiers: ["cmd"], key: "g" }}
          />
          <Action
            title="Open Branch in GitHub"
            onAction={() => {
              open(branchURL);
            }}
          />
          <Action title="Configure Workspace" onAction={()=> push(<ContextPreferences type="Branch" repository={repository} context={branch.branchName}/>)} shortcut={{ modifiers: ["cmd"], key: "w" }}/>
        </ActionPanel>
      }
    />
  );
}
