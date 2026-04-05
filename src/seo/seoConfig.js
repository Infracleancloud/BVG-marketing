/**
 * Cloud Hygiene Coach - SEO Configuration
 * Centralized SEO metadata for all pages
 * 
 * Guidelines:
 * - Titles: 50-60 characters (keyword-front-loaded)
 * - Descriptions: 150-160 characters (include CTA)
 * - Each page MUST have unique title and description
 */

export const SITE_CONFIG = {
  siteName: 'Cloud Hygiene Coach',
  siteUrl: 'https://cloudhygienecoach.com',
  defaultImage: '/og-default.png',
  twitterHandle: '@cloudhygiene',
  locale: 'en_US',
};

// Organization structured data (JSON-LD)
export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Cloud Hygiene Coach',
  url: SITE_CONFIG.siteUrl,
  logo: `${SITE_CONFIG.siteUrl}/logo.png`,
  description: 'Enterprise cloud governance platform for compliance, security, and operational excellence.',
  foundingDate: '2024',
  sameAs: [
    'https://twitter.com/cloudhygiene',
    'https://linkedin.com/company/cloudhygienecoach',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'sales',
    email: 'sales@cloudhygienecoach.com',
  },
};

// Software Application structured data
export const SOFTWARE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Cloud Hygiene Coach',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free trial available',
  },
};

/**
 * SEO metadata for each page
 * Keys match route paths
 */
