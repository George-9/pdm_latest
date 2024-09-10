import { ModalExpertise } from "./components/actions/modal.js";
import { MessegePopup } from "./components/actions/pop_up.js";
import { Button, Column, MondoBigH3Text, MondoText, Row, TextEdit, VerticalScrollView } from "./components/UI/cool_tool_ui.js";
import { TextEditError, TextEditValueValidator } from "./components/utils/textedit_value_validator.js";
import { promptAddDonationsView, showDonationsForUnrecognizedMembersReportsView, showDonationsWithOutstaionsReportsView } from "./components/view_callbacks/donations.js";
import { promptAddGroupView, showGroupsOverview } from "./components/view_callbacks/group.js";
import { showMembersReportsView as ShowMembersReportsView, promptRegiterMember, showMemberEditView, showMembersByGroupView, showMembersByOutstationReportsView } from "./components/view_callbacks/member.js";
import { promptAddOffering, showOfferingReportsByDateAndTypeOutsationView, showOfferingReportView } from "./components/view_callbacks/offering.js";
import { promptAddOutstationView, viewOutstationsPage } from "./components/view_callbacks/outstation.js";
import { showParishEventsView } from "./components/view_callbacks/parish_events.js";
import { promptAddStaffToParish as promptAddParishStaff, ViewAllParishStaff, ViewParishStaffByOutsation } from "./components/view_callbacks/parish_staff.js";
import { promptAddProject, showProjectReportView } from "./components/view_callbacks/projects.js";
import { promptLogIn } from "./components/view_callbacks/prompt_login.js";
import { promptAddSCCView, showFilterebleSCCsPage, viewSCCsPage } from "./components/view_callbacks/scc.js";
import { promptAddTitheView, showTitheReportsView } from "./components/view_callbacks/tithe.js";
import { ParishDataHandle } from "./data_pen/parish_data_handle.js";
import { getParishDonationsRecords, getParishGroupsRecords, getParishMembers, getParishOfferingsRecords, getParishOutstations, getParishProjectsRecords, getParishSCCs, getParishStaff, getParishTitheRecords, parishEvents } from "./data_source/main.js";
import { PRIESTS_COMMUNITY_NAME } from "./data_source/other_sources.js";
import { domCreate, domQuery, domQueryById } from "./dom/query.js";
import { clearTextEdits } from "./dom/text_edit_utils.js";
import { work } from "./dom/worker.js";
import { Post } from "./net_tools.js";
import { DrawerMenu, Menu, populateDrawer, SubMenu } from "./populate_drawer.js";
import { LocalStorageContract } from "./storage/LocalStorageContract.js";

export const marginRuleStyles = [{ 'margin-top': '20px' }];
work(Main);

const registryClass = 'registry',
    reportsClass = 'reports',
    overView = 'overview',
    dataEntry = 'data-entry',
    admin = 'admin';

const drawerMenus = [
    new DrawerMenu('ADMIN',
        admin,
        [
            new Menu('HISTORY', 'bi-trash', admin),
            new Menu('EVENTS', 'bi-calendar', admin, showParishEventsView),
        ],
        false
    ),
    new DrawerMenu(
        'REGISTRY',
        registryClass,
        [
            new Menu('members', 'bi-people', registryClass, promptRegiterMember),
            new Menu('Staff', 'bi-file-earmark-person', registryClass, promptAddParishStaff),
            new Menu('Outstation', 'bi-opencollective', registryClass, promptAddOutstationView),
            new Menu('SCC', 'bi-collection', registryClass, promptAddSCCView),
            new Menu('Group', 'bi-plus-circle', registryClass, promptAddGroupView),
        ],
        false
    ),
    new DrawerMenu('FINANCE ENTRY',
        dataEntry,
        [
            new Menu('Offering', 'bi-cash', dataEntry, promptAddOffering),
            new Menu('Tithe', 'bi-gift', dataEntry, promptAddTitheView),
            new Menu('projects', 'bi-building-add', dataEntry, promptAddProject),
            new Menu('donations', 'bi-heart', dataEntry, promptAddDonationsView),
        ],
        false
    ),
    new DrawerMenu(
        'REPORTS',
        reportsClass,
        [
            new Menu('tithe', 'bi-cash-coin', reportsClass, showTitheReportsView),
            new Menu('offering', 'bi-cash-coin', reportsClass, showOfferingReportView,
                [
                    new SubMenu('advanced search', reportsClass, showOfferingReportsByDateAndTypeOutsationView)
                ],
            ),
            new Menu('projects', 'bi-building-add', reportsClass, showProjectReportView),
            new Menu('SCCs (grouped)', 'bi-people', reportsClass, showFilterebleSCCsPage),
            new Menu('donations', 'bi-heart', reportsClass,
                showDonationsWithOutstaionsReportsView,
                [
                    new SubMenu('from outside', reportsClass, showDonationsForUnrecognizedMembersReportsView)
                ]
            ),
        ],
        false
    ),
    new DrawerMenu('OVERVIEW', overView,
        [
            new Menu('members', 'bi-people', overView, showMembersByOutstationReportsView,
                [
                    new SubMenu('by SCC', overView, ShowMembersReportsView),
                    new SubMenu('by groups', overView, showMembersByGroupView),
                ]
            ),
            new Menu('Staff', 'bi-people', overView, ViewAllParishStaff,
                [
                    new SubMenu('by outstation', overView, ViewParishStaffByOutsation)
                ]
            ),
            new Menu('Outstations', 'bi-collection', overView, viewOutstationsPage),
            new Menu('SCCs', 'bi-justify-right', overView, viewSCCsPage),
            new Menu('groups', 'bi-circle', overView, showGroupsOverview),
            new Menu('members(edits)', 'bi-person-edit', overView, showMemberEditView),
        ],
        false
    )
]

