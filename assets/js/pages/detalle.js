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

async function refreshPlatos(platosCargados = null) {
  const container = document.querySelector('#lista-platos');
  container.innerHTML = `<li class="list-group-item text-muted">Actualizando...</li>`;
  try {
    let platos;
    if (platosCargados) {
      platos = platosCargados; 
    } else {
      const restaurante = await getRestauranteById(restauranteId);
      platos = restaurante.platos;
    }
    container.innerHTML = renderPlatosListString(platos);
  } catch (error) {
    container.innerHTML = `<li class="list-group-item text-danger">Error al refrescar platos.</li>`;
  }
}

function handlePlatoListClick(e) {
  const target = e.target.closest('button[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  const platoId = target.dataset.platoId;
  if (action === 'edit-plato') {
    handleShowEditPlatoModal(target.dataset);
  }
  if (action === 'delete-plato') {
    handleShowDeletePlatoModal(platoId);
  }
}

function handleShowCreatePlatoModal() {
  const form = document.querySelector('#plato-form');
  form.reset();
  document.querySelector('#plato-id').value = '';
  document.querySelector('#plato-modal-title').textContent = 'Añadir Plato';
  document.querySelector('#plato-alerta').classList.add('d-none');
  modalPlato.show();
}

function handleShowEditPlatoModal(dataset) {
  const form = document.querySelector('#plato-form');
  form.reset();
  document.querySelector('#plato-id').value = dataset.platoId;
  document.querySelector('#plato-nombre').value = dataset.nombre;
  document.querySelector('#plato-descripcion').value = dataset.descripcion;
  document.querySelector('#plato-precio').value = dataset.precio;
  document.querySelector('#plato-imagen').value = dataset.imagen;
  document.querySelector('#plato-modal-title').textContent = 'Editar Plato';
  document.querySelector('#plato-alerta').classList.add('d-none');
  modalPlato.show();
}

function handleShowDeletePlatoModal(platoId) {
  document.querySelector('#delete-plato-id').value = platoId;
  modalDeletePlato.show();
}

async function handlePlatoFormSubmit(e) {
  e.preventDefault();
  const alerta = document.querySelector('#plato-alerta');
  const submitButton = document.querySelector('#plato-submit-btn');
  alerta.classList.add('d-none');
  submitButton.disabled = true;

  const platoId = document.querySelector('#plato-id').value;
  const datos = {
    nombre: document.querySelector('#plato-nombre').value,
    descripcion: document.querySelector('#plato-descripcion').value,
    precio: parseFloat(document.querySelector('#plato-precio').value),
    imagenUrl: document.querySelector('#plato-imagen').value || null,
  };

  try {
    if (platoId) {
      await actualizarPlato(platoId, datos);
    } else {
      await crearPlato(restauranteId, datos);
    }
    modalPlato.hide();
    refreshPlatos(); 
  } catch (error) {
    alerta.textContent = error.message;
    alerta.classList.remove('d-none');
  } finally {
    submitButton.disabled = false;
  }
}

async function handleConfirmDeletePlato() {
  const platoId = document.querySelector('#delete-plato-id').value;
  const button = document.querySelector('#confirm-delete-plato-button');
  button.disabled = true;
  try {
    await eliminarPlato(platoId);
    modalDeletePlato.hide();
    refreshPlatos(); 
  } catch (error) {
    modalDeletePlato.hide();
    showNotification(error.message, 'Error al Eliminar', 'error');
  } finally {
    button.disabled = false;
  }
}

async function refreshReseñas() {
  const container = document.querySelector('#lista-reseñas');
  const formContainer = document.querySelector('#form-reseña-container');
  container.innerHTML = `<div class="list-group-item text-muted">Actualizando...</div>`;
  formContainer.innerHTML = `<div class="card-body text-muted">Cargando...</div>`;

  try {
    const reseñas = await getReseñasPorRestaurante(restauranteId);
    container.innerHTML = renderReseñasListString(reseñas);
    const miReseña = reseñas.find(r => r.usuarioId === currentUserId);
    renderReseñaForm(miReseña);
  } catch (error) {
    container.innerHTML = `<p class="list-group-item text-danger">Error al refrescar reseñas.</p>`;
  }
}

function renderReseñasListString(reseñas) {
  if (reseñas.length > 0) {
    return reseñas.map(r => createReseñaCard(r, currentUserId)).join('');
  } else {
    return '<p class="list-group-item text-muted" id="sin-reseñas">Sé el primero en dejar una reseña.</p>';
  }
}

function renderReseñaForm(miReseña) {
  const formContainer = document.querySelector('#form-reseña-container');
  if (miReseña) {
    formContainer.innerHTML = `
      <div class="card-body text-center">
        <p class="text-muted"><i class="bi bi-check-circle-fill text-success me-2"></i>Ya has enviado una reseña.</p>
      </div>
    `;
  } else {
    formContainer.innerHTML = `
      <form class="card-body" id="reseña-form">
        <fieldset>
          <legend class="visually-hidden">Formulario de Reseña</legend>
          <section class="mb-3">
            <label class="form-label">Calificación</label>
            <div class="star-rating" id="create-star-rating" data-current-rating="0">
              <i class="bi bi-star-fill" data-value="1"></i>
              <i class="bi bi-star-fill" data-value="2"></i>
              <i class="bi bi-star-fill" data-value="3"></i>
              <i class="bi bi-star-fill" data-value="4"></i>
              <i class="bi bi-star-fill" data-value="5"></i>
            </div>
          </section>
          <section class="mb-3">
            <label for="comentario" class="form-label">Comentario</label>
            <textarea id="comentario" class="form-control" rows="3" required></textarea>
          </section>
          <button type="submit" class="btn btn-primary w-100">Publicar Reseña</button>
          <section id="reseña-alerta" class="alert alert-danger mt-3 d-none"></section>
        </fieldset>
      </form>
    `;
    document.querySelector('#reseña-form')?.addEventListener('submit', handleReseñaSubmit);
    initStarRating('#create-star-rating', (rating) => { reseñaFormRating = rating; });
  }
}

function initStarRating(selector, callback) {
  const container = document.querySelector(selector);
  if (!container) return;
  const stars = Array.from(container.querySelectorAll('i'));
  const setRating = (value) => {
    stars.forEach((star, index) => {
      star.classList.toggle('selected', index < value);
      star.classList.remove('hover');
    });
  };
  const setHover = (value) => {
    stars.forEach((star, index) => {
      star.classList.toggle('hover', index < value);
      star.classList.remove('selected');
    });
  };
  stars.forEach(star => {
    const value = star.dataset.value;
    star.addEventListener('mouseover', () => setHover(value));
    star.addEventListener('click', () => {
      const rating = star.dataset.value;
      container.dataset.currentRating = rating; 
      callback(Number(rating));
      setRating(rating);
    });
  });
  container.addEventListener('mouseleave', () => {
    const currentRating = container.dataset.currentRating;
    stars.forEach(s => s.classList.remove('hover'));
    setRating(currentRating);
  });
  setRating(container.dataset.currentRating);
}

function handleReseñaListClick(e) {
  const target = e.target.closest('button[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  const reseñaId = target.dataset.reseñaId;
  if (action === 'like' || action === 'dislike') {
    handleLikeDislikeClick(reseñaId, action);
  }
  if (action === 'edit') {
    handleEditReseñaClick(reseñaId);
  }
  if (action === 'delete') {
    handleDeleteReseñaClick(reseñaId);
  }
}

async function handleReseñaSubmit(e) {
  e.preventDefault();
  const alerta = document.querySelector('#reseña-alerta');
  alerta.classList.add('d-none');
  const submitButton = e.target.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  const comentario = document.querySelector('#comentario').value;
  if (reseñaFormRating === 0) {
    alerta.textContent = 'Por favor, selecciona una calificación.';
    alerta.classList.remove('d-none');
    submitButton.disabled = false;
    return;
  }
  try {
    const datos = { calificacion: reseñaFormRating, comentario };
    await crearReseña(restauranteId, datos);
    refreshReseñas(); 
  } catch (error) {
    alerta.textContent = error.message;
    alerta.classList.remove('d-none');
    submitButton.disabled = false;
  }
}

async function handleLikeDislikeClick(reseñaId, tipo) {
  const likeButton = document.querySelector(`button[data-reseña-id="${reseñaId}"][data-action="like"]`);
  const dislikeButton = document.querySelector(`button[data-reseña-id="${reseñaId}"][data-action="dislike"]`);
  if (!likeButton || !dislikeButton) return; 
  likeButton.disabled = true;
  dislikeButton.disabled = true;
  try {
    await likeDislikeReseña(reseñaId, tipo);
    refreshReseñas();
  } catch (error) {
    console.error(error.message);
    refreshReseñas(); 
  }
}

function handleEditReseñaClick(reseñaId) {
  const reseñaCard = document.querySelector(`#reseña-${reseñaId}`);
  const comentario = reseñaCard.querySelector('[data-comentario]').dataset.comentario;
  const calificacion = reseñaCard.querySelector('[data-calificacion]').dataset.calificacion;
  document.querySelector('#edit-reseña-id').value = reseñaId;
  document.querySelector('#edit-comentario').value = comentario;
  const starContainer = document.querySelector('#edit-star-rating');
  starContainer.dataset.currentRating = calificacion;
  editFormRating = Number(calificacion);
  initStarRating('#edit-star-rating', (rating) => { editFormRating = rating; });
  modalEdit.show();
}

async function handleUpdateReseñaSubmit(e) {
  e.preventDefault();
  const reseñaId = document.querySelector('#edit-reseña-id').value;
  const comentario = document.querySelector('#edit-comentario').value;
  const calificacion = editFormRating;
  if (calificacion === 0) return;
  try {
    const datos = { comentario, calificacion };
    await actualizarReseñaApi(reseñaId, datos);
    modalEdit.hide();
    refreshReseñas();
  } catch (error) {
    console.error(`Error al actualizar: ${error.message}`);
  }
}

function handleDeleteReseñaClick(reseñaId) {
  document.querySelector('#delete-reseña-id').value = reseñaId;
  modalDelete.show();
}

async function handleConfirmDeleteReseña() {
  const reseñaId = document.querySelector('#delete-reseña-id').value;
  const button = document.querySelector('#confirm-delete-button');
  button.disabled = true;
  try {
    await eliminarReseñaApi(reseñaId);
    modalDelete.hide();
    refreshReseñas(); 
  } catch (error) {
    console.error(`Error al eliminar: ${error.message}`);
    modalDelete.hide();
  } finally {
    button.disabled = false;
  }
}