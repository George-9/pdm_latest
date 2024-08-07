import { CREATE_ELEMENT, GET_EL_BY_ID } from "../../../tools/dom.js";
import { ModalExpertise } from "../../../tools/modal.js";
import { NetTool } from "../../../tools/netTool.js";
import { LocalStorageContract } from "../../../tools/storage.js";
import { OutstationPicker } from "../../scripts/registerMemberAction.js";

document.addEventListener('DOMContentLoaded', (_) => {
    const div = CREATE_ELEMENT('div');
    div.classList.add('flex-colum');

    const saveButton = CREATE_ELEMENT('button');
    saveButton.style.borderRadius = '3px'
    saveButton.style.width = '100px'
    saveButton.innerText = 'save';

    const datePicker = CREATE_ELEMENT('input');
    datePicker.setAttribute('type', 'date');

    const amountEditor = CREATE_ELEMENT('input');
    amountEditor.setAttribute('keyboard', 'number')
    amountEditor.placeholder = 'amount in KSH';

    const getOutstations = async () => {
        return await (await NetTool.POST_CLIENT('/get/outstations',
            NetTool.CMMN_HEADERS.JSON_CONTENT_TYPE,
            JSON.stringify({
                'parish_id': LocalStorageContract.STORED_PARISH_CREDENTIALS()['id']
            })
        )).json();
    }


    GET_EL_BY_ID('add-offering-record').onclick = (_) => {
        ModalExpertise.ShowModal('offering records', div, {
            'headingColor': 'green',
            'TopButton': saveButton,
            'topButtonToolip': 'save',
        })
    }

    div.append(datePicker);
    getOutstations().then((outstations) => {
        div.appendChild(OutstationPicker(outstations));
    });
    div.append(amountEditor);
});