import { ParishDataHandle } from "../../data_pen/parish_data_handle.js";
import { domCreate } from "../../dom/query.js";
import { Post } from "../../net_tools.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { Column, MondoText, Row } from "../UI/cool_tool_ui.js";
import { addClasslist } from "../utils/stylus.js";

export function showParishEventsView() {
    const parentView = Column({
        'styles': [{ 'padding': '20px' }],
        'children': []
    });

    ParishDataHandle.allParishEvents.forEach(function (event = { _id: '', title: '', detail: '', date: '' }) {
        console.log(event);

        let deleteIcon = domCreate('i');
        addClasslist(deleteIcon, ['bi', 'bi-trash', 'bi-pad']);

        deleteIcon.onclick = async function (ev) {
            ev.preventDefault();
            const result = await Post('/parish/delete/event',
                { 'event_id': event['_id'] },
                { 'requiresParishDetails': true }
            );

            let msg = result['response'];
            if (msg.match('success') || msg.match('delete')) {
                MessegePopup.showMessegePuppy([MondoText({ 'text': 'event deleted' })]);
                window.location.reload();
            }
            ParishDataHandle.allParishEvents = ParishDataHandle.allParishEvents.filter(function (otherEvents) {
                return otherEvents['_id'] != event['_id'];
            });
        }

        let shareIcon = domCreate('i');
        addClasslist(shareIcon, ['bi', 'bi-share', 'bi-pad']);

        const column = Column({
            'styles': [{ 'border': '1px solid grey' }],
            'children': [
                Row({ 'classlist': ['f-w', 'just-end'], 'children': [shareIcon, deleteIcon,] }),
                MondoText({ 'text': event.title }),
                MondoText({ 'text': event.description }),
                MondoText({
                    'styles': [{ 'font-size': '12px' }, { 'color': 'gainsboro' }],
                    'text': event.start,
                }),
            ]
        });
        parentView.appendChild(column);
    });

    ModalExpertise.showModal({
        'actionHeading': 'parish events',
        'fullScreen': false,
        'modalHeadingStyles': [{ 'background-color': 'royalblue' }],
        'modalChildStyles': [
            { 'min-width': '50%' },
            { 'min-height': '400px' }
        ],
        'children': [parentView],
    })
}