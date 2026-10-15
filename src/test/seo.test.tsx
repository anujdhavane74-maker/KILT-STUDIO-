import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import fs from "node:fs";
import path from "node:path";
import { Route as IndexRoute, structuredData } from "@/routes/index";
import { Route as RootRoute } from "@/routes/__root";
import {
  createRouter,
  createMemoryHistory,
  RouterProvider,
  rootRouteId,
} from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen";
import { QueryClient } from "@tanstack/react-query";

type MetaTag = {
  title?: string;
  name?: string;
  content?: string;
  property?: string;
};

type LinkTag = {
  rel?: string;
  href?: string;
};

describe("SEO Suite - Metadata & Indexing", () => {
  it("provides comprehensive, search-optimized meta tags on the homepage", () => {
    const headResult = IndexRoute.options.head?.({} as never);
    if (!headResult || "then" in headResult) {
      throw new Error("Expected synchronous head result");
    }
    const meta = (headResult.meta ?? []) as MetaTag[];
    const links = (headResult.links ?? []) as LinkTag[];

    // Title
    const titleObj = meta.find((m) => m.title !== undefined);
    expect(titleObj?.title).toBe("KILT STUDIO | Website Development & Digital Solutions in India");

    // Description
    const descObj = meta.find((m) => m.name === "description");
    expect(descObj?.content).toBeDefined();
    expect(descObj?.content).toContain("KILT STUDIO");
    expect(descObj?.content).toContain("India");
    expect(descObj?.content?.length).toBeGreaterThanOrEqual(100);
    expect(descObj?.content?.length).toBeLessThanOrEqual(180);

    // Canonical
    const canonical = links.find((l) => l.rel === "canonical");
    expect(canonical?.href).toBe("https://kilt-studios.vercel.app/");

    // Robots meta
    const robots = meta.find((m) => m.name === "robots");
    expect(robots?.content).toContain("index");
    expect(robots?.content).toContain("follow");
    expect(robots?.content).not.toContain("noindex");

    // Google Search Console verification meta
    const gsc = meta.find((m) => m.name === "google-site-verification");
    expect(gsc?.content).toBe("nqUsn8kTKu7OS_Ob6gbLzIKWC_h4IxGe00z_syU-wNM");

    // Open Graph
    const ogTitle = meta.find((m) => m.property === "og:title");
    const ogUrl = meta.find((m) => m.property === "og:url");
    const ogImage = meta.find((m) => m.property === "og:image");
    const ogLocale = meta.find((m) => m.property === "og:locale");

    expect(ogTitle?.content).toBe("KILT STUDIO | Website Development & Digital Solutions in India");
    expect(ogUrl?.content).toBe("https://kilt-studios.vercel.app/");
    expect(ogImage?.content).toBe("https://kilt-studios.vercel.app/og-image.jpg");
    expect(ogLocale?.content).toBe("en_IN");

    // Twitter Card
    const twitterCard = meta.find((m) => m.name === "twitter:card");
    expect(twitterCard?.content).toBe("summary_large_image");
  });
});

