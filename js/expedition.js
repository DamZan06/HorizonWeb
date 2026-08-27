(function () {
    const valid = (value) => Number.isFinite(Number(value));
    function estimateCaloriesBurnedKcal(totalDistanceKm, durationSeconds, elevationGainM, heartRateBpm = null) {
        const distance = Math.max(0, Number(totalDistanceKm) || 0);
        const movingHours = Math.max(0, Number(durationSeconds) || 0) / 3600;
        const elevation = Math.max(0, Number(elevationGainM) || 0);
        const heartRate = Number(heartRateBpm);

        let estimate = distance * 70 + movingHours * 260 + elevation * 0.16;

        if (Number.isFinite(heartRate) && heartRate > 0) {
            const hrFactor = Math.max(0, (heartRate - 100) / 80);
            estimate += estimate * (hrFactor * 0.08);
        }

        return Math.round(estimate);
    }

    function estimateWaterLostLiters(totalDistanceKm, durationSeconds, elevationGainM, heartRateBpm = null) {
        const distance = Math.max(0, Number(totalDistanceKm) || 0);
        const movingHours = Math.max(0, Number(durationSeconds) || 0) / 3600;
        const elevation = Math.max(0, Number(elevationGainM) || 0);
        const heartRate = Number(heartRateBpm);

        let estimate = movingHours * 0.55 + distance * 0.035 + elevation * 0.0012;

        if (Number.isFinite(heartRate) && heartRate > 0) {
            const hrFactor = Math.max(0, (heartRate - 100) / 70);
            estimate += hrFactor * 0.12;
        }

        return Number(Math.max(0, estimate).toFixed(1));
    }

    function calculateEta({remainingDistanceKm,recentMovingSpeedKmh,movingAverageSpeedKmh,averageSpeedKmh,latestPointTimestamp,now=Date.now(),pointCount=0,finished=false}) {
        if(finished||pointCount<2||!valid(remainingDistanceKm)||Number(remainingDistanceKm)<=0||!valid(latestPointTimestamp))return {eta:null,basis:null,speedKmh:null};

        const overallSpeed = Number(averageSpeedKmh);
        const movingSpeed = Number(movingAverageSpeedKmh);
        const recentSpeed = Number(recentMovingSpeedKmh);

        const usable = (speed) => valid(speed) && speed >= 0.5 && speed < 80;
        const selected = usable(recentSpeed) && usable(movingSpeed)
            ? ['recent-and-moving', recentSpeed * 0.65 + movingSpeed * 0.35]
            : usable(recentSpeed)
                ? ['recent', recentSpeed]
                : usable(movingSpeed)
                    ? ['moving-average', movingSpeed]
                    : usable(overallSpeed)
                        ? ['overall-average', overallSpeed]
                        : null;

        return selected ? { eta: Number(now) + (Number(remainingDistanceKm) / Number(selected[1])) * 3600000, basis: selected[0], speedKmh: Number(selected[1]) } : { eta: null, basis: null, speedKmh: null };
    }
    function calculateSummary({ points = [], routeMeta, now = Date.now() }) {
        const list = points.filter((p)=>valid(p.latitude)&&valid(p.longitude)&&valid(p.timestamp)).slice().sort((a,b)=>a.timestamp-b.timestamp);
        const plannedDistanceKm = valid(routeMeta?.distanceKm) ? Number(routeMeta.distanceKm) : Number(window.HorizonConfig?.expectedDistanceKm || 500);
        const latestPoint=list.at(-1)||null, firstPoint=list[0]||null;
        const recordedDistance=valid(latestPoint?.cumulativeDistanceKm)?Number(latestPoint.cumulativeDistanceKm):window.HorizonStats.routeDistance(list);
        const coveredDistanceKm=window.HorizonStats.clamp(recordedDistance,0,plannedDistanceKm);
        let movingTimeMs=0,movingDistanceKm=0,maxSpeedKmh=0;
        const movingSamples=[];
        for(let i=1;i<list.length;i++){
            const delta=Math.max(0,list[i].timestamp-list[i-1].timestamp), segmentKm=window.HorizonStats.distanceKm(list[i-1],list[i]);
            const reportedSpeed=Number(list[i].speed), inferredSpeed=delta>0?segmentKm/(delta/3600000):null;
            const speed=valid(reportedSpeed)&&reportedSpeed>=0&&reportedSpeed<80?reportedSpeed:inferredSpeed;
            if(valid(speed)&&speed>0.5&&speed<80&&delta<=300000){movingTimeMs+=delta;movingDistanceKm+=segmentKm;movingSamples.push({timestamp:list[i].timestamp,speed});}
            if(valid(speed)&&speed<80)maxSpeedKmh=Math.max(maxSpeedKmh,speed);
        }
        const elapsedTimeMs=firstPoint&&latestPoint?Math.max(0,latestPoint.timestamp-firstPoint.timestamp):0;
        const averageSpeedKmh=elapsedTimeMs>0?coveredDistanceKm/(elapsedTimeMs/3600000):null;
        const movingAverageSpeedKmh=movingTimeMs>0?movingDistanceKm/(movingTimeMs/3600000):null;
        const recent=movingSamples.filter((sample)=>latestPoint&&sample.timestamp>=latestPoint.timestamp-3600000);
        const recentMovingSpeedKmh=recent.length?recent.reduce((sum,sample)=>sum+sample.speed,0)/recent.length:null;
        const distanceToFinishKm = latestPoint && routeMeta?.finish
            ? window.HorizonStats.distanceKm(latestPoint, routeMeta.finish)
            : null;
        const isAtFinish = Number.isFinite(distanceToFinishKm) && distanceToFinishKm <= 0.02;
        const remainingDistanceKm=isAtFinish ? 0 : Math.max(0,plannedDistanceKm-coveredDistanceKm);
        const completionPercent=isAtFinish ? 100 : window.HorizonStats.clamp(coveredDistanceKm/plannedDistanceKm*100,0,100);
        const finished = isAtFinish || completionPercent>=99.9;
        const state=window.HorizonStatus.getExpeditionState({now,startDate:window.HorizonConfig.startDateIso,hasValidPoints:Boolean(list.length),latestPointTimestamp:latestPoint?.timestamp,trackerState:latestPoint?.trackerState,finished});
        const etaResult=calculateEta({remainingDistanceKm,recentMovingSpeedKmh,movingAverageSpeedKmh,averageSpeedKmh,latestPointTimestamp:latestPoint?.timestamp,now,pointCount:list.length,finished});
        const heartRates=list.map(p=>Number(p.heartRate)).filter(v=>valid(v)&&v>30&&v<240);
        const heartRateBpm = valid(latestPoint?.heartRate) ? Number(latestPoint.heartRate) : null;
        const caloriesBurned = estimateCaloriesBurnedKcal(coveredDistanceKm, Math.max(0, elapsedTimeMs / 1000), window.HorizonStats.elevationGain(list), heartRateBpm);
        const waterLostLiters = estimateWaterLostLiters(coveredDistanceKm, Math.max(0, elapsedTimeMs / 1000), window.HorizonStats.elevationGain(list), heartRateBpm);
        return {started:Boolean(list.length),state,plannedDistanceKm,plannedElevationGainM:Number(routeMeta?.elevationGainM)||null,coveredDistanceKm,remainingDistanceKm,completionPercent,completedAt:finished?latestPoint?.timestamp||null:null,actualStartTimestamp:firstPoint?.timestamp||null,elapsedTimeMs,movingTimeMs,stoppedTimeMs:Math.max(0,elapsedTimeMs-movingTimeMs),currentSpeedKmh:valid(latestPoint?.speed)?Number(latestPoint.speed):null,averageSpeedKmh,movingAverageSpeedKmh,recentMovingSpeedKmh,maxSpeedKmh,currentAltitudeM:valid(latestPoint?.altitude)?Number(latestPoint.altitude):null,actualElevationGainM:window.HorizonStats.elevationGain(list),actualElevationLossM:window.HorizonStats.elevationLoss(list),currentHeartRateBpm:heartRateBpm,averageHeartRateBpm:heartRates.length?heartRates.reduce((a,b)=>a+b,0)/heartRates.length:null,maxHeartRateBpm:heartRates.length?Math.max(...heartRates):null,latestPoint,latestPointTimestamp:latestPoint?.timestamp||null,signalAgeMs:latestPoint?Math.max(0,now-latestPoint.timestamp):null,eta:etaResult.eta,etaBasis:etaResult.basis,etaSpeedKmh:etaResult.speedKmh,caloriesBurned,waterLostLiters,routeMeta,points:list};
    }
    async function loadSummary(options){const [points,routeMeta]=await Promise.all([window.HorizonFirebase.fetchLiveTrack(options),window.HorizonRoute.fetchMetadata()]);return calculateSummary({points,routeMeta});}
    window.HorizonExpedition={calculateEta,calculateSummary,estimateCaloriesBurnedKcal,estimateWaterLostLiters,loadSummary};
})();
