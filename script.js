// API Key for OpenWeatherMap API
const API_KEY = "168771779c71f3d64106d8a88376808a";

// DOM elements for switching tabs and interacting with the UI
const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const searchForm = document.querySelector("[data-searchForm]");
const userInfoContainer = document.querySelector(".userInfoContainer");
const grantAccessContainer = document.querySelector(".grantLocationContainer");
const loadingContainer = document.querySelector('.loadingContainer');
const notFound = document.querySelector('.errorContainer');
const errorBtn = document.querySelector('[data-errorButton]');
const errorText = document.querySelector('[data-errorText]');
const errorImage = document.querySelector('[data-errorImg]');

// Track the current active tab (default to userTab)
let currentTab = userTab;
currentTab.classList.add("currentTab");
getFromSessionStorage();

// Function to handle tab switching
function switchTab(newTab) {
    notFound.classList.remove("active");

    // Check if the new tab is already selected
    if (currentTab !== newTab) {
        currentTab.classList.remove("currentTab");
        currentTab = newTab;
        currentTab.classList.add("currentTab");

        // Toggle visibility of search form and weather info based on the selected tab
        if (!searchForm.classList.contains("active")) {
            // Show search weather form
            searchForm.classList.add("active");
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
        } else {
            // Show user's weather (get from session storage)
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            getFromSessionStorage();
        }
    }
}

// Event listeners for tab clicks
userTab.addEventListener('click', () => switchTab(userTab));
searchTab.addEventListener('click', () => switchTab(searchTab));

// Function to get weather info from session storage
function getFromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("userCoordinates");

    if (!localCoordinates) {
        // If no coordinates are saved, show the grant access container
        grantAccessContainer.classList.add('active');
    } else {
        // If coordinates are present, fetch the weather data
        const coordinates = JSON.parse(localCoordinates);
        fetchWeatherInfo(coordinates);
    }
}

// Function to fetch weather data based on coordinates
async function fetchWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;

    // Hide grant access container and show loading
    grantAccessContainer.classList.remove('active');
    loadingContainer.classList.add('active');

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();

        // Check if valid data is received, else throw an error
        if (!data.sys) {
            throw data;
        }

        // Hide loading, show weather info
        loadingContainer.classList.remove('active');
        userInfoContainer.classList.add('active');
        renderWeatherInfo(data);
    } catch (err) {
        // Handle errors: hide loading and show error container
        loadingContainer.classList.remove('active');
        notFound.classList.add('active');
        errorImage.style.display = 'none';
        errorText.innerText = `Error: ${err?.message}`;
        errorBtn.style.display = 'block';
        errorBtn.addEventListener("click", fetchWeatherInfo);
    }
}

// Function to render fetched weather data on the UI
function renderWeatherInfo(weatherInfo) {
    const cityName = document.querySelector('[data-cityName]');
    const countryFlag = document.querySelector('[data-countryFlag]');
    const description = document.querySelector('[data-weatherDesc]');
    const weatherIcon = document.querySelector('[data-weatherIcon]');
    const temp = document.querySelector('[data-temp]');
    const windspeed = document.querySelector('[data-windspeed]');
    const humidity = document.querySelector('[data-humidity]');
    const clouds = document.querySelector('[data-clouds]');

    // Populate the UI with the fetched weather data
    cityName.innerText = weatherInfo?.name;
    countryFlag.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    description.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp.toFixed(2)} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed.toFixed(2)} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity.toFixed(2)} %`;
    clouds.innerText = `${weatherInfo?.clouds?.all.toFixed(2)} %`;
}

// Function to request user's location
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        grantAccessButton.style.display = 'none'; // Hide the button if geolocation is not supported
    }
}

// Function to save and use user's location coordinates
function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    };

    // Save coordinates in session storage and fetch weather
    sessionStorage.setItem("userCoordinates", JSON.stringify(userCoordinates));
    fetchWeatherInfo(userCoordinates);
}

// Event listener for granting location access
const grantAccessButton = document.querySelector('[data-grantAccess]');
grantAccessButton.addEventListener('click', getLocation);

// Event listener for submitting the weather search form
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const searchInput = document.querySelector('[data-searchInput]');
    
    if (searchInput.value === "") return; // Exit if input is empty

    fetchSearchWeatherInfo(searchInput.value);
    searchInput.value = ""; // Clear input field after search
});

// Function to fetch weather data for searched city
async function fetchSearchWeatherInfo(city) {
    // Show loading and hide other containers
    loadingContainer.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    notFound.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();

        // Check if valid data is received, else throw an error
        if (!data.sys) {
            throw data;
        }

        // Hide loading, show weather info
        loadingContainer.classList.remove('active');
        userInfoContainer.classList.add('active');
        renderWeatherInfo(data);
    } catch (err) {
        // Handle errors: hide loading, show error container
        loadingContainer.classList.remove('active');
        userInfoContainer.classList.remove('active');
        notFound.classList.add('active');
        errorText.innerText = `${err?.message}`;
        errorBtn.style.display = "none";
    }
}
