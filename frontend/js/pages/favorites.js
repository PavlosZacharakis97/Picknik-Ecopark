async function renderFavorites() {
    try {
        await ensureFavoritesLoaded();
        const favoriteIds = getFavorites();

        if (favoriteIds.length === 0) {
            return `
                <div class="container" style="text-align:center;padding:80px 20px;">
                    <h1>${t('nav_favorites')}</h1>
                    <p style="color:var(--text-light);margin-top:16px;">${t('favorites_empty')}</p>
                    <a href="#/" class="btn btn-lg" style="margin-top:24px;">${t('favorites_cta')}</a>
                </div>
            `;
        }

        const cottages = await getCottages();
        const favorites = cottages.filter(c => favoriteIds.includes(c.id));

        return `
            <div class="container">
                <h1 style="margin:32px 0 24px;">${t('nav_favorites')}</h1>
                <div class="cottages-grid">
                    ${favorites.map(c => cottageCard(c)).join('')}
                </div>
            </div>
        `;
    } catch (err) {
        return renderError(err.message);
    }
}
