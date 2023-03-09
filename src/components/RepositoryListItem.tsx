import { Color, List, ActionPanel, Action, showToast, Toast, open, useNavigation } from "@raycast/api";
import { MutatePromise } from "@raycast/utils";

import { GitpodIcons } from "../../constants";
import { ExtendedRepositoryFieldsFragment } from "../generated/graphql";
import OpenInGitpod from "../helpers/openInGitpod";
import { getGitHubUser } from "../helpers/users";
import SearchContext from "../open_repo_context";
import RepositoryPreference from "../preferences/repository_preferences";

type RepositoryListItemProps = {
  repository: ExtendedRepositoryFieldsFragment;
  isGitpodified: boolean;
  onVisit: (repository: ExtendedRepositoryFieldsFragment) => void;
  mutateList: MutatePromise<ExtendedRepositoryFieldsFragment[] | undefined>;
};

export default function RepositoryListItem({ repository, isGitpodified, onVisit }: RepositoryListItemProps) {
  const { push } = useNavigation();
  const owner = getGitHubUser(repository.owner);
  const numberOfStars = repository.stargazerCount;

  const accessories: List.Item.Accessory[] = [
    {
      icon: isGitpodified ? GitpodIcons.gitpod_logo_primary : GitpodIcons.gitpod_logo_secondary,
    },
  ];

  const showLaunchToast = async () => {
    await showToast({
      title: "Launching your workspace",
      style: Toast.Style.Success,
    });
    setTimeout(() => {
      open(`https://gitpod.io/#${repository.url}`);
    }, 1500);
  };

  accessories.unshift(
    {
      text: {
        value: repository.issues?.totalCount.toString(),
      },
      icon: GitpodIcons.issues_icon,
    },
    {
      text: {
        value: repository.pullRequests?.totalCount.toString(),
      },
      icon: GitpodIcons.pulls_icon,
    }
  );

  if (repository.latestRelease?.tagName) {
    accessories.unshift({
      tag: {
        value: repository.latestRelease.tagName,
        color: Color.Green,
      },
      icon: GitpodIcons.tag_icon,
    });
  }

  return (
    <List.Item
      icon={owner.icon}
      title={repository.name}
      {...(numberOfStars > 0
        ? {
            subtitle: {
              value: `${numberOfStars}`,
              tooltip: `Number of Stars: ${numberOfStars}`,
            },
          }
        : {})}
      accessories={accessories}
      actions={
        <ActionPanel>
          <Action
            title="Get In"
            onAction={() => {
              onVisit(repository);
              push(<SearchContext repository={repository} />);
            }}
          />
          <Action title="Open Repo in GitHub" onAction={()=>open(repository.url)} />
          <Action title="Trigger Workspace" onAction={()=>OpenInGitpod(repository.url,"Repository",repository.nameWithOwner)} shortcut={{ modifiers: ["cmd"], key: "g" }}/>
          <Action title="Configure Workspace" onAction={()=> push(<RepositoryPreference repository={repository.nameWithOwner} />)} shortcut={{ modifiers: ["cmd"], key: "w" }}/>
        </ActionPanel>
      }
    />
  );
}
