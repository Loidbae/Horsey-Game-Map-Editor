'use strict';

HME.PATCHNOTES = [
  {
    version: 'v0.1.1a',
    title: 'Qol changes and more + hotfix',
    sections: [
      {
        heading: 'Quality of life changes',
        description: 'The tile palette has been cleaned up to remove tiles that could crash the game (thanks to discord user Zyonix!). You can now select items for the ??? object and set radius and count for spawners. Zoomed out drawing should now be way faster and way smoother.',
        points: [
          'REMOVED tiles (GID) 70 to 105, those were all GrassLand or BogLand variations',
          'ADDED safeguards for exporting tmx files to replace problematic tiles with their safe variants. This does not change the look of the map!',
          'CHANGED brush size circle to be more accurate (will revisit this in the future, not entirely happy with it yet)',
          'ADDED radius and count input fields to object',
          'ADDED radius indicators to all spawners',
          'ADDED ctrl + s map saving (cmd + s on mac)',
          'ADDED buried property input field and item select window to item objects',
          'CHANGED icon rendering of item objects to display the corresponding item set in the buried property',
          'CHANGED reset defaults now also clears cookies and session storage variables (only for this app! All other cookies and session storage is fine!)',
          'ADDED grid button to ui and moved grid settings from the settings menu there',
          'CHANGED rendering to chunck based, to optimize drawing when entirely zoomed out, less detail when zoomed out',
          'ADDED "fast rendering" setting, toggles between the old renderer and the new one',
          'HOTFIX CHANGES BELOW (v0.1.1a)',
          'FIXED item objects not updating until the user moves the mouse',
          'FIXED item object in inspect mode updating at all',
          'FIXED item object not changing at all when chaning through the input field',
          'FIXED buried id being able to be greater than 48',
        ],
      },
    ],
  },
  {
    version: 'v0.1.0',
    title: 'Patchnotes are here!',
    sections: [
      {
        heading: 'Patchnotes have arrived + a few bug fixes and (hopefully) quality of life changes',
        description: 'Some changes were made to the tile palette. Moved some tiles to the Misc category because their use in unknown. There is now a safeguard in place to prevent second instances of objects (locations), to avoid crashes on the users side. Faulty map exports should be fixed for good now!',
        points: [
          'MOVED tiles "PalmLand", "CactusLand" and "Un2" to "Misc" category',
          'ADDED patchnotes (hooray)',
          'ADDED safeguard for object mode to prevent game crashes',
          'ADDED info badge next to location title (like spawners have already) to explain whats going on',
          'FIXED faulty map export and displaying locations with "Loc" prepended to it in the editor.',
          '<b style="color: red">READ THIS</b> IF YOU HAD A FAULTY MAP IN THE PAST. Load your faulty map file and remove all locations on the map and re-place them. Then export the map again.',
          'REMOVED Herobrine'
        ],
      },
    ],
  },
];
