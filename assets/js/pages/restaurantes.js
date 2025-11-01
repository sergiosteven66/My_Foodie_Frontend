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

async function fetchAndRenderRestaurantes() {
  if (loader) loader.classList.remove('d-none');
  if (noResultados) noResultados.classList.add('d-none');
  if (grid) grid.classList.add('d-none');
  
  try {
    const restaurantes = await getRestaurantes(currentFilter, currentSort); 
    
    allRestaurantes = restaurantes; 
    applySearchAndRender();

  } catch (error) {
    if (grid) grid.innerHTML = `<p class="alert alert-danger">${error.message}</p>`;
    if (grid) grid.classList.remove('d-none');
    
  } finally {
    if (loader) loader.classList.add('d-none');
  }
}

function applySearchAndRender() {
  let tempRestaurantes = [...allRestaurantes];

  if (currentSearch) {
    const searchTerm = currentSearch.toLowerCase().trim();
    tempRestaurantes = tempRestaurantes.filter(rest => 
      rest.nombre.toLowerCase().includes(searchTerm)
    );
  }

  filteredRestaurantes = tempRestaurantes;
  currentPage = 1;

  displayPage(currentPage);
  setupPagination();

  if (filteredRestaurantes.length === 0) {
    if (noResultados) noResultados.classList.remove('d-none');
    if (grid) grid.classList.add('d-none');
  } else {
    if (noResultados) noResultados.classList.add('d-none');
    if (grid) grid.classList.remove('d-none');
  }
}

function displayPage(page) {
  if (!grid) return;
  
  grid.innerHTML = '';
  currentPage = page;

  const startIndex = (page - 1) * RESTAURANTES_PER_PAGE;
  const endIndex = page * RESTAURANTES_PER_PAGE;
  
  const paginatedItems = filteredRestaurantes.slice(startIndex, endIndex);

  paginatedItems.forEach(restaurante => {
    const cardHTML = createRestauranteCard(restaurante, 'grid');
    grid.insertAdjacentHTML('beforeend', cardHTML);
  });
  
  document.querySelectorAll('#pagination-container .page-item').forEach(item => {
    item.classList.remove('active');
    if (Number(item.dataset.page) === currentPage) {
      item.classList.add('active');
    }
  });
}

function setupPagination() {
  const container = document.querySelector('#pagination-container');
  if (!container) return; 

  container.innerHTML = '';
  
  const totalPages = Math.ceil(filteredRestaurantes.length / RESTAURANTES_PER_PAGE);
  if (totalPages <= 1) return; 

  const ul = document.createElement('ul');
  ul.className = 'pagination';

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement('li');
    li.className = 'page-item';
    if (i === currentPage) li.classList.add('active');
    li.dataset.page = i; 

    const a = document.createElement('a');
    a.className = 'page-link';
    a.href = '#';
    a.textContent = i;
    
    a.addEventListener('click', (e) => {
      e.preventDefault();
      displayPage(i);
    });
    
    li.append(a);
    ul.append(li);
  }
  container.append(ul);
}

function handleFiltroClick(e) {
  const botonClicado = e.target;
  currentFilter = botonClicado.dataset.id; 

  const container = document.querySelector('#filtros-categoria');
  container.querySelectorAll('button').forEach(btn => {
    if (btn.dataset.id === currentFilter) {
      btn.className = 'btn btn-primary';
    } else {
      btn.className = 'btn btn-outline-primary';
    }
  });

  fetchAndRenderRestaurantes();
}

function handleSortClick(sortType) {
  currentSort = sortType;

  const buttonText = document.querySelector('#sort-dropdown-button');
  const linkClicked = document.querySelector(`.dropdown-item[data-sort="${sortType}"]`);
  
  buttonText.textContent = `Ordenar por: ${linkClicked.textContent.trim()}`;
  
  document.querySelectorAll('.dropdown-item[data-sort]').forEach(link => {
    link.classList.remove('active');
  });
  
  linkClicked.classList.add('active');

  fetchAndRenderRestaurantes();
}

function handleSearchInput(searchTerm) {
  currentSearch = searchTerm; 
  applySearchAndRender();
}