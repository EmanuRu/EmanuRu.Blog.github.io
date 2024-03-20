//estas variables almacenan los datos de la publicacion los cuales se guardaron en el sessionStorage

history.back();

const nombre = sessionStorage.getItem("nombre");
const posteo = sessionStorage.getItem("posteo");
const codigo = sessionStorage.getItem("codigo");

console.log(nombre +" "+codigo+" "+ posteo);

let contador=0;//contador va a servir para mostrar los comentarios en las publicaciones

const IDBRrquest = indexedDB.open("comentarios",1);//abro la base de datos

//boton para volver a la pagina de tras
const volver = document.getElementById("atras").addEventListener("click",()=>{
    window.open("../index.html");
    window.close(this);
});

//fuancion para crear la fecha y hora de los mensajes
function cargarFechaYHora(){
    let date = new Date();//creo el objeto date para poder agregar el dia y la hora de los cometarios

    let dia = date.getDate();//almacenos de la fecha
    let mes = (date.getMonth()+1);
    let anio = date.getFullYear();
    let hora = date.getHours();
    let minutos = date.getMinutes();

    if(dia<10){ //con estos if le pongo el 0 adelante para que nos sea 1:15 sino 01:15
        dia = "0"+date.getDate();
        console.log(dia);
    }
    if(mes<10){
        mes = "0"+(date.getMonth()+1);
    }
    if(hora<10){
        hora= "0"+date.getHours();
    }
    if(minutos<10){
        minutos = "0"+date.getMinutes();
    }
    const fecha =[dia,mes,anio,hora,minutos];
    return fecha;//retorno los datos en un arreglo
}

cargarFechaYHora();

//funcion para crear los comentarios
async function cargarComentarios(nombre,texto,codigo) {
    const db = await IDBRrquest.result;
    const dbDos = await db;

    let dia,mes,anio,hora,minutos;
    [dia,mes,anio,hora,minutos]=cargarFechaYHora();//guardo los datos de la fecha

    const obj={nombre,texto,dia,mes,anio,hora,minutos}//el objeto que se va a guardar en el arreglo de objetos del objectStorage

    //la transsaccion para que permita ller y escribir en la bd
    const transaction = dbDos.transaction("posteos","readwrite");
    const obStore = transaction.objectStore("posteos");
    const cursor = obStore.openCursor();//el cursor para rrecorrer la bd
    cursor.addEventListener("success",()=>{
        if (cursor.result.key==codigo) {//si la key del curos coinside con el codigo de la publicacion
            
            //usa la metodo put pero lo que hace es: al arreglo que habia, le concatena uno con un
            //objeto 
            obStore.put(cursor.result.value.concat([obj]),cursor.result.key);
        }else{
            //sino son igules la key y el codigo se sigue recorriendo la bd  
            cursor.result.continue();
        }
    });
}

IDBRrquest.addEventListener("success",()=>{
    //si se logra abrir la bd se rrecorren los comentarios
    recorrer();
});

//cuando carga la pagina se crean los elementos de la misma
// window.addEventListener("load",()=>{
    console.log("eeeeeeeeeeeeeeeeeeeee");
    const container = document.createElement("DIV");
    const usuario = document.createElement("H3");
    const contenido = document.createElement("P");
    const secComen = document.createElement("div");
    const titSecCom = document.createElement("h3");
    const comentar = document.createElement("div");
    const inpComentario = document.createElement("INPUT");//input para escribir un comentario
    let btnEnviar = document.createElement("button");

    inpComentario.setAttribute("placeholder","Escribe un comentario");
    btnEnviar.innerHTML="Enviar";

    btnEnviar.addEventListener("click",()=>{//boton para publicar el comentario (en este caso no use submit es solo un boton comun)
        const com = inpComentario.value;
        if (com!="") {//si el comentario no esta vacio
            cargarComentarios("Usuario",com,codigo);//se agrega a la bd
            window.location.reload();//se recarga la pagina
        }else{
            alert("Escribe un comentario");
        }
    });

    //se agregan las clases y los hijos
    secComen.classList.add("titCom");
    titSecCom.textContent="Comentarios";
    comentar.classList.add("mensaje");
    btnEnviar.classList.add("enviar");
    container.classList.add("publicacion");
    usuario.textContent=nombre;
    contenido.textContent=posteo;

    secComen.appendChild(titSecCom);
    comentar.appendChild(inpComentario);
    comentar.appendChild(btnEnviar);
    container.appendChild(usuario);
    container.appendChild(contenido);
    container.appendChild(secComen);
    container.appendChild(comentar);

    //se muestra la publicacion (no los comentarios) en la pagina
    let publicacion = document.querySelector(".publi");
    publicacion.appendChild(container);
