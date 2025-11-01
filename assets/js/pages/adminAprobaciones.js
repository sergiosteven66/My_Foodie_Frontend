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