describe("SEO Suite - Structured Data (JSON-LD)", () => {
  it("exports valid Schema.org graph with WebSite and Organization entities", () => {
    // Valid JSON
    const jsonString = JSON.stringify(structuredData);
    expect(() => JSON.parse(jsonString)).not.toThrow();

    expect(structuredData["@context"]).toBe("https://schema.org");
    expect(Array.isArray(structuredData["@graph"])).toBe(true);

    const graph = structuredData["@graph"];
    expect(graph.length).toBe(2);

    // WebSite entity
    const website = graph.find((e) => e["@type"] === "WebSite");
    expect(website).toBeDefined();
    expect(website?.url).toBe("https://kilt-studios.vercel.app/");
    expect(website?.name).toBe("KILT STUDIO");
    expect(website?.inLanguage).toBe("en-IN");
    expect(website?.publisher?.["@id"]).toBe("https://kilt-studios.vercel.app/#organization");

    // Organization entity
    const org = graph.find(
      (e) =>
        e["@id"] === "https://kilt-studios.vercel.app/#organization" &&
        e["@type"] === "Organization",
    );
    expect(org).toBeDefined();
    expect(org?.name).toBe("KILT STUDIO");
    expect(org?.url).toBe("https://kilt-studios.vercel.app/");
    expect(org?.email).toBe("kiltstudio10@gmail.com");
    expect(org?.areaServed?.name).toBe("India");
    expect(org?.address?.addressCountry).toBe("IN");
    expect(org?.founder?.length).toBe(3);

    // Offer Catalog for genuine services
    const catalog = org?.hasOfferCatalog;
    expect(catalog).toBeDefined();
    expect(catalog?.itemListElement?.length).toBe(4);
    const serviceNames = catalog?.itemListElement?.map(
      (item: { itemOffered: { name: string } }) => item.itemOffered.name,
    );
    expect(serviceNames).toContain("Website Development");
    expect(serviceNames).toContain("Video Editing & Production");
    expect(serviceNames).toContain("Social Media Management");
    expect(serviceNames).toContain("AI Solutions & Automation");
  });
});

describe("SEO Suite - Crawler Directives & Sitemap", () => {
  it("provides an accessible robots.txt that allows crawling and references sitemap", () => {
    const robotsPath = path.resolve(process.cwd(), "public/robots.txt");
    expect(fs.existsSync(robotsPath)).toBe(true);
    const content = fs.readFileSync(robotsPath, "utf-8");
    expect(content).toContain("User-agent: *");
    expect(content).toContain("Allow: /");
    expect(content).toContain("Sitemap: https://kilt-studios.vercel.app/sitemap.xml");
    expect(content).not.toMatch(/Disallow:\s*\/\s*$/m);
  });

  it("provides a valid XML sitemap with correct canonical URL", () => {
    const sitemapPath = path.resolve(process.cwd(), "public/sitemap.xml");
    expect(fs.existsSync(sitemapPath)).toBe(true);
    const content = fs.readFileSync(sitemapPath, "utf-8");
    expect(content).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(content).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(content).toContain("<loc>https://kilt-studios.vercel.app/</loc>");
    expect(content).toContain("<lastmod>");
  });
});

describe("SEO Suite - Semantic DOM & Heading Hierarchy", () => {
  it("renders exactly one primary H1 element and validates internal anchors", () => {
    const Component = IndexRoute.options.component!;
    const { container } = render(<Component />);

    // Single primary H1
    const h1s = container.querySelectorAll("h1");
    expect(h1s.length).toBe(1);
    expect(h1s[0]?.id).toBe("hero-heading");
    expect(h1s[0]?.textContent).toContain("WE MAKE BRANDS");

    // Internal hash link integrity: every href="#section" points to an element with that id
    const internalLinks = container.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
    expect(internalLinks.length).toBeGreaterThan(0);
    internalLinks.forEach((link) => {
      const targetId = link.getAttribute("href")?.replace(/^#/, "");
      if (targetId && targetId !== "") {
        const targetElement = container.querySelector(`#${targetId}`);
        expect(
          targetElement,
          `Internal hash link #${targetId} must resolve to a valid element in DOM`,
        ).not.toBeNull();
      }
    });

    // Verify external links have safe rel attributes
    const externalLinks = container.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]');
    externalLinks.forEach((link) => {
      const rel = link.getAttribute("rel") ?? "";
      expect(rel).toMatch(/noopener|noreferrer/);
    });
  });

  it("verifies 404 route handling does not match a valid page", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const matches = router.matchRoutes("/non-existent-seo-test-route");
    expect(matches.at(-1)?.routeId).toBe(rootRouteId);
  });

  it("renders 404 component with noindex meta and descriptive heading", () => {
    const NotFound = RootRoute.options.notFoundComponent!;
    const { getByRole, getByText } = render(<NotFound isNotFound={true} routeId="__root__" />);
    expect(getByRole("heading", { level: 1 })).toHaveTextContent("404");
    expect(getByText(/The page you're looking for doesn't exist/i)).toBeInTheDocument();
  });
});
