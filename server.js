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
import { updateMemberDetails } from './routes_callbacks/parish/post/update_member.js';
import { loadAllOfferingRecords } from './routes_callbacks/parish/post/get_all_offering_records.js';
import { loadAllTitheRecords } from './routes_callbacks/parish/post/get_tithe_records.js';
import { addContributionToProjectRecord, addProjectRecord, loadParishProjectRecords } from './routes_callbacks/parish/post/parish_projects.js';
import { addOfferingRecord } from './routes_callbacks/parish/post/add_offering.js';
import { addDonationRecord, loadAllDonationsRecords } from './routes_callbacks/parish/post/donations.js';
import { addParishStaff, loadAllParishStaff } from './routes_callbacks/parish/post/staff.js';
import { addGroups, getParishGroups } from './routes_callbacks/parish/post/groups.js';
import { uploadMembers } from './routes_callbacks/parish/post/upload_members.js';
import { addVolume as addMembersVolume, getVolumes as getMembersVolumes } from './routes_callbacks/parish/post/members_volumes.js';

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
server.post('/parish/upload/members', uploadMembers);
server.post('/parish/load/members/filtered', getMembersFiltered);

// MEMBERS' VOLUMES
server.post('/parish/add/members/volume', addMembersVolume);
server.post('/parish/load/all/members/volumes', getMembersVolumes);


// STAFF
server.post('/parish/register/staff', addParishStaff);
server.post('/parish/load/all/staff', loadAllParishStaff);

// OUTSTATIONS, SCCs and GROUPS
server.post('/parish/add/outstation', addOutstation);
server.post('/parish/load/all/outstations', getOutstations);

server.post('/parish/register/group', addGroups);
server.post('/parish/load/all/groups/records', getParishGroups);

server.post('/parish/add/scc', addSCC);
server.post('/parish/load/all/sccs', getSmallChristianCommunities);


// TITHE
server.post('/parish/record/tithe', addTitheRecord);
server.post('/parish/load/all/tithe/records', loadAllTitheRecords);


// OFFERING
server.post('/parish/record/offering', addOfferingRecord);
server.post('/parish/load/all/offering/records', loadAllOfferingRecords);

// EVENTS | HOLIDAYS
server.post('/parish/add/event', addParishEvent);
server.post('/parish/events', loadParishEvents);
server.post('/parish/delete/event', deleteParishEvent);

// PROJECTS
server.post('/parish/add/project/record', addProjectRecord);
server.post('/parish/load/all/projects/records', loadParishProjectRecords);
server.post('/parish/add/project/contribution', addContributionToProjectRecord);

// DONATIONS
server.post('/parish/add/donation/record', addDonationRecord);
server.post('/parish/load/all/donations/records', loadAllDonationsRecords);

/**
 * safely the start server
 */
try {
    server.listen(ServerDetails.PORT, function () { Logger.log('server running'); });
} catch (error) { Logger.log(error); }