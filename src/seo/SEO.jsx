/**
 * Infra Clean Cloud - SEO Component
 * Handles all meta tags, OpenGraph, Twitter Cards, and JSON-LD
 */

import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG, getSeoConfig, ORGANIZATION_SCHEMA } from './seoConfig';

/**
 * SEO Component
 * @param {string} pathname - Current page path
 * @param {object} overrides - Optional overrides for SEO config
 */
export function SEO({ pathname = '/', overrides = {} }) {
  const config = { ...getSeoConfig(pathname), ...overrides };
  
  const {
    title,
    description,
    keywords,
    image,
    noindex,
    schema,
    article,
  } = config;

  const canonicalUrl = `${SITE_CONFIG.siteUrl}${pathname === '/' ? '' : pathname}`;
  const ogImage = image || `${SITE_CONFIG.siteUrl}${SITE_CONFIG.defaultImage}`;

  // Build JSON-LD structured data
  const structuredData = schema || [ORGANIZATION_SCHEMA];

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SITE_CONFIG.siteName} />
      <meta property="og:locale" content={SITE_CONFIG.locale} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SITE_CONFIG.twitterHandle} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Additional Meta */}
      <meta name="author" content={SITE_CONFIG.siteName} />
      <meta name="publisher" content={SITE_CONFIG.siteName} />
      <meta name="theme-color" content="#0071e3" />
      
      {/* Structured Data (JSON-LD) */}
      {structuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </Helmet>
  );
}

/**
 * Breadcrumb JSON-LD helper
 */
export function generateBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_CONFIG.siteUrl}${item.path}`,
    })),
  };
}

/**
 * FAQ JSON-LD helper
 */
export function generateFAQSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export default SEO;
