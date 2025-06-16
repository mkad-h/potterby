// Configuración inicial del formulario de contacto
document.addEventListener('DOMContentLoaded', function() {
    initializeContactForm();
});

// Función principal para inicializar el formulario
function initializeContactForm() {
    const form = document.getElementById('contactForm');
    const submitButton = form.querySelector('.btn-submit');
    const messageContainer = document.getElementById('form-message');
    
    // Event listener para el envío del formulario
    form.addEventListener('submit', handleFormSubmit);
    
    // Validación básica de campos
    setupFormValidation();
    
    // Cargar mensajes previos del sistema
    loadPreviousMessages();
    
    // Configurar funcionalidad de búsqueda
    initializeSearchFeature();
    
    // Configurar panel de administración
    setupAdminPanel();
}

// Manejo del envío del formulario
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('.btn-submit');
    const buttonText = submitButton.querySelector('.btn-text');
    const buttonLoader = submitButton.querySelector('.btn-loader');
    const messageContainer = document.getElementById('form-message');
    
    // Validar campos requeridos
    if (!validateRequiredFields(form)) {
        displayMessage('Por favor, completa todos los campos requeridos correctamente.', 'error');
        return;
    }
    
    // Mostrar estado de carga
    toggleLoadingState(submitButton, buttonText, buttonLoader, true);
    
    try {
        // Procesar datos del formulario
        const formData = processFormData(form);
        
        // Enviar al servidor
        const response = await submitToServer(formData);
        
        if (response.success) {
            // Confirmar envío exitoso
            displayMessage(`Gracias ${formData.nombre}! Tu consulta sobre "${formData.asunto}" ha sido recibida. Te contactaremos pronto.`, 'success');
            
            // Guardar en el sistema para seguimiento
            saveToDatabase(formData);
            
            // Actualizar lista de mensajes
            refreshMessagesList();
            
            // Limpiar formulario
            form.reset();
        } else {
            throw new Error(response.message || 'Error en el servidor');
        }
        
    } catch (error) {
        console.error('Error al procesar solicitud:', error);
        displayMessage('Hubo un problema al enviar tu mensaje. Por favor, inténtalo nuevamente.', 'error');
    } finally {
        toggleLoadingState(submitButton, buttonText, buttonLoader, false);
    }
}

// Procesar datos del formulario
function processFormData(form) {
    const formData = new FormData(form);
    const data = {};
    
    // Extraer todos los campos del formulario
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Agregar metadata del sistema
    data.timestamp = new Date().toISOString();
    data.id = generateUniqueId();
    data.status = 'pending';
    
    return data;
}

// Guardar mensaje en el sistema
function saveToDatabase(data) {
    let messages = getStoredMessages();
    
    // Agregar nuevo mensaje
    messages.push({
        id: data.id,
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono || '',
        asunto: data.asunto,
        mensaje: data.mensaje,
        timestamp: data.timestamp,
        status: data.status
    });
    
    // Mantener solo los últimos 50 mensajes
    if (messages.length > 50) {
        messages = messages.slice(-50);
    }
    
    // Guardar en el almacenamiento local
    localStorage.setItem('contact_messages', JSON.stringify(messages));
}

// Obtener mensajes almacenados
function getStoredMessages() {
    try {
        const stored = localStorage.getItem('contact_messages');
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.warn('Error al cargar mensajes:', error);
        return [];
    }
}

// Cargar mensajes previos en la interfaz
function loadPreviousMessages() {
    const adminSection = createAdminSection();
    document.querySelector('.contact-form').appendChild(adminSection);
}

// Crear sección administrativa
function createAdminSection() {
    const section = document.createElement('div');
    section.className = 'admin-section';
    section.style.cssText = `
        margin-top: 40px;
        padding: 25px;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-radius: 15px;
        border: 1px solid #dee2e6;
    `;
    
    const title = document.createElement('h3');
    title.textContent = 'Panel de Mensajes Recibidos';
    title.style.cssText = `
        color: #2B5CB0;
        margin-bottom: 20px;
        font-size: 1.4rem;
        font-weight: 600;
    `;
    
    section.appendChild(title);
    
    // Contenedor de la lista de mensajes
    const messagesList = document.createElement('div');
    messagesList.id = 'messages-list';
    section.appendChild(messagesList);
    
    return section;
}

