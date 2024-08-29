import { domCreate, domQueryById } from "../../dom/query.js";
import { Column } from "../UI/column.js";
import { MondoText } from "../UI/mondo_text.js";
import { Row } from "../UI/row.js";

export class ModalExpertise {
    static modalIsShowing = false;
    static modalElId = 'modal-component';
    dismisible = true;

    constructor() { this.dismisible = true; }

    static async showModal({
        actionHeading = '',
        topRowUserActions = [],
        children = [],
        fullScreen = false,
        modalChildStyles = [],
        dismisible = true
    }) {

        this.dismisible = dismisible;

        let modalCloseEl = domCreate('i');
        modalCloseEl.classList.add('bi', 'bi-x', 'fx-col', 'a-c', 'just-center');
        modalCloseEl.title = 'close';
        modalCloseEl.style.color = 'black';
        modalCloseEl.onclick = ModalExpertise.#hideModal;

        var modalChildHeading = MondoText({
            text: actionHeading || '',
            styles: [{ 'fontSize': '32px', 'font-weight': '900' }]
        });

        const modalHeaderTopRow = Row({
            children: [modalChildHeading, modalCloseEl],
            'classlist': ['f-w', 'space-between', 'a-e', 'm-pad', 'border-bottom']
        });

        const userActionsRow = Row({
            'children': topRowUserActions,
            'classlist': ['f-w', 'a-e', 'just-end', 'm-pad', 'border-bottom']
        });

        var modalHeader = Column({
            'classlist': ['f-w', 'space-between'],
            'children': [
                modalHeaderTopRow,
                (topRowUserActions && topRowUserActions.length && topRowUserActions.length > 0)
                    ? userActionsRow
                    : ''
            ]
        });

        modalHeader.classList.add('h-fit-content');

        var modalChild = Column({
            'children': [modalHeader, ...children],
            'classlist': [
                ...((fullScreen && fullScreen === true)
                    ? ['f-w', 'f-h']
                    : ['not-full-screen-modal-child']),

                'modal-child'
            ]
        });

        if (modalChildStyles && modalChildStyles.length && modalChildStyles.length > 0) {
            for (let i = 0; i < modalChildStyles.length; i++) {
                const style = modalChildStyles[i];
                const styleProperty = Object.keys(style)[0];

                if ((fullScreen && fullScreen === true) && (styleProperty.match('width') || styleProperty.match('height'))) {
                    continue;
                }

                modalChild.style[styleProperty] = style[styleProperty];
            }
        }

        var modal = Column({
            'classlist': [
                'modal',
                ...(fullScreen && fullScreen === true
                    ? ['a-c', 'just-center']
                    : ['md']
                )
            ],
            'children': [modalChild]
        });

        modal.onclick = function (ev) {
            ev.preventDefault();

            if (this.dismisible === true) {
                if (ev.target && ev.target === modal) {
                    ModalExpertise.#hideModal()
                }
            }
        }

        if (!fullScreen || !(fullScreen === true)) {
            modal.style.justifyContent = 'center';
            modal.style.alignItems = 'center';
        }

        modal.id = ModalExpertise.modalElId;
        modal.style.zIndex = '100';

        if (ModalExpertise.modalIsShowing) {
            ModalExpertise.#hideModal()
        } else {
            document.body.appendChild(modal)
            ModalExpertise.modalIsShowing = true;

            window.addEventListener('keydown', function (ev) {
                switch (ev.key) {
                    case 'Escape':
                        if (dismisible && dismisible === true) {
                            ModalExpertise.#hideModal();
                            console.log('Escape');
                        }
                        break;

                    default:
                        break;
                }
            });
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