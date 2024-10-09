import { mapValuesToUppercase } from "../../../global_tools/objects_tools.js";
import { ParishDataHandle } from "../../data_pen/parish_data_handle.js";
import { getOutstationMembers, getOutstationSCCs, getSCCMembersFromList } from "../../data_pen/puppet.js";
import { getParishSCCs } from "../../data_source/main.js";
import { PRIESTS_COMMUNITY_NAME } from "../../data_source/other_sources.js";
import { addChildrenToView } from "../../dom/addChildren.js";
import { domCreate } from "../../dom/query.js";
import { clearTextEdits } from "../../dom/text_edit_utils.js";
import { Post } from "../../net_tools.js";
import { marginRuleStyles } from "../../parish_profile.js";
import { LocalStorageContract } from "../../storage/LocalStorageContract.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { OutstationPicker } from "../tailored_ui/outstation_picker.js";
import { PDFPrintButton } from "../tailored_ui/print_button.js";
import { Column, MondoText, TextEdit, Button, HorizontalScrollView } from "../UI/cool_tool_ui.js";
import { StyleView } from "../utils/stylus.js";
import { TextEditValueValidator } from "../utils/textedit_value_validator.js";

export function promptAddSCCView() {
    const sccNameI = TextEdit({ 'placeholder': 'scc name' });
    const outstationPicker = OutstationPicker({
        'styles': marginRuleStyles,
        'onchange': function (ev) {
        },
        'outstations': ParishDataHandle.parishOutstations
    });
    // Feast date picker
    const feastDateI = TextEdit({ 'type': 'date' });

    const button = Button({
        'styles': marginRuleStyles,
        'text': 'submit',
        'onclick': async function (ev) {
            try {
                const outstationId = JSON.parse(outstationPicker.value)['_id'];

                TextEditValueValidator.validate('SCC name', sccNameI);
                TextEditValueValidator.validate('Feast date', feastDateI);

                const body = {
                    'scc': {
                        'name': sccNameI.value,
                        'outstation_id': outstationId,
                        'feast_date': feastDateI.value
                    }
                };

                let result = await Post('/parish/add/scc',
                    mapValuesToUppercase(body),
                    { 'requiresParishDetails': true });
                let msg = result['response'];

                MessegePopup.showMessegePuppy([MondoText({ 'text': msg })]);
                if (msg.match('success' || msg.match('save'))) {
                    clearTextEdits([sccNameI]);
                    ParishDataHandle.parishSCCs = await getParishSCCs();
                }
            } catch (error) {
                MessegePopup.showMessegePuppy([MondoText({ 'text': error })]);
            }
        }
    })

    const column = Column({
        'styles': marginRuleStyles,
        'classlist': ['f-w', 'f-c', 'a-c', 'm-paad'],
        'children': [
            sccNameI,
            outstationPicker,
            MondoText({ 'text': 'feast date' }),
            feastDateI,
            button
        ]
    });

    StyleView(column, [{ 'padding': '10px' }]);
    ModalExpertise.showModal({
        'actionHeading': 'add an SCC',
        'modalHeadingStyles': [{ 'background-color': '#ff9999' }, { 'color': 'cornsilk' }],
        'modalChildStyles': [{ 'min-height': 'fit-content' }, { 'min-width': 'fit-content' }],
        'children': [column],
        'fullScreen': false,
        'dismisible': true
    });
}

