(function () {
  const GTM_ID = 'GTM-P56Q566B';
  const DATA_LAYER_NAME = 'dataLayer';
  const win = window;
  const doc = document;

  if (win.__nanndemoyaGoogleTagManagerLoaded) {
    return;
  }

  win.__nanndemoyaGoogleTagManagerLoaded = true;
  const dataLayer = win[DATA_LAYER_NAME] = win[DATA_LAYER_NAME] || [];

  const pushEvent = (payload) => {
    if (payload && typeof payload === 'object') {
      dataLayer.push(payload);
    }
  };

  const normalizeText = (value) => value ? value.replace(/\s+/g, ' ').trim() : '';

  const applyTrackingOptions = (element, payload) => {
    if (element.dataset.googleSendTo) {
      payload.send_to = element.dataset.googleSendTo;
    }

    if (element.dataset.googleCurrency) {
      payload.currency = element.dataset.googleCurrency;
    }

    if (element.dataset.googleValue) {
      const numericValue = Number(element.dataset.googleValue);
      payload.value = Number.isNaN(numericValue) ? element.dataset.googleValue : numericValue;
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
    pushEvent({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });

    const script = doc.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(GTM_ID);

    const firstScript = doc.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
      return;
    }

    (doc.head || doc.documentElement).appendChild(script);
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
      event_label: link.dataset.googleLabel || normalizeText(link.textContent) || url.href,
      link_url: url.href,
      link_text: normalizeText(link.textContent)
    };

    applyTrackingOptions(link, payload);
    pushEvent(payload);
  };

  win.nanndemoyaGoogleTag = {
    pushEvent(eventName, params) {
      if (!eventName) {
        return;
      }

      pushEvent({
        event: eventName,
        ...(params || {})
      });
    },
    trackConversion(params) {
      pushEvent({
        event: 'conversion',
        ...(params || {})
      });
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

  loadGoogleTagManager();
})();
