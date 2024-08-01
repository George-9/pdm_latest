import { CREATE_ELEMENT, GET_EL_BY_ID } from "../../tools/dom.js";
import { MessegePopup } from "../../tools/messegePopup.js";
import { NetTool } from "../../tools/netTool.js";
import { LocalStorageContract } from "../../tools/storage.js";
import { IS_NULL_OR_EMPTY } from "../../tools/stringUtils.js";

document.addEventListener('DOMContentLoaded', (ev) => {
    ev.preventDefault();
    const mainDiv = GET_EL_BY_ID('main-div');

    NetTool.POST_CLIENT(
        '/get/outstations',
        NetTool.CMMN_HEADERS.JSON_CONTENT_TYPE,
        JSON.stringify({ 'parish_id': LocalStorageContract.STORED_PARISH_ID() })
    )
        .then(response => response.json())
        .then(data => {

            if (!data || data.length < 1) {
                const row = CREATE_ELEMENT('div');
                row.classList.add('full-width', 'flex-row', 'align-center', 'justify-center')

                const msgPar = CREATE_ELEMENT('p');
                msgPar.innerText = 'no outstations found';

                row.appendChild(msgPar)
                mainDiv.appendChild(row)
                return;
            }

            for (let i = 0; i < data.length; i++) {
                const outstationData = data[i];
                const outstationView = OutsationView(outstationData);
                mainDiv.appendChild(outstationView);
            }
            console.log('done');
        })
})



function OutsationView(outstationData) {
    const outstationId = outstationData['_id'];
    const sccs = outstationData['smallchristiancommunities'];

    const div = CREATE_ELEMENT('div');
    div.style.padding = '5px';
    div.style.margin = '10px';
    div.style.background = '#d9d7f9';
    div.classList.add('full-width', 'flex-col')

    div.style.borderBottom = '1px solid grey';
    div.classList.add('flex-column');

    const outstationHeading = CREATE_ELEMENT('h3'), outstationTitle = CREATE_ELEMENT('h4');
    outstationHeading.classList.add('max-content');
    outstationHeading.style.padding = '3px';
    outstationHeading.style.border = 'dotted 1px royalblue';
    outstationHeading.innerText = outstationData['name'];


    outstationTitle.innerText = 'outstations';


    const actionsRow = CREATE_ELEMENT('div');
    actionsRow.classList.add('flex-row', 'full-width', 'align-center', 'justify-end');

    const addSCCEntryButton = CREATE_ELEMENT('button');
    addSCCEntryButton.innerText = 'add new SCC';
    addSCCEntryButton.onclick = (ev) => {
        ev.preventDefault();

        const children = () => div.children;
        if (children() && IS_NULL_OR_EMPTY(children()[children().length - 1].value)) {
            return;
        }

        const newSCCName = prompt('enter SCC Name');
        if (!newSCCName) {
            return;
        }
        const newSCCField = CREATE_ELEMENT('input');
        newSCCField.value = newSCCName;
        div.appendChild(newSCCField)
    }


    const saveChangesButton = CREATE_ELEMENT('button');
    saveChangesButton.innerText = 'save changes';

    saveChangesButton.onclick = async (ev) => {
        ev.preventDefault();

        let newSccs = [];
        for await (const input of div.children) {
            if (input.value) {
                newSccs.push(input.value)
            }
        }

        const body = JSON.stringify({
            'parish_id': LocalStorageContract.STORED_PARISH_ID(),
            'id': outstationId,
            sccs: newSccs,
        })
        let result = await NetTool.POST_CLIENT('/update/outstation', NetTool.CMMN_HEADERS.JSON_CONTENT_TYPE, body);
        MessegePopup.ShowMessegePuppy((await result.json())['response'])
    }


    actionsRow.append(addSCCEntryButton, saveChangesButton);

    div.append(outstationHeading, actionsRow, outstationTitle);

    for (let i = 0; i < sccs.length; i++) {
        const par = CREATE_ELEMENT('input');
        par.style.paddingLeft = '20px';
        par.value = sccs[i];
        div.appendChild(par);
    }

    return div;
}