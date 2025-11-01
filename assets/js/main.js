import { getToken } from './utils/auth.js';

async function routeHandler() {
  const path = window.location.pathname;
  const token = getToken();

  const isAdminPage = path.includes('/admin/');
  const rootPrefix = isAdminPage ? '../' : '';

  const isAuthPage = path.endsWith('/index.html') || path.endsWith('/My_Foodie_Frontend/');
  
  if (token && isAuthPage) {
    window.location.href = 'dashboard.html';
    return;
  }

  if (!token && !isAuthPage) {
     window.location.href = rootPrefix + 'index.html';
     return;
  }

  if (isAuthPage) {
    const { initLoginPage } = await import('./pages/login.js');
    initLoginPage();

  } else if (path.endsWith('/dashboard.html')) {
    const { initDashboardPage } = await import('./pages/dashboard.js');
    initDashboardPage();
  
  } else if (path.endsWith('/restaurantes.html')) {
    const { initRestaurantesPage } = await import('./pages/restaurantes.js');
    initRestaurantesPage();
  
  } else if (path.endsWith('/detalle.html')) {
    const { initDetallePage } = await import('./pages/detalle.js');
    initDetallePage();
  
  } else if (path.endsWith('/mis-resenas.html')) {
    const { initMisResenasPage } = await import('./pages/misReseñas.js');
    initMisResenasPage();

  } else if (path.includes('/admin/categorias.html')) {
    const { initAdminCategoriasPage } = await import('./pages/adminCategorias.js');
    initAdminCategoriasPage();

  } else if (path.includes('/admin/aprobaciones.html')) {
    const { initAdminAprobacionesPage } = await import('./pages/adminAprobaciones.js');
    initAdminAprobacionesPage();
  }
}

document.addEventListener('DOMContentLoaded', routeHandler);