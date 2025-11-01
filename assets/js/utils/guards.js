import { getUserData } from './auth.js';

export function checkAdminGuard() {
  const userData = getUserData();
  
  if (!userData || userData.rol !== 'admin') {
    console.warn('Acceso denegado. Se requiere rol de administrador.');
    window.location.href = 'dashboard.html';
    return false;
  }
  
  return true;
}