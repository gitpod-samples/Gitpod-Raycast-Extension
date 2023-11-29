import { List, Toast, showToast } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { useState } from "react";

import BranchListItem from "./components/BranchListItem";
import IssueListItem from "./components/IssueListItem";
import PullRequestListItem from "./components/PullRequestListItem";
import {SearchContextDropdown, SearchContextDropdownValue} from "./components/SearchContextDropdown";
import View from "./components/View";
import {
  BranchDetailsFragment,
  ExtendedRepositoryFieldsFragment,
  IssueFieldsFragment,
  PullRequestFieldsFragment,
} from "./generated/graphql";
import { pluralize } from "./helpers";
import { useBranchHistory } from "./helpers/branch";
import { useIssueHistory } from "./helpers/issue";
import { usePullReqHistory } from "./helpers/pull-request";
import { getGitHubClient } from "./helpers/withGithubClient";
import { useViewer } from "./hooks/useViewer";

type SearchContextProps = {
  repository: ExtendedRepositoryFieldsFragment;
};

function SearchContext({ repository }: SearchContextProps) {
  const { github } = getGitHubClient();
  const viewer = useViewer();
  const { visitPullReq } = usePullReqHistory();
  const { history: branchHistory, visitBranch } = useBranchHistory();
  const { visitIssue } = useIssueHistory();
  
  const [bodyVisible, setBodyVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [filter, setFilter] = useState<SearchContextDropdownValue>("branches");

  const changeBodyVisibility = (state: boolean) => {
    setBodyVisible(state);
  };

  const { data, isLoading } = usePromise(
    async (searchText, filter) => {
            
      const result: {
        pullRequests?: PullRequestFieldsFragment[] | undefined;
        myPullRequests?: PullRequestFieldsFragment[] | undefined;
        issues?: IssueFieldsFragment[] | undefined;
        myAssignedIssues?: IssueFieldsFragment[] | undefined;
        branches?: BranchDetailsFragment[] | undefined;
      } = {};

      const n = 10

      switch (filter) {
        case "branches": {
          console.log("Showing branches")
          let branches: BranchDetailsFragment[] | undefined = []
          if (searchText != "") {
            branches = (
              await github.getExistingRepoBranches({
                orgName: repository.owner.login,
                repoName: repository.name,
                branchQuery: searchText.trim(),
                defaultBranch: repository.defaultBranchRef?.defaultBranch ?? "main",
                numberOfItems: n,
              })
            ).repository?.refs?.edges?.map((edge) => edge?.node as BranchDetailsFragment);
          }
          result.branches = branches;
          break;
        }
        case "issues": {
          console.log("Showing issues")
          const mineP = github.searchIssues({
            query: `is:issue assignee:@me is:open repo:${repository.nameWithOwner} archived:false ${searchText.trim()}`,
            numberOfItems: n,
          }).then((r) => r.search.nodes?.map((node) => node as IssueFieldsFragment))
          const allP = github.searchIssues({
            query: `is:issue is:open repo:${repository.nameWithOwner} archived:false ${searchText.trim()}`,
            numberOfItems: n,
          }).then((r) => r.search.nodes?.map((node) => node as IssueFieldsFragment))
          
          const [mine, all] = await Promise.all([mineP, allP])
          result.myAssignedIssues = mine;
          result.issues = all;
          break;
        }
        case "pull-requests": {
          console.log("Showing pull requests")
          const mineP = github.searchPullRequests({
            query: `is:pr is:open author:@me repo:${repository.nameWithOwner} archived:false ${searchText.trim()}`,
            numberOfItems: n,
          }).then((r) => r.search.edges?.map((edge) => edge?.node as PullRequestFieldsFragment));
          const allP = github.searchPullRequests({
            query: `is:pr is:open repo:${repository.nameWithOwner} archived:false ${searchText.trim()}`,
            numberOfItems: n,
          }).then((r) => r.search.edges?.map((edge) => edge?.node as PullRequestFieldsFragment))
          const [mine, all] = await Promise.all([mineP, allP])
          result.pullRequests = all;
          result.myPullRequests = mine;
          break;
        }
      }

      return result;      
    },
    [searchText, filter],
    {
      onError(error) {
        showToast({
          title: error.message,
          style: Toast.Style.Failure,
        });
      },
    }
  );

  const recentBranches = branchHistory.filter((branch) => branch.repository === repository.nameWithOwner && branch.branch.branchName !== "main");

  return (
    <List
      isShowingDetail={bodyVisible}
      isLoading={isLoading}
      searchBarPlaceholder={`Type to search ${filter}`}
      onSearchTextChange={(text) => setSearchText(text)}
      searchBarAccessory={<SearchContextDropdown onFilterChange={(filter) => setFilter(filter)} />}
      navigationTitle={repository.nameWithOwner}
      throttle
    >
      {filter == "branches" && data?.branches !== undefined && (
        <>
        {searchText == "" && (
          <>
            <List.Section
              key={"default-branch"}
              title="Default Branch"
            >
              <BranchListItem
                bodyVisible={bodyVisible}
                changeBodyVisibility={changeBodyVisibility}
                key={repository.defaultBranchRef?.defaultBranch ?? "main"}
                repositoryLogo={repository.owner.avatarUrl}
                repositoryOwner={repository.owner.login}
                repositoryWithoutOwner={repository.name}
                mainBranch={repository.defaultBranchRef?.defaultBranch ?? "main"}
                repository={repository.nameWithOwner}
                branch={{branchName: repository.defaultBranchRef?.defaultBranch ?? "main", compData: undefined}}
                visitBranch={visitBranch}
              />
            </List.Section>
            {recentBranches.length > 0 && (
              <List.Section
              key={"Recent Branches"}
              title={"Recent branches"}
              subtitle={pluralize(recentBranches.length, "Branch", { withNumber: true })}
            >
              {recentBranches.map((branch) => {
                return (
                  <BranchListItem
                    bodyVisible={bodyVisible}
                    changeBodyVisibility={changeBodyVisibility}
                    key={branch.branch.branchName}
                    repositoryLogo={repository.owner.avatarUrl}
                    repositoryOwner={repository.owner.login}
                    repositoryWithoutOwner={repository.name}
                    mainBranch={repository.defaultBranchRef?.defaultBranch ?? ""}
                    repository={repository.nameWithOwner}
                    branch={branch.branch}
                    visitBranch={visitBranch}
                  />
                );
              })}
            </List.Section>
            )}
          </>
        )}
        <List.Section
          key={"Branches"}
          title={"Branches"}
          subtitle={pluralize(data?.branches.length, "Branch", { withNumber: true })}
        >
          {data.branches.map((branch) => {
            return (
              <BranchListItem
                bodyVisible={bodyVisible}
                changeBodyVisibility={changeBodyVisibility}
                key={branch.branchName}
                repositoryLogo={repository.owner.avatarUrl}
                repositoryOwner={repository.owner.login}
                repositoryWithoutOwner={repository.name}
                mainBranch={repository.defaultBranchRef?.defaultBranch ?? ""}
                repository={repository.nameWithOwner}
                branch={branch}
                visitBranch={visitBranch}
              />
            );
          })}
        </List.Section>
        </>
      )}

      {filter == "pull-requests" && data?.myPullRequests !== undefined && (
        <List.Section
          key={"My Pull Requests"}
          title={"My Pull Requests"}
          subtitle={pluralize(data?.myPullRequests.length, "Open Pull Request", { withNumber: true })}
        >
          {data.myPullRequests.map((pullRequest) => {
            if (!pullRequest.closed) {
              return (
                <PullRequestListItem
                  bodyVisible={bodyVisible}
                  changeBodyVisibility={changeBodyVisibility}
                  key={pullRequest.id}
                  pullRequest={pullRequest}
                  viewer={viewer}
                  visitPullReq={visitPullReq}
                />
              );
            }
          })}
        </List.Section>
      )}
      {filter == "pull-requests" && data?.pullRequests !== undefined && (
        <List.Section
          key={"All Pull Requests"}
          title={"All Pull Requests"}
          subtitle={pluralize(data?.pullRequests.length, "Open Pull Request", { withNumber: true })}
        >
          {data.pullRequests.map((pullRequest) => {
            if (!pullRequest.closed) {
              return (
                <PullRequestListItem
                  bodyVisible={bodyVisible}
                  changeBodyVisibility={changeBodyVisibility}
                  key={pullRequest.id}
                  pullRequest={pullRequest}
                  viewer={viewer}
                  visitPullReq={visitPullReq}
                />
              );
            }
          })}
        </List.Section>
      )}

      {filter == "issues" && data?.myAssignedIssues !== undefined && (
        <List.Section
          key={"My Assigned Issues"}
          title={"My Assigned Issues"}
          subtitle={pluralize(data?.myAssignedIssues.length, "Issue", { withNumber: true })}
        >
          {data.myAssignedIssues.map((issue) => {
            return (
              <IssueListItem
                bodyVisible={bodyVisible}
                changeBodyVisibility={changeBodyVisibility}
                key={issue.id}
                issue={issue}
                viewer={viewer}
                visitIssue={visitIssue}
              />
            );
          })}
        </List.Section>
      )}
      {filter == "issues" && data?.issues !== undefined && (
        <List.Section
          key={"Issues"}
          title={"Issues"}
          subtitle={pluralize(data?.issues.length, "Issue", { withNumber: true })}
        >
          {data.issues.map((issue) => {
            return (
              <IssueListItem
                bodyVisible={bodyVisible}
                changeBodyVisibility={changeBodyVisibility}
                key={issue.id}
                issue={issue}
                viewer={viewer}
                visitIssue={visitIssue}
              />
            );
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
