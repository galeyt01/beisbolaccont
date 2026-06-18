// Configuración obligatoria para la API de Telegram (Rúbrica Nivel Experto)
const TELEGRAM_TOKEN = '8896248921:AAHFxQY_oMQNu5C8SfWEe9OaTxWyu46Wyhk'; // Pega aquí el Token largo que te dio BotFather
const TELEGRAM_CHAT_ID = '6224480790';         // Pega aquí el número de tu Chat ID

let carrito = [];

// Elementos del DOM
const modal = document.getElementById('carrito-modal');
const btnVerCarrito = document.querySelector('.btn-nav');
const btnCerrarModal = document.querySelector('.close-modal');
const contenedorItems = document.getElementById('carrito-items');
const txtTotal = document.getElementById('total-precio');

// FUNCIÓN CLAVE: Envío automático de notificaciones vía API de Telegram
function enviarNotificacionTelegram(mensaje) {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    
    const data = {
        chat_id: TELEGRAM_CHAT_ID,
        text: mensaje,
        parse_mode: 'Markdown'
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        console.log('Notificación enviada a Telegram:', result);
    })
    .catch(error => {
        console.error('Error en la API de Telegram:', error);
    });
}

// Abrir y Cerrar Ventana del Carrito al dar clic en el menú
if (btnVerCarrito) {
    btnVerCarrito.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarCarrito();
        modal.style.display = 'block';
    });
}

if (btnCerrarModal) {
    btnCerrarModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Registrar eventos de los 30 botones "Agregar al Carrito"
document.addEventListener('DOMContentLoaded', () => {
    const botones = document.querySelectorAll('.btn-add');
    
    botones.forEach(boton => {
        boton.addEventListener('click', (e) => {
            const card = e.target.closest('.producto-card');
            const nombre = card.querySelector('h3').innerText;
            const precioTexto = card.querySelector('.precio').innerText;
            
            // Convertir "$5,899 MXN" a número puro (5899)
            const precioNumero = parseInt(precioTexto.replace(/[^0-9]/g, ''));

            // Guardar en el arreglo
            carrito.push({ nombre, precio: precioNumero });
            
            // Actualizar el número del Header
            actualizarHeader();
            
            // Lógica interactiva: Mandar alerta al Telegram del Admin
            const alertaMensaje = `🛒 *Nueva actividad en la tienda:*\nUn usuario agregó: _${nombre}_ a su carrito.\nPrecio: ${precioTexto}`;
            enviarNotificacionTelegram(alertaMensaje);

            alert(`⚾ ${nombre} agregado al carrito.`);
        });
    });

    // Configurar el botón "Proceder al Pago" dentro del modal
    const btnCheckout = document.querySelector('.btn-checkout');
    if (btnCheckout) {
        btnCheckout.removeAttribute('onclick'); // Quitamos el alert viejo
        btnCheckout.addEventListener('click', () => {
            if (carrito.length === 0) {
                alert('El carrito está vacío, bro.');
                return;
            }

            let reporteProductos = '';
            let totalAcumulado = 0;
            
            carrito.forEach((prod, index) => {
                reporteProductos += `${index + 1}. ${prod.nombre} - $${prod.precio.toLocaleString()} MXN\n`;
                totalAcumulado += prod.precio;
            });

            const mensajeCompra = `🔥 *¡NUEVA INTENCIÓN DE COMPRA!* 🔥\n\n*Productos seleccionados:*\n${reporteProductos}\n*Total General:* $${totalAcumulado.toLocaleString()} MXN\n\n⚡ _Notificación generada automáticamente desde el código._`;
            
            // Envía el reporte final por API
            enviarNotificacionTelegram(mensajeCompra);
            
            alert('¡Pedido procesado! Se ha notificado al sistema.');
            carrito = [];
            actualizarHeader();
            modal.style.display = 'none';
        });
    }
});

function actualizarHeader() {
    if (btnVerCarrito) {
        btnVerCarrito.innerText = `Carrito (${carrito.length})`;
    }
}

// ESTA FUNCIÓN METE LOS PRODUCTOS EN EL ELEMENTO DE TU IMAGEN (#carrito-items)
function mostrarCarrito() {
    contenedorItems.innerHTML = '';
    
    if (carrito.length === 0) {
        contenedorItems.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío.</p>';
        txtTotal.innerText = '$0 MXN';
        return;
    }

    let totalAcumulado = 0;
    
    carrito.forEach((producto) => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item-carrito');
        itemDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; width: 100%; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <span>${producto.nombre}</span>
                <strong>$${producto.precio.toLocaleString()} MXN</strong>
            </div>
        `;
        contenedorItems.appendChild(itemDiv);
        totalAcumulado += producto.precio;
    });

    txtTotal.innerText = `$${totalAcumulado.toLocaleString()} MXN`;
}
