import { ref, shallowRef, watch, onUnmounted } from 'vue';

const OUTPUT_SIZE = 512;
const WEBP_QUALITY = 0.85;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

interface Point { x: number; y: number }

/**
 * Canvas-based circular crop composable.
 *
 * Attach the returned `canvasRef` to a `<canvas>` element and call
 * `loadImage(src)` to start. The user can then drag to pan and
 * scroll/pinch to zoom. Call `exportCroppedBlob()` to get the result.
 */
export function useAvatarCrop() {
    const canvasRef = shallowRef<HTMLCanvasElement | null>(null);
    const zoom = ref(1);
    const isReady = ref(false);

    let img: HTMLImageElement | null = null;
    let canvasSize = 300;

    // Pan offset in canvas-pixel space (center of visible area)
    let panX = 0;
    let panY = 0;

    // Drag state
    let isDragging = false;
    let dragStart: Point = { x: 0, y: 0 };
    let panAtDragStart: Point = { x: 0, y: 0 };

    // Pinch state
    let lastPinchDist = 0;

    // -----------------------------------------------------------------
    // Drawing
    // -----------------------------------------------------------------

    function draw() {
        const canvas = canvasRef.value;
        if (!canvas || !img) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = canvasSize;
        canvas.width = size;
        canvas.height = size;

        ctx.clearRect(0, 0, size, size);

        // Draw the image scaled and panned
        const scale = (size / Math.min(img.naturalWidth, img.naturalHeight)) * zoom.value;
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        const x = size / 2 - panX * scale - w / 2;
        const y = size / 2 - panY * scale - h / 2;

        ctx.drawImage(img, x, y, w, h);

        // Circular mask overlay (dimmed outside the circle)
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(0, 0, size, size);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Circle border
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    // -----------------------------------------------------------------
    // Load
    // -----------------------------------------------------------------

    function loadImage(src: string, displaySize = 300): Promise<void> {
        return new Promise((resolve, reject) => {
            canvasSize = displaySize;
            isReady.value = false;
            zoom.value = 1;
            panX = 0;
            panY = 0;

            const image = new Image();
            image.onload = () => {
                img = image;
                isReady.value = true;
                draw();
                resolve();
            };
            image.onerror = () => reject(new Error('Failed to load crop image'));
            image.src = src;
        });
    }

    function reset() {
        zoom.value = 1;
        panX = 0;
        panY = 0;
        draw();
    }

    function clampPan() {
        if (!img) return;
        const scale = (canvasSize / Math.min(img.naturalWidth, img.naturalHeight)) * zoom.value;
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        // Maximum pan so the image edge stays at the canvas boundary
        const maxX = (w - canvasSize) / (2 * scale);
        const maxY = (h - canvasSize) / (2 * scale);
        panX = Math.max(-maxX, Math.min(maxX, panX));
        panY = Math.max(-maxY, Math.min(maxY, panY));
    }

    function setZoom(value: number) {
        zoom.value = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
        clampPan(); // zooming out may push image out of bounds
        draw();
    }

    // -----------------------------------------------------------------
    // Export
    // -----------------------------------------------------------------

    function exportCroppedBlob(): Promise<Blob> {
        return new Promise((resolve, reject) => {
            if (!img) {
                reject(new Error('No image loaded'));
                return;
            }

            const offscreen = document.createElement('canvas');
            offscreen.width = OUTPUT_SIZE;
            offscreen.height = OUTPUT_SIZE;
            const ctx = offscreen.getContext('2d');
            if (!ctx) {
                reject(new Error('Canvas 2D context unavailable'));
                return;
            }

            // Clip to circle
            ctx.beginPath();
            ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
            ctx.clip();

            const scale = (OUTPUT_SIZE / Math.min(img.naturalWidth, img.naturalHeight)) * zoom.value;
            const w = img.naturalWidth * scale;
            const h = img.naturalHeight * scale;
            const x = OUTPUT_SIZE / 2 - panX * scale * (OUTPUT_SIZE / canvasSize) - w / 2;
            const y = OUTPUT_SIZE / 2 - panY * scale * (OUTPUT_SIZE / canvasSize) - h / 2;

            ctx.drawImage(img, x, y, w, h);

            offscreen.toBlob(
                (blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Export failed'));
                },
                'image/webp',
                WEBP_QUALITY,
            );
        });
    }

    // -----------------------------------------------------------------
    // Pointer events (drag to pan)
    // -----------------------------------------------------------------

    function onPointerDown(e: PointerEvent) {
        if (e.pointerType === 'touch') return; // handled by touch events
        isDragging = true;
        dragStart = { x: e.clientX, y: e.clientY };
        panAtDragStart = { x: panX, y: panY };
        (e.currentTarget as HTMLElement)?.setPointerCapture(e.pointerId);
    }

    function onPointerMove(e: PointerEvent) {
        if (!isDragging) return;
        const scale = (canvasSize / Math.min(img?.naturalWidth ?? 1, img?.naturalHeight ?? 1)) * zoom.value;
        panX = panAtDragStart.x - (e.clientX - dragStart.x) / scale;
        panY = panAtDragStart.y - (e.clientY - dragStart.y) / scale;
        clampPan();
        draw();
    }

    function onPointerUp() {
        isDragging = false;
    }

    // -----------------------------------------------------------------
    // Wheel (zoom)
    // -----------------------------------------------------------------

    function onWheel(e: WheelEvent) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(zoom.value + delta);
    }

    // -----------------------------------------------------------------
    // Touch (pinch to zoom)
    // -----------------------------------------------------------------

    function getPinchDistance(touches: TouchList): number {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function onTouchStart(e: TouchEvent) {
        if (e.touches.length === 2) {
            lastPinchDist = getPinchDistance(e.touches);
        } else if (e.touches.length === 1) {
            isDragging = true;
            dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            panAtDragStart = { x: panX, y: panY };
        }
    }

    function onTouchMove(e: TouchEvent) {
        e.preventDefault();
        if (e.touches.length === 2) {
            const dist = getPinchDistance(e.touches);
            const delta = (dist - lastPinchDist) / canvasSize;
            setZoom(zoom.value + delta * 2);
            lastPinchDist = dist;
        } else if (e.touches.length === 1 && isDragging && img) {
            const scale = (canvasSize / Math.min(img.naturalWidth, img.naturalHeight)) * zoom.value;
            panX = panAtDragStart.x - (e.touches[0].clientX - dragStart.x) / scale;
            panY = panAtDragStart.y - (e.touches[0].clientY - dragStart.y) / scale;
            clampPan();
            draw();
        }
    }

    function onTouchEnd() {
        isDragging = false;
        lastPinchDist = 0;
    }

    // If image loaded before canvas was mounted, draw as soon as the ref is set
    watch(canvasRef, (canvas) => {
        if (canvas && img) draw();
    });

    onUnmounted(() => {
        img = null;
    });

    return {
        canvasRef,
        zoom,
        isReady,
        loadImage,
        reset,
        setZoom,
        exportCroppedBlob,
        // Event handlers to bind on the <canvas>
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onWheel,
        onTouchStart,
        onTouchMove,
        onTouchEnd,
        MIN_ZOOM,
        MAX_ZOOM,
    };
}
