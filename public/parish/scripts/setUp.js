import { CREATE_ELEMENT, GEL_INPUT_EL_VALUE_BY_ID, GET_EL_BY_ID } from "../../tools/dom.js";
import { SimplifiedNavigator } from "../../tools/navigator.js";
import { NetTool } from "../../tools/netTool.js";
import { LocalStorageContract } from "../../tools/storage.js";
import { IS_NULL_OR_EMPTY } from "../../tools/stringUtils.js";

window.onload = () => {
    const saveButton = GET_EL_BY_ID('save-button');
    const addSCCButton = GET_EL_BY_ID('add-scc');
    const outstationName = GEL_INPUT_EL_VALUE_BY_ID('outstation-name');

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
            SimplifiedNavigator.NavigateByReplacement('pdm')
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

    const newFieldName = prompt("enter new field name");
    if (IS_NULL_OR_EMPTY(newFieldName)) {
        return;
    }

    const entry = CREATE_ELEMENT('input');
    entry.placeholder = 'new scc name'
    entry.value = newFieldName

    sccEntryTree.appendChild(entry)
}