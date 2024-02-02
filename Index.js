let hasLoaded = false;
let pages = document.getElementById('Pages');
let isSwitching = false;
let loadedProjects = false, loadedAssets = false;
let overlay = document.getElementById("Overlay");
let overlayTransitioning = false;

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

document.addEventListener('DOMContentLoaded', loadPageNew)

async function loadPageNew(){
    await delay(50);
    let loadingContainer = document.getElementById('LoadingContainer');
    loadingContainer.classList.add('Load');

    await delay(3000);
    let content = document.getElementById('Content');
    content.classList.add('ShowPages');
    await delay(175);
    let header = document.getElementById('Header');
    header.classList.add('Load');
    let pageContainers = document.getElementsByClassName('PageContainer');
    Array.from(pageContainers).forEach(element => {element.classList.add('Load')});

    //Has to be a total of 1000ms before this
    await delay(1000);
    loadingContainer.classList.add('Unload');
    let headerButtons = document.getElementsByClassName('HeaderButton');
    Array.from(headerButtons).forEach(element => {element.classList.add('Loaded')});
    
    hasLoaded = true;
}

async function displayPage(i){
    if (!hasLoaded || isSwitching) return;
    isSwitching = true;
    pages.style.transform = `translateX(${i === 0 ? 100 : i === 1 ? 0 : -100}vw)`;
    await delay(500);
    isSwitching = false;
    let images = [];
    if (i === 0 && !loadedProjects) { images = document.getElementsByClassName("ProjectImage"); loadedProjects = true; }
    else if (i === 2 && !loadedAssets) { images = document.getElementsByClassName("AssetImage"); loadedAssets = true; }
    for (const image of images) {
        loadGridImage(image);
        await delay(100);
    }
}

async function loadGridImage(image){
    image.classList.add('Load');
    await delay(1000)
    image.classList.add('Loaded');
}

async function toggleOverlay(shown){
    if (overlayTransitioning) return;
    overlayTransitioning = true;
    if (shown) overlay.classList.add('Shown');
    else overlay.classList.remove('Shown');
    await delay(500);
    overlayTransitioning = false;
}