export const MediaReviewerData = {
 shortcuts: [
    { key: 'Space', description: 'Play/Pause' },
    { key: '← →', description: 'Skip 5 seconds' },
    { key: '↑ ↓', description: 'Volume control' },
    { key: 'Ctrl+Z', description: 'Undo' },
    { key: 'Ctrl+Shift+Z', description: 'Redo' },
    { key: 'Esc', description: 'Cancel drawing/reply/exit fullscreen' },
    { key: 'Ctrl+Shift+C', description: 'Focus comment box' },
    { key: 'Shift+MouseWheel', description: 'Volume control' },
    { key: 'Shift+Alt+MouseWheel', description: 'Seek 1 minute' },
    { key: 'Double click video', description: 'Enter/Exit full screen video' },
],
 sortOptions: [
    { value: 'timecode', label: 'Timecode' },
    { value: 'created', label: 'Creation Time' },
],
 orderOptions: [
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' },
],
 playbackSpeeds: [0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4],
}