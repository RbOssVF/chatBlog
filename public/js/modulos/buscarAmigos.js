const busquedaUsuarios = document.getElementById('busquedaUsuarios');

document.addEventListener("DOMContentLoaded", function () {
    listarUsuariosBusqueda();
})

function listarUsuariosBusqueda() {
    const url = '/usuarios/listaUsuariosBusqueda';
    enviarPeticiones(url)
        .then(respuesta => {
            if (respuesta.estado) {
                let html = '';

                if (respuesta.usuarios.length === 0) {
                    html = `
                        <div class="col-12">
                            <div class="preview-list">
                                <div class="preview-item border-bottom">
                                    <div class="preview-thumbnail">
                                        <div class="preview-icon bg-primary">
                                            <i class="mdi mdi-account-multiple-outline"></i>
                                        </div>
                                    </div>
                                    <div class="preview-item-content d-sm-flex flex-grow">
                                        <div class="flex-grow">
                                            <h6 class="preview-subject">No se encontraron resultados</h6>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `
                    return busquedaUsuarios.innerHTML = html
                }

                respuesta.usuarios.forEach(dato => {
                   html = `
                    <div class="col-12">
                        <div class="preview-list">
                            <div class="preview-item border-bottom">
                                <div class="preview-thumbnail">
                                    <div class="preview-icon bg-primary">
                                        <img class="img-xs" src="/images/perfiles/${dato.perfil}" alt="">
                                    </div>
                                </div>
                                <div class="preview-item-content d-sm-flex flex-grow">
                                    <div class="flex-grow">
                                        <h6 class="preview-subject">${dato.nombreUsuario}</h6>
                                        <p class="text-muted mb-0">Peru</p>
                                    </div>
                                    <div class="mr-auto text-sm-right pt-2 pt-sm-0">
                                        <p class="text-white text-end"><a href="" type="button"
                                                class="text-white text-decoration-none">Ver</a></p>
                                        <p class="text-muted mb-0">100 amigos</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                   ` 
                });

                busquedaUsuarios.innerHTML = html;
            }
        })
        .catch(error => {
            console.log(error);
        });
}