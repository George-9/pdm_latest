import { ParishDataHandle } from "../../data_pen/parish_data_handle.js";
import { getOutstationSCCs, getSCCMembers, memberGetOutstation, memberGetSCC } from "../../data_pen/puppet.js";
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

export const TitheCategory = { 'member': 'member', 'unknown_member': 'unkown_member' };
export function promptAddTitheView() {
    let selectedMemberId, searchResultViewContainer;
    const dateId = 'date-el';


    const titheCategoryPicker = MondoSelect({
        'styles': [{
            'margin-bottom': '4px'
        }]
    });
    titheCategoryPicker.innerHTML = `
        <option selected value=${TitheCategory.member}>${TitheCategory.member}</option>
        <option  value=${TitheCategory.unknown_member}>${TitheCategory.unknown_member}</option>
    `

    const memberSearchI = TextEdit({ 'placeholder': 'member name' });
    const unRecognizedMemberNameI = TextEdit({ 'styles': [HIDDEN_STYLE], 'placeholder': 'name' });
    const outstationPicker = OutstationPicker({ 'outstations': ParishDataHandle.parishOutstations });

    titheCategoryPicker.addEventListener('change', function (ev) {
        if (titheCategoryPicker.value === TitheCategory.unknown_member) {
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

    const amountI = TextEdit({ 'placeholder': 'amount' }, { 'keyboardType': 'number' });
    async function saveTitheRecord() {
        try {
            let body;
            TextEditValueValidator.validate('date', dateI);
            TextEditValueValidator.validate('amount', amountI);
            if (titheCategoryPicker.value === TitheCategory.member) {
                if (!selectedMemberId) {
                    return MessegePopup.showMessegePuppy([MondoText({ 'text': 'select a member to continue' })])
                }
                body = {
                    tithe: {
                        'member_id': selectedMemberId,
                        'date': dateI.value,
                        'amount': parseFloat(amountI.value),
                        'category': TitheCategory.member
                    }
                }
            } else {
                TextEditValueValidator.validate('unknown member name', unRecognizedMemberNameI);
                TextEditValueValidator.validate('unknown member name', outstationPicker);
                body = {
                    tithe: {
                        'name': unRecognizedMemberNameI.value,
                        'outstation_id': outstationPicker.value['id'],
                        'date': dateI.value,
                        'amount': parseFloat(amountI.value),
                        'category': TitheCategory.unknown_member
                    }
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
        'styles': [{ 'padding-top': '50px' }, { 'padding': '20px' }],
        'classlist': ['f-w', 'a-c'],
        'children': [
            titheCategoryPicker,
            outstationPicker,
            memberSearchI,
            unRecognizedMemberNameI,
            dateI,
            amountI,
            submitButton,
            searchResultViewContainer
        ]
    });

    ModalExpertise.showModal({
        'actionHeading': 'add tithe record',
        'fullScreen': false,
        'dismisible': true,
        'modalChildStyles': [{ 'min-height': '90vh' }],
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
}

export function showTitheReportsView() {
    let selectedOutstationSCCs = [];
    const tableId = 'tithe-table';

    const viewTotalsForEachSCCButton = domCreate('i');
    StyleView(viewTotalsForEachSCCButton, [{ 'color': 'blue' }])
    addClasslist(viewTotalsForEachSCCButton, ['bi', 'bi-opencollective']);

    let selectedOutstation, selectedSCC, outstationTotalTithe = 0, selectedSCCTotalTithe = 0;

    const outstationPicker = OutstationPicker({ 'outstations': ParishDataHandle.parishOutstations });
    const sccPicker = MondoSelect({});


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
            <td>MEMBER NAME</t>
            <td>AMOUNT</t>
            `
    tableHeader.appendChild(topRow);

    const tbody = domCreate('tbody');
    const tFooter = domCreate('tfoot');

    addChildrenToView(table, [tableHeader, tbody, tFooter]);

    showOutstationTotalTithe();
    setViews();

    sccPicker.addEventListener('change', function (ev) {
        ev.preventDefault();

        PDFPrintButton.printingHeading = LocalStorageContract.completeParishName() + ' ' + (JSON.parse(sccPicker.value))['name'] + ' SCC tithe records'

        selectedSCCTotalTithe = 0;
        const thiSCCMembers = getSCCMembers(sccPicker.value, outstationPicker.value);

        const SCCTitheRecords = [];
        for (let i = 0; i < ParishDataHandle.parishTitheRecords.length; i++) {
            const titheRecord = ParishDataHandle.parishTitheRecords[i];
            for (let i = 0; i < thiSCCMembers.length; i++) {
                const member = thiSCCMembers[i];

                if (titheRecord['member_id'] === member['_id']) {
                    SCCTitheRecords.push({
                        'date': titheRecord['date'],
                        'member': member['name'],
                        'amount': titheRecord['amount']
                    });
                }
            }
        }

        tbody.replaceChildren([]);
        tFooter.replaceChildren([]);

        for (let i = 0; i < SCCTitheRecords.length; i++) {
            const titheRecord = SCCTitheRecords[i];
            let amount = titheRecord['amount'];

            const row = domCreate('tr');
            row.innerHTML = `
            <td>${i + 1}</td>
            <td>${titheRecord['date']}</td>
            <td>${titheRecord['member']}</td>
            <td>${amount}</td>
            `

            selectedSCCTotalTithe += amount;
            tbody.appendChild(row)
        }

        // const row = domCreate('tr');
        // row.innerHTML = `
        //     <td colspan="3">TOTAL</td>
        //     <td>${selectedSCCTotalTithe}</td>
        // `
        // tFooter.appendChild(row);
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

            selectedOutstation = outstationPicker.value;
            selectedSCC = sccPicker.value;
        }

        addPriestCommunityOptionToPicker(sccPicker);
        PDFPrintButton.printingHeading = `${JSON.parse(selectedOutstation)['name']} . ${JSON.parse(selectedSCC)['name']} TITHE RECORDS`
    }

    function showOutstationTotalTithe() {
        outstationTotalTithe = 0;

        for (let i = 0; i < ParishDataHandle.parishTitheRecords.length; i++) {
            const titheRecord = ParishDataHandle.parishTitheRecords[i];
            for (let j = 0; j < ParishDataHandle.parishMembers.length; j++) {
                const member = ParishDataHandle.parishMembers[j];

                const amount = parseFloat(titheRecord['amount']);
                if (titheRecord['member_id'] === member['_id'] && (member['outstation_id'] === outstationPicker.value['_id']
                    || (member['outstation_id'] === JSON.parse(outstationPicker.value)['_id']))) {
                    outstationTotalTithe += amount;
                }
            }
        }
        // outstationTotalTitheDispensor.innerText = `${(JSON.parse(outstationPicker.value))['name']} outstation total ${outstationTotalTithe}`.toUpperCase();
    }

    outstationPicker.addEventListener('change', function (ev) {
        ev.preventDefault();
        showOutstationTotalTithe();
        setViews();
    });

    const printButton = new PDFPrintButton(tableId);

    const containerColumn = Column({
        'classlist': ['f-w', 'a-c', 'scroll-y'],
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
                    sccPicker,
                ]
            }),
            containerColumn
        ]
    });

    viewTotalsForEachSCCButton.onclick = function (ev) {
        const sccInnerTbaleId = 'scc-inner-table-id';
        const printIcon = new PDFPrintButton(sccInnerTbaleId);

        PDFPrintButton.printingHeading = LocalStorageContract.completeParishName() + ' outstations tithe records\''

        const table = domCreate('table');
        table.id = sccInnerTbaleId;
        const tableHeader = domCreate('thead');

        const scrollView = VerticalScrollView({
            'styles': [{ 'margin': '30px' }],
            'children': [table]
        });

        tableHeader.innerHTML = `
        <tr>
            <th>NO</th>
            <th>SCC</th>
            <th>amount</th>
            </tr>
            `
        addChildrenToView(table, [tableHeader]);
        let parishTotalTithe = 0;
        for (let l = 0; l < ParishDataHandle.parishOutstations.length; l++) {
            let outstationTotalTithe = 0;
            const outstation = ParishDataHandle.parishOutstations[l];
            for (let j = 0; j < ParishDataHandle.parishTitheRecords.length; j++) {
                const titheRecord = ParishDataHandle.parishTitheRecords[j];
                let amount = parseFloat(titheRecord['amount']);

                for (let k = 0; k < ParishDataHandle.parishMembers.length; k++) {
                    const member = ParishDataHandle.parishMembers[k];
                    if (member && member['outstation_id'] === outstation['_id'] && member['_id'] === titheRecord['member_id']) {
                        outstationTotalTithe += amount;
                    }
                }
            }
            parishTotalTithe += outstationTotalTithe;
            const row = domCreate('tr');
            if (l % 2 === 0) {
                StyleView(row, [{ 'background-color': '#ffebeb' }])
            }

            row.innerHTML = `
                <td>${l + 1}</td>
                <td>${outstation['name']}</td>
                <td style={ color: 'blue'; }>${outstationTotalTithe}</td>
            `
            addChildrenToView(table, [row]);
        }
        const row = domCreate('tr');
        row.innerHTML = `
            <td colspan="2">TOTAL</td>
            <td style={ color: 'blue'; }>${parishTotalTithe}</td>
        `
        addChildrenToView(tFooter, [row]);
        addChildrenToView(table, [tFooter]);

        const tbody = domCreate('tbody');
        addChildrenToView(table, [tableHeader, tbody]);
        const excelExportButton = ExcelExportButton(tableId, ParishDataHandle.parishTitheRecords)

        ModalExpertise.showModal({
            'fullScreen': false,
            'dismisible': true,
            'topRowUserActions': [excelExportButton, printIcon],
            'actionHeading': 'parish tithe records',
            'children': [scrollView]
        });
    }

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
        'actionHeading': 'tithe records',
        'fullScreen': true,
        'topRowUserActions': [
            viewUrecognizedMembersTitheButton,
            viewTotalsForEachSCCButton,
            printButton
        ],
        'children': [mainColumn],
    })
}
