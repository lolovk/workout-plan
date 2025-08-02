/****************  router.js  ****************/
/* Sidebar & overlay */
function openSidebar() {
  document.getElementById('sidebar').classList.remove('-translate-x-full');
  document.getElementById('overlay').classList.remove('hidden');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.add('-translate-x-full');
  document.getElementById('overlay').classList.add('hidden');
}
function toggleSidebar() {
  document.getElementById('sidebar').classList.contains('-translate-x-full')
    ? openSidebar() : closeSidebar();
}

/* Vistas válidas */
const routes = ['home','registros','estadisticas','ejercicios','rutinas','ajustes'];

/* Enrutador */
window.addEventListener('hashchange', router);
window.addEventListener('load', router);

function router () {
  const view = location.hash.replace('#/','') || 'home';
  const app  = document.getElementById('app');
  closeSidebar();                         // cierra menú en móvil
  highlightLink(view);
  if (!routes.includes(view)) return render404(app);
  ({
    home       : renderHome,
    registros  : renderRegistros,
    estadisticas: renderEstadisticas,
    ejercicios : renderEjercicios,
    rutinas    : renderRutinas,
    ajustes    : renderAjustes
  })[view](app);
}

/* Marca link activo */
function highlightLink(view){
  document.querySelectorAll('aside nav a')
    .forEach(a => a.classList.toggle('text-blue-600', a.hash === '#/' + view));
}

/* Vistas vacías para que no rompa */
function renderHome(c){ c.innerHTML = '<h1 class=\"text-2xl font-bold mb-4\"><i class=\"fas fa-house mr-2\"></i>Home</h1>'; }
function renderEjercicios(c){ c.innerHTML = '<h1 class=\"text-2xl font-bold mb-4\"><i class=\"fas fa-dumbbell mr-2\"></i>Ejercicios</h1>'; }
function renderRutinas(c){ c.innerHTML = '<h1 class=\"text-2xl font-bold mb-4\"><i class=\"fas fa-calendar-check mr-2\"></i>Rutinas</h1>'; }
function renderAjustes(c){ c.innerHTML = '<h1 class=\"text-2xl font-bold mb-4\"><i class=\"fas fa-cog mr-2\"></i>Ajustes</h1>'; }
function render404(c){   c.innerHTML = '<h1 class=\"text-2xl font-bold mb-4\">404</h1>'; }

/* Exportamos para otros módulos */
window.renderRegistros   = ()=>{};
window.renderEstadisticas= ()=>{};
