import { ModalExpertise } from "./components/actions/modal.js";
import { MessegePopup } from "./components/actions/pop_up.js";
import { OutstationPicker } from "./components/tailored_ui/outstation_picker.js";
import { Button, Column, MondoBigH3Text, MondoSelect, MondoText, Row, TextEdit, VerticalScrollView } from "./components/UI/cool_tool_ui.js";
import { addClasslist, StyleView } from "./components/utils/stylus.js";
import { TextEditError, TextEditValueValidator } from "./components/utils/textedit_value_validator.js";
import { promptAddOffering, showOfferingReportView } from "./components/view_callbacks/offering.js";
import { promptAddOutstationView, viewOutstationsPage } from "./components/view_callbacks/outstation.js";
import { promptLogIn } from "./components/view_callbacks/prompt_login.js";
import { getOutstationMembers, getOutstationSCCs, getSCCMembers } from "./data_pen/parish_data.js";
import { getParishMembers, getParishOfferings, getParishOutstations, getParishSCCs } from "./data_source/main.js";
import { addChildrenToView } from "./dom/addChildren.js";
import { domCreate, domQuery, domQueryById } from "./dom/query.js";
import { clearTextEdits } from "./dom/text_edit_utils.js";
import { work } from "./dom/worker.js";
import { Post } from "./net_tools.js";
import { DrawerMenu, Menu, populateDrawer } from "./populate_drawer.js";
import { LocalStorageContract } from "./storage/LocalStorageContract.js";

work(Main);

let allParishEvents = [],
    parishMembers = [],
    parishOutstations = [],
    parishSCCs = [],
    parishOfferingRecords = [];

export const marginRuleStyles = [{ 'margin-top': '20px' }];

async function Main() {
    if (LocalStorageContract.parishNotLoggedIn()) {
        promptLogIn();
    } else {
        const drawer = domQuery('.drawer-container');
        const registryClass = 'registry', reportsClass = 'reports';

        const drawerMenus = [
            new DrawerMenu(
                'Registry',
                registryClass,
                [
                    new Menu('members', 'bi-people', registryClass, promptRegiterMember),
                    new Menu('Outstation', 'bi-collection', registryClass, () => promptAddOutstationView(parishOutstations)),
                    new Menu('SCC', 'bi-people', registryClass, promptAddSCCView),
                    new Menu('Offering', 'bi-cash', registryClass, () => promptAddOffering(parishOutstations)),
                    new Menu('Tithe', 'bi-gift', registryClass, promptAddTitheView),
                ]
            ),
            new DrawerMenu(
                'Reports',
                reportsClass,
                [
                    new Menu('members', 'bi-people',
                        reportsClass,
                        function () {
                            ModalExpertise.showModal({
                                'actionHeading': 'members report',
                                'modalHeadingStyles': [{ 'background-color': '#bebeff', }],
                                'fullScreen': true,
                                'children': [MembersReportsView()]
                            })
                        }),
                    new Menu('tithe', 'bi-cash-coin', reportsClass),
                    new Menu('offering', 'bi-cash-coin',
                        reportsClass, async function (ev) {
                            await showOfferingReportView(parishOfferingRecords, parishOutstations)
                        }),
                    new Menu('Outstations', 'bi-collection', reportsClass, () => viewOutstationsPage(parishOutstations, parishMembers)),
                    new Menu('SCCs', 'bi-justify-right', reportsClass, viewSCCsPage),
                ],
                false
            ),
        ]

        populateDrawer(drawer, drawerMenus);
        showParishName();
        work(populateDrawer);
        setCalendar();
        showEventsCount();

        parishOutstations.push(...(await getParishOutstations()));
        parishSCCs.push(...(await getParishSCCs()));
        parishMembers.push(...(await getParishMembers()))
        parishOfferingRecords.push(...(await getParishOfferings()));

        setAnchors();
    }
}

async function setCalendar() {
    var calendarEl = domQueryById('calendar');
    let savedParishEvents = await parishEvents();

    allParishEvents.push(...savedParishEvents);

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
        events: savedParishEvents.map(function (ev) {
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
        children: [column],
        topRowUserActions: [],
        actionHeading: 'create new event for date: ' + date,
        modalChildStyles: [
            { 'max-width': '400px' },
            { 'height': '600px' }
        ],
    });
}

