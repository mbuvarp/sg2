
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
if (!String.prototype.pad) {
    String.prototype.pad = function(width, p) {
        p = p || '0';
        return this.length >= width ? this : new Array(width - this.length + 1).join(p) + this;
    };
}
if (!Number.prototype.pad) {
    Number.prototype.pad = function(width, p) {
        return (this + '').pad(width, p);
    };
}
if (!Date.prototype.getWeekNumber) {
    Date.prototype.getWeekNumber = function() {
        var d = new Date(+this);
        d.setHours(0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        return Math.ceil((((d-new Date(d.getFullYear(), 0, 1)) / 8.64e7 ) + 1) / 7);
    };
}

function norskify(input) {
    return input
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

        .replace(/Jan/g, 'jan')
        .replace(/Feb/g, 'feb')
        .replace(/Mar/g, 'mar')
        .replace(/Apr/g, 'apr')
        .replace(/May/g, 'mai')
        .replace(/Jun/g, 'jun')
        .replace(/Jul/g, 'jul')
        .replace(/Aug/g, 'aug')
        .replace(/Sep/g, 'sep')
        .replace(/Oct/g, 'okt')
        .replace(/Nov/g, 'nov')
        .replace(/Dec/g, 'des')

        .replace(/Monday/g, 'mandag')
        .replace(/Tuesday/g, 'tirsdag')
        .replace(/Wednesday/g, 'onsdag')
        .replace(/Thursday/g, 'torsdag')
        .replace(/Friday/g, 'fredag')
        .replace(/Saturday/g, 'lørdag')
        .replace(/Sunday/g, 'søndag')

        .replace(/Mon/g, 'man')
        .replace(/Tue/g, 'tir')
        .replace(/Wed/g, 'ons')
        .replace(/Thu/g, 'tor')
        .replace(/Fri/g, 'fre')
        .replace(/Sat/g, 'lør')
        .replace(/Sun/g, 'søn');
}

Object.getPrototypeOf(moment()).norsk = function(frmt) {
    return norskify(this.format(frmt));
};

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