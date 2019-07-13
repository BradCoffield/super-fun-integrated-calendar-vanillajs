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
        googleCalendarId:
          "rocky.edu_sakv6bmfg59lf2dp3a8ogj1608@group.calendar.google.com",
        className: "rmc-student-events"
      },
      {
        googleCalendarId:
          "rocky.edu_2gbenc7go3t1k90k0m3utq7g4o@group.calendar.google.com",
        className: "rmc-master-calendar"
      },
      {
        googleCalendarId:
          "rocky.edu_87pj63gjv6cri8t2glk5aa0t5o@group.calendar.google.com",
        className: "rmc-alumni-events"
      }
    ],
    defaultView: "dayGridMonth",
    header: {
      left: "",
      center: "title"
      // right: "dayGridMonth,dayGridWeek,dayGridDay,listWeek"
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
      if ($("#rmc-master-calendar").is(":checked")) {
        desiredViews.push("rmc-master-calendar");
      }
      if ($("#rmc-alumni-events").is(":checked")) {
        desiredViews.push("rmc-alumni-events");
      }

      // console.log(info.el.className);
      let theClassNames = info.el.className;
      // console.log(theClassNames);
      const found = desiredViews.some(r => theClassNames.includes(r));
      // console.log(found);
      return found;
      // const found = info.el.className.some(r=> desiredViews.includes(r))
      // console.log(found);
      // if (info.el.classname.some(r=> desiredViews.includes(r))) {return true} else return false
      // if (info.el.className.includes(desiredViews[0])) return false;
    },
    /* What happens when someone clicks a particular event. In this case, open a modal with additional information about the event. */
    eventClick: function(info) {
      console.log(info.event);
      let theLocation, theDescription, theTitle, startTime, endTime;
      // A series of if statements to ensure that if an event doesn't have some particular info (like description or location) it doesn't get rendered as undefined
      if (info.event.extendedProps.location) {
        theLocation = `LOCATION: ${info.event.extendedProps.location}`;
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
        `<h3>${theTitle}</h3><p>${startTime}${endTime}</p><p>${theLocation}</p><p>${theDescription}</p><p><a href="${theURL}" target="_blank">More Information</a></p>`
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

  //stuff for the changing of the view buttons
  let currentView = calendar.view.view.type;
  let oldView = "";

  $("#cal-month").click(function() {
    $("#cal-month").addClass("active");
    removeClass(calendar.view.view.type);
    oldView = calendar.view.view.type;
    calendar.changeView("dayGridMonth");
    console.log(calendar.view.view.type);
    currentView = calendar.view.view.type;
  });

  $("#cal-week").click(function() {
    $("#cal-week").addClass("active");
    removeClass(calendar.view.view.type);
    oldView = calendar.view.view.type;
    calendar.changeView("dayGridWeek");
    console.log(calendar.view.view.type);
    currentView = calendar.view.view.type;
  });

  $("#cal-day").click(function() {
    $("#cal-day").addClass("active");
    removeClass(calendar.view.view.type);
    oldView = calendar.view.view.type;
    calendar.changeView("dayGrid");
    console.log(calendar.view.view.type);
    currentView = calendar.view.view.type;
  });

  $("#cal-list").click(function() {
    $("#cal-list").addClass("active");
    removeClass(calendar.view.view.type);
    calendar.changeView("listWeek");
    console.log(calendar.view.view.type);
    currentView = calendar.view.view.type;
  });

  let removeClass = vieww => {
    console.log(vieww);
    whatToRemove = "";
    if (vieww == "dayGridMonth") {
      whatToRemove = "#cal-month";
    }
    if (vieww == "dayGridWeek") {
      whatToRemove = "#cal-week";
    }
    if (vieww == "dayGrid") {
      whatToRemove = "#cal-day";
    }
    if (vieww == "listWeek") {
      whatToRemove = "#cal-list";
    }
    $(whatToRemove).removeClass("active");
  };
});
