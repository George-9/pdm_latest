import { ParishDataHandle } from "../../data_pen/parish_data_handle.js";
import { getMemberById, getOutstationSCCs, memberGetOutstation, SCCGetTitheRecords } from "../../data_pen/puppet.js";
import { addChildrenToView } from "../../dom/addChildren.js";
import { domCreate, domQueryById } from "../../dom/query.js";
import { clearTextEdits } from "../../dom/text_edit_utils.js";
import { Post } from "../../net_tools.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { OutstationPicker } from "../tailored_ui/outstation_picker.js";
import { Column, MondoText, TextEdit, Button, Row, MondoSelect } from "../UI/cool_tool_ui.js";
import { addClasslist, StyleView } from "../utils/stylus.js";
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

export function showTitheReportsView() {
    let selectedOutstationSCCs = [];

    let outstationTotalTithe = 0, selectedSCCTotalTithe = 0;

    const tmp = ParishDataHandle.parishTitheRecords;
    const outstationPicker = OutstationPicker({ 'outstations': ParishDataHandle.parishOutstations });
    const sccPicker = MondoSelect({});

    const table = domCreate('table');
    StyleView(table, [{ 'width': '400px' }]);
    addClasslist(table, ['txt-c'])

    const tableHeader = domCreate('thead');
    const topRow = domCreate('tr');
    topRow.innerHTML = `
            <td>NO</t>
            <td>DATE</t>
            <td>MEMBER NAME</t>
            <td>AMOUNT</t>
            `
    tableHeader.appendChild(topRow);

    const tbody = domCreate('tbody');
    const tFooter = domCreate('tfoot');

    addChildrenToView(table, [tableHeader, tbody, tFooter]);

    setViews();
    sccPicker.addEventListener('change', function (ev) {
        ev.preventDefault();

        selectedSCCTotalTithe = 0;
        const SCCTitheRecords = SCCGetTitheRecords(sccPicker.value);

        tbody.replaceChildren([]);
        tFooter.replaceChildren([]);

        for (let i = 0; i < SCCTitheRecords.length; i++) {
            const titheRecord = SCCTitheRecords[i];
            let amount = titheRecord['amount'];
            const row = domCreate('tr');
            row.innerHTML = `
            <td>${i + 1}</td>
            <td>${titheRecord['date']}</td>
            <td>${getMemberById(titheRecord['member_id'])['name']}</td>
            <td>${amount}</td>
            `
            selectedSCCTotalTithe += amount;
            tbody.appendChild(row)
        }
        const row = domCreate('tr');
        row.innerHTML = `
            <td colspan="3">TOTAL</td>
            <td>${selectedSCCTotalTithe}</td>
        `
        tFooter.appendChild(row);
    });

    function setViews() {
        selectedOutstationSCCs = getOutstationSCCs(outstationPicker.value);

        sccPicker.replaceChildren([]);
        tbody.replaceChildren([]);

        for (let i = 0; i < selectedOutstationSCCs.length; i++) {
            const SCC = selectedOutstationSCCs[i];
            const option = domCreate('option');
            option.innerText = SCC['name'];
            option.value = JSON.stringify(SCC);

            sccPicker.appendChild(option);
        }
    }


    outstationPicker.addEventListener('change', function (ev) {
        ev.preventDefault();
        setViews();
    })


    const containerColumn = Column({
        'classlist': ['f-w', 'a-c', 'm-pad'],
        'children': [table]
    });
    const mainColumn = Column({
        'children': [
            Row({
                'classlist': ['f-w', 'just-center'],
                'children': [
                    outstationPicker,
                    sccPicker,
                ]
            }),
            containerColumn
        ]
    });

    ModalExpertise.showModal({
        'actionHeading': 'tithe records',
        'children': [mainColumn],
        'fullScreen': true,
        'topRowUserActions': []
    })
}
