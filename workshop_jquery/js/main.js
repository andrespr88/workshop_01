$(document).ready(function () {
    cargaInicial();
    //obtengo los elementos html y les agrego los eventos; deshabilito los botones de agregar y eliminar
    $("#inputNombre").on("keyup", validarNombre);
    $("#inputEmail").on("keyup", validarEmail);
    $("#inputDni").on("keyup", validarDni);
    $("#agregarAlumno").on("click", agregarAlumno);
    $("#agregarAlumno").attr("disabled", true);
    $("#inputEliminarDni").on("keyup", validarEliminar);
    $("#eliminarAlumno").on("click", eliminarAlumno);
    $("#eliminarAlumno").attr("disabled", true);
    $("#inputBuscarNombre").on("keyup", validarBuscarEnter);
    $("#buscarAlumno").on("click", buscarAlumnoNombre);

});

// Carga inicial de los alumnos del local Storage en el html
function cargaInicial() {
    //obtengo el vector de alumnos del localStorage
    var listaAlumnos = getLocalList("alumnosLocal");
    var listaPrincipal = document.getElementById("accordion");
    var alumno;
    //borro la lista para que, cuando se vuelva a llamar, sobreescriba todos los alumnos
    listaPrincipal.innerHTML = "";
    //agregro cada alumno del vector al html
    for (var i = 0; i < listaAlumnos.length; i++) {
        alumno = crearNodo(listaAlumnos[i]);
        listaPrincipal.innerHTML += (alumno);
    }
    $( "#accordion" ).accordion();
    $( "#accordion" ).accordion("refresh");
}

//recibe como parametro un objeto alumno y crea el nodo en el html con los datos del alumno
function crearNodo(nuevoAlumno) {
    var nodo ='<h3 id="'+ nuevoAlumno.dni +'">'+nuevoAlumno.nombre + ' ' + nuevoAlumno.apellido + '</h3>' +
    '<div>'+
        '<h5>Dni: ' + nuevoAlumno.dni +'</h5><p>E-mail: ' +
        nuevoAlumno.email + '</p>' +
        '<input type="button" class="btn btn-block btn-sm btn-warning col-6 offset-3" value="Modificar Notas" onclick = "mostrarNotas('+JSON.stringify(nuevoAlumno).replace(/"/g,"'")+')">'+
    '</div>';
    return nodo;
}

// recibe un objeto input y una condicion a evaluar, y le agrega o quita la clase para validar o invalidar el input
function agregarClase(obj, condicion) {
    if (condicion) {
        //le saco la clase "is-invalid", en caso que no la tenga, no rompe ni hace nada        
        obj.classList.remove("is-invalid");
        obj.classList.add("is-valid");
    } else {
        obj.classList.remove("is-valid");
        obj.classList.add("is-invalid");
    }
}


function validarNombre() {
    //si el nombre es un string vacio, lo toma como falso
    agregarClase(this, this.value.trim());
    var valido=validarBotonAgregar();
    if (event.which == 13 && valido){
        //disparo la funcion del boton que no tenga la clase .d-none
        if (!$("#agregarAlumno").hasClass("d-none")){
            agregarAlumno();
        }
        if (!$("#modificarAlumno").hasClass("d-none")){
            modificarAlumno();
        }
    }
}

function validarEmail() {
    //verifica que tenga: string + "@" + string + "." + string de min 2 y max 4 caracteres 
    var test = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})$/.test(this.value);
    agregarClase(this, test);
    (test) ? document.getElementById("emailHelp").innerText = "" : document.getElementById("emailHelp").innerText = "Ejemplo: usuario@ejemplo.com";
    var valido=validarBotonAgregar();
    if (event.which == 13 && valido){
        //disparo la funcion del boton que no tenga la clase .d-none
        if (!$("#agregarAlumno").hasClass("d-none")){
            agregarAlumno();
        }
        if (!$("#modificarAlumno").hasClass("d-none")){
            modificarAlumno();
        }
    }
}

