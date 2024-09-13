import { ParishDataHandle } from "../../data_pen/parish_data_handle.js";
import { getOutstationById } from "../../data_pen/puppet.js";
import { getParishStaff } from "../../data_source/main.js";
import { addChildrenToView } from "../../dom/addChildren.js";
import { domCreate } from "../../dom/query.js";
import { clearTextEdits } from "../../dom/text_edit_utils.js";
import { Post } from "../../net_tools.js";
import { LocalStorageContract } from "../../storage/LocalStorageContract.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { OutstationPicker } from "../tailored_ui/outstation_picker.js";
import { PDFPrintButton } from "../tailored_ui/print_button.js";
import { Button, Column, HorizontalScrollView, MondoSelect, MondoText, Row, TextEdit, VerticalScrollView } from "../UI/cool_tool_ui.js";
import { TextEditValueValidator } from "../utils/textedit_value_validator.js";

export function promptAddStaffToParish() {
    const outstationPicker = OutstationPicker({ 'outstations': ParishDataHandle.parishOutstations });
    const nameEntry = TextEdit({ 'placeholder': 'name' });
    const telephoneEntry = TextEdit({ 'placeholder': 'telephone' });
    const idNumberEntry = TextEdit({ 'placeholder': 'id number' });
    const kraNumberEntry = TextEdit({ 'placeholder': 'KRA number' });
    const employmentDate = TextEdit({ 'type': 'date' });
    const homeAddressEntry = TextEdit({ 'placeholder': 'home address' });
    const positionEntry = TextEdit({ 'placeholder': 'position, e.g; gardener, cook' });
    const commentEntry = TextEdit({ 'placeholder': 'comment e.g. Asthmatic, no illness' });
    const genderEntry = MondoSelect({});
    const categoryPicker = MondoSelect({});
    const saveButton = Button({ 'text': 'submit' });

    genderEntry.innerHTML = `
        <option>MALE</option>
        <option>FEMALE</option>
        `;

    categoryPicker.innerHTML = `
        <option selected>${'ADMINISTRATIVE AND OFFICE STAFF'.toLowerCase()}</option>
        <option>support and operational staff</option>
    `

    const parent = VerticalScrollView({
        'styles': [{ 'padding': '20px' }],
        'classlist': ['f-a-w', 'f-w', 'a-c', 'just-center'],
        'children': [
            outstationPicker,
            Column({
                'children': [
                    MondoText({ 'text': 'employment date' })
                    , employmentDate,
                ]
            }),
            nameEntry,
            genderEntry,
            idNumberEntry,
            telephoneEntry,
            homeAddressEntry,
            kraNumberEntry,
            categoryPicker,
            positionEntry,
            commentEntry,
            Row({
                'classlist': ['f-a-w', 'f-w', 'a-c', 'just-center'],
                'children': [
                    saveButton
                ]
            })
        ]
    });

    saveButton.onclick = async function (ev) {
        ev.preventDefault();
        const outstation = JSON.parse(outstationPicker.value);
        try {
            TextEditValueValidator.validate('name', nameEntry);
            TextEditValueValidator.validate('gender', genderEntry);
            TextEditValueValidator.validate('ID number', idNumberEntry);
            TextEditValueValidator.validate('home address', homeAddressEntry);
            TextEditValueValidator.validate('position', positionEntry);
            TextEditValueValidator.validate('category', categoryPicker);
            TextEditValueValidator.validate('comment', commentEntry);

            const body = {
                'staff': {
                    'outstation_id': outstation['_id'],
                    'name': nameEntry.value,
                    'gender': genderEntry.value,
                    'id_number': idNumberEntry.value,
                    'telephone': telephoneEntry.value,
                    'kra_number': kraNumberEntry.value,
                    'category': categoryPicker.value,
                    'home_address': homeAddressEntry.value,
                    'position': positionEntry.value,
                    'comment': commentEntry.value,
                }
            }

            const result = await Post(
                '/parish/register/staff',
                body,
                { 'requiresParishDetails': true }
            );

            let msg = result['response'];
            MessegePopup.showMessegePuppy([MondoText({ 'text': msg })]);

            if (msg.match('success') || msg.match('save')) {
                clearTextEdits(
                    [
                        nameEntry,
                        idNumberEntry,
                        homeAddressEntry,
                        positionEntry,
                        commentEntry
                    ]
                )
                ParishDataHandle.parishStaff = await getParishStaff();
            }
        } catch (error) {
            MessegePopup.showMessegePuppy([MondoText({ 'text': error })]);
            throw error
        }
    }

    ModalExpertise.showModal({
        'actionHeading': 'staff registry',
        'fullScreen': false,
        'children': [parent],
    })
}

