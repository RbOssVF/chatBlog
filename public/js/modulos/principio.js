//iniciar pagina

const btnSubirImagen = document.querySelector('.file-upload-browse');
const inpImagen = document.querySelector('.file-upload-default');
const inpDetallesImagen = document.querySelector('.file-upload-info');
const btnConfirmar = document.querySelector('#btnConfirmar');
const cambiarEstadoConectado = document.querySelector('#cambiarEstadoConectado');
const formularioUpdateDatos = document.querySelector('#formUpdateDatos');



document.addEventListener("DOMContentLoaded", function () {

    mostrarListaMensajes();

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
    const modalAbrirNuevoChat = 'modalAbrirNuevoChat'
    abriModales(modalAbrirNuevoChat, true)
    contruirListaAmigosChat();
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
                                        <button class="btn btn-primary btn-icon" onclick="empezarChat(${amigo.id})"><i class="mdi mdi-message"></i></button>
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

            respuesta.contactos.forEach(dato, index => {
                const activeClass = index === 0 ? 'active' : '';

                html += `
                    <button type="button" class="${activeClass} list-group-item list-group-item-action d-flex align-items-center p-3 mb-2 rounded border-0 btn-list-custom" aria-current="true" onclick="seleccionarUsuario('${dato.id}')">
                        <div class="preview-thumbnail">
                            <img class="rounded-3" src="/images/perfiles/${dato.perfil}" alt="image">
                        </div>
                        <div class="preview-item-content d-sm-flex flex-grow">
                        <div class="flex-grow">
                            <h6 class="preview-subject">${dato.nombreUsuario}</h6>
                            <p class="text-muted mb-0">${dato.ultimoMensaje}</p>
                        </div>
                        <div class="mr-auto text-sm-right pt-2 pt-sm-0">
                            <p class="text-white text-end"><a href="" type="button" class="text-white text-decoration-none">...</a></p>
                            <p class="text-muted mb-0">${dato.fechaMensaje}</p>
                        </div>
                        </div>
                    </button>
                `
            });

            divListaMensajes.innerHTML = html;
        }

    } catch (error) {
        console.log(error);
    }
}

//permitir solo imagenes
