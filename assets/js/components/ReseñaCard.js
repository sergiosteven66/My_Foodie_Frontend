import { renderEstrellasSimples } from '../utils/rendering.js';

export function createReseñaCard(reseña, currentUserId) {
  const { _id, comentario, calificacion, usuarioInfo, fecha, likes, dislikes, usuarioId } = reseña;
  const fechaLocal = new Date(fecha).toLocaleDateString();

  const esMiReseña = (usuarioId === currentUserId);

  const diLike = likes.includes(currentUserId);
  const diDislike = dislikes.includes(currentUserId);

  return `
    <article class="list-group-item list-group-item-action" id="reseña-${_id}">
      <header class="d-flex w-100 justify-content-between">
        <h5 class="mb-1 fw-bold">${usuarioInfo.nombre} ${esMiReseña ? '<span class="fw-normal text-muted">(Tú)</span>' : ''}</h5>
        <small class="text-muted">${fechaLocal}</small>
      </header>
      
      <section class="d-flex mb-2" data-calificacion="${calificacion}">
        ${renderEstrellasSimples(calificacion)}
      </section>
      
      <p class="mb-2" data-comentario="${comentario}">${comentario}</p>
      
      <footer class="d-flex justify-content-between align-items-center">
        <section class="d-flex gap-3">
          <button 
            class="btn btn-sm ${diLike ? 'btn-success' : 'btn-outline-success'}" 
            data-reseña-id="${_id}" 
            data-action="like"
            ${esMiReseña ? 'disabled' : ''}
          >
            <i class="bi bi-hand-thumbs-up${diLike ? '-fill' : ''}"></i> 
            <span data-count="like">${likes.length}</span>
          </button>
          <button 
            class="btn btn-sm ${diDislike ? 'btn-danger' : 'btn-outline-danger'}" 
            data-reseña-id="${_id}" 
            data-action="dislike"
            ${esMiReseña ? 'disabled' : ''}
          >
            <i class="bi bi-hand-thumbs-down${diDislike ? '-fill' : ''}"></i> 
            <span data-count="dislike">${dislikes.length}</span>
          </button>
        </section>

        ${esMiReseña ? `
          <section class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-primary" data-reseña-id="${_id}" data-action="edit">
              <i class="bi bi-pencil"></i> Editar
            </button>
            <button class="btn btn-sm btn-outline-danger" data-reseña-id="${_id}" data-action="delete">
              <i class="bi bi-trash"></i> Eliminar
            </button>
          </section>
        ` : ''}
      </footer>
    </article>
  `;
}