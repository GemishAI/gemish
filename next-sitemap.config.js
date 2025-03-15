import { siteConfig } from "./src/config/site";

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: siteConfig.url,
  generateRobotsTxt: true, // (optional)
};
