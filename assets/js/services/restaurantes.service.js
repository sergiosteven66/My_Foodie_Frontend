import { API_URL } from './api.js';
import { getToken } from '../utils/auth.js';

export async function getRestaurantes(categoriaId = null, sort = 'ranking') {
  const token = getToken();
  if (!token) throw new Error('Acceso denegado.');

  const params = new URLSearchParams();
  if (categoriaId && categoriaId !== 'todos') {
    params.append('categoria', categoriaId);
  }
  if (sort) {
    params.append('sort', sort);
  }
  
  const queryString = params.toString();
  let url = `${API_URL}/restaurantes`;
  if (queryString) {
    url += `?${queryString}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudieron cargar los restaurantes.');
  }
  return response.json();
}

export async function getRestauranteById(id) {
  const token = getToken();
  if (!token) throw new Error('Acceso denegado.');

  const response = await fetch(`${API_URL}/restaurantes/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'No se pudo cargar el restaurante.');
  }
  return response.json();
}

export async function crearRestaurante(datos) {
  const token = getToken();
  if (!token) throw new Error('Acceso denegado.');

  const response = await fetch(`${API_URL}/restaurantes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMsg = data.errors ? data.errors[0].msg : (data.error || 'No se pudo proponer el restaurante.');
    throw new Error(errorMsg);
  }
  return data;
}

export async function getRestaurantesPendientes() {
  const token = getToken();
  if (!token) throw new Error('Acceso denegado.');

  const response = await fetch(`${API_URL}/restaurantes/admin/pendientes`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Error al cargar pendientes.');
  return data;
}

export async function aprobarRestaurante(id) {
  const token = getToken();
  if (!token) throw new Error('Acceso denegado.');

  const response = await fetch(`${API_URL}/restaurantes/${id}/aprobar`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Error al aprobar.');
  return data;
}

export async function actualizarRestaurante(id, datos) {
  const token = getToken();
  if (!token) throw new Error('Acceso denegado.');

  const response = await fetch(`${API_URL}/restaurantes/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  });
  
  const data = await response.json();
  if (!response.ok) {
     const errorMsg = data.errors ? data.errors[0].msg : (data.error || 'No se pudo actualizar el restaurante.');
    throw new Error(errorMsg);
  }
  return data;
}

export async function eliminarRestaurante(id) {
  const token = getToken();
  if (!token) throw new Error('Acceso denegado.');

  const response = await fetch(`${API_URL}/restaurantes/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Error al eliminar restaurante.');
  return data;
}