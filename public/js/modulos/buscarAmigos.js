const busquedaUsuarios = document.getElementById('busquedaUsuarios');

document.addEventListener("DOMContentLoaded", function () {
    listarUsuariosBusqueda();
})

function listarUsuariosBusqueda() {
    const url = '/usuarios/listaUsuariosBusqueda';
    let html = '';
    enviarPeticiones(url)
        .then(respuesta => {
            if (respuesta.estado) {
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

              
                respuesta.usuarios.forEach((dato, index) => {

                    const activeClass = index === 0 ? 'active' : ''; // Aplicar clase 'active' al primer usuario

                    html += `
                        <button type="button" class="list-group-item list-group-item-action d-flex align-items-center p-3 mb-2 rounded border-0 btn-list-custom" aria-current="true" onclick="seleccionarUsuario('${dato.id}')">
                            <div class="user-thumbnail me-3">
                                <img class="img-xs rounded-circle" src="/images/perfiles/${dato.perfil}" alt="${dato.nombreUsuario}">
                            </div>
                            <div class="user-content flex-grow-1">
                                <h6 class="mb-1 fw-bold">${dato.nombreUsuario}</h6>
                                <p class="text-muted small mb-0">Peru</p>
                            </div>
                            <div class="text-end">
                                <p class="text-muted small mb-0">${dato.amigos || 100} amigos</p>
                            </div>
                        </button>
                    `;
                });

                busquedaUsuarios.innerHTML = html;
            }

            document.getElementById('busquedaUsuarios').innerHTML = html;

            // Agregar evento de selección para cada elemento
            document.querySelectorAll('.list-group-item').forEach(item => {
                item.addEventListener('click', function () {
                    document.querySelectorAll('.list-group-item').forEach(el => el.classList.remove('active')); // Quitar la clase 'active'
                    this.classList.add('active'); // Agregar la clase 'active' al elemento seleccionado
                });
            });

        })
        .catch(error => {
            console.log(error);
        });
}

async function seleccionarUsuario(idUsuario) {
    const url = `/usuarios/seleccionarUsuario/${idUsuario}/`;
    const divInfoUsuario = document.getElementById('divInfoUsuario');
    const divInfoUsuario2 = document.getElementById('divInfoUsuario2');
    let html = '';
    let html2 = '';

    try {
        const respuesta = await enviarPeticiones(url);

        if (respuesta.estado) {
            html = `
                <div class="position-relative">
                    <div class="daoughnutchart-wrapper">
                        <img src="/images/perfiles/${respuesta.usuario.perfil}" 
                             alt="Perfil de ${respuesta.usuario.nombres}" 
                             class=" rounded-4">
                    </div>

                    <div class="row mt-3 mb-3 col-md-12 d-flex justify-content-center">
                        <div class="col-md-6">
                            <h6 class="mb-1">${respuesta.usuario.nombres} ${respuesta.usuario.apellidos}</h6>
                            <h6 class="mb-1 fw-bold text-muted">${respuesta.usuario.nombreUsuario}</h6>
                        </div>
                        <div class="col-md-6 d-flex justify-content-end">
                            <p class="text-muted mb-0">${respuesta.usuario.amigos || 0} amigos</p>
                        </div>
                    </div>

                    <div class="row mt-3 mb-3 col-md-12 d-flex justify-content-center">
                        <div class="col-md-12">
                            <h6 class="mb-1">Descripción</h6>
                        </div>
                    </div>

                    <div class="row mt-3 mb-3 col-md-12 d-flex justify-content-center">
                        <div class="col-md-12">
                            <h6 class="mb-1 text-muted">${respuesta.usuario.descripcion || 'Sin descripción'}</h6>
                        </div>
                    </div>
                </div>
            `;

            html2 = `
                <div class="col-12">
                    <div class="preview-list">
                        <div class="preview-item border-bottom">
                            <div class="preview-item-content d-sm-flex flex-grow">
                                <div class="flex-grow">
                                    <h6 class="preview-subject">ID:</h6>
                                </div>
                                <div class="mr-auto text-sm-right pt-2 pt-sm-0">
                                    <p class="text-muted">#${respuesta.usuario.ipUser}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            divInfoUsuario.innerHTML = html;
            divInfoUsuario2.innerHTML = html2;
        } else {
            divInfoUsuario.innerHTML = `<p>No se encontró información del usuario.</p>`;
            divInfoUsuario2.innerHTML = '<p>No se encontró información del usuario.</p>';
        }
    } catch (error) {
        console.error('Error al obtener la información del usuario:', error);
        divInfoUsuario.innerHTML = `<p class="text-danger">Error al cargar la información del usuario.</p>`;
        divInfoUsuario2.innerHTML = '<p class="text-danger">Error al cargar la información del usuario.</p>';
    }
}