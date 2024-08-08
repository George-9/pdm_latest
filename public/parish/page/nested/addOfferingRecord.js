import { CREATE_ELEMENT, GET_EL_BY_ID } from "../../../tools/dom.js";
import { MessegePopup } from "../../../tools/messegePopup.js";
import { ModalExpertise } from "../../../tools/modal.js";
import { NetTool } from "../../../tools/netTool.js";
import { LocalStorageContract } from "../../../tools/storage.js";
import { IS_NULL_OR_EMPTY } from "../../../tools/stringUtils.js";
import { OutstationPicker } from "../../scripts/registerMemberAction.js";

document.addEventListener('DOMContentLoaded', (_) => {
    const div = CREATE_ELEMENT('div');
    div.classList.add('flex-column', 'align-center');

    const saveButton = CREATE_ELEMENT('button');
    saveButton.style.borderRadius = '100px';
    saveButton.style.width = '50px';
    saveButton.style.backgroundColor = 'darkOliveGreen';
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

    let outstationPicker;
    getOutstations().then((outstations) => {
        outstationPicker = OutstationPicker(outstations)
        div.appendChild(outstationPicker);
    });
    div.append(amountEditor);

    saveButton.onclick = async (_) => {
        const details = {
            'parish_id': LocalStorageContract.STORED_PARISH_ID(),
            'date': datePicker.value,
            'amount': amountEditor.value,
            'outstation': outstationPicker.value
        };

        for (const key in details) {
            if (Object.prototype.hasOwnProperty.call(details, key)) {
                if (IS_NULL_OR_EMPTY(details[key])) {
                    return MessegePopup.ShowMessegePuppy('please enter ' + key + ' to save record')
                }
            }
        }

        const saveResult = await (await NetTool.POST_CLIENT('/parish/add/offering/record',
            NetTool.CMMN_HEADERS.JSON_CONTENT_TYPE,
            JSON.stringify(details)
        )).json();

        MessegePopup.ShowMessegePuppy(saveResult['response'])
    }
});