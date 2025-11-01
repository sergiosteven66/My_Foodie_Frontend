import { renderEstrellas } from '../utils/rendering.js';

export function createRestauranteCard(restaurante, tipo = 'simple') {
    const { _id, nombre, categoriaInfo, imagenUrl, rankingPonderado, descripcion } = restaurante;
    const placeholderImg = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop';

    const gridClasses = (tipo === 'grid') ? 'h-100 shadow-sm text-dark' : 'h-100 shadow-sm text-decoration-none';
    const imgHeight = (tipo === 'grid') ? '200px' : '180px';
    const bodyClasses = (tipo === 'grid') ? 'card-body d-flex flex-column' : 'card-body d-flex flex-column';
    const footerAlignment = (tipo === 'grid') ? 'd-flex justify-content-end align-items-center' : 'mt-auto text-end';
    
    const descripcionHtml = (tipo === 'grid' && descripcion) ? `
      <p class="card-text text-muted small mb-3">
        ${descripcion.substring(0, 100)}...
      </p>
    ` : '';

    const categoriaHtml = (tipo === 'grid') ? `
      <span class="badge rounded-pill text-bg-secondary mb-2 align-self-start"> 
        ${categoriaInfo.nombre}
      </span>
    ` : `
      <p class="card-text text-muted mb-3">${categoriaInfo.nombre}</p>
    `;

    return `
    <article class="col">
      <a href="detalle.html?id=${_id}" class="card text-decoration-none ${gridClasses}">
        <img 
          src="${imagenUrl || placeholderImg}" 
          class="card-img-top" 
          alt="Imagen de ${nombre}"
          style="height: ${imgHeight}; object-fit: cover;"
        >
        <section class="${bodyClasses}">
          ${categoriaHtml}
          <h5 class="card-title fw-bold text-dark">${nombre}</h5>
          ${descripcionHtml}
          
          <footer class="card-footer bg-white border-0 p-0 ${footerAlignment}">
            ${renderEstrellas(rankingPonderado)}
          </footer>
        </section>
      </a>
    </article>
  `;
}