import { CREATE_ELEMENT, GET_EL_BY_ID } from "./dom.js";



export class ModalExpertise {

    static onModalDismiss

    static ShowModal(modalTitle, view, {
        modalChildStylesClassList,
        onDisMiss,
        onClickModalChild,
        titleColor,
        headingColor,
        TopButton: topButton,
        topButtonToolip,
    }) {
        if (!view) {
            return alert('modal requested without view');
        }

        if (onDisMiss) {
            ModalExpertise.onModalDismiss = onDisMiss;
        }

        view.classList.add('flex-col', 'scroll-y', 'full-width', 'full-height')

        const modal = CREATE_ELEMENT('div');
        modal.id = 'modal';
        modal.classList.add('modal', 'flex-column', 'full-width', 'full-height', 'align-center', 'justify-center');

        modal.onclick = (ev) => {
            if (ev.target === modal) {
                ModalExpertise.HideModal()
            }
        }

        const modalHeader = CREATE_ELEMENT('div');
        modalHeader.classList.add('full-width', 'flex-row', 'align-center', 'justify-space-between');
        modalHeader.style.marginBottom = '5px';
        modalHeader.style.paddingRight = '15px';
        modalHeader.style.backgroundColor = headingColor ?? 'royalblue';

        const actionsDiv = CREATE_ELEMENT('div');
        actionsDiv.style.flex = '2'
        actionsDiv.classList.add('flex-row', 'align-center', 'justify-space-around');

        /**
         * Title for main action invoked for modal
         * for example;
         * ```js
         * ModalExpert.ShowModal('OpenCamera', ...)
         * ```
        */
        const modalTitleView = CREATE_ELEMENT('h1');
        modalTitleView.style.fontWeight = '300';
        modalTitleView.style.flex = '13'
        modalTitleView.style.paddingLeft = '10px';
        modalTitleView.style.paddingRight = '10px';
        modalTitleView.style.color = titleColor ?? 'white';
        modalTitleView.innerText = modalTitle;

        /**
         * make resusable
        */
        const closeElement = CREATE_ELEMENT('h3');
        closeElement.innerText = 'X';
        closeElement.title = 'close';
        closeElement.style.cursor = 'pointer';
        closeElement.style.color = 'black';
        closeElement.style.padding = '5px';
        closeElement.style.fontSize = '20px';

        closeElement.onclick = (ev) => {
            ev.preventDefault();
            ModalExpertise.HideModal();
        }



        /**
         * fill modal top view (header)
         */
        actionsDiv.appendChild(closeElement);
        modalHeader.append(modalTitleView, actionsDiv);
        if (topButton) {
            if (topButtonToolip) {
                topButton.title = topButtonToolip;
            }
            actionsDiv.insertBefore(topButton, closeElement);
        }


        const modalChild = CREATE_ELEMENT('div');
        modalChild.classList.add('modal-child');
        if (modalChildStylesClassList) {
            modalChild.classList.add(...modalChildStylesClassList);
        }
        modalChild.append(modalHeader, view);
        if (typeof (onClickModalChild) === 'function') {
            modalChild.onclick = onClickModalChild
        }

        modal.append(modalChild);

        document.body.appendChild(modal);
    }


    static HideModal() {
        const modal = GET_EL_BY_ID('modal');
        if (modal) {
            document.body.removeChild(modal);
            if (typeof (ModalExpertise.onModalDismiss) === 'function') {
                ModalExpertise.onModalDismiss()
            }
        }
    }
}