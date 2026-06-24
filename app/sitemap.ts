import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://stageria.pl";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/regulamin`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/polityka-prywatnosci`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];
}
