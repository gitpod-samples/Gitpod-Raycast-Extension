import { List } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { useEffect, useState } from "react";

import IssueListItem from "./components/IssueListItem";
import PullRequestListItem from "./components/PullRequestListItem";
import SearchContextDropdown from "./components/SearchContextDropdown";
import View from "./components/View";
import { ExtendedRepositoryFieldsFragment, IssueFieldsFragment, PullRequestFieldsFragment } from "./generated/graphql";
import { pluralize } from "./helpers";
import { getGitHubClient } from "./helpers/withGithubClient";
import { useViewer } from "./hooks/useViewer";

type SearchContextProps = {
  repository: ExtendedRepositoryFieldsFragment;
};

function SearchContext({ repository }: SearchContextProps) {
  const { github } = getGitHubClient();
  const viewer = useViewer();
  const [sections, setSections] = useState(["/b", "/i", "/p"]);

  const [searchText, setSearchText] = useState("");
  const [forAuthor, setForAuthor] = useState(false);



  const {
    data,
    isLoading: isPRLoading,
    mutate: mutateList,
  } = useCachedPromise(
    async (searchText) => {
      const result: {
        pullRequest?: PullRequestFieldsFragment[] | undefined;
        issues?: IssueFieldsFragment[] | undefined;
        branches?: (string | undefined)[];
      } = {};

      if (sections.includes("/p")) {
        const pullRequest = (
          await github.searchPullRequests({
            query: `is:pr repo:RocketChat/Rocket.Chat ${forAuthor ? "author:@me" : ""} archived:false ${searchText}`,
            numberOfItems: 15,
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
        const branches = (
          await github.getExistingRepoBranches({
            owner: "RocketChat",
            name: "Rocket.Chat",
          })
        ).repository?.refs?.edges?.map((edge) => edge?.node?.branchName);
        result.branches = branches;
      }

      return result;
    },
    [searchText],
    { keepPreviousData: true }
  );

  const arr = ["/b", "/i", "/p"];

  useEffect(() => {
    if (sections.includes("/p") && data?.pullRequest) {
      data?.pullRequest.filter((pullRequest) => {
        return pullRequest.title.includes(searchText);
      });
    }

      // if (sections.includes("/i")) {
      //   data?.pullRequest.filter((pullRequest) => {
      //     return pullRequest.title.includes(searchText);
      //   });
      // }

      // if (sections.includes("/b")) {
      // }
  }, [searchText]);

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
    console.log(searchString, "curr search str");
    setSections(option);
    setForAuthor(isAuthor);
    setSearchText(searchString);
  };

  return (
    <List
      isLoading={isPRLoading}
      searchBarPlaceholder="Globally search pull requests across repositories"
      onSearchTextChange={parseSearchOptions}
      searchBarAccessory={<SearchContextDropdown onFilterChange={setSearchText} />}
      throttle
    >
      {sections.includes("/b") && data?.branches !== undefined && (
        <List.Section
          key={"Branches"}
          title={"Branches"}
          subtitle={pluralize(data?.branches.length, "Branch", { withNumber: true })}
        >
          {data.branches.map((branch) => {
            return <List.Item title={branch ?? ""} />;
          })}
        </List.Section>
      )}

      {sections.includes("/p") && data?.pullRequest !== undefined && (
        <List.Section
          key={"Pulls"}
          title={"Pull Requests"}
          subtitle={pluralize(data?.pullRequest.length, "Pull Request", { withNumber: true })}
        >
          {data.pullRequest.map((pullRequest) => {
            return <PullRequestListItem key={pullRequest.id} pullRequest={pullRequest} viewer={viewer} />;
          })}
        </List.Section>
      )}

      {sections.includes("/i") && data?.issues !== undefined && (
        <List.Section
          key={"Issues"}
          title={"Issues"}
          subtitle={pluralize(data?.issues.length, "Issue", { withNumber: true })}
        >
          {data.issues.map((issue) => {
            return <IssueListItem key={issue.id} issue={issue} viewer={viewer} />;
          })}
        </List.Section>
      )}
    </List>
  );
}

export default function Command({ repository }: SearchContextProps) {
  return (
    <View>
      <SearchContext repository={repository} />
    </View>
  );
}
