<p align="center">
  <a href="https://www.gitpod.io">
    <img src="./assets/Icons/GitpodRaycastLogo.svg" alt="Gitpod Logo" height="130" />
    <br />
    <strong>Gitpod Raycast Extension</strong>
  </a>
  <br />
  <span>Powered by The Gitpod Community 💛</span>
</p>

<p align="center">
  <a href="https://gitpod.io/from-referrer/">
    <img src="https://img.shields.io/badge/gitpod-f06611.svg" alt="Gitpod ready-to-code" />
  </a>
  <a href="https://werft.gitpod-dev.com/">
    <img src="https://img.shields.io/badge/typescript-%23007ACC.svg" alt="Werft.dev - Gitpod CI" />
  </a>
  <a href="https://www.gitpod.io/chat"> 
    <img src="https://img.shields.io/badge/-GraphQL-E10098" alt="Discord" />
  </a>
</p>

# Community Raycast Extension for Gitpod 
The Community Raycast Extension is an extension made for the Raycast App in MacOS, which promises to integrate the best features of Gitpod with your operating system by means of Raycast.
The community raycast extension, made by Gitpod Heroes [Henit Chobisa](https://github.com/henit-chobisa) and [M Palanikannan](https://github.com/Palanikannan1437) serves the soul aim of making accessibility of <i>Gitpod Faster than Local Development</i> by providing extensive feature to open any github context with gitpod or managing your workspace just a click on your menubar, the extension got it all covered.


https://github.com/gitpod-samples/Gitpod-Raycast-Extension/assets/72302948/8b49ad96-b4c8-463d-9811-3bb4027682d2


     

## Let's get it on your Mac!

1.  Install Raycast to get started if you haven't by simply clicking on this button! 😉

- <a href="https://www.raycast.com/henitchobisa/gitpod"><img src="https://www.raycast.com/henitchobisa/gitpod/install_button@2x.png" height="64" alt="" style="height: 64px;"></a>

2. Navigate to the Raycast Store to Download the `Gitpod` extension
![GithubLogin](/assets/Screenshots/NavigatingContexts/Download%20GItpod.png)
3. While generating the GitHub Access Token, make sure to give the `user`, `admin` & `repo` access rights, else it may result in some weird behaviours.
![GithubLogin](/assets/Screenshots/NavigatingContexts/GIthub%20Login%20Success.png)
4. For directly opening the workspaces and interaction with Gitpod, you'll need a Gitpod Access Token which is currently in beta and available for limited users, if you have a github access token, navigate to command setting by using `cmd` + `,` and set the access token there.
![GithubLogin](/assets/Screenshots/NavigatingContexts/AccessTokenGItpod.png)
![GithubLogin](/assets/Screenshots/NavigatingContexts/GitpodAccessToken.png)
5. Setup your default organization for creating new workspaces in the Manage Workspaces Window.
![GithubLogin](/assets/Screenshots/NavigatingContexts/SetupDefaultOrganization.png)

## Command Descriptions
### <i>Manage Workspaces</i>
`Manage Workspaces` Command is responsible for managing your workspaces from Gitpod Dashboard, you can stop or start your existing workspaces there or create empty workspaces
### <i>Open Contexts from Github</i>
`Open Contexts` command takes responsibility to browse or create workspaces from any context url from github, no matter it's a PR or Issue or Branch or a whole repository. Along with that you can pin contexts or later use or can view your issues or PR descriptions right away!
### <i>Menubar Workspaces</i>
`Menubar Workspaces` is the command that gets the extension so near to achieving it's goal of `Gitpod Faster than local`, with it's function to start workspaces and opening it into your favourite IDE in just a click!


# Key Features
## <i>Navigating Contexts</i> 
With the `Open Context from Github` Command, it's incredibly easy to navigate contexts such as Repositories, branches, pull requests and issues.

### Browsing and Filtering 
- You can browse repositories and also any context URL inside of the repostory as well such as branches, PR or Issues
![Browsing Contexts](/assets/Screenshots/NavigatingContexts/Browse%20Repository.png)
![Browsing Ctx](/assets/Screenshots/NavigatingContexts/Inside%20Repository.png)
- Along with that we make sure that your browsing experience should be super smooth with the help of filtering 
You can filter and search further using the following tags
      - `/b` for branch
      - `/p` for PRs 
      - `/i` for Issues
      - `/me` for anything and everything related to 
         - eg. `/me /p` would refer to your Pull Requests in a particular repository!
![ContextView](/metadata/OpenBranchPRIssue.png)

### Displaying Contexts
As a product manager or a maintainer, we provided context preview, so that you can have a glimpse on contexts on the go and can open the right one.
![Displaying Context](/assets/Screenshots/NavigatingContexts/Search%20PR%20Open.png)
![Displaying Context](/assets/Screenshots/NavigatingContexts/Search%20Issue%20Open.png)

### Pinning Contexts for Faster Access
We pin every context that you open with Gitpod, for faster us and if you wish to manually add any context to your recent, you can achieve by a single command `cmd` + `R` and bingo!
![Pinning Context](/assets/Screenshots/NavigatingContexts/Add%20To%20Recent%20Issue.png)
![Pinning Context](/assets/Screenshots/NavigatingContexts/Issue%20Recent%20Success.png)
![Pinning Context](/assets/Screenshots/NavigatingContexts/Issue%20Added%20Recent%20.png)

### Opening Contexts with Github
If Context Display is not enough and you need a deep dive in conversation or add any labels, you can open contexts directly in Github with a single command `cmd` + `RETURN`
![Opening Context in Github](/assets/Screenshots/NavigatingContexts/View%20in%20Github%20Issue.png)

## <i>Managing Workspaces</i>
### Starting Workspaces ( Requires Gitpod PAT)
Using the `Managing Workspace` Command, you can start and launch your workspaces.
The extension shows you all the stages of your workspaces, Running, Progressing and Stopped.
![Starting Workspace](/assets/Screenshots/Workspaces/WorkspaceWindow.png)
TODO, ADD Starting Workspace Video

Wait!! There is more, with `Menubar Workspace` Menubar command, to do this which is the key feature for `Gitpod Accessibility faster than local.`

TODO, ADD MENUBAR VIDEO

### Stopping workspaces (Required Gitpod PAT)
You can use a simple command `cmd` + `s`, on the running workspaces and you can see them stopping on real time, just like magic ✨

TODO, ADD Stop Workspace VIDEO
### Selecting Default Editor to Open
You can also select your favourite editor for opening your workspaces, just go to command preferences with `cmd` + `,` change the default editor, currently the extension supports VSCode Browser, VSCode Desktop and SSH which you can use with VIM, checkout [axonasif/dotsh](https://github.com/axonasif/dotsh).

![Changing Editor](/assets/Screenshots/Workspaces/Changing%20Editor.png)

## <i>Creating New Workspaces</i>




