let toastInstance = null;
let toastTitleEl = null;
let toastBodyEl = null;

export function initToast() {
    const toastElement = document.getElementById('notificationToast');
    if (!toastElement) {
        console.warn('El HTML del Toast no se ha encontrado. No se mostrarán toasts.');
        return;
    }
    toastTitleEl = document.getElementById('notificationToastTitle');
    toastBodyEl = document.getElementById('notificationToastBody');
    toastInstance = new bootstrap.Toast(toastElement, { delay: 3000 });
}

export function showToast(message, title = '¡Éxito!', iconClass = 'bi-check-circle-fill text-success') {
    if (!toastInstance) {
        console.error('Toast no inicializado. Llamando a alert() como fallback.');
        alert(message); 
        return;
    }

    if (toastTitleEl) {
        toastTitleEl.innerHTML = `<i class="bi ${iconClass} me-2"></i> <strong class="me-auto">${title}</strong>`;
    }
    if (toastBodyEl) {
        toastBodyEl.textContent = message;
    }

    toastInstance.show();
}