//iniciar pagina
const btnSubirImagen = document.querySelector('.file-upload-browse');
const inpImagen = document.querySelector('.file-upload-default');
const inpDetallesImagen = document.querySelector('.file-upload-info');
const btnConfirmar = document.querySelector('#btnConfirmar');
const cambiarEstadoConectado = document.querySelector('#cambiarEstadoConectado');
const formularioUpdateDatos = document.querySelector('#formUpdateDatos');

const modalAbrirNuevoChat = new bootstrap.Modal(document.getElementById("modalAbrirNuevoChat"));

document.addEventListener("DOMContentLoaded", function () {

    sessionStorage.setItem('pagina', 'inicio');
    sessionStorage.removeItem('chatActivo');

    conectarWSIo();

    // Obtener el ID del receptor desde la URL
    obtenerIdDesdeURL()
    mostrarListaMensajes();

    if (btnSubirImagen && inpImagen && btnConfirmar && inpDetallesImagen && cambiarEstadoConectado && formularioUpdateDatos) {

        btnSubirImagen.addEventListener('click', function () {
            inpImagen.click();
        });
        // Mostrar el nombre del archivo seleccionado en el campo de texto deshabilitado
        inpImagen.addEventListener('change', function () {
            if (inpImagen.files.length > 0) {
                // Abrir modal de confirmar registro de imagen 
                inpDetallesImagen.value = inpImagen.files[0].name;
                confirmarModal.show();
            }
        });

        btnConfirmar.addEventListener('click', function () { 
            const formData = new FormData();
            formData.append('perfil', inpImagen.files[0]);  // Asegúrate de enviar el archivo correctamente
            console.log(formData);
        
            enviarImagenes(`/usuarios/registrarPerfil`, 'POST', formData) // 'true' indica que no se envía como JSON
                .then(respuesta => {
                    if (respuesta.estado) {                
                        confirmarModal.hide();
                        obtenerDatosUsuario();
                        inpDetallesImagen.value = '';
                    }
                    mandarNotificacion(respuesta.message, respuesta.icono);
                })
                .catch(error => {
                    console.error(error);
                });
        });

        cambiarEstadoConectado.addEventListener('change', function () {
            const estado = cambiarEstadoConectado.checked;
            updateConectado(estado);
        });
    
        formularioUpdateDatos.addEventListener('submit', (event) => {
            event.preventDefault();
    
            const apellidos = document.getElementById('updateApellidos').value;
            const nombres = document.getElementById('updateNombres').value;
            const updateClave = document.getElementById('updateClave').value;
            const updateClave2 = document.getElementById('updateClave2').value;
    
            if (updateClave){
                if (updateClave !== updateClave2) {
                    mandarNotificacion('Las contraseñas no coinciden', 'error')
                    return;
                }
            }
    
            const jsonCuerpo = {
                apellidos: apellidos.trim(),
                nombres: nombres.trim(),
                clave: updateClave.trim(),
            }
    
            enviarPeticiones('/usuarios/actualizarUsuario/', 'POST', jsonCuerpo)
                .then(respuesta => {
                    if (respuesta.estado) {
                        obtenerDatosUsuario();
                        formularioUpdateDatos.reset();
                        modalUpdateDatosUsuario.hide();
                    }
                    mandarNotificacion(respuesta.message, respuesta.icono)
                })
                .catch(error => {
                    console.error(error);
                });
        });
        
    }
})

function updateConectado(estado) {
    const jsonCuerpo = {
        estado: estado
    }

    enviarPeticiones(`/usuarios/cambiarEstadoConectado/`, 'POST', jsonCuerpo)
        .then(respuesta => {
            if (respuesta.estado) {
                obtenerDatosUsuario();
            }
            mandarNotificacion(respuesta.message, respuesta.icono)
        })
        .catch(error => {
            console.error(error);
        });
    
}


async function abrirNuevoChat() {
    contruirListaAmigosChat();
    modalAbrirNuevoChat.show();
}

