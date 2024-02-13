class DataContainer{
    constructor(data) {
        if (!data) return;
        if ('Name' in data){
            const name = document.createElement('p');
            name.innerHTML = 'Content' in data.Name ? data.Name.Content : '';
            name.classList.add('OverlayHeaderName');
            this.applyStyles(name, data.Name);
            this.name = name;
        }
        if ('Summary' in data){
            const sum = document.createElement('p');
            sum.innerHTML = 'Content' in data.Summary ? data.Summary.Content : '';
            sum.classList.add('OverlayHeaderSummary');
            this.applyStyles(sum, data.Summary);
            this.summary = sum;
        }
        if ('Image' in data){
            const img = document.createElement('img');
            img.src = 'Content' in data.Image ? data.Image.Content : '';
            img.classList.add('OverlayHeaderImage');
            this.applyStyles(img, data.Image);
            this.image = img;
        }
        this.links = data?.Links?.length > 0
            ? data.Links.map(element => this.getLinkElement(element)) : [];
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
                header.innerHTML = 'Content' in element ? element.Content : '';
                this.applyStyles(header, element)
                div.appendChild(header);
                return div;
            case "p":
                const paragraph = document.createElement('p');
                paragraph.classList.add('OverlayDescriptionParagraph');
                paragraph.innerHTML = element.hasOwnProperty('Content') ? element.Content.join('<br>') : '';
                this.applyStyles(paragraph, element)
                div.appendChild(paragraph);
                return div;
            case "i":
                const img = document.createElement('img');
                img.classList.add('OverlayDescriptionImage');
                img.src = 'Content' in element ? element.Content : '';
                img.alt = "Failed to load the image.";
                this.applyStyles(img, element)
                div.appendChild(img);
                return div;
            case "y":
                const iframe = document.createElement('iframe');
                iframe.classList.add('OverlayDescriptionEmbed');
                iframe.src = 'Content' in element ? element.Content + '?suggestedQuality=hd1440' : '';
                iframe.allowFullscreen = true;
                iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
                iframe.alt = "Failed to load the video.";
                this.applyStyles(iframe, element)
                div.appendChild(iframe);
                return div;
            case "s":
                const s = document.createElement('div');
                s.classList.add('OverlayDescriptionSpace');
                this.applyStyles(s, element)
                div.appendChild(s);
                return div;
            default:
                return null;
        }
    }
    
    getLinkElement(element) {
        let linkImg = document.createElement('img');
        linkImg.src = `Images/${element.Image}.png`;
        let linkText = document.createElement('a');
        linkText.href = element.Link;
        linkText.textContent = element.Text;
        let linkDiv = document.createElement('div');
        linkDiv.classList.add('OverlayHeaderLink');
        linkDiv.appendChild(linkImg);
        linkDiv.appendChild(linkText);
        return linkDiv;
    }
    
    applyStyles(htmlElement, element){
        'Styles' in element && Object.entries(element.Styles).forEach(([property, value]) =>
            htmlElement.style[property.toLowerCase()] = value);
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

let overlayContainer = document.getElementById("OverlayContainer");
let overlayHeader = document.getElementById("OverlayHeader");
let overlayHeaderNameContainer = document.getElementById("OverlayHeaderNameContainer");
let overlayHeaderSummaryContainer = document.getElementById("OverlayHeaderSummaryContainer");
let overlayHeaderImageContainer = document.getElementById("OverlayHeaderImageContainer");
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

function clearChildElements(element){
    while (element.childElementCount > 0) element.removeChild(element.firstChild);
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
    newImage.src = dataContainer.image.src;
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
    overlayContainer.scrollTop = 0;
}

async function loadOverlayData(data){
    overlayHeaderImageContainer.appendChild(data.image);
    overlayHeaderNameContainer.appendChild(data.name);
    overlayHeaderSummaryContainer.appendChild(data.summary);
    data.links.forEach(l => {
        overlayHeaderLinks.appendChild(l);
    });
    data.description.forEach(el => {
        overlayDescription.appendChild(el);
    });
}

function clearOverlayData(){
    clearChildElements(overlayHeaderNameContainer);
    clearChildElements(overlayHeaderSummaryContainer);
    clearChildElements(overlayHeaderImageContainer);
    clearChildElements(overlayHeaderLinks);
    clearChildElements(overlayDescription);
}

function updateOverlayDescriptionWidth(){
    overlayDescription.style.width = `${overlayHeader.clientWidth}px`;
}

function showErrorOverlay(){
    errorOverlay.classList.add('Shown');
}