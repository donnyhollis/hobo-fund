import { env } from '$env/dynamic/private';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client directly inside this file to prevent import path errors
const prisma = new PrismaClient();

export async function load() {
    const clientId = env.EBAY_CLIENT_ID;
    const clientSecret = env.EBAY_CLIENT_SECRET;

    if (!clientId || !clientSecret || clientId.includes("actual")) {
        return {
            holdings: [],
            error: "eBay credentials are unset or still placeholders in your .env file."
        };
    }

    try {
        const credentialsBase64 = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

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

        // Pull data directly using our initialized instance
        const realHoldings = await prisma.card.findMany().catch((err) => {
            console.error("❌ Database query failed:", err);
            return [];
        });

        const formattedHoldings = realHoldings.map(card => ({
            id: card.id,
            name: card.name,
            type: card.type || "Baseball",
            grade: card.grade,
            market_price: card.market_price || 0 
        }));

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