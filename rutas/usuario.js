var express = require('express');
var bcrypt = require('bcryptjs');
var app = express();
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var Usuario = require('../modelos/usuario');

//***********************************/
// Obtener todos los usuarios
// *********************************/
app.get('/', (req, res, next) => {
    Usuario.find({}, 'nombre correo img role')
        .exec((err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error cargando usuario",
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                usuarios: usuarios
            });
        })
});



//***********************************/
// actualizar usuario
// *********************************/
app.put('/:id', mdAutenticacion.verificaToken ,(req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) { // if para confirmar que no haya error al momento de hacer la consulta
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario",
                errors: err
            });
        }

        if (!usuario) { // if para determinar si no existe el usuario! 
            return res.status(400).json({
                ok: false,
                mensaje: 'el usuario con el id' + id + 'no existe',
                errors: { message: 'No existe el usuario con el ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.correo = body.correo;
        usuario.role = body.role;


        usuario.save((err, usuarioGuardado) => {
            if (err) { // if para controlar errores al guardar
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar usuario",
                    errors: err
                });
            }
            usuarioGuardado.contrasenia = ':)'
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });

});

//***********************************/
// Crear usuario
// *********************************/
app.post('/',mdAutenticacion.verificaToken ,(req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        correo: body.correo,
        contrasenia: bcrypt.hashSync(body.contrasenia, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear usuario",
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuairioToken: req.usuario
        });
    });
});

//***********************************/
// Eliminar usuario
// *********************************/

app.delete('/:id',mdAutenticacion.verificaToken, (req, res)=> {
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) =>{

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al eliminar usuario",
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: "No existe un usuario con ese ID",
                errors: {message: 'No existe un usuario con ese ID'}
            });
        }
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    })
})

module.exports = app;
