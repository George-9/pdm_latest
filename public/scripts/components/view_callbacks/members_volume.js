import { ParishDataHandle } from "../../data_pen/parish_data_handle.js";
import { Button, Column, MondoSelect, MondoText } from "../UI/cool_tool_ui.js";
import { Post } from "../../net_tools.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { addChildrenToView } from "../../dom/addChildren.js";
import { PDFPrintButton } from "../tailored_ui/print_button.js";
import { domCreate } from "../../dom/query.js";
import { LocalStorageContract } from "../../storage/LocalStorageContract.js";
import { getParishMembersVolumes } from "../../data_source/main.js";

export async function promptMembersAddVolume() {
    const newVolButton = Button({ 'text': 'new volume' });
    const submitButton = Button({ 'text': 'submit' });
    const newVolumeDisplay = MondoText({ 'text': 'volume' });

    let newVolume;

    newVolButton.onclick = async function (event) {
        /**
         * @type {string}
         */
        let lastVolume = ParishDataHandle.parishMembersVolumes[ParishDataHandle.parishMembersVolumes.length - 1];
        if (lastVolume) {
            let lastVolumeNumber = parseInt(lastVolume['name'].split('_')[1]);
            newVolume = `volume_${lastVolumeNumber + 1}`;
        } else {
            newVolume = `volume_1`;
        }

        newVolumeDisplay.innerText = newVolume;
    }

    submitButton.onclick = async function (event) {
        const saveResult = Post('/parish/add/members/volume',
            {
                'volume': { 'name': newVolume }
            },
            { 'requiresParishDetails': true }
        )

        const response = (await saveResult)['response'];

        MessegePopup.showMessegePuppy([MondoText({ 'text': response })]);

        if (response.match('success')) {
            ParishDataHandle.parishMembersVolumes = await getParishMembersVolumes();
            ModalExpertise.hideModal();
        } else {
            MessegePopup.showMessegePuppy([MondoText({ 'text': response })]);
        }
    }

    const column = Column({
        'classlist': ['f-w', 'a-c', 'just-center'],
        'styles': [{ 'min-height': '200px' }],
        'children': [
            newVolButton,
            newVolumeDisplay,
            submitButton
        ]
    });

    ModalExpertise.showModal({
        'actionHeading': 'add a new volume',
        'children': [column],
        'fullScreen': false,
        'modalChildStyles': [{ 'width': '400px', 'height': '50%' }]
    });
}

/**
 * View for all available volumes by neat volume n where n is the volume number
 */
export function viewVolumesPage() {
    const parentView = Column({
        'styles': [{ 'padding': '20px' }],
        'children': []
    });

    ParishDataHandle.parishMembersVolumes.forEach(function (volume) {
        parentView.appendChild(MondoText({ 'text': volume['name'].split('_').join(' ') }));
    });

    ModalExpertise.showModal({
        'actionHeading': 'parish members volumes',
        'children': [parentView],
        'fullScreen': false,
        'modalChildStyles': [{ 'width': '400px', 'height': '50%' }]
    });
}


// export function viewMembersInVolume() {
//     const tableId = 'members-table';

//     const table = domCreate('table');
//     table.id = tableId;

//     const thead = domCreate('thead');
//     const tbody = domCreate('tbody');
//     const tfoot = domCreate('tfoot');

//     thead.innerHTML = `
//         <tr>
//             <td>NO</td>
//             <td>NAME</td>
//             <td>TELEPHONE</td>
//             <td>SCC</td>
//             <td>OUTSTATION</td>
//             <td>VOLUME</td>
//         </tr>
//     `;
//     addChildrenToView(table, [thead, tbody, tfoot]);

//     // Create a volume selector
//     const volumeSelector = MondoSelect({ 'styles': [{ 'margin-bottom': '10px' }] });
//     ParishDataHandle.parishMembersVolumes.forEach(function (volume) {
//         volumeSelector.innerHTML += `<option value="${volume['name']}">${volume['name'].split('_').join(' ')}</option>`;
//     });

//     // Function to populate the table based on selected volume
//     function loadView(volumeName = null) {
//         tbody.innerHTML = ''; // Clear existing table data

//         const filteredData = volumeName
//             ? ParishDataHandle.parishMembers.filter(member => member['volume'] === volumeName)
//             : ParishDataHandle.parishMembers;

//         filteredData.forEach(function (member, i) {
//             let scc = ParishDataHandle.parishSCCs.find(function (scc) {
//                 return scc['_id'] === member['scc_id']
//             }) || { 'name': 'EVERY SCC' };

//             let outstation = ParishDataHandle.parishOutstations.find(function (o) {
//                 return o['_id'] === member['outstation_id']
//             }) || { 'name': 'EVERY OUTSTATION' };

//             const row = domCreate('tr');
//             row.innerHTML = `
//                 <td>${i + 1}</td>
//                 <td>${member['name']}</td>
//                 <td>${member['telephone_number']}</td>
//                 <td>${scc['name']}</td>
//                 <td>${outstation['name']}</td>
//                 <td>${(member['volume'] || '').split('_')[1]}</td>
//             `;
//             tbody.appendChild(row);
//         });
//     }

//     // Initial table load (showing all members)
//     loadView();

//     // Event listener for volume selector change
//     volumeSelector.addEventListener('change', function (ev) {
//         const selectedVolume = volumeSelector.value;
//         loadView(selectedVolume);
//     });

