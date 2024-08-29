import { ModalExpertise } from "./components/modal.js";
import { MondoText } from "./dom/components_granary.js";
import { domCreate } from "./dom/query.js";

document.addEventListener('DOMContentLoaded', Main);


function Main() {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        dateClick: function (info) {
            if (new Date(info.dateStr) < new Date(Date.UTC()) + 1) {
                return;
            }

            const infoText = MondoText('Hello');

            let par = domCreate('div');
            par.style.height = '400px'
            par.classList.add('f-h', 'scroll-y');
            par.innerHTML = `
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic sed exercitationem, voluptates facilis sint,
                officiis accusantium mollitia incidunt ducimus deleniti culpa quo nisi iure blanditiis atque id adipisci velit
                sapiente.</p>
        
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic sed exercitationem, voluptates facilis sint,
                officiis accusantium mollitia incidunt ducimus deleniti culpa quo nisi iure blanditiis atque id adipisci velit
                sapiente.</p>
        
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic sed exercitationem, voluptates facilis sint,
                officiis accusantium mollitia incidunt ducimus deleniti culpa quo nisi iure blanditiis atque id adipisci velit
                sapiente.</p>
        
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic sed exercitationem, voluptates facilis sint,
                officiis accusantium mollitia incidunt ducimus deleniti culpa quo nisi iure blanditiis atque id adipisci velit
                sapiente.</p>
            `
            infoText.appendChild(par);

            ModalExpertise.showModal({
                children: [infoText],
                // fullScreen: true,
                actionHeading: 'modal-regulation'
            });

        }
    });
    calendar.render();
}