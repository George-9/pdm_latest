import { CREATE_ELEMENT, GET_EL_BY_ID } from "../../../tools/dom.js";
import { ModalExpertise } from "../../../tools/modal.js";

document.addEventListener('DOMContentLoaded', (_) => {
    const div = CREATE_ELEMENT('div');
    div.classList.add('flex-colum');

    const saveButton = CREATE_ELEMENT('button');
    saveButton.style.borderRadius = '3px'
    saveButton.style.width = '100px'
    saveButton.innerText = 'save';

    GET_EL_BY_ID('add-offering-record').onclick = (_) => {
        ModalExpertise.ShowModal('offering records', div, {
            'headingColor': 'green',
            'TopButton': saveButton,
            'topButtonToolip': 'save',
        })
    }
});