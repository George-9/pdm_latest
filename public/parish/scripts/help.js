import { GET_EL_BY_ID, CREATE_ELEMENT } from "../../tools/dom.js";
import { ModalExpertise } from "../../tools/modal.js";

document.addEventListener('DOMContentLoaded', (ev) => {
    ev.preventDefault();

    const helpContentDiv = CREATE_ELEMENT('div');
    helpContentDiv.classList.add('full-width', 'flex-column', 'full-height', 'align-center');
    helpContentDiv.style.backgroundColor = 'gainsboro';
    helpContentDiv.style.padding = '40px';


    const msgPar = CREATE_ELEMENT('h3');
    msgPar.style.fontWeight = '100';
    msgPar.innerText = 'For any queries about PDM(Parish Data manager), registration or' +
        ' on how to do specific operations, feel free to contact us';

    const contactRow = CREATE_ELEMENT('div')
    contactRow.style.height = '50px';
    contactRow.classList.add('full-width', 'flex-row', 'align-center');

    const telAnchor = CREATE_ELEMENT('a');
    telAnchor.innerText = 'click to open 0718824980'
    telAnchor.href = 'tel:0718824980'

    const telAnchor2 = CREATE_ELEMENT('a');
    telAnchor2.innerText = 'click to open 0727627443'
    telAnchor2.href = 'tel:0727627443'

    contactRow.append(telAnchor, telAnchor2)

    helpContentDiv.append(msgPar, contactRow)

    GET_EL_BY_ID('help').onclick = () => {
        ModalExpertise.ShowModal('PDM Help...', helpContentDiv, {
            'modalChildStylesClassList': []
        });
    }
})