async function Main() {
    if (LocalStorageContract.parishNotLoggedIn()) {
        promptLogIn();
    } else {
        const drawer = domQuery('.drawer-container');

        ParishDataHandle.parishMembers.push(...(await getParishMembers()))
        ParishDataHandle.parishOutstations.push(...(await getParishOutstations()));
        ParishDataHandle.parishSCCs.push(...(await getParishSCCs()));
        ParishDataHandle.parishGroups.push(...(await getParishGroupsRecords()));
        ParishDataHandle.parishOfferingRecords.push(...(await getParishOfferingsRecords()));
        ParishDataHandle.parishTitheRecords.push(...(await getParishTitheRecords()));
        ParishDataHandle.parishProjectsRecords.push(...(await getParishProjectsRecords()));
        ParishDataHandle.parishDonationRecords.push(...(await getParishDonationsRecords()));
        ParishDataHandle.parishStaff.push(...(await getParishStaff()));

        ParishDataHandle.parishSCCs.push({
            '_id': PRIESTS_COMMUNITY_NAME,
            'name': PRIESTS_COMMUNITY_NAME
        });

        populateDrawer(drawer, drawerMenus);
        showParishName();
        setCalendar();
        showEventsCount();


        setAnchors();
        // setProfileView();

        work(populateDrawer);
    }
}

function showProfileView() {
    let logOutView = Row({
        'styles': [
            { 'width': 'match-parent' },
        ],
        'classlist': ['f-w', 'a-c', 'txt-c', 'bi', 'c-p', 'just-end'],
        'children': [
            MondoText({
                'styles': [{ 'color': 'red' }],
                'text': 'Log Out',
            })
        ]
    })

    logOutView.onclick = LogOut;
    function LogOut() {
        localStorage.clear();
        window.location.reload()
    }

    const emailAnchor = domCreate('a');
    emailAnchor.innerText = `${LocalStorageContract.parishEmail()} MEMBERS`.toUpperCase();
    emailAnchor.href = `mailto:${LocalStorageContract.parishEmail()}`;

    const column = Column({
        'styles': [
            { 'min-width': '60%' },
            { 'padding': '10px' },
        ],
        'classlist': ['f-w', 'a-c', 'just-center'],
        'children': [
            MondoText({ 'text': `${ParishDataHandle.parishOutstations.length} OUTSTATIONS`.toUpperCase() }),
            MondoText({ 'text': `${ParishDataHandle.parishMembers.length} MEMBERS`.toUpperCase() }),
            emailAnchor
        ]
    });

    ModalExpertise.showModal({
        'actionHeading': `${LocalStorageContract.completeParishName()} PARISH`.toUpperCase(),
        'topRowUserActions': [logOutView],
        'children': [column]
    });
}

async function setCalendar() {
    var calendarEl = domQueryById('calendar');

    let savedParishEvents = await parishEvents();
    ParishDataHandle.allParishEvents.push(...savedParishEvents);

    var calendar = new FullCalendar.Calendar(calendarEl, {
        headerToolbar: {
            left: '',
            center: 'title',
            right: ''
        },
        footerToolbar: false,
        events: ParishDataHandle.allParishEvents.map(function (ev) {
            ev['id'] = ev['_id'];
            return ev;
        }),
        dateClick: function (info) { handleDateClick(calendar, info) },
        eventClick: handleEventClick
    });

    calendar.render();

    document.getElementById('prev-button').addEventListener('click', function () {
        calendar.prev();
    });

    document.getElementById('next-button').addEventListener('click', function () {
        calendar.next();
    });

    document.getElementById('today-button').addEventListener('click', function () {
        calendar.today();
    });

    document.getElementById('month-view').addEventListener('click', function () {
        calendar.changeView('dayGridMonth');
    });

    document.getElementById('week-view').addEventListener('click', function () {
        calendar.changeView('timeGridWeek');
    });

    document.getElementById('day-view').addEventListener('click', function () {
        calendar.changeView('timeGridDay');
    });
}

