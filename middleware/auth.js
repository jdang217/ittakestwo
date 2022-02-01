const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    var token;
    try {
        token = req.header('x-auth-token').split(' ')[1];
    }
    catch (e) {
        return res.status(401).json({ msg: 'No token sent' })
    }
        
    try {
        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        //add user from payload
        req.user = decoded;

        /*decoded will contain user id in the format:
        {
            id: '12345678abcdefgh12345678',
            username: 'username',
            iat: 1234567890,
            exp: 1234567890
        }
        */
        //console.log(decoded);
        next();
    } catch (e) {
        res.status(400)
        //res.status(400).json({ msg: 'Token is not valid' })
        next();
    }
}

module.exports = auth;