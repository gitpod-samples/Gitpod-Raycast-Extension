import { LocalStorage } from "@raycast/api";
import { useCachedState } from "@raycast/utils";
import { useEffect } from "react";

import { BranchDetailsFragment, IssueFieldsFragment, PullRequestFieldsFragment } from "../generated/graphql";

const RECENT_REPO_CONTEXT_KEY = "RECENT_REPOS_CONTEXTS";
const RECENT_REPO_CONTEXT_LENGTH = 10;

type Contexts = {
  pullRequest?: PullRequestFieldsFragment[] | undefined;
  issues?: IssueFieldsFragment[] | undefined;
  branches?: BranchDetailsFragment[] | undefined;
}

// History was stored in `LocalStorage` before, after migration it's stored in `Cache`
async function loadRecentRepoContexts() {
  const item = await LocalStorage.getItem<string>(RECENT_REPO_CONTEXT_KEY);
  if (item) {
    const parsed = JSON.parse(item).slice(0, RECENT_REPO_CONTEXT_LENGTH);
    return parsed as { repoName: string, contexts: Contexts }[];
  } else {
    return [];
  }
}

export function useContextHistory() {
  const [history, setHistory] = useCachedState<{ repoName: string, contexts: Contexts }[]>("contextsHistory", []);
  const [migratedHistory, setMigratedHistory] = useCachedState<boolean>("migratedContextsHistory", false);

  useEffect(() => {
    if (!migratedHistory) {
      loadRecentRepoContexts().then((repositories) => {
        setHistory(repositories);
        setMigratedHistory(true);
      });
    }
  }, [migratedHistory]);

  function addRepoContext(repo_context: { repoName: string, contexts: Contexts }) {
    LocalStorage.setItem(RECENT_REPO_CONTEXT_KEY, JSON.stringify([repo_context]));
    setHistory([repo_context, ...history]);
  }

  return { history, addRepoContext };
}