function handleDateClick(calendar, info) {
    if (new Date(info.dateStr) < new Date(Date.UTC()) + 1) {
        return;
    }
    let date = info.dateStr;
    //  let delete = await Post('/parish/delete/event',{

    // })

    var titleInput = TextEdit({ 'placeholder': 'enter reminder title' });
    var descInput = TextEdit({ 'placeholder': 'enter reminder description' });
    var button = Button({
        'styles': [],
        'classlist': [],
        'text': 'save',
        'onclick': async function (ev) {
            try {
                TextEditValueValidator.validate('event title', titleInput);
                TextEditValueValidator.validate('event details', descInput);

                const eventAsBody = {
                    'start': date,
                    'title': titleInput.value,
                    'description': descInput.value
                }

                let result = await Post(
                    '/parish/add/event',
                    { event: eventAsBody },
                    { 'requiresParishDetails': true }
                );
                const msg = result['response'];
                MessegePopup.showMessegePuppy([MondoText({ 'text': msg })]);

                if (msg && (msg.match('success') || msg.match('save'))) {
                    calendar.addEvent({
                        'title': eventAsBody.title,
                        'start': eventAsBody.start,
                        'description': eventAsBody.description
                    });

                    clearTextEdits([titleInput, descInput]);
                }
            } catch (err) {
                if (err instanceof TextEditError) {
                    MessegePopup.showMessegePuppy(err.message);
                }
            }
        }
    });

    button.style.marginTop = '50px';

    const column = VerticalScrollView({
        'children': [titleInput, descInput, button],
        'classlist': ['m-pad', 'f-w', 'a-c'],
        'styles': []
    });


    ModalExpertise.showModal({
        'children': [column],
        'topRowUserActions': [],
        'modalHeadingStyles': [
            // { 'background-color': 'goldenrod' },
            { 'background-color': '#263e41' },
            { 'color': 'lightgoldenrodyellow' },
        ],
        'actionHeading': 'create new event for date: ' + date,
        'modalChildStyles': [
            { 'max-width': '400px' },
            { 'height': '600px' }
        ],
    });
}

function handleEventClick(info) {
    console.log(info);

    let clickedEvent = (ParishDataHandle.allParishEvents.find(function (event) {
        return event._id === info.event.extendedProps._id
    }));

    const column = Column({
        'classlist': ['txt-c'],
        'styles': [{ 'padding': '10px' }],
        'children': [
            MondoBigH3Text({ 'text': clickedEvent.title }),
            MondoText({ 'text': clickedEvent.description }),
        ]
    });

    ModalExpertise.showModal({
        'actionHeading': clickedEvent.start,
        'modalChildStyles': [
            { 'width': '300px' },
            { 'height': '300px' },
        ],
        'topRowUserActions': [],
        'children': [column],
        'dismisible': true,
    });
}

function showParishName() {
    domQueryById('parish-name').innerText = `${LocalStorageContract.completeParishName()} parish`
}

function showEventsCount() {
    parishEvents().then(function (events) {
        domQueryById('events-count').innerText = (!events || !events.length || events.length < 1)
            ? 'no events have been added'
            : `${events.length} events`
    });
}

function setAnchors() {
    domQueryById('profile-setting-view').onclick = showProfileView;

    const fullscreenButton = domQueryById('v-mode');
    fullscreenButton.title = 'enter fullscreen';

    fullscreenButton.onclick = function (ev) {
        if (!window.document.fullscreenElement) {
            window.document.documentElement.requestFullscreen();
            fullscreenButton.title = 'exit fullscreen'
        } else if (document.exitFullscreen) {
            window.document.exitFullscreen();
            fullscreenButton.title = 'enter fullscreen'
        }
    };
}

// function openRegistryActionsOptions() {
//     const buttonStyles = [{ 'margin-top': '15px' }]

