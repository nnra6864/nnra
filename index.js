class DataContainer{
    data;
    htmlElement;
    constructor(data) {
        if (!data) return;
        this.data = data;
        if ('Name' in data){
            const name = 'Content' in data.Name ? data.Name.Content : '';
            const nameElement = document.createElement('p');
            nameElement.innerHTML = name;
            nameElement.classList.add('OverlayHeaderName');
            this.applyStyles(nameElement, data.Name);
            this.name = name;
            this.nameElement = nameElement;
        }
        if ('Summary' in data){
            const sum = 'Content' in data.Summary ? data.Summary.Content : '';
            const sumElement = document.createElement('p');
            sumElement.innerHTML = sum;
            sumElement.classList.add('OverlayHeaderSummary');
            this.applyStyles(sumElement, data.Summary);
            this.summary = sum;
            this.summaryElement = sumElement;
        }
        if ('Image' in data){
            const img = 'Content' in data.Image ? data.Image.Content : '';
            const imgElement = document.createElement('img');
            imgElement.src = img;
            imgElement.classList.add('OverlayHeaderImage');
            this.applyStyles(imgElement, data.Image);
            this.image = img;
            this.imageElement = imgElement;
        }
        this.type = 'Content' in data.Type ? data.Type.Content : '';
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
                const vid = document.createElement('iframe');
                vid.classList.add('OverlayDescriptionEmbed');
                vid.src = 'Content' in element ? element.Content + '?suggestedQuality=hd1440' : '';
                vid.allowFullscreen = true;
                vid.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
                vid.alt = "Failed to load the video.";
                this.applyStyles(vid, element)
                div.appendChild(vid);
                return div;
            case "m":
                const song = document.createElement('iframe');
                song.width = "100%";
                song.height = "166";
                song.scrolling = "no";
                song.frameBorder = "no";
                song.allow = "autoplay";
                song.src = 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(element.Content);
                song.style.backgroundColor = '#2e3440';
                song.allowFullscreen = true;

                const songWidget = SC.Widget(song);
                const volumeSlider = document.createElement('input');
                volumeSlider.type = "range";
                volumeSlider.min = "0";
                volumeSlider.max = "100";
                volumeSlider.value = "100";
                volumeSlider.classList.add('vertical-slider');
                volumeSlider.addEventListener('input', (event) => {
                    songWidget.setVolume(event.target.value);
                });
                volumeSlider.dispatchEvent(new Event('input'));
                
                div.appendChild(song);
                div.appendChild(volumeSlider);
                this.applyStyles(div, element);
                return div;
            case "s":
                const s = document.createElement('div');
                s.classList.add('OverlayDescriptionSpace');
                this.applyStyles(s, element)
                div.appendChild(s);
                return div;
            case "l":
                const l = document.createElement('div');
                l.classList.add('HorizontalLine');
                this.applyStyles(l, element)
                div.appendChild(l);
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

//Required for SoundCloud
const SCScript = document.createElement('script');
SCScript.type = 'text/javascript';
SCScript.src = 'https://w.soundcloud.com/player/api.js';
document.head.appendChild(SCScript);

let pages = document.getElementById('Pages');
let overlay = document.getElementById("Overlay");
let projectImages = document.getElementById("ProjectImages");
let hasLoaded = false;
let isSwitching = false;

let knowledgeTooltipElements = Array.from(document.getElementsByClassName("KnowledgeTooltip"));
const knowledgeTooltip = 
`Fluent/Good/Fast - Solid knowledge and ease of use
Intermediate/Decent - Able to navigate/use it
Bad/Slow - Never tried or bad at it`

const projectList = [];
let displayedProjects = [];
let loadedProjects = false, loadedPosts = false;
const projectSearch = document.getElementById("ProjectSearch");
const projectType = document.getElementById("ProjectType")
let projectsAscending = true;
let reloadCount = 0;

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

document.addEventListener('keydown', function(event) {
    if (event.keyCode === 9) { // Key code for tab key is 9
        event.preventDefault(); // Prevent default tab behavior
    }
});

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
    for (const file of (await loadProjectFiles())) { await loadData(file); }
    projectList.reverse();
    loadedProjects = true;
   
    applyTooltip(knowledgeTooltipElements, knowledgeTooltip);
    
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

async function loadProjectFiles(){
    let index = 0;
    const files = [];
    let response;
    while (true){
        response = await fetch(`Data/Projects/${index}.json`);
        if (!response.ok) break;
        files.push(response);
        index++;
    }
    if (files.length < 1) { showErrorOverlay(); throw new Error("Failed to fetch projects data!"); }
    return files;
}

async function loadData(jsonFile){
    let jsonData;
    try { jsonData = await jsonFile.json(); }
    catch (error) { showErrorOverlay(); throw new Error(error); }
    if (!Array.isArray(jsonData) || jsonData.length <= 0) throw new Error("Missing json data!");
    handleData(jsonData[0]);
}

function handleData(data){
    const project = new DataContainer(data);
    const newGridImageContainer = document.createElement('div');
    const newImage = document.createElement('img');
    
    newGridImageContainer.classList.add('GridImageContainer');
    newImage.classList.add('GridImage', 'ProjectImage');
    newImage.src = project.imageElement.src;
    newImage.alt = 'Failed to load the image';
    newImage.dataContainer = project;
    newImage.addEventListener('click', function (){
        toggleOverlay(true, this.dataContainer);
    });
    newGridImageContainer.appendChild(newImage);
    project.htmlElement = newGridImageContainer;
    projectList.push(project);
}

function filterProjects(){
    if (projectType.value !== "All")
        displayedProjects = displayedProjects.filter(proj =>{
            return proj.type.toLowerCase() === projectType.value.toLowerCase();
        });
    if (projectSearch.value !== "")
        displayedProjects = displayedProjects.filter(proj => {
            return proj.name.toLowerCase().includes(projectSearch.value.toLowerCase());
        });
    //if (projectsAscending) displayedProjects.reverse();
}

async function populateProjects(){
    const rc = reloadCount;
    displayedProjects = projectList;
    filterProjects();
    
    projectImages.replaceChildren();
    for (const proj of displayedProjects) {
        if (rc !== reloadCount) continue;
        projectImages.appendChild(proj.htmlElement);
        unloadGridImage(proj.htmlElement.firstChild);
        loadGridImage(proj.htmlElement.firstChild);
        await delay(50);
    }
}

function refreshProjects(){
    reloadCount++;
    populateProjects();
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
    if (i === 0 && reloadCount === 0) refreshProjects();
}

function unloadGridImage(image){
    image.classList.remove("Load");
    image.classList.remove("Loaded");
}

async function loadGridImage(image){
    const rc = reloadCount;
    await delay(50); //Prevents images from popping in for some reason
    if (rc !== reloadCount) return;
    image.classList.add("Load");
    await delay(1000);
    if (rc !== reloadCount) return;
    image.classList.add("Loaded");
}

async function toggleOverlay(shown, data){
    if (overlayTransitioning) return;
    overlayTransitioning = true;
    execAfter(() => overlayTransitioning = false, 510)
    
    if (!shown)
    {
        overlay.classList.remove('Shown');
        window.removeEventListener('resize', updateOverlayDescriptionWidth);
        execAfter(() => clearOverlayData(), 510)
        return;
    }
    overlay.classList.add('Shown');
    loadOverlayData(data);
    updateOverlayDescriptionWidth();
    window.addEventListener('resize', updateOverlayDescriptionWidth);
    overlayContainer.scrollTop = 0;
}

async function loadOverlayData(data){
    overlayHeaderImageContainer.appendChild(data.imageElement);
    overlayHeaderNameContainer.appendChild(data.nameElement);
    overlayHeaderSummaryContainer.appendChild(data.summaryElement);
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

function applyTooltip(elements, tooltip){
    if (elements.length < 1) return;
    elements.forEach(el => {
       el.title = tooltip; 
    });
}