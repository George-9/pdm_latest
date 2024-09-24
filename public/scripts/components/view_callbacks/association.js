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
                viewAssociationMembers(association);
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
                    MondoText({ 'text': association.name }),
                ]
            });


            function viewAssociationMembers(association) {
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
                            const column = Column({
                                'styles': [{ 'border': '1px solid grey' }, { 'padding': '10px' }],
                                'children': [
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

            parentView.appendChild(Row({ 'classlist': ['f-w', 'just-end'], 'children': [updateIcon, deleteIcon,] }));

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


// prompt add association leader
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
            let body = {
                association: {
                    '_id': association['_id'],
                    'leader': {
                        'member_id': `${memberId}`.trim(),
                        'position': `${position}`.trim().toUpperCase()
                    }
                }
            }
            console.log(body);
            let result = await Post(
                '/parish/add/association/leader',
                body,
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
            let body = {
                association: {
                    '_id': association['_id'],
                    'member_id': memberId
                }
            };
            console.log(body);
            let result = await Post('/parish/add/association/member',
                body,
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
        let body = {
            association: {
                '_id': association['_id'],
                'member_id': memberId
            }
        };
        console.log(body);
        let result = await Post('/parish/remove/association/member',
            body,
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

// view association leaders
export function ViewAssociationLeaders(association) {
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
        association['leaders'].forEach(function (leader) {
            let member = ParishDataHandle.parishMembers.find(function (member) {
                return member['_id'] === leader['member_id'];
            });

            if (member) {
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

                const column = Column({
                    'styles': [{ 'border': '1px solid grey' }, { 'padding': '10px' }],
                    'children': [
                        Row({ 'classlist': ['f-w', 'just-end'], 'children': [deleteIcon,] }),
                        MondoText({ 'text': member.name }),
                        MondoText({ 'text': leader.position }),
                    ]
                });
                parentView.appendChild(column);
            }
        });
    }

    ModalExpertise.showModal({
        'actionHeading': `leaders in ${association.name}`,
        'fullScreen': true,
        'modalHeadingStyles': [{ 'background-color': 'royalblue' }, { 'color': 'white' }],
        'children': [parentView],
    })
}

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
                ParishDataHandle.parishAssociations = ParishDataHandle.parishAssociations.filter(function (otherAssociations) {
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
                    // Row({ 'classlist': ['f-w', 'just-end'], 'children': [updateIcon, deleteIcon,] }),
                    MondoText({ 'text': association.name }),
                ]
            });

            // view members added to this association (find members by id)
            column.onclick = function (ev) {
                ViewAssociationDetails(association);
            }

            parentView.appendChild(Row({ 'classlist': ['f-w', 'just-end'], 'children': [updateIcon, deleteIcon,] }));

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
                            'position': position
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

// prompt add member to association
export function PromptAddMemberToAssociation(association) {
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

// prompt remove member from association
export function PromptRemoveMemberFromAssociation(association, memberId) {
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

// prompt remove leader from association
export function PromptRemoveLeaderFromAssociation(association, leaderId) {
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

