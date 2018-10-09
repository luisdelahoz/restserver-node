const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const Usuario = require('../models/usuario');
const {verificaToken, verificaAdminRole} = require('../middlewares/autenticacion');
const app = express();

app.get('/usuarios', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario.find({ estado: true }, 'nombre email role estado google')
        .skip(desde)
        .limit(limite)
        .exec((error, usuarios) => {
            if(error) {
                res.status(400).json({
                    ok: false,
                    error: error
                });
            } else {

                Usuario.countDocuments({}, (error, resultado) => {
                    res.json({
                        ok: true,
                        cantidad_registros: usuarios.length,
                        usuarios: usuarios,
                    });
                });

            }
        });
});
  
app.post('/usuarios', [verificaToken, verificaAdminRole], (req, res) => {
    let body = req.body;
    
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((error, usuarioDB) => {
        if(error) {
            res.status(422).json({
                ok: false,
                error: error
            });
        } else {

            res.json({
                usuario: usuarioDB
            })
        }

    });

});

app.put('/usuarios/:id', [verificaToken, verificaAdminRole], (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);
    
    Usuario.findOneAndUpdate(id, body, { new: true, runValidators: true }, (error, usuarioDB) => {
        if(error) {
            res.status(422).json({
                ok: false,
                error: error
            });
        } else {
            res.json({
                ok: true,
                usuario: usuarioDB,
            });
        }
    });
    
});

app.delete('/usuarios', [verificaToken, verificaAdminRole], (req, res) => {
    
    let id = req.body.id;

    Usuario.findOneAndUpdate({ _id: id }, { estado: false }, { new: true }, (error, usuarioDB) => {
        if(error) {
            res.status(422).json({
                ok: false,
                error: error
            });
        } else {
            res.json({
                ok: true,
                usuario: usuarioDB,
            });
        }
    });

});

module.exports = app;
