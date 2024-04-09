const { ClientSecretCredential } = require("@azure/identity");
const { Client } = require("@microsoft/microsoft-graph-client");
const tenantId = "Your Tenant ID";
const clientId = "Your Client ID";
const clientSecret = "Your Client Secret Value";
const licenseSkuId = "your license SKU ID";
const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

const authProvider = {
    getAccessToken: async () => {
        const token = await credential.getToken("https://graph.microsoft.com/.default");
        return token.token;
    },
};
// Create a new user
const displayname = "YourName";
const newUser = {
    accountEnabled: true,
    displayName: `${displayname}`,
    mailNickname: `${displayname}@domain.com`,
    userPrincipalName: `${displayname}@domain.com`,
    passwordProfile: {
        forceChangePasswordNextSignIn: false,
        password: "yourpassword"
    },
    usageLocation: "ID"
};

// Initialize Graph client
const client = Client.initWithMiddleware({ authProvider });

// Add new user
client
    .api('/users')
    .post(newUser)
    .then((response) => {
        console.log("User Berhasil ditambahkan.");
        console.log(response);

        // Assign a license to the user
        const licenseAssignment = {
            addLicenses: [
                {
                    disabledPlans: [],
                    skuId: licenseSkuId
                }
            ],
            removeLicenses: []
        };

        client
        .api(`/users/${response.id}/assignLicense`)
        .post(licenseAssignment)
        .then((response) => {
            console.log("Sukses assigned License.");
            console.log(response);
        
            // Unassign the license
            const licenseRemoval = {
                addLicenses: [],
                removeLicenses: [licenseSkuId]
            };
        
            client
                .api(`/users/${response.id}/assignLicense`)
                .post(licenseRemoval)
                .then(() => {
                    console.log("Sukses unassigned License.");
        
                    // Delete the user account
                    client
                        .api(`/users/${response.id}`)
                        .delete()
                        .then(() => {
                            console.log("User Berhasil Dihapus.");
                        })
                        .catch((error) => {
                            console.log("Error Menghapus: ", error);
                        });
                })
                .catch((error) => {
                    console.log("Error unassigning license: ", error);
                });
        })
        .catch((error) => {
            console.log("Error unassigning license: ", error);
        });  
    });