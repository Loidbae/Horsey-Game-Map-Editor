'use strict';

HME.THEMES = {
    dark: {
        name: 'Dark',
        vars: {
            '--bg':               '#1a1a1a',
            '--bg2':              '#222222',
            '--bg3':              '#2c2c2c',
            '--border':           'rgba(255,255,255,0.09)',
            '--border2':          'rgba(255,255,255,0.18)',
            '--text':             '#e0e0e0',
            '--text2':            '#888888',
            '--accent':           '#378ADD',
            '--accent2':          'rgba(55,138,221,0.18)',
            '--warn':             '#c8a83a',
            '--danger':           '#cc4444',
            '--success':          '#44aa66',
            '--item-bg':          '#252525',
            '--item-hover-bg':    '#2a3245',
            '--chip-bg':          '#282828',
            '--accent-text':      '#60b8ff',
            '--accent-text2':     '#88ccff',
            '--code-color':       '#8ad0f0',
            '--danger-text':      '#f07070',
            '--canvas-bg':        '#08111a',
            '--font-ui':          "'Pixelify Sans', -apple-system, sans-serif",
            '--heading-color':    '#888888',
            '--accent-border-lo': 'rgba(55,138,221,0.35)',
            '--accent-border-hi': 'rgba(55,138,221,0.45)',
            '--accent-glow':      'rgba(55,138,221,0.7)',
            '--tool-btn-arrow-pad': '6.5px 10px',
        }
    },
    light: {
        name: 'Light',
        vars: {
            '--bg':               '#f5f5f5',
            '--bg2':              '#ffffff',
            '--bg3':              '#eaeaea',
            '--border':           'rgba(0,0,0,0.09)',
            '--border2':          'rgba(0,0,0,0.18)',
            '--text':             '#1a1a1a',
            '--text2':            '#666666',
            '--accent':           '#cc2222',
            '--accent2':          'rgba(204,34,34,0.12)',
            '--warn':             '#a07800',
            '--danger':           '#cc2222',
            '--success':          '#1a8844',
            '--item-bg':          '#f0f0f0',
            '--item-hover-bg':    '#f8dada',
            '--chip-bg':          '#ebebeb',
            '--accent-text':      '#aa1a1a',
            '--accent-text2':     '#881010',
            '--code-color':       '#aa2020',
            '--danger-text':      '#cc2222',
            '--canvas-bg':        '#c8d8e8',
            '--font-ui':          "'Pixelify Sans', -apple-system, sans-serif",
            '--heading-color':    '#666666',
            '--accent-border-lo': 'rgba(204,34,34,0.35)',
            '--accent-border-hi': 'rgba(204,34,34,0.45)',
            '--accent-glow':      'rgba(204,34,34,0.7)',
            '--tool-btn-arrow-pad': '6.5px 10px',
        }
    },
    hinamizawa: {
        name: 'Hinamizawa',
        vars: {
            '--bg':               '#0d1117',
            '--bg2':              '#161b22',
            '--bg3':              '#1c2330',
            '--border':           'rgba(48,54,61,0.6)',
            '--border2':          '#30363d',
            '--text':             '#e6edf3',
            '--text2':            '#8b949e',
            '--accent':           '#f59e0b',
            '--accent2':          'rgba(251,191,36,0.12)',
            '--warn':             '#eab308',
            '--danger':           '#ef4444',
            '--success':          '#22c55e',
            '--item-bg':          '#131720',
            '--item-hover-bg':    '#1e2535',
            '--chip-bg':          '#131720',
            '--accent-text':      '#fbbf24',
            '--accent-text2':     '#fde68a',
            '--code-color':       '#fcd34d',
            '--danger-text':      '#f87171',
            '--canvas-bg':        '#060810',
            '--font-ui':          "'Rajdhani', 'Pixelify Sans', sans-serif",
            '--heading-color':    '#fbbf24',
            '--accent-border-lo': 'rgba(245,158,11,0.4)',
            '--accent-border-hi': 'rgba(245,158,11,0.6)',
            '--accent-glow':      'rgba(251,191,36,0.7)',
            '--tool-btn-arrow-pad': '7.5px 10px',
        }
    },
};

HME._THEME_KEY        = 'hme_theme';
HME._THEME_COOKIE     = 'hme_theme';
HME._IFRAME_INIT_KEY  = 'hme_iframe_init';

HME._setThemeCookie = function(value, days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = HME._THEME_COOKIE + '=' + value
        + ';expires=' + d.toUTCString()
        + ';path=/;SameSite=Lax';
};

HME._getThemeCookie = function() {
    const name = HME._THEME_COOKIE + '=';
    const ca   = document.cookie.split(';');
    for (let c of ca) {
        c = c.trim();
        if (c.startsWith(name)) return c.substring(name.length);
    }
    return null;
};

HME.getStoredTheme = function() {
    let id = null;
    try { id = sessionStorage.getItem(HME._THEME_KEY); } catch(e) {}
    if (!id || !HME.THEMES[id]) id = HME._getThemeCookie();
    if (!id || !HME.THEMES[id]) id = 'dark';
    return id;
};

HME._getCookie = function(name) {
    const prefix = name + '=';
    for (let c of document.cookie.split(';')) {
        c = c.trim();
        if (c.startsWith(prefix)) return c.substring(prefix.length);
    }
    return null;
};

HME.applyTheme = function(id) {
    const theme = HME.THEMES[id] || HME.THEMES.dark;
    const root  = document.documentElement;
    for (const [k, v] of Object.entries(theme.vars)) {
        root.style.setProperty(k, v);
    }
    try { sessionStorage.setItem(HME._THEME_KEY, id); } catch(e) {}
    HME._setThemeCookie(id, 30);
    const sel = document.getElementById('theme-select');
    if (sel) sel.value = id;
    const sel2 = document.getElementById('setup-theme-select');
    if (sel2) sel2.value = id;
};

HME._detectIframeTheme = function() {
    if (window === window.parent) return;
    try {
        const ref = document.referrer || '';
        if (!ref.includes('hinamizawa.ai')) return;
    } catch(e) { return; }

    if (HME._getCookie(HME._IFRAME_INIT_KEY)) return;

    try { sessionStorage.removeItem(HME._THEME_KEY); } catch(e) {}
    document.cookie = HME._THEME_COOKIE + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax';

    HME.applyTheme('hinamizawa');

    const exp = new Date();
    exp.setTime(exp.getTime() + 365 * 24 * 60 * 60 * 1000);
    document.cookie = HME._IFRAME_INIT_KEY + '=1;expires=' + exp.toUTCString() + ';path=/;SameSite=Lax';
};

HME.initTheme = function() {
    HME._detectIframeTheme();
    const id = HME.getStoredTheme();
    HME.applyTheme(id);
};

HME.initTheme();
