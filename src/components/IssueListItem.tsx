import { Action, ActionPanel, Icon, List, open, useNavigation } from "@raycast/api";
import { MutatePromise, usePromise } from "@raycast/utils";
import { format } from "date-fns";

import { UIColors } from "../../constants";
import {
  IssueFieldsFragment,
  SearchCreatedIssuesQuery,
  SearchOpenIssuesQuery,
  UserFieldsFragment,
} from "../generated/graphql";
import { getIssueAuthor, getIssueStatus } from "../helpers/issue";
import OpenInGitpod, { getPreferencesForContext } from "../helpers/openInGitpod";
import ContextPreferences from "../preferences/context_preferences";

type IssueListItemProps = {
  issue: IssueFieldsFragment;
  viewer?: UserFieldsFragment;
  mutateList?:
  | MutatePromise<SearchCreatedIssuesQuery | undefined>
  | MutatePromise<SearchOpenIssuesQuery | undefined>
  | MutatePromise<IssueFieldsFragment[] | undefined>;
};

export default function IssueListItem({ issue }: IssueListItemProps) {
  const { push } = useNavigation();
  const updatedAt = new Date(issue.updatedAt);

  const author = getIssueAuthor(issue);
  const status = getIssueStatus(issue);

  const { data: preferences, revalidate } = usePromise(
    async () => {
      const response = await getPreferencesForContext("Issue", issue.repository.nameWithOwner, issue.title);
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
              OpenInGitpod(issue.url, "Issue", issue.repository.nameWithOwner, issue.title)
            }}
            shortcut={{ modifiers: ["cmd"], key: "g" }}
          />
          <Action
            title="View Issue in GitHub"
            onAction={() => {
              open(issue.url);
            }}
          />
          <Action title="Configure Workspace" onAction={() => push(<ContextPreferences revalidate={revalidate} repository={issue.repository.nameWithOwner} type="Issue" context={issue.title} />)} shortcut={{ modifiers: ["cmd"], key: "w" }} />
        </ActionPanel>
      }
    />
  );
}

