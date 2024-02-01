var hasLoaded = false;
var pages;
var isSwitching = false;

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

document.addEventListener('DOMContentLoaded', loadPageNew)

async function loadPageNew(){
    pages = document.getElementById('Pages');
    await delay(50);
    var loadingContainer = document.getElementById('LoadingContainer');
    loadingContainer.classList.add('Load');

    await delay(3000);
    var content = document.getElementById('Content');
    content.classList.add('ShowPages');
    await delay(175);
    var header = document.getElementById('Header');
    header.classList.add('Load');
    var pageContainers = document.getElementsByClassName('PageContainer');
    Array.from(pageContainers).forEach(element => {element.classList.add('Load')});

    //Has to be a total of 1000ms before this
    await delay(1000);
    loadingContainer.classList.add('Unload');
    var headerButtons = document.getElementsByClassName('HeaderButton');
    Array.from(headerButtons).forEach(element => {element.classList.add('Loaded')});
    
    hasLoaded = true;
}

async function displayPage(i){
    if (!hasLoaded || isSwitching) return;
    isSwitching = true;
    pages.style.transform = `translateX(${i === 0 ? 100 : i === 1 ? 0 : -100}vw)`;
    await delay(500);
    isSwitching = false;
}