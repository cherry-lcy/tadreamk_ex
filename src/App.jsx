import { useState, useRef, useEffect } from 'react'
import './App.css'


// Utility: rotate point around center
const rotatePoint = (x, y, cx, cy, angleRad) => {
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    const dx = x - cx;
    const dy = y - cy;
    return {
        x: cx + dx * cos - dy * sin,
        y: cy + dx * sin + dy * cos
    };
};

// Check if point is inside rotated rectangle
const isPointInRotatedRect = (px, py, rect) => {
    const { x, y, width, height, rotation } = rect;
    const cx = x + width/2;
    const cy = y + height/2;
    const rad = rotation * Math.PI / 180;
    const dx = px - cx;
    const dy = py - cy;
    const cos = Math.cos(-rad);
    const sin = Math.sin(-rad);
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;
    const halfW = width/2;
    const halfH = height/2;
    return (localX >= -halfW && localX <= halfW && localY >= -halfH && localY <= halfH);
};

// Hit test for resize handles
const getHandleAt = (px, py, rect) => {
    const { x, y, width, height, rotation } = rect;
    const cx = x + width/2;
    const cy = y + height/2;
    const rad = rotation * Math.PI / 180;
    const handleSize = 12;
    const handles = ['nw', 'ne', 'sw', 'se'];
    for (let h of handles) {
        let hx, hy;
        switch(h) {
            case 'nw': hx = x; hy = y; break;
            case 'ne': hx = x+width; hy = y; break;
            case 'sw': hx = x; hy = y+height; break;
            case 'se': hx = x+width; hy = y+height; break;
        }
        const rotated = rotatePoint(hx, hy, cx, cy, rad);
        const dx = px - rotated.x;
        const dy = py - rotated.y;
        if (Math.abs(dx) <= handleSize && Math.abs(dy) <= handleSize) return h;
    }
    return null;
};

