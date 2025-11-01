import { API_URL } from './api.js';
import { getToken } from '../utils/auth.js';

export async function getMisStats() {
  const token = getToken();
  if (!token) throw new Error('Acceso denegado.');

  const response = await fetch(`${API_URL}/usuarios/mis-stats`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Error al cargar estadísticas.');
  return data;
}

export async function getMisReseñas() {
  const token = getToken();
  if (!token) throw new Error('Acceso denegado.');

  const response = await fetch(`${API_URL}/usuarios/mis-resenas`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Error al cargar mis reseñas.');
  return data;
}