/************ formRegistro.js  ************/
window.openForm  = openForm;   // usado en registros.js
window.closeForm = closeForm;

let idxEdit = -1;      // índice en el array R()
let readOnly = false;  // modo solo-lectura

/* Helpers */
const today = () => new Date().toISOString().slice(0, 10);
const empty = () => ({
  fecha: today(),
  entrenamiento: { hecho: false, tipo: '', dur: 0, inten: 0, extra: '' },
  peso: 0,
  comida: {}, extras: {}, suplementos: [],
  sueno: {}, sentimiento: { animo: 2, fisico: 2, agujetas: 0 }
});

/* -------- abrir & cerrar modal -------- */
function openForm (i = -1, view = false) {
  idxEdit  = i;          // -1 = nuevo
  readOnly = view;
  const data = (i >= 0) ? R()[i] : empty();
  buildForm(data, readOnly);
  document.getElementById('btnEdit')
          .classList.toggle('hidden', !view);
  document.getElementById('btnSave').textContent =
        (i >= 0 ? 'Guardar cambios' : 'Guardar');
  document.getElementById('modalForm')
          .classList.remove('hidden');
}
function closeForm () {
  document.getElementById('modalForm').classList.add('hidden');
}

/* -------- construir formulario -------- */
function buildForm (d, ro) {
  const dis = ro ? 'disabled' : '';
  const fm  = document.getElementById('dailyForm');

  fm.innerHTML = `
  <input ${dis} type="date" name="fecha" value="${d.fecha}" class="border p-2 rounded w-full">

  <!-- ENTRENAMIENTO -->
  <fieldset class="border p-4 rounded"><legend class="font-semibold px-2">Entrenamiento</legend>
    <label class="flex items-center gap-2 mt-2"><input ${dis} ${d.entrenamiento.hecho?'checked':''} type="checkbox" name="entreno"> Entrené hoy</label>
    <div class="grid grid-cols-2 gap-2 mt-2">
      <select ${dis} name="tipo_entreno" class="border p-2 rounded col-span-2">
        ${['','Fuerza','Cardio','HIIT','Movilidad'].map(v=>`<option ${d.entrenamiento.tipo===v?'selected':''}>${v}</option>`).join('')}
      </select>
      <input ${dis} type="number" name="duracion"   value="${d.entrenamiento.dur||''}"   placeholder="min"               class="border p-2 rounded">
      <input ${dis} type="number" name="intensidad" value="${d.entrenamiento.inten||''}" placeholder="intensidad 1-10"  class="border p-2 rounded">
    </div>
    <textarea ${dis} name="actividad_extra" rows="2" class="border p-2 rounded w-full mt-2" placeholder="Actividad extra">${d.entrenamiento.extra||''}</textarea>
  </fieldset>

  <!-- PESO -->
  <input ${dis} type="number" step="0.1" name="peso" value="${d.peso||''}" placeholder="Peso corporal (kg)" class="border p-2 rounded w-full">

  <!-- ALIMENTACIÓN -->
  <fieldset class="border p-4 rounded"><legend class="font-semibold px-2">Alimentación</legend>
    <textarea ${dis} name="desayuno" rows="2" class="border p-2 rounded w-full" placeholder="Desayuno">${d.comida.desayuno||''}</textarea>
    <textarea ${dis} name="comida"   rows="2" class="border p-2 rounded w-full" placeholder="Comida">${d.comida.comida||''}</textarea>
    <textarea ${dis} name="cena"     rows="2" class="border p-2 rounded w-full" placeholder="Cena">${d.comida.cena||''}</textarea>

    <textarea ${dis} name="snacks"  rows="1" class="border p-2 rounded w-full mt-2" placeholder="Snacks">${d.extras.snacks||''}</textarea>
    <textarea ${dis} name="dulces"  rows="1" class="border p-2 rounded w-full"      placeholder="Dulces">${d.extras.dulces||''}</textarea>
    <textarea ${dis} name="alcohol" rows="1" class="border p-2 rounded w-full"      placeholder="Alcohol">${d.extras.alcohol||''}</textarea>

    <select ${dis} name="suplementos" multiple class="border p-2 rounded w-full mt-2">
      ${['Proteína','Magnesio','Vitamina D','Omega-3'].map(v=>`<option ${d.suplementos?.includes(v)?'selected':''}>${v}</option>`).join('')}
    </select>
  </fieldset>

  <!-- SUEÑO -->
  <fieldset class="border p-4 rounded"><legend class="font-semibold px-2">Sueño</legend>
    <input ${dis} type="number" step="0.1" name="horas_sueno" value="${d.sueno.horas||''}" placeholder="Horas totales" class="border p-2 rounded w-full">
    <label class="flex items-center gap-2 mt-2"><input ${dis} ${d.sueno.pantallas?'checked':''} type="checkbox" name="pantallas"> Sin pantallas antes de dormir</label>
    <label class="flex items-center gap-2 mt-2"><input ${dis} ${d.sueno.bien?'checked':''}      type="checkbox" name="dormi_bien"> Dormí bien (continuo)</label>
  </fieldset>

  <!-- SENSACIONES -->
  <fieldset class="border p-4 rounded"><legend class="font-semibold px-2">Sensaciones</legend>
    <select ${dis} name="animo" class="border p-2 rounded w-full mt-2">
      ${[4,3,2,1].map(v=>`<option value="${v}" ${d.sentimiento.animo==v?'selected':''}>${['😀 Muy animado','🙂 Bien','😐 Neutro','😔 Bajo'][4-v]}</option>`).join('')}
    </select>
    <select ${dis} name="fisico" class="border p-2 rounded w-full mt-2">
      ${[4,3,2,1].map(v=>`<option value="${v}" ${d.sentimiento.fisico==v?'selected':''}>${['💪 Fuerte','🙂 Bien','😒 Cansado','😩 Débil'][4-v]}</option>`).join('')}
    </select>
    <label class="block mt-2">Agujetas:
      <input ${dis} type="range" name="agujetas" min="0" max="10" value="${d.sentimiento.agujetas}" class="w-full">
    </label>
  </fieldset>
`;

  /* ------------- Guardar ------------- */
  document.getElementById('btnSave').onclick = e => {
    e.preventDefault();
    if (readOnly) { alert('Pulsa Editar'); return; }

    const fd  = new FormData(fm);
    const obj = makeObject(fd);
    const arr = R();
    const ix  = arr.findIndex(r => r.fecha === obj.fecha);
    ix > -1 ? arr[ix] = obj : arr.push(obj);
    S(arr);

    closeForm();
    paintTable();             // refresco inmediato
  };

  /* ------------- Editar toggle ------------- */
  document.getElementById('btnEdit').onclick = e => {
    e.preventDefault();
    readOnly = !readOnly;
    buildForm(R()[idxEdit], readOnly);
  };
}

/* -------- convertir FormData → objeto registro -------- */
function makeObject (fd) {
  return {
    fecha: fd.get('fecha'),
    entrenamiento: {
      hecho: !!fd.get('entreno'),
      tipo : fd.get('tipo_entreno'),
      dur  : +fd.get('duracion')   || 0,
      inten: +fd.get('intensidad') || 0,
      extra: fd.get('actividad_extra')
    },
    peso: +fd.get('peso') || 0,

    comida: {
      desayuno: fd.get('desayuno'),
      comida  : fd.get('comida'),
      cena    : fd.get('cena')
    },
    extras: {
      snacks : fd.get('snacks'),
      dulces : fd.get('dulces'),
      alcohol: fd.get('alcohol')
    },
    suplementos: [...fd.getAll('suplementos')],

    sueno: {
      horas    : +fd.get('horas_sueno') || 0,
      pantallas: !!fd.get('pantallas'),
      bien     : !!fd.get('dormi_bien')
    },
    sentimiento: {
      animo   : +fd.get('animo'),
      fisico  : +fd.get('fisico'),
      agujetas: +fd.get('agujetas')
    }
  };
}
