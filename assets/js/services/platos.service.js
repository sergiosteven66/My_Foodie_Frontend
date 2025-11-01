import { API_URL } from './api.js';
import { getToken } from '../utils/auth.js';

export async function crearPlato(restauranteId, datos) {
  const token = getToken();
  if (!token) throw new Error('Acceso denegado.');

  const response = await fetch(`${API_URL}/restaurantes/${restauranteId}/platos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMsg = data.errors ? data.errors[0].msg : (data.error || 'No se pudo crear el plato.');
    throw new Error(errorMsg);
  }
  return data;
}

export async function actualizarPlato(platoId, datos) {
  const token = getToken();
  if (!token) throw new Error('Acceso denegado.');

  const response = await fetch(`${API_URL}/platos/${platoId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMsg = data.errors ? data.errors[0].msg : (data.error || 'No se pudo actualizar el plato.');
    throw new Error(errorMsg);
  }
  return data;
}

export async function eliminarPlato(platoId) {
  const token = getToken();
  if (!token) throw new Error('Acceso denegado.');

  const response = await fetch(`${API_URL}/platos/${platoId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'No se pudo eliminar el plato.');
  return data;
}