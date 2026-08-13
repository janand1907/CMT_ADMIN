import { siteConfig } from "@/config/site";
import { seoConfig } from "@/data/seo.config";

export default function sitemap() {
  const lastModified = new Date();

  return Object.keys(seoConfig).map((pathname) => ({
    url: `${siteConfig.domain}${pathname === "/" ? "" : pathname}`,
    lastModified,
  }));
}
