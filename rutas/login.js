var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../configuraciones/config').SEED;
var app = express();

var Usuario = require('../modelos/usuario');

app.post('/' , ( req, res) => {

    var body = req.body;

    Usuario.findOne({correo: body.correo}, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario",
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales incorrectas - correo",
                err: err
            });
        }
        if (!bcrypt.compareSync(body.contrasenia, usuarioDB.contrasenia)) {
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales incorrectas - contraseña",
                err: err
            });
        } 

        //crear token!!
        usuarioDB.contrasenia =':)'
        var token = jwt.sign({ usuario: usuarioDB}, SEED , {expiresIn: 14000 })

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
                 
        });
    })

})





module.exports = app;