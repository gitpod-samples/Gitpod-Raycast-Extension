import { Action, ActionPanel, Icon, List, open } from "@raycast/api";
// import { MutatePromise } from "@raycast/utils";
import { format } from "date-fns";
import { useMemo } from "react";

import { MyPullRequestsQuery, PullRequestFieldsFragment, UserFieldsFragment } from "../generated/graphql";
import {
  getCheckStateAccessory,
  getNumberOfComments,
  getPullRequestAuthor,
  getPullRequestStatus,
  getReviewDecision,
} from "../helpers/pull-request";

// import PullRequestActions from "./PullRequestActions";
// import PullRequestDetail from "./PullRequestDetail";

type PullRequestListItemProps = {
  pullRequest: PullRequestFieldsFragment;
  viewer?: UserFieldsFragment;
  changeBodyVisibility: (state: boolean) => void
  bodyVisible: boolean;
  // mutateList: MutatePromise<MyPullRequestsQuery | undefined> | MutatePromise<PullRequestFieldsFragment[] | undefined>;
};

export default function PullRequestListItem({ pullRequest, viewer, changeBodyVisibility, bodyVisible }: PullRequestListItemProps) {
  const updatedAt = new Date(pullRequest.updatedAt);

  const numberOfComments = useMemo(() => getNumberOfComments(pullRequest), []);
  const author = getPullRequestAuthor(pullRequest);
  const status = getPullRequestStatus(pullRequest);
  const reviewDecision = getReviewDecision(pullRequest.reviewDecision);

  const accessories: List.Item.Accessory[] = [
    {
      date: updatedAt,
      tooltip: `Updated: ${format(updatedAt, "EEEE d MMMM yyyy 'at' HH:mm")}`,
    },
    {
      icon: author.icon,
      tooltip: `Author: ${author.text}`,
    },
  ];

  if (reviewDecision) {
    accessories.unshift(reviewDecision);
  }

  if (numberOfComments > 0) {
    accessories.unshift({
      text: `${numberOfComments}`,
      icon: Icon.Bubble,
    });
  }

  if (pullRequest.commits.nodes) {
    const checkState = pullRequest.commits.nodes[0]?.commit.statusCheckRollup?.state;
    const checkStateAccessory = checkState ? getCheckStateAccessory(checkState) : null;

    if (checkStateAccessory) {
      accessories.unshift(checkStateAccessory);
    }
  }

  const keywords = [`${pullRequest.number}`];

  if (pullRequest.author?.login) {
    keywords.push(pullRequest.author.login);
  }

  return (
    <List.Item
      key={pullRequest.id}
      title={!bodyVisible ? pullRequest.title : ""}
      subtitle={{ value: `#${pullRequest.number}`, tooltip: `Repository: ${pullRequest.repository.nameWithOwner}` }}
      icon={{ value: status.icon, tooltip: `Status: ${status.text}` }}
      keywords={keywords}
      detail={
        <List.Item.Detail markdown={"## " + pullRequest.title + "\n" + pullRequest.body}/>
      }
      accessories={accessories}
      actions={
        <ActionPanel>
          <Action
            title="Open PR in Gitpod"
            shortcut={{ modifiers: ["cmd"], key: "enter" }}
            onAction={() => {
              open(`https://gitpod.io/#${pullRequest.permalink}`);
            }}
          />
          <Action
            title="Open PR in github"
            onAction={() => {
              open(pullRequest.permalink);
            }}
            shortcut={{ modifiers: ["shift"], key: "enter" }}
          />
          <Action
            title="Show PR Preview"
            shortcut={{ modifiers: ["cmd"], key: "arrowRight" }}
            onAction={() => {
              changeBodyVisibility(true);
            }}
          />
          <Action
            title="Hide PR Preview"
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

{
  /* <PullRequestActions pullRequest={pullRequest} viewer={viewer} mutateList={mutateList}>
  <Action.Push
    title="Show Details"
    icon={Icon.Sidebar}
    target={<PullRequestDetail initialPullRequest={pullRequest} viewer={viewer} mutateList={mutateList} />}
  />
</PullRequestActions>; */
}
