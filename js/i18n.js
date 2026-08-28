(function () {
    const SUPPORTED_LANGUAGES = ['en', 'it', 'de', 'fr'];
    const DEFAULT_LANGUAGE = 'en';
    const STORAGE_KEY = 'horizon-language';
    const locales = Object.create(null);
    const reportedMissingKeys = new Set();

    function registerLocale(language, messages) {
        const normalized = String(language || '').toLowerCase();
        if (!SUPPORTED_LANGUAGES.includes(normalized)) {
            throw new Error(`Unsupported HORIZON locale: ${language}`);
        }
        locales[normalized] = messages || {};
    }

    function resolveLanguage(language) {
        const normalized = String(language || '').trim().toLowerCase().split('-')[0];
        return SUPPORTED_LANGUAGES.includes(normalized) ? normalized : DEFAULT_LANGUAGE;
    }

    function valueAtPath(object, path) {
        return String(path || '').split('.').reduce((current, key) => current && current[key], object);
    }

    function interpolate(value, variables) {
        if (!variables) return value;
        return value.replace(/\{([A-Za-z0-9_]+)\}/g, (match, key) => (
            Object.prototype.hasOwnProperty.call(variables, key) ? String(variables[key]) : match
        ));
    }

    function t(path, language, variables) {
        const selected = resolveLanguage(language || document.documentElement.lang);
        const translated = valueAtPath(locales[selected], path);
        const fallback = valueAtPath(locales[DEFAULT_LANGUAGE], path);
        const value = typeof translated === 'string' ? translated : fallback;

        if (typeof value !== 'string') {
            const missingId = `${selected}:${path}`;
            if (!reportedMissingKeys.has(missingId)) {
                reportedMissingKeys.add(missingId);
                console.warn(`[i18n] Missing translation key "${path}" for "${selected}".`);
            }
            return '';
        }

        return interpolate(value, variables);
    }

    function translateElement(node, language) {
        const value = t(node.dataset.i18n, language);
        if (value) node.textContent = value;
    }

    function translateAttributes(node, language) {
        let attributes;
        try {
            attributes = JSON.parse(node.dataset.i18nAttr);
        } catch (error) {
            console.warn('[i18n] Invalid data-i18n-attr value.', error);
            return;
        }

        Object.entries(attributes).forEach(([attribute, key]) => {
            const value = t(key, language);
            if (value) node.setAttribute(attribute, value);
        });
    }

    function applyLanguagePreference(language, options) {
        const normalized = resolveLanguage(language);
        const settings = options || {};
        document.documentElement.lang = normalized;
        document.body?.setAttribute('data-lang', normalized);

        document.querySelectorAll('[data-i18n]').forEach((node) => translateElement(node, normalized));
        document.querySelectorAll('[data-i18n-attr]').forEach((node) => translateAttributes(node, normalized));
        document.querySelectorAll('.lang-switcher-select').forEach((select) => {
            select.value = normalized;
        });

        if (settings.persist !== false) {
            try { localStorage.setItem(STORAGE_KEY, normalized); } catch (error) { /* Storage may be unavailable. */ }
        }

        document.dispatchEvent(new CustomEvent('horizon:languagechange', {
            detail: { language: normalized }
        }));
        return normalized;
    }

    function hydrateLanguageControls() {
        let stored = '';
        try { stored = localStorage.getItem(STORAGE_KEY) || ''; } catch (error) { /* Storage may be unavailable. */ }
        const browserLanguage = navigator.language || navigator.languages?.[0] || '';
        const preferred = resolveLanguage(stored || browserLanguage || document.documentElement.lang);

        document.querySelectorAll('.lang-switcher-select').forEach((select) => {
            if (select.dataset.i18nBound !== 'true') {
                select.dataset.i18nBound = 'true';
                select.addEventListener('change', (event) => applyLanguagePreference(event.target.value));
            }
        });

        return applyLanguagePreference(preferred, { persist: Boolean(stored) });
    }

    window.HorizonI18n = {
        DEFAULT_LANGUAGE,
        SUPPORTED_LANGUAGES,
        locales,
        catalog: locales,
        registerLocale,
        resolveLanguage,
        applyLanguagePreference,
        hydrateLanguageControls,
        t
    };
})();
