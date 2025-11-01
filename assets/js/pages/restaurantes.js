import { initLayout } from '../components/Layout.js';
import { createRestauranteCard } from '../components/RestauranteCard.js';
import { getCategorias } from '../services/categorias.service.js';
import { getRestaurantes } from '../services/restaurantes.service.js';

let allRestaurantes = []; 
let filteredRestaurantes = []; 

let currentFilter = 'todos';
let currentSort = 'ranking'; 
let currentSearch = '';
let currentPage = 1;
const RESTAURANTES_PER_PAGE = 6; 

let loader = null;
let noResultados = null;
let grid = null;

export function initRestaurantesPage() {
  initLayout(); 
  const mainContent = document.querySelector('#main-content');
  
  const restaurantesHTML = `
    <section class="container-fluid">
      
      <header class="mb-4">
        <form id="search-form">
          <fieldset class="input-group input-group-lg shadow-sm">
            <span class="input-group-text bg-white border-0">
              <i class="bi bi-search"></i>
            </span>
            <input 
              type="search" 
              class="form-control bg-white border-0" 
              placeholder="Buscar restaurantes por nombre..."
              id="search-input"
            >
          </fieldset>
        </form>
      </header>

      <nav id="filtros-categoria" class="nav nav-pills flex-wrap gap-2 mb-4">
        <span class="text-muted">Cargando filtros...</span>
      </nav>
      
      <nav class="d-flex justify-content-end mb-3">
        <div class="dropdown">
          <button 
            id="sort-dropdown-button" 
            class="btn btn-light dropdown-toggle" 
            type="button" 
            data-bs-toggle="dropdown" 
            aria-expanded="false"
          >
            Ordenar por: Ranking
          </button>
          <ul class="dropdown-menu" aria-labelledby="sort-dropdown-button">
            <li><a class="dropdown-item active" href="#" data-sort="ranking">Ranking</a></li>
            <li><a class="dropdown-item" href="#" data-sort="popularidad">Popularidad</a></li>
            <li><a class="dropdown-item" href="#" data-sort="recientes">Recientes</a></li>
          </ul>
        </div>
      </nav>

      <p id="grid-loader" class="text-center fs-5 text-muted py-5">
        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        Cargando restaurantes...
      </p>

      <section 
        id="restaurantes-grid" 
        class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 d-none"
      ></section>

      <section id="no-resultados" class="text-center p-5 d-none">
        <i class="bi bi-search display-4 text-muted"></i>
        <h4 class="mt-3">No se encontraron restaurantes</h4>
        <p class="text-muted">Intenta con otros filtros o término de búsqueda.</p>
      </section>
      <nav id="pagination-container" class="d-flex justify-content-center mt-5"></nav>
      
    </section>
  `;
  
  mainContent.innerHTML = restaurantesHTML;

  loader = document.querySelector('#grid-loader');
  noResultados = document.querySelector('#no-resultados');
  grid = document.querySelector('#restaurantes-grid');

  document.querySelectorAll('.dropdown-item[data-sort]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      handleSortClick(link.dataset.sort);
    });
  });

  document.querySelector('#search-input').addEventListener('input', (e) => {
    handleSearchInput(e.target.value);
  });

  loadFiltros(); 
  fetchAndRenderRestaurantes();
}

async function loadFiltros() {
  const container = document.querySelector('#filtros-categoria');
  try {
    const categorias = await getCategorias();
    container.innerHTML = ''; 
    
    const btnTodos = document.createElement('button');
    btnTodos.className = 'btn btn-primary'; 
    btnTodos.textContent = 'Todos';
    btnTodos.dataset.id = 'todos'; 
    btnTodos.addEventListener('click', handleFiltroClick);
    container.append(btnTodos);

    categorias.forEach(cat => {
      const btnCat = document.createElement('button');
      btnCat.className = 'btn btn-outline-primary';
      btnCat.textContent = cat.nombre;
      btnCat.dataset.id = cat._id;
      btnCat.addEventListener('click', handleFiltroClick);
      container.append(btnCat);
    });

  } catch (error) {
    container.innerHTML = `<span class="alert alert-danger">${error.message}</span>`;
  }
}