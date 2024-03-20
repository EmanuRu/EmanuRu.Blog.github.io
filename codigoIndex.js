"use strict";
//usar livereload para que funcione el fetch

/*
  " const publicaciones" almacena el div donde se va a
  colocar el contenido de la pagina
*/ 
const publicaciones = document.querySelector(".publicacion"); 

let contador = 0;//"contador" y seAcabo son banderas que serviran para mostrar el contenido  
                //de la pagina
let seAcabo =0;

//esta funcion crea los elementos que van a componer la pagina la cual esta formada por "publicaciones"
//el nombre del usuario, el contenido y un boton para ver las respuesta
function crearPublicaciones(nombre,posteo,codigo) {
    const container = document.createElement("DIV");
    const usuario = document.createElement("H3");
    const contenido = document.createElement("P");
    const btnVerComent = document.createElement("button"); 

    container.classList.add("publicacion");
    btnVerComent.classList.add("verCom");
    btnVerComent.textContent="Ver comentarios";


    btnVerComent.addEventListener("click",()=>{
        sessionStorage.setItem("nombre",nombre)
        sessionStorage.setItem("posteo",posteo);
        sessionStorage.setItem("codigo",codigo);


        window.open("comentarios/comentarios.html");
        window.close(this);
    });

    usuario.textContent=nombre;
    contenido.textContent=posteo;

    container.appendChild(usuario);
    container.appendChild(contenido);
    container.appendChild(btnVerComent);

    return container;
}

const IDBRrquest = indexedDB.open("comentarios",1);//creo o abro la base de datos.
//La base de datos va a constar de un solo almacen de objetos
//en el cual cada key va a representar una posteo en la pagina
//como key el objeto va a tener un codigo el cual esta dentro del archivo
//info.txt. Como valor cada key va a contar con un arreglo de objetos
// key = codigo : valor = [{nombre:"nn",texto:"lorem"}]
//tambien se puede ver de la siguente forma:
//  key:[{nombre:"nn",texto:"lorem"},{nombre:"nn2",texto:"lorem2"}]

IDBRrquest.addEventListener("success",()=>{//cuando se carga la pagina, si la conexion fue exitos, se muestran 4 post
    cargarPublicaciones(4);
});

function crearTablaComentarios() {
    IDBRrquest.addEventListener("upgradeneeded",()=>{
        const db = IDBRrquest.result;
        db.createObjectStore("posteos",{
            autoIncrement:false
        });
    });   
}

//creo el objectStore "posteo"
crearTablaComentarios();


//creo los objetos que tendra el objectStore ej: 
//key:[{nombre:"usuario1",texto:"lorem1"},{nombre:"usuario2",texto:"lorem2"}]
async function crearRespuestas(codigo) {
    const db = await IDBRrquest.result;
    const a=[];
    const IDBTransaction = db.transaction("posteos","readwrite");
    const objetStore = IDBTransaction.objectStore("posteos");
    objetStore.add(a,codigo)
}


//esta funcion se va a encargar de que cuando aparesca la ultima "publicacion"
//de la pagina se llame a la funcion que hace que las publicaciones se muesten
//indicandole que se van a mostrar 4 publicaciones
function cargarNuevasPublis(entry) {
    if (entry[0].isIntersecting) {
        cargarPublicaciones(4);
    }
}

//el IntersectionObserver que se va a encargar de ver si es la ultima "publicacion"
const observer = new IntersectionObserver(cargarNuevasPublis);


//esta funcion se encarga de mostrar las publicaciones
async function cargarPublicaciones(num) {
    //la publicaciones estan en un archivo de texto, asi que las llamo usando un fetch
    const peticion = await fetch("publicaciones/publicaciones.txt");
    //a lo que obtive lo combier a json
    const contenido = await peticion.json();
    //al objeto json lo guardo dentro de arr
    const arr = contenido.content;
    
    for (const dato of arr) {
        //los "codigos" que estaban dentro del archivo pagina.txt los uso para 
        //crear las key dentro del objectStore "publicaciones"
       crearRespuestas(dato.codigo) 
    }
    const fragmento = document.createDocumentFragment();

    //las publicaciones se van a mostrar de 4 en 4 
    //en vez de usar la "i" del for uso a contador para mostrar lo que hay 
    //dentro de arr si uso i simpre voy a mostrar del 0 al 4
    //con contador puede ir de 4 a 8 etc
    for (let i = 0; i < num; i++) {
        if(arr[contador]!=undefined){
            //todos los elementos creados por la funcion crearPublicacion son almacenados en una
            //variable, y les agrego el nombre del usuario y su publbicacion
            const nuevaPublicacion = crearPublicaciones(arr[contador].nombre,arr[contador].contenido,arr[contador].codigo);
            fragmento.appendChild(nuevaPublicacion);//cada publicacion es guardada en el fragmento
            contador++;//aumento el contado
            if (i==num-1) {//cuando se acaba el for, el observer cuando se mustre la ultima
                //publicacion en la pantalla va a ejecutar la funcion cargarNuevasPublis
                observer.observe(nuevaPublicacion);
            }
            seAcabo=1;
        }else{
            if(seAcabo==1){//si esto se cumple se crea el que dira "No hay mas publicaciones" al final
                let fin = document.createElement("div");
                fin.classList.add("final");
                let texto = document.createElement("h3");
                texto.textContent="No hay mas publicaciones";
                fin.appendChild(texto);
                fragmento.appendChild(fin);
                seAcabo=0;
            }
        }
    }

    //el contenido del fragmento se agrega a la pagina
    publicaciones.appendChild(fragmento);
}
