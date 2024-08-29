import { Column, Row, MondoText } from "../dom/components_granary.js";
import { domCreate, domQueryById } from "../dom/query.js";

export class ModalExpertise {
    static modalIsShowing = false;
    static modalElId = 'modal-component';

    constructor() { }

    static async showModal({ actionHeading = '', children = [], fullScreen = false }) {
        let modalCloseEl = domCreate('i');
        modalCloseEl.classList.add('bi', 'bi-x', 'fx-col', 'a-c', 'just-center');
        modalCloseEl.style.color = 'black';
        modalCloseEl.onclick = ModalExpertise.#hideModal;

        var modalChildHeading = await MondoText({
            text: actionHeading || '',
            styles: [{ 'fontSize': '32px', 'font-weight': '900' }]
        });

        var modalHeader = Row({
            'classes': ['f-w', 'space-between'],
            'children': [
                modalChildHeading,
                modalCloseEl
            ]
        });

        modalHeader.style.padding = '17px';
        modalHeader.style.borderBottom = '1px solid grey';

        var modalChild = Column({
            'children': [modalHeader, ...children],
            'classes': [
                ...((fullScreen && fullScreen === true)
                    ? ['f-w', 'f-h']
                    : ['not-full-screen-modal-child']),

                'modal-child'
            ]
        });

        if (fullScreen && fullScreen === true) {

        }

        var modal = Column({
            'classes': ['modal', ...(fullScreen && fullScreen === true ? ['a-c', 'just-center'] : ['md'])],
            'children': [modalChild]
        });
        modal.id = ModalExpertise.modalElId;
        modal.style.zIndex = '100';

        if (ModalExpertise.modalIsShowing) {
            ModalExpertise.#hideModal()
        } else {
            document.body.appendChild(modal)
            ModalExpertise.modalIsShowing = true;
        }
    }

    static #hideModal() {
        const modal = domQueryById(ModalExpertise.modalElId);
        if (modal) {
            document.body.removeChild(modal);
            ModalExpertise.modalIsShowing = false;
        }
    }
}