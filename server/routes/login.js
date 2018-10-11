const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const app = express();

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

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

async function verify(token) {

    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };

}

app.post('/google', async(req, res) => { 

    let token = req.body.idtoken;
    
    let googleUser = await verify(token)
                        .catch((error) => {
                            return res.status(403).json({
                                ok: false,
                                error: error
                            });
                        });
    
    Usuario.findOne({ email: googleUser.email }, (error, usuario) => {
        if(error) {
            return res.status(500).json({
                ok: false,
                error: error
            });
        } else if(usuario) {
            if(!usuario.google) {
                return res.status(500).json({
                    ok: false,
                    error: {
                        message: 'Debe usar su autenticación normal'
                    }
                });
            } else {
                let token = jwt.sign({
                    usuario: usuario
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
                
                return res.json({
                    ok: true,
                    usuario: usuario,
                    token: token
                });
            }
        } else {
            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.google = googleUser.google;
            usuario.password = ':)';

            usuario.save((error, usuario) => {
                if(error) {
                    return res.status(500).json({
                        ok: false,
                        error: error
                    });
                } else {
                    let token = jwt.sign({
                        usuario: usuario
                    }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
                    
                    return res.json({
                        ok: true,
                        usuario: usuario,
                        token: token
                    });
                }
            });
        }
    });
});

module.exports = app;