// Main Editor Component
const App = () => {
    const [shapeType, setShapeType] = useState('rect');
    const [color, setColor] = useState('#FF6B6B');
    const [borderColor, setBorderColor] = useState('#333333');
    const [borderWidth, setBorderWidth] = useState(3);
    const [shadowEnabled, setShadowEnabled] = useState(false);
    const [flipH, setFlipH] = useState(false);
    const [flipV, setFlipV] = useState(false);
    
    const [rect, setRect] = useState({
        x: 200,
        y: 150,
        width: 160,
        height: 160,
        rotation: 0
    });
    
    const [emotion, setEmotion] = useState('idle');
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [initialRect, setInitialRect] = useState(null);
    const [activeHandle, setActiveHandle] = useState(null);
    const [resizeStart, setResizeStart] = useState(null);
    const [rotateActive, setRotateActive] = useState(false);
    
    const svgRef = useRef(null);
    
    // Track global mouse
    useEffect(() => {
        const handleMouseMove = (e) => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            setMousePos({ x: mouseX, y: mouseY });
            
            if (!svgRef.current) return;
            const svgRect = svgRef.current.getBoundingClientRect();
            const canvasX = mouseX - svgRect.left;
            const canvasY = mouseY - svgRect.top;
            
            if (isDragging && !activeHandle && !rotateActive && initialRect) {
                const dx = canvasX - dragStart.x;
                const dy = canvasY - dragStart.y;
                setRect(prev => ({
                    ...prev,
                    x: initialRect.x + dx,
                    y: initialRect.y + dy
                }));
                setEmotion('dragging');
            }
            else if (activeHandle && resizeStart && initialRect) {
                const dx = canvasX - resizeStart.x;
                const dy = canvasY - resizeStart.y;
                let newWidth = initialRect.width;
                let newHeight = initialRect.height;
                let newX = initialRect.x;
                let newY = initialRect.y;
                
                switch(activeHandle) {
                    case 'se':
                        newWidth = initialRect.width + dx;
                        newHeight = initialRect.height + dy;
                        break;
                    case 'sw':
                        newWidth = initialRect.width - dx;
                        newHeight = initialRect.height + dy;
                        newX = initialRect.x + dx;
                        break;
                    case 'ne':
                        newWidth = initialRect.width + dx;
                        newHeight = initialRect.height - dy;
                        newY = initialRect.y + dy;
                        break;
                    case 'nw':
                        newWidth = initialRect.width - dx;
                        newHeight = initialRect.height - dy;
                        newX = initialRect.x + dx;
                        newY = initialRect.y + dy;
                        break;
                    default: break;
                }
                if (newWidth < 40) newWidth = 40;
                if (newHeight < 40) newHeight = 40;
                setRect({
                    x: newX,
                    y: newY,
                    width: newWidth,
                    height: newHeight,
                    rotation: initialRect.rotation
                });
                setEmotion('resizing');
            }
            else if (rotateActive && initialRect) {
                const centerX = initialRect.x + initialRect.width/2;
                const centerY = initialRect.y + initialRect.height/2;
                const angleRad = Math.atan2(canvasY - centerY, canvasX - centerX);
                let newAngle = angleRad * 180 / Math.PI;
                setRect(prev => ({
                    ...prev,
                    rotation: newAngle
                }));
                setEmotion('resizing');
            }
        };
        
        const handleMouseUp = () => {
            setIsDragging(false);
            setActiveHandle(null);
            setRotateActive(false);
            setInitialRect(null);
            setResizeStart(null);
            setEmotion('idle');
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, activeHandle, rotateActive, initialRect, dragStart, resizeStart]);
    
    const handleShapeMouseDown = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!svgRef.current) return;
        const svgRect = svgRef.current.getBoundingClientRect();
        const canvasX = e.clientX - svgRect.left;
        const canvasY = e.clientY - svgRect.top;
        const centerX = rect.x + rect.width/2;
        const centerY = rect.y + rect.height/2;
        const rad = rect.rotation * Math.PI / 180;
        
        // Rotate handle detection (top center knob)
        const topCenterWorld = rotatePoint(rect.x + rect.width/2, rect.y - 12, centerX, centerY, rad);
        const distToRotate = Math.hypot(canvasX - topCenterWorld.x, canvasY - topCenterWorld.y);
        if (distToRotate < 18) {
            setRotateActive(true);
            setInitialRect({ ...rect });
            setEmotion('resizing');
            return;
        }
        
        const inside = isPointInRotatedRect(canvasX, canvasY, rect);
        if (inside) {
            setIsDragging(true);
            setDragStart({ x: canvasX, y: canvasY });
            setInitialRect({ ...rect });
            setEmotion('dragging');
        }
    };
    
    const handleHandleMouseDown = (handle, e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!svgRef.current) return;
        const svgRect = svgRef.current.getBoundingClientRect();
        const canvasX = e.clientX - svgRect.left;
        const canvasY = e.clientY - svgRect.top;
        setActiveHandle(handle);
        setResizeStart({ x: canvasX, y: canvasY });
        setInitialRect({ ...rect });
        setEmotion('resizing');
    };
    
    // Context menu
    const [contextMenuVisible, setContextMenuVisible] = useState(false);
    const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
    
    const handleContextMenu = (e) => {
        e.preventDefault();
        setContextMenuVisible(true);
        setContextMenuPos({ x: e.clientX, y: e.clientY });
    };
    
    useEffect(() => {
        const closeMenu = () => setContextMenuVisible(false);
        if (contextMenuVisible) {
            window.addEventListener('click', closeMenu);
            return () => window.removeEventListener('click', closeMenu);
        }
    }, [contextMenuVisible]);
    
    const changeShape = (shape) => {
        setShapeType(shape);
        setContextMenuVisible(false);
    };
    const changeFillColor = (c) => {
        setColor(c);
        setContextMenuVisible(false);
    };
    const changeBorderColor = (c) => {
        setBorderColor(c);
        setContextMenuVisible(false);
    };
    const toggleBorder = () => {
        setBorderWidth(prev => prev === 0 ? 3 : 0);
        setContextMenuVisible(false);
    };
    const toggleShadow = () => {
        setShadowEnabled(prev => !prev);
        setContextMenuVisible(false);
    };
    const toggleFlipH = () => {
        setFlipH(prev => !prev);
        setContextMenuVisible(false);
    };
    const toggleFlipV = () => {
        setFlipV(prev => !prev);
        setContextMenuVisible(false);
    };
    
    // Eye tracking: make eyes look at mouse, but eyes placed more centered (closer together)
    const getEyeOffset = () => {
        const cx = rect.x + rect.width/2;
        const cy = rect.y + rect.height/2;
        if (!svgRef.current) return { dx: 0, dy: 0 };
        const svgBounds = svgRef.current.getBoundingClientRect();
        const objectCenterScreenX = svgBounds.left + cx;
        const objectCenterScreenY = svgBounds.top + cy;
        let dx = mousePos.x - objectCenterScreenX;
        let dy = mousePos.y - objectCenterScreenY;
        // Max pupil movement relative to eye size - smaller movement for cuteness
        const maxOffset = Math.min(rect.width * 0.1, 12);
        const len = Math.hypot(dx, dy);
        if (len > 0.01) {
            dx = (dx / len) * Math.min(maxOffset, len * 0.25);
            dy = (dy / len) * Math.min(maxOffset, len * 0.25);
        } else {
            dx = 0; dy = 0;
        }
        return { dx: Math.min(maxOffset, Math.max(-maxOffset, dx)), dy: Math.min(maxOffset, Math.max(-maxOffset, dy)) };
    };
    
    // Render shape with flip correctly applied INSIDE local space (so handles and rotation remain consistent)
    const renderShapeWithFlip = () => {
        // Apply flip transform before drawing shape and face
        const flipTransform = `scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`;
        // For triangle and circles, need to adjust coordinate system origin to center for consistent flip
        const centerX = rect.width/2;
        const centerY = rect.height/2;
        
        let shapeElement = null;
        if (shapeType === 'rect') {
            shapeElement = <rect x="0" y="0" width={rect.width} height={rect.height} fill={color} stroke={borderWidth>0?borderColor:"none"} strokeWidth={borderWidth} />;
        } else if (shapeType === 'circle') {
            shapeElement = <circle cx={centerX} cy={centerY} r={Math.min(rect.width, rect.height)/2} fill={color} stroke={borderWidth>0?borderColor:"none"} strokeWidth={borderWidth} />;
        } else if (shapeType === 'triangle') {
            const w = rect.width;
            const h = rect.height;
            const points = `${centerX},0 ${centerX - w/2},${h} ${centerX + w/2},${h}`;
            shapeElement = <polygon points={points} fill={color} stroke={borderWidth>0?borderColor:"none"} strokeWidth={borderWidth} />;
        }
        
        // Face elements with improved eye spacing (closer together)
        const eyeRadius = Math.max(7, rect.width * 0.09);
        // Move eyes closer to center: offset reduced from 0.25 to 0.18 of width
        const eyeOffsetX = rect.width * 0.16;
        const eyeOffsetY = rect.height * 0.2;
        const { dx, dy } = getEyeOffset();
        const leftEyeX = centerX - eyeOffsetX;
        const leftEyeY = centerY - eyeOffsetY;
        const rightEyeX = centerX + eyeOffsetX;
        const rightEyeY = centerY - eyeOffsetY;
        const pupilRadius = eyeRadius * 0.5;
        const maxPupilMove = eyeRadius * 0.55;
        const leftPupilX = leftEyeX + Math.min(maxPupilMove, Math.max(-maxPupilMove, dx));
        const leftPupilY = leftEyeY + Math.min(maxPupilMove, Math.max(-maxPupilMove, dy));
        const rightPupilX = rightEyeX + Math.min(maxPupilMove, Math.max(-maxPupilMove, dx));
        const rightPupilY = rightEyeY + Math.min(maxPupilMove, Math.max(-maxPupilMove, dy));
        
        // Mouth with more expressive curves
        const mouthY = centerY + rect.height * 0.22;
        const mouthW = rect.width * 0.45;
        let mouthPath = "";
        let mouthStrokeWidth = 3.5;
        if (emotion === 'dragging') {
            // Big happy smile with wider arc
            mouthPath = `M ${centerX - mouthW/2} ${mouthY - 5} Q ${centerX} ${mouthY + 20} ${centerX + mouthW/2} ${mouthY - 5}`;
        } else if (emotion === 'resizing') {
            // Deep sad / frown (bigger arc, inverted)
            mouthPath = `M ${centerX - mouthW/2} ${mouthY + 5} Q ${centerX} ${mouthY - 18} ${centerX + mouthW/2} ${mouthY + 5}`;
        } else {
            // Slight smile / neutral with small curve
            mouthPath = `M ${centerX - mouthW/2} ${mouthY} Q ${centerX} ${mouthY + 7} ${centerX + mouthW/2} ${mouthY}`;
        }
        
        const faceGroup = (
            <g>
                {/* Eye whites with subtle outline */}
                <circle cx={leftEyeX} cy={leftEyeY} r={eyeRadius} fill="white" stroke="#222" strokeWidth="1.8"/>
                <circle cx={rightEyeX} cy={rightEyeY} r={eyeRadius} fill="white" stroke="#222" strokeWidth="1.8"/>
                <circle cx={leftPupilX} cy={leftPupilY} r={pupilRadius} fill="#111"/>
                <circle cx={rightPupilX} cy={rightPupilY} r={pupilRadius} fill="#111"/>
                {/* Highlight for cuteness */}
                <circle cx={leftPupilX - 1.5} cy={leftPupilY - 1.5} r={pupilRadius*0.35} fill="white"/>
                <circle cx={rightPupilX - 1.5} cy={rightPupilY - 1.5} r={pupilRadius*0.35} fill="white"/>
                <path d={mouthPath} fill="none" stroke="#222" strokeWidth={mouthStrokeWidth} strokeLinecap="round"/>
                {/* Cheeks (slight blush when happy/resizing) */}
                {(emotion === 'dragging') && (
                    <>
                        <ellipse cx={centerX - eyeOffsetX - 5} cy={mouthY - 4} rx="7" ry="4" fill="#FF9999" opacity="0.5"/>
                        <ellipse cx={centerX + eyeOffsetX + 5} cy={mouthY - 4} rx="7" ry="4" fill="#FF9999" opacity="0.5"/>
                    </>
                )}
                {emotion === 'resizing' && (
                    <>
                        <ellipse cx={centerX - eyeOffsetX - 5} cy={mouthY - 2} rx="6" ry="3" fill="#AAD4FF" opacity="0.4"/>
                        <ellipse cx={centerX + eyeOffsetX + 5} cy={mouthY - 2} rx="6" ry="3" fill="#AAD4FF" opacity="0.4"/>
                    </>
                )}
            </g>
        );
        
        // Important: apply flip transform but ensure shape draws correctly 
        // Flip is applied around the center of the shape so it stays within bounding box
        return (
            <g transform={`translate(${centerX}, ${centerY}) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1}) translate(-${centerX}, -${centerY})`}>
                {shapeElement}
                {faceGroup}
            </g>
        );
    };
    
    const shadowFilter = shadowEnabled ? "url(#shadow)" : "";
    
    return (
        <div style={{ width: '100vw', height: '100vh', background: '#EFF1F5', overflow: 'hidden', position: 'relative', fontFamily: 'Inter, system-ui, sans-serif' }}>
            {/* Top bar controls */}
            <div style={{ 
				position: 'absolute', 
				top: 16, 
				left: 16, 
				right: 16, 
				background: 'rgba(255,255,255,0.92)', 
				backdropFilter: 'blur(12px)', 
				borderRadius: 48, 
				padding: '18px 32px', 
				boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
				display: 'flex', 
				gap: 12, 
				flexWrap: 'wrap', 
				zIndex: 20, 
				alignItems: 'center', 
				border: '1px solid rgba(255,255,255,0.5)' 
			}}>
                <div 
					style={{ 
						fontWeight: 700, 
						fontSize: '1.2rem', 
						background: 'linear-gradient(135deg, #6bb0ff, #534dff)', 
						WebkitBackgroundClip: 'text', 
						WebkitTextFillColor: 'transparent', 
						marginRight: 8 
					}}>
						Play with Object
					</div>
                <select 
					value={shapeType} 
					onChange={(e) => setShapeType(e.target.value)} 
					style={{ 
						borderRadius: 40, 
						padding: '6px 14px', 
						border: '1px solid #ccc', 
						background: 'white', 
						fontWeight: 500, 
						cursor: 'pointer',
						fontSize: "0.8rem"
					}}>
                    <option value="rect">Rectangle</option>
                    <option value="circle">Circle</option>
                    <option value="triangle">Triangle</option>
                </select>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', background: '#f8f9fa', padding: '4px 12px', borderRadius: 40 }}>
                    <span style={{ fontSize: 13 }}>Fill:</span>
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 24, height: 24, border: 'none', borderRadius: 20, cursor: 'pointer', background: 'transparent' }}/>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', background: '#f8f9fa', padding: '4px 12px', borderRadius: 40 }}>
                    <span style={{ fontSize: 13 }}>Border:</span>
                    <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} style={{ width: 24, height: 24, borderRadius: 20, cursor: 'pointer' }}/>
                </div>
                <button onClick={toggleBorder} style={{ background: borderWidth>0 ? '#e9ecef' : '#fff', border: '1px solid #ced4da', borderRadius: 40, padding: '5px 14px', cursor: 'pointer', fontWeight: 500 }}>Border {borderWidth>0 ? 'ON' : 'OFF'}</button>
                <button onClick={toggleShadow} style={{ background: shadowEnabled ? '#ffe6cc' : '#fff', border: '1px solid #ced4da', borderRadius: 40, padding: '5px 14px', cursor: 'pointer' }}>Shadow</button>
                <button onClick={toggleFlipH} style={{ background: flipH ? '#d4e6ff' : '#fff', border: '1px solid #ced4da', borderRadius: 40, padding: '5px 14px', cursor: 'pointer' }}>Horizontal Flip</button>
                <button onClick={toggleFlipV} style={{ background: flipV ? '#d4e6ff' : '#fff', border: '1px solid #ced4da', borderRadius: 40, padding: '5px 14px', cursor: 'pointer' }}>Vertical Flip</button>
            </div>
            
            <svg 
                ref={svgRef}
                width="100%" 
                height="100%" 
                style={{ display: 'block', cursor: 'crosshair' }}
                onContextMenu={handleContextMenu}
            >
                <defs>
                    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="5" dy="8" stdDeviation="6" floodOpacity="0.25" floodColor="#000"/>
                    </filter>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                
                {/* Background grid pattern (optional) */}
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e0e4e8" strokeWidth="0.5"/>
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)"/>
                
                {/* Main interactive group */}
                <g 
                    transform={`translate(${rect.x}, ${rect.y}) rotate(${rect.rotation}, ${rect.width/2}, ${rect.height/2})`}
                    onMouseDown={handleShapeMouseDown}
                    style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                >
                    <g filter={shadowFilter}>
                        {renderShapeWithFlip()}
                    </g>
                    
                    {/* Resize handles and rotate knob (only when not actively dragging to avoid clutter) */}
                    {!isDragging && !rotateActive && (
                        <>
                            {['nw','ne','sw','se'].map(handle => {
                                let cx = 0, cy = 0;
                                switch(handle){
                                    case 'nw': cx = 0; cy = 0; break;
                                    case 'ne': cx = rect.width; cy = 0; break;
                                    case 'sw': cx = 0; cy = rect.height; break;
                                    case 'se': cx = rect.width; cy = rect.height; break;
                                }
                                return (
                                    <circle
                                        key={handle}
                                        cx={cx}
                                        cy={cy}
                                        r="8"
                                        fill="#ffffff"
                                        stroke="#3b82f6"
                                        strokeWidth="2.5"
                                        style={{ cursor: `${handle}-resize`, pointerEvents: 'all', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
                                        onMouseDown={(e) => { e.stopPropagation(); handleHandleMouseDown(handle, e); }}
                                    />
                                );
                            })}
                            {/* Rotate handle with distinct style */}
                            <circle
                                cx={rect.width/2}
                                cy="-14"
                                r="9"
                                fill="#FFB347"
                                stroke="#FF8C00"
                                strokeWidth="2.5"
                                style={{ cursor: 'alias', pointerEvents: 'all', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    setRotateActive(true);
                                    setInitialRect({ ...rect });
                                    setEmotion('resizing');
                                }}
                            />
                            <text x={rect.width/2} y="-10" textAnchor="middle" fontSize="12" fill="#fff" fontWeight="bold" pointerEvents="none">↻</text>
                        </>
                    )}
                </g>
            </svg>
            
            {/* Emotion indicator */}
            <div style={{ position: 'absolute', bottom: 18, right: 20, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', color: 'white', padding: '6px 16px', borderRadius: 40, fontSize: 13, zIndex: 10, fontWeight: 500, letterSpacing: '0.3px' }}>
                {emotion === 'dragging' && '😟 Unhappy mood... dragging'}
                {emotion === 'resizing' && '😄 Happy emotion! resizing/rotating'}
                {emotion === 'idle' && '😊 Idle — double click right menu'}
            </div>
        </div>
    );
};

export default App;