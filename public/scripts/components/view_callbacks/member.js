import { mapValuesToUppercase } from "../../../global_tools/objects_tools.js";
import { ParishDataHandle } from "../../data_pen/parish_data_handle.js";
import { getGroupMembers, getMemberAgeToday, getOutstationMembers, getOutstationSCCs, getSCCMembersFromList, getVolumeById, memberGetOutstation, memberGetSCC } from "../../data_pen/puppet.js";
import { getParishMembers } from "../../data_source/main.js";
import { PRIESTS_COMMUNITY_NAME } from "../../data_source/other_sources.js";
import { addChildrenToView } from "../../dom/addChildren.js";
import { domCreate } from "../../dom/query.js";
import { clearTextEdits } from "../../dom/text_edit_utils.js";
import { Post } from "../../net_tools.js";
import { marginRuleStyles } from "../../parish_profile.js";
import { LocalStorageContract } from "../../storage/LocalStorageContract.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { addPriestCommunityOptionToPicker, OutstationPicker } from "../tailored_ui/outstation_picker.js";
import { PDFPrintButton } from "../tailored_ui/print_button.js";
import { Column } from "../UI/column.js";
import { Button, MondoSelect, MondoText, Row, TextEdit, VerticalScrollView } from "../UI/cool_tool_ui.js";
import { addClasslist, StyleView } from "../utils/stylus.js";
import { TextEditValueValidator } from "../utils/textedit_value_validator.js";

