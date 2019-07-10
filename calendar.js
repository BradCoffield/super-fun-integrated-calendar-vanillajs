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
    googleCalendarApiKey: "AIzaSyCqfo0l4nCGE2FLGgnXxKDv6SJVPLund4Q",
    // googleCalendarApiKey: "AIzaSyAm6_e7XOpN1lB0cSUA3Ij8vsPdHAfznoU", //g2
    /* this is where we put all the source calendars information, as a series of objects */
    eventSources: [
      {
        googleCalendarId: "rocky.edu_sakv6bmfg59lf2dp3a8ogj1608@group.calendar.google.com",
        className: "rmc-student-events"
      },
      {
        googleCalendarId:"rocky.edu_2gbenc7go3t1k90k0m3utq7g4o@group.calendar.google.com",
        className: "rmc-master-calendar"
      },
      {
        googleCalendarId:"rocky.edu_87pj63gjv6cri8t2glk5aa0t5o@group.calendar.google.com",
        className:"rmc-alumni-events"
      }
    ],
    defaultView: "dayGridMonth",
    header: {
      left: "title,prev,next,today",
      center: "",
      right: "dayGridMonth,dayGridWeek,dayGridDay,listMonth"
    },
    // TRYING CHECKBOX THINGS
    //   eventRender: function(event, element) {
    //     // Array that will store accepted classes
    //     var eventAcceptedClasses = [];
    //     if ($('.daytime-events-checkbox').is(':checked')){
    //         eventAcceptedClasses.push('daytime-events');
    //     }
    //     if ($('.nighttime-events-checkbox').is(':checked')){
    //         eventAcceptedClasses.push('nighttime-events');
    //     }
    //     displayEvent = false;
    //     event.className.forEach(function(element){
    //         if ($.inArray(element, eventAcceptedClasses) != -1){
    //             displayEvent = true;
    //         }
    //     });
    //     return displayEvent;
    // },
    eventRender: function(info) {
      let desiredViews = [];
      if ($("#rmc-student-events").is(":checked")) {
        desiredViews.push("rmc-student-events");
      }

      console.log(info.event.start);
      console.log(info.event.end);
      console.log("desiredviews", desiredViews[0]);
      if (info.el.className.includes(desiredViews[0])) return false;
    },
    /* What happens when someone clicks a particular event. In this case, open a modal with additional information about the event. */
    eventClick: function(info) {
      console.log(info.event);
      let theLocation, theDescription, theTitle, startTime, endTime;
      // A series of if statements to ensure that if an event doesn't have some particular info (like description or location) it doesn't get rendered as undefined
      if (info.event.extendedProps.location) {
        theLocation = `LOCATION: ${info.event.extendedProps.location}`
      } else {
        theLocation = "";
      }
      if (info.event.title) {
        theTitle = info.event.title.toUpperCase();
      } else {
        theTitle = "";
      }
      if (info.event.extendedProps.description) {
        theDescription = `DESCRIPTION: ${info.event.extendedProps.description}`;
      } else {
        theDescription = "";
      }
      //Don't need start/end times if it is an all day event
      if (info.event.start && info.event.allDay == false) {
        startTime = `TIME: ${info.event.start} - `;
      } else {
        startTime = "";
      }
      if (info.event.end && info.event.allDay == false) {
        endTime = info.event.end;
      } else endTime = "";
      let theURL = info.event.url;
      modal.setContent(
        `<h3>${
          theTitle
        }</h3><p>${startTime}${endTime}</p><p>${theLocation}</p><p>${theDescription}</p><p><a href="${theURL}" target="_blank">More Information</a></p>`
      );

      modal.open();

      info.jsEvent.preventDefault();
    }
  });

  calendar.render();
  $("input[class=event_filter_box]").change(function() {
    // $('#calendar').fullCalendar('rerenderEvents');
    calendar.rerenderEvents();
  });
});

//Well, this works with jquery...
$("#g2-toggle").click(function() {
  $(".rmc-student-events").toggle();
  console.log("hiiii");
});
