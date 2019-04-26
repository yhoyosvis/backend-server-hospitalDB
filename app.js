// Requeridos
var express = require('express');
var mongoose = require('mongoose');


//inicializar variables
var app = express();


//Conewxion a la bd
mongoose.connect('mongodb://localhost:27017/hospitalDB', (err, res) =>{
    if(err) throw err;
    console.log('Base de datos: \x1b[32%m%s\x1b[0m','en linea');

})


//rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: "Peticion realizada correctamente"
    })
})


//escuchar peticiones
app.listen(3000, ()=> {
    console.log('Express server puerto 3000: \x1b[32%m%s\x1b[0m','en linea');
    
})