export function promptRegiterMember() {
    const marginRuleStyles = [{ 'margin-top': '15px' }]

    const nameI = TextEdit({ 'placeholder': 'name', 'styles': marginRuleStyles });
    nameI.addEventListener('keypress', function (ev) {
        const key = ev.key;

        if (key === 'Enter') {
            registerMember(ev);
        }
    });

    const dobI = TextEdit({ 'placeholder': 'date of birth', 'type': 'date', 'styles': marginRuleStyles });
    const motherNameI = TextEdit({ 'placeholder': 'mother\'s name', 'styles': marginRuleStyles });
    const fatherNameI = TextEdit({ 'placeholder': 'father\'s name', 'styles': marginRuleStyles });
    const GodParentNameI = TextEdit({ 'placeholder': 'God parent\'s', 'styles': marginRuleStyles });
    const telephoneNumberI = TextEdit({ 'placeholder': 'telephone number', 'styles': marginRuleStyles });

    const genderPicker = MondoSelect({});
    genderPicker.innerHTML = `
        <option selected>MALE</option>
        <option>FEMALE</option>
    `

    const sccPicker = MondoSelect({
        'styles': marginRuleStyles,
        'onChange': function (ev) {
            ev.preventDefault();
        },
    });

    StyleView(sccPicker, [{ 'display': 'none' }]);

    const categoryPicker = MondoSelect({});
    StyleView(categoryPicker, [{ 'display': 'none' }]);

    categoryPicker.addEventListener('change', function (ev) {
        ev.preventDefault();
        console.log(categoryPicker.value);

        if (categoryPicker.value === 'WITH SCC') {
            StyleView(sccPicker, [{ 'display': 'block' }]);
        } else {
            StyleView(sccPicker, [{ 'display': 'none' }]);
        }
    })

    categoryPicker.innerHTML = `
        <option selected value="${PRIESTS_COMMUNITY_NAME}">${PRIESTS_COMMUNITY_NAME}</option>
        <option value="WITH SCC">WITH SCC</option>
    `;

    const outstationPicker = OutstationPicker({
        'outstations': ParishDataHandle.parishOutstations,
        'styles': { ...marginRuleStyles },
        'onchange': function (ev) {
            ev.preventDefault();
            setViews(ev.target);
        }
    });

    setViews(outstationPicker);

    function setViews(outstationPicker) {
        StyleView(categoryPicker, [{ 'display': 'block' }]);
        sccPicker.replaceChildren([]);

        const outstation = JSON.parse(outstationPicker.value);
        let sccs = ParishDataHandle.parishSCCs.filter(function (scc) {
            return scc['outstation_id'] === outstation['_id']
        });

        for (let i = 0; i < sccs.length; i++) {
            const scc = sccs[i];

            let option = domCreate('option');
            option.innerText = scc['name']
            option.value = JSON.stringify(scc);

            sccPicker.appendChild(option);
        }
        sccPicker.options[0].selected = true;
    }

    outstationPicker.addEventListener('click', function (ev) {
        ev.preventDefault();
        StyleView(categoryPicker, [{ 'display': 'block' }]);
    });

    // Volume Picker
    const volumePicker = MondoSelect({ 'styles': marginRuleStyles });
    volumePicker.innerHTML = '<option value="">Select Volume</option>'; // Default option

    // Populate volumePicker based on available volumes
    if (ParishDataHandle.parishMembersVolumes.length > 0) {
        ParishDataHandle.parishMembersVolumes.forEach(function (volume) {
            volumePicker.innerHTML += `<option value="${volume['name']}">${volume['name'].split('_').join(' ')}</option>`;
        });
    } else {
        // No volumes found, show message and don't open the modal
        return MessegePopup.showMessegePuppy([MondoText({ 'text': 'Please add volumes to the parish first.' })]);
    }

    const button = Button({
        'text': 'submit',
        'styles': marginRuleStyles,
        onclick: registerMember
    });


    async function registerMember(ev) {
        try {
            TextEditValueValidator.validate('name', nameI);
            // TextEditValueValidator.validate('date of birth', dobI);
            TextEditValueValidator.validate('gender', genderPicker);
            // TextEditValueValidator.validate('telephone number', motherNameI);
            // TextEditValueValidator.validate('father\'s name', fatherNameI);
            // TextEditValueValidator.validate('GodParent\'s name', GodParentNameI);

            if (!outstationPicker.value || !sccPicker.value) {
                return MessegePopup.showMessegePuppy([
                    MondoText({ 'text': 'outstation and SCC must not be empty' })
                ]);
            }

            // Validate volume selection
            if (volumePicker.value === "") {
                return MessegePopup.showMessegePuppy([
                    MondoText({ 'text': 'Please select a volume.' })
                ]);
            }

            // Get the _id of the selected volume
            const selectedVolumeId = ParishDataHandle.parishMembersVolumes.find(v => v.name === volumePicker.value)?._id;

            if (!selectedVolumeId) {
                return MessegePopup.showMessegePuppy([
                    MondoText({ 'text': 'Invalid volume selected.' })
                ]);
            }

            let theGodParents = [...(`${GodParentNameI.value ?? ''}`.split(',') || [])];

            const body = {
                member: mapValuesToUppercase({
                    'name': `${nameI.value}`.trim(),
                    'gender': genderPicker.value,
                    'date_of_birth': `${dobI.value || (new Date()).toDateString()}`.trim(),
                    'mother': `${motherNameI.value}`.trim(),
                    'father': `${fatherNameI.value}`,
                    'God_Parents': theGodParents,
                    'outstation_id': (JSON.parse(outstationPicker.value))['_id'],
                    'scc_id': (sccPicker.style.display === 'block' && sccPicker.value) ? (JSON.parse(sccPicker.value))['_id'] : 'PRIEST COMMUNITY',
                    'baptismal_number': 0,
                    'sacraments': [],
                    'associations': [],
                    'telephone_number': telephoneNumberI.value,
                    'volume': selectedVolumeId, // Add selected volume _id
                })
            };

            Object.keys(body.member).forEach(function (key) {
                if (!body.member[key] || `${body.member[key]}`.match('undefined')) {
                    body.member[key] = '_'
                }
            });

            let result = await Post('/parish/register/member',
                body,
                { 'requiresParishDetails': true }
            );

            const msg = result['response'];
            MessegePopup.showMessegePuppy([MondoText({ 'text': msg })]);

            if (msg.match('success') || msg.match('save')) {
                clearTextEdits([nameI, dobI, motherNameI, fatherNameI, GodParentNameI]);
                ParishDataHandle.parishMembers = await getParishMembers();
            }
        } catch (error) {
            MessegePopup.showMessegePuppy([MondoText({ 'text': error })]);
        }
    }

    const column = Column({
        'styles': [{ 'padding': '20px' }],
        'classlist': ['f-w', 'f-w', 'a-c', 'scroll-y'],
        'children': [
            nameI,
            genderPicker,
            dobI,
            motherNameI,
            fatherNameI,
            GodParentNameI,
            outstationPicker,
            categoryPicker,
            sccPicker,
            telephoneNumberI,
            volumePicker, // Add volumePicker to the form
            button,
        ]
    });

    // const addFieldIconButton = domCreate('i');
    // addClasslist(addFieldIconButton, ['bi', 'bi-plus']);
    // addFieldIconButton.onclick = function (ev) {
    //     ev.preventDefault();

    //     let newFieldName = prompt('new field name');
    //     if (newFieldName) {
    //         addChildrenToView(column, TextEdit({ 'placeholder': newFieldName }))
    //     }
    // }

    ModalExpertise.showModal({
        'actionHeading': 'member registration',
        'modalHeadingStyles': [{ 'background-color': 'azure' }],
        'modalChildStyles': [{ 'width': 'fit-content' }, { 'height': 'max-content' }],
        // 'topRowUserActions': [addFieldIconButton],
        'children': [column],
        'fullScreen': false,
        'dismisible': true,
    });
}

