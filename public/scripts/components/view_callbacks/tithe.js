import { ParishDataHandle } from "../../data_pen/parish_data_handle.js";
import { addChildrenToView } from "../../dom/addChildren.js";
import { domQueryById } from "../../dom/query.js";
import { clearTextEdits } from "../../dom/text_edit_utils.js";
import { Post } from "../../net_tools.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { Column, MondoText, TextEdit, Button, Row } from "../UI/cool_tool_ui.js";
import { TextEditValueValidator } from "../utils/textedit_value_validator.js";


export function promptAddTitheView() {
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
        'modalHeadingStyles': [{ 'background-color': 'green' }, { 'color': 'white' }],
        'children': [memberSearchView]
    });


    memberSearchI.addEventListener('input', function (ev) {
        ev.preventDefault();

        const searchKey = memberSearchI.value;
        let match = ParishDataHandle.parishMembers.filter(function (member) {
            return (
                `${member['name']}`.match(searchKey)
                || `${member['member_number']}`.match(searchKey)
            )
        });

        if (match) {
            match = match.map(function (member) {
                return {
                    _id: member['_id'],
                    'name': member['name'],
                    'telephone_number': member['telephone_number'] || '_',
                    'outstation': ParishDataHandle.parishOutstations.find(function (scc) {
                        return scc['_id'] === member['outstation_id'];
                    })['name'],
                    'scc': ParishDataHandle.parishSCCs.find(function (scc) {
                        return scc['_id'] === member['scc_id'];
                    })['name'],
                }
            });
        }

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

export function TitheReportsView() {
}
