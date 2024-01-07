import { LocalStorage } from "@raycast/api";
import { useCachedState } from "@raycast/utils";

import { ExtendedRepositoryFieldsFragment } from "../generated/graphql";

const FAVORITE_REPOSITORIES_KEY = "FAVORITE_REPOSITORIES";

type FavoriteRepository = {
  isFirst: boolean;
  isLast: boolean;
  repository: ExtendedRepositoryFieldsFragment;
};

async function getLocalStorage(): Promise<FavoriteRepository[]> {
  const json = await LocalStorage.getItem<string>(FAVORITE_REPOSITORIES_KEY);
  const parsed = JSON.parse(json ?? "[]");
  const fragments = parsed as FavoriteRepository[];
  return fragments;
}

async function setLocalStorage(repositories: FavoriteRepository[]): Promise<void> {
  const json = JSON.stringify(repositories);
  await LocalStorage.setItem(FAVORITE_REPOSITORIES_KEY, json);
}

export function useFavorites(searchText: string | null, searchFilter: string | null) {
  const [favorites, setFavorites] = useCachedState<FavoriteRepository[]>("favorites", []);

  getLocalStorage().then((repositories) => {
    setFavorites(repositories);
  });

  async function addFavorite(repository: ExtendedRepositoryFieldsFragment): Promise<void> {
    if (favorites.find((item) => item.repository.id == repository.id)) {
      console.warn("Repository already in favorites list", repository.id);
      return;
    }

    const updated = [...favorites];
    updated.push({
      repository: repository,
      isFirst: false,
      isLast: true,
    });

    setFirstAndLast(updated);
    await setLocalStorage(updated);
    setFavorites(updated);
  }

  async function removeFavorite(repository: ExtendedRepositoryFieldsFragment): Promise<void> {
    const updated: FavoriteRepository[] = [];
    favorites.forEach((item) => {
      if (item.repository.id !== repository.id) {
        updated.push({
          repository: item.repository,
          isFirst: false,
          isLast: false,
        });
      }
    });

    setFirstAndLast(updated);
    await setLocalStorage(updated);
    setFavorites(updated);
  }

  async function moveFavoriteUp(repository: ExtendedRepositoryFieldsFragment): Promise<void> {
    const updated: FavoriteRepository[] = [...favorites];

    const index = updated.findIndex((item) => item.repository.id === repository.id);

    if (index > 0) {
      const previous = updated[index - 1];
      updated[index - 1] = updated[index];
      updated[index] = previous;
    }

    setFirstAndLast(updated);
    await setLocalStorage(updated);
    setFavorites(updated);
  }

  async function moveFavoriteDown(repository: ExtendedRepositoryFieldsFragment): Promise<void> {
    const updated: FavoriteRepository[] = [...favorites];

    const index = updated.findIndex((item) => item.repository.id === repository.id);

    if (index < updated.length - 1) {
      const next = updated[index + 1];
      updated[index + 1] = updated[index];
      updated[index] = next;
    }

    setFirstAndLast(updated);
    await setLocalStorage(updated);
    setFavorites(updated);
  }

  function setFirstAndLast(favorites: FavoriteRepository[]): void {
    favorites.forEach((item, index) => {
      if (index == 0) {
        item.isFirst = true;
        item.isLast = favorites.length == 1;
      } else if (index == favorites.length - 1) {
        item.isFirst = false;
        item.isLast = true;
      } else {
        item.isFirst = false;
        item.isLast = false;
      }
    });
  }

  // Filter based on search terms
  const filteredBasedOnText = filteredBasedOnSearchText(favorites, searchText);
  const filteredBasedOnFilter = filteredBasedOnSearchFilter(filteredBasedOnText, searchFilter);

  return { favorites: filteredBasedOnFilter, addFavorite, removeFavorite, moveFavoriteUp, moveFavoriteDown };
}

function filteredBasedOnSearchText(favorites: FavoriteRepository[], searchText: string | null): FavoriteRepository[] {
  if (searchText == null || searchText.length == 0) {
    return favorites;
  }

  const lowerSearchText = searchText.toLowerCase();
  return favorites.filter((item) => {
    const name = item.repository.nameWithOwner.toLowerCase();
    return name.includes(lowerSearchText);
  });
}

function filteredBasedOnSearchFilter(
  favorites: FavoriteRepository[],
  searchFilter: string | null
): FavoriteRepository[] {
  if (searchFilter == null || searchFilter.length == 0) {
    return favorites;
  }

  // Turns "user:mads-hartmann org:scala org:sbt org:gitpod-io" into "mads-hartmann sbt gitpod-io"
  // So we can use it to match against the "nameWithOwner" field
  const ownerNames = searchFilter
    .toLowerCase()
    .split(" ")
    .map((owner) => owner.trim().split(":")[1]);

  return favorites.filter((item) => {
    const match = ownerNames.find((owner) => {
      const name = item.repository.nameWithOwner.toLowerCase();
      return name.includes(owner);
    });
    return !!match;
  });
}