//     const column = Column({
//         'classlist': ['f-w', 'a-c', 'scroll-y'],
//         'styles': [{ 'padding': '10px' }],
//         'children': [volumeSelector, table] // Add volumeSelector to the view
//     });

//     ModalExpertise.showModal({
//         'actionHeading': `parish members (${ParishDataHandle.parishMembers.length})`,
//         'modalHeadingStyles': [{ 'background': '#4788fd' }, { 'color': 'white' }],
//         'topRowUserActions': [new PDFPrintButton(tableId)],
//         'children': [column],
//         'modalChildStyles': [{ 'width': 'fit-content' }, { 'height': '90%' }],
//         'fullScreen': false,
//         'dismisible': true,
//     });
// }
export function viewMembersInVolume() {
    const tableId = 'members-table';

    const table = domCreate('table');
    table.id = tableId;

    const thead = domCreate('thead');
    const tbody = domCreate('tbody');
    const tfoot = domCreate('tfoot');

    thead.innerHTML = `
        <tr>
            <td>NO</td>
            <td>NAME</td>
            <td>TELEPHONE</td>
            <td>SCC</td>
            <td>OUTSTATION</td>
        </tr>
    `;
    addChildrenToView(table, [thead, tbody, tfoot]);

    // Create a volume selector
    const volumeSelector = MondoSelect({ 'styles': [{ 'margin-bottom': '10px' }] });
    ParishDataHandle.parishMembersVolumes.forEach(function (volume) {
        volumeSelector.innerHTML += `<option value="${volume['_id']}">${volume['name'].split('_').join(' ')}</option>`;
    });

    // Function to populate the table based on selected volume
    function loadView(volumeId = null) {
        tbody.innerHTML = ''; // Clear existing table data

        const filteredData = volumeId
            ? ParishDataHandle.parishMembers.filter(member => member['volume'] === volumeId)
            : ParishDataHandle.parishMembers;

        filteredData.forEach(function (member, i) {
            let scc = ParishDataHandle.parishSCCs.find(function (scc) {
                return scc['_id'] === member['scc_id']
            }) || { 'name': 'EVERY SCC' };

            let outstation = ParishDataHandle.parishOutstations.find(function (o) {
                return o['_id'] === member['outstation_id']
            }) || { 'name': 'EVERY OUTSTATION' };

            let volumeName = ParishDataHandle.parishMembersVolumes.find(v => v._id === member['volume'])?.name || '';

            const row = domCreate('tr');
            row.innerHTML = `
                <td>${i + 1}</td>
                <td>${member['name']}</td>
                <td>${member['telephone_number']}</td>
                <td>${scc['name']}</td>
                <td>${outstation['name']}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // Initial table load (showing all members)
    loadView();

    // Event listener for volume selector change
    volumeSelector.addEventListener('change', function (ev) {
        const selectedVolumeId = volumeSelector.value;
        loadView(selectedVolumeId);

        let selectedVolume = ParishDataHandle.parishMembersVolumes.find(function (volume) {
            return volume['_id'] === selectedVolumeId;
        });

        PDFPrintButton.printingHeading = `${LocalStorageContract.completeParishName()}
        ${`${selectedVolume['name']}`.split('_').join(' ')} members`
    });

    const column = Column({
        'classlist': ['f-w', 'a-c', 'scroll-y'],
        'styles': [{ 'padding': '10px' }],
        'children': [volumeSelector, table] // Add volumeSelector to the view
    });

    ModalExpertise.showModal({
        'actionHeading': `parish members (${ParishDataHandle.parishMembers.length})`,
        'modalHeadingStyles': [{ 'background': '#4788fd' }, { 'color': 'white' }],
        'topRowUserActions': [new PDFPrintButton(tableId)],
        'children': [column],
        'modalChildStyles': [{ 'width': 'fit-content' }, { 'height': '90%' }],
        'fullScreen': false,
        'dismisible': true,
    });
}


/**
 * @todo move to SCC
 */
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
            <td>MEMBER COUNT</td>
            </tr>
            `
    addChildrenToView(table, [thead, tbody,
        tfoot]);

    const outstationPicker = OutstationPicker({ 'outstations': ParishDataHandle.parishOutstations });
    outstationPicker.addEventListener('change', function (ev) {
        setSCCs()
    })

    function setSCCs() {

        let selectedOutstation = outstationPicker.value;
        let selectedOutstationSCCs = getOutstationSCCs(selectedOutstation);

        console.log(selectedOutstationSCCs);
        console.log(selectedOutstation);

        tbody.replaceChildren([]);
        tfoot.replaceChildren([]);

        let count;
        selectedOutstationSCCs.forEach(function (scc, i) {
            let members = getSCCMembersFromList(getOutstationMembers(selectedOutstation), scc).length;

            const row = domCreate('tr');
            row.innerHTML = `
                <td>${i + 1}</td>
                <td>${scc['name']}</td>
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
            console.log(member);
            return member['scc_id'] === PRIESTS_COMMUNITY_NAME
        }).length}</td>
        `
        tbody.appendChild(priestCommunityRow);

        const lastRow = domCreate('tr');
        lastRow.innerHTML = `
            <td colspan="2">TOTAL</td>
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
        'modalHeadingStyles': [{ 'background': 'royablue' }, { 'color': 'white' }],
        'topRowUserActions': [new PDFPrintButton(tableId)],
        'children': [column],
        'modalChildStyles': [{ 'width': 'fit-content' }, { 'height': '90%' }],
        'fullScreen': false,
        'dismisible': true,
    });
}