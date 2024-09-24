import { Column } from "../UI/column.js";
import { TextEdit } from "../UI/textedit.js";
import { MondoText } from "../UI/mondo_text.js";
import { Button } from "../UI/button.js";
import { domCreate } from "../../dom/query.js";
import { addClasslist } from "../utils/stylus.js";
import { Post } from "../../net_tools.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { ParishDataHandle } from "../../data_pen/parish_data_handle.js";
import { Row } from "../UI/cool_tool_ui.js";
import { clearTextEdits } from "../../dom/text_edit_utils.js";
import { getParishAssociations } from "../../data_source/main.js";
import { addChildrenToView } from "../../dom/addChildren.js";
import { MondoSelect } from "../UI/mondo_select.js";
import { PDFPrintButton } from "../tailored_ui/print_button.js";

// prompt add association
export function PromptAddAssociation() {
    const nameInputEl = TextEdit({ 'placeholder': 'association name' });
    const submitButton = Button({ 'text': 'save' });
    submitButton.style.border = '1px solid grey';

    submitButton.onclick = async function (ev) {
        const name = nameInputEl.value;
        if (!name) {
            return MessegePopup.showMessegePuppy([
                MondoText({ 'text': 'please enter name to proceed' })
            ]);
        } else {
            let result = await Post('/parish/add/association',
                {
                    association: {
                        'name': name,
                        // leader {member_id: '', position: ''}
                        'leaders': [],
                        'members_id': []
                    }
                },
                { 'requiresParishDetails': true }
            );

            if (result['response'].match('success')) {
                clearTextEdits([nameInputEl]);
                ParishDataHandle.parishAssociations = await getParishAssociations();
            }

            MessegePopup.showMessegePuppy([MondoText({ 'text': result['response'] })]);
        }
    }

    const column = Column({
        'styles': [{ 'padding': '20px' }],
        'children': [nameInputEl, submitButton]
    });

    ModalExpertise.showModal({
        'actionHeading': 'add association',
        'children': [column]
    })
}

// prompt update association
export function PromptUpdateAssociation(association) {
    const nameInputEl = TextEdit({ 'placeholder': 'association name', 'value': association['name'] });
    const submitButton = domCreate('i');
    submitButton.innerText = 'update';
    submitButton.style.border = '1px solid grey';
    // addClasslist(submitButton, ['bi', 'bi-cloud-upload']);
    submitButton.onclick = async function (ev) {
        const name = nameInputEl.value;
        if (!name) {
            return MessegePopup.showMessegePuppy([
                MondoText({ 'text': 'please enter name to proceed' })
            ]);
        } else {
            let result = await Post('/parish/update/association',
                {
                    association: {
                        '_id': association['_id'],
                        'name': name,
                    }
                },
                { 'requiresParishDetails': true }
            );

            if (result['response'].match('success')) {
                clearTextEdits([nameInputEl]);
                ParishDataHandle.parishAssociations = await getParishAssociations();
            }

            MessegePopup.showMessegePuppy([MondoText({ 'text': result['response'] })]);
        }
    }

    const column = Column({
        'styles': [{ 'padding': '20px' }],
        'children': [nameInputEl]
    })

    ModalExpertise.showModal({
        'topRowUserActions': [submitButton],
        'actionHeading': 'update association',
        'children': [column]
    })
}

// view parish associations
export function ViewParishAssociations() {
    const parentView = Column({
        'styles': [{ 'padding': '20px' }],
        'children': []
    });

    if (ParishDataHandle.parishAssociations.length < 1) {
        addChildrenToView(parentView,
            [
                MondoText({ 'text': 'no associations yet' }),
                MondoText({ 'text': '+ add one by clicking on the add button' })
            ]);
    } else {
        ParishDataHandle.parishAssociations.forEach(function (association) {
            let deleteIcon = domCreate('i');
            addClasslist(deleteIcon, ['bi', 'bi-trash', 'bi-pad']);

            deleteIcon.onclick = async function (ev) {
                ev.preventDefault();
                const result = await Post('/parish/delete/association',
                    { 'association_id': association['_id'] },
                    { 'requiresParishDetails': true }
                );

                let msg = result['response'];
                if (msg.match('success') || msg.match('delete')) {
                    MessegePopup.showMessegePuppy([MondoText({ 'text': 'association deleted' })]);
                    ModalExpertise.hideModal();
                }
                ParishDataHandle.parishAssociations = ParishDataHandle.parishAssociations.filter(function (otherAssociations) {
                    return otherAssociations['_id'] != association['_id'];
                });
            }

            let updateIcon = domCreate('i');
            addClasslist(updateIcon, ['bi', 'bi-pencil-square', 'bi-pad']);
            updateIcon.onclick = function (ev) {
                PromptUpdateAssociation(association);
            }

            let addLeaderIcon = domCreate('i');
            addClasslist(addLeaderIcon, ['bi', 'bi-person-plus-fill', 'bi-pad']);
            addLeaderIcon.title = 'add leader';
            addLeaderIcon.onclick = function (ev) {
                PromptAddAssociationLeader(association);
            }

            let addMemberIcon = domCreate('i');
            addMemberIcon.title = 'add member';
            addClasslist(addMemberIcon, ['bi', 'bi-person-plus-', 'bi-pad']);
            addMemberIcon.onclick = function (ev) {
                PromptAddAssociationMember(association);
            }

            let viewDetailsIcon = domCreate('i');
            viewDetailsIcon.title = 'view details';
            addClasslist(viewDetailsIcon, ['bi', 'bi-info-circle-fill', 'bi-pad']);
            viewDetailsIcon.onclick = function (ev) {
                ViewAssociationDetails(association);
            }

            let membersViewButton = domCreate('i');
            membersViewButton.title = 'view members';
            addClasslist(membersViewButton, ['bi', 'bi-people-fill', 'bi-pad']);
            membersViewButton.onclick = function (ev) {
                ViewAssociationMembersFilterableByOutstationAndSCC(association);
            }

            const leadersViewButton = domCreate('i');
            leadersViewButton.title = 'view leaders';
            addClasslist(leadersViewButton, ['bi', 'bi-person-fill', 'bi-pad']);
            leadersViewButton.onclick = function (ev) {
                ViewAssociationLeaders(association);
            }

            const column = Column({
                'styles': [{ 'border': '1px solid grey' }, { 'padding': '10px' }],
                'children': [
                    MondoText({ 'text': association.name }),
                    Row({
                        'classlist': ['f-w', 'just-end'], 'children': [
                            updateIcon,
                            deleteIcon,
                            addLeaderIcon,
                            addMemberIcon,
                            membersViewButton,
                            leadersViewButton,
                            viewDetailsIcon,
                        ]
                    }),
                ]
            });

            column.appendChild(Row({ 'classlist': ['f-w', 'just-end'], 'children': [updateIcon, deleteIcon,] }));

            parentView.appendChild(column);
        });
    }

    ModalExpertise.showModal({
        'actionHeading': 'parish associations',
        'fullScreen': true,
        'modalHeadingStyles': [{ 'background-color': 'royalblue' }, { 'color': 'white' }],
        'children': [parentView],
    })
}


