import { ParishDataHandle } from "../../data_pen/parish_data_handle.js";
import { getAllMembersWithoutSCC } from "../../data_pen/puppet.js";
import { getParishSCCs } from "../../data_source/main.js";
import { clearTextEdits } from "../../dom/text_edit_utils.js";
import { Post } from "../../net_tools.js";
import { marginRuleStyles } from "../../parish_profile.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { OutstationPicker } from "../tailored_ui/outstation_picker.js";
import { Column, MondoText, TextEdit, Button, VerticalScrollView, MondoBigH3Text, Row } from "../UI/cool_tool_ui.js";
import { TextEditValueValidator } from "../utils/textedit_value_validator.js";

export function promptAddSCCView() {
    const sccNameI = TextEdit({ 'placeholder': 'scc name' });
    const outstationPicker = OutstationPicker({
        'styles': marginRuleStyles,
        'onchange': function (ev) {
        },
        'outstations': ParishDataHandle.parishOutstations
    });

    const button = Button({
        'styles': marginRuleStyles,
        'text': 'submit',
        'onclick': async function (ev) {
            try {
                const outstationId = JSON.parse(outstationPicker.value)['_id'];

                TextEditValueValidator.validate('SCC name', sccNameI);
                const body = {
                    'scc': {
                        'name': sccNameI.value,
                        'outstation_id': outstationId
                    }
                };

                let result = await Post('/parish/add/scc', body, { 'requiresParishDetails': true });
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
        'classlist': ['f-w', 'f-c', 'a-c'],
        'children': [
            sccNameI,
            outstationPicker,
            button
        ]
    });

    ModalExpertise.showModal({
        'actionHeading': 'add an SCC',
        'modalChildStyles': [{ 'width': '400px', 'height': '300px' }],
        'children': [column],
        'fullScreen': false,
        'dismisible': true
    })
}

export function viewSCCsPage() {
    const column = VerticalScrollView({
        'classlist': ['f-w', 'a-c', 'just-center'],
        'children': ParishDataHandle.parishSCCs.map(function (scc) {
            let outstation = ParishDataHandle.parishOutstations.find(function (o) {
                return o['_id'] === scc['outstation_id']
            }) || { 'name': 'EVERY OUTSTATION' };

            let members = ParishDataHandle.parishMembers.filter(function (m) {
                return m['scc_id'] === scc['_id']
            }).length;

            return Row({
                'classlist': ['space-around', 'f-w', 'a-c', 'outlined', 'highlightable'],
                'styles': [{ 'width': '90%' }, { 'margin': '5px' }],
                'children': [
                    Column({
                        'children': [
                            MondoBigH3Text({ 'text': scc['name'] }),
                            MondoText({
                                'text': `outstation: ${outstation['name']}`,
                                'styles': [{ 'font-size': '12px', 'color': 'grey' }]
                            }),
                        ]
                    }),
                    MondoText({ 'text': `${!(outstation['_id']) ? getAllMembersWithoutSCC().length : members} members` })
                ]
            });
        })
    });

    ModalExpertise.showModal({
        'modalHeadingStyles': [{ 'background': 'royalblue' }, { 'color': 'white' }],
        'actionHeading': `small Christian Communities (${ParishDataHandle.parishSCCs.length})`,
        'children': [column],
        'modalChildStyles': [{ 'width': '400px' }],
        'fullScreen': false,
        'dismisible': true,
    });
}