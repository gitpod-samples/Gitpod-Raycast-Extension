import { Action, ActionPanel, Icon, List, open, useNavigation } from "@raycast/api";

import { usePromise } from "@raycast/utils";

import { format } from "date-fns";
import { pull } from "lodash";
import { useMemo } from "react";

import { UIColors } from "../../constants";
import { PullRequestFieldsFragment, UserFieldsFragment } from "../generated/graphql";
import OpenInGitpod, { getPreferencesForContext } from "../helpers/openInGitpod";

import {
  getCheckStateAccessory,
  getNumberOfComments,
  getPullRequestAuthor,
  getPullRequestStatus,
  getReviewDecision,
} from "../helpers/pull-request";
import ContextPreferences from "../preferences/context_preferences";

type PullRequestListItemProps = {
  pullRequest: PullRequestFieldsFragment;
  viewer?: UserFieldsFragment;
};

export default function PullRequestListItem({ pullRequest }: PullRequestListItemProps) {
  const updatedAt = new Date(pullRequest.updatedAt);
  const { push } = useNavigation();

  const numberOfComments = useMemo(() => getNumberOfComments(pullRequest), []);
  const author = getPullRequestAuthor(pullRequest);
  const status = getPullRequestStatus(pullRequest);
  const reviewDecision = getReviewDecision(pullRequest.reviewDecision);

  const { data: preferences, revalidate } = usePromise(
    async () => {
      const response = await getPreferencesForContext("Pull Request", pullRequest.repository.nameWithOwner, pullRequest.title);
      return response;
    },
  );

  const accessories: List.Item.Accessory[] = [
    {
      date: updatedAt,
      tooltip: `Updated: ${format(updatedAt, "EEEE d MMMM yyyy 'at' HH:mm")}`,
    },
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
              OpenInGitpod(pullRequest.permalink, "Pull Request", pullRequest.repository.nameWithOwner, pullRequest.title);
            }}
            shortcut={{ modifiers: ["cmd"], key: "g" }}
          />
          <Action
            title="View PR in GitHub"
            onAction={() => {
              open(pullRequest.permalink);
            }}
          />
          <Action title="Configure Workspace" onAction={() => push(<ContextPreferences revalidate={revalidate} type="Pull Request" repository={pullRequest.repository.nameWithOwner} context={pullRequest.title} />)} shortcut={{ modifiers: ["cmd"], key: "w" }} />
        </ActionPanel>
      }
    />
  );
}
