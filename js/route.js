(function () {
    let metadataPromise;
    function fetchMetadata() {
        if (!metadataPromise) metadataPromise = fetch(window.HorizonConfig.routeMetaUrl, { headers:{Accept:'application/json'} }).then((response)=>{if(!response.ok)throw new Error(`Route metadata unavailable (${response.status})`);return response.json();});
        return metadataPromise;
    }
    window.HorizonRoute = { fetchMetadata };
})();
