
export const initialSiteContent = {
  global: {
    siteName: "EDGE2 - MTR",
    contactPhone: "+919999999999",
    contactEmail: "edge2@gmail.com",
    address: "EDGE2 - MTR, Karnataka",
    footerAbout: "EDGE2 - MTR"
  },
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
