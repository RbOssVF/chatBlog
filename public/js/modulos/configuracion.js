document.addEventListener("DOMContentLoaded", async function () {
    await listarAmigosConf();
})


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
                                <button class="btn btn-primary btn-icon"><i class="mdi mdi-account"></i></button>
                                <button class="btn btn-danger btn-icon"><i class="mdi mdi-trash-can"></i></button>
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