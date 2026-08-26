(function () {
    const valid = (value) => Number.isFinite(Number(value));
    function calculateEta({remainingDistanceKm,recentMovingSpeedKmh,movingAverageSpeedKmh,averageSpeedKmh,latestPointTimestamp,now=Date.now(),pointCount=0,finished=false}) {
        if(finished||pointCount<2||!valid(remainingDistanceKm)||Number(remainingDistanceKm)<=0||!valid(latestPointTimestamp))return {eta:null,basis:null,speedKmh:null};
        const selected=[['recent',recentMovingSpeedKmh],['moving-average',movingAverageSpeedKmh],['overall-average',averageSpeedKmh]].find(([,speed])=>valid(speed)&&Number(speed)>=.8&&Number(speed)<80);
        return selected?{eta:Number(now)+Number(remainingDistanceKm)/Number(selected[1])*3600000,basis:selected[0],speedKmh:Number(selected[1])}:{eta:null,basis:null,speedKmh:null};
    }
    function calculateSummary({ points = [], routeMeta, now = Date.now() }) {
        const list = points.filter((p)=>valid(p.latitude)&&valid(p.longitude)&&valid(p.timestamp)).slice().sort((a,b)=>a.timestamp-b.timestamp);
        const plannedDistanceKm = valid(routeMeta?.distanceKm) ? Number(routeMeta.distanceKm) : Number(window.HorizonConfig?.expectedDistanceKm || 500);
        const latestPoint=list.at(-1)||null, firstPoint=list[0]||null;
        const recordedDistance=valid(latestPoint?.cumulativeDistanceKm)?Number(latestPoint.cumulativeDistanceKm):window.HorizonStats.routeDistance(list);
        const coveredDistanceKm=window.HorizonStats.clamp(recordedDistance,0,plannedDistanceKm);
        let movingTimeMs=0,movingDistanceKm=0,maxSpeedKmh=0,elevationLossM=0;
        for(let i=1;i<list.length;i++){const delta=Math.max(0,list[i].timestamp-list[i-1].timestamp),speed=Number(list[i].speed);if(valid(speed)&&speed>0.5&&speed<80&&delta<=300000){movingTimeMs+=delta;movingDistanceKm+=window.HorizonStats.distanceKm(list[i-1],list[i]);}if(valid(speed)&&speed<80)maxSpeedKmh=Math.max(maxSpeedKmh,speed);}
        const elapsedTimeMs=firstPoint&&latestPoint?Math.max(0,latestPoint.timestamp-firstPoint.timestamp):0;
        const averageSpeedKmh=elapsedTimeMs>0?coveredDistanceKm/(elapsedTimeMs/3600000):null;
        const movingAverageSpeedKmh=movingTimeMs>0?movingDistanceKm/(movingTimeMs/3600000):null;
        const recent=list.filter((p)=>latestPoint&&p.timestamp>=latestPoint.timestamp-3600000&&Number(p.speed)>0.5&&Number(p.speed)<80);
        const recentMovingSpeedKmh=recent.length?recent.reduce((sum,p)=>sum+Number(p.speed),0)/recent.length:null;
        const remainingDistanceKm=Math.max(0,plannedDistanceKm-coveredDistanceKm), completionPercent=window.HorizonStats.clamp(coveredDistanceKm/plannedDistanceKm*100,0,100);
        const state=window.HorizonStatus.getExpeditionState({now,startDate:window.HorizonConfig.startDateIso,hasValidPoints:Boolean(list.length),latestPointTimestamp:latestPoint?.timestamp,trackerState:latestPoint?.trackerState,finished:completionPercent>=99.9});
        const etaResult=calculateEta({remainingDistanceKm,recentMovingSpeedKmh,movingAverageSpeedKmh,averageSpeedKmh,latestPointTimestamp:latestPoint?.timestamp,now,pointCount:list.length,finished:completionPercent>=99.9});
        for(let i=1;i<list.length;i++){const delta=Number(list[i].altitude)-Number(list[i-1].altitude);if(valid(delta)&&delta < -2 && delta > -200)elevationLossM+=Math.abs(delta);}
        const heartRates=list.map(p=>Number(p.heartRate)).filter(v=>valid(v)&&v>30&&v<240);
        return {started:Boolean(list.length),state,plannedDistanceKm,plannedElevationGainM:Number(routeMeta?.elevationGainM)||null,coveredDistanceKm,remainingDistanceKm,completionPercent,actualStartTimestamp:firstPoint?.timestamp||null,elapsedTimeMs,movingTimeMs,stoppedTimeMs:Math.max(0,elapsedTimeMs-movingTimeMs),currentSpeedKmh:valid(latestPoint?.speed)?Number(latestPoint.speed):null,averageSpeedKmh,movingAverageSpeedKmh,recentMovingSpeedKmh,maxSpeedKmh,currentAltitudeM:valid(latestPoint?.altitude)?Number(latestPoint.altitude):null,actualElevationGainM:window.HorizonStats.elevationGain(list),actualElevationLossM:elevationLossM,currentHeartRateBpm:valid(latestPoint?.heartRate)?Number(latestPoint.heartRate):null,averageHeartRateBpm:heartRates.length?heartRates.reduce((a,b)=>a+b,0)/heartRates.length:null,maxHeartRateBpm:heartRates.length?Math.max(...heartRates):null,latestPoint,latestPointTimestamp:latestPoint?.timestamp||null,signalAgeMs:latestPoint?Math.max(0,now-latestPoint.timestamp):null,eta:etaResult.eta,etaBasis:etaResult.basis,etaSpeedKmh:etaResult.speedKmh,routeMeta,points:list};
    }
    async function loadSummary(options){const [points,routeMeta]=await Promise.all([window.HorizonFirebase.fetchLiveTrack(options),window.HorizonRoute.fetchMetadata()]);return calculateSummary({points,routeMeta});}
    window.HorizonExpedition={calculateEta,calculateSummary,loadSummary};
})();