export function viewSCCsPage() {
    const tableId = 'sccs-table';

    const table = domCreate('table');
    table.id = tableId;

    const thead = domCreate('thead');
    const tbody = domCreate('tbody');
    const tfoot = domCreate('tfoot');

    thead.innerHTML = `
        <tr>
            <td>NO</td>
            <td>SCC</td>
            <td>OUTSTATION</td>
            <td>FEAST DATE</td>
            <td>MEMBER COUNT</td>
            <td>VIEW</td>
        </tr>
    `
    addChildrenToView(table, [thead, tbody, tfoot]);
    const data = [];

    ParishDataHandle.parishSCCs.forEach(function (scc, i) {
        let outstation = ParishDataHandle.parishOutstations.find(function (o) {
            return o['_id'] === scc['outstation_id']
        }) || { 'name': 'EVERY OUTSTATION' };

        let membersCount = ParishDataHandle.parishMembers.filter(function (m) {
            return m['scc_id'] === scc['_id']
        }).length;

        data.push({
            '_id': scc['_id'],
            'scc_name': scc['name'],
            'feast_date': scc['feast_date'] ?? 'not set',
            'outstation_name': outstation['name'],
            'members_count': membersCount
        });
    });

    let sortedData = data.sort(function (a, b) {
        return `${b['outstation_name']}`.localeCompare(a['outstation_name']);
    });

    function loadView() {
        PDFPrintButton.printingHeading = `${LocalStorageContract.completeParishName()} SMALL CHRISTIAN COMMUNITIES`
        sortedData.forEach(function (data, i) {
            const row = domCreate('tr');
            row.innerHTML = `
            <td>${i + 1}</td>
            <td>${data['scc_name']}</td>
            <td>${data['outstation_name']}</td>
            <td>${data['feast_date'] ?? 'not set'}</td>
            <td>${data['members_count']}</td>
            `
            const editView = domCreate('td');
            editView.innerHTML = `
            <i class="bi bi-pencil-square"></i>
            `
            editView.onclick = function (ev) {
                ModalExpertise.hideModal();
                ViewSCC(data);
            }

            row.appendChild(editView);

            table.appendChild(row);
        });
    }

    loadView()

    const lastRow = domCreate('tr');
    lastRow.innerHTML = `
        <td colspan="4">TOTAL</td>
        <td>${ParishDataHandle.parishMembers.length}</td>
    `
    tfoot.appendChild(lastRow)

    const column = Column({
        'classlist': ['f-w', 'a-c', 'scroll-y'],
        'styles': [{ 'padding': '10px' }],
        'children': [table]
    });

    ModalExpertise.showModal({
        'actionHeading': `Small Christian Communities (${ParishDataHandle.parishSCCs.length})`,
        'modalHeadingStyles': [{ 'background-color': 'royalblue' }, { 'color': 'white' }],
        'topRowUserActions': [new PDFPrintButton(tableId)],
        'children': [column],
        'modalChildStyles': [{ 'width': 'fit-content' }, { 'height': '90%' }],
        'fullScreen': false,
        'dismisible': true,
    });
}

export function showFilterebleSCCsPage() {
    const tableId = 'sccs-table';

    const table = domCreate('table');
    table.id = tableId;

    const tbody = domCreate('tbody');
    const tfoot = domCreate('tfoot');
    const thead = domCreate('thead');

    thead.innerHTML = `
        <tr>
            <td>NO</td>
            <td>SCC</td>
            <td>FEAST DATE</td>
            <td>MEMBER COUNT</td>
            </tr>
            `
    addChildrenToView(table, [thead, tbody, tfoot]);

    const outstationPicker = OutstationPicker({ 'outstations': ParishDataHandle.parishOutstations });
    outstationPicker.addEventListener('change', function (ev) {
        setSCCs()
    })

    function setSCCs() {
        let selectedOutstation = outstationPicker.value;
        let selectedOutstationSCCs = getOutstationSCCs(selectedOutstation);

        PDFPrintButton.printingHeading = `${(JSON.parse(selectedOutstation))['name']} Outstation Small Christian Communities`.toUpperCase();

        console.log(selectedOutstationSCCs);
        console.log(selectedOutstation);

        tbody.replaceChildren([]);
        tfoot.replaceChildren([]);

        let count;
        selectedOutstationSCCs.forEach(function (scc, i) {
            let members = getSCCMembersFromList(getOutstationMembers(selectedOutstation), scc).length || 0;

            const row = domCreate('tr');
            row.innerHTML = `
                <td>${i + 1}</td>
                <td>${scc['name']}</td>
                <td>${scc['feast_date'] ?? 'not set'}</td>
                <td>${members}</td>
            `
            tbody.appendChild(row);
            count = i;
        });

        const priestCommunityRow = domCreate('tr');
        priestCommunityRow.innerHTML = `
        <td>${count + 2}</td>
        <td>${PRIESTS_COMMUNITY_NAME}</td>
        <td>${getOutstationMembers(selectedOutstation).filter(function (member) {
            return member['scc_id'] === PRIESTS_COMMUNITY_NAME
        }).length}</td>
        `
        tbody.appendChild(priestCommunityRow);

        const lastRow = domCreate('tr');
        lastRow.innerHTML = `
        <td colspan="3">TOTAL</td>
        <td>${getOutstationMembers(selectedOutstation).length}</td>
        `
        tfoot.appendChild(lastRow);
    }

    // set default SCCs
    setSCCs();

    const column = Column({
        'classlist': ['f-w', 'a-c', 'just-center', 'scroll-y'],
        'styles': [{ 'padding': '10px' }],
        'children': [
            outstationPicker,
            // MondoText({ 'text': 'every outstation has an extra of one outstation because of the Priests\' community' }),
            Column({ 'styles': [{ 'height': '20px' }] }),
            HorizontalScrollView({
                'children': [table]
            }),
        ]
    });

    ModalExpertise.showModal({
        'actionHeading': `small Christian Communities (${ParishDataHandle.parishSCCs.length})`,
        'modalHeadingStyles': [{ 'background': 'royalblue' }, { 'color': 'white' }],
        'topRowUserActions': [new PDFPrintButton(tableId)],
        'children': [column],
        'modalChildStyles': [{ 'width': 'fit-content' }],
        'fullScreen': true,
    });
}


