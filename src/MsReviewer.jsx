import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Select,
    FormControl,
    Slider,
    Box,
    Grid,
    List,
    ListItem,
    Radio,
    RadioGroup,
    FormControlLabel,
    Switch,
    useMediaQuery,
    createTheme,
    ThemeProvider,
    CssBaseline,
} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import {
    Brightness4 as Brightness4Icon,
    Brightness7 as Brightness7Icon,
    PlayArrow as PlayArrowIcon,
    Pause as PauseIcon,
    SkipPrevious as SkipPreviousIcon,
    SkipNext as SkipNextIcon,
    VolumeUp as VolumeUpIcon,
    VolumeOff as VolumeOffIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Check as CheckIcon,
    Close as CloseIcon,
    Save as SaveIcon,
    UploadFile as UploadFileIcon,
    FileDownload as FileDownloadIcon,
    Info as InfoIcon,
    Undo as UndoIcon,
    Redo as RedoIcon,
    Fullscreen as FullscreenIcon,
    FullscreenExit as FullscreenExitIcon,
    WhatsApp as WhatsAppIcon,
    Facebook as FacebookIcon,
    Email as EmailIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

export const MediaAnnotator = () => {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const [darkMode, setDarkMode] = useState(prefersDarkMode);

    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode: darkMode ? 'dark' : 'light',
                    text: {
                        primary: darkMode ? '#ffffff' : '#000000',
                    },
                    button: {
                        primary: {
                            main: darkMode ? '#bb86fc' : '#3f51b5',
                        },
                        secondary: {
                            main: darkMode ? '#03dac6' : '#f50057',
                        },
                    },
                },
            }),
        [darkMode],
    );

    const [username, setUsername] = useState('');
    const [showUsernameModal, setShowUsernameModal] = useState(true);
    const mediaRef = useRef(null);
    const progressBarRef = useRef(null);
    const [mediaUrl, setMediaUrl] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isVideo, setIsVideo] = useState(true);
    const [frameRate, setFrameRate] = useState(24);
    const [isSeeking, setIsSeeking] = useState(false);
    const [hoverTime, setHoverTime] = useState(null);
    const [hoveringMarker, setHoveringMarker] = useState(false);
    const [hoverPosition, setHoverPosition] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [isMuted, setIsMuted] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingMode, setDrawingMode] = useState(false);
    const [currentDrawing, setCurrentDrawing] = useState([]);
    const [showDrawing, setShowDrawing] = useState(null);
    const [lineWidth, setLineWidth] = useState(3);
    const [sortBy, setSortBy] = useState('timecode');
    const [sortOrder, setSortOrder] = useState('asc');
    const [hideDone, setHideDone] = useState(false);
    const [projectName, setProjectName] = useState('Untitled Project');
    const [mediaFilename, setMediaFilename] = useState('');
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [lastSavedTime, setLastSavedTime] = useState(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedComment, setSelectedComment] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentText, setEditingCommentText] = useState('');
    const [editingTimecodeId, setEditingTimecodeId] = useState(null);
    const [editingTimecodeValue, setEditingTimecodeValue] = useState('');
    const replyInputRef = useRef(null);
    const commentsScrollRef = useRef(null);

    useEffect(() => {
        const savedUsername = sessionStorage.getItem('annotator-username');
        if (savedUsername) {
            setUsername(savedUsername);
            setShowUsernameModal(false);
        }

        const handleBeforeUnload = (e) => {
            if (unsavedChanges) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [unsavedChanges]);

    const toggleTheme = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('annotator-theme', newMode ? 'dark' : 'light');
    };

    const onDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        setMediaUrl(url);
        setIsVideo(file.type.startsWith('video'));
        setMediaFilename(file.name);
        setProjectName(file.name.split('.')[0]);
        setUnsavedChanges(false);
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    const handlePlayPause = () => {
        if (isPlaying) {
            mediaRef.current.pause();
        } else {
            mediaRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSkip = (seconds) => {
        mediaRef.current.currentTime += seconds;
    };

    const handleFrameStep = (frames) => {
        if (isVideo) {
            mediaRef.current.currentTime += frames / frameRate;
        } else {
            mediaRef.current.currentTime += frames * 0.001;
        }
    };

    const handleTimeUpdate = () => {
        if (!isSeeking) {
            setCurrentTime(mediaRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        setDuration(mediaRef.current.duration);
        if (isVideo) {
            mediaRef.current.requestVideoFrameCallback((now, metadata) => {
                setFrameRate(metadata.mediaTime === 0 ? 24 : 1 / (metadata.mediaTime - currentTime));
            });
        }

        mediaRef.current.muted = false;
    };

    const handleRateChange = (rate) => {
        setPlaybackRate(rate);
        mediaRef.current.playbackRate = rate;
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        mediaRef.current.volume = newVolume;
        if (newVolume > 0 && isMuted) {
            setIsMuted(false);
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        mediaRef.current.muted = !isMuted;
    };

    const handleProgressHover = (e) => {
        const rect = progressBarRef.current.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        setHoverTime(pos * duration);
        setHoverPosition(e.clientX - rect.left);
    };

    const handleSeek = (e) => {
        setIsSeeking(true);
        const rect = progressBarRef.current.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const newTime = pos * duration;
        mediaRef.current.currentTime = newTime;
        setCurrentTime(newTime);
        setTimeout(() => setIsSeeking(false), 100);
    };

    const formatTimecode = (time) => {
        const formatTime = (time, frameRate) => {
            const hours = Math.floor(time / 3600);
            const minutes = Math.floor((time % 3600) / 60);
            const seconds = Math.floor(time % 60);
            const frames = Math.floor((time % 1) * frameRate);
            const milliseconds = Math.floor((time % 1) * 1000);
            return { hours, minutes, seconds, frames, milliseconds };
        };

        const { hours, minutes, seconds, frames, milliseconds } = formatTime(time, frameRate);

        if (isVideo) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
        } else {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
        }
    };

    const parseTimecode = (timecode) => {
        const parts = timecode.split(':');
        if (parts.length !== 4) return 0;

        const hours = parseInt(parts[0]) || 0;
        const minutes = parseInt(parts[1]) || 0;
        const seconds = parseInt(parts[2]) || 0;
        const framesOrMs = parseInt(parts[3]) || 0;

        if (isVideo) {
            return hours * 3600 + minutes * 60 + seconds + framesOrMs / frameRate;
        } else {
            return hours * 3600 + minutes * 60 + seconds + framesOrMs / 1000;
        }
    };

    const addComment = () => {
        if (!newComment.trim() && !currentDrawing.length) return;

        const comment = {
            id: Date.now(),
            username,
            timecode: currentTime,
            text: newComment,
            replies: [],
            done: false,
            drawing: currentDrawing.length ? currentDrawing : null,
            lineWidth: currentDrawing.length ? lineWidth : null,
            createdAt: new Date().toISOString()
        };

        setComments([...comments, comment]);
        setNewComment('');
        setCurrentDrawing([]);
        setDrawingMode(false);
        setUnsavedChanges(true);
    };

    const addReply = (commentId, parentComment = null, level = 0) => {
        if (!replyText.trim() || level > 10) return;

        const updateReplies = (comments, targetId, newReply, currentLevel = 0) => {
            return comments.map(comment => {
                if (comment.id === targetId) {
                    return {
                        ...comment,
                        replies: [...(comment.replies || []), newReply]
                    };
                }
                if (comment.replies && comment.replies.length > 0 && currentLevel < 10) {
                    return {
                        ...comment,
                        replies: updateReplies(comment.replies, targetId, newReply, currentLevel + 1)
                    };
                }
                return comment;
            });
        };

        const newReply = {
            id: Date.now(),
            username,
            timecode: parentComment ? parentComment.timecode : currentTime,
            text: replyText,
            done: false,
            createdAt: new Date().toISOString()
        };

        setComments(prevComments => updateReplies(prevComments, commentId, newReply));
        setReplyText('');
        setReplyTo(null);
        setUnsavedChanges(true);
    };

    const toggleDone = (commentId, isReply = false, parentId = null) => {
        setComments(comments.map(comment => {
            if (isReply && comment.id === parentId) {
                return {
                    ...comment,
                    replies: (comment.replies || []).map(reply => {
                        if (reply.id === commentId) {
                            return { ...reply, done: !reply.done };
                        }
                        return reply;
                    })
                };
            } else if (comment.id === commentId) {
                return { ...comment, done: !comment.done };
            }
            return comment;
        }));
        setUnsavedChanges(true);
    };

    const deleteComment = (commentId, isReply = false, parentId = null) => {
        if (showDeleteConfirm !== commentId) {
            setShowDeleteConfirm(commentId);
            return;
        }

        setComments(prevComments => {
            if (isReply) {
                // For replies, find the parent comment and filter out the reply
                return prevComments.map(comment => {
                    if (comment.id === parentId) {
                        return {
                            ...comment,
                            replies: (comment.replies || []).filter(reply => reply.id !== commentId)
                        };
                    }
                    // Recursively handle nested replies
                    if (comment.replies && comment.replies.length > 0) {
                        return {
                            ...comment,
                            replies: comment.replies.map(reply => {
                                if (reply.id === parentId) {
                                    return {
                                        ...reply,
                                        replies: (reply.replies || []).filter(r => r.id !== commentId)
                                    };
                                }
                                return reply;
                            })
                        };
                    }
                    return comment;
                });
            } else {
                // For top-level comments, filter out the comment
                return prevComments.filter(comment => comment.id !== commentId);
            }
        });

        if (showDrawing === commentId) {
            setShowDrawing(null);
        }
        setShowDeleteConfirm(null);
        setUnsavedChanges(true);
    };

    const editCommentText = (commentId, newText, isReply = false, parentId = null) => {
        setComments(comments.map(comment => {
            if (isReply && comment.id === parentId) {
                return {
                    ...comment,
                    replies: (comment.replies || []).map(reply => {
                        if (reply.id === commentId) {
                            return { ...reply, text: newText };
                        }
                        return reply;
                    })
                };
            } else if (comment.id === commentId) {
                return { ...comment, text: newText };
            }
            return comment;
        }));
        setEditingCommentId(null);
        setUnsavedChanges(true);
    };

    const editCommentTimecode = (commentId, newTimecode, isReply = false, parentId = null) => {
        const timeInSeconds = parseTimecode(newTimecode);
        if (isNaN(timeInSeconds)) return;

        setComments(comments.map(comment => {
            if (isReply && comment.id === parentId) {
                return {
                    ...comment,
                    replies: (comment.replies || []).map(reply => {
                        if (reply.id === commentId) {
                            return { ...reply, timecode: timeInSeconds };
                        }
                        return reply;
                    })
                };
            } else if (comment.id === commentId) {
                return { ...comment, timecode: timeInSeconds };
            }
            return comment;
        }));
        setEditingTimecodeId(null);
        setUnsavedChanges(true);
    };

    const seekToTimecode = (time) => {
        mediaRef.current.currentTime = time;
        setIsPlaying(true);
        mediaRef.current.play();
        const comment = comments.find(c => c.timecode === time && c.drawing);
        setShowDrawing(comment ? comment.drawing : null);
        setSelectedComment(comment ? comment.id : null);

        if (comment) {
            const commentElement = document.getElementById(`comment-${comment.id}`);
            if (commentElement) {
                commentsScrollRef.current.scrollTo({
                    top: commentElement.offsetTop - commentsScrollRef.current.offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    };

    const startDrawing = (e) => {
        if (!drawingMode) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setIsDrawing(true);
        setCurrentDrawing([...currentDrawing, { type: 'start', x, y, color: '#ff0000', lineWidth }]);
    };

    const draw = (e) => {
        if (!isDrawing || !drawingMode) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setCurrentDrawing([...currentDrawing, { type: 'line', x, y, color: '#ff0000', lineWidth }]);
        drawOnCanvas();
    };

    const endDrawing = () => {
        setIsDrawing(false);
    };

    const drawOnCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const drawingToShow = showDrawing || currentDrawing;
        if (drawingToShow.length > 0) {
            drawPath(ctx, drawingToShow);
        }
    };

    const drawPath = (ctx, path) => {
        if (path.length === 0) return;

        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = path[0].color;
        ctx.lineWidth = path[0].lineWidth || lineWidth;

        path.forEach((point, index) => {
            if (point.type === 'start') {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });

        ctx.stroke();
    };

    const undo = () => {
        if (currentDrawing.length === 0) return;
        setUndoStack([...undoStack, currentDrawing[currentDrawing.length - 1]]);
        setCurrentDrawing(currentDrawing.slice(0, -1));
        drawOnCanvas();
    };

    const redo = () => {
        if (redoStack.length === 0) return;
        setCurrentDrawing([...currentDrawing, redoStack[redoStack.length - 1]]);
        setRedoStack(redoStack.slice(0, -1));
        drawOnCanvas();
    };

    const focusCommentBox = () => {
        const commentBox = document.getElementById('comment-box');
        if (commentBox) {
            commentBox.focus();
        }
    };

    const getUsernameColor = (username) => {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    const sortedComments = useCallback(() => {
        let result = [...comments];

        if (hideDone) {
            result = result.filter(comment => !comment.done);
        }

        result.sort((a, b) => sortOrder === 'asc' ? a.timecode - b.timecode : b.timecode - a.timecode);

        return result;
    }, [comments, sortBy, sortOrder, hideDone]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                if (e.target.id === 'comment-box' && e.key === 'Enter' && e.shiftKey) {
                    return;
                }
                return;
            }

            const keyActions = {
                ' ': () => { e.preventDefault(); handlePlayPause(); },
                'ArrowLeft': () => { e.preventDefault(); handleSkip(-5); },
                'ArrowRight': () => { e.preventDefault(); handleSkip(5); },
                'ArrowUp': () => { e.preventDefault(); handleVolumeChange({ target: { value: Math.min(volume + 0.1, 1) } }); },
                'ArrowDown': () => { e.preventDefault(); handleVolumeChange({ target: { value: Math.max(volume - 0.1, 0) } }); },
                'Enter': () => { if (newComment) { e.preventDefault(); addComment(); } },
                'z': () => { if (e.ctrlKey && !e.shiftKey) { e.preventDefault(); undo(); } },
                'Z': () => { if (e.ctrlKey && e.shiftKey) { e.preventDefault(); redo(); } },
                'Escape': () => {
                    setReplyTo(null);
                    setDrawingMode(false);
                    if (isFullScreen) {
                        document.exitFullscreen();
                        setIsFullScreen(false);
                    }
                },
                'Control+Enter': () => { e.preventDefault(); focusCommentBox(); },
            };

            if (keyActions[e.key]) {
                keyActions[e.key]();
            } else if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                focusCommentBox();
            }
        };

        const handleWheel = (e) => {
            if (e.shiftKey && e.altKey) {
                e.preventDefault();
                handleSkip(e.deltaY > 0 ? -60 : 60);
            } else if (e.shiftKey) {
                e.preventDefault();
                handleVolumeChange({ target: { value: Math.max(Math.min(volume + (e.deltaY > 0 ? -0.1 : 0.1), 1), 0) } });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('wheel', handleWheel);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('wheel', handleWheel);
        };
    }, [handlePlayPause, handleSkip, newComment, drawingMode, volume, undo, redo, isFullScreen]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = () => {
            if (mediaRef.current) {
                canvas.width = mediaRef.current.offsetWidth;
                canvas.height = mediaRef.current.offsetHeight;
                drawOnCanvas();
            }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [mediaUrl, showDrawing, currentDrawing]);

    useEffect(() => {
        const autoSaveInterval = setInterval(() => {
            if (unsavedChanges) {
                saveBackup();
            }
        }, 300000);

        return () => {
            clearInterval(autoSaveInterval);
        };
    }, [unsavedChanges]);

    useEffect(() => {
        const handleFullScreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullScreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
        };
    }, []);

    useEffect(() => {
        if (replyTo && replyInputRef.current) {
            replyInputRef.current.focus();
        }
    }, [replyTo]);

    const getTimeSinceLastSave = () => {
        if (!lastSavedTime) return 'NEVER SAVED';
        const minutes = Math.floor((new Date() - lastSavedTime) / 60000);
        const hours = Math.floor(minutes / 60);
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        }
        return `${minutes}m`;
    };

    const getTimestampPrefix = () => {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        return `${hours}.${minutes}.${seconds}-`;
    };

    const saveProject = () => {
        if (!mediaUrl) return;

        const data = {
            projectName,
            mediaUrl,
            mediaFilename,
            isVideo,
            comments,
            frameRate,
            createdAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const baseFilename = mediaFilename ?
            mediaFilename.split('.').slice(0, -1).join('.') :
            projectName;

        a.download = `${getTimestampPrefix()}${username} comments-${baseFilename}-MsMediaReview-${new Date().toLocaleDateString('en-GB').replace(/\//g, '.')}.json`;
        a.click();

        setUnsavedChanges(false);
        setLastSavedTime(new Date());
        setShowSaveConfirm(true);
        setTimeout(() => setShowSaveConfirm(false), 2000);
    };

    const saveBackup = () => {
        if (!mediaUrl) return;

        const data = {
            projectName,
            mediaUrl,
            mediaFilename,
            isVideo,
            comments,
            frameRate,
            createdAt: new Date().toISOString()
        };

        const backupBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const backupUrl = URL.createObjectURL(backupBlob);
        const backupA = document.createElement('a');
        backupA.href = backupUrl;
        const now = new Date();
        const timestamp = `${now.getHours()}${now.getMinutes()}`;

        const baseFilename = mediaFilename ?
            mediaFilename.split('.').slice(0, -1).join('.') :
            projectName;

        backupA.download = `${getTimestampPrefix()}_Backup-${username} comments-${baseFilename}-MsMediaReview-${new Date().toLocaleDateString('en-GB').replace(/\//g, '.')}-${timestamp}.json`;
        backupA.click();
    };

    const loadProject = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                setProjectName(data.projectName);
                setMediaFilename(data.mediaFilename || '');
                setIsVideo(data.isVideo);
                setComments(data.comments || []);
                setFrameRate(data.frameRate || 24);
                setUnsavedChanges(false);
                e.target.value = '';
            } catch (err) {
                alert('Error loading project file');
            }
        };
        reader.readAsText(file);
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            mediaRef.current?.requestFullscreen?.().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const handleDoubleClick = () => {
        toggleFullScreen();
    };

    const shortcuts = [
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
    ];

    const sortOptions = [
        { value: 'timecode', label: 'Timecode' },
        { value: 'created', label: 'Creation Time' },
    ];

    const orderOptions = [
        { value: 'asc', label: 'Ascending' },
        { value: 'desc', label: 'Descending' },
    ];

    const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];

    const TimeCodeDisplay = ({ style, inputBase }) => (
        <TextField
            value={formatTimecode(currentTime)}
            sx={{
                width: 130,
                textAlign: 'center',
                p: 0.5,
                bgcolor: 'background.paper',
                borderRadius: 1,
                border: 1,
                borderColor: 'divider',
                cursor: 'pointer',
                ...style,
                '& .MuiInputBase-input': {
                    cursor: 'pointer',
                    textAlign: 'center',
                    ...inputBase
                }
            }}
            onClick={(e) => {
                navigator.clipboard.writeText(formatTimecode(currentTime));
                e.target.select();
            }}
            inputProps={{
                readOnly: true,
            }}
        />
    );

    const renderComment = (comment, isReply = false, parentId = null, level = 0) => (
        <ListItem
            key={comment.id}
            id={`comment-${comment.id}`}
            sx={{
                mb: 1, p: 1, border: 1, borderColor: 'divider', borderRadius: 1,
                bgcolor: comment.done ? 'action.disabledBackground' : 'background.paper',
                cursor: 'pointer', transition: 'all 0.15s ease',
                backgroundColor: selectedComment === comment.id ? 'rgba(0, 0, 255, 0.1)' : 'transparent',
                '&:hover': { transform: isReply ? 'translateX(2px)' : 'translateY(-2px)', boxShadow: 1, borderColor: 'primary.main' }
            }}
            onClick={(e) => {
                if (!e.target.closest('button') && !e.target.closest('input') && !e.target.closest('textarea') && !e.target.closest('.MuiTypography-root')) {
                    seekToTimecode(comment.timecode);
                    setSelectedComment(comment.id);
                } else if (!e.target.closest('button') && !e.target.closest('input') && !e.target.closest('textarea')) {
                    setSelectedComment(comment.id);
                }
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleDone(comment.id, isReply, parentId); }} sx={{ bgcolor: comment.done ? 'success.main' : 'background.paper', color: comment.done ? '#ffffff' : 'text.secondary', border: 1, borderColor: 'divider', '&:hover': { bgcolor: comment.done ? 'success.main' : 'action.hover' } }}>
                        <CheckIcon />
                    </IconButton>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: getUsernameColor(comment.username) }}>👤 {comment.username}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {editingTimecodeId === comment.id ? (
                            <TextField
                                value={editingTimecodeValue}
                                onChange={(e) => setEditingTimecodeValue(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        editCommentTimecode(comment.id, editingTimecodeValue, isReply, parentId);
                                    }
                                }}
                                sx={{ width: 120 }}
                                autoFocus
                            />
                        ) : (
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'text.secondary',
                                    bgcolor: 'background.paper',
                                    borderRadius: 1,
                                    p: 0.5,
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: 'primary.light',
                                        color: 'primary.contrastText'
                                    }
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(formatTimecode(comment.timecode));
                                }}
                            >
                                🕒 {formatTimecode(comment.timecode)}
                            </Typography>
                        )}
                        {!isReply && comment.username === username && (
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (editingTimecodeId === comment.id) {
                                        setEditingTimecodeId(null);
                                    } else {
                                        setEditingTimecodeId(comment.id);
                                        setEditingTimecodeValue(formatTimecode(comment.timecode));
                                    }
                                }}
                                sx={{ color: 'text.secondary' }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Box>
                    {/*disable to delete all comments DD*/}
                    {!isReply && comment.username === username && (
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteComment(comment.id, isReply, parentId);
                            }}
                            sx={{
                                color: showDeleteConfirm === comment.id ? 'error.main' : 'text.secondary',
                                '&:hover': { bgcolor: 'error.light' }
                            }}
                        >
                            <DeleteIcon />
                            {showDeleteConfirm === comment.id && (
                                <Typography variant="caption" sx={{ ml: 0.5 }}>Confirm?</Typography>
                            )}
                        </IconButton>
                        // disable to delete all comments DD
                        )}
                </Box>

                {comment.drawing && (
                    <Button size="small" onClick={(e) => { e.stopPropagation(); setShowDrawing(showDrawing === comment.drawing ? null : comment.drawing); }}>
                        {showDrawing === comment.drawing ? 'Hide Drawing' : 'View Drawing'}
                    </Button>
                )}

                {editingCommentId === comment.id ? (
                    <TextField
                        value={editingCommentText}
                        onChange={(e) => setEditingCommentText(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                editCommentText(comment.id, editingCommentText, isReply, parentId);
                            }
                        }}
                        fullWidth
                        autoFocus
                        multiline
                    />
                ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography
                            variant="body1"
                            sx={{
                                mb: 1,
                                wordBreak: 'break-word',
                                whiteSpace: 'pre-wrap',
                                cursor: 'pointer',
                                flexGrow: 1
                            }}
                        >
                            {comment.text}
                        </Typography>
                        {comment.username === username && (
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingCommentId(comment.id);
                                    setEditingCommentText(comment.text);
                                }}
                                sx={{ color: 'text.secondary' }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button size="small" onClick={(e) => { e.stopPropagation(); setReplyTo(replyTo === comment.id ? null : comment.id); }}>
                        {replyTo === comment.id ? 'Cancel' : '💬 Reply'}
                    </Button>
                    <Typography variant="caption" sx={{ color: 'text.secondary', ml: 'auto' }}>
                        {new Date(comment.createdAt).toLocaleString()}
                    </Typography>
                </Box>

                {replyTo === comment.id && (
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <TextField
                            inputRef={replyInputRef}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={`Reply to ${comment.username}...`}
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && addReply(comment.id, comment, level)}
                            fullWidth
                            onClick={(e) => e.stopPropagation()}
                            multiline
                        />
                        <Button variant="contained" color="primary" onClick={(e) => { e.stopPropagation(); addReply(comment.id, comment, level); }} sx={{ alignSelf: 'flex-end' }}>
                            Send
                        </Button>
                    </Box>
                )}

                {(comment.replies || []).length > 0 && (
                    <List sx={{ mt: 1, pl: 2, borderLeft: 2, borderColor: 'divider' }}>
                        {comment.replies.map(reply => renderComment(reply, true, comment.id, level + 1))}
                    </List>
                )}
            </Box>
        </ListItem>
    );

    const BrowserWarning = () => {
        // Check if the browser is Chrome
        const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

        return (
            !isChrome && (
                <DialogTitle variant="h4" textAlign="center" sx={{ color: "red" }}>
                    Best when opened in Chrome
                </DialogTitle>
            )
        );
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', color: 'text.primary' }}>
                {showUsernameModal && (
                    <Dialog open={showUsernameModal} onClose={() => setShowUsernameModal(false)}>
                        <DialogTitle textAlign="center" variant="h4">Ms Media Reviewer</DialogTitle>
                        <BrowserWarning />
                        <DialogTitle textAlign="center" variant="h4"sx={{color: 'red'}}>Important</DialogTitle>
                        <DialogTitle>This app doesn't load the latest comments automatically. comment files and backups will be stored/saved in the downloads folder of your device. import them manually.<br/> If you just received this file, inisde the folder containing this file you'll find a json comment file</DialogTitle>
                        <DialogTitle>Enter Your Name</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Your name"
                                type="text"
                                fullWidth
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && username.trim()) {
                                        sessionStorage.setItem('annotator-username', username);
                                        setShowUsernameModal(false);
                                    }
                                }}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => {
                                if (username.trim()) {
                                    sessionStorage.setItem('annotator-username', username);
                                    setShowUsernameModal(false);
                                }
                            }} color="primary">
                                Continue
                            </Button>
                        </DialogActions>
                    </Dialog>
                )}

                {!showUsernameModal && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <AppBar position="static" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', height: 60 }}>
                            <Toolbar>
                                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                    MS Media Reviewer - {mediaFilename} - {username}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <TimeCodeDisplay style={{ p: 0, width: 200 }} inputBase={{ fontSize: 30 }} />
                                    <IconButton color="inherit" onClick={toggleTheme}>
                                        {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                                    </IconButton>
                                    <Button color="inherit" onClick={() => setShowShortcuts(!showShortcuts)}>
                                        <InfoIcon /> Shortcuts
                                    </Button>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="h5" sx={{
                                            fontWeight: 'bold',
                                            color: 'error.main',
                                            ml: 1
                                        }}>
                                            {lastSavedTime ? `Last saved ${getTimeSinceLastSave()} ago` : 'NEVER SAVED'}
                                        </Typography>
                                        <Button color='inherit' onClick={saveProject} disabled={!unsavedChanges} sx={{ bgcolor: '#989898' }}>
                                            <SaveIcon /> Save Comments
                                        </Button>
                                    </Box>
                                    <input
                                        type="file"
                                        id="load-project"
                                        accept=".json"
                                        onChange={loadProject}
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="load-project">
                                        <Button component="span" color="inherit">
                                            <FileDownloadIcon /> Add comments
                                        </Button>
                                    </label>
                                    <Box {...getRootProps()} sx={{ display: 'none' }}>
                                        <input {...getInputProps()} />
                                        <Button component="span" color="inherit">
                                            <UploadFileIcon /> {mediaUrl ? 'Change Media' : 'Load Media'}
                                        </Button>
                                    </Box>
                                    <Button color="inherit" onClick={() => setShowShareModal(true)}>
                                        <ShareIcon /> Share
                                    </Button>
                                </Box>
                            </Toolbar>
                        </AppBar>

                        {showShortcuts && (
                            <Dialog open={showShortcuts} onClose={() => setShowShortcuts(false)}>
                                <DialogTitle>Keyboard Shortcuts</DialogTitle>
                                <DialogContent>
                                    <Grid container spacing={2} direction="column">
                                        {shortcuts.map((shortcut, index) => (
                                            <Grid item key={index}>
                                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                    {shortcut.key}
                                                </Typography>
                                                <Typography variant="body2">{shortcut.description}</Typography>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => setShowShortcuts(false)} color="primary">
                                        Close
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        )}

                        {showSaveConfirm && (
                            <Dialog
                                open={showSaveConfirm}
                                onClose={() => setShowSaveConfirm(false)}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center'
                                }}
                            >
                                <DialogTitle sx={{ color: '#4caf50', textAlign: 'center', fontSize: '1.5rem' }}>
                                    Project Saved
                                </DialogTitle>
                                <DialogContent>
                                    <Typography variant="body1">
                                        The file has been saved to the downloads folder as <strong>{`${getTimestampPrefix()}${mediaFilename}-${new Date().toLocaleDateString('en-GB').replace(/\//g, '.')}.json`}</strong>.
                                    </Typography>
                                </DialogContent>
                            </Dialog>
                        )}

                        {showShareModal && (
                            <Dialog open={showShareModal} onClose={() => setShowShareModal(false)}>
                                <DialogTitle>Share Comments</DialogTitle>
                                <DialogContent>
                                    <Grid container spacing={2}>
                                        <Grid item xs={4}>
                                            <Button variant="contained" color="primary" startIcon={<WhatsAppIcon />} fullWidth onClick={() => window.open(`https://wa.me/?text=Here's my comments`)}>
                                                WhatsApp
                                            </Button>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Button variant="contained" color="primary" startIcon={<FacebookIcon />} fullWidth onClick={() => window.open(`https://www.facebook.com/dialog/send?link=&app_id=&redirect_uri=&display=page&quote=Here's my comments`)}>
                                                Messenger
                                            </Button>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Button variant="contained" color="primary" startIcon={<EmailIcon />} fullWidth onClick={() => window.open(`mailto:?subject=Comments&body=Here's my comments`)}>
                                                Email
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => setShowShareModal(false)} color="primary">
                                        Close
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        )}

                        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                            <Box sx={{ flex: 2.5, display: 'flex', flexDirection: 'column', borderRight: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                                {!mediaUrl ? (
                                    <Box {...getRootProps()} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.paper', color: 'text.secondary', border: 2, borderColor: 'divider', borderStyle: 'dashed', m: 2, borderRadius: 2 }}>
                                        <Typography variant="h6">🎬</Typography>
                                        <Typography variant="body1">Drag and drop a video or audio file here</Typography>
                                        <Typography variant="body1">or</Typography>
                                        <label htmlFor="media-upload">
                                            <Button component="span" variant="contained" color="primary">
                                                Browse Files
                                            </Button>
                                        </label>
                                    </Box>
                                ) : (
                                    <>
                                        <Box sx={{
                                            position: 'relative',
                                            flex: 1,
                                            bgcolor: 'black',
                                            minHeight: isVideo ? 'auto' : '100px'
                                        }}>
                                            {isVideo ? (
                                                <video
                                                    ref={mediaRef}
                                                    src={mediaUrl}
                                                    onTimeUpdate={handleTimeUpdate}
                                                    onLoadedMetadata={handleLoadedMetadata}
                                                    onClick={handlePlayPause}
                                                    onDoubleClick={handleDoubleClick}
                                                    volume={volume}
                                                    muted={isMuted}
                                                    style={{ width: '100%', height: '100%', outline: 'none' }}
                                                />
                                            ) : (
                                                <audio
                                                    ref={mediaRef}
                                                    src={mediaUrl}
                                                    onTimeUpdate={handleTimeUpdate}
                                                    onLoadedMetadata={handleLoadedMetadata}
                                                    volume={volume}
                                                    muted={isMuted}
                                                    style={{ width: '100%', height: '100%' }}
                                                />
                                            )}
                                            <canvas
                                                ref={canvasRef}
                                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: drawingMode ? 'auto' : 'none', cursor: drawingMode ? 'crosshair' : 'default' }}
                                                onMouseDown={startDrawing}
                                                onMouseMove={draw}
                                                onMouseUp={endDrawing}
                                                onMouseLeave={endDrawing}
                                            />
                                            <IconButton
                                                sx={{ position: 'absolute', bottom: 10, right: 10, bgcolor: 'background.paper', color: 'text.primary' }}
                                                onClick={toggleFullScreen}
                                            >
                                                {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                                            </IconButton>
                                        </Box>

                                        <Box sx={{
                                            px: 1,
                                            py: 1,
                                            bgcolor: darkMode ? 'grey.900' : 'grey.100',
                                            borderTop: 1,
                                            borderBottom: 1,
                                            borderColor: 'divider'
                                        }}>
                                            <Box
                                                ref={progressBarRef}
                                                sx={{
                                                    height: 10,
                                                    bgcolor: darkMode ? 'grey.700' : 'grey.300',
                                                    cursor: 'pointer',
                                                    position: 'relative',
                                                    borderRadius: 1,
                                                    width: '100%',
                                                    '&:hover': {
                                                        bgcolor: darkMode ? 'grey.600' : 'grey.400'
                                                    }
                                                }}
                                                onClick={handleSeek}
                                                onMouseMove={(e) => {
                                                    if (!hoveringMarker) {
                                                        const rect = progressBarRef.current.getBoundingClientRect();
                                                        const pos = (e.clientX - rect.left) / rect.width;
                                                        setHoverTime(pos * duration);
                                                        setHoverPosition(e.clientX - rect.left);
                                                    }
                                                }}
                                                onMouseLeave={() => {
                                                    if (!hoveringMarker) {
                                                        setHoverTime(null);
                                                    }
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        height: '100%',
                                                        bgcolor: 'red',
                                                        width: `${(currentTime / duration) * 100}%`,
                                                        transition: 'width 0.1s linear',
                                                        position: 'relative',
                                                        zIndex: 1
                                                    }}
                                                />

                                                {hoverTime !== null && !hoveringMarker && (
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            top: -30,
                                                            transform: 'translateX(-50%)',
                                                            bgcolor: 'rgb(25,77,140)',
                                                            color: '#ffffff',
                                                            px: 1,
                                                            py: 0.5,
                                                            borderRadius: 1,
                                                            fontSize: 15,
                                                            pointerEvents: 'none',
                                                            whiteSpace: 'nowrap',
                                                            zIndex: 998
                                                        }}
                                                        style={{ left: `${hoverPosition}px` }}
                                                    >
                                                        {formatTimecode(hoverTime)}
                                                    </Box>
                                                )}
                                                {comments // Markers DD
                                                    .filter(comment => !comment.replies.length && (!hideDone || !comment.done))
                                                    .map(comment => (
                                                        <Box
                                                            key={comment.id}
                                                            sx={{
                                                                position: 'absolute',
                                                                top: -20,
                                                                left: `${(comment.timecode / duration) * 100}%`,
                                                                transform: 'translateX(-50%)',
                                                                width: 10,
                                                                height: 20,
                                                                bgcolor: getUsernameColor(comment.username),
                                                                borderBottomLeftRadius: '100%',
                                                                borderBottomRightRadius: '100%',
                                                                cursor: 'pointer',
                                                                zIndex: 999
                                                            }}
                                                            onClick={() => {
                                                                seekToTimecode(comment.timecode);
                                                                setSelectedComment(comment.id);
                                                                commentsScrollRef.current.scrollTo({
                                                                    top: document.getElementById(`comment-${comment.id}`).offsetTop - commentsScrollRef.current.offsetTop,
                                                                    behavior: 'smooth'
                                                                });
                                                            }}
                                                            onMouseEnter={() => {
                                                                setHoveringMarker(true);
                                                                setSelectedComment(comment.id);
                                                            }}
                                                            onMouseLeave={() => {
                                                                setHoveringMarker(false);
                                                                setSelectedComment(null);
                                                            }}
                                                        >
                                                            {selectedComment === comment.id && (
                                                                <Box
                                                                    sx={{
                                                                        position: 'absolute',
                                                                        top: -40,
                                                                        left: '50%',
                                                                        transform: 'translateX(-50%)',
                                                                        bgcolor: getUsernameColor(comment.username),
                                                                        px: 1,
                                                                        py: 0.5,
                                                                        borderRadius: 1,
                                                                        fontSize: 20,
                                                                        pointerEvents: 'none',
                                                                        whiteSpace: 'nowrap',
                                                                        color: '#000000',
                                                                        zIndex: 9999
                                                                    }}
                                                                >
                                                                    {comment.username}
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    ))}
                                            </Box>
                                        </Box>

                                        <Box sx={{ bgcolor: 'background.paper', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', borderTop: 1, borderColor: 'divider' }}>
                                            <Button variant="contained" color="primary" onClick={handlePlayPause}>
                                                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                                            </Button>
                                            <Button variant="contained" onClick={() => handleSkip(-5)}>
                                                <SkipPreviousIcon /> 5s
                                            </Button>
                                            <Button variant="contained" onClick={() => handleFrameStep(-1)}>
                                                <SkipPreviousIcon /> Frame
                                            </Button>
                                            <TimeCodeDisplay />
                                            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                                                / {formatTimecode(duration)}
                                            </Typography>
                                            <Button variant="contained" onClick={() => handleFrameStep(1)}>
                                                Frame <SkipNextIcon />
                                            </Button>
                                            <Button variant="contained" onClick={() => handleSkip(5)}>
                                                5s <SkipNextIcon />
                                            </Button>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Button variant={drawingMode ? "contained" : "outlined"} color={drawingMode ? "error" : "primary"} onClick={() => {
                                                    if (drawingMode) {
                                                        setCurrentDrawing([]);
                                                        setUndoStack([]);
                                                        setRedoStack([]);
                                                        drawOnCanvas();
                                                    }
                                                    setDrawingMode(!drawingMode);
                                                }}>
                                                    {drawingMode ? <CloseIcon /> : <EditIcon />}
                                                </Button>
                                                {drawingMode && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="body2">Size:</Typography>
                                                        <Slider
                                                            value={lineWidth}
                                                            onChange={(e, value) => setLineWidth(value)}
                                                            min={1}
                                                            max={20}
                                                            valueLabelDisplay="auto"
                                                            sx={{ width: 80 }}
                                                        />
                                                    </Box>
                                                )}
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Button variant="contained" color="secondary" onClick={undo} disabled={currentDrawing.length === 0}>
                                                    <UndoIcon />
                                                </Button>
                                                <Button variant="contained" color="secondary" onClick={redo} disabled={redoStack.length === 0}>
                                                    <RedoIcon />
                                                </Button>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body2">Speed:</Typography>
                                                <Select
                                                    value={playbackRate}
                                                    onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                                                    sx={{ width: 80 }}
                                                >
                                                    {playbackSpeeds.map(speed => (
                                                        <MenuItem key={speed} value={speed}>{speed}x</MenuItem>
                                                    ))}
                                                </Select>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                                                <IconButton onClick={toggleMute}>
                                                    {isMuted ? <VolumeOffIcon /> : volume > 0.5 ? <VolumeUpIcon /> : <VolumeUpIcon />}
                                                </IconButton>
                                                <Slider
                                                    value={volume}
                                                    onChange={handleVolumeChange}
                                                    min={0}
                                                    max={1}
                                                    step={0.01}
                                                    sx={{ width: 100 }}
                                                />
                                            </Box>
                                        </Box>
                                        <Box sx={{ bgcolor: 'background.paper', display: 'flex', gap: 1, borderTop: 1, borderColor: 'divider' }}>
                                            <TextField
                                                id="comment-box"
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Add comment at current timecode... (Ctrl+Shift+C to focus here)"
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        addComment();
                                                        setNewComment('');
                                                        e.preventDefault();
                                                    }
                                                }}
                                                fullWidth
                                                sx={{ flex: 1 }}
                                                multiline
                                            />
                                            <Button variant="contained" color="primary" onClick={addComment}>
                                                Add
                                            </Button>
                                        </Box>
                                    </>
                                )}
                            </Box>

                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: 'background.default' }}>
                                <Box sx={{ p: 1, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2">Sort by:</Typography>
                                        <FormControl sx={{ minWidth: 120 }}>
                                            <Select
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                                displayEmpty
                                            >
                                                {sortOptions.map(option => (
                                                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <FormControl sx={{ minWidth: 120 }}>
                                            <Select
                                                value={sortOrder}
                                                onChange={(e) => setSortOrder(e.target.value)}
                                                displayEmpty
                                            >
                                                {orderOptions.map(option => (
                                                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={hideDone}
                                                onChange={(e) => setHideDone(e.target.checked)}
                                                color="primary"
                                            />
                                        }
                                        label="Hide completed"
                                    />
                                </Box>

                                <Box
                                    ref={commentsScrollRef}
                                    sx={{
                                        flex: 1,
                                        overflowY: 'auto',
                                        p: 1,
                                        '&::-webkit-scrollbar': {
                                            width: '10px',
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            backgroundColor: darkMode ? '#555' : '#ccc',
                                            borderRadius: '5px',
                                        },
                                        '&::-webkit-scrollbar-thumb:hover': {
                                            backgroundColor: darkMode ? '#777' : '#aaa',
                                        }
                                    }}
                                >
                                    <List>
                                        {sortedComments().map(comment => renderComment(comment))}
                                    </List>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )}
            </Box>
        </ThemeProvider>
    );
};