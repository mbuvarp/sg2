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
        .replace(/December/g, 'desember');
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