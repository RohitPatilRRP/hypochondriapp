$( document ).ready( function() {

  $( ".info-body" ).hide();

  var interstitialWait = 1700;
  var interstitialMedium = 900;
  var interstitialLong = 4000;
  var interstitialFast = 550;

  // var interstitialWait = 1;
  // var interstitialMedium = 1;
  // var interstitialLong = 1;
  // var interstitialFast = 1;


  // function sleep(ms) {
  //   return new Promise(resolve => setTimeout(resolve, ms));
  // }


  function delay(fn, t, x) {
    // private instance variables
    var queue = [], self, timer;

    function schedule(fn, t, x) {
        timer = setTimeout(function() {
            timer = null;
            fn(x);
            if (queue.length) {
                var item = queue.shift();
                schedule(item.fn, item.t, item.x);
            }
        }, t);
    }
    self = {
        delay: function(fn, t, x) {
            // if already queuing things or running a timer,
            //   then just add to the queue
            if (queue.length || timer) {
                queue.push({fn: fn, t: t, x: x});
            } else {
                // no queue or timer yet, so schedule the timer
                schedule(fn, t, x);
            }
            return self;
        },
        cancel: function() {
            clearTimeout(timer);
            queue = [];
        }
    };
    return self.delay(fn, t, x);
  }




  // async function makeSleep() {
  //   await sleep(2000);
  // }

  // async function noDiseases() {
  //   await sleep(500);
  //   $('.interstitial h1').get.text("Analyzing your symptoms...");
  //   $('.interstitial h1').fadeIn(100);
  //   await sleep(interstitialWait);
  //   $('.interstitial h1').text("Checking our databases...");
  //   await sleep(interstitialWait);
  //   $('.interstitial h1').text("Searching for possible diagnoses...");
  //   await sleep(interstitialWait);
  //   $('.interstitial h1').text("Sorry, no diseases match your symptoms.");
  // }

  function change_interstitial(words) {
    $('.interstitial h1').text(words);
  }

  function switch_to_panic_mode(text) {
    $('.interstitial h1').css("font-size", "7em");
    $('.interstitial h1').text(text);
  }

  function display_disease(disease) {
    $('.interstitial h1').css("font-size", "2.5em");

    var long_word = false;
    disease.split(" ").forEach(function(word) {
      if (word.length > 22) {
        $('.interstitial h1').css("hyphens", "auto");
      } else {
        $('.interstitial h1').css("hyphens", "manual");
      }
    });
    $('.interstitial h1').css("font-weight", "800");
    $('.interstitial h1').css("color", "rgb(187, 21, 21)");
    $('.interstitial h1').text(disease.toUpperCase());
  }

  function fade_out_interstitial() {
    $('.interstitial h1').fadeOut(400);
  }

  function display_disease_info(disease_array) {
    var disease_name = disease_array[0];
    var disease_info = disease_array[1];
    $(".disease_name").text(disease_name);
    $(".disease_description").text(disease_info['summary']);

    $(".disease_symptoms").text(disease_info['all_symptoms'].join(", "));
    $(".disease_matching_symptoms").text(disease_info['symptoms'].join(", "));
    $(".read_more").click(function() {
      window.location.href = disease_info['url'];
    });

    $(".info-body").show();
  }

  function hide_main_body () {
    $('.main_body').hide();
  }

  function diagnose(disease, disease_info) {
    var disease_array = [disease, disease_info];
    delay(change_interstitial, 500, "Analyzing your symptoms...")
    .delay(change_interstitial, interstitialWait, "Checking our databases...")
    .delay(change_interstitial, interstitialWait + 200, "Searching for possible diagnoses...")
    .delay(change_interstitial, interstitialWait, "Hmmm.")
    .delay(change_interstitial, interstitialWait, "This isn't looking good.")
    .delay(change_interstitial, interstitialWait, "...")
    .delay(switch_to_panic_mode, interstitialWait, "OH")
    .delay(change_interstitial, interstitialFast, "MY")
    .delay(change_interstitial, interstitialFast, "GOD.")
    .delay(change_interstitial, interstitialFast, "YOU")
    .delay(change_interstitial, interstitialFast, "COULD")
    .delay(change_interstitial, interstitialFast, "HAVE")
    .delay(display_disease, interstitialFast, disease)
    .delay(fade_out_interstitial, interstitialLong)
    .delay(hide_main_body, 400)
    .delay(display_disease_info, 400, disease_array); // FIRST NUMBER IS HOW LONG BEFORE YOUR ITEM SHOULD SHOW UP
  }

  $('.symptoms_button').click(function() {
    var symptoms_input = $("input").val();
    if (symptoms_input == "") {
      return;
    }
    var symptoms_array = symptoms_input.split(",");
    for (var i = 0; i < symptoms_array.length; i++) {
      symptoms_array[i] = symptoms_array[i].trim().toLowerCase();
    }

    // TODO: if the disease summary has the words "fatal" in it, add more points to "count"
    var diseases_hash = {};
    for (var disease in diseases) {
      var disease_symptoms = diseases[disease]['symptoms'];
      disease_symptoms.forEach(function(disease_symptom) {
        symptoms_array.forEach(function(user_symptom) {
          if (disease_symptom.trim().toLowerCase() == user_symptom) {
            if (disease in diseases_hash) {
              diseases_hash[disease]['count'] += 1;
              diseases_hash[disease]['symptoms'].push(user_symptom);
              // TODO: display the symptoms matched
            } else {
              diseases_hash[disease] = {'count': 1};
              diseases_hash[disease]['symptoms'] = [user_symptom];
              diseases_hash[disease]['summary'] = diseases[disease]['summary'];
              diseases_hash[disease]['url'] = diseases[disease]['url'];
              diseases_hash[disease]['all_symptoms'] = diseases[disease]['symptoms'];
            }
          }
        });
      });
    }

    $('.tag_line').fadeOut(300);
    $('.symptoms_input').fadeOut(300);
    if (Object.keys(diseases_hash).length == 0) {
      noDiseases();
    } else {

      // TODO: make algorithm weigh total number of symptoms too.

      var diseases_by_symptoms = Object.keys(diseases_hash).sort(function(a,b){
        return diseases_hash[b]['count'] - diseases_hash[a]['count'];
      });

      var diseases_by_name = Object.keys(diseases_hash).sort(function(a,b){
        return b.length - a.length;
      });

      // get top three longest names
      var selection = diseases_by_name.splice(0, 3);
      var final_disease = selection[Math.floor(Math.random()*selection.length)];

      diagnose(final_disease, diseases_hash[final_disease]);

    }

  });

  $('.flexdatalist').flexdatalist({
       selectionRequired: 1,
       minLength: 1,
       data: ['data', 'dime']
  });


});



    // var availableSymptoms = {};

  // symptoms['symptoms'].forEach(function(symptom) {
  //   for (var disease in diseases) {
  //     diseases[disease]['symptoms'].forEach(function(disease_symptom){
  //       if (symptom == disease_symptom) {
  //         if (!(symptom in availableSymptoms)) {
  //           availableSymptoms[symptom] = disease;
  //         }
  //       }
  //     });
  //   }
  // });
  // availableSymptoms = Object.keys(availableSymptoms);
  // availableSymptoms.forEach(function(symptom){
  //   console.log('<option value="' + symptom + '">' + symptom + "</option>");
  // })
