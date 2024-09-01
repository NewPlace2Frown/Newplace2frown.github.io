document.addEventListener('DOMContentLoaded', (event) => {
  document.body.addEventListener('click', function(event) {
      var target = event.target;
      if (target.tagName.toLowerCase() === 'a') {
          var href = target.getAttribute('href');
          if (href && href.startsWith('/notes/')) {
              event.preventDefault();
              fetchNote(href);
          }
      }
  });
});

function fetchNote(url) {
  fetch(url)
      .then(response => response.text())
      .then(html => {
          var parser = new DOMParser();
          var doc = parser.parseFromString(html, 'text/html');
          var noteContent = doc.querySelector('.note-container');
          
          if (noteContent) {
              var noteColumns = document.getElementById('note-columns');
              
              // Check if this note is already open
              var existingNote = noteColumns.querySelector(`[data-url="${url}"]`);
              if (existingNote) {
                  // If it exists, scroll to it
                  existingNote.scrollIntoView({ behavior: 'smooth' });
              } else {
                  // If it doesn't exist, add it
                  noteColumns.appendChild(noteContent);
                  noteContent.scrollIntoView({ behavior: 'smooth' });
              }
              
              window.history.pushState({}, '', url);
          }
      });
}

// Initial load of the first note if on the homepage
if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
  var firstNoteLink = document.querySelector('.note-content a');
  if (firstNoteLink) {
      fetchNote(firstNoteLink.getAttribute('href'));
  }
}