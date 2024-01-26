var hasLoaded = false;

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

document.addEventListener('DOMContentLoaded', loadPage)

async function loadPage(){
    await delay(0);
    var header = document.getElementById('Header');
    header.classList.add('Load');

    await delay(750);
    var loadingContainer = document.getElementById('LoadingContainer');
    loadingContainer.classList.add('Load')

    await delay(750)
    //Has to be a total of 1000ms before this
    var headerButtons = document.getElementsByClassName('HeaderButton');
    Array.from(headerButtons).forEach(element => {element.classList.add('Loaded')});

    await delay(3000)
    var content = document.getElementById('Content');
    content.classList.add('ShowPages');

    hasLoaded = true;
}