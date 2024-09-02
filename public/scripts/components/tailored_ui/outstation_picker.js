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

    picker.options[0].selected = true;
    picker.addEventListener('change', function (ev) {
        onchange(ev);
    })

    return picker;
}