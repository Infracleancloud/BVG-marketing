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

// ========== PRODUCT DEMOS ==========
const DEMOS = {
  heroMain:      { video: '/demos/01-dashboard-overview.webm',   poster: '/demos/01-dashboard-overview-poster.png',   alt: 'Infra Clean Cloud dashboard overview',     w: 1440, h: 900 },
  dashboard:     { video: '/demos/01-dashboard-overview.webm',   poster: '/demos/01-dashboard-overview-poster.png',   alt: 'Governance dashboard with hygiene scores',   w: 1440, h: 900 },
  findings:      { video: '/demos/02-findings-drilldown.webm',   poster: '/demos/02-findings-drilldown-poster.png',   alt: 'Prioritized findings and remediation paths', w: 1440, h: 900 },
  tasks:         { video: '/demos/03-task-remediation.webm',     poster: '/demos/03-task-remediation-poster.png',     alt: 'Remediation task board with ownership',      w: 1440, h: 900 },
  reports:       { video: '/demos/04-reports-compliance.webm',   poster: '/demos/04-reports-compliance-poster.png',   alt: 'Compliance readiness and reporting',          w: 1440, h: 900 },
  security:      { video: '/demos/05-security-dashboard.webm',   poster: '/demos/05-security-dashboard-poster.png',   alt: 'Enterprise security monitoring',              w: 1440, h: 900 },
  standards:     { video: '/demos/06-standards-frameworks.webm',  poster: '/demos/06-standards-frameworks-poster.png',  alt: 'Standards and compliance frameworks',         w: 1440, h: 900 },
  workflow:      { video: '/demos/07-workflow-navigation.webm',   poster: '/demos/07-workflow-navigation-poster.png',   alt: 'Full workflow navigation',                    w: 1440, h: 900 },
  contentHero:   { video: null, poster: null, alt: 'Platform feature view',    w: 1440, h: 900 },
  contentInline: { video: null, poster: null, alt: 'Product detail view',      w: 1440, h: 900 },
  enterprise:    { video: null, poster: null, alt: 'Enterprise deployment',    w: 1440, h: 900 },
};

function ProductDemo({ slot, className = '', eager = false }) {
  const ref = useRef(null);
  const demo = DEMOS[slot];

  useEffect(() => {
    const el = ref.current;
    if (!el || eager || !demo?.video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [eager, demo]);

  if (!demo) return <div className={`screenshot-placeholder ${className}`} />;
  if (!demo.video && !demo.poster) return <div className={`screenshot-placeholder ${className}`} />;

  if (!demo.video) {
    return demo.poster
      ? <img src={demo.poster} alt={demo.alt} width={demo.w} height={demo.h} loading="lazy" decoding="async" className={`product-screenshot ${className}`} />
      : <div className={`screenshot-placeholder ${className}`} />;
  }

  return (
    <video
      ref={ref}
      className={`product-demo ${className}`}
      width={demo.w}
      height={demo.h}
      poster={demo.poster}
      autoPlay={eager}
      loop
      muted
      playsInline
      preload={eager ? 'auto' : 'none'}
      aria-label={demo.alt}
    >
      <source src={demo.video} type="video/webm" />
    </video>
  );
}

function ProductScreenshot({ slot, className = '' }) {
  return <ProductDemo slot={slot} className={className} />;
}

const APP_URL = import.meta.env.VITE_APP_URL || 'https://app.infraclean.cloud';
const API_URL = import.meta.env.VITE_APP_API_URL || 'https://api.infraclean.cloud';
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
    localStorage.setItem('icc_marketing_utm', JSON.stringify(utm));
  }
}

// Call on page load
if (typeof window !== 'undefined') captureUtmParams();

