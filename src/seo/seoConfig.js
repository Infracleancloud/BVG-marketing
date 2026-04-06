/**
 * Infra Clean Cloud - SEO Configuration
 * Centralized SEO metadata for all pages
 * 
 * Guidelines:
 * - Titles: 50-60 characters (keyword-front-loaded)
 * - Descriptions: 150-160 characters (include CTA)
 * - Each page MUST have unique title and description
 */

export const SITE_CONFIG = {
  siteName: 'Infra Clean Cloud',
  siteUrl: 'https://infraclean.cloud',
  defaultImage: '/og-default.png',
  twitterHandle: '',
  locale: 'en_US',
};

// Organization structured data (JSON-LD)
export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Infra Clean Cloud',
  url: SITE_CONFIG.siteUrl,
  logo: `${SITE_CONFIG.siteUrl}/logo.png`,
  description: 'Enterprise cloud governance platform for compliance, security, and operational excellence.',
  foundingDate: '2024',
  sameAs: [
    'https://linkedin.com/company/infracleancloud',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'sales',
    email: 'sales@infraclean.cloud',
  },
};

// Software Application structured data
export const SOFTWARE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Infra Clean Cloud',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free tier available',
  },
};

/**
 * SEO metadata for each page
 * Keys match route paths
 */
export const SEO_CONFIG = {
  // Homepage
  '/': {
    title: 'Infra Clean Cloud | Enterprise Cloud Governance Platform',
    description: 'See everything. Fix anything. Audit-ready, always. Enterprise cloud governance that connects policy to execution. Request a briefing.',
    keywords: 'cloud governance, cloud compliance, cloud security, audit readiness, AWS governance, cloud hygiene',
    schema: [ORGANIZATION_SCHEMA, SOFTWARE_SCHEMA],
  },

  // Platform Pages
  '/platform': {
    title: 'Platform Overview | Infra Clean Cloud',
    description: 'Unified cloud governance platform. Real-time visibility, automated compliance, and remediation workflows for enterprise teams.',
    keywords: 'cloud governance platform, cloud management, compliance automation, security posture',
  },
  '/platform/how-it-works': {
    title: 'How It Works | Infra Clean Cloud Platform',
    description: 'Discover, prioritize, remediate, report. See how Infra Clean Cloud transforms cloud governance in 4 simple steps.',
    keywords: 'cloud governance workflow, how cloud compliance works, governance automation',
  },
  '/platform/capabilities': {
    title: 'Platform Capabilities | Infra Clean Cloud',
    description: 'Dashboard, findings, tasks, resources, reports, and standards. Complete feature set for enterprise cloud governance.',
    keywords: 'cloud governance features, compliance dashboard, remediation tracking, audit reports',
  },
  '/platform/integrations': {
    title: 'Cloud Integrations | AWS, Azure, GCP | Infra Clean Cloud',
    description: 'Connect to AWS today. Azure and GCP coming soon. One platform for multi-cloud governance and compliance.',
    keywords: 'AWS integration, cloud integrations, multi-cloud governance, Azure compliance, GCP governance',
  },

  // Outcomes Pages
  '/outcomes/governance': {
    title: 'Cloud Governance Outcomes | Infra Clean Cloud',
    description: 'Target up to 98% asset ownership coverage and reduce governance overhead by up to 40%. See governance outcomes.',
    keywords: 'cloud governance outcomes, governance ROI, asset ownership, policy enforcement',
  },
  '/outcomes/audit-readiness': {
    title: 'Audit Readiness | SOC 2, ISO 27001 | Infra Clean Cloud',
    description: 'Cut audit prep time by up to 40%. Continuous compliance evidence for SOC 2, ISO 27001, PCI DSS, and HIPAA.',
    keywords: 'audit readiness, SOC 2 compliance, ISO 27001, continuous compliance, audit automation',
  },
  '/outcomes/cost': {
    title: 'Cloud Cost Optimization | Infra Clean Cloud',
    description: 'Identify waste, enforce tagging, track ownership. Reduce cloud spend through governance-driven cost control.',
    keywords: 'cloud cost optimization, cloud waste, cost governance, tagging compliance',
  },
  '/outcomes/risk': {
    title: 'Cloud Risk Reduction | Infra Clean Cloud',
    description: 'Reduce high-severity violations by up to 60% in 90 days. Quantified risk metrics and prioritized remediation.',
    keywords: 'cloud risk reduction, security risk, compliance risk, risk quantification',
  },

  // Roles Pages
  '/roles/cio': {
    title: 'Cloud Governance for CIOs | Infra Clean Cloud',
    description: 'Executive visibility into cloud risk, compliance, and cost. Board-ready reporting and governance metrics for CIOs.',
    keywords: 'CIO cloud governance, executive dashboard, cloud reporting, IT governance',
  },
  '/roles/ciso': {
    title: 'Cloud Security for CISOs | Infra Clean Cloud',
    description: 'Security posture management, compliance automation, and risk quantification. Purpose-built for security leaders.',
    keywords: 'CISO cloud security, security posture, compliance automation, security governance',
  },
  '/roles/cto': {
    title: 'Cloud Governance for CTOs | Infra Clean Cloud',
    description: 'Technical governance without slowing down engineering. Automated compliance and remediation workflows.',
    keywords: 'CTO cloud governance, technical compliance, engineering governance, DevOps compliance',
  },
  '/roles/vp-engineering': {
    title: 'Cloud Governance for VP Engineering | Infra Clean Cloud',
    description: 'Operational governance that engineering teams actually use. Task management, ownership tracking, and verification.',
    keywords: 'VP engineering governance, engineering compliance, operational governance',
  },

  // Proof Pages
  '/proof/case-studies': {
    title: 'Customer Case Studies | Infra Clean Cloud',
    description: 'See how enterprise teams achieved up to 40% faster audits and up to 60% fewer violations with Infra Clean Cloud.',
    keywords: 'cloud governance case studies, customer success, compliance case studies',
  },
  '/proof/benchmark': {
    title: 'Cloud Governance Benchmarks | Infra Clean Cloud',
    description: 'Industry benchmarks for cloud hygiene, compliance readiness, and remediation velocity. See where you stand.',
    keywords: 'cloud governance benchmarks, compliance benchmarks, industry standards',
  },

  // Company Pages
  '/company': {
    title: 'About Us | Infra Clean Cloud',
    description: 'Built by operators, for operators. We believe every cloud should be crystal clear. Learn our story.',
    keywords: 'about infra clean cloud, company, cloud governance company',
  },
  '/company/careers': {
    title: 'Careers | Join Infra Clean Cloud',
    description: 'Join us in making every cloud crystal clear. Remote-first, competitive equity, and meaningful work.',
    keywords: 'careers, jobs, cloud governance jobs, startup careers, remote jobs',
  },
  '/company/contact': {
    title: 'Contact Us | Infra Clean Cloud',
    description: 'Get in touch with our team. Sales inquiries, support, partnerships, and press.',
    keywords: 'contact, sales, support, partnerships',
  },

  // Pricing
  '/pricing': {
    title: 'Pricing | Infra Clean Cloud',
    description: 'Simple, transparent pricing. Start free, scale as you grow. Free, Pro, and Enterprise plans for cloud governance.',
    keywords: 'cloud governance pricing, compliance software pricing, cloud security cost',
    schema: [ORGANIZATION_SCHEMA, {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Is there a free trial?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. All paid plans include a 14-day free trial with full access. No credit card required to start.' }},
        { '@type': 'Question', name: 'Can I change plans later?', acceptedAnswer: { '@type': 'Answer', text: 'Absolutely. Upgrade or downgrade anytime. When upgrading, you get immediate access to new features.' }},
        { '@type': 'Question', name: 'What happens if I exceed my resource limits?', acceptedAnswer: { '@type': 'Answer', text: 'We will notify you when you reach 80% of your limit. Scanning continues but new resources are queued until you upgrade.' }},
        { '@type': 'Question', name: 'Is my data secure?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. We are pursuing SOC 2 Type II certification and encrypt all data at rest and in transit. We use read-only IAM roles with least-privilege access.' }},
      ]
    }],
  },

  // Blog
  '/blog': {
    title: 'Blog | Infra Clean Cloud',
    description: 'Insights on cloud governance, compliance, and security from industry experts. Best practices and guides.',
    keywords: 'cloud governance blog, compliance insights, cloud security articles, AWS best practices',
  },

  // Blog Posts
  '/blog/cloud-governance-2026': {
    title: 'The State of Cloud Governance in 2026 | Infra Clean Cloud',
    description: 'Why 73% of enterprises still struggle with cloud compliance and what leaders are doing differently.',
    keywords: 'cloud governance 2026, compliance trends, enterprise cloud',
    article: true,
  },
  '/blog/soc2-without-pain': {
    title: 'SOC 2 Without the Pain | Infra Clean Cloud',
    description: 'How modern teams cut audit prep time from weeks to hours with continuous compliance.',
    keywords: 'SOC 2 audit, continuous compliance, audit automation',
    article: true,
  },
  '/blog/aws-iam-best-practices': {
    title: 'AWS IAM Best Practices for 2026 | Infra Clean Cloud',
    description: 'Least privilege, key rotation, and MFA enforcement. A practical guide for security teams.',
    keywords: 'AWS IAM, least privilege, MFA, access key rotation, cloud security',
    article: true,
  },
  '/blog/tagging-strategy-that-works': {
    title: 'A Tagging Strategy That Actually Works | Infra Clean Cloud',
    description: 'Why most tagging initiatives fail and the simple framework that drives 95%+ compliance.',
    keywords: 'cloud tagging, resource tagging, tagging compliance, AWS tags',
    article: true,
  },
  '/blog/cloud-cost-ownership': {
    title: 'The Hidden Cost of No Ownership | Infra Clean Cloud',
    description: 'Unowned cloud resources cost enterprises millions. Here is how to fix it.',
    keywords: 'cloud cost, resource ownership, cloud waste, cost optimization',
    article: true,
  },

  // Utility Pages
  '/request-briefing': {
    title: 'Request Briefing | Infra Clean Cloud',
    description: 'Request a personalized briefing on how Infra Clean Cloud can transform your cloud governance.',
    keywords: 'request briefing, demo, cloud governance consultation',
  },
  '/campaigns': {
    title: 'Campaigns | Infra Clean Cloud',
    description: 'Explore our targeted solutions for specific cloud governance challenges.',
    keywords: 'cloud governance campaigns, solutions',
    noindex: true,
  },
  '/login': {
    title: 'Login | Infra Clean Cloud',
    description: 'Sign in to your Infra Clean Cloud account.',
    noindex: true,
  },
  '/signup': {
    title: 'Sign Up | Infra Clean Cloud',
    description: 'Create your free Infra Clean Cloud account.',
    noindex: true,
  },
  '/status': {
    title: 'System Status | Infra Clean Cloud',
    description: 'Current operational status of Infra Clean Cloud services.',
    noindex: true,
  },

  // Legal Pages
  '/privacy': {
    title: 'Privacy Policy | Infra Clean Cloud',
    description: 'How Infra Clean Cloud collects, uses, and protects your personal information.',
    keywords: 'privacy policy, data protection, GDPR',
  },
  '/terms': {
    title: 'Terms of Service | Infra Clean Cloud',
    description: 'Terms and conditions for using Infra Clean Cloud services.',
    keywords: 'terms of service, terms and conditions, user agreement',
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
      title: 'Campaign | Infra Clean Cloud',
      description: 'Explore this cloud governance solution from Infra Clean Cloud.',
      noindex: true,
    };
  }

  // Default fallback
  return {
    title: 'Infra Clean Cloud | Enterprise Cloud Governance',
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
