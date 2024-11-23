var http = require('http');

http.createServer(function (req, res) {
  res.write("I'mk alive");
  res.end();
}).listen(8080);
