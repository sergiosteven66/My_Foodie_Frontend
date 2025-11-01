import { initLayout } from '../components/Layout.js';
import { createReseñaCard } from '../components/ReseñaCard.js';
import { 
  getRestauranteById,
  actualizarRestaurante as actualizarRestauranteApi, 
  eliminarRestaurante as eliminarRestauranteApi
} from '../services/restaurantes.service.js';
import { 
  getReseñasPorRestaurante, 
  crearReseña, 
  likeDislikeReseña,
  actualizarReseña as actualizarReseñaApi, 
  eliminarReseña as eliminarReseñaApi
} from '../services/reseñas.service.js';
import { 
  crearPlato,
  actualizarPlato,
  eliminarPlato
} from '../services/platos.service.js';
import { getCategorias } from '../services/categorias.service.js';
import { getUserData } from '../utils/auth.js';
import { showNotification } from '../components/Modal.js';

let restauranteId = null;
let currentUserId = null;
let currentUserRole = null; 
let restauranteActual = null; 

let modalEdit = null; 
let modalDelete = null;
let modalPlato = null;
let modalDeletePlato = null;
let modalEditRestaurante = null;
let modalDeleteRestaurante = null;

let reseñaFormRating = 0;
let editFormRating = 0;

const LOADER_HTML = `
  <div class="d-flex justify-content-center align-items-center" style="height: 50vh;">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Cargando...</span>
    </div>
  </div>`;

export function initDetallePage() {
  const params = new URLSearchParams(window.location.search);
  restauranteId = params.get('id');
  
  const userData = getUserData();
  currentUserId = userData?.usuarioId; 
  currentUserRole = userData?.rol; 

  if (!restauranteId) {
    window.location.href = 'restaurantes.html';
    return;
  }
  
  initLayout(); 
  
  modalEdit = new bootstrap.Modal(document.getElementById('editModal'));
  modalDelete = new bootstrap.Modal(document.getElementById('deleteModal'));
  modalPlato = new bootstrap.Modal(document.getElementById('platoModal'));
  modalDeletePlato = new bootstrap.Modal(document.getElementById('deletePlatoModal'));
  modalEditRestaurante = new bootstrap.Modal(document.getElementById('editRestauranteModal'));
  modalDeleteRestaurante = new bootstrap.Modal(document.getElementById('deleteRestauranteModal'));

  const mainContent = document.querySelector('#main-content');
  mainContent.innerHTML = LOADER_HTML;

  loadPageData(mainContent);
}

async function loadPageData(mainContent) {
  try {
    restauranteActual = await getRestauranteById(restauranteId);
    renderDetalle(mainContent, restauranteActual);
    refreshPlatos(restauranteActual.platos); 
    refreshReseñas(); 
    addEventListeners(restauranteActual);
  } catch (error) {
    mainContent.innerHTML = `
      <section class="alert alert-danger">
        <h4 class="alert-heading">Error</h4>
        <p>${error.message}</p>
        <a href="restaurantes.html" class="btn btn-danger">Volver</a>
      </section>
    `;
  }
}

function renderDetalle(mainContent, restaurante) {
  document.title = `My Foodie - ${restaurante.nombre}`;
  const placeholderImg = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&h=400&fit=crop';

  const detalleHTML = `
    <section class="row g-4">
      <section class="col-lg-8">
        <article class="card shadow-sm mb-4">
          <img src="${restaurante.imagenUrl || placeholderImg}" class="card-img-top" alt="Imagen de ${restaurante.nombre}" style="height: 400px; object-fit: cover;">
          <header class="card-body">
            ${currentUserRole === 'admin' ? `
              <div class="d-flex gap-2 float-end">
                <button class="btn btn-outline-primary btn-sm" id="edit-rest-btn">
                  <i class="bi bi-pencil"></i> Editar Restaurante
                </button>
                <button class="btn btn-outline-danger btn-sm" id="delete-rest-btn">
                  <i class="bi bi-trash"></i> Eliminar
                </button>
              </div>
            ` : ''}
            
            <span class="badge rounded-pill text-bg-secondary mb-2">${restaurante.categoriaInfo.nombre}</span>
            <h1 class="card-title h2 fw-bold">${restaurante.nombre}</h1>
            <p class="card-text text-muted">${restaurante.ubicacion}</p>
            <p class="card-text">${restaurante.descripcion}</p>
          </header>
        </article>

        <article class="card shadow-sm">
          <header class="card-header d-flex justify-content-between align-items-center">
            <h2 class="h4 mb-0 fw-bold">Platos Destacados</h2>
            ${currentUserRole === 'admin' ? `
              <button class="btn btn-primary btn-sm" id="add-plato-btn">
                <i class="bi bi-plus-circle me-2"></i>Añadir Plato
              </button>
            ` : ''}
          </header>
          <ul class="list-group list-group-flush" id="lista-platos">
            </ul>
        </article>
      </section>

      <aside class="col-lg-4">
        <article class="card shadow-sm mb-4">
          <header class="card-header"><h3 class="h5 mb-0 fw-bold">Deja tu opinión</h3></header>
          <section id="form-reseña-container">
             </section>
        </article>
        
        <article>
          <h3 class="h5 mb-3 fw-bold">Reseñas</h3>
          <section class="list-group shadow-sm" id="lista-reseñas">
            </section>
        </article>
      </aside>
    </section>
  `;
  
  mainContent.innerHTML = detalleHTML;
}