async function contruirListaAmigosChat() {
    const urlServer = `/amistades/nuevoChat/`;
    const divNuevoChat = document.querySelector('#divNuevoChat');
    let html = ''
    try {
        const respuesta = await enviarPeticiones(urlServer);
        if (respuesta.estado) {
            
            respuesta.amigos.forEach(amigo => {
                html += `
                <div class="col-12">
                        <div class="preview-list">
                            <div class="preview-item border-bottom">
                                <div class="preview-thumbnail">
                                    <img class="rounded-3" src="/images/perfiles/${amigo.perfil}" alt="image">
                                </div>
                                <div class="preview-item-content d-sm-flex flex-grow">
                                    <div class="flex-grow">
                                        <h6 class="preview-subject">${amigo.nombreUsuario}</h6>
                                        <p class="text-muted mb-0">${amigo.estado ? 'Conectado' : 'Inactivo'}</p>
                                    </div>
                                    <div class="mr-auto text-sm-right pt-2 pt-sm-0">
                                        ${amigo.existe ? 
                                            `<button class="btn btn-success btn-icon" onclick="mostrarListaMensajes(${amigo.id})"><i class="mdi mdi-message-text-outline"></i></button>` : 
                                            `<button class="btn btn-warning btn-icon" onclick="empezarChat(${amigo.id})"><i class="mdi mdi-human-greeting"></i></button>`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `
            });

            divNuevoChat.innerHTML = html;
        }

    } catch (error) {
        console.log(error);
        
    }
}

async function mostrarListaMensajes() {
    
    const url = `/amistades/listaMensajes/`;
    let html = ''
    const divListaMensajes = document.querySelector('#divListaMensajes');
    try {
        const respuesta = await enviarPeticiones(url);
        
        if (respuesta.estado) {
            if (respuesta.contactos.length === 0) {
                html += `
                    <div class="">
                        No hay mensajes aún
                    </div>
                `

                divListaMensajes.innerHTML = html;
                return;
            }

            respuesta.contactos.forEach((dato, index) => {
                html += `
                    <button type="button" class="list-group-item list-group-item-action d-flex align-items-center p-3 mb-2 rounded border-0 btn-list-custom" aria-current="true" onclick="verChatUsuario('${dato.id}')">
                        <div class="user-thumbnail me-3">
                            <img class="img-xs rounded-circle" src="/images/perfiles/${dato.perfil}" alt="${dato.nombreUsuario}">
                        </div>
                        <div class="preview-item-content d-flex flex-column flex-grow-1">
                            <div class="d-flex justify-content-between align-items-center">
                                <h6 class="preview-subject mb-0">${dato.nombreUsuario}</h6>
                                <p class="text-muted small mb-0">${dato.fechaMensaje}</p>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <p class="text-muted mb-0 text-truncate" style="max-width: 80%;">${dato.ultimoMensaje}</p>
                                <div class="dropdown">
                                    <a href="#" class="text-white text-decoration-none" 
                                    id="dropdownMenuLink${dato.id}" 
                                    data-bs-toggle="dropdown" aria-expanded="false">
                                        ...
                                    </a>
                                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuLink${dato.id}">
                                        <li><a class="dropdown-item" href="#" onclick="eliminarMensajeUsuario('${dato.id}')">Eliminar mensaje</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </button>
                `;
            });

            divListaMensajes.innerHTML = html;

            document.querySelectorAll('.list-group-item').forEach(item => {
                item.addEventListener('click', function () {
                    document.querySelectorAll('.list-group-item').forEach(el => el.classList.remove('active')); // Quitar la clase 'active'
                    this.classList.add('active'); // Agregar la clase 'active' al elemento seleccionado
                });
            });
        }

    } catch (error) {
        console.log(error);
    }
}


async function empezarChat(idURecep) {
    const url = `/amistades/empezarChat/${idURecep}/`;
    const jsonCuerpo = {
        texto : 'Hola'
    }
    try {
        const repuesta = await enviarPeticiones(url, 'POST', jsonCuerpo);

        if (repuesta.estado) {
            verChatUsuario(idURecep);
        }
        mandarNotificacion(repuesta.message, repuesta.icono)

    } catch (error) {
        console.log(error);
        
    }
}


async function verChatUsuario(idUsuarioRecep) {
    modalAbrirNuevoChat.hide();

    verChatUsuarioUrl(idUsuarioRecep);

    sessionStorage.setItem('chatActivo', idUsuarioRecep);

    const divChatUsuario = document.querySelector('#divChatUsuario');
    
    crearChatUsuario(idUsuarioRecep);

    divChatUsuario.innerHTML = `
        <div class="chat-messages mt-3 p-2">
            <div class="chat-messages mt-3 p-2 d-flex align-items-center justify-content-center">
                <div class="text-center">
                <h5 class="text-muted">Selecciona un amigo para empezar a chatear</h5>
                <p class="text-muted">Haz clic en un amigo de la lista para iniciar una conversación.</p>
                </div>
            </div>
        </div>
    `;
}

