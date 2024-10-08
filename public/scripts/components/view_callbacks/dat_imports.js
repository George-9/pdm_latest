import { mapValuesToUppercase } from "../../../global_tools/objects_tools.js";
import { domCreate } from "../../dom/query.js";
import { Post } from "../../net_tools.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { Column } from "../UI/column.js";
import { MondoText } from "../UI/mondo_text.js";
import { TextEdit } from "../UI/textedit.js";

const submitButton = domCreate('button');
submitButton.innerText = 'upload';
submitButton.style.border = '1px solid grey';
let uploading = false;

export function promptUploadMembers() {
    const fileInput = TextEdit({ 'type': 'file' });
    fileInput.setAttribute('accept', 'xlsx', 'xls', 'csv');

    function readExcel(file) {
        const reader = new FileReader();
        reader.onload = async function (event) {
            const data = event.target.result;
            const jsonArray = JSON.parse(data);

            let correctedData = jsonArray.map(function (member) {
                let tmp = { ...member, 'member_number': member['NO'] };

                if (!tmp['gender']) {
                    tmp['gender'] = '_';
                }

                if (!tmp['volume']) {
                    tmp['volume'] = '_';
                }

                delete tmp['_id'];
                delete tmp['NO'];

                return mapValuesToUppercase(tmp);
            });

            console.log(correctedData);
            let result = await Post('/parish/upload/members', { members: correctedData }, { 'requiresParishDetails': true });
            console.log(result);

            if (result) {
                MessegePopup.showMessegePuppy([MondoText({ 'text': result['response'] })]);
            }
        };

        reader.readAsText(file);
    }

    submitButton.onclick = function (ev) {
        if (uploading) {
            return;
        }

        const file = fileInput.files[0];
        if (!file) {
            return MessegePopup.showMessegePuppy([
                MondoText({ 'text': 'please sellect a fiie to proceed' })
            ]);
        } else {
            uploading = true;
            submitButton.innerText = 'uploading...';
            readExcel(file);
        }
    }

    const column = Column({
        'styles': [{ 'padding': '20px' }],
        'children': [fileInput]
    })

    ModalExpertise.showModal({
        'topRowUserActions': [submitButton],
        'actionHeading': 'upload members',
        'children': [column]
    })
}

