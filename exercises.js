/********  exercises.js  ********/
/* Catálogo basado en: exercises/es/all.json
   Estructura del JSON de origen:
   {
     "Bíceps": [
       {
         "Ejercicio": "Banda de tracción de un solo brazo",
         "Video": { "Hombre": "url-h", "Mujer": "url-m" },
         "Equipo": "Banda",
         "Dificultad": "Novato"
       }, …
     ],
     "Tríceps": [ … ]
   }
*/

const LS_EX = 'workoutPlan_exercises';

/* 1.  Seed: leer exercises/es/all.json ― sólo la 1.ª vez */
(async () => {
  if (!localStorage.getItem(LS_EX)) {
    try {
      const res  = await fetch('exercises/es/all.json');
      if (!res.ok) throw Error(res.status);
      const raw  = await res.json();

      /* a) aplanar ⇒ [{nombre, grupo, equipo, dificultad, urlH, urlM}] */
      const flat = [];
      Object.entries(raw).forEach(([grupo, lista]) => {
        lista.forEach(e => flat.push({
          nombre      : e.Ejercicio,
          grupo,
          equipo      : e.Equipo || 'Sin equipo',
          dificultad  : e.Dificultad || '—',
          urlH        : e.Video?.Hombre || '',
          urlM        : e.Video?.Mujer  || ''
        }));
      });

      localStorage.setItem(LS_EX, JSON.stringify(flat));
    } catch (err) {
      console.error('No se pudo cargar exercises/es/all.json →', err);
      localStorage.setItem(LS_EX, '[]');              // catálogo vacío
    }
  }
})();

/* helpers */
const getEx = () => JSON.parse(localStorage.getItem(LS_EX) || '[]');

/* ===== vista ===== */
window.renderEjercicios = c => {
  const ex = getEx();
  c.innerHTML = `
    <h1 class="text-2xl font-bold mb-4"><i class="fas fa-dumbbell mr-2"></i>Catálogo de ejercicios</h1>

    <!-- Filtros -->
    <div class="flex flex-wrap gap-3 mb-4">
      <input id="q"  class="border p-2 rounded grow" placeholder="Buscar…">
      <select id="grp" class="border p-2 rounded">
        <option value="">Grupo muscular</option>
        ${[...new Set(ex.map(e=>e.grupo))].sort().map(g=>`<option>${g}</option>`).join('')}
      </select>
      <select id="diff" class="border p-2 rounded">
        <option value="">Dificultad</option>
        ${[...new Set(ex.map(e=>e.dificultad))].sort().map(d=>`<option>${d}</option>`).join('')}
      </select>
      <select id="eqp" class="border p-2 rounded">
        <option value="">Equipo</option>
        ${[...new Set(ex.map(e=>e.equipo))].sort().map(eq=>`<option>${eq}</option>`).join('')}
      </select>
    </div>

    <!-- Grid catálogo -->
    <div id="exGrid" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 h-[75vh] overflow-auto pr-2"></div>
  `;

  /* listeners */
  ['q','grp','diff','eqp'].forEach(id=>{
    c.querySelector('#'+id).oninput = c.querySelector('#'+id).onchange = paint;
  });

  paint();

  function paint(){
    const q    = c.querySelector('#q').value.toLowerCase();
    const grp  = c.querySelector('#grp').value;
    const dif  = c.querySelector('#diff').value;
    const eqp  = c.querySelector('#eqp').value;

    const list = getEx().filter(e=>
      (!q   || e.nombre.toLowerCase().includes(q)) &&
      (!grp || e.grupo===grp) &&
      (!dif || e.dificultad===dif) &&
      (!eqp || e.equipo===eqp)
    );

    document.getElementById('exGrid').innerHTML = list.map(e=>`
      <div class="bg-white rounded shadow p-3 flex flex-col">
        <h4 class="font-semibold mb-1">${e.nombre}</h4>
        <p class="text-xs text-gray-500 mb-1">${e.grupo} · ${e.equipo}</p>
        <p class="text-xs text-amber-600 mb-2">Nivel: ${e.dificultad}</p>

        <div class="mt-auto flex gap-2">
          ${e.urlH ? `<a href="${e.urlH}" target="_blank" class="flex-1 text-center bg-blue-600 text-white text-xs px-2 py-1 rounded">Vídeo&nbsp;H</a>` : ''}
          ${e.urlM ? `<a href="${e.urlM}" target="_blank" class="flex-1 text-center bg-pink-600 text-white text-xs px-2 py-1 rounded">Vídeo&nbsp;M</a>` : ''}
        </div>
      </div>`).join('');
  }
};
