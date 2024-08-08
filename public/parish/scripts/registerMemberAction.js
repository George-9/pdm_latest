import { CREATE_ELEMENT } from "../../tools/dom.js";
import { MessegePopup } from "../../tools/messegePopup.js";
import { ModalExpertise } from "../../tools/modal.js";
import { NetTool } from "../../tools/netTool.js";
import { LocalStorageContract } from "../../tools/storage.js";
import { IS_NULL_OR_EMPTY } from "../../tools/stringUtils.js";

export function RegisterMember() {
    let selectedOutstation, selectedSCC;

    const registerDiv = CREATE_ELEMENT('div');
    registerDiv.style.height = '400px';
    registerDiv.classList.add('flex-column', 'align-center', 'scroll-y');

    const entryDiv = CREATE_ELEMENT('div');
    entryDiv.classList.add('full-width', 'flex-column', 'align-center', 'scroll-y');

    const progress = CREATE_ELEMENT('progress');
    const sccsSelect = CREATE_ELEMENT('select');
    sccsSelect.id = 'scc';

    sccsSelect.onchange = (ev) => {
        selectedSCC = ev.currentTarget.value;
    }

    const headerDiv = CREATE_ELEMENT('div');
    headerDiv.classList.add('flex-row', 'full-width', 'align-end', 'justify-end');

    const addNewFieldButton = CREATE_ELEMENT('button');
    addNewFieldButton.style.backgroundColor = 'white';
    addNewFieldButton.style.color = 'grey';
    addNewFieldButton.classList.add('btn-normal');
    addNewFieldButton.innerText = '+';
    addNewFieldButton.title = 'add custom field';
    addNewFieldButton.onclick = (ev) => {
        if (IS_NULL_OR_EMPTY((entryDiv.children[entryDiv.children.length - 1]).value)) {
            return;
        }

        const newFieldName = prompt('new field name, e.g. place of birth');
        if (IS_NULL_OR_EMPTY(newFieldName)) {
            return
        }

        const newEntry = CREATE_ELEMENT('input');
        newEntry.id = newFieldName.split(' ').join('_');
        newEntry.placeholder = newFieldName;


        entryDiv.appendChild(newEntry);
    }



    const submitButton = CREATE_ELEMENT('button');
    submitButton.style.backgroundColor = 'white';
    submitButton.style.color = 'grey';
    submitButton.classList.add('btn-normal')
    submitButton.innerText = 'complete';

    const nameI = CREATE_ELEMENT('input');
    nameI.id = 'name';
    nameI.placeholder = 'enter name';

    const homeAddressI = CREATE_ELEMENT('input');
    homeAddressI.id = 'home_address';
    homeAddressI.placeholder = 'home address';

    const dob = CREATE_ELEMENT('input');
    dob.id = 'dob'
    dob.setAttribute('type', 'date');

    const genderPicker = CREATE_ELEMENT('select');
    genderPicker.style.width = '250px'
    genderPicker.style.padding = '10px'

    genderPicker.id = 'gender';
    genderPicker.style.width = '200px';
    genderPicker.style.padding = '10px';

    const male = CREATE_ELEMENT('option');
    male.value = 'male';
    male.innerText = 'male';

    const female = CREATE_ELEMENT('option');
    female.innerText = 'female';
    female.value = 'female';

    genderPicker.append(male, female);

    entryDiv.append(nameI, dob, genderPicker, homeAddressI)
    registerDiv.appendChild(progress);

    addNewFieldButton.classList.add('reg-btn');
    submitButton.classList.add('reg-btn');
    headerDiv.append(addNewFieldButton, submitButton);
    const memberDetails = {};


    let outstationsResult
    const getAndSetOutstations = async () => {
        outstationsResult = await (await NetTool.POST_CLIENT('/get/outstations',
            NetTool.CMMN_HEADERS.JSON_CONTENT_TYPE,
            JSON.stringify({
                'parish_id': LocalStorageContract.STORED_PARISH_CREDENTIALS()['id']
            })
        )).json();
        // new HTMLSelectElement().onchange = (ev) => {

        // }
    }

    submitButton.onclick = async (ev) => {
        ev.preventDefault();

        for await (const inputEntry of entryDiv.children) {
            if (ev.target.id === 'outstation' || ev.target.id === 'scc') {
                continue;
            }

            if (IS_NULL_OR_EMPTY(inputEntry.value) && inputEntry.id === 'name'
                ||
                IS_NULL_OR_EMPTY(inputEntry.value) && inputEntry.id === 'dob'
                ||
                IS_NULL_OR_EMPTY(inputEntry.value) && inputEntry.id === 'gender'
                ||
                IS_NULL_OR_EMPTY(inputEntry.value) && inputEntry.id === 'home_address'
            ) {
                console.log('empty field -> ', inputEntry.id);
                return MessegePopup.ShowMessegePuppy('all basic fields must be filled, name to home address');
            }
            else if (IS_NULL_OR_EMPTY(inputEntry.value)) {
                continue;
            } else {
                memberDetails[inputEntry.id.toUpperCase().trim()] = inputEntry.value;
            }
        }
        const registrationResult = await (await NetTool.POST_CLIENT(
            '/register/member',
            NetTool.CMMN_HEADERS.JSON_CONTENT_TYPE,
            JSON.stringify({
                ...memberDetails,
                'parish_id': LocalStorageContract.STORED_PARISH_ID(),
                'outstation': selectedOutstation,
                'scc': selectedSCC
            })
        )).json();

        MessegePopup.ShowMessegePuppy(registrationResult['response']);
        ModalExpertise.HideModal();
        window.location.reload()
    }

    ModalExpertise.ShowModal('register member', registerDiv, {
        modalChildStylesClassList: [
            'flex-column',
            'align-center',
            // 'justify-center'
        ],
        'TopButton': headerDiv
    });

    getAndSetOutstations().then(() => {
        registerDiv.removeChild(progress);

        registerDiv.append(entryDiv);

        // entryDiv.appendChild(OutstationPicker(outstationsResult))
        registerDiv.appendChild(OutstationPicker(outstationsResult, sccsSelect))
        entryDiv.appendChild(sccsSelect)
    });
}

let selectedOutstation;

export function OutstationPicker(outstations, sccsSelect) {
    const outstationsPicker = CREATE_ELEMENT('select');
    outstationsPicker.id = 'outstation'
    outstationsPicker.style.width = '250px'
    outstationsPicker.style.padding = '10px'

    for (let i = 0; i < outstations.length; i++) {
        let outstationData = outstations[i]
        const select = CREATE_ELEMENT('option');

        select.value = outstationData['name'];
        select.innerText = outstationData['name'];
        outstationsPicker.appendChild(select);
    }

    if (sccsSelect) {
        outstationsPicker.onchange = async (ev) => {

            sccsSelect.replaceChildren([]);

            const matchOutstation = outstations.filter((outstation) => {
                selectedOutstation = outstation['name'];
                return outstation.name === ev.target.value;
            })[0];

            const sccs = matchOutstation.smallchristiancommunities

            for (let j = 0; j < sccs.length; j++) {
                let scc = sccs[j];
                const sccOpt = CREATE_ELEMENT('option')
                sccOpt.value = scc;
                sccOpt.innerHTML = scc;

                sccsSelect.appendChild(sccOpt);
            }
        }
    }

    return outstationsPicker;
}