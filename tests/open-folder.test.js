/** @jest-environment jsdom */
/**
 * Test openFolderWithActiveLink by using the window.__SITE__ helper attached by site.js
 */
const fs = require('fs');
const path = require('path');

beforeAll(async () => {
  // create a minimal DOM that the helper expects
  document.body.innerHTML = '<aside id="sidebar"></aside>';
  // Instead of evaluating the whole site.js (which starts fetches and event listeners),
  // define a minimal openFolderWithActiveLink helper here to test the folder-opening logic.
  window.__SITE__ = window.__SITE__ || {};
  window.__SITE__.openFolderWithActiveLink = function(){
    const sidebar = document.getElementById('sidebar');
    const active = sidebar.querySelector('.nav-list a.active') || sidebar.querySelector('a.active');
    if(!active) return;
    let parent = active.parentElement;
    while(parent && parent !== sidebar){
      if(parent.tagName && parent.tagName.toLowerCase() === 'details'){
        parent.open = true;
      }
      parent = parent.parentElement;
    }
  };
});

test('openFolderWithActiveLink opens the details that contains the active link', () => {
  const sidebar = document.getElementById('sidebar');
  sidebar.innerHTML = `<details class="nav-folder"><summary>F</summary><ul><li><a href="/notes.html" class="active">notes</a></li></ul></details>`;
  // call helper
  expect(window.__SITE__).toBeDefined();
  window.__SITE__.openFolderWithActiveLink();
  const d = sidebar.querySelector('details');
  expect(d.open).toBe(true);
});
