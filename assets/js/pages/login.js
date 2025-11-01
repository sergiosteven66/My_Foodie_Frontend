import { saveToken } from '../utils/auth.js';
import { loginUser, registerUser } from '../services/auth.service.js';
import { initModal, showNotification } from '../components/Modal.js';
import { initToast, showToast } from '../utils/toast.js';

export function initLoginPage() {
  initModal(); 
  initToast();

  const loginForm = document.querySelector('#login-form');
  const registerForm = document.querySelector('#register-form');
  
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    const email = document.querySelector('#login-email').value;
    const password = document.querySelector('#login-password').value;

    try {
      const data = await loginUser(email, password);
      saveToken(data.token);
      window.location.href = 'dashboard.html';

    } catch (error) {
      showNotification(error.message, 'Error de Inicio de Sesión', 'error');
    }
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.querySelector('#register-nombre').value;
    const email = document.querySelector('#register-email').value;
    const password = document.querySelector('#register-password').value;

    try {
      await registerUser(nombre, email, password);

      showToast('Usuario creado correctamente. Ahora puedes iniciar sesión.');
      
      registerForm.reset();

      const loginTab = new bootstrap.Tab(document.querySelector('#login-tab'));
      loginTab.show();

    } catch (error) {
      showNotification(error.message, 'Error de Registro', 'error');
    }
  });
}