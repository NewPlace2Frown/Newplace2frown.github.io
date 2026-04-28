---
layout: layouts/base.njk
title: Work
permalink: /work/
---

<header class="page-header">
  <h1>Work</h1>
  <p class="page-subtitle">An edit. Twenty frames across all series.</p>
</header>

<section class="work-images">
{% for img in work %}
  <figure>
    <img src="{{ img.src }}" alt="{{ img.alt }}" loading="lazy">
    {% if img.caption %}<figcaption>{{ img.caption }}</figcaption>{% endif %}
  </figure>
{% endfor %}
</section>