// export function promptRegiterMember() {
//     const marginRuleStyles = [{ 'margin-top': '15px' }]

//     const nameI = TextEdit({ 'placeholder': 'name', 'styles': marginRuleStyles });
//     const dobI = TextEdit({ 'placeholder': 'date of birth', 'type': 'date', 'styles': marginRuleStyles });
//     const motherNameI = TextEdit({ 'placeholder': 'mother\'s name', 'styles': marginRuleStyles });
//     const fatherNameI = TextEdit({ 'placeholder': 'father\'s name', 'styles': marginRuleStyles });
//     const GodParentNameI = TextEdit({ 'placeholder': 'God parent\'s', 'styles': marginRuleStyles });
//     const telephoneNumberI = TextEdit({ 'placeholder': 'telephone number', 'styles': marginRuleStyles });

//     const genderPicker = MondoSelect({});
//     genderPicker.innerHTML = `
//         <option selected>MALE</option>
//         <option>FEMALE</option>
//     `

//     const sccPicker = MondoSelect({
//         'styles': marginRuleStyles,
//         'onChange': function (ev) {
//             ev.preventDefault();
//         },
//     });

//     StyleView(sccPicker, [{ 'display': 'none' }]);

//     const categoryPicker = MondoSelect({});
//     StyleView(categoryPicker, [{ 'display': 'none' }]);

//     categoryPicker.addEventListener('change', function (ev) {
//         ev.preventDefault();
//         console.log(categoryPicker.value);

//         if (categoryPicker.value === 'WITH SCC') {
//             StyleView(sccPicker, [{ 'display': 'block' }]);
//         } else {
//             StyleView(sccPicker, [{ 'display': 'none' }]);
//         }
//     })

//     categoryPicker.innerHTML = `
//         <option selected value="${PRIESTS_COMMUNITY_NAME}">${PRIESTS_COMMUNITY_NAME}</option>
//         <option value="WITH SCC">WITH SCC</option>
//     `;

//     const outstationPicker = OutstationPicker({
//         'outstations': ParishDataHandle.parishOutstations,
//         'styles': { ...marginRuleStyles },
//         'onchange': function (ev) {
//             ev.preventDefault();

//             StyleView(categoryPicker, [{ 'display': 'block' }]);
//             sccPicker.replaceChildren([]);

//             const outstation = JSON.parse(outstationPicker.value);
//             let sccs = ParishDataHandle.parishSCCs.filter(function (scc) {
//                 return scc['outstation_id'] === outstation['_id']
//             });

//             for (let i = 0; i < sccs.length; i++) {
//                 const scc = sccs[i];

//                 let option = domCreate('option');
//                 option.innerText = scc['name']
//                 option.value = JSON.stringify(scc);

//                 sccPicker.appendChild(option);
//             }
//             sccPicker.options[0].selected = true;
//         }
//     });

//     outstationPicker.addEventListener('click', function (ev) {
//         ev.preventDefault();
//         StyleView(categoryPicker, [{ 'display': 'block' }]);
//     });

//     const button = Button({
//         'text': 'submit',
//         'styles': marginRuleStyles,
//         onclick: async function (ev) {
//             try {
//                 TextEditValueValidator.validate('name', nameI);
//                 TextEditValueValidator.validate('date of birth', dobI);
//                 TextEditValueValidator.validate('gender', genderPicker);
//                 // TextEditValueValidator.validate('telephone number', motherNameI);
//                 // TextEditValueValidator.validate('father\'s name', fatherNameI);
//                 TextEditValueValidator.validate('GodParent\'s name', GodParentNameI);

//                 if (!outstationPicker.value || !sccPicker.value) {
//                     return MessegePopup.showMessegePuppy([
//                         MondoText({ 'text': 'outstation and SCC must not be empty' })
//                     ]);
//                 }

//                 let theGodParents;
//                 if (GodParentNameI.value && GodParentNameI.value.includes(',')) {
//                     theGodParents = [...(GodParentNameI.value.split(',') || [])];
//                 } else {
//                     theGodParents = [`${GodParentNameI.value}`.trim()];
//                 }

