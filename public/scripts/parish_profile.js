import { ModalExpertise } from "./components/actions/modal.js";
import { Button, Column, MondoText, TextEdit, VerticalScrollView } from "./components/UI/cool_tool_ui.js";
import { domCreate, domQueryById } from "./dom/query.js";
import { work } from "./dom/worker.js";
import populateDrawer from "./populate_drawer.js";
import { LocalStorageContract } from "./storage/LocalStorageContract.js";

work(Main);

function Main() {
    populateDrawer.populateDrawer;

    if (LocalStorageContract.parishNotLoggedIn()) {
        ModalExpertise.showModal({
            'actionHeading': 'Log In',
            'children': [MondoText('Loading...')],
            dismisible: false
        });
    }

    setCalendar();
}

function setCalendar() {
    var calendarEl = domQueryById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        dateClick: function (info) {
            if (new Date(info.dateStr) < new Date(Date.UTC()) + 1) {
                return;
            }

            var titleInput = TextEdit({ 'placeholder': 'enter reminder title' });
            var descInput = TextEdit({ 'placeholder': 'enter reminder description' });
            var button = Button({
                'styles': [],
                'classlist': [],
                'text': 'save',
                'onclick': function (ev) {
                    alert('saved event successfully');
                }
            });

            button.style.marginTop = '50px';

            const column = VerticalScrollView({
                'children': [titleInput, descInput, button],
                'classlist': ['m-pad', 'f-w', 'a-c'],
                'styles': []
            });

            ModalExpertise.showModal({
                topRowUserActions: [],
                children: [column],
                actionHeading: 'create new event',
                modalChildStyles: [
                    { 'max-width': '400px' },
                    { 'height': '600px' }
                ]
            });

        }
    });
    calendar.render();
}