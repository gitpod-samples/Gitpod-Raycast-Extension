import { List } from "@raycast/api";
import { random } from "lodash";
import { useMemo } from "react";

const sampleQueries = [
  "c++",
  "django",
  "flask",
  "react",
  "flutter",
  "docker",
  "node",
  "nix",
  "c#",
  "go",
];

type TemplateListEmptyViewProps = {
  searchText: string;
  isLoading: boolean;
};

export default function TemplateListEmptyView({ searchText, isLoading }: TemplateListEmptyViewProps) {
  const example = useMemo(() => sampleQueries[random(0, sampleQueries.length - 1)], []);

  if (searchText.length > 0 && !isLoading) {
    return <List.EmptyView title="No templates found" />;
  }

  return <List.EmptyView title={`Type query e.g "${example}"`} />;
}
