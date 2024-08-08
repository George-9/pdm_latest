const { app } = require("./server/app/app")

const { addOutstation } = require("./server/routes_callbacks/parish/addOutstation");
const { addReminder } = require("./server/routes_callbacks/parish/addReminder");
const { parishOutstationsCount } = require("./server/routes_callbacks/parish/countParishOutstations");
const { deleteEvent } = require("./server/routes_callbacks/parish/deleteEvent");
const { deleteReminder } = require("./server/routes_callbacks/parish/deleteReminder");
const { getEvents } = require("./server/routes_callbacks/parish/getEvents");
const { getOutstations } = require("./server/routes_callbacks/parish/getOutstationsCallback");
const { getOustationSCCs } = require("./server/routes_callbacks/parish/getOutstationSCCs");
const { getReminders } = require("./server/routes_callbacks/parish/getReminders");
const { loadMembers } = require("./server/routes_callbacks/parish/membersCallback");
const { parishData } = require("./server/routes_callbacks/parish/parishData");
const { parishDetails } = require("./server/routes_callbacks/parish/parishDetails");
const { parishLogInCallback } = require("./server/routes_callbacks/parish/parishLogin");
const { parishLogInDetails } = require("./server/routes_callbacks/parish/parishLogInDetails");
const { registerMember } = require("./server/routes_callbacks/parish/registermember");
const { registerParishCallback } = require("./server/routes_callbacks/sys_admin/registerParish");
const { updateMember } = require("./server/routes_callbacks/parish/updateMember");
const { updateParish } = require("./server/routes_callbacks/parish/updateParish");
const { addParishEvent } = require("./server/routes_callbacks/parish/addParishEvent");

const { ServerConstants } = require("./server/ServerConstants")
const { DebugUtils } = require("./server/utils/debug_utils");
const { registeredParishes } = require("./server/routes_callbacks/sys_admin/registeredParishes");
const { updateOutstation } = require("./server/routes_callbacks/parish/updateOutstation");
const { homeCallback } = require("./server/routes_callbacks/parish/homeCallback");
const { uploadMembersCallback } = require("./server/routes_callbacks/parish/uploadMembersCallback");
const { getParishGroups } = require("./server/routes_callbacks/parish/getParishGroups");
const { addGroupToParish } = require("./server/routes_callbacks/parish/addGroupToParish");
const { addParishLeader } = require("./server/routes_callbacks/parish/addParishLeaderCallback");
const { getParishLeaders } = require("./server/routes_callbacks/parish/getParishLeaders");
const { searchGroupMembersByAge } = require("./server/routes_callbacks/parish/searchGroupMembersByAge");
const { addOfferingRecord } = require("./server/routes_callbacks/parish/addOfferingRecord");
const { getAllOfferingRecords } = require("./server/routes_callbacks/parish/getAllOfferingRecords");
const { getAllProjectsRecords } = require("./server/routes_callbacks/parish/getAllProjectsRecords");
const { getAllTitheRecords } = require("./server/routes_callbacks/parish/getAllTitheRecords");
const { searchMember } = require("./server/routes_callbacks/parish/searchMember");
const { addTitheRecord } = require("./server/routes_callbacks/parish/addTitheRecord");

try {
    app.get('/', homeCallback);
    app.post('/parish/login', parishLogInCallback);
    app.post('/parish/login/details', parishLogInDetails);
    app.post('/register/parish', registerParishCallback);
    app.post('/parish/details', parishDetails);
    app.post('/update/parish/details', updateParish);
    app.post('/parish/data', parishData);
    app.post('/upload/members', uploadMembersCallback);
    app.post('/load/members', loadMembers);
    app.post('/register/member', registerMember);
    app.post('/update/member', updateMember);
    app.post('/get/outstations', getOutstations);
    app.post('/add/outstation', addOutstation);
    app.post('/count/parish/outstation/', parishOutstationsCount);
    app.post('/add/event', addParishEvent);
    app.post('/add/reminder', addReminder);
    app.post('/get/events', getEvents);
    app.post('/get/reminders', getReminders);
    app.post('/delete/event', deleteEvent);
    app.post('/delete/reminder', deleteReminder);
    app.post('/get/outstation/sccs', getOustationSCCs);
    app.post('/registered/parishes', registeredParishes);
    app.post('/update/outstation', updateOutstation);
    app.post('/add/parish/group', addGroupToParish);
    app.post('/get/parish/groups', getParishGroups);
    app.post('/add/parish/leader', addParishLeader);
    app.post('/get/parish/leaders', getParishLeaders);
    app.post('/parish/search/group/members/by/age', searchGroupMembersByAge);
    app.post('/parish/add/offering/record', addOfferingRecord);
    app.post('/parish/add/tithe/record', addTitheRecord);
    app.post('/parish/offering/all/records', getAllOfferingRecords);
    app.post('/parish/tithe/all/records', getAllTitheRecords);
    app.post('/parish/projects/all/records', getAllProjectsRecords);
    app.post('/parish/search/member', searchMember);
} catch (error) {
    DebugUtils.PRINT(error);
} finally {
    app.listen(ServerConstants.PORT, () => DebugUtils.PRINT('::server listening::\n::PORT::', ServerConstants.PORT))
}
