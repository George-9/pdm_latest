import { domQueryAll } from "../../dom/query.js";
import { ParishLogIn } from "../../log_in.js";
import { LocalStorageContract } from "../../storage/LocalStorageContract.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { Button, Column, MondoText } from "../UI/cool_tool_ui.js";
import { TextEditValueValidator } from "../utils/textedit_value_validator.js";

export function promptLogIn() {
    const emailInput = TextEdit({ 'placeholder': 'email' });
    const passwordInput = TextEdit({ 'placeholder': 'password', onSubmit: doLogIn });

    const button = Button({
        'text': 'submit',
        'onclick': doLogIn,
        'classlist': {},
        'styles': [{ 'margin-top': '40px' }]
    });

    const column = Column({
        'children': [emailInput, passwordInput, button],
        'classlist': ['f-w', 'fx-col', 'a-c', 'just-center'],
        styles: [{ 'padding-top': '80px' }]
    });

    async function doLogIn() {
        try {
            TextEditValueValidator.validate('email', emailInput);
            TextEditValueValidator.validate('password', passwordInput);

            let result = await ParishLogIn(emailInput.value, passwordInput.value);
            const msg = result['response'];

            MessegePopup.showMessegePuppy([MondoText({ 'text': msg })]);

            if (msg.match('success')) {
                await Post('/parish/details', {
                    'email': emailInput.value,
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
        'modalChildStyles': [{ 'width': '400px' }]
    });
}