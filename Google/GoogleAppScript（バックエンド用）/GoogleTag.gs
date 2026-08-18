function getGoogleTagConfig() {
  const tagId = getRequiredProperty(CONFIG_KEYS.googleTagManagerId);
  return {
    tagId,
    headSnippet: buildGoogleTagHeadSnippet(tagId),
    bodySnippet: buildGoogleTagBodySnippet(tagId)
  };
}

function buildGoogleTagHeadSnippet(tagId) {
  return [
    '<!-- Google Tag Manager -->',
    "<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':",
    "new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],",
    "j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=",
    "'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);",
    "})(window,document,'script','dataLayer','" + tagId + "');</script>",
    '<!-- End Google Tag Manager -->'
  ].join('\n');
}

function buildGoogleTagBodySnippet(tagId) {
  return [
    '<!-- Google Tag Manager (noscript) -->',
    '<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=' + tagId + '" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>',
    '<!-- End Google Tag Manager (noscript) -->'
  ].join('\n');
}
