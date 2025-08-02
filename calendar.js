/****************  calendar.js  ****************/
/* requiere que window.R (o getRegistros) esté disponible */

(function(){

/* ============= Helpers ============= */
const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function firstDayOfMonth(y,m){ return new Date(y,m,1).getDay() || 7; } // 1=Mon…7=Sun
function daysInMonth(y,m){ return new Date(y,m+1,0).getDate(); }

/* ============= Render del calendario ============= */
window.renderCalendar = function(container, year, month){
  const registros = R();                           // array completo
  container.innerHTML = '';                        // limpia

  /* cabecera ñ */
  const header = document.createElement('div');
  header.className = 'flex items-center justify-between mb-2';
  header.innerHTML = `
     <button id="prevCal" class="px-2 py-1 border rounded">&#8592;</button>
     <h2 class="font-semibold">${months[month]} ${year}</h2>
     <button id="nextCal" class="px-2 py-1 border rounded">&#8594;</button>`;
  container.appendChild(header);

  /* grid 7×6 */
  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-7 gap-px bg-gray-300 text-xs';
  container.appendChild(grid);

  // días de la semana cabecera
  ['L','M','X','J','V','S','D'].forEach(d=>{
     const el=document.createElement('div');
     el.textContent=d;
     el.className='bg-gray-200 p-1 text-center font-semibold';
     grid.appendChild(el);
  });

  const start = firstDayOfMonth(year,month)-1;   // 0-index
  const total = daysInMonth(year,month);
  const slots = 42;                              // 6 semanas

  for(let i=0;i<slots;i++){
     const cell=document.createElement('div');
     cell.className='h-20 bg-white relative';
     if(i>=start && i<start+total){
        const day = i-start+1;
        const dateISO = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const reg = registros.find(r=>r.fecha===dateISO);

        if(reg){
           cell.classList.add('bg-green-200','cursor-pointer');
           // bad habits?
           if(reg.extras?.alcohol || reg.extras?.dulces || reg.extras?.snacks){
              const dot=document.createElement('span');
              dot.className='absolute bottom-1 right-1 w-2 h-2 bg-red-600 rounded-full';
              cell.appendChild(dot);
           }
           cell.onclick=()=>openForm(registros.indexOf(reg), true); // Ver
        }
        cell.innerHTML += `<div class="p-1">${day}</div>`;
     }
     grid.appendChild(cell);
  }

  /* Navegación prev/next */
  document.getElementById('prevCal').onclick = ()=>{
     const d=new Date(year,month-1,1); renderCalendar(container,d.getFullYear(),d.getMonth());
  };
  document.getElementById('nextCal').onclick = ()=>{
     const d=new Date(year,month+1,1); renderCalendar(container,d.getFullYear(),d.getMonth());
  };
};

})();
