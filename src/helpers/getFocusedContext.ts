import { runAppleScript } from "run-applescript";

export const getFocusedContext = async () => {
    try {
    const result = await runAppleScript(`
      tell application "System Events"
      set activeApp to name of first application process whose frontmost is true
  end tell
  
  if activeApp is "Google Chrome" then
      tell application "Google Chrome"
          set currentURL to URL of active tab of front window
          if currentURL starts with "https://github.com" then
              set AppleScript's text item delimiters to "/"
              set urlComponents to text items of currentURL
              set AppleScript's text item delimiters to ""
              if (count of urlComponents) > 5 then
                  set urlType to item 6 of urlComponents
                  if urlType is in {"tree", "pull", "issues"} then
                      return currentURL
                  end if
              else if (count of urlComponents) is 5 then
                  return currentURL
              end if
          end if
          return "No matching URL"
      end tell
  else if activeApp is "Safari" then
      tell application "Safari"
          set currentURL to URL of current tab of front window
          if currentURL starts with "https://github.com" then
              set AppleScript's text item delimiters to "/"
              set urlComponents to text items of currentURL
              set AppleScript's text item delimiters to ""
              if (count of urlComponents) > 5 then
                  set urlType to item 6 of urlComponents
                  if urlType is in {"tree", "pull", "issues"} then
                      return currentURL
                  end if
              else if (count of urlComponents) is 5 then
                  return currentURL
              end if
          end if
          return ""
      end tell
  end if
      `)

      if (result){
        return removeGitHubPrefix(result)
      }

      return result

    } catch (e) {
        console.log("error occured")
        return ""
    }
}

function removeGitHubPrefix(url: string): string {
    const prefix = 'https://github.com/';
    if (url.startsWith(prefix)) {
        return url.slice(prefix.length);
    }
    return url;
}