function validarDni () {
    var dni = this.value.trim();
    //compruebo que sea un numero entero y positivo
    var test = /^\d+$/g.test(dni);
    if (!test){
        document.getElementById("dniHelp").innerText = "Ingrese un número entero y positivo"; 
    } else if (dni.length != 8){
        test = false;
        document.getElementById("dniHelp").innerText = "Ingrese un número de 8 dígitos";
    } else if (buscarAlumnoDni(dni) != -1) {
        test = false;
        document.getElementById("dniHelp").innerText = "El Dni ingresado coincide con el de otro alumno";
    } else document.getElementById("dniHelp").innerText = "";  
    agregarClase (this, test);
    var valido=validarBotonAgregar();
    if (event.which == 13 && valido){
        agregarAlumno();
    }
}

//busca si existe un alumno con ese dni en el localStorage, si lo encuentra retorna la posicion, si no, retorna -1
function buscarAlumnoDni (dni) {
    var vectorAlumnos = getLocalList("alumnosLocal");
    for (i=0; i < vectorAlumnos.length; i++ ){
        if (vectorAlumnos[i].dni == dni) {
            return i;
        } 
    }  
    return -1;  
}
//comprueba que en el formulario haya 3 inputs con la clase "is-valid", ya que tanto el campo nombre, dni y email tienen que ser validos, solo entonces habilita el boton
function validarBotonAgregar () {    
    var formularioAgregar = document.getElementById("formularioAgregar");
    var inputs = formularioAgregar.getElementsByClassName("is-valid");
    var botonAgregarAlumno = document.getElementById("agregarAlumno");
    var botonModificarAlumno = document.getElementById("modificarAlumno"); 
    if (inputs.length === 3){        
        botonAgregarAlumno.disabled = false;
        botonModificarAlumno.disabled = false;
        return true;
    } else {
        botonAgregarAlumno.disabled = true;
        botonModificarAlumno.disabled = true;
    }
}

//borra los campos de ayuda, los value y las clases de los inputs
function resetearFormulario(formulario) {
    formulario.reset();
    document.getElementById("dniHelp").innerText = "";
    document.getElementById("emailHelp").innerText = "";
    //obtengo todos los inputs con clase "is-valid" y les remuevo dicha clase 
    var inputs = formulario.getElementsByClassName("is-valid");
    while (0 < inputs.length) {
        inputs[0].classList.remove("is-valid");        
    }
    $("#agregarAlumno").attr("disabled", true);
    $("#eliminarAlumno").attr("disabled", true);
}

function agregarAlumno () {
    //obtengo los datos de los inputs sin los espacios del principio y del final
    var nombre = document.getElementById("inputNombre").value.trim();
    var apellido = document.getElementById("inputApellido").value.trim();
    var email = document.getElementById("inputEmail").value.trim();
    var dni = document.getElementById("inputDni").value.trim();
    var vectorAlumnos = getLocalList("alumnosLocal");
    var alumno = new crearAlumno(nombre, apellido, dni, email);
    //agrego el alumno al vector
    vectorAlumnos.push(alumno);
    setLocalList("alumnosLocal", vectorAlumnos);
    crearNodo(alumno);
    var formulario = document.getElementById("formularioAgregar");
    resetearFormulario(formulario);
    cargaInicial();
}

function crearAlumno (nombre, apellido, dni, email, notas){
    return {
        nombre: nombre,
        apellido: apellido,
        dni: dni,
        email: email,
        //si recibe un vector de notas, lo setea en la propiedad, si no recibe nada, crea un vector vacio
        notas: notas || []
    }
}

/*La función tiene que recibir como parámetros una key y un Array y convertir el Array en JSON para 
guardarlo en el localStorge. La función tiene que validar los parámetros que recibe, en caso de que 
alguno sea incorrecto no debe romper ni guardar nada*/

function setLocalList(key, testList) {
    if (typeof key === "string" && Array.isArray(testList)) {
        //convertimos en JSON el array
        testList = JSON.stringify(testList);
        //creo el localStorage
        localStorage.setItem(key, testList);
    }
}

/*La función tiene que recibir como parámetro una key y buscar en el localStorage por esa key devolviendo 
un objeto de JavaScript, si no existe el elemento debe devolver un Array vacío. La función tiene que
validar los parámetros que recibe, en caso de que alguno sea incorrecto no debe romper ni borrar nada.*/

