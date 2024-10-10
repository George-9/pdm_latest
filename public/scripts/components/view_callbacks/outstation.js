import { mapValuesToUppercase } from "../../../global_tools/objects_tools.js";
import { ParishDataHandle } from "../../data_pen/parish_data_handle.js";
import { getParishOutstations } from "../../data_source/main.js";
import { addChildrenToView } from "../../dom/addChildren.js";
import { domCreate } from "../../dom/query.js";
import { clearTextEdits } from "../../dom/text_edit_utils.js";
import { Post } from "../../net_tools.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { PDFPrintButton } from "../tailored_ui/print_button.js";
import { Button, MondoText, Row, TextEdit, Column, MondoSelect, HorizontalScrollView } from "../UI/cool_tool_ui.js";
import { TextEditValueValidator } from "../utils/textedit_value_validator.js";
import { addClasslist } from "../utils/stylus.js";
import { LocalStorageContract } from "../../storage/LocalStorageContract.js";


export function promptAddOutstationView() {
    const nameTextEdit = TextEdit({ 'placeholder': 'outstation name' });

    const button = Button({ 'text': 'submit' });
    button.onclick = async function (ev) {
        ev.preventDefault();
        try {
            TextEditValueValidator.validate('outstation name', nameTextEdit);

            let result = await Post('/parish/add/outstation',
                mapValuesToUppercase({ outstation: { 'name': nameTextEdit.value } }),
                { 'requiresParishDetails': true });
            let msg = result['response'];

            MessegePopup.showMessegePuppy([new MondoText({ 'text': msg })])
            if (msg.match('success') || msg.match('save')) {
                clearTextEdits([nameTextEdit]);
                ParishDataHandle.parishOutstations = await getParishOutstations();
            }
        } catch (error) {
            MessegePopup.showMessegePuppy([MondoText({ 'text': error })])
        }
    }

    const column = Column({
        'children': [nameTextEdit, button],
        'classlist': ['f-w', 'a-c']
    });
    column.style.padding = '30px';

    ModalExpertise.showModal({
        'actionHeading': 'add outstations to your parish',
        'children': [column],
        'fullScreen': false,
        'modalChildStyles': [{ 'width': '400px', 'height': '50%' }]
    });
}

