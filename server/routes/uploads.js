const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');
const path = require('path');

// default options
app.use(fileUpload());

app.put('/upload/:tipo/:id', (req, res) => {
    
    let tipo = req.params.tipo;
    let id = req.params.id;
    
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            error: {
                message: 'No se ha seleccionado ningún archivo'
            }
        });
    }

    let tiposValidos = ['productos', 'usuarios'];
    if(tiposValidos.indexOf(tipo) === -1) {
        res.status(400).json({
            ok: false,
            error: {
                message: 'Los tipos permitidos son ' + tiposValidos.join(', ')
            }
        });
    } else {

        let archivo = req.files.archivo;
        let nombreCortado = archivo.name.split('.');
        let extension = nombreCortado[nombreCortado.length - 1];
        
        let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    
        if(extensionesValidas.indexOf(extension) === -1) {
            res.status(400).json({
                ok: false,
                error: {
                    message: 'Las extensiones permitidas son ' + extensionesValidas.join(', ')
                }
            });
        } else {

            let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`

            archivo.mv(`./uploads/${tipo}/${nombreArchivo}`, (error) => {
                if (error) {
                    res.status(500).json({
                        ok: false,
                        error: error
                    });
                } else {
                    if(tipo === 'usuarios') {
                        imagenUsuario(id, res, nombreArchivo);
                    } else if(tipo === 'productos') {
                        imagenProducto(id, res, nombreArchivo);
                    }

                }
            });
    
        }
    }


});

function imagenUsuario(id, res, nombreArchivo) {

    Usuario.findOne({ _id: id }, (error, usuario) => {
        if(error) {
            borrarArchivo(nombreArchivo, 'usuarios');
            res.status(500).json({
                ok: false,
                error: error
            });
        } else if(!usuario) {
            borrarArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'El usuario no existe'
                }
            });
        } else {

            borrarArchivo(usuario.img, 'usuarios');
            
            usuario.img = nombreArchivo;
            usuario.save((error, usuario) => {
                res.json({
                    ok: true,
                    usuario: usuario
                });
            });

        }
    });

}

function imagenProducto(id, res, nombreArchivo) {

    Producto.findOne({ _id: id }, (error, producto) => {
        if(error) {
            borrarArchivo(nombreArchivo, 'productos');
            res.status(500).json({
                ok: false,
                error: error
            });
        } else if(!producto) {
            borrarArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'El producto no existe'
                }
            });
        } else {

            borrarArchivo(producto.img, 'productos');
            
            producto.img = nombreArchivo;
            producto.save((error, producto) => {
                res.json({
                    ok: true,
                    producto: producto
                });
            });

        }
    });

}

function borrarArchivo(nombreImagen, tipo) {
    let pathUrl = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    if(fs.existsSync(pathUrl)) {
        fs.unlinkSync(pathUrl);
    }
}

module.exports = app;