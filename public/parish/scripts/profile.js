import { CREATE_ELEMENT, GET_EL_BY_ID, RESET_INPUTS } from "../../tools/dom.js";
import { MessegePopup } from "../../tools/messegePopup.js";
import { ModalExpertise } from "../../tools/modal.js";
import { NetTool } from "../../tools/netTool.js";
import { LocalStorageContract } from "../../tools/storage.js";
import { IS_NULL_OR_EMPTY } from "../../tools/stringUtils.js";
import { RegisterMember } from "./registerMemberAction.js";

const parishDetails = LocalStorageContract.STORED_PARISH_CREDENTIALS();
let parishEvents, parishReminders, calendar;

document.addEventListener('DOMContentLoaded', (ev) => {
    ev.preventDefault();

    Main().then(() => {
        var calendarEl = document.getElementById('calendar');
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            dateClick: function (info) {
                if (new Date(info.dateStr) < new Date(Date.UTC()) + 1) {
                    return;
                }

                InvokeAddEvent(info.dateStr);
            }
        });
        calendar.render();
    });
});


const parishEventsDiv = GET_EL_BY_ID('parish-events');
const parishRemindersDiv = GET_EL_BY_ID('parish-reminders');

async function Main() {
    LoadData().then(async () => await DisplayProfileDetails());

    GET_EL_BY_ID('events-btn').onclick = async (ev) => {
        ev.preventDefault();
        await DisplayEvents()
    }

    GET_EL_BY_ID('reminders-btn').onclick = async (ev) => {
        ev.preventDefault();
        await DisplayReminders()
    }
    GET_EL_BY_ID('register-member').onclick = RegisterMember
}


const InvokeAddEvent = (date) => {
    const addEventsDiv = CREATE_ELEMENT('div');
    addEventsDiv.classList.add('flex-column', 'align-center');
    addEventsDiv.style.fontSize = '28px';
    addEventsDiv.style.fontWeight = '300';

    const eventTitle = CREATE_ELEMENT('input');
    eventTitle.placeholder = 'title';

    const eventDetails = CREATE_ELEMENT('input');
    eventDetails.placeholder = 'details';

    const registerButton = CREATE_ELEMENT('button');
    registerButton.innerText = 'save';

    registerButton.onclick = async (ev) => {
        ev.preventDefault();
        const eventData = {
            'parish_id': parishDetails['id'],
            'date': date,
            'event_name': eventTitle.value,
            'event_details': eventDetails.value
        }

        for (const key in eventData) {
            if (Object.hasOwnProperty.call(eventData, key)) {
                if (IS_NULL_OR_EMPTY(eventData[key])) {
                    return MessegePopup.ShowMessegePuppy(`all feilds are required, missing: ${key.split('_').join(' ')}`)
                }
            }
        }


        var result = await NetTool.POST_CLIENT(
            '/add/event',
            NetTool.CMMN_HEADERS.JSON_CONTENT_TYPE,
            JSON.stringify(eventData)
        );

        const msg = (await result.json())['response'];
        if (msg === 'success') {
            RESET_INPUTS(date, eventTitle, eventDetails);
        }

        MessegePopup.ShowMessegePuppy(msg);
    }

    addEventsDiv.append(eventTitle, eventDetails, registerButton);
    ModalExpertise.ShowModal('create event on ' + new Date(date).toDateString(), addEventsDiv, {
        modalChildStylesClassList: []
    });
}

// const InvokeAddReminder = (ev) => {
//     const addRemindersDiv = CREATE_ELEMENT('div');
//     addRemindersDiv.classList.add('flex-column', 'align-center');
//     addRemindersDiv.style.fontSize = '28px';
//     addRemindersDiv.style.fontWeight = '300';

//     const reminderTitle = CREATE_ELEMENT('input');
//     reminderTitle.placeholder = 'title';

//     const reminderDetails = CREATE_ELEMENT('input');
//     reminderDetails.placeholder = 'details';

//     const saveButton = CREATE_ELEMENT('button');
//     saveButton.innerText = 'save';

//     saveButton.onclick = async (ev) => {
//         ev.preventDefault();
//         const eventData = {
//             'parish_id': parishDetails['id'],
//             'reminder_title': reminderTitle.value,
//             'reminder_detail': reminderDetails.value
//         }

//         for (const key in eventData) {
//             if (Object.hasOwnProperty.call(eventData, key)) {
//                 if (IS_NULL_OR_EMPTY(eventData[key])) {
//                     return MessegePopup.ShowMessegePuppy(`all feilds are required, missing: ${key.split('_').join(' ')}`)
//                 }
//             }
//         }


//         var result = await NetTool.POST_CLIENT(
//             '/add/reminder',
//             NetTool.CMMN_HEADERS.JSON_CONTENT_TYPE,
//             JSON.stringify(eventData)
//         );

//         const msg = (await result.json())['response'];

//         if (msg === 'success') {
//             RESET_INPUTS(reminderTitle, reminderDetails);
//         }
//         MessegePopup.ShowMessegePuppy(msg);
//     }

//     addRemindersDiv.append(reminderTitle, reminderDetails, saveButton);
//     ModalExpertise.ShowModal('create event', addRemindersDiv, {
//         modalChildStylesClassList: []
//     });
// }


