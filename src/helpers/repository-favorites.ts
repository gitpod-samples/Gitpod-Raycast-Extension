import { LocalStorage } from "@raycast/api";
import { useCachedState } from "@raycast/utils";

import { ExtendedRepositoryFieldsFragment } from "../generated/graphql";

const FAVORITE_REPOSITORIES_KEY = "FAVORITE_REPOSITORIES";

async function getLocalStorage(): Promise<ExtendedRepositoryFieldsFragment[]> {
  const json = await LocalStorage.getItem<string>(FAVORITE_REPOSITORIES_KEY);
  const parsed = JSON.parse(json ?? "[]");
  const fragments = parsed as ExtendedRepositoryFieldsFragment[];
  return fragments;
}

async function setLocalStorage(repositories: ExtendedRepositoryFieldsFragment[]): Promise<void> {
  const json = JSON.stringify(repositories);
  await LocalStorage.setItem(FAVORITE_REPOSITORIES_KEY, json);
}

export function useFavorites() {
  const [favorites, setFavorites] = useCachedState<ExtendedRepositoryFieldsFragment[]>("favorites", []);

  getLocalStorage().then((repositories) => {
    setFavorites(repositories);
  });

  async function addFavorite(repository: ExtendedRepositoryFieldsFragment) {
    console.log("Adding repository to favorites", repository.id);
    const updated = [repository, ...(favorites?.filter((item) => item.id !== repository.id) ?? [])];
    await setLocalStorage(updated);
    setFavorites(updated);
  }

  async function removeFavorite(repository: ExtendedRepositoryFieldsFragment) {
    console.log("Removing repository from favorites", repository.id);
    const updated = [...(favorites?.filter((item) => item.id !== repository.id) ?? [])];
    await setLocalStorage(updated);
    setFavorites(updated);
  }

  return { favorites, addFavorite, removeFavorite };
}