//                 const body = {
//                     member: {
//                         'name': `${nameI.value}`.trim(),
//                         'gender': genderPicker.value,
//                         'date_of_birth': `${dobI.value}`.trim(),
//                         'mother': `${motherNameI.value}`.trim(),
//                         'father': `${fatherNameI.value}`,
//                         'God_Parents': theGodParents,
//                         'outstation_id': (JSON.parse(outstationPicker.value))['_id'],
//                         'scc_id': (sccPicker.style.display === 'block' && sccPicker.value) ? (JSON.parse(sccPicker.value))['_id'] : 'PRIEST COMMUNITY',
//                         'baptismal_number': 0,
//                         'sacraments': [],
//                         'associations': [],
//                         'telephone_number': telephoneNumberI.value,
//                         'volume': '',
//                     }
//                 };

//                 Object.keys(body.member).forEach(function (key) {
//                     if (!body.member[key] || `${body.member[key]}`.match('undefined')) {
//                         body.member[key] = '_'
//                     }
//                 });

//                 let result = await Post('/parish/register/member', body, { 'requiresParishDetails': true });

//                 const msg = result['response'];
//                 MessegePopup.showMessegePuppy([MondoText({ 'text': msg })]);

//                 if (msg.match('success') || msg.match('save')) {
//                     clearTextEdits([nameI, dobI, motherNameI, fatherNameI, GodParentNameI]);
//                     ParishDataHandle.parishMembers = await getParishMembers();
//                 }
//             } catch (error) {
//                 MessegePopup.showMessegePuppy([MondoText({ 'text': error })]);
//             }
//         }
//     });

//     const column = Column({
//         'styles': [{ 'padding': '20px' }],
//         'classlist': ['f-w', 'f-w', 'a-c', 'scroll-y'],
//         'children': [
//             nameI,
//             genderPicker,
//             dobI,
//             motherNameI,
//             fatherNameI,
//             GodParentNameI,
//             outstationPicker,
//             categoryPicker,
//             sccPicker,
//             telephoneNumberI,
//             button,
//         ]
//     });

//     // const addFieldIconButton = domCreate('i');
//     // addClasslist(addFieldIconButton, ['bi', 'bi-plus']);
//     // addFieldIconButton.onclick = function (ev) {
//     //     ev.preventDefault();

//     //     let newFieldName = prompt('new field name');
//     //     if (newFieldName) {
//     //         addChildrenToView(column, TextEdit({ 'placeholder': newFieldName }))
//     //     }
//     // }

//     ModalExpertise.showModal({
//         'actionHeading': 'member registration',
//         'modalHeadingStyles': [{ 'background-color': 'azure' }],
//         'modalChildStyles': [{ 'width': 'fit-content' }, { 'height': 'max-content' }],
//         // 'topRowUserActions': [addFieldIconButton],
//         'children': [column],
//         'fullScreen': false,
//         'dismisible': true,
//     });
// }

