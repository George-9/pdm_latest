import { ParishDataHandle } from "../../data_pen/parish_data_handle.js";
import { addChildrenToView } from "../../dom/addChildren.js";
import { domCreate } from "../../dom/query.js";
import { Post } from "../../net_tools.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { Column, MondoBigH3Text, MondoText, Row } from "../UI/cool_tool_ui.js";
import { addClasslist } from "../utils/stylus.js";

export function showParishEventsView() {
    const allEvents = ParishDataHandle.allParishEvents;
    const parentView = Column({
        'styles': [{ 'padding': '20px' }],
        'children': []
    });

    function setViews() {
        if (allEvents.length < 1) {
            addChildrenToView(parentView,
                [
                    MondoBigH3Text({ 'text': 'no added events yet' }),
                    MondoText({ 'text': '+ add one by clicking on any date on the calendar' })
                ]);
        } else {
            allEvents.forEach(function (event = { _id: '', title: '', detail: '', date: '' }) {
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
                shareIcon.onclick = async function (ev) {
                    if (navigator.canShare) {
                        try {
                            const data = {
                                'title': `${event.title}`,
                                'text': `${event.description} on ${event.start}`,
                                'url': '',
                            }
                            await navigator.share(data);
                        } catch (error) {
                            MessegePopup.showMessegePuppy([MondoText({ 'text': `failed to share event ${error}` })]);
                        }
                    } else {
                        MessegePopup.showMessegePuppy([MondoText({ 'text': 'your browser does not support share feature' })]);
                    }
                }

                const column = Column({
                    'styles': [{ 'border': '1px solid grey' }, { 'padding': '10px' }],
                    'children': [
                        Row({ 'classlist': ['f-w', 'just-end'], 'children': [shareIcon, deleteIcon,] }),
                        MondoText({ 'text': event.title }),
                        MondoText({ 'text': event.description }),
                        MondoText({
                            'styles': [{ 'font-size': '12px' }, { 'color': 'royalblue' }],
                            'text': event.start,
                        }),
                    ]
                });
                parentView.appendChild(column);
            });
        }
    }

    setViews();

    ModalExpertise.showModal({
        'actionHeading': 'parish events',
        'fullScreen': true,
        'modalHeadingStyles': [{ 'background-color': 'royalblue' }, { 'color': 'white' }],
        'children': [parentView],
    })
}