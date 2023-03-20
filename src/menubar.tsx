import { MenuBarExtra, open } from "@raycast/api";

import { GitpodIcons } from "../constants";

import { useHistory } from "./helpers/repository";
import { getGitpodEndpoint } from "./preferences/gitpod_endpoint";

export default function Command() {
  const { data } = useHistory("", "");
  const gitpodEndpoint = getGitpodEndpoint();

  return (
    <MenuBarExtra icon={GitpodIcons.gitpod_logo_primary}>
      <MenuBarExtra.Section title="Recent Repositories">
        {data.map((repository) => (
          <MenuBarExtra.Item
            key={repository.nameWithOwner}
            title={repository.nameWithOwner}
            icon={GitpodIcons.repoIcon}
            onAction={() => open(`${gitpodEndpoint}#https://github.com/${repository.nameWithOwner}`)}
          />
        ))}
      </MenuBarExtra.Section>
    </MenuBarExtra>
  );
}
