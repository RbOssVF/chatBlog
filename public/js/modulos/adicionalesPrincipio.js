const btnVerListaConectados = document.getElementById('btnVerListaConectados');


document.addEventListener("DOMContentLoaded", function () {   
    obtenerCantidadConectados();
    conectarWSIo()
    obtenerNuevoUsuarioRegistrado();
})  

btnVerListaConectados.addEventListener('click', function () {
    obtenerListaConectados();
})

async function obtenerCantidadConectados() {
    const url = '../../confAmistad/listaUsuariosConectados';
    const txtCantidadConectados = document.getElementById('txtCantidadConectados');

    try {
        const respuesta = await enviarPeticiones(url);
        if (respuesta.estado) {
            
            if (respuesta.listaConectados.length > 0) {
                txtCantidadConectados.textContent = `${respuesta.listaConectados.length} ${respuesta.listaConectados.length > 1 ? 'conectados' : 'conectado'}`;
            } else {
                txtCantidadConectados.textContent = '0 conectados';
            }
        }

    } catch (error) {
        txtCantidadConectados.textContent = '0 conectados';
    }
}


async function obtenerListaConectados() {
    modalAbrirNuevoChat.show();
    const url = '../../confAmistad/listaUsuariosConectados';
    let html = ''
    const divNuevoChat = document.querySelector('#divNuevoChat');

    try {
        
        const respuesta = await enviarPeticiones(url);
        if (respuesta.estado) {
            
            if (respuesta.listaConectados.length === 0) {
                divNuevoChat.innerHTML = `
                    <div class="text-center">
                        <h6>No hay conectados</h6>
                    </div>
                `;
                return;
            }

            respuesta.listaConectados.map((amigo) => {
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
                                            `<button class="btn btn-success btn-icon" onclick="empezarChatExistente(${amigo.id})"><i class="mdi mdi-message-text-outline"></i></button>` : 
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
        divNuevoChat.innerHTML = `
            <div class="text-center">
                <h6>No hay conectados</h6>
            </div>
        `
    }
}

async function obtenerNuevoUsuarioRegistrado() {
    const url = '../../confAmistad/nuevosUsuariosRegistrado';
    const txtNuevasSugerencias = document.getElementById('txtNuevasSugerencias');
    const txtUsuarioNuevo = document.getElementById('txtUsuarioNuevo');

    try {
        const respuesta = await enviarPeticiones(url);

        if (respuesta.estado) {
            if (respuesta.listaNuevosUsuarios === 0) {
                txtNuevasSugerencias.textContent = '0 nuevas sugerencias';
                txtUsuarioNuevo.textContent = '0 usuarios';
            }
            txtNuevasSugerencias.textContent = respuesta.listaNuevosUsuarios.length > 1 ? `${respuesta.listaNuevosUsuarios.length} sugerencias nuevas` : `${respuesta.listaNuevosUsuarios.length} sugerencia nueva`;
            txtUsuarioNuevo.textContent = `${respuesta.listaNuevosUsuarios[0].nombreUsuario} se acaba de unir`;
        }

    } catch (error) {
        txtNuevasSugerencias.textContent = '0 nuevas sugerencias';
        txtUsuarioNuevo.textContent = '0 usuarios';
    }

}