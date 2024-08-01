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
} catch (error) {
    DebugUtils.PRINT(error);
} finally {
    app.listen(ServerConstants.PORT, () => DebugUtils.PRINT('::server listening::\n::PORT::', ServerConstants.PORT))
}