export function ViewAssociationMembersFilterableByOutstationAndSCC(association) {
    const tableId = 'association-members-table';

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
    `
    addChildrenToView(table, [thead, tbody, tfoot]);

    const outstationPicker = MondoSelect({ 'styles': [{ 'margin-bottom': '10px' }] });
    ParishDataHandle.parishOutstations.forEach(function (outstation) {
        outstationPicker.innerHTML += `<option value="${outstation['_id']}">${outstation['name']}</option>`;
    });

    const sccPicker = MondoSelect({ 'styles': [{ 'margin-bottom': '10px' }] });
    ParishDataHandle.parishSCCs.forEach(function (scc) {
        sccPicker.innerHTML += `<option value="${scc['_id']}">${scc['name']}</option>`;
    });

    function loadView(outstationId = null, sccId = null) {
        tbody.innerHTML = ''; // Clear existing table data

        let filteredData = ParishDataHandle.parishMembers.filter(function (member) {
            return association['members_id'].includes(member['_id']);
        });

        if (outstationId) {
            filteredData = filteredData.filter(function (member) {
                return member['outstation_id'] === outstationId;
            });
        }

        if (sccId) {
            filteredData = filteredData.filter(function (member) {
                return member['scc_id'] === sccId;
            });
        }

        filteredData.forEach(function (member, i) {
            let scc = ParishDataHandle.parishSCCs.find(function (scc) {
                return scc['_id'] === member['scc_id']
            }) || { 'name': 'EVERY SCC' };

            let outstation = ParishDataHandle.parishOutstations.find(function (o) {
                return o['_id'] === member['outstation_id']
            }) || { 'name': 'EVERY OUTSTATION' };

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
    outstationPicker.addEventListener('change', function (ev) {
        const selectedOutstationId = outstationPicker.value;
        loadView(selectedOutstationId);
    });

    sccPicker.addEventListener('change', function (ev) {
        const selectedSccId = sccPicker.value;
        loadView(null, selectedSccId);
    });

    const column = Column({
        'classlist': ['f-w', 'a-c', 'scroll-y'],
        'styles': [{ 'padding': '10px' }],
        'children': [outstationPicker, sccPicker, table] // Add volumeSelector to the view
    });

    ModalExpertise.showModal({
        'actionHeading': `association members (${association['members_id'].length})`,
        'modalHeadingStyles': [{ 'background': '#4788fd' }, { 'color': 'white' }],
        'topRowUserActions': [new PDFPrintButton(tableId)],
        'children': [column],
        'modalChildStyles': [{ 'width': 'fit-content' }, { 'height': '90%' }],
        'fullScreen': false,
        'dismisible': true,
    });
}

export function viewAssociationMembers(association) {
    const tableId = 'association-members-table';

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
    `
    addChildrenToView(table, [thead, tbody, tfoot]);

    const members = ParishDataHandle.parishMembers.filter(function (member) {
        return association['members_id'].includes(member['_id']);
    });

    members.forEach(function (member, i) {
        let scc = ParishDataHandle.parishSCCs.find(function (scc) {
            return scc['_id'] === member['scc_id']
        }) || { 'name': 'EVERY SCC' };

        let outstation = ParishDataHandle.parishOutstations.find(function (o) {
            return o['_id'] === member['outstation_id']
        }) || { 'name': 'EVERY OUTSTATION' };

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

    const column = Column({
        'classlist': ['f-w', 'a-c', 'scroll-y'],
        'styles': [{ 'padding': '10px' }],
        'children': [table]
    });

    ModalExpertise.showModal({
        'actionHeading': `association members (${association['members_id'].length})`,
        'modalHeadingStyles': [{ 'background': '#4788fd' }, { 'color': 'white' }],
        'topRowUserActions': [new PDFPrintButton(tableId)],
        'children': [column],
        'modalChildStyles': [{ 'width': 'fit-content' }, { 'height': '90%' }],
        'fullScreen': false,
        'dismisible': true,
    });
}

// export function ViewAssociationLeaders(association) {
//     const tableId = 'association-leaders-table';

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
//             <td>POSITION</td>
//             <td>SCC</td>
//             <td>OUTSTATION</td>
//         </tr>
//     `
//     addChildrenToView(table, [thead, tbody, tfoot]);

//     association['leaders'].forEach(function (leader, i) {
//         let member = ParishDataHandle.parishMembers.find(function (member) {
//             return member['_id'] === leader['member_id'];
//         });

//         if (member) {
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
//                 <td>${leader['position']}</td>
//                 <td>${scc['name']}</td>
//                 <td>${outstation['name']}</td>
//             `;
//             tbody.appendChild(row);
//         }
//     });

//     const column = Column({
//         'classlist': ['f-w', 'a-c', 'scroll-y'],
//         'styles': [{ 'padding': '10px' }],
//         'children': [table]
//     });

//     ModalExpertise.showModal({
//         'actionHeading': `association leaders (${association['leaders'].length})`,
//         'modalHeadingStyles': [{ 'background': '#4788fd' }, { 'color': 'white' }],
//         'topRowUserActions': [new PDFPrintButton(tableId)],
//         'children': [column],
//         'modalChildStyles': [{ 'width': 'fit-content' }, { 'height': '90%' }],
//         'fullScreen': false,
//         'dismisible': true,
//     });
// }


export function PromptAddAssociationLeader(association) {
    const memberPicker = MondoSelect({ 'styles': [{ 'margin-bottom': '10px' }] });
    ParishDataHandle.parishMembers.forEach(function (member) {
        memberPicker.innerHTML += `<option value="${member['_id']}">${member['name']}</option>`;
    });

    const positionInputEl = TextEdit({ 'placeholder': 'position' });
    const submitButton = Button({ 'text': 'save' });
    submitButton.style.border = '1px solid grey';

    submitButton.onclick = async function (ev) {
        const memberId = memberPicker.value;
        const position = positionInputEl.value;
        if (!memberId || !position) {
            return MessegePopup.showMessegePuppy([
                MondoText({ 'text': 'please select a member and enter a position to proceed' })
            ]);

        } else {
            let result = await Post('/parish/add/association/leader',
                {
                    association: {
                        '_id': association['_id'],
                        'leader': {
                            'member_id': memberId,
                            'position': `${position}`.trim().toUpperCase()
                        }
                    }
                },
                { 'requiresParishDetails': true }
            );

            if (result['response'].match('success')) {
                clearTextEdits([positionInputEl]);
                ParishDataHandle.parishAssociations = await getParishAssociations();
            }

            MessegePopup.showMessegePuppy([MondoText({ 'text': result['response'] })]);
        }
    }

    const column = Column({
        'styles': [{ 'padding': '20px' }],
        'children': [memberPicker, positionInputEl, submitButton]
    });

    ModalExpertise.showModal({
        'actionHeading': 'add association leader',
        'children': [column]
    })
}


// function viewAssociationMembers(association) {
//     const tableId = association['name'];
//     const printButton = new PDFPrintButton(tableId);

//     const parentView = Column({
//         'styles': [{ 'padding': '20px' }],
//         'children': []
//     });

//     if (association['members_id'].length < 1) {
//         addChildrenToView(parentView,
//             [
//                 MondoText({ 'text': 'no members added to this association yet' }),
//             ]);
//     } else {

//         PDFPrintButton.printingHeading = `${association['name']} members`

//         const table = domCreate('table');
//         table.id = tableId;
//         const thead = domCreate('thead');
//         const tbody = domCreate('tbody');
//         const tfoot = domCreate('tfoot');

//         thead.innerHTML = `
//             <tr>
//                 <td>NO</td>
//                 <td>NAME</td>
//                 <td>TELEPHONE</td>
//                 <td>SCC</td>
//                 <td>OUTSTATION</td>
//             </tr>
//         `;
//         addChildrenToView(table, [thead, tbody, tfoot]);

//         association['members_id'].forEach(function (memberId, i) {
//             let member = ParishDataHandle.parishMembers.find(function (member) {
//                 return member['_id'] === memberId;
//             });

//             if (member) {
//                 let scc = ParishDataHandle.parishSCCs.find(function (scc) {
//                     return scc['_id'] === member['scc_id'];
//                 }) || { 'name': 'EVERY SCC' };

//                 let outstation = ParishDataHandle.parishOutstations.find(function (o) {
//                     return o['_id'] === member['outstation_id'];
//                 }) || { 'name': 'EVERY OUTSTATION' };

//                 let deleteIcon = domCreate('i');
//                 addClasslist(deleteIcon, ['bi', 'bi-trash', 'bi-pad']);

//                 deleteIcon.onclick = async function (ev) {
//                     ev.preventDefault();
//                     const result = await Post('/parish/delete/association/member',
//                         { 'association_id': association['_id'], 'member_id': memberId },
//                         { 'requiresParishDetails': true }
//                     );

//                     let msg = result['response'];
//                     if (msg.match('success') || msg.match('delete')) {
//                         MessegePopup.showMessegePuppy([MondoText({ 'text': 'member deleted' })]);
//                         ModalExpertise.hideModal();
//                     }
//                     ParishDataHandle.parishAssociations = ParishDataHandle.parishAssociations.filter(function (otherAssociations) {
//                         return otherAssociations['_id'] != association['_id'];
//                     });
//                 }

//                 const row = domCreate('tr');
//                 row.innerHTML = `
//                     <td>${i + 1}</td>
//                     <td>${member.name}</td>
//                     <td>${member.telephone_number}</td>
//                     <td>${scc['name']}</td>
//                     <td>${outstation['name']}</td>
//                 `;
//                 tbody.appendChild(row);
//             }
//         });

//         parentView.appendChild(table);
//     }

//     ModalExpertise.showModal({
//         'actionHeading': `members in ${association.name}`,
//         'fullScreen': true,
//         'topRowUserActions': [printButton],
//         'modalHeadingStyles': [{ 'background-color': 'royalblue' }, { 'color': 'white' }],
//         'children': [parentView],
//     })
// }

// view association leaders

// export function ViewAssociationLeaders(association) {
//     const parentView = Column({
//         'styles': [{ 'padding': '20px' }],
//         'children': []
//     });

//     if (association['leaders'].length < 1) {
//         addChildrenToView(parentView,
//             [
//                 MondoText({ 'text': 'no leaders added to this association yet' }),
//             ]);
//     } else {
//         association['leaders'].forEach(function (leader) {
//             let member = ParishDataHandle.parishMembers.find(function (member) {
//                 return member['_id'] === leader['member_id'];
//             });

//             if (member) {
//                 let deleteIcon = domCreate('i');
//                 addClasslist(deleteIcon, ['bi', 'bi-trash', 'bi-pad']);

//                 deleteIcon.onclick = async function (ev) {
//                     ev.preventDefault();
//                     const result = await Post('/parish/delete/association/leader',
//                         { 'association_id': association['_id'], 'leader_id': leader['_id'] },
//                         { 'requiresParishDetails': true }
//                     );

//                     let msg = result['response'];
//                     if (msg.match('success') || msg.match('delete')) {
//                         MessegePopup.showMessegePuppy([MondoText({ 'text': 'leader deleted' })]);
//                         ModalExpertise.hideModal();
//                     }
//                     ParishDataHandle.parishAssociations = ParishDataHandle.parishAssociations.filter(function (otherAssociations) {
//                         return otherAssociations['_id'] != association['_id'];
//                     });
//                 }

//                 const column = Column({
//                     'styles': [{ 'border': '1px solid grey' }, { 'padding': '10px' }],
//                     'children': [
//                         Row({ 'classlist': ['f-w', 'just-end'], 'children': [deleteIcon,] }),
//                         MondoText({ 'text': member.name }),
//                         MondoText({ 'text': leader.position }),
//                     ]
//                 });
//                 parentView.appendChild(column);
//             }
//         });
//     }

//     ModalExpertise.showModal({
//         'actionHeading': `leaders in ${association.name}`,
//         'fullScreen': true,
//         'modalHeadingStyles': [{ 'background-color': 'royalblue' }, { 'color': 'white' }],
//         'children': [parentView],
//     })
// }

// view association members

export function ViewAssociationMembers(association) {
    const parentView = Column({
        'styles': [{ 'padding': '20px' }],
        'children': []
    });

    if (association['members_id'].length < 1) {
        addChildrenToView(parentView,
            [
                MondoText({ 'text': 'no members added to this association yet' }),
            ]);
    } else {
        association['members_id'].forEach(function (memberId) {
            let member = ParishDataHandle.parishMembers.find(function (member) {
                return member['_id'] === memberId;
            });

            if (member) {
                let deleteIcon = domCreate('i');
                addClasslist(deleteIcon, ['bi', 'bi-trash', 'bi-pad']);

                deleteIcon.onclick = async function (ev) {
                    ev.preventDefault();
                    const result = await Post('/parish/delete/association/member',
                        { 'association_id': association['_id'], 'member_id': memberId },
                        { 'requiresParishDetails': true }
                    );

                    let msg = result['response'];
                    if (msg.match('success') || msg.match('delete')) {
                        MessegePopup.showMessegePuppy([MondoText({ 'text': 'member deleted' })]);
                        ModalExpertise.hideModal();
                    }
                    ParishDataHandle.parishAssociations = ParishDataHandle.parishAssociations.filter(function (otherAssociations) {
                        return otherAssociations['_id'] != association['_id'];
                    });
                }

                const column = Column({
                    'styles': [{ 'border': '1px solid grey' }, { 'padding': '10px' }],
                    'children': [
                        Row({ 'classlist': ['f-w', 'just-end'], 'children': [deleteIcon,] }),
                        MondoText({ 'text': member.name }),
                    ]
                });
                parentView.appendChild(column);
            }
        });
    }

    ModalExpertise.showModal({
        'actionHeading': `members in ${association.name}`,
        'fullScreen': true,
        'modalHeadingStyles': [{ 'background-color': 'royalblue' }, { 'color': 'white' }],
        'children': [parentView],
    })
}

// view association details
export function ViewAssociationDetails(association) {
    const parentView = Column({
        'styles': [{ 'padding': '20px' }],
        'classlist': ['fx-col', 'f-w', 'f-h', 'space-around', 'a-c'],
        'children': []
    });

    const associationName = MondoText({ 'text': association.name });
    parentView.appendChild(associationName);

    const leadersButton = Button({ 'text': 'view leaders' });
    leadersButton.onclick = function (ev) {
        ViewAssociationLeaders(association);
    }
    parentView.appendChild(leadersButton);

    const membersButton = Button({ 'text': 'view members' });
    membersButton.onclick = function (ev) {
        ViewAssociationMembers(association);
    }
    parentView.appendChild(membersButton);

    const addLeaderButton = Button({ 'text': 'add leader' });
    addLeaderButton.onclick = function (ev) {
        PromptAddAssociationLeader(association);
    }
    parentView.appendChild(addLeaderButton);

    const addMemberButton = Button({ 'text': 'add member' });
    addMemberButton.onclick = function (ev) {
        PromptAddAssociationMember(association);
    }
    parentView.appendChild(addMemberButton);

    ModalExpertise.showModal({
        'actionHeading': `association details`,
        'fullScreen': true,
        'modalHeadingStyles': [{ 'background-color': 'royalblue' }, { 'color': 'white' }],
        'children': [parentView],
    })
}

// view all associations
export function ViewAllAssociations() {
    const parentView = Column({
        'styles': [{ 'padding': '20px' }],
        'children': []
    });

    if (ParishDataHandle.parishAssociations.length < 1) {
        addChildrenToView(parentView,
            [
                MondoText({ 'text': 'no associations yet' }),
                MondoText({ 'text': '+ add one by clicking on the add button' })
            ]);
    } else {
        ParishDataHandle.parishAssociations.forEach(function (association) {
            let deleteIcon = domCreate('i');
            addClasslist(deleteIcon, ['bi', 'bi-trash', 'bi-pad']);

            deleteIcon.onclick = async function (ev) {
                ev.preventDefault();

                const result = await Post('/parish/delete/association',
                    { 'association_id': association['_id'] },
                    { 'requiresParishDetails': true }
                );

                let msg = result['response'];
                if (msg.match('success') || msg.match('delete')) {
                    MessegePopup.showMessegePuppy([MondoText({ 'text': 'association deleted' })]);
                    ModalExpertise.hideModal();
                }

                ParishDataHandle.parishAssociations = ParishDataHandle
                    .parishAssociations
                    .filter(function (otherAssociations) {
                        return otherAssociations['_id'] != association['_id'];
                    });
            }

            let updateIcon = domCreate('i');
            addClasslist(updateIcon, ['bi', 'bi-pencil-square', 'bi-pad']);
            updateIcon.onclick = function (ev) {
                PromptUpdateAssociation(association);
            }

            const column = Column({
                'styles': [{ 'border': '1px solid grey' }, { 'padding': '10px' }],
                'children': [
                    MondoText({ 'text': association.name }),
                    Row({
                        'classlist': ['f-w', 'just-end'],
                        'children': [
                            updateIcon,
                            // deleteIcon
                        ]
                    }),
                ]
            });

            column.onclick = function (ev) {
                ViewAssociationDetails(association);
            }

            parentView.appendChild(column);
        });
    }

    ModalExpertise.showModal({
        'actionHeading': 'parish associations',
        'fullScreen': true,
        'modalHeadingStyles': [{ 'background-color': 'royalblue' }, { 'color': 'white' }],
        'children': [parentView],
    })
}


// prompt add leader to association
// export function PromptAddLeaderToAssociation(association) {
//     const memberPicker = MondoSelect({ 'styles': [{ 'margin-bottom': '10px' }] });
//     ParishDataHandle.parishMembers.forEach(function (member) {
//         memberPicker.innerHTML += `<option value="${member['_id']}">${member['name']}</option>`;
//     });

//     const positionInputEl = TextEdit({ 'placeholder': 'position' });
//     const submitButton = Button({ 'text': 'save' });
//     submitButton.style.border = '1px solid grey';

//     submitButton.onclick = async function (ev) {
//         const memberId = memberPicker.value;
//         const position = positionInputEl.value;
//         if (!memberId || !position) {
//             return MessegePopup.showMessegePuppy([
//                 MondoText({ 'text': 'please select a member and enter a position to proceed' })
//             ]);

//         } else {
//             let result = await Post('/parish/add/association/leader',
//                 {
//                     association: {
//                         '_id': association['_id'],
//                         'leader': {
//                             'member_id': memberId,
//                             'position': position
//                         }
//                     }
//                 },
//                 { 'requiresParishDetails': true }
//             );

//             if (result['response'].match('success')) {
//                 clearTextEdits([positionInputEl]);
//                 ParishDataHandle.parishAssociations = await getParishAssociations();
//             }

//             MessegePopup.showMessegePuppy([MondoText({ 'text': result['response'] })]);
//         }
//     }

//     const column = Column({
//         'styles': [{ 'padding': '20px' }],
//         'children': [memberPicker, positionInputEl, submitButton]
//     });

//     ModalExpertise.showModal({
//         'actionHeading': 'add association leader',
//         'children': [column]
//     })
// }

// prompt add association member
// export function PromptAddAssociationMember(association) {
//     const memberPicker = MondoSelect({ 'styles': [{ 'margin-bottom': '10px' }] });
//     ParishDataHandle.parishMembers.forEach(function (member) {
//         memberPicker.innerHTML += `<option value="${member['_id']}">${member['name']}</option>`;
//     });

//     const submitButton = Button({ 'text': 'save' });
//     submitButton.style.border = '1px solid grey';

//     submitButton.onclick = async function (ev) {
//         const memberId = memberPicker.value;
//         if (!memberId) {
//             return MessegePopup.showMessegePuppy([
//                 MondoText({ 'text': 'please select a member to proceed' })
//             ]);
//         } else {
//             let result = await Post('/parish/add/association/member',
//                 {
//                     association: {
//                         '_id': association['_id'],
//                         'member_id': memberId
//                     }
//                 },
//                 { 'requiresParishDetails': true }
//             );

//             if (result['response'].match('success')) {
//                 clearTextEdits([memberPicker]);
//                 ParishDataHandle.parishAssociations = await getParishAssociations();
//             }

//             MessegePopup.showMessegePuppy([MondoText({ 'text': result['response'] })]);
//         }
//     }

//     const column = Column({
//         'styles': [{ 'padding': '20px' }],
//         'children': [memberPicker, submitButton]
//     });

//     ModalExpertise.showModal({
//         'actionHeading': 'add association member',
//         'children': [column]
//     })
// }

// prompt remove association member
// export function PromptRemoveAssociationMember(association, memberId) {
//     const submitButton = Button({ 'text': 'remove' });
//     submitButton.style.border = '1px solid grey';

//     submitButton.onclick = async function (ev) {
//         let result = await Post('/parish/remove/association/member',
//             {
//                 association: {
//                     '_id': association['_id'],
//                     'member_id': memberId
//                 }
//             },
//             { 'requiresParishDetails': true }
//         );

//         if (result['response'].match('success')) {
//             ParishDataHandle.parishAssociations = await getParishAssociations();
//         }

//         MessegePopup.showMessegePuppy([MondoText({ 'text': result['response'] })]);
//     }

//     const column = Column({
//         'styles': [{ 'padding': '20px' }],
//         'children': [submitButton]
//     });

//     ModalExpertise.showModal({
//         'actionHeading': 'remove association member',
//         'children': [column]
//     })
// }

// prompt remove association leader
// export function PromptRemoveAssociationLeader(association, leaderId) {
//     const submitButton = Button({ 'text': 'remove' });
//     submitButton.style.border = '1px solid grey';

//     submitButton.onclick = async function (ev) {
//         let result = await Post('/parish/remove/association/leader',
//             {
//                 association: {
//                     '_id': association['_id'],
//                     'leader_id': leaderId
//                 }
//             },
//             { 'requiresParishDetails': true }
//         );

//         if (result['response'].match('success')) {
//             ParishDataHandle.parishAssociations = await getParishAssociations();
//         }

//         MessegePopup.showMessegePuppy([MondoText({ 'text': result['response'] })]);
//     }

//     const column = Column({
//         'styles': [{ 'padding': '20px' }],
//         'children': [submitButton]
//     });

//     ModalExpertise.showModal({
//         'actionHeading': 'remove association leader',
//         'children': [column]
//     })
// }

// // view association leaders
export function ViewAssociationLeaders(association) {
    const leadersTableId = 'leaders-table';
    const pdfPrintButton = new PDFPrintButton(leadersTableId);

    PDFPrintButton.printingHeading = `${association['name']} leaders`

    const parentView = Column({
        'styles': [{ 'padding': '20px' }],
        'children': []
    });

    if (association['leaders'].length < 1) {
        addChildrenToView(parentView,
            [
                MondoText({ 'text': 'no leaders added to this association yet' }),
            ]);
    } else {
        const table = domCreate('table');
        table.id = leadersTableId;
        const thead = domCreate('thead');
        const tbody = domCreate('tbody');
        const tfoot = domCreate('tfoot');

        thead.innerHTML = `
            <tr>
                <td>NO</td>
                <td>NAME</td>
                <td>TELEPHONE</td>
                <td>POSITION</td>
                <td>SCC</td>
                <td>OUTSTATION</td>
            </tr>
        `
        addChildrenToView(table, [thead, tbody, tfoot]);

        association['leaders'].forEach(function (leader, i) {
            let member = ParishDataHandle.parishMembers.find(function (member) {
                return member['_id'] === leader['member_id'];
            });

            if (member) {
                let scc = ParishDataHandle.parishSCCs.find(function (scc) {
                    return scc['_id'] === member['scc_id']
                }) || { 'name': 'EVERY SCC' };

                let outstation = ParishDataHandle.parishOutstations.find(function (o) {
                    return o['_id'] === member['outstation_id']
                }) || { 'name': 'EVERY OUTSTATION' };

                let deleteIcon = domCreate('i');
                addClasslist(deleteIcon, ['bi', 'bi-trash', 'bi-pad']);

                deleteIcon.onclick = async function (ev) {
                    ev.preventDefault();
                    const result = await Post('/parish/delete/association/leader',
                        { 'association_id': association['_id'], 'leader_id': leader['_id'] },
                        { 'requiresParishDetails': true }
                    );

                    let msg = result['response'];
                    if (msg.match('success') || msg.match('delete')) {
                        MessegePopup.showMessegePuppy([MondoText({ 'text': 'leader deleted' })]);
                        ModalExpertise.hideModal();
                    }
                    ParishDataHandle.parishAssociations = ParishDataHandle.parishAssociations.filter(function (otherAssociations) {
                        return otherAssociations['_id'] != association['_id'];
                    });
                }

                const row = domCreate('tr');
                row.innerHTML = `
                    <td>${i + 1}</td>
                    <td>${member['name']}</td>
                    <td>${member['telephone_number']}</td>
                     <td>${leader['position']}</td>
                     <td>${scc['name']}</td>
                     <td>${outstation['name']}</td>`;
                tbody.appendChild(row);
            }
        });

        parentView.appendChild(table);
    }

    ModalExpertise.showModal({
        'actionHeading': `leaders in ${association.name}`,
        'fullScreen': true,
        'topRowUserActions': [pdfPrintButton],
        'modalHeadingStyles': [{ 'background-color': 'royalblue' }, { 'color': 'white' }],
        'children': [parentView],
    })
}

// // // view association leaders
// // export function ViewAssociationLeaders(association) {
// //     const parentView = Column({
// //         'styles': [{ 'padding': '20px' }],
// //         'children': []
// //     });

// //     if (association['leaders'].length < 1) {
// //         addChildrenToView(parentView,
// //             [
// //                 MondoText({ 'text': 'no leaders added to this association yet' }),
// //             ]);
// //     } else {
// //         association['leaders'].forEach(function (leader) {
// //             let member = ParishDataHandle.parishMembers.find(function (member) {
// //                 return member['_id'] === leader['member_id'];
// //             });

// //             if (member) {
// //                 let deleteIcon = domCreate('i');
// //                 addClasslist(deleteIcon, ['bi', 'bi-trash', 'bi-pad']);

// //                 deleteIcon.onclick = async function (ev) {
// //                     ev.preventDefault();
// //                     const result = await Post('/parish/delete/association/leader',
// //                         { 'association_id': association['_id'], 'leader_id': leader['_id'] },
// //                         { 'requiresParishDetails': true }
// //                     );

// //                     let msg = result['response'];
// //                     if (msg.match('success') || msg.match('delete')) {
// //                         MessegePopup.showMessegePuppy([MondoText({ 'text': 'leader deleted' })]);
// //                         ModalExpertise.hideModal();
// //                     }
// //                     ParishDataHandle.parishAssociations = ParishDataHandle.parishAssociations.filter
//                 tbody.appendChild(row);
//             }
//         });

//         parentView.appendChild(table);
//     }

//     ModalExpertise.showModal({
//         'actionHeading': `leaders in ${association.name}`,
//         'fullScreen': true,
//         'topRowUserActions': [pdfPrintButton],
//         'modalHeadingStyles': [{ 'background-color': 'royalblue' }, { 'color': 'white' }],
//         'children': [parentView],
//     })
// }

// // // view association members
// // export function ViewAssociationMembers(association) {
// //     const parentView = Column({
// //         'styles': [{ 'padding': '20px' }],
// //         'children': []
// //     });

// //     if (association['members_id'].length < 1) {
// //         addChildrenToView(parentView,
// //             [
// //                 MondoText({ 'text': 'no members added to this association yet' }),
// //             ]);
// //     } else {
// //         association['members_id'].forEach(function (memberId) {
// //             let member = ParishDataHandle.parishMembers.find(function (member) {
// //                 return member['_id'] === memberId;
// //             });

// //             if (member) {
// //                 let deleteIcon = domCreate('i');
// //                 addClasslist(deleteIcon, ['bi', 'bi-trash', 'bi-pad']);

// //                 deleteIcon.onclick = async function (ev) {
// //                     ev.preventDefault();
// //                     const result = await Post('/parish/delete/association/member',
// //                         { 'association_id': association['_id'], 'member_id': memberId },
// //                         { 'requiresParishDetails': true }
// //                     );

// //                     let msg = result['response'];
// //                     if (msg.match('success') || msg.match('delete')) {
// //                         MessegePopup.showMessege


// ModalExpertise.showModal({
//     'actionHeading': `leaders in ${association.name}`,
//     'fullScreen': true,
//     'modalHeadingStyles': [{ 'background-color': 'royalblue' }, { 'color': 'white' }],
//     'children': [parentView],
// })

// // // view association members
// // export function ViewAssociationMembers(association) {
// //     const parentView = Column({
// //         'styles': [{ 'padding': '20px' }],
// //         'children': []
// //     });

// //     if (association['members_id'].length < 1) {
// //         addChildrenToView(parentView,
// //             [
// //                 MondoText({ 'text': 'no members added to this association yet' }),
// //             ]);
// //     } else {
// //         association['members_id'].forEach(function (memberId) {
// //             let member = ParishDataHandle.parishMembers.find(function (member) {
// //                 return member['_id'] === memberId;
// //             });

// //             if (member) {
// //                 let deleteIcon = domCreate('i');
// //                 addClasslist(deleteIcon, ['bi', 'bi-trash', 'bi-pad']);

// //                 deleteIcon.onclick = async function (ev) {
// //                     ev.preventDefault();
// //                     const result = await Post('/parish/delete/association/member',
// //                         { 'association_id': association['_id'], 'member_id': memberId },
// //                         { 'requiresParishDetails': true }
// //                     );

// //                     let msg = result['response'];
// //                     if (msg.match('success') || msg.match('delete')) {
// //                         MessegePopup.showMessegePuppy([MondoText({ 'text': 'member deleted' })]);
// //                         ModalExpertise.hideModal();
// //                     }
// //                     ParishDataHandle.parishAssociations = ParishDataHandle.parishAssociations.filter(function (otherAssociations) {
// //                         return otherAssociations['_id'] != association['_id'];
// //                     });
// //                 }

// //                 const column = Column({
// //                     'styles': [{ 'border': '1px solid grey' }, { 'padding': '10px' }],
// //                     'children': [
// //                         Row({ 'classlist': ['f-w', 'just-end'], 'children': [deleteIcon,] }),
// //                         MondoText({ 'text': member.name }),
// //                     ]
// //                 });
// //                 parentView.appendChild(column);
// //             }
// //         });
// //     }

// //     ModalExpertise.showModal({
// //         'actionHeading': `members in ${association.name}`,
// //         'fullScreen': true,
// //         'modalHeadingStyles': [{ 'background-color': 'royalblue' }, { 'color': 'white' }],
// //         'children': [parentView],
// //     })
// // }

// // // view association details
// // export function ViewAssociationDetails(association) {
// //     const parentView = Column({
// //         'styles': [{ 'padding': '20px' }],
// //         'classlist': ['fx-col', 'f-w', 'f-h', 'space-around', 'a-c'],
// //         'children': []
// //     });

// //     const associationName = MondoText({ 'text': association.name });
// //     parentView.appendChild(associationName);

// //     const leadersButton = Button({ 'text': 'view leaders' });
// //     leadersButton.onclick = function (ev) {
// //         ViewAssociationLeaders(association);
// //     }
// //     parentView.appendChild(leadersButton);

// //     const membersButton = Button({ 'text': 'view members' });
// //     membersButton.onclick = function (ev) {
// //         ViewAssociationMembers(association);
// //     }
// //     parentView.appendChild(membersButton);

// //     const addLeaderButton = Button({ 'text': 'add leader' });
// //     addLeaderButton.onclick = function (ev) {
// //         PromptAddAssociationLeader(association);
// //     }
// //     parentView.appendChild(addLeaderButton);

// //     const addMemberButton = Button({ 'text': 'add member' });
// //     addMemberButton.onclick = function (ev) {
// //         PromptAddAssociationMember(association);
// //     }
// //     parentView.appendChild(addMemberButton);

// //     ModalExpertise.showModal({
// //         'actionHeading': `association details`,
// //         'fullScreen': true,
// //         'modalHeadingStyles': [{ 'background-color': 'royalblue' }, { 'color': 'white' }],
// //         'children': [parentView],
// //     })
// // }

// // // view all associations
// // export function ViewAllAssociations() {
// //     const parentView = Column({
// //         'styles': [{ 'padding': '20px' }],
// //         'children': []
// //     });

// //     if (ParishDataHandle.parishAssociations.length < 1) {
// //         addChildrenToView(parentView,
// //             [
// //                 MondoText({ 'text': 'no associations yet' }),
// //                 MondoText({ 'text': '+ add one by clicking on the add button' })
// //             ]);
// //     } else {
// //         ParishDataHandle.parishAssociations.forEach(function (association) {
// //             let deleteIcon = domCreate('i');
// //             addClasslist(deleteIcon, ['bi', 'bi-trash', 'bi-pad']);

// //             deleteIcon.onclick = async function (ev) {
// //                 ev.preventDefault();

// //                 const result = await Post('/parish/delete/association',
// //                     { 'association_id': association['_id'] },
// //                     { 'requiresParishDetails': true }
// //                 );

// //                 let msg = result['response'];
// //                 if (msg.match('success') || msg.match('delete')) {
// //                     MessegePopup.showMessegePuppy([MondoText({ 'text': 'association deleted' })]);
// //                     ModalExpertise.hideModal();
// //                 }

// //                 ParishDataHandle.parishAssociations = ParishDataHandle
// //                     .parishAssociations
// //                     .filter(function (otherAssociations) {
// //                         return otherAssociations['_id'] != association['_id'];
// //                     });
// //             }

// //             let updateIcon = domCreate('i');
// //             addClasslist(updateIcon, ['bi', 'bi-pencil-square', 'bi-pad']);
// //             updateIcon.onclick = function (ev) {
// //                 PromptUpdateAssociation(association);
// //             }

// //             const column = Column({
// //                 'styles': [{ 'border': '1px solid grey' }, { 'padding': '10px' }],
// //                 'children': [
// //                     MondoText({ 'text': association.name }),
// //                     Row({ 'classlist': ['f-w', 'just-end'], 'children': [updateIcon, deleteIcon,] }),
// //                 ]
// //             });

// //             column.onclick = function (ev) {
// //                 ViewAssociationDetails(association);
// //             }

// //             parentView.appendChild(column);
// //         });
// //     }

// //     ModalExpertise.showModal({
// //         'actionHeading': 'parish associations',
// //         'fullScreen': true,
// //         'modalHeadingStyles': [{ 'background-color': 'royalblue' }, { 'color': 'white' }],
// //         'children': [parentView],
// //     })
// // }


// // // prompt add leader to association
export function PromptAddLeaderToAssociation(association) {
    const memberPicker = MondoSelect({ 'styles': [{ 'margin-bottom': '10px' }] });
    ParishDataHandle.parishMembers.forEach(function (member) {
        memberPicker.innerHTML += `<option value="${member['_id']}">${member['name']}</option>`;
    });

    const positionInputEl = TextEdit({ 'placeholder': 'position' });
    const submitButton = Button({ 'text': 'save' });
    submitButton.style.border = '1px solid grey';

    submitButton.onclick = async function (ev) {
        const memberId = memberPicker.value;
        const position = positionInputEl.value;
        if (!memberId || !position) {
            return MessegePopup.showMessegePuppy([
                MondoText({ 'text': 'please select a member and enter a position to proceed' })
            ]);
        } else {
            let result = await Post('/parish/add/association/leader',
                {
                    association: {
                        '_id': association['_id'],
                        'leader': {
                            'member_id': memberId,
                            'position': `${position}`.trim().toUpperCase()
                        }
                    }
                },
                { 'requiresParishDetails': true }
            );

            if (result['response'].match('success')) {
                clearTextEdits([positionInputEl]);
                ParishDataHandle.parishAssociations = await getParishAssociations();
            }
            MessegePopup.showMessegePuppy([MondoText({ 'text': result['response'] })]);
        }
    }

    const column = Column({
        'styles': [{ 'padding': '20px' }],
        'children': [memberPicker, positionInputEl, submitButton]
    });

    ModalExpertise.showModal({
        'actionHeading': 'add association leader',
        'children': [column]
    })
}

// prompt add association member
export function PromptAddAssociationMember(association) {
    const memberPicker = MondoSelect({ 'styles': [{ 'margin-bottom': '10px' }] });
    ParishDataHandle.parishMembers.forEach(function (member) {
        memberPicker.innerHTML += `<option value="${member['_id']}">${member['name']}</option>`;
    });

    const submitButton = Button({ 'text': 'save' });
    submitButton.style.border = '1px solid grey';

    submitButton.onclick = async function (ev) {
        const memberId = memberPicker.value;
        if (!memberId) {
            return MessegePopup.showMessegePuppy([
                MondoText({ 'text': 'please select a member to proceed' })
            ]);
        } else {
            let result = await Post('/parish/add/association/member',
                {
                    association: {
                        '_id': association['_id'],
                        'member_id': memberId
                    }
                },
                { 'requiresParishDetails': true }
            );

            if (result['response'].match('success')) {
                clearTextEdits([memberPicker]);
                ParishDataHandle.parishAssociations = await getParishAssociations();
            }

            MessegePopup.showMessegePuppy([MondoText({ 'text': result['response'] })]);
        }
    }

    const column = Column({
        'styles': [{ 'padding': '20px' }],
        'children': [memberPicker, submitButton]
    });

    ModalExpertise.showModal({
        'actionHeading': 'add association member',
        'children': [column]
    })
}

// prompt remove association member
export function PromptRemoveAssociationMember(association, memberId) {
    const submitButton = Button({ 'text': 'remove' });
    submitButton.style.border = '1px solid grey';

    submitButton.onclick = async function (ev) {
        let result = await Post('/parish/remove/association/member',
            {
                association: {
                    '_id': association['_id'],
                    'member_id': memberId
                }
            },
            { 'requiresParishDetails': true }
        );

        if (result['response'].match('success')) {
            ParishDataHandle.parishAssociations = await getParishAssociations();
        }

        MessegePopup.showMessegePuppy([MondoText({ 'text': result['response'] })]);
    }

    const column = Column({
        'styles': [{ 'padding': '20px' }],
        'children': [submitButton]
    });

    ModalExpertise.showModal({
        'actionHeading': 'remove association member',
        'children': [column]
    })
}

// prompt remove association leader
export function PromptRemoveAssociationLeader(association, leaderId) {
    const submitButton = Button({ 'text': 'remove' });
    submitButton.style.border = '1px solid grey';

    submitButton.onclick = async function (ev) {
        let result = await Post('/parish/remove/association/leader',
            {
                association: {
                    '_id': association['_id'],
                    'leader_id': leaderId
                }
            },
            { 'requiresParishDetails': true }
        );

        if (result['response'].match('success')) {
            ParishDataHandle.parishAssociations = await getParishAssociations();
        }

        MessegePopup.showMessegePuppy([MondoText({ 'text': result['response'] })]);
    }

    const column = Column({
        'styles': [{ 'padding': '20px' }],
        'children': [submitButton]
    });

    ModalExpertise.showModal({
        'actionHeading': 'remove association leader',
        'children': [column]
    })
}

// // // view association leaders
// // export function ViewAssociationLeaders(association) {
// //     const parentView = Column({
// //         'styles': [{ 'padding': '20px' }],
// //         'children': []
// //     });

// //     if (association['leaders'].length < 1) {
// //         addChildrenToView(parentView,
// //             [
// //                 MondoText({ 'text': 'no leaders added to this association yet' }),
// //             ]);
// //     } else {
// //         association['leaders'].forEach(function (leader) {
// //             let member = ParishDataHandle.parishMembers.find(function (member) {
// //                 return member['_id'] === leader['member_id'];
// //             });

// //             if (member) {
// //                 let deleteIcon = domCreate('i');
// //                 addClasslist(deleteIcon, ['bi', 'bi-trash', 'bi-pad']);

// //                 deleteIcon.onclick = async function (ev) {
// //                     ev.preventDefault();
// //                     const result = await Post('/parish/delete/association/leader',
// //                         { 'association_id': association['_id'], 'leader_id': leader['_id'] },
// //                         { 'requiresParishDetails': true }
// //                     );

// //                     let msg = result['response'];
// //                     if (msg.match('success') || msg.match('delete')) {
// //                         MessegePopup.showMessegePuppy([MondoText({ 'text': 'leader deleted' })]);
// //                         ModalExpertise.hideModal();
// //                     }
// //                     ParishDataHandle.parishAssociations = ParishDataHandle.parishAssociations.filter(function (otherAssociations) {
// //                         return otherAssociations['_id'] != association['_id'];
// //                     });
// //                 }

// //                 const column = Column({
// //                     'styles': [{ 'border': '1px solid grey' }, { 'padding': '10px' }],
// //                     'children': [
// //                         Row({ 'classlist': ['f-w', 'just-end'], 'children': [deleteIcon,] }),
// //                         MondoText({ 'text': member.name }),
// //                         MondoText({ 'text': leader.position }),
// //                     ]
// //                 });
// //                 parentView.appendChild(column);
// //             }
// //         });
// //     }

// //     ModalExpertise.showModal({
// //         'actionHeading': `leaders in ${association.name}`,
// //         'fullScreen': true,
// //         'modalHeadingStyles': [{ 'background-color': 'royalblue' }, { 'color': 'white' }],
// //         'children': [parentView],
// //     })
// // }

// // // view association members
// // export function ViewAssociationMembers(association) {
// //     const parentView = Column({
// //         'styles': [{ 'padding': '20px' }],
// //         'children': []
// //     });

// //     if (association['members_id'].length < 1) {
// //         addChildrenToView(parentView,
// //             [
// //                 MondoText({ 'text': 'no members added to this association yet' }),
// //             ]);
// //     } else {
// //         association['members_id'].forEach(function (memberId) {
// //             let member = ParishDataHandle.parishMembers.find(function (member) {
// //                 return member['_id'] === memberId;
// //             });

// //             if (member) {
// //                 let deleteIcon = domCreate('i');
// //                 addClasslist(deleteIcon, ['bi', 'bi-trash', 'bi-pad']);

// //                 deleteIcon.onclick = async function (ev) {
// //                     ev.preventDefault();
// //                     const result = await Post('/parish/delete/association/member',
// //                         { 'association_id': association['_id'], 'member_id': memberId },
// //                         { 'requiresParishDetails': true }
// //                     );

// //                     let msg = result['response'];
// //                     if (msg.match('success') || msg.match('delete')) {
// //                         MessegePopup.showMessegePuppy([MondoText({ 'text': 'member deleted' })]);
// //                         ModalExpertise.hideModal();
// //                     }
// //                     ParishDataHandle.parishAssociations = ParishDataHandle.parishAssociations.filter(function (otherAssociations) {
// //                         return otherAssociations['_id'] != association['_id'];
// //                     });
// //                 }

// //                 const column = Column({
// //                     'styles': [{ 'border': '1px solid grey' }, { 'padding': '10px' }],
// //                     'children': [
// //                         Row({ 'classlist': ['f-w', 'just-end'], 'children': [deleteIcon,] }),
// //                         MondoText({ 'text': member.name }),
// //                     ]
// //                 });
// //                 parentView.appendChild(column);
// //             }
// //         });
// //     }

// //     ModalExpertise.showModal({
// //         'actionHeading': `members in ${association.name}`,
// //         'fullScreen': true,
// //         'modalHeadingStyles': [{ 'background-color': 'royalblue' }, { 'color': 'white' }],
// //         'children': [parentView],
// //     })
// // }

// // // view association details
// // export function ViewAssociationDetails(association) {
// //     const parentView = Column({
// //         'styles': [{ 'padding': '20px' }],
// //         'classlist': ['fx-col', 'f-w', 'f-h', 'space-around', 'a-c'],
// //         'children': []
// //     });

// //     const associationName = MondoText({ 'text': association.name });
// //     parentView.appendChild(associationName);

// //     const leadersButton = Button({ 'text': 'view leaders' });
// //     leadersButton.onclick = function (ev) {
// //         ViewAssociationLeaders(association);
// //     }
// //     parentView.appendChild(leadersButton);

// //     const membersButton = Button({ 'text': 'view members' });
// //     membersButton.onclick = function (ev) {
// //         ViewAssociationMembers(association);
// //     }
// //     parentView.appendChild(membersButton);

// //     const addLeaderButton = Button({ 'text': 'add leader' });
// //     addLeaderButton.onclick = function (ev) {
// //         PromptAddAssociationLeader(association);
// //     }
// //     parentView.appendChild(addLeaderButton);

// //     const addMemberButton = Button({ 'text': 'add member' });
// //     addMemberButton.onclick = function (ev) {
// //         PromptAddAssociationMember(association);
// //     }
// //     parentView.appendChild(addMemberButton);

// //     ModalExpertise.showModal({
// //         'actionHeading': `association details`,
// //         'fullScreen': true,
// //         'modalHeadingStyles': [{ 'background-color': 'royalblue' }, { 'color': 'white' }],
// //         'children': [parentView],
// //     })
// // }

// // // view all associations
// // export function ViewAllAssociations() {
// //     const parentView = Column({
// //         'styles': [{ 'padding': '20px' }],
// //         'children': []
// //     });

// //     if (ParishDataHandle.parishAssociations.length < 1) {
// //         addChildrenToView(parentView,
// //             [
// //                 MondoText({ 'text': 'no associations yet' }),
// //                 MondoText({ 'text': '+ add one by clicking on the add button' })
// //             ]);
// //     } else {
// //         ParishDataHandle.parishAssociations.forEach(function (association) {
// //             let deleteIcon = domCreate('i');
// //             addClasslist(deleteIcon, ['bi', 'bi-trash', 'bi-pad']);

// //             deleteIcon.onclick = async function (ev) {
// //                 ev.preventDefault();

// //                 const result = await Post('/parish/delete/association',
// //                     { 'association_id': association['_id'] },
// //                     { 'requiresParishDetails': true }
// //                 );

// //                 let msg = result['response'];
// //                 if (msg.match('success') || msg.match('delete')) {
// //                     MessegePopup.showMessegePuppy([MondoText({ 'text': 'association deleted' })]);
// //                     ModalExpertise.hideModal();
// //                 }

// //                 ParishDataHandle.parishAssociations = ParishDataHandle
// //                     .parishAssociations
// //                     .filter(function (otherAssociations) {
// //                         return otherAssociations['_id'] != association['_id'];
// //                     });
// //             }

// //             let updateIcon = domCreate('i');
// //             addClasslist(updateIcon, ['bi', 'bi-pencil-square', 'bi-pad']);
// //             updateIcon.onclick = function (ev) {
// //                 PromptUpdateAssociation(association);
// //             }

// //             const column = Column({
// //                 'styles': [{ 'border': '1px solid grey' }, { 'padding': '10px' }],
// //                 'children': [
// //                     MondoText({ 'text': association.name }),
// //                     Row({ 'classlist': ['f-w', 'just-end'], 'children': [updateIcon, deleteIcon,] }),
// //                 ]
// //             });

// //             column.onclick = function (ev) {
// //                 ViewAssociationDetails(association);
// //             }

// //             parentView.appendChild(column);
// //         });
// //     }

// //     ModalExpertise.showModal({
// //         'actionHeading': 'parish associations',
// //         'fullScreen': true,
// //         'modalHeadingStyles': [{ 'background-color': 'royalblue' }, { 'color': 'white' }],
// //         'children': [parentView],
// //     })
// // }


// // // prompt add leader to association
// // export function PromptAddLeaderToAssociation(association) {
// //     const memberPicker = MondoSelect({ 'styles': [{ 'margin-bottom': '10px' }] });
// //     ParishDataHandle.parishMembers.forEach(function (member) {
// //         memberPicker.innerHTML += `<option value="${member['_id']}">${member['name']}</option>`;
// //     });

// //     const positionInputEl = TextEdit({ 'placeholder': 'position' });
// //     const submitButton = Button({ 'text': 'save' });
// //     submitButton.style.border = '1px solid grey';

// //     submitButton.onclick = async function (ev) {
// //         const memberId = memberPicker.value;
// //         const position = positionInputEl.value;
// //         if (!memberId || !position) {
// //             return MessegePopup.showMessegePuppy([
// //                 MondoText({ 'text': 'please select a member and enter a position to proceed' })
// //             ]);

// //         } else {
// //             let result = await Post('/parish/add/association/leader',
// //                 {
// //                     association: {
// //                         '_id': association['_id'],
// //                         'leader': {
// //                             'member_id': memberId,
// //                             'position': position
// //                         }
// //                     }
// //                 },
// //                 { 'requiresParishDetails': true }
// //             );

// //             if (result['response'].match('success')) {
// //                 clearTextEdits([positionInputEl]);
// //                 ParishDataHandle.parishAssociations = await getParishAssociations();
// //             }

// //             MessegePopup.showMessegePuppy([MondoText({ 'text': result['response'] })]);
// //         }
// //     }

// //     const column = Column({
// //         'styles': [{ 'padding': '20px' }],
// //         'children': [memberPicker, positionInputEl, submitButton]
// //     });

// //     ModalExpertise.showModal({
// //         'actionHeading': 'add association leader',
// //         'children': [column]
// //     })
// // }

// // // prompt add association member
// // export function PromptAddAssociationMember(association) {
// //     const memberPicker = MondoSelect({ 'styles': [{ 'margin-bottom': '10px' }] });
// //     ParishDataHandle.parishMembers.forEach(function (member) {
// //         memberPicker.innerHTML += `<option value="${member['_id']}">${member['name']}</option>`;
// //     });

// //     const submitButton = Button({ 'text': 'save' });
// //     submitButton.style.border = '1px solid grey';

// //     submitButton.onclick = async function (ev) {
// //         const memberId = memberPicker.value;
// //         if (!memberId) {
// //             return MessegePopup.showMessegePuppy([
// //                 MondoText({ 'text': 'please select a member to proceed' })
// //             ]);
// //         } else {
// //             let result = await Post('/parish/add/association/member',
// //                 {
// //                     association: {
// //                         '_id': association['_id'],
// //                         'member_id': memberId
// //                     }
// //                 },
// //                 { 'requiresParishDetails': true }
// //             );

// //             if (result['response'].match('success')) {
// //                 clearTextEdits([memberPicker]);
// //                 ParishDataHandle.parishAssociations = await getParishAssociations();
// //             }

// //             MessegePopup.showMessegePuppy([MondoText({ 'text': result['response'] })]);
// //         }
// //     }

// //     const column = Column({
// //         'styles': [{ 'padding': '20px' }],
// //         'children': [memberPicker, submitButton]
// //     });

// //     ModalExpertise.showModal({
// //         'actionHeading': 'add association member',
// //         'children': [column]
// //     })
// // }


// // // prompt add association leader
// // export function PromptAddAssociationLeader(association) {
// //     const memberPicker = MondoSelect({ 'styles': [{ 'margin-bottom': '10px' }] });
// //     ParishDataHandle.parishMembers.forEach(function (member) {
// //         memberPicker.innerHTML += `<option value="${member['_id']}">${member['name']}</option>`;
// //     });

// //     const positionInputEl = TextEdit({ 'placeholder': 'position' });
// //     const submitButton = Button({ 'text': 'save' });
// //     submitButton.style.border = '1px solid grey';

// //     submitButton.onclick = async function (ev) {
// //         const memberId = memberPicker.value;
// //         const position = positionInputEl.value;
// //         if (!memberId || !position) {
// //             return MessegePopup.showMessegePuppy([
// //                 MondoText({ 'text': 'please select a member and enter a position to proceed' })
// //             ]);
// //         } else {
// //             let body = {
// //                 association: {
// //                     '_id': association['_id'],
// //                     'leader': {
// //                         'member_id': `${memberId}`.trim(),
// //                         'position': `${position}`.trim().toUpperCase()
// //                     }
// //                 }
// //             }
// //             console.log(body);
// //             let result = await Post(
// //                 '/parish/add/association/leader',
// //                 body,
// //                 { 'requiresParishDetails': true }
// //             );

// //             if (result['response'].match('success')) {
// //                 clearTextEdits([positionInputEl]);
// //                 ParishDataHandle.parishAssociations = await getParishAssociations();
// //             }

// //             MessegePopup.showMessegePuppy([MondoText({ 'text': result['response'] })]);
// //         }
// //     }

// //     const column = Column({
// //         'styles': [{ 'padding': '20px' }],
// //         'children': [memberPicker, positionInputEl, submitButton]
// //     });

// //     ModalExpertise.showModal({
// //         'actionHeading': 'add association leader',
// //         'children': [column]
// //     })
// // }

// // // prompt add association member
// // export function PromptAddAssociationMember(association) {
// //     const memberPicker = MondoSelect({ 'styles': [{ 'margin-bottom': '10px' }] });
// //     ParishDataHandle.parishMembers.forEach(function (member) {
// //         memberPicker.innerHTML += `<option value="${member['_id']}">${member['name']}</option>`;
// //     });

// //     const submitButton = Button({ 'text': 'save' });
// //     submitButton.style.border = '1px solid grey';

// //     submitButton.onclick = async function (ev) {
// //         const memberId = memberPicker.value;
// //         if (!memberId) {
// //             return MessegePopup.showMessegePuppy([
// //                 MondoText({ 'text': 'please select a member to proceed' })
// //             ]);
// //         } else {
// //             let body = {
// //                 association: {
// //                     '_id': association['_id'],
// //                     'member_id': memberId
// //                 }
// //             };
// //             console.log(body);
// //             let result = await Post('/parish/add/association/member',
// //                 body,
// //                 { 'requiresParishDetails': true }
// //             );

// //             if (result['response'].match('success')) {
// //                 clearTextEdits([memberPicker]);
// //                 ParishDataHandle.parishAssociations = await getParishAssociations();
// //             }

// //             MessegePopup.showMessegePuppy([MondoText({ 'text': result['response'] })]);
// //         }
// //     }

// //     const column = Column({
// //         'styles': [{ 'padding': '20px' }],
// //         'children': [memberPicker, submitButton]
// //     });

// //     ModalExpertise.showModal({
// //         'actionHeading': 'add association member',
// //         'children': [column]
// //     })
// // }

// // // prompt remove association member
// // export function PromptRemoveAssociationMember(association, memberId) {
// //     const submitButton = Button({ 'text': 'remove' });
// //     submitButton.style.border = '1px solid grey';

// //     submitButton.onclick = async function (ev) {
// //         let body = {
// //             association: {
// //                 '_id': association['_id'],
// //                 'member_id': memberId
// //             }
// //         };
// //         console.log(body);
// //         let result = await Post('/parish/remove/association/member',
// //             body,
// //             { 'requiresParishDetails': true }
// //         );

// //         if (result['response'].match('success')) {
// //             ParishDataHandle.parishAssociations = await getParishAssociations();
// //         }

// //         MessegePopup.showMessegePuppy([MondoText({ 'text': result['response'] })]);
// //     }

// //     const column = Column({
// //         'styles': [{ 'padding': '20px' }],
// //         'children': [submitButton]
// //     });

// //     ModalExpertise.showModal({
// //         'actionHeading': 'remove association member',
// //         'children': [column]
// //     })
// // }

// // // prompt remove association leader
// // export function PromptRemoveAssociationLeader(association, leaderId) {
// //     const submitButton = Button({ 'text': 'remove' });
// //     submitButton.style.border = '1px solid grey';

// //     submitButton.onclick = async function (ev) {
// //         let result = await Post('/parish/remove/association/leader',
// //             {
// //                 association: {
// //                     '_id': association['_id'],
// //                     'leader_id': leaderId
// //                 }
// //             },
// //             { 'requiresParishDetails': true }
// //         );

// //         if (result['response'].match('success')) {
// //             ParishDataHandle.parishAssociations = await getParishAssociations();
// //         }

// //         MessegePopup.showMessegePuppy([MondoText({ 'text': result['response'] })]);
// //     }

// //     const column = Column({
// //         'styles': [{ 'padding': '20px' }],
// //         'children': [submitButton]
// //     });

// //     ModalExpertise.showModal({
// //         'actionHeading': 'remove association leader',
// //         'children': [column]
// //     })
// // }

// // // view association leaders
// // export function ViewAssociationLeaders(association) {
// //     const parentView = Column({
// //         'styles': [{ 'padding': '20px' }],
// //         'children': []
// //     });

// //     if (association['leaders'].length < 1) {
// //         addChildrenToView(parentView,
// //             [
// //                 MondoText({ 'text': 'no leaders added to this association yet' }),
// //             ]);
// //     } else {
// //         association['leaders'].forEach(function (leader) {
// //             let member = ParishDataHandle.parishMembers.find(function (member) {
// //                 return member['_id'] === leader['member_id'];
// //             });

// //             if (member) {
// //                 let deleteIcon = domCreate('i');
// //                 addClasslist(deleteIcon, ['bi', 'bi-trash', 'bi-pad']);

// //                 deleteIcon.onclick = async function (ev) {
// //                     ev.preventDefault();
// //                     const result = await Post('/parish/delete/association/leader',
// //                         { 'association_id': association['_id'], 'leader_id': leader['_id'] },
// //                         { 'requiresParishDetails': true }
// //                     );

// //                     let msg = result['response'];
// //                     if (msg.match('success') || msg.match('delete')) {
// //                         MessegePopup.showMessegePuppy([MondoText({ 'text': 'leader deleted' })]);
// //                         ModalExpertise.hideModal();
// //                     }
// //                     ParishDataHandle.parishAssociations = ParishDataHandle.parishAssociations.filter(function (otherAssociations) {
// //                         return otherAssociations['_id'] != association['_id'];
// //                     });
// //                 }

// //                 const column = Column({
// //                     'styles': [{ 'border': '1px solid grey' }, { 'padding': '10px' }],
// //                     'children': [
// //                         Row({ 'classlist': ['f-w', 'just-end'], 'children': [deleteIcon,] }),
// //                         MondoText({ 'text': member.name }),
// //                         MondoText({ 'text': leader.position }),
// //                     ]
// //                 });
// //                 parentView.appendChild(column);
// //             }
// //         });
// //     }

// //     ModalExpertise.showModal({
// //         'actionHeading': `leaders in ${association.name}`,
// //         'fullScreen': true,
// //         'modalHeadingStyles': [{ 'background-color': 'royalblue' }, { 'color': 'white' }],
// //         'children': [parentView],
// //     })
// // }

// // // view association members
// // export function ViewAssociationMembers(association) {
// //     const parentView = Column({
// //         'styles': [{ 'padding': '20px' }],
// //         'children': []
// //     });

// //     if (association['members_id'].length < 1) {
// //         addChildrenToView(parentView,
// //             [
// //                 MondoText({ 'text': 'no members added to this association yet' }),
// //             ]);
// //     } else {
// //         association['members_id'].forEach(function (memberId) {
// //             let member = ParishDataHandle.parishMembers.find(function (member) {
// //                 return member['_id'] === memberId;
// //             });

// //             if (member) {
// //                 let deleteIcon = domCreate('i');
// //                 addClasslist(deleteIcon, ['bi', 'bi-trash', 'bi-pad']);

// //                 deleteIcon.onclick = async function (ev) {
// //                     ev.preventDefault();
// //                     const result = await Post('/parish/delete/association/member',
// //                         { 'association_id': association['_id'], 'member_id': memberId },
// //                         { 'requiresParishDetails': true }
// //                     );

// //                     let msg = result['response'];
// //                     if (msg.match('success') || msg.match('delete')) {
// //                         MessegePopup.showMessegePuppy([MondoText({ 'text': 'member deleted' })]);
// //                         ModalExpertise.hideModal();
// //                     }
// //                     ParishDataHandle.parishAssociations = ParishDataHandle.parishAssociations.filter(function (otherAssociations) {
// //                         return otherAssociations['_id'] != association['_id'];
// //                     });
// //                 }

// //                 const column = Column({
// //                     'styles': [{ 'border': '1px solid grey' }, { 'padding': '10px' }],
// //                     'children': [
// //                         Row({ 'classlist': ['f-w', 'just-end'], 'children': [deleteIcon,] }),
// //                         MondoText({ 'text': member.name }),
// //                     ]
// //                 });
// //                 parentView.appendChild(column);
// //             }
// //         });
// //     }

// //     ModalExpertise.showModal({
// //         'actionHeading': `members in ${association.name}`,
// //         'fullScreen': true,
// //         'modalHeadingStyles': [{ 'background-color': 'royalblue' }, { 'color': 'white' }],
// //         'children': [parentView],
// //     })
// // }

// // // view association details
// // export function ViewAssociationDetails(association) {
// //     const parentView = Column({
// //         'styles': [{ 'padding': '20px' }],
// //         'classlist': ['fx-col', 'f-w', 'f-h', 'space-around', 'a-c'],
// //         'children': []
// //     });

// //     const associationName = MondoText({ 'text': association.name });
// //     parentView.appendChild(associationName);

// //     const leadersButton = Button({ 'text': 'view leaders' });
// //     leadersButton.onclick = function (ev) {
// //         ViewAssociationLeaders(association);
// //     }
// //     parentView.appendChild(leadersButton);

// //     const membersButton = Button({ 'text': 'view members' });
// //     membersButton.onclick = function (ev) {
// //         ViewAssociationMembers(association);
// //     }
// //     parentView.appendChild(membersButton);

// //     const addLeaderButton = Button({ 'text': 'add leader' });
// //     addLeaderButton.onclick = function (ev) {
// //         PromptAddAssociationLeader(association);
// //     }
// //     parentView.appendChild(addLeaderButton);

// //     const addMemberButton = Button({ 'text': 'add member' });
// //     addMemberButton.onclick = function (ev) {
// //         PromptAddAssociationMember(association);
// //     }
// //     parentView.appendChild(addMemberButton);

// //     ModalExpertise.showModal({
// //         'actionHeading': `association details`,
// //         'fullScreen': true,
// //         'modalHeadingStyles': [{ 'background-color': 'royalblue' }, { 'color': 'white' }],
// //         'children': [parentView],
// //     })
// // }

// // // view all associations
// // export function ViewAllAssociations() {
// //     const parentView = Column({
// //         'styles': [{ 'padding': '20px' }],
// //         'children': []
// //     });

// //     if (ParishDataHandle.parishAssociations.length < 1) {
// //         addChildrenToView(parentView,
// //             [
// //                 MondoText({ 'text': 'no associations yet' }),
// //                 MondoText({ 'text': '+ add one by clicking on the add button' })
// //             ]);
// //     } else {
// //         ParishDataHandle.parishAssociations.forEach(function (association) {
// //             let deleteIcon = domCreate('i');
// //             addClasslist(deleteIcon, ['bi', 'bi-trash', 'bi-pad']);

// //             deleteIcon.onclick = async function (ev) {
// //                 ev.preventDefault();

// //                 const result = await Post('/parish/delete/association',
// //                     { 'association_id': association['_id'] },
// //                     { 'requiresParishDetails': true }
// //                 );

// //                 let msg = result['response'];
// //                 if (msg.match('success') || msg.match('delete')) {
// //                     MessegePopup.showMessegePuppy([MondoText({ 'text': 'association deleted' })]);
// //                     ModalExpertise.hideModal();
// //                 }

// //                 ParishDataHandle.parishAssociations = ParishDataHandle
// //                     .parishAssociations
// //                     .filter(function (otherAssociations) {
// //                         return otherAssociations['_id'] != association['_id'];
// //                     });
// //             }

// //             let updateIcon = domCreate('i');
// //             addClasslist(updateIcon, ['bi', 'bi-pencil-square', 'bi-pad']);
// //             updateIcon.onclick = function (ev) {
// //                 PromptUpdateAssociation(association);
// //             }

// //             const column = Column({
// //                 'styles': [{ 'border': '1px solid grey' }, { 'padding': '10px' }],
// //                 'children': [
// //                     MondoText({ 'text': association.name }),
// //                     Row({ 'classlist': ['f-w', 'just-end'], 'children': [updateIcon, deleteIcon,] }),
// //                 ]
// //             });

// //             column.onclick = function (ev) {
// //                 ViewAssociationDetails(association);
// //             }

// //             parentView.appendChild(column);
// //         });
// //     }

// //     ModalExpertise.showModal({
// //         'actionHeading': 'parish associations',
// //         'fullScreen': true,
// //         'modalHeadingStyles': [{ 'background-color': 'royalblue' }, { 'color': 'white' }],
// //         'children': [parentView],
// //     })
// // }


// // // prompt add leader to association
// // export function PromptAddLeaderToAssociation(association) {
// //     const memberPicker = MondoSelect({ 'styles': [{ 'margin-bottom': '10px' }] });
// //     ParishDataHandle.parishMembers.forEach(function (member) {
// //         memberPicker.innerHTML += `<option value="${member['_id']}">${member['name']}</option>`;
// //     });

// //     const positionInputEl = TextEdit({ 'placeholder': 'position' });
// //     const submitButton = Button({ 'text': 'save' });
// //     submitButton.style.border = '1px solid grey';

// //     submitButton.onclick = async function (ev) {
// //         const memberId = memberPicker.value;
// //         const position = positionInputEl.value;
// //         if (!memberId || !position) {
// //             return MessegePopup.showMessegePuppy([
// //                 MondoText({ 'text': 'please select a member and enter a position to proceed' })
// //             ]);

// //         } else {
// //             let result = await Post('/parish/add/association/leader',
// //                 {
// //                     association: {
// //                         '_id': association['_id'],
// //                         'leader': {
// //                             'member_id': memberId,
// //                             'position': position
// //                         }
// //                     }
// //                 },
// //                 { 'requiresParishDetails': true }
// //             );

// //             if (result['response'].match('success')) {
// //                 clearTextEdits([positionInputEl]);
// //                 ParishDataHandle.parishAssociations = await getParishAssociations();
// //             }

// //             MessegePopup.showMessegePuppy([MondoText({ 'text': result['response'] })]);
// //         }
// //     }

// //     const column = Column({
// //         'styles': [{ 'padding': '20px' }],
// //         'children': [memberPicker, positionInputEl, submitButton]
// //     });

// //     ModalExpertise.showModal({
// //         'actionHeading': 'add association leader',
// //         'children': [column]
// //     })
// // }

// // // prompt add member to association
// // export function PromptAddMemberToAssociation(association) {
// //     const memberPicker = MondoSelect({ 'styles': [{ 'margin-bottom': '10px' }] });
// //     ParishDataHandle.parishMembers.forEach(function (member) {
// //         memberPicker.innerHTML += `<option value="${member['_id']}">${member['name']}</option>`;
// //     });

// //     const submitButton = Button({ 'text': 'save' });
// //     submitButton.style.border = '1px solid grey';

// //     submitButton.onclick = async function (ev) {
// //         const memberId = memberPicker.value;
// //         if (!memberId) {
// //             return MessegePopup.showMessegePuppy([
// //                 MondoText({ 'text': 'please select a member to proceed' })
// //             ]);
// //         } else {
// //             let result = await Post('/parish/add/association/member',
// //                 {
// //                     association: {
// //                         '_id': association['_id'],
// //                         'member_id': memberId
// //                     }
// //                 },
// //                 { 'requiresParishDetails': true }
// //             );

// //             if (result['response'].match('success')) {
// //                 clearTextEdits([memberPicker]);
// //                 ParishDataHandle.parishAssociations = await getParishAssociations();
// //             }

// //             MessegePopup.showMessegePuppy([MondoText({ 'text': result['response'] })]);
// //         }
// //     }

// //     const column = Column({
// //         'styles': [{ 'padding': '20px' }],
// //         'children': [memberPicker, submitButton]
// //     });

// //     ModalExpertise.showModal({
// //         'actionHeading': 'add association member',
// //         'children': [column]
// //     })
// // }

// // // prompt remove member from association
// // export function PromptRemoveMemberFromAssociation(association, memberId) {
// //     const submitButton = Button({ 'text': 'remove' });
// //     submitButton.style.border = '1px solid grey';

// //     submitButton.onclick = async function (ev) {
// //         let result = await Post('/parish/remove/association/member',
// //             {
// //                 association: {
// //                     '_id': association['_id'],
// //                     'member_id': memberId
// //                 }
// //             },
// //             { 'requiresParishDetails': true }
// //         );

// //         if (result['response'].match('success')) {
// //             ParishDataHandle.parishAssociations = await getParishAssociations();
// //         }

// //         MessegePopup.showMessegePuppy([MondoText({ 'text': result['response'] })]);
// //     }

// //     const column = Column({
// //         'styles': [{ 'padding': '20px' }],
// //         'children': [submitButton]
// //     });

// //     ModalExpertise.showModal({
// //         'actionHeading': 'remove association member',
// //         'children': [column]
// //     })
// // }

// // // prompt remove leader from association
// // export function PromptRemoveLeaderFromAssociation(association, leaderId) {
// //     const submitButton = Button({ 'text': 'remove' });
// //     submitButton.style.border = '1px solid grey';

// //     submitButton.onclick = async function (ev) {
// //         let result = await Post('/parish/remove/association/leader',
// //             {
// //                 association: {
// //                     '_id': association['_id'],
// //                     'leader_id': leaderId
// //                 }
// //             },
// //             { 'requiresParishDetails': true }
// //         );

// //         if (result['response'].match('success')) {
// //             ParishDataHandle.parishAssociations = await getParishAssociations();
// //         }

// //         MessegePopup.showMessegePuppy([MondoText({ 'text': result['response'] })]);
// //     }

// //     const column = Column({
// //         'styles': [{ 'padding': '20px' }],
// //         'children': [submitButton]
// //     });

// //     ModalExpertise.showModal({
// //         'actionHeading': 'remove association leader',
// //         'children': [column]
// //     })
// // }

