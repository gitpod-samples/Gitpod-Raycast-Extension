import { Action, ActionPanel, Icon, List, open, showToast, Toast } from "@raycast/api";
import { format } from "date-fns";
import { useMemo } from "react";

import { PullRequestFieldsFragment, UserFieldsFragment } from "../generated/graphql";
import {
  getCheckStateAccessory,
  getNumberOfComments,
  getPullRequestAuthor,
  getPullRequestStatus,
  getReviewDecision,
} from "../helpers/pull-request";

type PullRequestListItemProps = {
  pullRequest: PullRequestFieldsFragment;
  viewer?: UserFieldsFragment;
  removePullReq?: (PullRequest: PullRequestFieldsFragment) => void;
  visitPullReq?: (pullRequest: PullRequestFieldsFragment) => void;
  fromCache?: boolean;
};

export default function PullRequestListItem({ pullRequest, removePullReq, visitPullReq, fromCache }: PullRequestListItemProps) {
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
      title={pullRequest.title}
      subtitle={{ value: `#${pullRequest.number}`, tooltip: `Repository: ${pullRequest.repository.nameWithOwner}` }}
      icon={{ value: status.icon, tooltip: `Status: ${status.text}` }}
      keywords={keywords}
      accessories={accessories}
      actions={
        <ActionPanel>
          <Action
            title="Open PR in Gitpod"
            onAction={() => {
              visitPullReq?.(pullRequest)
              open(`https://gitpod.io/#${pullRequest.permalink}`);
            }}
          />
          <Action
            title="View PR in GitHub"
            onAction={() => {
              open(pullRequest.permalink);
            }}
          />
          {fromCache &&
            <Action
              title="Remove from Recents"
              onAction={async () => {
                removePullReq?.(pullRequest)
                await showToast({
                  title: `Removed PR #${pullRequest.number} of "${pullRequest.repository.name}" from recents`,
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

