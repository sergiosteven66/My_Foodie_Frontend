let modalInstance = null;
let modalElement = null;

let modalTitle = null;
let modalBody = null;
let modalIcon = null;

export function initModal() {
  modalElement = document.getElementById('notificationModal');
  if (!modalElement) {
    console.error('Error: El HTML del modal de notificación no se encontró.');
    return;
  }

  modalTitle = document.getElementById('notificationModalTitle');
  modalBody = document.getElementById('notificationModalBody');
  modalIcon = document.getElementById('notificationModalIcon');
  
  modalInstance = new bootstrap.Modal(modalElement);
}

export function showNotification(message, title = 'Notificación', type = 'success') {
  if (!modalInstance || !modalTitle || !modalBody || !modalIcon) {
    alert(message);
    return;
  }

  modalTitle.textContent = title;
  modalBody.textContent = message;

  if (type === 'success') {
    modalIcon.innerHTML = '<i class="bi bi-check-circle-fill text-success"></i>';
    modalTitle.classList.remove('text-danger');
    modalTitle.classList.add('text-dark');
  } else if (type === 'error') {
    modalIcon.innerHTML = '<i class="bi bi-x-circle-fill text-danger"></i>';
    modalTitle.classList.remove('text-dark');
    modalTitle.classList.add('text-danger');
  }

  modalInstance.show();
}