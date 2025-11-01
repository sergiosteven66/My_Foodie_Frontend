import { getUserData, removeToken } from '../utils/auth.js';
import { getCategorias } from '../services/categorias.service.js';
import { 
  crearRestaurante,
  getRestaurantesPendientes 
} from '../services/restaurantes.service.js';
import { initModal, showNotification } from './Modal.js';
import { initToast } from '../utils/toast.js';

let proposeModalElement = null; 
let logoutModalElement = null;

export function initLayout() {
  const userData = getUserData();
  if (!userData) {
    return;
  }
  const { nombre, rol } = userData;
  const currentPath = window.location.pathname;

  const isAdminPage = currentPath.includes('/admin/');
  
  const rootPrefix = isAdminPage ? '../' : '';
  
  const adminPrefix = isAdminPage ? '' : 'admin/';

  const appContainer = document.createElement('div');
  appContainer.className = 'd-flex vh-100 app-layout';

  const sidebar = document.createElement('aside');
  sidebar.className = 'd-none d-lg-flex flex-column p-3 shadow-sm vh-100 app-sidebar';
  const navLinks = `
    <a href="${rootPrefix}dashboard.html" class="mb-4 d-block">
      <img src="${rootPrefix}assets/img/logo_myfoodie.png" alt="Logo de My Foodie" class="sidebar-logo">
    </a>
    <nav class="nav nav-pills flex-column gap-2 mb-auto">
      <a class="nav-link ${currentPath.endsWith('/dashboard.html') ? 'active' : ''}" href="${rootPrefix}dashboard.html">
        <i class="bi bi-columns-gap me-2"></i>Dashboard
      </a>
      <a class="nav-link ${currentPath.endsWith('/mis-resenas.html') ? 'active' : ''}" href="${rootPrefix}mis-resenas.html">
        <i class="bi bi-star me-2"></i>Mis Reseñas
      </a>
      <a class="nav-link ${currentPath.endsWith('/restaurantes.html') ? 'active' : ''}" href="${rootPrefix}restaurantes.html">
        <i class="bi bi-compass me-2"></i>Explorar
      </a>
      
      ${rol === 'admin' ? `
        <hr>
        <h6 class="nav-link text-muted disabled small">ADMINISTRACIÓN</h6>
        <a class="nav-link ${currentPath.includes('/admin/categorias.html') ? 'active' : ''}" href="${adminPrefix}categorias.html">
          <i class="bi bi-tags me-2"></i>Categorías
        </a>
        <a 
          class="nav-link ${currentPath.includes('/admin/aprobaciones.html') ? 'active' : ''} d-flex justify-content-between align-items-center" 
          href="${adminPrefix}aprobaciones.html"
          id="aprobaciones-link"
        >
          <span>
            <i class="bi bi-patch-check me-2"></i>Aprobaciones
          </span>
          </a>
      ` : ''}
    </nav>
  `;
  sidebar.innerHTML = navLinks;

  const mainContainer = document.createElement('div');
  mainContainer.className = 'flex-grow-1 d-flex flex-column vh-100 app-main-container';
  const header = document.createElement('header');
  header.className = 'd-flex justify-content-between align-items-center bg-white shadow-sm p-3 app-header';
  header.innerHTML = `
    <section class="d-flex align-items-center">
      <button class="btn btn-primary d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobile-sidebar" aria-controls="mobile-sidebar">
        <i class="bi bi-list"></i>
      </button>
      <h2 class="h5 mb-0 ms-2 fw-bold d-lg-none">
        Bienvenido, ${nombre}
      </h2>
      <h2 class="h5 mb-0 ms-2 fw-bold d-none d-lg-block">
        ¡Descubre lugares increíbles!
      </h2>
    </section>
    <section class="d-flex align-items-center gap-3">
      <button 
        class="btn btn-primary d-none d-md-flex align-items-center gap-2"
        id="proponer-restaurante-btn"
      >
        <i class="bi bi-plus-circle"></i>
        <span>Proponer Restaurante</span>
      </button>
      <nav class="dropdown">
        <button 
          class="btn btn-circle btn-primary-light" 
          type="button" 
          data-bs-toggle="dropdown" 
          aria-expanded="false"
        >
          <i class="bi bi-person-fill"></i>
        </button>
        <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
          <li><h6 class="dropdown-header">Hola, ${nombre}</h6></li>
          <li><a class="dropdown-item" href="${rootPrefix}mis-resenas.html">Mi Perfil</a></li>
          <li><hr class="dropdown-divider"></li>
          <li>
            <button class="dropdown-item text-danger" id="logout-button">
              <i class="bi bi-box-arrow-left me-2"></i>Cerrar Sesión
            </button>
          </li>
        </ul>
      </nav>
    </section>
  `;
  const mainContent = document.createElement('main');
  mainContent.className = 'flex-grow-1 p-3 p-md-4 overflow-auto';
  mainContent.id = 'main-content';

  const offcanvas = document.createElement('nav');
  offcanvas.className = 'offcanvas offcanvas-start d-lg-none';
  offcanvas.tabIndex = -1;
  offcanvas.id = 'mobile-sidebar';
  offcanvas.setAttribute('aria-labelledby', 'mobile-sidebar-label');
  offcanvas.innerHTML = `
    <div class="offcanvas-header">
      <h5 class="offcanvas-title" id="mobile-sidebar-label"></h5>
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body d-flex flex-column">
      ${navLinks}
      <hr>
      <button id="logout-button-mobile" class="btn btn-outline-danger w-100">
        <i class="bi bi-box-arrow-left me-2"></i>Cerrar Sesión
      </button>
    </div>
  `;

  mainContainer.append(header, mainContent);
  appContainer.append(sidebar, mainContainer, offcanvas);
  document.body.prepend(appContainer);

  document.body.insertAdjacentHTML('beforeend', createProposeModalHTML());
  document.body.insertAdjacentHTML('beforeend', createLogoutModalHTML());
  document.body.insertAdjacentHTML('beforeend', createNotificationModalHTML());
  document.body.insertAdjacentHTML('beforeend', createToastContainerHTML());

  proposeModalElement = new bootstrap.Modal(document.getElementById('proposeModal'));
  logoutModalElement = new bootstrap.Modal(document.getElementById('logoutModal'));

  addLayoutEventListeners();
  initModal(); 
  initToast(); 

  if (rol === 'admin') {
    loadAdminBadges();
  }
}

