import { createContext, useContext, useEffect, useMemo, useState, useRef, Fragment } from 'react';
import { SEO } from './seo';
import { createHandoffAndRedirect as handoffRedirect, getAttributionData, storeUtmParams } from './api/handoff';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  CheckSquare, 
  Database, 
  FileBarChart, 
  Shield, 
  Settings, 
  Building2,
  Check,
  ChevronDown,
  ArrowRight,
  // Additional icons for content pages
  Eye,
  Target,
  Zap,
  Lock,
  Users,
  TrendingUp,
  Clock,
  Award,
  Layers,
  GitBranch,
  Cloud,
  Server,
  Activity,
  CheckCircle,
  XCircle,
  MinusCircle,
  BarChart3,
  PieChart,
  Briefcase,
  BookOpen,
  Lightbulb,
  Gauge,
  // Company page icons
  Heart,
  Rocket,
  Coffee,
  Globe,
  Linkedin,
  Twitter,
  Mail,
  MapPin,
  Sparkles,
  MessageCircle,
  PartyPopper,
  Compass,
  Flame,
  // Platform page icons
  Cpu,
  HardDrive,
  Key,
  Network,
  DollarSign,
  Link,
  Fingerprint,
  // Pricing & Blog icons
  Moon,
  Sun,
  Calendar,
  User,
  Minus,
  // How it works icons
  Search,
  Wrench,
  // Mobile nav
  Menu,
  X as XIcon
} from 'lucide-react';

const NavigationContext = createContext({ navigate: () => {} });

// Global Intersection Observer for scroll animations (performant)
// Single observer instance shared across all elements
let globalObserver = null;
const observedElements = new Set();

function getGlobalObserver() {
  if (!globalObserver && typeof window !== 'undefined') {
    globalObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            globalObserver.unobserve(entry.target);
            observedElements.delete(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
  }
  return globalObserver;
}

// Lightweight scroll reveal - no React state, pure DOM
function ScrollReveal({ children, className = '', delay = 0, direction = 'up' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const observer = getGlobalObserver();
    
    if (el && observer && !observedElements.has(el)) {
      observedElements.add(el);
      observer.observe(el);
    }

    return () => {
      if (el && observer) {
        observer.unobserve(el);
        observedElements.delete(el);
      }
    };
  }, []);

  const directionClass = `scroll-reveal-${direction}`;

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${directionClass} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

const APP_URL = import.meta.env.VITE_APP_URL || 'https://app.cloudhygienecoach.com';
const API_URL = import.meta.env.VITE_APP_API_URL || 'https://api.cloudhygienecoach.com';
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

if (GA_ID && typeof window !== 'undefined') {
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  script.async = true;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID);
}

// UTM capture for attribution
function captureUtmParams() {
  const params = new URLSearchParams(window.location.search);
  const utm = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(key => {
    if (params.has(key)) utm[key.replace('utm_', '')] = params.get(key);
  });
  if (Object.keys(utm).length > 0) {
    utm.referrer = document.referrer || null;
    utm.landingPage = window.location.pathname;
    localStorage.setItem('chc_marketing_utm', JSON.stringify(utm));
  }
}

// Call on page load
if (typeof window !== 'undefined') captureUtmParams();

function getStoredUtm() {
  try { return JSON.parse(localStorage.getItem('chc_marketing_utm') || '{}'); }
  catch { return {}; }
}

// Google Analytics event tracking
function trackEvent(eventName, params = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}

/**
 * Navigate to the application with UTM parameters preserved
 * Uses handoff tokens for signup paths, direct navigation for login
 */
function navigateToApp(path, additionalParams = {}) {
  // Track conversion
  trackEvent('begin_signup', { method: 'handoff', destination: path });
  
  // For signup paths, use handoff token flow
  if (path === '/signup' || path === '/welcome') {
    const { email, firstName, lastName, company, ...otherParams } = additionalParams;
    
    // Get stored and current attribution
    const storedUtm = getStoredUtm();
    const currentAttribution = getAttributionData();
    
    handoffRedirect({
      email: email || null,
      firstName: firstName || null,
      lastName: lastName || null,
      company: company || null,
      extraAttribution: {
        ...storedUtm,
        ...currentAttribution,
        ...otherParams,
        marketingSource: 'marketing_site',
      },
      destination: '/welcome',
    });
    
    return;
  }
  
  // For non-signup paths (login, etc.), use direct navigation
  const targetUrl = new URL(path, APP_URL);
  
  // Preserve UTM parameters
  const currentParams = new URLSearchParams(window.location.search);
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(param => {
    if (currentParams.has(param)) {
      targetUrl.searchParams.set(param, currentParams.get(param));
    }
  });
  
  // Add any stored UTM data that might not be in current URL
  const storedUtm = getStoredUtm();
  if (storedUtm.source && !targetUrl.searchParams.has('utm_source')) {
    targetUrl.searchParams.set('utm_source', storedUtm.source);
  }
  if (storedUtm.medium && !targetUrl.searchParams.has('utm_medium')) {
    targetUrl.searchParams.set('utm_medium', storedUtm.medium);
  }
  if (storedUtm.campaign && !targetUrl.searchParams.has('utm_campaign')) {
    targetUrl.searchParams.set('utm_campaign', storedUtm.campaign);
  }
  
  // Add additional parameters
  Object.entries(additionalParams).forEach(([key, value]) => {
    if (value) targetUrl.searchParams.set(key, value);
  });
  
  // Clear stored UTM (it's now in the URL)
  localStorage.removeItem('chc_marketing_utm');
  
  // Navigate to the app
  window.location.href = targetUrl.toString();
}

// Enhanced handoff function with full attribution support
async function createHandoffAndRedirect(email = null, additionalData = {}) {
  const storedUtm = getStoredUtm();
  const currentAttribution = getAttributionData();
  
  await handoffRedirect({
    email,
    ...additionalData,
    extraAttribution: {
      ...storedUtm,
      ...currentAttribution,
      marketingSource: 'marketing_site',
    },
    destination: '/welcome',
  });
}

