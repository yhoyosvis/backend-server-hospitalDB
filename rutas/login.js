var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../configuraciones/config').SEED;

var app = express();

var Usuario = require('../modelos/usuario');

//google
 var CLIENT_ID = require('../configuraciones/config').CLIENT_ID;
 const {OAuth2Client} = require('google-auth-library');
  const client = new OAuth2Client(CLIENT_ID);

//=================================
//autenticacion google
//=================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return{
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,
    }
  }

    app.post('/:google', async (req, res) => {

        var token = req.body.token;
        var googleUser = await verify(token)
            .catch( e => {
                
                return res.status(403).json({
                    ok: false,
                    mensaje: "token no valido"   
                });
            });


        Usuario.findOne({correo: googleUser.email}, (err, usuarioDB)=> {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al buscar usuario",
                    errors: err
                });
            }

            if(usuarioDB){
                if(usuarioDB.google === false) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: "Ya fue logueado con google",
            
                    });
                }else{
                    var token = jwt.sign({ usuario: usuarioDB}, SEED , {expiresIn: 200000 })

                    res.status(200).json({
                        ok: true,
                        usuario: usuarioDB,
                        token: token,
                        id: usuarioDB._id
                             
                    });
                }
            }else{
                //El unsiario no existe hay que crearlo

                var usuario = new Usuario();
                usuario.nombre = googleUser.nombre;
                usuario.correo = googleUser.email;
                usuario.img = googleUser.img;
                usuario.google = true;
                usuario.contrasenia = ":)";

                usuario.save((err, usuarioDB) => {
                    var token = jwt.sign({ usuario: usuarioDB}, SEED , {expiresIn: 200000 })

                    res.status(200).json({
                        ok: true,
                        usuario: usuarioDB,
                        token: token,
                        id: usuarioDB._id
                             
                    });
                })

            }

        });



        // return res.status(200).json({
        //     ok: true,
        //     mensaje: "okk",
        //     googleUser : googleUser
                 
        // });
    });





//=================================
//autenticacion normal
//=================================

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