// })

//funcion que va a devolver los elemetos junto con su comentario 
function mostrarComentarios(nombre,texto,dia,mes,anio,hora,minuto){
    const contenedor = document.createElement("div");
    const infoGeneral = document.createElement("div");
    const titulo = document.createElement("h2");
    const divFechaHora =document.createElement("div");
    const fecha = document.createElement("p");
    const horaYminuto = document.createElement("p");
    const mensaje = document.createElement("p");

    titulo.textContent=nombre;
    mensaje.textContent=texto;
    fecha.textContent=`${dia}/${mes}/${anio}`;
    horaYminuto.textContent=`${hora}:${minuto}`

    divFechaHora.classList.add("divFechaHora");
    infoGeneral.classList.add("tituYfech");
    contenedor.classList.add("listaComentarios");

    infoGeneral.appendChild(titulo);
    divFechaHora.appendChild(fecha);
    divFechaHora.appendChild(horaYminuto)
    infoGeneral.appendChild(divFechaHora);
    contenedor.appendChild(infoGeneral);
    contenedor.appendChild(mensaje);

    return contenedor;
}

//esta funcion se va a encargar de que cuando aparesca el ultimo comentario
//de la pagina se llame a la funcion que recorre los comentaros
function cargarMasComentarios(entry) {
    if(entry[0].isIntersecting){
        recorrer();
    }
}

//el IntersectionObserver que se va a encargar de ver si es el ultimo comentario
const observe = new IntersectionObserver(cargarMasComentarios);

//funcion que recorre la db y envia los datos de los comentarios para crearlos
function recorrer(){
    const db = IDBRrquest.result;
    const idbTransaction = db.transaction("posteos","readonly");//indica a la bd que solo se va a leer
    const odbStore = idbTransaction.objectStore("posteos");
    const cursor = odbStore.openCursor();//se crea el cursor
    const fragmento = document.createDocumentFragment();//fragmento que va a tener a todos los comentarios
    cursor.addEventListener("success",()=>{
        //se pregunta se la key del curso es la misma que el codigo que se guardo en el sessionStorage
        if (cursor.result.key==codigo) {
            //los comentarios se van a mostrar de los mas nuevos a los viejos, por eso el arreglo
            //de objetos que habia en la bd se invierte
            const arr =  cursor.result.value.reverse();
            for (let i = 0; i < 3; i++) {//los comentarios aparecen de 3 en 3
                if(arr[contador]!=undefined){// si hay algo dentro de arr[contador]
                    //le envia a la fncion que crea los elemento que componen el comentario
                    //el "usuario" y el "contenido" del comentario luego guarda el div retornado
                    //en una variable
                    const comentario=mostrarComentarios(arr[contador].nombre,arr[contador].texto,arr[contador].dia,arr[contador].mes,
                        arr[contador].anio,arr[contador].hora,arr[contador].minutos);
                    //esa variable se agrega como hijo al fragmento
                    fragmento.appendChild(comentario);
                    contador++;//y se aumenta a contador
                    if(i==2){//al terminar de recorrer el for observe se va a encargar de observar
                            //cuando aparesca el ultimo comentarios, si es asi va a ejecutar
                            //cargarMasComentarios
                        observe.observe(comentario);
                    }
                }
            }   
        }else{//si la key del curso NO es la misma que el codigo se sigue buscando en la bd
            cursor.result.continue();
        }
        const pagCom = document.querySelector(".comentarios");
        pagCom.appendChild(fragmento);//cargo el fragmento en la pagina
    });
}
