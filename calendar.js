console.log("hi");

document.addEventListener("DOMContentLoaded", function() {
  var calendarEl = document.getElementById("calendar");

  var calendar = new FullCalendar.Calendar(calendarEl, {
    plugins: ["dayGrid", "googleCalendar"],
    googleCalendarApiKey: "AIzaSyAm6_e7XOpN1lB0cSUA3Ij8vsPdHAfznoU",
    eventSources: [
      {
        googleCalendarId: "genre2mag@gmail.com",
        className: "rmc-student-events"
      }
    ],
    defaultView: "dayGridMonth",
    header: {
      left: "prev,next,today",
      center: "title",
      right: "dayGridMonth,dayGridWeek,dayGridDay"
    },
    eventClick: function(info) {
      console.log(info.event.extendedProps.description)
      let theLocation, theDescription, theTitle;
      if (info.event.extendedProps.location) {theLocation = info.event.extendedProps.location} else {theLocation = ""}
      if (info.event.title) {theTitle = info.event.title} else {theTitle = ""}
     if (info.event.extendedProps.description) {theDescription = info.event.extendedProps.description} else {theDescription = ""}

      /*Open Sweet Alert*/
          swal({
            title: theTitle,//Event Title
              text: `<strong>${theLocation}</strong>`,
              
            
            // text: "Start From : "+moment(calEvent.start).format("MMMM Do YYYY, h:mm a"),//Event Start Date
            icon: "success",
          });
          info.jsEvent.preventDefault();
      }
    // eventClick: function(info) {
    //   console.log(info)
    //   alert("Event: " + info.event.title);
    //   alert("Coordinates: " + info.jsEvent.pageX + "," + info.jsEvent.pageY);
    //   alert("View: " + info.view.type);
    //   info.jsEvent.preventDefault();
    //   // change the border color just for fun
    //   info.el.style.borderColor = "red";
    // }
  });

  calendar.render();
});
//   ok, so dayGridDay and dayGridWeek as default views show the by week and by day that I want. Just need to make them accessible from buttons.