async function LoadData() {
    const body = { 'parish_id': parishDetails['id'] };

    parishEvents = await (await NetTool.POST_CLIENT('/get/events',
        NetTool.CMMN_HEADERS.JSON_CONTENT_TYPE,
        JSON.stringify(body))
    ).json()

    var events = parishEvents.map(function (event) {
        return {
            'title': event['event_name'],
            'start': event['date']
        }
    });

    console.log(events);
    calendar.addEventSource(events);

    parishReminders = await (await NetTool.POST_CLIENT('/get/reminders',
        NetTool.CMMN_HEADERS.JSON_CONTENT_TYPE,
        JSON.stringify(body))
    ).json()
}


async function DisplayEvents() {
    if (!parishEvents || parishEvents.length < 1) {
        const notifyNoEvents = CREATE_ELEMENT('p');
        notifyNoEvents.innerText = 'no saved events'

        parishEventsDiv.appendChild(notifyNoEvents)
    } else {
        const parishEventsListDiv = CREATE_ELEMENT('div');

        for await (const parishEvent of parishEvents) {
            const eventCont = CREATE_ELEMENT('div');
            eventCont.style.borderBottom = '1px solid grey';
            eventCont.style.padding = '3px';
            eventCont.style.margin = '3px';
            eventCont.style.width = '100%';

            const dateV = CREATE_ELEMENT('p');
            dateV.style.color = 'royalblue';
            dateV.style.fontSize = '12px';

            const nameV = CREATE_ELEMENT('h3')
            const detailV = CREATE_ELEMENT('p')

            nameV.style.fontWeight = '100'

            dateV.innerText = parishEvent['date']
            nameV.innerText = parishEvent['event_name']
            detailV.innerText = parishEvent['event_details']

            eventCont.append(dateV, nameV, detailV)

            parishEventsListDiv.appendChild(eventCont);
        }

        ModalExpertise.ShowModal('events', parishEventsListDiv, {
            modalChildStylesClassList: ['flex-column', 'align-center']
        });
    }
}

async function DisplayReminders() {
    if (!parishReminders || parishReminders.length < 1) {
        const notifyNoReminders = CREATE_ELEMENT('p');
        notifyNoReminders.innerText = 'no saved events'

        parishRemindersDiv.appendChild(notifyNoReminders)
    } else {
        const parishRemindersListDiv = CREATE_ELEMENT('div');

        for await (const parishReminder of parishReminders) {
            const reminderCont = CREATE_ELEMENT('div');
            reminderCont.style.borderBottom = '1px solid grey';
            reminderCont.style.padding = '3px';
            reminderCont.style.margin = '3px';
            reminderCont.style.width = '100%';

            const nameV = CREATE_ELEMENT('p');
            const detailV = CREATE_ELEMENT('p');

            nameV.innerText = parishReminder['reminder_title']
            detailV.innerText = parishReminder['reminder_detail']

            reminderCont.append(nameV, detailV)

            parishRemindersListDiv.appendChild(reminderCont);
        }

        ModalExpertise.ShowModal('reminders', parishRemindersListDiv, {
            modalChildStylesClassList: ['flex-column', 'align-center']
        });
    }
}


async function DisplayProfileDetails() {
    GET_EL_BY_ID('profile-details').innerText = 'Parish • ' + parishDetails['name'];

    const notifyEvents = CREATE_ELEMENT('span');
    if (!parishEvents || parishEvents.length < 1) {
        notifyEvents.innerText = 'no saved events'

        parishEventsDiv.appendChild(notifyEvents);
    } else {
        notifyEvents.innerText = (parishEvents.length + ' coming up event' + (() => parishEvents.length > 1 ? ' s' : '')());
        parishEventsDiv.appendChild(notifyEvents);
    }

    await LoadAndShowRemindersCount()
}



async function LoadAndShowRemindersCount() {
    const parishRemindersDiv = GET_EL_BY_ID('parish-reminders');
    const body = { 'parish_id': parishDetails['id'] };

    const parishReminders = await (await NetTool.POST_CLIENT('/get/reminders',
        NetTool.CMMN_HEADERS.JSON_CONTENT_TYPE,
        JSON.stringify(body))
    ).json()


    const notifyReminders = CREATE_ELEMENT('span');
    if (!parishReminders || parishReminders.length < 1) {
        notifyReminders.innerText = 'no saved reminders'

        parishRemindersDiv.appendChild(notifyReminders);
    } else {
        notifyReminders.innerText = (parishReminders.length + ' reminder' + (() => parishReminders.length > 1 ? ' s' : '')());
        parishRemindersDiv.appendChild(notifyReminders);
    }
}


// async function DisplayMembers() {
//     let gridApi;
//     const membersSpreadSheetDiv = CREATE_ELEMENT('div');
//     membersSpreadSheetDiv.id = 'ms-view'
//     const gridOptions = {
//         columnDefs: {
//             'field': 'name',
//             'field': 'dob',
//             'field': 'home_address',
//         }
//     }

//     fetch('/load/members', {
//         'method': 'POST',
//         'body': {
//             'id': LocalStorageContract.STORED_PARISH_ID()
//         }
//     })
//         .then((response) => response.json())
//         .then(data => {
//             console.log('data::', data);
//             gridOptions.rowData = data;
//             gridApi = agGrid.createGrid(membersSpreadSheetDiv, gridOptions)
//         })
// ModalExpertise.ShowModal('members', , {
//     'modalChildStylesClassList': []
//     , 'onClickModalChild': () => { }
//     , 'onDisMiss': () => { }
// });
// }



if (GET_EL_BY_ID('more')) {
    GET_EL_BY_ID('more').onclick = (ev) => {
        ev.preventDefault();

        var p = CREATE_ELEMENT('p');
        p.innerText = 'HTML';

        ModalExpertise.ShowModal('Animation Modal', p, { modalChildStylesClassList: ['flex-column'] });
    }
}