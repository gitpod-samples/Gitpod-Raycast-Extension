import { LocalStorage, open, showToast, Toast } from "@raycast/api";
import { getPreferenceValues } from "@raycast/api";

interface Preferences {
  preferredEditor: string;
  useLatest: boolean;
  preferredEditorClass: "g1-standard" | "g1-large";
}

export default async function OpenInGitpod(contextUrl: string, type: "Branch" | "Pull Request" | "Issue" | "Repository", repository: string, context?: string) {
  let preferences = getPreferenceValues<Preferences>();

  if (type === "Branch" || type === "Pull Request" || type === "Issue") {
    const item = await LocalStorage.getItem<string>(`${repository}%${context}`)
    const contextPref = item ? await JSON.parse(item) : null
    if (contextPref && contextPref.preferredEditor && contextPref.preferredEditorClass) {
      preferences = contextPref
    } else {
      const repoItem = await LocalStorage.getItem<string>(`${repository}`);
      const repoPref = repoItem ? await JSON.parse(repoItem) : null
      if (repoPref && repoPref.preferredEditor && repoPref.preferredEditorClass) {
        preferences = repoPref
      }
    }
  } else if (type === "Repository") {
    const item = await LocalStorage.getItem<string>(`${repository}`);
    const repoPref = item ? await JSON.parse(item) : null
    if (repoPref && repoPref.preferredEditor && repoPref.preferredEditorClass) {
      preferences = repoPref
    }
  }

  if (type === "Branch") {
    //visit branch 
  } else if (type === "Pull Request") {
    //vitit pr
  } else if (type === "Issue") {
    //visit issue
  }

  try {
    await showToast({
      title: "Launching your workspace",
      style: Toast.Style.Success,
    });
    setTimeout(() => {
      open(`https://gitpod.io/new/?showOptions=false&useLatest=${preferences.useLatest}&editor=${preferences.preferredEditor}&workspaceClass=${preferences.preferredEditorClass}#${contextUrl}`);
    }, 1000);
  } catch (error) {
    await showToast({
      title: "Error launching workspace",
      style: Toast.Style.Failure,
    });
  }
}