export function showMembersReportsView() {
    const tableId = 'members-table';
    const printButton = new PDFPrintButton(tableId);
    const outstationPicker = OutstationPicker({
        'outstations': ParishDataHandle.parishOutstations,
        'styles': marginRuleStyles
    });

    StyleView(outstationPicker, [{ 'padding': '10px' }]);

    const sccPicker = domCreate('select');//MondoSelect({ 'styles': marginRuleStyles });
    sccPicker.onchange= function (ev) {
        setViews();
    };

    StyleView(sccPicker, [{ 'padding': '10px' }]);

    const table = domCreate('table');
    table.id = tableId;

    StyleView(table, [{ 'margin': '10px' }, { 'max-width': '440px' }]);
    addClasslist(table, ['txt-c', 'f-a-w']);

    const tableHeader = domCreate('thead');
    tableHeader.innerHTML = `
        <tr>
            <td>NO</td>
            <td>NAME</td>
            <td>TELEPHONE</td>
        </tr>
    `
    const tbody = domCreate('tbody');
    addChildrenToView(table, [tableHeader, tbody]);

    outstationPicker.addEventListener('change', function (ev) {
        sccPicker.replaceChildren([]);

        let sccs = getOutstationSCCs(outstation);
        for (let i = 0; i < sccs.length; i++) {
            const scc = sccs[i];

            let option = domCreate('option');
            option.innerText = scc['name']
            option.value = JSON.stringify(scc);

            sccPicker.appendChild(option);
        }

        addPriestCommunityOptionToPicker(sccPicker);
        sccPicker.options[0].selected = true;

        setViews();
    });

    // set the heading of the currently selected outstation

    function setViews() {
        tbody.replaceChildren([]);

        const outstation = JSON.parse(outstationPicker.value);

        PDFPrintButton.printingHeading = `${LocalStorageContract.completeParishName()}
        ${outstation['name']} Outstation
        ${sccPicker.value['name']} SCC members`.toUpperCase();

        let outstationMembers = getOutstationMembers(outstationPicker.value);
        outstationMembers = getSCCMembersFromList(outstationMembers, JSON.parse(sccPicker.value));

        for (let i = 0; i < outstationMembers.length; i++) {
            const member = outstationMembers[i];
            const row = domCreate('tr');

            let telephoneNumber = member['telephone_number'];
            row.innerHTML = `
                    <td>${i + 1}</td>
                    <td>${member['name']}</td>
                    <td><a href="${'tel:' + telephoneNumber}">${telephoneNumber}</a></td>
                `;
            addClasslist(row, ['highlightable']);
            // const viewMemberTd = domCreate('td');
            // const tdContent = domCreate('i');
            // addClasslist(tdContent, ['bi', 'bi-arrows-angle-expand']);
            row.onclick = function (ev) {
                if (ev.target === row) {
                    ModalExpertise.showModal({
                        'actionHeading': `${member['name']}`.toUpperCase(),
                        'modalHeadingStyles': [{ 'background-color': 'dodgerblue' }, { 'color': 'white' }],
                        'modalChildStyles': [{ 'width': 'fit-content' }],
                        'children': [memberView(member)]
                    });
                }
            };

            // addChildrenToView(viewMemberTd, [tdContent]);
            // const printMemberView = domCreate('td');
            // const printTdContent = new PDFPrintButton('');
            // addChildrenToView(printMemberView, [printTdContent]);
            // addChildrenToView(row, [viewMemberTd]);
            tbody.appendChild(row);
        }
    }

    setViews();

    const rowStyle = [{ 'width': '100%' }],
        classlist = ['a-c', 'space-between'],
        styles = [
            { 'font-size': '12px' },
            { 'font-weight': '800' }
        ]

    const pickersRow = Column({
        'styles': [{ 'width': 'fit-content' }],
        'classlist': ['a-c', 'a-bl'],
        'children': [
            Row({
                'children': [
                    Row({
                        'classlist': [...classlist, 'a-c', 'a-bl'],
                        'styles': rowStyle,
                        'children': [
                            MondoText({ 'text': 'OUTSTATION ', 'styles': styles }),
                            outstationPicker,
                        ]
                    }),
                    Row({
                        'classlist': [...classlist, 'a-c', 'a-bl'],
                        'styles': rowStyle,
                        'children': [
                            MondoText({ 'text': 'SCC', 'styles': styles }),
                            sccPicker
                        ],
                    })
                ]
            })
        ]
    });

    const membersColumn = Column({
        children: ParishDataHandle.parishMembers.map(function (m) {
            return Column({
                'classlist': ['f-w', 'a-c', 'scroll-y'],
                'children': [
                    pickersRow,
                    VerticalScrollView({ 'children': [table] }),
                ]
            })
        })
    });

    ModalExpertise.showModal({
        'actionHeading': 'members reports',
        'modalHeadingStyles': [{ 'background-color': '#e2e1ef', }],
        'children': [membersColumn],
        'topRowUserActions': [printButton],
        'fullScreen': true,
    });
}

