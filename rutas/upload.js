var express = require('express');
var fileUpload = require('express-fileupload');
var app = express();
var fs = require('fs');

app.use(fileUpload());


var Hospital = require('../modelos/hospital');
var Medico = require('../modelos/medico');
var Usuario = require('../modelos/usuario');

//===========================
//Subiendo imagenes
//===========================

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;


    //tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: "Tipo de coleccion no es valida",
            errors: { message: 'Tipo de coleccion no es valida' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: "No selecciono nada",
            errors: { message: 'Debe de seleccionar una imagen' }
        });

    }

    //obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    //solo estas extensiones aceptamos
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: "Extension de img no valida",
            errors: { message: ' Las extenciones validas son ' + extensionesValidas.join(', ') }
        });
    }
    // nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;



    //mover el archivo del temporal al path
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al mover archivo",
                errors: err
            });
        }
        subirPorTipo(tipo, id, nombreArchivo, res);


    })

});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }
            var pathViejo = './uploads/usuarios/' + usuario.img;

            //si existe elimina la img anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: "Imagen de usuario actualizada",
                    usuario: usuarioActualizado
                });
            });
        });
    }

    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }
            var pathViejo = './uploads/medicos/' + medico.img;

            //si existe elimina la img anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: "Imagen de medico actualizada",
                    medico: medicoActualizado
                });
            });
        });
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Hospital no existe',
                    errors: { message: 'Hospital no existe' }
                });
            }
            var pathViejo = './uploads/hospitales/' + hospital.img;

            //si existe elimina la img anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: "Imagen de hospital actualizada",
                    hospital: hospitalActualizado
                });
            });
        });
    }
}

module.exports = app;
