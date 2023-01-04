import { List, Grid, Detail } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { useState } from "react";

import PullRequestListItem from "./components/PullRequestListItem";
import SearchContextDropdown from "./components/SearchContextDropdown";
import View from "./components/View";
import { IssueFieldsFragment, PullRequestFieldsFragment } from "./generated/graphql";
import { pluralize } from "./helpers";
import { getGitHubClient } from "./helpers/withGithubClient";
import { useViewer } from "./hooks/useViewer";

type SearchContextProps = {
  repository?: ExtendedRepositoryFieldsFragment;
};
function SearchContext({ repository }: SearchContextProps) {
  const { github } = getGitHubClient();

  const viewer = useViewer();
  const [ sections, setSections ] = useState(["/b", "/i", "/p"]);

  const [searchText, setSearchText] = useState("");
  const [forAuthor, setForAuthor] = useState(false);

  const {
    data,
    isLoading,
    mutate: mutateList,
  } = useCachedPromise(
    async (searchText) => {
      const result: {
        pullRequest?: PullRequestFieldsFragment[] | undefined,
        issues?: IssueFieldsFragment[] | undefined,
        branches?: (string | undefined)[]
      } = {
      }

      if (sections.includes("/p")) {
        const pullRequest = (
          await github.searchPullRequests({
            query: `is:pr repo:RocketChat/Rocket.Chat ${forAuthor ? "author:@me" : ""} archived:false ${searchText}`,
            numberOfItems: 5,
          })
        ).search.edges?.map((edge) => edge?.node as PullRequestFieldsFragment);
        result.pullRequest = pullRequest;
      }


      if (sections.includes("/i")) {
        const issues = (
          await github.searchIssues({
            query: `is:issue repo:RocketChat/Rocket.Chat ${forAuthor ? "author:@me" : ""} archived:false ${searchText}`,
            numberOfItems: 5,
          })
        ).search.nodes?.map((node) => node as IssueFieldsFragment);
        result.issues = issues;
      }

      if (sections.includes("/b")) {
        const branches = (await github.getExistingRepoBranches({
          owner: "RocketChat",
          name: "Rocket.Chat"
        })).repository?.refs?.edges?.map((edge) => edge?.node?.branchName);
        result.branches = branches
      }

      return result;
    },
    [searchText],
    { keepPreviousData: true }
  );

  const arr = ["/b", "/i", "/p"];

  const parseSearchOptions = (searchDat: string) => {
    const chunks: string[] = searchDat.split(" ");
    const option: string[] = [];
    let isAuthor = false;
    let searchString = " ";
    chunks.forEach((chunk) => {
      if (chunk[0] === "/" && arr.includes(chunk.toLocaleLowerCase())) {
        option.push(chunk.toLocaleLowerCase());
      } else if (chunk[0] === "/" && chunk === "/me") {
        isAuthor = true;
      } else {
        searchString = chunk;
      }
    });

    setSections(option);
    setForAuthor(isAuthor);
    setSearchText(searchString);
  };

  return (
    <List
      filtering={false}
      isLoading={isLoading}
      searchBarPlaceholder="Globally search pull requests across repositories"
      onSearchTextChange={parseSearchOptions}
      searchBarAccessory={<SearchContextDropdown onFilterChange={setSearchText} />}
      throttle
    >
      {/* {sections.map((title) => {
        return data ? (
          
        ) : null;
      })} */}

      {
        sections.includes('\b') && data?.branches !== undefined &&
        (
          <List.Section key={"Branches"} title={"Branches"} subtitle={pluralize(data?.branches.length, "Branches", { withNumber: true })}>
            {data.branches.map((branch) => {
              return (
                <List.Item title={branch ?? ""}/>
              );
            })}
          </List.Section>
        )
      }

      {sections.includes("/p") && data?.pullRequest !== undefined &&
        (<List.Section key={"Pulls"} title={"Pull Requests"} subtitle={pluralize(data?.pullRequest.length, "Pull Requests", { withNumber: true })}>
          {data.pullRequest.map((pullRequest) => {
            return (
              <PullRequestListItem
                key={pullRequest.id}
                pullRequest={pullRequest}
                viewer={viewer}
              />
            );
          })}
        </List.Section>)
      }
      
      {
        sections.includes("/i") && data?.issues !== undefined &&
        (
          <List.Section key={"Issues"} title={"Issues"} subtitle={pluralize(data?.issues.length, "Issues", { withNumber: true })}>
            {data.issues.map((issue) => {
              return (
                <List.Item title={issue.title ?? ""}/>
              );
            })}
          </List.Section>
        )
      }
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
