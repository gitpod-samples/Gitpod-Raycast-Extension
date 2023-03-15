import { Action, ActionPanel, Icon, List, open, showToast, Toast } from "@raycast/api";
import { MutatePromise } from "@raycast/utils";
import { format } from "date-fns";

import {
  IssueFieldsFragment,
  SearchCreatedIssuesQuery,
  SearchOpenIssuesQuery,
  UserFieldsFragment,
} from "../generated/graphql";
import { getIssueAuthor, getIssueStatus } from "../helpers/issue";

type IssueListItemProps = {
  issue: IssueFieldsFragment;
  viewer?: UserFieldsFragment;
  mutateList?:
  | MutatePromise<SearchCreatedIssuesQuery | undefined>
  | MutatePromise<SearchOpenIssuesQuery | undefined>
  | MutatePromise<IssueFieldsFragment[] | undefined>;
  visitIssue?: (issue: IssueFieldsFragment) => void;
  removeIssue?: (issue: IssueFieldsFragment) => void;
  fromCache?: boolean;
};

export default function IssueListItem({ issue, visitIssue, removeIssue, fromCache }: IssueListItemProps) {
  const updatedAt = new Date(issue.updatedAt);

  const author = getIssueAuthor(issue);
  const status = getIssueStatus(issue);

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

  if (issue.comments.totalCount > 0) {
    accessories.unshift({
      text: `${issue.comments.totalCount}`,
      icon: Icon.Bubble,
    });
  }

  const keywords = [`${issue.number}`];

  if (issue.author?.login) {
    keywords.push(issue.author.login);
  }

  return (
    <List.Item
      key={issue.id}
      title={issue.title}
      subtitle={{ value: `#${issue.number}`, tooltip: `Repository: ${issue.repository.nameWithOwner}` }}
      icon={{ value: status.icon, tooltip: `Status: ${status.text}` }}
      keywords={keywords}
      accessories={accessories}
      actions={
        <ActionPanel>
          <Action
            title="Open Issue in Gitpod"
            onAction={() => {
              visitIssue?.(issue)
              open(`https://gitpod.io/#${issue.url}`);
            }}
          />
          <Action
            title="View Issue in GitHub"
            onAction={() => {
              open(issue.url);
            }}
          />
          {fromCache &&
            <Action
              title="Remove from Recents"
              onAction={async () => {
                removeIssue?.(issue)
                await showToast({
                  title: `Removed Issue #${issue.number} of "${issue.repository.name}" from recents`,
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
