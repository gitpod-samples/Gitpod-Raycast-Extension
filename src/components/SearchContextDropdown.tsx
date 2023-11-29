import { List, Color } from "@raycast/api";

export type SearchContextDropdownValue = "branches" | "pull-requests" | "issues"

export function SearchContextDropdown(props: { onFilterChange: (filter: SearchContextDropdownValue) => void }) {
  return (
    <List.Dropdown tooltip="Filter" onChange={(f) => props.onFilterChange(f as SearchContextDropdownValue)} storeValue>
      <List.Dropdown.Item 
        title="Branches" 
        value="branches" 
        icon={{ source: "Icons/git-branch.svg", tintColor: Color.PrimaryText }}
      />
      <List.Dropdown.Item
        title="Pull requests"
        value="pull-requests" 
        icon={{ source: "Icons/git-pull-request.svg", tintColor: Color.PrimaryText }}
      />
      <List.Dropdown.Item
        title="Issues"
        value="issues"
        icon={{ source: "Icons/issue-opened.svg", tintColor: Color.PrimaryText }}
      />
    </List.Dropdown>
  );
}
