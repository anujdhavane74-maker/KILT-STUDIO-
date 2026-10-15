import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowUpRight,
  ArrowDown,
  ArrowUp,
  ArrowRight,
  Menu,
  X,
  Plus,
  Minus,
  Code2,
  Clapperboard,
  Megaphone,
  Bot,
  Check,
  Coffee,
  Store,
  Building2,
  Sparkles,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/studio/contact-form";
import { studioConfig } from "@/lib/studio-config";
import { Wordmark } from "@/components/studio/wordmark";
import { ConceptPreview } from "@/components/studio/concept-preview";
import { SocialShowcase } from "@/components/studio/social-showcase";
import { portfolioProjects, type PortfolioProject, type ConceptId } from "@/lib/concept-projects";
import { HeroLogo } from "@/components/studio/hero-logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KILT STUDIO | Website Development & Digital Solutions in India" },
      {
        name: "description",
        content:
          "KILT STUDIO builds modern websites, high-impact video, social media systems, and practical AI solutions for businesses and brands in India. Discuss your project.",
      },
      {
        name: "keywords",
        content:
          "website development India, custom website design, web development studio, digital solutions India, responsive business websites, video editing studio, social media management, AI automation workflows",
      },
      {
        name: "robots",
        content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      {
        name: "google-site-verification",
        content: "nqUsn8kTKu7OS_Ob6gbLzIKWC_h4IxGe00z_syU-wNM",
      },
      { property: "og:site_name", content: "KILT STUDIO" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_IN" },
      { property: "og:url", content: "https://kilt-studios.vercel.app/" },
      {
        property: "og:title",
        content: "KILT STUDIO | Website Development & Digital Solutions in India",
      },
      {
        property: "og:description",
        content:
          "KILT STUDIO builds modern websites, high-impact video, social media systems, and practical AI solutions for businesses and brands in India. Discuss your project.",
      },
      { property: "og:image", content: "https://kilt-studios.vercel.app/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "KILT STUDIO — Website Development and Creative Digital Studio in India",
      },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "KILT STUDIO | Website Development & Digital Solutions in India",
      },
      {
        name: "twitter:description",
        content:
          "Modern website development, video editing, social media management, and practical AI automation for ambitious brands in India.",
      },
      { name: "twitter:image", content: "https://kilt-studios.vercel.app/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://kilt-studios.vercel.app/" }],
  }),
  component: Index,
});

const navItems = ["Work", "Services", "About", "Process", "Contact"];

