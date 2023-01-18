import { List } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { useState } from "react";

import BranchListItem from "./components/BranchListItem";
import IssueListItem from "./components/IssueListItem";
import PullRequestListItem from "./components/PullRequestListItem";
import SearchContextDropdown from "./components/SearchContextDropdown";
import View from "./components/View";
import {
  BranchDetailsFragment,
  ExtendedRepositoryFieldsFragment,
  IssueFieldsFragment,
  PullRequestFieldsFragment,
} from "./generated/graphql";
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
        branches?: BranchDetailsFragment[] | undefined;
      } = {};

      let n = 2;
      if (sections.length == 1) {
        n = 10;
      } else if (sections.length == 2) {
        n = 3;
      }

      if (sections.includes("/p")) {
        const pullRequest = (
          await github.searchPullRequests({
            query: `is:pr repo:${repository.nameWithOwner} ${
              forAuthor ? "author:@me" : ""
            } archived:false ${searchText.trim()}`,
            numberOfItems: n,
          })
        ).search.edges?.map((edge) => edge?.node as PullRequestFieldsFragment);
        result.pullRequest = pullRequest;
      }

      if (sections.includes("/i")) {
        const issues = (
          await github.searchIssues({
            query: `is:issue repo:${repository.nameWithOwner} ${
              forAuthor ? "author:@me" : ""
            } archived:false ${searchText.trim()}`,
            numberOfItems: n,
          })
        ).search.nodes?.map((node) => node as IssueFieldsFragment);
        result.issues = issues;
      }

      if (sections.includes("/b")) {
        const branches = (
          await github.getExistingRepoBranches({
            orgName: forAuthor && viewer?.login ? viewer.login : repository.owner.login,
            repoName: repository.name,
            branchQuery: searchText.trim(),
            defaultBranch: repository.defaultBranchRef?.defaultBranch ?? "main",
            numberOfItems: n,
          })
        ).repository?.refs?.edges?.map((edge) => edge?.node as BranchDetailsFragment);
        result.branches = branches;
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
    const searchString: string[] = [];
    chunks.forEach((chunk) => {
      if (chunk[0] === "/" && arr.includes(chunk.toLocaleLowerCase())) {
        option.push(chunk.toLocaleLowerCase());
      } else if (chunk[0] === "/" && chunk === "/me") {
        isAuthor = true;
      } else {
        searchString.push(chunk);
      }
    });

    if (option.length === 0) {
      setSections(arr);
    } else {
      setSections(option);
    }
    const searchChunk = searchString.join(" ");
    setForAuthor(isAuthor);
    if (searchChunk === "") {
      setSearchText(" ");
    } else {
      setSearchText(searchChunk.trim());
    }
  };

  return (
    <List
      isLoading={isPRLoading}
      searchBarPlaceholder="Filter `/b` for branches, `/p` for Pull Request, `/i` for issues"
      onSearchTextChange={parseSearchOptions}
      navigationTitle={"Add `/me` to filter from your profile 🧡"}
      throttle
    >
      {sections.includes("/b") && data?.branches !== undefined && (
        <List.Section
          key={"Branches"}
          title={"Branches"}
          subtitle={pluralize(data?.branches.length, "Branch", { withNumber: true })}
        >
          {data.branches.map((branch) => {
            return (
              <BranchListItem
                key={branch.branchName}
                mainBranch={repository.defaultBranchRef?.defaultBranch ?? ""}
                repository={repository.nameWithOwner}
                branch={branch}
                viewer={viewer}
              />
            );
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
