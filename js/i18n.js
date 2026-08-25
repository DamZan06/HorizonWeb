(function () {
    const catalog = {
        it: {
            common: {
                nav: ['Home', 'Live', 'Dashboard', 'Galleria', 'Replay', 'Progressi', 'Il progetto']
            }
        },
        en: {
            common: {
                nav: ['Home', 'Live', 'Dashboard', 'Gallery', 'Replay', 'Progress', 'Project']
            }
        }
    };

    function resolveLanguage(lang) {
        const normalized = String(lang || '').toLowerCase();
        return catalog[normalized] ? normalized : 'it';
    }

    window.NorthLineI18n = {
        catalog,
        resolveLanguage
    };
})();
