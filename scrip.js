// Configuración obligatoria para la API de Telegram (Rúbrica Nivel Experto)
const TELEGRAM_TOKEN = '8896248921:AAHFxQY_oMQNu5C8SfWEe9OaTxWyu46Wyhk'; // Pega aquí el Token largo que te dio BotFather
const TELEGRAM_CHAT_ID = '6224480790';         // Pega aquí el número que te dio el bot de Chat ID

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

    // Petición asíncrona a la API
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        console.log('Notificación enviada con éxito a Telegram:', result);
    })
    .catch(error => {
        console.error('Error al enviar notificación a la API de Telegram:', error);
    });
}

// Abrir/Cerrar Ventana del Carrito
btnVerCarrito.addEventListener('click', (e) => {
    e.preventDefault();
    mostrarCarrito();
    modal.style.display = 'block';
});

btnCerrarModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Registrar eventos al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const botones = document.querySelectorAll('.btn-add');
    botones.forEach(boton => {
        boton.addEventListener('click', (e) => {
            const card = e.target.closest('.producto-card');
            const nombre = card.querySelector('h3').innerText;
            const precioTexto = card.querySelector('.precio').innerText;
            
            const precioNumero = parseInt(precioTexto.replace(/[^0-9]/g, ''));

            carrito.push({ nombre, precio: precioNumero });
            actualizarHeader();
            
            // Notificación automática al agregar producto
            const alertaMensaje = `🛒 *Nueva actividad en la tienda:*\nUn usuario agregó: _${nombre}_ a su carrito.\nPrecio: ${precioTexto}`;
            enviarNotificacionTelegram(alertaMensaje);

            alert(`⚾ ${nombre} agregado.`);
        });
    });

    // Configurar el botón de proceder al pago para que envíe el reporte de compra completo
    const btnCheckout = document.querySelector('.btn-checkout');
    if (btnCheckout) {
        btnCheckout.removeAttribute('onclick'); // Limpiamos el alert básico antiguo
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

            const mensajeCompra = `🔥 *¡NUEVA INTENCIÓN DE COMPRA!* 🔥\n\n*Productos seleccionados:*\n${reporteProductos}\n*Total General:* $${totalAcumulado.toLocaleString()} MXN\n\n⚡ _Notificación generada automáticamente desde el código del catálogo._`;
            
            // Envía todo el desglose a tu Telegram
            enviarNotificacionTelegram(mensajeCompra);
            
            alert('¡Pedido procesado! Se ha enviado la notificación de uso al sistema.');
            carrito = [];
            actualizarHeader();
            modal.style.display = 'none';
        });
    }
});

function actualizarHeader() {
    btnVerCarrito.innerText = `Carrito (${carrito.length})`;
}

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
            <span>${producto.nombre}</span>
            <strong>$${producto.precio.toLocaleString()} MXN</strong>
        `;
        contenedorItems.appendChild(itemDiv);
        totalAcumulado += producto.precio;
    });

    txtTotal.innerText = `$${totalAcumulado.toLocaleString()} MXN`;
}
