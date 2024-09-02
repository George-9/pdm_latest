import { getParishOutstations } from "../../data_source/main.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { Button } from "../UI/button.js";
import { Column } from "../UI/column.js";
import { MondoBigH3Text, MondoText } from "../UI/mondo_text.js";
import { Row } from "../UI/row.js";
import { TextEdit } from "../UI/textedit.js";
import { VerticalScrollView } from "../UI/vertical_scrollview.js";
import { TextEditValueValidator } from "../utils/textedit_value_validator.js";

export function promptAddOutstationView(parishOutstations) {
    const nameTextEdit = TextEdit({ 'placeholder': 'outstation name' });

    const button = Button({ 'text': 'submit' });
    button.onclick = async function (ev) {
        ev.preventDefault();
        try {
            TextEditValueValidator.validate('outstation name', nameTextEdit);

            let result = await Post('/parish/add/outstation',
                { outstation: { 'name': nameTextEdit.value } },
                { 'requiresParishDetails': true });
            let msg = result['response'];

            MessegePopup.showMessegePuppy([new MondoText({ 'text': msg })])
            if (msg.match('success') || msg.match('save')) {
                clearTextEdits([nameTextEdit]);
                parishOutstations = await getParishOutstations();
            }
        } catch (error) {
            MessegePopup.showMessegePuppy([MondoText({ 'text': error })])
        }
    }

    const column = Column({
        'children': [nameTextEdit, button],
        'classlist': ['f-w', 'a-c']
    });
    column.style.paddingTop = '30px';

    ModalExpertise.showModal({
        'actionHeading': 'add outstations to your parish',
        'children': [column],
        'fullScreen': false,
        'modalChildStyles': [{ 'width': '400px', 'height': '50%' }]
    });
}


export function viewOutstationsPage(parishOutstations, parishMembers) {
    const column = VerticalScrollView({
        'classlist': ['f-w', 'a-c', 'just-center'],
        'children': parishOutstations.map(function (outstation) {
            let outstationMembersCount = parishMembers.filter(function (m) {
                return m['outstation_id'] === outstation['_id']
            }).length;

            return Row({
                'classlist': ['space-around', 'a-c', 'outlined'],
                'styles': [{ 'width': '50%' }, { 'margin': '10px' }],
                'children': [
                    MondoBigH3Text({ 'text': outstation['name'] }),
                    MondoText({ 'text': `${outstationMembersCount} members` })
                ]
            });
        })
    });

    ModalExpertise.showModal({
        'modalHeadingStyles': [{ 'background': 'royalblue' }, { 'color': 'white' }],
        'actionHeading': `parish outstations (${parishOutstations.length})`,
        'children': [column],
        'modalChildStyles': [{ 'width': '400px' }],
        'fullScreen': false,
        'dismisible': true,
    });
}
