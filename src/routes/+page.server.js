import { env } from '$env/dynamic/private';
import { prisma } from '$lib/prisma'; // Imports your Prisma client to talk to Google Cloud

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

        // 4. LIVE DATABASE QUERY: Pull real cards from Google Cloud SQL
        // If the database is empty, fallback to an empty array instead of crashing
        const realHoldings = await prisma.card.findMany().catch((err) => {
            console.error("❌ Database query failed:", err);
            return [];
        });

        // Map database fields safely to your front-end layout names
        const formattedHoldings = realHoldings.map(card => ({
            id: card.id,
            name: card.name,
            type: card.type || "Baseball",
            grade: card.grade,
            market_price: card.market_price || 0 
        }));

        // If your database has no items yet, show a clean onboarding empty state 
        return {
            holdings: formattedHoldings,
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