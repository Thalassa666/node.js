const http = require('http');

function getCurrentDateTime() {
  return new Date().toUTCString();
}

function handleRequest(req, res) {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`Текущая дата и время: ${getCurrentDateTime()}`);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Страница не найдена');
  }
}

const server = http.createServer(handleRequest);

const consoleOutputInterval = process.env.CONSOLE_OUTPUT_INTERVAL || 1000;

const stopConsoleOutputTime = process.env.STOP_CONSOLE_OUTPUT_TIME || 10000;

server.listen(3000, 'localhost', () => {
  console.log('Сервер запущен!');

  const consoleOutputIntervalId = setInterval(() => {
    console.log(`Текущая дата и время (UTC): ${getCurrentDateTime()}`);
  }, consoleOutputInterval);

  setTimeout(() => {
    clearInterval(consoleOutputIntervalId); 
    server.close();
    console.log('Вывод в консоль и сервер завершены.');
  }, stopConsoleOutputTime);
});