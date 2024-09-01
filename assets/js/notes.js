document.addEventListener('click', function(event) {
    var target = event.target;
    if (target.tagName.toLowerCase() === 'a') {
      var href = target.getAttribute('href');
      if (href.startsWith('/notes/')) {
        event.preventDefault();
        fetchNote(href);
      }
    }
  });
  
  function fetchNote(url) {
    fetch(url)
      .then(response => response.text())
      .then(html => {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');
        var noteContent = doc.querySelector('.note-container').outerHTML;
        
        var noteColumns = document.querySelector('.note-columns');
        var newNote = document.createElement('div');
        newNote.innerHTML = noteContent;
        noteColumns.appendChild(newNote.firstChild);
        
        window.history.pushState({}, '', url);
      });
  }