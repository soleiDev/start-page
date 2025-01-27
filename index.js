const myAccessKey = "tz-5Lfcv9s4LNLFmDVGbSw6_BXQHAHAk9JI6v_OUBa8"
const weatherKey = "931bc3733094347a7b5f32ac1352226f"
const lon = '77.5946'
const lat = '12.9716'
const imagesHistory = []
const likedImages = []

// Determine the time of day
const now = new Date();
const hours = now.getHours();
let query = '';

if (hours >= 6 && hours < 18) {
    query = 'animals,mountains,ocean,oman,lakes';
} else {
    query = 'night sky';
}

// Clock
function setTime() {
    const timeValue = now.toLocaleTimeString("en-us", {timeStyle: "short"})
    const timeEl = document.getElementById('time')
    timeEl.textContent = timeValue
}
setInterval(setTime, 1000)

// Load Image History and Likes from Local Storage
function loadImages() {
    const storedLikedImages = JSON.parse(localStorage.getItem('likedImages'));
    const storedImagesHistory = JSON.parse(localStorage.getItem('imagesHistory'));

    if (storedLikedImages) {
        likedImages.unshift(...storedLikedImages);
    }

    if (storedImagesHistory) {
        imagesHistory.unshift(...storedImagesHistory);
    }
}

// Load images from local storage when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadImages();
    const currentTime = now.getTime()
    const oneDay = 1000 * 60 * 60 * 24
    const setBackgroundImage = () => {
        const lastFetch = localStorage.getItem('lastFetch')
        if (!lastFetch || currentTime - lastFetch > oneDay) {
            // Fetch a new background image
            getBackgroundImage()
            localStorage.setItem('lastFetch', currentTime)
        } else {
            renderBackgroundImage()
        }
    };
    //getBackgroundImage()
    setBackgroundImage()
    setInterval(setBackgroundImage, oneDay) // Fetch a new background image once every 24 hours
});

// Unsplash API calls
function getBackgroundImage() {
    fetch(`https://api.unsplash.com/photos/random?orientation=landscape&query=${query}&client_id=${myAccessKey}`)
    .then(res => {
        if (!res.ok) throw Error("API call limit reached")
        return res.json()
    })
    .then(data => {
        console.log(data)
        imagesHistory.unshift(data)
        renderBackgroundImage()
    })
    .catch(err => {
        console.error(err)
        setDefault()
    });
}

// Background Image 
function renderBackgroundImage() {
    const data = imagesHistory[0]
    document.body.style.backgroundImage = `url("${data.urls.full}")`
    document.getElementById('credit-author').innerHTML = `
        <p class="image-author" id="image-author">Photo by ${data.user.name}</p>
        <i class="fa-regular fa-heart like-btn" id="like-btn" data-like="${data.id}"></i>
    `
    if(data.location.name) {
        document.getElementById('location').textContent = data.location.name
    } else {
        document.getElementById('location').textContent = 'Someplace on Earth'
    }
    console.log(data)
    saveImages()
}

// Like Images
document.addEventListener('click', function(event) {
    if (event.target && event.target.id === 'like-btn') {
        handleClick(event)
    }
});

// Like Images and Call saveImages whenever likedImages or imagesHistory is updated
function handleClick(e){
    if (e.target.dataset.like) {
        likedImages.push(e.target.dataset.like);
        saveImages()
    }
}

// Save Image History and Likes to Local Storage
function saveImages() {
    localStorage.setItem('likedImages', JSON.stringify(likedImages))
    localStorage.setItem('imagesHistory', JSON.stringify(imagesHistory))
}

// Default Background on API fails
function setDefault() {
    document.body.style.backgroundImage = 'url("https://images.unsplash.com/photo-1504257538320-8a5d5f1c0f31?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")'
}

// OpenWeather API calls
fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherKey}&units=metric`)
    .then(res => {
        if(!res.ok) throw Error("Something went wrong")
        return res.json()
    })
    .then(data => {
        setWeather(data)
    })
    .catch(err => console.error(err))

// Render weather
function setWeather(data) {
    const iconURL = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
    document.getElementById('weather').innerHTML = `
        <img src="${iconURL}" alt="An icon visualizing ${data.weather[0].description}" />
        <h2>${Math.round(data.main.temp)}°</h2>
        <p>${data.name}</p> 
    `
}

// Advice Slip API calls
fetch("https://api.adviceslip.com/advice")
    .then(res => res.json())
    .then(data => {
        setAdvice(data.slip.advice)
    })

// Render advice
function setAdvice(advice) {
    document.getElementById('advice').textContent = advice
}

// Dummy JSON Quotes API
fetch('https://dummyjson.com/quotes/random')
    .then( res => res.json() )
    .then( data => setQuote(data.quote, data.author) )

// Render quotes
function setQuote(quote, author) {
    document.getElementById('quote').textContent = `${quote}`
    document.getElementById('author').textContent = `-${author}`
}


function updateGreeting() {
    const greetingElement = document.getElementById('greeting');
    const now = new Date();
    const hours = now.getHours();
    let greetingText = '';

    if (hours >= 12 && hours < 18) {
        greetingText = 'Good afternoon';
    } else if (hours >= 18 || hours < 4) {
        greetingText = 'Good evening';
    } else {
        greetingText = 'Good morning';
    }

    greetingElement.textContent = `${greetingText}, Apoorva`;
}

updateGreeting();

// // Clear local storage for a fresh start
// function clearData() {
//     localStorage.removeItem('likedImages');
//     localStorage.removeItem('imagesHistory');
//     likedImages.length = 0;
//     imagesHistory.length = 0;
// }

// // Call clearData to clear the data
// clearData();
