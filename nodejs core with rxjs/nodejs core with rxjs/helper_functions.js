// this is the function that will handle all addresses
function recursiveHandler(items, iterator, callback) {
    var counter = 0;
    function report() {
        counter++;
        if (counter === items.length)
            callback();
    }
    for (var i = 0; i < items.length; i++) {
        iterator(items[i], report)
    }
}

export { recursiveHandler };