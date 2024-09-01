import { ModalExpertise } from "./components/actions/modal.js";
import { MessegePopup } from "./components/actions/pop_up.js";
import { OutstationPicker } from "./components/tailored_ui/outstation_picker.js";
import { Button, Column, MondoBigH3Text, MondoSelect, MondoText, Row, TextEdit, VerticalScrollView } from "./components/UI/cool_tool_ui.js";
import { addClasslist, StyleView } from "./components/utils/stylus.js";
import { TextEditError, TextEditValueValidator } from "./components/utils/textedit_value_validator.js";
import { addChildrenToView } from "./dom/addChildren.js";
import { domCreate, domQuery, domQueryAll, domQueryById } from "./dom/query.js";
import { clearTextEdits } from "./dom/text_edit_utils.js";
import { work } from "./dom/worker.js";
import { ParishLogIn } from "./log_in.js";
import { Post } from "./net_tools.js";
import { DrawerMenu, Menu, populateDrawer } from "./populate_drawer.js";
import { LocalStorageContract } from "./storage/LocalStorageContract.js";

work(Main);

let allParishEvents = [],
    parishMembers = [],
    parishOutstations = [],
    parishSCCs = [];

const marginRuleStyles = [{ 'margin-top': '20px' }]

async function getParishMembers() {
    return (await Post(
        '/parish/load/all/members', {},
        {
            'requiresParishDetails': true
        }))['response']
}

async function getParishOutstations() {
    return (await Post(
        '/parish/load/all/outstations', {},
        {
            'requiresParishDetails': true
        }))['response']
}

async function getParishSCCs() {
    return (await Post(
        '/parish/load/all/sccs', {},
        {
            'requiresParishDetails': true
        }))['response']
}

