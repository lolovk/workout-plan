/********  exercises.js  ********/
const LS_EX = 'workoutPlan_exercises';

/* ---- seed catalogue on first load ---- */
(async ()=>{
  if(!localStorage.getItem(LS_EX)){
    // seed desde GitHub raw
    const url='https://raw.githubusercontent.com/yuhonas/free-exercise-db/master/exercises.json';
    const res = await fetch(url); const json = await res.json();
    localStorage.setItem(LS_EX, JSON.stringify(json));
  }
})();

/* helper */
const getEx = ()=>JSON.parse(localStorage.getItem(LS_EX)||'[]');
const setEx = a =>localStorage.setItem(LS_EX,JSON.stringify(a));

window.renderEjercicios = c =>{
  const ex = getEx();
  c.innerHTML = `
    <h1 class="text-2xl font-bold mb-4"><i class="fas fa-dumbbell mr-2"></i>Catálogo de ejercicios</h1>

    <!-- Filtros -->
    <div class="flex flex-wrap gap-3 mb-4">
      <input id="q"  placeholder="Buscar..." class="border p-2 rounded grow">
      <select id="grp" class="border p-2 rounded">
        <option value="">Grupo muscular</option>
        ${[...new Set(ex.map(e=>e.grupo))].sort().map(g=>`<option>${g}</option>`).join('')}
      </select>
      <select id="eqp" class="border p-2 rounded">
        <option value="">Equipo</option>
        ${[...new Set(ex.map(e=>e.equipo))].sort().map(e=>`<option>${e}</option>`).join('')}
      </select>

      <label class="bg-indigo-600 text-white px-3 py-2 rounded cursor-pointer">
        <i class="fas fa-file-import mr-1"></i>Importar
        <input type="file" accept=".json" class="hidden" onchange="importExercises(this)">
      </label>
    </div>

    <!-- Grid -->
    <div id="exGrid" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 h-[75vh] overflow-auto pr-2"></div>
  `;

  document.getElementById('q' ).oninput   =
  document.getElementById('grp').onchange =
  document.getElementById('eqp').onchange = ()=>paint();

  paint();

  function paint(){
    const q   = document.getElementById('q').value.toLowerCase();
    const grp = document.getElementById('grp').value;
    const eqp = document.getElementById('eqp').value;
    const list = getEx().filter(e=>
      (!q   || e.nombre.toLowerCase().includes(q)) &&
      (!grp || e.grupo===grp) &&
      (!eqp || e.equipo===eqp)
    );

    document.getElementById('exGrid').innerHTML = list.map(e=>`
      <div class="bg-white rounded shadow p-3 flex flex-col">
        <img src="${e.media}" alt="${e.nombre}" class="h-32 object-contain mb-2">
        <h4 class="font-semibold">${e.nombre}</h4>
        <p class="text-xs text-gray-500 mb-1">${e.grupo} · ${e.equipo||'Sin equipo'}</p>
        <button onclick="alert(JSON.stringify(${JSON.stringify(e)},null,2))"
                class="mt-auto bg-blue-600 text-white px-2 py-1 rounded text-sm">Detalle</button>
      </div>`).join('');
  }
};

/* ---- import catálogo ---- */
window.importExercises = inp=>{
  const f = inp.files[0]; if(!f) return;
  const fr = new FileReader(); fr.onload=e=>{
    try{
      const arr = JSON.parse(e.target.result);
      if(!Array.isArray(arr)) throw 'JSON debe ser un array';
      setEx(arr); alert('Catálogo importado');
      location.hash='#/ejercicios';   // recarga vista
    }catch(err){alert(err);}
  };
  fr.readAsText(f);
};
