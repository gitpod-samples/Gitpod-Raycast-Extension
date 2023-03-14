import { List, showToast, Toast } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { useState, useMemo } from "react";

import TemplateListEmptyView from "./components/TemplateListEmptyView";
import TemplateListItem from "./components/TemplateListItem";
import View from "./components/View";
import { ExtendedRepositoryFieldsFragment } from "./generated/graphql";
import { getGitHubClient } from "./helpers/withGithubClient";

function SearchRepositories() {
  const { github } = getGitHubClient();

  const [searchText, setSearchText] = useState("");

  const query = useMemo(() => `fork:true org:gitpod-samples is:template ${searchText}`, [searchText]);

  const {
    data,
    isLoading,
    mutate: mutateList,
  } = useCachedPromise(
    async (query) => {
      const result = await github.searchRepositories({ query, numberOfItems: 10 });
      return result.search.nodes?.map((node) => node as ExtendedRepositoryFieldsFragment);
    },
    [query],
    {
      keepPreviousData: true,
      onError(error) {
        showToast({
          title: error.message,
          style: Toast.Style.Failure,
        });
      },
    }
  );

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search in public and private repositories"
      onSearchTextChange={setSearchText}
      throttle
    >
      {data ? (
        <List.Section
          title={"Find your favorite template"}
          subtitle={`${data.length}`}
        >
          {data.map((repository) => {
            return (
              <TemplateListItem
                key={repository.id}
                repository={repository}
                mutateList={mutateList}
              />
            );
          })}
        </List.Section>
      ) : null}
      <TemplateListEmptyView searchText={searchText} isLoading={isLoading} sampleRepositories={data} />
    </List>
  );
}

export default function Command() {
  return (
    <View>
      <SearchRepositories />
    </View>
  );
}
