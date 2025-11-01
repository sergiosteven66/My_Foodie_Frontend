import { initLayout } from '../components/Layout.js';
import { createRestauranteCard } from '../components/RestauranteCard.js';
import { getRestaurantes } from '../services/restaurantes.service.js';
import { getMisStats } from '../services/usuarios.service.js'; 
import { getUserData } from '../utils/auth.js';

export function initDashboardPage() {
  initLayout();

  const mainContent = document.querySelector('#main-content');
  const userData = getUserData();

  const dashboardHTML = `
    <section class="row g-3 mb-4">
      <article class="col-md-4">
        <section class="card shadow-sm p-3">
          <h6 class="card-subtitle text-muted">Tus Reseñas</h6>
          <p id="stat-total" class="h3 card-title fw-bold">...</p>
        </section>
      </article>
      <article class="col-md-4">
        <section class="card shadow-sm p-3">
          <h6 class="card-subtitle text-muted">Promedio</h6>
          <p id="stat-promedio" class="h3 card-title fw-bold text-primary">
            <i class="bi bi-star-fill"></i> ...
          </p>
        </section>
      </article>
      <article class="col-md-4">
        <section class="card shadow-sm p-3">
          <h6 class="card-subtitle text-muted">Tu Favorito</h6>
          <p id="stat-favorito" class="h3 card-title fw-bold text-truncate">...</p>
        </section>
      </article>
    </section>

    <section>
      <h2 class="h4 fw-bold mb-3">Recomendados para ti</h2>
      <section 
        id="recomendados-container" 
        class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"
      >
        <p id="loader" class="text-center">Cargando restaurantes...</p>
      </section>
    </section>
  `;

  mainContent.innerHTML = dashboardHTML;

  loadStats();
  loadRecomendados();
}

async function loadStats() {
  const totalEl = document.querySelector('#stat-total');
  const promedioEl = document.querySelector('#stat-promedio');
  const favoritoEl = document.querySelector('#stat-favorito');

  try {
    const stats = await getMisStats();

    totalEl.textContent = stats.totalReseñas;
    promedioEl.innerHTML = `<i class="bi bi-star-fill"></i> ${stats.promedio}`;
    favoritoEl.textContent = stats.favorito;

  } catch (error) {
    totalEl.textContent = 'Error';
    promedioEl.textContent = 'Error';
    favoritoEl.textContent = 'Error';
  }
}

async function loadRecomendados() {
  const container = document.querySelector('#recomendados-container');
  const loader = document.querySelector('#loader');

  try {
    const restaurantes = await getRestaurantes(null, 'ranking');

    loader.remove();

    if (restaurantes.length === 0) {
      container.innerHTML = '<p class="text-muted">Aún no hay restaurantes aprobados.</p>';
      return;
    }

    restaurantes.slice(0, 6).forEach(restaurante => {
      const cardHTML = createRestauranteCard(restaurante);
      container.insertAdjacentHTML('beforeend', cardHTML);
    });

  } catch (error) {
    loader.innerHTML = `<p class="alert alert-danger">${error.message}</p>`;
  }
}