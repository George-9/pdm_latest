import { ParishDataHandle } from "../../data_pen/parish_data_handle.js";
import { getMemberById, getOutstationById, getOutstationSCCs, getSCCMembers, memberGetOutstation, memberGetSCC } from "../../data_pen/puppet.js";
import { PRIESTS_COMMUNITY_NAME } from "../../data_source/other_sources.js";
import { addChildrenToView } from "../../dom/addChildren.js";
import { domCreate, domQueryById } from "../../dom/query.js";
import { clearTextEdits } from "../../dom/text_edit_utils.js";
import { Post } from "../../net_tools.js";
import { LocalStorageContract } from "../../storage/LocalStorageContract.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { OutstationPicker } from "../tailored_ui/outstation_picker.js";
import { PDFPrintButton } from "../tailored_ui/print_button.js";
import { Column, MondoText, TextEdit, Button, Row, MondoSelect, VerticalScrollView, HorizontalScrollView } from "../UI/cool_tool_ui.js";
import { HIDDEN_STYLE, VIEWING_STYLE } from "../UI/view_standards.js";
import { addClasslist, StyleView } from "../utils/stylus.js";
import { TextEditValueValidator } from "../utils/textedit_value_validator.js";

export const donationCategory = { 'member': 'member', 'unknown_member': 'unkown_member' };

