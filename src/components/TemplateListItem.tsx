import { Color, List, ActionPanel, Action, showToast, Toast, open } from "@raycast/api";
import { MutatePromise } from "@raycast/utils";

import { GitpodIcons } from "../../constants";
import { ExtendedRepositoryFieldsFragment } from "../generated/graphql";
import { getGitHubUser } from "../helpers/users";

type RepositoryListItemProps = {
    repository: ExtendedRepositoryFieldsFragment;
    isGitpodified: boolean;
    mutateList: MutatePromise<ExtendedRepositoryFieldsFragment[] | undefined>;
};

export default function TemplateListItem({ repository, isGitpodified }: RepositoryListItemProps) {
    const owner = getGitHubUser(repository.owner);
    const numberOfStars = repository.stargazerCount;

    const accessories: List.Item.Accessory[] = [];

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
                    <Action title="Start with Gitpod" onAction={showLaunchToast} />
                    <Action title="View template in GitHub" onAction={() => {
                        open(repository.url);
                    }} />
                    <Action title="Learn more about Gitpod templates" onAction={() => {
                        open("https://www.gitpod.io/docs/introduction/getting-started/quickstart");
                    }} />
                    <Action title="Add a template" onAction={() => {
                        open("https://github.com/gitpod-samples/.github/blob/HEAD/CONTRIBUTING.md");
                    }} />
                </ActionPanel>
            }
        />
    );
}