function handleEventClick(info) {
    let clickedEvent = (allParishEvents.find(function (event) {
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
        'modalChildStyles': [{ 'width': '300px' }, { 'height': '300px' }],
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

async function parishEvents() {
    let parishEvents = await Post('/parish/events', null, { 'requiresParishDetails': true });
    return parishEvents['response'];
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

function promptAddSCCView() {
    const sccNameI = TextEdit({ 'placeholder': 'scc name' });
    const outstationPicker = OutstationPicker({
        'styles': marginRuleStyles,
        'onchange': function (ev) {
        },
        'outstations': parishOutstations
    });

    const button = Button({
        'styles': marginRuleStyles,
        'text': 'submit',
        'onclick': async function (ev) {
            try {
                const outstationId = JSON.parse(outstationPicker.value)['_id'];

                TextEditValueValidator.validate('SCC name', sccNameI);
                const body = {
                    'scc': {
                        'name': sccNameI.value,
                        'outstation_id': outstationId
                    }
                };

                let result = await Post('/parish/add/scc', body, { 'requiresParishDetails': true });
                let msg = result['response'];

                MessegePopup.showMessegePuppy([MondoText({ 'text': msg })]);
                if (msg.match('success' || msg.match('save'))) {
                    clearTextEdits(sccNameI);
                    parishSCCs = getParishSCCs();
                }
            } catch (error) {
                MessegePopup.showMessegePuppy([MondoText({ 'text': msg })]);
            }
        }
    })

    const column = Column({
        'styles': marginRuleStyles,
        'classlist': ['f-w', 'f-c', 'a-c'],
        'children': [
            sccNameI,
            outstationPicker,
            button
        ]
    });

    ModalExpertise.showModal({
        'actionHeading': 'add an SCC',
        'modalChildStyles': [{ 'width': '400px', 'height': '300px' }],
        'children': [column],
        'fullScreen': false,
        'dismisible': true
    })
}

function promptRegiterMember() {
    const marginRuleStyles = [{ 'margin-top': '15px' }]

    const nameI = TextEdit({ 'placeholder': 'name', 'styles': marginRuleStyles });
    const dobI = TextEdit({ 'placeholder': 'date of birth', 'type': 'date', 'styles': marginRuleStyles });
    const motherNameI = TextEdit({ 'placeholder': 'mother\'s name', 'styles': marginRuleStyles });
    const fatherNameI = TextEdit({ 'placeholder': 'father\'s name', 'styles': marginRuleStyles });
    const GodParentNameI = TextEdit({ 'placeholder': 'God parent\'s', 'styles': marginRuleStyles });
    const telephoneNumberI = TextEdit({ 'placeholder': 'telephone number', 'styles': marginRuleStyles });

    const sccPicker = MondoSelect({
        'onChange': function (ev) {
            ev.preventDefault();
            console(sccPicker.value);
        },
        'styles': marginRuleStyles
    });

    const outstationPicker = OutstationPicker({
        'outstations': parishOutstations,
        'styles': marginRuleStyles,
        'onchange': function (ev) {
            ev.preventDefault();
            sccPicker.replaceChildren([]);

            const outstation = JSON.parse(outstationPicker.value);
            console.log(outstation);
            let sccs = parishSCCs.filter(function (scc) {
                return scc['outstation_id'] === outstation['_id']
            });

            console.log('this scc', sccs);
            for (let i = 0; i < sccs.length; i++) {
                const scc = sccs[i];
                console.log('scc: ' + i, sccs);

                let option = domCreate('option');
                option.innerText = scc['name']
                option.value = JSON.stringify(scc);

                sccPicker.appendChild(option);
            }
            sccPicker.options[0].selected = true;
        }
    });

    const button = Button({
        'text': 'submit',
        'styles': marginRuleStyles,
        onclick: async function (ev) {
            TextEditValueValidator.validate('name', nameI);
            TextEditValueValidator.validate('date of birth', dobI);
            TextEditValueValidator.validate('mother\'s name', motherNameI);
            TextEditValueValidator.validate('father\'s name', fatherNameI);
            TextEditValueValidator.validate('GodParent\'s name', GodParentNameI);

            if (!outstationPicker.value || !sccPicker.value) {
                return MessegePopup.showMessegePuppy([
                    MondoText({ 'text': 'outstation and SCC must not be empty' })
                ]);
            }

            let theGodParents;
            if (GodParentNameI.value && GodParentNameI.value.includes(',')) {
                theGodParents = [...(GodParentNameI.value.split(',') || [])];
            } else {
                theGodParents = [`${GodParentNameI.value}`.trim()];
            }

            const body = {
                member: {
                    'name': `${nameI.value}`.trim(),
                    'date_of_birth': `${dobI.value}`.trim(),
                    'mother': `${motherNameI.value}`.trim(),
                    'father': `${fatherNameI.value}`,
                    'God_Parents': theGodParents,
                    'outstation_id': (JSON.parse(outstationPicker.value))['_id'],
                    'scc_id': (JSON.parse(sccPicker.value))['_id'],
                    'telephone_number': telephoneNumberI.value,
                }
            };

            Object.keys(body.member).forEach(function (key) {
                console.log(body.member[key]);

                if (!body.member[key] || `${body.member[key]}`.match('undefined')) {
                    body.member[key] = '_'
                }
            });

            let result = await Post(
                '/parish/register/member',
                body,
                { 'requiresParishDetails': true }
            );

            const msg = result['response'];
            MessegePopup.showMessegePuppy([MondoText({ 'text': msg })]);

            if (msg.match('success') || msg.match('save')) {
                clearTextEdits([nameI, dobI, motherNameI, fatherNameI, GodParentNameI]);
                parishMembers = getParishMembers();
            }
        }
    });

    const column = Column({
        'classlist': ['f-w', 'f-w', 'a-c', 'scroll-y'],
        'children': [
            nameI,
            dobI,
            motherNameI,
            fatherNameI,
            GodParentNameI,
            outstationPicker,
            sccPicker,
            telephoneNumberI,
            button,
        ]
    });

    // const addFieldIconButton = domCreate('i');
    // addClasslist(addFieldIconButton, ['bi', 'bi-plus']);
    // addFieldIconButton.onclick = function (ev) {
    //     ev.preventDefault();

    //     let newFieldName = prompt('new field name');
    //     if (newFieldName) {
    //         addChildrenToView(column, TextEdit({ 'placeholder': newFieldName }))
    //     }
    // }

    ModalExpertise.showModal({
        'actionHeading': 'member registration',
        'modalChildStyles': [{ 'width': '400px', 'height': '300px' }],
        // 'topRowUserActions': [addFieldIconButton],
        'children': [column],
        'fullScreen': false,
        'dismisible': true,
    });
}

function promptAddTitheView() {
    let selectedMemberId, searchResultViewContainer;
    const dateId = 'date-el';

    const memberSearchI = TextEdit({ 'placeholder': 'member name' });

    const dateI = TextEdit({ 'type': 'date' });
    dateI.id = dateId;

    const amountI = TextEdit({ 'placeholder': 'amount' });

    async function saveTitheRecord() {
        if (!selectedMemberId) {
            return MessegePopup.showMessegePuppy([MondoText({ 'text': 'select a member to continue' })])
        }

        try {
            TextEditValueValidator.validate('date', dateI);
            TextEditValueValidator.validate('amount', amountI);

            const body = {
                tithe: {
                    'member_id': selectedMemberId,
                    'date': dateI.value,
                    'amount': parseFloat(amountI.value)
                }
            }

            let result = await Post('/parish/record/tithe', body, { 'requiresParishDetails': true })
            let msg = result['response'];

            MessegePopup.showMessegePuppy([MondoText({ 'text': msg })]);
            if (msg.match('success') || msg.match('save')) {
                clearTextEdits([memberSearchI, dateI, amountI]);
            }
        } catch (error) {
            MessegePopup.showMessegePuppy([MondoText({ 'text': error })]);
        }
    }

    const submitButton = Button({ 'text': 'submit', onclick: saveTitheRecord });

    searchResultViewContainer = Column({ 'classlist': ['f-h', 'f-w', 'scroll-y'], 'children': [] });

    const memberSearchView = Column({
        'classlist': ['f-w', 'a-c'],
        'children': [memberSearchI, dateI, amountI, submitButton, searchResultViewContainer]
    });


    ModalExpertise.showModal({
        'actionHeading': 'add tithe record',
        'fullScreen': false,
        'dismisible': true,
        'modalChildStyles': [{ 'width': '400px', 'height': '400px' }],
        'children': [memberSearchView]
    });


    memberSearchI.addEventListener('input', function (ev) {
        ev.preventDefault();
        const searchKey = memberSearchI.value;
        console.log(memberSearchI.value);

        let match = parishMembers.filter(function (member) {
            return (
                `${member['name']}`.match(searchKey)
                || `${member['member_number']}`.match(searchKey)
            )
        });

        match = match.map(function (member) {
            return {
                _id: member['_id'],
                'name': member['name'],
                'telephone_number': member['telephone_number'] || '_',
                'outstation': parishOutstations.find(function (scc) {
                    return scc['_id'] === member['outstation_id'];
                })['name'],
                'scc': parishSCCs.find(function (scc) {
                    return scc['_id'] === member['scc_id'];
                })['name'],
            }
        });

        const styles = [{ 'font-weight': '700' }];

        const matchViews = match.map(function (member) {
            let view = Column({
                'classlist': ['f-w', 'a-c', 'c-p', 'highlightable'],
                'children': [
                    Row({
                        'children': [
                            MondoText({ 'text': 'name', 'styles': styles }),
                            MondoText({ 'text': member['name'] }),
                        ]
                    }),
                    Row({
                        'children': [
                            MondoText({ 'text': 'telephone number', 'styles': styles }),
                            MondoText({ 'text': member['telephone_number'] }),
                        ]
                    }),
                    Row({
                        'children': [
                            MondoText({ 'text': 'outstation', 'styles': styles }),
                            MondoText({ 'text': member['outstation'] }),
                        ]
                    }),
                    Row({
                        'children': [
                            MondoText({ 'text': 'scc', 'styles': styles }),
                            MondoText({ 'text': member['scc'] }),
                        ]
                    })
                ]
            });
            view.style.borderBottom = '1px solid grey';
            view.style.margin = '3px';

            let cloneId = 'tth-clone';
            view.onclick = function (ev) {
                ev.preventDefault();
                selectedMemberId = member['_id'];
                console.log(selectedMemberId);

                let existingClone = domQueryById(cloneId);
                if (existingClone) {
                    memberSearchView.removeChild(existingClone);
                }

                let clone = view.cloneNode(true);
                clone.id = cloneId;

                memberSearchView.insertBefore(clone, domQueryById(dateId));
                searchResultViewContainer.replaceChildren([]);
            }

            return view;
        });

        searchResultViewContainer.replaceChildren([]);
        addChildrenToView(searchResultViewContainer, matchViews);
    });
}


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


export function memberGetOutstation(member, parishOutstations) {
    return parishOutstations.find(function (o) { return o['_id'] === member['outstation_id'] });
}

export function memberGetSCC(member, parishSCCs) {
    return parishSCCs.find(function (scc) { return scc['_id'] === member['scc_id'] });
}

function memberView(member) {
    const outstation = memberGetOutstation(member, parishOutstations)
    const scc = memberGetSCC(member, parishSCCs);

    member['outstation'] = outstation['name'];
    member['scc'] = scc['name'];

    return Column({
        'classlist': ['f-w', 'a-c', 'scroll-y'],
        'children': Object.keys(member).map(function (key) {
            if (key !== '_id' && !`${key}`.match('_id')) {
                const valueEditor = TextEdit({ 'placeholder': key })
                valueEditor.value = member[key];

                valueEditor.addEventListener('input', function (ev) {
                    ev.preventDefault();

                    member[key] = valueEditor.value;
                })

                return Column({
                    'children': [
                        MondoText({ 'text': key.toUpperCase().split('_').join(' ') }),
                        valueEditor
                    ]
                })
            }
            return ''
        })
    });
}

function viewSCCsPage() {
    const column = VerticalScrollView({
        'classlist': ['f-w', 'a-c', 'just-center'],
        'children': parishSCCs.map(function (scc) {
            let outstation = parishOutstations.find(function (o) {
                return o['_id'] === scc['outstation_id']
            });

            let members = parishMembers.filter(function (m) {
                return m['scc_id'] === scc['_id']
            }).length;

            return Row({
                'classlist': ['space-around', 'f-w', 'a-c', 'outlined', 'highlightable'],
                'styles': [{ 'width': '90%' }, { 'margin': '5px' }],
                'children': [
                    Column({
                        'children': [
                            MondoBigH3Text({ 'text': scc['name'] }),
                            MondoText({ 'text': `outstation: ${outstation['name']}`, 'styles': [{ 'font-size': '12px', 'color': 'grey' }] }),
                        ]
                    }),
                    MondoText({ 'text': `${members} members` })
                ]
            });
        })
    });

    ModalExpertise.showModal({
        'modalHeadingStyles': [{ 'background': 'royalblue' }, { 'color': 'white' }],
        'actionHeading': `small Christian Communities (${parishSCCs.length})`,
        'children': [column],
        'modalChildStyles': [{ 'width': '400px' }],
        'fullScreen': false,
        'dismisible': true,
    });
}


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


function MembersReportsView() {
    let selectedOutstationAndSCCMembers;

    const outstationPicker = OutstationPicker({
        'outstations': parishOutstations,
        'styles': marginRuleStyles
    });

    StyleView(outstationPicker, [{ 'padding': '10px' }]);

    const sccPicker = MondoSelect({ 'styles': marginRuleStyles });
    StyleView(sccPicker, [{ 'padding': '10px' }]);

    const table = domCreate('table');
    StyleView(table, [{ 'margin': '20px', 'min-width': '300px' }]);
    const tableHeader = domCreate('thead');
    tableHeader.innerHTML = `
        <tr>
            <td>NO</td>
            <td>NAME</td>
            <td>TELEPHONE</td>
            <td>VIEW</td>
            <td>PRINT</td>
        </tr>
    `
    const tbody = domCreate('tbody');
    addChildrenToView(table, [tableHeader, tbody]);

    outstationPicker.addEventListener('change', function (ev) {
        ev.preventDefault();

        sccPicker.replaceChildren([]);

        const outstation = JSON.parse(outstationPicker.value);
        let sccs = getOutstationSCCs(parishSCCs, outstation);

        for (let i = 0; i < sccs.length; i++) {
            const scc = sccs[i];

            let option = domCreate('option');
            option.innerText = scc['name']
            option.value = JSON.stringify(scc);

            sccPicker.appendChild(option);
        }

        sccPicker.options[0].selected = true;

        const setViews = function () {
            let members = getOutstationMembers(parishMembers, outstationPicker.value);

            selectedOutstationAndSCCMembers = getSCCMembers(members, sccPicker.value);
            console.log(selectedOutstationAndSCCMembers);

            tbody.replaceChildren([]);
            for (let i = 0; i < selectedOutstationAndSCCMembers.length; i++) {
                const member = selectedOutstationAndSCCMembers[i];
                const row = domCreate('tr');

                let telephoneNumber = member['telephone_number'];
                row.innerHTML = `
                    <td>${i + 1}</td>
                    <td>${member['name']}</td>
                    <td><a href="${'tel:' + telephoneNumber}">${telephoneNumber}</a></td>
                `
                const viewMemberTd = domCreate('td');
                const tdContent = domCreate('i');
                addClasslist(tdContent, ['bi', 'bi-printer']);
                tdContent.onclick = function () {
                    ModalExpertise.showModal({
                        'actionHeading': `${member['name']}`.toUpperCase(),
                        'modalHeadingStyles': [{ 'background-color': 'dodgerblue' }, { 'color': 'white' }],
                        'modalChildStyles': [{ 'width': '400px' }],
                        'children': [memberView(member)]
                    })
                }
                addChildrenToView(viewMemberTd, [tdContent]);
                row.appendChild(viewMemberTd);

                tbody.appendChild(row);
            }
        }

        setViews()

        sccPicker.addEventListener('change', setViews);
    });

    const styles = [{ 'font-size': '12px' }]
    const pickersRow = Column({
        'children': [
            Column({
                'children': [
                    MondoText({ 'text': 'outstation', 'styles': styles }),
                    outstationPicker,
                ]
            }),
            Column({
                'children': [
                    MondoText({ 'text': 'SCC', 'styles': styles }),
                    sccPicker
                ],
            })
        ]
    });

    const membersColumn = Column({
        children: parishMembers.map(function (m) {
            return Column({
                'classlist': ['f-w', 'a-c', 'scroll-y'],
                'children': [
                    pickersRow,
                    table
                ]
            })
        })
    });

    return membersColumn;
}

