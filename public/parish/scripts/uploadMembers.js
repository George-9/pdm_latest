import { GET_EL_BY_ID } from "../../tools/dom.js";
import { MessegePopup } from "../../tools/messegePopup.js";
import { NetTool } from "../../tools/netTool.js";
import { LocalStorageContract } from "../../tools/storage.js";

document.addEventListener('DOMContentLoaded', (ev) => {
    ev.preventDefault();

    GET_EL_BY_ID('submit-members').onclick = async (ev) => {
        ev.preventDefault()
        // const workbook = new ExcelJS.Workbook();
        // console.log(workbook);

        await uploadFiles(GET_EL_BY_ID('file-source'));
    }
})

const uploadFiles = async (input = new HTMLInputElement()) => {
    if (!input || !input.files || !input.files[0]) {
        return MessegePopup.ShowMessegePuppy('no excel files provided');
    }

    const jsonData = []
    const file = input.files[0];
    const fileReader = new FileReader()
    fileReader.onload = async (ev) => {
        const data = new Uint8Array(ev.target.result);
        const workbook = XLSX.read(data, { type: 'array' })

        if (!workbook.SheetNames[0]) {
            return MessegePopup.ShowMessegePuppy('cannot upload an empty file')
        }

        for (let i = 0; i < workbook.SheetNames.length; i++) {
            const worksheetName = workbook.SheetNames[i];
            const workSheet = workbook.Sheets[worksheetName];

            jsonData.push(...(XLSX.utils.sheet_to_json(workSheet)));
        }

        const body = JSON.stringify({
            parish_id: LocalStorageContract.STORED_PARISH_ID(),
            'members': jsonData
        });

        const request = await NetTool.POST_CLIENT('/upload/members', NetTool.CMMN_HEADERS.JSON_CONTENT_TYPE, body);

        MessegePopup.ShowMessegePuppy((await request.json()).response);
    }

    fileReader.readAsArrayBuffer(file);
}