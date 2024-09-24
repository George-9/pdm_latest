import { mapValuesToUppercase } from "../../global_tools/objects_tools.js";
import { ModalExpertise } from "../../scripts/components/actions/modal.js";
import { MessegePopup } from "../../scripts/components/actions/pop_up.js";
import { Button, Column, MondoText, TextEdit } from "../../scripts/components/UI/cool_tool_ui.js";
import { TextEditError, TextEditValueValidator } from "../../scripts/components/utils/textedit_value_validator.js";
import { clearTextEdits } from "../../scripts/dom/text_edit_utils.js";
import { work } from "../../scripts/dom/worker.js";
import { Post } from "../../scripts/net_tools.js";

work(RegisterParish);

function RegisterParish() {
    let column,
        adminCodeI,
        adminPasswordI,
        parishNameI,
        parishCodeI,
        parishEmailI,
        parishPasswordI,
        button;

    adminCodeI = TextEdit({ 'placeholder': 'admin code' });
    adminPasswordI = TextEdit({ 'placeholder': 'admin password' });
    parishNameI = TextEdit({ 'placeholder': 'parish name' });
    parishEmailI = TextEdit({ 'placeholder': 'parish email' });
    parishCodeI = TextEdit({ 'placeholder': 'parish code' });
    parishPasswordI = TextEdit({ 'placeholder': 'parish password' });

    button = Button({
        'text': 'submit', 'onclick': async function (ev) {
            try {
                TextEditValueValidator.validate('admin code', adminCodeI);
                TextEditValueValidator.validate('admin password', adminPasswordI);
                TextEditValueValidator.validate('parish name', parishNameI);
                TextEditValueValidator.validate('parish email', parishEmailI);
                TextEditValueValidator.validate('parish code', parishCodeI);
                TextEditValueValidator.validate('parish password', parishPasswordI);

                const body = {
                    'admin_code': adminCodeI.value,
                    'admin_password': adminPasswordI.value,
                    'parish_name': parishNameI.value,
                    'parish_email': parishEmailI.value,
                    'parish_code': parishCodeI.value,
                    'parish_password': parishPasswordI.value,
                }

                column.replaceChildren(...[MondoText({ 'text': 'on it' })]);

                let result = await Post('/register/parish', mapValuesToUppercase(body), { 'requiresParishDetails': false });
                setTimeout(() => {
                    column.replaceChildren([]);
                    column.append(...children);
                }, 1200);

                const msg = result['response'];
                MessegePopup.showMessegePuppy([new MondoText({ 'text': msg })]);

                if (msg && msg.match('success')) {
                    clearTextEdits([
                        adminCodeI,
                        adminPasswordI,
                        parishNameI,
                        parishEmailI,
                        parishCodeI,
                        parishPasswordI
                    ]);
                }
            } catch (error) {
                if (error instanceof TextEditError) {
                    MessegePopup.showMessegePuppy([new MondoText({ 'text': error.message })])
                }
            }
        }
    });
    button.style.marginTop = '40px';

    let children = [
        adminCodeI,
        adminPasswordI,
        parishNameI,
        parishCodeI,
        parishEmailI,
        parishPasswordI,
        button
    ];

    column = Column({ 'classlist': ['fx-col', 'f-w', 'f-h', 'a-c'], 'children': children });
    column.style.paddingTop = '30px';

    ModalExpertise.showModal({
        'actionHeading': 'register parish',
        'children': [column],
        'modalChildStyles': [],
        'dismisible': false
    });
}