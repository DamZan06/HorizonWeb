(function () {
    let metadataPromise;
    function fetchMetadata() {
        if (!metadataPromise) metadataPromise = fetch(window.HorizonConfig.routeMetaUrl, { headers:{Accept:'application/json'} }).then((response)=>{if(!response.ok)throw new Error(`${window.HorizonI18n?.t?.('copy:Route metadata unavailable') || 'Route metadata unavailable'} (${response.status})`);return response.json();});
        return metadataPromise;
    }
    window.HorizonRoute = { fetchMetadata };
})();
