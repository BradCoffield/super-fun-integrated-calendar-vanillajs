console.log('hi')

document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
      plugins: [ 'dayGrid', 'googleCalendar' ],
      googleCalendarApiKey: 'AIzaSyAm6_e7XOpN1lB0cSUA3Ij8vsPdHAfznoU',
      eventSources: [
        {
            googleCalendarId: 'genre2mag@gmail.com',
            className: 'rmc-student-events'
        }
        
],defaultView: 'dayGridMonth',
header: {
    left: 'prev,next,today',
    center: 'title',
    right: 'dayGridMonth,dayGridWeek,dayGridDay'
  },
    });

    calendar.render();
  });
//   ok, so dayGridDay and dayGridWeek as default views show the by week and by day that I want. Just need to make them accessible from buttons.