var hasLoaded = false;
var pages;

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

document.addEventListener('DOMContentLoaded', loadPage)

async function loadPage(){
    pages = document.getElementById('Pages');
    await delay(50);
    var header = document.getElementById('Header');
    header.classList.add('Load');

    await delay(750);
    var loadingContainer = document.getElementById('LoadingContainer');
    loadingContainer.classList.add('Load')

    await delay(250)
    //Has to be a total of 1000ms before this
    var headerButtons = document.getElementsByClassName('HeaderButton');
    Array.from(headerButtons).forEach(element => {element.classList.add('Loaded')});

    var pageContainers = document.getElementsByClassName('PageContainer');
    Array.from(pageContainers).forEach(element => {element.classList.add('Load')});

    await delay(3000)
    var content = document.getElementById('Content');
    content.classList.add('ShowPages');

    await delay(1000)

    hasLoaded = true;
}

function displayPage(i){
    console.log('here');
    if (!hasLoaded) return;
    pages.style.transform = `translateX(${i === 0 ? 100 : i === 1 ? 0 : -100}vw)`;
    console.log('displayed');
}