function createProposeModalHTML() {
  return `
    <div class="modal fade" id="proposeModal" tabindex="-1" aria-hidden="true">
      <section class="modal-dialog">
        <form class="modal-content" id="propose-form">
          <header class="modal-header">
            <h5 class="modal-title">Proponer un Restaurante</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </header>
          <article class="modal-body">
            <p class="text-muted small mb-3">
              Tu propuesta será revisada por un administrador antes de ser pública.
            </p>
            <fieldset>
              <legend class="visually-hidden">Formulario de Propuesta</legend>
              
              <section class="mb-3">
                <label for="propose-nombre" class="form-label">Nombre del Restaurante</label>
                <input type="text" class="form-control" id="propose-nombre" required>
              </section>

              <section class="mb-3">
                <label for="propose-categoria" class="form-label">Categoría</label>
                <select class="form-select" id="propose-categoria" required>
                  <option value="">Cargando categorías...</option>
                </select>
              </section>

              <section class="mb-3">
                <label for="propose-descripcion" class="form-label">Descripción Breve</label>
                <textarea class="form-control" id="propose-descripcion" rows="3" required></textarea>
              </section>

              <section class="mb-3">
                <label for="propose-ubicacion" class="form-label">Ubicación (Dirección)</label>
                <input type="text" class="form-control" id="propose-ubicacion" required>
              </section>

              <section class="mb-3">
                <label for="propose-imagen" class="form-label">URL de Imagen (Opcional)</label>
                <input type="url" class="form-control" id="propose-imagen" placeholder="https://...">
              </section>

              <section id="propose-alerta" class="alert alert-danger d-none"></section>
            </fieldset>
          </article>
          <footer class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" class="btn btn-primary" id="propose-submit-btn">Enviar Propuesta</button>
          </footer>
        </form>
      </section>
    </div>
  `;
}

function createLogoutModalHTML() {
  return `
    <div class="modal fade" id="logoutModal" tabindex="-1" aria-hidden="true">
      <section class="modal-dialog modal-dialog-centered">
        <article class="modal-content">
          <header class="modal-header">
            <h5 class="modal-title">Confirmar Cierre de Sesión</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </header>
          <article class="modal-body">
            <p>¿Estás seguro de que deseas cerrar sesión?</p>
          </article>
          <footer class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-danger" id="confirm-logout-btn">Sí, Cerrar Sesión</button>
          </footer>
        </article>
      </section>
    </div>
  `;
}

function createNotificationModalHTML() {
  return `
    <div class="modal fade" id="notificationModal" tabindex="-1" aria-hidden="true">
      <section class="modal-dialog modal-dialog-centered">
        <article class="modal-content">
          <header class="modal-header border-0">
             <h5 class="modal-title d-flex align-items-center gap-2">
                <span id="notificationModalIcon">
                </span>
                <span id="notificationModalTitle">¡Éxito!</span>
             </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </header>
          <article class="modal-body">
            <p id="notificationModalBody">El mensaje irá aquí.</p>
          </article>
          <footer class="modal-footer border-0">
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Entendido</button>
          </footer>
        </article>
      </section>
    </div>
  `;
}