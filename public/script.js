document.addEventListener("DOMContentLoaded", function() {
    const checkInButton = document.getElementById("check-in-btn");
    const statusDisplay = document.getElementById("status");
    const attendanceLog = document.getElementById("attendance-log");
    const hidden = document.getElementById("myInput");

    //alert("REMINDER- It's 9 AM please turn on your location to mark attendence!");

    // Office location coordinates (latitude, longitude)
    const officeLocation = {
        lat: 13.3430236,
        long: 74.7922088,
    };

    // Radius in meters within which check-in is allowed
    const allowedRadius = 100; // 200 meters 

    let currentDateTime;
    let date;
    let time;

    // Function to handle successful geolocation retrieval
    function success(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Calculate distance to office
        const distance = getDistanceFromLatLonInMeters(latitude, longitude, officeLocation.lat, officeLocation.long);

        if (distance <= allowedRadius) {
            statusDisplay.innerText = "You are within the office range.";
            currentDateTime = new Date().toLocaleString();

            // Get the current date and time
            let now = new Date();
            date = now.toLocaleDateString();  // Get the date portion
            time = now.toLocaleTimeString();  // Get the time portion

            // Display the date and time in alerts for debugging
            //alert("Date: " + date);
            //alert("Time: " + time);

            // Log the check-in time in the HTML
            attendanceLog.innerHTML += `<p>Checked in at: ${currentDateTime}</p>`;
            checkInButton.disabled = true;
            //hidden.value="Checked in";
            
            // Prepare the data to send
            const data = {
                textData: `Checked in-${time}-`,
                date: `${date}`,
                //hidden: `${hidden.value}`,
            };

            // Send the data using fetch
            fetch('/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                //alert('Success: ' + data.message);  // Display success message
            })
            .catch((error) => {
                console.error('Error:', error);
            });

        } else {
            statusDisplay.innerText = `You are ${Math.round(distance)} meters away from the office.`;
            checkInButton.disabled = true;
            currentDateTime = new Date().toLocaleString();

            attendanceLog.innerHTML += `<p>Checked out at: ${currentDateTime}</p>`;
            //hidden.value="Checked out";

            let now = new Date();
            date = now.toLocaleDateString();  // Get the date portion
            time = now.toLocaleTimeString();  // Get the time portion

            // Display the date and time in alerts for debugging
            //alert("Date: " + date);
            //alert("Time: " + time);


            const data = {
                textData: `Checked out-${time}-`,
                date: `${date}`,
                //hidden: `${hidden.value}`,
            };

            fetch('/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                //alert('Success: ' + data.message);  // Display success message
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }
    }

    // Function to handle errors when retrieving geolocation
    function error() {
        statusDisplay.innerText = "Unable to retrieve your location.";
    }

    // Function to calculate distance between two points (in meters)
    function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth's radius in meters
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    }

    // Attempt to get the user's current location
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(success, error);
    } else {
        statusDisplay.innerText = "Geolocation is not supported by your browser.";
    }
});
