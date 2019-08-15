const express = require('express');
const app = express();
var portscanner = require('portscanner');

const proxy = require('http-proxy-middleware');

// Config
const { routes } = require('./config.json');

//Load Balancer Port
const portFinal = new Promise(resolve => {
    portscanner.findAPortNotInUse([5000, 5001, 5002, 5003], 'localhost').then(portScan => {
        resolve(portScan);
    });
});
    
portFinal.then(ports => {
    var lastPort = ports - 5000;

    //Middleware Proxy Forward
    for (route of routes) {
        app.use(route.route,
            proxy({
                target: route.address,
                pathRewrite: (path, req) => {
                    return path.split('/').slice(2).join('/'); // Could use replace, but take care of the leading '/'
                }
            }));
    }

    app.listen(ports, () => {
        console.log('Proxy listening on port', ports);
    })
});

