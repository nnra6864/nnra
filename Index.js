class Link{
    constructor(name, link, image){
        this.name = name;
        this.link = link;
        this.image = image;
    }
}

class DataContainer{
    constructor(data) {
        this.name = data && 'Name' in data ? data.Name : 'Project Name';
        this.summary = data && 'Summary' in data ? data.Summary : 'Project Summary';
        this.image = data && 'Image' in data ? data.Image : 'Images/Icon.gif';
        this.links = data?.Links?.length > 0
            ? data.Links.map(link => new Link(link.Name, link.Link, `Images/${link.Image}.png`)) : [];
        this.description = data?.Description?.length > 0
            ? data.Description.map(element => this.getDescriptionElement(element)) : [];
    }
    
    getDescriptionElement(element){
        const div = document.createElement('div');
        div.classList.add('OverlayDescriptionItem');
        switch (element.Type) {
            case "h":
                const header = document.createElement('h1');
                header.classList.add('OverlayDescriptionHeader');
                header.textContent = 'Content' in element ? element.Content : '';
                'Styles' in element && Object.entries(element.Styles).forEach(([property, value]) =>
                    header.style[property.toLowerCase()] = value);
                div.appendChild(header);
                return div;
            case "p":
                const paragraph = document.createElement('p');
                paragraph.classList.add('OverlayDescriptionParagraph');
                paragraph.textContent = 'Content' in element ? element.Content : '';
                'Styles' in element && Object.entries(element.Styles).forEach(([property, value]) =>
                    paragraph.style[property.toLowerCase()] = value);
                div.appendChild(paragraph);
                return div;
            case "i":
                const img = document.createElement('img');
                img.classList.add('OverlayDescriptionImage');
                img.src = 'Content' in element ? element.Content : '';
                img.alt = "Failed to load the image.";
                'Styles' in element && Object.entries(element.Styles).forEach(([property, value]) =>
                    img.style[property.toLowerCase()] = value);
                div.appendChild(img);
                return div;
            case "y":
                const iframe = document.createElement('iframe');
                iframe.classList.add('OverlayDescriptionEmbed');
                iframe.src = 'Content' in element ? element.Content : '';
                iframe.allowFullscreen = true;
                iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
                iframe.alt = "Failed to load the video.";
                'Styles' in element && Object.entries(element.Styles).forEach(([property, value]) =>
                    iframe.style[property.toLowerCase()] = value);
                div.appendChild(iframe);
                return div;
            case "br":
                const br = document.createElement('br');
                br.style.marginBottom = 'Size' in element ? element.Size : '10px';
                'Styles' in element && Object.entries(element.Styles).forEach(([property, value]) =>
                    br.style[property.toLowerCase()] = value);
                div.appendChild(br);
                return div;
            default:
                return null;
        }
    }
}

let pages = document.getElementById('Pages');
let overlay = document.getElementById("Overlay");
let projectImages = document.getElementById("ProjectImages");
let assetImages = document.getElementById("AssetImages");
let hasLoaded = false;
let isSwitching = false;

const projectList = [];
const assetList = [];
let loadedProjects = false, loadedAssets = false;
let transitionedProjects = false, transitionedAssets = false;

let overlayHeader = document.getElementById("OverlayHeader");
let overlayHeaderImage = document.getElementById("OverlayHeaderImage");
let overlayHeaderName = document.getElementById("OverlayHeaderName");
let overlayHeaderSummary = document.getElementById("OverlayHeaderSummary");
let overlayHeaderLinks = document.getElementById("OverlayHeaderLinks");
let overlayDescription = document.getElementById("OverlayDescription");
let errorOverlay = document.getElementById("ErrorOverlay");
let overlayTransitioning = false;

document.addEventListener('DOMContentLoaded', loadPage);

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function execAfter(func, ms){
    await delay(ms);
    func();
}

async function loadPage(){
    await loadData('/Data/Projects.json', projectList);
    await loadData('/Data/Assets.json', assetList);

    let loadingContainer = document.getElementById('LoadingContainer');
    loadingContainer.classList.add('Load');
    
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
    execAfter(() => overlayTransitioning = false, 510)
    if (!shown)
    {
        overlay.classList.remove('Shown');
        window.removeEventListener('resize', updateOverlayDescriptionWidth);
        return;
    }
    overlay.classList.add('Shown');
    clearOverlayData();
    loadOverlayData(data);
    updateOverlayDescriptionWidth();
    window.addEventListener('resize', updateOverlayDescriptionWidth);
}

async function loadOverlayData(data){
    overlayHeaderImage.src = data.image;
    overlayHeaderName.textContent = data.name;
    overlayHeaderSummary.textContent = data.summary;
    data.links.forEach(link => {
        let linkImg = document.createElement('img');
        linkImg.src = link.image;
        let linkText = document.createElement('a');
        linkText.href = link.link;
        linkText.textContent = link.name;
        let linkDiv = document.createElement('div');
        linkDiv.classList.add('OverlayHeaderLink');
        linkDiv.appendChild(linkImg);
        linkDiv.appendChild(linkText);
        overlayHeaderLinks.appendChild(linkDiv);
        console.log(linkImg.src);
    });
    data.description.forEach(el => {
        overlayDescription.appendChild(el);
    });
}

function clearOverlayData(){
    overlayHeaderImage.src = '';
    overlayHeaderName.textContent = '';
    overlayHeaderSummary.textContent = '';
    while(overlayHeaderLinks.childElementCount > 0) overlayHeaderLinks.removeChild(overlayHeaderLinks.firstChild);
    while (overlayDescription.childElementCount > 0) overlayDescription.removeChild(overlayDescription.firstChild);
}

function updateOverlayDescriptionWidth(){
    overlayDescription.style.width = `${overlayHeader.clientWidth}px`;
}

function showErrorOverlay(){
    errorOverlay.classList.add('Shown');
}