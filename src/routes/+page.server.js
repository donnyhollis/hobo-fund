import { env } from '$env/dynamic/private';

export async function load() {
    const clientId = env.EBAY_CLIENT_ID;
    const clientSecret = env.EBAY_CLIENT_SECRET;

    // 1. Fallback / Safety checks
    if (!clientId || !clientSecret || clientId.includes("actual")) {
        return {
            holdings: [],
            error: "eBay credentials are unset or still placeholders in your .env file."
        };
    }

    try {
        // 2. Encode credentials for OAuth basic auth
        const credentialsBase64 = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

        // 3. Request application access token from eBay Sandbox
        const tokenResponse = await fetch('https://api.sandbox.ebay.com/identity/v1/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${credentialsBase64}`
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                scope: 'https://api.ebay.com/oauth/api_scope'
            })
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error("❌ eBay API Auth Rejection Details:", tokenData);
            return {
                holdings: [],
                error: `eBay Auth Failed: ${tokenData.error_description || tokenData.error || 'Unknown error'}`
            };
        }

        console.log("✅ Successfully authenticated with eBay Sandbox!");

        // 4. Temporary placeholder data to prevent frontend rendering crashes
        const mockHoldings = [
            { id: 1, name: "1952 Topps Mickey Mantle #311", type: "Baseball", grade: "PSA 8", market_price: 1500000 },
            { id: 2, name: "1989 Upper Deck Ken Griffey Jr. #1", type: "Baseball", grade: "PSA 10", market_price: 2200 }
        ];

        return {
            holdings: mockHoldings,
            error: null
        };

    } catch (err) {
        console.error("❌ System Error inside load function:", err);
        return {
            holdings: [],
            error: err.message
        };
    }
}