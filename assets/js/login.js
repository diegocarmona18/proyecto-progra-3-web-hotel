/* login.js
   Este archivo valida un login simple con usuarios simulados.
   Según el tipo de usuario, lo envía a una página diferente.
*/

document.addEventListener("DOMContentLoaded", function () {
  const formulario = document.getElementById("loginForm");

  if (!formulario) return;

  // Si ya hay sesión iniciada, redirigimos según el rol
  const sesionGuardada = localStorage.getItem("hotel_session");

  if (sesionGuardada) {
    const sesion = JSON.parse(sesionGuardada);

    if (sesion.role === "admin" || sesion.role === "staff") {
      window.location.href = "./dashboard/dashboard.html";
    } else if (sesion.role === "cliente") {
      window.location.href = "./pages/mi-reserva.html";
    }

    return;
  }

  formulario.addEventListener("submit", function (e) {
    e.preventDefault();
    validarLogin();
  });
});

/* Usuarios simulados */
const usuarios = [
  {
    email: "admin@hotel.com",
    password: "Admin123",
    role: "admin",
    name: "Administrador"
  },
  {
    email: "recepcion@hotel.com",
    password: "Recep123",
    role: "staff",
    name: "Recepción"
  },
  {
    email: "cliente1@gmail.com",
    password: "Cliente123",
    role: "cliente",
    name: "María López"
  },
  {
    email: "cliente2@gmail.com",
    password: "Cliente456",
    role: "cliente",
    name: "Carlos Pérez"
  }
];

/* Función que valida si el correo y la contraseña existen */
function validarLogin() {
  const inputEmail = document.getElementById("email");
  const inputPassword = document.getElementById("password");
  const cajaError = document.getElementById("loginError");

  const email = inputEmail.value.trim().toLowerCase();
  const password = inputPassword.value.trim();

  cajaError.textContent = "";

  // Validaciones básicas
  if (email === "" || password === "") {
    cajaError.textContent = "Debes completar todos los campos.";
    return;
  }

  // Buscar usuario dentro del arreglo
  const usuarioEncontrado = usuarios.find(function (usuario) {
    return usuario.email === email && usuario.password === password;
  });

  // Si no existe
  if (!usuarioEncontrado) {
    cajaError.textContent = "Correo o contraseña incorrectos.";
    return;
  }

  // Crear la sesión
  const sesion = {
    email: usuarioEncontrado.email,
    name: usuarioEncontrado.name,
    role: usuarioEncontrado.role,
    loginAt: new Date().toISOString()
  };

  // Guardar la sesión
  localStorage.setItem("hotel_session", JSON.stringify(sesion));

  // Redirigir según el rol
  if (usuarioEncontrado.role === "admin" || usuarioEncontrado.role === "staff") {
    window.location.href = "./dashboard/dashboard.html";
  } else if (usuarioEncontrado.role === "cliente") {
    window.location.href = "./pages/mi-reserva.html";
  }
}