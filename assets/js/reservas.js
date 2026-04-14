/* reservas.js
   Este archivo hace 3 cosas:
   1) muestra las reservas del cliente que inició sesión
   2) rellena automáticamente nombre y correo en el formulario
   3) permite agregar una nueva reserva de forma simple
*/

document.addEventListener("DOMContentLoaded", function () {
  cargarReservasCliente();
  prepararFormularioReserva();
});

function cargarReservasCliente() {
  const contenedor = document.getElementById("reservasContainer");
  if (!contenedor) return;

  const sesionGuardada = localStorage.getItem("hotel_session");

  if (!sesionGuardada) {
    contenedor.innerHTML = "<p>Debes iniciar sesión para ver tus reservas.</p>";
    return;
  }

  const sesion = JSON.parse(sesionGuardada);

  if (sesion.role !== "cliente") {
    contenedor.innerHTML = "<p>Esta sección es solo para clientes.</p>";
    return;
  }

  fetch("../assets/data/reservas.json")
    .then(function (respuesta) {
      return respuesta.json();
    })
    .then(function () {
      const reservasLocales = JSON.parse(localStorage.getItem("reservas_locales")) || [];

      const reservasCliente = reservasLocales.filter(function (reserva) {
        return reserva.email.toLowerCase() === sesion.email.toLowerCase();
      });

      if (reservasCliente.length === 0) {
        contenedor.innerHTML = `
          <h3 style="color:#ffffff;text-align:center;background:rgba(0,0,0,0.45);padding:12px 20px;border-radius:8px;display:inline-block;width:100%;">Bienvenido(a), ${sesion.name}</h3>
          <p style="color:#ffffff;text-align:center;background:rgba(0,0,0,0.45);padding:10px 20px;border-radius:8px;margin-top:8px;">No tienes reservas registradas todavía.</p>
        `;
        return;
      }

      contenedor.innerHTML = `<h3 style="color:#ffffff;text-align:center;background:rgba(0,0,0,0.45);padding:12px 20px;border-radius:8px;">Bienvenido(a), ${sesion.name}</h3>`;

      reservasCliente.forEach(function (reserva) {
        contenedor.innerHTML += `
          <div class="card">
            <h3>Reserva #${reserva.id}</h3>
            <p><strong>Cliente:</strong> ${reserva.cliente}</p>
            <p><strong>Habitación:</strong> ${reserva.habitacion}</p>
            <p><strong>Check-in:</strong> ${reserva.checkIn}</p>
            <p><strong>Check-out:</strong> ${reserva.checkOut}</p>
            <p><strong>Estado:</strong> ${reserva.estado}</p>
          </div>
        `;
      });
    })
    .catch(function (error) {
      console.log("Error al cargar reservas:", error);
      contenedor.innerHTML = "<p>No se pudieron cargar las reservas.</p>";
    });
}

function prepararFormularioReserva() {
  const formulario = document.getElementById("miFormulario");
  if (!formulario) return;

  const sesionGuardada = localStorage.getItem("hotel_session");
  if (!sesionGuardada) return;

  const sesion = JSON.parse(sesionGuardada);

  if (sesion.role !== "cliente") return;

  const campoNombre = document.getElementById("name");
  const campoEmail = document.getElementById("email");
  const fechaEntradaInput = document.getElementById("arrival-date");
  const fechaSalidaInput = document.getElementById("departure-date");
  const nochesInput = document.getElementById("nights");
  const roomTypeSelect = document.getElementById("room-type");

  if (campoNombre) {
    campoNombre.value = sesion.name;
  }

  if (campoEmail) {
    campoEmail.value = sesion.email;
  }

  // Pre-seleccionar habitación si viene desde la página de habitaciones
  if (roomTypeSelect) {
    const params = new URLSearchParams(window.location.search);
    const habitacionParam = params.get("habitacion");
    if (habitacionParam) {
      const opcion = Array.from(roomTypeSelect.options).find(
        function (o) { return o.value.toLowerCase() === habitacionParam.toLowerCase(); }
      );
      if (opcion) {
        roomTypeSelect.value = opcion.value;
      }
    }
  }

  // Obtener fecha actual en formato YYYY-MM-DD
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  const fechaMinima = `${anio}-${mes}-${dia}`;

  // Bloquear fechas anteriores a hoy
  fechaEntradaInput.min = fechaMinima;
  fechaSalidaInput.min = fechaMinima;

  function calcularNoches() {
    const entrada = fechaEntradaInput.value;
    const salida = fechaSalidaInput.value;

    if (!entrada || !salida) {
      nochesInput.value = "";
      return;
    }

    const fechaEntrada = new Date(entrada);
    const fechaSalida = new Date(salida);

    const diferencia = fechaSalida - fechaEntrada;
    const noches = diferencia / (1000 * 60 * 60 * 24);

    if (noches > 0) {
      nochesInput.value = noches;
    } else {
      nochesInput.value = "";
    }
  }

  fechaEntradaInput.addEventListener("change", function () {
    // La salida no puede ser anterior a la entrada
    fechaSalidaInput.min = fechaEntradaInput.value || fechaMinima;

    // Si ya había una fecha de salida menor, la limpiamos
    if (fechaSalidaInput.value && fechaSalidaInput.value <= fechaEntradaInput.value) {
      fechaSalidaInput.value = "";
    }

    calcularNoches();
  });

  fechaSalidaInput.addEventListener("change", calcularNoches);

  formulario.addEventListener("submit", function (e) {
    e.preventDefault();
    guardarNuevaReserva(sesion);
  });
}

function guardarNuevaReserva(sesion) {
  const nombre = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const llegada = document.getElementById("arrival-date").value;
  const salida = document.getElementById("departure-date").value;
  const noches = document.getElementById("nights").value;
  const habitaciones = document.getElementById("rooms").value;
  const tipoHabitacion = document.getElementById("room-type").value;

  if (!nombre || !email || !llegada || !salida || !noches || !habitaciones || !tipoHabitacion) {
    alert("Por favor completa todos los campos.");
    return;
  }

  const fechaLlegada = new Date(llegada);
  const fechaSalida = new Date(salida);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (fechaLlegada < hoy) {
    alert("La fecha de llegada no puede ser anterior a hoy.");
    return;
  }

  if (fechaSalida < hoy) {
    alert("La fecha de salida no puede ser anterior a hoy.");
    return;
  }

  if (fechaSalida <= fechaLlegada) {
    alert("La fecha de salida debe ser posterior a la fecha de llegada.");
    return;
  }

  if (noches <= 0) {
    alert("Las fechas no son válidas.");
    return;
  }

  let reservasLocales = JSON.parse(localStorage.getItem("reservas_locales")) || [];

  const nuevaReserva = {
    id: Date.now(),
    cliente: nombre,
    email: email,
    habitacion: tipoHabitacion,
    checkIn: llegada,
    checkOut: salida,
    estado: "Pendiente",
    nights: noches,
    rooms: habitaciones
  };

  reservasLocales.push(nuevaReserva);
  localStorage.setItem("reservas_locales", JSON.stringify(reservasLocales));

  alert("Reserva guardada correctamente.");

  document.getElementById("arrival-date").value = "";
  document.getElementById("departure-date").value = "";
  document.getElementById("nights").value = "";
  document.getElementById("rooms").value = "";
  document.getElementById("room-type").selectedIndex = 0;

  // Restaurar límite mínimo de salida
  const fechaEntradaInput = document.getElementById("arrival-date");
  const fechaSalidaInput = document.getElementById("departure-date");
  fechaSalidaInput.min = fechaEntradaInput.min;
  cargarReservasCliente();
}