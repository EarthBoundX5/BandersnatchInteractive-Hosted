// =============================================================================
// Bandersnatch Interactive Player — scripts.js
// Modified to support a HOSTED video file (no drag-and-drop required).
//
// HOW TO CONFIGURE:
//   1. Place your video file in the same folder as index.html (or a sub-folder).
//   2. Set HOSTED_VIDEO_URL below to the relative or absolute path of your video.
//      Examples:
//        var HOSTED_VIDEO_URL = 'video/bandersnatch.mkv';
//        var HOSTED_VIDEO_URL = 'bandersnatch.mkv';
//        var HOSTED_VIDEO_URL = '/videos/bandersnatch.mkv';
//   3. If you want to keep the drag-and-drop fallback available, set
//      SHOW_FILE_SELECTOR_FALLBACK = true.
//   4. Deploy all files to IIS (see web.config for MIME type configuration).
// =============================================================================

var HOSTED_VIDEO_URL = 'video/bandersnatch.mkv';   // <-- CHANGE THIS to your video path
var SHOW_FILE_SELECTOR_FALLBACK = false;            // set true to also show the file-picker UI

// =============================================================================
// Everything below this line is the original player logic — do not edit unless
// you know what you are doing.
// =============================================================================

'use strict';

var video_selector = document.getElementById('v');
var video_source_selector = video_selector;
var file_selector = document.getElementById('wrapper-file');

function startPlayback() {
    file_selector.style.display = 'none';
    document.getElementById('wrapper-video').style.display = 'block';
    video_selector.load();
    playSegment(0);
}

function askReset() {
    if (confirm('Reset all choices and watch history?')) {
        localStorage.clear();
        location.reload();
    }
}

// ── Segment / choice data is loaded from bandersnatch.js ──────────────────────

var segments;        // populated by bandersnatch.js
var segmentMap;      // populated by bandersnatch.js

function getSegment(id) {
    for (var i = 0; i < segments.length; i++) {
        if (segments[i].id === id) return segments[i];
    }
    return null;
}

// ── Playback state ─────────────────────────────────────────────────────────────

var current_segment = null;
var choice_timer = null;
var choice_deadline = 0;
var pending_segment = null;
var playback_history = [];

try {
    var saved = localStorage.getItem('playback_history');
    if (saved) playback_history = JSON.parse(saved);
} catch(e) { playback_history = []; }

function saveHistory() {
    try { localStorage.setItem('playback_history', JSON.stringify(playback_history)); } catch(e) {}
}

function playSegment(segIndex) {
    current_segment = segments[segIndex];
    pending_segment = null;

    if (choice_timer) { clearInterval(choice_timer); choice_timer = null; }
    hideChoices();

    var start = current_segment.ts / 1000;
    video_selector.currentTime = start;
    video_selector.play();

    playback_history.push(current_segment.id);
    saveHistory();
}

function getNextSegment() {
    if (!current_segment) return 0;

    // Check for a saved choice for this segment
    var savedChoice = null;
    try { savedChoice = localStorage.getItem('choice_' + current_segment.id); } catch(e) {}

    if (current_segment.choices && current_segment.choices.length > 0) {
        if (savedChoice !== null) {
            var idx = parseInt(savedChoice);
            if (!isNaN(idx) && idx < current_segment.choices.length) {
                return getSegmentIndex(current_segment.choices[idx].segmentId);
            }
        }
        return getSegmentIndex(current_segment.choices[0].segmentId);
    }

    if (current_segment.defaultNext) {
        return getSegmentIndex(current_segment.defaultNext);
    }

    return 0; // restart from beginning
}

function getSegmentIndex(id) {
    for (var i = 0; i < segments.length; i++) {
        if (segments[i].id === id) return i;
    }
    return 0;
}

// ── Choice UI ──────────────────────────────────────────────────────────────────

var choice_overlay = null;

