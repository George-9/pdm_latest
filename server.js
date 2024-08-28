import { Logger } from './debug_tools/Log.js';
import { faviconCallBack } from './routes_callbacks/get/faviconCallBack.js';
import { homeCallBack } from './routes_callbacks/get/homeCallBack.js';
import { app as server } from './server_app/app.js';
import { ServerDetails } from './server_data/server_jug.js';


/**
 * GET REQUESTS
 */
server.get('/', homeCallBack);
server.get('/favicon.ico', faviconCallBack);


/**
 * POST REQUESTS
 */



/**
 * safely the start server
 */
try {
    server.listen(ServerDetails.PORT, function () { Logger.log('server running'); });
} catch (error) { Logger.log(error); }