// Configuración para la API de Telegram
const TELEGRAM_TOKEN = '8896248921:AAHFxQY_oMQNu5C8SfWEe9OaTxWyu46WyhkI'; 
const TELEGRAM_CHAT_ID = '6224480790';         

let carrito = [];

// Función para enviar notificaciones (dentro de un try/catch para que no rompa el carrito si falla)
function enviarNotificacionTelegram(mensaje) {
    if (!TELEGRAM_TOKEN || TELEGRAM_TOKEN.includes('6224480790')) {
        console.log('Token de Telegram no configurado aún.');
        return;
    }
    
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: mensaje,
            parse_mode: 'Markdown'
        })
    })
    .then(res => res.json())
    .catch(err => console.error('Error al conectar con Telegram API:', err));
}

// Lógica principal
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('carrito-modal');
    const btnVerCarrito = document.querySelector('.btn-nav');
    const btnCerrarModal = document.querySelector('.close-modal');
    const contenedorItems = document.getElementById('carrito-items');
    const txtTotal = document.getElementById('total-precio');

    // 1. Abrir Carrito
    if (btnVerCarrito) {
        btnVerCarrito.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Limpiar contenedor e insertar items
            if (contenedorItems) {
                contenedorItems.innerHTML = '';
                if (carrito.length === 0) {
                    contenedorItems.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío.</p>';
                    if (txtTotal) txtTotal.innerText = '$0 MXN';
                } else {
                    let totalAcumulado = 0;
                    carrito.forEach((producto) => {
                        const itemDiv = document.createElement('div');
                        itemDiv.innerHTML = `
                            <div style="display: flex; justify-content: space-between; width: 100%; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                                <span>${producto.nombre}</span>
                                <strong>$${producto.precio.toLocaleString()} MXN</strong>
                            </div>
                        `;
                        contenedorItems.appendChild(itemDiv);
                        totalAcumulado += producto.precio;
                    });
                    if (txtTotal) txtTotal.innerText = `$${totalAcumulado.toLocaleString()} MXN`;
                }
            }
            if (modal) modal.style.display = 'block';
        });
    }

    // 2. Cerrar Carrito
    if (btnCerrarModal) {
        btnCerrarModal.addEventListener('click', () => { modal.style.display = 'none'; });
    }
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // 3. Botones Agregar
    const botones = document.querySelectorAll('.btn-add');
    botones.forEach(boton => {
        boton.addEventListener('click', (e) => {
            const card = e.target.closest('.producto-card');
            if (!card) return;

            const h3 = card.querySelector('h3');
            const pPrecio = card.querySelector('.precio');
            
            if (!h3 || !pPrecio) {
                alert("Error: Revisa que tus tarjetas tengan etiquetas <h3> y clase='precio'");
                return;
            }

            const nombre = h3.innerText;
            const precioTexto = pPrecio.innerText;
            const precioNumero = parseInt(precioTexto.replace(/[^0-9]/g, '')) || 0;

            // Agregar al arreglo local
            carrito.push({ nombre, precio: precioNumero });
            
            // Actualizar número en el menú
            if (btnVerCarrito) {
                btnVerCarrito.innerText = `Carrito (${carrito.length})`;
            }

            // Enviar alerta a Telegram
            enviarNotificacionTelegram(`🛒 *Nuevo producto añadido:*\n_${nombre}_\nPrecio: ${precioTexto}`);

            alert(`⚾ ${nombre} agregado al carrito.`);
        });
    });

    // 4. Botón de Pago Final
    const btnCheckout = document.querySelector('.btn-checkout');
    if (btnCheckout) {
        btnCheckout.addEventListener('click', () => {
            if (carrito.length === 0) {
                alert('El carrito está vacío, bro.');
                return;
            }

            let reporteProductos = '';
            let total = 0;
            carrito.forEach((prod, i) => {
                reporteProductos += `${i + 1}. ${prod.nombre} - $${prod.precio.toLocaleString()} MXN\n`;
                total += prod.precio;
            });

            enviarNotificacionTelegram(`🔥 *¡COMPRA PROCESADA!* 🔥\n\n${reporteProductos}\nTotal: $${total.toLocaleString()} MXN`);
            
            alert('¡Pedido procesado!');
            carrito = [];
            if (btnVerCarrito) btnVerCarrito.innerText = 'Carrito (0)';
            if (modal) modal.style.display = 'none';
        });
    }
});
