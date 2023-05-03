const http = require('http');

const argv = require('yargs')
    .example('node index.js --interval 1 --time 5')
    .demandOption(['interval', 'time'])
    .argv;

const PORT = 3000;

const startServer = (interval, time) => {
    console.log(`Server start on port ${PORT}`);
    http.createServer((req, res) => {
        if(req.url === '/') {
            let intervalId = setInterval(() => {
                console.log(new Date().toUTCString())
            }, interval * 1000);
    
            setTimeout(() => {
                clearInterval(intervalId);
                res.writeHead(200, {'Content-Type': 'text/html'});
                console.log('STOP: ',new Date().toUTCString());
                res.write(new Date().toUTCString());
                res.end();
            }, time * 1000);
        }
    }).listen(PORT);
};

startServer(argv.interval, argv.time);