// View one SCC with save changes
function ViewSCC(SCC) {
    console.log(SCC);

    const sccNameI = TextEdit({ 'placeholder': 'scc name' });
    sccNameI.value = SCC['scc_name'];

    // Feast date picker
    const feastDateI = TextEdit({ 'type': 'date', 'value': SCC['feast_date'] });

    const button = Button({
        'styles': marginRuleStyles,
        'text': 'save changes',
        'onclick': async function (ev) {
            try {
                TextEditValueValidator.validate('SCC name', sccNameI);
                TextEditValueValidator.validate('Feast date', feastDateI);

                // pick only month and date of the month
                const pickedDate = new Date(feastDateI.value);
                let feastDate = `${pickedDate.getMonth()}/${pickedDate.getDate()}`
                feastDate = (new Date(feastDate).toDateString().split(' ').slice(1, 3).join('/'));

                const body = {
                    'scc': {
                        '_id': SCC['_id'],
                        'name': `${sccNameI.value}`.toUpperCase(),
                        'feast_date': feastDate
                    }
                };

                let result = await Post('/parish/update/scc', body, { 'requiresParishDetails': true });
                let msg = result['response'];

                MessegePopup.showMessegePuppy([MondoText({ 'text': msg })]);
                if (msg.match('success' || msg.match('save'))) {
                    clearTextEdits([sccNameI]);
                    ParishDataHandle.parishSCCs = ParishDataHandle
                        .parishSCCs
                        .filter(function (foundSCC) {
                            return foundSCC['_id'] !== SCC['_id'];
                        });
                    ModalExpertise.hideModal();
                }
            } catch (error) {
                MessegePopup.showMessegePuppy([MondoText({ 'text': error })]);
            }
        }
    })

    const column = Column({
        'styles': marginRuleStyles,
        'classlist': ['f-w', 'f-c', 'a-c', 'm-paad'],
        'children': [
            sccNameI,
            MondoText({ 'text': 'feast date' }),
            feastDateI,
            button
        ]
    });

    StyleView(column, [{ 'padding': '10px' }]);
    ModalExpertise.showModal({
        'actionHeading': 'edit an SCC',
        'modalHeadingStyles': [{ 'background-color': '#ff9999' }, { 'color': 'cornsilk' }],
        'modalChildStyles': [{ 'min-height': '500px' }, { 'mi-width': 'fit-content' }],
        'children': [column],
        'fullScreen': false,
        'dismisible': true
    });
}
