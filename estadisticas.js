/****************  estadisticas.js  ****************/
/* requiere Chart.js y window.R (alias getRegistros) */
let charts = [];
function destroyCharts(){ charts.forEach(c=>c.destroy()); charts=[]; }

/*** UI helpers ***/
function card(id,title,icon){
  return `
    <div class="bg-white rounded shadow p-4 flex flex-col">
      <h3 class="font-semibold mb-2"><i class="fas fa-${icon} mr-1"></i>${title}</h3>
      <canvas id="${id}" class="h-48"></canvas>
    </div>`;
}
function noData(el){ el.innerHTML += '<p class="mt-4">Sin datos todavía.</p>'; }

/*** Vista principal ***/
window.renderEstadisticas = function (c){
  destroyCharts();
  const records = R();                   // lectura global
  c.innerHTML = '<h1 class="text-2xl font-bold mb-4"><i class="fas fa-chart-line mr-2"></i>Estadísticas</h1>';

  /* ─ Tabs de rango fijo ─ */
  c.innerHTML += `
    <div class="inline-flex mb-4 rounded overflow-hidden border">
    <button data-r="7"  class="rangeBtn px-3 py-1 bg-blue-600 text-white">7 d</button>
    <button data-r="30" class="rangeBtn px-3 py-1">30 d</button>
    <button data-r="90" class="rangeBtn px-3 py-1">90 d</button>

    <!-- botón calendario -->
    <button id="btnPick" class="px-3 py-1 border-l flex items-center gap-1">
        <i class="fas fa-calendar-alt"></i>
    </button>
    </div>

    <div class="max-h-[85vh] overflow-auto pr-2">
    <div id="statsGrid" class="grid md:grid-cols-2 gap-6 auto-rows-auto"></div>
    </div>`;

    const grid = document.getElementById('statsGrid');
    const rangeBtn = c.querySelectorAll('.rangeBtn');

    /* === flatpickr range === */
    const fpInput = document.createElement('input');
    fpInput.type  = 'text';
    fpInput.className = 'hidden';          // no visible; sólo lo usa flatpickr
    c.appendChild(fpInput);

    flatpickr(fpInput,{
    mode       : 'range',
    dateFormat : 'Y-m-d',
    appendTo   : document.getElementById('btnPick').parentElement,
    positionElement : document.getElementById('btnPick'),
    onClose    : (sel) => {
        if(sel.length===2){
        const [d1,d2] = sel;
        renderCharts( (d2-d1)/86400000 + 1 , d1, d2 );   // días exactos
        rangeBtn.forEach(b=>b.classList.remove('bg-blue-600','text-white'));
        }
    }
    });

    document.getElementById('btnPick').onclick = () => fpInput._flatpickr.open();

    /* handler para botones */
    rangeBtn.forEach(btn=>{
    btn.onclick = () =>{
        c.querySelectorAll('.rangeBtn').forEach(b=>b.classList.remove('bg-blue-600','text-white'));
        btn.classList.add('bg-blue-600','text-white');
        renderCharts(+btn.dataset.r);
    };
    });

  /* primera carga (7 días) */
  renderCharts(7);

  /***  función que pinta todo según rango  ***/
  function renderCharts(days, fromDate=null, toDate=null){
    destroyCharts(); grid.innerHTML='';

    let data;
    if(fromDate){          // rango libre seleccionado con flatpickr
        const f = fromDate.toISOString().slice(0,10);
        const t = toDate  .toISOString().slice(0,10);
        data = records.filter(r=>r.fecha>=f && r.fecha<=t);
    } else {
        const from = addDays(new Date(), -days+1).toISOString().slice(0,10);
        data = records.filter(r=>r.fecha>=from);
    }
    const rangoTexto = fromDate
    ? `${fromDate.toLocaleDateString()} → ${toDate.toLocaleDateString()}`
    : `${days} d`;

    /* tarjetas */
    grid.innerHTML =
       card('chartEntrenos','Entrenos / semana','dumbbell') +
       card('chartSueno'  ,'Horas de sueño medias','bed') +
       card('chartPeso'   ,'Peso corporal','weight-hanging') +
       card('chartAnimo'  ,'Ánimo medio','smile') +
       `<div class="bg-white rounded shadow p-4 flex flex-col md:col-span-2">
          <h3 class="font-semibold mb-2"><i class="fas fa-wine-bottle mr-1"></i>Consumo de alcohol (${rangoTexto})</h3>
          <canvas id="chartAlcohol" class="h-48"></canvas>
        </div>`;

    /* === procesar === */
    const sem = groupByWeek(data);
    const labels  = sem.map(s=>s.label);
    const entren  = sem.map(s=>s.entrenos);
    const sueño   = sem.map(s=>s.sueno);
    const pesos   = data.map(r=>r.peso).filter(Boolean);
    const fechasP = data.map(r=>r.fecha).filter((_,i)=>data[i].peso);

    const animo   = sem.map(s=>s.animo);
    const last    = data;                       // últimos X días
    const sinAlc  = last.filter(r=>!r.extras.alcohol).length;
    const conAlc  = last.length - sinAlc;

    /* === Charts === */
    charts.push(new Chart('chartEntrenos',{type:'line',data:{labels,datasets:[{data:entren,borderWidth:2}]},options:{plugins:{legend:{display:false}}}}));
    charts.push(new Chart('chartSueno'  ,{type:'bar' ,data:{labels,datasets:[{data:sueño}]},options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}}));

    if(pesos.length){
      charts.push(new Chart('chartPeso',{type:'line',data:{labels:fechasP,datasets:[{data:pesos,borderWidth:2}]},options:{plugins:{legend:{display:false}}}}));
    } else { document.getElementById('chartPeso').parentElement.innerHTML='<p>No hay pesos.</p>'; }

    charts.push(new Chart('chartAnimo',{type:'bar',data:{labels,datasets:[{data:animo}]},options:{plugins:{legend:{display:false}},scales:{y:{min:1,max:4,stepSize:1}}}}));

    charts.push(new Chart('chartAlcohol',{type:'doughnut',data:{labels:['Sin alcohol','Con alcohol'],datasets:[{data:[sinAlc,conAlc]}]}}));
  }
};

/* ==== utils ==== */
function groupByWeek(arr){
  const m=new Map();
  arr.forEach(r=>{
    const lbl=isoWeek(new Date(r.fecha));
    if(!m.has(lbl)) m.set(lbl,{label:lbl,entrenos:0,sueno:[],animo:[]});
    const o=m.get(lbl);
    if(r.entrenamiento.hecho) o.entrenos++;
    o.sueno.push(r.sueno?.horas||0);
    o.animo.push(r.sentimiento?.animo||0);
  });
  return [...m.values()].map(o=>({...o,
    sueno:avg(o.sueno), animo:avg(o.animo)}));
}
const avg=a=>a.length? a.reduce((x,y)=>x+y,0)/a.length : 0;
function isoWeek(d){ d=new Date(d);d.setUTCDate(d.getUTCDate()+4-(d.getUTCDay()||7));
  const y=d.getUTCFullYear(),first=new Date(Date.UTC(y,0,1));
  const w=Math.ceil(((d-first)/86400000+1)/7);
  return `${y}-W${String(w).padStart(2,'0')}`;}
function addDays(d,n){ return new Date(d.getTime()+n*86400000); }
