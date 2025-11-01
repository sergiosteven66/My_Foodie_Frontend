import { initLayout } from '../components/Layout.js';
import { getMisReseñas } from '../services/usuarios.service.js';

export function initMisResenasPage() {
    initLayout();

    const mainContent = document.querySelector('#main-content');
    mainContent.innerHTML = `
        <section class="container-fluid">
            <header class="mb-4">
                <h1 class="h3 fw-bold">Mis Reseñas</h1>
                <p class="text-muted">Todas las opiniones que has compartido.</p>
            </header>

            <section id="lista-mis-reseñas" class="list-group list-group-flush shadow-sm">
                <div class="list-group-item text-center">
                    Cargando mis reseñas...
                </div>
            </section>
        </section>
    `;

    loadReseñas();
}

async function loadReseñas() {
    const container = document.querySelector('#lista-mis-reseñas');

    try {
        const reseñas = await getMisReseñas();

        if (reseñas.length === 0) {
            container.innerHTML = `
                <div class="list-group-item text-center p-4">
                    <i class="bi bi-chat-square-text display-4 text-muted"></i>
                    <h5 class="mt-3">Aún no has escrito reseñas</h5>
                    <p class="text-muted">¡Empieza a explorar y comparte tu opinión!</p>
                    <a href="restaurantes.html" class="btn btn-primary">Explorar restaurantes</a>
                </div>
            `;
            return;
        }

        container.innerHTML = reseñas.map(createMiReseñaCard).join('');

    } catch (error) {
        container.innerHTML = `<div class="list-group-item alert alert-danger">${error.message}</div>`;
    }
}

function renderEstrellas(calificacion) {
    let estrellasHTML = '';
    for (let i = 1; i <= 5; i++) {
        estrellasHTML += `<i class="bi bi-star${i <= calificacion ? '-fill' : ''} text-primary"></i>`;
    }
    return estrellasHTML;
}

function createMiReseñaCard(reseña) {
    const { comentario, calificacion, restauranteInfo, fecha } = reseña;
    const fechaLocal = new Date(fecha).toLocaleDateString();

    return `
    <article class="list-group-item list-group-item-action py-3">
        <header class="d-flex w-100 justify-content-between">
            <h5 class="mb-1 fw-bold">${restauranteInfo.nombre}</h5>
            <small class="text-muted">${fechaLocal}</small>
        </header>
        
        <section class="d-flex mb-2">
            ${renderEstrellas(calificacion)}
        </section>
        
        <p class="mb-1">${comentario}</p>
        
        <footer class="mt-2">
            <a href="detalle.html?id=${restauranteInfo._id}" class="btn btn-sm btn-outline-primary">
                Ver Restaurante
            </a>
        </footer>
    </article>
    `;
}