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

   1. Find the repository from GitHub (you can even see if the repo is Gitpodified...it glows up ✨)
   
      ![RepoSearch](/metadata/RepoCatelog.png)
   2. You can now see and find all the branches, PRs and Issues which you can directly open in Gitpod with a single Keypress!
   
      ![ContextView](/metadata/OpenBranchPRIssue.png)
   
   You can filter and search further using the following tags
      - `/b` for branch
      - `/p` for PRs 
      - `/i` for Issues
      - `/me` for anything and everything related to 
         - eg. `/me /p` would refer to your Pull Requests in a particular repository!

   ![FilterView](/metadata/FilterBranchPRIssue.png)

   3. Open using "CMD + Enter" to open the selected Branch, PR or Issue directly on Gitpod

2. "Recent Repositories" -> Faster Access of Recent Workspaces from menubar
   
3. By default you can see the latest visited Repository to start with! 


