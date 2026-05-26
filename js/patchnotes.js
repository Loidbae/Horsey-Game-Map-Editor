'use strict';

HME.PATCHNOTES = [
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
          'ADDED safeguard for object mode to prevent crashes',
          'ADDED info badge next to location title (like spawners have already) to explain whats going on',
          'FIXED faulty map export and displaying locations with "Loc" prepended to it in the editor.',
          '<b style="color: red">READ THIS</b> IF YOU HAD A FAULTY MAP IN THE PAST. Load your faulty map file and remove all locations on the map and re-place them. Then export the map again.',
          'REMOVED Herobrine'
        ],
      },
    ],
  },
];