export function promptAddDonationsView() {
    let selectedMemberId, searchResultViewContainer;
    const dateId = 'date-el';

    const donationCategoryPicker = MondoSelect({ 'styles': [{ 'margin-bottom': '4px' }] });
    donationCategoryPicker.innerHTML = `
        <option selected value=${donationCategory.member}>${donationCategory.member}</option>
        <option  value=${donationCategory.unknown_member}>${donationCategory.unknown_member}</option>
    `

    const memberSearchI = TextEdit({ 'placeholder': 'member name' });
    const donationCommentI = TextEdit({ 'placeholder': 'comment e.g; cash, cheque, a lorry of furniture' });
    const unRecognizedMemberNameI = TextEdit({ 'styles': [HIDDEN_STYLE], 'placeholder': 'name' });
    const outstationPicker = OutstationPicker({ 'outstations': ParishDataHandle.parishOutstations });

    donationCategoryPicker.addEventListener('change', function () {
        if (donationCategoryPicker.value === donationCategory.unknown_member) {
            StyleView(memberSearchI, [HIDDEN_STYLE]);
            StyleView(unRecognizedMemberNameI, [VIEWING_STYLE]);
            StyleView(outstationPicker, [VIEWING_STYLE]);
        } else {
            StyleView(memberSearchI, [VIEWING_STYLE]);
            StyleView(unRecognizedMemberNameI, [HIDDEN_STYLE]);
            StyleView(outstationPicker, [HIDDEN_STYLE]);
        }
    })

    const dateI = TextEdit({ 'type': 'date' });
    dateI.id = dateId;

    const worthAmountI = TextEdit({ 'placeholder': 'worth/amount in KSH' }, { 'keyboardType': 'number' });
    async function saveTitheRecord() {
        try {
            let body;
            TextEditValueValidator.validate('date', dateI);
            TextEditValueValidator.validate('amount', worthAmountI);
            if (donationCategoryPicker.value === donationCategory.member) {
                if (!selectedMemberId) {
                    return MessegePopup.showMessegePuppy([MondoText({ 'text': 'select a member to continue' })])
                }
                body = {
                    donation: {
                        'member_id': selectedMemberId,
                        'date': dateI.value,
                        'worth': parseFloat(worthAmountI.value),
                        'comment': donationCommentI.value || '',
                        'category': donationCategory.member
                    }
                }
            } else {
                TextEditValueValidator.validate('member name', unRecognizedMemberNameI);
                TextEditValueValidator.validate('outstation', outstationPicker);
                body = {
                    donation: {
                        'name': unRecognizedMemberNameI.value,
                        'outstation_id': (JSON.parse(outstationPicker.value))['_id'],
                        'comment': donationCommentI.value || '',
                        'date': dateI.value,
                        'worth': parseFloat(worthAmountI.value),
                        'category': donationCategory.unknown_member
                    }
                }
            }

            let result = await Post('/parish/add/donation/record', body, { 'requiresParishDetails': true })
            let msg = result['response'];

            MessegePopup.showMessegePuppy([MondoText({ 'text': msg })]);
            if (msg.match('success') || msg.match('save')) {
                clearTextEdits([memberSearchI, worthAmountI, unRecognizedMemberNameI, dateI, worthAmountI]);
            }
        } catch (error) {
            MessegePopup.showMessegePuppy([MondoText({ 'text': error })]);
        }
    }

    const submitButton = Button({ 'text': 'submit', onclick: saveTitheRecord });

    searchResultViewContainer = Column({ 'classlist': ['f-h', 'f-w', 'scroll-y'], 'children': [] });

    const memberSearchView = Column({
        'styles': [{ 'padding-top': '50px' }, { 'min-width': '60vh' }],
        'classlist': ['f-w', 'a-c'],
        'children': [
            donationCategoryPicker,
            outstationPicker,
            memberSearchI,
            unRecognizedMemberNameI,
            donationCommentI,
            dateI,
            worthAmountI,
            submitButton,
            searchResultViewContainer
        ]
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
                let outstation = memberGetOutstation(member);
                const scc = memberGetSCC(member);

                return {
                    _id: member['_id'],
                    'name': member['name'],
                    'telephone_number': member['telephone_number'] || '_',
                    'outstation': outstation ? outstation['name'] : PRIESTS_COMMUNITY_NAME,
                    'scc': scc['name'],
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


    ModalExpertise.showModal({
        'actionHeading': 'add donation record',
        'fullScreen': false,
        'dismisible': true,
        'modalChildStyles': [{ 'min-height': '90vh' }],
        'modalHeadingStyles': [{ 'background-color': '#ff647f' }, { 'color': 'white' }],
        'children': [memberSearchView]
    });
}

export function showDonationsWithOutstaionsReportsView() {
    const tableId = 'tithe-table';
    var outstationTotalDonationWorth = 0;

    console.log(ParishDataHandle.parishDonationRecords);

    const viewTotalsForEachSCCButton = domCreate('i');
    StyleView(viewTotalsForEachSCCButton, [{ 'color': 'blue' }])
    addClasslist(viewTotalsForEachSCCButton, ['bi', 'bi-opencollective']);

    let selectedOutstation;

    const outstationPicker = OutstationPicker({ 'outstations': ParishDataHandle.parishOutstations });
    selectedOutstation = outstationPicker.value;

    const table = domCreate('table');
    table.id = tableId;
    StyleView(table, [{ 'width': '80%' }]);
    addClasslist(table, ['txt-c', 'f-w']);
    StyleView(table, [{ 'width': 'max-content' }]);

    const tableHeader = domCreate('thead');
    const topRow = domCreate('tr');
    topRow.innerHTML = `
    <td>NO</t>
    <td>DATE</t>
    <td>CONTRIBUTOR</t>
    <td>KNOWN MEMBER</t>
    <td>COMMENT</t>
    <td>WORTH</t>
            `
    tableHeader.appendChild(topRow);

    const tbody = domCreate('tbody');
    const tFooter = domCreate('tfoot');

    addChildrenToView(table, [tableHeader, tbody, tFooter]);

    showOutstationTotalTithe();
    setViews();

    function setViews() {
        tbody.replaceChildren([]);
        PDFPrintButton.printingHeading = `${JSON.parse(selectedOutstation)['name']} DONATIONS' RECORDS`
    }

    function showOutstationTotalTithe() {
        let filteredWithOutstations;
        outstationTotalDonationWorth = 0;

        setViews();
        selectedOutstation = outstationPicker.value;

        // DONATIONS FROM PARISH MEMBERS
        filteredWithOutstations = ParishDataHandle.parishDonationRecords.filter(function (donationRecord) {
            return (donationRecord['member_id'] && donationRecord['member_id'].length > 0);
        });

        filteredWithOutstations = filteredWithOutstations.filter(function (record) {
            const outstation = memberGetOutstation(getMemberById(record['member_id']));
            record.outstation = outstation['name']
            return outstation['_id'] === (JSON.parse(selectedOutstation))['_id'];
        });

        for (let i = 0; i < filteredWithOutstations.length; i++) {
            const donationRecord = filteredWithOutstations[i];
            const worth = parseFloat(donationRecord['worth'] || 0);

            const row = domCreate('tr');
            row.innerHTML = `
                <td>${i + 1}</td>
                <td>${donationRecord['date']}</td>
                <td>${donationRecord['name'] || getMemberById(donationRecord['member_id'])['name'] || 'unknown member'}</td>
                <td>${donationRecord['comment']}</td>
                <td>${worth}</td>
            `
            tbody.appendChild(row);
            outstationTotalDonationWorth += worth;
        }
    }

    tFooter.innerHTML = `
        <tr>
            <td colspan="3">NET WORTH</td>
            <td> ${outstationTotalDonationWorth}</td>
        </tr>
    `

    outstationPicker.addEventListener('change', function (ev) {
        ev.preventDefault();
        setViews();
        showOutstationTotalTithe();
    });

    const printButton = new PDFPrintButton(tableId);
    const containerColumn = Column({
        'classlist': ['f-w', 'a-c', 'scroll-y'],
        'styles': [{ 'margin': '10px' }],
        'children': [
            HorizontalScrollView({
                'classlist': ['a-c', 'just-center'],
                'children': [table]
            }),
        ]
    });

    const mainColumn = Column({
        'children': [
            Column({
                'classlist': ['f-w', 'just-center', 'a-c'],
                'children': [
                    outstationPicker,
                ]
            }),
            containerColumn
        ]
    });


    viewTotalsForEachSCCButton.title = 'print whole parish';
    printButton.title = 'print selection';

    // MAIN MODAL/VIEW
    ModalExpertise.showModal({
        'actionHeading': 'donations',
        'fullScreen': true,
        'topRowUserActions': [printButton],
        'children': [mainColumn],
    })
}

export function showDonationsForUnrecognizedMembersReportsView() {
    let outsideDonationTotalWorth = 0;

    const tableId = 'tithe-table';

    const table = domCreate('table');
    table.id = tableId;
    StyleView(table, [{ 'width': '80%' }]);
    addClasslist(table, ['txt-c', 'f-w']);
    StyleView(table, [{ 'width': 'max-content' }]);

    const tableHeader = domCreate('thead');
    const topRow = domCreate('tr');
    topRow.innerHTML = `
            <td>NO</t>
            <td>DATE</t>
            <td>CONTRIBUTOR</t>
            <td>GIVEN IN (OUTSTATION)</t>
            <td>COMMENT</t>
            <td>OUTSTATION</t>
            <td>WORTH</t>
            `
    tableHeader.appendChild(topRow);

    const tbody = domCreate('tbody');
    const tFooter = domCreate('tfoot');

    addChildrenToView(table, [tableHeader, tbody, tFooter]);

    function setViews() {
        PDFPrintButton.printingHeading = `${LocalStorageContract.completeParishName()} DONATIONS' RECORDS`.toUpperCase()
    }

    setViews();
    showOutstationTotalTithe();

    function showOutstationTotalTithe() {
        // DONATIONS FROM PARISH MEMBERS
        const filteredWithOutstations = ParishDataHandle.parishDonationRecords.filter(function (donationRecord) {
            return !(donationRecord['member_id']);
        });

        for (let i = 0; i < filteredWithOutstations.length; i++) {
            const donationRecord = filteredWithOutstations[i];
            const worth = parseFloat(donationRecord['worth'] || 0);

            const row = domCreate('tr');
            row.innerHTML = `
                <td>${i + 1}</td>
                <td>${donationRecord['date']}</td>
                <td>${donationRecord['name']}</td>
                <td>${getOutstationById(donationRecord['outstation_id'])['name']}</td>
                <td>${donationRecord['comment']}</td >
                <td>${(getOutstationById(donationRecord['outstation_id']))['name']}</td >
                <td>${worth}</td>
        `
            tbody.appendChild(row);
            outsideDonationTotalWorth += worth;
        }
    }

    const row = domCreate('tr');
    row.innerHTML = `
        <td colspan="6">TOTAL</td>
        <td>${outsideDonationTotalWorth}</td>
    `
    tFooter.appendChild(row);

    const printButton = new PDFPrintButton(tableId);

    const containerColumn = Column({
        'classlist': ['f-w', 'a-c', 'scroll-y'],
        'styles': [{ 'margin': '10px' }],
        'children': [
            HorizontalScrollView({
                'classlist': ['a-c', 'just-center'],
                'children': [table]
            }),
        ]
    });

    const mainColumn = Column({
        'children': [containerColumn]
    });

    printButton.title = 'print';
    // MAIN MODAL/VIEW
    ModalExpertise.showModal({
        'actionHeading': 'donations',
        'fullScreen': true,
        'topRowUserActions': [printButton],
        'children': [mainColumn],
    })
}
