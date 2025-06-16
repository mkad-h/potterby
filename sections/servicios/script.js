// Datos de los doctores
const doctores = [
    {
        nombre: "Dra. Antonia Isidora Velázquez Díaz",
        especialidad: "Cardiología",
        universidad: "Universidad de Chile",
        experiencia: "18 años de experiencia",
        icono: "❤️"
    },
    {
        nombre: "Dr. Alejandro Javier Larraín Cousiño",
        especialidad: "Medicina General",
        universidad: "Universidad Católica",
        experiencia: "15 años de experiencia",
        icono: "🩺"
    },
    {
        nombre: "Dr. Enríquez Emilio Silva Bulnes Matte",
        especialidad: "Traumatología",
        universidad: "Universidad de Concepción",
        experiencia: "20 años de experiencia",
        icono: "🦴"
    },
    {
        nombre: "Dr. Ricardo Miguel Morales Concha",
        especialidad: "Dermatología",
        universidad: "Universidad de Valparaíso",
        experiencia: "12 años de experiencia",
        icono: "🔬"
    }
];

// Función para generar las cards de servicios
function generarCardsServicios() {
    const serviciosGrid = document.getElementById('servicios');
    
    doctores.forEach((doctor, index) => {
        const card = document.createElement('article');
        card.className = 'service-card';
        card.style.animationDelay = `${(index + 1) * 0.1}s`;
        
        card.innerHTML = `
            <div class="service-icon">${doctor.icono}</div>
            <div class="doctor-info">
                <h3 class="doctor-name">${doctor.nombre}</h3>
                <p class="specialty">${doctor.especialidad}</p>
                <p class="education">${doctor.universidad}<br>${doctor.experiencia}</p>
                <button class="contact-btn" onclick="abrirModal('${doctor.especialidad}', '${doctor.nombre}')">
                    Agendar Cita
                </button>
            </div>
        `;
        
        serviciosGrid.appendChild(card);
    });
}

// Variables del modal
let modal = null;
let span = null;
let doctorSeleccionado = '';

// Función para abrir el modal
function abrirModal(especialidad, nombreDoctor) {
    modal = document.getElementById('contactModal');
    const selectEspecialidad = document.getElementById('especialidad');
    doctorSeleccionado = nombreDoctor;
    
    // Limpiar y poblar el select de especialidades
    selectEspecialidad.innerHTML = '<option value="">Seleccione una especialidad</option>';
    
    doctores.forEach(doc => {
        const option = document.createElement('option');
        option.value = doc.especialidad;
        option.textContent = `${doc.especialidad} - ${doc.nombre}`;
        if (doc.especialidad === especialidad) {
            option.selected = true;
        }
        selectEspecialidad.appendChild(option);
    });
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevenir scroll del body
}

// Función para cerrar el modal
function cerrarModal() {
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restaurar scroll
        
        // Limpiar el formulario
        document.getElementById('contactForm').reset();
    }
}

// Event listeners cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Generar las cards de servicios
    generarCardsServicios();
    
    // Configurar el modal
    modal = document.getElementById('contactModal');
    span = document.getElementsByClassName('close')[0];
    
    // Cerrar modal al hacer clic en la X
    span.onclick = function() {
        cerrarModal();
    }
    
    // Cerrar modal al hacer clic fuera de él
    window.onclick = function(event) {
        if (event.target == modal) {
            cerrarModal();
        }
    }
    
    // Manejar el envío del formulario
    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obtener los datos del formulario
        const formData = {
            nombre: document.getElementById('nombre').value,
            email: document.getElementById('email').value,
            telefono: document.getElementById('telefono').value,
            especialidad: document.getElementById('especialidad').value,
            mensaje: document.getElementById('mensaje').value
        };
        
        // Simular envío (aquí iría la lógica real de envío)
        console.log('Datos del formulario:', formData);
        
        // Mostrar mensaje de éxito
        mostrarMensajeExito();
        
        // Cerrar modal después de 2 segundos
        setTimeout(() => {
            cerrarModal();
        }, 2000);
    });
    
    // Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Animación al hacer scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observar elementos para animación al scroll
    document.querySelectorAll('.service-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// Función para mostrar mensaje de éxito
function mostrarMensajeExito() {
    const modalContent = document.querySelector('.modal-content');
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = '¡Solicitud enviada con éxito! Nos contactaremos pronto.';
    
    modalContent.insertBefore(successDiv, modalContent.firstChild);
    
    // Remover el mensaje después de 2 segundos
    setTimeout(() => {
        successDiv.remove();
    }, 2000);
}

// Función para validar el formulario en tiempo real
function configurarValidacionFormulario() {
    const inputs = document.querySelectorAll('#contactForm input, #contactForm textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validarCampo(this);
        });
    });
}

// Función para validar un campo individual
function validarCampo(campo) {
    const valor = campo.value.trim();
    let esValido = true;
    
    // Remover mensaje de error previo si existe
    const errorPrevio = campo.parentElement.querySelector('.error-message');
    if (errorPrevio) {
        errorPrevio.remove();
    }
    
    // Validaciones específicas por tipo de campo
    switch(campo.type) {
        case 'email':
            const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regexEmail.test(valor)) {
                mostrarError(campo, 'Por favor ingrese un email válido');
                esValido = false;
            }
            break;
            
        case 'tel':
            const regexTel = /^[0-9+\-\s()]+$/;
            if (!regexTel.test(valor) || valor.length < 8) {
                mostrarError(campo, 'Por favor ingrese un teléfono válido');
                esValido = false;
            }
            break;
            
        case 'text':
            if (campo.id === 'nombre' && valor.length < 3) {
                mostrarError(campo, 'El nombre debe tener al menos 3 caracteres');
                esValido = false;
            }
            break;
    }
    
    // Aplicar estilos visuales
    if (esValido && valor !== '') {
        campo.style.borderColor = '#4CAF50';
    } else if (!esValido) {
        campo.style.borderColor = '#e74c3c';
    }
    
    return esValido;
}

// Función para mostrar mensaje de error
function mostrarError(campo, mensaje) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#e74c3c';
    errorDiv.style.fontSize = '0.85em';
    errorDiv.style.marginTop = '5px';
    errorDiv.textContent = mensaje;
    
    campo.parentElement.appendChild(errorDiv);
}

// Inicializar validación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', configurarValidacionFormulario);