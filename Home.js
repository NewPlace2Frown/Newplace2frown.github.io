const slideshow = document.getElementById("slideshow");
const photo = document.getElementById("photo");
const pauseLink = document.getElementById("pauseLink");


const photos = [];
for (let i = 1; i <= 135; i++) {
  let num = i.toString().padStart(3, '0');
  let filePath = `Media/Home/Photo${num}.jpeg`;
  photos.push(filePath);
}

let currentPhoto = 0;
photo.src = photos[currentPhoto];

let slideshowTimer = null;

function nextPhoto() {
  currentPhoto = (currentPhoto + 1) % photos.length;
  photo.src = photos[currentPhoto];
}

function prevPhoto() {
  currentPhoto = (currentPhoto - 1 + photos.length) % photos.length;
  photo.src = photos[currentPhoto];
}

function startSlideshow() {
  // Check if the slideshow is already running
  if (!slideshowTimer) {
    // Start the slideshow timer
    slideshowTimer = setInterval(nextPhoto, 10000); // 10 seconds interval
  }
}

function stopSlideshow() {
  // Check if the slideshow is running
  if (slideshowTimer) {
    // Stop the slideshow timer
    clearInterval(slideshowTimer);
    slideshowTimer = null; // Reset the timer variable
  }
}

function toggleSlideshow() {
  if (slideshowTimer) {
    stopSlideshow();
    pauseLink.textContent = "Resume Slideshow";
  } else {
    startSlideshow();
    pauseLink.textContent = "Pause Slideshow";
  }
}

slideshow.addEventListener("click", nextPhoto);

window.addEventListener("keydown", function(event) {
  switch(event.keyCode) {
    case 37: // Left arrow
      prevPhoto();
      break;
    case 39: // Right arrow
      nextPhoto();
      break;
  }
});

var toggler = document.getElementsByClassName("caret");
var i;

for (i = 0; i < toggler.length; i++) {
  toggler[i].addEventListener("click", function() {
    this.parentElement.querySelector(".nested").classList.toggle("active");
    this.classList.toggle("caret-down");
  });
}

// Start the slideshow
startSlideshow();
// Add event listener to the pause link
pauseLink.addEventListener("click", toggleSlideshow);