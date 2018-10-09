const jwt = require('jsonwebtoken');

let verificaToken = (req, res, next) => {

    let token = req.get('Authorization');
    jwt.verify(token, process.env.SEED, (error, decoded) => {
        
        if(error) {
            res.status(401).json({
                ok: false,
                error: {
                    message: 'Token no válido'
                }
            });
        } else {
            req.usuario = decoded.usuario;
            next();
        }

    });
};

let verificaAdminRole = (req, res, next) => {

    let usuario = req.usuario;

    if(usuario.role !== 'ADMIN_ROLE') {
        res.status(401).json({
            ok: false,
            error: {
                message: 'No posee los permisos necesarios para realizar dicha acción'
            }
        });
    } else {
        next();
    }

};

module.exports = {
    verificaToken,
    verificaAdminRole
};