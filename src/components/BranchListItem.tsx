import { Action, ActionPanel, Color, List, open } from "@raycast/api";

import { branchStatus, GitpodIcons } from "../../constants";
import { BranchDetailsFragment, UserFieldsFragment } from "../generated/graphql";

type BranchItemProps = {
  branch: BranchDetailsFragment;
  mainBranch: string;
  viewer?: UserFieldsFragment;
  repository: string;
  repositoryWithoutOwner: string;
  repositoryOwner: string;
  repositoryLogo: string;
  bodyVisible: boolean;
  changeBodyVisibility: (state: boolean) => void
};

export default function BranchListItem({ branch, mainBranch, repository, repositoryLogo, repositoryWithoutOwner, repositoryOwner, changeBodyVisibility, bodyVisible }: BranchItemProps) {
  const accessories: List.Item.Accessory[] = [];
  const branchURL = "https://github.com/" + repository + "/tree/" + branch.branchName;

  let icon = GitpodIcons.branchAhead

  if (branch.compData) {
    if (branch.compData.status) {
      switch (branch.compData.status.toString()) {
        case branchStatus.ahead:
          accessories.unshift({
            text: bodyVisible ? branch.compData.aheadBy.toString() : "",
            icon: GitpodIcons.branchAhead,
          });
          icon = GitpodIcons.branchAhead;
          break;
        case branchStatus.behind:
          accessories.unshift({
            text: bodyVisible ? branch.compData.aheadBy.toString() : "",
            icon: GitpodIcons.branchBehind,
          });
          icon = GitpodIcons.branchBehind;
          break;
        case branchStatus.diverged:
          accessories.unshift({
            text: bodyVisible ? branch.compData.aheadBy.toString() : "",
            icon: GitpodIcons.branchDiverged,
          });
          icon = GitpodIcons.branchDiverged
          break;
        case branchStatus.IDENTICAL:
          accessories.unshift({
            text: "IDN",
            icon: GitpodIcons.branchIdentical,
          });
          icon = GitpodIcons.branchIdentical
          break;
      }
    }
  }

  if (branch.compData && branch.compData.commits && !bodyVisible) {
    accessories.unshift({
      tag: {
        value: branch.compData.commits.totalCount.toString(),
        color: Color.Yellow,
      },
      icon: GitpodIcons.commit_icon,
    });
  }

  return (
    <List.Item
      icon={GitpodIcons.branchIcon}
      subtitle={bodyVisible ? mainBranch : ""}
      title={branch.branchName}
      accessories={accessories}
      detail={
        <List.Item.Detail 
            markdown={`\n\n![RepositoryOwner](${repositoryLogo})\n# ${repositoryOwner}\n${repositoryWithoutOwner}`}
            metadata={
              <List.Item.Detail.Metadata>
                <List.Item.Detail.Metadata.Label title="Branch Name" icon={GitpodIcons.branchIcon} text={branch.branchName}/>
                <List.Item.Detail.Metadata.Label title="Parent Branch" icon={GitpodIcons.branchIcon} text={mainBranch}/>
                <List.Item.Detail.Metadata.Label title="Total Commits" icon={GitpodIcons.commit_icon} text={branch.compData ? branch.compData.commits.totalCount.toString() : "Failed To Load"}/>
                { branch.compData && <List.Item.Detail.Metadata.Label title="Branch Status" icon={icon} text={branchStatus.IDENTICAL ? "IDN" : branch.compData.aheadBy.toString()}/>}
              </List.Item.Detail.Metadata>
            }
        />
      }
      actions={
        <ActionPanel>
          <Action
            title="Open Gitpod with Branch"
            shortcut={{ modifiers: ["cmd"], key: "enter" }}
            onAction={() => {
              open(`https://gitpod.io/#${branchURL}`);
            }}
          />
          <Action
            title="Open branch in Github"
            onAction={() => {
              open(branchURL);
            }}
            shortcut={{ modifiers: ["shift"], key: "enter" }}
          />
          <Action
            title="Show branch Preview"
            shortcut={{ modifiers: ["cmd"], key: "arrowRight" }}
            onAction={() => {
              changeBodyVisibility(true);
            }}
          />
          <Action
            title="Hide branch Preview"
            onAction={() => {
              changeBodyVisibility(false)
            }}
            shortcut={{ modifiers: ["cmd"], key: "arrowLeft" }}
          />
        </ActionPanel>
      }
    />
  );
}
