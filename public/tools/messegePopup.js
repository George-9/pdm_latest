import { CREATE_ELEMENT, GET_EL_BY_ID } from "./dom.js";

export class MessegePopup {
    static isShowingPopup = false;

    static ShowMessegePuppy(messege) {
        const popupDiv = CREATE_ELEMENT('div');

        if (MessegePopup.isShowingPopup) {
            removeMessegePuppy()
        }

        if (!messege) {
            console.log('invoking puppy without a messege');
            return;
        }

        const removeMessegePuppy = () => {
            document.body.removeChild(GET_EL_BY_ID('popup-puppy'))
        }

        popupDiv.id = 'popup-puppy';
        popupDiv.classList.add('flex-row', 'align-center', 'justify-center');
        popupDiv.style.borderRadius = '3px';
        popupDiv.style.marginBottom = '13px';
        popupDiv.style.width = '300px';
        popupDiv.style.height = '50px';
        popupDiv.style.zIndex = '300000000000';
        popupDiv.style.position = 'fixed';
        popupDiv.style.bottom = '0px';
        popupDiv.style.backgroundColor = 'black';
        popupDiv.style.color = 'white';
        popupDiv.style.padding = '5px';

        popupDiv.innerText = messege;
        popupDiv.style.right = `${parseFloat(popupDiv.clientWidth)}px`;

        MessegePopup.isShowingPopup = true;
        document.body.appendChild(popupDiv)

        setTimeout(() => {
            removeMessegePuppy();
            MessegePopup.isShowingPopup = false;
        }, 3000)
    }
}