// show printable outstations table, SCC_count, member count
export function viewOutstationsTable() {
    const tableId = 'outstations-table';

    const table = domCreate('table');
    table.id = tableId;

    const thead = domCreate('thead');
    const tbody = domCreate('tbody');
    const tfoot = domCreate('tfoot');

    thead.innerHTML = `
        <tr>
            <td>NO</td>
            <td>OUTSTATION</td>
            <td>SCC COUNT</td>
            <td>MEMBER COUNT</td>
        </tr>
    `
    addChildrenToView(table, [thead, tbody, tfoot]);

    PDFPrintButton.printingHeading = `
        ${LocalStorageContract.completeParishName()}\
        Outstations Report\
    `.toUpperCase()

    ParishDataHandle.parishOutstations.forEach(function (outstation, i) {
        let sccCount = ParishDataHandle.parishSCCs.filter(function (scc) {
            return scc['outstation_id'] === outstation['_id'];
        }).length;

        let memberCount = ParishDataHandle.parishMembers.filter(function (member) {
            return member['outstation_id'] === outstation['_id'];
        }).length;

        const row = domCreate('tr');
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${outstation['name']}</td>
            <td>${sccCount}</td>
            <td>${memberCount}</td>
        `
        tbody.appendChild(row);

        if ((i + 1) === ParishDataHandle.parishOutstations.length) {
            const lastRow = domCreate('tr');
            lastRow.innerHTML = `
                <td colspan="2">TOTAL</td>
                <td>${ParishDataHandle.parishSCCs.length}</td>
                <td>${ParishDataHandle.parishMembers.length}</td>
            `
            tbody.appendChild(lastRow);
        }
    });

    const column = Column({
        'styles': [{ 'padding': '10px' }],
        'classlist': ['f-w', 'scroll-y'],
        'children': [table]
    });

    ModalExpertise.showModal({
        'topRowUserActions': [new PDFPrintButton(tableId)],
        'modalHeadingStyles': [{ 'background': 'royalblue' }, { 'color': 'white' }],
        'actionHeading': `parish outstations`,
        'children': [column],
        'modalChildStyles': [{}],
        'fullScreen': false,
        'dismisible': true,
    });
}


// view outstations, with option to view individual outstations with options like add leader, view leaders etcetra etcetra
export function viewOutstationsPage() {
    const parentView = Column({
        'styles': [{ 'padding': '20px' }],
        'children': []
    });

    if (ParishDataHandle.parishOutstations.length < 1) {
        addChildrenToView(parentView,
            [
                MondoText({ 'text': 'no outstations yet' }),
                MondoText({ 'text': '+ add one by clicking on the add button' })
            ]);
    } else {
        ParishDataHandle.parishOutstations.forEach(function (outstation) {
            let deleteIcon = domCreate('i');
            addClasslist(deleteIcon, ['bi', 'bi-trash', 'bi-pad']);

            deleteIcon.onclick = async function (ev) {
                ev.preventDefault();
                const result = await Post('/parish/delete/outstation',
                    { 'outstation_id': outstation['_id'] },
                    { 'requiresParishDetails': true }
                );

                let msg = result['response'];
                if (msg.match('success') || msg.match('delete')) {
                    MessegePopup.showMessegePuppy([MondoText({ 'text': 'outstation deleted' })]);
                    ModalExpertise.hideModal();
                }
                ParishDataHandle.parishOutstations = ParishDataHandle.parishOutstations.filter(function (otherOutstations) {
                    return otherOutstations['_id'] != outstation['_id'];
                });
            }

            let updateIcon = domCreate('i');
            addClasslist(updateIcon, ['bi', 'bi-pencil-square', 'bi-pad']);
            updateIcon.onclick = function () {
                viewOutstationDetails(outstation);
            }

            let addLeaderIcon = domCreate('i');
            addClasslist(addLeaderIcon, ['bi', 'bi-person-plus-fill', 'bi-pad']);
            addLeaderIcon.title = 'add leader';
            addLeaderIcon.onclick = function () {
                promptAddOutstationLeader(outstation);
            }

            let removeLeaderIcon = domCreate('i');
            addClasslist(removeLeaderIcon, ['bi', 'bi-person-x-fill', 'bi-pad']);
            removeLeaderIcon.title = 'remove leader';
            removeLeaderIcon.onclick = function () {
                promptRemoveOutstationLeader(outstation);
            }

            let viewMembersIcon = domCreate('i');
            viewMembersIcon.title = 'view members';
            addClasslist(viewMembersIcon, ['bi', 'bi-people-fill', 'bi-pad']);
            viewMembersIcon.onclick = function () {
            }

            let viewSCCsIcon = domCreate('i');
            viewSCCsIcon.title = 'view SCCs';
            addClasslist(viewSCCsIcon, ['bi', 'bi-building', 'bi-pad']);
            viewSCCsIcon.onclick = function () {
                viewOutstationSCCs(outstation);
            }

            let viewLeadersIcon = domCreate('i');
            viewLeadersIcon.title = 'view leaders';
            addClasslist(viewLeadersIcon, ['bi', 'bi-person-fill', 'bi-pad']);
            viewLeadersIcon.onclick = function () {
                viewOutstationLeaders(outstation);
            }

            let viewAssociationsIcon = domCreate('i');
            viewAssociationsIcon.title = 'view associations';
            addClasslist(viewAssociationsIcon, ['bi', 'bi-people', 'bi-pad']);
            viewAssociationsIcon.onclick = function () {
                viewOutstationAssociations(outstation);
            }

            let viewGroupsIcon = domCreate('i');
            viewGroupsIcon.title = 'view groups';
            addClasslist(viewGroupsIcon, ['bi', 'bi-people', 'bi-pad']);
            viewGroupsIcon.onclick = function () {
                viewOutstationGroups(outstation);
            }

            const column = Column({
                'styles': [{ 'border': '1px solid grey' }, { 'padding': '10px' }],
                'children': [
                    MondoText({ 'text': outstation.name }),
                    Row({
                        'classlist': ['f-w', 'just-end'], 'children': [
                            updateIcon,
                            deleteIcon,
                            addLeaderIcon,
                            removeLeaderIcon,
                            viewMembersIcon,
                            viewSCCsIcon,
                            viewLeadersIcon,
                            viewAssociationsIcon,
                            viewGroupsIcon,
                        ]
                    }),
                ]
            });

            parentView.appendChild(column);
        });
    }

    const addOutstationButton = Button({ 'text': 'add outstation' });
    addOutstationButton.onclick = function () {
        promptAddOutstationView();
    }

    const viewLeadersButton = Button({ 'text': 'view leaders' });
    viewLeadersButton.onclick = function () {
        viewOutstationsLeaders();
    }

    addChildrenToView(parentView, [addOutstationButton, viewLeadersButton]);

    ModalExpertise.showModal({
        'actionHeading': 'parish outstations',
        'fullScreen': true,
        'modalHeadingStyles': [{ 'background-color': 'royalblue' }, { 'color': 'white' }],
        'children': [parentView],
    })
}

// view outstations' leaders
export function viewOutstationsLeaders() {
    const tableId = 'outstations-leaders-table';

    const table = domCreate('table');
    table.id = tableId;

    const thead = domCreate('thead');
    const tbody = domCreate('tbody');
    const tfoot = domCreate('tfoot');

    thead.innerHTML = `
        <tr>
            <td>NO</td>
            <td>OUTSTATION</td>
            <td>LEADER</td>
            <td>TELEPHONE</td>
        </tr>
    `
    addChildrenToView(table, [thead, tbody, tfoot]);

    ParishDataHandle.parishOutstations.forEach(function (outstation, i) {
        let leader = ParishDataHandle.parishMembers.find(function (member) {
            return member['outstation_id'] === outstation['_id'] && member['is_leader'] === true;
        });

        if (leader) {
            const row = domCreate('tr');
            row.innerHTML = `
                <td>${i + 1}</td>
                <td>${outstation['name']}</td>
                <td>${leader['name']}</td>
                <td>${leader['telephone_number']}</td>
            `
            table.appendChild(row);
        }
    });

    const column = Column({
        'styles': [{ 'margin': '10px' }, { 'padding': '10px' }],
        'classlist': ['f-w', 'a-c', 'just-center', 'scroll-y'],
        'children': [table]
    });

    ModalExpertise.showModal({
        'topRowUserActions': [new PDFPrintButton(tableId)],
        'modalHeadingStyles': [{ 'background': 'royalblue' }, { 'color': 'white' }],
        'actionHeading': `parish outstations leaders`,
        'children': [column],
        'modalChildStyles': [{}],
        'fullScreen': false,
        'dismisible': true,
    });
}

export function viewOutstationDetails(outstation) {
    const outstationNameI = TextEdit({ 'placeholder': 'outstation name' });
    outstationNameI.value = outstation['name'];

    const saveButton = Button({ 'text': 'save changes' });
    saveButton.onclick = async function (ev) {
        ev.preventDefault();
        try {
            TextEditValueValidator.validate('outstation name', outstationNameI);

            let result = await Post('/parish/update/outstation',
                mapValuesToUppercase({ outstation: { '_id': outstation['_id'], 'name': outstationNameI.value } }),
                { 'requiresParishDetails': true });
            let msg = result['response'];

            MessegePopup.showMessegePuppy([new MondoText({ 'text': msg })])
            if (msg.match('success') || msg.match('save')) {
                clearTextEdits([outstationNameI]);
                ParishDataHandle.parishOutstations = await getParishOutstations();
            }
        } catch (error) {
            MessegePopup.showMessegePuppy([MondoText({ 'text': error })])
        }
    }

    const column = Column({
        'children': [outstationNameI, saveButton],
        'classlist': ['f-w', 'a-c']
    });
    column.style.padding = '30px';

    ModalExpertise.showModal({
        'actionHeading': 'edit outstation',
        'children': [column],
        'fullScreen': false,
        'modalChildStyles': [{ 'width': '400px', 'height': '50%' }]
    });
}

export function viewOutstationMembers(outstation) {
    const tableId = 'outstation-members-table';

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
            <td>VOLUME</td>
        </tr>
    `
    addChildrenToView(table, [thead, tbody, tfoot]);

    let members = ParishDataHandle.parishMembers.filter(function (member) {
        return member['outstation_id'] === outstation['_id'];
    });

    members.forEach(function (member, i) {
        let scc = ParishDataHandle.parishSCCs.find(function (scc) {
            return scc['_id'] === member['scc_id'];
        }) || { 'name': 'EVERY SCC' };

        let volume = ParishDataHandle.parishMembersVolumes.find(function (volume) {
            return volume['_id'] === member['volume'];
        }) || { 'name': 'EVERY VOLUME' };

        const row = domCreate('tr');
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${member['name']}</td>
            <td>${member['telephone_number']}</td>
            <td>${scc['name']}</td>
            <td>${volume['name']}</td>
        `
        table.appendChild(row);
    });

    const column = Column({
        'styles': [{ 'margin': '10px' }, { 'padding': '10px' }],
        'classlist': ['f-w', 'a-c', 'just-center', 'scroll-y'],
        'children': [table]
    });

    ModalExpertise.showModal({
        'topRowUserActions': [new PDFPrintButton(tableId)],
        'modalHeadingStyles': [{ 'background': 'royalblue' }, { 'color': 'white' }],
        'actionHeading': `${outstation['name']} outstation members`,
        'children': [column],
        'modalChildStyles': [{}],
        'fullScreen': false,
        'dismisible': true,
    });
}

export function promptAddOutstationLeader(outstation) {
    // propmt add outstation leader {member_id, position}
    // leader must be from that outstation by filtering by member['outstation_id]
    const memberPicker = MondoSelect({ 'styles': [{ 'margin-bottom': '10px' }] });
    ParishDataHandle.parishMembers.forEach(function (member) {
        if (member['outstation_id'] === outstation['_id']) {
            memberPicker.innerHTML += `<option value="${member['_id']}">${member['name']}</option>`;
        }
    });

    const positionInputEl = TextEdit({ 'placeholder': 'position' });
    const submitButton = Button({ 'text': 'save' });
    submitButton.style.border = '1px solid grey';

    submitButton.onclick = async function (ev) {
        ev.preventDefault();
        try {
            let result = await Post('/parish/add/outstation/leader',
                mapValuesToUppercase({
                    'outstation_id': outstation['_id'],
                    'leader': mapValuesToUppercase({
                        'member_id': memberPicker.value,
                        'position': positionInputEl.value
                    })
                }),
                { 'requiresParishDetails': true });

            let msg = result['response'];
            MessegePopup.showMessegePuppy([new MondoText({ 'text': msg })])
            if (msg.match('success') || msg.match('save')) {
                ParishDataHandle.parishMembers = await getParishOutstations();
            }
        } catch (error) {
            MessegePopup.showMessegePuppy([MondoText({ 'text': error })])
        }
    }

    const column = Column({
        'children': [
            memberPicker,
            positionInputEl,
            submitButton
        ],
        'classlist': ['f-w', 'a-c']
    });
    column.style.padding = '30px';

    ModalExpertise.showModal({
        'actionHeading': 'add outstation leader',
        'children': [column],
        'fullScreen': false,
        'modalChildStyles': [{ 'width': '400px', 'height': '50%' }]
    });
}

// prompt remove outstation leader
export function promptRemoveOutstationLeader(outstation) {
    const memberPicker = MondoSelect({ 'styles': [{ 'margin-bottom': '10px' }] });
    ParishDataHandle.parishMembers.forEach(function (member) {
        if (member['outstation_id'] === outstation['_id'] && member['is_leader'] === true) {
            memberPicker.innerHTML += `<option value="${member['_id']}">${member['name']}</option>`;
        }
    });

    const button = Button({ 'text': 'submit' });
    button.onclick = async function (ev) {
        ev.preventDefault();
        try {
            let result = await Post('/parish/remove/outstation/leader',
                mapValuesToUppercase({
                    'outstation_id': outstation['_id'],
                    'member_id': memberPicker.value
                }),
                { 'requiresParishDetails': true });
            let msg = result['response'];

            MessegePopup.showMessegePuppy([new MondoText({ 'text': msg })])
            if (msg.match('success') || msg.match('save')) {
                ParishDataHandle.parishMembers = await getParishOutstations();
            }
        } catch (error) {
            MessegePopup.showMessegePuppy([MondoText({ 'text': error })])
        }
    }

    const column = Column({
        'children': [memberPicker, button],
        'classlist': ['f-w', 'a-c']
    });
    column.style.padding = '30px';

    ModalExpertise.showModal({
        'actionHeading': 'remove outstation leader',
        'children': [column],
        'fullScreen': false,
        'modalChildStyles': [{ 'width': '400px', 'height': '50%' }]
    });
}

export function viewOutstationSCCs(outstation) {
    PDFPrintButton.printingHeading = `${outstation['name']} Small Christian Communities`.toUpperCase();

    const tableId = 'outstation-sccs-table';

    const table = domCreate('table');
    table.id = tableId;

    const thead = domCreate('thead');
    const tbody = domCreate('tbody');
    const tfoot = domCreate('tfoot');

    thead.innerHTML = `
        <tr>
            <td>NO</td>
            <td>SCC</td>
            <td>Feast Date</td>
            <td>MEMBER COUNT</td>
        </tr>
    `
    addChildrenToView(table, [thead, tbody, tfoot]);

    let sccs = ParishDataHandle.parishSCCs.filter(function (scc) {
        return scc['outstation_id'] === outstation['_id'];
    });

    sccs.forEach(function (scc, i) {
        let membersCount = ParishDataHandle.parishMembers.filter(function (m) {
            return m['scc_id'] === scc['_id'];
        }).length;

        const row = domCreate('tr');
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${scc['name']}</td>
            <td>${scc['feast_date']}</td>
            <td>${membersCount}</td>
        `
        table.appendChild(row);
    });

    const column = Column({
        'styles': [{ 'margin': '10px' }, { 'padding': '10px' }],
        'classlist': ['f-w', 'a-c', 'just-center', 'scroll-y'],
        'children': [table]
    });

    ModalExpertise.showModal({
        'topRowUserActions': [new PDFPrintButton(tableId)],
        'modalHeadingStyles': [{ 'background': 'royalblue' }, { 'color': 'white' }],
        'actionHeading': `${outstation['name']} outstation SCCs`,
        'children': [column],
        'modalChildStyles': [{}],
        'fullScreen': false,
        'dismisible': true,
    });
}


// outstation leaders report table view
export function viewOutstationLeaders(outstation) {
    const tableId = 'outstation-leaders-table';

    PDFPrintButton.printingHeading = `
        ${LocalStorageContract.completeParishName()}
        ${outstation['name']} Outstation Leaders
    `.toUpperCase()

    const table = domCreate('table');
    table.id = tableId;

    const thead = domCreate('thead');
    const tbody = domCreate('tbody');
    const tfoot = domCreate('tfoot');

    thead.innerHTML = `
        <tr>
            <td>NO</td>
            <td>LEADER</td>
            <td>TELEPHONE</td>
            <td>POSITION</td>
        </tr>
    `
    addChildrenToView(table, [thead, tbody, tfoot]);

    // get all leaders from every outstation
    // outstation = {_id: '', name: '', leaders: []} 
    let leaders = outstation['leaders'].map(function (leader) {
        return {
            '_id': leader['member_id'],
            'name': ParishDataHandle.parishMembers.find(function (member) {
                return member['_id'] === leader['member_id'];
            })['name'],
            'telephone_number': ParishDataHandle.parishMembers.find(function (member) {
                return member['_id'] === leader['member_id'];
            })['telephone_number'],
            'position': leader['position']
        }
    });

    // filter leaders by outstation
    leaders = leaders.filter(function (leader) {
        return ParishDataHandle.parishMembers.find(function (member) {
            return member['_id'] === leader['_id'] && member['outstation_id'] === outstation['_id'];
        });
    });


    leaders.forEach(function (leader, i) {
        console.log(leader);

        const row = domCreate('tr');
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${leader['name']}</td>
            <td>${leader['telephone_number']}</td>
            <td>${leader['position']}</td>
        `
        table.appendChild(row);
    });

    const column = Column({
        'styles': [{ 'margin': '10px' }, { 'padding': '10px' }],
        'classlist': ['f-w', 'a-c', 'just-center', 'scroll-y'],
        'children': [table]
    });

    ModalExpertise.showModal({
        'topRowUserActions': [new PDFPrintButton(tableId)],
        'modalHeadingStyles': [{ 'background': 'royalblue' }, { 'color': 'white' }],
        'actionHeading': `${outstation['name']} outstation leaders`,
        'children': [column],
        'modalChildStyles': [{}],
        'fullScreen': true,
    });
}

export function viewOutstationAssociations(outstation) {
    const tableId = 'outstation-associations-table';

    const table = domCreate('table');
    table.id = tableId;

    const thead = domCreate('thead');
    const tbody = domCreate('tbody');
    const tfoot = domCreate('tfoot');

    thead.innerHTML = `
        <tr>
            <td>NO</td>
            <td>ASSOCIATION</td>
            <td>MEMBER COUNT</td>
        </tr>
    `
    addChildrenToView(table, [thead, tbody, tfoot]);

    let associations = ParishDataHandle.parishAssociations.filter(function (association) {
        return association['members_id'].some(function (memberId) {
            return ParishDataHandle.parishMembers.find(function (member) {
                return member['_id'] === memberId && member['outstation_id'] === outstation['_id'];
            });
        });
    });

    associations.forEach(function (association, i) {
        let membersCount = association['members_id'].filter(function (memberId) {
            return ParishDataHandle.parishMembers.find(function (member) {
                return member['_id'] === memberId && member['outstation_id'] === outstation['_id'];
            });
        }).length;

        const row = domCreate('tr');
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${association['name']}</td>
            <td>${membersCount}</td>
        `
        table.appendChild(row);
    });

    const column = Column({
        'styles': [{ 'margin': '10px' }, { 'padding': '10px' }],
        'classlist': ['f-w', 'a-c', 'just-center', 'scroll-y'],
        'children': [table]
    });

    ModalExpertise.showModal({
        'topRowUserActions': [new PDFPrintButton(tableId)],
        'modalHeadingStyles': [{ 'background': 'royalblue' }, { 'color': 'white' }],
        'actionHeading': `${outstation['name']} outstation associations`,
        'children': [column],
        'modalChildStyles': [{}],
        'fullScreen': false,
        'dismisible': true,
    });
}

export function viewOutstationGroups(outstation) {
    const tableId = 'outstation-groups-table';

    const table = domCreate('table');
    table.id = tableId;

    const thead = domCreate('thead');
    const tbody = domCreate('tbody');
    const tfoot = domCreate('tfoot');

    thead.innerHTML = `
        <tr>
            <td>NO</td>
            <td>GROUP</td>
            <td>MEMBER COUNT</td>
        </tr>
    `
    addChildrenToView(table, [thead, tbody, tfoot]);

    let groups = ParishDataHandle.parishGroups.filter(function (group) {
        return group['members_id'].some(function (memberId) {
            return ParishDataHandle.parishMembers.find(function (member) {
                return member['_id'] === memberId && member['outstation_id'] === outstation['_id'];
            });
        });
    });

    groups.forEach(function (group, i) {
        let membersCount = group['members_id'].filter(function (memberId) {
            return ParishDataHandle.parishMembers.find(function (member) {
                return member['_id'] === memberId && member['outstation_id'] === outstation['_id'];
            });
        }).length;

        const row = domCreate('tr');
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${group['name']}</td>
            <td>${membersCount}</td>
        `
        table.appendChild(row);
    });

    const column = Column({
        'styles': [{ 'margin': '10px' }, { 'padding': '10px' }],
        'classlist': ['f-w', 'a-c', 'just-center', 'scroll-y'],
        'children': [table]
    });

    ModalExpertise.showModal({
        'topRowUserActions': [new PDFPrintButton(tableId)],
        'modalHeadingStyles': [{ 'background': 'royalblue' }, { 'color': 'white' }],
        'actionHeading': `${outstation['name']} outstation groups`,
        'children': [column],
        'modalChildStyles': [{}],
        'fullScreen': false,
        'dismisible': true,
    });
}

export function viewOutstationMembersFilterableBySCC(outstation) {
    const tableId = 'outstation-members-table';

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
            <td>VOLUME</td>
        </tr>
    `
    addChildrenToView(table, [thead, tbody, tfoot]);

    const sccPicker = MondoSelect({ 'styles': [{ 'margin-bottom': '10px' }] });
    ParishDataHandle.parishSCCs.forEach(function (scc) {
        sccPicker.innerHTML += `<option value="${scc['_id']}">${scc['name']}</option>`;
    });

    function loadView(sccId = null) {
        tbody.innerHTML = ''; // Clear existing table data

        let members = ParishDataHandle.parishMembers.filter(function (member) {
            return member['outstation_id'] === outstation['_id'];
        });

        if (sccId) {
            members = members.filter(function (member) {
                return member['scc_id'] === sccId;
            });
        }

        members.forEach(function (member, i) {
            let scc = ParishDataHandle.parishSCCs.find(function (scc) {
                return scc['_id'] === member['scc_id'];
            }) || { 'name': 'EVERY SCC' };

            let volume = ParishDataHandle.parishMembersVolumes.find(function (volume) {
                return volume['_id'] === member['volume'];
            }) || { 'name': 'EVERY VOLUME' };

            const row = domCreate('tr');
            row.innerHTML = `
                <td>${i + 1}</td>
                <td>${member['name']}</td>
                <td>${member['telephone_number']}</td>
                <td>${scc['name']}</td>
                <td>${volume['name']}</td>
            `
            table.appendChild(row);
        });
    }

    // Initial table load (showing all members)
    loadView();

    // Event listener for volume selector change
    sccPicker.addEventListener('change', function () {
        const selectedSccId = sccPicker.value;
        loadView(selectedSccId);
    });

    const column = Column({
        'styles': [{ 'margin': '10px' }, { 'padding': '10px' }],
        'classlist': ['f-w', 'a-c', 'just-center', 'scroll-y'],
        'children': [sccPicker, table]
    });

    ModalExpertise.showModal({
        'topRowUserActions': [new PDFPrintButton(tableId)],
        'modalHeadingStyles': [{ 'background': 'royalblue' }, { 'color': 'white' }],
        'actionHeading': `${outstation['name']} outstation members`,
        'children': [column],
        'modalChildStyles': [{}],
        'fullScreen': false,
        'dismisible': true,
    });
}

export function viewOutstationMembersFilterableBySCCAndVolume(outstation) {
    const tableId = 'outstation-members-table';

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
            <td>VOLUME</td>
        </tr>
    `
    addChildrenToView(table, [thead, tbody, tfoot]);

    const sccPicker = MondoSelect({ 'styles': [{ 'margin-bottom': '10px' }] });
    ParishDataHandle.parishSCCs.forEach(function (scc) {
        sccPicker.innerHTML += `<option value="${scc['_id']}">${scc['name']}</option>`;
    });

    const volumePicker = MondoSelect({ 'styles': [{ 'margin-bottom': '10px' }] });
    ParishDataHandle.parishMembersVolumes.forEach(function (volume) {
        volumePicker.innerHTML += `<option value="${volume['_id']}">${volume['name']}</option>`;
    });

    function loadView(sccId = null, volumeId = null) {
        tbody.innerHTML = ''; // Clear existing table data

        let members = ParishDataHandle.parishMembers.filter(function (member) {
            return member['outstation_id'] === outstation['_id'];
        });

        if (sccId) {
            members = members.filter(function (member) {
                return member['scc_id'] === sccId;
            });
        }

        if (volumeId) {
            members = members.filter(function (member) {
                return member['volume'] === volumeId;
            });
        }

        members.forEach(function (member, i) {
            let scc = ParishDataHandle.parishSCCs.find(function (scc) {
                return scc['_id'] === member['scc_id'];
            }) || { 'name': 'EVERY SCC' };

            let volume = ParishDataHandle.parishMembersVolumes.find(function (volume) {
                return volume['_id'] === member['volume'];
            }) || { 'name': 'EVERY VOLUME' };

            const row = domCreate('tr');
            row.innerHTML = `
                <td>${i + 1}</td>
                <td>${member['name']}</td>
                <td>${member['telephone_number']}</td>
                <td>${scc['name']}</td>
                <td>${volume['name']}</td>
            `
            table.appendChild(row);
        });
    }

    // Initial table load (showing all members)
    loadView();

    // Event listener for volume selector change
    sccPicker.addEventListener('change', function () {
        const selectedSccId = sccPicker.value;
        const selectedVolumeId = volumePicker.value;
        loadView(selectedSccId, selectedVolumeId);
    });

    volumePicker.addEventListener('change', function () {
        const selectedSccId = sccPicker.value;
        const selectedVolumeId = volumePicker.value;
        loadView(selectedSccId, selectedVolumeId);
    });

    const column = Column({
        'styles': [{ 'margin': '10px' }, { 'padding': '10px' }],
        'classlist': ['f-w', 'a-c', 'just-center', 'scroll-y'],
        'children': [sccPicker, volumePicker, table]
    });

    ModalExpertise.showModal({
        'topRowUserActions': [new PDFPrintButton(tableId)],
        'modalHeadingStyles': [{ 'background': 'royalblue' }, { 'color': 'white' }],
        'actionHeading': `${outstation['name']} outstation members`,
        'children': [column],
        'modalChildStyles': [{}],
        'fullScreen': false,
        'dismisible': true,
    });
}

export function viewOutstationMembersFilterableBySCCAndVolumeAndGroup(outstation) {
    const tableId = 'outstation-members-table';

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
            <td>VOLUME</td>
            <td>GROUP</td>
        </tr>
    `
    addChildrenToView(table, [thead, tbody, tfoot]);

    const sccPicker = MondoSelect({ 'styles': [{ 'margin-bottom': '10px' }] });
    ParishDataHandle.parishSCCs.forEach(function (scc) {
        sccPicker.innerHTML += `<option value="${scc['_id']}">${scc['name']}</option>`;
    });

    const volumePicker = MondoSelect({ 'styles': [{ 'margin-bottom': '10px' }] });
    ParishDataHandle.parishMembersVolumes.forEach(function (volume) {
        volumePicker.innerHTML += `<option value="${volume['_id']}">${volume['name']}</option>`;
    });

    const groupPicker = MondoSelect({ 'styles': [{ 'margin-bottom': '10px' }] });
    ParishDataHandle.parishGroups.forEach(function (group) {
        groupPicker.innerHTML += `<option value="${group['_id']}">${group['name']}</option>`;
    });

    function loadView(sccId = null, volumeId = null, groupId = null) {
        tbody.innerHTML = ''; // Clear existing table data

        let members = ParishDataHandle.parishMembers.filter(function (member) {
            return member['outstation_id'] === outstation['_id'];
        });

        if (sccId) {
            members = members.filter(function (member) {
                return member['scc_id'] === sccId;
            });
        }

        if (volumeId) {
            members = members.filter(function (member) {
                return member['volume'] === volumeId;
            });
        }

        if (groupId) {
            members = members.filter(function (member) {
                return member['group'] === groupId;
            });
        }

        members.forEach(function (member, i) {
            let scc = ParishDataHandle.parishSCCs.find(function (scc) {
                return scc['_id'] === member['scc_id'];
            }) || { 'name': 'EVERY SCC' };

            let volume = ParishDataHandle.parishMembersVolumes.find(function (volume) {
                return volume['_id'] === member['volume'];
            }) || { 'name': 'EVERY VOLUME' };

            let group = ParishDataHandle.parishGroups.find(function (group) {
                return group['_id'] === member['group'];
            }) || { 'name': 'EVERY GROUP' };

            const row = domCreate('tr');
            row.innerHTML = `
                <td>${i + 1}</td>
                <td>${member['name']}</td>
                <td>${member['telephone_number']}</td>
                <td>${scc['name']}</td>
                <td>${volume['name']}</td>
                <td>${group['name']}</td>
            `
            table.appendChild(row);
        });
    }

    // Initial table load (showing all members)
    loadView();

    // Event listener for volume selector change
    sccPicker.addEventListener('change', function () {
        const selectedSccId = sccPicker.value;
        const selectedVolumeId = volumePicker.value;
        const selectedGroupId = groupPicker.value;
        loadView(selectedSccId, selectedVolumeId, selectedGroupId);
    });

    volumePicker.addEventListener('change', function () {
        const selectedSccId = sccPicker.value;
        const selectedVolumeId = volumePicker.value;
        const selectedGroupId = groupPicker.value;
        loadView(selectedSccId, selectedVolumeId, selectedGroupId);
    });

    groupPicker.addEventListener('change', function () {
        const selectedSccId = sccPicker.value;
        const selectedVolumeId = volumePicker.value;
        const selectedGroupId = groupPicker.value;
        loadView(selectedSccId, selectedVolumeId, selectedGroupId);
    });

    const column = Column({
        'styles': [{ 'margin': '10px' }, { 'padding': '10px' }],
        'classlist': ['f-w', 'a-c', 'just-center', 'scroll-y'],
        'children': [sccPicker, volumePicker, groupPicker, table]
    });

    ModalExpertise.showModal({
        'topRowUserActions': [new PDFPrintButton(tableId)],
        'modalHeadingStyles': [{ 'background': 'royalblue' }, { 'color': 'white' }],
        'actionHeading': `${outstation['name']} outstation members`,
        'children': [column],
        'modalChildStyles': [{}],
        'fullScreen': false,
        'dismisible': true,
    });
}

export function viewOutstationMembersFilterableBySCCAndVolumeAndGroupAndAssociation(outstation) {
    const tableId = 'outstation-members-table';

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
            <td>VOLUME</td>
            <td>GROUP</td>
            <td>ASSOCIATION</td>
        </tr>
    `
    addChildrenToView(table, [thead, tbody, tfoot]);

    const sccPicker = MondoSelect({ 'styles': [{ 'margin-bottom': '10px' }] });
    ParishDataHandle.parishSCCs.forEach(function (scc) {
        sccPicker.innerHTML += `<option value="${scc['_id']}">${scc['name']}</option>`;
    });

    const volumePicker = MondoSelect({ 'styles': [{ 'margin-bottom': '10px' }] });
    ParishDataHandle.parishMembersVolumes.forEach(function (volume) {
        volumePicker.innerHTML += `<option value="${volume['_id']}">${volume['name']}</option>`;
    });

    const groupPicker = MondoSelect({ 'styles': [{ 'margin-bottom': '10px' }] });
    ParishDataHandle.parishGroups.forEach(function (group) {
        groupPicker.innerHTML += `<option value="${group['_id']}">${group['name']}</option>`;
    });

    const associationPicker = MondoSelect({ 'styles': [{ 'margin-bottom': '10px' }] });
    ParishDataHandle.parishAssociations.forEach(function (association) {
        associationPicker.innerHTML += `<option value="${association['_id']}">${association['name']}</option>`;
    });

    function loadView(sccId = null, volumeId = null, groupId = null, associationId = null) {
        tbody.innerHTML = ''; // Clear existing table data

        let members = ParishDataHandle.parishMembers.filter(function (member) {
            return member['outstation_id'] === outstation['_id'];
        });

        if (sccId) {
            members = members.filter(function (member) {
                return member['scc_id'] === sccId;
            });
        }

        if (volumeId) {
            members = members.filter(function (member) {
                return member['volume'] === volumeId;
            });
        }

        if (groupId) {
            members = members.filter(function (member) {
                return member['group'] === groupId;
            });
        }

        if (associationId) {
            members = members.filter(function (member) {
                return member['association'] === associationId;
            });
        }

        members.forEach(function (member, i) {
            let scc = ParishDataHandle.parishSCCs.find(function (scc) {
                return scc['_id'] === member['scc_id'];
            }) || { 'name': 'EVERY SCC' };

            let volume = ParishDataHandle.parishMembersVolumes.find(function (volume) {
                return volume['_id'] === member['volume'];
            }) || { 'name': 'EVERY VOLUME' };

            let group = ParishDataHandle.parishGroups.find(function (group) {
                return group['_id'] === member['group'];
            }) || { 'name': 'EVERY GROUP' };

            let association = ParishDataHandle.parishAssociations.find(function (association) {
                return association['_id'] === member['association'];
            }) || { 'name': 'EVERY ASSOCIATION' };

            const row = domCreate('tr');
            row.innerHTML = `
                <td>${i + 1}</td>
                <td>${member['name']}</td>
                <td>${member['telephone_number']}</td>
                <td>${scc['name']}</td>
                <td>${volume['name']}</td>
                <td>${group['name']}</td>
                <td>${association['name']}</td>
            `
            table.appendChild(row);
        });
    }

    // Initial table load (showing all members)
    loadView();

    // Event listener for volume selector change
    sccPicker.addEventListener('change', function () {
        const selectedSccId = sccPicker.value;
        const selectedVolumeId = volumePicker.value;
        const selectedGroupId = groupPicker.value;
        const selectedAssociationId = associationPicker.value;
        loadView(selectedSccId, selectedVolumeId, selectedGroupId, selectedAssociationId);
    });

    volumePicker.addEventListener('change', function () {
        const selectedSccId = sccPicker.value;
        const selectedVolumeId = volumePicker.value;
        const selectedGroupId = groupPicker.value;
        const selectedAssociationId = associationPicker.value;
        loadView(selectedSccId, selectedVolumeId, selectedGroupId, selectedAssociationId);
    });

    groupPicker.addEventListener('change', function () {
        const selectedSccId = sccPicker.value;
        const selectedVolumeId = volumePicker.value;
        const selectedGroupId = groupPicker.value;
        const selectedAssociationId = associationPicker.value;
        loadView(selectedSccId, selectedVolumeId, selectedGroupId, selectedAssociationId);
    });

    associationPicker.addEventListener('change', function () {
        const selectedSccId = sccPicker.value;
        const selectedVolumeId = volumePicker.value;
        const selectedGroupId = groupPicker.value;
        const selectedAssociationId = associationPicker.value;
        loadView(selectedSccId, selectedVolumeId, selectedGroupId, selectedAssociationId);
    });

    const column = Column({
        'styles': [{ 'margin': '10px' }, { 'padding': '10px' }],
        'classlist': ['f-w', 'a-c', 'just-center', 'scroll-y'],
        'children': [sccPicker, volumePicker, groupPicker, associationPicker, table]
    });

    ModalExpertise.showModal({
        'topRowUserActions': [new PDFPrintButton(tableId)],
        'modalHeadingStyles': [{ 'background': 'royalblue' }, { 'color': 'white' }],
        'actionHeading': `${outstation['name']} outstation members`,
        'children': [column],
        'modalChildStyles': [{}],
        'fullScreen': false,
        'dismisible': true,
    });
}