const services = [
  {
    icon: Code2,
    title: "WEB DEVELOPMENT",
    intro:
      "Your business deserves more than a link in bio. We build custom, responsive websites and digital platforms that look sharp, load fast, and convert visitors into clients.",
    items: [
      "Responsive business websites",
      "Campaign & launch landing pages",
      "Portfolio & service websites",
      "Clear navigation & enquiry flows",
    ],
    cta: "Build your digital home",
  },
  {
    icon: Clapperboard,
    title: "VIDEO EDITING",
    intro:
      "Stop the scroll. Start a connection. Edits with intention, rhythm, sound design, and a story worth sticking around for.",
    items: [
      "Short-form reels & social edits",
      "Promotional brand videos",
      "Storytelling, pacing & sound",
      "Platform-ready video exports",
    ],
    cta: "Make your next great edit",
  },
  {
    icon: Megaphone,
    title: "SOCIAL MEDIA",
    intro:
      "Less last-minute posting. More brand presence. We bring a clear content plan, a strong visual point of view, and consistency to your feed.",
    items: [
      "Content strategy & planning",
      "Post & reel calendars",
      "Publishing coordination",
      "Social account management",
    ],
    cta: "Give your brand a voice",
  },
  {
    icon: Bot,
    title: "AI SOLUTIONS",
    intro:
      "Work smarter, respond faster. Practical AI assistants and automated lead workflows that handle routine tasks while you focus on growing your business.",
    items: [
      "AI-powered customer assistants",
      "Workflow & lead automations",
      "Social planning & scheduling tools",
      "Custom business AI integrations",
    ],
    cta: "Automate your workflows",
  },
];
const founders = [
  {
    key: "anuj" as const,
    name: "Anuj Dhavane",
    initial: "A",
    role: "CO-FOUNDER / WEB DEVELOPMENT",
    tagline: "The design. The code. The whole experience.",
    skills: [
      "Website development and backend implementation",
      "Building modern, responsive digital experiences",
    ],
  },
  {
    key: "krishna" as const,
    name: "Krishna Patil",
    initial: "K",
    role: "CO-FOUNDER / VIDEO EDITING & CREATIVE PRODUCTION",
    tagline: "The story. The rhythm. The perfect cut.",
    skills: ["Video editing and short-form content", "Visual storytelling and creative production"],
  },
  {
    key: "amit" as const,
    name: "Amit Suryawanshi",
    initial: "A",
    role: "CO-FOUNDER / AI SOLUTIONS & SOCIAL MEDIA",
    tagline: "The intelligence. The automation. The reach.",
    skills: [
      "AI-powered assistants and automation solutions",
      "Social media management and content planning",
      "Helping businesses use AI and social media effectively",
    ],
  },
];
const steps = [
  ["Discover", "We get to know your business, your audience and what you want to do differently."],
  ["Plan", "We align on the direction, deliverables and timeline. No guesswork. No surprises."],
  [
    "Create",
    "We design, develop and edit, with you in the loop and space for considered feedback.",
  ],
  [
    "Launch & Improve",
    "We bring it into the world, hand things over and agree on what comes next.",
  ],
];
const faqs = [
  [
    "What exactly will I get?",
    "A clearly agreed set of deliverables, tailored to your brief. That could be a responsive website, edited reels and promotional videos, custom AI assistants and workflow automations, or a content calendar with publishing and account coordination. We confirm scope, formats, handover and revision rounds before work begins.",
  ],
  [
    "How long does a project take?",
    "Timelines depend on scope, the content available and feedback rounds. A focused landing page, custom automation and an ongoing social plan have different needs. After discovery, we share a realistic schedule and agree on milestones together.",
  ],
  [
    "Are you a good fit for a small business?",
    "Absolutely. We focus on local shops, cafés, restaurants, real estate businesses and growing brands. You don’t need a giant brief or a giant team — just a business you care about and something you want to improve.",
  ],
  [
    "Can I combine different services?",
    "Yes. Anuj leads web development, Krishna leads video editing, and Amit leads AI solutions and social media management. We can shape one connected project across your website, videos, social presence and automated workflows.",
  ],
  [
    "How do we get started?",
    "Tell us about your business, choose a service and share your idea in the enquiry form below. It prepares a message you can send through a configured contact channel. We then discuss fit, scope and next steps before any commitment.",
  ],
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}
function BrowserBar({ url = "Demo concept · KILT STUDIO" }: { url?: string | undefined }) {
  return (
    <div className="browser-bar" aria-hidden="true">
      <i />
      <i />
      <i />
      <span>{url}</span>
    </div>
  );
}
function ProjectArtwork({ project }: { project: PortfolioProject }) {
  const isCustomGraphic =
    !project.liveUrl &&
    (project.id === "restaurant" || project.id === "retail" || project.id === "estate");
  return (
    <div className={`project-art ${project.id}-art`}>
      <img
        className="project-photo"
        src={project.backdropImage || project.previewImage}
        alt={`${project.title} — ${project.descriptor} by KILT STUDIO`}
        loading="lazy"
        width={1536}
        height={1024}
      />
      <span className="concept-tag">{project.badgeText || "Concept project"}</span>
      <div className="browser-frame" aria-hidden="true">
        <BrowserBar url={project.browserUrl} />
        {isCustomGraphic ? (
          <>
            {project.id === "restaurant" && (
              <div className="restaurant-design">
                <div className="mock-nav">
                  <strong>HOT TAKE®</strong>
                  <span>THE MENU &nbsp; OUR STORY &nbsp; BOOK A TABLE</span>
                </div>
                <h3>
                  GOOD FOOD.
                  <br />
                  ZERO FILTER.
                </h3>
                <p>
                  BIG FLAVOURS.
                  <br />
                  BETTER COMPANY.
                </p>
                <div className="pizza" />
              </div>
            )}
            {project.id === "retail" && (
              <div className="retail-design">
                <div className="mock-nav">
                  <strong>OFFBEAT.</strong>
                  <span>COLLECTIONS &nbsp; ABOUT &nbsp; BAG (0)</span>
                </div>
                <h3>
                  NOT FOR
                  <br />
                  EVERYONE.
                  <br />
                  JUST YOU.
                </h3>
                <p>Everyday things. Unordinary energy.</p>
                <span className="mock-cta">Find your thing ↗</span>
                <div className="tote">
                  OFF
                  <br />
                  BEAT.
                </div>
              </div>
            )}
            {project.id === "estate" && (
              <div className="estate-design">
                <div className="mock-nav">
                  <strong>FORM & SPACE</strong>
                  <span>Spaces &nbsp; Our approach &nbsp; Enquire ↗</span>
                </div>
                <h3>
                  Room for
                  <br />
                  what’s next.
                </h3>
                <p>
                  Thoughtful spaces.
                  <br />
                  New perspectives.
                </p>
                <span className="mock-cta">Explore the spaces ↗</span>
                <div className="building" />
              </div>
            )}
          </>
        ) : (
          <img
            className="browser-preview-img"
            src={project.previewImage}
            alt={`${project.title} — live website preview by KILT STUDIO`}
            loading="lazy"
            width={1440}
            height={960}
          />
        )}
      </div>
    </div>
  );
}
export const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://kilt-studios.vercel.app/#website",
      url: "https://kilt-studios.vercel.app/",
      name: "KILT STUDIO",
      alternateName: ["Kilt Studio", "Kilt Studio India", "KILT STUDIO Digital"],
      description:
        "Independent website development and creative digital studio in India specializing in custom web design, video editing, social media management, and AI workflows.",
      inLanguage: "en-IN",
      publisher: {
        "@id": "https://kilt-studios.vercel.app/#organization",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://kilt-studios.vercel.app/#organization",
      name: "KILT STUDIO",
      url: "https://kilt-studios.vercel.app/",
      logo: {
        "@type": "ImageObject",
        url: "https://kilt-studios.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
      },
      image: "https://kilt-studios.vercel.app/og-image.jpg",
      description:
        "KILT STUDIO is an independent creative digital studio in India founded by Anuj Dhavane, Krishna Patil, and Amit Suryawanshi, delivering custom website development, video production, social media management, and AI automation.",
      email: studioConfig.email,
      address: {
        "@type": "PostalAddress",
        addressCountry: "IN",
      },
      areaServed: {
        "@type": "Country",
        name: "India",
      },
      knowsAbout: [
        "Website Development",
        "Custom Web Design",
        "Responsive Web Applications",
        "Video Editing",
        "Visual Storytelling",
        "Social Media Management",
        "Content Strategy",
        "AI Workflow Automation",
        "Custom AI Assistants",
      ],
      founder: founders.map((founder) => ({
        "@type": "Person",
        name: founder.name,
        jobTitle: founder.role,
      })),
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Studio Digital Services",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Website Development",
              description:
                "Custom responsive business websites, campaign landing pages, portfolio platforms, and high-performance web applications built with clean code and modern architecture.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Video Editing & Production",
              description:
                "High-impact short-form social reels, promotional brand videos, creative pacing, sound design, and platform-ready video deliverables.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Social Media Management",
              description:
                "Strategic content planning, weekly post and reel calendars, publishing coordination, and brand voice consistency.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "AI Solutions & Automation",
              description:
                "Custom AI customer assistants, lead triage automation, social scheduling workflows, and tailored business AI integrations.",
            },
          },
        ],
      },
    },
  ],
};

