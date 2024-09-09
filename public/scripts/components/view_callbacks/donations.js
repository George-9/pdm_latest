import { ParishDataHandle } from "../../data_pen/parish_data_handle.js";
import { getMemberById, getOutstationSCCs, getSCCMembers, memberGetOutstation, memberGetSCC } from "../../data_pen/puppet.js";
import { getParishOutstations } from "../../data_source/main.js";
import { PRIESTS_COMMUNITY_NAME } from "../../data_source/other_sources.js";
import { addChildrenToView } from "../../dom/addChildren.js";
import { domCreate, domQueryById } from "../../dom/query.js";
import { clearTextEdits } from "../../dom/text_edit_utils.js";
import { Post } from "../../net_tools.js";
import { LocalStorageContract } from "../../storage/LocalStorageContract.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { addPriestCommunityOptionToPicker, OutstationPicker } from "../tailored_ui/outstation_picker.js";
import { ExcelExportButton, PDFPrintButton } from "../tailored_ui/print_button.js";
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
    const donationCommentI = TextEdit({ 'placeholder': 'comment' });
    const unRecognizedMemberNameI = TextEdit({ 'styles': [HIDDEN_STYLE], 'placeholder': 'name' });
    const outstationPicker = OutstationPicker({ 'outstations': ParishDataHandle.parishOutstations });

    donationCategoryPicker.addEventListener('change', function (ev) {
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
                        'outstation_id': outstationPicker.value['id'],
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

export function showDonationsReportsView() {
    let selectedOutstationSCCs = [];
    const tableId = 'tithe-table';

    console.log(ParishDataHandle.parishDonationRecords);

    const viewTotalsForEachSCCButton = domCreate('i');
    StyleView(viewTotalsForEachSCCButton, [{ 'color': 'blue' }])
    addClasslist(viewTotalsForEachSCCButton, ['bi', 'bi-opencollective']);

    let selectedOutstation, selectedSCC, outstationTotalDonationWorth = 0;

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
            <td>WOTH</t>
            `
    tableHeader.appendChild(topRow);

    const tbody = domCreate('tbody');
    const tFooter = domCreate('tfoot');

    addChildrenToView(table, [tableHeader, tbody, tFooter]);

    showOutstationTotalTithe();
    setViews();

    function setViews() {
        selectedOutstationSCCs = getOutstationSCCs(outstationPicker.value);

        tbody.replaceChildren([]);
        PDFPrintButton.printingHeading = `${JSON.parse(selectedOutstation)['name']} DONATIONS' RECORDS`
    }

    function showOutstationTotalTithe() {
        outstationTotalDonationWorth = 0;

        for (let i = 0; i < ParishDataHandle.parishDonationRecords.length; i++) {
            const donationRecord = ParishDataHandle.parishDonationRecords[i];
            const worth = parseFloat(donationRecord['amount'] || 0);

            const row = domCreate('tr');
            row.innerHTML = `
                <td>${i + 1}</td>
                <td>${donationRecord['date']}</td>
                <td>${donationRecord['name'] || getMemberById(donationRecord['member_id'])['name'] || 'unknown member'}</td>
                <td>${donationRecord['member_id'] ? 'yes' : 'no'}</td>
                <td>${donationRecord['comment']}</td>
                <td>${worth}</td>
            `
            tbody.appendChild(row);
        }
    }

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
            // outstationTotalTitheDispensor,
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


    const viewUrecognizedMembersTitheButton = domCreate('i');
    viewUrecognizedMembersTitheButton.title = 'view for unrecognized members';
    addClasslist(viewUrecognizedMembersTitheButton, ['bi', 'bi-incognito'])

    viewUrecognizedMembersTitheButton.onclick = function (ev) {
        const unkownMmebersTitheRecords = ParishDataHandle.parishTitheRecords.filter(function (titheRecord) {
            return titheRecord['category'] === TitheCategory.unknown_member;
        });
        PDFPrintButton.printingHeading = LocalStorageContract.completeParishName() + ' outstations tithe records\''

        const tableId = 'unrecognized-members-tithe-table';
        const table = domCreate('table');
        table.id = tableId;
        const tableHeader = domCreate('thead');
        tableHeader.appendChild(topRow);

        const tbody = domCreate('tbody');
        const tFooter = domCreate('tfoot');

        addChildrenToView(table, [tableHeader, tbody, tFooter]);
        const scrollView = VerticalScrollView({
            'styles': [{ 'margin': '30px' }],
            'children': [table]
        });

        tableHeader.innerHTML = `
            <tr>
                <td>NAME</td>
                <td>DATE</td>
                <td>AMOUNT</td>
            </tr>    
            `

        let totalTitheForUnknownMembers = 0;
        for (let i = 0; i < unkownMmebersTitheRecords.length; i++) {
            const row = domCreate('tr');
            const titheRecord = unkownMmebersTitheRecords[i];

            const amount = parseFloat(titheRecord['amount'] || 0);

            row.innerHTML = `
            <td>${titheRecord['name']}</td>
            <td>${titheRecord['date']}</td>
            <td>${amount}</td>
            `
            tbody.appendChild(row)
            totalTitheForUnknownMembers += amount;
        }

        tFooter.innerHTML = `
            <tr>
                <td colspan="2">TOTAL</td>
                <td>${totalTitheForUnknownMembers}</td>
            </tr>
        `
        const printIcon = new PDFPrintButton(tableId);
        ModalExpertise.showModal({
            'actionHeading': 'tithe records for Unrecognized Members',
            'topRowUserActions': [printIcon],
            'children': [scrollView]
        })

    }

    viewTotalsForEachSCCButton.title = 'print whole parish';
    printButton.title = 'print selection';
    // MAIN MODAL/VIEW
    ModalExpertise.showModal({
        'actionHeading': 'donations',
        'fullScreen': true,
        'topRowUserActions': [
            viewUrecognizedMembersTitheButton,
            viewTotalsForEachSCCButton,
            printButton
        ],
        'children': [mainColumn],
    })
}
