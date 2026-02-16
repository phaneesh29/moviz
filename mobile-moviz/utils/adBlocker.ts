// Known ad/tracker domains to block
const AD_DOMAINS = [
  "doubleclick.net",
  "googlesyndication.com",
  "googleadservices.com",
  "google-analytics.com",
  "googletagmanager.com",
  "facebook.net",
  "facebook.com/tr",
  "adservice.google.com",
  "pagead2.googlesyndication.com",
  "adclick",
  "adskeeper.co.uk",
  "adskeeper.com",
  "adsterra.com",
  "adsterratools.com",
  "popads.net",
  "popcash.net",
  "propellerads.com",
  "trafficjunky.com",
  "exoclick.com",
  "juicyads.com",
  "clickadu.com",
  "hilltopads.net",
  "richpush.co",
  "pushhouse.io",
  "a-ads.com",
  "ad-maven.com",
  "admaven.com",
  "bidvertiser.com",
  "revcontent.com",
  "mgid.com",
  "taboola.com",
  "outbrain.com",
  "zergnet.com",
  "content.ad",
  "redirectgate.com",
  "adfoc.us",
  "bc.vc",
  "sh.st",
  "linkbucks.com",
  "adfly.com",
  "adf.ly",
  "shorte.st",
  "voluum.com",
  "tracking.com",
  "track.com",
  "clicktracker",
  "syndication.com",
  "popunder",
  "pop-under",
  "popup",
  "pop-up",
  "banner",
  "ads.js",
  "vastcdn",
  "vidorev",
  "betterdeals",
  "streamads",
];

/** Allowed domains — only these + your own site will load */
export const ALLOWED_DOMAINS = [
  "vidoza.vercel.app",
  "vidsrc.me",
  "vidsrc.to",
  "vidsrc.xyz",
  "vidsrc.in",
  "vidsrc.net",
  "vidsrc.cc",
  "vidsrc.pm",
  "embed.su",
  "embedsu.com",
  "player.videasy.net",
  "vidlink.pro",
  "vidbinge.dev",
  "moviesapi.club",
  "multiembed.mov",
  "multiembed.com",
  "2embed.org",
  "2embed.cc",
  "autoembed.co",
  "autoembed.cc",
  "smashystream.com",
  "smashystream.xyz",
  "nontongo.win",
  "player.smashy.stream",
  "susflix.tv",
  "gomovies.sx",
  "vidfast.pro",
  "vidplus.top",
  "cinemaosfree.com",
  "videasy.net",
];

export function isAdUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return AD_DOMAINS.some((domain) => lower.includes(domain));
}

export function isAllowedUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return ALLOWED_DOMAINS.some(
      (d) => hostname === d || hostname.endsWith(`.${d}`)
    );
  } catch {
    return false;
  }
}

/** JavaScript injected into WebView to block popups, ads, and redirects */
export const AD_BLOCK_JS = `
  (function() {
    // Block window.open (popups)
    window.open = function() { return null; };

    // Block alert/confirm/prompt popups
    window.alert = function() {};
    window.confirm = function() { return false; };
    window.prompt = function() { return null; };

    // Prevent overwriting window.open
    Object.defineProperty(window, 'open', {
      value: function() { return null; },
      writable: false,
      configurable: false
    });

    // Block _blank links from opening externally
    document.addEventListener('click', function(e) {
      var target = e.target;
      while (target && target !== document) {
        if (target.tagName === 'A') {
          if (target.getAttribute('target') === '_blank') {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        }
        target = target.parentElement;
      }
    }, true);

    // Remove ad iframes & overlays
    function removeAds() {
      var selectors = [
        'iframe[src*="ad"]',
        'iframe[src*="pop"]',
        'iframe[src*="banner"]',
        'div[class*="ad-"]',
        'div[class*="ads-"]',
        'div[class*="popup"]',
        'div[id*="ad-"]',
        'div[id*="ads-"]',
        'div[id*="popup"]',
        '.ad-overlay',
        '.overlay-ad',
        '[onclick*="window.open"]',
      ];
      selectors.forEach(function(sel) {
        document.querySelectorAll(sel).forEach(function(el) {
          el.remove();
        });
      });
    }

    removeAds();
    setInterval(removeAds, 1500);

    // Block meta refresh redirects
    var metas = document.querySelectorAll('meta[http-equiv="refresh"]');
    metas.forEach(function(m) { m.remove(); });

    // Guard history pushState/replaceState abuse
    var origPush = history.pushState;
    var origReplace = history.replaceState;
    history.pushState = function() {
      try { return origPush.apply(this, arguments); } catch(e) {}
    };
    history.replaceState = function() {
      try { return origReplace.apply(this, arguments); } catch(e) {}
    };

    true;
  })();
`;
