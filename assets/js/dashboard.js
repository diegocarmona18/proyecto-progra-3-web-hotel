/* dashboard.js
   Controla el acceso al dashboard y muestra datos administrativos ficticios.
*/

document.addEventListener("DOMContentLoaded", function () {
  validarSesionDashboard();
  activarCerrarSesion();
  cargarDatosFicticios();
  crearGraficoReservas();
});

function validarSesionDashboard() {
  const sesionGuardada = localStorage.getItem("hotel_session");

  if (!sesionGuardada) {
    window.location.href = "../login.html";
    return;
  }

  const sesion = JSON.parse(sesionGuardada);

  if (sesion.role !== "admin" && sesion.role !== "staff") {
    window.location.href = "../index.html";
    return;
  }

  const nombreAdmin = document.getElementById("nombreAdmin");
  if (nombreAdmin) {
    nombreAdmin.textContent = sesion.name;
  }
}

function activarCerrarSesion() {
  const botonCerrarSesion = document.getElementById("cerrarSesionAdmin");

  if (!botonCerrarSesion) return;

  botonCerrarSesion.addEventListener("click", function (e) {
    e.preventDefault();

    localStorage.removeItem("hotel_session");
    localStorage.removeItem("busqueda_hotel");

    window.location.href = "../index.html";
  });
}

function cargarDatosFicticios() {
  document.getElementById("reservasMes").textContent = "128";
  document.getElementById("ocupacionHotel").textContent = "76%";
  document.getElementById("clientesNuevos").textContent = "34";
  document.getElementById("cancelacionesMes").textContent = "9";
}

function crearGraficoReservas() {
  const canvas = document.getElementById("graficoReservas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"],
      datasets: [
        {
          label: "Reservas",
          data: [18, 22, 30, 26, 35, 40],
          backgroundColor: [
            "rgba(54, 162, 235, 0.7)",
            "rgba(75, 192, 192, 0.7)",
            "rgba(255, 206, 86, 0.7)",
            "rgba(255, 99, 132, 0.7)",
            "rgba(153, 102, 255, 0.7)",
            "rgba(255, 159, 64, 0.7)"
          ],
          borderColor: [
            "rgba(54, 162, 235, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(255, 99, 132, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)"
          ],
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true
            }
          }
        ]
      }
    }
  });
}