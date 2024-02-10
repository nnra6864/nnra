class Link{
    constructor(name, link, image){
        this.name = name;
        this.link = link;
        this.image = image;
    }
}

class DataContainer{
    constructor(data) {
        this.name = data && 'Name' in data ? data.Name : '';
        this.summary = data && 'Summary' in data ? data.Summary : '';
        this.image = data && 'Image' in data ? data.Image : '';
        this.links = data?.Links?.length > 0
            ? data.Links.map(link => new Link(link.Name, link.Link, `Images/${link.Image}`)) : [];
        this.description = data?.Description?.length > 0
            ? data.Description.map(element => this.getDescriptionElement(element)) : [];
    }
    
    getDescriptionElement(element){
        switch (element.Type) {
            case "h":
                return `<h1 class="OverlayDescriptionHeader">${element.Content}</h1>`;
            case "p":
                return `<p class="OverlayDescriptionParagraph">${element.Content}</p>`;
            case "i":
                return `<img class="OverlayDescriptionImage" src="${element.Content}" alt="Failed to load the image.">`
            case "y":
                return `<iframe class="OverlayDescriptionEmbed" src="${element.Content}" allowfullscreen alt="Failed to load the video."
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share">
                </iframe>`
        }
    }
}

let pages = document.getElementById('Pages');
let overlay = document.getElementById("Overlay");
let projectImages = document.getElementById("ProjectImages");
let assetImages = document.getElementById("AssetImages");
let errorOverlay = document.getElementById("ErrorOverlay");
let hasLoaded = false;
let isSwitching = false;
let overlayTransitioning = false;
const projectList = [];
const assetList = [];
let loadedProjects = false, loadedAssets = false;
let transitionedProjects = false, transitionedAssets = false;

document.addEventListener('DOMContentLoaded', loadPage);

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function execAfter(func, ms){
    await delay(ms);
    func();
}

async function loadPage(){
    let loadingContainer = document.getElementById('LoadingContainer');
    loadingContainer.classList.add('Load');
    
    await loadData('/Data/Projects.json', projectList);
    await loadData('/Data/Assets.json', assetList);

    await delay(3000);
    let content = document.getElementById('Content');
    content.classList.add('ShowPages');
    execAfter(() => content.classList.add('Loaded'), 1100);
    execAfter(() => loadingContainer.classList.add('Unload'), 1000);
    
    await delay(175);
    let header = document.getElementById('Header');
    header.classList.add('Load');
    execAfter(() => header.classList.add('Loaded'), 1100);
    let pageContainers = document.getElementsByClassName('PageContainer');
    Array.from(pageContainers).forEach(element => {element.classList.add('Load')});
    
    await delay(1000);
    let headerButtons = document.getElementsByClassName('HeaderButton');
    Array.from(headerButtons).forEach(element => {element.classList.add('Loaded')});
    
    hasLoaded = true;
}

async function loadData(jsonFile, list){
    const response = await fetch(jsonFile);
    if (!response.ok) { showErrorOverlay(); throw new Error("Failed to fetch data!"); }
    
    let jsonData;
    try { jsonData = await response.json(); }
    catch (error) { showErrorOverlay(); throw new Error(error); }
    if (!Array.isArray(jsonData) || jsonData.length <= 0) throw new Error("Missing Data!");
    
    for (const data of jsonData)
        handleData(data, list);
    
    if (list === projectList) loadedProjects = true;
    else loadedAssets = true;
}

function handleData(data, list){
    const dataContainer = new DataContainer(data);
    const imageContainer = list === projectList ? projectImages : assetImages;
    const newGridImageContainer = document.createElement('div');
    const newImage = document.createElement('img');
    
    newGridImageContainer.classList.add('GridImageContainer');
    newImage.classList.add('GridImage', list === projectList ? 'ProjectImage' : 'AssetImage');
    newImage.src = dataContainer.image;
    newImage.alt = 'Failed to load the image';
    newImage.dataContainer = dataContainer;
    newImage.addEventListener('click', function (){
        toggleOverlay(true, this.dataContainer);
    });
    newGridImageContainer.appendChild(newImage);
    imageContainer.appendChild(newGridImageContainer);
    console.log(newImage.dataContainer);
}

async function displayPage(i){
    if (!hasLoaded || isSwitching) return;
    isSwitching = true;
    pages.classList.remove("NoTransition");
    pages.classList.add("Transition");
    pages.style.transform = `translateX(${i === 0 ? 100 : i === 1 ? 0 : -100}vw)`;
    await delay(500);
    isSwitching = false;
    execAfter(() => { if (isSwitching) return; pages.classList.remove("Transition"); pages.classList.add("NoTransition"); }, 550);
    let images = [];
    if (i === 0 && !transitionedProjects) { images = document.getElementsByClassName("ProjectImage"); transitionedProjects = true; }
    else if (i === 2 && ! transitionedAssets) { images = document.getElementsByClassName("AssetImage");  transitionedAssets = true; }
    for (const image of images) {
        loadGridImage(image);
        await delay(100);
    }
}

async function loadGridImage(image){
    image.classList.add('Load');
    await delay(1000);
    image.classList.add('Loaded');
}

async function toggleOverlay(shown, data){
    if (overlayTransitioning) return;
    overlayTransitioning = true;
    if (shown) overlay.classList.add('Shown');
    else overlay.classList.remove('Shown');
    await delay(500);
    overlayTransitioning = false;
}

function showErrorOverlay(){
    errorOverlay.classList.add('Shown');
}