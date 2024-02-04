class DataContainer{
    constructor(data) {
        this.name = data && data.Name || '';
        this.summary = data && data.Summary || '';
        this.description = data && data.Description || '';

        this.links = {};
        for (const key in data)
            if (data.hasOwnProperty(key) && key !== 'Name' && key !== 'Summary' && key !== 'Description')
                this.links[key] = data[key];
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

async function loadPage(){
    await loadData('/Data/Projects.json', projectList);
    await loadData('/Data/Assets.json', assetList);
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

async function loadData(jsonFile, list){
    const response = await fetch(jsonFile);
    if (!response.ok) { showErrorOverlay(); throw new Error("Failed to Fetch Data!"); }
    
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
    newImage.src = dataContainer.links['Image'];
    newImage.alt = 'Failed to load the image';
    newImage.dataContainer = dataContainer;
    newImage.addEventListener('click', function (){
        toggleOverlay(true, this.dataContainer);
    });
    newGridImageContainer.appendChild(newImage);
    imageContainer.appendChild(newGridImageContainer);
}

async function displayPage(i){
    if (!hasLoaded || isSwitching) return;
    isSwitching = true;
    pages.style.transform = `translateX(${i === 0 ? 100 : i === 1 ? 0 : -100}vw)`;
    await delay(500);
    isSwitching = false;
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