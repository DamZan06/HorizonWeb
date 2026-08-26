(function () {
    function init() {
        const form = document.getElementById('adminLoginForm');
        const error = document.getElementById('adminLoginError');
        const mode = document.getElementById('adminModeLabel');
        const config = window.HorizonFirebaseConfig || {};
        const configured = Boolean(config.apiKey && config.databaseURL && window.firebase);
        if (mode) mode.textContent = configured ? 'Changes are published through authenticated Firebase services.' : 'Publishing is disabled: Firebase credentials are not configured in this repository.';
        form?.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!configured) { if (error) error.textContent = 'Admin sign-in is unavailable until Firebase public client configuration is supplied.'; return; }
            try {
                if (!window.firebase.apps.length) window.firebase.initializeApp(config);
                const data = new FormData(form); await window.firebase.auth().signInWithEmailAndPassword(String(data.get('email') || ''), String(data.get('password') || ''));
                document.getElementById('adminLocked').hidden = true; document.getElementById('adminApp').hidden = false;
            } catch (failure) { if (error) error.textContent = 'Sign-in failed. Check the account and Firebase configuration.'; }
        });
        document.getElementById('adminLogoutBtn')?.addEventListener('click', async () => { if (window.firebase?.apps?.length) await window.firebase.auth().signOut(); location.reload(); });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
