import { ParishDataHandle } from "../../data_pen/parish_data_handle.js";
import { getOutstationSCCs, memberGetOutstation, memberGetSCC } from "../../data_pen/puppet.js";
import { getParishProjectsRecords } from "../../data_source/main.js";
import { addChildrenToView } from "../../dom/addChildren.js";
import { domCreate, domQueryById } from "../../dom/query.js";
import { clearTextEdits } from "../../dom/text_edit_utils.js";
import { Post } from "../../net_tools.js";
import { LocalStorageContract } from "../../storage/LocalStorageContract.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { OutstationPicker } from "../tailored_ui/outstation_picker.js";
import { PDFPrintButton } from "../tailored_ui/print_button.js";
import { Column, Row, MondoText, TextEdit, Button, MondoSelect, VerticalScrollView, MondoBigH3Text } from "../UI/cool_tool_ui.js";
import { addClasslist, StyleView } from "../utils/stylus.js";
import { TextEditValueValidator } from "../utils/textedit_value_validator.js";

export class ProjectSizeLeveCategories {
    static MAJOR = 'MAJOR';
    static MEDIUM = 'MEDIUM';
    static SMALL = 'SMALL';
}

export class ProjectContributionModes {
    static OUTSTATION = 'OUTSTATION';
    static SCC = 'SCC';
    static MEMBER = 'MEMBER';

    static ALL_MODES = [ProjectContributionModes.MEMBER, ProjectContributionModes.SCC, ProjectContributionModes.OUTSTATION];
}

const projectLeveCategories = ['PARISH', 'OUTSTATION'];

