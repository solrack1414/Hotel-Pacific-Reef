// Ejemplo de envío de datos al backend

// PERFIL - actualizar email
document.getElementById('perfilForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;

  await fetch('http://localhost:3000/usuarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'usuarioDemo', password: '1234', email })
  });

  alert('Perfil actualizado en SQLite');
});

// RESERVAS - guardar reserva
document.getElementById('reservaForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fecha = document.getElementById('fecha').value;
  const hora = document.getElementById('hora').value;

  await fetch('http://localhost:3000/reservas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario_id: 1, fecha, hora })
  });

  alert('Reserva guardada');
});
