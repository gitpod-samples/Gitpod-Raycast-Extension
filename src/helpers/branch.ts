import { LocalStorage } from "@raycast/api";
import { useCachedState } from "@raycast/utils";
import { useEffect } from "react";

import { BranchDetailsFragment } from "../generated/graphql";

const VISITED_BRANCH_KEY = "VISITED_BRANCHES";
const VISITED_BRANCH_LENGTH = 10;

// History was stored in `LocalStorage` before, after migration it's stored in `Cache`
async function loadVisitedBranches() {
  const item = await LocalStorage.getItem<string>(VISITED_BRANCH_KEY);
  if (item) {
    const parsed = JSON.parse(item).slice(0, VISITED_BRANCH_LENGTH);
    return parsed as BranchDetailsFragment[];
  } else {
    return [];
  }
}
export function useBranchHistory() {
  const [history, setHistory] = useCachedState<BranchDetailsFragment[]>("BranchHistory", []);
  const [migratedHistory, setMigratedHistory] = useCachedState<boolean>("migratedBranchHistory", false);

  useEffect(() => {
    if (!migratedHistory) {
      loadVisitedBranches().then((branches) => {
        setHistory(branches);
        setMigratedHistory(true);
      });
    }
  }, [migratedHistory]);

  function visitBranch(branch: BranchDetailsFragment) {
    const visitedBranch = [branch, ...(history?.filter((item) => item.branchName !== branch.branchName) ?? [])];
    LocalStorage.setItem(VISITED_BRANCH_KEY, JSON.stringify(visitedBranch));
    const nextBranch = visitedBranch.slice(0, VISITED_BRANCH_LENGTH);
    setHistory(nextBranch);
  }

  return { history, visitBranch };
}
