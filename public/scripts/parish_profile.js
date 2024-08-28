
document.addEventListener('DOMContentLoaded', Main);


function Main() {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        dateClick: function (info) {
            if (new Date(info.dateStr) < new Date(Date.UTC()) + 1) {
                return;
            }

            InvokeAddEvent(info.dateStr);
        }
    });
    calendar.render();
}