// Actualizar lista de mensajes
function refreshMessagesList() {
    const container = document.getElementById('messages-list');
    if (!container) return;
    
    const messages = getStoredMessages();
    
    if (messages.length === 0) {
        container.innerHTML = '<p style="color: #6c757d; font-style: italic;">No hay mensajes registrados en el sistema.</p>';
        return;
    }
    
    let html = `<div style="margin-bottom: 15px; color: #495057;">
        <strong>Total de mensajes:</strong> ${messages.length}
    </div>`;
    
    // Mostrar los últimos 10 mensajes
    const recentMessages = messages.slice(-10).reverse();
    
    recentMessages.forEach(message => {
        html += `
            <div style="
                background: white;
                padding: 20px;
                margin-bottom: 15px;
                border-radius: 10px;
                border-left: 4px solid #2B5CB0;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            ">
                <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 10px;">
                    <strong style="color: #2B5CB0; font-size: 1.1rem;">${message.nombre}</strong>
                    <span style="color: #6c757d; font-size: 0.9rem;">${formatTimestamp(message.timestamp)}</span>
                </div>
                <div style="margin-bottom: 8px;">
                    <strong>Email:</strong> ${message.email}
                    ${message.telefono ? `<br><strong>Teléfono:</strong> ${message.telefono}` : ''}
                </div>
                <div style="margin-bottom: 8px;">
                    <strong>Asunto:</strong> ${message.asunto}
                </div>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 10px;">
                    <strong>Mensaje:</strong><br>
                    ${message.mensaje}
                </div>
                <div style="margin-top: 10px; text-align: right;">
                    <span style="background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">
                        ${message.status}
                    </span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Configurar funcionalidad de búsqueda
function initializeSearchFeature() {
    setTimeout(() => {
        const adminSection = document.querySelector('.admin-section');
        if (!adminSection) return;
        
        const searchContainer = document.createElement('div');
        searchContainer.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            border: 1px solid #dee2e6;
        `;
        
        searchContainer.innerHTML = `
            <h4 style="color: #2B5CB0; margin-bottom: 15px; font-size: 1.2rem;">
                Buscar en Mensajes
            </h4>
            <div style="display: flex; gap: 10px; align-items: center;">
                <input type="text" 
                       id="search-messages" 
                       placeholder="Buscar por nombre, email, asunto o contenido..."
                       style="flex: 1; padding: 12px; border: 2px solid #dee2e6; border-radius: 8px; font-size: 1rem;">
                <button onclick="performSearch()" 
                        style="padding: 12px 20px; background: #2B5CB0; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
                    Buscar
                </button>
            </div>
            <div id="search-results" style="margin-top: 20px;"></div>
        `;
        
        // Insertar antes de la lista de mensajes
        adminSection.insertBefore(searchContainer, document.getElementById('messages-list'));
    }, 500);
}

// Realizar búsqueda en mensajes
function performSearch() {
    const searchInput = document.getElementById('search-messages');
    const resultsContainer = document.getElementById('search-results');
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        resultsContainer.innerHTML = '<div style="color: #dc3545; padding: 10px; background: #f8d7da; border-radius: 5px;">Por favor, ingresa un término de búsqueda.</div>';
        return;
    }
    
    const messages = getStoredMessages();
    const filteredMessages = messages.filter(message => {
        const searchableText = `${message.nombre} ${message.email} ${message.asunto} ${message.mensaje}`.toLowerCase();
        return searchableText.includes(searchTerm.toLowerCase());
    });
    
    let resultsHTML = `
        <div style="background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <strong>Resultados de búsqueda para:</strong> "${searchTerm}"
            <br>Se encontraron ${filteredMessages.length} mensaje(s) que coinciden con tu búsqueda.
        </div>
    `;
    
    if (filteredMessages.length === 0) {
        resultsHTML += `
            <div style="background: #fff3cd; color: #856404; padding: 15px; border-radius: 8px;">
                No se encontraron mensajes que contengan el término "${searchTerm}".
                <br>Intenta con otras palabras clave.
            </div>
        `;
    } else {
        filteredMessages.reverse().forEach(message => {
            resultsHTML += `
                <div style="
                    background: white;
                    padding: 15px;
                    margin-bottom: 10px;
                    border-radius: 8px;
                    border: 1px solid #dee2e6;
                    border-left: 4px solid #28a745;
                ">
                    <div style="font-weight: bold; color: #2B5CB0; margin-bottom: 5px;">
                        ${message.nombre} - ${message.asunto}
                    </div>
                    <div style="color: #6c757d; font-size: 0.9rem; margin-bottom: 10px;">
                        ${message.email} | ${formatTimestamp(message.timestamp)}
                    </div>
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">
                        ${message.mensaje}
                    </div>
                </div>
            `;
        });
    }
    
    resultsContainer.innerHTML = resultsHTML;
}

