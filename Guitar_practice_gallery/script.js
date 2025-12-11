// script.js

const songsList = document.getElementById('songsList');
const addSongForm = document.getElementById('addSongForm');
const noSongsMessage = document.getElementById('noSongsMessage');

const videosList = document.getElementById('videosList');
const addVideoForm = document.getElementById('addVideoForm');
const noVideosMessage = document.getElementById('noVideosMessage');

const menuButton = document.getElementById('menuButton');
const mobileMenu = document.getElementById('mobileMenu');


function getYouTubeId(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|shorts\/)?([^&?]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function getMediaContentHTML(item) {
    let embedHtml = '';
    const url = item.url;
    
    switch (item.platform) {
        // VIDEO EMBEDS
        case 'youtube':
            const videoId = getYouTubeId(url);
            if (!videoId) return '<p class="text-red-400">Invalid YouTube URL saved.</p>';
            
            const embedUrl = `https://www.youtube.com/embed/${videoId}`;
            embedHtml = `
                <div class="relative w-full h-48 mb-3">
                    <iframe 
                        class="absolute top-0 left-0 w-full h-full rounded-md"
                        src="${embedUrl}" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                </div>
            `;
            break;

        case 'generic':
            embedHtml = `
                <div class="relative w-full h-48 mb-3">
                    <iframe 
                        class="absolute top-0 left-0 w-full h-full rounded-md"
                        src="${url}" 
                        frameborder="0" 
                        allowfullscreen>
                    </iframe>
                </div>
            `;
            break;

        // AUDIO LINKS
        case 'spotify':
        case 'youtube_music':
            let iconText = item.platform === 'spotify' ? 'Spotify' : 'YouTube Music';
            let iconColor = item.platform === 'spotify' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600';
            
            embedHtml = `
                <a href="${url}" target="_blank" rel="noopener noreferrer"
                   class="mb-3 p-4 ${iconColor} text-white font-bold rounded-md transition duration-300 text-center">
                    Listen on ${iconText} (Opens in New Tab)
                </a>
            `;
            break;
            
        default:
            embedHtml = `<p class="text-red-400">Unknown media platform: ${item.platform}</p>`;
    }

    return embedHtml;
}

function renderItems(listElement, messageElement, storageKey) {
    const items = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    listElement.innerHTML = ''; 

    if (items.length === 0) {
        listElement.appendChild(messageElement);
        messageElement.classList.remove('hidden');
        return;
    }
    messageElement.classList.add('hidden');

    items.forEach((item, index) => {
        const mediaContent = getMediaContentHTML(item);

        const itemCard = document.createElement('div');
        itemCard.className = 'bg-gray-800 p-4 rounded-lg shadow-xl border-t-4 border-[#00BCFF] flex flex-col';
        itemCard.innerHTML = `
            <h3 class="text-xl font-bold text-white mb-2">${item.title}</h3>
            
            ${mediaContent} 

            <p class="text-sm text-gray-400 mb-3">
                <strong>Notes:</strong> ${item.notes || 'No notes added.'}
            </p>
            
            <button data-index="${index}" class="remove-btn mt-auto bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition duration-300 text-sm">
                Remove
            </button>
        `;
        listElement.appendChild(itemCard);
    });
}

function handleAddItem(e, titleId, urlId, platformId, storageKey, renderCallback) {
    e.preventDefault();

    const title = document.getElementById(titleId).value.trim();
    const url = document.getElementById(urlId).value.trim();
    const platform = document.getElementById(platformId).value;

    let notesElementId;
    if (titleId === 'songTitle') {
        notesElementId = 'songNotes';
    } else if (titleId === 'videoTitle') {
        notesElementId = 'videoNotes';
    }
    const notes = document.getElementById(notesElementId).value.trim();
    
    if (!title || !url) {
        alert("Please enter both a Title and a URL.");
        return;
    }

    if (platform === 'youtube' && !getYouTubeId(url)) {
        alert("Please enter a valid YouTube video URL for the selected platform.");
        return;
    }

    const newItem = {
        title: title,
        url: url,
        notes: notes,
        platform: platform, 
        addedAt: new Date().toISOString()
    };

    const items = JSON.parse(localStorage.getItem(storageKey)) || [];
    items.push(newItem);
    localStorage.setItem(storageKey, JSON.stringify(items));

    renderCallback(); 
    e.target.reset(); 
}

function handleRemoveItem(e, listElement, storageKey) {
    if (e.target.classList.contains('remove-btn')) {
        const indexToRemove = parseInt(e.target.dataset.index);
        
        const items = JSON.parse(localStorage.getItem(storageKey));
        items.splice(indexToRemove, 1);
        
        localStorage.setItem(storageKey, JSON.stringify(items));
        
        if (listElement === songsList) {
            renderSongs();
        } else if (listElement === videosList) {
            renderVideos();
        }
    }
}


function renderSongs() {
    renderItems(songsList, noSongsMessage, 'guitarPracticeSongs');
}

function renderVideos() {
    renderItems(videosList, noVideosMessage, 'guitarPracticeVideos');
}


// Event Listeners for Forms
if (addSongForm) {
    addSongForm.addEventListener('submit', (e) => handleAddItem(e, 'songTitle', 'songMediaUrl', 'songPlatform', 'guitarPracticeSongs', renderSongs));
}
if (addVideoForm) {
    addVideoForm.addEventListener('submit', (e) => handleAddItem(e, 'videoTitle', 'videoMediaUrl', 'videoPlatform', 'guitarPracticeVideos', renderVideos));
}

// Event Listeners for Remove Buttons
if (songsList) {
    songsList.addEventListener('click', (e) => handleRemoveItem(e, songsList, 'guitarPracticeSongs'));
}
if (videosList) {
    videosList.addEventListener('click', (e) => handleRemoveItem(e, videosList, 'guitarPracticeVideos'));
}


// Initialization
document.addEventListener('DOMContentLoaded', () => {
    renderSongs();
    renderVideos();
    
    // Mobile Menu Toggle Logic
    if (menuButton && mobileMenu) {
        function toggleMenu() {
            mobileMenu.classList.toggle('hidden');
        }

        menuButton.addEventListener('click', toggleMenu);
        
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (!mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            });
        });
    }
});