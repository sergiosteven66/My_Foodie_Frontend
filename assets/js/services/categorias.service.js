import { API_URL } from './api.js';
import { getToken } from '../utils/auth.js';

export async function getCategorias() {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/categorias`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudieron cargar las categorías.');
  }

  return response.json();
}

export async function crearCategoria(datos) {
  const token = getToken();
  if (!token) throw new Error('Acceso denegado.');

  const response = await fetch(`${API_URL}/categorias`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'No se pudo crear la categoría.');
  return data;
}

export async function actualizarCategoria(id, datos) {
  const token = getToken();
  if (!token) throw new Error('Acceso denegado.');

  const response = await fetch(`${API_URL}/categorias/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'No se pudo actualizar la categoría.');
  return data;
}

export async function eliminarCategoria(id) {
  const token = getToken();
  if (!token) throw new Error('Acceso denegado.');

  const response = await fetch(`${API_URL}/categorias/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'No se pudo eliminar la categoría.');
  return data;
}