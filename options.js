//Feed the options with default value,
//Color change and disable if we deactivate it
//Feed localstorage with new calues on change
function ghost(isDeactivated) {
   options.style.color = isDeactivated ?
      'graytext' : 'black';
   // The label color.
   options.notifrequency.disabled =
      isDeactivated; // The control manipulability.
   options.Domain.value = "";
   options.ViewID.value = "";
   options.Domain.disabled =
      isDeactivated;
   options.ViewID.disabled =
      isDeactivated;

}

window.addEventListener('load',
   function() {
      // Initialize the option controls.
      options.isActivated.checked =
         JSON.parse(localStorage.isActivated);
      // The display activation.
      options.notifrequency.value =
         localStorage.notifrequency;
      options.checkfrequency.value =
         localStorage.checkfrequency;
      options.Domain.value =
         localStorage.Domain;
      options.ViewID.value =
         localStorage.ViewID;
      if (!options.isActivated.checked) {
         ghost(true);
         options.notifrequency.disabled =
            true;
      }

      // Set the display activation and frequency.
      options.isActivated.onchange =
         function() {
            localStorage.isActivated =
               options.isActivated.checked;
            ghost(!options.isActivated
               .checked);
            options.notifrequency.disabled =
               false;
            options.Domain.value =
               localStorage.Domain;
            options.ViewID.value =
               localStorage.ViewID;
         };

      options.checkfrequency.onchange =
         function() {
            localStorage.checkfrequency =
               options.checkfrequency
               .value;
         };
      options.ViewID.onchange =
         function() {
            localStorage.ViewID =
               options.ViewID.value;
            localStorage.isInitialized =
               true;
         };
      options.notifrequency.onchange =
         function() {
            localStorage.notifrequency =
               options.notifrequency
               .value;
         };
      options.Domain.onchange =
         function() {
            localStorage.Domain =
               options.Domain.value;
            localStorage.isInitialized =
               true;
         };

      //localStorage.Domain = "domain.zendesk.com";
      //localStorage.notifrequency = 1;     // The display frequency, in minutes.
      //localStorage.checkfrequency = 60;   // The check for new tickets, in seconds
      //localStorage.isInitialized = true;
   });
