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
                const outstationView = createEditableTable(outstationData);
                mainDiv.appendChild(outstationView);
            }
            console.log('done');
        })
})


// function createEditableTable(obj) {
//     const div = CREATE_ELEMENT('div')
//     div.classList.add('flex-column', 'full-width', 'align-center')

//     // Create the table element
//     const table = document.createElement('table');
//     table.style.borderCollapse = 'collapse';
//     table.style.backgroundColor = 'gainsboro';
//     table.style.width = '100%';
//     table.style.margin = '20px 0';

//     // Create the table heading
//     const heading = document.createElement('caption');
//     heading.textContent = `${obj.name}`;
//     heading.style.fontWeight = 'bold';
//     heading.style.marginBottom = '10px';
//     table.appendChild(heading);

//     // Function to add a new row for a smallchristiancommunitie
//     function addsmallchristiancommunitieRow(smallchristiancommunity, index) {
//         const row = document.createElement('tr');

//         const numberCell = document.createElement('td');
//         numberCell.textContent = index + 1;
//         numberCell.style.border = '1px solid black';
//         numberCell.style.padding = '4px';
//         numberCell.style.width = '1%';
//         row.appendChild(numberCell);

//         const nameCell = document.createElement('td');
//         const nameInput = document.createElement('input');
//         nameInput.type = 'text';
//         nameInput.value = smallchristiancommunity;
//         nameInput.style.border = 'none';
//         nameInput.style.width = '80%';
//         nameCell.appendChild(nameInput);
//         nameCell.style.border = '1px solid black';
//         nameCell.style.padding = '4px';
//         row.appendChild(nameCell);

//         table.appendChild(row);
//     }

//     // Iterate over the smallchristiancommunities array
//     obj.smallchristiancommunities.forEach((smallchristiancommunity, index) => {
//         addsmallchristiancommunitieRow(smallchristiancommunity, index);
//     });

//     // Create the add smallchristiancommunitie button
//     const addButton = document.createElement('button');
//     addButton.textContent = 'Add a smallchristiancommunity';
//     addButton.style.marginTop = '10px';
//     addButton.onclick = () => {
//         obj.smallchristiancommunities.push(`smallchristiancommunitie${obj.smallchristiancommunities.length + 1}`);
//         addsmallchristiancommunitieRow(`smallchristiancommunitie${obj.smallchristiancommunities.length}`, obj.smallchristiancommunities.length - 1);
//     };

//     // Create the save changes button
//     const saveButton = document.createElement('button');
//     saveButton.textContent = 'Save Changes';
//     saveButton.style.marginTop = '10px';
//     saveButton.onclick = async () => {
//         obj.smallchristiancommunities = Array.from(table.querySelectorAll('input')).map(input => input.value);
//         const body = JSON.stringify({
//             'parish_id': LocalStorageContract.STORED_PARISH_ID(),
//             'id': obj['_id'],
//             sccs: obj.smallchristiancommunities,
//         })
//         let result = await NetTool.POST_CLIENT('/update/outstation', NetTool.CMMN_HEADERS.JSON_CONTENT_TYPE, body);
//         MessegePopup.ShowMessegePuppy((await result.json())['response'])
//     };

//     const actionsRow = CREATE_ELEMENT('div');
//     actionsRow.classList.add('flex-row', 'full-width', 'align-end')
//     actionsRow.append(addButton, saveButton);

//     div.append(table, actionsRow)

//     return div;
// }
// function createEditableTable(obj) {
//     // Create the parent div
//     const parentDiv = document.createElement('div');

//     // Create the table element
//     const table = document.createElement('table');
//     table.style.borderCollapse = 'collapse';
//     table.style.width = '50%';
//     table.style.margin = '20px 0';

//     // Create the table heading
//     const heading = document.createElement('caption');
//     heading.textContent = `Table Heading is person[${obj.NAME}]`;
//     heading.style.fontWeight = 'bold';
//     heading.style.marginBottom = '10px';
//     table.appendChild(heading);

//     // Function to add a new row for a friend
//     function addFriendRow(friend, index) {
//         const row = document.createElement('tr');

//         const numberCell = document.createElement('td');
//         numberCell.textContent = index + 1;
//         numberCell.style.border = '1px solid black';
//         numberCell.style.padding = '8px';
//         row.appendChild(numberCell);

//         const nameCell = document.createElement('td');
//         const nameInput = document.createElement('input');
//         nameInput.type = 'text';
//         nameInput.value = friend;
//         nameInput.style.border = 'none';
//         nameInput.style.width = '100%';
//         nameCell.appendChild(nameInput);
//         nameCell.style.border = '1px solid black';
//         nameCell.style.padding = '8px';
//         row.appendChild(nameCell);