function getStoredUtm() {
  try { return JSON.parse(localStorage.getItem('icc_marketing_utm') || '{}'); }
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
  localStorage.removeItem('icc_marketing_utm');
  
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
    metrics: ['Reduce audit prep time by up to 40%', 'Target up to 95% ownership coverage'],
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
    metrics: ['Up to 60% fewer critical violations', 'Up to 2x faster remediation cycles'],
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
    metrics: ['SOC 2 readiness target in 90 days', 'Up to 98% tagging compliance'],
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
    metrics: ['Up to 30% fewer rework cycles', 'Faster change approvals'],
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

function buildOutcomePage({ title, summary, focus, kpis, outcomes, demoSlot = 'reports' }) {
  return {
    eyebrow: 'Outcomes',
    title,
    summary,
    heroScreenshot: { placeholder: `${title} Dashboard View (1100 × 500)`, demoSlot },
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
        placeholder: 'Governance Dashboard (600 × 360)',
        demoSlot: 'workflow'
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

function buildRolePage({ title, summary, priorities, outcomes, demoSlot = 'dashboard' }) {
  const roleType = title.replace('For ', '').replace('s', '');
  return {
    eyebrow: 'Roles',
    title,
    summary,
    heroScreenshot: { placeholder: `${roleType} Dashboard View (1100 × 500)`, demoSlot },
    heroKpis: [
      { label: 'Priority', value: priorities[0], detail: 'Executive mandate' },
      { label: 'Priority', value: priorities[1], detail: 'Operational focus' },
      { label: 'Priority', value: priorities[2], detail: 'Governance discipline' }
    ],
    sections: [
      {
        type: 'screenshot',
        eyebrow: 'A day in the life',
        title: `How ${title.replace('For ', '')} use Infra Clean Cloud`,
        body: 'Start your day with a complete view of governance posture and end it with measurable progress.',
        bullets: ['Morning: Review posture dashboard', 'Midday: Track remediation progress', 'Weekly: Share executive summary'],
        placeholder: `${roleType} Workflow View (600 × 360)`,
        demoSlot: 'workflow'
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
          result: i === 0 ? { value: 'Up to 40%', label: 'audit time saved' } :
                  i === 1 ? { value: 'Up to 98%', label: 'ownership coverage' } :
                           { value: 'Up to 60%', label: 'violations reduced' }
        }))
      },
      {
        type: 'quote',
        quote: 'Continuous evidence collection changed how we approach audits. We went from scrambling to prepared.',
        role: 'CISO',
        company: 'Enterprise SaaS'
      },
      {
        type: 'stat-grid',
        title: 'Aggregate impact across customers',
        stats: [
          { value: 'Up to 40%', label: 'Audit prep', detail: 'Time reduction target' },
          { value: 'Up to 60%', label: 'Violations', detail: 'Critical issues reduced' },
          { value: 'Up to 98%', label: 'Ownership', detail: 'Coverage target' }
        ]
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
    heroScreenshot: { placeholder: 'Dashboard', demoSlot: 'dashboard' },
    heroKpis: [
      { label: 'Coverage', value: 'Up to 98%', detail: 'Asset ownership' },
      { label: 'Faster', value: 'Up to 40%', detail: 'Audit prep' },
      { label: 'Fewer', value: 'Up to 60%', detail: 'Violations' }
    ],
    sections: [
      // Connect once
      {
        type: 'screenshot',
        title: 'Connect once. See everything.',
        body: 'Read-only API access. No agents. No infrastructure changes.',
        bullets: ['AWS Organizations multi-account', 'Cross-account IAM roles', 'Real-time and scheduled scans'],
        demoSlot: 'dashboard'
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
        reverse: true,
        demoSlot: 'standards'
      },
      // Dashboard
      {
        type: 'screenshot',
        title: 'See everything.',
        body: 'Risk, compliance, and cost in one view.',
        bullets: ['Hygiene score trends', 'Risk by category', 'Compliance metrics'],
        demoSlot: 'reports'
      },
      // Findings
      {
        type: 'screenshot',
        title: 'Know what matters.',
        body: 'Prioritized findings with clear paths forward.',
        bullets: ['Impact-ranked', 'Framework-aligned', 'One-click remediation'],
        reverse: true,
        demoSlot: 'findings'
      },
      // Ownership
      {
        type: 'screenshot',
        title: 'Ownership, not tickets.',
        body: 'Every finding has an owner, a due date, and a clear path.',
        bullets: ['Auto-assign by tag or team', 'Slack and Teams alerts', 'SLA tracking with escalation'],
        demoSlot: 'tasks'
      },
      // Evidence
      {
        type: 'screenshot',
        title: 'Audit evidence. Always on.',
        body: 'Continuous evidence collection. Audit packages in minutes.',
        bullets: ['Point-in-time snapshots', 'Control-level evidence', 'PDF and CSV exports'],
        reverse: true,
        demoSlot: 'security'
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
          { title: 'SOC 2 Type II', body: 'Audit program underway.' }
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
          'Infra Clean Cloud integrates cloud environment data, applies compliance frameworks, and generates actionable remediation workflows. Built for organizations that require continuous audit readiness, risk quantification, and operational accountability across multi-cloud infrastructure.',
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
          { value: 'Up to 40%', label: 'Audit prep time reduced' },
          { value: 'Up to 60%', label: 'Critical violations reduced' },
          { value: 'Up to 98%', label: 'Tagging compliance target' }
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
    demoSlot: 'dashboard',
    focus: 'ownership coverage and standards enforcement',
    kpis: [
      { label: 'Coverage', value: 'Up to 98%', detail: 'Ownership on critical assets' },
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
    demoSlot: 'reports',
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
    demoSlot: 'findings',
    focus: 'lifecycle enforcement and ownership clarity',
    kpis: [
      { label: 'Waste', value: 'Up to 30%', detail: 'Reduction in orphaned assets' },
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
    demoSlot: 'security',
    focus: 'critical asset protection and remediation velocity',
    kpis: [
      { label: 'Risk', value: 'Up to 60%', detail: 'Fewer critical violations' },
      { label: 'Speed', value: 'Up to 2x', detail: 'Remediation velocity' },
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
    outcomes: ['Board-ready reporting', 'Accountability at scale', 'Audit readiness'],
    demoSlot: 'reports'
  }),
  '/roles/ciso': buildRolePage({
    title: 'For CISOs',
    summary:
      'Continuous evidence of governance controls that support audit readiness.',
    priorities: ['Control coverage', 'Evidence trail', 'Security posture'],
    outcomes: ['Audit-ready evidence', 'Risk exception visibility', 'Policy enforcement'],
    demoSlot: 'security'
  }),
  '/roles/cto': buildRolePage({
    title: 'For CTOs',
    summary:
      'Build engineering velocity on top of enforceable governance standards.',
    priorities: ['Engineering enablement', 'Architecture integrity', 'Operational clarity'],
    outcomes: ['Reduced rework', 'Aligned standards', 'Measured execution'],
    demoSlot: 'standards'
  }),
  '/roles/vp-engineering': buildRolePage({
    title: 'For VPs of Engineering',
    summary:
      'Make ownership and remediation part of the engineering operating system.',
    priorities: ['Execution accountability', 'Team coordination', 'Remediation velocity'],
    outcomes: ['Clear ownership', 'Measured velocity', 'Executive reporting'],
    demoSlot: 'tasks'
  }),
  '/proof/case-studies': buildProofPage({
    title: 'Case studies',
    summary:
      'Enterprise teams use Infra Clean Cloud to drive accountability and reduce risk.',
    stories: [
      {
        title: 'Financial services',
        body: 'Unified hygiene standards across 14 business units with up to 40% faster audit prep.'
      },
      {
        title: 'Healthcare',
        body: 'Improved ownership coverage to up to 98% across regulated environments.'
      },
      {
        title: 'Enterprise SaaS',
        body: 'Reduced high-severity hygiene violations by up to 60% in 90 days.'
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
        signature: { name: 'The Founding Team', role: 'Infra Clean Cloud' },
        image: '/images/team-collab.jpg',
        imageAlt: 'Team working together at laptops in a modern workspace'
      },
      {
        type: 'image-break',
        image: '/images/team-laptops.jpg',
        imageAlt: 'Team working at laptops in a modern workspace'
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
        openRoles: JOB_LISTINGS.length,
        href: '/company/careers'
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
        image: '/images/team-whiteboard.jpg',
        imageAlt: 'Team planning session around a whiteboard with post-its'
      },
      {
        type: 'image-break',
        image: '/images/team-discussion.jpg',
        imageAlt: 'Team collaborating around a table'
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
        type: 'job-listings',
        title: 'Open roles',
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
    summary: 'This policy describes how BVG Solutions, Inc. ("Infra Clean Cloud") collects, uses, shares, and protects your information.',
    hideLogoBar: true,
    sections: [
      {
        type: 'narrative',
        title: 'Effective Date: Draft — Subject to Legal Review',
        body: 'This Privacy Policy ("Policy") applies to all personal information collected by BVG Solutions, Inc., operating as Infra Clean Cloud ("Company," "we," "us," or "our"), through our website (infraclean.cloud), platform, and related services. By using our services, you acknowledge that you have read and understood this Policy.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '1. Information We Collect',
        body: 'We collect information in three categories: (a) Information you provide directly, including name, email address, company name, job title, and phone number when you register, request a briefing, or contact us; (b) Information collected automatically, including IP address, browser type, device identifiers, operating system, referring URLs, pages visited, session duration, and interaction data through cookies, web beacons, and similar technologies; (c) Information from third parties, including analytics providers (e.g., Google Analytics), advertising platforms, and publicly available business information.',
        bullets: [
          'Account registration and profile data',
          'Briefing request and contact form submissions',
          'Usage analytics, session data, and interaction logs',
          'Cookie identifiers and device fingerprints',
          'Payment and billing information (processed by third-party payment processors)'
        ]
      },
      {
        type: 'narrative',
        title: '2. How We Use Your Information',
        body: 'We use collected information for the following purposes: to provide, maintain, and improve the Service; to process briefing requests and respond to inquiries; to send transactional communications related to your account; to send marketing communications (with your consent or where permitted by law); to monitor and analyze usage trends and preferences; to detect, investigate, and prevent fraudulent or unauthorized activity; to comply with legal obligations and enforce our Terms of Service.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '3. Legal Basis for Processing (EEA/UK Users)',
        body: 'If you are located in the European Economic Area or United Kingdom, our legal basis for processing your personal data includes: (a) performance of a contract when we process data to provide services you requested; (b) legitimate interests in operating and improving our business, provided those interests are not overridden by your data protection rights; (c) your consent, which you may withdraw at any time; (d) compliance with legal obligations.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '4. How We Share Your Information',
        body: 'We do not sell your personal information. We may share information with: (a) service providers who assist us in operating the platform (hosting, analytics, email delivery, payment processing), each bound by data processing agreements with confidentiality and security obligations; (b) professional advisors, including legal counsel, auditors, and accountants, as necessary; (c) law enforcement or government authorities when required by applicable law, subpoena, or court order, or when we believe disclosure is necessary to protect our rights, safety, or property; (d) in connection with a merger, acquisition, reorganization, or sale of assets, in which case your information may be transferred as a business asset, subject to the commitments made in this Policy.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '5. Data Security',
        body: 'We implement administrative, technical, and physical safeguards designed to protect personal information from unauthorized access, disclosure, alteration, and destruction. These measures include: encryption of data at rest (AES-256) and in transit (TLS 1.2+); role-based access controls with least-privilege principles; regular security assessments and penetration testing; employee security training and access auditing; SOC 2 Type II audit program in progress. While we strive to protect your information, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '6. Data Retention',
        body: 'We retain personal information for as long as necessary to fulfill the purposes described in this Policy, maintain our business relationship with you, comply with legal obligations, resolve disputes, and enforce our agreements. Account data is retained for the duration of your subscription and for a reasonable period thereafter. Marketing data is retained until you opt out or request deletion. Usage analytics data is retained in aggregate form and may be retained indefinitely for statistical purposes.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '7. Your Rights and Choices',
        body: 'Depending on your jurisdiction, you may have the following rights regarding your personal data: the right to access the personal information we hold about you; the right to correct inaccurate or incomplete data; the right to request deletion of your data (subject to legal retention requirements); the right to data portability in a machine-readable format; the right to restrict or object to certain processing; the right to withdraw consent at any time (without affecting prior processing); the right to lodge a complaint with a supervisory authority. To exercise any of these rights, contact privacy@infraclean.cloud. We will respond within thirty (30) days.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '8. Cookies and Tracking Technologies',
        body: 'We use cookies and similar technologies for the following purposes: (a) Essential cookies required for site functionality and security; (b) Analytics cookies (e.g., Google Analytics) to understand usage patterns and improve the Service; (c) Marketing cookies for campaign attribution and measurement. You can manage cookie preferences through your browser settings. Disabling certain cookies may affect site functionality. We honor Do Not Track signals where technically feasible.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '9. International Data Transfers',
        body: 'Your information may be transferred to and processed in countries other than your country of residence, including the United States. When we transfer data outside the EEA or UK, we implement appropriate safeguards, including standard contractual clauses approved by the European Commission, or rely on other legally recognized transfer mechanisms.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '10. California Privacy Rights (CCPA)',
        body: 'If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect and how it is used, the right to request deletion, and the right to opt out of the sale of personal information. We do not sell personal information. To exercise your CCPA rights, contact privacy@infraclean.cloud.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '11. Children\'s Privacy',
        body: 'The Service is not directed to individuals under the age of 16. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information, we will take steps to delete such information.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '12. Changes to This Policy',
        body: 'We may update this Policy from time to time. Material changes will be communicated via email or prominent notice on the Service at least thirty (30) days before they take effect. Your continued use of the Service after the effective date of a revised Policy constitutes acceptance of the changes.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '13. Contact Us',
        body: 'For privacy-related inquiries, requests, or complaints, contact us at: privacy@infraclean.cloud. BVG Solutions, Inc., San Francisco, CA. We aim to respond to all requests within thirty (30) days.',
        bullets: []
      }
    ]
  },
  '/terms': {
    eyebrow: 'Legal',
    title: 'Terms of Service',
    summary: 'These terms govern your access to and use of Infra Clean Cloud services. Please read them carefully.',
    hideLogoBar: true,
    sections: [
      {
        type: 'narrative',
        title: 'Effective Date: Draft — Subject to Legal Review',
        body: 'These Terms of Service ("Terms") constitute a binding agreement between you ("Customer," "you," or "your") and BVG Solutions, Inc., operating as Infra Clean Cloud ("Company," "we," "us," or "our"). By accessing or using the Infra Clean Cloud platform and related services (collectively, the "Service"), you agree to be bound by these Terms and our Privacy Policy. If you are entering into these Terms on behalf of an organization, you represent and warrant that you have the authority to bind that organization.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '1. Description of Service',
        body: 'Infra Clean Cloud provides a cloud governance, compliance monitoring, and remediation workflow platform delivered as a software-as-a-service ("SaaS") offering. The Service enables customers to discover, assess, and remediate cloud hygiene issues across their infrastructure. Features, service levels, and resource limits vary by subscription tier as described in the applicable order form or pricing documentation.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '2. Account Registration and Responsibilities',
        body: 'To access the Service, you must register for an account and provide accurate, complete, and current information. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account or any other breach of security.',
        bullets: [
          'You must be at least 18 years of age or the age of legal majority in your jurisdiction',
          'You are responsible for all activity under your account, including actions by authorized users you add',
          'You must maintain accurate account information and promptly update any changes',
          'You must notify us within 24 hours of any unauthorized access or security breach'
        ]
      },
      {
        type: 'narrative',
        title: '3. Acceptable Use Policy',
        body: 'You agree to use the Service only for lawful purposes and in accordance with these Terms. You shall not: (a) use the Service to violate any applicable law, regulation, or third-party rights; (b) attempt to gain unauthorized access to the Service, other accounts, or computer systems; (c) interfere with or disrupt the integrity or performance of the Service; (d) attempt to reverse engineer, decompile, or disassemble any portion of the Service; (e) use the Service to transmit malicious code or conduct vulnerability testing without prior written authorization; (f) resell, sublicense, or share access to the Service without our express written consent.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '4. Customer Data',
        body: 'As between you and Company, you retain all right, title, and interest in your data ("Customer Data"). You grant Company a limited, non-exclusive license to access and process Customer Data solely to provide and improve the Service. Company will not access, use, or disclose Customer Data except as necessary to provide the Service, prevent or address technical issues, or as required by law. Upon termination, Company will make Customer Data available for export for thirty (30) days, after which it may be deleted.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '5. Intellectual Property',
        body: 'The Service, including all software, documentation, interfaces, designs, algorithms, and underlying technology, is the exclusive property of BVG Solutions, Inc. and is protected by copyright, trademark, patent, trade secret, and other intellectual property laws. These Terms grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service during the subscription term for your internal business purposes only. All rights not expressly granted are reserved by Company.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '6. Payment Terms',
        body: 'Paid subscription plans are billed in advance on a monthly or annual basis as specified in your order form. All fees are non-refundable except as expressly set forth herein or required by applicable law. Company reserves the right to modify pricing upon thirty (30) days written notice; price changes will take effect at the start of your next billing cycle. Late payments may incur interest at the rate of 1.5% per month or the maximum rate permitted by law, whichever is less. Company may suspend access for accounts with overdue balances exceeding thirty (30) days.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '7. Service Availability and Support',
        body: 'Company will use commercially reasonable efforts to maintain Service availability. Target uptime is 99.9% measured monthly, excluding scheduled maintenance windows and force majeure events. Scheduled maintenance will be communicated at least 48 hours in advance where practicable. Support is provided according to the response-time commitments applicable to your subscription tier. Service Level Agreements ("SLAs") for Enterprise customers are documented in the applicable order form.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '8. Confidentiality',
        body: 'Each party agrees to hold the other party\'s Confidential Information in strict confidence and not to disclose it to any third party except as necessary to perform obligations under these Terms, and only to employees, contractors, or agents who are bound by confidentiality obligations at least as protective as those contained herein. Confidential Information does not include information that: (a) is or becomes publicly known through no fault of the receiving party; (b) was known to the receiving party prior to disclosure; (c) is independently developed without reference to Confidential Information; or (d) is required to be disclosed by law, provided the receiving party gives reasonable prior notice.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '9. Warranty Disclaimer',
        body: 'THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE." TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, COMPANY DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING WITHOUT LIMITATION WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. COMPANY DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE. YOU ACKNOWLEDGE THAT THE SERVICE IS NOT DESIGNED OR INTENDED TO REPLACE PROFESSIONAL LEGAL, COMPLIANCE, OR SECURITY ADVICE.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '10. Limitation of Liability',
        body: 'TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW: (A) IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR LOSS OF PROFITS, REVENUE, DATA, BUSINESS OPPORTUNITIES, OR GOODWILL, ARISING OUT OF OR RELATED TO THESE TERMS, REGARDLESS OF THE THEORY OF LIABILITY; (B) EACH PARTY\'S TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THESE TERMS SHALL NOT EXCEED THE AMOUNTS PAID OR PAYABLE BY CUSTOMER TO COMPANY IN THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO LIABILITY. THE FOREGOING LIMITATIONS SHALL NOT APPLY TO: (I) EITHER PARTY\'S INDEMNIFICATION OBLIGATIONS; (II) EITHER PARTY\'S BREACH OF CONFIDENTIALITY OBLIGATIONS; OR (III) CUSTOMER\'S PAYMENT OBLIGATIONS.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '11. Indemnification',
        body: 'Customer agrees to indemnify, defend, and hold harmless Company and its officers, directors, employees, and agents from and against any third-party claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys\' fees) arising from: (a) Customer\'s use of the Service in violation of these Terms; (b) Customer\'s violation of applicable law; or (c) any third-party claim relating to Customer Data. Company agrees to indemnify Customer from third-party claims alleging that the Service infringes a valid patent, copyright, or trademark, provided Customer gives prompt notice and reasonable cooperation.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '12. Term and Termination',
        body: 'These Terms are effective upon your first access to the Service and continue until terminated. Either party may terminate for convenience with thirty (30) days written notice. Either party may terminate immediately upon written notice if the other party materially breaches these Terms and fails to cure within fifteen (15) days of receiving notice. Upon termination: (a) all licenses granted hereunder immediately terminate; (b) Customer must cease all use of the Service; (c) Company will make Customer Data available for export for thirty (30) days; (d) sections relating to intellectual property, limitation of liability, indemnification, confidentiality, and governing law survive termination.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '13. Governing Law and Dispute Resolution',
        body: 'These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict-of-laws principles. Any dispute arising out of or relating to these Terms shall first be subject to good-faith negotiation for a period of thirty (30) days. If the dispute cannot be resolved through negotiation, it shall be submitted to binding arbitration administered by JAMS under its Comprehensive Arbitration Rules, conducted in San Francisco, California. Each party shall bear its own costs and attorneys\' fees, except that the prevailing party in any dispute shall be entitled to recover reasonable attorneys\' fees.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '14. General Provisions',
        body: 'These Terms, together with the Privacy Policy and any applicable order forms, constitute the entire agreement between the parties and supersede all prior agreements. No waiver of any provision shall be effective unless in writing and signed by both parties. If any provision is found to be unenforceable, the remaining provisions shall continue in full force and effect. Company may assign these Terms in connection with a merger, acquisition, or sale of assets. Customer may not assign without Company\'s prior written consent. Notices shall be sent to the email addresses associated with the respective accounts.',
        bullets: []
      },
      {
        type: 'narrative',
        title: '15. Contact',
        body: 'For questions regarding these Terms, contact legal@infraclean.cloud. For general inquiries, contact hello@infraclean.cloud.',
        bullets: []
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
          { icon: 'mail', label: 'Sales inquiries', value: 'sales@infraclean.cloud', action: 'Email us', href: 'mailto:sales@infraclean.cloud' },
          { icon: 'message', label: 'Support', value: 'support@infraclean.cloud', action: 'Get help', href: 'mailto:support@infraclean.cloud' },
          { icon: 'mail', label: 'Press & partnerships', value: 'press@infraclean.cloud', action: 'Reach out', href: 'mailto:press@infraclean.cloud' },
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
        type: 'narrative',
        title: 'Enterprise-ready engagement',
        body: 'We support enterprise procurement, security reviews, and legal processes. Our team responds within 24 hours.',
        bullets: ['Custom demos for your team', 'Security questionnaire support', 'Legal and procurement fast-track']
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return (
    <div className="site">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <header className="nav">
        <div className="section-content nav-inner">
          <SiteLink to="/" className="logo">
            Infra Clean Cloud
          </SiteLink>
          <nav className="nav-links">
            {NAV_LINKS.map((link) => (
              <SiteLink key={link.href} to={link.href}>
                {link.label}
              </SiteLink>
            ))}
          </nav>
          <div className="nav-actions">
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
            </div>
            <div className="footer-column">
              <strong>Resources</strong>
              <SiteLink to="/blog">Blog</SiteLink>
              <SiteLink to="/proof/case-studies">Case studies</SiteLink>
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
              <a href="mailto:hello@infraclean.cloud">
                <Mail size={16} /> hello@infraclean.cloud
              </a>
              <a href="mailto:support@infraclean.cloud">
                <MessageCircle size={16} /> support@infraclean.cloud
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copyright">
              © {new Date().getFullYear()} Infra Clean Cloud. All rights reserved.
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
              <ProductDemo slot="heroMain" className="hero-screenshot-placeholder" eager />
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
                <div className="hero-stat-value">Up to 98%</div>
                <p>Asset ownership coverage</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={50}>
              <div className="hero-stat-card">
                <div className="hero-stat-value">Up to 40%</div>
                <p>Less audit prep time</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <div className="hero-stat-card">
                <div className="hero-stat-value">Up to 60%</div>
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
                <ProductDemo slot="dashboard" />
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
                <ProductDemo slot="findings" />
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
                <ProductDemo slot="tasks" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ========== REPORTS / PROVE SECTION ========== */}
      <section className="section-white">
        <div className="section-content">
          <div className="screenshot-section reverse">
            <ScrollReveal direction="left">
              <div className="screenshot-content">
                <h2>Prove it to any auditor.</h2>
                <p>
                  Executive summaries, risk impact analysis, and compliance readiness in one view.
                </p>
                <ul>
                  <li><Check size={20} aria-hidden="true" /> Audit-ready PDF reports</li>
                  <li><Check size={20} aria-hidden="true" /> SOC 2, NIST, CIS alignment</li>
                  <li><Check size={20} aria-hidden="true" /> Risk quantification by category</li>
                </ul>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={80}>
              <div className="screenshot-wrapper">
                <ProductDemo slot="reports" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ========== SECURITY SECTION ========== */}
      <section className="section-gray">
        <div className="section-content">
          <div className="screenshot-section">
            <ScrollReveal direction="right">
              <div className="screenshot-content">
                <h2>Security built in, not bolted on.</h2>
                <p>
                  Real-time threat monitoring, event trends, and posture scoring across your entire fleet.
                </p>
                <ul>
                  <li><Check size={20} aria-hidden="true" /> Real-time security status</li>
                  <li><Check size={20} aria-hidden="true" /> Event severity trends</li>
                  <li><Check size={20} aria-hidden="true" /> Auth failure and rate-limit tracking</li>
                </ul>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="left" delay={80}>
              <div className="screenshot-wrapper">
                <ProductDemo slot="security" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ========== VALUE PROP SECTION ========== */}
      <section className="section-gray">
        <div className="section-content">
          <ScrollReveal direction="fade">
            <div className="quote-section">
              <p className="quote-text">
                "Every enterprise has the same problem: too many cloud resources, 
                not enough owners, and audit season turns into panic season. 
                It doesn't have to be this way."
              </p>
              <div className="quote-attribution">
                <div className="quote-info">
                  <div className="quote-name">The Infra Clean Cloud Team</div>
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
  description = "Get a personalized briefing on how Infra Clean Cloud can help your organization.",
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
          <ProductDemo slot={section.demoSlot || 'dashboard'} />
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
          {section.image
            ? <img src={section.image} alt={section.imageAlt || 'Team'} className="origin-image-photo" loading="lazy" />
            : <div className="origin-image-placeholder">{section.imagePlaceholder || 'Founder Photo'}</div>
          }
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
          {section.image
            ? <img src={section.image} alt={section.imageAlt || 'Team culture'} className="culture-image-photo" loading="lazy" />
            : <div className="culture-image-placeholder">{section.imagePlaceholder || 'Team Culture Photo'}</div>
          }
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

  if (section.type === 'job-listings') {
    return (
      <div className="content-block">
        <h2 className="content-block-title">{section.title}</h2>
        <div className="job-listings-grid">
          {JOB_LISTINGS.map((job) => (
            <SiteLink key={job.slug} to={`/company/careers/${job.slug}`} className="job-listing-card">
              <div className="job-listing-header">
                <h3>{job.title}</h3>
                <span className="job-listing-dept">{job.department}</span>
              </div>
              <div className="job-listing-meta">
                <span><MapPin size={14} /> {job.location}</span>
                <span><Briefcase size={14} /> {job.type}</span>
              </div>
              <span className="blog-read-more">View role →</span>
            </SiteLink>
          ))}
        </div>
      </div>
    );
  }

  if (section.type === 'image-break') {
    return (
      <div className="image-break">
        <img src={section.image} alt={section.imageAlt || ''} loading="lazy" />
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
                <ProductDemo slot={page.heroScreenshot.demoSlot || 'dashboard'} className="hero-screenshot-placeholder" />
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
      setError('Something went wrong. Please try again or contact support@infraclean.cloud.');
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
                placeholder="Your full name" 
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="email">Work email *</label>
              <input 
                id="email" 
                placeholder="you@company.com" 
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
                placeholder="Your company"
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
            Taking you to Infra Clean Cloud
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
    name: 'Starter',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Explore cloud governance with a single AWS account. No credit card required.',
    features: [
      'Up to 100 cloud resources',
      '1 AWS account',
      '2 compliance frameworks (CIS, custom)',
      'Weekly scans',
      'Executive dashboard',
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
    description: 'Full governance for growing teams. All frameworks, daily scans, and integrations.',
    features: [
      'Up to 5,000 cloud resources',
      '10 AWS accounts',
      'All compliance frameworks (SOC 2, HIPAA, PCI, ISO)',
      'Daily scans with drift detection',
      'Slack, Teams, and Jira integration',
      'Custom rules and policies',
      'Audit evidence packages',
      'Priority email support'
    ],
    cta: 'Request briefing',
    ctaHref: '/request-briefing',
    highlighted: true
  },
  {
    name: 'Enterprise',
    monthlyPrice: null,
    annualPrice: null,
    description: 'Unlimited scale, multi-cloud, SSO, and dedicated support for complex organizations.',
    features: [
      'Unlimited resources and accounts',
      'Multi-cloud (AWS, Azure, GCP)',
      'Real-time continuous scanning',
      'SSO (SAML/OIDC) and advanced RBAC',
      'Full REST API access',
      'Custom SLA and dedicated CSM',
      'White-label reporting',
      'Security review and onboarding support'
    ],
    cta: 'Contact sales',
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
    answer: 'Yes. We are pursuing SOC 2 Type II certification and encrypt all data at rest and in transit. We never store your cloud credentials—we use read-only IAM roles with least-privilege access.'
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
            <p className="content-page-summary">Start free. Scale as you grow. Enterprise plans are custom-tailored.</p>
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
                <span>SOC 2 Type II (in progress)</span>
              </div>
              <div className="trust-badge-item">
                <Shield size={20} />
                <span>ISO 27001 aligned</span>
              </div>
              <div className="trust-badge-item">
                <Shield size={20} />
                <span>GDPR ready</span>
              </div>
              <div className="trust-badge-item">
                <Lock size={20} />
                <span>Encrypted at rest &amp; in transit</span>
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
                  <th>Starter</th>
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
                Custom pricing, dedicated support, and the security controls your procurement team requires.
              </p>
              <ul className="enterprise-benefits">
                <li><Check size={18} /> Unlimited resources and accounts</li>
                <li><Check size={18} /> Multi-cloud support (AWS, Azure, GCP)</li>
                <li><Check size={18} /> SSO (SAML/OIDC) with your identity provider</li>
                <li><Check size={18} /> Full REST API access for automation</li>
                <li><Check size={18} /> Dedicated customer success manager</li>
                <li><Check size={18} /> Custom SLA and security review support</li>
              </ul>
              <div className="hero-buttons">
                <SiteLink to="/request-briefing" className="btn btn-primary">Request briefing</SiteLink>
                <SiteLink to="/platform" className="btn btn-secondary">Explore platform →</SiteLink>
              </div>
            </div>
            <div className="enterprise-callout-visual">
              <ProductDemo slot="security" className="enterprise-visual-placeholder" />
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

// ========== JOB LISTINGS ==========
const JOB_LISTINGS = [
  {
    slug: 'senior-backend-engineer',
    title: 'Senior Backend Engineer',
    department: 'Engineering',
    location: 'Remote (US)',
    type: 'Full-time',
    overview: 'Build the core platform that powers enterprise cloud governance. You will design and implement APIs, data pipelines, and scanning infrastructure that processes millions of cloud resources.',
    responsibilities: [
      'Design and build scalable APIs and microservices in Go',
      'Architect data pipelines for cloud resource scanning and analysis',
      'Implement compliance frameworks and rule engines',
      'Collaborate with product and design to deliver features end-to-end',
      'Participate in on-call rotations and incident response',
      'Mentor junior engineers and contribute to engineering standards',
    ],
    qualifications: [
      '5+ years of backend engineering experience',
      'Strong experience with Go, PostgreSQL, and AWS',
      'Experience building and operating production SaaS systems',
      'Understanding of cloud infrastructure and security concepts',
      'Comfortable with CI/CD, infrastructure-as-code, and monitoring',
      'Clear written and verbal communication skills',
    ],
  },
  {
    slug: 'senior-frontend-engineer',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Remote (US)',
    type: 'Full-time',
    overview: 'Craft the interfaces that security and operations teams use every day. You will build dashboards, data visualizations, and workflow tools that make complex governance data actionable.',
    responsibilities: [
      'Build and maintain React/TypeScript UI components and pages',
      'Implement complex data visualizations and interactive dashboards',
      'Collaborate closely with product design on UX decisions',
      'Optimize front-end performance and accessibility',
      'Write unit and integration tests for critical user flows',
      'Contribute to the component library and design system',
    ],
    qualifications: [
      '5+ years of frontend engineering experience',
      'Expert-level React and TypeScript skills',
      'Experience with data visualization libraries (D3, Recharts, etc.)',
      'Strong understanding of web accessibility (WCAG 2.1)',
      'Design system experience is a plus',
      'Comfortable working in a fast-paced, remote-first environment',
    ],
  },
  {
    slug: 'product-designer',
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote (US)',
    type: 'Full-time',
    overview: 'Design enterprise software that does not feel like enterprise software. You will own the end-to-end design process for features used by CIOs, CISOs, and engineering leaders.',
    responsibilities: [
      'Lead design for new features from concept through implementation',
      'Conduct user research and synthesize findings into design decisions',
      'Create wireframes, prototypes, and high-fidelity designs in Figma',
      'Collaborate with engineering to ensure design intent is preserved',
      'Contribute to and maintain the product design system',
      'Present design rationale to stakeholders and incorporate feedback',
    ],
    qualifications: [
      '4+ years of product design experience, preferably in B2B SaaS',
      'Strong portfolio demonstrating complex information design',
      'Proficiency in Figma and prototyping tools',
      'Experience designing for data-heavy applications',
      'Understanding of accessibility and responsive design principles',
      'Excellent communication and collaboration skills',
    ],
  },
  {
    slug: 'enterprise-account-executive',
    title: 'Enterprise Account Executive',
    department: 'Sales',
    location: 'Remote (US)',
    type: 'Full-time',
    overview: 'Sell to CIOs and CISOs at mid-market and enterprise organizations. You will run complex sales cycles with security-conscious buyers who need governance solutions they can trust.',
    responsibilities: [
      'Manage full-cycle enterprise sales from prospecting to close',
      'Build relationships with C-level and VP-level decision makers',
      'Conduct discovery, demos, and executive briefings',
      'Navigate procurement, legal, and security review processes',
      'Collaborate with solutions engineering on technical evaluations',
      'Maintain accurate pipeline and forecasting in CRM',
    ],
    qualifications: [
      '5+ years of enterprise SaaS sales experience',
      'Track record of selling to security, compliance, or infrastructure buyers',
      'Consultative sales approach with complex deal management skills',
      'Comfortable with technical concepts (cloud, security, compliance)',
      'Experience with MEDDIC, Challenger, or similar sales methodologies',
      'Self-motivated and comfortable in an early-stage environment',
    ],
  },
  {
    slug: 'customer-success-manager',
    title: 'Customer Success Manager',
    department: 'Customer Success',
    location: 'Remote (US)',
    type: 'Full-time',
    overview: 'Make customers wildly successful with Infra Clean Cloud. You will be the primary point of contact for enterprise accounts, driving adoption, value realization, and retention.',
    responsibilities: [
      'Own the post-sale relationship for a portfolio of enterprise accounts',
      'Drive onboarding, adoption, and value realization',
      'Conduct regular business reviews and health checks',
      'Identify expansion opportunities and coordinate with sales',
      'Serve as the voice of the customer internally',
      'Build scalable playbooks and best practices documentation',
    ],
    qualifications: [
      '3+ years of customer success or account management in B2B SaaS',
      'Technical aptitude—comfortable discussing cloud infrastructure concepts',
      'Strong project management and organizational skills',
      'Excellent written and verbal communication',
      'Experience with customer health scoring and retention metrics',
      'Empathetic, proactive, and solutions-oriented',
    ],
  },
];

// ========== BLOG PAGE ==========
const BLOG_POSTS = [
  {
    slug: 'cloud-governance-2026',
    title: 'The State of Cloud Governance in 2026',
    excerpt: 'Why 73% of enterprises still struggle with cloud compliance—and what the leaders are doing differently.',
    date: '2026-01-15',
    author: 'Infra Clean Cloud Team',
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
    author: 'Infra Clean Cloud Team',
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
    date: '2026-02-20',
    author: 'Infra Clean Cloud Team',
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
    date: '2026-02-12',
    author: 'Infra Clean Cloud Team',
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
    date: '2026-02-01',
    author: 'Infra Clean Cloud Team',
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
                  <p>Request a briefing and experience Infra Clean Cloud firsthand.</p>
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
            For real-time status inquiries, contact <a href="mailto:support@infraclean.cloud" style={{ color: 'var(--color-accent)' }}>support@infraclean.cloud</a>.
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

function JobDetailPage({ job }) {
  return (
    <>
      <section className="content-page-hero">
        <div className="section-content">
          <div className="blog-post-header">
            <SiteLink to="/company/careers" className="blog-back-link">← Back to careers</SiteLink>
            <span className="blog-category">{job.department}</span>
            <h1 className="content-page-title">{job.title}</h1>
            <div className="blog-post-meta">
              <span><MapPin size={16} /> {job.location}</span>
              <span><Briefcase size={16} /> {job.type}</span>
            </div>
          </div>
        </div>
      </section>
      <section className="section-white">
        <div className="section-content">
          <div className="blog-post-content">
            <p className="blog-post-lead">{job.overview}</p>
            <div className="blog-post-body">
              <h2>Responsibilities</h2>
              <ul>
                {job.responsibilities.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
              <h2>Qualifications</h2>
              <ul>
                {job.qualifications.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
              <h2>What we offer</h2>
              <ul>
                <li>Competitive salary and meaningful equity</li>
                <li>Remote-first, flexible hours</li>
                <li>Premium health, dental, and vision</li>
                <li>Home office stipend and latest hardware</li>
                <li>Unlimited PTO and annual team offsite</li>
                <li>Learning and development budget</li>
              </ul>
            </div>
            <div className="blog-post-cta" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <a
                href={`mailto:careers@infraclean.cloud?subject=Application: ${encodeURIComponent(job.title)}&body=${encodeURIComponent(`Hi,\n\nI'm interested in the ${job.title} role at Infra Clean Cloud.\n\nPlease find my resume attached.\n\nName:\nLinkedIn:\nCurrent role:\n\nThank you.`)}`}
                className="btn btn-primary"
              >
                Apply now <ArrowRight size={18} />
              </a>
              <SiteLink to="/company/careers" className="btn btn-secondary">
                View all roles
              </SiteLink>
            </div>
            <p style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Applications are reviewed by our team. Send your resume and a brief note to careers@infraclean.cloud.
            </p>
          </div>
        </div>
      </section>
      <DarkCTA headline="Not the right role?" description="We're always looking for exceptional people. Send us a note and tell us what you'd build." />
    </>
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

  if (pathname.startsWith('/company/careers/')) {
    const slug = pathname.replace('/company/careers/', '');
    const job = JOB_LISTINGS.find(j => j.slug === slug);
    if (job) {
      return { title: `${job.title} | Careers`, element: <JobDetailPage job={job} /> };
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