function getLocalList(key) {
    if (typeof key === "string") {
        //recupero la lista del local storage
        var localList = localStorage.getItem(key);
        //verifico que sea distinto de null o undefined
        if (localList) {
            //si existe, la transformo en Javascript y la devuelvo
            var resultado = JSON.parse(localList);
            return resultado;
        } else return [];
    }
}


//funcion que muestra las notas del alumno en el html
function mostrarNotas(alumno){
    var listaNotas = $("#dialog");
    //listaNotas.html('');
    var notas = '<div class="input-group mt-2">';
    var vectorNotas = alumno.notas;
    for (var i = 0; i < vectorNotas.length; i++) {   
        //para que haya un maximo de 2 notas por fila
        if (i != 0 && i % 2 == 0){
            notas += '</div><div class="input-group">';
        }          
        notas += '<p class="col-6"><input type="number" step="0.5" class="form-control form-control-sm" onkeyup="validarNota('+JSON.stringify(alumno).replace(/"/g,"'")+')" value="'+vectorNotas[i]+'"></p>';        
        if (i == vectorNotas.length - 1) 
        notas += '</div>';
    } 
    //muestro el input para agregar una nota nueva y el boton para actualizarlas
    listaNotas.html(notas +'<p class="col-12"><input class="form-control" type="number" step="0.5" id="inputNota" onkeyup="validarNota('+JSON.stringify(alumno).replace(/"/g,"'")+')" placeholder="Nueva nota"></p>'+
    '<div class="col-12 mb-2"><input type="button" class="btn btn-block btn-success" value="Actualizar" onclick="actualizarNotas('+JSON.stringify(alumno).replace(/"/g,"'")+')"><div>');
    //posiciono el mouse en el primer input
    $("#dialog input[type=number]:first").focus(); 
    //
    listaNotas.dialog({
        modal: true,
        show: {
            effect: "puff",
            duration: 400
        },
        hide: {
            effect: "explode",
            duration: 400
        }
    });
}

//cuando la nota este entre 0 y 10 agrega la clase "is-valid", si no, la clase "is-invalid"
function validarNota(alumno) {
    var nota = parseFloat(event.target.value.trim());
    var test = (nota >= 0 && nota <=10);
    agregarClase(event.target, test);
    if (event.which == 13){
        actualizarNotas(alumno);
    }
}

function actualizarNotas(alumno){
    //obtengo todos los input con type number que esten dentro la lista #listaNotas
    var inputs = document.querySelectorAll("#dialog input[type=number]");
    var notas = [];
    for (i=0; i < inputs.length; i++){
        var numero = parseFloat(inputs[i].value.trim()).toFixed(2);
        //agrego la nota solo cuando es mayor a 0 y menor a 10
        //si el input esta vacio, el parseFloat me daria un NaN, pero NaN >= 0 es falso y tmp entraria
        if (numero >= 0 && numero <= 10)
            notas.push(numero);
    }    
    //obtengo el vector de alumnos del localStorage
    var vectorAlumnos = getLocalList("alumnosLocal");
    //busco la posicion del alumno
    var posicion = buscarAlumnoDni(alumno.dni);
    //le seteo el nuevo vector de notas al alumno
    vectorAlumnos[posicion].notas = notas;
    //guardo el vector en el localStorage
    setLocalList("alumnosLocal", vectorAlumnos);
    //vuelvo a mostrar la lista de alumnos (para que actualice el json del evento onclick = actualizarNotas vinculado al boton de la ficha del alumno)    
    cargaInicial();
    //$("#dialog").dialog("close");
    //vuelvo a mostrar el alumno con las notas actualizadas    
    mostrarNotas(vectorAlumnos[posicion]);

}

//borra todo el contenido de #listaNotas
function cerrar () {
    var listaNotas = document.getElementById("listaNotas");
    listaNotas.innerHTML = "";
}

//funcion que comprueba y valida que exista un alumno que coincida con el dni ingresado en el input; si existe, agrega la clase "is-valid" al input y habilita el boton, si no, agrega la clase "is-invalid" y deshabilita el boton
function validarEliminar () {
    var botonEliminarAlumno = document.getElementById("eliminarAlumno");
    var test = false;
    var dni = this.value;
    if (buscarAlumnoDni(dni) != -1){
        test = true;
        botonEliminarAlumno.disabled = false;
    } else botonEliminarAlumno.disabled = true;              
    agregarClase (this, test);
}

//obtiene el dni ingresado en el input, busca la posicion del alumno en el vector y lo elimina. Agrega el nuevo vector al localStorage y vuelve a mostrar la lista de alumnos en el html 
function eliminarAlumno () {    
    var dni = document.getElementById("inputEliminarDni").value;
    var posicion = buscarAlumnoDni(dni);
    var vectorAlumnos = getLocalList("alumnosLocal");
    if (posicion != -1){
        vectorAlumnos.splice(posicion,1);
        setLocalList("alumnosLocal",vectorAlumnos);
        cargaInicial();
    }
}

//recibe un objeto alumno y muestra sus datos en los inputs del formulario
function mostrarAlumnoFormulario(alumno) {
    resetearFormulario(document.getElementById("formularioAgregar"));
    //si hay coincidencia, muestro los datos en los inputs
    document.getElementById("inputDni").value = alumno.dni;
    document.getElementById("inputNombre").value = alumno.nombre;
    document.getElementById("inputApellido").value = alumno.apellido;
    document.getElementById("inputEmail").value = alumno.email;
    //le agrego la clase "is-valid" a los inputs, para que se habilite el boton sin la necesidad de andar entrando a cada input y presionando alguna tecla (las validaciones estan asociadas al evento keyup)
    agregarClase(document.getElementById("inputNombre"), true);
    agregarClase(document.getElementById("inputDni"), true);
    agregarClase(document.getElementById("inputEmail"), true);
}

//recibe un nombre y un vector de alumnos, busca coincidencias parciales en el nombre y apellido de los alumnos del vector, si lo encuentra, lo activa en el acordeon y llama a la funcion mostrarAlumnoFormulario
function alumnoExiste (nombre, vectorAlumnos) {
    var nombreVector
    var apellidoVector
    for (var i = 0; i < vectorAlumnos.length; i++) {
        nombreVector = vectorAlumnos[i].nombre.toLowerCase();
        apellidoVector = vectorAlumnos[i].apellido.toLowerCase();
        //comparo el nombre del input con el nombre y el apellido de cada alumno
        if (nombreVector.indexOf(nombre) !== -1 || apellidoVector.indexOf(nombre) !== -1){
            mostrarAlumnoFormulario(vectorAlumnos[i]);
            //selecciono el alumno para que se visualice en el acordeon
            $( "#accordion" ).accordion( "option", "active", i );
            var lista = document.getElementById("accordion").getElementsByTagName("h3");
            //agrego la clase active (esto lo usaba para bootstrap, pero lo dejo para poder encontrar al alumno sin usar una variable global)
            lista[i].classList.add("active");
            return true;            
        }
    }
    return false;
}

function buscarAlumnoNombre () {    
    //objeto html donde voy a infomar al usuario si no se encontró el alumno
    var nombreAyuda = document.getElementById("nombreHelp");
    //si existe un elemento con clase active en la lista, se la remuevo, ya que si se busca un alumno y luego se busca otro sin haber modificado el primero, quedarian ambos items con la clase active; y necesito que haya solo 1 por vez
    var vector = document.getElementsByClassName("active");
    if (vector.length) 
        vector[0].classList.remove("active");
    //obtengo el nombre del input, lo paso a minuscula y le quito los espacios del principio y del final
    var inputBuscar = document.getElementById("inputBuscarNombre");
    var nombre = inputBuscar.value.toLowerCase().trim();
    //verifico que haya ingresado como minimo 3 caracteres
    if (nombre.length >= 3){
        //obtengo el vector de alumnos del localStorage
        var vectorAlumnos = getLocalList("alumnosLocal");
        if (alumnoExiste(nombre, vectorAlumnos)) {
            //oculto el boton agregar
            var botonAgregarAlumno = document.getElementById("agregarAlumno");
            botonAgregarAlumno.classList.add("d-none");
            //muestro el boton modificar
            var botonModificarAlumno = document.getElementById("modificarAlumno");
            botonModificarAlumno.classList.remove("d-none");
            //agrego el evento al boton modificar
            botonModificarAlumno.addEventListener("click", modificarAlumno);
            //cambio la funcion que valida el #inputDni
            var inputDni = document.getElementById("inputDni");
            inputDni.removeEventListener("keyup", validarDni);
            inputDni.addEventListener("keyup", validarModificarDni);
            //reseteo el campo que indica que no se encontró el alumno
            nombreAyuda.innerText = "";
            inputBuscar.value = "";
            $("#inputNombre").focus();
            return 
        } else nombreAyuda.innerText = "No se encontró el alumno";
    } else {
        nombreAyuda.innerText = "Debe ingresar 3 caracteres como mínimo";
    }
}

//tengo que cambiar la validacion del dni, ya que ahora puede haber una coincidencia entre el dni ingresado y el dni de un alumno del vector, siempre y cuando estemos hablando del mismo alumno 
function validarModificarDni () { 
    // obtengo el dni desde el id del elemento de la lista con clase "active"
    var dni = document.querySelectorAll("#accordion h3.active")[0].id;
    //busco la posicion del alumno en el vector del localStorage
    var posicion = buscarAlumnoDni(dni);
    //busco si existe algun alumno con el dni obtenido del inputDni
    var posicion2 = buscarAlumnoDni(this.value.trim());
    //compruebo que sea un número entero y positivo
    var test = /^\d+$/g.test(this.value);
    //si (el inputDni es un entero positivo && (no coincide con los otros dni || coincide con el del mismo alumno que estoy modificando)) le agrego la clase "is-valid", si no, agrego la clase "is-invalid"
    var condicion = test && this.value.trim().length == 8 && (posicion2 == -1 || posicion == posicion2);
    agregarClase(this,condicion);
    //si no es valido, muestro una ayuda
    (condicion) ? document.getElementById("dniHelp").innerText = "" : document.getElementById("dniHelp").innerText = "Ingrese un número de 8 dígitos, no debe coincidir con el dni de otro alumno";
    var valido=validarBotonAgregar();
    if (event.which == 13 && valido){
        modificarAlumno();
    }
}

function modificarAlumno () {
    /* no sabia como pasar la posicion del alumno encontrado por la funcion buscarAlumnoNombre sin usar una variable global; y se me ocurrio obtener el dni desde el id del elemento de la lista con clase "active"*/
    var dni = document.querySelectorAll("#accordion h3.active")[0].id;
    //busco la posicion del alumno en el vector del localStorage
    var posicion = buscarAlumnoDni(dni);
    //obtengo los datos de los inputs
    var nombre = document.getElementById("inputNombre").value.trim();
    var apellido = document.getElementById("inputApellido").value.trim();
    var inputDni = document.getElementById("inputDni");
    var email = document.getElementById("inputEmail").value.trim();
    //obtengo el vector de alumnos del localStorage
    var vectorAlumnos = getLocalList("alumnosLocal");
    //obtengo las notas del alumno encontrado
    var notas = vectorAlumnos[posicion].notas;
    //agrego el alumno modificado al vector de alumnos
    vectorAlumnos[posicion] = new crearAlumno(nombre, apellido, inputDni.value.trim(), email, notas);
    //agrego el vector al localStorage
    setLocalList("alumnosLocal", vectorAlumnos);
    //muestro el boton agregar
    var botonAgregarAlumno = document.getElementById("agregarAlumno");
    botonAgregarAlumno.classList.remove("d-none");
    //oculto el boton modificar
    var botonModificarAlumno = document.getElementById("modificarAlumno");
    botonModificarAlumno.classList.add("d-none");
    //reseteo los value y las clases del formulario
    var formulario = document.getElementById("formularioAgregar");
    resetearFormulario(formulario);     
    //agrego y remuevo los eventos para que cambie la forma de validar el input 
    inputDni.removeEventListener("keyup", validarModificarDni);
    inputDni.addEventListener("keyup", validarDni);        
    //vuelvo a cargar los alumnos en pantalla
    cargaInicial();
    //activo el alumno en el acordeon
    $("#accordion").accordion("option", "active", posicion);
}

function validarBuscarEnter(){
    if (event.which == 13){
        buscarAlumnoNombre();
    }
}