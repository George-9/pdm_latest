import { ParishDataHandle } from "../../data_pen/parish_data_handle.js";
import { domCreate } from "../../dom/query.js";
import { clearTextEdits } from "../../dom/text_edit_utils.js";
import { Post } from "../../net_tools.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { Column, MondoSelect, MondoText, TextEdit } from "../UI/cool_tool_ui.js";
import { addClasslist } from "../utils/stylus.js";
import { Row } from "../UI/row.js";
import { mapValuesToUppercase } from "../../../global_tools/objects_tools.js";
import { getMemberById } from "../../data_pen/puppet.js";
import { addChildrenToView } from "../../dom/addChildren.js";
import { PDFPrintButton } from "../tailored_ui/print_button.js";
import { LocalStorageContract } from "../../storage/LocalStorageContract.js";
import { getParishLeaders } from "../../data_source/main.js";

export async function promptAddParishAddLeaders() {
    const postionInput = TextEdit({ 'placeholder': 'position' });
    const membersSelect = MondoSelect({ 'styles': [{ 'margin-bottom': '10px' }] });

    // populate with parish members
    for (let i = 0; i < ParishDataHandle.parishMembers.length; i++) {
        const member = ParishDataHandle.parishMembers[i];
        membersSelect.innerHTML += `<option value="${member['_id']}">${member['name']}</option>`;
    }

    const submitButton = domCreate('i');
    submitButton.innerText = 'add';
    submitButton.style.border = '1px solid grey';
    // addClasslist(submitButton, ['bi', 'bi-cloud-upload']);
    submitButton.onclick = async function (ev) {
        const position = postionInput.value;
        const memberId = membersSelect.value;
        console.log(memberId);

        if (!position || !memberId) {
            return MessegePopup.showMessegePuppy([
                MondoText({ 'text': 'please enter position and select a member to proceed' })
            ]);
        } else {
            let result = await Post('/parish/add/leader',
                mapValuesToUppercase({
                    'position': position,
                    'member_id': memberId
                }),
                { 'requiresParishDetails': true }
            );
            MessegePopup.showMessegePuppy([MondoText({ 'text': result['response'] })]);
            if (result['response'].match('success')) {
                ParishDataHandle.parishLevelLeaders = await getParishLeaders();
                clearTextEdits([postionInput, membersSelect]);
                ModalExpertise.hideModal();
            }
        }
    }

    const column = Column({
        'styles': [{ 'padding': '20px' }],
        'children': [
            membersSelect,
            postionInput,
        ]
    })

    ModalExpertise.showModal({
        'topRowUserActions': [submitButton],
        'actionHeading': 'add parish leader',
        'children': [column]
    })
}

export function showParishLeadersView() {
    const parentView = Column({
        'styles': [{ 'padding': '20px' }],
        'children': []
    });

    const addLeaderButton = domCreate('i');
    addClasslist(addLeaderButton, ['bi', 'bi-person-plus-fill', 'bi-pad']);
    addLeaderButton.onclick = function (ev) {
        promptAddParishAddLeaders();
    }
    parentView.appendChild(addLeaderButton);

    // show available leaders table with their telephone
    // retrieve member/leaders by their ids
    const leaders = ParishDataHandle.parishLevelLeaders;
    if (leaders.length < 1) {
        parentView.appendChild(MondoText({ 'text': 'no parish leaders yet' }));
    } else {
        leaders.forEach(function (leader) {
            const member = getMemberById(leader['member_id']);
            if (member) {
                let deleteIcon = domCreate('i');
                addClasslist(deleteIcon, ['bi', 'bi-trash', 'bi-pad']);

                deleteIcon.onclick = async function (ev) {
                    ev.preventDefault();
                    const result = await Post('/parish/delete/leader',
                        { 'leader_id': leader['_id'] },
                        { 'requiresParishDetails': true }
                    );

                    let msg = result['response'];
                    if (msg.match('success') || msg.match('delete')) {
                        MessegePopup.showMessegePuppy([MondoText({ 'text': 'leader deleted' })]);
                        window.location.reload();
                    }
                    ParishDataHandle.parishLevelLeaders = ParishDataHandle.parishLevelLeaders.filter(function (otherLeaders) {
                        return otherLeaders['_id'] != leader['_id'];
                    });
                }

                const column = Column({
                    'styles': [{ 'border': '1px solid grey' }, { 'padding': '10px' }],
                    'children': [
                        Row({ 'classlist': ['f-w', 'just-end'], 'children': [deleteIcon,] }),
                        MondoText({ 'text': member.name }),
                        MondoText({ 'text': leader.position }),
                        MondoText({ 'text': member.telephone_number }),
                    ]
                });
                parentView.appendChild(column);
            }
        });
    }



    ModalExpertise.showModal({
        'actionHeading': 'parish leaders',
        'fullScreen': true,
        'modalHeadingStyles': [{ 'background-color': 'royalblue' }, { 'color': 'white' }],
        'children': [parentView],
    })
}