export function ViewParishStaffByOutsation() {
    const outstationPicker = OutstationPicker({ 'outstations': ParishDataHandle.parishOutstations });
    outstationPicker.addEventListener('change', setView);

    const table = domCreate('table');
    const tableId = 'staff-table';
    table.id = tableId;

    const tableHeader = domCreate('thead');
    const tbody = domCreate('tbody');
    const tfooter = domCreate('tfoot');

    tableHeader.innerHTML = `
    <tr>
    <td>NO</td>
    <td>NAME</td>
    <td>ID NUMBER</td>
    <td>POSITION</td>
    <td>TELEPHONE</td>
    <td>KRA NUMBER</td>
    <td>COMMENT</td>
    </tr>
    `

    const printButton = new PDFPrintButton(tableId)
    addChildrenToView(table, [tableHeader, tbody, tfooter]);

    function setView() {
        tbody.replaceChildren([]);

        const selectedOutstation = outstationPicker.value;

        let outstation = JSON.parse(selectedOutstation);
        let selectedOutstationId = outstation['_id'];
        PDFPrintButton.printingHeading = `${LocalStorageContract.completeParishName()} . ${outstation['name']} outstation staff`.toUpperCase()

        let filteredStaffByOutstation = ParishDataHandle.parishStaff.filter(function (staff) { return staff['outstation_id'] === selectedOutstationId; });

        for (let i = 0; i < filteredStaffByOutstation.length; i++) {
            const staff = filteredStaffByOutstation[i];
            const row = domCreate('tr');

            row.innerHTML = `
            <td>${i + 1}</td>
            <td>${staff['name']}</td>
            <td>${staff['id_number']}</td>
            <td>${staff['position']}</td>
            <td>${staff['telephone']}</td>
            <td>${staff['kra_number']}</td>
            <td>${staff['comment']}</td>
        `
            tbody.appendChild(row);
        }
    }

    setView();

    const parent = Column({
        'classlist': ['f-w', 'a-c'],
        'styles': [{ 'padding': '20px' }],
        'children': [
            HorizontalScrollView({
                'classlist': ['a-c', 'just-center'],
                'children': [table]
            })
        ]
    });

    ModalExpertise.showModal({
        'modalHeadingStyles': [{ 'background-color': '#002079' }, { 'color': 'white' }],
        'topRowStyles': [{ 'background-color': '#002079' }, { 'color': 'white' }],
        'actionHeading': 'parish staff',
        'topRowClasses': ['a-c'],
        'topRowUserActions': [outstationPicker, printButton],
        'children': [parent],
        'fullScreen': true
    })
}

export function ViewAllParishStaff() {
    const table = domCreate('table');
    const tableId = 'staff-table';
    table.id = tableId;

    const tableHeader = domCreate('thead');
    const tbody = domCreate('tbody');
    const tfooter = domCreate('tfoot');

    tableHeader.innerHTML = `
        <tr>
            <td>NO</td>
            <td>OUTSTATION</td>
            <td>NAME</td>
            <td>ID NUMBER</td>
            <td>POSITION</td>
            <td>TELEPHONE</td>
            <td>KRA NUMBER</td>
            <td>COMMENT</td>
        </tr>
            `

    const printButton = new PDFPrintButton(tableId)
    addChildrenToView(table, [tableHeader, tbody, tfooter]);


    function setView() {
        /**
         * @todo add the select option for staff by category
         */

        PDFPrintButton.printingHeading = `${LocalStorageContract.completeParishName()} staff`.toUpperCase();

        tbody.replaceChildren([]);
        for (let i = 0; i < ParishDataHandle.parishStaff.length; i++) {
            const staff = ParishDataHandle.parishStaff[i];
            const row = domCreate('tr');

            row.innerHTML = `
            <td>${i + 1}</td>
            <td>${getOutstationById(staff['outstation_id'])['name']}</td>
            <td>${staff['name']}</td>
            <td>${staff['id_number']}</td>
            <td>${staff['position']}</td>
            <td>${staff['telephone']}</td>
            <td>${staff['kra_number']}</td>
            <td>${staff['comment']}</td>
        `
            tbody.appendChild(row);
        }
    }

    setView();

    const parent = Column({
        'classlist': ['f-w', 'a-c'],
        'styles': [{ 'padding': '20px' }],
        'children': [
            HorizontalScrollView({
                'classlist': ['a-c', 'just-center'],
                'children': [table]
            })
        ]
    });

    ModalExpertise.showModal({
        'modalHeadingStyles': [{ 'background-color': '#002079' }, { 'color': 'white' }],
        'topRowStyles': [{ 'background-color': '#002079' }, { 'color': 'white' }],
        'actionHeading': 'parish staff',
        'topRowClasses': ['a-c'],
        'topRowUserActions': [printButton],
        'children': [parent],
        'fullScreen': true
    })
}