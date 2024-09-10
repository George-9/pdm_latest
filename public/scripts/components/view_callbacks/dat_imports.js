import { domCreate } from "../../dom/query.js";
import { Post } from "../../net_tools.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { Column } from "../UI/column.js";
import { MondoText } from "../UI/mondo_text.js";
import { TextEdit } from "../UI/textedit.js";
import { addClasslist } from "../utils/stylus.js";

export function promptUploadMembers() {
    const fileInput = TextEdit({ 'type': 'file' });

    function readExcel(file) {
        const reader = new FileReader();
        reader.onload = async function (event) {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const dataSource = XLSX.utils.sheet_to_json(worksheet);

            console.log(dataSource);
            let result = await Post('/parish/upload/members',
                {
                    members: dataSource
                },
                { 'requiresParishDetails': true }
            );
            MessegePopup.showMessegePuppy([MondoText({ 'text': result['response'] })]);
        };
        reader.readAsArrayBuffer(file);
    }

    const submitButton = domCreate('i');
    addClasslist(submitButton, ['bi', 'bi-cloud-upload']);
    submitButton.onclick = function (ev) {
        const file = fileInput.files[0];
        if (!file) {
            return MessegePopup.showMessegePuppy([
                MondoText({ 'text': 'please sellect a fiie to proceed' })
            ]);
        } else {
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