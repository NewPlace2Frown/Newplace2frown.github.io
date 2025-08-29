// Simple auto-rotating gallery. Fetches /assets/media/index.json and cycles images.
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('gallery');
  if(!container) return;

  try{
    const res = await fetch('/assets/media/index.json');
    if(!res.ok) throw new Error('No index');
    const data = await res.json();
    const galleryKey = container.getAttribute('data-gallery') || '';
    const imgs = data[galleryKey] || data[''] || [];
    if(!imgs || imgs.length === 0) return;

    // Create img element and cycle
    const img = document.createElement('img');
    img.alt = '';
    img.loading = 'lazy';
    // enforce consistent vertical size (~80% viewport height), keep aspect ratio
    img.style.height = '80vh';
    img.style.width = 'auto';
    img.style.display = 'block';
    img.style.margin = '0 auto';
    img.style.objectFit = 'contain';
    container.appendChild(img);

    // caption
    let caption = document.getElementById('gallery-caption');
    if(!caption){
      caption = document.createElement('div');
      caption.id = 'gallery-caption';
      caption.style.textAlign = 'center';
      caption.style.marginTop = '8px';
      caption.style.color = 'var(--text)';
      container.appendChild(caption);
    }

    let i = 0;
    function niceName(url){
      try{
        const parts = url.split('/');
        let name = parts[parts.length-1];
        name = name.replace(/\.[^/.]+$/, ''); // remove extension
        name = decodeURIComponent(name);
        name = name.replace(/[-_]+/g, ' ');
        return name;
      }catch(e){ return url; }
    }

    function show(){
      const src = imgs[i];
      img.src = src;
      caption.textContent = niceName(src);
      i = (i + 1) % imgs.length;
    }

    show();
    const interval = container.getAttribute('data-interval') || 4000;
    setInterval(show, Number(interval));
  }catch(e){
    console.warn('Gallery load failed', e);
  }
});