//         const removeCell = document.createElement('td');
//         const removeButton = document.createElement('button');
//         removeButton.textContent = 'Remove';
//         removeButton.onclick = () => {
//             const removedFriend = nameInput.value;
//             obj.smallchristiancommunities.splice(index, 1);
//             table.removeChild(row);
//             console.log('Removed friend:', removedFriend);
//             updateTable();
//         };
//         removeCell.appendChild(removeButton);
//         removeCell.style.border = '1px solid black';
//         removeCell.style.padding = '8px';
//         row.appendChild(removeCell);

//         // Insert the row before the buttons row
//         table.insertBefore(row, buttonsRow);
//     }

//     // Function to update the table
//     function updateTable() {
//         // Remove all rows except the heading and buttons row
//         while (table.rows.length > 2) {
//             table.deleteRow(1);
//         }
//         // Re-add all smallchristiancommunities
//         obj.smallchristiancommunities.forEach((friend, index) => {
//             addFriendRow(friend, index);
//         });
//     }

//     // Create a row for the buttons
//     const buttonsRow = document.createElement('div');
//     buttonsRow.style.display = 'flex';
//     buttonsRow.style.justifyContent = 'center';
//     buttonsRow.style.marginTop = '10px';

//     // Create the add friend button
//     const addButton = document.createElement('button');
//     addButton.textContent = 'Add Friend';
//     addButton.style.marginRight = '10px';
//     addButton.onclick = () => {
//         const newFriend = `Friend${obj.smallchristiancommunities.length + 1}`;
//         obj.smallchristiancommunities.push(newFriend);
//         addFriendRow(newFriend, obj.smallchristiancommunities.length - 1);
//     };

//     // Create the save changes button
//     const saveButton = document.createElement('button');
//     saveButton.textContent = 'Save Changes';
//     saveButton.onclick = () => {
//         obj.smallchristiancommunities = Array.from(table.querySelectorAll('input')).map(input => input.value);
//         console.log('Updated smallchristiancommunities:', obj.smallchristiancommunities);
//     };

//     // Append the buttons to the buttons row
//     buttonsRow.appendChild(addButton);
//     buttonsRow.appendChild(saveButton);

//     // Append the table and buttons row to the parent div
//     parentDiv.appendChild(table);
//     parentDiv.appendChild(buttonsRow);

//     // Initial table population
//     updateTable();

//     // Return the parent div
//     return parentDiv;
// }

// function createEditableTable(obj) {
//     // Create the parent div
//     const parentDiv = document.createElement('div');

//     // Create the table element
//     const table = document.createElement('table');
//     table.style.borderCollapse = 'collapse';
//     table.style.width = '50%';
//     table.style.margin = '20px 0';

//     // Create the table heading
//     const heading = document.createElement('caption');
//     heading.textContent = `Table Heading is person[${obj.NAME}]`;
//     heading.style.fontWeight = 'bold';
//     heading.style.marginBottom = '10px';
//     table.appendChild(heading);

//     // Function to add a new row for a friend
//     function addFriendRow(friend, index) {
//         const row = document.createElement('tr');

//         const numberCell = document.createElement('td');
//         numberCell.textContent = index + 1;
//         numberCell.style.border = '1px solid black';
//         numberCell.style.padding = '8px';
//         row.appendChild(numberCell);

//         const nameCell = document.createElement('td');
//         const nameInput = document.createElement('input');
//         nameInput.type = 'text';
//         nameInput.value = friend;
//         nameInput.style.border = 'none';
//         nameInput.style.width = '100%';
//         nameCell.appendChild(nameInput);
//         nameCell.style.border = '1px solid black';
//         nameCell.style.padding = '8px';
//         row.appendChild(nameCell);

//         const removeCell = document.createElement('td');
//         const removeButton = document.createElement('button');
//         removeButton.textContent = 'Remove';
//         removeButton.onclick = () => {
//             const removedFriend = nameInput.value;
//             obj.smallchristiancommunities.splice(index, 1);
//             table.removeChild(row);
//             console.log('Removed friend:', removedFriend);
//             updateTable();
//         };
//         removeCell.appendChild(removeButton);
//         removeCell.style.border = '1px solid black';
//         removeCell.style.padding = '8px';
//         row.appendChild(removeCell);

//         // Insert the row before the buttons row
//         table.insertRow(row);
//     }

//     // Function to update the table
//     function updateTable() {
//         // Remove all rows except the heading and buttons row
//         while (table.rows.length > 2) {
//             table.deleteRow(1);
//         }
//         // Re-add all smallchristiancommunities
//         obj.smallchristiancommunities.forEach((friend, index) => {
//             addFriendRow(friend, index);
//         });
//     }

