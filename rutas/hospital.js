var express = require('express');
var app = express();


var mdAutenticacion = require('../middlewares/autenticacion');

var Hospital = require('../modelos/hospital')

//***********************************/
// Obtener todos los hospitales
// *********************************/
app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre correo')
        .exec((err, hospitales) => {
            if(err) {
                return res.status(500).json ({
                    ok: false,
                    mensaje: " Error cagando hospitales",
                    errors: err
                });
            }
          Hospital.count({}, (err, conteo) => {

                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: conteo
                });
            });
        });
});
//***********************************/
// actualizar hospital
// *********************************/
app.put('/:id', mdAutenticacion.verificaToken ,(req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) { // if para confirmar que no haya error al momento de hacer la consulta
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar hospital",
                errors: err
            });
        }

        if (!hospital) { // if para determinar si no existe el usuario! 
            return res.status(400).json({
                ok: false,
                mensaje: 'el hospital con el id' + id + 'no existe',
                errors: { message: 'No existe el hospital con el ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id


        hospital.save((err, hospitalGuardado) => {
            if (err) { // if para controlar errores al guardar
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar usuario",
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });

});
//***********************************/
// Crear hospital
// *********************************/
app.post('/',mdAutenticacion.verificaToken, (req, res) => {
   
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {   
        if(err){
            return res.status(400).json({
                ok: false,
                mensaje: " Erro  al crear hospital",
                errors: err,
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
             
        });
    });
}); 

//***********************************/
// Eliminar Hospital
// *********************************/

app.delete('/:id',mdAutenticacion.verificaToken, (req, res)=> {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) =>{

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al eliminar hospital",
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: "No existe un hospital con ese ID",
                errors: {message: 'No existe un hospital con ese ID'}
            });
        }
        res.status(200).json({
            ok: true,
            usuario: hospitalBorrado
        });

    });
});



module.exports = app;