async function Main() {
    if (LocalStorageContract.parishNotLoggedIn()) {
        const emailInput = TextEdit({ 'placeholder': 'email' });
        const passwordInput = TextEdit({ 'placeholder': 'password', onSubmit: doLogIn });

        const button = Button({
            'text': 'submit',
            'onclick': doLogIn,
            'classlist': {},
            'styles': [{ 'margin-top': '40px' }]
        });

        const column = Column({
            'children': [emailInput, passwordInput, button],
            'classlist': ['f-w', 'fx-col', 'a-c', 'just-center'],
            styles: [{ 'padding-top': '80px' }]
        });

        async function doLogIn() {
            try {
                TextEditValueValidator.validate('email', emailInput);
                TextEditValueValidator.validate('password', passwordInput);

                let result = await ParishLogIn(emailInput.value, passwordInput.value);
                const msg = result['response'];

                MessegePopup.showMessegePuppy([MondoText({ 'text': msg })]);

                if (msg.match('success')) {
                    await Post('/parish/details', {
                        'email': emailInput.value,
                        'password': passwordInput.value,
                    },
                        {
                            'requiresParishDetails': false
                        }
                    ).then(function (parishDetails) {
                        let credentials = parishDetails['response'];
                        if (credentials) {
                            /**remove unneccessary mongodb objectId */
                            delete credentials['_id']

                            LocalStorageContract.storeDetails(credentials);
                            window.location.reload();
                        } else {
                            MessegePopup.showMessegePuppy([MondoText({ 'text': 'something went wrong' })]);
                        }
                    })

                }
            } catch (error) {
                if (error instanceof TextEditError) {
                    MessegePopup.showMessegePuppy([MondoText({ 'text': error.message })]);
                }
            }
        }

        domQueryAll('h3').forEach(function (el) {
            el.style.display = 'none';
        });

        domQueryAll('.drawer').forEach(function (el) {
            el.style.display = 'none';
        });

        ModalExpertise.showModal({
            'actionHeading': 'Log In',
            'children': [column],
            'classlist': ['f-w'],
            'dismisible': false,
            'fullScreen': false,
            'modalChildStyles': [{ 'width': '400px' }]
        });
    } else {
        const drawer = domQuery('.drawer-container');
        const drawerMenus = [
            new DrawerMenu('miscellenious', [
                new Menu('members', 'bi-people', showMembersReportsPage),
                new Menu('outstations', 'bi-collection', viewOutstationsPage),
                new Menu('SCCs', 'bi-justify-right', viewSCCsPage),
            ])
        ]

        populateDrawer(drawer, drawerMenus);
        showParishName();
        work(populateDrawer);
        setCalendar();
        showEventsCount();
        // parishMembers = await getParishMembers();
        // console.log(parishMembers);

        parishOutstations.push(...(await getParishOutstations()));
        parishSCCs.push(...(await getParishSCCs()));
        parishMembers = await getParishMembers();

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
    domQueryById('registry').onclick = openRegistryActionsOptions;
    domQueryById('reports').onclick = showAllReportsMenuPage;
}

function openRegistryActionsOptions() {
    const buttonStyles = [{ 'margin-top': '15px' }]

    const regstrationButtons = [
        Button({ 'text': 'register a member', 'styles': buttonStyles, 'onclick': promptRegiterMember }),
        Button({ 'text': 'add outstation', 'styles': buttonStyles, onclick: promptAddOutstationView }),
        Button({ 'text': 'add scc', 'styles': buttonStyles, 'onclick': promptAddSCCView }),
        Button({ 'text': 'add group', 'styles': buttonStyles }),
        Button({ 'text': 'add tithe record', 'styles': buttonStyles, 'onclick': promptAddTitheView }),
        Button({ 'text': 'add offering record', 'styles': buttonStyles, 'onclick': promptAddOffering }),
    ]

    const column = Column({
        'children': regstrationButtons,
        'classlist': ['f-w', 'f-h', 'just-center', 'a-c', 'scroll-y'],
        'styles': [{ 'background-color': 'gainsboro' }]
    });

    ModalExpertise.showModal({
        'actionHeading': 'registry',
        'children': [column],
        'fullScreen': true,
        'dismisible': true,
        'modalChildStyles': []
    });
}

function promptAddOutstationView() {
    const nameTextEdit = TextEdit({ 'placeholder': 'outstation name' });

    const button = Button({ 'text': 'submit' });
    button.onclick = async function (ev) {
        ev.preventDefault();
        try {
            TextEditValueValidator.validate('outstation name', nameTextEdit);

            let result = await Post('/parish/add/outstation',
                { outstation: { 'name': nameTextEdit.value } },
                { 'requiresParishDetails': true });
            let msg = result['response'];

            MessegePopup.showMessegePuppy([new MondoText({ 'text': msg })])
            if (msg.match('success') || msg.match('save')) {
                clearTextEdits([nameTextEdit]);
                parishOutstations = await getParishOutstations();
            }
        } catch (error) {
            MessegePopup.showMessegePuppy([MondoText({ 'text': error })])
        }
    }

    const column = Column({
        'children': [nameTextEdit, button],
        'classlist': ['f-w', 'a-c']
    });
    column.style.paddingTop = '30px';

    ModalExpertise.showModal({
        'actionHeading': 'add outstations to your parish',
        'children': [column],
        'fullScreen': false,
        'modalChildStyles': [{ 'width': '400px', 'height': '50%' }]
    });
}

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
                    parishSCCs = await getParishSCCs();
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
                parishMembers = await getParishMembers();
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


function promptAddOffering() {
    const outstationPicker = OutstationPicker({ 'outstations': parishOutstations });
    const dateI = TextEdit({ 'type': 'date' });
    const amountI = TextEdit({ 'placeholder': 'amount' });

    const sourceSelect = MondoSelect({});
    sourceSelect.innerHTML = `
        <option value="Mass" selected>Sunday Offering</option>
        <option value="Outside Mass">Other Offering</option>
    `

    const button = Button({
        'text': 'submit', 'onclick': async function () {
            TextEditValueValidator.validate('outstation', outstationPicker);
            TextEditValueValidator.validate('amount', amountI);
            TextEditValueValidator.validate('date', dateI);

            const body = {
                offering: {
                    outstation_id: JSON.parse(outstationPicker.selectedOptions[0].value)['_id'],
                    source: sourceSelect.selectedOptions[0].value,
                    date: dateI.value,
                    amount: amountI.value,
                }
            }

            let result = await Post('/parish/record/offering', body, { 'requiresParishDetails': true })
            let msg = result['response'];

            MessegePopup.showMessegePuppy([MondoText({ 'text': msg })]);

            if (msg.match('success') || msg.match('save')) {
                clearTextEdits([amountI]);
            }
        }
    })

    const column = Column({
        'classlist': ['f-w', 'f-h', 'a-c'],
        'children': [
            outstationPicker,
            sourceSelect,
            dateI,
            amountI,
            button
        ]
    });

    ModalExpertise.showModal({
        'actionHeading': 'add offering records',
        'modalChildStyles': [{ 'width': '400px', 'height': '400px' }],
        'dismisible': true,
        'children': [column],
    });
}


function showMembersReportsPage() {
    let agridApi;

    const membersGridDiv = domCreate('div');
    addClasslist(membersGridDiv, ['ag-theme-alpine']);
    StyleView(membersGridDiv, [{ 'height': '500px' }]);

    const column = Column({
        'children': [membersGridDiv],
        'styles': [{ 'padding': '20px' }]
    });

    let gridOptions = {
        'columnDefs': [
            {
                'field': 'member_number',
                'headerName': 'NO',
                'filter': true,
            },
            {
                'field': 'name',
                'headerName': 'NAME',
                'filter': true,
            },
            {
                'field': 'date_of_birth',
                'headerName': 'DATE OF BIRTH',
            },
        ],
        'rowData': parishMembers,
        'pagination': true,
        'onRowClicked': function (ev) {
            const member = ev.data;

            const updateIcon = domCreate('i');
            addClasslist(updateIcon, ['bi', 'bi-save'])

            updateIcon.onclick = async function (ev) {
                ev.preventDefault();

                let newDetails = member;

                delete newDetails['outstation']
                delete newDetails['scc']

                let updateResult = await Post('/parish/update/member',
                    { member: newDetails },
                    { 'requiresParishDetails': true });

                MessegePopup.showMessegePuppy([
                    MondoText({ 'text': updateResult['response'] })
                ]);
            }

            ModalExpertise.showModal({
                'actionHeading': member['name'],
                'topRowUserActions': [updateIcon],
                'children': [memberView(member)],
                'modalChildStyles': [{ 'width': '400px', 'height': '600px' }]
            });
        }
    };

    agridApi = agGrid.createGrid(membersGridDiv, gridOptions);

    const resizedView = Column({
        'classlist': ['f-w', 'f-h', 'scroll-y'],
        'children': [column]
    });

    ModalExpertise.showModal({
        'actionHeading': 'MEMBERS',
        'fullScreen': true,
        'children': [resizedView]
    });
}


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

function showAllReportsMenuPage() {
    let selectedOutstationAndSCCMembers;

    const membersIcon = domCreate('i');
    membersIcon.title = 'members';
    addClasslist(membersIcon, ['bi', 'bi-people', 'bi-pad']);

    const offeringsIcon = domCreate('i');
    offeringsIcon.title = 'offering';
    addClasslist(offeringsIcon, ['bi', 'bi-cash-coin', 'bi-pad']);

    const titheIcon = domCreate('i');
    titheIcon.title = 'tithe';
    addClasslist(titheIcon, ['bi', 'bi-gift', 'bi-pad']);

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
        </tr>
    `
    const tbody = domCreate('tbody');
    addChildrenToView(table, [tableHeader, tbody]);

    outstationPicker.addEventListener('change', function (ev) {
        ev.preventDefault();

        sccPicker.replaceChildren([]);

        const outstation = JSON.parse(outstationPicker.value);
        let sccs = parishSCCs.filter(function (scc) {
            return scc['outstation_id'] === outstation['_id']
        });

        for (let i = 0; i < sccs.length; i++) {
            const scc = sccs[i];

            let option = domCreate('option');
            option.innerText = scc['name']
            option.value = JSON.stringify(scc);

            sccPicker.appendChild(option);
        }
        sccPicker.options[0].selected = true;

        selectedOutstationAndSCCMembers = parishMembers.filter(function (member) {
            return member['outstation_id'] === JSON.parse(outstationPicker.selectedOptions[0].value)['_id']
                && member['scc_id'] === JSON.parse(sccPicker.selectedOptions[0].value)['_id']
        });

        tbody.replaceChildren([]);
        for (let i = 0; i < selectedOutstationAndSCCMembers.length; i++) {
            const member = selectedOutstationAndSCCMembers[i];
            const row = domCreate('tr');

            row.innerHTML = `
                <td>${i + 1}</td>
                <td>${member['name']}</td>
                <td>${member['telephone_number']}</td>
            `
            tbody.appendChild(row);
        }
    });

    const membersColumn = Column({
        children: parishMembers.map(function (m) {
            return Column({
                'classlist': ['f-w', 'a-c', 'scroll-y'],
                'children': [
                    outstationPicker,
                    sccPicker,
                    table
                ]
            })
        })
    });

    ModalExpertise.showModal({
        'actionHeading': `reports`,
        'modalHeadingStyles': [{ 'background-color': '#aebdeb' }],
        'children': [membersColumn],
        'fullScreen': true,
        'topRowUserActions': [membersIcon, offeringsIcon, titheIcon]
    });

}

function viewOutstationsPage() {
    const column = VerticalScrollView({
        'classlist': ['f-w', 'a-c', 'just-center'],
        'children': parishOutstations.map(function (outstation) {
            let outstationMembersCount = parishMembers.filter(function (m) {
                return m['outstation_id'] === outstation['_id']
            }).length;

            return Row({
                'classlist': ['space-around', 'a-c', 'outlined'],
                'styles': [{ 'width': '50%' }, { 'margin': '10px' }],
                'children': [
                    MondoBigH3Text({ 'text': outstation['name'] }),
                    MondoText({ 'text': `${outstationMembersCount} members` })
                ]
            });
        })
    });

    ModalExpertise.showModal({
        'modalHeadingStyles': [{ 'background': 'royalblue' }, { 'color': 'white' }],
        'actionHeading': `parish outstations (${parishOutstations.length})`,
        'children': [column],
        'modalChildStyles': [{ 'width': '400px' }],
        'fullScreen': false,
        'dismisible': true,
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