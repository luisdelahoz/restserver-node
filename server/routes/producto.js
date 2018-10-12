const express = require('express');
const {verificaToken} = require('../middlewares/autenticacion');
const app = express();

let Producto = require('../models/producto');

app.get('/productos', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({ disponible: true })
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .skip(desde)
        .limit(limite)
        .exec((error, productos) => {
            if(error) {
                res.status(422).json({
                    ok: false,
                    error: error
                })
            } else if(productos.length === 0) {
                res.status(404).json({
                    ok: false,
                    message: 'No se encontraron productos registrados'
                });
            } else {
                res.json({
                    ok: true,
                    cantidad: productos.length,
                    productos: productos
                });
            }
        });

});

app.get('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Producto.findOne({ _id: id })
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((error, producto) => {
            if(error) {
                res.status(422).json({
                    ok: false,
                    error: error
                })
            } else if(!producto){
                res.status(404).json({
                    ok: false,
                    message: 'Producto no encontrada'
                });
            } else {
                res.json({
                    ok: true,
                    producto: producto
                });
            }

        });

});

app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((error, productos) => {
            if(error) {
                res.status(500).json({
                    ok: false,
                    error: error
                })
            } else if(productos.length === 0) {
                res.status(404).json({
                    ok: false,
                    message: 'Productos no encontrados'
                });
            } else {    
                res.json({
                    ok: true,
                    cantidad: productos.length,
                    productos: productos
                });
            }
        });
});

app.post('/productos', verificaToken, (req, res) => {

    let body = req.body;
    let usuario = req.usuario._id;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: usuario
    });

    producto.save((error, producto) => {
        if(error) {
            res.status(422).json({
                ok: false,
                error: error
            })
        } else {
            res.json({
                ok: true,
                producto: producto
            });
        }
    });

});

app.put('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    let datos = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria
    };

    Producto.findOneAndUpdate({ _id: id }, datos, { new: true, runValidators: true }, (error, producto) => {
        if(error) {
            res.status(422).json({
                ok: false,
                error: error
            })
        } else if(!producto) {
            res.status(404).json({
                ok: false,
                message: 'Producto no encontrado'
            });
        } else {
            res.json({
                ok: true,
                producto: producto
            });
        }
    });

});

app.delete('/productos/:id', verificaToken, (req, res) => {
    
    let id = req.params.id;

    Producto.findOneAndUpdate({ _id: id }, { disponible: false }, (error, producto) => {
        if(error) {
            res.status(422).json({
                ok: false,
                error: error
            })
        } else if(!producto) {
            res.status(404).json({
                ok: false,
                message: 'Producto no encontrado'
            });
        } else {
            res.json({
                ok: true,
                producto: producto
            });
        }
    });

});

module.exports = app;