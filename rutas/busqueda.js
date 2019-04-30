var express = require('express');
var app = express();

var Hospital = require('../modelos/hospital');
var Medico = require('../modelos/medico');
var Usuario = require('../modelos/usuario');


//======================
//Busuqueda por coleccion
//======================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var promesa;
    var regex = new RegExp(busqueda, 'i');
    switch( tabla ) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
        break;

        case 'medicos':
        promesa = buscarMedicos(busqueda, regex);
         break;

        case 'hospitales':
        promesa = buscarHospitales(busqueda, regex);
        break;


        default:
        res.status(400).json({
            ok: false,
            mensaje: 'los tipos de busqueda solo son usuarios, medicos, hospitales',
            error: {message: 'Tipo de tabla/coleccion no valido'}
        });
    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    })


})






//======================
//Busuqueda General
//======================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;

    var regex = new RegExp(busqueda, 'i');

    Promise.all([
        buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex),

     ])
     .then( respuestas => {
        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
     })
});

function buscarHospitales(busqueda, regex){
    return new Promise((resolve, reject) => {

        Hospital.find({nombre: regex}) 
            .populate('usuario', 'nombre correo')
            .exec((err, hospitales) => {
            if(err) {
                reject('error al cargar hospitales', err);
           }else{
               resolve(hospitales);
           }
         });
    });
}
function buscarMedicos(busqueda, regex){
    return new Promise((resolve, reject) => {

        Medico.find({nombre: regex})
        .populate('usuario', 'nombre correo')
        .populate('hospital')
        .exec((err, medicos) => {
            if(err) {
                reject('error al cargar hospitales', err);
           }else{
               resolve(medicos);
           }
         });
    });
}

function buscarUsuarios(busqueda, regex){
    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre correo role ')
        .or([ {'nombre': regex}, {'correo': regex} ])
        .exec( (err, usuarios) => {

            if(err) {
                reject('error al cargar usuarios', err);
            } else {
                resolve(usuarios);
            }
        })

    });

}


module.exports = app;
