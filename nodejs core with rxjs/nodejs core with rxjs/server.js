// Asignement with core nodejs code
import * as http from 'http';
import * as url from 'url';
import * as cheerio from 'cheerio';
import { recursiveHandler } from './helper_functions';

// Server Configuration
let PORT = process.env.PORT || 3000;
let acceptedPaths = [
    "/I/want/title/",
    "/I/want/title"
]

// Request handler
const requestHandler = async (req, res) => {
    let urlData = url.parse(req.url, true);

    // return 404 (Not Found) error if 
    //     required path is not targeted i.e /I/want/title
    if (acceptedPaths.indexOf(urlData.pathname) < 0) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        return res.end('Invalid Endpoint URL. Please try with "/I/want/title/"');
    }

    // return 400 (Bad Request) error if 
    //     required parameter is not passed i.e address
    if (!urlData.query.address) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        return res.end('"address" parameter is required. Example: /I/want/title/?address=https://www.google.com');
    }

    let addresses = typeof urlData.query.address == 'string' ? [urlData.query.address] : urlData.query.address;
    let processedAddreses = '';

    // get title of each address
    recursiveHandler(addresses, function (singleAddres, innerCallback) {
        let thisPath = url.parse(singleAddres, true)

        // return error if not valid url
        if (!thisPath.host) {
            processedAddreses += `<li>${singleAddres}  - NO RESPONSE </li>`;
            return innerCallback();
        }
        http.get({ host: thisPath.host, path: thisPath.pathname + thisPath.search }, (response) => {
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });
            response.on('end', () => {
                const $ = cheerio.load(data);
                processedAddreses += `<li>${singleAddres}  - "${$("title").text()}" </li>`;
                return innerCallback();
            });

        }).on("error", (err) => {
            processedAddreses += `<li>${singleAddres}  - NO RESPONSE </li>`;
            return innerCallback();
        })
    }, function () {
        // prepare html and render on front
        let htmlToBeRendered = `<html>
                                    <head></head>
                                    <body>
                                        <h1> Following are the titles of given websites: </h1>
                                        <ul>
                                            ${processedAddreses}
                                        </ul>
                                    </body>
                                </html>`;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(htmlToBeRendered);
    });
}

// creating server object
const server = http.createServer(requestHandler);

// specifying the port, on which server need to listen
server.listen(PORT, () => {
    console.log(`Server started listening on port: ${PORT}`)
});