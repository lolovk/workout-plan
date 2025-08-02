/********  exercises.js  ********/
const LS_EX = 'workoutPlan_exercises';

/* -------- seed: cargar tu JSON local -------- */
(async () => {
  if (!localStorage.getItem(LS_EX)) {
    try {
    const res  = await fetch('exercises/es/all.json');
    const obj  = await res.json();            // objeto { Grupo: [ … ] }

    /* transforma a array [{ nombre, grupo, urlH, urlM, equipo, dificultad }] */
    const catalogo = Object.entries(obj).flatMap(([grupo, lista]) =>
      lista.map(e => ({
        nombre      : e.Ejercicio,
        grupo       : grupo,
        urlH        : e.Video.Hombre,
        urlM        : e.Video.Mujer,
        equipo      : (e.Equipo||'').replace(/^.*}/,'').trim(),  // quita svg
        dificultad  : e.Dificultad
      }))
    );

    localStorage.setItem(LS_EX, JSON.stringify(catalogo));

    } catch (err) {
      console.error('No se pudo cargar exercises/es/all.json →', err);
      alert('No se encontró el catálogo de ejercicios. Colócalo en /exercises/es/all.json o importa uno manualmente.');
      localStorage.setItem(LS_EX, '[]');   // catálogo vacío
    }
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

    const list = getEx().filter(e =>
      (!q   || e.nombre.toLowerCase().includes(q)) &&
      (!grp || e.grupo === grp) &&
      (!eqp || e.equipo === eqp)
    );

    document.getElementById('exGrid').innerHTML = list.map(e => `
      <div class="bg-white rounded shadow p-3 flex flex-col">
        <h4 class="font-semibold mb-1">${e.nombre}</h4>
        <p class="text-xs text-gray-500 mb-1">
          ${e.grupo} · ${e.equipo || 'Sin equipo'} · ${e.dificultad || ''}
        </p>

        <div class="mt-auto flex gap-2">
          <a href="${e.urlH}" target="_blank"
            class="grow bg-blue-600 text-white text-center px-2 py-1 rounded text-sm">
            Hombre
          </a>
          <a href="${e.urlM}" target="_blank"
            class="grow bg-pink-600 text-white text-center px-2 py-1 rounded text-sm">
            Mujer
          </a>
        </div>
      </div>
    `).join('');
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