export const SEO_CONFIG = {
  // Homepage
  '/': {
    title: 'Cloud Hygiene Coach | Enterprise Cloud Governance Platform',
    description: 'See everything. Fix anything. Audit-ready, always. Enterprise cloud governance that connects policy to execution. Start free today.',
    keywords: 'cloud governance, cloud compliance, cloud security, audit readiness, AWS governance, cloud hygiene',
    schema: [ORGANIZATION_SCHEMA, SOFTWARE_SCHEMA],
  },

  // Platform Pages
  '/platform': {
    title: 'Platform Overview | Cloud Hygiene Coach',
    description: 'Unified cloud governance platform. Real-time visibility, automated compliance, and remediation workflows for enterprise teams.',
    keywords: 'cloud governance platform, cloud management, compliance automation, security posture',
  },
  '/platform/how-it-works': {
    title: 'How It Works | Cloud Hygiene Coach Platform',
    description: 'Discover, prioritize, remediate, report. See how Cloud Hygiene Coach transforms cloud governance in 4 simple steps.',
    keywords: 'cloud governance workflow, how cloud compliance works, governance automation',
  },
  '/platform/capabilities': {
    title: 'Platform Capabilities | Cloud Hygiene Coach',
    description: 'Dashboard, findings, tasks, resources, reports, and standards. Complete feature set for enterprise cloud governance.',
    keywords: 'cloud governance features, compliance dashboard, remediation tracking, audit reports',
  },
  '/platform/integrations': {
    title: 'Cloud Integrations | AWS, Azure, GCP | Cloud Hygiene Coach',
    description: 'Connect to AWS today. Azure and GCP coming soon. One platform for multi-cloud governance and compliance.',
    keywords: 'AWS integration, cloud integrations, multi-cloud governance, Azure compliance, GCP governance',
  },

  // Outcomes Pages
  '/outcomes/governance': {
    title: 'Cloud Governance Outcomes | Cloud Hygiene Coach',
    description: 'Achieve 98% asset ownership coverage and reduce governance overhead by 40%. See real governance outcomes.',
    keywords: 'cloud governance outcomes, governance ROI, asset ownership, policy enforcement',
  },
  '/outcomes/audit-readiness': {
    title: 'Audit Readiness | SOC 2, ISO 27001 | Cloud Hygiene Coach',
    description: 'Cut audit prep time by 40%. Continuous compliance evidence for SOC 2, ISO 27001, PCI DSS, and HIPAA.',
    keywords: 'audit readiness, SOC 2 compliance, ISO 27001, continuous compliance, audit automation',
  },
  '/outcomes/cost': {
    title: 'Cloud Cost Optimization | Cloud Hygiene Coach',
    description: 'Identify waste, enforce tagging, track ownership. Reduce cloud spend through governance-driven cost control.',
    keywords: 'cloud cost optimization, cloud waste, cost governance, tagging compliance',
  },
  '/outcomes/risk': {
    title: 'Cloud Risk Reduction | Cloud Hygiene Coach',
    description: 'Reduce high-severity violations by 60% in 90 days. Quantified risk metrics and prioritized remediation.',
    keywords: 'cloud risk reduction, security risk, compliance risk, risk quantification',
  },

  // Roles Pages
  '/roles/cio': {
    title: 'Cloud Governance for CIOs | Cloud Hygiene Coach',
    description: 'Executive visibility into cloud risk, compliance, and cost. Board-ready reporting and governance metrics for CIOs.',
    keywords: 'CIO cloud governance, executive dashboard, cloud reporting, IT governance',
  },
  '/roles/ciso': {
    title: 'Cloud Security for CISOs | Cloud Hygiene Coach',
    description: 'Security posture management, compliance automation, and risk quantification. Purpose-built for security leaders.',
    keywords: 'CISO cloud security, security posture, compliance automation, security governance',
  },
  '/roles/cto': {
    title: 'Cloud Governance for CTOs | Cloud Hygiene Coach',
    description: 'Technical governance without slowing down engineering. Automated compliance and remediation workflows.',
    keywords: 'CTO cloud governance, technical compliance, engineering governance, DevOps compliance',
  },
  '/roles/vp-engineering': {
    title: 'Cloud Governance for VP Engineering | Cloud Hygiene Coach',
    description: 'Operational governance that engineering teams actually use. Task management, ownership tracking, and verification.',
    keywords: 'VP engineering governance, engineering compliance, operational governance',
  },

  // Proof Pages
  '/proof/case-studies': {
    title: 'Customer Case Studies | Cloud Hygiene Coach',
    description: 'See how enterprise teams achieved 40% faster audits and 60% fewer violations with Cloud Hygiene Coach.',
    keywords: 'cloud governance case studies, customer success, compliance case studies',
  },
  '/proof/benchmark': {
    title: 'Cloud Governance Benchmarks | Cloud Hygiene Coach',
    description: 'Industry benchmarks for cloud hygiene, compliance readiness, and remediation velocity. See where you stand.',
    keywords: 'cloud governance benchmarks, compliance benchmarks, industry standards',
  },
  '/proof/roi': {
    title: 'ROI Calculator | Cloud Hygiene Coach',
    description: 'Calculate your cloud governance ROI. Quantify audit savings, risk reduction, and operational efficiency gains.',
    keywords: 'cloud governance ROI, compliance ROI, cost savings calculator',
  },

  // Trust Pages
  '/trust': {
    title: 'Trust Center | Security & Compliance | Cloud Hygiene Coach',
    description: 'SOC 2 Type II certified. ISO 27001 compliant. 99.9% uptime SLA. Enterprise-grade security you can trust.',
    keywords: 'trust center, security certifications, SOC 2, ISO 27001, enterprise security',
  },
  '/trust/security': {
    title: 'Security Practices | Cloud Hygiene Coach',
    description: 'Enterprise-grade security. Encryption at rest and in transit, role-based access, and continuous monitoring.',
    keywords: 'cloud security, data encryption, access control, security monitoring',
  },
  '/trust/compliance': {
    title: 'Compliance Certifications | Cloud Hygiene Coach',
    description: 'SOC 2 Type II, ISO 27001, GDPR, and HIPAA ready. Full compliance documentation available on request.',
    keywords: 'compliance certifications, SOC 2, ISO 27001, GDPR compliance, HIPAA',
  },

  // Company Pages
  '/company': {
    title: 'About Us | Cloud Hygiene Coach',
    description: 'Built by operators, for operators. We believe every cloud should be crystal clear. Learn our story.',
    keywords: 'about cloud hygiene coach, company, cloud governance company',
  },
  '/company/leadership': {
    title: 'Leadership Team | Cloud Hygiene Coach',
    description: 'Meet the team building the future of cloud governance. Leaders from AWS, Google, and enterprise security.',
    keywords: 'leadership team, executives, founders, cloud governance experts',
  },
  '/company/careers': {
    title: 'Careers | Join Cloud Hygiene Coach',
    description: 'Join us in making every cloud crystal clear. Remote-first, competitive equity, and meaningful work.',
    keywords: 'careers, jobs, cloud governance jobs, startup careers, remote jobs',
  },
  '/company/contact': {
    title: 'Contact Us | Cloud Hygiene Coach',
    description: 'Get in touch with our team. Sales inquiries, support, partnerships, and press.',
    keywords: 'contact, sales, support, partnerships',
  },

  // Pricing
  '/pricing': {
    title: 'Pricing | Cloud Hygiene Coach',
    description: 'Simple, transparent pricing. Start free, scale as you grow. Free, Pro, and Enterprise plans for cloud governance.',
    keywords: 'cloud governance pricing, compliance software pricing, cloud security cost',
  },

  // Blog
  '/blog': {
    title: 'Blog | Cloud Hygiene Coach',
    description: 'Insights on cloud governance, compliance, and security from industry experts. Best practices and guides.',
    keywords: 'cloud governance blog, compliance insights, cloud security articles, AWS best practices',
  },

  // Utility Pages
  '/request-briefing': {
    title: 'Request Briefing | Cloud Hygiene Coach',
    description: 'Request a personalized briefing on how Cloud Hygiene Coach can transform your cloud governance.',
    keywords: 'request briefing, demo, cloud governance consultation',
  },
  '/campaigns': {
    title: 'Campaigns | Cloud Hygiene Coach',
    description: 'Explore our targeted solutions for specific cloud governance challenges.',
    keywords: 'cloud governance campaigns, solutions',
    noindex: true,
  },
  '/login': {
    title: 'Login | Cloud Hygiene Coach',
    description: 'Sign in to your Cloud Hygiene Coach account.',
    noindex: true,
  },
  '/signup': {
    title: 'Sign Up | Cloud Hygiene Coach',
    description: 'Create your free Cloud Hygiene Coach account.',
    noindex: true,
  },
  '/status': {
    title: 'System Status | Cloud Hygiene Coach',
    description: 'Current operational status of Cloud Hygiene Coach services.',
    noindex: true,
  },

  // Legal Pages
  '/privacy': {
    title: 'Privacy Policy | Cloud Hygiene Coach',
    description: 'How Cloud Hygiene Coach collects, uses, and protects your personal information.',
    keywords: 'privacy policy, data protection, GDPR',
  },
  '/terms': {
    title: 'Terms of Service | Cloud Hygiene Coach',
    description: 'Terms and conditions for using Cloud Hygiene Coach services.',
    keywords: 'terms of service, terms and conditions, user agreement',
  },
  '/security': {
    title: 'Security | Cloud Hygiene Coach',
    description: 'Security practices and measures at Cloud Hygiene Coach. Enterprise-grade protection.',
    keywords: 'security practices, data security, enterprise security',
  },
};

