import { initLayout, loadAdminBadges } from '../components/Layout.js';
import { checkAdminGuard } from '../utils/guards.js';
import { 
  getRestaurantesPendientes,
  aprobarRestaurante,
  eliminarRestaurante
} from '../services/restaurantes.service.js';
import { showNotification } from '../components/Modal.js';

let modalRejectElement = null;
const LOADER_HTML = `<p class="text-center text-muted">Cargando...</p>`;
const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop';

export function initAdminAprobacionesPage() {
  if (!checkAdminGuard()) return;
  initLayout(); 
  
  modalRejectElement = new bootstrap.Modal(document.getElementById('rejectModal'));

  const mainContent = document.querySelector('#main-content');
  mainContent.innerHTML = `
    <section class="container-fluid">
      <header class="mb-4">
        <h1 class="h3 fw-bold">Panel de Aprobaciones</h1>
        <p class="text-muted">Revisa y aprueba nuevas entradas de restaurantes.</p>
      </header>

      <section class="card shadow-sm">
        <div class="card-header">
           <h5 class="mb-0">
              Restaurantes Pendientes 
              <span id="rest-count-badge" class="badge rounded-pill text-bg-primary d-none"></span>
           </h5>
        </div>
        <article id="lista-restaurantes-pendientes" class="py-3 card-body">
            ${LOADER_HTML}
        </article>
      </section>
    </section>
  `;

  loadRestaurantesPendientes();
  addEventListeners();
}

async function loadRestaurantesPendientes() {
  const container = document.querySelector('#lista-restaurantes-pendientes');
  container.innerHTML = LOADER_HTML;

  try {
    const restaurantes = await getRestaurantesPendientes();
    
    const badge = document.querySelector('#rest-count-badge');
    if (restaurantes.length > 0) {
      badge.textContent = restaurantes.length;
      badge.classList.remove('d-none');
    } else {
      badge.classList.add('d-none');
    }

    if (restaurantes.length === 0) {
      container.innerHTML = `
        <div class="text-center p-5">
          <i class="bi bi-check-circle-fill display-4 text-success"></i>
          <h4 class="mt-3">¡Todo al día!</h4>
          <p class="text-muted">No hay restaurantes pendientes de aprobación.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = restaurantes.map(renderRestauranteCard).join('');

  } catch (error) {
    container.innerHTML = `<section class="alert alert-danger">${error.message}</section>`;
  }
}

function renderRestauranteCard(restaurante) {
  return `
    <article class="card shadow-sm mb-3" id="restaurante-${restaurante._id}">
      <section class="row g-0">
        <aside class="col-md-4 col-lg-3">
          <img 
            src="${restaurante.imagenUrl || PLACEHOLDER_IMG}" 
            class="img-fluid rounded-start" 
            alt="Fachada de ${restaurante.nombre}" 
            style="height: 100%; object-fit: cover; min-height: 150px;"
          >
        </aside>
        <section class="col-md-8 col-lg-9">
          <div class="card-body d-flex flex-column h-100">
            <h5 class="card-title fw-bold">${restaurante.nombre}</h5>
            <p class="card-text text-muted">${restaurante.categoriaInfo.nombre}</p>
            <p class="card-text">${restaurante.descripcion}</p>
            <p class="card-text"><small class="text-muted">${restaurante.ubicacion}</small></p>
            
            <footer class="mt-auto d-flex gap-2 pt-2">
              <button 
                class="btn btn-success" 
                data-action="aprobar" 
                data-id="${restaurante._id}"
              >
                <i class="bi bi-check-lg me-2"></i>Aprobar
              </button>
              <button 
                class="btn btn-danger" 
                data-action="rechazar" 
                data-id="${restaurante._id}"
              >
                <i class="bi bi-trash me-2"></i>Rechazar
              </button>
            </footer>
          </div>
        </section>
      </section>
    </article>
  `;
}