export function showMembersByOutstationReportsView() {
    const tableId = 'members-table';
    const printButton = new PDFPrintButton(tableId);
    const outstationPicker = OutstationPicker({
        'outstations': ParishDataHandle.parishOutstations,
        'styles': marginRuleStyles
    });

    StyleView(outstationPicker, [{ 'padding': '10px' }]);

    const sccPicker = domCreate('select');//MondoSelect({ 'styles': marginRuleStyles });
    sccPicker.addEventListener('change', function (ev) {
        tbody.replaceChildren([]);
    });

    StyleView(sccPicker, [{ 'padding': '10px' }]);

    const table = domCreate('table');
    table.id = tableId;

    StyleView(table, [{ 'margin': '10px' }, { 'max-width': '440px' }]);
    addClasslist(table, ['txt-c', 'f-a-w']);

    const tableHeader = domCreate('thead');
    tableHeader.innerHTML = `
        <tr>
            <td>NO</td>
            <td>NAME</td>
            <td>TELEPHONE</td>
        </tr>
        `
    const tbody = domCreate('tbody');
    addChildrenToView(table, [tableHeader, tbody]);

    outstationPicker.addEventListener('change', function (ev) {
        ev.preventDefault();

        const outstation = JSON.parse(outstationPicker.value);
        let sccs = getOutstationSCCs(outstation);

        sccPicker.replaceChildren([]);

        for (let i = 0; i < sccs.length; i++) {
            const scc = sccs[i];

            let option = domCreate('option');
            option.innerText = scc['name']
            option.value = JSON.stringify(scc);

            sccPicker.appendChild(option);
        }

        addPriestCommunityOptionToPicker(sccPicker);

        sccPicker.options[0].selected = true;
        // set the heading of the currently selected outstation
    });

    function setViews() {
        PDFPrintButton.printingHeading = `${LocalStorageContract.completeParishName()}
         ${JSON.parse(outstationPicker.value)['name']} Outstation members`.toUpperCase();

        let outstationMembers = getOutstationMembers(outstationPicker.value);

        for (let i = 0; i < outstationMembers.length; i++) {
            const member = outstationMembers[i];
            const row = domCreate('tr');

            let telephoneNumber = member['telephone_number'];
            row.innerHTML = `
                            <td>${i + 1}</td>
                            <td class="txt-s">${member['name']}</td>
                            <td><a href="${'tel:' + telephoneNumber}">${telephoneNumber}</a></td>
            `;
            addClasslist(row, ['highlightable']);
            // const viewMemberTd = domCreate('td');
            // const tdContent = domCreate('i');
            // addClasslist(tdContent, ['bi', 'bi-arrows-angle-expand']);
            row.onclick = function (ev) {
                if (ev.target === row) {
                    ModalExpertise.showModal({
                        'actionHeading': `${member['name']}`.toUpperCase(),
                        'modalHeadingStyles': [{ 'background-color': 'dodgerblue' }, { 'color': 'white' }],
                        'modalChildStyles': [{ 'width': 'fit-content' }],
                        'children': [memberView(member)]
                    });
                }
            };

            // addChildrenToView(viewMemberTd, [tdContent]);
            // const printMemberView = domCreate('td');
            // const printTdContent = new PDFPrintButton('');
            // addChildrenToView(printMemberView, [printTdContent]);
            // addChildrenToView(row, [viewMemberTd]);
            tbody.appendChild(row);
        }
    }

    setViews();

    const rowStyle = [{ 'width': '100%' }], classlist = ['a-c', 'space-between'],
        styles = [
            { 'font-size': '18px' },
            { 'font-weight': '300' }
        ]

    const pickersRow = Row({
        'styles': [{ 'width': 'fit-content' }],
        'classlist': ['a-c'],
        'children': [
            Column({
                'children': [
                    Column({
                        'classlist': classlist,
                        'styles': rowStyle,
                        'children': [
                            MondoText({ 'text': 'OUTSTATION ', 'styles': styles }),
                            outstationPicker,
                        ]
                    })
                ]
            })
        ]
    });

    const membersColumn = Column({
        'classlist': ['f-w', 'a-c', 'f-a-w'],
        'children': [
            pickersRow,
            Column({
                'styles': [{ 'padding-bottom': '30px' }, { 'height': '80vh' }],
                'classlist': ['f-w', 'f-a-w', 'a-c', 'scroll-y'],
                'children': [table],
            }),
        ]
    });

    ModalExpertise.showModal({
        'actionHeading': 'members reports',
        'modalHeadingStyles': [{ 'background-color': '#e2e1ef', }],
        'children': [membersColumn],
        'topRowUserActions': [printButton],
        'fullScreen': true,
    });
}

