import { Color, List } from "@raycast/api";

// import { MutatePromise } from "@raycast/utils";
// import { format } from "date-fns";
// import { useMemo } from "react";
import { branchStatus, GitpodIcons, UIColors } from "../../constants";
import { BranchDetailsFragment, MyPullRequestsQuery, PullRequestFieldsFragment, UserFieldsFragment } from "../generated/graphql";

type BranchItemProps = {
  branch: BranchDetailsFragment;
  mainBranch: string;
  viewer?: UserFieldsFragment;
};

export default function BranchListItem({ branch, mainBranch , viewer }: BranchItemProps) {
  const accessories: List.Item.Accessory[] = [];

  if (branch.compData){
    if (branch.compData.status){
      switch( branch.compData.status.toString()){
        case branchStatus.ahead:
          accessories.unshift({
            text: branch.compData.aheadBy.toString(),
            icon: GitpodIcons.branchAhead
          });
          break;
        case branchStatus.behind: 
          accessories.unshift({
            text: branch.compData.aheadBy.toString(),
            icon: GitpodIcons.branchBehind
          });
          break;
        case branchStatus.diverged:
          accessories.unshift({
            text: branch.compData.aheadBy.toString(),
            icon: GitpodIcons.branchDiverged
          })
          break;
        case branchStatus.IDENTICAL: 
          accessories.unshift({
            text: "IDN",
            icon: GitpodIcons.branchIdentical
          })
          break;
      }
    }

    if (branch.compData.commits){
      accessories.unshift({
        tag : {
          value : branch.compData.commits.totalCount.toString(),
          color : Color.Yellow
        },
        icon: GitpodIcons.commit_icon
        
      })
    }
  }

  return (
    <List.Item
      icon={ GitpodIcons.branchIcon }
      subtitle={mainBranch}
      title={branch.branchName}
      accessories={accessories}
    />
  )

}
