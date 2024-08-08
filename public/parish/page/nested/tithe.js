import { CREATE_ELEMENT, GET_EL_BY_ID } from "../../../tools/dom.js";
import { MessegePopup } from "../../../tools/messegePopup.js";
import { ModalExpertise } from "../../../tools/modal.js";
import { NetTool } from "../../../tools/netTool.js";
import { LocalStorageContract } from "../../../tools/storage.js";
import { IS_NULL_OR_EMPTY } from "../../../tools/stringUtils.js";


let agGridApi, selectedMemberNumber

function createTable(obj) {
    const div = CREATE_ELEMENT('div');
    div.id = 'member-card';
    div.style.height = '200px';
    div.style.paddingTop = '5px';
    div.classList.add('flex-column', 'full-height', 'full-width', 'align-center', 'justify-center', 'scroll-y');

    const table = document.createElement('table');
    table.style.textAlign = 'center';
    table.classList.add('full-width', 'full-height', 'scroll-y')
    table.style.borderCollapse = 'collapse';
    table.style.width = '70%';
    table.style.margin = '10px';

    const heading = document.createElement('caption');
    heading.style.fontWeight = 'bold';
    heading.style.marginBottom = '10px';
    table.appendChild(heading);

    for (const [key, value] of Object.entries(obj)) {
        if (key === '_id') {
            continue;
        }

        const row = document.createElement('tr');

        const keyCell = document.createElement('td');
        keyCell.textContent = key.toUpperCase();
        keyCell.style.border = '1px solid black';
        keyCell.style.padding = '8px';
        keyCell.style.textAlign = 'start';
        keyCell.style.fontWeight = 'bold';
        row.appendChild(keyCell);

        // Create the value cell
        const valueCell = document.createElement('td');
        valueCell.textContent = value.toString().toUpperCase();
        valueCell.style.border = '1px solid black';
        valueCell.style.textAlign = 'end';
        valueCell.style.padding = '8px';
        row.appendChild(valueCell);

        // Append the row to the table
        table.appendChild(row);
    }

    div.append(table)
    return div;
}


document.addEventListener('DOMContentLoaded', async (ev) => {
    ev.preventDefault();

    const records = await (await NetTool.POST_CLIENT('/parish/tithe/all/records',
        NetTool.CMMN_HEADERS.JSON_CONTENT_TYPE,
        JSON.stringify({ 'parish_id': LocalStorageContract.STORED_PARISH_ID() })
    )).json();

    const mainDiv = GET_EL_BY_ID('main-div');
    if (!records || records.length < 1) {
        mainDiv.style.textAlign = 'center';
        mainDiv.innerText = 'NO RECORDS FOUND';
    }
    else {
        const gridOptions = {
            columnDefs: [
                {
                    'field': 'date',
                    'headerCheckboxSelection': true,
                    'checkboxSelection': true,

                    'filter': 'agDateColumnFilter',
                    'cellEditor': 'datePicker'
                },
                {
                    'field': 'amount',
                },
                {
                    'field': 'member_no',
                    'checkboxSelection': true,
                    'editable': true,
                }
            ],
            defaultColDef: {
                filter: "agTextColumnFilter",
            },
            onRowDoubleClicked: (ev) => {
                const offeringRecord = ev.data;
                const offeringRecordViewTable = createTable(offeringRecord)
                const div = CREATE_ELEMENT('div')
                div.style.padding = '20px';
                div.classList.add('flex-column', 'full-width', 'full-height')

                const pdfPrintButton = CREATE_ELEMENT('img');
                pdfPrintButton.classList.add('icon')
                pdfPrintButton.src = '../../../resources/icons/pdf.png';
                pdfPrintButton.style.paddingRight = '10px';

                pdfPrintButton.onclick = (ev) => {
                    ev.preventDefault();

                    printJS({
                        printable: 'member-card',
                        type: 'html',
                        header: `<h3>${LocalStorageContract.STORED_PARISH_ID().toUpperCase()} PARISH</h3>`,
                        gridStyle: 'padding: 10px; width: 100%;'
                    })
                }

                for (const key in offeringRecord) {
                    if (Object.hasOwnProperty.call(offeringRecord, key)) {
                        if (key === '_id') {
                            continue
                        }

                        const value = ev.data[key];

                        const row = CREATE_ELEMENT('div')
                        row.classList.add('flex-row', 'align-center');
                        row.style.maxHeight = '50px';
                        row.style.border = '1px solid grey';
                        row.classList.add('flex-row');

                        const kView = CREATE_ELEMENT('h4');
                        kView.style.fontWeight = '300';
                        const valueView = CREATE_ELEMENT('h4');
                        valueView.style.fontWeight = '100';

                        kView.innerText = key.split('_').join(' ');
                        valueView.innerText = ": " + value;

                        row.append(kView, valueView);
                        div.appendChild(row);
                    }
                }

                ModalExpertise.ShowModal(`offering for date ${offeringRecord['date']}`, offeringRecordViewTable, {
                    'modalChildStylesClassList': [],
                    titleColor: 'black',
                    headingColor: '#efc9c9',
                    TopButton: pdfPrintButton,
                    topButtonToolip: 'Print Member Card'
                })
            },
            rowSelection: "multiple",
            suppressRowClickSelection: true,
            pagination: true,
            paginationPageSize: 100,
            paginationPageSizeSelector: [10, 50, 100],
            rowData: records
        }
        const gridDiv = document.querySelector("#myGrid");
        agGridApi = new agGrid.Grid(gridDiv, gridOptions);
    }

    const div = CREATE_ELEMENT('div');
    div.classList.add('flex-column', 'align-center');

    // creating/adding records

    const saveButton = CREATE_ELEMENT('button');
    saveButton.style.width = '100px';
    saveButton.style.backgroundColor = 'white';
    saveButton.style.color = 'grey';
    saveButton.innerText = 'save';

    const datePicker = CREATE_ELEMENT('input');
    datePicker.setAttribute('type', 'date');

    const memberQueryEditor = CREATE_ELEMENT('input');
    memberQueryEditor.id = 'name-search';
    memberQueryEditor.placeholder = 'member number';

    const amountEditor = CREATE_ELEMENT('input');
    amountEditor.setAttribute('keyboard', 'number');
    amountEditor.placeholder = 'amount in KSH';

    GET_EL_BY_ID('add-tithe-record').onclick = (_) => {
        ModalExpertise.ShowModal('offering records',
            div,
            {
                'headingColor': 'royalblue',
                'TopButton': saveButton,
                'topButtonToolip': 'save',
            })
    }

    div.append(memberQueryEditor, datePicker, amountEditor);
    saveButton.onclick = async (_) => {
        const details = {
            'parish_id': LocalStorageContract.STORED_PARISH_ID(),
            'date': datePicker.value,
            'member_no': memberQueryEditor.value,
            'amount': amountEditor.value
        };

        for (const key in details) {
            if (Object.prototype.hasOwnProperty.call(details, key)) {
                if (IS_NULL_OR_EMPTY(details[key])) {
                    return MessegePopup.ShowMessegePuppy('please enter ' + key + ' to save record')
                }
            }
        }

        const saveResult = await (await NetTool.POST_CLIENT(
            '/parish/add/tithe/record',
            NetTool.CMMN_HEADERS.JSON_CONTENT_TYPE,
            JSON.stringify(details)
        )).json();

        MessegePopup.ShowMessegePuppy(saveResult['response'])
    }
    debounceSearchMember(memberQueryEditor, div);
});