export function memberView(member) {
    const outstation = memberGetOutstation(member, ParishDataHandle.parishOutstations);
    const scc = memberGetSCC(member, ParishDataHandle.parishSCCs);

    // member['outstation'] = outstation['name'];
    // member['scc'] = scc['name'];

    function GodParentsView(member) {
        const column = Column({
            'children': []
        })

        for (let i = 0; i < member['God_Parents'].length; i++) {
            const GodParents = member['God_Parents'][i];
            const text = MondoText({ 'text': `${i + 1}. ${GodParents}` })
            column.appendChild(text);
        }

        return column;
    }


    function sacramentsView(member) {
        const sacramentsIds = member['sacraments'];
        const column = Column({
            'classlist': ['f-w', 'a-c'],
            'children': []
        });

        for (const key in ParishDataHandle.SACRAMENTS) {
            if (key.match(ParishDataHandle.SACRAMENTS.reconciliation)) {
                continue;
            }

            const checkerInput = document.createElement('input');
            checkerInput.type = 'checkbox';
            checkerInput.id = key;
            checkerInput.style.width = 'fit-content';

            const label = document.createElement('label');
            label.htmlFor = key;
            label.appendChild(document.createTextNode(key.split('_')));

            if (sacramentsIds && sacramentsIds.length && sacramentsIds.length > 0) {
                checkerInput.checked = sacramentsIds.includes(key) ? true : false
            }

            function checkChange(ev) {
                if (checkerInput.checked) {
                    member['sacraments'] = member['sacraments'].filter(function (value) {
                        return key !== value;
                    })
                    checkerInput.checked = false;
                } else {
                    member['sacraments'].push(key);
                    checkerInput.checked = true;
                }
            }

            const row = Row({
                'classlist': ['a-c', 'f-w'],
                'styles': [{ 'border': 'solid 1px grey', 'margin': '4px' }],
                'children': [checkerInput, label]
            });

            checkerInput.addEventListener('click', checkChange);
            row.addEventListener('click', checkChange);

            addChildrenToView(column, [row]);
        }

        return column;
    }

    return VerticalScrollView({
        'classlist': ['f-w', 'a-c'],
        'children': Object.keys(member).map(function (key) {
            if (key !== '_id' && !`${key}`.match('_id')) {
                const valueEditor = TextEdit({ 'placeholder': key })
                valueEditor.value = member[key];

                valueEditor.addEventListener('input', function (ev) {
                    ev.preventDefault();
                    if (key === 'God_Parents') {
                        member[key] = `${valueEditor.value}`.split(',');
                    } else {
                        member[key] = valueEditor.value;
                    }
                });

                return Row({
                    'styles': [{ 'width': '100%' }],
                    'classlist': ['a-c', 'space-between'],
                    'children': [
                        MondoText({
                            'styles': [{ 'font-weight': '900' }],
                            'text': key.toUpperCase().split('_').join(' ')
                        }),
                        (() => {
                            if (key.match('associations')) {
                                return '';
                            }
                            if (key.match('sacraments')) {
                                return sacramentsView(member);
                            }

                            if (key.match('God_Parents')) {
                                return GodParentsView(member);
                            }

                            return valueEditor;
                        })()
                    ]
                });
            }
        })
    });
}

export function showMembersByGroupView() {
    if (ParishDataHandle.parishGroups.length < 1) {
        return MessegePopup.showMessegePuppy([MondoText({ 'text': 'this parish has not registered any groups, please register a group first' })])
    }

    const outstationPicker = OutstationPicker({ 'outstations': ParishDataHandle.parishOutstations });
    outstationPicker.addEventListener('change', setViews);

    // const scc = memberGetSCC(member, ParishDataHandle.parishSCCs);
    const tableId = 'members-by-groups';
    const groupPicker = MondoSelect({});

    groupPicker.addEventListener('change', setViews);

    for (let i = 0; i < ParishDataHandle.parishGroups.length; i++) {
        const group = ParishDataHandle.parishGroups[i];
        const option = domCreate('option');
        option.innerHTML = group['name'];
        option.value = JSON.stringify(group);

        groupPicker.appendChild(option)
    }

    groupPicker.options[0].selected = true;

    const ageDisp = domCreate('p');

    const table = domCreate('table');
    table.id = tableId;

    StyleView(table, [{ 'margin': '10px' }, { 'max-width': '440px' }]);
    addClasslist(table, ['txt-c', 'f-a-w']);

    const tableHeader = domCreate('thead');
    tableHeader.innerHTML = `
        <tr>
            <td>NO</td>
            <td>NAME</td>
            <td>AGE</td>
            <td>TELEPHONE</td>
        </tr>
    `

    const parent = Column({
        'classlist': ['f-w', 'a-c', 'scroll-y'],
        'children': [
            ageDisp,
            table
        ],
    });

    const tbody = domCreate('tbody');
    addChildrenToView(table, [tableHeader, tbody])

    function setViews() {
        const selectedOutstation = JSON.parse(outstationPicker.value);
        const selectedGroup = JSON.parse(groupPicker.value);
        PDFPrintButton.printingHeading = `${LocalStorageContract.completeParishName()}
            ${selectedOutstation['name']} outstation . ${selectedGroup['name']} members
        `.toUpperCase()

        if (tbody.children.length > 0) {
            tbody.replaceChildren([])
        }
        const selectedGroupMembers = getGroupMembers(selectedGroup);
        const outstationAndGroupMembers = selectedGroupMembers.filter(function (member) {
            return member['outstation_id'] === selectedOutstation['_id'];
        })

        if (outstationAndGroupMembers.length < 1) {
            const row = domCreate('tr');
            row.innerHTML = `<td colspan="4">no members match the current query</td>`;
            tbody.appendChild(row);
        } else {
            for (let i = 0; i < outstationAndGroupMembers.length; i++) {
                const member = outstationAndGroupMembers[i];

                const row = domCreate('tr');
                row.innerHTML = `
                <td>${i + 1}</td>
                <td>${member['name']}</td>
                <td>${getMemberAgeToday(member)}</td>
                <td>${member['telephone_number']}</td>
            `
                tbody.appendChild(row)
            }
        }

        ageDisp.innerHTML = `
            age ${selectedGroup['min_age']}-${selectedGroup['max_age']}
        `
    }

    setViews();

    ModalExpertise.showModal({
        'actionHeading': 'members by groups',
        'topRowUserActions': [outstationPicker, groupPicker, new PDFPrintButton(tableId)],
        'fullScreen': true,
        'children': [parent]
    })
}

