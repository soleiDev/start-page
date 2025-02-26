const myAccessKey = "tz-5Lfcv9s4LNLFmDVGbSw6_BXQHAHAk9JI6v_OUBa8"
const weatherKey = "931bc3733094347a7b5f32ac1352226f"
const lon = '77.5946'
const lat = '12.9716'
const imagesHistory = []
const likedImages = []

/* Header Functionality */
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

/* Main Section Functionality */
// Clock
function setTime() {
    const now = new Date()
    const timeValue = now.toLocaleTimeString("en-us", {timeStyle: "short"})
    const timeEl = document.getElementById('time')
    const date = document.getElementById('date')
    timeEl.textContent = timeValue
    date.textContent = now.toLocaleDateString("en-us", {weekday: "long", month: "long", day: "numeric" })
}
setTime()
setInterval(setTime, 1000)


// Determine the date
const date = new Date()
let nextFetchDate

// Load images from local storage when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadImages()
    
    const today = date.getDate()
    console.log("Today: ", today)

    nextFetchDate = localStorage.getItem('nextFetchDate')
    
    if (!nextFetchDate || today === nextFetchDate || today > nextFetchDate) {
        const nextDay = new Date(date)
        nextDay.setDate(today+1)

        nextFetchDate = nextDay.getDate()
        console.log("Next Fetch Date: ", nextFetchDate)
        localStorage.setItem('nextFetchDate', nextFetchDate)

        getBackgroundImage()
    } else if(today < nextFetchDate){
        console.log("Next Fetch Date: ", nextFetchDate)
        renderBackgroundImage()
    }
})

// Unsplash API calls
function getBackgroundImage() {
    fetch(`https://api.unsplash.com/photos/random?orientation=landscape&query=animals,mountains,ocean,oman,lakes&client_id=${myAccessKey}`)
    .then(res => {
        if (!res.ok) throw Error("API call limit reached")
        return res.json()
    })
    .then(data => {
        if(!imagesHistory.includes(data.id)) {
            imagesHistory.unshift(data)
        }
        renderBackgroundImage()
    })
    .catch(err => {
        console.error(err)
        setDefault()
    });
}

// Background Image 
function renderBackgroundImage() {
    if(imagesHistory.length > 0) {

        const data = imagesHistory[0]
        document.body.style.backgroundImage = `url("${data.urls.full}")`
        document.getElementById('credit-author').innerHTML = `
            <p class="image-author" id="image-author">Photo by ${data.user.name}</p>
            <div class="like-icon-container" id="like-icon-container"></div>
        `
        if(data.location.name) {
            document.getElementById('location').textContent = data.location.name
        } else {
            document.getElementById('location').textContent = 'Someplace on Earth'
        }
    
        if(likedImages.includes(data.id)) {
            renderLikes(data.id, true)
        } else {
            renderLikes(data.id, false)
        }
    
        saveImages()
    } else {
        getBackgroundImage()
    }
}

// Default Background on API fails
function setDefault() {
    document.body.style.backgroundImage = 'url("https://images.unsplash.com/photo-1504257538320-8a5d5f1c0f31?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")'
}


/* Footer Functionality */
// Load Image History and Likes from Local Storage
function loadImages() {
    const storedLikedImages = JSON.parse(localStorage.getItem('likedImages'))
    const storedImagesHistory = JSON.parse(localStorage.getItem('imagesHistory'))

    if (storedLikedImages) {
        likedImages.unshift(...storedLikedImages)
    }

    if (storedImagesHistory) {
        imagesHistory.unshift(...storedImagesHistory)
    }
}

// Like Images
document.addEventListener('click', function(event) {
    if (event.target && event.target.id === 'like-btn') {
        handleClick(event)
    }
});

// Like Images and Call saveImages whenever likedImages or imagesHistory is updated
function handleClick(e) {
    const imageId = e.target.dataset.like;
    if (imageId) {
        if (!likedImages.includes(imageId)) {
            likedImages.push(imageId)
            saveImages()
            renderLikes(imageId, true)
        } else {
            const index = likedImages.indexOf(imageId)
            if (index > -1) {
                likedImages.splice(index, 1)
                saveImages()
                renderLikes(imageId, false)
            }
        }
    }
}

// Render likes
function renderLikes(id, isLiked) {
    const likeIconContainer = document.getElementById('like-icon-container')
    if (isLiked) {
        likeIconContainer.innerHTML = `<i class="fa-solid fa-heart like-btn" id="like-btn" data-like="${id}"></i>`
    } else {
        likeIconContainer.innerHTML = `<i class="fa-regular fa-heart like-btn" id="like-btn" data-like="${id}"></i>`
    }
}

// Save Image History and Likes to Local Storage
function saveImages() {
    localStorage.setItem('likedImages', JSON.stringify(likedImages))
    localStorage.setItem('imagesHistory', JSON.stringify(imagesHistory))
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

// Get a random quote from quotes JSON file
fetch('./quotes/quotes.json')
    .then( res => res.json() )
    .then( data => {
        const randomQuote = data.quotes[Math.floor(Math.random() * data.quotes.length)]
        setQuote(randomQuote);
    })

// Render quotes
function setQuote(randomQuote) {
    document.getElementById('quote').textContent = `${randomQuote.quote}`
    document.getElementById('author').textContent = `-${randomQuote.author}`
}


function updateGreeting() {
    const greetingElement = document.getElementById('greeting')
    const now = new Date();
    const hours = now.getHours();
    let greetingText = '';

    if (hours >= 12 && hours < 18) {
        greetingText = 'Good afternoon'
    } else if (hours >= 18 || hours < 4) {
        greetingText = 'Good evening';
    } else {
        greetingText = 'Good morning'
    }

    greetingElement.textContent = `${greetingText}, Apoorva`
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