const NAV_LINKS = [
  { label: 'Platform', href: '/platform' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Customers', href: '/proof/case-studies' },
  { label: 'Company', href: '/company' }
];

const CAMPAIGNS = [
  {
    slug: 'cloud-hygiene-score',
    title: 'Cloud Hygiene Score',
    summary: 'Quantify governance gaps with an executive-ready scorecard.',
    outcomes: ['Board-ready reporting', 'Enterprise baselines', 'Weekly trend visibility'],
    metrics: ['Reduce audit prep time by 40%', 'Achieve 95% ownership coverage'],
    sections: [
      {
        title: 'What leaders need',
        body:
          'A concise, defensible view of hygiene posture that can be trusted across every cloud and environment.',
        bullets: ['One score, multiple controls', 'Traceability to owners', 'Evidence-ready reporting']
      },
      {
        title: 'How it works',
        body:
          'Continuous scanning, policy validation, and remediation tracking to keep the score accurate and current.',
        bullets: ['Automated scanning cadence', 'Ownership alignment', 'Control coverage tracking']
      }
    ]
  },
  {
    slug: 'cio-risk-reduction',
    title: 'CIO Risk Reduction',
    summary: 'Govern cloud sprawl with accountable ownership and lifecycle control.',
    outcomes: ['Policy adherence across accounts', 'Reduced operational surprises'],
    metrics: ['60% fewer critical violations', '2x faster remediation cycles'],
    sections: [
      {
        title: 'Operational risk map',
        body:
          'Identify where hygiene debt creates risk across business units, vendors, and environments.',
        bullets: ['Cross-team coverage', 'Critical asset clarity', 'Risk heatmaps']
      },
      {
        title: 'Operating discipline',
        body:
          'Standardized policies and remediation workflows that move risk down each week.',
        bullets: ['Ownership enforcement', 'Remediation SLAs', 'Executive reporting']
      }
    ]
  },
  {
    slug: 'ciso-audit-readiness',
    title: 'CISO Audit Readiness',
    summary: 'Turn hygiene enforcement into auditable evidence.',
    outcomes: ['Continuous evidence trail', 'Compliance-aligned reporting'],
    metrics: ['SOC 2 readiness in 90 days', '98% tagging compliance'],
    sections: [
      {
        title: 'Audit evidence, always on',
        body:
          'Convert daily operations into the audit trail required by security frameworks.',
        bullets: ['Framework mapping', 'Control coverage', 'Evidence exports']
      },
      {
        title: 'Risk exception control',
        body:
          'Track exceptions and ownership decisions with executive visibility.',
        bullets: ['Exception registry', 'Expiry reminders', 'Executive sign-off']
      }
    ]
  },
  {
    slug: 'devops-efficiency',
    title: 'DevOps Efficiency',
    summary: 'Eliminate hygiene debt without slowing delivery.',
    outcomes: ['Automated remediation guidance', 'Clear ownership signals'],
    metrics: ['30% fewer rework cycles', 'Faster change approvals'],
    sections: [
      {
        title: 'Operational focus',
        body:
          'Remove noise from hygiene work and focus teams on high-impact fixes.',
        bullets: ['Priority queues', 'Owner assignment', 'Evidence capture']
      },
      {
        title: 'Frictionless standards',
        body:
          'Policy guidance that engineers can follow without slowing releases.',
        bullets: ['Self-serve standards', 'Validation guidance', 'Release alignment']
      }
    ]
  }
];

const DEFAULT_CTA = {
  primary: { label: 'Request briefing', href: '/request-briefing' },
  secondary: { label: 'Explore platform', href: '/platform' }
};

function buildOutcomePage({ title, summary, focus, kpis, outcomes }) {
  return {
    eyebrow: 'Outcomes',
    title,
    summary,
    heroScreenshot: { placeholder: `${title} Dashboard View (1100 × 500)` },
    heroKpis: kpis,
    sections: [
      {
        type: 'narrative',
        title: 'Executive outcome',
        body: `A governance program that delivers ${focus} with measurable accountability.`,
        bullets: outcomes
      },
      {
        type: 'screenshot',
        eyebrow: 'Before & After',
        title: 'From reactive to proactive governance',
        body: 'See the transformation from ad-hoc hygiene work to measurable, continuous compliance.',
        bullets: ['Real-time posture visibility', 'Automated evidence capture', 'Executive-ready reporting'],
        placeholder: 'Governance Dashboard (600 × 360)'
      },
      {
        type: 'pillar-grid',
        title: 'What changes',
        cards: [
          { title: 'Visibility', body: 'Weekly posture updates with ownership clarity.' },
          { title: 'Execution', body: 'Remediation workflows tied to SLAs and evidence.' },
          { title: 'Assurance', body: 'Auditable control coverage across accounts.' }
        ]
      },
      {
        type: 'stat-grid',
        title: 'Operating signals',
        stats: [
          { value: 'Weekly', label: 'Reporting', detail: 'Executive reporting cadence' },
          { value: '24/7', label: 'Evidence', detail: 'Continuous collection' },
          { value: 'Multi-team', label: 'Accountability', detail: 'Ownership clarity' }
        ]
      },
      {
        type: 'timeline',
        title: '90-day operating cadence',
        steps: [
          { title: 'Weeks 1-2', body: 'Baseline posture and ownership coverage.' },
          { title: 'Weeks 3-6', body: 'Remediation momentum with executive reporting.' },
          { title: 'Weeks 7-12', body: 'Sustained control coverage and audit-ready evidence.' }
        ]
      },
      {
        type: 'quote',
        quote: 'We moved from reactive hygiene work to a measurable governance cadence in under 60 days.',
        role: 'VP Cloud Operations',
        company: 'Enterprise Customer'
      },
      {
        type: 'cta',
        title: 'Align on outcomes',
        body: 'See how a governance operating model maps to executive priorities.',
        primary: DEFAULT_CTA.primary,
        secondary: { label: 'View proof', href: '/proof/case-studies' }
      }
    ]
  };
}

function buildRolePage({ title, summary, priorities, outcomes }) {
  const roleType = title.replace('For ', '').replace('s', '');
  return {
    eyebrow: 'Roles',
    title,
    summary,
    heroScreenshot: { placeholder: `${roleType} Dashboard View (1100 × 500)` },
    heroKpis: [
      { label: 'Priority', value: priorities[0], detail: 'Executive mandate' },
      { label: 'Priority', value: priorities[1], detail: 'Operational focus' },
      { label: 'Priority', value: priorities[2], detail: 'Governance discipline' }
    ],
    sections: [
      {
        type: 'screenshot',
        eyebrow: 'A day in the life',
        title: `How ${title.replace('For ', '')} use Cloud Hygiene Coach`,
        body: 'Start your day with a complete view of governance posture and end it with measurable progress.',
        bullets: ['Morning: Review posture dashboard', 'Midday: Track remediation progress', 'Weekly: Share executive summary'],
        placeholder: `${roleType} Workflow View (600 × 360)`
      },
      {
        type: 'narrative',
        title: 'Executive mandate',
        body: 'Deliver executive-level governance with continuous visibility and accountability.',
        bullets: outcomes
      },
      {
        type: 'pillar-grid',
        title: 'How we support this role',
        cards: [
          { title: 'Executive dashboards', body: 'Board-ready reporting on hygiene posture.' },
          { title: 'Operational cadence', body: 'Weekly reporting and remediation workflows.' },
          { title: 'Audit evidence', body: 'Control mapping and evidence export.' }
        ]
      },
      {
        type: 'stat-grid',
        title: 'Role outcomes',
        stats: [
          { value: 'Weekly', label: 'Updates', detail: 'Governance posture reports' },
          { value: 'Policy-aligned', label: 'Standards', detail: 'Continuous enforcement' },
          { value: 'Audit-ready', label: 'Evidence', detail: 'Always available' }
        ]
      },
      {
        type: 'quote',
        quote: 'Finally, a tool that gives me the executive visibility I need without requiring my team to do manual work.',
        role: roleType,
        company: 'Enterprise Customer'
      }
    ]
  };
}

function buildProofPage({ title, summary, stories }) {
  return {
    eyebrow: 'Proof',
    title,
    summary,
    heroKpis: [
      { label: 'Benchmark', value: 'Industry', detail: 'Peer comparison data' },
      { label: 'Impact', value: 'Quantified', detail: 'Measured outcomes' },
      { label: 'Evidence', value: 'Auditable', detail: 'Control mapping' }
    ],
    sections: [
      {
        type: 'case-study-grid',
        title: 'Enterprise success stories',
        stories: stories.map((story, i) => ({
          ...story,
          result: i === 0 ? { value: '40%', label: 'audit time saved' } :
                  i === 1 ? { value: '98%', label: 'ownership coverage' } :
                           { value: '60%', label: 'violations reduced' }
        }))
      },
      {
        type: 'quote',
        quote: 'Cloud Hygiene Coach gave us the visibility and accountability we needed to pass our SOC 2 audit with zero findings.',
        role: 'CISO',
        company: 'Enterprise SaaS'
      },
      {
        type: 'stat-grid',
        title: 'Aggregate impact across customers',
        stats: [
          { value: '40%', label: 'Audit prep', detail: 'Time reduction average' },
          { value: '60%', label: 'Violations', detail: 'Critical issues reduced' },
          { value: '98%', label: 'Ownership', detail: 'Coverage achieved' }
        ]
      }
    ]
  };
}

function buildTrustPage({ title, summary, domains }) {
  return {
    eyebrow: 'Trust',
    title,
    summary,
    heroKpis: [
      { label: 'Security', value: 'Enterprise', detail: 'Grade' },
      { label: 'Uptime', value: '99.9%', detail: 'SLA' },
      { label: 'Incidents', value: '0', detail: 'Since launch' }
    ],
    sections: [
      {
        type: 'trust-badges',
        title: 'Certifications',
        badges: [
          { name: 'SOC 2 Type II', detail: 'Audited' },
          { name: 'ISO 27001', detail: 'Certified' },
          { name: 'GDPR', detail: 'Compliant' },
          { name: 'HIPAA', detail: 'Ready' }
        ]
      },
      {
        type: 'narrative',
        title: 'Built for security teams.',
        body: 'Demonstrable control coverage.',
        bullets: domains
      },
      {
        type: 'quote',
        quote: 'Procurement approved in two weeks.',
        role: 'Security Director',
        company: 'Enterprise Customer'
      }
    ]
  };
}

// Company pages are now defined directly in CONTENT_PAGES for full customization

const CONTENT_PAGES = {
  '/platform': {
    eyebrow: 'Platform',
    title: 'Governance that works.',
    summary: 'See everything. Fix anything. Audit-ready, always.',
    heroScreenshot: { placeholder: 'Dashboard' },
    heroKpis: [
      { label: 'Coverage', value: '98%', detail: 'Asset ownership' },
      { label: 'Faster', value: '40%', detail: 'Audit prep' },
      { label: 'Fewer', value: '60%', detail: 'Violations' }
    ],
    sections: [
      // Connect once
      {
        type: 'screenshot',
        title: 'Connect once. See everything.',
        body: 'Read-only API access. No agents. No infrastructure changes.',
        bullets: ['AWS Organizations multi-account', 'Cross-account IAM roles', 'Real-time and scheduled scans']
      },
      // What we scan
      {
        type: 'pillar-grid',
        title: 'What we scan.',
        cards: [
          { title: 'Compute', body: 'EC2, Lambda, ECS, EKS. Lifecycle, tagging, security groups.' },
          { title: 'Storage', body: 'S3, EBS, EFS. Encryption, public access, versioning.' },
          { title: 'Identity', body: 'IAM users, roles, policies. Least privilege, MFA, key rotation.' },
          { title: 'Network', body: 'VPCs, security groups, NACLs. Exposure and segmentation.' },
          { title: 'Data', body: 'RDS, DynamoDB, Redshift. Encryption, backups, access.' },
          { title: 'Cost', body: 'Unused resources, rightsizing, reserved capacity.' }
        ]
      },
      // Rules
      {
        type: 'screenshot',
        title: 'Rules that make sense.',
        body: 'Pre-built controls mapped to CIS, SOC 2, HIPAA, PCI-DSS, ISO 27001.',
        bullets: ['200+ built-in controls', 'Framework-to-finding mapping', 'Custom rule builder'],
        reverse: true
      },
      // Dashboard
      {
        type: 'screenshot',
        title: 'See everything.',
        body: 'Risk, compliance, and cost in one view.',
        bullets: ['Hygiene score trends', 'Risk by category', 'Compliance metrics']
      },
      // Findings
      {
        type: 'screenshot',
        title: 'Know what matters.',
        body: 'Prioritized findings with clear paths forward.',
        bullets: ['Impact-ranked', 'Framework-aligned', 'One-click remediation'],
        reverse: true
      },
      // Ownership
      {
        type: 'screenshot',
        title: 'Ownership, not tickets.',
        body: 'Every finding has an owner, a due date, and a clear path.',
        bullets: ['Auto-assign by tag or team', 'Slack and Teams alerts', 'SLA tracking with escalation']
      },
      // Evidence
      {
        type: 'screenshot',
        title: 'Audit evidence. Always on.',
        body: 'Continuous evidence collection. Audit packages in minutes.',
        bullets: ['Point-in-time snapshots', 'Control-level evidence', 'PDF and CSV exports'],
        reverse: true
      },
      // How it works
      {
        type: 'timeline',
        title: 'How it works.',
        steps: [
          { title: 'Discover', body: 'Scan and classify assets.' },
          { title: 'Prioritize', body: 'Rank by risk and impact.' },
          { title: 'Remediate', body: 'Assign, fix, verify.' },
          { title: 'Report', body: 'Executive-ready summaries.' }
        ]
      },
      // Enterprise
      {
        type: 'pillar-grid',
        title: 'Built for enterprise.',
        cards: [
          { title: 'Multi-tenancy', body: 'Manage hundreds of customers from one pane.' },
          { title: 'SSO & RBAC', body: 'SAML/OIDC. Granular permissions by team.' },
          { title: 'API-first', body: 'REST API for CI/CD and ITSM integration.' },
          { title: 'SOC 2 Type II', body: 'We practice what we preach.' }
        ]
      },
      // Quote
      {
        type: 'quote',
        quote: 'Cut audit prep time in half.',
        role: 'VP Engineering',
        company: 'Financial Services'
      }
    ]
  },
  '/platform/how-it-works': {
    eyebrow: 'Platform',
    title: 'How it works',
    summary:
      'A closed-loop operating system for discovery, enforcement, and remediation.',
    heroKpis: [
      { label: 'Discovery', value: 'Multi-cloud', detail: 'AWS now, Azure/GCP roadmap' },
      { label: 'Evidence', value: 'Always on', detail: 'Control-level audit trail' },
      { label: 'Execution', value: 'Teams aligned', detail: 'Clear SLAs and owners' }
    ],
    sections: [
      {
        type: 'narrative',
        title: 'From scan to executive action',
        body:
          'Hygiene becomes measurable when you control the full loop: discovery, enforcement, remediation, and reporting.',
        bullets: ['Ownership mapped to every asset', 'Findings tied to controls', 'Evidence captured continuously']
      },
      {
        type: 'timeline',
        title: 'Operational loop',
        steps: [
          { title: 'Discover', body: 'Inventory assets, tags, ownership, and lifecycle status.' },
          { title: 'Score', body: 'Calculate hygiene scores by domain and business unit.' },
          { title: 'Assign', body: 'Create remediation tasks with due dates and owners.' },
          { title: 'Verify', body: 'Recheck assets and store evidence.' }
        ]
      },
      {
        type: 'pillar-grid',
        title: 'Controls that matter',
        cards: [
          { title: 'Naming & tagging', body: 'Standardized resource identity across environments.' },
          { title: 'Ownership', body: 'Every asset has a named accountable owner.' },
          { title: 'Lifecycle', body: 'Retire or remediate aging resources.' },
          { title: 'Environment separation', body: 'Policy enforcement by environment.' }
        ]
      },
      {
        type: 'pillar-grid',
        title: 'Execution workflow',
        cards: [
          { title: 'Risk triage', body: 'Prioritize findings by severity, cost exposure, and audit impact.' },
          { title: 'Remediation tasks', body: 'Assign owners, due dates, and evidence requirements.' },
          { title: 'Validation checks', body: 'Re-scan to confirm closure and prevent regressions.' },
          { title: 'Executive reporting', body: 'Deliver summaries aligned to governance KPIs.' }
        ]
      },
      {
        type: 'stat-grid',
        title: 'Operational cadence',
        stats: [
          { value: 'Daily', label: 'Policy compliance monitoring' },
          { value: 'Weekly', label: 'Governance review cycle' },
          { value: 'Quarterly', label: 'Audit readiness checkpoints' }
        ]
      },
      {
        type: 'quote',
        quote:
          'We replaced quarterly hygiene audits with weekly operational reporting and cut audit prep in half.',
        attribution: 'VP Engineering, Global Enterprise'
      }
    ]
  },
  '/platform/capabilities': {
    eyebrow: 'Platform',
    title: 'Capabilities',
    summary:
      'Enterprise-grade feature depth that connects governance policy to operational execution.',
    heroKpis: [
      { label: 'Controls', value: '25+', detail: 'Framework-aligned policy checks' },
      { label: 'Teams', value: 'Multi-tenant', detail: 'Role-based access and reporting' },
      { label: 'Signals', value: 'Real-time', detail: 'Hygiene drift detection' }
    ],
    sections: [
      {
        type: 'narrative',
        title: 'Product overview',
        body:
          'Cloud Hygiene Coach integrates cloud environment data, applies compliance frameworks, and generates actionable remediation workflows. Built for organizations that require continuous audit readiness, risk quantification, and operational accountability across multi-cloud infrastructure.',
        bullets: ['Continuous audit readiness', 'Risk quantification', 'Operational accountability']
      },
      {
        type: 'pillar-grid',
        title: 'Operational command center',
        cards: [
          {
            title: 'Dashboard',
            body: 'Real-time visibility into risk exposure, compliance readiness, category health, and remediation velocity.'
          },
          {
            title: 'Findings',
            body: 'Severity-based issues linked to affected resources with contextual business impact.'
          },
          {
            title: 'Tasks',
            body: 'Remediation tracking with ownership, checklists, evidence capture, and verification.'
          },
          {
            title: 'Resources',
            body: 'Unified inventory with advanced filtering, search, and CSV export.'
          }
        ]
      },
      {
        type: 'pillar-grid',
        title: 'Policy and enforcement',
        cards: [
          { title: 'Framework alignment', body: 'SOC 2, PCI, HIPAA, and NIST-aligned controls.' },
          { title: 'Standards enforcement', body: 'Naming, tagging, ownership, and lifecycle policies.' },
          { title: 'Exception handling', body: 'Risk acceptance with executive visibility and expirations.' },
          { title: 'Evidence capture', body: 'Attach proof to findings and remediation tasks.' }
        ]
      },
      {
        type: 'pillar-grid',
        title: 'Governance and reporting',
        cards: [
          {
            title: 'Reports',
            body: 'Executive summaries, risk impact analysis, and audit-ready exports.'
          },
          {
            title: 'Standards',
            body: 'Framework-aligned controls with remediation guidance and evidence requirements.'
          },
          {
            title: 'Settings',
            body: 'Cloud integrations, scan cadence, team operations, and notification controls.'
          },
          {
            title: 'Platform operations',
            body: 'Multi-tenant management, billing, audit logs, system health, and RBAC.'
          }
        ]
      },
      {
        type: 'stat-grid',
        title: 'Operational assurance',
        stats: [
          { value: '100%', label: 'Audit trail coverage' },
          { value: 'Role-based', label: 'Least-privilege access' },
          { value: 'Multi-tenant', label: 'Enterprise account isolation' }
        ]
      },
      {
        type: 'stat-grid',
        title: 'Enterprise impact signals',
        stats: [
          { value: '40%', label: 'Audit prep time reduced' },
          { value: '60%', label: 'Critical violations reduced' },
          { value: '98%', label: 'Tagging compliance achieved' }
        ]
      },
      {
        type: 'cta',
        title: 'Request a capabilities briefing',
        body: 'Align governance, remediation, and audit readiness across every cloud environment.',
        primary: DEFAULT_CTA.primary,
        secondary: { label: 'Explore platform', href: '/platform' }
      }
    ]
  },
  '/platform/integrations': {
    eyebrow: 'Platform',
    title: 'Integrations',
    summary:
      'Connect to your cloud, alerts to your team, and data to your workflows.',
    heroKpis: [
      { label: 'Clouds', value: 'AWS', detail: 'Azure and GCP coming soon' },
      { label: 'Alerts', value: 'Slack', detail: 'Teams, PagerDuty, and more' },
      { label: 'Workflows', value: 'API', detail: 'Full REST API access' }
    ],
    sections: [
      {
        type: 'integration-badges',
        title: 'Cloud platforms',
        badges: [
          { name: 'AWS', status: 'active' },
          { name: 'Azure', status: 'roadmap' },
          { name: 'GCP', status: 'roadmap' }
        ]
      },
      {
        type: 'integration-badges',
        title: 'Notifications & ticketing',
        badges: [
          { name: 'Slack', status: 'active' },
          { name: 'Jira', status: 'active' },
          { name: 'GitHub', status: 'active' }
        ]
      },
      {
        type: 'pillar-grid',
        title: 'AWS services supported',
        cards: [
          { title: 'EC2', body: 'Instance inventory, tagging compliance, and lifecycle tracking.' },
          { title: 'S3', body: 'Bucket policies, encryption status, and access controls.' },
          { title: 'RDS', body: 'Database configurations, backup status, and encryption.' },
          { title: 'IAM', body: 'User and role policies, access key rotation, MFA status.' }
        ]
      },
      {
        type: 'narrative',
        title: 'Operational workflows',
        body: 'Deliver hygiene signals to the teams responsible for remediation.',
        bullets: ['CSV and PDF audit exports', 'Executive reporting dashboards', 'RESTful API access', 'Webhook notifications']
      },
      {
        type: 'quote',
        quote: 'The AWS integration gave us visibility we never had before. Setup took 30 minutes.',
        role: 'Cloud Architect',
        company: 'Healthcare Technology'
      }
    ]
  },
  '/outcomes/governance': buildOutcomePage({
    title: 'Governance and control',
    summary:
      'Establish consistent ownership, standards, and accountability across every cloud team.',
    focus: 'ownership coverage and standards enforcement',
    kpis: [
      { label: 'Coverage', value: '98%', detail: 'Ownership on critical assets' },
      { label: 'Standards', value: 'Weekly', detail: 'Policy drift reporting' },
      { label: 'Visibility', value: 'Unified', detail: 'Cross-team hygiene view' }
    ],
    outcomes: [
      'Every asset has an accountable owner',
      'Standards are enforceable and measurable',
      'Governance posture is visible weekly'
    ]
  }),
  '/outcomes/audit-readiness': buildOutcomePage({
    title: 'Audit readiness',
    summary:
      'Convert hygiene enforcement into audit-ready evidence for every framework.',
    focus: 'evidence collection and control coverage',
    kpis: [
      { label: 'Readiness', value: '90 days', detail: 'Time to audit baseline' },
      { label: 'Evidence', value: 'Always on', detail: 'Continuous control logging' },
      { label: 'Reporting', value: 'Board-ready', detail: 'Executive summaries' }
    ],
    outcomes: [
      'Continuous evidence without audit scrambles',
      'Mapped controls across frameworks',
      'Executive-ready reporting'
    ]
  }),
  '/outcomes/cost': buildOutcomePage({
    title: 'Cost and waste reduction',
    summary:
      'Identify hygiene-driven waste and reduce cloud spend without sacrificing performance.',
    focus: 'lifecycle enforcement and ownership clarity',
    kpis: [
      { label: 'Waste', value: '30%', detail: 'Reduction in orphaned assets' },
      { label: 'Attribution', value: 'Full', detail: 'Cost aligned to owners' },
      { label: 'Savings', value: 'Quarterly', detail: 'Executive cost reporting' }
    ],
    outcomes: [
      'Clear accountability for cost drivers',
      'Lifecycle policies reduce unused spend',
      'Executive-ready savings reporting'
    ]
  }),
  '/outcomes/risk': buildOutcomePage({
    title: 'Risk posture',
    summary:
      'Reduce exposure by closing hygiene gaps that create operational and security risk.',
    focus: 'critical asset protection and remediation velocity',
    kpis: [
      { label: 'Risk', value: '60%', detail: 'Fewer critical violations' },
      { label: 'Speed', value: '2x', detail: 'Remediation velocity' },
      { label: 'Coverage', value: 'Weekly', detail: 'Risk posture updates' }
    ],
    outcomes: [
      'Critical assets are governed and monitored',
      'Remediation SLAs reduce exposure',
      'Leadership visibility into risk posture'
    ]
  }),
  '/roles/cio': buildRolePage({
    title: 'For CIOs',
    summary:
      'Executive control of cloud hygiene, risk, and accountability.',
    priorities: ['Enterprise governance posture', 'Risk reduction', 'Operational discipline'],
    outcomes: ['Board-ready reporting', 'Accountability at scale', 'Audit readiness']
  }),
  '/roles/ciso': buildRolePage({
    title: 'For CISOs',
    summary:
      'Continuous evidence of governance controls that support audit readiness.',
    priorities: ['Control coverage', 'Evidence trail', 'Security posture'],
    outcomes: ['Audit-ready evidence', 'Risk exception visibility', 'Policy enforcement']
  }),
  '/roles/cto': buildRolePage({
    title: 'For CTOs',
    summary:
      'Build engineering velocity on top of enforceable governance standards.',
    priorities: ['Engineering enablement', 'Architecture integrity', 'Operational clarity'],
    outcomes: ['Reduced rework', 'Aligned standards', 'Measured execution']
  }),
  '/roles/vp-engineering': buildRolePage({
    title: 'For VPs of Engineering',
    summary:
      'Make ownership and remediation part of the engineering operating system.',
    priorities: ['Execution accountability', 'Team coordination', 'Remediation velocity'],
    outcomes: ['Clear ownership', 'Measured velocity', 'Executive reporting']
  }),
  '/proof/case-studies': buildProofPage({
    title: 'Case studies',
    summary:
      'Enterprise teams use Cloud Hygiene Coach to drive accountability and reduce risk.',
    stories: [
      {
        title: 'Financial services',
        body: 'Unified hygiene standards across 14 business units with 40% faster audit prep.'
      },
      {
        title: 'Healthcare',
        body: 'Improved ownership coverage to 98% across regulated environments.'
      },
      {
        title: 'Enterprise SaaS',
        body: 'Reduced high-severity hygiene violations by 60% in 90 days.'
      }
    ]
  }),
  '/proof/benchmark': buildProofPage({
    title: 'Benchmark report',
    summary:
      'See how enterprise cloud hygiene compares across industries.',
    stories: [
      {
        title: 'Peer benchmarks',
        body: 'Compare governance performance against industry baselines.'
      },
      {
        title: 'Executive insights',
        body: 'Identify the top gaps with the highest risk exposure.'
      },
      {
        title: 'Actionable gaps',
        body: 'Focus remediation on the controls that move the score.'
      }
    ]
  }),
  '/proof/roi': buildProofPage({
    title: 'ROI',
    summary:
      'Quantify savings from reduced audit effort and cloud waste.',
    stories: [
      {
        title: 'Audit savings',
        body: 'Reduce audit preparation time through continuous evidence capture.'
      },
      {
        title: 'Cloud savings',
        body: 'Eliminate resource waste with lifecycle hygiene and ownership clarity.'
      },
      {
        title: 'Risk reduction',
        body: 'Lower exposure by enforcing standards consistently.'
      }
    ]
  }),
  '/trust/security': buildTrustPage({
    title: 'Security',
    summary:
      'Security-first architecture with enterprise-grade governance controls.',
    domains: ['Least privilege', 'Audit logging', 'Tenant isolation']
  }),
  '/trust/compliance': buildTrustPage({
    title: 'Compliance',
    summary:
      'Compliance-ready governance aligned to enterprise frameworks.',
    domains: ['SOC 2 alignment', 'ISO 27001 mapping', 'PCI-DSS readiness']
  }),
  '/trust': buildTrustPage({
    title: 'Enterprise ready.',
    summary: 'Security. Compliance. Reliability.',
    domains: ['SOC 2 Type II', 'ISO 27001', '99.9% uptime']
  }),
  '/company': {
    eyebrow: 'Company',
    title: 'Governance that works.',
    summary: 'Built by operators, for operators.',
    hideLogoBar: true,
    sections: [
      {
        type: 'mission-hero',
        mission: "We're on a mission to make cloud governance boring.",
        subtitle: 'Not exciting. Not stressful. Just... handled. So you can focus on what actually matters.'
      },
      {
        type: 'origin-story',
        eyebrow: 'Our Story',
        title: 'Built by operators, for operators',
        paragraphs: [
          'In 2024, we watched enterprise teams drown in cloud sprawl. Manual audits. Spreadsheet gymnastics. Finger-pointing about who owns what. Zero accountability.',
          'We\'d seen it before—at companies large and small. The same story: good intentions, no system. Hygiene debt piling up until audit season became panic season.',
          'So we built the tool we wished we had. A single source of truth for cloud governance. Not another dashboard to ignore—an operating system for hygiene.'
        ],
        signature: { name: 'The Founding Team', role: 'Cloud Hygiene Coach' },
        imagePlaceholder: 'Founders Photo (400 × 500)'
      },
      {
        type: 'metrics-bar',
        metrics: [
          { value: '2024', label: 'Founded' },
          { value: 'AWS', label: 'Primary platform' },
          { value: 'Remote', label: 'Distributed team' }
        ]
      },
      {
        type: 'values-grid',
        title: 'What we stand for',
        subtitle: 'These aren\'t posters on a wall. They\'re how we make decisions.',
        values: [
          { name: 'Boring is better', icon: 'target', description: 'We ship reliable, not flashy. Governance should be invisible when it\'s working.' },
          { name: 'Own the outcome', icon: 'flame', description: 'No finger-pointing. If it\'s broken, we fix it. If we broke it, we say so.' },
          { name: 'Earn trust daily', icon: 'heart', description: 'Enterprise customers bet their compliance on us. We take that seriously.' },
          { name: 'Move with urgency', icon: 'rocket', description: 'Speed matters. But so does quality. We find the balance every day.' }
        ]
      },
      {
        type: 'hiring-cta',
        title: 'Join us',
        description: 'We\'re building something meaningful. If you want to work on hard problems with smart people, let\'s talk.',
        openRoles: 5,
        href: '/company/careers'
      }
    ]
  },
  '/company/leadership': {
    eyebrow: 'Leadership',
    title: 'Meet the team',
    summary: 'Operators and security leaders who\'ve lived the pain we\'re solving.',
    hideLogoBar: true,
    sections: [
      {
        type: 'narrative',
        title: 'Leadership team',
        body: 'Cloud Hygiene Coach is led by a team of operators and engineers who have built governance and compliance systems at enterprise scale.',
        bullets: [
          'Deep experience in cloud infrastructure and security',
          'Backgrounds in enterprise SaaS and compliance',
          'Full team profiles coming soon'
        ]
      },
      {
        type: 'values-grid',
        title: 'How we lead',
        values: [
          { name: 'Default to transparency', icon: 'compass', description: 'We share context freely. Bad news travels fast. Good news travels faster.' },
          { name: 'Hire people smarter than us', icon: 'sparkles', description: 'Ego is expensive. We want to be surrounded by people who make us better.' },
          { name: 'Customers > metrics', icon: 'heart', description: 'Numbers matter, but customer outcomes matter more. Always.' }
        ]
      }
    ]
  },
  '/company/careers': {
    eyebrow: 'Careers',
    title: 'Build something that matters',
    summary: 'We\'re solving real problems for real companies. Join us.',
    hideLogoBar: true,
    sections: [
      {
        type: 'culture-section',
        eyebrow: 'How We Work',
        title: 'Remote-first. Async-friendly. Human always.',
        description: 'We believe great work happens when people have autonomy, context, and trust. We\'re distributed across time zones but connected through shared purpose.',
        perks: [
          'Remote-first (always have been, always will be)',
          'Flexible hours—work when you\'re most productive',
          'Competitive salary + meaningful equity',
          'Premium health, dental, and vision',
          'Unlimited PTO (and we actually use it)',
          'Home office stipend + latest MacBook',
          'Annual team offsite (somewhere nice)',
          'Learning & development budget'
        ],
        imagePlaceholder: 'Team Offsite Photo (500 × 400)'
      },
      {
        type: 'values-grid',
        title: 'What we look for',
        subtitle: 'Skills matter, but these traits matter more.',
        values: [
          { name: 'Ownership mentality', icon: 'flame', description: 'You see a problem, you fix it. You don\'t wait to be asked.' },
          { name: 'Low ego, high standards', icon: 'target', description: 'You want to be right, not to win arguments. You hold yourself accountable.' },
          { name: 'Clear communication', icon: 'compass', description: 'You write well. You speak clearly. You know when to use async vs. sync.' },
          { name: 'Customer empathy', icon: 'heart', description: 'You understand that we exist to solve problems for real people.' }
        ]
      },
      {
        type: 'pillar-grid',
        title: 'Open roles',
        cards: [
          { title: 'Senior Backend Engineer', body: 'Build the core platform. Go, PostgreSQL, AWS. 5+ years experience.' },
          { title: 'Senior Frontend Engineer', body: 'Craft beautiful UIs. React, TypeScript. Design system experience a plus.' },
          { title: 'Product Designer', body: 'Design enterprise software that doesn\'t feel like enterprise software.' },
          { title: 'Enterprise Account Executive', body: 'Sell to CIOs and CISOs. Complex sales, consultative approach.' },
          { title: 'Customer Success Manager', body: 'Make customers wildly successful. Technical background preferred.' }
        ]
      },
      {
        type: 'hiring-cta',
        title: 'Don\'t see your role?',
        description: 'We\'re always looking for exceptional people. Send us a note and tell us what you\'d build.',
        href: '/company/contact'
      }
    ]
  },
  // Legal Pages
  '/privacy': {
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    summary: 'How we collect, use, and protect your information. Last updated: [Date — requires legal review].',
    hideLogoBar: true,
    sections: [
      {
        type: 'narrative',
        title: 'DRAFT — Pending Legal Review',
        body: 'This privacy policy is a draft and is subject to final legal review before launch. It outlines the intended data practices of Cloud Hygiene Coach.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '1. Information we collect',
        body: 'We collect information you provide directly (name, email, company information when you request a briefing), information collected automatically (usage data, device information, IP address, cookies), and information from third parties (analytics providers, advertising partners).',
        bullets: [
          'Account registration data',
          'Briefing request form submissions',
          'Usage analytics and session data',
          'Cookie and tracking identifiers'
        ]
      },
      {
        type: 'narrative',
        title: '2. How we use your information',
        body: 'We use collected information to provide and improve our services, communicate with you about your account and our products, process briefing requests, ensure security and prevent fraud, and comply with legal obligations.',
        bullets: [
          'Service delivery and improvement',
          'Customer communication',
          'Security and fraud prevention',
          'Legal compliance'
        ]
      },
      {
        type: 'narrative',
        title: '3. How we share your information',
        body: 'We do not sell your personal information. We may share information with service providers who assist in operating our platform, when required by law, or in connection with a business transfer.',
        bullets: [
          'We never sell personal data',
          'Service providers are contractually bound',
          'Law enforcement requests are reviewed individually',
          'Business transfers include data protection provisions'
        ]
      },
      {
        type: 'narrative',
        title: '4. Data security',
        body: 'We implement industry-standard security measures including encryption at rest and in transit, role-based access controls, and regular security assessments.',
        bullets: [
          'Encryption at rest and in transit',
          'Role-based access control',
          'Regular security assessments',
          'SOC 2 Type II audit program'
        ]
      },
      {
        type: 'narrative',
        title: '5. Your rights',
        body: 'Depending on your jurisdiction, you may have the right to access, correct, delete, or port your personal data. You may also opt out of marketing communications at any time.',
        bullets: [
          'Right to access your data',
          'Right to correction or deletion',
          'Right to data portability',
          'Right to opt out of marketing',
          'GDPR and CCPA rights honored'
        ]
      },
      {
        type: 'narrative',
        title: '6. Cookies and tracking',
        body: 'We use cookies and similar technologies for functionality, analytics, and marketing. You can manage cookie preferences through your browser settings.',
        bullets: [
          'Essential cookies for site functionality',
          'Analytics cookies for usage insights',
          'Marketing cookies for attribution'
        ]
      },
      {
        type: 'narrative',
        title: '7. Contact us',
        body: 'For privacy-related inquiries, contact us at privacy@cloudhygienecoach.com. We aim to respond within 30 days.',
        bullets: []
      }
    ]
  },
  '/terms': {
    eyebrow: 'Legal',
    title: 'Terms of Service',
    summary: 'Terms and conditions for using Cloud Hygiene Coach. Last updated: [Date — requires legal review].',
    hideLogoBar: true,
    sections: [
      {
        type: 'narrative',
        title: 'DRAFT — Pending Legal Review',
        body: 'These terms of service are a draft and are subject to final legal review before launch. They outline the intended contractual framework for Cloud Hygiene Coach.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '1. Acceptance of terms',
        body: 'By accessing or using Cloud Hygiene Coach, you agree to be bound by these Terms of Service and our Privacy Policy. If you are using the service on behalf of an organization, you represent that you have authority to bind that organization.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '2. Description of service',
        body: 'Cloud Hygiene Coach provides cloud governance, compliance monitoring, and remediation workflow tools delivered as a software-as-a-service platform. Features and availability may vary by subscription plan.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '3. Account responsibilities',
        body: 'You are responsible for maintaining the security of your account credentials, all activity under your account, and ensuring your use complies with applicable laws and regulations.',
        bullets: [
          'Maintain confidentiality of login credentials',
          'Notify us promptly of unauthorized access',
          'Accurate and current account information required'
        ]
      },
      {
        type: 'narrative',
        title: '4. Acceptable use',
        body: 'You agree not to misuse the service, attempt to gain unauthorized access to systems, interfere with other users, or use the service for unlawful purposes.',
        bullets: [
          'No unauthorized access attempts',
          'No interference with service operations',
          'No unlawful use or data processing',
          'No reverse engineering'
        ]
      },
      {
        type: 'narrative',
        title: '5. Intellectual property',
        body: 'Cloud Hygiene Coach and its content, features, and functionality are owned by BVG Solutions and are protected by copyright, trademark, and other intellectual property laws. Your data remains yours.',
        bullets: [
          'Service IP belongs to Cloud Hygiene Coach',
          'Customer data remains customer property',
          'Limited license granted for service use'
        ]
      },
      {
        type: 'narrative',
        title: '6. Payment and billing',
        body: 'Paid plans are billed in advance on a monthly or annual basis. Prices are subject to change with notice. Refund policies apply as described in your subscription agreement.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '7. Termination',
        body: 'Either party may terminate the agreement with written notice. Upon termination, your right to access the service ceases. We will make your data available for export for a reasonable period following termination.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '8. Limitation of liability',
        body: 'To the maximum extent permitted by law, Cloud Hygiene Coach shall not be liable for indirect, incidental, special, consequential, or punitive damages. Our total liability is limited to the amount paid for the service in the 12 months preceding the claim.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '9. Contact',
        body: 'For questions about these terms, contact us at legal@cloudhygienecoach.com.',
        bullets: []
      }
    ]
  },
  '/security': {
    eyebrow: 'Security',
    title: 'Security Practices',
    summary: 'Enterprise-grade security for your cloud governance data.',
    hideLogoBar: true,
    sections: [
      {
        type: 'narrative',
        title: 'Security first',
        body: 'Security is foundational to everything we build at Cloud Hygiene Coach.',
        bullets: [
          'SOC 2 Type II certified',
          'Encryption at rest and in transit',
          'Role-based access control',
          '24/7 security monitoring'
        ]
      }
    ]
  },
  '/company/contact': {
    eyebrow: 'Contact',
    title: 'Let\'s talk',
    summary: 'Whether you\'re evaluating, have questions, or just want to say hi.',
    hideLogoBar: true,
    sections: [
      {
        type: 'contact-section',
        title: 'Get in touch',
        subtitle: 'We typically respond within 24 hours.',
        options: [
          { icon: 'mail', label: 'Sales inquiries', value: 'sales@cloudhygienecoach.com', action: 'Email us', href: 'mailto:sales@cloudhygienecoach.com' },
          { icon: 'message', label: 'Support', value: 'support@cloudhygienecoach.com', action: 'Get help', href: 'mailto:support@cloudhygienecoach.com' },
          { icon: 'mail', label: 'Press & partnerships', value: 'press@cloudhygienecoach.com', action: 'Reach out', href: 'mailto:press@cloudhygienecoach.com' },
          { icon: 'map', label: 'Office', value: 'San Francisco, CA (Remote-first)', action: 'View on map', href: '#' }
        ]
      },
      {
        type: 'narrative',
        title: 'Enterprise inquiries',
        body: 'Looking for an executive briefing, security review, or procurement discussion? We\'ve got you covered.',
        bullets: ['Custom demos for your team', 'Security questionnaire support', 'Legal and procurement fast-track', 'Executive alignment sessions']
      },
      {
        type: 'quote',
        quote: 'The Cloud Hygiene Coach team was incredibly responsive during our evaluation. They understood our requirements and made procurement painless.',
        role: 'VP of IT',
        company: 'Enterprise Customer'
      }
    ]
  }
};

function usePathname() {
  const [pathname, setPathname] = useState(() => normalizePath(window.location.pathname));

  useEffect(() => {
    const handlePopState = () => setPathname(normalizePath(window.location.pathname));
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return [pathname, setPathname];
}

function normalizePath(path) {
  if (!path || path === '/') {
    return '/';
  }
  return path.endsWith('/') ? path.slice(0, -1) : path;
}

function SiteLink({ to, children, className }) {
  const { navigate } = useContext(NavigationContext);
  const isExternal = to.startsWith('http');

  if (isExternal) {
    return (
      <a className={className} href={to} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }

  return (
    <a
      className={className}
      href={to}
      onClick={(event) => {
        event.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}

function SiteLayout({ children, pathname }) {
  const { navigate } = useContext(NavigationContext);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="site">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <header className="nav">
        <div className="section-content nav-inner">
          <SiteLink to="/" className="logo">
            Cloud Hygiene Coach
          </SiteLink>
          <nav className="nav-links">
            {NAV_LINKS.map((link) => (
              <SiteLink key={link.href} to={link.href}>
                {link.label}
              </SiteLink>
            ))}
          </nav>
          <div className="nav-actions">
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle dark mode">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <SiteLink to="/login" className="btn btn-secondary nav-desktop-only">
              Sign in
            </SiteLink>
            <SiteLink to="/request-briefing" className="btn btn-primary nav-desktop-only">
              Request briefing
            </SiteLink>
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <XIcon size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <nav className="mobile-menu-nav">
              {NAV_LINKS.map((link) => (
                <SiteLink key={link.href} to={link.href} className="mobile-menu-link">
                  {link.label}
                </SiteLink>
              ))}
              <hr className="mobile-menu-divider" />
              <SiteLink to="/login" className="mobile-menu-link">
                Sign in
              </SiteLink>
              <SiteLink to="/request-briefing" className="btn btn-primary mobile-menu-cta">
                Request briefing
              </SiteLink>
            </nav>
          </div>
        )}
      </header>
      <main id="main-content" key={pathname} className="page-transition">{children}</main>
      <footer className="footer">
        <div className="section-content">
          <div className="footer-grid">
            <div className="footer-column">
              <strong>Platform</strong>
              <SiteLink to="/platform">Overview</SiteLink>
              <SiteLink to="/pricing">Pricing</SiteLink>
              <SiteLink to="/trust">Security</SiteLink>
            </div>
            <div className="footer-column">
              <strong>Resources</strong>
              <SiteLink to="/blog">Blog</SiteLink>
              <SiteLink to="/proof/case-studies">Case studies</SiteLink>
              <SiteLink to="/proof/roi">ROI</SiteLink>
            </div>
            <div className="footer-column">
              <strong>Company</strong>
              <SiteLink to="/company">About</SiteLink>
              <SiteLink to="/company/careers">Careers</SiteLink>
              <SiteLink to="/privacy">Privacy</SiteLink>
              <SiteLink to="/terms">Terms</SiteLink>
            </div>
            <div className="footer-column footer-contact">
              <strong>Contact</strong>
              <a href="mailto:hello@cloudhygienecoach.com">
                <Mail size={16} /> hello@cloudhygienecoach.com
              </a>
              <a href="mailto:support@cloudhygienecoach.com">
                <MessageCircle size={16} /> support@cloudhygienecoach.com
              </a>
              <div className="footer-social">
                <a href="https://linkedin.com/company/cloudhygienecoach" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                  <Linkedin size={20} />
                </a>
                <a href="https://twitter.com/cloudhygiene" target="_blank" rel="noreferrer" aria-label="Twitter">
                  <Twitter size={20} />
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copyright">
              © {new Date().getFullYear()} Cloud Hygiene Coach
            </div>
            <div className="footer-legal">
              <SiteLink to="/status">Status</SiteLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HomePage() {
  return (
    <>
      {/* ========== HERO SECTION ========== */}
      <section className="hero-section">
        <div className="hero-container">
          <h1 className="hero-headline">Cloud. Crystal clear.</h1>
          <p className="hero-description">
            See everything. Fix anything. Audit-ready, always.
          </p>
          <div className="hero-buttons">
            <SiteLink to="/request-briefing" className="btn btn-primary">
              Request briefing
            </SiteLink>
            <SiteLink to="/platform" className="btn btn-secondary">
              Learn more →
            </SiteLink>
          </div>
          
          {/* Hero Screenshot */}
          <div className="hero-screenshot">
            <div className="hero-screenshot-wrapper">
              <div className="hero-screenshot-placeholder"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== STATS SECTION ========== */}
      <section className="section-white">
        <div className="section-content">
          <div className="hero-stats">
            <ScrollReveal delay={0}>
              <div className="hero-stat-card">
                <div className="hero-stat-value">98%</div>
                <p>Asset ownership coverage</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={50}>
              <div className="hero-stat-card">
                <div className="hero-stat-value">40%</div>
                <p>Less audit prep time</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <div className="hero-stat-card">
                <div className="hero-stat-value">60%</div>
                <p>Fewer critical violations</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS SECTION ========== */}
      <section className="section-gray">
        <div className="section-content">
          <div className="how-it-works">
            <h2 className="how-it-works-title">How it works</h2>
            <div className="how-it-works-steps">
              <ScrollReveal delay={0}>
                <div className="step-card">
                  <div className="step-number">1</div>
                  <div className="step-icon"><Link size={32} /></div>
                  <h3>Connect</h3>
                  <p>Read-only API access to your AWS accounts. No agents, no infrastructure changes. Setup takes 5 minutes.</p>
                </div>
              </ScrollReveal>
              <div className="step-connector" />
              <ScrollReveal delay={100}>
                <div className="step-card">
                  <div className="step-number">2</div>
                  <div className="step-icon"><Search size={32} /></div>
                  <h3>Scan</h3>
                  <p>Continuous scanning across 200+ hygiene checks. Every resource tagged, every risk identified, every gap documented.</p>
                </div>
              </ScrollReveal>
              <div className="step-connector" />
              <ScrollReveal delay={200}>
                <div className="step-card">
                  <div className="step-number">3</div>
                  <div className="step-icon"><Wrench size={32} /></div>
                  <h3>Fix</h3>
                  <p>Prioritized findings with step-by-step remediation. Assign owners, track progress, capture evidence automatically.</p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ========== DASHBOARD SCREENSHOT SECTION ========== */}
      <section className="section-white">
        <div className="section-content">
          <div className="screenshot-section">
            <ScrollReveal direction="right">
              <div className="screenshot-content">
                <h2>See everything at a glance.</h2>
                <p>
                  Risk, compliance, and cost data in one view.
                </p>
                <ul>
                  <li><Check size={20} aria-hidden="true" /> Hygiene score with trend analysis</li>
                  <li><Check size={20} aria-hidden="true" /> Risk exposure by category</li>
                  <li><Check size={20} aria-hidden="true" /> Compliance readiness metrics</li>
                  <li><Check size={20} aria-hidden="true" /> Executive-ready reporting</li>
                </ul>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="left" delay={80}>
              <div className="screenshot-wrapper">
                <div className="screenshot-placeholder"></div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ========== FINDINGS SCREENSHOT SECTION ========== */}
      <section className="section-white">
        <div className="section-content">
          <div className="screenshot-section reverse">
            <ScrollReveal direction="left">
              <div className="screenshot-content">
                <h2>Know what's wrong.</h2>
                <p>
                  Prioritized findings with context and clear remediation paths.
                </p>
                <ul>
                  <li><Check size={20} aria-hidden="true" /> Prioritized by impact</li>
                  <li><Check size={20} aria-hidden="true" /> Framework-aligned</li>
                  <li><Check size={20} aria-hidden="true" /> One-click task creation</li>
                </ul>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={80}>
              <div className="screenshot-wrapper">
                <div className="screenshot-placeholder"></div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ========== TASKS SCREENSHOT SECTION ========== */}
      <section className="section-gray">
        <div className="section-content">
          <div className="screenshot-section">
            <ScrollReveal direction="right">
              <div className="screenshot-content">
                <h2>Fix it. Track it.</h2>
                <p>
                  Kanban workflows with ownership and evidence capture.
                </p>
                <ul>
                  <li><Check size={20} aria-hidden="true" /> Assign owners and due dates</li>
                  <li><Check size={20} aria-hidden="true" /> Step-by-step guides</li>
                  <li><Check size={20} aria-hidden="true" /> Automatic verification</li>
                </ul>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="left" delay={80}>
              <div className="screenshot-wrapper">
                <div className="screenshot-placeholder"></div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIAL SECTION ========== */}
      <section className="section-gray">
        <div className="section-content">
          <ScrollReveal direction="fade">
            <div className="quote-section">
              <p className="quote-text">
                "We replaced quarterly hygiene audits with weekly operational reporting 
                and cut audit prep time in half. Cloud Hygiene Coach transformed how 
                we govern our cloud infrastructure."
              </p>
              <div className="quote-attribution">
                <div className="quote-avatar" aria-hidden="true">VP</div>
                <div className="quote-info">
                  <div className="quote-name">VP of Engineering</div>
                  <div className="quote-role">Enterprise SaaS Company</div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <DarkCTA />
    </>
  );
}

