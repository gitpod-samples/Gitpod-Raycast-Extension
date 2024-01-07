import { runAppleScript } from "run-applescript";

export const getFocusedBrowserContext = async () => {
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
          return ""
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
      `);

    return result;
  } catch (e) {
    console.log("error occured");
    return "";
  }
};

export const getFocusedTextContext = async () => {
  const text = await runAppleScript(`
    -- Back up clipboard contents:
    set savedClipboard to my fetchStorableClipboard()
    
    -- Copy selected text to CLIPBOARD:
    set thePasteboard to current application's NSPasteboard's generalPasteboard()
    
    try
        -- Copy selected text to clipboard:
        tell application "System Events" to keystroke "c" using {command down}
        delay 0.1 -- Allow time for the clipboard to update
        
        set theSelectedText to the clipboard
        
        if theSelectedText is not "" then
            -- Makes the selected text all uppercase:
            set AppleScript's text item delimiters to {quote}
            set textItems to text items of theSelectedText
            set AppleScript's text item delimiters to ""
            set theSelectedText to textItems as text
            -- From: http://apple.stackexchange.com/a/171196/184907
            set theModifiedSelectedText to theSelectedText
            
            
            -- Overwrite the old selection with the desired text:
            set the clipboard to theModifiedSelectedText
            
            delay 0.1 -- Without this delay, may restore clipboard before pasting.
            
            -- Instead of the above three lines, you could instead use:
            --      tell application "System Events" to keystroke theModifiedSelectedText
            -- But this way is a little slower.
            
            -- Restore clipboard:
            my putOnClipboard:savedClipboard
            
            return theModifiedSelectedText
        else
            return ""
        end if
    on error
        return ""
    end try
    
    use AppleScript version "2.4"
    use scripting additions
    use framework "Foundation"
    use framework "AppKit"
    
    
    on fetchStorableClipboard()
        set aMutableArray to current application's NSMutableArray's array() -- used to store contents
        -- get the pasteboard and then its pasteboard items
        set thePasteboard to current application's NSPasteboard's generalPasteboard()
        -- loop through pasteboard items
        repeat with anItem in thePasteboard's pasteboardItems()
            -- make a new pasteboard item to store existing item's stuff
            set newPBItem to current application's NSPasteboardItem's alloc()'s init()
            -- get the types of data stored on the pasteboard item
            set theTypes to anItem's types()
            -- for each type, get the corresponding data and store it all in the new pasteboard item
            repeat with aType in theTypes
                set theData to (anItem's dataForType:aType)'s mutableCopy()
                if theData is not missing value then
                    (newPBItem's setData:theData forType:aType)
                end if
            end repeat
            -- add new pasteboard item to array
            (aMutableArray's addObject:newPBItem)
        end repeat
        return aMutableArray
    end fetchStorableClipboard
    
    
    on putOnClipboard:theArray
        -- get pasteboard
        set thePasteboard to current application's NSPasteboard's generalPasteboard()
        -- clear it, then write new contents
        thePasteboard's clearContents()
        thePasteboard's writeObjects:theArray
    end putOnClipboard:
    `);

  return filterText(text);
};

function filterText(text: string): string {
  return identifyGitHubEntity(dequote(text.trim()));
}

function dequote(input: string): string {
  return input.replace(/['"]+/g, "");
}

export function identifyGitHubEntity(url: string): string {
  const repoPattern = /https?:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+/;
  const pullPattern = /https?:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/pull\/\d+/;
  const issuePattern = /https?:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/issues\/\d+/;
  const branchPattern = /https?:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/tree\/[A-Za-z0-9_.-]+/;

  if (repoPattern.test(url) || pullPattern.test(url) || issuePattern.test(url) || branchPattern.test(url)) {
    return url;
  } else {
    return "";
  }
}

export function removeGitHubPrefix(url: string): string {
  const prefix = "https://github.com/";
  if (url.startsWith(prefix)) {
    return url.slice(prefix.length);
  }
  return url;
}