// parish leaders' report
// a table showing important leaders details from position, telephone number, scc, outstation...
export function showParishLeadersReport() {
    const parentView = Column({
        'styles': [{ 'padding': '20px' }],
        'children': []
    });

    const tableId = 'parishLeaders-table';
    const printButton = new PDFPrintButton(tableId);

    PDFPrintButton.printingHeading = `${LocalStorageContract.completeParishName()} Leaders`.toUpperCase();

    const addLeaderButton = domCreate('i');
    addClasslist(addLeaderButton, ['bi', 'bi-person-plus-fill', 'bi-pad']);
    addLeaderButton.onclick = function (ev) {
        promptAddParishAddLeaders();
    }
    parentView.appendChild(addLeaderButton);

    // show available leaders table with their telephone
    // retrieve member/leaders by their ids
    let leaders = ParishDataHandle.parishLevelLeaders;
    leaders = leaders.map(function (leader) {
        let scc = ParishDataHandle.parishSCCs.find(function (scc) {
            return scc['_id'] === leader['scc_id']
        }) || { 'name': 'EVERY SCC' };

        let outstation = ParishDataHandle.parishOutstations.find(function (o) {
            return o['_id'] === leader['outstation_id']
        }) || { 'name': 'EVERY OUTSTATION' };

        return {
            ...leader,
            'scc': scc,
            'outstation': outstation
        }
    }).sort(function (a, b) {
        return `${a['outstation']['name']}`.localeCompare(`${b['outstation']['name']}`);
    }).sort(function (a, b) {
        return `${a['scc']['name']}`.localeCompare(`${b['scc']['name']}`);
    });

    if (leaders.length < 1) {
        parentView.appendChild(MondoText({ 'text': 'no parish leaders yet' }));
    } else {
        const table = domCreate('table');
        table.id = tableId;
        const thead = domCreate('thead');
        const tbody = domCreate('tbody');
        const tfoot = domCreate('tfoot');

        thead.innerHTML = `
            <tr>
                <td>NO</td>
                <td>NAME</td>
                <td>POSITION</td>
                <td>TELEPHONE</td>
                <td>OUTSTATION</td>
                <td>SCC</td>
            </tr>
        `
        addChildrenToView(table, [thead, tbody, tfoot]);

        leaders.forEach(function (leader, i) {
            const member = getMemberById(leader['member_id']);
            if (member) {
                let scc = ParishDataHandle.parishSCCs.find(function (scc) {
                    return scc['_id'] === member['scc_id']
                }) || { 'name': 'EVERY SCC' };

                let outstation = ParishDataHandle.parishOutstations.find(function (o) {
                    return o['_id'] === member['outstation_id']
                }) || { 'name': 'EVERY OUTSTATION' };

                const row = domCreate('tr');
                row.innerHTML = `
                    <td>${i + 1}</td>
                    <td>${member.name}</td>
                    <td>${leader.position}</td>
                    <td><a href='tel:${member.telephone_number}'>${member.telephone_number}</a></td>
                    <td>${outstation['name']}</td>
                    <td>${scc['name']}</td>
                `;
                tbody.appendChild(row);
            }
        });

        parentView.appendChild(table);
    }

    ModalExpertise.showModal({
        'actionHeading': 'parish leaders',
        'fullScreen': true,
        'topRowUserActions': [printButton],
        'modalHeadingStyles': [{ 'background-color': 'royalblue' }, { 'color': 'white' }],
        'children': [parentView],
    })
}
