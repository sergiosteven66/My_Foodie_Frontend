import { API_URL } from './api.js';
import { getToken } from '../utils/auth.js';

export async function getReseñasPorRestaurante(restauranteId) {
  const token = getToken();
  if (!token) throw new Error('Acceso denegado.');

  const response = await fetch(`${API_URL}/restaurantes/${restauranteId}/resenas`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudieron cargar las reseñas.');
  }

  return response.json();
}

export async function crearReseña(restauranteId, datos) {
  const token = getToken();
  if (!token) throw new Error('Debes iniciar sesión para reseñar.');

  const response = await fetch(`${API_URL}/restaurantes/${restauranteId}/resenas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'No se pudo publicar la reseña.');
  return data;
}

export async function likeDislikeReseña(reseñaId, tipo) {
  const token = getToken();
  if (!token) throw new Error('Debes iniciar sesión para votar.');

  const response = await fetch(`${API_URL}/resenas/${reseñaId}/${tipo}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'No se pudo registrar el voto.');
  return data;
}

export async function actualizarReseña(reseñaId, datos) {
  const token = getToken();
  if (!token) throw new Error('Acceso denegado.');

  const response = await fetch(`${API_URL}/resenas/${reseñaId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'No se pudo actualizar la reseña.');
  return data;
}

export async function eliminarReseña(reseñaId) {
  const token = getToken();
  if (!token) throw new Error('Acceso denegado.');

  const response = await fetch(`${API_URL}/resenas/${reseñaId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'No se pudo eliminar la reseña.');
  return data;
}