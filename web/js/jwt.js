var njwt = require('njwt');

// Constants
const ALGORITHM = 'HS256';
const SECRET = 'whatislove';

function createClaims(sub, role) {
    return {
        sub: sub,
        role: role
    };
}
function createToken(claims) {
    return njwt.create(claims, SECRET);
}

exports.token = function(sub, role, loose) {
    if (loose === undefined)
        var loose = false;

    var token = createToken(createClaims(sub, role));
    return loose ? token : token.compact();
}
exports.verify = function(token, success, error) {
    var self = this;
    njwt.verify(token, SECRET, function(err, token) {
        if (err)
            error(err);
        else {
            var newToken = self.token(token.body.sub, token.body.role);
            success(newToken);
        }
    });;
}