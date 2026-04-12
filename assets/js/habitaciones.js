// Carga y renderiza habitaciones en la vista de habitaciones.
document.addEventListener('DOMContentLoaded', function () {
    cargarHabitacionesSiExisteVista();
});

function cargarHabitacionesSiExisteVista() {
    var contenedor = document.getElementById('habitacionesContainer');
    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = '<p>Cargando habitaciones...</p>';

    fetch(obtenerRutaHabitaciones())
        .then(function (response) {
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo de habitaciones.');
            }
            return response.json();
        })
        .then(function (habitaciones) {
            renderizarHabitaciones(contenedor, habitaciones);
            habilitarEventosCarrusel(contenedor);
        })
        .catch(function (error) {
            console.error(error);
            contenedor.innerHTML = '<p>No fue posible cargar las habitaciones en este momento.</p>';
        });
}

function obtenerRutaHabitaciones() {
    var ruta = window.location.pathname;
    return ruta.indexOf('/pages/') !== -1 || ruta.indexOf('/dashboard/') !== -1
        ? '../assets/data/habitaciones.json'
        : 'assets/data/habitaciones.json';
}

function renderizarHabitaciones(contenedor, habitaciones) {
    if (!Array.isArray(habitaciones) || habitaciones.length === 0) {
        contenedor.innerHTML = '<p>No hay habitaciones disponibles por ahora.</p>';
        return;
    }

    var tarjetas = habitaciones.map(function (habitacion) {
        var estado = habitacion.disponible ? 'Disponible' : 'No disponible';
        var estadoClase = habitacion.disponible ? 'disponible' : 'no-disponible';
        var imagenes = Array.isArray(habitacion.imagenes) && habitacion.imagenes.length > 0
            ? habitacion.imagenes
            : ['../assets/img/fondo1.png'];

        var slides = imagenes.map(function (imagen, index) {
            return '<img class="carousel-slide" src="' + imagen + '" alt="' + habitacion.nombre + ' imagen ' + (index + 1) + '">';
        }).join('');

        var indicadores = imagenes.map(function (_, index) {
            var activo = index === 0 ? ' activo' : '';
            return '<span class="carousel-dot' + activo + '" data-index="' + index + '"></span>';
        }).join('');

        return (
            '<article class="habitacion-card">' +
                '<div class="habitacion-carousel" data-total="' + imagenes.length + '">' +
                    '<div class="carousel-track" data-index="0">' + slides + '</div>' +
                    '<button class="carousel-btn prev" type="button" aria-label="Imagen anterior">&#10094;</button>' +
                    '<button class="carousel-btn next" type="button" aria-label="Imagen siguiente">&#10095;</button>' +
                    '<div class="carousel-dots">' + indicadores + '</div>' +
                '</div>' +
                '<h3>' + habitacion.nombre + '</h3>' +
                '<p>' + habitacion.descripcion + '</p>' +
                '<p><strong>Capacidad:</strong> ' + habitacion.capacidad + ' persona(s)</p>' +
                '<p><strong>Precio:</strong> $' + habitacion.precio + ' por noche</p>' +
                '<p class="estado ' + estadoClase + '"><strong>Estado:</strong> ' + estado + '</p>' +
            '</article>'
        );
    });

    contenedor.classList.add('habitaciones-grid');
    contenedor.innerHTML = tarjetas.join('');
}

function habilitarEventosCarrusel(contenedor) {
    if (contenedor.dataset.carouselActivo === 'true') {
        return;
    }

    contenedor.addEventListener('click', function (event) {
        var boton = event.target.closest('.carousel-btn');
        if (boton) {
            moverCarrusel(boton, boton.classList.contains('next') ? 1 : -1);
            return;
        }

        var dot = event.target.closest('.carousel-dot');
        if (dot) {
            irAIndiceCarrusel(dot);
        }
    });

    contenedor.dataset.carouselActivo = 'true';
}

function moverCarrusel(boton, direccion) {
    var carrusel = boton.closest('.habitacion-carousel');
    if (!carrusel) {
        return;
    }

    var track = carrusel.querySelector('.carousel-track');
    var total = Number(carrusel.dataset.total || 1);
    var actual = Number(track.dataset.index || 0);
    var siguiente = (actual + direccion + total) % total;
    actualizarCarrusel(carrusel, siguiente);
}

function irAIndiceCarrusel(dot) {
    var carrusel = dot.closest('.habitacion-carousel');
    if (!carrusel) {
        return;
    }

    var nuevoIndice = Number(dot.dataset.index || 0);
    actualizarCarrusel(carrusel, nuevoIndice);
}

function actualizarCarrusel(carrusel, indice) {
    var track = carrusel.querySelector('.carousel-track');
    if (!track) {
        return;
    }

    track.style.transform = 'translateX(-' + (indice * 100) + '%)';
    track.dataset.index = String(indice);

    var dots = carrusel.querySelectorAll('.carousel-dot');
    dots.forEach(function (dot, i) {
        dot.classList.toggle('activo', i === indice);
    });
}
