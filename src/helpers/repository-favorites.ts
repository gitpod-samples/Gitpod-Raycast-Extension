import { LocalStorage } from "@raycast/api";
import { useCachedState } from "@raycast/utils";

import { ExtendedRepositoryFieldsFragment } from "../generated/graphql";

const FAVORITE_REPOSITORIES_KEY = "FAVORITE_REPOSITORIES";

type FavoriteRepository = {
  isFirst: boolean
  isLast: boolean
  repository: ExtendedRepositoryFieldsFragment
}

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

export function useFavorites() {
  const [favorites, setFavorites] = useCachedState<FavoriteRepository[]>("favorites", []);

  getLocalStorage().then((repositories) => {
    setFavorites(repositories);
  });

  async function addFavorite(repository: ExtendedRepositoryFieldsFragment): Promise<void> {
    console.log("Adding repository to favorites", repository.id);    
    if (favorites.find((item) => item.repository.id == repository.id)) {
      console.warn("Repository already in favorites list", repository.id);
      return
    }

    const updated = [...favorites]
    updated.push({
      repository: repository,
      isFirst: false,
      isLast: true,
    })
    
    setFirstAndLast(updated)
    await setLocalStorage(updated);
    setFavorites(updated);
  }

  async function removeFavorite(repository: ExtendedRepositoryFieldsFragment): Promise<void> {
    console.log("Removing repository from favorites", repository.id);

    const updated: FavoriteRepository[] = []
    favorites.forEach((item) => {
      if (item.repository.id !== repository.id) {
        updated.push({
          repository: item.repository,
          isFirst: false,
          isLast: false,
        })
      }
    })

    setFirstAndLast(updated)
    await setLocalStorage(updated);
    setFavorites(updated);
  }

async function moveFavoriteUp(repository: ExtendedRepositoryFieldsFragment): Promise<void> {
    const updated: FavoriteRepository[] = [...favorites]

    const index = updated.findIndex((item) => item.repository.id === repository.id)

    if (index > 0) {
      const previous = updated[index-1]
      updated[index-1] = updated[index]
      updated[index] = previous
    }

    setFirstAndLast(updated)
    await setLocalStorage(updated);
    setFavorites(updated);
  }

  async function moveFavoriteDown(repository: ExtendedRepositoryFieldsFragment): Promise<void> {
    const updated: FavoriteRepository[] = [...favorites]

    const index = updated.findIndex((item) => item.repository.id === repository.id)

    if (index < updated.length - 1) {
      const next = updated[index+1]
      updated[index+1] = updated[index]
      updated[index] = next
    }

    setFirstAndLast(updated)
    await setLocalStorage(updated);
    setFavorites(updated);
  }

  function setFirstAndLast(favorites: FavoriteRepository[]): void {
    favorites.forEach((item, index) => {
      if (index == 0) {
        item.isFirst = true
        item.isLast = favorites.length == 1
      } else if (index == favorites.length - 1) {
        item.isFirst = false
        item.isLast = true
      } else {
        item.isFirst = false
        item.isLast = false
      }
    })
  }

  return { favorites, addFavorite, removeFavorite, moveFavoriteUp, moveFavoriteDown };
}
