import { Action, ActionPanel, Detail, Icon, List, open, useNavigation,showToast, Toast  } from "@raycast/api";
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
  changeBodyVisibility: (state: boolean) => void;
  bodyVisible: boolean;
  mutateList?:
  | MutatePromise<SearchCreatedIssuesQuery | undefined>
  | MutatePromise<SearchOpenIssuesQuery | undefined>
  | MutatePromise<IssueFieldsFragment[] | undefined>;
  visitIssue?: (issue: IssueFieldsFragment) => void;
  removeIssue?: (issue: IssueFieldsFragment) => void;
  fromCache?: boolean;
};

export default function IssueListItem({ issue, changeBodyVisibility, bodyVisible, visitIssue, removeIssue, fromCache }: IssueListItemProps) {
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
      title={!bodyVisible ? issue.title : ""}
      subtitle={{ value: `#${issue.number}`, tooltip: `Repository: ${issue.repository.nameWithOwner}` }}
      icon={{ value: status.icon, tooltip: `Status: ${status.text}` }}
      keywords={keywords}
      accessories={accessories}
      detail={<List.Item.Detail markdown={`## ${issue.title}\n\n ${issue.body}`} />}
      actions={
        <ActionPanel>
          <Action
            title="Open Issue in Gitpod"
            onAction={() => {
              visitIssue?.(issue)
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
          <Action
            title="Show Issue Preview"
            shortcut={{ modifiers: ["cmd"], key: "arrowRight" }}
            onAction={() => {
              changeBodyVisibility(true);
            }}
          />
          <Action
            title="Hide Issue Preview"
            onAction={() => {
              changeBodyVisibility(false)
            }}
            shortcut={{ modifiers: ["cmd"], key: "arrowLeft" }}
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
          <Action title="Configure Workspace" onAction={() => push(<ContextPreferences revalidate={revalidate} repository={issue.repository.nameWithOwner} type="Issue" context={issue.title} />)} shortcut={{ modifiers: ["cmd"], key: "w" }} />
        </ActionPanel>
      }
    />
  );
}