import { List, Grid, Detail } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { useState } from "react";

import PullRequestListItem from "./components/PullRequestListItem";
import SearchContextDropdown from "./components/SearchContextDropdown";
import View from "./components/View";
import { ExtendedRepositoryFieldsFragment, PullRequestFieldsFragment } from "./generated/graphql";
import { pluralize } from "./helpers";
import { getGitHubClient } from "./helpers/withGithubClient";
import { useViewer } from "./hooks/useViewer";

type SearchContextProps = {
  repository?: ExtendedRepositoryFieldsFragment;
};
function SearchContext({ repository }: SearchContextProps) {
  const { github } = getGitHubClient();

  const viewer = useViewer();
  const sections = ["Branch", "Pull Request", "Issue"];

  const [searchText, setSearchText] = useState("");

  const {
    data,
    isLoading,
    mutate: mutateList,
  } = useCachedPromise(
    async (searchText) => {
      const result = await github.searchPullRequests({
        query: `is:pr author:@me archived:false ${searchText}`,
        numberOfItems: 2,
      });

      return result.search.edges?.map((edge) => edge?.node as PullRequestFieldsFragment);
    },
    [searchText],
    { keepPreviousData: true }
  );

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Globally search pull requests across repositories"
      onSearchTextChange={setSearchText}
      searchBarAccessory={<SearchContextDropdown onFilterChange={setSearchText} />}
      throttle
    >
      {sections.map((title) => {
        return data ? (
          <List.Section key={title} title={title} subtitle={pluralize(data.length, title, { withNumber: true })}>
            {data.map((pullRequest) => {
              return (
                <PullRequestListItem
                  key={pullRequest.id}
                  pullRequest={pullRequest}
                  viewer={viewer}
                  mutateList={mutateList}
                />
              );
            })}
          </List.Section>
        ) : null;
      })}
    </List>
  );
}

export default function Command() {
  return (
    <View>
      <SearchContext />
    </View>
  );
}
