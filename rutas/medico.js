var express = require('express');
var app = express();


var mdAutenticacion = require('../middlewares/autenticacion');

var Medico = require('../modelos/medico')

//***********************************/
// Obtener todos los medicos
// *********************************/
app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre correo')
    .populate('hospital')
        .exec((err, medicos) => {
            if(err) {
                return res.status(500).json ({
                    ok: false,
                    mensaje: " Error cargando medicos",
                    errors: err
                });
            }

           Medico.count({}, (err, conteo) => {

                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });
            });
        });
});
//***********************************/
// actualizar medicos
// *********************************/
app.put('/:id', mdAutenticacion.verificaToken ,(req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) { // if para confirmar que no haya error al momento de hacer la consulta
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar medico",
                errors: err
            });
        }

        if (!medico) { // if para determinar si no existe el usuario! 
            return res.status(400).json({
                ok: false,
                mensaje: 'el medico con el id' + id + 'no existe',
                errors: { message: 'No existe el medico con el ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;


        medico.save((err, medicoGuardado) => {
            if (err) { // if para controlar errores al guardar
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar medico",
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });

});
//***********************************/
// Crear medico
// *********************************/
app.post('/',mdAutenticacion.verificaToken, (req, res) => {
   
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {   
        if(err){
            return res.status(400).json({
                ok: false,
                mensaje: " Erro al crear medico",
                errors: err,
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            
        });
    });
}); 

//***********************************/
// Eliminar Hospital
// *********************************/

app.delete('/:id',mdAutenticacion.verificaToken, (req, res)=> {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) =>{

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al eliminar medico",
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: "No existe un medico con ese ID",
                errors: {message: 'No existe un medico con ese ID'}
            });
        }
        res.status(200).json({
            ok: true,
            usuario: medicoBorrado
        });

    });
});


module.exports = app;