// Configurar panel de administración adicional
function setupAdminPanel() {
    setTimeout(() => {
        const form = document.querySelector('.contact-form');
        
        const adminTools = document.createElement('div');
        adminTools.style.cssText = `
            margin-top: 20px;
            padding: 15px;
            background: #e8f2ff;
            border-radius: 10px;
            text-align: center;
        `;
        
        adminTools.innerHTML = `
            <button onclick="clearAllData()" 
                    style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                Limpiar Todos los Mensajes
            </button>
            <button onclick="exportMessages()" 
                    style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Exportar Mensajes
            </button>
        `;
        
        form.appendChild(adminTools);
    }, 1000);
}

// Validación básica de campos requeridos
function validateRequiredFields(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#dc3545';
            isValid = false;
        } else {
            field.style.borderColor = '';
        }
    });
    
    return isValid;
}

// Configurar validación del formulario
function setupFormValidation() {
    const form = document.getElementById('contactForm');
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.style.borderColor = '#dc3545';
            } else {
                this.style.borderColor = '';
            }
        });
        
        input.addEventListener('input', function() {
            if (this.style.borderColor === 'rgb(220, 53, 69)') {
                this.style.borderColor = '';
            }
        });
    });
}

// Mostrar mensajes al usuario
function displayMessage(message, type) {
    const messageContainer = document.getElementById('form-message');
    
    messageContainer.innerHTML = message;
    messageContainer.className = `form-message ${type}`;
    messageContainer.style.display = 'block';
    
    messageContainer.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
    });
    
    if (type === 'success') {
        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 6000);
    }
}

// Simular envío al servidor
function submitToServer(data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: 'Mensaje procesado correctamente',
                data: data
            });
        }, 1500);
    });
}

// Manejar estado de carga del botón
function toggleLoadingState(button, textElement, loaderElement, isLoading) {
    if (isLoading) {
        button.disabled = true;
        textElement.style.display = 'none';
        loaderElement.style.display = 'block';
    } else {
        button.disabled = false;
        textElement.style.display = 'block';
        loaderElement.style.display = 'none';
    }
}

// Generar ID único para mensajes
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Formatear timestamp para mostrar
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Limpiar todos los datos del sistema
function clearAllData() {
    if (confirm('¿Estás seguro de que quieres eliminar todos los mensajes? Esta acción no se puede deshacer.')) {
        localStorage.removeItem('contact_messages');
        refreshMessagesList();
        document.getElementById('search-results').innerHTML = '';
        document.getElementById('search-messages').value = '';
        displayMessage('Todos los mensajes han sido eliminados del sistema.', 'success');
    }
}

// Exportar mensajes a JSON
function exportMessages() {
    const messages = getStoredMessages();
    if (messages.length === 0) {
        displayMessage('No hay mensajes para exportar.', 'error');
        return;
    }
    
    const dataStr = JSON.stringify(messages, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `mensajes_contacto_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    displayMessage('Mensajes exportados correctamente.', 'success');
}

// Inicializar cuando el documento esté listo
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        refreshMessagesList();
    }, 800);
});