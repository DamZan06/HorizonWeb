(function(){
const S={charts:new Map(),points:[],summary:null},L=()=>document.documentElement.lang||'en';
const tx=(key,fallback)=>window.HorizonI18n?.t?.(key)||fallback||key;
const tr=()=>({na:tx("common.notAvailable", "Not available"),live:tx("common.live", "Live"),delayed:tx("dashboard.delayed", "Delayed"),resting:tx("dashboard.resting", "Resting"),ended:tx("common.endOfDay", "End of day"),finished:tx("common.finished", "Finished"),prestart:tx("common.notStarted", "Not started"),recent:tx("dashboard.basedOnTheLastHourOfMovement", "Based on the last hour of movement"),moving:tx("dashboard.basedOnAverageMovingSpeed", "Based on average moving speed")}),set=(id,v)=>{const n=document.getElementById(id);if(n)n.textContent=v},num=(v,d=1)=>new Intl.NumberFormat(L(),{minimumFractionDigits:d,maximumFractionDigits:d}).format(v),av=(v,u='',d=1)=>Number.isFinite(v)?num(v,d)+u:tr().na;
const date=v=>Number.isFinite(v)?new Intl.DateTimeFormat(L(),{dateStyle:'medium',timeStyle:'short'}).format(new Date(v)):tr().na;
const duration=v=>{if(!Number.isFinite(v))return tr().na;let x=Math.floor(v/1000),h=Math.floor(x/3600),m=Math.floor(x%3600/60),s=x%60;return[h,m,s].map(n=>String(n).padStart(2,'0')).join(':')};
const age=v=>{if(!Number.isFinite(v))return tr().na;let m=Math.floor(v/60000),x=m<60?m+' min':m<1440?Math.floor(m/60)+' h':Math.floor(m/1440)+' d',marker=tx("dashboard.ago", "ago");return ['de','fr'].includes(L())?marker+' '+x:x+' '+marker};

function update(s={}){
  S.summary=s;
  const p=s.latestPoint||{},r=s.routeMeta||{};
  const etaLabel=document.getElementById('metricEtaLabel');
  if(etaLabel)etaLabel.textContent=s.completedAt?tx("common.arrival", "Arrival"):tx("common.estimatedArrival", "Estimated arrival");
  const rows=[
    ['metricDistance',av(s.coveredDistanceKm,' km')],
    ['metricPlannedDistance',av(s.plannedDistanceKm,' km')],
    ['metricRemaining',av(s.remainingDistanceKm,' km')],
    ['metricCompletion',av(s.completionPercent,' %')],
    ['metricSpeed',av(s.currentSpeedKmh,' km/h')],
    ['metricAvgMovingSpeed',av(s.movingAverageSpeedKmh,' km/h')],
    ['metricAvgTotalSpeed',av(s.averageSpeedKmh,' km/h')],
    ['metricMaxSpeed',av(s.maxSpeedKmh,' km/h')],
    ['metricAltitude',av(s.currentAltitudeM,' m',0)],
    ['metricElevation',av(s.actualElevationGainM,' m',0)],
    ['metricElevationLoss',av(s.actualElevationLossM,' m',0)],
    ['metricPlannedElevation',av(s.plannedElevationGainM,' m',0)],
    ['metricTime',duration(s.elapsedTimeMs)],
    ['metricMovingTime',duration(s.movingTimeMs)],
    ['metricStoppedTime',duration(s.stoppedTimeMs)],
    ['metricActualDeparture',date(s.actualStartTimestamp)],
    ['metricLatestUpdate',date(s.latestPointTimestamp)],
    ['metricHeartRate',av(s.currentHeartRateBpm,' bpm',0)],
    ['metricHeartRateAvg',av(s.averageHeartRateBpm,' bpm',0)],
    ['metricHeartRateMax',av(s.maxHeartRateBpm,' bpm',0)],
    ['metricSteps',Number.isFinite(s.coveredDistanceKm)?'≈ '+new Intl.NumberFormat(L(),{maximumFractionDigits:0}).format(s.coveredDistanceKm*1000/.75):tr().na],
    ['metricCalories',Number.isFinite(s.caloriesBurned)?`${new Intl.NumberFormat(L(),{maximumFractionDigits:0}).format(s.caloriesBurned)} kcal`:tr().na],
    ['metricWaterLost',Number.isFinite(s.waterLostLiters)?`${s.waterLostLiters.toFixed(1)} L`:tr().na],
    ['metricEta',s.completedAt?date(s.completedAt):s.eta?date(s.eta):tr().na],
    ['metricEtaBasis',s.etaBasis?(s.etaBasis==='recent'?tr().recent:tr().moving):''],
    ['metricTrackingStatus',tr()[s.state]||s.state||tr().prestart],
    ['metricSignalAge',age(s.signalAgeMs)],
    ['metricPointCount',new Intl.NumberFormat(L()).format(s.points?.length||0)],
    ['techFirstTimestamp',date(s.actualStartTimestamp)],
    ['techLatestTimestamp',date(s.latestPointTimestamp)],
    ['techLatitude',Number.isFinite(p.latitude)?p.latitude.toFixed(6):tr().na],
    ['techLongitude',Number.isFinite(p.longitude)?p.longitude.toFixed(6):tr().na],
    ['techAltitude',av(p.altitude,' m',1)],
    ['techFirebaseState',p.trackerState?(()=>{const state=String(p.trackerState).toLowerCase(),labels={stationary:['dashboard.stationary','Stationary'],moving:['common.moving','Moving'],paused:['common.paused','Paused'],stopped:['dashboard.stopped','Stopped']};return labels[state]?tx(...labels[state]):String(p.trackerState)})():s.state?tr()[s.state]||String(s.state):tr().na],
    ['techGpxPoints',new Intl.NumberFormat(L()).format(r.pointCount||0)],
    ['techRouteBounds',r.start&&r.finish?`${r.start.lat.toFixed(3)},${r.start.lng.toFixed(3)} → ${r.finish.lat.toFixed(3)},${r.finish.lng.toFixed(3)}`:tr().na]
  ];
  rows.forEach(([id,value])=>set(id,value));
}

function charts(points){
  if(!window.Chart||!points.length)return;
  document.querySelectorAll('.empty-state').forEach(n=>n.remove());
  let q=points.filter((_,i)=>i%Math.max(1,Math.floor(points.length/400))===0),mode=document.getElementById('chartXAxisMode')?.value||'distance',labs=q.map(p=>mode==='distance'?num(Number(p.cumulativeDistanceKm||0)):new Date(p.timestamp).toLocaleString(L(),{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})),g=0,gains=q.map((p,i)=>{if(i){let d=+p.altitude-+q[i-1].altitude;if(d>2&&d<200)g+=d}return g}),n=[tx("common.speed", "Speed"),tx("common.altitude", "Altitude"),tx("dashboard.heartRate", "Heart rate"),tx("dashboard.cumulativeElevation", "Cumulative elevation")],defs=[['chartSpeed',n[0],q.map(p=>p.speed),'#e8953f'],['chartAltitude',n[1],q.map(p=>p.altitude),'#d9b36c'],['chartHeartRate',n[2],q.map(p=>p.heartRate),'#c36a4a'],['chartElevation',n[3],gains,'#8ca89f']];
  defs.forEach(([id,label,data,color])=>{let c=S.charts.get(id);if(c){c.data.labels=labs;c.data.datasets[0].label=label;c.data.datasets[0].data=data;c.update('none')}else{let el=document.getElementById(id);if(el)S.charts.set(id,new Chart(el,{type:'line',data:{labels:labs,datasets:[{label,data,borderColor:color,backgroundColor:color+'22',fill:true,borderWidth:2,pointRadius:0,tension:.15}]},options:{responsive:true,maintainAspectRatio:false,animation:false,interaction:{mode:'index',intersect:false}}}))}})
}

function translate(){
  if(S.summary)update(S.summary);
  charts(S.points);
}

async function refresh(){
  try{
    let s=await HorizonExpedition.loadSummary({force:true});
    S.points=s.points;
    update(s);
    charts(S.points);
  }catch(e){console.warn(e)}
}

function initDashboardPage(){
  document.querySelectorAll('.chart-card-head').forEach(h=>{let p=document.createElement('p');p.className='empty-state';p.textContent=tx("dashboard.telemetryWillAppearOnceTrackingBegins", "Telemetry will appear once tracking begins.");h.after(p)});
  document.querySelectorAll('.chart-fullscreen-btn').forEach(b=>b.onclick=async()=>document.fullscreenElement?document.exitFullscreen():b.closest('.metric-card').requestFullscreen());
  const chartXAxisMode=document.getElementById('chartXAxisMode');
  if(chartXAxisMode)chartXAxisMode.onchange=()=>charts(S.points);
  document.addEventListener('horizon:languagechange',translate);
  translate();
  refresh();
  setInterval(refresh,20000);
}

window.HorizonDashboard={initDashboardPage,updateSummary:update,refresh};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',initDashboardPage,{once:true}):initDashboardPage();
})();