// Icon mapping for pillar grids
const PILLAR_ICONS = {
  'Dashboard': LayoutDashboard, 'Findings': AlertTriangle, 'Tasks': CheckSquare,
  'Resources': Database, 'Reports': FileBarChart, 'Standards': Shield,
  'Settings': Settings, 'Platform operations': Building2, 'Visibility': Eye,
  'Execution': Target, 'Assurance': Award, 'Ownership coverage': Users,
  'Remediation cadence': Clock, 'Evidence discipline': BookOpen,
  'Policy enforcement': Lock, 'Executive dashboards': BarChart3,
  'Operational cadence': TrendingUp, 'Audit evidence': FileBarChart,
  'Access control': Lock, 'Data isolation': Layers, 'Monitoring': Activity,
  'Governance posture': Gauge, 'Accountability': Users, 'Evidence': BookOpen,
  'Risk triage': AlertTriangle, 'Remediation tasks': CheckSquare,
  'Validation checks': CheckCircle, 'Executive reporting': PieChart,
  'Framework alignment': Shield, 'Standards enforcement': Lock,
  'Exception handling': GitBranch, 'Evidence capture': BookOpen,
  'AWS': Cloud, 'Azure (roadmap)': Cloud, 'GCP (roadmap)': Cloud,
  'Naming & tagging': Layers, 'Ownership': Users, 'Lifecycle': Clock,
  'Environment separation': Server,
  // Platform technical sections
  'Compute': Cpu, 'Storage': HardDrive, 'Identity': Key, 'Network': Network,
  'Data': Database, 'Cost': DollarSign, 'Multi-tenancy': Building2,
  'SSO & RBAC': Fingerprint, 'API-first': Link, 'SOC 2 Type II': Shield,
  'default': Lightbulb
};

