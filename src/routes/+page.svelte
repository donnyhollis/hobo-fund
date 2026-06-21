<script>
    let { data } = $props();
</script>

<main style="padding: 2rem; font-family: sans-serif; max-width: 800px; margin: 0 auto;">
    <h2>💎 Hobo Fund Portfolio Tracker</h2>

    {#if data.error}
        <div style="background: #fee2e2; color: #991b1b; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
            <strong>Authentication Alert:</strong> {data.error}
        </div>
    {/if}

    <h3>Current Holdings</h3>
    {#if data.holdings && data.holdings.length > 0}
        <ul style="list-style: none; padding: 0;">
            {#each data.holdings as card}
                <li style="background: #f3f4f6; padding: 1rem; margin-bottom: 0.5rem; border-radius: 6px; display: flex; justify-content: space-between;">
                    <div>
                        <strong>{card.name}</strong> — <span style="color: #4b5563;">{card.grade}</span>
                    </div>
                    <span style="font-weight: bold; color: #059669;">
                        ${card.market_price.toLocaleString()}
                    </span>
                </li>
            {/each}
        </ul>
    {:else}
        <p style="color: #6b7280;">No assets loaded. Fix your eBay client configuration details to fetch live markets.</p>
    {/if}
</main>