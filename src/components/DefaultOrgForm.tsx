import { Action, ActionPanel, Detail, Form, LocalStorage, getPreferenceValues, useNavigation } from "@raycast/api"
import { usePromise } from "@raycast/utils"

import { IOrganization } from "../api/Gitpod/Models/IOrganizations"
import { dashboardPreferences } from "../preferences/dashboard_preferences";

export default function DefaultOrgForm( ) {

    const preferences = getPreferenceValues<dashboardPreferences>();

    const { pop } = useNavigation();

    const { isLoading, data, error } = usePromise(async () => {
        const data = await IOrganization.fetchOrganization(preferences.access_token ?? "");
        return data
    })


    return (
        error ? <Detail metadata={"Failed to Fetch Organization, Try Again"} /> :
            <Form isLoading={isLoading} actions={
                <ActionPanel>
                    <Action.SubmitForm onSubmit={async (values) => { await LocalStorage.setItem("default_organization", values["default_organization"]); pop(); }} />
                </ActionPanel>
            } >
                <Form.Dropdown id="default_organization" title="Default Organization">
                    {data?.map((org) => <Form.Dropdown.Item title={org.name} value={org.orgId} />)}
                </Form.Dropdown>
            </Form>
    )
}