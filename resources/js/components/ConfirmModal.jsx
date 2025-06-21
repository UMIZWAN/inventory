// utils/confirmAction.js
import Swal from 'sweetalert2';

export default function confirmAction({
  title = 'Are you sure?',
  text = 'This action cannot be undone.',
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  icon = 'warning',
}) {
  return Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor: '#2563eb', // Tailwind blue-600
    cancelButtonColor: '#d1d5db',  // Tailwind gray-300
    confirmButtonText,
    cancelButtonText,
  });
}
