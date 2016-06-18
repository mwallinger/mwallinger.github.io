//helper functions

//return the hexadezimal value of a color
var getChlorColor = function(value){
    if (value <= 0){
        return "#B6B6B4"
    } else if (value <= 0.1){
        return "#a50026";
    }else if (value <= 0.2){
        return "#d73027";
    }else if (value <= 0.3){
        return "#f46d43";
    }else if (value <= 0.4){
        return "#fdae61"
    }else if (value <= 0.5){
        return "#fee08b";
    }else if (value <= 0.6){
        return "#d9ef8b";
    }else if (value <= 0.7){
        return "#a6d96a";
    }else if (value <= 0.8){
        return "#66bd63";
    }else if (value <= 0.9){
        return "#1a9850";
    }else if (value <= 1.0){
        return "#006837";
    }
}
        

function timestamp(str){
    return new Date(str).getTime();   
}

var
    weekdays = [
        "Sunday", "Monday", "Tuesday",
        "Wednesday", "Thursday", "Friday",
        "Saturday"
    ],
    months = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];

// Append a suffix to dates.
// Example: 23 => 23rd, 1 => 1st.
function nth (d) {
  if(d>3 && d<21) return 'th';
  switch (d % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
    }
}

// Create a string representation of the date.
function formatDate ( date ) {
    return weekdays[date.getDay()] + ", " +
        date.getDate() + nth(date.getDate()) + " " +
        months[date.getMonth()] + " " +
        date.getFullYear();
}

function notZero(n) {
  n = +n;  // Coerce to number.
  if (!n) {  // Matches +0, -0, NaN
    return 1;
  }
  return n;
}

//format function for dates
var format = d3.time.format("%Y-%m-%d %H:%M:%S");