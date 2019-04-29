// Requeridos
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');



//inicializar variables
var app = express();


//Body-parser
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json());

//rutas importadas
var appRutas = require('./rutas/app');
var usuarioRutas = require('./rutas/usuario');
var loginRutas = require('./rutas/login');





//Conewxion a la bd
mongoose.connect('mongodb://localhost:27017/hospitalDB', (err, res) =>{
    if(err) throw err;
    console.log('Base de datos: \x1b[32%m%s\x1b[0m','en linea');

})


//rutas
app.use('/usuario', usuarioRutas);
app.use('/login',loginRutas);
app.use('/', appRutas);


//escuchar peticiones
app.listen(3000, ()=> {
    console.log('Express server puerto 3000: \x1b[32%m%s\x1b[0m','en linea');
    
})