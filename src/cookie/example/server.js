const http = require("http");
const fs = require("fs");

http
	.createServer((req, res) => {
		console.log(req.url);
		// res.writeHead(200, { "Content-Type": "text/html" });
		response(req.url, res);
	})
	.listen(8080);

const response = (path, res) => {
	console.log(`path:`, path);
	if (path === "/") {
		path = "/index.html";
	} else if (path === "/favicon.ico") {
		res.end("");
		return;
	}
	res.writeHead(200, {
		"Content-Type": path === "/" ? "text/html" : "application/javascript"
	});
	fs.readFile(`${__dirname}${path}`, "utf-8", (err, data) => {
		if (err) {
			console.log(`err:`, err);
			res.end(err);
			return;
		}
		res.end(data);
	});
};

console.log(`server is running in port 8080`);