export function showMemberEditView() {
    const memberSearchEl = TextEdit({ 'placeholder': 'member name' });
    const column = Column({ 'children': [] })

    memberSearchEl.addEventListener('input', function (ev) {
        column.replaceChildren([]);

        const searchKey = `${memberSearchEl.value}`.toLowerCase();
        const matchMembers = ParishDataHandle.parishMembers.filter(function (member) {
            return `${member['name']}`.toLowerCase().match(searchKey)
                ||
                member['member_number'] === searchKey
                ||
                member['no'] === searchKey;
        });

        for (let i = 0; i < matchMembers.length; i++) {
            const member = matchMembers[i];
            const memberName = member['name'];
            // const memberOutstationName = mem (getOutstationById(member['outstation_id']))['name'];
            // const membersccName = memberGetSCC(member['scc_id'])['name'];

            const view = Column({
                'styles': [{ 'margin': '3px' }, { 'pading': '3px' }, { 'border': '1px solid grey' }, { 'border-radius': '3px' }],
                'classlist': ['c-p'],
                'children': [
                    MondoText({ 'text': memberName }),
                    // MondoText({ 'text': memberOutstationName }),
                    // MondoText({ 'text': membersccName }),
                ]
            });

            const saveChangesButton = Button({
                'text': 'save changes',
                'onclick': saveChangesButtonClicked
            });

            async function saveChangesButtonClicked(ev) {
                console.log(member);
                let updateResult = await Post('/parish/update/member',
                    { member: member },
                    { 'requiresParishDetails': true });
                const msg = updateResult['response'];
                MessegePopup.showMessegePuppy([MondoText({ 'text': msg })]);
                if (msg.match('success') || msg.match('save')) {
                    //    remove the outdate member
                    ParishDataHandle.parishMembers = ParishDataHandle
                        .parishMembers
                        .filter(function (oldDetailsMember) {
                            return oldDetailsMember['_id'] !== member['_id'];
                        });

                    //insert to the DAO the update member
                    ParishDataHandle.parishMembers.push(member);
                }
            }

            view.onclick = function (ev) {
                const memberViewEl = memberView(member);
                const id = member['member_number'];

                memberViewEl.id = id;

                const printMemberIcon = domCreate('i');
                addClasslist(printMemberIcon, ['bi', 'bi-printer']);

                printMemberIcon.onclick = function (ev) {
                    ev.preventDefault();

                    printJS({
                        'printable': id,
                        'type': 'html',
                        'header': member['name'],
                        'style': `* {font-family: sans-serif; font-weight: '300'; max-width: 350px; }\
                         .fx-row {display: flex;\ justify-content: space-between;}`
                    });
                }

                ModalExpertise.showModal({
                    'topRowUserActions': [printMemberIcon, saveChangesButton],
                    'actionHeading': `editing ${member['name']}`,
                    'modalChildStyles': [{ 'min-width': 'fit-content' }, { 'width': 'fit-content' }],
                    'children': [
                        Column({
                            'classlist': ['f-a-w', 'scroll-y'],
                            'styles': [{ 'padding': '20px' }],
                            'children': [memberViewEl]
                        })
                    ],
                });
            }
            column.appendChild(view);
        }
    })

    ModalExpertise.showModal({
        'actionHeading': 'member edits',
        'fullScreen': true,
        'topRowUserActions': [memberSearchEl],
        'children': [column],
    })
} 