// ADD PROJECT REPORTS
export function promptAddProject() {
    const projectNameI = TextEdit({ 'placeholder': 'project name' });

    const outstationPicker = OutstationPicker({
        'styles': [{ 'display': 'none' }],
        'outstations': ParishDataHandle.parishOutstations,
    });

    // const outstationOptionContributionMode = domCreate('option');
    // outstationOptionContributionMode.value = ProjectContributionModes.OUTSTATION;

    // const sccPicker = MondoSelect({});

    // LEVEL OF PROJECT
    const projectParishLevelCategoryPicker = MondoSelect({});
    projectLeveCategories.forEach(function (category, index) {
        const option = domCreate('option');
        option.innerText = category
        option.value = category
        projectParishLevelCategoryPicker.appendChild(option);
    });
    projectParishLevelCategoryPicker.addEventListener('change', resetViews);

    const projectContributionModePicker = MondoSelect({});
    ProjectContributionModes.ALL_MODES.forEach(function (mode) {
        const option = domCreate('option');
        option.innerText = mode;
        option.value = mode;

        projectContributionModePicker.appendChild(option);
    })

    function resetViews(ev) {
        if (projectParishLevelCategoryPicker.value === projectLeveCategories[0]) {
            StyleView(outstationPicker, [{ 'display': 'none' }]);
        } else {
            StyleView(outstationPicker, [{ 'display': 'block' }]);
        }

        // have the first outstation as the default
        outstationPicker.options[0].selected = true;
    }

    resetViews();
    const startDateI = TextEdit({ 'type': 'date' });
    const startDateRow = Column({ 'children': [MondoText({ 'text': 'start date' }), startDateI,] })
    const endDateI = TextEdit({ 'type': 'date' });
    const endDateRow = Column({ 'children': [MondoText({ 'text': 'end date' }), endDateI] });

    const projecBudgetI = TextEdit({
        'placeholder': 'IN KSH',
        'keyboardType': 'number'
    });

    const button = Button({
        'styles': [{ 'margin-top': '20px' }],
        'text': 'submit',
        'onclick': async function () {
            try {
                TextEditValueValidator.validate('start date', startDateI);
                TextEditValueValidator.validate('end date', endDateI);
                let projetcDuration = parseInt(new Date(`${endDateI.value}`) - new Date(`${startDateI.value}`));
                console.log(projetcDuration, projetcDuration + 1);

                if (projetcDuration < 1) {
                    return MessegePopup.showMessegePuppy([MondoText({ 'text': 'end date cannot be lower than the start date' })]);
                }

                TextEditValueValidator.validate('amount', projectNameI);
                TextEditValueValidator.validate('budget', projecBudgetI);
                TextEditValueValidator.validate('project category', projectParishLevelCategoryPicker);
                const body = {
                    project: {
                        'name': projectNameI.value,
                        'level': projectParishLevelCategoryPicker.value,
                        'contribution_mode': projectContributionModePicker.value,
                        'budget': parseFloat(projecBudgetI.value),
                        'start_date': startDateI.value,
                        'end_date': endDateI.value,

                        // the selected level of the project
                        'host': (outstationPicker.style.display === 'block' && outstationPicker.value)
                            ? {
                                '_id': JSON.parse(outstationPicker.value)['_id'],
                                'name': (JSON.parse(outstationPicker.value)['name']) + ' outstation'
                            }
                            : { 'name': `${LocalStorageContract.parishName()} ${projectLeveCategories[0]}` }
                    }
                }

                let result = await Post('/parish/add/project/record',
                    body,
                    { 'requiresParishDetails': true })
                let msg = result['response'];

                MessegePopup.showMessegePuppy([MondoText({ 'text': msg })]);
                if (msg.match('success') || msg.match('save')) {
                    clearTextEdits([projectNameI, projecBudgetI, startDateI, endDateI]);
                    ParishDataHandle.parishProjectsRecords = await getParishProjectsRecords();
                }
            } catch (error) {
                MessegePopup.showMessegePuppy([MondoText({ 'text': error })]);
            }
        }
    })

    const column = VerticalScrollView({
        'classlist': ['f-w', 'f-h', 'a-c'],
        'children': [
            projectNameI,
            Column({
                'children': [
                    MondoText({ 'text': 'project level' }),
                    projectParishLevelCategoryPicker,
                ]
            }),
            outstationPicker,
            Column({
                'children': [
                    MondoText({ 'text': 'contribution mode' }),
                    projectContributionModePicker,
                ]
            }),
            startDateRow,
            endDateRow,
            Column({
                'children': [
                    MondoText({ 'text': 'project budget' }),
                    projecBudgetI,
                ]
            }),
            button
        ]
    });

    ModalExpertise.showModal({
        'actionHeading': 'add Project records',
        'modalChildStyles': [{ 'width': '400px', 'height': '400px' }],
        'dismisible': true,
        'children': [column],
    });
}

