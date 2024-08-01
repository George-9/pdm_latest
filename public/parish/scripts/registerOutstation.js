// import { CREATE_ELEMENT } from "../../tools/dom";

// export function RegisterOutstation() {
//     const registerDiv = CREATE_ELEMENT('div');
//     registerDiv.classList.add('full-width', 'flex-column', 'align-center', 'scroll-y');

//     const toolsRow = CREATE_ELEMENT('div');
//     toolsRow.classList.add('full-width', 'flex-row', 'align-end');

//     const addSCCFieldButton = CREATE_ELEMENT('button');
//     addSCCFieldButton.style.fontSize = '20px';
//     addSCCFieldButton.innerText = '+';
//     addSCCFieldButton.title = 'add another SCC';

//     const registerButton = CREATE_ELEMENT('button');
//     registerButton.innerText = 'register';

//     toolsRow.append(registerButton, addSCCFieldButton);

//     const sccEntPlaceholder = 'Small Christian Community Name';

//     const outstationNameEntry = CREATE_ELEMENT('input')
//     outstationNameEntry.id = 'outstation-name';
//     outstationNameEntry.placeholder = 'outstation name';

//     const firstOutstationSCCNameEntry = CREATE_ELEMENT('input')
//     firstOutstationSCCNameEntry.placeholder = sccEntPlaceholder;


// }



// async function addInputElement() {
//     const outstationName = GEL_INPUT_EL_VALUE_BY_ID('outstation-name');
//     if (IS_NULL_OR_EMPTY(outstationName)) {
//         return alert('enter outstation name first');
//     }

//     const sccEntryTree = GET_EL_BY_ID('sccs-entry');
//     const sccEntries = sccEntryTree.children;

//     if (IS_NULL_OR_EMPTY(sccEntries[sccEntries.length - 1].value)) {
//         return;
//     }

//     const newFieldName = prompt("enter new field name");
//     if (IS_NULL_OR_EMPTY(newFieldName)) {
//         return;
//     }

//     const entry = CREATE_ELEMENT('input');
//     entry.placeholder = 'new scc name'
//     entry.value = newFieldName

//     sccEntryTree.appendChild(entry)
// }

import { CREATE_ELEMENT, GEL_INPUT_EL_VALUE_BY_ID, GET_EL_BY_ID } from "../../tools/dom.js";
import { MessegePopup } from "../../tools/messegePopup.js";
import { NetTool } from "../../tools/netTool.js";
import { LocalStorageContract } from "../../tools/storage.js";
import { IS_NULL_OR_EMPTY } from "../../tools/stringUtils.js";

window.onload = () => {
    const saveButton = GET_EL_BY_ID('save-button');
    const addSCCButton = GET_EL_BY_ID('add-scc');

    addSCCButton.onclick = addInputElement;

    saveButton.onclick = async (ev) => {
        const outstationName = GEL_INPUT_EL_VALUE_BY_ID('outstation-name');
        if (IS_NULL_OR_EMPTY(outstationName)) {
            return alert('enter outstation name first');
        }

        const sccEntryTree = GET_EL_BY_ID('sccs-entry');
        const sccEntries = sccEntryTree.children;
        const sccsNames = [];

        for await (const child of sccEntries) {
            sccsNames.push(child.value);
        }

        const result = await (await NetTool.POST_CLIENT('/add/outstation/',
            NetTool.CMMN_HEADERS.JSON_CONTENT_TYPE,
            JSON.stringify({
                'id': LocalStorageContract.STORED_PARISH_ID(),
                'outstation_name': outstationName,
                'sccs': sccsNames
            })
        )).json()

        if (result.response === 'success') {
            MessegePopup.ShowMessegePuppy('Success');

            setTimeout(() => {
                window.location.reload();
                // SimplifiedNavigator.NavigateByReplacement('pdm');
            }, 2400);
        }
    }
}


async function addInputElement() {
    const outstationName = GEL_INPUT_EL_VALUE_BY_ID('outstation-name');
    if (IS_NULL_OR_EMPTY(outstationName)) {
        return alert('enter outstation name first');
    }

    const sccEntryTree = GET_EL_BY_ID('sccs-entry');
    const sccEntries = sccEntryTree.children;

    if (IS_NULL_OR_EMPTY(sccEntries[sccEntries.length - 1].value)) {
        return;
    }

    const newFieldName = prompt("enter SCC name");
    if (IS_NULL_OR_EMPTY(newFieldName)) {
        return;
    }

    const entry = CREATE_ELEMENT('input');
    entry.placeholder = 'new scc name'
    entry.value = newFieldName

    sccEntryTree.appendChild(entry)
}