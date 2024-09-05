import { domQueryAll } from "../../dom/query.js";
import { ParishLogIn } from "../../log_in.js";
import { Post } from "../../net_tools.js";
import { LocalStorageContract } from "../../storage/LocalStorageContract.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { Button, Column, MondoText, TextEdit } from "../UI/cool_tool_ui.js";
import { TextEditError, TextEditValueValidator } from "../utils/textedit_value_validator.js";

export function promptLogIn() {
    const detail = TextEdit({ 'placeholder': 'parish email or parish code' });
    const passwordInput = TextEdit({ 'placeholder': 'password', 'type': 'password', onSubmit: doLogIn });

    const button = Button({
        'text': 'submit',
        'onclick': doLogIn,
        'classlist': {},
        'styles': [{ 'margin-top': '40px' }]
    });

    const column = Column({
        'children': [detail, passwordInput, button],
        'classlist': ['f-w', 'fx-col', 'a-c', 'just-center'],
        styles: [{ 'padding-top': '80px' }]
    });

    async function doLogIn() {
        try {
            TextEditValueValidator.validate('email or parish ccde', detail);
            TextEditValueValidator.validate('password', passwordInput);

            let result = await ParishLogIn(detail.value, passwordInput.value);
            const msg = result['response'];

            MessegePopup.showMessegePuppy([MondoText({ 'text': msg })]);
            if (msg.match('success')) {
                await Post('/parish/details', {
                    'detail': detail.value,
                    'password': passwordInput.value,
                },
                    {
                        'requiresParishDetails': false
                    }
                ).then(function (parishDetails) {
                    let credentials = parishDetails['response'];

                    if (credentials) {
                        /**remove unneccessary mongodb objectId */
                        delete credentials['_id']

                        LocalStorageContract.storeDetails(credentials);
                        window.location.reload();
                    } else {
                        MessegePopup.showMessegePuppy([MondoText({ 'text': 'something went wrong' })]);
                    }
                })

            }
        } catch (error) {
            console.log(error);

            if (error instanceof TextEditError) {
                MessegePopup.showMessegePuppy([MondoText({ 'text': error.message })]);
            }
        }
    }

    domQueryAll('h3').forEach(function (el) {
        el.style.display = 'none';
    });

    domQueryAll('.drawer').forEach(function (el) {
        el.style.display = 'none';
    });

    ModalExpertise.showModal({
        'actionHeading': 'Log In',
        'children': [column],
        'classlist': ['f-w'],
        'dismisible': false,
        'fullScreen': false,
        'modalChildStyles': []
    });
}