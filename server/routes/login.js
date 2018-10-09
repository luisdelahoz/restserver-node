const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const app = express();

app.post('/login', (req, res) => {

    let body = req.body;
    
    Usuario.findOne({ email: body.email }, (error, usuario) => {
        if(error) {
            res.status(500).json({
                ok: false,
                error: error
            });
        } else if(!usuario) {
            res.status(400).json({
                ok: false,
                error: {
                    message: 'Usuario o contraseña incorrectos'
                }
            });
        } else if(!bcrypt.compareSync(body.password, usuario.password)) {
            res.status(400).json({
                ok: false,
                error: {
                    message: 'Usuario o contraseña incorrectos'
                }
            });
        } else {

            let token = jwt.sign({
                usuario: usuario
            }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

            res.json({
                ok: true,
                usuario: usuario,
                token: token
            });
        }
    });
});

module.exports = app;