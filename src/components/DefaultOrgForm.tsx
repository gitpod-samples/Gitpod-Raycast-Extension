import { Action, ActionPanel, Detail, Form, LocalStorage, Toast, getPreferenceValues, showToast, useNavigation } from "@raycast/api"
import { usePromise } from "@raycast/utils"

import { IOrganization } from "../api/Gitpod/Models/IOrganizations"
import { dashboardPreferences } from "../preferences/dashboard_preferences";

interface defaultOrgParams {
    revalidate?: () => Promise<void>;
}


export default function DefaultOrgForm({revalidate} : defaultOrgParams) {

    const preferences = getPreferenceValues<dashboardPreferences>();

    const { pop } = useNavigation();

    const { isLoading, data, error } = usePromise(async () => {
        const data = await IOrganization.fetchOrganization(preferences.access_token ?? "");
        return data
    })

    return (
        error ? <Detail metadata={"Failed to Fetch Organization, Try Again"} /> :
            <Form navigationTitle="Select default organization" isLoading={isLoading} actions={
                <ActionPanel>
                    <Action.SubmitForm 
                    onSubmit={
                        async (values) => { 
                            await LocalStorage.setItem("default_organization", values["default_organization"]); 
                            const toast = await showToast({
                                title: "Saving default organization",
                                style: Toast.Style.Animated
                            })
                            revalidate && await revalidate();
                            setTimeout(() => {
                                toast.hide()
                                pop();
                            }, 2000);
                             }} />
                </ActionPanel>
            } >
                <Form.Dropdown id="default_organization" placeholder="Select Default Organization" title="Default Organization">
                    {data?.map((org) => <Form.Dropdown.Item title={org.name} value={org.orgId} />)}
                </Form.Dropdown>
            </Form>
    )
}