/**
 * Marketing Site Handoff API Client
 * Creates handoff tokens for seamless marketing → app transitions
 * Version: 1.0.0
 */

const API_URL = import.meta.env.VITE_APP_API_URL || 'https://api.infraclean.cloud';

/**
 * Create a handoff token with user email and attribution data
 * @param {Object} options
 * @param {string} options.email - User's email (optional)
 * @param {Object} options.attribution - Attribution data from marketing
 * @param {number} options.expiresInMinutes - Token expiry (default 30)
 * @returns {Promise<{token: string, expiresAt: string, handoffUrl: string}>}
 */
export async function createHandoffToken({ email = null, attribution = {}, expiresInMinutes = 30 } = {}) {
  try {
    const response = await fetch(`${API_URL}/api/v1/auth/handoff/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        attribution,
        expiresInMinutes,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to create handoff token: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Handoff token creation failed:', error);
    throw error;
  }
}

/**
 * Get attribution data from current page (UTM params, referrer, etc.)
 * @returns {Object} Attribution data
 */
export function getAttributionData() {
  const params = new URLSearchParams(window.location.search);
  
  return {
    source: params.get('utm_source') || null,
    medium: params.get('utm_medium') || null,
    campaign: params.get('utm_campaign') || null,
    content: params.get('utm_content') || null,
    term: params.get('utm_term') || null,
    referrer: document.referrer || null,
    landingPage: window.location.pathname,
    capturedAt: new Date().toISOString(),
  };
}

/**
 * Get stored UTM params from sessionStorage
 * @returns {Object|null} Stored UTM data
 */
export function getStoredUtmParams() {
  try {
    const stored = sessionStorage.getItem('marketing_utm');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Store UTM params in sessionStorage for persistence across navigation
 */
export function storeUtmParams() {
  const params = new URLSearchParams(window.location.search);
  const hasUtm = ['utm_source', 'utm_medium', 'utm_campaign'].some(p => params.has(p));
  
  if (hasUtm) {
    const utmData = {
      source: params.get('utm_source'),
      medium: params.get('utm_medium'),
      campaign: params.get('utm_campaign'),
      content: params.get('utm_content'),
      term: params.get('utm_term'),
      capturedAt: new Date().toISOString(),
    };
    sessionStorage.setItem('marketing_utm', JSON.stringify(utmData));
  }
}

/**
 * Create handoff and redirect to app
 * Main function to call when user clicks CTA
 * @param {Object} options
 * @param {string} options.email - User's email (optional)
 * @param {string} options.firstName - User's first name (optional)
 * @param {string} options.lastName - User's last name (optional)
 * @param {string} options.company - Company name (optional)
 * @param {Object} options.extraAttribution - Additional attribution data
 * @param {string} options.destination - Destination path (default /welcome)
 * @returns {Promise<void>}
 */
export async function createHandoffAndRedirect({
  email = null,
  firstName = null,
  lastName = null,
  company = null,
  extraAttribution = {},
  destination = '/welcome',
} = {}) {
  const appUrl = import.meta.env.VITE_APP_URL || 'https://app.infraclean.cloud';
  
  try {
    // Collect all attribution data
    const currentAttribution = getAttributionData();
    const storedUtm = getStoredUtmParams();
    
    const attribution = {
      ...currentAttribution,
      ...(storedUtm || {}),
      ...extraAttribution,
      // Track form data context
      hasEmail: !!email,
      hasName: !!(firstName || lastName),
      hasCompany: !!company,
    };

    // Create handoff token via API
    const result = await createHandoffToken({
      email,
      attribution,
      expiresInMinutes: 30,
    });

    // Build redirect URL with token
    const targetUrl = new URL(destination, appUrl);
    targetUrl.searchParams.set('token', result.token);
    
    // Also pass pre-fill data as URL params (backup in case token fails)
    if (email) targetUrl.searchParams.set('email', email);
    if (firstName) targetUrl.searchParams.set('firstName', firstName);
    if (lastName) targetUrl.searchParams.set('lastName', lastName);
    if (company) targetUrl.searchParams.set('company', company);

    // Redirect
    window.location.href = targetUrl.toString();
    
  } catch (error) {
    console.warn('Handoff token creation failed, falling back to direct redirect:', error);
    
    // Fallback: redirect without token but with params
    const targetUrl = new URL(destination === '/welcome' ? '/signup' : destination, appUrl);
    
    if (email) targetUrl.searchParams.set('email', email);
    if (firstName) targetUrl.searchParams.set('firstName', firstName);
    if (lastName) targetUrl.searchParams.set('lastName', lastName);
    if (company) targetUrl.searchParams.set('company', company);
    
    // Preserve UTM params in fallback
    const utmData = getStoredUtmParams() || getAttributionData();
    if (utmData.source) targetUrl.searchParams.set('utm_source', utmData.source);
    if (utmData.medium) targetUrl.searchParams.set('utm_medium', utmData.medium);
    if (utmData.campaign) targetUrl.searchParams.set('utm_campaign', utmData.campaign);

    window.location.href = targetUrl.toString();
  }
}

/**
 * Simple redirect without handoff token
 * Use for cases where we don't need to track attribution
 * @param {string} path - Destination path
 * @param {Object} params - URL parameters to include
 */
export function redirectToApp(path, params = {}) {
  const appUrl = import.meta.env.VITE_APP_URL || 'https://app.infraclean.cloud';
  const targetUrl = new URL(path, appUrl);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) targetUrl.searchParams.set(key, value);
  });

  window.location.href = targetUrl.toString();
}

export default {
  createHandoffToken,
  createHandoffAndRedirect,
  getAttributionData,
  getStoredUtmParams,
  storeUtmParams,
  redirectToApp,
};
