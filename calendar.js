console.log("hi");

document.addEventListener("DOMContentLoaded", function() {
  // Tingle modal - generic generator code
  var modal = new tingle.modal({
    footer: true
  });

  // Creating a close button for any modal we create. Button text, css classes, logic on-click.
  modal.addFooterBtn(
    `<strong>Close</strong>`,
    "tingle-btn tingle-btn--primary tingle-btn--pull-right",
    function() {
      modal.close();
    }
  );

  var calendarEl = document.getElementById("calendar");

  var calendar = new FullCalendar.Calendar(calendarEl, {
    plugins: ["dayGrid", "googleCalendar", "list"],
    googleCalendarApiKey: "AIzaSyAm6_e7XOpN1lB0cSUA3Ij8vsPdHAfznoU",
    /* this is where we put all the source calendars information, as a series of objects */
    eventSources: [
      {
        googleCalendarId: "genre2mag@gmail.com",
        className: "rmc-student-events"
      }
    ],
    defaultView: "dayGridMonth",
    header: {
      left: "title,prev,next,today",
      center: "",
      right: "dayGridMonth,dayGridWeek,dayGridDay,listMonth"
    },
    /* What happens when someone clicks a particular event. In this case, open a modal with additional information about the event. */
    eventClick: function(info) {
      console.log(info.event);
      let theLocation, theDescription, theTitle;
      if (info.event.extendedProps.location) {
        theLocation = info.event.extendedProps.location;
      } else {
        theLocation = "";
      }
      if (info.event.title) {
        theTitle = info.event.title;
      } else {
        theTitle = "";
      }
      if (info.event.extendedProps.description) {
        theDescription = info.event.extendedProps.description;
      } else {
        theDescription = "";
      }
      let theURL = info.event.url;
      modal.setContent(
        `<h3>${
          info.event.title
        }</h3><p>${theLocation}</p><p>${theDescription}</p><p><a href="${theURL}" target="_blank">More Information</a></p>`
      );

      modal.open();

      info.jsEvent.preventDefault();
    }
  });

  calendar.render();
});

let theCalendar = document.getElementById("calendar");

// Hooking up with the buttons for toggling the display of different calendars
// let g2Toggle = document.getElementById("g2-toggle");

// // Okay, so this successfully removes/adds that class from the calendar but...nothing visibly changes
// g2Toggle.addEventListener("click", event => {
//   // console.log(theCalendar.classList)
//   // theCalendar.classList.toggle("rmc-student-events");
  
// });


//Well, this works with jquery...
$("#g2-toggle").click(function() {
  $(".rmc-student-events").toggle();
  console.log('hiiii')
  // $("#rmc-student-events").toggleClass('btn-primary btn-default');
});
 