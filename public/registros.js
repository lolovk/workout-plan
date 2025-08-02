/**************** registros.js  ****************/
/* Helpers LocalStorage */
const LS = 'workoutPlan_registros';
const R  = () => JSON.parse(localStorage.getItem(LS) || '[]');
const S  = a  => localStorage.setItem(LS, JSON.stringify(a));

/* =========== Vista principal =========== */
window.renderRegistros = c => {
  /* ——— Cabecera y botón “+” ——— */
  c.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold"><i class="fas fa-table mr-2"></i>Registros</h1>
      <button id="btnNuevo"
              class="fixed bottom-6 right-6 md:static px-4 py-3 bg-blue-600 text-white rounded-full md:rounded shadow hover:bg-blue-700">
        <i class="fas fa-plus"></i>
      </button>
    </div>

    <!-- Toggle -->
    <div class="mb-4 space-x-2">
      <button id="btnTabla"      class="px-3 py-1 border rounded bg-blue-600 text-white">Tabla</button>
      <button id="btnCalendario" class="px-3 py-1 border rounded">Calendario</button>
    </div>

    <!-- TABLA -->
    <div id="tablaWrapper" class="max-h-[80vh] overflow-auto pr-2">
      <div class="overflow-auto bg-white rounded shadow">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-200 sticky top-0">
            <tr>
              <th class="p-2 text-left">Fecha</th>
              <th class="p-2">Entreno</th>
              <th class="p-2">Alcohol</th>
              <th class="p-2">Sueño&nbsp;≥7h</th>
              <th class="p-2">Ánimo</th>
              <th class="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody id="tbodyReg"></tbody>
        </table>
      </div>
    </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <button onclick="exportAll()"  class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          <i class="fas fa-file-export mr-2"></i>Exportar todo
        </button>
        <label  class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 cursor-pointer">
          <i class="fas fa-file-import mr-2"></i>Importar
          <input type="file" accept=".json" class="hidden" onchange="importAll(this)">
        </label>
        <button onclick="resetAll()"  class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
          <i class="fas fa-trash mr-2"></i>Reset
        </button>
      </div>

    <!-- CALENDARIO (vacío de inicio) -->
    <div id="calWrapper" class="hidden"></div>

    ${modalExportHTML()}
    ${modalFormHTML()}
  `;

  /* ——— eventos ——— */
  document.getElementById('btnNuevo').onclick = () => openForm();
  const tabla   = document.getElementById('tablaWrapper');
  const cal     = document.getElementById('calWrapper');
  const btnTab  = document.getElementById('btnTabla');
  const btnCal  = document.getElementById('btnCalendario');

  btnTab.onclick = () => {
    tabla.classList.remove('hidden');
    cal.classList.add   ('hidden');
    btnTab.classList.add   ('bg-blue-600','text-white');
    btnCal.classList.remove('bg-blue-600','text-white');
  };

  btnCal.onclick = () => {
    tabla.classList.add   ('hidden');
    cal.classList.remove('hidden');
    btnCal.classList.add   ('bg-blue-600','text-white');
    btnTab.classList.remove('bg-blue-600','text-white');
    const d = new Date();
    renderCalendar(cal, d.getFullYear(), d.getMonth());   // ← genera/actualiza calendario
  };

  paintTable();               // ← pinta la tabla al cargar la vista
};


/* =========== Tabla =========== */
function paintTable () {
  const rows = R()
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .map((r, i) => `
      <tr class="border-t">
        <td class="p-2">${r.fecha}</td>
        <td class="p-2 text-center">${r.entrenamiento.hecho ? '✔' : '✘'}</td>
        <td class="p-2 text-center">${r.extras.alcohol ? '✘' : '✔'}</td>
        <td class="p-2 text-center">${r.sueno.horas >= 7 ? '✔' : '✘'}</td>
        <td class="p-2 text-center">${r.sentimiento.animo}</td>
        <td class="p-2 text-center space-x-2">
          <button class="text-blue-600 hover:underline"  onclick="openForm(${i}, true)">Ver</button>
          <button class="text-green-600 hover:underline" onclick="openExport(${i})">Exportar</button>
          <button class="text-red-600 hover:underline"   onclick="delReg(${i})">Borrar</button>
        </td>
      </tr>`).join('');

  document.getElementById('tbodyReg').innerHTML =
    rows || '<tr><td class="p-2" colspan="6">Sin datos.</td></tr>';
}

function delReg (i) {
  if (confirm('¿Eliminar este registro?')) {
    const a = R(); a.splice(i, 1); S(a); paintTable();
  }
}

/* =========== Modal EXPORT =========== */
function modalExportHTML () {
  return `
    <div id="modalExport" class="fixed inset-0 hidden flex items-center justify-center bg-black/40 z-50">
      <div class="bg-white w-full max-w-lg p-6 rounded-xl shadow-lg">
        <h2 class="text-xl font-bold mb-4">Exportar registro</h2>
        <pre id="jsonOut"
             class="bg-gray-100 p-4 text-xs overflow-auto rounded"></pre>
        <div class="mt-4 flex justify-end gap-2">
          <button onclick="closeExport()"
                  class="border px-4 py-2 rounded">Cerrar</button>
          <button onclick="copyJSON()"
                  class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            Copiar
          </button>
          <button onclick="downloadJSON()"
                  class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Descargar
          </button>
        </div>
      </div>
    </div>`;
}

/* ========= Modal FORM (estructura vacía) ========= */
function modalFormHTML () {
  return `
  <div id="modalForm"
       class="fixed inset-0 hidden flex items-center justify-center bg-black/40 z-50">
    <div class="bg-white w-full max-w-lg p-6 rounded-xl shadow-lg overflow-y-auto max-h-[90vh]">
      <h2 id="formTitle" class="text-xl font-bold mb-4">Registro diario</h2>

      <!-- aquí inyecta buildForm() -->
      <form id="dailyForm" class="space-y-6"></form>

      <div class="mt-4 flex justify-end gap-2">
        <button onclick="closeForm()" class="border px-4 py-2 rounded">Cerrar</button>
        <button id="btnEdit" class="border px-4 py-2 rounded hidden">Editar</button>
        <button id="btnSave"
                class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Guardar
        </button>
      </div>
    </div>
  </div>`;
}

let objExp = null;

function openExport (i) {
  objExp = R()[i];
  document.getElementById('jsonOut').textContent =
    JSON.stringify(objExp, null, 2);
  document.getElementById('modalExport').classList.remove('hidden');
}

function closeExport () {
  document.getElementById('modalExport').classList.add('hidden');
  objExp = null;
}

function copyJSON () {
  navigator.clipboard.writeText(JSON.stringify(objExp, null, 2))
    .then(() => alert('Copiado'))
    .catch(() => alert('Error al copiar'));
}

function downloadJSON () {
  const blob = new Blob([JSON.stringify(objExp, null, 2)],
                        { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `registro_${objExp.fecha}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/* =========== Export / Import / Reset GLOBAL =========== */
function exportAll () {
  const blob = new Blob([JSON.stringify(R(), null, 2)],
                        { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = 'WorkoutPlan_all.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importAll (inp) {
  const file = inp.files[0];
  if (!file) return;
  const fr = new FileReader();
  fr.onload = e => {
    try {
      const arr = JSON.parse(e.target.result);
      if (!Array.isArray(arr)) throw Error('Formato inválido');
      S(arr); alert('Importado'); location.hash = '#/registros';
    } catch (err) { alert(err.message); }
  };
  fr.readAsText(file);
}

function resetAll () {
  if (confirm('¿Borrar TODOS los registros?')) { S([]); paintTable(); }
}

window.R = R;
window.getRegistros = R;   //  <-- añade esto al final de registros.js