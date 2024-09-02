import { ModalExpertise } from "./components/actions/modal.js";
import { MessegePopup } from "./components/actions/pop_up.js";
import { Button, Column, MondoBigH3Text, MondoText, TextEdit, VerticalScrollView } from "./components/UI/cool_tool_ui.js";
import { addClasslist } from "./components/utils/stylus.js";
import { TextEditError, TextEditValueValidator } from "./components/utils/textedit_value_validator.js";
import { showMembersReportsView as ShowMembersReportsView, promptRegiterMember } from "./components/view_callbacks/member.js";
import { promptAddOffering, showOfferingReportView } from "./components/view_callbacks/offering.js";
import { promptAddOutstationView, viewOutstationsPage } from "./components/view_callbacks/outstation.js";
import { promptLogIn } from "./components/view_callbacks/prompt_login.js";
import { promptAddSCCView, viewSCCsPage } from "./components/view_callbacks/scc.js";
import { promptAddTitheView, showTitheReportsView } from "./components/view_callbacks/tithe.js";
import { ParishDataHandle } from "./data_pen/parish_data_handle.js";
import { getParishMembers, getParishOfferingsRecords, getParishOutstations, getParishSCCs, getParishTitheRecords, parishEvents } from "./data_source/main.js";
import { domCreate, domQuery, domQueryById } from "./dom/query.js";
import { clearTextEdits } from "./dom/text_edit_utils.js";
import { work } from "./dom/worker.js";
import { Post } from "./net_tools.js";
import { DrawerMenu, Menu, populateDrawer } from "./populate_drawer.js";
import { LocalStorageContract } from "./storage/LocalStorageContract.js";

export const marginRuleStyles = [{ 'margin-top': '20px' }];

work(Main);

const registryClass = 'registry', reportsClass = 'reports';

const drawerMenus = [
    new DrawerMenu(
        'Registry',
        registryClass,
        [
            new Menu('members', 'bi-people', registryClass, promptRegiterMember),
            new Menu('Outstation', 'bi-collection', registryClass, promptAddOutstationView),
            new Menu('SCC', 'bi-people', registryClass, promptAddSCCView),
            new Menu('Offering', 'bi-cash', registryClass, promptAddOffering),
            new Menu('Tithe', 'bi-gift', registryClass, promptAddTitheView),
        ]
    ),
    new DrawerMenu(
        'Reports',
        reportsClass,
        [
            new Menu('members', 'bi-people', reportsClass, ShowMembersReportsView),
            new Menu('tithe', 'bi-cash-coin', reportsClass, showTitheReportsView),
            new Menu('offering', 'bi-cash-coin', reportsClass, showOfferingReportView),
            new Menu('Outstations', 'bi-collection', reportsClass, viewOutstationsPage),
            new Menu('SCCs', 'bi-justify-right', reportsClass, viewSCCsPage),
        ],
        false
    ),
]

async function Main() {
    if (LocalStorageContract.parishNotLoggedIn()) {
        promptLogIn();
    } else {
        const drawer = domQuery('.drawer-container');

        ParishDataHandle.parishOutstations.push(...(await getParishOutstations()));
        ParishDataHandle.parishSCCs.push(...(await getParishSCCs()));
        ParishDataHandle.parishMembers.push(...(await getParishMembers()))
        ParishDataHandle.parishOfferingRecords.push(...(await getParishOfferingsRecords()));
        ParishDataHandle.parishTitheRecords.push(...(await getParishTitheRecords()))

        populateDrawer(drawer, drawerMenus);
        showParishName();
        setCalendar();
        showEventsCount();


        setAnchors();

        work(populateDrawer);
    }
}

async function setCalendar() {
    var calendarEl = domQueryById('calendar');

    let savedParishEvents = await parishEvents();
    ParishDataHandle.allParishEvents.push(...savedParishEvents);

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'title',
            center: 'dayGridMonth,timeGridWeek,listWeek',
            right: 'prev,next today'
        },
        views: {
            listDay: { buttonText: 'Day' },
            listWeek: { buttonText: 'Week' },
            listMonth: { buttonText: 'Month' }
        },
        events: ParishDataHandle.allParishEvents.map(function (ev) {
            ev['id'] = ev['_id'];
            return ev;
        }),

        dateClick: function (info) { handleDateClick(calendar, info) },
        eventClick: handleEventClick
    });

    calendar.render();
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
            { 'background-color': 'goldenrod' },
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
    let clickedEvent = (ParishDataHandle.allParishEvents.find(function (event) {
        return event._id === info.event.extendedProps._id
    }));

    const column = Column({
        'classlist': ['txt-c'],
        children: [
            MondoBigH3Text({ 'text': clickedEvent.title }),
            MondoText({ 'text': clickedEvent.description }),
        ]
    })

    let deleteIcon = domCreate('i');
    addClasslist(deleteIcon, ['bi', 'bi-trash', 'bi-pad']);

    let shareIcon = domCreate('i');
    addClasslist(shareIcon, ['bi', 'bi-share', 'bi-pad']);

    ModalExpertise.showModal({
        'actionHeading': clickedEvent.start,
        'modalChildStyles': [
            { 'width': '300px' },
            { 'height': '300px' },
        ],
        'topRowUserActions': [shareIcon, deleteIcon],
        'children': [column],
        'dismisible': true,
    });
}

function showParishName() {
    domQueryById('parish-name').innerText = `${LocalStorageContract.parishName()} parish`
}

function showEventsCount() {
    parishEvents().then(function (events) {
        domQueryById('events-count').innerText = (!events || !events.length || events.length < 1)
            ? 'no events have been added'
            : `${events.length} events`
    });
}

function setAnchors() {
    // domQueryById('reports').onclick = showAllReportsMenuPage;
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