// Project REPORTS
export async function showProjectReportView() {
    // the selected contributor id
    let selectedContributorId = '';

    const projectsColumn = Column({
        'children': []
    });

    /**
     * @todo IMPLEMENT AND MAKE GLOBAL TO THIS FILE [MODULE]
    */
    function getProjectToTalContribution() {
    }

    function showProjectView(projectRecord = {
        name: '',
        budget: '',
        level: '',
        contribution_mode: ProjectContributionModes.ALL_MODES[0],
        contributions: []
    }) {
        const budgetColumn = Column({
            // 'styles': [{ 'margin-right': '10px' }, { 'border': '1px solid grey' }],
            'children': [
                MondoText({ 'text': 'budget' }),
                MondoText({ 'text': projectRecord['budget'] }),
            ]
        });

        const levelView = Column({
            // 'styles': [{ 'border': '1px solid grey' }],
            'children': [
                MondoText({ 'text': 'Level' }),
                MondoText({ 'text': projectRecord['level'] }),
            ]
        })

        const addProjectContributionButton = domCreate('i');
        addClasslist(addProjectContributionButton, ['bi', 'bi-plus']);
        const viewAddProjectContibutionColumn = Row({
            'styles': [{ 'border': '1px solid grey' }],
            'classlist': ['fx-row', 'a-c', 'just-center', 'c-p'],
            'children': [
                addProjectContributionButton,
                MondoText({ 'text': 'add contribution' }),
            ]
        });

        const memberSearchNameEditI = TextEdit({ 'placeholder': 'member name' });
        const searchResultViewContainer = Column({ 'children': [] });

        // DISPLAYS MEMBERS WHO MATCH SEARCH
        memberSearchNameEditI.addEventListener('input', function (ev) {
            ev.preventDefault();

            const searchKey = memberSearchNameEditI.value;
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

                    selectedContributorId = member['_id'];
                    let existingClone = domQueryById(cloneId);
                    if (existingClone) {
                        memberContributionView.removeChild(existingClone);
                    }

                    let clone = view.cloneNode(true);
                    clone.id = cloneId;

                    memberContributionView.insertBefore(clone, memberSearchNameEditI);
                    searchResultViewContainer.replaceChildren([]);
                }

                return view;
            });

            searchResultViewContainer.replaceChildren([]);
            addChildrenToView(searchResultViewContainer, matchViews);
        });

        const outstationContributionPicker = OutstationPicker({ 'outstations': ParishDataHandle.parishOutstations })
        outstationContributionPicker.addEventListener('change', function (ev) {
            selectedContributorId = (JSON.parse(outstationContributionPicker.value))['_id'];
        })
        // if (projectRecord.contribution_mode === ProjectContributionModes.SCC) {
        //     StyleView(memberSearchNameEditI, [{ 'display': 'none' }]);
        // } else if (projectRecord.contribution_mode !== ProjectContributionModes.OUTSTATION) {
        //     StyleView(outstationPicker, [{ 'display': 'none' }]);
        // }


        const sccContributionOutstationPicker = OutstationPicker({ 'outstations': ParishDataHandle.parishOutstations })
        sccContributionOutstationPicker.addEventListener('change', function (ev) {
            sccPicker.replaceChildren([]);
            const sCCs = getOutstationSCCs(sccContributionOutstationPicker.value);
            for (let i = 0; i < sCCs.length; i++) {
                const scc = sCCs[i];
                const option = domCreate('option');
                option.innerText = scc['name'];
                option.value = JSON.stringify(scc);
                sccPicker.appendChild(option);
            }
            sccPicker.options[0].selected = true;
            selectedContributorId = (JSON.parse(sccPicker.value))['_id'];
            console.log(selectedContributorId);
        });

        const sccPicker = MondoSelect({});
        sccPicker.addEventListener('change', function (ev) {
            selectedContributorId = (JSON.parse(sccPicker.value))['_id'];
            console.log(selectedContributorId);
        });

        const sccContributionView = Column({
            'classlist': ['fx-col'],
            'styles': [{ 'display': 'none' }],
            'children': [
                MondoBigH3Text({ 'text': 'select SCC' }),
                sccContributionOutstationPicker,
                sccPicker,
            ]
        });

        const memberContributionView = Column({
            'children': [
                MondoText({ 'text': 'search member' }),
                memberSearchNameEditI,
                searchResultViewContainer,
            ]
        })

        const projectContributionModePicker = MondoSelect({});
        ProjectContributionModes.ALL_MODES.forEach(function (mode) {
            const option = domCreate('option');
            option.innerText = mode;
            option.value = mode;
            projectContributionModePicker.appendChild(option);
        });
        projectContributionModePicker.options[0].selected = true;


        // HIDE OR DISPLAY THE RELEVANT VIEW TO ADD THE CONTRIBUTION
        projectContributionModePicker.addEventListener('change', resetContributionViews)
        function resetContributionViews() {
            if (projectContributionModePicker.value === ProjectContributionModes.MEMBER) {
                StyleView(memberContributionView, [{ 'display': 'block' }]);
                StyleView(sccContributionView, [{ 'display': 'none' }]);
                StyleView(outstationContributionPicker, [{ 'display': 'none' }]);
            } else if (projectContributionModePicker.value === ProjectContributionModes.OUTSTATION) {
                StyleView(outstationContributionPicker, [{ 'display': 'block' }]);
                StyleView(sccContributionView, [{ 'display': 'none' }]);
                StyleView(memberContributionView, [{ 'display': 'none' }]);
                outstationContributionPicker.options.selectedIndex = true;
                selectedContributorId = (JSON.parse(outstationContributionPicker.value))['_id'];
            } else {
                StyleView(sccContributionView, [{ 'display': 'block' }]);
                StyleView(outstationContributionPicker, [{ 'display': 'none' }]);
                StyleView(memberContributionView, [{ 'display': 'none' }]);
            }
        }

        resetContributionViews();

        const amountEditor = TextEdit({ 'placeholder': 'amount', 'keyboardType': 'number' });
        const submitContributionButton = Button({
            'text': 'submit',
            'onclick': async function (ev) {
                if (!selectedContributorId) {
                    return MessegePopup.showMessegePuppy([MondoText({ 'text': 'select contributor to continue' })]);
                }

                if (!amountEditor.value) {
                    return MessegePopup.showMessegePuppy([MondoText({ 'text': 'enter amount to continue' })]);
                }

                try {
                    let result = await Post('/parish/add/project/contribution',
                        {
                            'contribution': {
                                'project_id': projectRecord['_id'],
                                'amount': parseFloat(amountEditor.value),

                                // can be a parish, member or outstation
                                'contributor_id': selectedContributorId,
                            },
                        },
                        {
                            'requiresParishDetails': true
                        }
                    );
                    const msg = result['response'];
                    MessegePopup.showMessegePuppy([MondoText({ 'text': msg })]);
                    if (msg.match('success') || msg.match('save') || msg.match('update')) {
                        ParishDataHandle.parishProjectsRecords = await getParishProjectsRecords();
                        await showProjectReportView()
                    }
                } catch (err) {
                    MessegePopup.showMessegePuppy([MondoText({ 'text': err })]);
                }
            }
        })

        const col = Column({
            'classlist': ['f-w', 'a-c'],
            'children': [
                Column({
                    'children': [
                        MondoText({ 'text': 'contributor mode' }),
                        projectContributionModePicker,
                    ]
                }),
                memberContributionView,
                outstationContributionPicker,
                sccContributionView,
                Column({ 'children': [MondoText({ 'text': 'amount' }), amountEditor] }),
                submitContributionButton
            ]
        });

        viewAddProjectContibutionColumn.onclick = function (ev) {
            ModalExpertise.showModal({
                'actionHeading': projectRecord.name,
                'children': [col],
            })

            return console.log(projectRecord['_id']);
        };

        ModalExpertise.showModal({
            'actionHeading': `${projectRecord['name']} . ${projectStartEndDateString(projectRecord)}`,
            'topRowUserActions': [viewAddProjectContibutionColumn, levelView, budgetColumn, new PDFPrintButton('')],
            'children': [],
            'fullScreen': true,
        });
    }

    function projectStartEndDateString(projectRecord) {
        return `Starts ${new Date(projectRecord['start_date']).toDateString()} . Ends ${new Date(projectRecord['end_date']).toDateString()}`
    }

    ParishDataHandle.parishProjectsRecords.forEach(function (projectRecord) {
        const column = Column({
            'styles': [{ 'outline': '1px solid grey' }, { 'width': '100%' }, { 'margin-top': '3px' }],
            'classlist': ['f-w', 'txt-c', 'a-c', 'highlightable', 'c-p'],
            'children': [
                MondoBigH3Text({ 'text': projectRecord['name'] }),
                MondoText({ 'text': `budget ${projectRecord['budget']}` }),
                Row({ 'children': [MondoText({ 'text': projectStartEndDateString(projectRecord) })] }),
            ]
        });
        column.onclick = (_ev) => showProjectView(projectRecord);
        projectsColumn.appendChild(column);
    });


    ModalExpertise.showModal({
        'actionHeading': 'Select Project',
        'modalChildStyles': [{ 'width': '400px' }],
        'children': [projectsColumn],
        'dismisible': true,
    });
}
