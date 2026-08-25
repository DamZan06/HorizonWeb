(function () {
    function setStatus(message) {
        const statusNodes = document.querySelectorAll('[data-live-status], .map-status, #mapStatus');
        statusNodes.forEach((node) => {
            node.textContent = message;
        });
    }

    function setLoadingState(message) {
        setStatus(message);
    }

    function setMapStatus(message) {
        setStatus(message);
    }

    window.HorizonUI = {
        setStatus,
        setLoadingState,
        setMapStatus
    };
})();
