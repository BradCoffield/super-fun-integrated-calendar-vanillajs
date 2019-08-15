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

  //This line drives what calendars are displayed, tied into eventRender method and a watcher for the buttons. Should start with all that want displayed on-load
  //the strings here correspond to the className given to the calendar source in eventSources
  desiredViews = [
    "rmc-student-events",
    "rmc-alumni-events",
    "rmc-master-calendar",
    "rmc-athletics"
  ];
  console.log(desiredViews);

  var calendarEl = document.getElementById("calendar");

  var calendar = new FullCalendar.Calendar(calendarEl, {
    plugins: ["dayGrid", "googleCalendar", "list", "momentPlugin"],

    // titleFormat: '{MMMM {D}}, YYYY',
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
          "r1a42hmoaun7m0oplppkhkmrpj4m7jmd@import.calendar.google.com",
        className: "rmc-athletics"
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
    nowIndicator: true,
    header: {
      left: "",
      center: "title"
      // right: "dayGridMonth,dayGridWeek,dayGridDay,listWeek"
    },

    eventRender: function(info) {
      // if ($("#rmc-student-events").is(":checked")) {
      //   desiredViews.push("rmc-student-events");
      // }
      // if ($("#rmc-master-calendar").is(":checked")) {
      //   desiredViews.push("rmc-master-calendar");
      // }
      // if ($("#rmc-alumni-events").is(":checked")) {
      //   desiredViews.push("rmc-alumni-events");
      // }

      // console.log(info.el.className);
      let theClassNames = info.el.className;
      // console.log(theClassNames);
      const found = desiredViews.some(r => theClassNames.includes(r));
      // const found = desiredViews;
      console.log(found);
      return found;
      // const found = info.el.className.some(r=> desiredViews.includes(r))
      // console.log(found);
      // if (info.el.classname.some(r=> desiredViews.includes(r))) {return true} else return false
      // if (info.el.className.includes(desiredViews[0])) return false;
    },

    /* What happens when someone clicks a particular event. In this case, open a modal with additional information about the event. */
    // The modal is using TingleJS
    eventClick: function(info) {
      let timeConvert = arg => {
        let m = FullCalendarMoment.toMoment(arg, calendar);
        console.log("Converte!", m.format("HH:mmA"));
        return m.format("ddd, MMM Do h:mmA");
      };
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
        startTime = `TIME: ${timeConvert(info.event.start)} - `;
      } else {
        startTime = "";
      }
      if (info.event.end && info.event.allDay == false) {
        endTime = `${timeConvert(info.event.end)}`;
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

  //checking for small screen on load and serving list if small and month otherwise
  if (window.innerWidth >= 768) {
    calendar.changeView("dayGridMonth");
  } else {
    calendar.changeView("listMonth");
    $("#cal-list").addClass("active");
  }

  //calendar source buttons
  $("#rmc-master-calendar-button").click(function() {
    console.log("master calendar clicked");
    $("#rmc-master-calendar-button").toggleClass("active");
    if (desiredViews.includes("rmc-master-calendar")) {
      desiredViews.splice(desiredViews.indexOf("rmc-master-calendar"), 1);
      calendar.rerenderEvents();
    } else {
      desiredViews.push("rmc-master-calendar");
      calendar.rerenderEvents();
    }
  });
  $("#rmc-athletics-events-button").click(function() {
    $("#rmc-athletics-events-button").toggleClass("active");
    if (desiredViews.includes("rmc-athletics")) {
      desiredViews.splice(desiredViews.indexOf("rmc-athletics"), 1);
      calendar.rerenderEvents();
    } else {
      desiredViews.push("rmc-athletics");
      calendar.rerenderEvents();
    }
  });
  $("#rmc-student-events-button").click(function() {
    console.log("student events clicked");
    $("#rmc-student-events-button").toggleClass("active");
    if (desiredViews.includes("rmc-student-events")) {
      desiredViews.splice(desiredViews.indexOf("rmc-student-events"), 1);
      console.log(desiredViews);
      calendar.rerenderEvents();
    } else {
      desiredViews.push("rmc-student-events");
      console.log(desiredViews);
      calendar.rerenderEvents();
    }
  });
  $("#rmc-alumni-events-button").click(function() {
    console.log("alumni clicked");
    $("#rmc-alumni-events-button").toggleClass("active");
    if (desiredViews.includes("rmc-alumni-events")) {
      console.log("here we be");
      desiredViews.splice(desiredViews.indexOf("rmc-alumni-events"), 1);
      console.log(",ehh", desiredViews);
      calendar.rerenderEvents();
    } else {
      desiredViews.push("rmc-alumni-events");
      console.log(desiredViews);
      calendar.rerenderEvents();
    }
  });

  $("input[class=event_filter_box]").change(function() {
    // $('#calendar').fullCalendar('rerenderEvents');
    calendar.rerenderEvents();
  });

  //stuff for the changing of the view buttons
  let currentView = calendar.view.view.type;
  let oldView = "";

  //this selects the button of the view thats displayed on page load. So that it's visually represented as active. 
  $(document).ready(function() {
    console.log(currentView);
    if (currentView == "dayGridMonth") {
      $("#cal-month").addClass("active");
    }
    if (currentView == "dayGridWeek") {
      $("#cal-week").addClass("active");
    }
    if (currentView == "dayGrid") {
      $("#cal-day").addClass("active");
    }
    if (currentView == "listWeek") {
      $("#cal-list").addClass("active");
    }
  });

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
