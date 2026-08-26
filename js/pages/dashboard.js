(function(){
const S={charts:new Map(),points:[],summary:null},L=()=>document.documentElement.lang||'en';
const T={en:{na:'Not available',live:'Live',delayed:'Delayed',resting:'Resting',finished:'Finished',prestart:'Not started',recent:'Based on the last hour of movement',moving:'Based on average moving speed'},it:{na:'Non disponibile',live:'Live',delayed:'Segnale in ritardo',resting:'In sosta',finished:'Conclusa',prestart:'Non iniziata',recent:"Basato sull’ultima ora in movimento",moving:'Basato sulla velocità media in movimento'},de:{na:'Nicht verfügbar',live:'Live',delayed:'Signal verzögert',resting:'Pause',finished:'Beendet',prestart:'Nicht gestartet',recent:'Basierend auf der letzten Bewegungsstunde',moving:'Basierend auf der durchschnittlichen Bewegungsgeschwindigkeit'},fr:{na:'Indisponible',live:'En direct',delayed:'Signal retardé',resting:'À l’arrêt',finished:'Terminée',prestart:'Non commencée',recent:'Basé sur la dernière heure en mouvement',moving:'Basé sur la vitesse moyenne en mouvement'}};
const tr=()=>T[L()]||T.en,set=(id,v)=>{const n=document.getElementById(id);if(n)n.textContent=v},num=(v,d=1)=>new Intl.NumberFormat(L(),{minimumFractionDigits:d,maximumFractionDigits:d}).format(v),av=(v,u='',d=1)=>Number.isFinite(v)?num(v,d)+u:tr().na;
const date=v=>Number.isFinite(v)?new Intl.DateTimeFormat(L(),{dateStyle:'medium',timeStyle:'short'}).format(new Date(v)):tr().na;
const duration=v=>{if(!Number.isFinite(v))return tr().na;let x=Math.floor(v/1000),h=Math.floor(x/3600),m=Math.floor(x%3600/60),s=x%60;return[h,m,s].map(n=>String(n).padStart(2,'0')).join(':')};
const age=v=>{if(!Number.isFinite(v))return tr().na;let m=Math.floor(v/60000),x=m<60?m+' min':m<1440?Math.floor(m/60)+' h':Math.floor(m/1440)+' d';return L()==='de'?'vor '+x:L()==='fr'?'il y a '+x:x+(L()==='it'?' fa':' ago')};

function update(s={}){
  S.summary=s;
  const p=s.latestPoint||{},r=s.routeMeta||{};
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
    ['metricEta',s.eta?date(s.eta):tr().na],
    ['metricEtaBasis',s.etaBasis?(s.etaBasis==='recent'?tr().recent:tr().moving):''],
    ['metricTrackingStatus',tr()[s.state]||s.state||tr().prestart],
    ['metricSignalAge',age(s.signalAgeMs)],
    ['metricPointCount',new Intl.NumberFormat(L()).format(s.points?.length||0)],
    ['techFirstTimestamp',date(s.actualStartTimestamp)],
    ['techLatestTimestamp',date(s.latestPointTimestamp)],
    ['techLatitude',Number.isFinite(p.latitude)?p.latitude.toFixed(6):tr().na],
    ['techLongitude',Number.isFinite(p.longitude)?p.longitude.toFixed(6):tr().na],
    ['techAltitude',av(p.altitude,' m',1)],
    ['techFirebaseState',p.trackerState||s.state||tr().na],
    ['techGpxPoints',new Intl.NumberFormat(L()).format(r.pointCount||0)],
    ['techRouteBounds',r.start&&r.finish?`${r.start.lat.toFixed(3)},${r.start.lng.toFixed(3)} → ${r.finish.lat.toFixed(3)},${r.finish.lng.toFixed(3)}`:tr().na]
  ];
  rows.forEach(([id,value])=>set(id,value));
}

const names={en:['Speed','Altitude','Heart rate','Cumulative elevation'],it:['Velocità','Altitudine','Frequenza cardiaca','Dislivello cumulativo'],de:['Geschwindigkeit','Höhe','Herzfrequenz','Kumulierter Aufstieg'],fr:['Vitesse','Altitude','Fréquence cardiaque','Dénivelé cumulé']};

function charts(points){
  if(!window.Chart||!points.length)return;
  document.querySelectorAll('.empty-state').forEach(n=>n.remove());
  let q=points.filter((_,i)=>i%Math.max(1,Math.floor(points.length/400))===0),mode=document.getElementById('chartXAxisMode')?.value||'distance',labs=q.map(p=>mode==='distance'?num(Number(p.cumulativeDistanceKm||0)):new Date(p.timestamp).toLocaleString(L(),{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})),g=0,gains=q.map((p,i)=>{if(i){let d=+p.altitude-+q[i-1].altitude;if(d>2&&d<200)g+=d}return g}),n=names[L()]||names.en,defs=[['chartSpeed',n[0],q.map(p=>p.speed),'#e8953f'],['chartAltitude',n[1],q.map(p=>p.altitude),'#d9b36c'],['chartHeartRate',n[2],q.map(p=>p.heartRate),'#c36a4a'],['chartElevation',n[3],gains,'#8ca89f']];
  defs.forEach(([id,label,data,color])=>{let c=S.charts.get(id);if(c){c.data.labels=labs;c.data.datasets[0].label=label;c.data.datasets[0].data=data;c.update('none')}else{let el=document.getElementById(id);if(el)S.charts.set(id,new Chart(el,{type:'line',data:{labels:labs,datasets:[{label,data,borderColor:color,backgroundColor:color+'22',fill:true,borderWidth:2,pointRadius:0,tension:.15}]},options:{responsive:true,maintainAspectRatio:false,animation:false,interaction:{mode:'index',intersect:false}}}))}})
}

const dict={it:{'Advanced analysis':'Analisi avanzata','Expedition dashboard.':'Dashboard della spedizione.','Distance covered':'Distanza percorsa','Planned GPX distance':'Distanza GPX prevista','Distance remaining':'Distanza rimanente','Completion':'Completamento','Estimated arrival':'Arrivo stimato','Performance':'Prestazioni','Current speed':'Velocità attuale','Average moving speed':'Velocità media in movimento','Average total speed':'Velocità media totale','Maximum speed':'Velocità massima','Current altitude':'Altitudine attuale','Positive elevation gain':'Dislivello positivo','Elevation loss':'Dislivello negativo','Planned GPX elevation gain':'Dislivello GPX previsto','Total time':'Tempo totale','Moving time':'Tempo in movimento','Stopped time':'Tempo in sosta','Actual departure':'Partenza effettiva','Latest update':'Ultimo aggiornamento','Heart rate':'Frequenza cardiaca','Average heart rate':'Frequenza cardiaca media','Maximum heart rate':'Frequenza cardiaca massima','Estimated steps':'Passi stimati','Calories burned':'Calorie bruciate','Water loss':'Perdita di liquidi','Tracker state':'Stato tracker','Signal age':'Età del segnale','Recorded points':'Punti registrati','Technical details':'Dettagli tecnici','Live charts':'Grafici live','X axis':'Asse X','Full':'Espandi'},de:{'Advanced analysis':'Erweiterte Analyse','Expedition dashboard.':'Expeditions-Dashboard.','Distance covered':'Zurückgelegte Distanz','Planned GPX distance':'Geplante GPX-Distanz','Distance remaining':'Verbleibende Distanz','Completion':'Fortschritt','Estimated arrival':'Geschätzte Ankunft','Performance':'Leistung','Current speed':'Aktuelle Geschwindigkeit','Average moving speed':'Ø Bewegungsgeschwindigkeit','Average total speed':'Ø Gesamtgeschwindigkeit','Maximum speed':'Höchstgeschwindigkeit','Current altitude':'Aktuelle Höhe','Positive elevation gain':'Höhengewinn','Elevation loss':'Höhenverlust','Planned GPX elevation gain':'Geplanter GPX-Höhengewinn','Total time':'Gesamtzeit','Moving time':'Bewegungszeit','Stopped time':'Stillstandszeit','Actual departure':'Tatsächliche Abfahrt','Latest update':'Letzte Aktualisierung','Heart rate':'Herzfrequenz','Average heart rate':'Durchschnittliche Herzfrequenz','Maximum heart rate':'Maximale Herzfrequenz','Estimated steps':'Geschätzte Schritte','Calories burned':'Verbrannte Kalorien','Water loss':'Flüssigkeitsverlust','Tracker state':'Tracker-Status','Signal age':'Signalalter','Recorded points':'Aufgenommene Punkte','Technical details':'Technische Details','Live charts':'Live-Diagramme','X axis':'X-Achse','Full':'Vollbild'},fr:{'Advanced analysis':'Analyse avancée','Expedition dashboard.':'Tableau de bord de l’expédition.','Distance covered':'Distance parcourue','Planned GPX distance':'Distance GPX prévue','Distance remaining':'Distance restante','Completion':'Progression','Estimated arrival':'Arrivée estimée','Performance':'Performances','Current speed':'Vitesse actuelle','Average moving speed':'Vitesse moyenne en mouvement','Average total speed':'Vitesse moyenne totale','Maximum speed':'Vitesse maximale','Current altitude':'Altitude actuelle','Positive elevation gain':'Dénivelé positif','Elevation loss':'Dénivelé négatif','Planned GPX elevation gain':'Dénivelé GPX prévu','Total time':'Temps total','Moving time':'Temps en mouvement','Stopped time':'Temps à l’arrêt','Actual departure':'Départ réel','Latest update':'Dernière mise à jour','Heart rate':'Fréquence cardiaque','Average heart rate':'Fréquence cardiaque moyenne','Maximum heart rate':'Fréquence cardiaque maximale','Estimated steps':'Pas estimés','Calories burned':'Calories brûlées','Water loss':'Perte de liquides','Tracker state':'État du tracker','Signal age':'Âge du signal','Recorded points':'Points enregistrés','Technical details':'Détails techniques','Live charts':'Graphiques en direct','X axis':'Axe X','Full':'Plein écran'}};
Object.assign(dict.it,{
  'Complete sport telemetry with charts for speed, altitude, daily progress and route progression.':'Telemetria sportiva completa con grafici di velocità, altitudine e avanzamento.',
  'First timestamp':'Primo timestamp','Latest timestamp':'Ultimo timestamp','Firebase state':'Stato Firebase','GPX route points':'Punti percorso GPX','GPX route bounds':'Limiti percorso GPX','Cumulative elevation':'Dislivello cumulativo'
});
Object.assign(dict.de,{
  'Complete sport telemetry with charts for speed, altitude, daily progress and route progression.':'Vollständige Sporttelemetrie mit Geschwindigkeits-, Höhen- und Fortschrittsdiagrammen.','First timestamp':'Erster Zeitstempel','Latest timestamp':'Letzter Zeitstempel','Firebase state':'Firebase-Status','GPX route points':'GPX-Routenpunkte','GPX route bounds':'GPX-Routengrenzen','Cumulative elevation':'Kumulierter Aufstieg'
});
Object.assign(dict.fr,{
  'Complete sport telemetry with charts for speed, altitude, daily progress and route progression.':'Télémétrie sportive complète avec graphiques de vitesse, altitude et progression.','First timestamp':'Premier horodatage','Latest timestamp':'Dernier horodatage','Firebase state':'État Firebase','GPX route points':'Points de l’itinéraire GPX','GPX route bounds':'Limites de l’itinéraire GPX','Cumulative elevation':'Dénivelé cumulé'
});

function translate(){
  document.querySelectorAll('main h1,main h2,main h3,main p,main span,main dt,main summary,main label,main button').forEach(n=>{let x=n.dataset.ds||n.textContent.trim();if(!x)return;n.dataset.ds=x;n.textContent=(dict[L()]||{})[x]||x});
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
  document.querySelectorAll('.chart-card-head').forEach(h=>{let p=document.createElement('p');p.className='empty-state';p.textContent='Telemetry will appear once tracking begins.';h.after(p)});
  document.querySelectorAll('.chart-fullscreen-btn').forEach(b=>b.onclick=async()=>document.fullscreenElement?document.exitFullscreen():b.closest('.metric-card').requestFullscreen());
  document.getElementById('chartXAxisMode').onchange=()=>charts(S.points);
  document.addEventListener('horizon:languagechange',translate);
  translate();
  refresh();
  setInterval(refresh,20000);
}

window.HorizonDashboard={initDashboardPage,updateSummary:update,refresh};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',initDashboardPage,{once:true}):initDashboardPage();
})();
