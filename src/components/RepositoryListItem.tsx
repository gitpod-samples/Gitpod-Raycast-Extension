import { Color, List, ActionPanel, Action, open, useNavigation, Icon, showToast, Toast } from "@raycast/api";
import { MutatePromise, usePromise } from "@raycast/utils";

import { GitpodIcons, UIColors } from "../../constants";
import { ExtendedRepositoryFieldsFragment } from "../generated/graphql";
import OpenInGitpod, { getPreferencesForContext } from "../helpers/openInGitpod";
import { getGitHubUser } from "../helpers/users";
import SearchContext from "../open_repo_context";
import RepositoryPreference from "../preferences/repository_preferences";

type RepositoryListItemProps = {
  repository: ExtendedRepositoryFieldsFragment;
  isGitpodified: boolean;
  onVisit: (repository: ExtendedRepositoryFieldsFragment) => void;
  removeRepository?: (repository: ExtendedRepositoryFieldsFragment) => void;
  mutateList: MutatePromise<ExtendedRepositoryFieldsFragment[] | undefined>;
  fromCache?: boolean;
};

export default function RepositoryListItem({
  repository,
  isGitpodified,
  onVisit,
  fromCache,
  removeRepository,
}: RepositoryListItemProps) {
  const { push } = useNavigation();
  const owner = getGitHubUser(repository.owner);
  const numberOfStars = repository.stargazerCount;

  const { data: preferences, revalidate } = usePromise(async () => {
    const response = await getPreferencesForContext("Repository", repository.nameWithOwner);
    return response;
  });

  const accessories: List.Item.Accessory[] = [
    {
      text: {
        value: preferences?.preferredEditorClass === "g1-large" ? "L" : "S",
      },
      icon: {
        source: Icon.ComputerChip,
        tintColor: UIColors.gitpod_gold,
      },
      tooltip: `Editor: ${preferences?.preferredEditor}, Class: ${preferences?.preferredEditorClass} `,
    },
    {
      icon: isGitpodified ? GitpodIcons.gitpod_logo_primary : GitpodIcons.gitpod_logo_secondary,
    },
  ];

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
          <Action title="Open Repo in GitHub" onAction={() => open(repository.url)} />
          {fromCache && (
            <Action
              title="Remove from Recents"
              onAction={async () => {
                removeRepository?.(repository);
                await showToast({
                  title: `Removed "${repository.name}" from recents`,
                  style: Toast.Style.Success,
                });
              }}
              shortcut={{ modifiers: ["cmd"], key: "d" }}
            />
          )}
          <Action
            title="Trigger Workspace"
            onAction={() => OpenInGitpod(repository.url, "Repository", repository.nameWithOwner)}
            shortcut={{ modifiers: ["cmd"], key: "g" }}
          />
          <Action
            title="Configure Workspace"
            onAction={() =>
              push(<RepositoryPreference revalidate={revalidate} repository={repository.nameWithOwner} />)
            }
            shortcut={{ modifiers: ["cmd"], key: "w" }}
          />
        </ActionPanel>
      }
    />
  );
}