/**
 * Get SEO config for a given path
 * Falls back to defaults if path not found
 */
export function getSeoConfig(pathname) {
  // Exact match
  if (SEO_CONFIG[pathname]) {
    return SEO_CONFIG[pathname];
  }

  // Check for dynamic routes (campaigns)
  if (pathname.startsWith('/campaigns/')) {
    return {
      title: 'Campaign | Cloud Hygiene Coach',
      description: 'Explore this cloud governance solution from Cloud Hygiene Coach.',
      noindex: true,
    };
  }

  // Default fallback
  return {
    title: 'Cloud Hygiene Coach | Enterprise Cloud Governance',
    description: 'Enterprise cloud governance platform. See everything. Fix anything. Audit-ready, always.',
  };
}

/**
 * Validate SEO config - check for duplicates and issues
 * Run this during development
 */
export function validateSeoConfig() {
  const titles = new Map();
  const descriptions = new Map();
  const issues = [];

  Object.entries(SEO_CONFIG).forEach(([path, config]) => {
    // Check title length
    if (config.title && config.title.length > 60) {
      issues.push(`Title too long (${config.title.length} chars) on ${path}`);
    }
    if (config.title && config.title.length < 30) {
      issues.push(`Title too short (${config.title.length} chars) on ${path}`);
    }

    // Check description length
    if (config.description && config.description.length > 160) {
      issues.push(`Description too long (${config.description.length} chars) on ${path}`);
    }
    if (config.description && config.description.length < 100) {
      issues.push(`Description too short (${config.description.length} chars) on ${path}`);
    }

    // Check for duplicate titles
    if (config.title) {
      if (titles.has(config.title)) {
        issues.push(`Duplicate title "${config.title}" on ${path} and ${titles.get(config.title)}`);
      }
      titles.set(config.title, path);
    }

    // Check for duplicate descriptions
    if (config.description) {
      if (descriptions.has(config.description)) {
        issues.push(`Duplicate description on ${path} and ${descriptions.get(config.description)}`);
      }
      descriptions.set(config.description, path);
    }
  });

  return issues;
}
