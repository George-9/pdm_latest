import { Logger } from './debug_tools/Log.js';
import { faviconCallBack } from './routes_callbacks/faviconCallBack.js';
import { requestRegisterParishPageCallback } from './routes_callbacks/admin/post/request_register_parish.js';
import { homeCallBack } from './routes_callbacks/parish/get/homeCallBack.js';
import { parishLogInCallback } from './routes_callbacks/parish/post/log_in.js';
import { app as server } from './server_app/app.js';
import { ServerDetails } from './server_data/server_jug.js';
import { RegisterParish as registerParish } from './routes_callbacks/admin/post/register_parish.js';
import { parishGetCredentials } from './routes_callbacks/parish/post/get_credentials.js';
import { addParishEvent, deleteParishEvent, loadParishEvents } from './routes_callbacks/parish/post/parish_events.js';
import { getAllParishMembers } from './routes_callbacks/parish/post/get_parish_members.js';
import { addMember } from './routes_callbacks/parish/post/add_member.js';
import { addOutstation } from './routes_callbacks/parish/post/add_outstation.js';
import { addSCC } from './routes_callbacks/parish/post/add_scc.js';
import { getOutstations } from './routes_callbacks/parish/post/get_outstations.js';
import { getSmallChristianCommunities } from './routes_callbacks/parish/post/get_sccs.js';
import { getMembersFiltered } from './routes_callbacks/parish/post/get_members_filtered.js';
import { addTitheRecord } from './routes_callbacks/parish/post/record_tithe.js';
import { addOfferingRecord } from './routes_callbacks/parish/post/addOffering.js';
import { updateMemberDetails } from './routes_callbacks/parish/post/update_member.js';

// __________________ADMIN

/**
 * GET
 */
server.get('/rgr/psh', requestRegisterParishPageCallback);

/**
 * POST
*/
server.post('/register/parish', registerParish);


// __________________________________PARISH

/**
 * GET REQUESTS
 */
server.get('/', homeCallBack);
server.get('/favicon.ico', faviconCallBack);


/**
 * POST REQUESTS
 */
server.post('/parish/log/in', parishLogInCallback);
server.post('/parish/details', parishGetCredentials);



// MEMBERS
server.post('/parish/register/member', addMember);
server.post('/parish/update/member/', updateMemberDetails);
server.post('/parish/load/all/members', getAllParishMembers);
server.post('/parish/load/members/filtered', getMembersFiltered);


// OUTSTATIONS, SCCs and GROUPS
server.post('/parish/add/outstation', addOutstation);
server.post('/parish/load/all/outstations', getOutstations);

server.post('/parish/add/scc', addSCC);
server.post('/parish/load/all/sccs', getSmallChristianCommunities);


// TITHE
server.post('/parish/record/tithe', addTitheRecord);

// OFFERING
server.post('/parish/record/offering', addOfferingRecord);



// EVENTS | HOLIDAYS
server.post('/parish/add/event', addParishEvent);
server.post('/parish/events', loadParishEvents);
server.post('/parish/delete/event', deleteParishEvent);

/**
 * safely the start server
 */
try {
    server.listen(ServerDetails.PORT, function () { Logger.log('server running'); });
} catch (error) { Logger.log(error); }