async function debounceSearchMember(input, div) {
    let debounceTimeout;


    if (!input) {
        resultElement.innerHTML = '';
        return;
    }

    // loadingElement.style.display = 'block';
    async function searchMember() {
        try {
            const response = await NetTool.POST_CLIENT('/parish/search/member',
                NetTool.CMMN_HEADERS.JSON_CONTENT_TYPE,
                JSON.stringify({
                    'parish_id': LocalStorageContract.STORED_PARISH_ID(),
                    'query': input.value,
                })
            );
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            console.log(data);

            try {
                div.removeChild(GET_EL_BY_ID('refresh'));
            } catch (err) {
                const resultListView = createListView(data, div);
                resultListView.id = 'refresh';
            }
            const resultListView = createListView(data, div);
            resultListView.id = 'refresh';

            div.appendChild(resultListView)
        } catch (error) {
            const resultElement = CREATE_ELEMENT('p');
            resultElement.innerHTML = `Error fetching data: ${error.message}`;
            div.appendChild(resultElement);
        }
    }

    function debounceSearch() {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(searchMember, 300);
    }

    input.addEventListener('input', debounceSearch);
}

function createListView(data, mainDiv) {
    const listView = document.createElement('div');
    listView.style.height = '300px';
    listView.style.minWidth = '300px';
    listView.style.overflowY = 'scroll';
    listView.style.border = '1px solid #ccc';
    listView.style.padding = '10px';

    data.forEach(selectedMember => {
        const div = CREATE_ELEMENT('div');

        div.onclick = () => {
            const viewDiv = CREATE_ELEMENT('div');
            viewDiv.classList.add('flex-column', 'align-center', 'justify-center');
            viewDiv.style.border = '1px solid';
            viewDiv.style.padding = '3px';
            viewDiv.style.minWidth = '300px';
            viewDiv.style.backgroundColor = 'pink';
            viewDiv.style.boxShadow = '1px 1px grey';
            viewDiv.style.borderRadius = '10px';

            selectedMemberNumber = selectedMember['NO']
            const selectedMemberNameViewer = CREATE_ELEMENT('p');
            selectedMemberNameViewer.innerText = 'selected member ' + selectedMember['NAME'];
            const selectedMemberNumberViewer = CREATE_ELEMENT('p');
            selectedMemberNumberViewer.innerText = 'selected member by NO: ' + selectedMemberNumber;
            listView.style.display = 'none';
            viewDiv.append(selectedMemberNumberViewer, selectedMemberNameViewer)
            mainDiv.appendChild(viewDiv)
        }

        div.style.padding = '3px';
        div.style.cursor = 'pointer';
        div.style.backgroundColor = 'mediumpurple';
        div.style.maxHeight = '100px';
        div.style.borderBottom = '1px solid';

        const nameElement = document.createElement('p');
        nameElement.style.fontSize = '13px';
        nameElement.style.fontWeight = '100';
        nameElement.textContent = selectedMember['NAME'];

        const noElement = document.createElement('p');
        noElement.textContent = 'Member Number:' + selectedMember['NO'] ?? "not set";
        noElement.style.fontSize = '0.9em';
        noElement.style.color = 'white';

        if (selectedMember['NO']) {
            div.appendChild(noElement);
        }
        div.appendChild(nameElement);
        listView.appendChild(div);
    });

    return listView;
}
