import { PRIESTS_COMMUNITY_NAME } from "../../data_source/other_sources.js";
import { domCreate } from "../../dom/query.js";
import { MondoSelect } from "../UI/cool_tool_ui.js";

export function OutstationPicker({ outstations = [], classlist = [], styles = [], onchange = new Function() }) {
    const picker = MondoSelect({
        'classlist': classlist,
        'styles': styles,
        'onChange': onchange
    });

    for (let i = 0; i < outstations.length; i++) {
        const outstation = outstations[i];

        const option = domCreate('option');
        option.innerText = outstation['name'];
        option.value = JSON.stringify(outstation);
        picker.appendChild(option);
    }

    if (picker.options.length > 1) {
        picker.options[0].selected = true;
    }
    picker.addEventListener('change', function (ev) {
        onchange(ev);
    })

    return picker;
}

/**
 * add the {PRIEST_COMMUNITY_NAME} option to an SCC PICKER
 * @param {HTMLSelectElement} SCC picker
 */
export function addPriestCommunityOptionToPicker(sccPicker) {
    const lastOption = domCreate('option');
    lastOption.innerText = PRIESTS_COMMUNITY_NAME;
    lastOption.value = JSON.stringify({ '_id': PRIESTS_COMMUNITY_NAME, 'name': PRIESTS_COMMUNITY_NAME });

    sccPicker.appendChild(lastOption);
}