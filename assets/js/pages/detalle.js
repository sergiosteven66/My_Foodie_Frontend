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

function addEventListeners(restaurante) {
  document.querySelector('#lista-reseñas').addEventListener('click', handleReseñaListClick);
  initStarRating('#edit-star-rating', (rating) => { editFormRating = rating; });
  document.querySelector('#edit-form').addEventListener('submit', handleUpdateReseñaSubmit);
  document.querySelector('#confirm-delete-button').addEventListener('click', handleConfirmDeleteReseña);

  if (currentUserRole === 'admin') {
    document.querySelector('#add-plato-btn').addEventListener('click', handleShowCreatePlatoModal);
    document.querySelector('#lista-platos').addEventListener('click', handlePlatoListClick);
    document.querySelector('#plato-form').addEventListener('submit', handlePlatoFormSubmit);
    document.querySelector('#confirm-delete-plato-button').addEventListener('click', handleConfirmDeletePlato);
    
    document.querySelector('#edit-rest-btn').addEventListener('click', handleShowEditRestauranteModal);
    document.querySelector('#delete-rest-btn').addEventListener('click', handleShowDeleteRestauranteModal);
    document.querySelector('#edit-restaurante-form').addEventListener('submit', handleEditRestauranteSubmit);
    document.querySelector('#confirm-delete-restaurante-button').addEventListener('click', handleConfirmDeleteRestaurante);
  }
}

async function loadCategoriasIntoModal(selectElementId, selectedId) {
  const select = document.getElementById(selectElementId);
  select.innerHTML = '<option value="">Cargando...</option>';
  try {
    const categorias = await getCategorias();
    select.innerHTML = '';
    categorias.forEach(cat => {
      select.innerHTML += `
        <option value="${cat._id}" ${cat._id === selectedId ? 'selected' : ''}>
          ${cat.nombre}
        </option>
      `;
    });
  } catch (error) {
    select.innerHTML = '<option value="">Error al cargar</option>';
  }
}

function handleShowEditRestauranteModal() {
  const form = document.querySelector('#edit-restaurante-form');
  form.reset();
  document.querySelector('#edit-rest-nombre').value = restauranteActual.nombre;
  document.querySelector('#edit-rest-descripcion').value = restauranteActual.descripcion;
  document.querySelector('#edit-rest-ubicacion').value = restauranteActual.ubicacion;
  document.querySelector('#edit-rest-imagen').value = restauranteActual.imagenUrl || '';
  loadCategoriasIntoModal('edit-rest-categoria', restauranteActual.categoriaId);
  document.querySelector('#edit-rest-alerta').classList.add('d-none');
  modalEditRestaurante.show();
}

function handleShowDeleteRestauranteModal() {
  modalDeleteRestaurante.show();
}

async function handleEditRestauranteSubmit(e) {
  e.preventDefault();
  const alerta = document.querySelector('#edit-rest-alerta');
  const submitButton = document.querySelector('#edit-rest-submit-btn');
  alerta.classList.add('d-none');
  submitButton.disabled = true;

  const datos = {
    nombre: document.querySelector('#edit-rest-nombre').value,
    descripcion: document.querySelector('#edit-rest-descripcion').value,
    ubicacion: document.querySelector('#edit-rest-ubicacion').value,
    categoriaId: document.querySelector('#edit-rest-categoria').value,
    imagenUrl: document.querySelector('#edit-rest-imagen').value || null
  };

  try {
    await actualizarRestauranteApi(restauranteId, datos); 
    modalEditRestaurante.hide();
    window.location.reload();

  } catch (error) {
    alerta.textContent = error.message;
    alerta.classList.remove('d-none');
  } finally {
    submitButton.disabled = false;
  }
}

async function handleConfirmDeleteRestaurante() {
  const button = document.querySelector('#confirm-delete-restaurante-button');
  button.disabled = true;

  try {
    await eliminarRestauranteApi(restauranteId); 
    modalDeleteRestaurante.hide();

    showNotification('Restaurante eliminado correctamente.', '¡Éxito!');
    
    setTimeout(() => {
        window.location.href = '/restaurantes.html';
    }, 1500);

  } catch (error) {
    modalDeleteRestaurante.hide();
    showNotification(error.message, 'Error al Eliminar', 'error');
  } finally {
    button.disabled = false;
  }
}

function renderPlatosListString(platos) {
  if (platos.length === 0) {
    return '<li class="list-group-item text-muted">Aún no hay platos registrados.</li>';
  }
  const placeholderImg = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop';
  
  return platos.map(plato => `
    <li class="list-group-item d-flex justify-content-between align-items-center gap-3">
      <section class="d-flex align-items-center gap-3 flex-grow-1">
        <img 
          src="${plato.imagenUrl || placeholderImg}" 
          alt="${plato.nombre}"
          class="rounded"
          style="width: 64px; height: 64px; object-fit: cover;"
        >
        <div class="flex-grow-1">
          <h6 class="my-0 fw-bold">${plato.nombre}</h6>
          <small class="text-muted d-block">${plato.descripcion}</small>
          <span class="text-primary fw-bold">$${plato.precio}</span>
        </div>
      </section>
      ${currentUserRole === 'admin' ? `
        <section class="d-flex gap-2">
          <button 
            class="btn btn-outline-primary btn-sm" 
            data-action="edit-plato"
            data-plato-id="${plato._id}"
            data-nombre="${plato.nombre}"
            data-descripcion="${plato.descripcion}"
            data-precio="${plato.precio}"
            data-imagen="${plato.imagenUrl || ''}"
          > <i class="bi bi-pencil"></i> </button>
          <button 
            class="btn btn-outline-danger btn-sm" 
            data-action="delete-plato"
            data-plato-id="${plato._id}"
          > <i class="bi bi-trash"></i> </button>
        </section>
      ` : ''}
    </li>
  `).join('');
}

