const cambiarEstadoConectado = document.querySelector('#cambiarEstadoConectado');
const modalConfirmacionPeticiones2 = new bootstrap.Modal(document.querySelector('#modalConfirmacionPeticiones'));


document.addEventListener("DOMContentLoaded", async function () {
    await listarAmigosConf();
    conectarWSIo()
    
    if (sessionStorage.getItem('token')) {
        iniciarTemporizadorToken();
    }

})

cambiarEstadoConectado.addEventListener('change', function () {
    const estado = cambiarEstadoConectado.checked;
    console.log(estado);
    updateConectado(estado);
});


async function listarAmigosConf() {
    const url = `/confAmistad/listaAmistades/`;
    const divListaAmigosConf = document.getElementById('divListaAmigosConf');
    const textCantidadAmigos = document.getElementById('textCantidadAmigos');
    let html = ''

    try {
        
        const respuesta = await enviarPeticiones(url);
        if (respuesta.estado) {
            
            if (respuesta.listaAmigos.length == 0) {
                html += `<div class="alert alert-danger" role="alert">
                            No hay amigos
                        </div>`
                divListaAmigosConf.innerHTML = html;
                return;
            }

            textCantidadAmigos.textContent = `${respuesta.listaAmigos.length} ${respuesta.listaAmigos.length > 1 ? 'amigos' : 'amigo'}`

            respuesta.listaAmigos.map((amigo) => {
                html += `
                    <div class="preview-item border-bottom">
                        <div class="user-thumbnail me-3">
                            <img class="img-xs rounded-circle" src="/images/perfiles/${amigo.perfil}" alt="${amigo.nombreUsuario}">
                        </div>
                        <div class="preview-item-content d-sm-flex flex-grow">
                            <div class="flex-grow">
                                <h6 class="preview-subject">${amigo.nombreUsuario}</h6>
                                <p class="text-muted mb-0">${amigo.estado ? 'Conectado' : 'Inactivo'}</p>
                            </div>
                            <div class="mr-auto text-sm-right pt-2 pt-sm-0">
                                <button class="btn btn-primary btn-icon" onclick="verPerfilAmigo(${amigo.id})"><i class="mdi mdi-account"></i></button>
                                <button class="btn btn-danger btn-icon" onclick="borrarAmigo(${amigo.id})"><i class="mdi mdi-trash-can"></i></button>
                                <button class="btn btn-warning btn-icon"><i class="mdi mdi-lock"></i></button>
                            </div>
                        </div>
                    </div>
                `
            })

            divListaAmigosConf.innerHTML = html;
        }

    } catch (error) {
        html += `<div class="alert alert-danger" role="alert">
                    ${error}
                </div>`
    }
}


function updateConectado(estado) {
    const jsonCuerpo = {
        estado: estado
    }

    enviarPeticiones(`../../usuarios/cambiarEstadoConectado/`, 'POST', jsonCuerpo)
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


function verPerfilAmigo(idAmigo) {
    window.location.href = `/perfil/${idAmigo}/`;
}

async function borrarAmigo(idAmigo) {
    const url = `../../confAmistad/borrarAmistad/${idAmigo}/`;
    modalConfirmacionPeticiones2.show();
    const btnConfirmar = document.getElementById('btnConfirmar');

    btnConfirmar.addEventListener('click', async function () {
        modalConfirmacionPeticiones2.hide();
        try {
            const respuesta = await enviarPeticiones(url, 'POST');
            if (respuesta.estado) {
                listarAmigosConf();
            }
            mandarNotificacion(respuesta.message, respuesta.icono)
        } catch (error) {
            mandarNotificacion('Algo salio mal', 'error')
        }
    })
}