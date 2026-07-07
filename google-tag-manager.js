(function () {
  const GTM_ID = 'GTM-P56Q566B';
  const GOOGLE_ADS_ID = 'AW-17751593563';
  const GA4_IDS = ['G-ZKMBJ3ZPGE', 'G-SPPEKLT0LH'];
  const DATA_LAYER_NAME = 'dataLayer';
  const CONSENT_COOKIE_NAME = 'nanndemoya_google_tag_consent';
  const CONSENT_ACCEPTED = 'accepted';
  const CONSENT_DECLINED = 'declined';
  const CONSENT_HIDDEN = 'hidden';
  const win = window;
  const doc = document;

  if (win.__nanndemoyaGoogleTagManagerLoaded) {
    return;
  }

  win.__nanndemoyaGoogleTagManagerLoaded = true;
  const dataLayer = (win[DATA_LAYER_NAME] = win[DATA_LAYER_NAME] || []);
  let isGoogleTagManagerScriptLoaded = false;
  let isTrackingDisabled = false;

  const getConsentStatus = () => {
    const cookiePrefix = CONSENT_COOKIE_NAME + '=';
    const cookies = doc.cookie ? doc.cookie.split(';') : [];
    for (let index = 0; index < cookies.length; index += 1) {
      const cookie = cookies[index].trim();
      if (cookie.indexOf(cookiePrefix) === 0) {
        return decodeURIComponent(cookie.substring(cookiePrefix.length));
      }
    }
    return '';
  };

  const setConsentStatus = (status, maxAgeSeconds) => {
    const maxAge = Number.isFinite(maxAgeSeconds) ? Math.max(0, Math.floor(maxAgeSeconds)) : 60 * 60 * 24 * 365;
    const secure = win.location.protocol === 'https:' ? '; Secure' : '';
    doc.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(status)}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
  };

  const isTrackingAllowed = () => getConsentStatus() === CONSENT_ACCEPTED && !isTrackingDisabled;

  const pushEvent = (payload) => {
    if (payload && typeof payload === 'object' && isTrackingAllowed()) {
      dataLayer.push(payload);
    }
  };

  const normalizeText = (value) => (value ?? '').toString().replace(/\s+/g, ' ').trim();

  const applyTrackingOptions = (element, payload) => {
    if (element.dataset.googleSendTo) {
      payload.send_to = element.dataset.googleSendTo;
    }

    if (element.dataset.googleCurrency) {
      payload.currency = element.dataset.googleCurrency;
    }

    if (element.dataset.googleValue) {
      const numericValue = Number(element.dataset.googleValue);
      if (!Number.isNaN(numericValue)) {
        payload.value = numericValue;
      }
    }
  };

  const trackElementEvent = (element, fallbackName) => {
    const payload = {
      event: element.dataset.googleEvent || fallbackName,
      event_category: element.dataset.googleCategory || 'engagement',
      event_label: element.dataset.googleLabel || normalizeText(element.textContent)
    };

    applyTrackingOptions(element, payload);
    pushEvent(payload);
  };

  const loadGoogleTagManager = () => {
    if (!isTrackingAllowed() || isGoogleTagManagerScriptLoaded) {
      return;
    }

    // Set up window.gtag and configure Google Ads + GA4 tags
    win.gtag = win.gtag || function () { dataLayer.push(arguments); };
    win.gtag('js', new Date());
    win.gtag('config', GOOGLE_ADS_ID);
    GA4_IDS.forEach(function (id) { win.gtag('config', id); });

    // Load gtag.js library (covers Google Ads and GA4)
    const gtagScript = doc.createElement('script');
    gtagScript.async = true;
    gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GOOGLE_ADS_ID);
    (doc.head || doc.documentElement).appendChild(gtagScript);

    // Load Google Tag Manager
    pushEvent({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });

    const script = doc.createElement('script');
    script.async = true;
    const dataLayerQueryParam = DATA_LAYER_NAME !== 'dataLayer' ? '&l=' + encodeURIComponent(DATA_LAYER_NAME) : '';
    script.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(GTM_ID) + dataLayerQueryParam;

    const firstScript = doc.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      (doc.head || doc.documentElement).appendChild(script);
    }

    isGoogleTagManagerScriptLoaded = true;
  };

  const disableTracking = () => {
    isTrackingDisabled = true;
    isGoogleTagManagerScriptLoaded = false;

    doc.querySelectorAll('script[src*="googletagmanager.com/gtm.js"],script[src*="googletagmanager.com/gtag/js"]').forEach((scriptNode) => {
      scriptNode.remove();
    });

    doc.querySelectorAll('iframe[src*="googletagmanager.com/ns.html"]').forEach((iframeNode) => {
      iframeNode.remove();
    });

    win.gtag = undefined;
  };

  const getTrackableUrl = (link) => {
    try {
      const url = new URL(link.href, win.location.href);
      const isSpecialProtocol = url.protocol === 'mailto:' || url.protocol === 'tel:';
      const isExternalLink = url.host !== win.location.host;
      const hasCustomEvent = Boolean(link.dataset.googleEvent);
      const shouldTrack = isSpecialProtocol || isExternalLink || hasCustomEvent;
      return shouldTrack ? url : null;
    } catch (error) {
      return null;
    }
  };

  const trackLinkClick = (link, url) => {
    const payload = {
      event: link.dataset.googleEvent || 'outbound_click',
      event_category: link.dataset.googleCategory || 'engagement',
      event_label: link.dataset.googleLabel || normalizeText(link.textContent) || url.pathname || url.href,
      link_url: url.href,
      link_text: normalizeText(link.textContent)
    };

    applyTrackingOptions(link, payload);
    pushEvent(payload);
  };

  win.nanndemoyaGoogleTag = {
    pushEvent(eventName, eventParams) {
      if (!eventName) {
        return;
      }

      pushEvent({
        event: eventName,
        ...(eventParams || {})
      });
    },
    trackConversion(params) {
      pushEvent({
        event: 'conversion',
        ...(params || {})
      });
      if (typeof win.gtag === 'function' && params && params.send_to) {
        win.gtag('event', 'conversion', params);
      }
    }
  };

  win.nanndemoyaGoogleTagConsent = {
    getStatus() {
      return getConsentStatus() || 'unset';
    },
    accept() {
      isTrackingDisabled = false;
      setConsentStatus(CONSENT_ACCEPTED);
      loadGoogleTagManager();
    },
    decline() {
      setConsentStatus(CONSENT_DECLINED);
      disableTracking();
    },
    hide() {
      setConsentStatus(CONSENT_HIDDEN, 60 * 60 * 24);
    }
  };

  doc.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const button = event.target.closest('button[data-google-event]');
    if (button) {
      trackElementEvent(button, 'button_click');
      return;
    }

    const link = event.target.closest('a[href]');
    if (link) {
      const url = getTrackableUrl(link);
      if (url) {
        trackLinkClick(link, url);
      }
    }
  });

  const initialConsentStatus = getConsentStatus();
  if (initialConsentStatus === CONSENT_DECLINED) {
    disableTracking();
    return;
  }

  if (initialConsentStatus === CONSENT_ACCEPTED) {
    loadGoogleTagManager();
  }
})();