const ICON_COLORS = ['feature-icon-blue', 'feature-icon-green', 'feature-icon-purple',
  'feature-icon-orange', 'feature-icon-teal', 'feature-icon-indigo'];

function DarkCTA({ headline = "Ready to transform your cloud governance?",
  description = "Get a personalized briefing on how Cloud Hygiene Coach can help your organization.",
  primaryHref = "/request-briefing", secondaryHref = "/platform" }) {
  return (
    <section className="section-dark">
      <div className="section-content">
        <ScrollReveal direction="fade">
          <div className="dark-cta">
            <h2 className="dark-cta-headline">{headline}</h2>
            <p className="dark-cta-description">{description}</p>
            <div className="dark-cta-buttons">
              <SiteLink to={primaryHref} className="btn btn-dark">Request briefing <ArrowRight size={18} /></SiteLink>
              <SiteLink to={secondaryHref} className="btn btn-dark-outline">Explore platform</SiteLink>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function SectionRenderer({ section }) {
  if (section.type === 'narrative') {
    return (
      <div className="content-block">
        <h2 className="content-block-title">{section.title}</h2>
        <p className="content-block-body">{section.body}</p>
        {section.bullets && (
          <ul className="check-list">
            {section.bullets.map((item) => (
              <li key={item}><Check size={18} aria-hidden="true" /> {item}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  if (section.type === 'screenshot') {
    return (
      <div className={`screenshot-section ${section.reverse ? 'reverse' : ''}`}>
        <div className="screenshot-content">
          <h2>{section.title}</h2>
          <p>{section.body}</p>
          {section.bullets && (
            <ul>
              {section.bullets.map((item) => (
                <li key={item}><Check size={20} aria-hidden="true" /> {item}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="screenshot-wrapper">
          <div className="screenshot-placeholder"></div>
        </div>
      </div>
    );
  }

  if (section.type === 'pillar-grid') {
    return (
      <div className="content-block">
        <h2 className="content-block-title">{section.title}</h2>
        <div className="grid pillar-grid-equal">
          {section.cards.map((card, index) => {
            const IconComp = PILLAR_ICONS[card.title] || PILLAR_ICONS['default'];
            return (
              <div key={card.title} className="card feature-card">
                <div className={`feature-icon ${ICON_COLORS[index % ICON_COLORS.length]}`}>
                  <IconComp size={24} />
                </div>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (section.type === 'timeline') {
    return (
      <div className="content-block">
        <h2 className="content-block-title">{section.title}</h2>
        <div className="timeline-enhanced">
          {section.steps.map((step, index) => (
            <div key={step.title} className="timeline-step">
              <div className="timeline-marker">
                <span className="timeline-number">{index + 1}</span>
                {index < section.steps.length - 1 && <div className="timeline-connector" />}
              </div>
              <div className="timeline-content">
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section.type === 'stat-grid') {
    return (
      <div className="content-block">
        <h2 className="content-block-title">{section.title}</h2>
        <div className="hero-stats">
          {section.stats.map((stat) => (
            <div key={stat.label} className="hero-stat-card">
              <h3>{stat.value}</h3>
              <p>{stat.detail || stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section.type === 'quote') {
    const displayName = section.name || section.attribution || section.role || 'Enterprise Customer';
    const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2);
    return (
      <div className="content-block">
        <div className="quote-section-enhanced">
          <div className="quote-mark" aria-hidden="true">"</div>
          <blockquote className="quote-text-large">{section.quote}</blockquote>
          <div className="quote-attribution-enhanced">
            <div className="quote-avatar-large" aria-hidden="true">{initials}</div>
            <div className="quote-info">
              {section.name && <div className="quote-name">{section.name}</div>}
              <div className="quote-role">{section.role || 'Enterprise Customer'}</div>
              {section.company && <div className="quote-company">{section.company}</div>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (section.type === 'case-study-grid') {
    return (
      <div className="content-block">
        <h2 className="content-block-title">{section.title}</h2>
        <div className="case-study-grid">
          {section.stories.map((story, index) => (
            <div key={story.title} className="case-study-card">
              <div className="case-study-logo">
                <div className="logo-placeholder-small">{story.title.charAt(0)}</div>
              </div>
              <h3>{story.title}</h3>
              <p>{story.body}</p>
              {story.result && (
                <div className="case-study-result">
                  <span className="result-value">{story.result.value}</span>
                  <span className="result-label">{story.result.label}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section.type === 'integration-badges') {
    const cloudColors = {
      'AWS': '#FF9900',
      'Azure': '#0078D4',
      'GCP': '#4285F4',
      'Slack': '#4A154B',
      'Jira': '#0052CC',
      'GitHub': '#181717'
    };
    return (
      <div className="content-block">
        <h2 className="content-block-title">{section.title}</h2>
        <div className="integration-badges">
          {section.badges.map((badge) => (
            <div key={badge.name} className={`integration-badge ${badge.status === 'roadmap' ? 'roadmap' : ''}`}>
              <div className="badge-icon" style={{ background: badge.status === 'roadmap' ? '#e5e5e7' : (cloudColors[badge.name] || '#1d1d1f') }}>
                <Cloud size={28} color="#ffffff" />
              </div>
              <div className="badge-info">
                <span className="badge-name">{badge.name}</span>
                {badge.status === 'roadmap' && <span className="badge-status">Coming soon</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section.type === 'trust-badges') {
    return (
      <div className="content-block">
        <h2 className="content-block-title">{section.title}</h2>
        <div className="trust-badges">
          {section.badges.map((badge) => (
            <div key={badge.name} className="trust-badge">
              <Shield size={40} />
              <span className="trust-badge-name">{badge.name}</span>
              <span className="trust-badge-detail">{badge.detail}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ========== STARTUP-STYLE COMPANY SECTIONS ==========

  if (section.type === 'mission-hero') {
    return (
      <div className="mission-hero">
        <h2 className="mission-statement">{section.mission}</h2>
        {section.subtitle && <p className="mission-subtitle">{section.subtitle}</p>}
      </div>
    );
  }

  if (section.type === 'origin-story') {
    return (
      <div className="origin-story">
        <div className="origin-story-content">
          <h2 className="origin-title">{section.title}</h2>
          <div className="origin-text">
            {section.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {section.signature && (
            <div className="origin-signature">
              <span className="signature-name">{section.signature.name}</span>
              <span className="signature-role">{section.signature.role}</span>
            </div>
          )}
        </div>
        <div className="origin-image">
          <div className="origin-image-placeholder">
            {section.imagePlaceholder || 'Founder Photo'}
          </div>
        </div>
      </div>
    );
  }

  if (section.type === 'values-grid') {
    const valueIcons = { 
      rocket: Rocket, heart: Heart, target: Target, zap: Zap, 
      compass: Compass, flame: Flame, sparkles: Sparkles, users: Users 
    };
    return (
      <div className="content-block">
        <h2 className="content-block-title">{section.title}</h2>
        {section.subtitle && <p className="values-subtitle">{section.subtitle}</p>}
        <div className="values-grid">
          {section.values.map((value, index) => {
            const IconComp = valueIcons[value.icon] || Sparkles;
            return (
              <div key={value.name} className="value-card">
                <div className="value-icon">
                  <IconComp size={28} />
                </div>
                <h3 className="value-name">{value.name}</h3>
                <p className="value-description">{value.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (section.type === 'team-grid') {
    return (
      <div className="content-block">
        <h2 className="content-block-title">{section.title}</h2>
        {section.subtitle && <p className="team-subtitle">{section.subtitle}</p>}
        <div className="team-grid">
          {section.members.map((member) => (
            <div key={member.name} className="team-card">
              <div className="team-photo">
                <div className="team-photo-placeholder">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
              </div>
              <h3 className="team-name">{member.name}</h3>
              <span className="team-role">{member.role}</span>
              {member.bio && <p className="team-bio">{member.bio}</p>}
              {member.funFact && <p className="team-fun-fact">"{member.funFact}"</p>}
              <div className="team-social">
                {member.linkedin && (
                  <a href={member.linkedin} target="_blank" rel="noreferrer" className="social-link">
                    <Linkedin size={18} />
                  </a>
                )}
                {member.twitter && (
                  <a href={member.twitter} target="_blank" rel="noreferrer" className="social-link">
                    <Twitter size={18} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section.type === 'culture-section') {
    return (
      <div className="culture-section">
        <div className="culture-content">
          <span className="eyebrow">{section.eyebrow || 'How We Work'}</span>
          <h2>{section.title}</h2>
          <p>{section.description}</p>
          <div className="culture-perks">
            {section.perks.map((perk) => (
              <div key={perk} className="culture-perk">
                <Check size={18} /> {perk}
              </div>
            ))}
          </div>
        </div>
        <div className="culture-image">
          <div className="culture-image-placeholder">
            {section.imagePlaceholder || 'Team Culture Photo'}
          </div>
        </div>
      </div>
    );
  }

  if (section.type === 'investors-bar') {
    return (
      <div className="investors-section">
        <span className="investors-label">{section.label || 'Backed by'}</span>
        <div className="investors-logos">
          {section.investors.map((investor) => (
            <div key={investor} className="investor-logo">
              {investor}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section.type === 'metrics-bar') {
    return (
      <div className="metrics-bar">
        {section.metrics.map((metric) => (
          <div key={metric.label} className="metric-item">
            <span className="metric-value">{metric.value}</span>
            <span className="metric-label">{metric.label}</span>
          </div>
        ))}
      </div>
    );
  }

  if (section.type === 'hiring-cta') {
    return (
      <div className="hiring-cta">
        <div className="hiring-badge">
          <PartyPopper size={20} /> We're hiring!
        </div>
        <h2>{section.title}</h2>
        <p>{section.description}</p>
        <div className="hiring-stats">
          {section.openRoles && (
            <span className="open-roles">{section.openRoles} open roles</span>
          )}
        </div>
        <SiteLink to={section.href || '/company/careers'} className="btn btn-primary">
          View open positions <ArrowRight size={18} />
        </SiteLink>
      </div>
    );
  }

  if (section.type === 'contact-section') {
    return (
      <div className="contact-section">
        <h2>{section.title}</h2>
        <p className="contact-subtitle">{section.subtitle}</p>
        <div className="contact-options">
          {section.options.map((option) => {
            const icons = { mail: Mail, map: MapPin, message: MessageCircle, globe: Globe };
            const IconComp = icons[option.icon] || Mail;
            return (
              <div key={option.label} className="contact-option">
                <div className="contact-icon">
                  <IconComp size={24} />
                </div>
                <h3>{option.label}</h3>
                <p>{option.value}</p>
                {option.action && (
                  <a href={option.href} className="contact-action">{option.action}</a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (section.type === 'cta') {
    return null;
  }

  return null;
}

function ContentPage({ page, pathname }) {
  // Smart secondary CTA - context-aware linking
  const getSecondaryCTA = () => {
    if (pathname === '/platform') {
      return { label: 'View integrations →', href: '/platform/integrations' };
    }
    if (pathname === '/platform/integrations') {
      return { label: 'See pricing →', href: '/pricing' };
    }
    if (pathname?.startsWith('/platform/')) {
      return { label: 'Explore platform →', href: '/platform' };
    }
    if (pathname?.startsWith('/outcomes/') || pathname?.startsWith('/roles/')) {
      return { label: 'See how it works →', href: '/platform' };
    }
    return { label: 'Explore platform →', href: '/platform' };
  };
  const secondaryCTA = getSecondaryCTA();

  return (
    <>
      <section className="content-page-hero">
        <div className="section-content">
          <div className="content-page-header">
            <h1 className="content-page-title">{page.title}</h1>
            <p className="content-page-summary">{page.summary}</p>
            <div className="hero-buttons">
              <SiteLink to={DEFAULT_CTA.primary.href} className="btn btn-primary">
                Request briefing
              </SiteLink>
              <SiteLink to={secondaryCTA.href} className="btn btn-secondary">
                {secondaryCTA.label}
              </SiteLink>
            </div>
          </div>
          
          {/* Hero Screenshot (optional) */}
          {page.heroScreenshot && (
            <div className="content-hero-screenshot">
              <div className="hero-screenshot-wrapper">
                <div className="hero-screenshot-placeholder"></div>
              </div>
            </div>
          )}
          
          {/* KPI Stats - Apple style (no cards) */}
          {page.heroKpis && page.heroKpis.length > 0 && (
            <div className="hero-stats" style={{ marginTop: '80px' }}>
              {page.heroKpis.map((kpi) => (
                <div key={kpi.label + kpi.value} className="hero-stat-card">
                  <h3>{kpi.value}</h3>
                  <p>{kpi.detail}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      
      {page.sections.map((section, index) => (
        <section key={section.title || index} className={index % 2 === 0 ? 'section-gray' : 'section-white'}>
          <div className="section-content">
            <SectionRenderer section={section} sectionIndex={index} />
          </div>
        </section>
      ))}
      <DarkCTA />
    </>
  );
}

const CAMPAIGN_ICONS = {
  'cloud-hygiene-score': Gauge,
  'cio-risk-reduction': Shield,
  'ciso-audit-readiness': FileBarChart,
  'devops-efficiency': Zap
};

function CampaignsIndex() {
  return (
    <>
      <section className="content-page-hero">
        <div className="section-content">
          <div className="content-page-header">
            <h1 className="content-page-title">Campaigns</h1>
            <p className="content-page-summary">
              Targeted solutions for enterprise governance challenges.
            </p>
          </div>
        </div>
      </section>
      <section className="section-white">
        <div className="section-content">
          <div className="grid">
            {CAMPAIGNS.map((campaign, index) => {
              const IconComp = CAMPAIGN_ICONS[campaign.slug] || Target;
              return (
                <div key={campaign.slug} className="card feature-card">
                  <div className={`feature-icon ${ICON_COLORS[index % ICON_COLORS.length]}`}>
                    <IconComp size={24} />
                  </div>
                  <h3>{campaign.title}</h3>
                  <p>{campaign.summary}</p>
                  <SiteLink to={`/campaigns/${campaign.slug}`} className="pill">
                    View campaign <ArrowRight size={14} />
                  </SiteLink>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <DarkCTA headline="Ready to run a targeted campaign?" 
               description="Get a customized briefing aligned to your specific governance challenges." />
    </>
  );
}

function CampaignLanding({ campaign }) {
  return (
    <>
      <section className="content-page-hero">
        <div className="section-content">
          <div className="content-page-header">
            <h1 className="content-page-title">{campaign.title}</h1>
            <p className="content-page-summary">{campaign.summary}</p>
            <div className="hero-buttons">
              <SiteLink to="/request-briefing" className="btn btn-primary">
                Request briefing
              </SiteLink>
              <SiteLink to="/campaigns" className="btn btn-secondary">
                All campaigns →
              </SiteLink>
            </div>
          </div>
        </div>
      </section>
      <section className="section-white">
        <div className="section-content">
          <div className="grid">
            <div className="card feature-card">
              <div className="feature-icon feature-icon-green">
                <Target size={24} />
              </div>
              <h3>Outcomes</h3>
              <ul className="check-list">
                {campaign.outcomes.map((item) => (
                  <li key={item}><Check size={18} /> {item}</li>
                ))}
              </ul>
            </div>
            <div className="card feature-card">
              <div className="feature-icon feature-icon-blue">
                <TrendingUp size={24} />
              </div>
              <h3>Impact metrics</h3>
              <ul className="check-list">
                {campaign.metrics.map((metric) => (
                  <li key={metric}><Check size={18} /> {metric}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section className="section-gray">
        <div className="section-content">
          <h2 className="content-block-title">Executive narrative</h2>
          <div className="grid">
            {campaign.sections.map((section, index) => (
              <div key={section.title} className="card feature-card">
                <div className={`feature-icon ${ICON_COLORS[index % ICON_COLORS.length]}`}>
                  <Lightbulb size={24} />
                </div>
                <h3>{section.title}</h3>
                <p>{section.body}</p>
                <ul className="check-list">
                  {section.bullets.map((item) => (
                    <li key={item}><Check size={18} /> {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
      <DarkCTA headline={`Ready to ${campaign.title.toLowerCase()}?`}
               description="Get a customized briefing for your organization's specific needs." />
    </>
  );
}

function RequestBriefing() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    role: 'CIO',
    clouds: 'AWS',
    size: '1-50',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validate required fields
    if (!formData.email || !formData.fullName) {
      setError('Please fill in your name and email.');
      return;
    }
    
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      trackEvent('signup_form_submit', {
        role: formData.role,
        company_size: formData.size,
        primary_cloud: formData.clouds
      });
      
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      await handoffRedirect({
        email: formData.email,
        firstName,
        lastName,
        company: formData.company,
        extraAttribution: {
          formRole: formData.role,
          formCompanySize: formData.size,
          formPrimaryCloud: formData.clouds,
          formNotes: formData.notes || null,
          marketingSource: 'request_briefing_form',
        },
        destination: '/welcome',
      });
    } catch (err) {
      setError('Something went wrong. Please try again or contact support@cloudhygienecoach.com.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="content-page-hero" style={{ paddingBottom: '80px' }}>
      <div className="section-content">
        <div className="content-page-header">
          <h1 className="content-page-title">Request a briefing</h1>
          <p className="content-page-summary">
            Tell us about your governance goals. We'll follow up within one business day.
          </p>
        </div>
        <form className="form-card" onSubmit={handleSubmit}>
          {error && (
            <div className="form-error" role="alert" style={{ 
              background: '#fef2f2', 
              border: '1px solid #fecaca', 
              borderRadius: '8px', 
              padding: '12px 16px', 
              marginBottom: '20px',
              color: '#dc2626',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
          <div className="form-grid">
            <div>
              <label htmlFor="fullName">Full name *</label>
              <input 
                id="fullName" 
                placeholder="Alex Morgan" 
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="email">Work email *</label>
              <input 
                id="email" 
                placeholder="alex@company.com" 
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="company">Company</label>
              <input 
                id="company" 
                placeholder="Enterprise Corp"
                value={formData.company}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="role">Role</label>
              <select id="role" value={formData.role} onChange={handleChange}>
                <option>CIO</option>
                <option>CISO</option>
                <option>CTO</option>
                <option>VP Engineering</option>
                <option>Director / Manager</option>
              </select>
            </div>
            <div>
              <label htmlFor="clouds">Primary cloud</label>
              <select id="clouds" value={formData.clouds} onChange={handleChange}>
                <option>AWS</option>
                <option>Azure</option>
                <option>GCP</option>
                <option>Multi-cloud</option>
              </select>
            </div>
            <div>
              <label htmlFor="size">Company size</label>
              <select id="size" value={formData.size} onChange={handleChange}>
                <option>1-50</option>
                <option>51-200</option>
                <option>201-1000</option>
                <option>1000+</option>
              </select>
            </div>
          </div>
          <div className="form-textarea-wrapper">
            <label htmlFor="notes">What are you hoping to achieve?</label>
            <textarea 
              id="notes" 
              rows="3" 
              placeholder="Tell us about your cloud governance goals..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
          <button 
            className="btn btn-primary" 
            type="submit"
            disabled={isSubmitting}
            style={{ opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? 'Submitting...' : 'Request briefing'}
          </button>
        </form>
      </div>
    </section>
  );
}

function AuthRedirect({ mode }) {
  const [redirecting, setRedirecting] = useState(true);
  
  useEffect(() => {
    // Small delay to show loading state (smoother UX)
    const timer = setTimeout(async () => {
      if (mode === 'signup') {
        // Use handoff flow for signup to preserve attribution
        await handoffRedirect({
          extraAttribution: {
            marketingSource: 'auth_redirect',
            entryPath: '/signup',
          },
          destination: '/welcome',
        });
      } else {
        // Direct navigation for login
        navigateToApp('/login', {});
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [mode]);
  
  // Show a brief loading state while redirecting
  return (
    <section className="content-page-hero">
      <div className="section-content">
        <div className="content-page-header" style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            border: '3px solid #e5e7eb',
            borderTopColor: '#10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }} />
          <h1 className="content-page-title">
            {mode === 'login' ? 'Redirecting to sign in...' : 'Redirecting to sign up...'}
          </h1>
          <p className="content-page-summary">
            Taking you to Cloud Hygiene Coach
          </p>
          <noscript>
            <div style={{ marginTop: '24px' }}>
              <a href={`${APP_URL}/${mode === 'login' ? 'login' : 'signup'}`} className="btn btn-primary">
                Continue to {mode === 'login' ? 'Sign In' : 'Sign Up'}
              </a>
            </div>
          </noscript>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}

// ========== PRICING PAGE ==========
const PRICING_TIERS = [
  {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'For teams getting started with cloud governance.',
    features: [
      'Up to 100 cloud resources',
      '1 AWS account',
      '2 compliance frameworks',
      'Weekly scans',
      'Community support'
    ],
    cta: 'Get started',
    ctaHref: '/request-briefing',
    highlighted: false
  },
  {
    name: 'Pro',
    monthlyPrice: 499,
    annualPrice: 399,
    description: 'For growing teams with serious compliance needs.',
    features: [
      'Up to 5,000 cloud resources',
      '10 AWS accounts',
      'All compliance frameworks',
      'Daily scans',
      'Slack & Teams integration',
      'Custom rules',
      'Priority support'
    ],
    cta: 'Request briefing',
    ctaHref: '/request-briefing',
    highlighted: true
  },
  {
    name: 'Enterprise',
    monthlyPrice: 1499,
    annualPrice: 1199,
    description: 'For organizations with complex multi-cloud environments.',
    features: [
      'Unlimited resources',
      'Unlimited accounts',
      'Multi-cloud support',
      'Real-time scanning',
      'SSO & RBAC',
      'Full API access',
      'Priority support',
      '99.9% SLA'
    ],
    cta: 'Request briefing',
    ctaHref: '/request-briefing',
    highlighted: false
  }
];

const FEATURE_COMPARISON = [
  { category: 'Usage', features: [
    { name: 'Cloud resources', free: '100', pro: '5,000', enterprise: 'Unlimited' },
    { name: 'AWS accounts', free: '1', pro: '10', enterprise: 'Unlimited' },
    { name: 'Team members', free: '3', pro: '25', enterprise: 'Unlimited' },
    { name: 'Data retention', free: '30 days', pro: '1 year', enterprise: 'Custom' },
  ]},
  { category: 'Scanning & Detection', features: [
    { name: 'Scan frequency', free: 'Weekly', pro: 'Daily', enterprise: 'Real-time' },
    { name: 'Compliance frameworks', free: '2', pro: 'All (10+)', enterprise: 'All + Custom' },
    { name: 'Built-in controls', free: '50', pro: '200+', enterprise: '200+ + Custom' },
    { name: 'Custom rules', free: false, pro: true, enterprise: true },
    { name: 'Multi-cloud (Azure, GCP)', free: false, pro: false, enterprise: true },
  ]},
  { category: 'Remediation', features: [
    { name: 'Task management', free: true, pro: true, enterprise: true },
    { name: 'Auto-assignment', free: false, pro: true, enterprise: true },
    { name: 'SLA tracking', free: false, pro: true, enterprise: true },
    { name: 'Escalation rules', free: false, pro: false, enterprise: true },
  ]},
  { category: 'Reporting & Evidence', features: [
    { name: 'Executive dashboards', free: true, pro: true, enterprise: true },
    { name: 'PDF/CSV exports', free: true, pro: true, enterprise: true },
    { name: 'Audit evidence packages', free: false, pro: true, enterprise: true },
    { name: 'Custom reports', free: false, pro: false, enterprise: true },
    { name: 'White-label reports', free: false, pro: false, enterprise: true },
  ]},
  { category: 'Integrations', features: [
    { name: 'Slack notifications', free: false, pro: true, enterprise: true },
    { name: 'Microsoft Teams', free: false, pro: true, enterprise: true },
    { name: 'Jira integration', free: false, pro: true, enterprise: true },
    { name: 'REST API access', free: false, pro: 'Read-only', enterprise: 'Full access' },
    { name: 'Webhooks', free: false, pro: true, enterprise: true },
  ]},
  { category: 'Security & Admin', features: [
    { name: 'SSO (SAML/OIDC)', free: false, pro: false, enterprise: true },
    { name: 'RBAC', free: false, pro: 'Basic', enterprise: 'Advanced' },
    { name: 'Audit logs', free: false, pro: '90 days', enterprise: 'Unlimited' },
    { name: 'IP allowlisting', free: false, pro: false, enterprise: true },
  ]},
  { category: 'Support', features: [
    { name: 'Community support', free: true, pro: true, enterprise: true },
    { name: 'Email support', free: false, pro: true, enterprise: true },
    { name: 'Priority support', free: false, pro: true, enterprise: true },
    { name: 'Dedicated CSM', free: false, pro: false, enterprise: true },
    { name: 'Custom SLA', free: false, pro: false, enterprise: true },
    { name: 'Security review', free: false, pro: false, enterprise: true },
  ]},
];

const PRICING_FAQS = [
  {
    question: 'Is there a free trial?',
    answer: 'Yes. All paid plans include a 14-day free trial with full access. No credit card required to start.'
  },
  {
    question: 'Can I change plans later?',
    answer: 'Absolutely. Upgrade or downgrade anytime. When upgrading, you get immediate access to new features. When downgrading, changes take effect at your next billing cycle.'
  },
  {
    question: 'What happens if I exceed my resource limits?',
    answer: 'We will notify you when you reach 80% of your limit. If you exceed it, scanning continues but new resources are queued until you upgrade or remove resources.'
  },
  {
    question: 'Do you offer discounts for startups or nonprofits?',
    answer: 'Yes. We offer 50% off for verified startups (under $5M funding) and nonprofits. Contact sales to apply.'
  },
  {
    question: 'How does annual billing work?',
    answer: 'Annual plans are billed upfront for the full year and include a 20% discount compared to monthly billing. You can cancel anytime, but refunds are prorated.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, ACH transfers, and wire transfers for Enterprise plans. Invoicing is available for annual plans over $5,000.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes. We are SOC 2 Type II certified and encrypt all data at rest and in transit. We never store your cloud credentials—we use read-only IAM roles with least-privilege access.'
  },
  {
    question: 'Can I get a demo before purchasing?',
    answer: 'Of course. Contact our sales team for a personalized demo tailored to your cloud environment and compliance requirements.'
  }
];

const TRUST_LOGOS = [];

function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const formatPrice = (tier) => {
    if (tier.monthlyPrice === null) return 'Custom';
    if (tier.monthlyPrice === 0) return '$0';
    const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
    return `$${price}`;
  };

  const renderFeatureValue = (value) => {
    if (value === true) return <Check size={18} className="feature-check" />;
    if (value === false) return <Minus size={18} className="feature-none" />;
    return <span>{value}</span>;
  };

  return (
    <>
      {/* Hero + Cards combined */}
      <section className="content-page-hero pricing-hero">
        <div className="section-content">
          <div className="content-page-header">
            <h1 className="content-page-title">Simple, transparent pricing.</h1>
            <p className="content-page-summary">Transparent pricing. Scale as you grow. No surprises.</p>
          </div>
          
          {/* Billing Toggle */}
          <div className="billing-toggle">
            <span className={!isAnnual ? 'active' : ''}>Monthly</span>
            <button 
              className={`toggle-switch ${isAnnual ? 'active' : ''}`}
              onClick={() => setIsAnnual(!isAnnual)}
              aria-label="Toggle annual billing"
            >
              <span className="toggle-slider" />
            </button>
            <span className={isAnnual ? 'active' : ''}>Annual</span>
            <span className="save-badge">Save 20%</span>
          </div>

          {/* Pricing Cards */}
          <div className="pricing-grid" style={{ marginTop: '60px' }}>
            {PRICING_TIERS.map((tier) => (
              <div key={tier.name} className={`pricing-card ${tier.highlighted ? 'pricing-card-highlighted' : ''}`}>
                {tier.highlighted && <span className="pricing-badge">Most popular</span>}
                <h3 className="pricing-tier-name">{tier.name}</h3>
                <div className="pricing-price">
                  <span className="pricing-amount">{formatPrice(tier)}</span>
                  {tier.monthlyPrice !== null && tier.monthlyPrice > 0 && (
                    <span className="pricing-period">/month</span>
                  )}
                </div>
                {isAnnual && tier.monthlyPrice > 0 && (
                  <p className="pricing-billed">Billed annually (${tier.annualPrice * 12}/year)</p>
                )}
                <p className="pricing-description">{tier.description}</p>
                <ul className="pricing-features">
                  {tier.features.map((feature) => (
                    <li key={feature}><Check size={16} /> {feature}</li>
                  ))}
                </ul>
                <SiteLink to={tier.ctaHref} className={`btn ${tier.highlighted ? 'btn-primary' : 'btn-secondary'}`}>
                  {tier.cta}
                </SiteLink>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Logos */}
      <section className="section-gray">
        <div className="section-content">
          <div className="pricing-trust">
            <div className="pricing-trust-badges">
              <div className="trust-badge-item">
                <Shield size={20} />
                <span>SOC 2 Type II</span>
              </div>
              <div className="trust-badge-item">
                <Shield size={20} />
                <span>ISO 27001</span>
              </div>
              <div className="trust-badge-item">
                <Shield size={20} />
                <span>GDPR Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="section-white">
        <div className="section-content">
          <div className="comparison-header">
            <h2 className="content-block-title">Compare plans in detail.</h2>
            <p className="content-block-body">Everything you need to know about what is included.</p>
          </div>
          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Features</th>
                  <th>Free</th>
                  <th className="highlighted-col">Pro</th>
                  <th>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {FEATURE_COMPARISON.map((category) => (
                  <Fragment key={category.category}>
                    <tr className="category-row">
                      <td colSpan={4}>{category.category}</td>
                    </tr>
                    {category.features.map((feature) => (
                      <tr key={feature.name}>
                        <td className="feature-name">{feature.name}</td>
                        <td>{renderFeatureValue(feature.free)}</td>
                        <td className="highlighted-col">{renderFeatureValue(feature.pro)}</td>
                        <td>{renderFeatureValue(feature.enterprise)}</td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Enterprise Callout */}
      <section className="section-gray">
        <div className="section-content">
          <div className="enterprise-callout">
            <div className="enterprise-callout-content">
              <h2 className="content-block-title">Built for enterprise scale.</h2>
              <p className="content-block-body">
                Get started with a free plan. Upgrade when you are ready for enterprise features.
              </p>
              <ul className="enterprise-benefits">
                <li><Check size={18} /> Unlimited resources and accounts</li>
                <li><Check size={18} /> Multi-cloud support (AWS, Azure, GCP)</li>
                <li><Check size={18} /> SSO with your identity provider</li>
                <li><Check size={18} /> Full API access for automation</li>
                <li><Check size={18} /> Priority support with 99.9% SLA</li>
                <li><Check size={18} /> SOC 2 Type II compliance report</li>
              </ul>
              <div className="hero-buttons">
                <SiteLink to="/request-briefing" className="btn btn-primary">Request briefing</SiteLink>
                <SiteLink to="/trust" className="btn btn-secondary">View security docs →</SiteLink>
              </div>
            </div>
            <div className="enterprise-callout-visual">
              <div className="enterprise-visual-placeholder"></div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-white">
        <div className="section-content">
          <div className="faq-header">
            <h2 className="content-block-title">Frequently asked questions.</h2>
            <p className="content-block-body">Everything you need to know about pricing and billing.</p>
          </div>
          <div className="faq-grid">
            {PRICING_FAQS.map((faq, index) => (
              <div key={index} className={`faq-item ${expandedFaq === index ? 'expanded' : ''}`}>
                <button
                  className="faq-question"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  aria-expanded={expandedFaq === index}
                  type="button"
                >
                  <span>{faq.question}</span>
                  <ChevronDown size={20} className="faq-icon" aria-hidden="true" />
                </button>
                <div className="faq-answer" role="region">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <DarkCTA 
        headline="Ready to see it in action?" 
        description="Request a briefing and we'll walk you through the platform." 
      />
    </>
  );
}

// ========== BLOG PAGE ==========
const BLOG_POSTS = [
  {
    slug: 'cloud-governance-2026',
    title: 'The State of Cloud Governance in 2026',
    excerpt: 'Why 73% of enterprises still struggle with cloud compliance—and what the leaders are doing differently.',
    date: '2026-01-15',
    author: 'Sarah Chen',
    category: 'Industry',
    readTime: '8 min',
    content: [
      { type: 'paragraph', text: 'Cloud governance has evolved dramatically over the past five years, yet most enterprises are still playing catch-up. According to recent industry surveys, 73% of organizations report significant gaps in their cloud compliance posture—a number that has barely budged since 2023.' },
      { type: 'heading', text: 'The Compliance Gap Is Growing' },
      { type: 'paragraph', text: 'The challenge is not a lack of tools. The average enterprise now deploys 7-12 different security and compliance tools across their cloud infrastructure. The problem is fragmentation. Each tool generates its own alerts, its own dashboards, and its own definition of "compliant."' },
      { type: 'paragraph', text: 'Meanwhile, cloud environments are growing more complex. Multi-account architectures, containerized workloads, and serverless functions have exploded in popularity—each bringing new governance challenges that legacy tools were never designed to handle.' },
      { type: 'heading', text: 'What Leaders Are Doing Differently' },
      { type: 'paragraph', text: 'The organizations that have cracked the code share three common characteristics:' },
      { type: 'list', items: ['They treat governance as a continuous process, not a point-in-time audit', 'They have clear ownership for every cloud resource', 'They automate remediation, not just detection'] },
      { type: 'paragraph', text: 'These leaders have moved beyond the "detect and alert" model that dominated the 2010s. Instead, they have built closed-loop systems where findings are automatically assigned to owners, tracked to resolution, and verified through re-scanning.' },
      { type: 'heading', text: 'The Path Forward' },
      { type: 'paragraph', text: 'If your organization is part of the 73% still struggling with cloud compliance, the solution is not another tool—it is a better operating model. Start by mapping ownership across your cloud estate. Then build workflows that connect detection to remediation to verification.' },
      { type: 'paragraph', text: 'The technology exists to make cloud governance automatic. The question is whether your organization is ready to adopt it.' }
    ]
  },
  {
    slug: 'soc2-without-pain',
    title: 'SOC 2 Without the Pain',
    excerpt: 'How modern teams are cutting audit prep time from weeks to hours with continuous compliance.',
    date: '2026-01-08',
    author: 'Marcus Johnson',
    category: 'Compliance',
    readTime: '6 min',
    content: [
      { type: 'paragraph', text: 'SOC 2 audits have a reputation for being painful. Engineering teams dread the annual scramble to collect evidence, security teams spend weeks preparing documentation, and everyone holds their breath waiting for the auditor findings.' },
      { type: 'paragraph', text: 'But it does not have to be this way. A growing number of companies are completing SOC 2 audits with minimal disruption—some in as little as a few hours of actual preparation time. Here is how they do it.' },
      { type: 'heading', text: 'The Old Way vs. The New Way' },
      { type: 'paragraph', text: 'Traditional SOC 2 preparation looks something like this: three months before the audit, someone creates a massive spreadsheet mapping controls to evidence. Teams scramble to take screenshots, export logs, and document procedures that may or may not reflect reality.' },
      { type: 'paragraph', text: 'The new approach flips this model entirely. Instead of preparing for audits, leading teams maintain continuous compliance. Every control is monitored in real-time. Evidence is collected automatically. When the auditor arrives, the documentation is already complete.' },
      { type: 'heading', text: 'The Three Pillars of Continuous Compliance' },
      { type: 'list', items: ['Automated evidence collection: Screenshots and exports are replaced by API-driven data pulls that capture the state of every control, every day', 'Control-to-finding mapping: Every compliance requirement is linked to specific technical checks, so you always know your exact compliance posture', 'Audit-ready reporting: Generate auditor-friendly documentation with a single click, complete with timestamps and historical data'] },
      { type: 'heading', text: 'Real Results' },
      { type: 'paragraph', text: 'Companies that adopt continuous compliance report 40-60% reductions in audit preparation time. More importantly, they catch compliance gaps in real-time—before they become audit findings.' },
      { type: 'paragraph', text: 'The best part? This approach does not just help with SOC 2. The same infrastructure supports ISO 27001, HIPAA, PCI-DSS, and any other framework your customers require.' }
    ]
  },
  {
    slug: 'aws-iam-best-practices',
    title: 'AWS IAM Best Practices for 2026',
    excerpt: 'Least privilege, key rotation, and MFA enforcement—a practical guide for security teams.',
    date: '2025-12-20',
    author: 'Alex Rivera',
    category: 'Security',
    readTime: '10 min',
    content: [
      { type: 'paragraph', text: 'AWS Identity and Access Management (IAM) is the foundation of cloud security. Get it right, and you have a solid security posture. Get it wrong, and no amount of additional tooling will save you.' },
      { type: 'paragraph', text: 'After reviewing hundreds of AWS environments, we have identified the IAM practices that separate secure organizations from vulnerable ones. Here is what you need to know.' },
      { type: 'heading', text: '1. Enforce Least Privilege (For Real This Time)' },
      { type: 'paragraph', text: 'Everyone talks about least privilege. Few actually implement it. The problem is that restrictive policies create friction, and friction slows down development teams.' },
      { type: 'paragraph', text: 'The solution is not to give up on least privilege—it is to automate policy refinement. Use IAM Access Analyzer to identify unused permissions, then systematically remove them. Start with non-production accounts to build confidence before rolling out to production.' },
      { type: 'heading', text: '2. Eliminate Long-Lived Access Keys' },
      { type: 'paragraph', text: 'Static access keys are one of the most common causes of AWS security incidents. They get committed to code repositories, shared in Slack channels, and forgotten in CI/CD pipelines.' },
      { type: 'list', items: ['Use IAM roles instead of access keys wherever possible', 'For cases where keys are necessary, enforce 90-day rotation at maximum', 'Monitor for keys that have not been used in 30+ days and disable them', 'Never, ever commit access keys to source control'] },
      { type: 'heading', text: '3. MFA Everywhere' },
      { type: 'paragraph', text: 'Multi-factor authentication should be non-negotiable for any human access to AWS. This includes the root account (which should almost never be used), all IAM users, and any federated access through SSO.' },
      { type: 'paragraph', text: 'Use hardware security keys (FIDO2) for the highest security. Virtual MFA apps are acceptable for most users. SMS-based MFA should be avoided due to SIM-swapping risks.' },
      { type: 'heading', text: '4. Audit Everything' },
      { type: 'paragraph', text: 'Enable CloudTrail in all regions, including regions you do not use. Attackers often operate in unused regions specifically because organizations forget to monitor them.' },
      { type: 'paragraph', text: 'Beyond CloudTrail, regularly review IAM credential reports, Access Analyzer findings, and permission boundaries. Automate these reviews—manual processes do not scale.' },
      { type: 'heading', text: 'The Bottom Line' },
      { type: 'paragraph', text: 'IAM security is not glamorous, but it is essential. Organizations that nail these fundamentals prevent the vast majority of cloud security incidents. Those that skip them are playing with fire.' }
    ]
  },
  {
    slug: 'tagging-strategy-that-works',
    title: 'A Tagging Strategy That Actually Works',
    excerpt: 'Why most tagging initiatives fail—and the simple framework that drives 95%+ compliance.',
    date: '2025-12-12',
    author: 'Sarah Chen',
    category: 'Operations',
    readTime: '7 min',
    content: [
      { type: 'paragraph', text: 'Resource tagging sounds simple. Define some tags, apply them to resources, done. Yet most organizations struggle to maintain even 50% tag compliance across their cloud estate.' },
      { type: 'paragraph', text: 'We have seen tagging initiatives come and go at dozens of enterprises. Here is what separates the successful ones from the failures.' },
      { type: 'heading', text: 'Why Tagging Initiatives Fail' },
      { type: 'list', items: ['Too many required tags (more than 5-7 creates friction)', 'No enforcement mechanism (guidelines without guardrails)', 'Inconsistent naming conventions (Environment vs env vs Env)', 'No clear ownership for tag maintenance'] },
      { type: 'heading', text: 'The Framework That Works' },
      { type: 'paragraph', text: 'Successful tagging programs share four characteristics: they are minimal, enforced, consistent, and owned.' },
      { type: 'paragraph', text: 'Start with just four required tags: Owner, Environment, Application, and CostCenter. These cover 90% of governance use cases. You can always add more later—but you cannot easily remove tags once they are established.' },
      { type: 'heading', text: 'Enforcement Is Everything' },
      { type: 'paragraph', text: 'A tagging policy without enforcement is just a suggestion. Use AWS Service Control Policies or Azure Policy to prevent resource creation without required tags. Yes, this will cause friction initially. That friction is the point—it forces teams to adopt good habits.' },
      { type: 'paragraph', text: 'For existing untagged resources, set a 30-day remediation window with weekly reports to resource owners. Escalate to management for persistent non-compliance.' }
    ]
  },
  {
    slug: 'cloud-cost-ownership',
    title: 'The Hidden Cost of No Ownership',
    excerpt: 'Unowned cloud resources cost enterprises millions. Here is how to fix it.',
    date: '2025-12-01',
    author: 'Marcus Johnson',
    category: 'Cost',
    readTime: '5 min',
    content: [
      { type: 'paragraph', text: 'Every enterprise has them: orphaned EC2 instances, forgotten S3 buckets, load balancers pointing to nothing. These unowned resources silently drain budgets month after month.' },
      { type: 'paragraph', text: 'Our analysis of enterprise AWS accounts finds that 15-25% of cloud spend goes to resources with no clear owner. For a company spending $10 million annually on cloud, that is $1.5-2.5 million in potential waste.' },
      { type: 'heading', text: 'The Ownership Problem' },
      { type: 'paragraph', text: 'Cloud resources are easy to create and easy to forget. A developer spins up a test environment, moves to a new project, and the resources live on. The original team is reorganized. Institutional knowledge is lost.' },
      { type: 'paragraph', text: 'Without clear ownership, no one is responsible for right-sizing, no one is responsible for cleanup, and no one is responsible for security. The resources just exist, accumulating cost and risk.' },
      { type: 'heading', text: 'Fixing the Problem' },
      { type: 'list', items: ['Require owner tags on all resources at creation time', 'Run weekly reports identifying resources without owners', 'Implement a 30-day sunset policy for unowned resources', 'Tie cloud costs to team budgets so ownership has consequences'] },
      { type: 'paragraph', text: 'The goal is not to eliminate all unowned resources overnight. The goal is to create a system where ownership is the default and orphaned resources are the exception.' }
    ]
  }
];

function BlogPage() {
  const { navigate } = useContext(NavigationContext);
  
  return (
    <>
      <section className="content-page-hero">
        <div className="section-content">
          <div className="content-page-header">
            <h1 className="content-page-title">Blog</h1>
            <p className="content-page-summary">Insights on cloud governance, compliance, and security.</p>
          </div>
        </div>
      </section>
      <section className="section-white">
        <div className="section-content">
          <div className="blog-grid">
            {BLOG_POSTS.map((post, index) => (
              <article 
                key={post.slug} 
                className={`blog-card ${index === 0 ? 'blog-card-featured' : ''}`}
                onClick={() => navigate(`/blog/${post.slug}`)}
                role="link"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/blog/${post.slug}`)}
              >
                <div className="blog-card-image"></div>
                <div className="blog-card-content">
                  <span className="blog-category">{post.category}</span>
                  <h2 className="blog-title">{post.title}</h2>
                  <p className="blog-excerpt">{post.excerpt}</p>
                  <div className="blog-meta">
                    <span><User size={14} /> {post.author}</span>
                    <span><Calendar size={14} /> {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>{post.readTime} read</span>
                  </div>
                  <span className="blog-read-more">Read article →</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <DarkCTA headline="Want governance insights in your inbox?" description="Subscribe to our newsletter for weekly tips and industry updates." />
    </>
  );
}

function BlogPost({ post }) {
  const renderContent = (block, index) => {
    switch (block.type) {
      case 'paragraph':
        return <p key={index}>{block.text}</p>;
      case 'heading':
        return <h2 key={index}>{block.text}</h2>;
      case 'list':
        return (
          <ul key={index}>
            {block.items.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <section className="content-page-hero blog-post-hero">
        <div className="section-content">
          <div className="blog-post-header">
            <SiteLink to="/blog" className="blog-back-link">← Back to blog</SiteLink>
            <span className="blog-category">{post.category}</span>
            <h1 className="content-page-title">{post.title}</h1>
            <div className="blog-post-meta">
              <span><User size={16} /> {post.author}</span>
              <span><Calendar size={16} /> {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span>{post.readTime} read</span>
            </div>
          </div>
        </div>
      </section>
      <section className="section-white">
        <div className="section-content">
          <div className="blog-post-content">
            <p className="blog-post-lead">{post.excerpt}</p>
            <div className="blog-post-body">
              {post.content ? post.content.map(renderContent) : (
                <>
                  <p>This article is coming soon.</p>
                  <p>Request a briefing and experience Cloud Hygiene Coach firsthand.</p>
                </>
              )}
            </div>
            <div className="blog-post-cta">
              <SiteLink to="/request-briefing" className="btn btn-primary">Request briefing</SiteLink>
            </div>
          </div>
        </div>
      </section>
      <DarkCTA headline="Ready to transform your cloud governance?" description="Request a briefing and see results in under 30 minutes." />
    </>
  );
}

function StatusPage() {
  const services = [
    { name: 'Dashboard' },
    { name: 'API' },
    { name: 'Scanning Engine' },
    { name: 'Reports' },
    { name: 'Authentication' },
    { name: 'Webhooks' }
  ];
  
  return (
    <>
      <section className="content-page-hero">
        <div className="section-content">
          <div className="content-page-header">
            <h1 className="content-page-title">System status</h1>
            <p className="content-page-summary">For real-time status updates, check our monitoring dashboard.</p>
          </div>
        </div>
      </section>
      <section className="section-white">
        <div className="section-content">
          <h2 className="content-block-title">Services</h2>
          <div className="status-grid">
            {services.map((service) => (
              <div key={service.name} className="status-card">
                <div className="status-card-header">
                  <span className="status-card-name">{service.name}</span>
                </div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Live status monitoring will be available at launch. Contact <a href="mailto:support@cloudhygienecoach.com" style={{ color: 'var(--color-accent)' }}>support@cloudhygienecoach.com</a> for current status.
          </p>
        </div>
      </section>
      <DarkCTA headline="Questions about our reliability?" 
               description="Our team is available to discuss SLAs, security, and compliance." />
    </>
  );
}

function NotFound() {
  return (
    <section className="section">
      <div className="container">
        <div className="page-header">
          <div className="eyebrow">Not found</div>
          <h1 className="page-title">Page not found</h1>
          <p className="page-summary">The page you requested does not exist.</p>
          <SiteLink to="/" className="btn btn-primary">
            Return home
          </SiteLink>
        </div>
      </div>
    </section>
  );
}

function resolveRoute(pathname) {
  if (pathname === '/') {
    return { title: 'Home', element: <HomePage /> };
  }

  if (pathname === '/campaigns') {
    return { title: 'Campaigns', element: <CampaignsIndex /> };
  }

  if (pathname.startsWith('/campaigns/')) {
    const slug = pathname.replace('/campaigns/', '');
    const campaign = CAMPAIGNS.find((item) => item.slug === slug);
    if (!campaign) {
      return { title: 'Not found', element: <NotFound /> };
    }
    return { title: campaign.title, element: <CampaignLanding campaign={campaign} /> };
  }

  if (pathname === '/request-briefing') {
    return { title: 'Request Briefing', element: <RequestBriefing /> };
  }

  if (pathname === '/login') {
    return { title: 'Sign In', element: <AuthRedirect mode="login" /> };
  }

  if (pathname === '/signup') {
    return { title: 'Get Access', element: <AuthRedirect mode="signup" /> };
  }

  if (pathname === '/status') {
    return { title: 'Status', element: <StatusPage /> };
  }

  if (pathname === '/pricing') {
    return { title: 'Pricing', element: <PricingPage /> };
  }

  if (pathname === '/blog') {
    return { title: 'Blog', element: <BlogPage /> };
  }

  if (pathname.startsWith('/blog/')) {
    const slug = pathname.replace('/blog/', '');
    const post = BLOG_POSTS.find(p => p.slug === slug);
    if (post) {
      return { title: post.title, element: <BlogPost post={post} /> };
    }
  }

  const page = CONTENT_PAGES[pathname];
  if (page) {
    return { title: page.title, element: <ContentPage page={page} pathname={pathname} /> };
  }

  return { title: 'Not found', element: <NotFound /> };
}

export default function App() {
  const [pathname, setPathname] = usePathname();

  const navigate = (to) => {
    const normalized = normalizePath(to);
    if (normalized === pathname) {
      return;
    }
    window.history.pushState({}, '', normalized);
    setPathname(normalized);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const route = useMemo(() => resolveRoute(pathname), [pathname]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <NavigationContext.Provider value={{ navigate }}>
      <SEO pathname={pathname} />
      <SiteLayout pathname={pathname}>{route.element}</SiteLayout>
    </NavigationContext.Provider>
  );
}
