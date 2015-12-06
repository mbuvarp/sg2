Object.getPrototypeOf(moment()).norsk = function(frmt) {
    return this.format(frmt)
        .replace(/January/g, 'januar')
        .replace(/February/g, 'februar')
        .replace(/March/g, 'mars')
        .replace(/April/g, 'april')
        .replace(/May/g, 'mai')
        .replace(/June/g, 'juni')
        .replace(/July/g, 'juli')
        .replace(/August/g, 'august')
        .replace(/September/g, 'september')
        .replace(/October/g, 'oktober')
        .replace(/November/g, 'november')
        .replace(/December/g, 'desember')
        .replace(/Monday/g, 'mandag')
        .replace(/Tuesday/g, 'tirsdag')
        .replace(/Wednesday/g, 'onsdag')
        .replace(/Thursday/g, 'torsdag')
        .replace(/Friday/g, 'fredag')
        .replace(/Saturday/g, 'lørdag')
        .replace(/Sunday/g, 'søndag');
}

if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) { 
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
            ;
        });
    };
}
if (!String.prototype.capitalize) {
    String.prototype.capitalize = function() {
        return this.substring(0, 1).toUpperCase() + this.substring(1);
    };
}

function parseToken(token) {
    var split = token.split('.')[1];
    token = split.replace('-', '+').replace('_', '/');
    // var obj = {
    //     head: JSON.parse(atob(split[0])),
    //     body: JSON.parse(atob(split[1])),
    //     foot: JSON.parse(atob(split[2]))
    // };
    return JSON.parse(atob(token));
}
function tokenExpire(token) {
    var split = token.split('.')[1];
    var json = JSON.parse(atob(b64));
    return new Date(json.exp * 1000).toString();
}