function Index() {
  const [preview, setPreview] = useState<ConceptId | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState("All work");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const filtered = portfolioProjects.filter(
    (p) =>
      category === "All work" ||
      p.category === category ||
      (category === "Café & Hospitality" && p.displayCategory === "Café Website"),
  );
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div id="top" />
      <header className="site-nav">
        <div className="container nav-inner">
          <Wordmark />
          <nav className="nav-links" aria-label="Main navigation">
            {navItems.map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`}>
                {item}
              </a>
            ))}
          </nav>
          <Button variant="studio" className="nav-cta" asChild>
            <a href="#contact">
              Let’s talk <ArrowUpRight />
            </a>
          </Button>
          <Button
            variant="iconControl"
            size="icon"
            className="mobile-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
        {menuOpen && (
          <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">
            <Wordmark onClick={() => setMenuOpen(false)} />
            {navItems.map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)}>
                {item} <ArrowUpRight size={13} />
              </a>
            ))}
          </nav>
        )}
      </header>
      <main id="main">
        <section className="hero" aria-labelledby="hero-heading">
          <div className="container hero-container">
            <div className="hero-main">
              <div className="hero-content">
                <Eyebrow>KILT STUDIO · INDEPENDENT DIGITAL STUDIO · INDIA</Eyebrow>
                <h1 id="hero-heading">
                  <span>WE MAKE BRANDS</span>
                  <span className="lime">IMPOSSIBLE</span>
                  <span>
                    TO IGNORE<b className="lime">.</b>
                  </span>
                </h1>
                <p className="hero-copy">
                  Custom website development. High-impact video editing. Practical AI automation.
                  Socials with a pulse.
                  <br />
                  We’re KILT STUDIO — an independent creative digital studio in India partnering
                  with local brands, cafés, retail, and real estate teams to build digital
                  experiences that stand out.
                </p>
                <div className="hero-actions">
                  <Button variant="studio" asChild>
                    <a href="#work">
                      Explore our work <ArrowUpRight />
                    </a>
                  </Button>
                  <Button variant="studioOutline" asChild>
                    <a href="#contact">
                      Start a project <ArrowUpRight />
                    </a>
                  </Button>
                </div>
              </div>
              <div className="hero-visual">
                <HeroLogo />
              </div>
            </div>
            <div className="hero-bottom">
              <span>
                <i className="status-dot" /> Three minds. One creative force.
              </span>
              <span>BASED IN INDIA. BUILT FOR WHAT’S NEXT.</span>
              <a href="#work">
                SCROLL TO EXPLORE <ArrowDown size={13} />
              </a>
            </div>
          </div>
          <div className="sector-strip" aria-label="Industries we work with">
            <div className="container sector-inner">
              <span>LOCAL BRANDS</span>
              <i>✳</i>
              <span>HOSPITALITY</span>
              <i>✳</i>
              <span>RETAIL</span>
              <i>✳</i>
              <span>REAL ESTATE</span>
            </div>
          </div>
        </section>
        <section id="work" className="section">
          <div className="container">
            <Eyebrow>SELECTED CONCEPTS / 01</Eyebrow>
            <div className="section-heading">
              <h2>
                LESS ORDINARY.
                <br />
                <span className="lime">MORE KILT.</span>
              </h2>
              <p>
                A glimpse of what’s possible. Original website development, brand concepts, and
                digital experiences created for the businesses that shape our communities.
              </p>
            </div>
            <div className="filters" role="group" aria-label="Filter concept projects">
              {["All work", "Café & Hospitality", "Retail & E-commerce", "Real Estate"].map(
                (filter) => (
                  <Button
                    variant="filter"
                    key={filter}
                    aria-pressed={category === filter}
                    onClick={() => setCategory(filter)}
                  >
                    {filter}
                    {filter === "All work" && (
                      <span>{portfolioProjects.length.toString().padStart(2, "0")}</span>
                    )}
                  </Button>
                ),
              )}
            </div>
            <div className="project-grid" aria-live="polite">
              {filtered.map((project) => {
                const isLive = Boolean(project.liveUrl);
                const ctaLabel =
                  project.ctaLabel || (isLive ? "View Live Website" : "Explore Concept");
                return (
                  <article className="project-card" key={project.id}>
                    {isLive ? (
                      <Button variant="ghost" className="project-open" asChild>
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${ctaLabel} for ${project.title} (opens in a new tab)`}
                        >
                          <ProjectArtwork project={project} />
                          <span className="project-open-label">
                            {ctaLabel.toUpperCase()} <ArrowUpRight size={17} />
                          </span>
                        </a>
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        className="project-open"
                        onClick={() => setPreview(project.id as ConceptId)}
                        aria-label={`Open ${project.title}`}
                      >
                        <ProjectArtwork project={project} />
                        <span className="project-open-label">
                          EXPLORE CONCEPT <ArrowUpRight size={17} />
                        </span>
                      </Button>
                    )}
                    <div className="project-meta">
                      <div>
                        <h3>{project.title}</h3>
                        <p>{project.descriptor}</p>
                      </div>
                      {isLive ? (
                        <Button variant="ghost" className="project-view" asChild>
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${ctaLabel} for ${project.title} (opens in a new tab)`}
                          >
                            {ctaLabel} <ArrowUpRight />
                          </a>
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          className="project-view"
                          aria-label={`View ${project.title}`}
                          onClick={() => setPreview(project.id as ConceptId)}
                        >
                          {project.displayCategory} <ArrowUpRight />
                        </Button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
            <p className="portfolio-note">
              <Info size={13} /> All work above is self-initiated demo work. Brand names within
              mockups are fictional, not clients.
            </p>
          </div>
        </section>
        <section id="services" className="section services-section">
          <div className="container">
            <Eyebrow>WHAT WE BRING / 02</Eyebrow>
            <div className="section-heading">
              <h2>
                GOOD DESIGN.
                <br />
                <span className="lime">REAL IMPACT.</span>
              </h2>
              <p>
                Four core digital services — web development, video editing, social media
                management, and practical AI automation — built to work together seamlessly.
              </p>
            </div>
            <div className="service-grid">
              {services.map((service, i) => (
                <article className="service-card" key={service.title}>
                  <div className="service-top">
                    <service.icon strokeWidth={1.5} />
                    <span>0{i + 1}</span>
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.intro}</p>
                  <ul>
                    {service.items.map((item) => (
                      <li key={item}>
                        <Check />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <a href="#contact">
                    {service.cta} <ArrowUpRight size={17} />
                  </a>
                </article>
              ))}
            </div>
            <SocialShowcase />
          </div>
        </section>
        <section id="about" className="section">
          <div className="container about-layout">
            <div className="about-copy">
              <div className="about-heading-block">
                <Eyebrow>THE PEOPLE BEHIND KILT / 03</Eyebrow>
                <h2>
                  THREE MINDS.
                  <br />
                  NO <span className="lime">TEMPLATES.</span>
                </h2>
              </div>
              <div className="about-copy-text">
                <p>
                  We’re Anuj, Krishna and Amit. Three creators in India, one shared belief: a local
                  business shouldn’t have to look like everyone else.
                </p>
                <p>
                  Anuj builds the digital experiences. Krishna brings stories to life through video.
                  Amit crafts intelligent AI assistants, automated workflows and strategic social
                  growth. Together, we connect the web, the feed and everything in between.
                </p>
                <p>
                  No layers of account managers. No disappearing acts. Just you, us and a genuine
                  obsession with making it good.
                </p>
                <Button variant="studioOutline" asChild>
                  <a href="#contact">
                    Meet your creative partners <ArrowUpRight />
                  </a>
                </Button>
              </div>
            </div>
            <div className="founder-grid">
              {founders.map((founder) => (
                <article className="founder-card" key={founder.key}>
                  <div className="founder-portrait">
                    {studioConfig.portraits[founder.key] ? (
                      <img
                        src={studioConfig.portraits[founder.key]}
                        alt={`${founder.name}, co-founder of KILT STUDIO`}
                        loading="lazy"
                      />
                    ) : (
                      <>
                        <span aria-hidden="true">{founder.initial}✳</span>
                        <small>PORTRAIT COMING SOON</small>
                      </>
                    )}
                  </div>
                  <div className="founder-content">
                    <h3>{founder.name}</h3>
                    <span className="founder-role">{founder.role}</span>
                    <p className="founder-text">{founder.tagline}</p>
                    <ul className="founder-skills">
                      {founder.skills.map((s) => (
                        <li key={s}>
                          <Check size={11} strokeWidth={2.5} />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section id="process" className="section">
          <div className="container">
            <Eyebrow>HOW WE MAKE IT HAPPEN / 04</Eyebrow>
            <div className="section-heading">
              <h2>
                BIG IDEAS.
                <br />
                <span className="lime">CLEAR PROCESS.</span>
              </h2>
              <p>
                Creative doesn’t have to mean complicated.
                <br />
                Here’s how we deliver custom websites, video edits, and automation workflows from
                initial discovery to launch.
              </p>
            </div>
            <div className="process-grid">
              {steps.map(([title, text], i) => (
                <article className="process-step" key={title}>
                  <span className="step-num">0{i + 1}</span>
                  {i < 3 && <ArrowRight size={18} />}
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="fit-section" aria-labelledby="fit-heading">
          <div className="container">
            <h2 id="fit-heading">
              SMALL BUSINESS.
              <br />
              BIG BRAND ENERGY.
            </h2>
            <div className="fit-list">
              <span>
                <Coffee strokeWidth={1.5} /> Cafés & restaurants
              </span>
              <span>
                <Store strokeWidth={1.5} /> Local shops & retailers
              </span>
              <span>
                <Building2 strokeWidth={1.5} /> Real estate teams
              </span>
              <span>
                <Sparkles strokeWidth={1.5} /> Brands ready to grow
              </span>
            </div>
          </div>
        </section>
        <section id="faq" className="section">
          <div className="container faq-layout">
            <div>
              <Eyebrow>A FEW THINGS, ANSWERED / 05</Eyebrow>
              <h2>
                GOOD
                <br />
                <span className="lime">QUESTIONS.</span>
              </h2>
              <p>
                Still curious about something?
                <br />
                <a href="#contact">
                  Let’s talk it through <ArrowUpRight size={13} />
                </a>
              </p>
            </div>
            <div className="faq-list">
              {faqs.map(([question, answer], i) => (
                <div className="faq-item" key={question}>
                  <h3>
                    <Button
                      variant="ghost"
                      className="faq-question"
                      aria-expanded={openFaq === i}
                      aria-controls={`faq-panel-${i}`}
                      id={`faq-trigger-${i}`}
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      {question}
                      {openFaq === i ? <Minus /> : <Plus />}
                    </Button>
                  </h3>
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${i}`}
                    hidden={openFaq !== i}
                  >
                    <p className="faq-answer">{answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="contact" className="section contact-section">
          <div className="container contact-layout">
            <div className="contact-copy">
              <Eyebrow>YOUR NEXT CHAPTER / 06</Eyebrow>
              <h2>
                GOT A VISION?
                <br />
                <span className="lime">LET’S KILT IT.</span>
              </h2>
              <p>
                Whether you need a custom website, high-impact video edits, an AI assistant, or a
                complete social revamp — tell us what you’re planning. We’ll discuss scope,
                timeline, and next steps.
              </p>
              <div className="contact-little">
                <span>✳</span>
                <div>
                  <p>No big pitch needed. Just a conversation.</p>
                  <small>Independent studio · India</small>
                </div>
              </div>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
      <ConceptPreview id={preview} onClose={() => setPreview(null)} />
      <footer className="site-footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <Wordmark />
              <p>Design. Develop. Disrupt.</p>
            </div>
            <nav className="footer-links" aria-label="Footer navigation">
              {navItems.map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`}>
                  {item}
                </a>
              ))}
            </nav>
            <div className="social-links">
              {studioConfig.socials.instagram && (
                <a href={studioConfig.socials.instagram} target="_blank" rel="noreferrer">
                  Instagram ↗
                </a>
              )}
              {studioConfig.socials.linkedin && (
                <a href={studioConfig.socials.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn ↗
                </a>
              )}
              {!studioConfig.socials.instagram && !studioConfig.socials.linkedin && (
                <span>SOCIAL LINKS COMING SOON</span>
              )}
            </div>
          </div>
          <div className="footer-statement">
            DON’T BLEND IN. <span className="lime">KILL IT.</span>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} KILT STUDIO. All rights reserved.</span>
            <a href="#top">
              BACK TO TOP <ArrowUp size={12} />
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
