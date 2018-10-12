const express = require('express');
const {verificaToken} = require('../middlewares/autenticacion');
const app = express();

let Categoria = require('../models/categoria');

app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((error, categorias) => {
            if(error) {
                res.status(422).json({
                    ok: false,
                    error: error
                })
            } else if(categorias.length === 0) {
                res.status(404).json({
                    ok: false,
                    message: 'No se encontraron categorías registradas'
                });
            } else {
                res.json({
                    ok: true,
                    cantidad: categorias.length,
                    categorias: categorias
                });
            }
        });

});

app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Categoria.findOne({ _id: id }, (error, categoria) => {
        if(error) {
            res.status(422).json({
                ok: false,
                error: error
            })
        } else if(!categoria){
            res.status(404).json({
                ok: false,
                message: 'Categoría no encontrada'
            });
        } else {
            res.json({
                ok: true,
                categoria: categoria
            });
        }

    });

});

app.post('/categoria', verificaToken, (req, res) => {

    let descripcion = req.body.descripcion;
    let usuario = req.usuario._id;

    let categoria = new Categoria({
        descripcion: descripcion,
        usuario: usuario
    });

    categoria.save((error, categoria) => {
        if(error) {
            res.status(422).json({
                ok: false,
                error: error
            })
        } else {
            res.json({
                ok: true,
                categoria: categoria
            });
        }
    });

});

app.put('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let descripcion = req.body.descripcion;

    Categoria.findOneAndUpdate({ _id: id }, { descripcion: descripcion }, { new: true, runValidators: true }, (error, categoria) => {
        if(error) {
            res.status(422).json({
                ok: false,
                error: error
            })
        } else if(!categoria) {
            res.status(404).json({
                ok: false,
                message: 'Categoría no encontrada'
            });
        } else {
            res.json({
                ok: true,
                categoria: categoria
            });
        }
    });

});

app.delete('/categoria/:id', verificaToken, (req, res) => {
    
    let id = req.params.id;

    Categoria.findOneAndDelete({ _id: id }, (error, categoria) => {
        if(error) {
            res.status(422).json({
                ok: false,
                error: error
            })
        } else if(!categoria) {
            res.status(404).json({
                ok: false,
                message: 'Categoría no encontrada'
            });
        } else {
            res.json({
                ok: true,
                categoria: categoria
            });
        }
    });

});

module.exports = app;