// app.js
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded shadow p-4">
        <h2 class="text-xl font-bold mb-2">Registrar Día</h2>
        <p class="text-sm text-gray-500 mb-2">Aquí irá el formulario de hábitos, entreno, alimentación, descanso...</p>
      </div>
      <div class="bg-white rounded shadow p-4">
        <h2 class="text-xl font-bold mb-2">Estadísticas</h2>
        <canvas id="graficoProgreso" height="200"></canvas>
      </div>
    </div>
  `;

  const ctx = document.getElementById('graficoProgreso');
  if (ctx) {
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Día 1', 'Día 2', 'Día 3'],
        datasets: [{
          label: 'Entrenos completados',
          data: [1, 0, 1],
          borderColor: 'rgb(59, 130, 246)',
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
});
