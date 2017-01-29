$(document).ready(function() {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyBg3p7kgi2kv9A8XIHQXWafbMb1AYb_sSU",
        authDomain: "trainschedule-d6763.firebaseapp.com",
        databaseURL: "https://trainschedule-d6763.firebaseio.com",
        storageBucket: "trainschedule-d6763.appspot.com",
        messagingSenderId: "94766076515"
    };
    firebase.initializeApp(config);

    var db = firebase.database();


    $("button.add-train").on("click", function(e) {
        event.preventDefault(); //np refresh

        // get user input and remove spaces
        var trainName = $("#trainName").val().trim();
        var trainDestination = $("#trainDestination").val().trim();
        var trainFrequency = $("#trainFrequency").val().trim();
        var trainStarts = moment($("#trainStartsDate").val() + " " + $("#trainStartsTime").val()).format("hh:mm A")
        //train object to pass to Firebase
        var newTrain = {
            trainName: trainName,
            trainDestination: trainDestination,
            trainFrequency: trainFrequency,
            trainStarts: trainStarts
        };

        //add new train info to db
        db.ref("/trains/").push(newTrain);

        //reset inputs
        $("#trainName").val("");
        $("#trainDestination").val("");
        $("#trainFrequency").val("");

    });


    // On first and each record added
    db.ref("/trains/").on("child_added", function(childSnap) {
        var trainName = childSnap.val().trainName;
        var trainDestination = childSnap.val().trainDestination;
        var trainFrequency = childSnap.val().trainFrequency;
        var firstTrain = childSnap.val().trainStarts;

        var currentTime = moment(new Date());
        var firstTimeConverted = moment(firstTrain, "hh:mm A").subtract(1, "years");
        var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
        var tRemainder = diffTime % trainFrequency;
        var tMinutesTillTrain = trainFrequency - tRemainder;
        var nextTrain = moment().add(tMinutesTillTrain, "minutes");
        var nextTrainTime = moment(nextTrain).format("hh:mm A");

        //adding each train's data to the table
        $("#train-schedule>tbody").append(
            "<tr><td>" + trainName +
            "</td><td>" + trainDestination +
            "</td><td>" + trainFrequency +
            "</td><td>" + nextTrainTime +
            "</td><td>" + tMinutesTillTrain +
            "</td><td><button class='btn btn-danger'>X</button></tr>"
        );
    });


    $(document).on("click", "button.btn-danger", function(e) {
        var train = $(this).parent().siblings().first().text();
        var trains = db.ref("/trains/");
        var self = $(this);

        var ans = confirm("Are you sure you want to remove this train from the schedule?")
        if (ans === true){
          trains.on("child_added", function(snap) {
            if (snap.val().trainName === train) {
              snap.ref.remove();
              self.parent().parent().remove();
            }
          });
        }

    });
});