async function crearChatUsuario(idReceptor) {

    const url = `/amistades/verChat/${idReceptor}/`;
    let html = ``;
    const divChatUsuario = document.querySelector('#divChatUsuario');
    const divDatosRecep = document.querySelector('#divDatosRecep');
    const divEscribirMensajes = document.querySelector('#divEscribirMensajes');

    try {
        const respuesta = await enviarPeticiones(url);
        if (respuesta.estado) {
            divDatosRecep.innerHTML = `
                <h4 class="card-title mb-1">Chat con ${respuesta.datosRecep.nombreUsuario}</h4>
                <a class="text-muted mb-1" href="#" type="button">Ver perfil</a>
            `;

            if (respuesta.mensajes.length === 0) {
                html = `
                    <div class="">
                        No hay mensajes aún
                    </div>
                `;
                divChatUsuario.innerHTML = html;
                return;
            }

            respuesta.mensajes.forEach((dato) => {
                html += `
                    <div class="d-flex ${dato.idUsuario === dato.emisorId ? 'flex-row-reverse' : 'flex-row'} mb-1 chat-mensaje" data-id="${dato.idMensaje}">
                        <div class="p-2 ${dato.idUsuario === dato.emisorId ? 'bg-primary text-white' : 'bg-light text-dark'} rounded" style="cursor: pointer;">
                            <p class="mb-0">${dato.texto}</p>
                        </div>
                        ${dato.idUsuario === dato.emisorId ? `
                            <div class="d-flex align-items-center me-2">
                                <span class="text-muted small visto-estado fw-bold  " style="display: none;">${dato.vistoPorEmisor ? 'Visto' : 'Enviado'}</span>
                            </div>
                        ` : ''}
                    </div>
                `;
            });

            divChatUsuario.innerHTML = html;

            // **Hacer scroll al final del chat**
            divChatUsuario.scrollTop = divChatUsuario.scrollHeight;

            divEscribirMensajes.innerHTML = `
                <form id="frmEnviarMensaje">
                    <div class="input-group">
                        <textarea class="form-control rounded-3" id="txtEnviar" placeholder="Escribir..." 
                                aria-label="Escribir..." rows="1" style="resize: none;"></textarea>
                        <div class="input-group-append mx-2 d-flex align-items-center">
                            <button class="btn btn-reddit rounded-3" type="submit">Enviar</button>
                        </div>
                    </div>
                </form>
            `;

            // Referencia al formulario
            const frmEnviarMensaje = document.querySelector('#frmEnviarMensaje');
            const txtEnviar = document.querySelector('#txtEnviar');


            txtEnviar.addEventListener('click', () => {
                verChatUsuarioUrl(idReceptor); // Llama a la función solo al hacer clic en el textarea
            });
            
            // Evitar salto de línea y enviar mensaje al presionar Enter
            txtEnviar.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault(); // Evita la nueva línea
                    frmEnviarMensaje.requestSubmit(); // Envía el formulario
                }
            });

            // Enviar el mensaje
            frmEnviarMensaje.addEventListener('submit', (e) => {
                e.preventDefault();
                enviarMensaje(idReceptor);
                txtEnviar.value = ''; // Limpiar el campo después de enviar
            });

            document.querySelectorAll('.chat-mensaje').forEach((element) => {
                element.addEventListener('click', function() {
                    const estado = this.querySelector('.visto-estado');
                    if (estado) {
                        estado.style.display = estado.style.display === 'none' ? 'inline' : 'none';
                    }
                });
            });
        }
    } catch (error) {
        console.log(error);
    }
}


function verChatUsuarioUrl(idReceptor) {

    const url = `amistades/verChatUsuario/${idReceptor}/`;

    enviarPeticiones(url, 'POST')
        .then(respuesta => {
            if (respuesta.estado) {
                console.log('Chat abierto');
            }
        })
        .catch(error => {
            console.error(error);
        });
}

async function enviarMensaje(idUsuarioRecep) {
    const url = `/amistades/nuevoMensaje/${idUsuarioRecep}/`;
    const jsonCuerpo = {
        texto : document.getElementById('txtEnviar').value
    }
    try {
        const respuesta = await enviarPeticiones(url, 'POST', jsonCuerpo);
        if (respuesta.estado) {
            verChatUsuario(idUsuarioRecep);
        }
    } catch (error) {   
        console.log(error);
    }
}

async function eliminarMensajeUsuario(idUsuarioRecep) {
    const url = `/amistades/eliminarAmistadUsuario/${idUsuarioRecep}/`;
    try {
        const respuesta = await enviarPeticiones(url, 'POST');
        if (respuesta.estado) {
            mostrarListaMensajes();
        }
    } catch (error) {
        console.log(error);
    }
}

//permitir solo imagenes


function obtenerIdDesdeURL() {
    const urlParams = new URLSearchParams(window.location.search); // Leer los parámetros de la URL
    const idReceptor = urlParams.get('usuario'); // Obtener el ID del receptor
    if (idReceptor) {
        setTimeout(() => {
            mostrarListaMensajes(parseInt(idReceptor));
        }, 1500);
    }
} 