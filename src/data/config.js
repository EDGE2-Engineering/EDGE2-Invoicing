
export const initialSiteContent = {
    global: {
        siteName: "Easy Billing",
        contactPhone: "+919999999999",
        contactEmail: "edge2@gmail.com",
        address: "EDGE2 - Easy Billing, Karnataka",
        footerAbout: "EDGE2 - Easy Billing"
    },
    pagination: {
        // Very conservative - first page has header, client details, totals, bank details, payment terms
        itemsPerFirstPage: 4,
        // Continuation pages have more space (just header + table)
        itemsPerContinuationPage: 5,
        // T&C Pagination
        tcItemsFirstPage: 3,
        tcItemsContinuationPage: 3,
        // Technicals Pagination
        techItemsFirstPage: 3,
        techItemsContinuationPage: 3
    }
};

export const getSiteContent = () => {
    const stored = localStorage.getItem('site_content');
    if (stored) return JSON.parse(stored);
    return initialSiteContent;
};

export const saveSiteContent = (content) => {
    localStorage.setItem('site_content', JSON.stringify(content));
    window.dispatchEvent(new Event('storage-content'));
};

export const TG_NOTIFIER_CONFIG = {
    BOT_TOKEN: import.meta.env.VITE_TG_BOT_TOKEN,
    CHAT_ID: import.meta.env.VITE_TG_CHAT_ID
};

export const enableInfoDiagramZoom = false;

