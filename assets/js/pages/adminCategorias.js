import { initLayout } from '../components/Layout.js';
import { checkAdminGuard } from '../utils/guards.js';
import { 
  getCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
} from '../services/categorias.service.js';

let modalElement = null;
let modalDeleteElement = null;
const LOADER_HTML = `<tr><td colspan="3" class="text-center">Cargando...</td></tr>`;

export function initAdminCategoriasPage() {
  if (!checkAdminGuard()) return;

  initLayout(); 
  
  modalElement = new bootstrap.Modal(document.getElementById('categoriaModal'));
  modalDeleteElement = new bootstrap.Modal(document.getElementById('deleteModal'));

  const mainContent = document.querySelector('#main-content');
  mainContent.innerHTML = `
    <section class="container-fluid">
      <header class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 fw-bold">Gestión de Categorías</h1>
        <button class="btn btn-primary" id="crear-btn">
          <i class="bi bi-plus-circle me-2"></i>Crear Nueva
        </button>
      </header>

      <article class="card shadow-sm">
        <section class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Descripción</th>
                <th scope="col" class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody id="tabla-categorias">
              ${LOADER_HTML}
            </tbody>
          </table>
        </section>
      </article>
    </section>
  `;

  loadCategorias();
  addEventListeners();
}

async function loadCategorias() {
  const tablaBody = document.querySelector('#tabla-categorias');
  tablaBody.innerHTML = LOADER_HTML;

  try {
    const categorias = await getCategorias();
    
    if (categorias.length === 0) {
      tablaBody.innerHTML = `<tr><td colspan="3" class="text-center text-muted">No hay categorías creadas.</td></tr>`;
      return;
    }

    tablaBody.innerHTML = categorias.map(cat => `
      <tr>
        <td class="fw-medium">${cat.nombre}</td>
        <td class="text-muted">${cat.descripcion || 'Sin descripción'}</td>
        <td class="text-end">
          <button 
            class="btn btn-sm btn-outline-primary me-2" 
            data-id="${cat._id}" 
            data-nombre="${cat.nombre}" 
            data-descripcion="${cat.descripcion || ''}"
            data-action="edit"
          >
            Editar
          </button>
          <button 
            class="btn btn-sm btn-outline-danger" 
            data-id="${cat._id}"
            data-action="delete"
          >
            Eliminar
          </button>
        </td>
      </tr>
    `).join('');

  } catch (error) {
    tablaBody.innerHTML = `<tr><td colspan="3" class="text-center text-danger">${error.message}</td></tr>`;
  }
}

function addEventListeners() {
  document.querySelector('#crear-btn').addEventListener('click', handleShowCreateModal);

  document.querySelector('#categoria-form').addEventListener('submit', handleFormSubmit);

  document.querySelector('#confirm-delete-button').addEventListener('click', handleConfirmDelete);

  document.querySelector('#tabla-categorias').addEventListener('click', (e) => {
    const target = e.target;
    if (target.tagName !== 'BUTTON') return;

    const action = target.dataset.action;
    const id = target.dataset.id;

    if (action === 'edit') {
      handleShowEditModal(id, target.dataset.nombre, target.dataset.descripcion);
    }
    if (action === 'delete') {
      handleShowDeleteModal(id);
    }
  });
}

function handleShowCreateModal() {
  const form = document.querySelector('#categoria-form');
  form.reset(); 
  document.querySelector('#categoria-id').value = ''; 
  document.querySelector('#modal-title').textContent = 'Crear Categoría';
  document.querySelector('#categoria-alerta').classList.add('d-none');
  
  modalElement.show();
}

function handleShowEditModal(id, nombre, descripcion) {
  const form = document.querySelector('#categoria-form');
  form.reset();
  
  document.querySelector('#categoria-id').value = id;
  document.querySelector('#categoria-nombre').value = nombre;
  document.querySelector('#categoria-descripcion').value = descripcion;
  document.querySelector('#modal-title').textContent = 'Editar Categoría';
  document.querySelector('#categoria-alerta').classList.add('d-none');
  
  modalElement.show();
}

function handleShowDeleteModal(id) {
  document.querySelector('#delete-categoria-id').value = id;
  modalDeleteElement.show();
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const alerta = document.querySelector('#categoria-alerta');
  const submitButton = document.querySelector('#guardar-btn');
  alerta.classList.add('d-none');
  submitButton.disabled = true;

  const id = document.querySelector('#categoria-id').value;
  const datos = {
    nombre: document.querySelector('#categoria-nombre').value,
    descripcion: document.querySelector('#categoria-descripcion').value
  };

  try {
    if (id) {
      await actualizarCategoria(id, datos);
    } else {
      await crearCategoria(datos);
    }

    modalElement.hide();
    loadCategorias();  

  } catch (error) {
    alerta.textContent = error.message;
    alerta.classList.remove('d-none');
  } finally {
    submitButton.disabled = false;
  }
}

async function handleConfirmDelete() {
  const id = document.querySelector('#delete-categoria-id').value;
  const button = document.querySelector('#confirm-delete-button');
  button.disabled = true;

  try {
    await eliminarCategoria(id);
    
    modalDeleteElement.hide();
    loadCategorias();

  } catch (error) {
    modalDeleteElement.hide();
    const mainContent = document.querySelector('#main-content');
    mainContent.insertAdjacentHTML('afterbegin', `
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <strong>Error:</strong> ${error.message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `);
  } finally {
    button.disabled = false;
  }
}