//     // Create a row for the buttons
//     const buttonsRow = document.createElement('div');
//     buttonsRow.style.display = 'flex';
//     buttonsRow.style.justifyContent = 'center';
//     buttonsRow.style.marginTop = '10px';

//     // Create the add friend button
//     const addButton = document.createElement('button');
//     addButton.textContent = 'Add Friend';
//     addButton.style.marginRight = '10px';
//     addButton.onclick = () => {
//         const newFriend = `Friend${obj.smallchristiancommunities.length + 1}`;
//         obj.smallchristiancommunities.push(newFriend);
//         addFriendRow(newFriend, obj.smallchristiancommunities.length - 1);
//     };

//     // Create the save changes button
//     const saveButton = document.createElement('button');
//     saveButton.textContent = 'Save Changes';
//     saveButton.onclick = () => {
//         obj.smallchristiancommunities = Array.from(table.querySelectorAll('input')).map(input => input.value);
//         console.log('Updated smallchristiancommunities:', obj.smallchristiancommunities);
//     };

//     // Append the buttons to the buttons row
//     buttonsRow.appendChild(addButton);
//     buttonsRow.appendChild(saveButton);

//     // Append the table and buttons row to the parent div
//     parentDiv.appendChild(table);
//     parentDiv.appendChild(buttonsRow);

//     // Initial table population
//     updateTable();

//     // Return the parent div
//     return parentDiv;
// }

function createEditableTable(obj) {
    // Create the parent div
    const parentDiv = document.createElement('div');
    // parentDiv.style.backgroundColor = 'gainsboro'

    // Create the table element
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.width = '80%';
    table.style.margin = '20px 0';

    // Create the table heading
    const heading = document.createElement('caption');
    heading.textContent = `${obj['name']}`;
    heading.style.padding = '10px';
    heading.style.fontWeight = 'bold';
    heading.style.marginBottom = '10px';
    table.appendChild(heading);

    // Function to add a new row for a friend
    function addFriendRow(friend, index) {
        const row = document.createElement('tr');

        const numberCell = document.createElement('td');
        numberCell.textContent = index + 1;
        numberCell.style.border = '1px solid black';
        numberCell.style.padding = '3px';
        numberCell.style.width = '1%';
        row.appendChild(numberCell);

        const nameCell = document.createElement('td');
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = friend;
        nameInput.style.border = 'none';
        nameInput.style.width = '80%';
        nameCell.appendChild(nameInput);
        nameCell.style.border = '1px solid black';
        nameCell.style.padding = '3px';
        row.appendChild(nameCell);

        const removeCell = document.createElement('td');
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.onclick = () => {
            const removedFriend = nameInput.value;
            obj.smallchristiancommunities.splice(index, 1);
            table.removeChild(row);
            console.log('Removed friend:', removedFriend);
            updateTable();
        };
        removeCell.appendChild(removeButton);
        removeCell.style.border = '1px solid black';
        removeCell.style.padding = '8px';
        row.appendChild(removeCell);

        // Append the row to the table
        table.appendChild(row);
    }

    // Function to update the table
    function updateTable() {
        // Remove all rows except the heading
        while (table.rows.length > 1) {
            table.deleteRow(1);
        }
        // Re-add all smallchristiancommunities
        obj.smallchristiancommunities.forEach((friend, index) => {
            addFriendRow(friend, index);
        });
    }

    // Create a row for the buttons
    const buttonsRow = document.createElement('div');
    buttonsRow.style.display = 'flex';
    buttonsRow.style.justifyContent = 'center';
    buttonsRow.style.marginTop = '10px';

    // Create the add friend button
    const addButton = document.createElement('button');
    addButton.textContent = 'Add SCC';
    addButton.style.marginRight = '10px';
    addButton.onclick = () => {
        const newFriend = `Friend${obj.smallchristiancommunities.length + 1}`;
        obj.smallchristiancommunities.push(newFriend);
        addFriendRow(newFriend, obj.smallchristiancommunities.length - 1);
    };

    // Create the save changes button
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save Changes';
    saveButton.onclick = () => {
        obj.smallchristiancommunities = Array.from(table.querySelectorAll('input')).map(input => input.value);
        console.log('Updated smallchristiancommunities:', obj.smallchristiancommunities);
    };

    // Append the buttons to the buttons row
    buttonsRow.appendChild(addButton);
    buttonsRow.appendChild(saveButton);

    // Append the table and buttons row to the parent div
    parentDiv.appendChild(table);
    parentDiv.appendChild(buttonsRow);

    // Initial table population
    updateTable();

    // Return the parent div
    return parentDiv;
}

