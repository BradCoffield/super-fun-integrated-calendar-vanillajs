console.log("hi");

document.addEventListener("DOMContentLoaded", function() {

  // Tingle modal - generic generator code
  var modal = new tingle.modal({
    footer: true,
    stickyFooter: true,
    closeMethods: ['overlay', 'button', 'escape'],
    closeLabel: "Close",
    cssClass: ['custom-class-1', 'custom-class-2'],
    onOpen: function() {
        console.log('modal open');
    },
    onClose: function() {
        console.log('modal closed');
    },
    // beforeClose: function() {
    //     // here's goes some logic
    //     // e.g. save content before closing the modal
    //     return true; // close the modal
    //     return false; // nothing happens
    // }
});


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
        console.log(info.event)
      let theLocation, theDescription, theTitle;
      if (info.event.extendedProps.location) {theLocation = info.event.extendedProps.location} else {theLocation = ""}
      if (info.event.title) {theTitle = info.event.title} else {theTitle = ""}
     if (info.event.extendedProps.description) {theDescription = info.event.extendedProps.description} else {theDescription = ""}
     let theURL = info.event.url;
      modal.setContent(`<h3>${info.event.title}</h3><p>${theLocation}</p><p>${theDescription}</p><p><a href="${theURL}" target="_blank">More Information</a></p>`);    
      modal.addFooterBtn('Button label', 'tingle-btn tingle-btn--primary', function() {
        // here goes some logic
        modal.close();
    });
      modal.open();
      // alert(info.event.title);
      info.jsEvent.preventDefault();
    }
   
   //SWEETALERT things
    // eventClick: function(info) {
    //   console.log(info.event.extendedProps.description)
    //   let theLocation, theDescription, theTitle;
    //   if (info.event.extendedProps.location) {theLocation = info.event.extendedProps.location} else {theLocation = ""}
    //   if (info.event.title) {theTitle = info.event.title} else {theTitle = ""}
    //  if (info.event.extendedProps.description) {theDescription = info.event.extendedProps.description} else {theDescription = ""}

    //   /*Open Sweet Alert*/
    //       swal({
    //         title: theTitle,//Event Title
    //           text: `<strong>${theLocation}</strong>`,
              
            
    //         // text: "Start From : "+moment(calEvent.start).format("MMMM Do YYYY, h:mm a"),//Event Start Date
    //         icon: "success",
    //       });
    //       info.jsEvent.preventDefault();
    //   }
 
  });

  calendar.render();
});
//   ok, so dayGridDay and dayGridWeek as default views show the by week and by day that I want. Just need to make them accessible from buttons.