function createChoiceOverlay() {
    if (choice_overlay) return;
    choice_overlay = document.createElement('div');
    choice_overlay.id = 'choice-overlay';
    choice_overlay.style.cssText =
        'position:fixed;bottom:15%;left:0;width:100%;display:none;' +
        'justify-content:center;gap:40px;z-index:1000;pointer-events:none;';
    document.body.appendChild(choice_overlay);
}

function showChoices(choices, timeoutSecs, defaultChoiceIdx) {
    createChoiceOverlay();
    choice_overlay.innerHTML = '';
    choice_overlay.style.display = 'flex';

    var deadline = Date.now() + timeoutSecs * 1000;
    choice_deadline = deadline;

    choices.forEach(function(choice, idx) {
        var btn = document.createElement('div');
        btn.className = 'choice-btn';
        btn.style.cssText =
            'background:rgba(0,0,0,0.75);color:#fff;border:3px solid #fff;' +
            'padding:18px 36px;font-size:1.4rem;font-family:sans-serif;' +
            'cursor:pointer;pointer-events:all;border-radius:6px;' +
            'transition:background 0.2s,border-color 0.2s;min-width:180px;text-align:center;';

        var label = document.createElement('div');
        label.textContent = choice.text || ('Choice ' + (idx + 1));
        btn.appendChild(label);

        var timerBar = document.createElement('div');
        timerBar.style.cssText =
            'height:4px;background:#fff;margin-top:10px;width:100%;transform-origin:left;transition:transform 0.1s linear;';
        btn.appendChild(timerBar);

        btn.addEventListener('click', function() {
            makeChoice(idx);
        });
        btn.addEventListener('mouseenter', function() {
            btn.style.background = 'rgba(255,255,255,0.25)';
            btn.style.borderColor = '#f0c040';
        });
        btn.addEventListener('mouseleave', function() {
            btn.style.background = 'rgba(0,0,0,0.75)';
            btn.style.borderColor = '#fff';
        });

        choice_overlay.appendChild(btn);

        // Countdown animation
        (function(b) {
            function tick() {
                if (!choice_timer) return;
                var frac = Math.max(0, (deadline - Date.now()) / (timeoutSecs * 1000));
                b.querySelector('div:last-child').style.transform = 'scaleX(' + frac + ')';
                if (frac > 0) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        })(btn);
    });

    // Auto-select default after timeout
    choice_timer = setTimeout(function() {
        choice_timer = null;
        makeChoice(defaultChoiceIdx !== undefined ? defaultChoiceIdx : 0);
    }, timeoutSecs * 1000);
}

function hideChoices() {
    if (choice_overlay) {
        choice_overlay.style.display = 'none';
        choice_overlay.innerHTML = '';
    }
    if (choice_timer) { clearTimeout(choice_timer); choice_timer = null; }
}

function makeChoice(idx) {
    hideChoices();
    if (!current_segment || !current_segment.choices) return;
    var choice = current_segment.choices[idx];
    if (!choice) return;
    try { localStorage.setItem('choice_' + current_segment.id, idx); } catch(e) {}
    playSegment(getSegmentIndex(choice.segmentId));
}

// ── Time-update handler ────────────────────────────────────────────────────────

function ontimeupdate() {
    if (!current_segment) return;

    var now = video_selector.currentTime * 1000; // ms

    // End of segment
    var end = current_segment.end !== undefined ? current_segment.end : null;
    if (end !== null && now >= end) {
        if (current_segment.choices && current_segment.choices.length > 0 && !choice_timer && choice_overlay && choice_overlay.style.display !== 'none') {
            // Already showing choices — wait for user
        } else {
            playSegment(getNextSegment());
        }
        return;
    }

    // Show choice UI when we reach the choice window
    if (current_segment.choices && current_segment.choices.length > 0) {
        var choiceStart = current_segment.choiceStart !== undefined ? current_segment.choiceStart : null;
        var choiceTimeout = current_segment.choiceTimeout || 10;

        if (choiceStart !== null && now >= choiceStart && (!choice_overlay || choice_overlay.style.display === 'none') && !choice_timer) {
            showChoices(current_segment.choices, choiceTimeout, current_segment.defaultChoiceIndex || 0);
        }
    }
}

// ── Fullscreen ─────────────────────────────────────────────────────────────────

function toggleFullScreen() {
    var wrapper = document.getElementById('wrapper-video');
    if (!document.fullscreenElement) {
        wrapper.requestFullscreen && wrapper.requestFullscreen();
    } else {
        document.exitFullscreen && document.exitFullscreen();
    }
}

function togglePlayPause() {
    if (video_selector.paused) video_selector.play();
    else video_selector.pause();
}

// ── Keyboard ───────────────────────────────────────────────────────────────────

document.addEventListener('keydown', function(e) {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (e.code === 'KeyF') { toggleFullScreen(); e.preventDefault(); }
    if (e.code === 'KeyR') { playSegment(0); e.preventDefault(); }
    if (e.code === 'Space') { togglePlayPause(); e.preventDefault(); }
    if (e.code === 'ArrowRight') {
        playSegment(getNextSegment());
        e.preventDefault();
    }
    if (e.code === 'ArrowLeft') {
        var hist = playback_history;
        if (hist.length > 1) {
            hist.pop();
            var prevId = hist[hist.length - 1];
            playback_history = hist;
            saveHistory();
            playSegment(getSegmentIndex(prevId));
        }
        e.preventDefault();
    }
    if (e.code === 'ArrowUp') {
        video_selector.playbackRate = Math.min(4, video_selector.playbackRate + 0.25);
        e.preventDefault();
    }
    if (e.code === 'ArrowDown') {
        video_selector.playbackRate = Math.max(0.25, video_selector.playbackRate - 0.25);
        e.preventDefault();
    }
});

// ── Canvas overlay (for choice clicks on touch devices) ───────────────────────

var c = document.getElementById('c');
if (c) {
    c.ondblclick = toggleFullScreen;
}
if (video_selector) {
    video_selector.onclick = function(e) {
        togglePlayPause();
        e.preventDefault();
    };
}

// ── Initialisation ─────────────────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', function() {

    // The `segments` and `segmentMap` variables are set by bandersnatch.js.
    // We wait a tick to make sure that script has run.
    setTimeout(function() {

        video_selector.ontimeupdate = ontimeupdate;

        // ── HOSTED VIDEO: set src directly and start playback ──────────────────
        if (HOSTED_VIDEO_URL && HOSTED_VIDEO_URL.trim() !== '') {
            video_source_selector.src = HOSTED_VIDEO_URL;
            document.getElementById('wrapper-video').style.display = 'block';

            if (SHOW_FILE_SELECTOR_FALLBACK) {
                file_selector.style.display = 'table';
            }

            startPlayback();

        } else {
            // ── FALLBACK: show file-selector (original drag-and-drop behaviour) ──
            file_selector.style.display = 'table';
            document.getElementById('wrapper-video').style.display = 'none';
        }

        // Keep the file-input listener so the user can override the video if needed
        var fi = document.getElementById('fileinput');
        if (fi) {
            fi.addEventListener('change', function() {
                var file = this.files[0];
                if (!file) return;
                var fileUrl = URL.createObjectURL(file);
                video_selector.src = fileUrl;
                document.getElementById('wrapper-video').style.display = 'block';
                startPlayback();
            }, false);
        }

        // Drag-and-drop support on the file-selector area
        if (file_selector) {
            file_selector.addEventListener('dragover', function(e) {
                e.preventDefault();
                e.stopPropagation();
            });
            file_selector.addEventListener('drop', function(e) {
                e.preventDefault();
                e.stopPropagation();
                var file = e.dataTransfer.files[0];
                if (!file) return;
                var fileUrl = URL.createObjectURL(file);
                video_selector.src = fileUrl;
                document.getElementById('wrapper-video').style.display = 'block';
                startPlayback();
            });
        }

    }, 0);
});