//     const regstrationButtons = [
//         Button({ 'text': 'register a member', 'styles': buttonStyles, 'onclick': promptRegiterMember }),
//         Button({ 'text': 'add outstation', 'styles': buttonStyles, onclick: promptAddOutstationView }),
//         Button({ 'text': 'add scc', 'styles': buttonStyles, 'onclick': promptAddSCCView }),
//         Button({ 'text': 'add group', 'styles': buttonStyles }),
//         Button({ 'text': 'add tithe record', 'styles': buttonStyles, 'onclick': promptAddTitheView }),
//         Button({ 'text': 'add offering record', 'styles': buttonStyles, 'onclick': promptAddOffering }),
//     ]

//     const column = Column({
//         'children': regstrationButtons,
//         'classlist': ['f-w', 'f-h', 'just-center', 'a-c', 'scroll-y'],
//         'styles': [{ 'background-color': 'gainsboro' }]
//     });

//     ModalExpertise.showModal({
//         'actionHeading': 'registry',
//         'children': [column],
//         'fullScreen': true,
//         'dismisible': true,
//         'modalChildStyles': []
//     });
// }

// function showMembersReportsPage() {
//     let agridApi;

//     const membersGridDiv = domCreate('div');
//     addClasslist(membersGridDiv, ['ag-theme-alpine']);
//     StyleView(membersGridDiv, [{ 'height': '500px' }]);

//     const column = Column({
//         'children': [membersGridDiv],
//         'styles': [{ 'padding': '20px' }]
//     });

//     let gridOptions = {
//         'columnDefs': [
//             {
//                 'field': 'member_number',
//                 'headerName': 'NO',
//                 'filter': true,
//             },
//             {
//                 'field': 'name',
//                 'headerName': 'NAME',
//                 'filter': true,
//             },
//             {
//                 'field': 'date_of_birth',
//                 'headerName': 'DATE OF BIRTH',
//             },
//         ],
//         'rowData': parishMembers,
//         'pagination': true,
//         'onRowClicked': function (ev) {
//             const member = ev.data;

//             const updateIcon = domCreate('i');
//             addClasslist(updateIcon, ['bi', 'bi-save'])

//             updateIcon.onclick = async function (ev) {
//                 ev.preventDefault();

//                 let newDetails = member;

//                 delete newDetails['outstation']
//                 delete newDetails['scc']

//                 let updateResult = await Post('/parish/update/member',
//                     { member: newDetails },
//                     { 'requiresParishDetails': true });

//                 MessegePopup.showMessegePuppy([
//                     MondoText({ 'text': updateResult['response'] })
//                 ]);
//             }

//             ModalExpertise.showModal({
//                 'actionHeading': member['name'],
//                 'topRowUserActions': [updateIcon],
//                 'children': [memberView(member)],
//                 'modalChildStyles': [{ 'width': '400px', 'height': '600px' }]
//             });
//         }
//     };

//     agridApi = agGrid.createGrid(membersGridDiv, gridOptions);

//     const resizedView = Column({
//         'classlist': ['f-w', 'f-h', 'scroll-y'],
//         'children': [column]
//     });

//     ModalExpertise.showModal({
//         'actionHeading': 'MEMBERS',
//         'fullScreen': true,
//         'children': [resizedView]
//     });
// }


// function showAllReportsMenuPage() {
//     const membersIcon = domCreate('i');
//     membersIcon.title = 'members';
//     addClasslist(membersIcon, ['bi', 'bi-people', 'bi-pad']);

//     const offeringsIcon = domCreate('i');
//     offeringsIcon.title = 'offering';
//     addClasslist(offeringsIcon, ['bi', 'bi-cash-coin', 'bi-pad']);

//     const titheIcon = domCreate('i');
//     titheIcon.title = 'tithe';
//     addClasslist(titheIcon, ['bi', 'bi-gift', 'bi-pad']);


//     const membersColumn = MembersReportsView();
//     const offeringReportView = OfferingReportView();
//     const mainView = Column({ 'classlist': ['f-w', 'a-c'], 'children': [membersColumn] });

//     membersIcon.onclick = function () {
//         mainView.replaceChildren([]);
//         addChildrenToView(mainView, [membersColumn]);
//     }

//     offeringsIcon.onclick = function () {
//         mainView.replaceChildren([]);
//         addChildrenToView(mainView, [offeringReportView]);
//     }

//     // membersIcon.onclick = function () {
//     //     mainView.replaceChildren([]);
//     //     addChildrenToView(mainView, [membersColumn]);
//     // }


//     ModalExpertise.showModal({
//         'actionHeading': `reports`,
//         'modalHeadingStyles': [{ 'background-color': '#aebdeb' }],
//         'children': [mainView],
//         'fullScreen': true,
//         'topRowUserActions': [membersIcon, offeringsIcon, titheIcon]
//     });

// }
