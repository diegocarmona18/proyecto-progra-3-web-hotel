/* dashboard.js
   - Protege el dashboard: si no hay sesión, regresa al login.
   - Muestra datos del usuario.
*/

document.addEventListener("DOMContentLoaded", () => {
  const sessionRaw = localStorage.getItem("hotel_session");

  // Si no hay sesión, no deberían entrar al dashboard
  if (!sessionRaw) {
    window.location.href = "../login.html";
    return;
  }

  const session = JSON.parse(sessionRaw);

  const dashboardContent = document.getElementById("dashboardContent");
  if (!dashboardContent) return;

  // Pintar información básica
  dashboardContent.innerHTML = `
    <div class="card">
      <h2>Bienvenido/a, ${session.name}</h2>
      <p><strong>Rol:</strong> ${session.role}</p>
      <p><strong>Email:</strong> ${session.email}</p>
      <p style="color: var(--muted); font-size: 14px;">
        Sesión iniciada: ${new Date(session.loginAt).toLocaleString()}
      </p>
    </div>
  `;
});