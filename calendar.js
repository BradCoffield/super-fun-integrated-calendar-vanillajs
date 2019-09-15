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
    "rmc-athletics",
    "rmc-athletics-jv-mens-basketball",
    "rmc-athletics-mens-basketball",
    "rmc-athletics-womens-basketball",
    "rmc-athletics-jv-womens-basketball",
    "rmc-athletics-cross-country",
    "rmc-athletics-mens-cross-country",
    "rmc-athletics-football",
    "rmc-athletics-mens-golf",
    "rmc-athletics-womens-golf",
    "rmc-athletics-mens-ski-racing",
    "rmc-athletics-ski-racing",
    "rmc-athletics-womens-ski-racing",
    "rmc-athletics-mens-soccer",
    "rmc-athletics-womens-soccer",
    "rmc-athletics-mens-track-and-field",
    "rmc-athletics-womens-track-and-field",
    "rmc-athletics-volleyball",
    "rmc-athletics-cheerleading"
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
          "rocky.edu_2gbenc7go3t1k90k0m3utq7g4o@group.calendar.google.com",
        className: "rmc-master-calendar"
      },
      {
        googleCalendarId:
          "rocky.edu_87pj63gjv6cri8t2glk5aa0t5o@group.calendar.google.com",
        className: "rmc-alumni-events"
      },
      {
        googleCalendarId:
          "r1a42hmoaun7m0oplppkhkmrpj4m7jmd@import.calendar.google.com",
        className: "rmc-athletics"
      },
      {
        googleCalendarId:
          "oi9hl6saj8n35lv8m0pa16ssfr7ebrd8@import.calendar.google.com",
        className: "rmc-athletics-jv-mens-basketball"
      },
      {
        googleCalendarId:
          "4v339r9s3h3niisfiqglbsjfm4vrnagn@import.calendar.google.com",
        className: "rmc-athletics-mens-basketball"
      },
      {
        googleCalendarId:
          "ks30461f7jbhqnj0d9lfdju52dcehacu@import.calendar.google.com",
        className: "rmc-athletics-womens-basketball"
      },
      {
        googleCalendarId:
          "gll9u0l40u9k81hnov2hv4i9mu7tvkae@import.calendar.google.com",
        className: "rmc-athletics-jv-womens-basketball"
      },
      {
        googleCalendarId:
          "5tsd3v22ik9qakrroof21orjac1s39l0@import.calendar.google.com",
        className: "rmc-athletics-cross-country"
      },
      {
        googleCalendarId:
          "qp7t3eelino9ilefqdhvdduq5jpqm5g4@import.calendar.google.com",
        className: "rmc-athletics-mens-cross-country"
      },
      {
        googleCalendarId:
          "1hn28nug8ricjvg9330elbc0p6itohct@import.calendar.google.com",
        className: "rmc-athletics-football"
      },
      {
        googleCalendarId:
          "st10qn7366v6csgljdj4ssfqd6g6hljg@import.calendar.google.com",
        className: "rmc-athletics-mens-golf"
      },
      {
        googleCalendarId:
          "oqu3g83n3iil8a0svkj36scve25htk5n@import.calendar.google.com",
        className: "rmc-athletics-womens-golf"
      },
      {
        googleCalendarId:
          "qnsn4kvkmjelvna2rdrfn50h1j2eg5d3@import.calendar.google.com",
        className: "rmc-athletics-mens-ski-racing"
      },
      {
        googleCalendarId:
          "dgh2blpl1r3pmim2j7e6njmc9h95eq1v@import.calendar.google.com",
        className: "rmc-athletics-ski-racing"
      },
      {
        googleCalendarId:
          "fdcr2mr3a8b7e014s19rdg5cd1torqb6@import.calendar.google.com",
        className: "rmc-athletics-womens-ski-racing"
      },
      {
        googleCalendarId:
          "ll761ilg8va9jpji57buc2edl6mhf1q0@import.calendar.google.com",
        className: "rmc-athletics-mens-soccer"
      },
      {
        googleCalendarId:
          "771tkmsvlut9ja8lppug3ccv1l7r1ba7@import.calendar.google.com",
        className: "rmc-athletics-womens-soccer"
      },
      {
        googleCalendarId:
          "48dudds8id4pnfh6odteebmo46pe97vf@import.calendar.google.com",
        className: "rmc-athletics-mens-track-and-field"
      },
      {
        googleCalendarId:
          "9n02j1fp5a400t836v5v4v6oasc0sdhf@import.calendar.google.com",
        className: "rmc-athletics-womens-track-and-field"
      },
      {
        googleCalendarId:
          "jtfgklsot0ucckvfqlp4v6tv3vlsn37j@import.calendar.google.com",
        className: "rmc-athletics-volleyball"
      },
      {
        googleCalendarId:
          "vf7anj1mjqfah0l3vidgk7f13sg4nafp@import.calendar.google.com",
        className: "rmc-athletics-cheerleading"
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
      let theClassNames = info.el.className;
      const found = desiredViews.some(r => theClassNames.includes(r));
      return found;
    },

    /* What happens when someone clicks a particular event. In this case, open a modal with additional information about the event. */
    // The modal is using TingleJS
    eventClick: function(info) {
      let timeConvert = arg => {
        let m = FullCalendarMoment.toMoment(arg, calendar);
        // console.log("Converte!", m.format("HH:mmA"));
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

  /* calendar source buttons
   */

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

  $("#rmc-athletics-events-womens-basketball-button").click(function() {
    $("#rmc-athletics-events-womens-basketball-button").toggleClass("active");
    if (
      desiredViews.includes("rmc-athletics-womens-basketball") &&
      desiredViews.includes("rmc-athletics-jv-womens-basketball")
    ) {
      desiredViews.splice(
        desiredViews.indexOf("rmc-athletics-womens-basketball"),
        1
      );
      desiredViews.splice(
        desiredViews.indexOf("rmc-athletics-jv-womens-basketball"),
        1
      );
      calendar.rerenderEvents();
    } else {
      desiredViews.push("rmc-athletics-womens-basketball");
      desiredViews.push("rmc-athletics-jv-womens-basketball");
      calendar.rerenderEvents();
    }
  });
  
  $("#rmc-athletics-events-mens-basketball-button").click(function() {
    $("#rmc-athletics-events-mens-basketball-button").toggleClass("active");
    if (
      desiredViews.includes("rmc-athletics-mens-basketball") &&
      desiredViews.includes("rmc-athletics-jv-mens-basketball")
    ) {
      desiredViews.splice(
        desiredViews.indexOf("rmc-athletics-mens-basketball"),
        1
      );
      desiredViews.splice(
        desiredViews.indexOf("rmc-athletics-jv-mens-basketball"),
        1
      );
      calendar.rerenderEvents();
    } else {
      desiredViews.push("rmc-athletics-mens-basketball");
      desiredViews.push("rmc-athletics-jv-mens-basketball");
      calendar.rerenderEvents();
    }
  });



  $("#rmc-athletics-events-cheerleading-button").click(function() {
    $("#rmc-athletics-events-cheerleading-button").toggleClass("active");
    if (desiredViews.includes("rmc-athletics-cheerleading")) {
      desiredViews.splice(desiredViews.indexOf("rmc-athletics-cheerleading"), 1);
      calendar.rerenderEvents();
    } else {
      desiredViews.push("rmc-athletics-cheerleading");
      calendar.rerenderEvents();
    }
  });


  $("#rmc-athletics-events-cross-country-button").click(function() {
    $("#rmc-athletics-events-cross-country-button").toggleClass("active");
    if (
      desiredViews.includes("rmc-athletics-cross-country") &&
      desiredViews.includes("rmc-athletics-mens-cross-country")
    ) {
      desiredViews.splice(
        desiredViews.indexOf("rmc-athletics-cross-country"),
        1
      );
      desiredViews.splice(
        desiredViews.indexOf("rmc-athletics-mens-cross-country"),
        1
      );
      calendar.rerenderEvents();
    } else {
      desiredViews.push("rmc-athletics-cross-country");
      desiredViews.push("rmc-athletics-mens-cross-country");
      calendar.rerenderEvents();
    }
  });

  $("#rmc-athletics-events-football-button").click(function() {
    $("#rmc-athletics-events-football-button").toggleClass("active");
    if (desiredViews.includes("rmc-athletics-football")) {
      desiredViews.splice(desiredViews.indexOf("rmc-athletics-football"), 1);
      calendar.rerenderEvents();
    } else {
      desiredViews.push("rmc-athletics-football");
      calendar.rerenderEvents();
    }
  });

  $("#rmc-athletics-events-golf-button").click(function() {
    $("#rmc-athletics-events-golf-button").toggleClass("active");
    if (
      desiredViews.includes("rmc-athletics-mens-golf") &&
      desiredViews.includes("rmc-athletics-womens-golf")
    ) {
      desiredViews.splice(
        desiredViews.indexOf("rmc-athletics-mens-golf"),
        1
      );
      desiredViews.splice(
        desiredViews.indexOf("rmc-athletics-womens-golf"),
        1
      );
      calendar.rerenderEvents();
    } else {
      desiredViews.push("rmc-athletics-mens-golf");
      desiredViews.push("rmc-athletics-womens-golf");
      calendar.rerenderEvents();
    }
  });
  $("#rmc-athletics-events-skiing-button").click(function() {
    $("#rmc-athletics-events-skiing-button").toggleClass("active");
    if (
      desiredViews.includes("rmc-athletics-mens-ski-racing") &&
      desiredViews.includes("rmc-athletics-ski-racing") &&
      desiredViews.includes("rmc-athletics-womens-ski-racing") 

    ) {
      desiredViews.splice(
        desiredViews.indexOf("rmc-athletics-mens-ski-racing"),
        1
      );
      desiredViews.splice(
        desiredViews.indexOf("rmc-athletics-ski-racing"),
        1
      );
      desiredViews.splice(
        desiredViews.indexOf("rmc-athletics-womens-ski-racing"),
        1
      );
      calendar.rerenderEvents();
    } else {
      desiredViews.push("rmc-athletics-mens-ski-racing");
      desiredViews.push("rmc-athletics-ski-racing");
      desiredViews.push("rmc-athletics-womens-ski-racing");
      calendar.rerenderEvents();
    }
  });

  $("#rmc-athletics-events-mens-soccer-button").click(function() {
    $("#rmc-athletics-events-mens-soccer-button").toggleClass("active");
    if (desiredViews.includes("rmc-athletics-mens-soccer")) {
      desiredViews.splice(desiredViews.indexOf("rmc-athletics-mens-soccer"), 1);
      calendar.rerenderEvents();
    } else {
      desiredViews.push("rmc-athletics-mens-soccer");
      calendar.rerenderEvents();
    }
  });
  $("#rmc-athletics-events-womens-soccer-button").click(function() {
    $("#rmc-athletics-events-womens-soccer-button").toggleClass("active");
    if (desiredViews.includes("rmc-athletics-womens-soccer")) {
      desiredViews.splice(desiredViews.indexOf("rmc-athletics-womens-soccer"), 1);
      calendar.rerenderEvents();
    } else {
      desiredViews.push("rmc-athletics-womens-soccer");
      calendar.rerenderEvents();
    }
  });
  $("#rmc-athletics-events-track-button").click(function() {
    $("#rmc-athletics-events-track-button").toggleClass("active");
    if (
      desiredViews.includes("rmc-athletics-mens-track-and-field") &&
      desiredViews.includes("rmc-athletics-womens-track-and-field")
    ) {
      desiredViews.splice(
        desiredViews.indexOf("rmc-athletics-mens-track-and-field"),
        1
      );
      desiredViews.splice(
        desiredViews.indexOf("rmc-athletics-womens-track-and-field"),
        1
      );
      calendar.rerenderEvents();
    } else {
      desiredViews.push("rmc-athletics-mens-track-and-field");
      desiredViews.push("rmc-athletics-womens-track-and-field");
      calendar.rerenderEvents();
    }
  });

  $("#rmc-athletics-events-volleyball-button").click(function() {
    $("#rmc-athletics-events-volleyball-button").toggleClass("active");
    if (desiredViews.includes("rmc-athletics-volleyball")) {
      desiredViews.splice(desiredViews.indexOf("rmc-athletics-volleyball"), 1);
      calendar.rerenderEvents();
    } else {
      desiredViews.push("rmc-athletics-volleyball");
      calendar.rerenderEvents();
    }
  });

  //   $("input[class=event_filter_box]").change(function() {
  //     calendar.rerenderEvents();
  //   });

  /* THE CALENDAR VIEW TYPE BUTTONS */
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
