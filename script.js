$(document).ready(function () {
  $("#search-button").on("click", function () {
    var searchInput = $("#search-value").val();
    console.log(searchInput);
    // clear input
    $("#search-value").val('');
    searchWeather(searchInput);
  });

  $(".history").on("click", "li", function () {
    searchWeather($(this).text());
  });
  // method to clear search history from local storage
  $("#clear-history").on("click", function () {
    localStorage.clear();
    window.location.reload();
  });

  // create history box
  function makeRow(text) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    $(".history").append(li);
  }

  function searchWeather(cityName) {
    $.ajax({
      method: "GET",
      url: "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=imperial&appid=c9eb833dc6d98c5c9513f09e6f2da334",
      success: function (data) {
        // create history link for this search
        if (history.indexOf(cityName.toLowerCase()) === -1) {
          history.push(cityName.toLowerCase());
          window.localStorage.setItem("history", JSON.stringify(history));

          makeRow(cityName);
        }

        // clear any old content
        $("#today").val('');
        // create html content for current weather, merge and add to page
        var weatherIcon = "https://openweathermap.org/img/wn/" + data.weather[0].icon + ".png";
        let today = new Date().toLocaleDateString();

        $("#today").html(
          "<h3>" + data.name + " " + "(" + today + ") " + "<img src=" + weatherIcon + '>' + "</h3>" +
          "<p>" +
          "Temperature: " + data.main.temp + "&#8457;" +
          "</p>" +
          "<p>" +
          "Humidity: " + data.main.humidity + "%" +
          "</p>" +
          "<p>" +
          "Wind Speed: " + data.wind.speed + "MPH" +
          "</p>" +
          '<div class="UVbutton">' + "</div>"
        );

        // call follow-up api endpoints
        getForecast(cityName);
        getUVIndex(data.coord.lat, data.coord.lon);
      }
    });
  }

  function getForecast(cityName) {
    $.ajax({
      method: "GET",
      url: "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&units=imperial&appid=c9eb833dc6d98c5c9513f09e6f2da334",
      success: function (data) {
        // overwrite any existing content with title and empty row
        $("#forecast").empty();
        var title = $("<h4>").text("5 Day Forecast:");
        var createRow = $("<div>").attr("class", "row").attr("id", "card-row");
        var createCard = $("<div>").attr("class", "card").attr("id", "card-body forecast2");
        $("#forecast").append(title, createRow);

        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            // create html elements for a bootstrap card
            // merge together and put on page
            var dateConverter = new Date(data.list[i].dt * 1000).toLocaleDateString("en-US")
            var weatherIcon = "https://openweathermap.org/img/wn/" + data.list[i].weather[0].icon + "@2x.png";
            var createCard = $("<div>").attr("class", "card-body");
            var dates = $("<h3>").html(dateConverter);
            var weatherPic = $("<img>").attr("src", weatherIcon);
            var temperature = $("<p>").html("Temp: " + data.list[i].main.temp + "℉");
            var humidity = $("<p>").html("Humidity: " + data.list[i].main.humidity + "%");
            var windSpeed = $("<p>").html("Wind Speed: " + data.list[i].wind.speed + "MPH");
            createCard.append(dates, weatherPic, temperature, humidity, windSpeed);
            $("#card-row").append(createCard);
          }
        }
      }
    });
  }

  function getUVIndex(lat, lon) {
    $.ajax({
      method: "GET",
      url: "https://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=c9eb833dc6d98c5c9513f09e6f2da334",
      success: function (data) {
        var uv = $("<p>").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(data.value);

        $("#today .UVbutton").append(uv.append(btn));
      }
    });
  }

  // get current history, if any
  var history = JSON.parse(window.localStorage.getItem("history")) || [];

  if (history.length > 0) {
    searchWeather(history[history.length - 1]);
  }

  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});

